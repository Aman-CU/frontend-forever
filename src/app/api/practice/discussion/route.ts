import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { challengeDiscussionPosts, challenges } from "@/lib/schema";
import { isPracticeCategory } from "@/features/practice/lib/practiceCategories";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 4_000;
const MAX_CODE_LENGTH = 4_000;

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — its own bucket, separate from every other write route.
  const { success } = await ratelimit.limit(`practice-discussion:${session.user.id}`);
  if (!success) {
    return Response.json(
      { error: "You're doing that too fast. Please wait a moment." },
      { status: 429 },
    );
  }

  // 3. Parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const {
    challengeId,
    parentId,
    title,
    body: postBody,
    code,
  } = (body ?? {}) as {
    challengeId?: unknown;
    parentId?: unknown;
    title?: unknown;
    body?: unknown;
    code?: unknown;
  };

  if (typeof challengeId !== "string" || !UUID_RE.test(challengeId)) {
    return Response.json({ error: "Invalid challengeId" }, { status: 400 });
  }
  if (
    typeof postBody !== "string" ||
    postBody.trim().length === 0 ||
    postBody.length > MAX_BODY_LENGTH
  ) {
    return Response.json({ error: "Post body is required and must be reasonably short" }, { status: 400 });
  }
  if (title !== undefined && (typeof title !== "string" || title.length > MAX_TITLE_LENGTH)) {
    return Response.json({ error: "Invalid title" }, { status: 400 });
  }
  if (code !== undefined && (typeof code !== "string" || code.length > MAX_CODE_LENGTH)) {
    return Response.json({ error: "Invalid code" }, { status: 400 });
  }
  if (parentId !== undefined && (typeof parentId !== "string" || !UUID_RE.test(parentId))) {
    return Response.json({ error: "Invalid parentId" }, { status: 400 });
  }

  // 4. The challenge must exist and belong to Practice's category set — same
  // reasoning as /api/practice/submit: challenges.category is nullable
  // (Learn-only entries), so without this a post could be attached to any
  // challenge id in the table, not just ones the Discussion tab is shown on.
  const [challenge] = await db
    .select({ category: challenges.category })
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);
  if (!challenge || !challenge.category || !isPracticeCategory(challenge.category)) {
    return Response.json({ error: "Challenge not found" }, { status: 404 });
  }

  // 5. A reply's parent must itself be a top-level post on the same
  // challenge — enforces the flat, one-level-deep decision at the write
  // layer, not just in the UI (a client could otherwise post a reply-to-a-reply).
  if (typeof parentId === "string") {
    const [parent] = await db
      .select({ id: challengeDiscussionPosts.id, parentId: challengeDiscussionPosts.parentId })
      .from(challengeDiscussionPosts)
      .where(
        and(
          eq(challengeDiscussionPosts.id, parentId),
          eq(challengeDiscussionPosts.challengeId, challengeId),
        ),
      )
      .limit(1);
    if (!parent) {
      return Response.json({ error: "Parent post not found" }, { status: 404 });
    }
    if (parent.parentId !== null) {
      return Response.json({ error: "Cannot reply to a reply" }, { status: 400 });
    }
  }

  // 6. Write. Replies never carry a title, even if one was sent.
  try {
    const [row] = await db
      .insert(challengeDiscussionPosts)
      .values({
        challengeId,
        userId: session.user.id,
        parentId: typeof parentId === "string" ? parentId : null,
        title: typeof parentId === "string" ? null : ((title as string | undefined) ?? null),
        body: postBody,
        code: (code as string | undefined) ?? null,
      })
      .returning({ id: challengeDiscussionPosts.id });

    return Response.json({ success: true, id: row.id });
  } catch (error) {
    console.error("[practice/discussion] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save post" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { playbookReads } from "@/lib/schema";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { PLAYBOOK_SLUGS, type PlaybookSlug } from "@/lib/constants";
import { getPlaybookChapter } from "@/lib/playbookGuides";

function isPlaybookSlug(value: unknown): value is PlaybookSlug {
  return typeof value === "string" && (PLAYBOOK_SLUGS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit (AGENTS.md rule 5 — every write route runs the limiter),
  // own namespaced bucket separate from every other write route.
  const { success } = await ratelimit.limit(`playbook-mark-read:${session.user.id}`);
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
  const { playbookSlug, chapterSlug } = (body ?? {}) as {
    playbookSlug?: unknown;
    chapterSlug?: unknown;
  };
  if (!isPlaybookSlug(playbookSlug) || typeof chapterSlug !== "string") {
    return Response.json({ error: "Invalid playbookSlug or chapterSlug" }, { status: 400 });
  }
  // Confirm the chapter actually exists (resolveChapterPath's own
  // path-traversal guard also protects this read) before writing a row for
  // a slug that doesn't correspond to real content.
  if (!getPlaybookChapter(playbookSlug, chapterSlug)) {
    return Response.json({ error: "Chapter not found" }, { status: 404 });
  }

  // 4. Write, scoped to the session user. onConflictDoNothing — re-marking
  // an already-read chapter is a no-op, not an error (no updatedAt to bump).
  try {
    await db
      .insert(playbookReads)
      .values({ userId: session.user.id, playbookSlug, chapterSlug })
      .onConflictDoNothing({
        target: [playbookReads.userId, playbookReads.playbookSlug, playbookReads.chapterSlug],
      });
  } catch (error) {
    console.error("[playbook/mark-read] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save your progress" }, { status: 500 });
  }

  return Response.json({ success: true });
}

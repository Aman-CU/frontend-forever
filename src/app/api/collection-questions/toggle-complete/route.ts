import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { collectionQuestions, userCollectionQuestionProgress } from "@/lib/schema";
import { getPostgresErrorCode } from "@/lib/dbErrors";

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit (AGENTS.md rule 5 — every write route runs the limiter),
  // own namespaced bucket separate from every other write route.
  const { success } = await ratelimit.limit(`collection-question-toggle:${session.user.id}`);
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
  const { slug, completed } = (body ?? {}) as { slug?: unknown; completed?: unknown };
  if (typeof slug !== "string" || typeof completed !== "boolean") {
    return Response.json({ error: "Invalid slug or completed value" }, { status: 400 });
  }

  const [question] = await db
    .select({ id: collectionQuestions.id })
    .from(collectionQuestions)
    .where(eq(collectionQuestions.slug, slug));
  if (!question) {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }

  // 4. Write, scoped to the session user. Row presence is the completion
  // signal (not a boolean column) — tick inserts, untick deletes, both are
  // no-ops if already in that state.
  try {
    if (completed) {
      await db
        .insert(userCollectionQuestionProgress)
        .values({ userId: session.user.id, questionId: question.id })
        .onConflictDoNothing({
          target: [userCollectionQuestionProgress.userId, userCollectionQuestionProgress.questionId],
        });
    } else {
      await db
        .delete(userCollectionQuestionProgress)
        .where(
          and(
            eq(userCollectionQuestionProgress.userId, session.user.id),
            eq(userCollectionQuestionProgress.questionId, question.id),
          ),
        );
    }
  } catch (error) {
    console.error("[collection-questions/toggle-complete] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save your progress" }, { status: 500 });
  }

  return Response.json({ success: true, completed });
}

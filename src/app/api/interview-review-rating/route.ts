import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { interviewQuestions } from "@/lib/schema";
import { applyInterviewReview, QuestionNotDueError } from "@/lib/progress/applyInterviewReview";
import { getIsPremiumUser } from "@/features/interview-prep/lib/queries";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Feature 32's dedicated review session: Easy/Okay/Hard/Forgot map onto SM-2
// quality 5/4/3/1 (build-plan.md's Feature 32 spec) — deliberately a separate
// route from /api/interview-rating (Learn's Interview tab, Feature 25) since
// that route's binary "knew"/"review" contract stays untouched, and this one
// awards XP + the daily streak on every rating (see applyInterviewReview).
const VALID_QUALITIES = new Set([1, 3, 4, 5]);

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — own bucket, separate from /api/interview-rating and
  // /api/progress.
  const { success } = await ratelimit.limit(`interview-review-rating:${session.user.id}`);
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
  const { questionId, quality } = (body ?? {}) as { questionId?: unknown; quality?: unknown };
  if (
    typeof questionId !== "string" ||
    !UUID_RE.test(questionId) ||
    typeof quality !== "number" ||
    !VALID_QUALITIES.has(quality)
  ) {
    return Response.json({ error: "Invalid questionId or quality" }, { status: 400 });
  }

  // 4. Premium entitlement + 5. SM-2 update/XP/streak — one try block so a
  // DB failure from either the lookup or the transaction returns this
  // route's own consistent JSON error shape instead of an unhandled
  // exception. applyInterviewReview itself is the authoritative check that
  // this question is actually due for this user — see QuestionNotDueError.
  let xpAwarded = 0;
  try {
    // A locked question's answer is never shown to a non-premium user (see
    // page.tsx), so this route must refuse to process a rating for one too,
    // even if called directly rather than through the UI.
    const [question] = await db
      .select({ isPremium: interviewQuestions.isPremium })
      .from(interviewQuestions)
      .where(eq(interviewQuestions.id, questionId));
    if (!question) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }
    if (question.isPremium && !(await getIsPremiumUser(session.user.id))) {
      return Response.json({ error: "This question is part of Premium" }, { status: 403 });
    }

    ({ xpAwarded } = await db.transaction((tx) =>
      applyInterviewReview(tx, session.user.id, questionId, quality, true),
    ));
  } catch (error) {
    if (error instanceof QuestionNotDueError) {
      return Response.json({ error: "Question is not due for review" }, { status: 403 });
    }
    console.error("[interview-review-rating] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save rating" }, { status: 500 });
  }

  return Response.json({ success: true, xpAwarded });
}

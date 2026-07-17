import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { applyInterviewReview } from "@/lib/progress/applyInterviewReview";

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

  // 4. SM-2 update + XP + streak, all-or-nothing.
  let xpAwarded = 0;
  try {
    ({ xpAwarded } = await db.transaction((tx) =>
      applyInterviewReview(tx, session.user.id, questionId, quality, true),
    ));
  } catch (error) {
    console.error("[interview-review-rating] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save rating" }, { status: 500 });
  }

  return Response.json({ success: true, xpAwarded });
}

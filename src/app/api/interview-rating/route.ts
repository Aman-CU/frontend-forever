import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { applyInterviewReview } from "@/lib/progress/applyInterviewReview";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The Interview tab only offers a binary self-assessment, mapped onto SM-2's
// 0-5 quality scale for user_interview_reviews. Real ease/interval/next-review
// scheduling (Feature 32) now runs on every rating via applyInterviewReview —
// awardXp is false here since this tab already has its own separate 20 XP
// tab-completion reward (see INTERVIEW_ANSWERED_XP's comment in constants.ts).
const RATING_QUALITY = { knew: 5, review: 2 } as const;

function isRating(value: unknown): value is keyof typeof RATING_QUALITY {
  return value === "knew" || value === "review";
}

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — namespaced so this route has its own bucket, separate
  // from /api/progress (they used to share session.user.id as the bare key,
  // so heavy use of one endpoint could exhaust the other's quota).
  const { success } = await ratelimit.limit(`interview-rating:${session.user.id}`);
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
  const { questionId, rating } = (body ?? {}) as { questionId?: unknown; rating?: unknown };
  if (typeof questionId !== "string" || !UUID_RE.test(questionId) || !isRating(rating)) {
    return Response.json({ error: "Invalid questionId or rating" }, { status: 400 });
  }

  // 4. Run the SM-2 update, scoped to the session user
  const quality = RATING_QUALITY[rating];
  try {
    await db.transaction((tx) => applyInterviewReview(tx, session.user.id, questionId, quality, false));
  } catch (error) {
    console.error("[interview-rating] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save rating" }, { status: 500 });
  }

  return Response.json({ success: true });
}

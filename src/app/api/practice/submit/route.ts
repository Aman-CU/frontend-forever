import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { CHALLENGE_STATUSES, type ChallengeStatus } from "@/lib/constants";
import { applyChallengeSubmission } from "@/lib/progress/applyChallengeSubmission";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Generous ceiling against pathological input — same order of magnitude as
// gradeTypeChallenge.ts's MAX_CODE_LENGTH for the TypeScript path.
const MAX_CODE_LENGTH = 20_000;

function isChallengeStatus(value: unknown): value is ChallengeStatus {
  return typeof value === "string" && (CHALLENGE_STATUSES as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — its own bucket, separate from every other write route.
  const { success } = await ratelimit.limit(`practice-submit:${session.user.id}`);
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
  const { challengeId, status, code } = (body ?? {}) as {
    challengeId?: unknown;
    status?: unknown;
    code?: unknown;
  };
  if (
    typeof challengeId !== "string" ||
    !UUID_RE.test(challengeId) ||
    !isChallengeStatus(status) ||
    typeof code !== "string" ||
    code.length > MAX_CODE_LENGTH
  ) {
    return Response.json({ error: "Invalid challengeId, status, or code" }, { status: 400 });
  }

  // 4. Submission write + (on a first pass) XP + streak, all-or-nothing.
  try {
    const result = await db.transaction((tx) =>
      applyChallengeSubmission(tx, session.user.id, challengeId, status, code),
    );
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("[practice/submit] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save submission" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { gradeTypeChallenge, MAX_CODE_LENGTH } from "@/lib/typeChecker/gradeTypeChallenge";
import { getTypeChallengeSpec } from "@/features/practice/sandbox/typeChallengeSpecs";

export async function POST(req: Request) {
  // 1. Auth — grading runs the real TypeScript compiler, which is CPU-heavy
  // enough that this shouldn't be open to logged-out traffic.
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — its own bucket, separate from other write/compute routes.
  const { success } = await ratelimit.limit(`grade-type-challenge:${session.user.id}`);
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
  const { slug, code } = (body ?? {}) as { slug?: unknown; code?: unknown };
  if (typeof slug !== "string" || typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
    return Response.json({ error: "Invalid slug or code" }, { status: 400 });
  }

  const tests = getTypeChallengeSpec(slug);
  if (!tests) {
    return Response.json({ error: "No type-challenge tests found for this slug" }, { status: 404 });
  }

  // 4. Grade — real TypeScript compilation, not a runtime simulation. See
  // gradeTypeChallenge's own comments for how per-test pass/fail is derived
  // from real compiler diagnostics. gradeTypeChallenge has its own internal
  // catch around the compiler call itself; this one is the route's backstop
  // in case anything else here throws.
  try {
    const results = gradeTypeChallenge(code, tests);
    return Response.json({ results });
  } catch (error) {
    console.error("[grade-type-challenge] grading failed:", error instanceof Error ? error.message : String(error));
    return Response.json({ error: "Could not grade submission" }, { status: 500 });
  }
}

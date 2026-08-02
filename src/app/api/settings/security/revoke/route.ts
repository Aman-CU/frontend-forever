import { and, eq } from "drizzle-orm";
import { APIError } from "better-auth";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { session } from "@/lib/schema";
import { getPostgresErrorCode } from "@/lib/dbErrors";

// Takes a session `id`, never a `token` — a session token is a bearer
// credential (it's the actual value Better Auth signs into the cookie), so
// it never reaches the client (see queries.ts's getActiveSessions comment).
// This route looks the token up server-side, scoped to the caller's own
// userId, then hands it to Better Auth's own revoke-session logic, which
// re-validates ownership and enforces its own freshness gate.
export async function POST(req: Request) {
  try {
    const authSession = await auth.api.getSession({ headers: req.headers });
    if (!authSession?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await ratelimit.limit(`security-revoke:${authSession.user.id}`);
    if (!success) {
      return Response.json(
        { error: "You're doing that too fast. Please wait a moment." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const sessionId = (body as Record<string, unknown> | null)?.sessionId;
    if (typeof sessionId !== "string" || sessionId.length === 0) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const [target] = await db
      .select({ token: session.token })
      .from(session)
      .where(and(eq(session.id, sessionId), eq(session.userId, authSession.user.id)));
    if (!target) {
      // Already gone, or never belonged to this caller — same end state the
      // user wants, so this isn't worth surfacing as an error.
      return Response.json({ success: true });
    }

    try {
      await auth.api.revokeSession({ body: { token: target.token }, headers: req.headers });
    } catch (error) {
      if (error instanceof APIError) {
        return Response.json(
          { error: error.body?.message ?? "Could not end that session. Please try again.", code: error.body?.code },
          { status: 400 },
        );
      }
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[settings/security/revoke] Unexpected error:", getPostgresErrorCode(error));
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

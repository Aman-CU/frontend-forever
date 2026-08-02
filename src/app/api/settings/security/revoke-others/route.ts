import { and, eq, gt, ne } from "drizzle-orm";
import { APIError } from "better-auth";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { session } from "@/lib/schema";
import { getPostgresErrorCode } from "@/lib/dbErrors";

// No request body — this always means "every other real session I have
// right now," computed fresh from Postgres rather than trusting a
// client-supplied list, so it can't be stale relative to what was rendered
// and needs no session ids (let alone tokens) sent from the client at all.
//
// Promise.allSettled, not Promise.all: a single session's revoke throwing
// (a genuine network/DB-level failure, not just a graceful {error} response —
// see the @better-fetch finding in the Feature 57 decision entry) must not
// stop the others from being attempted, and every attempt should run before
// this route reports anything back.
export async function POST(req: Request) {
  try {
    const authSession = await auth.api.getSession({ headers: req.headers });
    if (!authSession?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await ratelimit.limit(`security-revoke-others:${authSession.user.id}`);
    if (!success) {
      return Response.json(
        { error: "You're doing that too fast. Please wait a moment." },
        { status: 429 },
      );
    }

    const targets = await db
      .select({ token: session.token })
      .from(session)
      .where(
        and(
          eq(session.userId, authSession.user.id),
          ne(session.id, authSession.session.id),
          gt(session.expiresAt, new Date()),
        ),
      );

    const results = await Promise.allSettled(
      targets.map((target) =>
        auth.api.revokeSession({ body: { token: target.token }, headers: req.headers }),
      ),
    );
    const rejected = results.find((result) => result.status === "rejected");
    if (rejected && rejected.status === "rejected") {
      const error = rejected.reason;
      if (error instanceof APIError) {
        return Response.json(
          {
            error: error.body?.message ?? "Could not sign out of other devices. Please try again.",
            code: error.body?.code,
          },
          { status: 400 },
        );
      }
      console.error("[settings/security/revoke-others] Unexpected error:", getPostgresErrorCode(error));
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[settings/security/revoke-others] Unexpected error:", getPostgresErrorCode(error));
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

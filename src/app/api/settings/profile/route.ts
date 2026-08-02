import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { getPostgresErrorCode, getPostgresErrorConstraint } from "@/lib/dbErrors";
import { validateProfileInput, type ProfileFormInput } from "@/features/settings/lib/validateProfileInput";

const POSTGRES_UNIQUE_VIOLATION = "23505";
const PROFILES_USERNAME_CONSTRAINT = "profiles_username_unique";
// This route's whole payload is 4 short strings (see validateProfileInput.ts's
// own per-field caps) — a legitimate request is always tiny. Rejecting an
// oversized one via Content-Length avoids buffering/parsing it into memory
// first just to have validation reject it afterward.
const MAX_REQUEST_BYTES = 10_000;

function isUsernameConflict(error: unknown): boolean {
  return (
    getPostgresErrorCode(error) === POSTGRES_UNIQUE_VIOLATION &&
    getPostgresErrorConstraint(error) === PROFILES_USERNAME_CONSTRAINT
  );
}

function readField(body: Record<string, unknown>, key: keyof ProfileFormInput): string | undefined {
  const value = body[key];
  return typeof value === "string" ? value.trim() : undefined;
}

export async function POST(req: Request) {
  try {
    // 1. Auth
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit — own namespace, separate bucket from other write routes.
    const { success } = await ratelimit.limit(`profile-update:${session.user.id}`);
    if (!success) {
      return Response.json(
        { error: "You're doing that too fast. Please wait a moment." },
        { status: 429 },
      );
    }

    // 3. Reject oversized bodies before ever parsing them.
    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "Request body too large" }, { status: 413 });
    }

    // 4. Parse + validate
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const raw = (body ?? {}) as Record<string, unknown>;
    const input: ProfileFormInput = {
      fullName: readField(raw, "fullName") ?? "",
      username: readField(raw, "username") ?? "",
      bio: readField(raw, "bio") ?? "",
      avatarUrl: readField(raw, "avatarUrl") ?? "",
    };
    if (
      typeof raw.fullName !== "string" ||
      typeof raw.username !== "string" ||
      typeof raw.bio !== "string" ||
      typeof raw.avatarUrl !== "string"
    ) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const fieldErrors = validateProfileInput(input);
    if (Object.keys(fieldErrors).length > 0) {
      return Response.json({ error: "Invalid input", fieldErrors }, { status: 400 });
    }

    // 5. Write profiles (authoritative — the specific 409 case is handled
    // here; anything else falls through to the catch-all below).
    try {
      await db
        .update(profiles)
        .set({
          fullName: input.fullName,
          username: input.username,
          bio: input.bio.length > 0 ? input.bio : null,
          avatarUrl: input.avatarUrl.length > 0 ? input.avatarUrl : null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, session.user.id));
    } catch (error) {
      if (isUsernameConflict(error)) {
        return Response.json(
          { error: "Invalid input", fieldErrors: { username: "That username is already taken." } },
          { status: 409 },
        );
      }
      throw error;
    }

    // Mirroring name/image onto Better-Auth's own user table (read by the
    // Navbar/UserDropdown/Dashboard greeting, not `profiles`) deliberately
    // happens client-side (ProfileEditForm calls authClient.updateUser after
    // this succeeds), not here. Better-Auth's client only fires its automatic
    // session-store refetch when its own $fetch wrapper sees the /update-user
    // response — a server-side auth.api.updateUser call here would write the
    // row but leave the client's already-cached session stale until the next
    // cookie-cache expiry (`auth.ts`'s `cookieCache.maxAge`), so the Navbar
    // wouldn't update on save.
    return Response.json({ success: true });
  } catch (error) {
    // Catch-all for auth.api.getSession/ratelimit.limit failures and any
    // other unexpected error (the DB write's own 409 case is handled above
    // and never reaches here) — per error-handling.md's invariant that every
    // async call to an external service is guarded, not just the final write.
    console.error("[settings/profile] Unexpected error:", getPostgresErrorCode(error));
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

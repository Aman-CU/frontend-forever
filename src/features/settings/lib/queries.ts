import { cache } from "react";
import { headers } from "next/headers";
import { and, desc, eq, gt } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { profiles, session } from "@/lib/schema";

export type EditableProfile = {
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export const getProfileForEdit = cache(async (userId: string): Promise<EditableProfile | null> => {
  const [profile] = await db
    .select({
      username: profiles.username,
      fullName: profiles.fullName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, userId));

  return profile ?? null;
});

export type ConnectedAccount = {
  providerId: string;
};

// The server-side counterpart of authClient.listAccounts() — Better Auth
// names it listUserAccounts internally (auth.api.listUserAccounts), unlike
// the friendlier client alias. Only providerId is surfaced; the raw response
// also includes accountId/scopes/timestamps this UI has no use for.
export const getConnectedAccounts = cache(async (): Promise<ConnectedAccount[]> => {
  const accounts = await auth.api.listUserAccounts({ headers: await headers() });
  return accounts.map((account) => ({ providerId: account.providerId }));
});

export type ActiveSession = {
  id: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// A direct Drizzle read of the `session` table, not auth.api.listSessions() —
// that endpoint runs behind Better Auth's freshSessionMiddleware (freshAge
// defaults to 1 day, unset in auth/server.ts), so it throws SESSION_NOT_FRESH
// for any session older than a day even though sessions themselves last 7
// days by default. That's the right protection for the *mutations* below
// (revoking a session is exactly what freshness-gating exists to protect),
// but it would wall most returning users out of merely *viewing* their own
// session list. Reading the table directly, scoped to `userId`, is the same
// app-level authorization pattern every other user-owned-table query in this
// codebase already uses (see architecture.md → Authorization Model) — safe
// here specifically because this is a read, with no state-changing effect.
export const getActiveSessions = cache(async (userId: string): Promise<ActiveSession[]> => {
  return db
    .select({
      id: session.id,
      token: session.token,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, new Date())))
    .orderBy(desc(session.updatedAt));
});

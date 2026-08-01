import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

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

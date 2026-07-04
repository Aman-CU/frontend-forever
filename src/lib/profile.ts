import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

export type ProfileSummary = {
  xp: number;
  streakCurrent: number;
};

// Deduplicates this lookup across Server Components in the same request —
// same precedent as lib/auth/server.ts's getCachedSession.
export const getProfileSummary = cache(async (userId: string): Promise<ProfileSummary> => {
  const [profile] = await db
    .select({ xp: profiles.xp, streakCurrent: profiles.streakCurrent })
    .from(profiles)
    .where(eq(profiles.id, userId));
  return { xp: profile?.xp ?? 0, streakCurrent: profile?.streakCurrent ?? 0 };
});

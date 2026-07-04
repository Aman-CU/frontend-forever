import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

// Deduplicates the streak lookup across Server Components in the same
// request — same precedent as lib/auth/server.ts's getCachedSession.
export const getProfileStreak = cache(async (userId: string): Promise<number> => {
  const [profile] = await db
    .select({ streakCurrent: profiles.streakCurrent })
    .from(profiles)
    .where(eq(profiles.id, userId));
  return profile?.streakCurrent ?? 0;
});

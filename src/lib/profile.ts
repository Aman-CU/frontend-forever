import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

export type ProfileSummary = {
  xp: number;
  streakCurrent: number;
  isPremium: boolean;
};

// Deduplicates this lookup across Server Components in the same request —
// same precedent as lib/auth/server.ts's getCachedSession.
//
// `isPremium` rides along on the row this already reads (Feature 38 Stage 9):
// the app navbar needs it to decide whether to show the "Upgrade" pill, and
// selecting two more columns from a row we're fetching anyway is free, where
// a second getIsPremiumUser call would be a second round trip. It is a
// display signal only — every real gate does its own server-side check on the
// route that owns the content, never on this.
export const getProfileSummary = cache(async (userId: string): Promise<ProfileSummary> => {
  const [profile] = await db
    .select({
      xp: profiles.xp,
      streakCurrent: profiles.streakCurrent,
      isPremium: profiles.isPremium,
      premiumExpiresAt: profiles.premiumExpiresAt,
    })
    .from(profiles)
    .where(eq(profiles.id, userId));

  // Same expiry rule as every getIsPremiumUser in the codebase — the flag
  // alone isn't enough, a lapsed subscriber keeps it until Stripe's webhook
  // (Feature 39) clears it.
  const isPremium = Boolean(
    profile?.isPremium && (!profile.premiumExpiresAt || profile.premiumExpiresAt > new Date()),
  );

  return {
    xp: profile?.xp ?? 0,
    streakCurrent: profile?.streakCurrent ?? 0,
    isPremium,
  };
});

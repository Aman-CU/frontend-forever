import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

// Whether the given user currently has active premium.
//
// Same query shape as features/learn's and features/interview-prep's
// getIsPremiumUser, duplicated locally rather than imported for the same
// reason those two are duplicates of each other: features never import other
// features (architecture.md's invariant). The expiry check matters as much as
// the flag — a lapsed subscriber still has is_premium set until the Stripe
// webhook (Feature 39) clears it, so premiumExpiresAt is the real authority.
export const getIsPremiumUser = cache(async (userId: string): Promise<boolean> => {
  const [row] = await db
    .select({ isPremium: profiles.isPremium, premiumExpiresAt: profiles.premiumExpiresAt })
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (!row?.isPremium) return false;
  return !row.premiumExpiresAt || row.premiumExpiresAt > new Date();
});

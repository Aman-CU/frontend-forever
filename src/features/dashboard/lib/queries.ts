import { cache } from "react";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, userConceptProgress } from "@/lib/schema";
import { getUserRank } from "@/features/leaderboard/lib/queries";

export type DashboardProfileStats = {
  xp: number;
  streakCurrent: number;
  streakLongest: number;
};

export const getDashboardProfileStats = cache(
  async (userId: string): Promise<DashboardProfileStats> => {
    const [profile] = await db
      .select({
        xp: profiles.xp,
        streakCurrent: profiles.streakCurrent,
        streakLongest: profiles.streakLongest,
      })
      .from(profiles)
      .where(eq(profiles.id, userId));

    return {
      xp: profile?.xp ?? 0,
      streakCurrent: profile?.streakCurrent ?? 0,
      streakLongest: profile?.streakLongest ?? 0,
    };
  },
);

export type WeeklyDashboardStats = {
  weeklyRank: number | null;
  xpThisWeek: number;
  lessonsCompleted: number;
};

// Weekly rank, this-week XP, and lessons completed are all already computed
// by Feature 36's leaderboard query — reused directly rather than
// duplicated. getUserRank's conceptsCompleted is a fixed all-time snapshot
// regardless of the range argument, which is exactly "lessons completed"
// for this page (see features/leaderboard/lib/queries.ts).
export const getWeeklyDashboardStats = cache(
  async (userId: string): Promise<WeeklyDashboardStats> => {
    const rank = await getUserRank(userId, "week");
    return {
      weeklyRank: rank?.rank ?? null,
      xpThisWeek: rank?.xp ?? 0,
      lessonsCompleted: rank?.conceptsCompleted ?? 0,
    };
  },
);

// Total registered users — the "of N" denominator next to weekly rank.
export const getTotalUserCount = cache(async (): Promise<number> => {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(profiles);
  return count;
});

// Whether the user has ever made progress on anything — gates
// StartLearningCard (shown only when this is false, an honest empty state
// rather than a fake "continue where you left off").
export const hasAnyLearningProgress = cache(async (userId: string): Promise<boolean> => {
  const [row] = await db
    .select({ id: userConceptProgress.id })
    .from(userConceptProgress)
    .where(eq(userConceptProgress.userId, userId))
    .limit(1);
  return row !== undefined;
});

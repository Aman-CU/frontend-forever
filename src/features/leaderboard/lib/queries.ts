import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, desc, eq, gt, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, userConceptProgress, xpEvents } from "@/lib/schema";
import type { LeaderboardRange } from "@/lib/constants";
import { getRangeStart } from "@/features/leaderboard/lib/dateRanges";

export type LeaderboardEntry = {
  rank: number;
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  xp: number;
  streakCurrent: number;
  conceptsCompleted: number;
};

export type UserRankSummary = {
  rank: number;
  xp: number;
  streakCurrent: number;
  conceptsCompleted: number;
};

const LEADERBOARD_PAGE_SIZE = 100;

// Concepts Completed is a fixed all-time snapshot regardless of the active
// range tab (build-plan.md has no "completed this week" concept) — scoped to
// exactly the ids already selected for the page, not every profile in the DB.
async function getConceptsCompletedCounts(userIds: string[]): Promise<Record<string, number>> {
  if (userIds.length === 0) return {};

  const rows = await db
    .select({
      userId: userConceptProgress.userId,
      count: sql<number>`count(*)::int`,
    })
    .from(userConceptProgress)
    .where(
      and(
        inArray(userConceptProgress.userId, userIds),
        eq(userConceptProgress.fullyCompleted, true),
      ),
    )
    .groupBy(userConceptProgress.userId);

  return Object.fromEntries(rows.map((row) => [row.userId, row.count]));
}

// Top LEADERBOARD_PAGE_SIZE profiles ranked by the selected window. "all-time"
// ranks directly off the denormalized profiles.xp; "week"/"month" rank off a
// live SUM over xp_events in that UTC calendar window (see dateRanges.ts) —
// only users with at least one event in the window can appear, which is the
// intended behavior (there's no value in padding the table with tied-at-zero
// rows). rank() (not row_number()) so tied scores share a rank, matching
// getUserRank's count-based formula below.
//
// Identical for every viewer at a given range (no userId param, unlike
// getUserRank below) — unstable_cache instead of a plain request-scoped
// cache() so concurrent visitors share one query instead of each re-running
// the full ranking + per-user concept-count aggregation. Time-based
// revalidate (not the "concepts" tag other unstable_cache calls in this repo
// use) since this data changes continuously from live XP events, not from a
// content reseed — a short window trades a little staleness for a lot fewer
// DB round trips.
export const getLeaderboardEntries = unstable_cache(
  async (range: LeaderboardRange): Promise<LeaderboardEntry[]> => {
    const rangeStart = getRangeStart(range);

    const rows =
      rangeStart === null
        ? await db
            .select({
              rank: sql<number>`rank() over (order by ${profiles.xp} desc)::int`,
              id: profiles.id,
              username: profiles.username,
              fullName: profiles.fullName,
              avatarUrl: profiles.avatarUrl,
              isPremium: profiles.isPremium,
              streakCurrent: profiles.streakCurrent,
              xp: profiles.xp,
            })
            .from(profiles)
            .orderBy(desc(profiles.xp), profiles.id)
            .limit(LEADERBOARD_PAGE_SIZE)
        : await db
            .select({
              rank: sql<number>`rank() over (order by sum(${xpEvents.xpAmount}) desc)::int`,
              id: profiles.id,
              username: profiles.username,
              fullName: profiles.fullName,
              avatarUrl: profiles.avatarUrl,
              isPremium: profiles.isPremium,
              streakCurrent: profiles.streakCurrent,
              xp: sql<number>`sum(${xpEvents.xpAmount})::int`,
            })
            .from(xpEvents)
            .innerJoin(profiles, eq(xpEvents.userId, profiles.id))
            .where(gte(xpEvents.createdAt, rangeStart))
            .groupBy(profiles.id)
            .orderBy(desc(sql`sum(${xpEvents.xpAmount})`), profiles.id)
            .limit(LEADERBOARD_PAGE_SIZE);

    const conceptsCompleted = await getConceptsCompletedCounts(rows.map((row) => row.id));

    return rows.map((row) => ({
      ...row,
      conceptsCompleted: conceptsCompleted[row.id] ?? 0,
    }));
  },
  ["leaderboard-entries"],
  { tags: ["leaderboard"], revalidate: 60 },
);

// The logged-in user's real rank, even when they're outside the top
// LEADERBOARD_PAGE_SIZE — a separate, lightweight count query rather than
// fetching every profile just to find one row.
export const getUserRank = cache(
  async (userId: string, range: LeaderboardRange): Promise<UserRankSummary | null> => {
    const rangeStart = getRangeStart(range);

    const [profile] = await db
      .select({ streakCurrent: profiles.streakCurrent, xp: profiles.xp })
      .from(profiles)
      .where(eq(profiles.id, userId));
    if (!profile) return null;

    const conceptsCompletedPromise = getConceptsCompletedCounts([userId]).then(
      (counts) => counts[userId] ?? 0,
    );

    if (rangeStart === null) {
      const [{ rank }] = await db
        .select({ rank: sql<number>`(count(*) + 1)::int` })
        .from(profiles)
        .where(gt(profiles.xp, profile.xp));

      return {
        rank,
        xp: profile.xp,
        streakCurrent: profile.streakCurrent,
        conceptsCompleted: await conceptsCompletedPromise,
      };
    }

    const [{ xp: rangeXp }] = await db
      .select({ xp: sql<number>`coalesce(sum(${xpEvents.xpAmount}), 0)::int` })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, rangeStart)));

    const higherScorers = db
      .select({ userId: xpEvents.userId })
      .from(xpEvents)
      .where(gte(xpEvents.createdAt, rangeStart))
      .groupBy(xpEvents.userId)
      .having(sql`sum(${xpEvents.xpAmount}) > ${rangeXp}`)
      .as("higher_scorers");

    const [{ rank }] = await db.select({ rank: sql<number>`(count(*) + 1)::int` }).from(higherScorers);

    return {
      rank,
      xp: rangeXp,
      streakCurrent: profile.streakCurrent,
      conceptsCompleted: await conceptsCompletedPromise,
    };
  },
);

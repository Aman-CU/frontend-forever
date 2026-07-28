import { cache } from "react";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, xpEvents } from "@/lib/schema";

export type StreakSummary = {
  streakCurrent: number;
  streakLongest: number;
  streakLastActivity: string | null;
};

export type DailyActivity = {
  date: string; // YYYY-MM-DD, UTC calendar day
  xp: number;
};

export const DEFAULT_HEATMAP_DAYS = 30;

export const getStreakSummary = cache(async (userId: string): Promise<StreakSummary> => {
  const [profile] = await db
    .select({
      streakCurrent: profiles.streakCurrent,
      streakLongest: profiles.streakLongest,
      streakLastActivity: profiles.streakLastActivity,
    })
    .from(profiles)
    .where(eq(profiles.id, userId));

  return {
    streakCurrent: profile?.streakCurrent ?? 0,
    streakLongest: profile?.streakLongest ?? 0,
    streakLastActivity: profile?.streakLastActivity ?? null,
  };
});

// Last `days` UTC calendar days (oldest first), zero-filled for days with no
// xp_events row — callers render every cell regardless of activity, so they
// never have to backfill gaps themselves. `days` defaults to the Settings
// Profile section's 30-day view; the Dashboard's 6-month activity graph
// (Feature "Dashboard") reuses this same query with a wider window instead
// of a second, near-duplicate one.
export const getDailyActivity = cache(
  async (userId: string, days: number = DEFAULT_HEATMAP_DAYS): Promise<DailyActivity[]> => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const dateExpr = sql<string>`(${xpEvents.createdAt} at time zone 'utc')::date::text`;

    const rows = await db
      .select({ date: dateExpr, xp: sql<number>`sum(${xpEvents.xpAmount})::int` })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, start)))
      .groupBy(dateExpr);

    const byDate = new Map(rows.map((row) => [row.date, row.xp]));

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const date = d.toISOString().slice(0, 10);
      return { date, xp: byDate.get(date) ?? 0 };
    });
  },
);

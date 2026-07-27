import type { LeaderboardRange } from "@/lib/constants";

// UTC calendar boundaries, matching the streak system's own UTC-day
// convention (see architecture.md's Streak Logic) — a week runs Monday to
// Sunday, not a rolling trailing-7-days window, so the leaderboard resets on
// a fixed, predictable schedule.
export function getRangeStart(range: LeaderboardRange): Date | null {
  if (range === "all-time") return null;

  const now = new Date();
  if (range === "month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  // ISO weekday: Monday = 1 ... Sunday = 7.
  const isoWeekday = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
  const daysSinceMonday = isoWeekday - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday),
  );
  return monday;
}

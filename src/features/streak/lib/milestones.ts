import { todayUtc } from "@/lib/progress/applyProgressUpdate";
import { STREAK_MILESTONES } from "@/lib/constants";

// True only on the UTC calendar day a streak newly reaches one of
// STREAK_MILESTONES. streakLastActivity stops equaling "today" the moment
// the next UTC day starts, so this naturally stops firing on its own —
// no separate "acknowledged" flag needed.
export function isMilestoneDay(streakCurrent: number, streakLastActivity: string | null): boolean {
  return (
    streakLastActivity === todayUtc() &&
    (STREAK_MILESTONES as readonly number[]).includes(streakCurrent)
  );
}

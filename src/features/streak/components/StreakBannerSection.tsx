import { StreakBanner } from "@/features/streak/components/StreakBanner";
import { MilestoneCelebration } from "@/features/streak/components/MilestoneCelebration";
import { isMilestoneDay } from "@/features/streak/lib/milestones";

type Props = {
  userId: string;
  streakCurrent: number;
  streakLastActivity: string | null;
};

// A 1-day streak is just "did something today" — not yet worth a banner
// (build-plan.md, Feature 37 architect session).
const BANNER_MIN_STREAK = 2;

// Composes the Learn page's streak banner with its milestone confetti —
// the single place that decides whether either renders, so the two never
// drift out of sync (e.g. confetti firing with no banner visible).
export function StreakBannerSection({ userId, streakCurrent, streakLastActivity }: Props) {
  if (streakCurrent < BANNER_MIN_STREAK) return null;

  return (
    <div className="relative mb-6">
      <StreakBanner streakCurrent={streakCurrent} />
      <MilestoneCelebration
        userId={userId}
        streakCurrent={streakCurrent}
        streakLastActivity={streakLastActivity}
        isMilestoneDay={isMilestoneDay(streakCurrent, streakLastActivity)}
      />
    </div>
  );
}

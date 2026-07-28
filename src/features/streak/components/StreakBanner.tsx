import { Flame } from "lucide-react";

type Props = {
  streakCurrent: number;
};

// Purely presentational — StreakBannerSection owns the >= 2 day threshold
// decision (build-plan.md, Feature 37) so there's one source of truth.
export function StreakBanner({ streakCurrent }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-streak-light bg-streak-light px-4 py-3 text-sm font-medium text-text-primary">
      <Flame className="size-4 shrink-0 fill-streak stroke-none" />
      <span>
        You&apos;re on a <span className="font-bold text-streak">{streakCurrent} day</span> streak!
        Keep it up.
      </span>
    </div>
  );
}

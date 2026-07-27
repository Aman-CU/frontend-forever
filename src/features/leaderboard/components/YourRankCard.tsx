import { CheckCircle2, Flame } from "lucide-react";

import type { UserRankSummary } from "@/features/leaderboard/lib/queries";

// Always rendered — /leaderboard is proxy-gated (src/proxy.ts), so every
// visitor has a session; there's no logged-out state to branch on here.
export function YourRankCard({ summary }: { summary: UserRankSummary }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent-muted px-5 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Your Rank</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-text-primary">#{summary.rank}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="font-semibold tabular-nums text-text-primary">
          {summary.xp.toLocaleString()} XP
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <Flame className="h-4 w-4 text-streak" aria-hidden />
          {summary.streakCurrent} day streak
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
          {summary.conceptsCompleted} concepts completed
        </span>
      </div>
    </div>
  );
}

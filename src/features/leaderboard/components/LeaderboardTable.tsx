import { CheckCircle2, Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import { LeaderboardAvatar } from "@/features/leaderboard/components/LeaderboardAvatar";
import type { LeaderboardEntry } from "@/features/leaderboard/lib/queries";

// Same grid-with-minmax(0,1fr) lesson learned across this codebase's other
// row lists (Practice's ChallengeListRow) — a flex item's default min-width
// is its own content width, not 0, so without an explicit fr track the name
// column never actually truncates on narrow viewports.
export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
}) {
  return (
    <div
      role="table"
      aria-label="Leaderboard rankings"
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div
        role="row"
        className="grid grid-cols-[3rem_minmax(0,1fr)_5rem_4rem_4rem] items-center gap-3 border-b border-border-light px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted sm:px-5"
      >
        <span role="columnheader">Rank</span>
        <span role="columnheader">User</span>
        <span role="columnheader" className="text-right">
          XP
        </span>
        <span role="columnheader" className="text-right">
          Streak
        </span>
        <span role="columnheader" className="text-right">
          Done
        </span>
      </div>

      <div className="divide-y divide-border-light">
        {entries.map((entry) => (
          <div
            key={entry.id}
            role="row"
            className={cn(
              "grid grid-cols-[3rem_minmax(0,1fr)_5rem_4rem_4rem] items-center gap-3 px-4 py-3 sm:px-5",
              entry.id === currentUserId && "bg-accent-muted",
            )}
          >
            <span role="cell" className="text-sm font-semibold tabular-nums text-text-secondary">
              #{entry.rank}
            </span>

            <div role="cell" className="flex min-w-0 items-center gap-2.5">
              <LeaderboardAvatar
                fullName={entry.fullName}
                username={entry.username}
                avatarUrl={entry.avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {entry.fullName ?? entry.username}
                </p>
                {entry.isPremium && (
                  <span className="inline-flex items-center rounded-full bg-premium-light px-1.5 py-0 text-[0.625rem] font-semibold text-premium">
                    Premium
                  </span>
                )}
              </div>
            </div>

            <span
              role="cell"
              className="text-right text-sm font-semibold tabular-nums text-text-primary"
            >
              {entry.xp.toLocaleString()}
            </span>

            <span
              role="cell"
              className="flex items-center justify-end gap-1 text-sm tabular-nums text-text-secondary"
            >
              <Flame className="h-3.5 w-3.5 text-streak" aria-hidden />
              {entry.streakCurrent}
            </span>

            <span
              role="cell"
              className="flex items-center justify-end gap-1 text-sm tabular-nums text-text-secondary"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
              {entry.conceptsCompleted}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

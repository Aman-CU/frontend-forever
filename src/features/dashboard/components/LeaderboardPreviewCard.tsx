import Link from "next/link";
import { Crown } from "lucide-react";

import { LeaderboardAvatar } from "@/features/leaderboard/components/LeaderboardAvatar";
import type { LeaderboardEntry, UserRankSummary } from "@/features/leaderboard/lib/queries";

const PREVIEW_SIZE = 4;

type Props = {
  entries: LeaderboardEntry[];
  currentUserId: string;
  currentUserRank: UserRankSummary | null;
};

// Reuses Feature 36's real weekly leaderboard data — no separate query.
export function LeaderboardPreviewCard({ entries, currentUserId, currentUserRank }: Props) {
  const topEntries = entries.slice(0, PREVIEW_SIZE);
  const isCurrentUserInTop = topEntries.some((entry) => entry.id === currentUserId);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary">This week</p>
        <Link href="/leaderboard" className="text-xs font-medium text-accent hover:underline">
          Leaderboard →
        </Link>
      </div>

      {topEntries.length === 0 ? (
        <p className="text-sm text-text-secondary">No activity yet this week.</p>
      ) : (
        <ul className="space-y-2.5">
          {topEntries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2.5">
              <span className="flex w-4 shrink-0 items-center justify-center text-xs font-semibold text-text-muted">
                {entry.rank === 1 ? <Crown className="size-3.5 text-xp" /> : entry.rank}
              </span>
              <LeaderboardAvatar
                fullName={entry.fullName}
                username={entry.username}
                avatarUrl={entry.avatarUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {entry.fullName ?? entry.username}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                {entry.xp.toLocaleString()} XP
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isCurrentUserInTop && currentUserRank && (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-accent-muted bg-accent-muted/40 p-2">
          <span className="w-4 shrink-0 text-center text-xs font-semibold text-text-muted">
            {currentUserRank.rank}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">You</span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
            {currentUserRank.xp.toLocaleString()} XP
          </span>
        </div>
      )}
    </div>
  );
}

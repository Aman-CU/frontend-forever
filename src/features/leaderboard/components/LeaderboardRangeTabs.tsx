import Link from "next/link";

import { LEADERBOARD_RANGES, type LeaderboardRange } from "@/lib/constants";
import { cn } from "@/lib/utils";

const RANGE_LABELS: Record<LeaderboardRange, string> = {
  "all-time": "All Time",
  week: "This Week",
  month: "This Month",
};

// Plain <Link>s driving the ?range= searchParam — the page is a Server
// Component that re-runs the ranked query per range, so switching tabs is a
// real navigation, not client-side state. No "use client" needed.
export function LeaderboardRangeTabs({ activeRange }: { activeRange: LeaderboardRange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-surface-secondary p-1">
      {LEADERBOARD_RANGES.map((range) => (
        <Link
          key={range}
          href={range === "all-time" ? "/leaderboard" : `/leaderboard?range=${range}`}
          aria-current={range === activeRange ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            range === activeRange
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-primary",
          )}
        >
          {RANGE_LABELS[range]}
        </Link>
      ))}
    </div>
  );
}

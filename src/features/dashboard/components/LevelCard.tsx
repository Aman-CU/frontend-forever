import { Trophy, Zap, TrendingUp } from "lucide-react";

type Props = {
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  weeklyRank: number | null;
  totalUsers: number;
  xpThisWeek: number;
  totalXp: number;
};

export function LevelCard({
  level,
  xpIntoLevel,
  xpToNextLevel,
  weeklyRank,
  totalUsers,
  xpThisWeek,
  totalXp,
}: Props) {
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpToNextLevel) * 100));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-3 text-xs font-semibold tracking-wide text-text-muted uppercase">Your Level</p>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-xp text-lg font-bold text-xp">
          {level}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-primary">Level {level}</p>
          <p className="text-xs text-text-muted">
            {xpIntoLevel} / {xpToNextLevel} XP to next
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-xp"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-label="Level progress"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Trophy className="size-4 text-xp" />
            Weekly rank
          </span>
          <span className="font-semibold text-text-primary">
            {weeklyRank !== null ? `#${weeklyRank} of ${totalUsers}` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Zap className="size-4 fill-xp stroke-none" />
            XP this week
          </span>
          <span className="font-semibold text-text-primary">{xpThisWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <TrendingUp className="size-4 text-success" />
            Total XP
          </span>
          <span className="font-semibold text-text-primary">{totalXp}</span>
        </div>
      </div>
    </div>
  );
}

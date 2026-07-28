import type { DailyActivity } from "@/features/streak/lib/queries";
import { intensityClass } from "@/features/streak/lib/intensity";

type Props = {
  activity: DailyActivity[];
  streakCurrent: number;
  streakLongest: number;
};

// Aligns the first activity day to its real UTC weekday column so the grid
// reads like a real calendar (columns = weeks, rows = Sun-Sat) — the same
// visual convention as GitHub's contribution graph.
function leadingPadding(firstDate: string): number {
  return new Date(`${firstDate}T00:00:00Z`).getUTCDay();
}

export function StreakHeatMap({ activity, streakCurrent, streakLongest }: Props) {
  const padding = activity.length > 0 ? leadingPadding(activity[0].date) : 0;
  const cells: Array<DailyActivity | null> = [
    ...Array.from({ length: padding }, () => null),
    ...activity,
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center gap-6">
        <div>
          <p className="text-xs font-medium text-text-muted">Current streak</p>
          <p className="text-xl font-bold text-streak">{streakCurrent} days</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Longest streak</p>
          <p className="text-xl font-bold text-text-primary">{streakLongest} days</p>
        </div>
      </div>

      <div
        className="grid auto-cols-max grid-flow-col grid-rows-7 justify-start gap-1"
        role="img"
        aria-label="Last 30 days of activity"
      >
        {cells.map((day, i) =>
          day === null ? (
            <div key={`pad-${i}`} className="size-3.5" aria-hidden />
          ) : (
            <div
              key={day.date}
              title={`${day.date} — ${day.xp} XP`}
              className={`size-3.5 rounded-[2px] ${intensityClass(day.xp)}`}
            />
          ),
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
        <span>Less</span>
        <span className="size-3 rounded-[2px] bg-border" aria-hidden />
        <span className="size-3 rounded-[2px] bg-streak-light" aria-hidden />
        <span className="size-3 rounded-[2px] bg-streak" aria-hidden />
        <span>More</span>
      </div>
    </div>
  );
}

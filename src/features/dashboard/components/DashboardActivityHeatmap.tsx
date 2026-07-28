import type { DailyActivity } from "@/features/streak/lib/queries";
import { HeatmapCell } from "@/features/streak/components/HeatmapCell";

type Props = {
  activity: DailyActivity[];
  activeDays: number;
  months: number;
};

type Cell = DailyActivity | null;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Lays the whole window out as one continuous run of Sunday-to-Saturday
// week columns — real GitHub-style, not separate per-month blocks. Only the
// partial week at each end (before the window start / after today) is
// padded with null cells; every real day in between is a genuine cell, so a
// "short" week or month just has fewer colored cells, same as GitHub.
function buildWeeks(activity: DailyActivity[]): Cell[][] {
  if (activity.length === 0) return [];

  const byDate = new Map(activity.map((day) => [day.date, day]));
  const firstDay = new Date(`${activity[0].date}T00:00:00Z`);
  const lastDay = new Date(`${activity[activity.length - 1].date}T00:00:00Z`);

  const gridStart = addDays(firstDay, -firstDay.getUTCDay());
  const gridEnd = addDays(lastDay, 6 - lastDay.getUTCDay());

  const weeks: Cell[][] = [];
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 7)) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const key = toKey(addDays(cursor, i));
      week.push(byDate.get(key) ?? null);
    }
    weeks.push(week);
  }
  return weeks;
}

// A week gets a month label only when it contains that month's 1st — the
// same point GitHub's own graph switches labels — so each label marks
// exactly where a new month begins in the continuous grid.
function buildMonthLabels(weeks: Cell[][]): (string | null)[] {
  return weeks.map((week) => {
    const firstOfMonth = week.find((day) => day !== null && day.date.slice(8, 10) === "01");
    if (!firstOfMonth) return null;
    return MONTH_NAMES[new Date(`${firstOfMonth.date}T00:00:00Z`).getUTCMonth()];
  });
}

export function DashboardActivityHeatmap({ activity, activeDays, months }: Props) {
  const weeks = buildWeeks(activity);
  const monthLabels = buildMonthLabels(weeks);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-text-primary">Activity</p>
          <p className="text-xs text-text-muted">
            {activeDays} active days in the last {months} months
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>Less</span>
          <span className="size-3 rounded-[2px] bg-border" aria-hidden />
          <span className="size-3 rounded-[2px] bg-streak-light" aria-hidden />
          <span className="size-3 rounded-[2px] bg-streak" aria-hidden />
          <span>More</span>
        </div>
      </div>

      <div className="flex w-full gap-1" role="img" aria-label={`Last ${months} months of activity`}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="relative flex flex-1 flex-col gap-1 pt-4">
            {monthLabels[weekIndex] && (
              <span className="absolute top-0 left-0 z-10 text-[10px] font-medium whitespace-nowrap text-text-muted">
                {monthLabels[weekIndex]}
              </span>
            )}
            {week.map((day, dayIndex) =>
              day === null ? (
                <div key={dayIndex} className="aspect-square w-full" aria-hidden />
              ) : (
                <HeatmapCell key={day.date} date={day.date} xp={day.xp} className="aspect-square w-full" />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

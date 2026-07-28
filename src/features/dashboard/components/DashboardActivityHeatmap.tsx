import type { DailyActivity } from "@/features/streak/lib/queries";
import { intensityClass } from "@/features/streak/lib/intensity";

type Props = {
  activity: DailyActivity[];
  activeDays: number;
  months: number;
};

type Cell = DailyActivity | null;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Aligns the first activity day to its real UTC weekday column, same
// convention as StreakHeatMap (Settings > Profile's 30-day version).
function leadingPadding(firstDate: string): number {
  return new Date(`${firstDate}T00:00:00Z`).getUTCDay();
}

function chunkIntoColumns(cells: Cell[]): Cell[][] {
  const columns: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }
  return columns;
}

function columnMonth(column: Cell[]): number | null {
  const firstReal = column.find((c): c is DailyActivity => c !== null);
  if (!firstReal) return null;
  return new Date(`${firstReal.date}T00:00:00Z`).getUTCMonth();
}

// A column gets a month label only when it's the first column whose first
// real day falls in a new month — avoids repeating the same label on every
// column within that month. Every month transition gets a label, no
// exceptions — an earlier version skipped a label if it sat too close to
// the previous one (to avoid overlapping text at the old fixed-width cell
// size), but that silently dropped whole months from the calendar, which is
// a correctness bug, not a cosmetic one. Cells now fill the card's width
// (see below), which gives every column enough room for its label anyway.
function computeColumnLabels(columns: Cell[][]): (string | null)[] {
  let lastMonth: number | null = null;
  return columns.map((column) => {
    const month = columnMonth(column);
    if (month === null || month === lastMonth) return null;
    lastMonth = month;
    return MONTH_NAMES[month];
  });
}

export function DashboardActivityHeatmap({ activity, activeDays, months }: Props) {
  const padding = activity.length > 0 ? leadingPadding(activity[0].date) : 0;
  const cells: Cell[] = [...Array.from({ length: padding }, () => null), ...activity];
  const columns = chunkIntoColumns(cells);
  const columnLabels = computeColumnLabels(columns);

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

      {/* Unlike StreakHeatMap (Settings > Profile's compact 30-day view,
          deliberately GitHub-sized fixed cells), this card has real room to
          spare — flex-1 columns + aspect-square cells stretch to fill the
          card's full width instead of hugging their content and leaving a
          dead gap on the right (caught from a real screenshot). */}
      <div className="flex w-full gap-1" role="img" aria-label={`Last ${months} months of activity`}>
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="relative flex flex-1 flex-col gap-1 pt-4">
            {columnLabels[colIndex] && (
              // Capped to this column's own width (never the neighboring
              // column's space) so a narrow card clips a label ("Ja") rather
              // than letting two adjacent months' text visually overlap
              // ("JanFeb") — every month still gets a label, it just
              // shrinks instead of colliding.
              <span className="absolute top-0 left-0 w-full overflow-hidden text-[10px] font-medium whitespace-nowrap text-ellipsis text-text-muted">
                {columnLabels[colIndex]}
              </span>
            )}
            {column.map((day, i) =>
              day === null ? (
                <div key={i} className="aspect-square w-full" aria-hidden />
              ) : (
                <div
                  key={day.date}
                  title={`${day.date} — ${day.xp} XP`}
                  className={`aspect-square w-full rounded-[2px] ${intensityClass(day.xp)}`}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

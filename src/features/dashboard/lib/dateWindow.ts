// Number of days from the 1st of the UTC calendar month `monthsBack - 1`
// months ago through today (inclusive) — i.e. exactly `monthsBack` full
// calendar months, current month included. A flat day-count window (e.g.
// 183 days for "6 months") almost always starts mid-month, spilling into a
// 7th partial month and making the "last N months" label a lie — this
// aligns the window to real calendar-month boundaries instead.
export function getCalendarWindowDays(monthsBack: number): number {
  const now = new Date();
  const startOfWindow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const MS_PER_DAY = 86_400_000;
  return Math.round((today - startOfWindow) / MS_PER_DAY) + 1;
}

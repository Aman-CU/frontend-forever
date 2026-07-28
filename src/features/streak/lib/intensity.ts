// 3-level intensity by daily XP, not a binary lit/unlit cell — shared by
// every activity-heatmap grid (Settings Profile's 30-day view, Dashboard's
// 6-month view) so the color bands never drift out of sync between them.
export function intensityClass(xp: number): string {
  if (xp <= 0) return "bg-border";
  if (xp < 25) return "bg-streak-light";
  return "bg-streak";
}

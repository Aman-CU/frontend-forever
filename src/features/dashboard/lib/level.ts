export const XP_PER_LEVEL = 50;

export type LevelProgress = {
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
};

// Every XP_PER_LEVEL XP earns one level — a simple, transparent formula
// invented for the Dashboard (no level system existed anywhere before this).
// Every caller only ever sees the derived level/progress, never
// XP_PER_LEVEL itself, so the curve can change later without touching them.
export function getLevelProgress(xp: number): LevelProgress {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpToNextLevel: XP_PER_LEVEL };
}

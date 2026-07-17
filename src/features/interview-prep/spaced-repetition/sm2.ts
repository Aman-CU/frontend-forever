// SM-2 spaced-repetition algorithm (Feature 32) — pure, no DB/framework
// dependency, so it's directly unit-testable in isolation from
// lib/progress/applyInterviewReview.ts, which is the only caller.
//
// Quality is the standard SuperMemo 0-5 scale. This app's two rating UIs only
// ever pass a subset of it: Learn's Interview tab (Feature 25) sends 5
// ("knew") or 2 ("review"); the dedicated review session (Feature 32) sends
// 5/4/3/1 for Easy/Okay/Hard/Forgot.

export type Sm2State = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type Sm2Result = Sm2State & { nextReviewAt: Date };

const MIN_EASE_FACTOR = 1.3;

export function applySm2Rating(prev: Sm2State, quality: number, now: Date = new Date()): Sm2Result {
  let { easeFactor, repetitions } = prev;
  let intervalDays: number;

  if (quality < 3) {
    // A failed/forgotten recall resets the repetition streak — start over
    // at a 1-day interval, but keep the accumulated ease factor (only the
    // schedule resets, not how "easy" this card has proven historically).
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(prev.intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  const nextEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, nextEaseFactor);

  const nextReviewAt = new Date(now);
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, nextReviewAt };
}

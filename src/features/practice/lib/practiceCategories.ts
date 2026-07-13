import type { ConceptCategory } from "@/lib/constants";

// Practice is scoped to coding challenges only (see progress-tracker.md ->
// Decisions Made, Post-Feature-28 entry): Browser Internals, Accessibility,
// and Performance are dropped from this section per explicit user request —
// every concept in those categories is still fully covered in Learn, just
// not surfaced as a Practice category. Quizzes and general interview
// questions stay out of Practice entirely; that content belongs to the
// separately-planned Interview Prep section (Feature 30-32).
export const PRACTICE_CATEGORIES = [
  "javascript-runtime",
  "react",
  "css",
  "typescript",
  "system-design",
] as const satisfies readonly ConceptCategory[];

export type PracticeCategory = (typeof PRACTICE_CATEGORIES)[number];

// Practice-specific display names (BFE.dev-style phrasing), distinct from
// CATEGORY_META's labels which Learn still uses ("JavaScript Runtime", etc.)
// — overriding the shared meta would rename Learn's cards too.
export const PRACTICE_CATEGORY_LABELS: Record<PracticeCategory, string> = {
  "javascript-runtime": "JavaScript Coding Questions",
  react: "React Coding Questions",
  css: "CSS Questions",
  typescript: "TypeScript Puzzles",
  "system-design": "Front-End System Design Questions",
};

// Shared type guard — was private to [category]/page.tsx until the Editor
// page (Feature 29) and its opengraph-image route needed the same check.
export function isPracticeCategory(value: string): value is PracticeCategory {
  return (PRACTICE_CATEGORIES as readonly string[]).includes(value);
}

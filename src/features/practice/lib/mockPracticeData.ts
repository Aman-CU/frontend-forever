import type { ChallengeDifficulty } from "@/lib/constants";
import type { PracticeCategory } from "@/features/practice/lib/practiceCategories";

// UI-first placeholder data for Feature 28 (Practice Hub + Category List).
// Real data comes from a follow-up logic pass: challenge counts and solved
// state will be computed by joining `challenges` -> `concepts` and
// aggregating `user_challenge_submissions` (see progress-tracker.md).
// Scoped to PRACTICE_CATEGORIES only (javascript-runtime, react, css,
// typescript, system-design) -- see practiceCategories.ts.

export type MockChallenge = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: PracticeCategory;
  conceptTitle: string;
  completed: boolean;
  companies: string[];
};

export const MOCK_CHALLENGES: MockChallenge[] = [
  // JavaScript Runtime
  {
    slug: "implement-debounce",
    title: "Implement Debounce",
    difficulty: "easy",
    category: "javascript-runtime",
    conceptTitle: "Debouncing & Throttling",
    completed: true,
    companies: ["Google", "Uber"],
  },
  {
    slug: "closure-counter-factory",
    title: "Closure Counter Factory",
    difficulty: "easy",
    category: "javascript-runtime",
    conceptTitle: "Closures",
    completed: true,
    companies: ["Meta"],
  },
  {
    slug: "async-task-queue",
    title: "Async Task Queue with Concurrency Limit",
    difficulty: "hard",
    category: "javascript-runtime",
    conceptTitle: "Promises & Async/Await",
    completed: false,
    companies: ["Amazon", "Stripe"],
  },
  {
    slug: "curry-function",
    title: "Curry a Variadic Function",
    difficulty: "medium",
    category: "javascript-runtime",
    conceptTitle: "Function Composition & Currying",
    completed: false,
    companies: ["Airbnb"],
  },
  // React
  {
    slug: "kanban-board",
    title: "Build a Draggable Kanban Board",
    difficulty: "hard",
    category: "react",
    conceptTitle: "Component Composition Patterns",
    completed: false,
    companies: ["LinkedIn"],
  },
  {
    slug: "use-debounced-value",
    title: "Write a useDebouncedValue Hook",
    difficulty: "medium",
    category: "react",
    conceptTitle: "Custom Hooks & Composition",
    completed: true,
    companies: ["Meta", "TikTok"],
  },
  {
    slug: "controlled-form-validator",
    title: "Controlled Multi-Field Form Validator",
    difficulty: "easy",
    category: "react",
    conceptTitle: "Forms: Controlled vs. Uncontrolled",
    completed: false,
    companies: ["Google"],
  },
  // CSS
  {
    slug: "flex-grid-layout-match",
    title: "Recreate a Layout: Flexbox vs. Grid",
    difficulty: "easy",
    category: "css",
    conceptTitle: "Flexbox vs. Grid",
    completed: true,
    companies: ["Adobe"],
  },
  {
    slug: "specificity-showdown",
    title: "Selector Specificity Showdown",
    difficulty: "easy",
    category: "css",
    conceptTitle: "CSS Specificity",
    completed: true,
    companies: ["Apple"],
  },
  {
    slug: "stacking-context-debugger",
    title: "Debug a Broken Stacking Context",
    difficulty: "medium",
    category: "css",
    conceptTitle: "Positioning & Stacking Contexts",
    completed: false,
    companies: ["Microsoft"],
  },
  // TypeScript
  {
    slug: "generic-cache-store",
    title: "Build a Generic Key-Value Cache",
    difficulty: "medium",
    category: "typescript",
    conceptTitle: "Generics",
    completed: false,
    companies: ["Stripe"],
  },
  {
    slug: "discriminated-union-reducer",
    title: "Type a Reducer with Discriminated Unions",
    difficulty: "hard",
    category: "typescript",
    conceptTitle: "Discriminated Unions in Practice",
    completed: false,
    companies: ["Amazon"],
  },
  // System Design
  {
    slug: "dedupe-and-cache-fetcher",
    title: "Build a Dedupe-and-Cache Fetcher",
    difficulty: "hard",
    category: "system-design",
    conceptTitle: "API Design & Data-Fetching Strategy",
    completed: false,
    companies: ["Uber", "Snap"],
  },
  {
    slug: "classify-state-layer",
    title: "Classify a State Layer at Scale",
    difficulty: "hard",
    category: "system-design",
    conceptTitle: "State Management at Scale",
    completed: false,
    companies: ["Airbnb"],
  },
];

export function getCategoryStats(category: PracticeCategory) {
  const challenges = MOCK_CHALLENGES.filter((c) => c.category === category);
  const completedCount = challenges.filter((c) => c.completed).length;
  return { challengeCount: challenges.length, completedCount };
}

export function getChallengesByCategory(category: PracticeCategory) {
  return MOCK_CHALLENGES.filter((c) => c.category === category);
}

// The one "Continue where you left off" entry shown on the Hub, for real
// this will be the user's most recent non-passing submission.
export const MOCK_CONTINUE_CHALLENGE = MOCK_CHALLENGES.find(
  (c) => c.slug === "async-task-queue",
)!;

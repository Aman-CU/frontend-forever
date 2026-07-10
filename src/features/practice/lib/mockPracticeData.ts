import type { ChallengeDifficulty, ConceptCategory } from "@/lib/constants";

// UI-first placeholder data for Feature 28 (Practice Hub + Category List).
// Real data comes from a follow-up logic pass: challenge counts and solved
// state will be computed by joining `challenges` -> `concepts` and
// aggregating `user_challenge_submissions` (see progress-tracker.md).

export type MockChallenge = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: ConceptCategory;
  conceptTitle: string;
  completed: boolean;
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
  },
  {
    slug: "closure-counter-factory",
    title: "Closure Counter Factory",
    difficulty: "easy",
    category: "javascript-runtime",
    conceptTitle: "Closures",
    completed: true,
  },
  {
    slug: "async-task-queue",
    title: "Async Task Queue with Concurrency Limit",
    difficulty: "hard",
    category: "javascript-runtime",
    conceptTitle: "Promises & Async/Await",
    completed: false,
  },
  {
    slug: "curry-function",
    title: "Curry a Variadic Function",
    difficulty: "medium",
    category: "javascript-runtime",
    conceptTitle: "Function Composition & Currying",
    completed: false,
  },
  // Browser Internals
  {
    slug: "event-delegation-list",
    title: "Delegate Clicks Across a Dynamic List",
    difficulty: "easy",
    category: "browser-internals",
    conceptTitle: "Event Delegation, Bubbling & Capturing",
    completed: true,
  },
  {
    slug: "render-blocking-analyzer",
    title: "Classify Render-Blocking Resources",
    difficulty: "medium",
    category: "browser-internals",
    conceptTitle: "Browser Rendering Pipeline",
    completed: false,
  },
  {
    slug: "find-leaked-listeners",
    title: "Find Leaked Event Listeners",
    difficulty: "hard",
    category: "browser-internals",
    conceptTitle: "Memory Management & Leaks",
    completed: false,
  },
  // React
  {
    slug: "kanban-board",
    title: "Build a Draggable Kanban Board",
    difficulty: "hard",
    category: "react",
    conceptTitle: "Component Composition Patterns",
    completed: false,
  },
  {
    slug: "use-debounced-value",
    title: "Write a useDebouncedValue Hook",
    difficulty: "medium",
    category: "react",
    conceptTitle: "Custom Hooks & Composition",
    completed: true,
  },
  {
    slug: "controlled-form-validator",
    title: "Controlled Multi-Field Form Validator",
    difficulty: "easy",
    category: "react",
    conceptTitle: "Forms: Controlled vs. Uncontrolled",
    completed: false,
  },
  // CSS
  {
    slug: "flex-grid-layout-match",
    title: "Recreate a Layout: Flexbox vs. Grid",
    difficulty: "easy",
    category: "css",
    conceptTitle: "Flexbox vs. Grid",
    completed: true,
  },
  {
    slug: "specificity-showdown",
    title: "Selector Specificity Showdown",
    difficulty: "easy",
    category: "css",
    conceptTitle: "CSS Specificity",
    completed: true,
  },
  {
    slug: "stacking-context-debugger",
    title: "Debug a Broken Stacking Context",
    difficulty: "medium",
    category: "css",
    conceptTitle: "Positioning & Stacking Contexts",
    completed: false,
  },
  // TypeScript
  {
    slug: "generic-cache-store",
    title: "Build a Generic Key-Value Cache",
    difficulty: "medium",
    category: "typescript",
    conceptTitle: "Generics",
    completed: false,
  },
  {
    slug: "discriminated-union-reducer",
    title: "Type a Reducer with Discriminated Unions",
    difficulty: "hard",
    category: "typescript",
    conceptTitle: "Discriminated Unions in Practice",
    completed: false,
  },
  // Accessibility
  {
    slug: "focus-trap-modal",
    title: "Build a Focus Trap for a Modal",
    difficulty: "medium",
    category: "accessibility",
    conceptTitle: "Keyboard Navigation & Focus Management",
    completed: false,
  },
  {
    slug: "aria-live-toast",
    title: "Announce Toasts with ARIA Live Regions",
    difficulty: "medium",
    category: "accessibility",
    conceptTitle: "ARIA Live Regions",
    completed: true,
  },
  // Performance
  {
    slug: "virtual-list",
    title: "Render 10,000 Rows at 60fps",
    difficulty: "medium",
    category: "performance",
    conceptTitle: "List Virtualization",
    completed: true,
  },
  {
    slug: "lcp-inp-cls-rater",
    title: "Build a Real-Threshold Core Web Vitals Rater",
    difficulty: "medium",
    category: "performance",
    conceptTitle: "Core Web Vitals",
    completed: false,
  },
  // System Design
  {
    slug: "dedupe-and-cache-fetcher",
    title: "Build a Dedupe-and-Cache Fetcher",
    difficulty: "hard",
    category: "system-design",
    conceptTitle: "API Design & Data-Fetching Strategy",
    completed: false,
  },
  {
    slug: "classify-state-layer",
    title: "Classify a State Layer at Scale",
    difficulty: "hard",
    category: "system-design",
    conceptTitle: "State Management at Scale",
    completed: false,
  },
];

export function getCategoryStats(category: ConceptCategory) {
  const challenges = MOCK_CHALLENGES.filter((c) => c.category === category);
  const completedCount = challenges.filter((c) => c.completed).length;
  return { challengeCount: challenges.length, completedCount };
}

export function getChallengesByCategory(category: ConceptCategory) {
  return MOCK_CHALLENGES.filter((c) => c.category === category);
}

// The one "Continue where you left off" entry shown on the Hub, for real
// this will be the user's most recent non-passing submission.
export const MOCK_CONTINUE_CHALLENGE = MOCK_CHALLENGES.find(
  (c) => c.slug === "async-task-queue",
)!;

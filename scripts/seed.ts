/**
 * Seed script — run with: npx tsx scripts/seed.ts
 * Safe to re-run: all inserts are idempotent (keyed on slug or collection+order_index).
 * Extend this file as platform content grows; never bake seeds into migrations.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import {
  concepts,
  challenges,
  interviewQuestions,
  projectBriefs,
  roadmaps,
  roadmapSteps,
} from "../src/lib/schema";
import type {
  ConceptCategory,
  ConceptDifficulty,
  ChallengeDifficulty,
  InterviewCollection,
} from "../src/lib/constants";

type ConceptSeed = {
  slug: string;
  title: string;
  description: string;
  category: ConceptCategory;
  difficulty: ConceptDifficulty;
  // Omit for a free concept (the default) — same optional-if-free convention as
  // ChallengeSeed/ProjectBriefSeed's isPremium. Needed so the onConflictDoUpdate
  // below has a real seed-controlled value to write instead of always falling
  // back to the column default on every reseed.
  isPremium?: boolean;
  orderIndex: number;
};

type ChallengeSeed = {
  slug: string;
  // Concept this challenge belongs to (its Challenge tab renders this one).
  // Resolved to a concept_id at insert time; omit for standalone challenges.
  conceptSlug?: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  hints: string[];
  // Companies the challenge is attributed to (Practice's Company filter,
  // Feature 28) — omitted entries default to [] via the column default.
  companies?: string[];
  isPremium?: boolean;
  orderIndex: number;
};

type InterviewQuestionSeed = {
  collection: InterviewCollection;
  // Optional link to a concept — powers the concept page's Interview tab, which
  // queries by concept_id. Unlinked questions (null) still appear in their
  // collection on the Interview Prep pages (Features 30-31).
  conceptSlug?: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isPremium?: boolean;
  orderIndex: number;
};

type ProjectBriefSeed = {
  slug: string;
  // Build tab content is always concept-linked (unlike challenges, which can be
  // standalone) — every entry here must resolve to a real concept.
  conceptSlug: string;
  title: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  isPremium?: boolean;
  orderIndex: number;
};

type RoadmapSeed = {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  steps: string[];
};

// ── DB connection (same TLS pattern as drizzle.config.ts) ────────────────────

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: url.toString(),
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
});

const db = drizzle(pool);

// ── Concepts ──────────────────────────────────────────────────────────────────
// Full Phase 10 curriculum (build-plan.md, Features 40-48): 76 concepts across
// 8 categories, ordered easy → hard as taught. The 8 concepts that predate
// Phase 10 keep their original slug (URLs/FKs never change) but are renumbered
// to their new orderIndex here; react-rendering and
// aria-roles-and-semantic-html are additionally renamed per the approved
// curriculum doc (see progress-tracker.md → Decisions Made, Feature 40).

const CONCEPTS: ConceptSeed[] = [
  // ── javascript-runtime (14) ───────────────────────────────────────────────
  {
    slug: "hoisting-temporal-dead-zone",
    title: "Hoisting & the Temporal Dead Zone",
    description:
      "See how var, let, const, and function declarations are hoisted differently, and why accessing a let/const before its declaration throws inside the temporal dead zone.",
    category: "javascript-runtime",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "equality-type-coercion",
    title: "Equality & Type Coercion",
    description:
      "Learn how JavaScript's == operator coerces types before comparing, why === avoids the surprises, and the handful of coercion rules worth memorizing.",
    category: "javascript-runtime",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "closures",
    title: "Closures",
    description:
      "Understand how a function retains access to its defining scope's variables even after that scope has returned, and where closures show up in real code.",
    category: "javascript-runtime",
    difficulty: "beginner",
    orderIndex: 3,
  },
  {
    slug: "callbacks-higher-order-functions",
    title: "Callbacks & Higher-Order Functions",
    description:
      "Learn how functions that accept or return other functions power async APIs, event handlers, and the array methods you use every day.",
    category: "javascript-runtime",
    difficulty: "beginner",
    orderIndex: 4,
  },
  {
    slug: "array-object-methods-immutability",
    title: "Array & Object Methods, Immutability",
    description:
      "Master map, filter, reduce, and their object equivalents, and why returning new data instead of mutating in place keeps state predictable.",
    category: "javascript-runtime",
    difficulty: "beginner",
    orderIndex: 5,
  },
  {
    slug: "this-binding-execution-context",
    title: "this Binding & Execution Context",
    description:
      "Trace how this is determined at call time by regular calls, method calls, constructors, and explicit binding — and why arrow functions are the exception.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 6,
  },
  {
    slug: "prototypal-inheritance",
    title: "Prototypal Inheritance",
    description:
      "See how every object links to a prototype via [[Prototype]], how property lookup walks that chain, and what class/extends really compile down to.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 7,
  },
  {
    slug: "esm-vs-commonjs",
    title: "Modules: ESM vs. CommonJS",
    description:
      "Compare ES Modules' static import/export syntax to CommonJS's dynamic require, and why the difference matters for tree-shaking and interop.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 8,
  },
  {
    slug: "event-loop",
    title: "Event Loop",
    description:
      "Understand how JavaScript's single-threaded runtime handles async code via the call stack, task queue, and microtask queue.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 9,
  },
  {
    slug: "promises-async-await",
    title: "Promises & Async/Await",
    description:
      "Understand how Promises model a future value through pending/fulfilled/rejected states, and how async/await is syntax over that same mechanism.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 10,
  },
  {
    slug: "debouncing-throttling",
    title: "Debouncing & Throttling",
    description:
      "Learn the two standard fixes for handlers that fire too often — debounce waits for a pause, throttle caps the rate — and when to reach for each.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 11,
  },
  {
    slug: "function-composition-currying",
    title: "Function Composition & Currying",
    description:
      "See how composing small functions together and transforming multi-argument functions into chained single-argument calls leads to more reusable, pipeline-style code.",
    category: "javascript-runtime",
    difficulty: "advanced",
    orderIndex: 12,
  },
  {
    slug: "memory-management-leaks",
    title: "Memory Management & Leaks",
    description:
      "Understand how JavaScript's garbage collector reclaims unreachable objects, and the common patterns — stray closures, detached DOM nodes, forgotten listeners — that leak memory anyway.",
    category: "javascript-runtime",
    difficulty: "advanced",
    orderIndex: 13,
  },
  {
    slug: "generators-iterators",
    title: "Generators & Iterators",
    description:
      "Learn how function* and yield produce values lazily on demand, and how the iterator protocol powers for...of and the spread operator.",
    category: "javascript-runtime",
    difficulty: "advanced",
    orderIndex: 14,
  },

  // ── browser-internals (9) ─────────────────────────────────────────────────
  {
    slug: "dom-vs-bom",
    title: "DOM vs. BOM",
    description:
      "Distinguish the DOM (the page's content tree) from the BOM (the browser's own objects like window, location, and navigator) and what each actually exposes.",
    category: "browser-internals",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "event-delegation-bubbling-capturing",
    title: "Event Delegation, Bubbling & Capturing",
    description:
      "Trace how events bubble up and optionally capture down the DOM tree, and how one listener on a parent can handle events for all its children.",
    category: "browser-internals",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "storage-apis",
    title: "Storage APIs",
    description:
      "Compare localStorage, sessionStorage, cookies, and IndexedDB — their capacity, lifetime, and when each is the right tool for persisting client-side data.",
    category: "browser-internals",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 3,
  },
  {
    slug: "browser-rendering-pipeline",
    title: "Browser Rendering Pipeline",
    description:
      "Trace how a browser turns HTML and CSS into pixels: DOM, CSSOM, Render Tree, Layout, Paint, and Composite.",
    category: "browser-internals",
    difficulty: "intermediate",
    orderIndex: 4,
  },
  {
    slug: "cors-same-origin-policy",
    title: "CORS & the Same-Origin Policy",
    description:
      "Understand why the browser blocks cross-origin requests by default, what a preflight request checks, and how CORS headers opt back in safely.",
    category: "browser-internals",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "web-security-fundamentals",
    title: "Web Security Fundamentals (XSS, CSRF, CSP)",
    description:
      "Learn the three attacks every frontend has to defend against — XSS, CSRF, and clickjacking — and how CSP, sanitization, and same-site cookies stop them.",
    category: "browser-internals",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "the-network-stack",
    title: "The Network Stack (DNS → TCP → TLS → HTTP)",
    description:
      "Trace what actually happens between typing a URL and seeing a page: DNS resolution, the TCP handshake, TLS negotiation, and the HTTP request/response itself.",
    category: "browser-internals",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "service-workers-caching-strategies",
    title: "Service Workers & Caching Strategies",
    description:
      "See how a service worker intercepts network requests to enable offline support, and compare cache-first, network-first, and stale-while-revalidate strategies.",
    category: "browser-internals",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 8,
  },
  {
    slug: "web-workers-concurrency",
    title: "Web Workers & Concurrency",
    description:
      "Learn how Web Workers run JavaScript on a separate thread to keep expensive computation off the main thread, and how they communicate via postMessage.",
    category: "browser-internals",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 9,
  },

  // ── react (12) ────────────────────────────────────────────────────────────
  {
    slug: "jsx-virtual-dom",
    title: "JSX & the Virtual DOM",
    description:
      "See how JSX compiles down to React.createElement calls that build a lightweight Virtual DOM tree, the object React actually diffs on every render.",
    category: "react",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "usestate-useeffect-fundamentals",
    title: "useState & useEffect Fundamentals",
    description:
      "Learn the two hooks every component starts with — useState for local state, useEffect for synchronizing with something outside React — and their dependency-array rules.",
    category: "react",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "controlled-vs-uncontrolled-forms",
    title: "Forms: Controlled vs. Uncontrolled",
    description:
      "Compare form inputs whose value React owns via state (controlled) against inputs that manage their own value internally (uncontrolled via refs), and when to pick each.",
    category: "react",
    difficulty: "beginner",
    orderIndex: 3,
  },
  {
    slug: "useref-imperative-handles",
    title: "useRef & Imperative Handles",
    description:
      "Understand how useRef holds a mutable value across renders without triggering one, and how useImperativeHandle exposes an imperative API from a child component.",
    category: "react",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 4,
  },
  {
    slug: "context-api-prop-drilling",
    title: "Context API & Prop Drilling",
    description:
      "See how prop drilling forces data through components that don't need it, and how the Context API lets any descendant read shared state directly.",
    category: "react",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "react-rendering",
    title: "React Rendering & Reconciliation",
    description:
      "See how React's reconciler decides which components to re-render, diffs the Virtual DOM, and commits changes to the real DOM.",
    category: "react",
    difficulty: "intermediate",
    orderIndex: 6,
  },
  {
    slug: "component-composition-patterns",
    title: "Component Composition Patterns",
    description:
      "Compare render props, children, and compound components — three patterns for sharing behavior between components without prop drilling or inheritance.",
    category: "react",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "custom-hooks-composition",
    title: "Custom Hooks & Composition",
    description:
      "Learn how extracting a use* function lets you share stateful logic between components, and the rules that keep custom hooks composable.",
    category: "react",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 8,
  },
  {
    slug: "error-boundaries",
    title: "Error Boundaries",
    description:
      "See how an Error Boundary component catches render-time errors in its subtree and shows a fallback UI instead of crashing the whole app.",
    category: "react",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 9,
  },
  {
    slug: "render-performance-memoization",
    title: "Render Performance: memo, useMemo, useCallback",
    description:
      "Learn how React.memo, useMemo, and useCallback skip unnecessary re-renders and recalculations — and why profiling before adding them matters more than the APIs themselves.",
    category: "react",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 10,
  },
  {
    slug: "concurrent-react-suspense",
    title: "Concurrent React & Suspense",
    description:
      "Understand how Concurrent React lets rendering be interrupted and resumed, and how Suspense boundaries show a fallback while a component waits on data.",
    category: "react",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 11,
  },
  {
    slug: "state-management-tradeoffs",
    title: "State Management Tradeoffs",
    description:
      "Compare local state, Context, and external stores (Redux, Zustand, Jotai) for where shared state should live, and the tradeoffs of each as an app scales.",
    category: "react",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 12,
  },

  // ── css (10) ──────────────────────────────────────────────────────────────
  {
    slug: "the-box-model",
    title: "The Box Model",
    description:
      "Understand how every element's content, padding, border, and margin combine into its rendered box, and why box-sizing: border-box changes the math.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "units-sizing",
    title: "Units & Sizing",
    description:
      "Compare absolute units like px against relative ones like %, em, rem, vh/vw, and when each keeps layouts predictable and responsive.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "the-cascade-inheritance",
    title: "The Cascade & Inheritance",
    description:
      "Learn how the browser resolves competing styles through source order, specificity, and origin — the cascade — and which properties inherit from parent to child by default.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 3,
  },
  {
    slug: "css-specificity",
    title: "CSS Specificity",
    description:
      "Learn how browsers resolve competing CSS rules using the [id, class, element] specificity scoring system.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 4,
  },
  {
    slug: "flexbox-vs-grid",
    title: "Flexbox vs. Grid",
    description:
      "Compare Flexbox's one-dimensional alignment model to Grid's two-dimensional layout system, and how to pick the right tool for a given layout.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 5,
  },
  {
    slug: "positioning-stacking-contexts",
    title: "Positioning & Stacking Contexts",
    description:
      "Trace how position: relative/absolute/fixed/sticky place elements, and how z-index only compares within the same stacking context.",
    category: "css",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "responsive-design-container-queries",
    title: "Responsive Design & Container Queries",
    description:
      "Learn how media queries respond to the viewport while container queries respond to a component's own size — and why the latter makes components truly reusable.",
    category: "css",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "custom-properties-theming",
    title: "Custom Properties & Theming",
    description:
      "See how CSS custom properties (--variables) cascade and can be redefined per scope, powering runtime theming without a CSS-in-JS build step.",
    category: "css",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 8,
  },
  {
    slug: "pseudo-classes-pseudo-elements-has",
    title: "Selectors: Pseudo-classes, Pseudo-elements & :has()",
    description:
      "Compare pseudo-classes like :hover/:nth-child to pseudo-elements like ::before, and see how :has() finally lets CSS select a parent based on its children.",
    category: "css",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 9,
  },
  {
    slug: "animation-performance",
    title: "Animation Performance",
    description:
      "Understand why transform and opacity animate on the GPU compositor while properties like width or top trigger layout and paint, and cost far more.",
    category: "css",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 10,
  },

  // ── typescript (8) ────────────────────────────────────────────────────────
  {
    slug: "basic-types-inference",
    title: "Basic Types, Inference & any/unknown/never",
    description:
      "Learn how TypeScript infers types without annotations, and when to reach for any, unknown, or never — and why only one of them is safe to use often.",
    category: "typescript",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "interfaces-vs-type-aliases",
    title: "Interfaces vs. Type Aliases",
    description:
      "Compare interface and type for shaping objects — where they overlap, where declaration merging or unions push you toward one or the other.",
    category: "typescript",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "generics",
    title: "Generics",
    description:
      "See how generic type parameters let a function or type work across many concrete types while still catching mismatches at compile time.",
    category: "typescript",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 3,
  },
  {
    slug: "utility-types",
    title: "Utility Types (Partial, Pick, Omit, Record)",
    description:
      "Learn how Partial, Pick, Omit, and Record transform existing types instead of redefining them by hand, and how they compose together.",
    category: "typescript",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 4,
  },
  {
    slug: "type-narrowing",
    title: "Type Narrowing",
    description:
      "Use control-flow analysis, type guards, and discriminated unions to refine wide types to precise ones at compile time.",
    category: "typescript",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "discriminated-unions",
    title: "Discriminated Unions in Practice",
    description:
      "See how a shared literal type/kind field lets TypeScript narrow a union to the exact variant inside a conditional, eliminating a whole class of runtime checks.",
    category: "typescript",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "conditional-mapped-types",
    title: "Conditional & Mapped Types",
    description:
      "Learn how conditional types (T extends U ? X : Y) and mapped types ({ [K in keyof T]: ... }) let TypeScript compute new types from existing ones.",
    category: "typescript",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "template-literal-branded-types",
    title: "Template Literal & Branded Types",
    description:
      "See how template literal types build string types from patterns, and how branded types simulate nominal typing to stop structurally-identical values from being mixed up.",
    category: "typescript",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 8,
  },

  // ── accessibility (8) ─────────────────────────────────────────────────────
  {
    slug: "aria-roles-and-semantic-html",
    title: "Semantic HTML & ARIA Roles",
    description:
      "Make your UIs usable by everyone: learn when to use semantic HTML, when ARIA roles are needed, and what to never do.",
    category: "accessibility",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "accessible-images-media",
    title: "Accessible Images & Media",
    description:
      "Learn how to write meaningful alt text, when an image should be marked decorative instead, and how to caption and transcribe audio/video content.",
    category: "accessibility",
    difficulty: "beginner",
    orderIndex: 2,
  },
  {
    slug: "color-contrast-visual-accessibility",
    title: "Color Contrast & Visual Accessibility",
    description:
      "Understand WCAG's contrast ratio requirements for text and UI elements, and why color alone should never be the only way information is conveyed.",
    category: "accessibility",
    difficulty: "beginner",
    orderIndex: 3,
  },
  {
    slug: "keyboard-navigation-focus-management",
    title: "Keyboard Navigation & Focus Management",
    description:
      "Learn how tab order, focus traps, and visible focus indicators let a keyboard-only user operate every interactive element on a page.",
    category: "accessibility",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 4,
  },
  {
    slug: "accessible-forms",
    title: "Accessible Forms",
    description:
      "See how labels, error messaging, and aria-describedby connect a form control to the information a screen reader needs to announce it correctly.",
    category: "accessibility",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "aria-live-regions",
    title: "ARIA Live Regions",
    description:
      "Learn how aria-live announces dynamic content changes — toasts, form errors, loading states — to screen reader users without moving their focus.",
    category: "accessibility",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "accessible-component-patterns",
    title: "Accessible Component Patterns",
    description:
      "Compare the keyboard and ARIA requirements for modals, menus, and comboboxes — the widgets most commonly built inaccessibly from scratch.",
    category: "accessibility",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "automated-a11y-testing",
    title: "Automated a11y Testing (axe-core, Lighthouse)",
    description:
      "Learn what automated tools like axe-core and Lighthouse can and can't catch, and where manual keyboard/screen-reader testing still has to fill the gap.",
    category: "accessibility",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 8,
  },

  // ── performance (8) ───────────────────────────────────────────────────────
  {
    slug: "image-asset-optimization",
    title: "Image & Asset Optimization",
    description:
      "Learn how modern formats (WebP/AVIF), responsive srcset, and correct sizing cut image payload — usually the single biggest lever on page weight.",
    category: "performance",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "bundle-size-code-splitting",
    title: "Bundle Size & Code Splitting",
    description:
      "See how splitting a bundle by route or component lets the browser download only the code a page actually needs, and how to measure what's bloating it.",
    category: "performance",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 2,
  },
  {
    slug: "resource-loading-render-blocking",
    title: "Resource Loading & Render-Blocking",
    description:
      "Understand preload/prefetch/preconnect hints and async/defer script loading, and how each changes what the browser fetches early versus what it can defer.",
    category: "performance",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 3,
  },
  {
    slug: "core-web-vitals",
    title: "Core Web Vitals",
    description:
      "Measure and optimize LCP, INP, and CLS — Google's metrics for real-world page experience and search ranking.",
    category: "performance",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 4,
  },
  {
    slug: "list-virtualization",
    title: "List Virtualization",
    description:
      "See how windowing renders only the visible rows of a huge list, keeping the DOM node count — and scroll performance — constant regardless of list size.",
    category: "performance",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "profiling-with-devtools",
    title: "Profiling with DevTools",
    description:
      "Learn how to read a Performance panel flame chart and the React DevTools Profiler to find the actual bottleneck instead of guessing.",
    category: "performance",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "streaming-ssr-hydration",
    title: "Streaming SSR & Hydration",
    description:
      "Understand how streaming SSR sends the page shell immediately and streams in slower content, and how hydration attaches React's event handlers to that server-rendered HTML.",
    category: "performance",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "performance-budgets",
    title: "Performance Budgets",
    description:
      "Learn how setting hard limits on bundle size, load time, or Core Web Vitals scores in CI keeps performance from silently regressing over time.",
    category: "performance",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 8,
  },

  // ── system-design (7) ─────────────────────────────────────────────────────
  {
    slug: "component-driven-architecture",
    title: "Component-Driven Architecture",
    description:
      "See how building a UI from small, independently testable components — often backed by a shared design system — scales better than one big page-level component.",
    category: "system-design",
    difficulty: "intermediate",
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "api-design-data-fetching-strategy",
    title: "API Design & Data-Fetching Strategy",
    description:
      "Compare REST, GraphQL, and RPC-style APIs, and the client-side tradeoffs of fetching data on the server, on mount, or via a cache-aware library.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 2,
  },
  {
    slug: "designing-real-time-updates",
    title: "Designing Real-Time Updates (WebSockets, SSE, polling)",
    description:
      "Compare polling, Server-Sent Events, and WebSockets for pushing live updates to a client, and when each one's tradeoffs make it the right choice.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 3,
  },
  {
    slug: "designing-infinite-scroll-feed",
    title: "Designing an Infinite-Scroll Feed",
    description:
      "Design the pagination, caching, and scroll-position contract behind a feed that loads more content as the user scrolls, without janky re-fetches or lost position.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 4,
  },
  {
    slug: "designing-realtime-collaborative-editor",
    title: "Designing a Real-Time Collaborative Editor",
    description:
      "Design the conflict-resolution layer — Operational Transformation or CRDTs — behind a document multiple users can edit at once without corrupting each other's changes.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 5,
  },
  {
    slug: "frontend-architecture-patterns",
    title: "Frontend Architecture Patterns",
    description:
      "Compare component-driven, micro-frontend, and monorepo architectures and know when to use each at scale.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 6,
  },
  {
    slug: "state-management-at-scale",
    title: "State Management at Scale",
    description:
      "Compare how server state, UI state, and global app state should be layered differently as a frontend codebase and team both grow.",
    category: "system-design",
    difficulty: "advanced",
    isPremium: true,
    orderIndex: 7,
  },
];

// ── Challenges ────────────────────────────────────────────────────────────────

const CHALLENGES: ChallengeSeed[] = [
  {
    slug: "implement-debounce",
    companies: ["Google", "Uber"],
    conceptSlug: "debouncing-throttling",
    title: "Implement debounce",
    description: `**Debounce** delays running a function until the user *stops* triggering it. It's the standard fix for "this is firing way too often."

## The problem

Picture a search box that calls an API on every keystroke. Type **india** and you fire five requests — for \`i\`, \`in\`, \`ind\`, \`indi\`, \`india\` — but only the last one matters. The other four are wasted bandwidth and server load, and a slow earlier response can even land *after* the final one and overwrite it.

## The idea

A debounced function waits for quiet. Every new call **resets a timer**; the real work only runs once \`delay\` milliseconds pass with no new calls. Type fast, pause, and a single request fires.

## Your task

Write \`debounce(fn, delay)\` that returns a new function which:

- delays calling \`fn\` until \`delay\` ms have passed since the **last** call
- forwards the latest arguments and \`this\` to \`fn\`
- exposes a \`.cancel()\` method that throws away any pending call

\`\`\`js
const search = debounce((q) => fetch("/api?q=" + q), 300);
search("i"); search("in"); search("ind");
// only "ind" runs, 300ms after the last call
search.cancel(); // ...unless you cancel first
\`\`\`

> **Debounce vs throttle:** debounce waits for a pause (great for search, resize, autosave). Throttle runs at a steady maximum rate (great for scroll handlers). Different tools for different jobs.

Try it live in the playground below — type into the search box, then make your \`debounce\` cut the request count.`,
    difficulty: "easy",
    starterCode: `function debounce(fn, delay) {
  // your implementation here
}`,
    solutionCode: `function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}`,
    testCases: [
      { input: "called 3 times within delay", expected: "fn invoked once", label: "Coalesces rapid calls" },
      { input: "cancel() before delay expires", expected: "fn never invoked", label: "Cancel prevents invocation" },
      { input: "called after delay elapses", expected: "fn invoked", label: "Fires after full delay" },
    ],
    hints: [
      "Use setTimeout and clearTimeout to manage the timer.",
      "Store the timer ID in a closure variable so it's accessible on every call.",
      "The .cancel() method simply clears the stored timer ID.",
    ],
    orderIndex: 1,
  },
  {
    slug: "virtual-list",
    conceptSlug: "list-virtualization",
    title: "Virtualized list windowing",
    description: `**Virtualization** (or "windowing") renders a huge list at 60fps by only mounting the rows you can actually see — a few dozen, not thousands.

## The problem

Render 10,000 rows the naive way and the browser creates 10,000 DOM nodes. Every scroll, re-render, and layout has to walk all of them, so the page stutters and memory balloons — all to show about a dozen rows at a time.

## The idea

The screen only fits a handful of rows, so mount *only those* and swap them as the user scrolls. The trick is the **windowing math**: given the scroll position, which row indices are on screen right now? You keep one tall spacer the full height of the list (so the scrollbar stays honest) and absolutely-position the visible rows inside it.

## Your task

Write \`visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan)\` returning \`{ start, end }\` — the **inclusive** index range of rows to mount:

- the first visible row is \`Math.floor(scrollTop / rowHeight)\`
- the last is \`Math.floor((scrollTop + containerHeight) / rowHeight)\`
- pad the range by \`overscan\` rows on each side so fast scrolls don't flash blank
- clamp to \`[0, totalRows - 1]\` — never index past the list

\`\`\`js
visibleRange(0, 40, 400, 10000, 3)      // { start: 0, end: 13 }
visibleRange(4000, 40, 400, 10000, 3)   // { start: 97, end: 113 }
\`\`\`

> **Why overscan?** Rendering exactly the visible rows means a quick scroll can outrun React and flash empty space. A few buffer rows above and below hide the seam.

Scroll the list in the playground below — your window keeps the DOM-node count tiny no matter how far down you go.`,
    difficulty: "medium",
    starterCode: `function visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan) {
  // return { start, end } — inclusive row indices to render
  // clamp to [0, totalRows - 1] and include the overscan buffer
}`,
    solutionCode: `function visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan) {
  const first = Math.floor(scrollTop / rowHeight);
  const last = Math.floor((scrollTop + containerHeight) / rowHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(totalRows - 1, last + overscan);
  return { start, end };
}`,
    testCases: [
      {
        input: "visibleRange(0, 40, 400, 10000, 3)",
        expected: "{ start: 0, end: 13 }",
        label: "Initial window from the top",
      },
      {
        input: "visibleRange(4000, 40, 400, 10000, 3)",
        expected: "{ start: 97, end: 113 }",
        label: "Windowed mid-scroll with overscan",
      },
      {
        input: "visibleRange(399600, 40, 400, 10000, 3)",
        expected: "{ start: 9987, end: 9999 }",
        label: "Clamps at the end of the list",
      },
      {
        input: "end - start for any scrollTop",
        expected: "< 20 rows rendered",
        label: "Window stays tiny for 10,000 rows",
      },
    ],
    hints: [
      "The first visible row index is Math.floor(scrollTop / rowHeight).",
      "The last visible row is Math.floor((scrollTop + containerHeight) / rowHeight).",
      "Subtract overscan from start and add it to end to render a small buffer beyond the viewport.",
      "Clamp start with Math.max(0, ...) and end with Math.min(totalRows - 1, ...) so you never index past the list.",
    ],
    isPremium: true,
    orderIndex: 2,
  },
  {
    slug: "specificity-calculator",
    companies: ["Apple"],
    conceptSlug: "css-specificity",
    title: "CSS specificity calculator",
    description: `**Specificity** is how the browser breaks ties when several CSS rules target the same element. It's the answer to "why isn't my style applying?"

## The problem

Two rules set the same button's color — which wins? Not "the last one written" and not "the most code". The browser scores each selector and the higher score wins. Guess wrong and you reach for \`!important\`, which just moves the fight somewhere worse.

## The idea

Every selector gets a three-part score — **[id, class, element]** — counted most-powerful first:

- **id**: \`#cta\` → IDs
- **class**: \`.btn\`, \`[type="text"]\`, \`:hover\` → classes, attributes, and pseudo-classes
- **element**: \`button\`, \`::before\` → type selectors and pseudo-elements

Compare the tuples left to right: \`[1,0,0]\` (one ID) beats \`[0,2,0]\` (two classes), which beats \`[0,0,5]\` (five elements). The universal selector \`*\` and combinators (\`>\`, \`+\`, \`~\`) score nothing.

## Your task

Write \`specificity(selector)\` returning a \`[id, class, element]\` tuple:

\`\`\`js
specificity("#cta")             // [1, 0, 0]
specificity(".btn.primary")     // [0, 2, 0]
specificity("button#cta.btn")   // [1, 1, 1]
specificity("[type='text']")    // [0, 1, 0]
\`\`\`

> **One ID beats a hundred classes.** Specificity is compared column by column, never summed — \`[1,0,0]\` always wins over \`[0,99,0]\`. That's exactly why an ID selector is so hard to override.

Watch four selectors fight over one button in the playground below — your scoring crowns the winner.`,
    difficulty: "easy",
    starterCode: `function specificity(selector) {
  // returns [idCount, classCount, elementCount]
}`,
    solutionCode: `function specificity(selector) {
  let id = 0, cls = 0, el = 0;
  // remove attribute selectors before counting
  const s = selector.replace(/\\[[^\\]]*\\]/g, () => { cls++; return ''; });
  for (const part of s.split(/[ >+~]/)) {
    id  += (part.match(/#[a-zA-Z]/g) || []).length;
    cls += (part.match(/\\.[a-zA-Z]|:[^:]/g) || []).length;
    el  += (part.match(/^[a-zA-Z]|::[a-zA-Z]/g) || []).length;
  }
  return [id, cls, el];
}`,
    testCases: [
      { input: "#cta", expected: "[1,0,0]", label: "ID selector" },
      { input: ".btn.primary", expected: "[0,2,0]", label: "Two class selectors" },
      { input: "button#cta.btn", expected: "[1,1,1]", label: "Mixed selector" },
      { input: "[type='text']", expected: "[0,1,0]", label: "Attribute selector" },
    ],
    hints: [
      "Count `#word` for IDs, `.word` and `:pseudo-class` for classes, element names and `::pseudo-element` for elements.",
      "Attribute selectors `[...]` count as a class-level specificity — strip them first to avoid false matches.",
      "The universal selector `*` contributes 0 to all three counts.",
    ],
    orderIndex: 1,
  },
  {
    slug: "classify-hoisting-access",
    companies: ["Google"],
    conceptSlug: "hoisting-temporal-dead-zone",
    title: "Classify a hoisting access",
    description: `**Hoisting** determines whether code "sees" a declaration before its line runs — but *how* it sees it differs by declaration kind. This challenge tests that difference directly.

## The problem

\`var\`, \`let\`, and \`const\` are all hoisted, but reading them before their declaration line behaves completely differently — one quietly returns \`undefined\`, the other throws. Knowing which is which, from the actual runtime behavior rather than a rule you memorized, is the real skill.

## The idea

A function that reads a variable before its declaration line either throws a \`ReferenceError\` (a \`let\`/\`const\` still inside its temporal dead zone) or returns \`undefined\` (a \`var\`, hoisted and pre-initialized). Catching that difference at runtime is exactly how you'd classify it.

## Your task

Write \`classifyAccess(fn)\` that calls \`fn\` and classifies what happened:

- returns \`"tdz"\` if calling \`fn\` throws a \`ReferenceError\`
- returns \`"hoisted-undefined"\` if calling \`fn\` returns \`undefined\`
- returns \`"value"\` if calling \`fn\` returns anything else

\`\`\`js
classifyAccess(() => { const result = x; var x = 1; return result; });
// "hoisted-undefined" — var x is hoisted, but unassigned until its line runs

classifyAccess(() => { const result = y; let y = 1; return result; });
// throws before returning — classifyAccess catches it, returns "tdz"
\`\`\`

> **Why var and let disagree here:** both are hoisted to the top of their scope, but var is initialized to undefined immediately, while let stays uninitialized until its declaration line executes — reading it before that throws instead of quietly returning undefined.

Try it in the playground below — pass in functions that access variables before their declaration line, and watch which ones throw.`,
    difficulty: "easy",
    starterCode: `function classifyAccess(fn) {
  // call fn() and classify what happens:
  // "tdz" if it throws a ReferenceError
  // "hoisted-undefined" if it returns undefined
  // "value" if it returns anything else
}`,
    solutionCode: `function classifyAccess(fn) {
  try {
    const result = fn();
    return result === undefined ? "hoisted-undefined" : "value";
  } catch (e) {
    if (e instanceof ReferenceError) return "tdz";
    throw e;
  }
}`,
    testCases: [
      {
        input: "fn reads a `let` variable before its declaration line",
        expected: "\"tdz\"",
        label: "let/const before declaration throws inside the TDZ",
      },
      {
        input: "fn reads a `var` variable before its declaration line",
        expected: "\"hoisted-undefined\"",
        label: "var is hoisted and pre-initialized to undefined",
      },
      {
        input: "fn reads a variable after it's been assigned a value",
        expected: "\"value\"",
        label: "A normal read after assignment returns the real value",
      },
    ],
    hints: [
      "Wrap the call to fn() in a try/catch — a TDZ violation throws a real ReferenceError you can catch.",
      "Check `e instanceof ReferenceError` rather than matching on the error message, which can vary between engines.",
      "A hoisted-but-unassigned var reads as undefined, not an error — that's the case a plain try/catch alone won't distinguish without checking the return value.",
    ],
    orderIndex: 4,
  },
  {
    slug: "implement-loose-equals",
    companies: ["Amazon"],
    conceptSlug: "equality-type-coercion",
    title: "Implement loose equals",
    description: `JavaScript's \`==\` operator has a bad reputation, but its actual coercion rules are learnable — and implementing them yourself is the fastest way to stop being surprised by them.

## The problem

\`0 == false\`, \`'' == 0\`, and \`null == undefined\` all return \`true\`, for three different reasons. Most developers can recite "avoid ==" without being able to say *why* it behaves the way it does — which makes it hard to spot the one case (\`null\`/\`undefined\`) where it's actually useful.

## The idea

Loose equality coerces operands to a common type before comparing. For the primitive types you'll actually encounter, the rules boil down to: booleans convert to numbers first, then compare as numbers/strings; \`null\` and \`undefined\` are loosely equal only to each other; everything else falls back to strict comparison.

## Your task

Write \`looseEquals(a, b)\` that reproduces \`==\`'s behavior for \`number\`, \`string\`, \`boolean\`, \`null\`, and \`undefined\` — without using \`==\` anywhere in your implementation:

\`\`\`js
looseEquals(0, false);        // true
looseEquals('', false);       // true
looseEquals(null, undefined); // true
looseEquals(null, 0);         // false
looseEquals(1, '1');          // true
\`\`\`

> **The one legitimate use of \`==\`:** \`value == null\` is true for both \`null\` and \`undefined\` and false for everything else — including \`0\`, \`''\`, and \`false\`. That's the one loose-equality check worth writing on purpose.

Try it in the playground below against the same tricky pairs that trip up \`==\` in real code.`,
    difficulty: "easy",
    starterCode: `function looseEquals(a, b) {
  // reproduce == for number, string, boolean, null, and undefined —
  // without using == anywhere in your implementation
}`,
    solutionCode: `function looseEquals(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return (a === null || a === undefined) && (b === null || b === undefined);
  }
  if (typeof a === "boolean") return looseEquals(Number(a), b);
  if (typeof b === "boolean") return looseEquals(a, Number(b));
  if (typeof a === "number" && typeof b === "string") return a === Number(b);
  if (typeof a === "string" && typeof b === "number") return Number(a) === b;
  return a === b;
}`,
    testCases: [
      { input: "looseEquals(0, false)", expected: "true", label: "false coerces to 0" },
      { input: "looseEquals('', false)", expected: "true", label: "'' and false both coerce to 0" },
      {
        input: "looseEquals(null, undefined)",
        expected: "true",
        label: "null and undefined are loosely equal to each other",
      },
      {
        input: "looseEquals(null, 0)",
        expected: "false",
        label: "null is not loosely equal to anything except undefined",
      },
      { input: "looseEquals(1, '1')", expected: "true", label: "Numeric string coerces to a number" },
    ],
    hints: [
      "Handle null/undefined first, as a special pair-only case, before touching the other types.",
      "Coerce booleans to numbers (Number(true) === 1) and recurse — that reduces the boolean case to a number comparison you already handle.",
      "For the remaining number/string mismatch, convert the string side with Number(...) and compare as numbers.",
    ],
    orderIndex: 5,
  },
  {
    slug: "implement-once",
    companies: ["Meta"],
    conceptSlug: "closures",
    title: "Implement once",
    description: `Some functions should only ever do their real work the first time they're called — a closure is exactly the tool that makes that possible.

## The problem

Expensive setup code — initializing a connection, running a one-time migration, showing a "welcome" modal — should run exactly once, no matter how many times the wrapping function gets called. Re-running it on every call wastes work or, worse, causes visible bugs.

## The idea

Wrap the function in a closure that remembers two things across calls: whether it has already run, and what it returned. The first call does the real work and caches the result; every call after that skips straight to the cached value.

## Your task

Write \`once(fn)\` that returns a new function which:

- calls \`fn\` and returns its result on the **first** call
- returns that **same cached result** on every call after, without calling \`fn\` again
- forwards the arguments and \`this\` from the first call only

\`\`\`js
let calls = 0;
const init = once(() => { calls++; return "ready"; });
init(); // "ready", calls === 1
init(); // "ready", calls still === 1
\`\`\`

> **This is the same pattern as memoization**, just without needing to key the cache by arguments — once assumes the first call's result is valid forever, which is exactly right for one-time setup work.

Try it in the playground below and confirm the wrapped function's side effect only ever fires once.`,
    difficulty: "medium",
    starterCode: `function once(fn) {
  // return a function that calls fn on the first call only,
  // returning the cached result on every call after that
}`,
    solutionCode: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      result = fn.apply(this, args);
      called = true;
    }
    return result;
  };
}`,
    testCases: [
      {
        input: "called 3 times in a row",
        expected: "fn's body runs only once",
        label: "Only the first call runs the real function",
      },
      {
        input: "second and third calls",
        expected: "return the first call's cached result",
        label: "Later calls return the cached value, not a fresh one",
      },
      {
        input: "first call with arguments and a `this` context",
        expected: "forwarded correctly to fn",
        label: "Arguments and this are forwarded on the first call",
      },
    ],
    hints: [
      "Use two closure variables: a boolean flag and the cached result.",
      "Check the flag before calling fn — if it's already true, skip straight to returning the cached result.",
      "Use fn.apply(this, args) so the wrapped function still forwards its caller's `this`, not just the arguments.",
    ],
    orderIndex: 6,
  },
  {
    slug: "implement-my-map",
    companies: ["Airbnb"],
    conceptSlug: "callbacks-higher-order-functions",
    title: "Implement your own map",
    description: `\`Array.prototype.map\` looks like magic until you've built it yourself — underneath, it's just a loop and a callback.

## The problem

Every array method that takes a callback — \`map\`, \`filter\`, \`reduce\` — follows the same shape: loop over the array, call the callback with each item, and do something with what it returns. Understanding that shape is what turns "memorize the API" into "derive the API."

## The idea

\`map\` needs to call the callback once per item, in order, passing not just the value but also its index and the whole array (matching the real \`Array.prototype.map\` signature) — and collect the return values into a new array, without touching the original.

## Your task

Write \`myMap(array, callback)\` that behaves like \`Array.prototype.map\`:

- calls \`callback(value, index, array)\` for every item, in order
- collects each return value into a new array
- never mutates the original \`array\`

\`\`\`js
myMap([1, 2, 3], (n) => n * 2);              // [2, 4, 6]
myMap(["a", "b"], (v, i) => i + ":" + v);     // ["0:a", "1:b"]
\`\`\`

> **Why the index and array arguments matter:** real code leans on them more often than you'd expect — deduplicating by position, or referencing a sibling element in the same array from inside the callback.

Try it in the playground below — your implementation should be indistinguishable from the real \`.map()\`.`,
    difficulty: "easy",
    starterCode: `function myMap(array, callback) {
  // return a new array — call callback(value, index, array) for each item
}`,
    solutionCode: `function myMap(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i, array));
  }
  return result;
}`,
    testCases: [
      { input: "myMap([1, 2, 3], n => n * 2)", expected: "[2, 4, 6]", label: "Transforms every item" },
      {
        input: "myMap(['a','b'], (v, i) => i + ':' + v)",
        expected: "['0:a', '1:b']",
        label: "Passes index as the callback's second argument",
      },
      {
        input: "the original array, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input array",
      },
    ],
    hints: [
      "Loop with a plain for loop so you have easy access to the index.",
      "Call callback with three arguments — value, index, and the original array — matching the real Array.prototype.map signature.",
      "Push each callback result into a brand-new array; never assign back into the input array.",
    ],
    orderIndex: 7,
  },
  {
    slug: "implement-update-item",
    companies: ["Stripe"],
    conceptSlug: "array-object-methods-immutability",
    title: "Immutably update one item in a list",
    description: `Updating one item in a list without mutating the list — or the item — is the single most common immutability exercise, because it's the pattern behind almost every "edit" feature.

## The problem

You have a list of objects (todos, users, cart items) and need to change one field on one of them. Mutating the item directly (\`items[i].done = true\`) works, but it also silently mutates whatever else was holding a reference to that same array or object — a real bug in any code that expects unchanged data to stay unchanged.

## The idea

Find the matching item by id, build a **new** object for it by spreading the old one and overriding the changed fields, and return a **new** array with that new object swapped in — every other item stays exactly the same reference it was before.

## Your task

Write \`updateItem(items, id, changes)\` that:

- finds the item whose \`id\` matches
- returns a **new array** with that item shallow-merged with \`changes\`
- leaves every other item as the exact same reference as before
- never mutates \`items\` or any item inside it

\`\`\`js
const items = [{ id: 1, done: false }, { id: 2, done: false }];
updateItem(items, 1, { done: true });
// [{ id: 1, done: true }, { id: 2, done: false }]
\`\`\`

> **"Every other item stays the same reference" is the real test here** — it's easy to write a version that produces the right *values* but rebuilds every object, which defeats optimizations (like React's \`memo\`) that rely on unchanged references meaning unchanged data.

Try it in the playground below on a small todo list and confirm untouched items keep their identity.`,
    difficulty: "medium",
    starterCode: `function updateItem(items, id, changes) {
  // return a new array; the matching item is shallow-merged with changes;
  // every other item must be the exact same reference as before
}`,
    solutionCode: `function updateItem(items, id, changes) {
  return items.map((item) => (item.id === id ? { ...item, ...changes } : item));
}`,
    testCases: [
      {
        input: "updateItem([{id:1,done:false},{id:2,done:false}], 1, {done:true})",
        expected: "[{id:1,done:true},{id:2,done:false}]",
        label: "Merges changes into the matching item",
      },
      {
        input: "the non-matching item in the result",
        expected: "same object reference as the input",
        label: "Untouched items keep the exact same reference",
      },
      {
        input: "the original items array and its objects, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input array or any item",
      },
    ],
    hints: [
      "Array.prototype.map is the right tool — it already returns a new array without mutating the original.",
      "Only build a new object (via spread) for the item whose id matches; return every other item exactly as-is.",
      "Spread changes after the original item's properties so changes' values win on conflicting keys.",
    ],
    orderIndex: 8,
  },
  {
    slug: "implement-my-bind",
    companies: ["Uber"],
    conceptSlug: "this-binding-execution-context",
    title: "Implement your own bind",
    description: `\`.bind()\` looks like a built-in convenience method until you realize it's really just a closure holding onto a fixed \`this\` and a set of preset arguments.

## The problem

Passing a method as a bare callback (\`element.addEventListener('click', obj.method)\`) detaches it from \`obj\` — by the time it's called, there's no object to the left of a dot anymore, so \`this\` isn't what you expect. \`.bind()\` is the standard fix, but understanding *how* it fixes it requires understanding what it actually returns.

## The idea

\`.bind(context, ...presetArgs)\` doesn't call the function — it returns a **new function** that, whenever it's eventually called, calls the original function with \`this\` locked to \`context\`, ignoring however the new function itself was invoked.

## Your task

Write \`myBind(fn, context, ...presetArgs)\` that returns a new function which, when called:

- always calls \`fn\` with \`this\` set to \`context\`, regardless of how the returned function is invoked
- prepends \`presetArgs\` before any arguments passed at call time

\`\`\`js
function greet(greeting, punctuation) {
  return greeting + ", " + this.name + punctuation;
}
const bound = myBind(greet, { name: "Ada" }, "Hello");
bound("!"); // "Hello, Ada!"
\`\`\`

> **Why this matters beyond the polyfill:** the exact same idea — a closure capturing a fixed \`this\` — is what an arrow function does automatically for you, without needing an explicit \`.bind()\` call at all.

Try it in the playground below — detach a method from its object, bind it back, and confirm \`this\` stays correct.`,
    difficulty: "medium",
    starterCode: `function myBind(fn, context, ...presetArgs) {
  // return a new function that always calls fn with this = context,
  // prepending presetArgs before any arguments passed at call time
}`,
    solutionCode: `function myBind(fn, context, ...presetArgs) {
  return function (...callArgs) {
    return fn.apply(context, [...presetArgs, ...callArgs]);
  };
}`,
    testCases: [
      {
        input: "a bound method called as a bare function reference",
        expected: "this is still the original context",
        label: "this stays locked to context no matter how the bound function is called",
      },
      {
        input: "myBind(greet, {name:'Ada'}, 'Hello')('!')",
        expected: "'Hello, Ada!'",
        label: "Preset arguments are prepended before call-time arguments",
      },
      {
        input: "calling the bound function as a method of a different object",
        expected: "this is still the original context, not the new object",
        label: "Bound this cannot be overridden by a later method-style call",
      },
    ],
    hints: [
      "Return a regular function (not an arrow function) so you can use fn.apply inside it — the returned function's own this doesn't matter, only context does.",
      "Combine presetArgs and the call-time arguments into one array before calling apply.",
      "fn.apply(context, argsArray) is the one line doing all the real work here.",
    ],
    orderIndex: 9,
  },
  {
    slug: "implement-inherit",
    companies: ["Microsoft"],
    conceptSlug: "prototypal-inheritance",
    title: "Wire up prototypal inheritance",
    description: `Before \`class extends\` existed, setting up inheritance meant wiring the prototype chain by hand — and that's still exactly what \`extends\` compiles down to.

## The problem

Two constructor functions, \`Dog\` and \`Animal\`, need \`Dog\` instances to inherit \`Animal\`'s methods — without copying those methods onto every single instance, which would waste memory and break shared-method updates.

## The idea

Instead of copying methods, link the prototypes themselves: set \`Dog.prototype\`'s internal \`[[Prototype]]\` to \`Animal.prototype\`. Now any method lookup that misses on \`Dog.prototype\` automatically continues up the chain to \`Animal.prototype\`.

## Your task

Write \`inherit(Child, Parent)\` that wires up prototypal inheritance between two constructor functions:

- every instance of \`Child\` can call methods defined on \`Parent.prototype\`
- \`Child\`'s own prototype methods still take priority over \`Parent\`'s
- \`new Child() instanceof Parent\` is \`true\` afterward

\`\`\`js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound."; };

function Dog(name) { Animal.call(this, name); }
inherit(Dog, Animal);
Dog.prototype.speak = function () { return this.name + " barks."; };

new Dog("Rex").speak();          // "Rex barks."
new Dog("Rex") instanceof Animal; // true
\`\`\`

> **Why not just copy \`Parent.prototype\`'s methods onto \`Child.prototype\`?** Copying breaks the live link — a method added to \`Animal.prototype\` *after* \`inherit\` runs would never reach \`Dog\` instances. Linking the prototypes keeps that connection live.

Try it in the playground below — confirm \`Dog\`'s own methods win, and inherited methods still work.`,
    difficulty: "medium",
    starterCode: `function inherit(Child, Parent) {
  // wire Child.prototype's [[Prototype]] to Parent.prototype
}`,
    solutionCode: `function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}`,
    testCases: [
      {
        input: "a Dog instance calling an inherited Animal method",
        expected: "the inherited method runs correctly",
        label: "Inherited methods are reachable through the prototype chain",
      },
      {
        input: "a Dog instance calling a method defined on Dog.prototype after inherit() ran",
        expected: "Dog's own method wins over Animal's",
        label: "Child's own prototype methods take priority",
      },
      {
        input: "new Dog() instanceof Animal",
        expected: "true",
        label: "instanceof recognizes the prototype chain",
      },
    ],
    hints: [
      "Object.create(Parent.prototype) creates a new object whose [[Prototype]] is exactly Parent.prototype — that's the link you need.",
      "Assign the result to Child.prototype directly — don't just add properties to the existing Child.prototype.",
      "Reset Child.prototype.constructor back to Child afterward — Object.create's result doesn't have one pointing the right way.",
    ],
    orderIndex: 10,
  },
  {
    slug: "predict-execution-order",
    companies: ["Google", "TikTok"],
    conceptSlug: "event-loop",
    title: "Predict execution order",
    description: `Reasoning about execution order — sync code, then microtasks, then macrotasks — is the single most-tested event loop skill. This challenge turns that reasoning into a function instead of a guessing game.

## The problem

Given a pile of scheduled work — some synchronous, some microtasks (promise callbacks), some macrotasks (\`setTimeout\` callbacks) — predicting the actual console output order is exactly what event loop interview questions ask for. Getting it right means applying the event loop's rules mechanically, not guessing.

## The idea

The event loop's rule, simplified to one pass: **all synchronous work runs first, in order. Then the entire microtask queue drains, in order. Then macrotasks run one at a time, in order.** No task ever runs before the microtask queue is empty.

## Your task

Write \`predictOrder(actions)\` — given an array of \`{ id, type }\` where \`type\` is \`"sync"\`, \`"microtask"\`, or \`"macrotask"\`, return the array of \`id\`s in the order they'd actually execute:

- every \`"sync"\` action first, in their original relative order
- then every \`"microtask"\` action, in their original relative order
- then every \`"macrotask"\` action, in their original relative order

\`\`\`js
predictOrder([
  { id: "a", type: "macrotask" },
  { id: "b", type: "sync" },
  { id: "c", type: "microtask" },
  { id: "d", type: "sync" },
]);
// ["b", "d", "c", "a"]
\`\`\`

> **This is the classic \`console.log\` / \`setTimeout\` / \`Promise.then\` puzzle, generalized.** The Event Loop guide's worked example is exactly this pattern with 4 fixed actions — this challenge asks you to handle any list.

Try it in the playground below with a scrambled list and confirm your function reorders it correctly.`,
    difficulty: "medium",
    starterCode: `function predictOrder(actions) {
  // return the ids in actual execution order:
  // all "sync" first, then all "microtask", then all "macrotask" —
  // each group keeping its own original relative order
}`,
    solutionCode: `function predictOrder(actions) {
  const order = ["sync", "microtask", "macrotask"];
  return order.flatMap((type) =>
    actions.filter((action) => action.type === type).map((action) => action.id)
  );
}`,
    testCases: [
      {
        input: "a scrambled list with all 3 types mixed together",
        expected: "all sync ids first, then microtask ids, then macrotask ids — each in original order",
        label: "Reorders by type while preserving relative order within each type",
      },
      {
        input: "a list with no sync actions",
        expected: "microtask ids followed by macrotask ids",
        label: "Handles a missing category gracefully",
      },
      {
        input: "a list where every action is the same type",
        expected: "the original order, unchanged",
        label: "A single-type list is returned in its original order",
      },
    ],
    hints: [
      "Filter the array three times — once per type — rather than trying to sort it in one pass.",
      "The order to filter in is exactly the event loop's rule: sync, then microtask, then macrotask.",
      "Array.prototype.flatMap (or three separate filters concatenated) combines the three filtered groups back into one array.",
    ],
    orderIndex: 11,
  },
  {
    slug: "implement-promise-all",
    companies: ["Meta", "Amazon"],
    conceptSlug: "promises-async-await",
    title: "Implement your own Promise.all",
    description: `\`Promise.all\` looks like a black box until you build it — underneath, it's just counting settled promises and failing fast on the first rejection.

## The problem

You need to run several async operations concurrently and wait for all of them, but only if every single one succeeds — a single failure should reject immediately, not wait for the slower ones to finish first.

## The idea

Start every promise immediately (they're already running by the time you receive them — a promise represents work already in progress). Track how many have resolved and store each result at its original index; resolve the moment every one has resolved, or reject immediately the moment any one rejects.

## Your task

Write \`myPromiseAll(promises)\` that mimics \`Promise.all\`:

- resolves with an array of results, in the **same order** as the input, once every promise resolves
- rejects immediately with the first rejection reason encountered, without waiting for the others
- resolves with \`[]\` immediately if \`promises\` is empty

\`\`\`js
myPromiseAll([Promise.resolve(1), Promise.resolve(2)]); // resolves [1, 2]
myPromiseAll([Promise.resolve(1), Promise.reject("no")]); // rejects "no"
\`\`\`

> **Why order matters here too:** promises can settle in any order depending on timing, but the result array must always match the *input* order — the same requirement the event-loop category's async task runner project has, for the same underlying reason.

Try it in the playground below with a mix of fast and slow promises, and one that rejects.`,
    difficulty: "hard",
    starterCode: `function myPromiseAll(promises) {
  // return a Promise that resolves with results in input order once all
  // resolve, or rejects immediately with the first rejection reason
}`,
    solutionCode: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((value) => {
          results[i] = value;
          remaining -= 1;
          if (remaining === 0) resolve(results);
        })
        .catch(reject);
    });
  });
}`,
    testCases: [
      {
        input: "myPromiseAll([Promise.resolve(1), Promise.resolve(2)])",
        expected: "resolves with [1, 2]",
        label: "Resolves with all results in input order",
      },
      {
        input: "one promise resolves slower than another",
        expected: "result order still matches input order, not resolution order",
        label: "Result order matches input order regardless of timing",
      },
      {
        input: "myPromiseAll([Promise.resolve(1), Promise.reject('no')])",
        expected: "rejects with 'no'",
        label: "Rejects immediately with the first rejection reason",
      },
      {
        input: "myPromiseAll([])",
        expected: "resolves with []",
        label: "An empty input resolves immediately with an empty array",
      },
    ],
    hints: [
      "Wrap everything in `new Promise((resolve, reject) => { ... })` — you're building a Promise, not just chaining one.",
      "Store each result at its own index (results[i] = value) inside the .then callback, so order is preserved regardless of which promise settles first.",
      "Call reject as soon as any promise rejects — don't wait to check the others.",
    ],
    orderIndex: 12,
  },
  {
    slug: "implement-curry",
    companies: ["Stripe"],
    conceptSlug: "function-composition-currying",
    title: "Implement a generic curry",
    description: `A generic \`curry\` function is one of the more genuinely hard interview challenges — it has to work for *any* function, of *any* arity, without knowing in advance how many arguments it needs.

## The problem

Manually curried functions (\`a => b => c => ...\`) work, but writing that by hand for every function is tedious, and it hardcodes the arity. A generic \`curry(fn)\` should take any function and make it callable either all at once, or one (or several) arguments at a time.

## The idea

\`curry(fn)\` needs to know how many arguments \`fn\` expects — \`fn.length\` gives you that. Each returned function collects arguments until it has at least that many; once it does, it calls the original function with all of them. Until then, it returns another function that keeps collecting.

## Your task

Write \`curry(fn)\` that returns a curried version of \`fn\`, callable with any grouping of arguments:

- calling it with all of \`fn\`'s arguments at once calls \`fn\` immediately
- calling it with fewer arguments returns a new function that collects the rest
- arguments can be supplied in any grouping — one at a time, a few at a time, or all at once

\`\`\`js
function add(a, b, c) { return a + b + c; }
const curried = curry(add);

curried(1)(2)(3);   // 6
curried(1, 2)(3);   // 6
curried(1)(2, 3);   // 6
curried(1, 2, 3);   // 6
\`\`\`

> **\`fn.length\` is the key trick here** — it reports a function's declared parameter count, which is exactly how \`curry\` knows when enough arguments have been collected to actually call \`fn\`, without you having to specify the arity separately.

Try it in the playground below — curry a 3-argument function and call it with every grouping shown above.`,
    difficulty: "hard",
    starterCode: `function curry(fn) {
  // return a curried version of fn, callable with arguments in any grouping
  // until fn.length arguments have been collected in total
}`,
    solutionCode: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
}`,
    testCases: [
      { input: "curried(1)(2)(3) for a 3-arg function", expected: "6", label: "One argument at a time" },
      { input: "curried(1, 2)(3) for a 3-arg function", expected: "6", label: "A partial group, then the rest" },
      { input: "curried(1, 2, 3) for a 3-arg function", expected: "6", label: "All arguments at once still works" },
      {
        input: "curried(1)(2, 3) for a 3-arg function",
        expected: "6",
        label: "Any grouping of arguments produces the same result",
      },
    ],
    hints: [
      "fn.length tells you how many parameters fn declares — that's the total argument count you're collecting toward.",
      "Each intermediate function needs to return a new function that remembers the arguments collected so far, via closure.",
      "Compare the accumulated argument count to fn.length on every call — once it's enough, call fn; otherwise, keep collecting.",
    ],
    isPremium: true,
    orderIndex: 13,
  },
  {
    slug: "implement-take",
    companies: ["Netflix"],
    conceptSlug: "generators-iterators",
    title: "Implement take for lazy iterables",
    description: `Generators are lazy by nature, which makes them the only reasonable way to work with a sequence that might be infinite — as long as whatever consumes them knows to stop asking.

## The problem

An infinite generator (an endless sequence of natural numbers, an endless stream of retry attempts) is only safe to use if you only ever pull a bounded number of values from it. Doing that safely — for any iterable, not just a specific generator — needs one small, reusable utility.

## The idea

\`take\` doesn't know or care whether the iterable it's given is finite or infinite. It just keeps pulling values until it's collected the requested count, or the iterable itself runs out first — whichever comes first.

## Your task

Write \`take(iterable, count)\` that lazily takes the first \`count\` values from any iterable and returns them as an array:

- works correctly on both finite and infinite generators
- stops after collecting \`count\` values, without over-consuming the iterable
- returns fewer than \`count\` values if the iterable runs out first

\`\`\`js
function* naturalNumbers() {
  let n = 1;
  while (true) yield n++;
}

take(naturalNumbers(), 5); // [1, 2, 3, 4, 5]
take([10, 20], 5);         // [10, 20] — the array runs out first
\`\`\`

> **Why this has to use the iterator protocol directly (or \`for...of\`'s break), not \`[...iterable]\`:** spreading an infinite generator into an array would never finish — you must pull values one at a time and stop yourself once you have enough.

Try it in the playground below against an infinite generator — confirm it returns instantly instead of hanging.`,
    difficulty: "hard",
    starterCode: `function take(iterable, count) {
  // return an array of the first \`count\` values from iterable —
  // must work on infinite generators without hanging
}`,
    solutionCode: `function take(iterable, count) {
  const result = [];
  for (const value of iterable) {
    if (result.length >= count) break;
    result.push(value);
  }
  return result;
}`,
    testCases: [
      {
        input: "take(naturalNumbers(), 5) against an infinite generator",
        expected: "[1, 2, 3, 4, 5]",
        label: "Takes exactly `count` values from an infinite sequence without hanging",
      },
      {
        input: "take([10, 20], 5) against a finite iterable shorter than count",
        expected: "[10, 20]",
        label: "Returns fewer than count if the iterable runs out first",
      },
      {
        input: "take(naturalNumbers(), 0)",
        expected: "[]",
        label: "count of 0 returns an empty array immediately",
      },
    ],
    hints: [
      "for...of works on any iterable, generators included — and break stops pulling further values immediately.",
      "Never spread an infinite iterable directly ([...iterable]) — that will hang forever trying to exhaust it.",
      "Check result.length against count inside the loop, before pushing the next value, then break as soon as you have enough.",
    ],
    isPremium: true,
    orderIndex: 14,
  },
  {
    slug: "find-leaked-listeners",
    companies: ["Adobe"],
    conceptSlug: "memory-management-leaks",
    title: "Detect leaked event listeners",
    description: `Not every memory leak needs a heap snapshot to catch — the most common one (a forgotten \`removeEventListener\`) is really just a bookkeeping problem, and bookkeeping problems are exactly what code can check for you automatically.

## The problem

Every \`addEventListener\` call needs a matching \`removeEventListener\` once the listener is no longer needed — miss one, and that listener (and everything its closure references) stays reachable forever. In a codebase with hundreds of \`addEventListener\` calls, spotting the one missing its cleanup by reading code alone is exactly the kind of thing that's easy to miss and expensive to debug later.

## The idea

Treat every add/remove call as an event in a log, in the order it happened. An id is "leaked" if, by the end of the log, it's been added more times than it's been removed — the same id can legitimately be added and removed multiple times (a component that mounts and unmounts repeatedly), so a leak is about the final imbalance, not just "was remove ever called at all."

## Your task

Write \`findLeakedListeners(events)\` — given an array of \`{ type: 'add' | 'remove', id }\` in chronological order, return the \`id\`s that are still leaked (added more times than removed), in the order each was first added:

\`\`\`js
findLeakedListeners([
  { type: "add", id: "resize" },
  { type: "add", id: "scroll" },
  { type: "remove", id: "resize" },
]);
// ["scroll"] — resize was cleanly removed, scroll never was
\`\`\`

- an id added and removed the same number of times is **not** leaked
- an id added more times than it's been removed **is** leaked, even if it's been removed at least once
- ids appear in the result in the order they were first added, not the order they leaked

> **Why count instead of just checking "was remove ever called":** a component that mounts twice without unmounting in between calls \`addEventListener\` twice — if it only ever calls \`removeEventListener\` once, one listener is still leaked, even though \`remove\` technically ran. Counting is what catches that; a boolean "was it ever removed" check would miss it entirely.

Once this passes, imagine wiring it up to a real app's dev-mode logger that records every add/remove call and warns about any id still leaked when the page unloads.`,
    difficulty: "medium",
    starterCode: `function findLeakedListeners(events) {
  // return the ids with more "add" events than "remove" events,
  // in the order each id was first added
}`,
    solutionCode: `function findLeakedListeners(events) {
  const counts = new Map();
  const order = [];
  for (const { type, id } of events) {
    if (!counts.has(id)) {
      counts.set(id, 0);
      order.push(id);
    }
    counts.set(id, counts.get(id) + (type === "add" ? 1 : -1));
  }
  return order.filter((id) => counts.get(id) > 0);
}`,
    testCases: [
      {
        input: "'resize' added then removed, 'scroll' added but never removed",
        expected: "['scroll']",
        label: "An id removed the same number of times it was added is not leaked",
      },
      {
        input: "an id added twice and removed twice",
        expected: "not included in the result",
        label: "Balanced add/remove counts are never leaked, no matter how many times",
      },
      {
        input: "an id added twice but removed only once",
        expected: "included in the result",
        label: "A net imbalance is leaked, even if remove was called at least once",
      },
      {
        input: "an empty events array",
        expected: "[]",
        label: "No events means nothing is leaked",
      },
    ],
    hints: [
      "Track a running count per id — increment on 'add', decrement on 'remove' — rather than just a boolean 'was it removed'.",
      "Record each id's first-seen order separately from its count, so the result can be sorted by that even after counts change.",
      "An id is leaked if its final count is greater than 0 — zero (or negative) means it's been fully, or over-, cleaned up.",
    ],
    isPremium: true,
    orderIndex: 15,
  },

  // ── Phase 10 (Feature 42) — Browser Internals ─────────────────────────────
  {
    slug: "classify-dom-vs-bom",
    conceptSlug: "dom-vs-bom",
    title: "Classify DOM vs. BOM References",
    description: `Build the classifier behind a "what am I actually touching" linter rule — given a JavaScript API reference as a string, decide whether it's DOM or BOM.

## The problem

\`document\` and \`window\` get used interchangeably in casual code (\`window.document.title\` vs. \`document.title\`), which hides a real distinction: one reference touches page *content*, the other touches the *browser environment* around it. A linter or debug tool that wants to flag "you're reaching into browser state here, not page content" needs a reliable way to tell the two apart from the reference string alone.

## The idea

- Anything reached through \`document\` — with or without a leading \`window.\` — is the **DOM**.
- Anything reached through \`window\`'s other properties — \`location\`, \`navigator\`, \`history\`, \`screen\` — with or without the \`window.\` prefix, is the **BOM**.

## Your task

Write \`classifyApi(reference)\` that returns \`'dom'\` or \`'bom'\` for a reference like \`"document.querySelector"\` or \`"window.location"\`.`,
    difficulty: "easy",
    starterCode: `function classifyApi(reference) {
  // strip a leading "window." if present, then classify the root object
}`,
    solutionCode: `function classifyApi(reference) {
  const stripped = reference.startsWith("window.") ? reference.slice("window.".length) : reference;
  const root = stripped.split(".")[0];
  return root === "document" ? "dom" : "bom";
}`,
    testCases: [
      { input: `"document.querySelector"`, expected: `"dom"`, label: "A direct document reference is DOM" },
      { input: `"window.document.body"`, expected: `"dom"`, label: "window.document is still DOM, not BOM" },
      { input: `"window.location"`, expected: `"bom"`, label: "window.location is BOM" },
      { input: `"navigator.userAgent"`, expected: `"bom"`, label: "A direct navigator reference is BOM" },
      { input: `"history.pushState"`, expected: `"bom"`, label: "A direct history reference is BOM" },
    ],
    hints: [
      "Strip a leading \"window.\" first, since document/location/navigator/history are equally valid with or without it.",
      "Only the root object before the first \".\" matters for classification.",
    ],
    isPremium: false,
    orderIndex: 16,
  },
  {
    slug: "event-propagation-order",
    conceptSlug: "event-delegation-bubbling-capturing",
    title: "Compute Event Propagation Order",
    description: `Build the logic behind a browser DevTools-style "event listener trace" — given a DOM path and a set of registered listeners, compute the exact order they actually fire in.

## The problem

"Why did my outside-click handler run before the button's own onClick?" is a question every frontend engineer eventually has to debug by hand — and the answer always comes down to which phase each listener was registered for, not just where it sits in the tree.

## The idea

An event travels in three phases:

1. **Capture** — root to target's parent, only nodes with a \`"capture"\` listener fire, in root-to-parent order
2. **Target** — the target's own listener fires, if it has one
3. **Bubble** — target's parent back to root, only nodes with a \`"bubble"\` listener fire, in parent-to-root order

## Your task

Write \`getEventOrder(path, listeners)\` — \`path\` is an array of ids from root to target (target last); \`listeners\` is an object mapping id → \`"capture"\` or \`"bubble"\`. Return the array of ids in the order their listener actually fires.`,
    difficulty: "easy",
    starterCode: `function getEventOrder(path, listeners) {
  // path: [root, ..., target]. listeners: { [id]: "capture" | "bubble" }
}`,
    solutionCode: `function getEventOrder(path, listeners) {
  const target = path[path.length - 1];
  const ancestors = path.slice(0, -1);
  const order = [];

  for (const id of ancestors) {
    if (listeners[id] === "capture") order.push(id);
  }
  if (listeners[target]) order.push(target);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (listeners[ancestors[i]] === "bubble") order.push(ancestors[i]);
  }
  return order;
}`,
    testCases: [
      {
        input: `["document","list","item"], { document: "bubble", list: "bubble", item: "bubble" }`,
        expected: `["item","list","document"]`,
        label: "All-bubble listeners fire target-first, then bottom-up",
      },
      {
        input: `["document","list","item"], { document: "capture", item: "bubble" }`,
        expected: `["document","item"]`,
        label: "A capture listener on an ancestor fires before the target",
      },
      {
        input: `["document","section","list","item"], { section: "bubble", list: "bubble", item: "bubble" }`,
        expected: `["item","list","section"]`,
        label: "Among bubble ancestors, the deepest fires before the shallower one",
      },
      {
        input: `["document","app","button"], { app: "capture", document: "bubble" }`,
        expected: `["app","document"]`,
        label: "A target with no listener of its own contributes nothing, but ancestors still fire correctly",
      },
    ],
    hints: [
      "Split the path into the target (last element) and its ancestors (everything before it).",
      "Capture-phase ancestors fire root-to-parent order; bubble-phase ancestors fire parent-to-root — the reverse.",
      "The target's own listener always fires between the capture and bubble phases, regardless of which phase key it's stored under.",
    ],
    isPremium: false,
    orderIndex: 17,
  },
  {
    slug: "pick-storage-mechanism",
    conceptSlug: "storage-apis",
    title: "Build a Storage Mechanism Chooser",
    description: `Build the decision logic behind a "which storage API should I use" helper — the kind of function a team lints for instead of relying on every developer remembering the tradeoffs.

## The problem

Four different client-side storage mechanisms exist, and picking the wrong one is rarely a crash — it's a silent correctness or performance bug (a synchronous \`localStorage\` write janking the page, or a cookie leaking a large token onto every image request).

## The idea

Given a set of requirements, decide which mechanism actually fits, in priority order:

1. If the data must be sent with every request automatically → **cookie**
2. Else if it shouldn't outlive the current tab → **sessionStorage**
3. Else if it's small enough for simple key/value storage → **localStorage**
4. Otherwise (large or needs structured storage) → **indexedDB**

## Your task

Write \`pickStorage(requirements)\` — given \`{ persistAcrossSessions, capacityKB, sendWithEveryRequest }\`, return the mechanism name as a string.`,
    difficulty: "medium",
    starterCode: `function pickStorage(requirements) {
  // { persistAcrossSessions: boolean, capacityKB: number, sendWithEveryRequest: boolean }
}`,
    solutionCode: `function pickStorage(requirements) {
  const { persistAcrossSessions, capacityKB, sendWithEveryRequest } = requirements;
  if (sendWithEveryRequest) return "cookie";
  if (!persistAcrossSessions) return "sessionStorage";
  if (capacityKB > 5000) return "indexedDB";
  return "localStorage";
}`,
    testCases: [
      {
        input: `{ persistAcrossSessions: true, capacityKB: 1, sendWithEveryRequest: true }`,
        expected: `"cookie"`,
        label: "Anything the server needs on every request is a cookie, regardless of other fields",
      },
      {
        input: `{ persistAcrossSessions: false, capacityKB: 10, sendWithEveryRequest: false }`,
        expected: `"sessionStorage"`,
        label: "Data that shouldn't outlive the tab is sessionStorage",
      },
      {
        input: `{ persistAcrossSessions: true, capacityKB: 100, sendWithEveryRequest: false }`,
        expected: `"localStorage"`,
        label: "Small persistent data is localStorage",
      },
      {
        input: `{ persistAcrossSessions: true, capacityKB: 20000, sendWithEveryRequest: false }`,
        expected: `"indexedDB"`,
        label: "Large persistent data is indexedDB",
      },
    ],
    hints: [
      "Check sendWithEveryRequest first — it overrides every other consideration.",
      "5000KB (~5MB) is a reasonable cutoff for what localStorage should hold before indexedDB is the right call.",
    ],
    isPremium: true,
    orderIndex: 18,
  },
  {
    slug: "classify-style-change",
    conceptSlug: "browser-rendering-pipeline",
    title: "Classify a CSS Property's Pipeline Cost",
    description: `Build the classifier behind a "why is my animation janky" audit tool — given a CSS property name, determine which rendering pipeline stage changing it actually triggers.

## The problem

Not every CSS property costs the same to animate. Animating \`top\` and animating \`transform\` look similar in code but have wildly different performance profiles — one re-triggers layout on every frame, the other doesn't. Telling them apart programmatically is the first step to catching a janky animation before it ships.

## The idea

- **Layout** properties change geometry — \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`, \`font-size\`, \`display\`
- **Paint** properties change appearance without moving anything — \`color\`, \`background\`, \`box-shadow\`, \`visibility\`
- **Composite** properties are handled entirely by the GPU — \`transform\`, \`opacity\`

## Your task

Write \`classifyStyleChange(property)\` returning the cheapest accurate classification: \`'layout'\`, \`'paint'\`, or \`'composite'\`.`,
    difficulty: "medium",
    starterCode: `function classifyStyleChange(property) {
  // return 'layout' | 'paint' | 'composite'
}`,
    solutionCode: `function classifyStyleChange(property) {
  const LAYOUT = ["width", "height", "top", "left", "right", "bottom", "margin", "font-size", "display"];
  const COMPOSITE = ["transform", "opacity"];
  if (COMPOSITE.includes(property)) return "composite";
  if (LAYOUT.includes(property)) return "layout";
  return "paint";
}`,
    testCases: [
      { input: `"width"`, expected: `"layout"`, label: "width triggers layout" },
      { input: `"display"`, expected: `"layout"`, label: "display triggers layout" },
      { input: `"color"`, expected: `"paint"`, label: "color is paint-only" },
      { input: `"visibility"`, expected: `"paint"`, label: "visibility is paint-only, unlike display" },
      { input: `"transform"`, expected: `"composite"`, label: "transform is composite-only" },
      { input: `"opacity"`, expected: `"composite"`, label: "opacity is composite-only" },
    ],
    hints: [
      "Check the composite-only list first — transform and opacity are the cheapest, so they should never fall through to layout/paint.",
      "Anything not explicitly layout or composite is safely classified as paint.",
    ],
    isPremium: false,
    orderIndex: 19,
  },
  {
    slug: "evaluate-cors-request",
    conceptSlug: "cors-same-origin-policy",
    title: "Build a CORS Request Evaluator",
    description: `Build the logic a browser DevTools "why did my request fail CORS" panel would need — given a request and a server's CORS configuration, work out whether a preflight happens and whether the request ultimately succeeds.

## The problem

"CORS error" in the console rarely explains *why* — was it a missing header on the server's allow-list, a method that needed a preflight, or the origin itself never being allowed? Reproducing the browser's actual decision logic is the only way to answer that with certainty instead of guessing.

## The idea

- A request needs a **preflight** if its method isn't \`GET\`/\`HEAD\`/\`POST\`, or it carries any header outside the simple set (\`accept\`, \`accept-language\`, \`content-language\`, \`content-type\`).
- The request is **allowed** only if the origin matches the server's \`allowOrigin\` (or it's \`'*'\`) — and, when a preflight is required, only if the method and every header are also on the server's allow-lists.

## Your task

Write \`evaluateCorsRequest(request, serverConfig)\` returning \`{ preflightRequired, allowed }\`.`,
    difficulty: "medium",
    starterCode: `function evaluateCorsRequest(request, serverConfig) {
  // request: { method, headers: string[], origin }
  // serverConfig: { allowOrigin, allowMethods: string[], allowHeaders: string[] }
}`,
    solutionCode: `function evaluateCorsRequest(request, serverConfig) {
  const SIMPLE_METHODS = ["GET", "HEAD", "POST"];
  const SIMPLE_HEADERS = ["accept", "accept-language", "content-language", "content-type"];

  const preflightRequired =
    !SIMPLE_METHODS.includes(request.method) ||
    request.headers.some((h) => !SIMPLE_HEADERS.includes(h.toLowerCase()));

  const originAllowed = serverConfig.allowOrigin === "*" || serverConfig.allowOrigin === request.origin;
  if (!originAllowed) return { preflightRequired, allowed: false };

  if (preflightRequired) {
    const methodAllowed = serverConfig.allowMethods.includes(request.method);
    const headersAllowed = request.headers.every((h) =>
      serverConfig.allowHeaders.some((a) => a.toLowerCase() === h.toLowerCase()),
    );
    return { preflightRequired: true, allowed: methodAllowed && headersAllowed };
  }

  return { preflightRequired: false, allowed: true };
}`,
    testCases: [
      {
        input: `{method:"GET",headers:[],origin:"https://app.com"}, {allowOrigin:"*",allowMethods:[],allowHeaders:[]}`,
        expected: `{ preflightRequired: false, allowed: true }`,
        label: "A simple GET with a wildcard origin needs no preflight and is allowed",
      },
      {
        input: `{method:"PUT",headers:[],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["PUT"],allowHeaders:[]}`,
        expected: `{ preflightRequired: true, allowed: true }`,
        label: "A PUT request needs a preflight, and is allowed when the method is on the allow-list",
      },
      {
        input: `{method:"PUT",headers:[],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["GET"],allowHeaders:[]}`,
        expected: `{ preflightRequired: true, allowed: false }`,
        label: "Needing a preflight isn't enough — the method must actually be on the allow-list",
      },
      {
        input: `{method:"GET",headers:[],origin:"https://evil.com"}, {allowOrigin:"https://app.com",allowMethods:[],allowHeaders:[]}`,
        expected: `{ preflightRequired: false, allowed: false }`,
        label: "A mismatched origin is blocked even for a simple request",
      },
      {
        input: `{method:"GET",headers:["Authorization"],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["GET"],allowHeaders:["Authorization"]}`,
        expected: `{ preflightRequired: true, allowed: true }`,
        label: "A custom header forces a preflight even on a GET request",
      },
    ],
    hints: [
      "Check the origin match first — an origin mismatch blocks the request regardless of method or headers.",
      "The simple-method and simple-header sets are what determine whether a preflight is needed at all.",
      "Header comparisons should be case-insensitive, matching real HTTP header semantics.",
    ],
    isPremium: true,
    orderIndex: 20,
  },
  {
    slug: "sanitize-html-input",
    conceptSlug: "web-security-fundamentals",
    title: "Build an HTML Sanitizer",
    description: `Build the sanitizer that sits between untrusted user input and \`innerHTML\` — the last line of defense before a comment, bio, or markdown field becomes an XSS vector.

## The problem

Any feature that renders user-submitted content as HTML (rich-text comments, profile bios) is one \`innerHTML\` call away from executing whatever an attacker typed — a \`<script>\` tag, an \`onerror\` attribute, a \`javascript:\` link. Stripping just one of these isn't enough; all three are common, real injection vectors on their own.

## The idea

Strip the three most common XSS vectors from an HTML string, before it's ever rendered:

1. \`<script>...</script>\` blocks entirely
2. Any \`on*\` event handler attribute (\`onerror\`, \`onclick\`, ...)
3. \`javascript:\` URLs in \`href\`/\`src\` attributes — replace with \`"#"\`

## Your task

Write \`sanitizeHtml(input)\` returning the cleaned string, leaving already-safe markup untouched.

> **This is a teaching exercise, not a production sanitizer.** Regex can't reliably parse HTML — malformed tags, unusual nesting, and encoding tricks can all slip past a hand-rolled pattern like this one. A real app should sanitize untrusted HTML with a battle-tested library (e.g. DOMPurify), never a regex like the one you're about to write.`,
    difficulty: "hard",
    starterCode: `function sanitizeHtml(input) {
  // strip <script> blocks, on* attributes, and javascript: URLs
}`,
    solutionCode: `function sanitizeHtml(input) {
  let out = input.replace(/<script[\\s\\S]*?<\\/script>/gi, "");
  out = out.replace(/\\son\\w+="[^"]*"/gi, "");
  out = out.replace(/\\son\\w+='[^']*'/gi, "");
  out = out.replace(/(href|src)\\s*=\\s*"javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\\s*=\\s*'javascript:[^']*'/gi, "$1='#'");
  return out;
}`,
    testCases: [
      {
        input: `"<p>Hello</p><script>alert(1)</script>"`,
        expected: `"<p>Hello</p>"`,
        label: "Strips a <script> block entirely",
      },
      {
        input: `'<img src="x" onerror="alert(1)">'`,
        expected: `'<img src="x">'`,
        label: "Strips an on* event handler attribute",
      },
      {
        input: `'<a href="javascript:alert(1)">click</a>'`,
        expected: `'<a href="#">click</a>'`,
        label: "Neutralizes a javascript: URL",
      },
      {
        input: `"<p>Safe text</p>"`,
        expected: `"<p>Safe text</p>"`,
        label: "Leaves already-safe markup completely unchanged",
      },
    ],
    hints: [
      "A non-greedy [\\s\\S]*? inside the <script> regex is needed so it doesn't swallow everything between the first and last <script> tag on the page.",
      "Match the leading space before on* attributes so removing one doesn't leave a stray double space.",
      "Handle both single- and double-quoted attribute values — real markup uses both.",
    ],
    isPremium: true,
    orderIndex: 21,
  },
  {
    slug: "trace-connection-steps",
    conceptSlug: "the-network-stack",
    title: "Trace the Steps of a Network Connection",
    description: `Build the logic behind a "why is this request slow" waterfall explainer — given the state of a connection attempt, trace exactly which setup steps the browser performs before it can send the actual HTTP request.

## The problem

Two requests to the same domain can have wildly different latency for reasons that never show up in the request itself — one pays for a fresh DNS lookup and TLS handshake, the other reuses an already-open connection. Explaining *why* a request was slow means reconstructing which of these steps actually ran.

## The idea

1. \`"dns-lookup"\` — skipped if DNS is already cached
2. \`"tcp-handshake"\` — skipped if an existing connection is being reused (keep-alive)
3. \`"tls-handshake"\` — only for HTTPS, and only alongside a fresh TCP handshake
4. \`"http-request"\` — always happens last

## Your task

Write \`getConnectionSteps(options)\` — given \`{ isHttps, dnsCached, connectionReused }\`, return the ordered array of steps actually performed.`,
    difficulty: "hard",
    starterCode: `function getConnectionSteps(options) {
  // { isHttps: boolean, dnsCached: boolean, connectionReused: boolean }
}`,
    solutionCode: `function getConnectionSteps(options) {
  const steps = [];
  if (!options.dnsCached) steps.push("dns-lookup");
  if (!options.connectionReused) {
    steps.push("tcp-handshake");
    if (options.isHttps) steps.push("tls-handshake");
  }
  steps.push("http-request");
  return steps;
}`,
    testCases: [
      {
        input: `{ isHttps: true, dnsCached: false, connectionReused: false }`,
        expected: `["dns-lookup","tcp-handshake","tls-handshake","http-request"]`,
        label: "A brand-new HTTPS connection performs all four steps",
      },
      {
        input: `{ isHttps: false, dnsCached: true, connectionReused: false }`,
        expected: `["tcp-handshake","http-request"]`,
        label: "Cached DNS and plain HTTP skip both the lookup and the TLS handshake",
      },
      {
        input: `{ isHttps: true, dnsCached: true, connectionReused: true }`,
        expected: `["http-request"]`,
        label: "A fully reused keep-alive connection skips straight to the request",
      },
      {
        input: `{ isHttps: true, dnsCached: true, connectionReused: false }`,
        expected: `["tcp-handshake","tls-handshake","http-request"]`,
        label: "A fresh TCP connection over HTTPS still needs its own TLS handshake, even with DNS cached",
      },
    ],
    hints: [
      "Each step is independently skippable — don't assume DNS caching implies the connection is also reused.",
      "TLS only ever happens alongside a fresh TCP handshake — a reused connection never needs a new one.",
    ],
    isPremium: true,
    orderIndex: 22,
  },
  {
    slug: "stale-while-revalidate",
    conceptSlug: "service-workers-caching-strategies",
    title: "Implement Stale-While-Revalidate",
    description: `Build one of the three real caching strategies a service worker's \`fetch\` handler chooses between — the one that trades a little staleness for instant responses.

## The problem

Cache-first can go stale forever; network-first blocks every response on a round trip even when a perfectly good cached value already exists. Neither is right for content that changes occasionally but shouldn't make the user wait — a middle ground is needed that responds instantly *and* stays fresh over time.

## The idea

1. If the cache has a value, return it **immediately** — do not wait on the network.
2. Regardless of a cache hit or miss, kick off a network fetch that updates the cache once it resolves.
3. If the cache was empty, the function resolves with the network's value instead.
4. A background network failure must never reject the returned promise if a cached value was already returned.

## Your task

Write \`staleWhileRevalidate(key, cache, network)\` — \`cache\` exposes async \`get(key)\`/\`set(key, value)\`; \`network(key)\` is an async function returning a fresh value.`,
    difficulty: "hard",
    starterCode: `async function staleWhileRevalidate(key, cache, network) {
  // return the cached value immediately if present, but always refresh the cache in the background
}`,
    solutionCode: `async function staleWhileRevalidate(key, cache, network) {
  const cached = await cache.get(key);
  const refresh = network(key)
    .then((fresh) => {
      cache.set(key, fresh);
      return fresh;
    })
    .catch(() => {});

  if (cached !== undefined) {
    return cached;
  }
  return refresh;
}`,
    testCases: [
      {
        input: "cache already has a value for the key",
        expected: "the cached value, returned without waiting on the network",
        label: "Returns a cache hit immediately",
      },
      {
        input: "cache is empty for the key",
        expected: "the network's value",
        label: "Falls back to the network value on a cache miss",
      },
      {
        input: "a cache hit, checked again after the background refresh completes",
        expected: "the cache now holds the fresh network value",
        label: "Updates the cache with the fresh value in the background",
      },
      {
        input: "a cache hit whose background network call rejects",
        expected: "the original cached value, no unhandled rejection",
        label: "A background network failure doesn't affect an already-returned cache hit",
      },
    ],
    hints: [
      "Don't await the network call before checking the cache — the whole point is returning the cached value without waiting.",
      "Start the network refresh unconditionally, whether or not there was a cache hit.",
      "Catch a network rejection on the background refresh so it can't surface as an unhandled promise rejection.",
    ],
    isPremium: true,
    orderIndex: 23,
  },
  {
    slug: "clone-worker-message",
    conceptSlug: "web-workers-concurrency",
    title: "Simulate postMessage's Structured Clone",
    description: `Build the piece of the worker messaging contract that trips people up the first time they hit it: not everything can cross the boundary between a worker and the main thread.

## The problem

Web Workers can't share memory with the main thread — every value passed via \`postMessage\` is deep-cloned, not referenced. That's usually invisible until someone tries to pass a value containing a function (a callback, a class instance with methods) and gets a cryptic \`DataCloneError\` instead of the message they expected.

## The idea

- Primitives pass through unchanged.
- Arrays and plain objects are cloned **deeply** — nested structures must not share references with the original.
- A function anywhere in the value cannot be cloned and must throw, mirroring \`postMessage\`'s real \`DataCloneError\`.

## Your task

Write \`cloneMessage(value)\` implementing this behavior.`,
    difficulty: "hard",
    starterCode: `function cloneMessage(value) {
  // deep-clone value; throw if it contains a function anywhere
}`,
    solutionCode: `function cloneMessage(value) {
  if (typeof value === "function") {
    throw new Error("could not be cloned");
  }
  if (Array.isArray(value)) {
    return value.map(cloneMessage);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = cloneMessage(value[key]);
    }
    return out;
  }
  return value;
}`,
    testCases: [
      {
        input: `{ a: 1, b: [1, 2, 3] }`,
        expected: "a deep copy with no shared references to the original's nested array",
        label: "Deep-clones a nested array without sharing a reference",
      },
      { input: "42", expected: "42", label: "A primitive passes through unchanged" },
      {
        input: `{ fn: () => {} }`,
        expected: "throws",
        label: "A function anywhere in the value throws instead of cloning",
      },
      {
        input: `{ nested: { deep: [1, { x: 2 }] } }`,
        expected: "mutating the clone never affects the original",
        label: "Nested objects are cloned independently at every level",
      },
    ],
    hints: [
      "Recurse into both arrays and plain objects — a shallow copy (spread) at the top level still shares references one level down.",
      "Check for a function before checking for an object, since the recursion needs to throw the moment one is found anywhere in the structure.",
    ],
    isPremium: true,
    orderIndex: 24,
  },
  {
    slug: "build-create-element",
    companies: ["Meta"],
    conceptSlug: "jsx-virtual-dom",
    title: "Build a Mini createElement",
    description: `Build the function every JSX tag actually compiles down to — the one that turns a description like \`<button className="primary">Save</button>\` into a plain Virtual DOM object.

## The problem

JSX never runs in the browser as-is — a compiler rewrites every tag into a \`createElement(type, props, ...children)\` call before your code executes. Understanding what that call actually returns is the first step to understanding everything React does afterward (diffing, reconciliation) to that returned object.

## The idea

- \`type\` is the tag name (or component), stored as-is.
- \`props\` becomes the returned object's \`props\`, with \`children\` folded in: zero children omits nothing (an empty array), one child is stored directly (not wrapped in an array), more than one is stored as an array.

## Your task

Write \`createElement(type, props, ...children)\` returning \`{ type, props }\`, where \`props.children\` follows the folding rule above (merge in any \`props\` passed in, even if \`props\` is \`null\`).`,
    difficulty: "easy",
    starterCode: `function createElement(type, props, ...children) {
  // return { type, props } where props.children follows the folding rule
}`,
    solutionCode: `function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: children.length === 1 ? children[0] : children,
    },
  };
}`,
    testCases: [
      {
        input: `createElement("div", null)`,
        expected: `{ type: "div", props: { children: [] } }`,
        label: "No children folds to an empty array",
      },
      {
        input: `createElement("button", { className: "primary" }, "Save")`,
        expected: `{ type: "button", props: { className: "primary", children: "Save" } }`,
        label: "A single child is stored directly, not wrapped in an array",
      },
      {
        input: `createElement("ul", null, "a", "b")`,
        expected: `{ type: "ul", props: { children: ["a", "b"] } }`,
        label: "Multiple children are stored as an array",
      },
      {
        input: `createElement("div", null, createElement("span", null, "hi"))`,
        expected: `a div vnode whose single child is the span vnode object`,
        label: "Children can themselves be vnode objects, nested arbitrarily deep",
      },
    ],
    hints: [
      "Spread props first, then overwrite/add children last so it always ends up on the returned object even when props is null.",
      "The folding rule only cares about children.length — 0, 1, or more than 1 — not what the children actually are.",
    ],
    isPremium: false,
    orderIndex: 25,
  },
  {
    slug: "should-run-effect",
    companies: ["Airbnb"],
    conceptSlug: "usestate-useeffect-fundamentals",
    title: "Implement useEffect's Dependency Comparison",
    description: `Build the comparison React itself runs on every render to decide whether an effect fires again — the actual logic behind the dependency array.

## The problem

An effect doesn't re-run just because a component re-rendered — React compares the new dependency array to the previous one first, and only re-runs the effect if something in it actually changed.

## The idea

- No dependency array at all (\`undefined\`) means "always run."
- The very first render has no previous dependencies to compare against, so it always runs (mount).
- Otherwise, compare each entry pairwise with \`Object.is\` (not \`===\`) — this matters for values like \`NaN\`, which \`Object.is\` correctly treats as equal to itself.

## Your task

Write \`shouldRunEffect(prevDeps, nextDeps)\` returning \`true\` if the effect should run this render, \`false\` if it should be skipped.`,
    difficulty: "easy",
    starterCode: `function shouldRunEffect(prevDeps, nextDeps) {
  // prevDeps is null/undefined on the very first render (mount)
}`,
    solutionCode: `function shouldRunEffect(prevDeps, nextDeps) {
  if (nextDeps === undefined) return true;
  if (prevDeps === undefined || prevDeps === null) return true;
  if (prevDeps.length !== nextDeps.length) return true;
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) return true;
  }
  return false;
}`,
    testCases: [
      { input: "shouldRunEffect(null, [1])", expected: "true", label: "First render (mount) always runs" },
      { input: "shouldRunEffect([1], [1])", expected: "false", label: "Unchanged dependency skips the effect" },
      { input: "shouldRunEffect([1], [2])", expected: "true", label: "A changed dependency re-runs the effect" },
      {
        input: "shouldRunEffect([NaN], [NaN])",
        expected: "false",
        label: "Object.is treats NaN as equal to itself, unlike ===",
      },
      { input: "shouldRunEffect([1, 2], undefined)", expected: "true", label: "No dependency array always runs" },
    ],
    hints: [
      "Check the undefined/no-array case before anything else — it short-circuits the comparison entirely.",
      "Use Object.is, not ===, for each pairwise comparison — that's the detail that makes the NaN case behave correctly.",
    ],
    isPremium: false,
    orderIndex: 26,
  },
  {
    slug: "detect-controlled-switch",
    companies: ["Google"],
    conceptSlug: "controlled-vs-uncontrolled-forms",
    title: "Detect a Controlled/Uncontrolled Switch",
    description: `Build the check behind React's real "a component is changing from uncontrolled to controlled" warning — given an input's value across two renders, decide whether its controlled-ness just flipped.

## The problem

An input is uncontrolled when its \`value\` prop is \`undefined\`/\`null\`, and controlled once it's a real value. Flipping between the two mid-lifetime is a common source of the warning — usually caused by state initialized to \`undefined\` instead of an empty string.

## The idea

Controlled-ness is just: was \`value\` defined (not \`undefined\`/\`null\`) last render, and is it defined this render? A flip is when those two booleans disagree.

## Your task

Write \`isSwitchingControlled(prevValue, nextValue)\` returning \`true\` if the input's controlled/uncontrolled status changed between the two renders.`,
    difficulty: "easy",
    starterCode: `function isSwitchingControlled(prevValue, nextValue) {
  // true if defined-ness of prevValue vs nextValue differs
}`,
    solutionCode: `function isSwitchingControlled(prevValue, nextValue) {
  const wasControlled = prevValue !== undefined && prevValue !== null;
  const isControlled = nextValue !== undefined && nextValue !== null;
  return wasControlled !== isControlled;
}`,
    testCases: [
      {
        input: `isSwitchingControlled(undefined, "abc")`,
        expected: "true",
        label: "Uncontrolled to controlled is a switch",
      },
      { input: `isSwitchingControlled("abc", "")`, expected: "false", label: "Empty string is still controlled" },
      {
        input: `isSwitchingControlled("abc", undefined)`,
        expected: "true",
        label: "Controlled to uncontrolled is also a switch",
      },
      { input: "isSwitchingControlled(undefined, undefined)", expected: "false", label: "Uncontrolled the whole time is not a switch" },
      { input: `isSwitchingControlled(null, "x")`, expected: "true", label: "null counts as uncontrolled, same as undefined" },
    ],
    hints: [
      "Treat null the same as undefined — both mean 'uncontrolled,' not just undefined specifically.",
      "An empty string is still a real, defined value — it's controlled, not uncontrolled.",
    ],
    isPremium: false,
    orderIndex: 27,
  },
  {
    slug: "implement-merge-refs",
    companies: ["Microsoft"],
    conceptSlug: "useref-imperative-handles",
    title: "Implement mergeRefs",
    description: `Build a small utility that comes up constantly once a component needs to attach more than one ref to the same DOM node — a real gap in React's API, not a toy problem.

## The problem

A component sometimes needs to forward a ref from its parent \`and\` keep its own internal ref to the same node (e.g. a parent's \`ref\` prop plus the component's own \`useRef\` for internal focus management). React only lets a JSX element take one \`ref\` prop, so both refs need to be driven by a single callback.

## The idea

Refs come in two shapes: a function (\`(node) => {...}\`) or an object (\`{ current: null }\`). Setting either "form" of ref just means calling the function, or assigning \`.current\`, for every ref in the list — skipping any that are \`null\`/\`undefined\`.

## Your task

Write \`mergeRefs(...refs)\` returning a single callback ref that, when called with a node, updates every ref in \`refs\` to point at that node.`,
    difficulty: "medium",
    starterCode: `function mergeRefs(...refs) {
  // return a function(node) that updates every ref in refs
}`,
    solutionCode: `function mergeRefs(...refs) {
  return function (node) {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    });
  };
}`,
    testCases: [
      {
        input: "a function ref and an object ref merged, then called with a node",
        expected: "the function ref is invoked with the node, and the object ref's .current is set to the node",
        label: "Updates both a function ref and an object ref",
      },
      {
        input: "mergeRefs(null, objectRef) called with a node",
        expected: "objectRef.current is set to the node, the null entry is skipped without throwing",
        label: "Skips null/undefined refs safely",
      },
      {
        input: "the merged ref called again with null",
        expected: "every ref is updated to null",
        label: "Clears all refs when called with null (on unmount)",
      },
      {
        input: "three object refs merged and called once",
        expected: "all three .current values point at the same node",
        label: "Supports more than two refs",
      },
    ],
    hints: [
      "A ref is either a function or an object with a .current property — check typeof to tell them apart.",
      "Skip falsy refs (null/undefined) up front so the caller can pass an optional ref without extra guards.",
    ],
    isPremium: true,
    orderIndex: 28,
  },
  {
    slug: "implement-context-store",
    companies: ["Stripe"],
    conceptSlug: "context-api-prop-drilling",
    title: "Implement a Minimal Context Store",
    description: `Build the subscribe/notify mechanism that Context uses under the hood to propagate a value to every consumer without any component in between passing it along.

## The problem

Context's whole point is that a value published at the top of a subtree reaches any descendant that asks for it, without every intermediate component forwarding it as a prop. That only works because of a publish/subscribe mechanism — the same shape used by \`useSyncExternalStore\` and every external store library.

## The idea

A store needs three things: a way to read the current value, a way to update it (which must notify everyone currently listening), and a way to subscribe (which must return an unsubscribe function, so a consumer can stop listening when it unmounts).

## Your task

Write \`createStore(initialValue)\` returning \`{ getValue, setValue, subscribe }\`, where \`setValue(next)\` calls every currently-subscribed listener with the new value, and \`subscribe(listener)\` returns a function that removes that listener.`,
    difficulty: "medium",
    starterCode: `function createStore(initialValue) {
  // return { getValue, setValue, subscribe }
}`,
    solutionCode: `function createStore(initialValue) {
  let value = initialValue;
  let subscribers = [];
  return {
    getValue: () => value,
    setValue: (next) => {
      value = next;
      subscribers.forEach((listener) => listener(value));
    },
    subscribe: (listener) => {
      subscribers.push(listener);
      return () => {
        subscribers = subscribers.filter((s) => s !== listener);
      };
    },
  };
}`,
    testCases: [
      { input: `createStore("dark").getValue()`, expected: `"dark"`, label: "getValue returns the initial value" },
      {
        input: "subscribe a listener, then call setValue",
        expected: "the listener is called once with the new value",
        label: "setValue notifies subscribed listeners",
      },
      {
        input: "subscribe, unsubscribe, then setValue",
        expected: "the listener is not called",
        label: "The function returned by subscribe removes that listener",
      },
      {
        input: "two listeners subscribed, then setValue",
        expected: "both listeners are called with the new value",
        label: "Supports multiple simultaneous subscribers",
      },
    ],
    hints: [
      "subscribe must return a new function each time that removes only that specific listener, not all of them.",
      "setValue should update the stored value before notifying, so a listener calling getValue() inside its callback sees the new value.",
    ],
    isPremium: true,
    orderIndex: 29,
  },
  {
    slug: "implement-map-children",
    companies: ["LinkedIn"],
    conceptSlug: "component-composition-patterns",
    title: "Implement a Children-Mapping Utility",
    description: `Build the normalization logic behind \`React.Children.map\` — the utility that lets a component safely transform \`props.children\` no matter what shape it arrives in.

## The problem

\`props.children\` isn't always an array — it can be \`null\`, a single child, or an array containing \`null\`s from conditional rendering (\`{condition && <Item />}\`). Mapping over it safely means normalizing all of these into one consistent shape first.

## The idea

- \`null\`/\`undefined\` children means there's nothing to map — return an empty array.
- A single child (not an array) should be treated as a one-item list.
- An array's direct \`null\`/\`undefined\`/\`false\` entries (from conditional rendering) must be dropped before mapping, and the index passed to the mapping function must reflect position among only the *surviving* children, not the original array.

## Your task

Write \`mapChildren(children, mapFn)\` returning the normalized, filtered array with \`mapFn(child, index)\` applied to each entry.`,
    difficulty: "medium",
    starterCode: `function mapChildren(children, mapFn) {
  // normalize, filter out null/undefined/false, then map
}`,
    solutionCode: `function mapChildren(children, mapFn) {
  if (children === null || children === undefined) return [];
  const list = Array.isArray(children) ? children : [children];
  const kept = list.filter((child) => child !== null && child !== undefined && child !== false);
  return kept.map((child, index) => mapFn(child, index));
}`,
    testCases: [
      { input: "mapChildren(null, fn)", expected: "[]", label: "null children maps to an empty array" },
      {
        input: `mapChildren("only child", fn)`,
        expected: "an array with fn applied once, at index 0",
        label: "A single non-array child is treated as a one-item list",
      },
      {
        input: `mapChildren(["a", null, "b", false], fn)`,
        expected: "fn called with (\"a\", 0) and (\"b\", 1)",
        label: "Falsy conditional-rendering entries are dropped, and indices reflect only surviving children",
      },
      {
        input: `mapChildren(["a", "b", "c"], fn)`,
        expected: "fn called with (\"a\",0), (\"b\",1), (\"c\",2)",
        label: "A plain array of children maps in order",
      },
    ],
    hints: [
      "Filter before mapping, not after — the index argument must be based on the already-filtered list.",
      "false needs the same treatment as null/undefined — it's the value {condition && <X/>} produces when condition is falsy.",
    ],
    isPremium: true,
    orderIndex: 30,
  },
  {
    slug: "detect-conditional-hook-call",
    companies: ["Meta", "TikTok"],
    conceptSlug: "custom-hooks-composition",
    title: "Detect a Rules-of-Hooks Violation",
    description: `Build a simplified version of what eslint-plugin-react-hooks checks at runtime-equivalent logic — given the sequence of hooks called on each render, detect the render where that sequence first diverges from the baseline.

## The problem

React matches hook state to calls purely by the *order* they're called in during render, not by name. Calling a hook conditionally means some renders call a different number (or order) of hooks than others, silently shifting every hook state after the divergence into the wrong slot.

## The idea

The very first render establishes the baseline call sequence. Every later render must match that exact sequence — same hooks, same order, same count. The first render that doesn't match is where the violation happened.

## Your task

Write \`findHookOrderViolation(renders)\`, where \`renders\` is an array of arrays of hook names (one array per render, in call order). Return the index of the first render whose sequence differs from \`renders[0]\`, or \`-1\` if every render matches.`,
    difficulty: "medium",
    starterCode: `function findHookOrderViolation(renders) {
  // compare every render's hook sequence against renders[0]
}`,
    solutionCode: `function findHookOrderViolation(renders) {
  if (renders.length === 0) return -1;
  const baseline = renders[0];
  for (let i = 1; i < renders.length; i++) {
    const current = renders[i];
    if (current.length !== baseline.length) return i;
    for (let j = 0; j < baseline.length; j++) {
      if (current[j] !== baseline[j]) return i;
    }
  }
  return -1;
}`,
    testCases: [
      {
        input: `findHookOrderViolation([["useState","useEffect"], ["useState","useEffect"]])`,
        expected: "-1",
        label: "Matching sequences every render means no violation",
      },
      {
        input: `findHookOrderViolation([["useState","useEffect"], ["useState"]])`,
        expected: "1",
        label: "A render that skips a hook is flagged at its own index",
      },
      {
        input: `findHookOrderViolation([["useState"], ["useState"], ["useEffect","useState"]])`,
        expected: "2",
        label: "A render with hooks in a different order is a violation, even with the same count",
      },
      { input: "findHookOrderViolation([])", expected: "-1", label: "No renders at all means nothing to violate" },
    ],
    hints: [
      "Only the first render sets the baseline — every later render is compared against renders[0], not the previous render.",
      "Check the length first; a shorter or longer sequence is always a violation regardless of what matches.",
    ],
    isPremium: true,
    orderIndex: 31,
  },
  {
    slug: "find-error-boundary",
    companies: ["Amazon"],
    conceptSlug: "error-boundaries",
    title: "Find the Catching Error Boundary",
    description: `Build the lookup behind "which Error Boundary actually catches this crash" — given a component tree and where an error is thrown, find the nearest ancestor boundary.

## The problem

A component never catches its own thrown error — only an ancestor marked as an Error Boundary can. When boundaries are nested (a page-level boundary wrapping several widget-level boundaries), the *nearest* one above the failure is the one that actually renders a fallback, not the outermost one.

## The idea

Walk the path from the tree's root down to the throwing component, then scan that path upward (starting from its parent, since a node never catches its own error) for the first node flagged as a boundary.

## Your task

Write \`findErrorBoundary(tree, throwingId)\`, where each tree node is \`{ id, isBoundary, children: [] }\`. Return the \`id\` of the nearest ancestor boundary, or \`null\` if none exists.`,
    difficulty: "hard",
    starterCode: `function findErrorBoundary(tree, throwingId) {
  // find the path to throwingId, then scan upward (excluding throwingId itself)
}`,
    solutionCode: `function findErrorBoundary(tree, throwingId) {
  function findPath(node, targetId, path) {
    const nextPath = [...path, node];
    if (node.id === targetId) return nextPath;
    for (const child of node.children || []) {
      const result = findPath(child, targetId, nextPath);
      if (result) return result;
    }
    return null;
  }
  const path = findPath(tree, throwingId, []);
  if (!path) return null;
  for (let i = path.length - 2; i >= 0; i--) {
    if (path[i].isBoundary) return path[i].id;
  }
  return null;
}`,
    testCases: [
      {
        input: "a boundary at the root, error thrown deep in a non-boundary subtree",
        expected: "the root's id",
        label: "Finds a distant ancestor boundary when nothing closer exists",
      },
      {
        input: "nested boundaries at two levels, error thrown below both",
        expected: "the id of the nearer (deeper) boundary, not the outer one",
        label: "The nearest boundary wins over an outer one",
      },
      {
        input: "no node in the tree is a boundary",
        expected: "null",
        label: "Returns null when no ancestor boundary exists",
      },
      {
        input: "the throwing node itself is flagged isBoundary: true",
        expected: "its ancestor's id (or null), never its own id",
        label: "A node never catches its own thrown error",
      },
    ],
    hints: [
      "Build the full root-to-target path first, then walk it backwards — don't try to search top-down and bottom-up at the same time.",
      "Start the upward scan at index length - 2, one above the throwing node, so it can never return the throwing node's own id.",
    ],
    isPremium: true,
    orderIndex: 32,
  },
  {
    slug: "implement-shallow-equal",
    companies: ["Meta"],
    conceptSlug: "render-performance-memoization",
    title: "Implement shallowEqual",
    description: `Build the comparison \`React.memo\` runs by default on every prop object — the actual algorithm behind "did this component's props really change?"

## The problem

\`React.memo\` skips re-rendering a component when its new props are shallow-equal to the previous ones. Knowing exactly what "shallow-equal" checks (and doesn't check) explains both why memo works and why it silently fails to help once a prop is a freshly-created object or array every render.

## The idea

Two values are shallow-equal if they're the exact same reference (checked with \`Object.is\`, which handles \`NaN\` correctly), or if both are non-null objects with the same set of own keys, each holding \`Object.is\`-equal values one level deep — nested objects are compared by reference, not recursively.

## Your task

Write \`shallowEqual(objA, objB)\` implementing this comparison.`,
    difficulty: "hard",
    starterCode: `function shallowEqual(objA, objB) {
  // Object.is reference check, then one level of own-key comparison
}`,
    solutionCode: `function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}`,
    testCases: [
      { input: `shallowEqual({ a: 1 }, { a: 1 })`, expected: "true", label: "Same own keys and values are shallow-equal" },
      { input: `shallowEqual({ a: 1 }, { a: 2 })`, expected: "false", label: "A different value for the same key is not equal" },
      {
        input: `shallowEqual({ a: { x: 1 } }, { a: { x: 1 } })`,
        expected: "false",
        label: "Nested objects are compared by reference, not recursively — two different inner objects are unequal",
      },
      { input: "shallowEqual(sameObjectRef, sameObjectRef)", expected: "true", label: "The identical reference is always equal" },
      {
        input: `shallowEqual({ a: 1 }, { a: 1, b: 2 })`,
        expected: "false",
        label: "A different number of keys is never shallow-equal",
      },
    ],
    hints: [
      "Check Object.is(objA, objB) first — the identical-reference case should short-circuit before any key comparison.",
      "Comparing key counts up front catches an extra key on either side without needing a second full loop.",
    ],
    isPremium: true,
    orderIndex: 33,
  },
  {
    slug: "schedule-updates-by-priority",
    companies: ["Meta", "Netflix"],
    conceptSlug: "concurrent-react-suspense",
    title: "Schedule Updates by Priority",
    description: `Build the ordering logic behind Concurrent React's priority model — given a batch of pending updates, decide which run first.

## The problem

Not every state update is equally urgent. A keystroke needs to feel instant; a transition-wrapped update (like re-filtering a large results list) can wait. A scheduler needs to reorder a batch of updates so urgent ones always run before transition ones, without scrambling the relative order within each group.

## The idea

Split the updates into two groups by priority, preserving each group's original relative order, then concatenate urgent before transition — a stable partition, not a full re-sort.

## Your task

Write \`scheduleUpdates(updates)\`, where each update is \`{ id, priority: 'urgent' | 'transition' }\`. Return an array of \`id\`s with all urgent updates first, then all transition updates, each group keeping its original order.`,
    difficulty: "hard",
    starterCode: `function scheduleUpdates(updates) {
  // partition by priority, urgent first, preserving relative order within each group
}`,
    solutionCode: `function scheduleUpdates(updates) {
  const urgent = updates.filter((u) => u.priority === "urgent").map((u) => u.id);
  const transition = updates.filter((u) => u.priority === "transition").map((u) => u.id);
  return [...urgent, ...transition];
}`,
    testCases: [
      {
        input: `scheduleUpdates([{id:"a",priority:"transition"},{id:"b",priority:"urgent"},{id:"c",priority:"transition"},{id:"d",priority:"urgent"}])`,
        expected: `["b", "d", "a", "c"]`,
        label: "Urgent updates move first while relative order within each group is preserved",
      },
      {
        input: `scheduleUpdates([{id:"a",priority:"urgent"},{id:"b",priority:"urgent"}])`,
        expected: `["a", "b"]`,
        label: "All-urgent input is returned unchanged",
      },
      {
        input: `scheduleUpdates([{id:"a",priority:"transition"},{id:"b",priority:"transition"}])`,
        expected: `["a", "b"]`,
        label: "All-transition input is returned unchanged",
      },
      { input: "scheduleUpdates([])", expected: "[]", label: "An empty batch schedules to an empty array" },
    ],
    hints: [
      "Filter twice (once per priority) rather than trying to sort in place — a stable partition is simpler than a custom comparator.",
      "Array.prototype.filter preserves relative order on its own, so each group never needs a separate sort step.",
    ],
    isPremium: true,
    orderIndex: 34,
  },
  {
    slug: "find-shared-state-ancestor",
    companies: ["Airbnb"],
    conceptSlug: "state-management-tradeoffs",
    title: "Find Where Shared State Should Live",
    description: `Build the lookup behind "lift state up" — given a component tree and two components that need to share a value, find the lowest common ancestor state should move to.

## The problem

When two components need the same piece of state, it has to live in a component that's an ancestor of both — but picking one too far up the tree causes unrelated components to re-render unnecessarily. The *lowest* common ancestor is the smallest subtree that still covers both consumers.

## The idea

This is the classic lowest-common-ancestor tree problem: find the root-to-node path for each of the two components, then walk both paths together from the root until they diverge — the last node where they still agreed is the answer.

## Your task

Write \`findLowestCommonAncestor(tree, idA, idB)\`, where each tree node is \`{ id, children: [] }\`. Return the \`id\` of the lowest common ancestor of \`idA\` and \`idB\`.`,
    difficulty: "hard",
    starterCode: `function findLowestCommonAncestor(tree, idA, idB) {
  // find both root-to-node paths, then walk them together until they diverge
}`,
    solutionCode: `function findLowestCommonAncestor(tree, idA, idB) {
  function findPath(node, target, path) {
    const next = [...path, node.id];
    if (node.id === target) return next;
    for (const child of node.children || []) {
      const result = findPath(child, target, next);
      if (result) return result;
    }
    return null;
  }
  const pathA = findPath(tree, idA, []);
  const pathB = findPath(tree, idB, []);
  if (!pathA || !pathB) return null;
  let lca = null;
  for (let i = 0; i < Math.min(pathA.length, pathB.length); i++) {
    if (pathA[i] === pathB[i]) lca = pathA[i];
    else break;
  }
  return lca;
}`,
    testCases: [
      {
        input: "two sibling leaf components under the same parent",
        expected: "the shared parent's id",
        label: "Siblings' lowest common ancestor is their direct parent",
      },
      {
        input: "idA is a direct ancestor of idB",
        expected: "idA itself",
        label: "When one node is an ancestor of the other, it is its own answer",
      },
      {
        input: "two components in different, deeply nested branches of a larger tree",
        expected: "the branching node where the two paths diverge",
        label: "Finds the correct ancestor in a deeper, unbalanced tree",
      },
      { input: "idB does not exist anywhere in the tree", expected: "null", label: "Returns null if either id isn't found" },
    ],
    hints: [
      "Solve it as two separate root-to-node path searches first — don't try to find the answer in a single combined traversal.",
      "Walk both paths in lockstep from index 0; the last index where they still match is the LCA, not the first index where they differ.",
    ],
    isPremium: true,
    orderIndex: 35,
  },
  // ── Phase 10 (Feature 44) — CSS Concepts ──────────────────────────────────
  {
    slug: "rendered-box-width",
    companies: ["Google"],
    conceptSlug: "the-box-model",
    title: "Compute a rendered box's width",
    description: `**box-sizing** decides what \`width\` actually measures — and getting it wrong is why elements mysteriously grow past their declared size.

## The problem

A 200px-wide box with 20px padding and a 2px border renders at 244px under the CSS default (\`content-box\`) — but exactly 200px under \`border-box\`. Same declared width, two different rendered sizes, depending entirely on one property most developers set once in a reset and forget about.

## The idea

Under \`content-box\`, \`width\` describes the content only — padding and border are added on top. Under \`border-box\`, \`width\` already includes padding and border, so the rendered size never changes no matter how much padding is added.

## Your task

Write \`renderedWidth(box, boxSizing)\`, where \`box = { width, padding, border }\` (single-sided values, applied to both left and right):

\`\`\`js
renderedWidth({ width: 200, padding: 20, border: 2 }, "content-box") // 244
renderedWidth({ width: 200, padding: 20, border: 2 }, "border-box")  // 200
\`\`\`

> **One line, system-wide effect.** This is exactly why \`* { box-sizing: border-box; }\` is in almost every CSS reset — it makes every element's declared width the actual rendered width, regardless of how much padding or border gets added later.`,
    difficulty: "easy",
    starterCode: `function renderedWidth(box, boxSizing) {
  // box = { width, padding, border } — padding/border apply to both sides
}`,
    solutionCode: `function renderedWidth(box, boxSizing) {
  const { width, padding, border } = box;
  if (boxSizing === "border-box") return width;
  return width + padding * 2 + border * 2;
}`,
    testCases: [
      { input: "{ width: 200, padding: 20, border: 2 }, content-box", expected: "244", label: "content-box adds padding and border on top of width" },
      { input: "{ width: 200, padding: 20, border: 2 }, border-box", expected: "200", label: "border-box keeps the declared width regardless of padding/border" },
      { input: "{ width: 100, padding: 0, border: 0 }, content-box", expected: "100", label: "zero padding/border renders at the declared width either way" },
    ],
    hints: [
      "content-box: width is content-only, so padding and border get added on top of it.",
      "border-box: width already includes padding and border, so it never changes.",
      "Padding and border are applied to both sides of the box — double each before adding.",
    ],
    isPremium: false,
    orderIndex: 36,
  },
  {
    slug: "resolve-css-length",
    companies: ["Adobe"],
    conceptSlug: "units-sizing",
    title: "Resolve a CSS length to pixels",
    description: `Every relative CSS unit ultimately resolves to a pixel value — the only question is *what it's relative to*.

## The problem

\`rem\`, \`em\`, and \`vw\` all look similar on the page, but each resolves against a completely different reference: the root font-size, the parent's font-size, or the viewport width. Mixing them up is why a component that looks right standalone breaks the moment it's nested somewhere else.

## The idea

- \`rem\` → value × the root (\`<html>\`) font-size, always — no compounding, no matter how deeply nested.
- \`em\` → value × the parent element's font-size — compounds through nested elements.
- \`vw\`/\`vh\` → value% of the viewport's width/height.
- \`px\` → the value itself, unchanged.

## Your task

Write \`resolveLength(value, unit, context)\`, where \`context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }\`:

\`\`\`js
resolveLength(1.5, "rem", { rootFontSize: 16 })          // 24
resolveLength(2, "em", { parentFontSize: 20 })            // 40
resolveLength(50, "vw", { viewportWidth: 1000 })          // 500
resolveLength(10, "px", {})                                // 10
\`\`\`

> **Why \`rem\` wins for design systems:** because it's always relative to one flat reference (the root), rescaling an entire type/spacing scale is a single line — \`html { font-size: 112.5%; }\`. \`em\`'s compounding makes that same rescale unpredictable.`,
    difficulty: "easy",
    starterCode: `function resolveLength(value, unit, context) {
  // context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }
}`,
    solutionCode: `function resolveLength(value, unit, context) {
  switch (unit) {
    case "px": return value;
    case "rem": return value * context.rootFontSize;
    case "em": return value * context.parentFontSize;
    case "vw": return (value / 100) * context.viewportWidth;
    case "vh": return (value / 100) * context.viewportHeight;
    default: throw new Error(\`Unknown unit: \${unit}\`);
  }
}`,
    testCases: [
      { input: "1.5, rem, { rootFontSize: 16 }", expected: "24", label: "rem resolves against the root font-size" },
      { input: "2, em, { parentFontSize: 20 }", expected: "40", label: "em resolves against the parent's font-size" },
      { input: "50, vw, { viewportWidth: 1000 }", expected: "500", label: "vw resolves against 1% of viewport width" },
      { input: "10, px, {}", expected: "10", label: "px passes through unchanged" },
    ],
    hints: [
      "rem always multiplies against rootFontSize, regardless of nesting depth.",
      "em multiplies against the parent's font-size, not the root's — that's the compounding difference.",
      "vw/vh are percentages of the viewport, so divide by 100 before multiplying.",
    ],
    isPremium: false,
    orderIndex: 37,
  },
  {
    slug: "resolve-cascade-winner",
    companies: ["Airbnb"],
    conceptSlug: "the-cascade-inheritance",
    title: "Resolve which declaration wins the cascade",
    description: `When multiple rules target the same element and property, the cascade picks exactly one winner — through a fixed, ordered set of tiebreaks.

## The problem

"Which rule wins?" isn't answered by specificity alone — \`!important\` overrides specificity entirely, and if specificity ties too, source order decides. Getting the order of these tiebreaks wrong is why \`!important\` fights so often escalate.

## The idea

Compare declarations in this order, stopping at the first difference:

1. **Importance** — an \`!important\` declaration always beats a normal one, regardless of specificity.
2. **Specificity** — among declarations of equal importance, the higher \`[id, class, element]\` score wins.
3. **Source order** — if specificity also ties, the later declaration wins.

## Your task

Write \`resolveCascade(declarations)\`, where each declaration is \`{ value, important, specificity: [id, class, element], order }\`. Return the winning \`value\`.

\`\`\`js
resolveCascade([
  { value: "blue", important: false, specificity: [0, 2, 0], order: 0 },
  { value: "red", important: true, specificity: [0, 0, 1], order: 1 },
])
// → "red" — !important wins even with lower specificity
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveCascade(declarations) {
  // each declaration: { value, important, specificity: [id, class, element], order }
}`,
    solutionCode: `function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function resolveCascade(declarations) {
  return declarations.reduce((winner, d) => {
    if (!winner) return d;
    if (d.important !== winner.important) return d.important ? d : winner;
    const cmp = compareSpecificity(d.specificity, winner.specificity);
    if (cmp !== 0) return cmp > 0 ? d : winner;
    return d.order >= winner.order ? d : winner;
  }, null).value;
}`,
    testCases: [
      {
        input: "[{color, spec:[0,2,0]}, {red, spec:[0,0,1], important:true}]",
        expected: "red",
        label: "!important wins even against higher specificity",
      },
      {
        input: "[{blue, spec:[0,1,0]}, {green, spec:[1,0,0]}]",
        expected: "green",
        label: "Without !important, higher specificity wins",
      },
      {
        input: "[{blue, spec:[0,1,0], order:0}, {green, spec:[0,1,0], order:1}]",
        expected: "green",
        label: "Equal specificity — the later declaration (source order) wins",
      },
    ],
    hints: [
      "Compare importance first — it overrides specificity entirely, not just adds to it.",
      "Only fall through to specificity comparison when importance ties.",
      "Only fall through to source order when specificity also ties exactly.",
    ],
    isPremium: false,
    orderIndex: 38,
  },
  {
    slug: "distribute-flex-space",
    companies: ["Microsoft"],
    conceptSlug: "flexbox-vs-grid",
    title: "Distribute space across flex items",
    description: `Flexbox's \`flex-grow\`/\`flex-shrink\`/\`flex-basis\` decide each item's final size — the same three numbers the browser itself computes on every layout pass.

## The problem

"Why did this item grow more than that one" almost always comes down to their relative \`flex-grow\` values, not their absolute size — a common source of confusion since the numbers look like fixed sizes but actually work as ratios.

## The idea

Each item starts at its \`flex-basis\`. If there's leftover space in the container, it's distributed proportionally to each item's \`flex-grow\` (relative to the total grow across all items). If items overflow the container instead, each item shrinks proportionally to \`flex-shrink × flex-basis\`.

## Your task

Write \`distributeFlexSpace(items, containerWidth)\`, where each item is \`{ basis, grow, shrink }\`. Return an array of final widths.

\`\`\`js
distributeFlexSpace([
  { basis: 100, grow: 1, shrink: 1 },
  { basis: 100, grow: 1, shrink: 1 },
], 300)
// → [150, 150] — 100 extra px split evenly (equal grow)
\`\`\``,
    difficulty: "medium",
    starterCode: `function distributeFlexSpace(items, containerWidth) {
  // items: [{ basis, grow, shrink }]
}`,
    solutionCode: `function distributeFlexSpace(items, containerWidth) {
  const totalBasis = items.reduce((sum, i) => sum + i.basis, 0);
  const extra = containerWidth - totalBasis;

  if (extra >= 0) {
    const totalGrow = items.reduce((sum, i) => sum + i.grow, 0);
    if (totalGrow === 0) return items.map((i) => i.basis);
    return items.map((i) => i.basis + (i.grow / totalGrow) * extra);
  }

  const totalShrinkFactor = items.reduce((sum, i) => sum + i.shrink * i.basis, 0);
  if (totalShrinkFactor === 0) return items.map((i) => i.basis);
  return items.map((i) => i.basis - (i.shrink * i.basis / totalShrinkFactor) * -extra);
}`,
    testCases: [
      { input: "[{100,1,1},{100,1,1}], 300", expected: "[150, 150]", label: "Equal grow splits extra space evenly" },
      { input: "[{100,1,1},{100,0,1}], 300", expected: "[200, 100]", label: "grow: 0 gets no extra space at all" },
      { input: "[{100,1,1},{100,1,1}], 150", expected: "[75, 75]", label: "Overflow shrinks items proportionally to basis × shrink" },
      { input: "[{100,1,1},{100,1,1}], 200", expected: "[100, 100]", label: "Container exactly matching total basis distributes nothing" },
    ],
    hints: [
      "Compute total basis first — the sign of containerWidth minus that decides growing vs. shrinking.",
      "Growing distributes extra space by each item's share of the total grow factor.",
      "Shrinking weights each item's shrink factor by its own basis, not just the raw shrink number.",
    ],
    isPremium: false,
    orderIndex: 39,
  },
  {
    slug: "resolve-stacking-order",
    companies: ["Adobe"],
    conceptSlug: "positioning-stacking-contexts",
    title: "Find the topmost element across nested stacking contexts",
    description: `\`z-index: 9999\` can still lose to a sibling's \`z-index: 2\` — if that 9999 is trapped inside its own ancestor's stacking context.

## The problem

z-index doesn't compare globally across the page. It only compares within the same stacking context — so a descendant's z-index, no matter how high, can never let it escape past whatever beats its own containing context.

## The idea

Think of each element's z-index path from the root down to itself as a tuple — much like CSS specificity's \`[id, class, element]\`. Compare two elements' paths level by level: the first level where they differ decides the winner, and a much higher number several levels deep can never make up for losing at an earlier, shared level.

## Your task

Write \`resolveTopmost(elements)\`, where each element is \`{ id, zIndex, parentId }\` (\`parentId: null\` means top-level). Return the \`id\` of the element that renders on top.

\`\`\`js
resolveTopmost([
  { id: "a", zIndex: 1, parentId: null },
  { id: "a-inner", zIndex: 9999, parentId: "a" },
  { id: "b", zIndex: 2, parentId: null },
])
// → "b" — a-inner's 9999 is trapped inside "a" (zIndex 1), which already loses to "b" (zIndex 2)
\`\`\``,
    difficulty: "hard",
    starterCode: `function resolveTopmost(elements) {
  // elements: [{ id, zIndex, parentId }]
}`,
    solutionCode: `function resolveTopmost(elements) {
  const byId = Object.fromEntries(elements.map((el, index) => [el.id, { ...el, index }]));

  function pathOf(id) {
    const el = byId[id];
    const parentPath = el.parentId != null ? pathOf(el.parentId) : [];
    return [...parentPath, el.zIndex];
  }

  function comparePaths(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }

  const withPaths = elements.map((el) => ({ id: el.id, path: pathOf(el.id), index: byId[el.id].index }));
  return withPaths.reduce((winner, el) => {
    const cmp = comparePaths(el.path, winner.path);
    if (cmp > 0) return el;
    if (cmp === 0 && el.index > winner.index) return el;
    return winner;
  }).id;
}`,
    testCases: [
      {
        input: "a(z:1) > a-inner(z:9999), sibling b(z:2)",
        expected: "b",
        label: "A high z-index trapped in a lower-context ancestor cannot beat a sibling context",
      },
      { input: "two top-level siblings, zIndex 1 and 5", expected: "the one with zIndex 5", label: "Among top-level siblings, the higher zIndex wins directly" },
      { input: "two top-level siblings, equal zIndex", expected: "the later one in the array", label: "Equal zIndex at the same level falls back to source order" },
      {
        input: "x(z:5) > x-inner(z:1), sibling y(z:3) > y-inner(z:100)",
        expected: "y-inner",
        label: "A descendant under the higher-ranked ancestor wins, even with a lower zIndex than the other branch's descendant",
      },
    ],
    hints: [
      "Build each element's full zIndex path from the root down to itself, like a specificity tuple.",
      "Compare paths level by level — the first level that differs decides the winner outright.",
      "Only fall back to array order (source order) when two paths are identical at every shared level.",
    ],
    isPremium: true,
    orderIndex: 40,
  },
  {
    slug: "resolve-container-query",
    companies: ["Shopify"],
    conceptSlug: "responsive-design-container-queries",
    title: "Resolve the matching container query",
    description: `A container query asks "how wide is *this component's own container*?" — not the viewport. Matching one is just finding the right breakpoint for a given width.

## The problem

Media queries only ever see the full viewport width, so a component styled with one breaks the moment it's reused somewhere narrower than the whole page. Container queries fix this by resolving against the component's actual container.

## The idea

Given a set of \`min-width\` breakpoints, the matching one is always the **largest breakpoint that's still ≤ the container's current width** — mirroring how \`min-width\` container/media queries stack in real CSS.

## Your task

Write \`resolveContainerValue(containerWidth, queries)\`, where each query is \`{ minWidth, value }\` (in any order). Return the \`value\` of the matching breakpoint.

\`\`\`js
const queries = [
  { minWidth: 0, value: "compact" },
  { minWidth: 400, value: "comfortable" },
  { minWidth: 700, value: "wide" },
];
resolveContainerValue(500, queries) // "comfortable"
resolveContainerValue(300, queries) // "compact"
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveContainerValue(containerWidth, queries) {
  // queries: [{ minWidth, value }], in any order
}`,
    solutionCode: `function resolveContainerValue(containerWidth, queries) {
  const sorted = [...queries].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const q of sorted) {
    if (q.minWidth <= containerWidth) match = q;
    else break;
  }
  return match.value;
}`,
    testCases: [
      { input: "500, [{0,compact},{400,comfortable},{700,wide}]", expected: "comfortable", label: "Matches the largest minWidth that's still ≤ the container width" },
      { input: "300, [{0,compact},{400,comfortable},{700,wide}]", expected: "compact", label: "Falls back to the smallest breakpoint below the container width" },
      { input: "1000, [{0,compact},{400,comfortable},{700,wide}]", expected: "wide", label: "Matches the largest breakpoint when the container is wide enough" },
      { input: "500, [{700,wide},{0,compact},{400,comfortable}]", expected: "comfortable", label: "Works regardless of the input queries' order" },
    ],
    hints: [
      "Sort by minWidth first — the input order isn't guaranteed to be ascending.",
      "The correct match is the largest minWidth that doesn't exceed the container width.",
      "Every query set should include a minWidth: 0 fallback, matching real CSS's mobile-first convention.",
    ],
    isPremium: true,
    orderIndex: 41,
  },
  {
    slug: "resolve-custom-property",
    companies: ["Airbnb"],
    conceptSlug: "custom-properties-theming",
    title: "Resolve a custom property through the cascade",
    description: `A custom property resolves by walking up from wherever \`var()\` is used — not from wherever \`--name\` was declared. That's what makes runtime theming possible.

## The problem

Unlike a Sass variable (a compile-time text substitution), a CSS custom property is resolved live, by checking the element itself, then its ancestors, until a matching declaration is found.

## The idea

Given an element and a property name, walk from that element up through its ancestor chain. The first ancestor (including the element itself) that declares the property wins — closer always beats farther, regardless of where in the file it was declared.

## Your task

Write \`resolveVar(elementId, propName, tree, declarations, fallback)\`, where \`tree\` is \`{ id, parentId }[]\` and \`declarations\` is \`{ [elementId]: { [propName]: value } }\`. Return the resolved value, or \`fallback\` if no ancestor declares it.

\`\`\`js
resolveVar("card", "--accent", tree, {
  root: { "--accent": "teal" },
  "theme-dark": { "--accent": "cyan" },
}, "black")
// → "cyan" if "theme-dark" is an ancestor of "card" closer than "root"
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveVar(elementId, propName, tree, declarations, fallback) {
  // tree: { id, parentId }[], declarations: { [elementId]: { [propName]: value } }
}`,
    solutionCode: `function resolveVar(elementId, propName, tree, declarations, fallback) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  let current = elementId;
  while (current != null) {
    const decl = declarations[current];
    if (decl && propName in decl) return decl[propName];
    current = byId[current]?.parentId ?? null;
  }
  return fallback;
}`,
    testCases: [
      {
        input: "card declares --accent itself",
        expected: "card's own value",
        label: "A declaration on the element itself wins immediately",
      },
      {
        input: "card has no declaration, its parent theme-dark does",
        expected: "theme-dark's value",
        label: "Falls back to the nearest ancestor that declares the property",
      },
      {
        input: "both theme-dark (closer) and root (farther) declare --accent",
        expected: "theme-dark's value",
        label: "The closer ancestor wins over a farther one, regardless of declaration order",
      },
      { input: "no element in the chain declares the property", expected: "the fallback value", label: "Returns the fallback when nothing in the chain declares it" },
    ],
    hints: [
      "Start the walk at the element itself — a declaration there wins before checking any ancestor.",
      "Walk strictly upward via parentId until you hit a declaration or run out of ancestors.",
      "Only return the fallback once the walk reaches the root with nothing found.",
    ],
    isPremium: true,
    orderIndex: 42,
  },
  {
    slug: "implement-has-matcher",
    companies: ["Google"],
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    title: "Implement a simplified :has() matcher",
    description: `Every CSS combinator before \`:has()\` only reached downward or sideways. \`:has()\` is the first one that lets a selector match a parent based on its children.

## The problem

\`form:has(:invalid)\` selects the \`<form>\` itself, driven entirely by whether some descendant input is currently invalid — something no earlier selector could express, since they could never look "inward" to decide an outward match.

## The idea

Checking whether an element ":has" a matching descendant means recursively searching every node beneath it (not the element itself) for one that satisfies a given condition.

## Your task

Write \`hasDescendantMatching(node, predicate)\`, where \`node = { id, tag, children: [] }\`. Return \`true\` if **any descendant** (not the node itself) satisfies \`predicate(descendant)\`.

\`\`\`js
const form = {
  id: "f1", tag: "form",
  children: [{ id: "i1", tag: "input", valid: true }, { id: "i2", tag: "input", valid: false }],
};
hasDescendantMatching(form, (n) => n.valid === false) // true — i2 is invalid
\`\`\``,
    difficulty: "hard",
    starterCode: `function hasDescendantMatching(node, predicate) {
  // node: { id, tag, children: [] } — check descendants only, not node itself
}`,
    solutionCode: `function hasDescendantMatching(node, predicate) {
  for (const child of node.children || []) {
    if (predicate(child)) return true;
    if (hasDescendantMatching(child, predicate)) return true;
  }
  return false;
}`,
    testCases: [
      { input: "form with one invalid input among its children", expected: "true", label: "Matches when a direct child satisfies the predicate" },
      { input: "form with only valid inputs", expected: "false", label: "Returns false when no descendant matches" },
      { input: "invalid input nested three levels deep inside fieldsets", expected: "true", label: "Matches a deeply nested descendant, not just direct children" },
      { input: "the node itself satisfies the predicate, but it has no children", expected: "false", label: "The node itself is never checked — only its descendants" },
    ],
    hints: [
      "The element being checked itself must never satisfy its own :has() — only descendants count.",
      "Recurse into every child, not just the direct children — :has() looks arbitrarily deep.",
      "Short-circuit and return true as soon as any descendant matches — no need to keep searching.",
    ],
    isPremium: true,
    orderIndex: 43,
  },
  {
    slug: "classify-animation-cost",
    companies: ["Apple"],
    conceptSlug: "animation-performance",
    title: "Classify the cost of an animated property list",
    description: `Not every animated CSS property costs the same — and animating just one expensive property drags the whole frame down, even if every other property is cheap.

## The problem

\`transform\`/\`opacity\` skip Layout and Paint entirely (Composite-only), \`color\`/\`box-shadow\` skip Layout but still repaint, and \`width\`/\`top\`/\`margin\` force the full pipeline. Animating a mix of these only ever costs as much as the *most expensive* one in the list.

## The idea

Look up each property's tier, then return the worst (most expensive) tier found across the whole list — one Layout-triggering property makes the entire animation as expensive as if every property were Layout-triggering.

## Your task

Write \`classifyAnimationCost(properties)\`, returning \`"compositor"\`, \`"paint"\`, or \`"layout"\` — whichever is worst among the given properties.

\`\`\`js
classifyAnimationCost(["transform", "opacity"])  // "compositor"
classifyAnimationCost(["transform", "top"])       // "layout" — top drags the whole thing down
classifyAnimationCost(["color", "box-shadow"])    // "paint"
\`\`\``,
    difficulty: "hard",
    starterCode: `function classifyAnimationCost(properties) {
  // return the worst ("layout" > "paint" > "compositor") tier among the properties
}`,
    solutionCode: `const TIERS = {
  transform: "compositor",
  opacity: "compositor",
  color: "paint",
  "background-color": "paint",
  "box-shadow": "paint",
  "border-color": "paint",
  width: "layout",
  height: "layout",
  top: "layout",
  left: "layout",
  margin: "layout",
  "font-size": "layout",
};
const RANK = { compositor: 0, paint: 1, layout: 2 };

function classifyAnimationCost(properties) {
  let worst = "compositor";
  for (const prop of properties) {
    const tier = TIERS[prop] ?? "layout";
    if (RANK[tier] > RANK[worst]) worst = tier;
  }
  return worst;
}`,
    testCases: [
      { input: "['transform', 'opacity']", expected: "compositor", label: "Both properties are Composite-only — the cheapest possible tier" },
      { input: "['transform', 'top']", expected: "layout", label: "A single layout-triggering property drags the whole list down to 'layout'" },
      { input: "['color', 'box-shadow']", expected: "paint", label: "Paint-only properties skip Layout but still cost more than Composite-only" },
      { input: "['width']", expected: "layout", label: "A lone layout-triggering property is classified as 'layout'" },
    ],
    hints: [
      "Look up each property's own tier, then track the worst one seen so far across the whole list.",
      "Rank the tiers numerically (compositor < paint < layout) so 'worse' is just a bigger number.",
      "Default unknown properties to 'layout' — the safe, conservative assumption.",
    ],
    isPremium: true,
    orderIndex: 44,
  },
  // ── Phase 10 (Feature 45) — TypeScript Concepts ───────────────────────────
  // The sandbox only runs JS, not tsc — every Challenge here is a deterministic
  // JS function that simulates the TypeScript concept's logic at runtime,
  // matching the JS-simulation pattern Feature 44 established for CSS.
  {
    slug: "narrow-unknown-to-number",
    companies: ["Microsoft"],
    conceptSlug: "basic-types-inference",
    title: "Narrow unknown to a safe number",
    description: `\`unknown\` forces you to prove what a value actually is before you can use it — this is that proof, written as a function.

## The problem

A value from \`JSON.parse\`, a form field, or \`localStorage\` arrives with no guarantee it's actually a usable number — it might be a real number, a numeric string, \`NaN\`, or something else entirely.

## The idea

Narrow the \`unknown\` value step by step: a real, finite \`number\` passes straight through; a non-empty string that resolves to a finite number gets parsed; everything else — including \`NaN\` itself — is rejected.

## Your task

Write \`safeParseNumber(value)\`, returning a finite number or \`null\`:

\`\`\`js
safeParseNumber(42)              // 42
safeParseNumber("3.14")          // 3.14
safeParseNumber("not a number")  // null
safeParseNumber(NaN)             // null
\`\`\``,
    difficulty: "easy",
    starterCode: `function safeParseNumber(value) {
  // value is "unknown" — prove it's a usable number before returning it
}`,
    solutionCode: `function safeParseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}`,
    testCases: [
      { input: "42", expected: "42", label: "A finite number passes through unchanged" },
      { input: "\"3.14\"", expected: "3.14", label: "A numeric string is parsed to a number" },
      { input: "\"not a number\"", expected: "null", label: "A non-numeric string returns null instead of NaN" },
      { input: "NaN", expected: "null", label: "NaN itself is rejected, not returned as a valid number" },
    ],
    hints: [
      "typeof value === 'number' doesn't guarantee it's usable — NaN is typeof 'number' too.",
      "For strings, trim first and reject anything that resolves to Number.isFinite(...) === false.",
      "Every other input type (null, undefined, object, boolean) should fall through to null.",
    ],
    isPremium: false,
    orderIndex: 45,
  },
  {
    slug: "merge-declarations",
    companies: ["Stripe"],
    conceptSlug: "interfaces-vs-type-aliases",
    title: "Simulate declaration merging",
    description: `Two separate \`interface Config { ... }\` blocks with the same name silently combine into one — this models what that merge actually does to the resulting shape.

## The problem

\`interface\`'s declaration merging means the *same* key declared twice with the *same* type should just collapse into one, but the *same* key declared twice with *different* types is a real conflict that shouldn't be silently resolved by whichever declaration happened to run last.

## The idea

Fold a list of partial shapes into one result: a key seen for the first time is copied over; a key seen again with the exact same value stays a single value; a key seen again with a genuinely different value becomes an array of the distinct values — surfacing the conflict instead of one silently overwriting the other.

## Your task

Write \`mergeDeclarations(declarations)\`, where each declaration is a plain object:

\`\`\`js
mergeDeclarations([{ timeout: "number" }, { retries: "number" }])
// → { timeout: "number", retries: "number" }

mergeDeclarations([{ id: "string" }, { id: "number" }])
// → { id: ["string", "number"] } — a genuine conflict, both kept
\`\`\``,
    difficulty: "easy",
    starterCode: `function mergeDeclarations(declarations) {
  // declarations: array of plain objects to fold into one merged shape
}`,
    solutionCode: `function mergeDeclarations(declarations) {
  const result = {};
  for (const decl of declarations) {
    for (const [key, value] of Object.entries(decl)) {
      if (!(key in result)) {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        if (!result[key].includes(value)) result[key].push(value);
      } else if (result[key] !== value) {
        result[key] = [result[key], value];
      }
    }
  }
  return result;
}`,
    testCases: [
      { input: "[{ timeout: 'number' }, { retries: 'number' }]", expected: "{ timeout: 'number', retries: 'number' }", label: "Distinct keys across declarations simply combine" },
      { input: "[{ id: 'string' }, { id: 'string' }]", expected: "{ id: 'string' }", label: "The same key with the same value merges to a single value, not an array" },
      { input: "[{ id: 'string' }, { id: 'number' }]", expected: "{ id: ['string', 'number'] }", label: "The same key with a different value surfaces as a conflict array" },
      { input: "[{ a: 1 }, { b: 2 }, { a: 1 }]", expected: "{ a: 1, b: 2 }", label: "A key repeated later with the same value doesn't change the result" },
    ],
    hints: [
      "Walk the declarations in order, building up one result object as you go.",
      "A key seen for the first time just gets copied over untouched.",
      "Only turn a value into an array once you've confirmed a genuine conflict — not on every repeat.",
    ],
    isPremium: false,
    orderIndex: 46,
  },
  {
    slug: "create-typed-stack",
    companies: ["Microsoft"],
    conceptSlug: "generics",
    title: "Build a self-typing stack",
    description: `A generic collection doesn't know its element type until the first value goes in — after that, it holds every later value to the same type.

## The problem

An untyped stack will happily accept a number, then a string, then an object, with nothing stopping a later bug from mixing incompatible values into what was meant to be a single-type collection.

## The idea

The stack's type isn't fixed at creation — it's inferred from the *first* pushed item, exactly like a generic type parameter gets inferred from the first argument at a call site. Every push after that is checked against the locked-in type.

## Your task

Write \`createTypedStack()\`, returning \`{ push(item), pop(), toArray() }\`. The first \`push\` locks the stack's type; a later \`push\` of a different type should \`throw\`.

\`\`\`js
const s = createTypedStack();
s.push(1);
s.push(2);
s.toArray(); // [1, 2]
s.push("oops"); // throws
\`\`\``,
    difficulty: "medium",
    starterCode: `function createTypedStack() {
  // return { push(item), pop(), toArray() } — type locks in on the first push
}`,
    solutionCode: `function createTypedStack() {
  const items = [];
  let lockedType = null;

  function classify(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  return {
    push(item) {
      const type = classify(item);
      if (lockedType === null) {
        lockedType = type;
      } else if (type !== lockedType) {
        throw new Error(\`Expected \${lockedType}, got \${type}\`);
      }
      items.push(item);
    },
    pop() {
      return items.pop();
    },
    toArray() {
      return [...items];
    },
  };
}`,
    testCases: [
      { input: "push(1), push(2), push(3)", expected: "[1, 2, 3]", label: "Same-type pushes are all accepted, in order" },
      { input: "push('a') then push(1)", expected: "throws an Error", label: "A mismatched type after the first push throws" },
      { input: "push(1), pop(), toArray()", expected: "[]", label: "pop() removes the most recently pushed item" },
      { input: "toArray() on a stack with nothing pushed", expected: "[]", label: "A stack with no pushes starts out empty" },
    ],
    hints: [
      "The stack's type isn't fixed until the first push — that's what 'inferred once' means here.",
      "Compare every later push's classified type against the locked type, and throw on a mismatch.",
      "null and arrays both report typeof 'object' in JS — classify them separately so a stack of numbers still rejects an array.",
    ],
    isPremium: true,
    orderIndex: 47,
  },
  {
    slug: "pick-keys",
    companies: ["Amazon"],
    conceptSlug: "utility-types",
    title: "Implement Pick at runtime",
    description: `\`Pick<T, K>\` keeps only a chosen subset of an object's keys — this is that same idea, applied to an actual object instead of a type.

## The problem

A large object often needs a narrower view for a specific use — a list row that only needs 2 of an object's 10 fields shouldn't have to carry (or expose) the rest.

## The idea

Copy over only the requested keys, and skip any requested key the object doesn't actually have — a missing key shouldn't appear in the result as \`undefined\`.

## Your task

Write \`pick(obj, keys)\`:

\`\`\`js
pick({ id: 1, name: "Ada", email: "a@x.com" }, ["id", "name"])
// → { id: 1, name: "Ada" }
\`\`\``,
    difficulty: "easy",
    starterCode: `function pick(obj, keys) {
  // return a new object containing only the requested keys
}`,
    solutionCode: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}`,
    testCases: [
      { input: "{ id: 1, name: 'Ada', email: 'a@x.com' }, ['id', 'name']", expected: "{ id: 1, name: 'Ada' }", label: "Only the requested keys are kept, in the object they belong to" },
      { input: "{ id: 1, name: 'Ada' }, ['email']", expected: "{}", label: "A requested key the object doesn't have is skipped, not set to undefined" },
      { input: "{ id: 1, name: 'Ada' }, []", expected: "{}", label: "An empty key list returns an empty object" },
    ],
    hints: [
      "Build a fresh result object — don't mutate the input.",
      "Check hasOwnProperty before copying, so a missing key doesn't sneak in as undefined.",
    ],
    isPremium: true,
    orderIndex: 48,
  },
  {
    slug: "narrow-value-length",
    companies: ["Stripe"],
    conceptSlug: "type-narrowing",
    title: "Narrow a union to compute its length",
    description: `A chain of narrowing checks is how real code safely handles a value that could be several different shapes.

## The problem

A "length" concept applies to strings and arrays directly, to some objects (via a \`length\` property), and to nothing else — treating them all the same way crashes on at least one of them.

## The idea

Narrow the value step by step, exactly like TypeScript's control-flow analysis would: check \`typeof\` for a string, \`Array.isArray\` for an array, then an \`in\` check for an object with a \`length\` field, falling back to \`0\` for everything else.

## Your task

Write \`getLength(value)\`:

\`\`\`js
getLength("hello")            // 5
getLength([1, 2, 3])          // 3
getLength({ length: 10 })     // 10
getLength(42)                 // 0
\`\`\``,
    difficulty: "medium",
    starterCode: `function getLength(value) {
  // narrow value through string, array, { length }, then fall back to 0
}`,
    solutionCode: `function getLength(value) {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object" && "length" in value) return value.length;
  return 0;
}`,
    testCases: [
      { input: "'hello'", expected: "5", label: "A string narrows to its own .length" },
      { input: "[1, 2, 3]", expected: "3", label: "An array narrows to its own .length, checked before the plain-object case" },
      { input: "{ length: 10 }", expected: "10", label: "A plain object with a length field narrows via the in check" },
      { input: "42", expected: "0", label: "A value with no length concept at all falls back to 0" },
    ],
    hints: [
      "Check typeof for string first, then Array.isArray — order matters since arrays are also typeof 'object'.",
      "The in operator narrows an object by checking whether a specific property exists on it.",
      "Guard against null before the object branch — typeof null is 'object' too.",
    ],
    isPremium: true,
    orderIndex: 49,
  },
  {
    slug: "discriminated-union-reducer",
    companies: ["Amazon"],
    conceptSlug: "discriminated-unions",
    title: "Write a discriminated-union reducer",
    description: `A shared \`type\` field is what lets a single \`switch\` safely branch across several differently-shaped actions — the exact pattern behind every Redux-style reducer.

## The problem

Each action variant carries different data (\`"set"\` needs a \`value\`, \`"increment"\`/\`"decrement"\` need nothing extra) — reading a field that doesn't exist on the current variant should never happen.

## The idea

Switch on the shared \`type\` field. Each \`case\` only reads the fields that variant actually has — the discriminant is what makes each branch unambiguous.

## Your task

Write \`reducer(state, action)\`, where \`state\` is a number and \`action\` is one of \`{ type: "increment" }\`, \`{ type: "decrement" }\`, or \`{ type: "set", value }\`:

\`\`\`js
reducer(0, { type: "increment" })       // 1
reducer(5, { type: "decrement" })       // 4
reducer(5, { type: "set", value: 100 }) // 100
\`\`\``,
    difficulty: "hard",
    starterCode: `function reducer(state, action) {
  // switch on action.type: "increment", "decrement", "set"
}`,
    solutionCode: `function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "set":
      return action.value;
    default:
      throw new Error(\`Unhandled action type: \${action.type}\`);
  }
}`,
    testCases: [
      { input: "reducer(0, { type: 'increment' })", expected: "1", label: "increment adds one to the current state" },
      { input: "reducer(5, { type: 'decrement' })", expected: "4", label: "decrement subtracts one from the current state" },
      { input: "reducer(5, { type: 'set', value: 100 })", expected: "100", label: "set replaces the state entirely with action.value" },
      { input: "reducer(0, { type: 'nope' })", expected: "throws an Error", label: "An unrecognized action type throws instead of silently returning the old state" },
    ],
    hints: [
      "switch (action.type) is the whole pattern — each case only reads the fields that variant actually carries.",
      "Only the 'set' case needs action.value; increment/decrement ignore the rest of the action entirely.",
      "A default case that throws catches an unhandled variant instead of silently doing nothing.",
    ],
    isPremium: true,
    orderIndex: 50,
  },
  {
    slug: "map-values",
    companies: ["Microsoft"],
    conceptSlug: "conditional-mapped-types",
    title: "Implement a mapped-type-style value transformer",
    description: `A mapped type applies the same transformation to every property of a type — this is that same idea, applied to an actual object's values at runtime.

## The problem

Transforming every value in an object the same way (doubling every number, uppercasing every string) usually ends up hand-written per shape, one line per key.

## The idea

Iterate every key once, the same way \`{ [K in keyof T]: transform(T[K]) }\` iterates every key of a type — apply \`transform\` to each value and collect the results under the same keys.

## Your task

Write \`mapValues(obj, transform)\`:

\`\`\`js
mapValues({ a: 1, b: 2 }, (v) => v * 2)
// → { a: 2, b: 4 }
\`\`\``,
    difficulty: "hard",
    starterCode: `function mapValues(obj, transform) {
  // return a new object with every value passed through transform, same keys
}`,
    solutionCode: `function mapValues(obj, transform) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = transform(obj[key], key);
  }
  return result;
}`,
    testCases: [
      { input: "{ a: 1, b: 2 }, (v) => v * 2", expected: "{ a: 2, b: 4 }", label: "Every value is transformed, keys stay the same" },
      { input: "{ name: 'ada' }, (v) => v.toUpperCase()", expected: "{ name: 'ADA' }", label: "Works for any transform function, not just numbers" },
      { input: "{}, (v) => v * 2", expected: "{}", label: "An empty object maps to an empty object" },
    ],
    hints: [
      "Object.keys(obj) gives you every key to iterate, exactly once each.",
      "Build a fresh result object — don't mutate the input object's values in place.",
    ],
    isPremium: true,
    orderIndex: 51,
  },
  {
    slug: "match-event-name-pattern",
    companies: ["Stripe"],
    conceptSlug: "template-literal-branded-types",
    title: "Validate a template-literal string pattern",
    description: `A template literal type like \`\`on\${Capitalize<string>}\`\` describes every string matching a pattern, checked at compile time — this validates the same pattern at runtime.

## The problem

Not every string is a valid event-handler-style name — \`"click"\`, \`"onclick"\`, and \`"on2Fast"\` all fail the pattern that a real one like \`"onClick"\` satisfies.

## The idea

A valid name starts with the literal \`"on"\`, immediately followed by a capitalized word (uppercase first letter, then only letters) — anything else fails.

## Your task

Write \`isEventName(value)\`:

\`\`\`js
isEventName("onClick")   // true
isEventName("onSubmit")  // true
isEventName("click")     // false
isEventName("onclick")   // false — not capitalized after "on"
\`\`\``,
    difficulty: "hard",
    starterCode: `function isEventName(value) {
  // true only if value is "on" followed by a Capitalized word
}`,
    solutionCode: `function isEventName(value) {
  return typeof value === "string" && /^on[A-Z][a-zA-Z]*$/.test(value);
}`,
    testCases: [
      { input: "'onClick'", expected: "true", label: "\"on\" plus a capitalized word matches the pattern" },
      { input: "'onSubmit'", expected: "true", label: "Any capitalized word after \"on\" matches" },
      { input: "'click'", expected: "false", label: "Missing the \"on\" prefix entirely fails" },
      { input: "'onclick'", expected: "false", label: "\"on\" followed by a lowercase word fails — not Capitalized" },
    ],
    hints: [
      "A regular expression is the natural runtime equivalent of a compile-time string pattern.",
      "Anchor the pattern with ^ and $ so a longer string containing a valid substring doesn't false-positive.",
      "[A-Z][a-zA-Z]* means exactly one uppercase letter, then any number of letters of either case.",
    ],
    isPremium: true,
    orderIndex: 52,
  },
  {
    slug: "choose-semantic-tag",
    conceptSlug: "aria-roles-and-semantic-html",
    title: "Choose the correct semantic tag for a purpose",
    description: `The right HTML element already carries the correct accessibility role — this is the lookup that picks it.

## The problem

Given a plain-English description of what a page section or control is *for*, picking a \`div\` and bolting on a role is tempting — but a real semantic element already exists for almost every common purpose.

## The idea

Map each recognized purpose to its correct native tag. Anything not on the recognized list falls back to a plain \`"div"\` — a generic container is the honest answer when nothing more specific fits.

## Your task

Write \`chooseSemanticTag(purpose)\`:

\`\`\`js
chooseSemanticTag("primary navigation") // "nav"
chooseSemanticTag("performs an action on the current page") // "button"
chooseSemanticTag("navigates to another page/URL") // "a"
chooseSemanticTag("something totally unrelated") // "div"
\`\`\``,
    difficulty: "easy",
    starterCode: `function chooseSemanticTag(purpose) {
  // return the correct native tag name for this purpose, or "div" if none matches
}`,
    solutionCode: `function chooseSemanticTag(purpose) {
  const map = {
    "primary navigation": "nav",
    "page banner/header": "header",
    "page footer": "footer",
    "main content region": "main",
    "sidebar/complementary content": "aside",
    "self-contained article": "article",
    "navigates to another page/URL": "a",
    "performs an action on the current page": "button",
  };
  return map[purpose] ?? "div";
}`,
    testCases: [
      { input: '"primary navigation"', expected: '"nav"', label: "A recognized navigation purpose maps to <nav>" },
      { input: '"performs an action on the current page"', expected: '"button"', label: "An action purpose maps to <button>, not <a>" },
      { input: '"navigates to another page/URL"', expected: '"a"', label: "A navigation purpose maps to <a>, not <button>" },
      { input: '"something totally unrelated"', expected: '"div"', label: "An unrecognized purpose falls back to a plain div" },
    ],
    hints: [
      "A plain lookup table is the whole solution — no need for pattern matching or fuzzy string comparison.",
      "The nullish coalescing operator (??) is a clean way to express \"fall back to div if the key isn't found\".",
      "Resist the urge to special-case 'unrelated' strings — any key missing from the table should hit the same fallback.",
    ],
    isPremium: false,
    orderIndex: 53,
  },
  {
    slug: "decide-alt-text",
    conceptSlug: "accessible-images-media",
    title: "Decide the correct alt text for an image",
    description: `Not every image needs the same kind of alt text — some need none at all, on purpose.

## The problem

An image is either meaningful (it needs real alt text) or purely decorative (it needs an empty alt so screen readers skip it) — treating every image the same way gets one of those two cases wrong.

## The idea

Decorative images always get an empty string, regardless of whatever description was supplied. Meaningful images need a real, non-empty description — and a meaningful image with no description at all is a genuine content bug, not something to silently paper over.

## Your task

Write \`getAltText(image)\`, where \`image\` is \`{ isDecorative, description }\`:

\`\`\`js
getAltText({ isDecorative: true, description: "swirl graphic" }) // ""
getAltText({ isDecorative: false, description: "Company logo" }) // "Company logo"
getAltText({ isDecorative: false }) // throws
\`\`\``,
    difficulty: "easy",
    starterCode: `function getAltText(image) {
  // "" if decorative, the trimmed description if meaningful, throw if meaningful with no description
}`,
    solutionCode: `function getAltText(image) {
  if (image.isDecorative) return "";
  if (!image.description || !image.description.trim()) {
    throw new Error("Meaningful images must have alt text");
  }
  return image.description.trim();
}`,
    testCases: [
      { input: '{ isDecorative: true, description: "swirl" }', expected: '""', label: "A decorative image always gets an empty alt, even if a description was supplied" },
      { input: '{ isDecorative: false, description: "Company logo" }', expected: '"Company logo"', label: "A meaningful image returns its real description" },
      { input: '{ isDecorative: false, description: "  Team photo  " }', expected: '"Team photo"', label: "The description is trimmed of surrounding whitespace" },
      { input: '{ isDecorative: false }', expected: "throws an Error", label: "A meaningful image with no description throws instead of returning something misleading" },
    ],
    hints: [
      "Check isDecorative first — it should short-circuit before the description is even looked at.",
      "An empty or whitespace-only description should be treated the same as a missing one.",
    ],
    isPremium: false,
    orderIndex: 54,
  },
  {
    slug: "contrast-ratio-checker",
    conceptSlug: "color-contrast-visual-accessibility",
    title: "Implement the WCAG contrast ratio formula",
    description: `The number behind every "does this pass AA?" question — computed the same way a browser DevTools contrast checker does.

## The problem

"Does this text color pass against this background?" isn't a matter of opinion — WCAG defines an exact formula, based on each color's relative luminance.

## The idea

Convert each hex color to its relative luminance (a 0–1 measure of how much light it reflects), then compare the lighter one to the darker one using WCAG's ratio formula: \`(lighter + 0.05) / (darker + 0.05)\`.

## Your task

Write \`getContrastRatio(hex1, hex2)\` (rounded to 2 decimals) and \`meetsWcagAA(hex1, hex2, isLargeText)\`:

\`\`\`js
getContrastRatio("#000000", "#FFFFFF") // 21
meetsWcagAA("#000000", "#FFFFFF", false) // true
\`\`\``,
    difficulty: "easy",
    starterCode: `function getContrastRatio(hex1, hex2) {
  // return the WCAG contrast ratio between the two colors, rounded to 2 decimals
}
function meetsWcagAA(hex1, hex2, isLargeText) {
  // true if getContrastRatio passes the AA threshold for the given text size
}`,
    solutionCode: `function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}
function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
function meetsWcagAA(hex1, hex2, isLargeText) {
  const ratio = getContrastRatio(hex1, hex2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}`,
    testCases: [
      { input: '"#000000", "#FFFFFF"', expected: "21", label: "Black on white is the maximum possible ratio, 21:1" },
      { input: '"#FFFFFF", "#FFFFFF"', expected: "1", label: "Identical colors give the minimum possible ratio, 1:1" },
      { input: 'meetsWcagAA("#000000", "#FFFFFF", false)', expected: "true", label: "21:1 passes AA for normal text (needs 4.5:1)" },
      { input: 'meetsWcagAA("#FFFFFF", "#FFFFFF", false)', expected: "false", label: "1:1 fails AA for normal text" },
    ],
    hints: [
      "Relative luminance is computed per channel first, then combined with the weights 0.2126 (red), 0.7152 (green), 0.0722 (blue).",
      "Which color is 'lighter' isn't about which argument comes first — always divide the larger luminance by the smaller.",
      "Large text's AA threshold (3:1) is lower than normal text's (4.5:1), not higher.",
    ],
    isPremium: false,
    orderIndex: 55,
  },
  {
    slug: "compute-tab-order",
    conceptSlug: "keyboard-navigation-focus-management",
    title: "Compute the real browser tab order",
    description: `Tab order isn't just "top to bottom" once tabindex enters the picture — this reproduces the actual browser algorithm.

## The problem

A page's real Tab order depends on more than DOM position: elements with a positive tabindex jump the queue entirely, and elements with tabindex="-1" are skipped by Tab altogether even though they're still in the DOM.

## The idea

Split elements into two groups — positive tabindex (sorted by tabindex value, ties broken by DOM order) and everything else with tabindex 0 or unset (sorted by DOM order) — then positive-tabindex elements always come first. Elements with tabindex="-1" are excluded entirely.

## Your task

Write \`computeTabOrder(elements)\`, where each element is \`{ id, tabIndex, domOrder }\`, returning an array of ids in real Tab order:

\`\`\`js
computeTabOrder([
  { id: "a", domOrder: 0 },
  { id: "b", tabIndex: 2, domOrder: 1 },
  { id: "c", tabIndex: 1, domOrder: 2 },
  { id: "d", tabIndex: -1, domOrder: 3 },
])
// → ["c", "b", "a"]
\`\`\``,
    difficulty: "medium",
    starterCode: `function computeTabOrder(elements) {
  // positive tabIndex first (sorted by tabIndex, then domOrder), then tabIndex 0/unset (sorted by domOrder), -1 excluded
}`,
    solutionCode: `function computeTabOrder(elements) {
  const positive = elements.filter((el) => el.tabIndex > 0);
  const zero = elements.filter((el) => !el.tabIndex || el.tabIndex === 0);
  positive.sort((a, b) => a.tabIndex - b.tabIndex || a.domOrder - b.domOrder);
  zero.sort((a, b) => a.domOrder - b.domOrder);
  return [...positive, ...zero].map((el) => el.id);
}`,
    testCases: [
      {
        input: '[{id:"a",domOrder:0},{id:"b",tabIndex:2,domOrder:1},{id:"c",tabIndex:1,domOrder:2},{id:"d",tabIndex:-1,domOrder:3},{id:"e",domOrder:4}]',
        expected: '["c","b","a","e"]',
        label: "Positive tabIndex elements come first in ascending order; tabIndex -1 is excluded",
      },
      {
        input: '[{id:"x",domOrder:2},{id:"y",domOrder:0},{id:"z",domOrder:1}]',
        expected: '["y","z","x"]',
        label: "With no tabIndex set on anything, order falls back to plain DOM order",
      },
      {
        input: '[{id:"p",tabIndex:1,domOrder:5},{id:"q",tabIndex:1,domOrder:2}]',
        expected: '["q","p"]',
        label: "A tie in tabIndex is broken by DOM order",
      },
    ],
    hints: [
      "tabIndex 0 and 'no tabIndex at all' (undefined) both belong in the same group as each other, not the positive group.",
      "!el.tabIndex is true for both 0 and undefined in JavaScript, which is exactly the group you want — just make sure -1 isn't falsy too (it isn't).",
      "Positive-tabIndex elements are sorted among themselves by tabIndex value, then by domOrder as the tiebreaker.",
    ],
    isPremium: true,
    orderIndex: 56,
  },
  {
    slug: "link-field-error",
    conceptSlug: "accessible-forms",
    title: "Wire up a field's error ARIA attributes",
    description: `The attributes that connect a form field to its own error message — computed correctly for both the error and no-error case.

## The problem

A field showing an error visually (a red border) means nothing to a screen reader unless \`aria-invalid\` and \`aria-describedby\` are actually set to point at that specific error text.

## The idea

When a field has an error, it needs \`aria-invalid: true\` and an \`aria-describedby\` pointing at a predictable id (\`\${id}-error\`). When it doesn't, both should reflect the field being valid — no dangling reference to an error element that isn't there.

## Your task

Write \`buildFieldAria(field)\`, where \`field\` is \`{ id, hasError }\`:

\`\`\`js
buildFieldAria({ id: "email", hasError: true })
// → { "aria-invalid": true, "aria-describedby": "email-error" }
buildFieldAria({ id: "email", hasError: false })
// → { "aria-invalid": false, "aria-describedby": undefined }
\`\`\``,
    difficulty: "medium",
    starterCode: `function buildFieldAria(field) {
  // return the correct { "aria-invalid", "aria-describedby" } pair for this field's error state
}`,
    solutionCode: `function buildFieldAria(field) {
  if (field.hasError) {
    return { "aria-invalid": true, "aria-describedby": \`\${field.id}-error\` };
  }
  return { "aria-invalid": false, "aria-describedby": undefined };
}`,
    testCases: [
      { input: '{ id: "email", hasError: true }', expected: '{ "aria-invalid": true, "aria-describedby": "email-error" }', label: "An errored field points aria-describedby at its predictable error id" },
      { input: '{ id: "email", hasError: false }', expected: '{ "aria-invalid": false, "aria-describedby": undefined }', label: "A valid field has no dangling aria-describedby reference" },
    ],
    hints: [
      "The error element's id follows a predictable convention: the field's own id, plus \"-error\".",
      "A valid field's aria-describedby should be undefined, not an empty string or a reference to a nonexistent element.",
    ],
    isPremium: true,
    orderIndex: 57,
  },
  {
    slug: "live-region-announcer-queue",
    conceptSlug: "aria-live-regions",
    title: "Implement an assertive-interrupts-polite announcer queue",
    description: `The scheduling rule behind aria-live's two politeness levels — modeled as a queue, not the DOM.

## The problem

"assertive" and "polite" aren't just labels — assertive announcements are meant to interrupt, and polite ones are meant to wait their turn, but a naive single FIFO queue treats every message identically regardless of politeness.

## The idea

Keep two separate queues. Flushing always drains the assertive queue first — even messages that arrived after older polite ones still jump ahead — and only falls back to the polite queue once no assertive messages remain.

## Your task

Write \`createAnnouncer()\`, returning \`{ announce(message, politeness), flush() }\` — \`flush()\` removes and returns the next message to announce (or \`null\` if both queues are empty):

\`\`\`js
const a = createAnnouncer();
a.announce("Saved", "polite");
a.announce("Error: network failed", "assertive");
a.flush() // → { message: "Error: network failed", politeness: "assertive" }
a.flush() // → { message: "Saved", politeness: "polite" }
\`\`\``,
    difficulty: "hard",
    starterCode: `function createAnnouncer() {
  // return { announce(message, politeness), flush() } — assertive always flushes before polite
}`,
    solutionCode: `function createAnnouncer() {
  let assertiveQueue = [];
  let politeQueue = [];
  return {
    announce(message, politeness) {
      if (politeness === "assertive") assertiveQueue.push(message);
      else politeQueue.push(message);
    },
    flush() {
      if (assertiveQueue.length) return { message: assertiveQueue.shift(), politeness: "assertive" };
      if (politeQueue.length) return { message: politeQueue.shift(), politeness: "polite" };
      return null;
    },
  };
}`,
    testCases: [
      {
        input: 'announce("Saved","polite"); announce("Error: network failed","assertive"); flush()',
        expected: '{ message: "Error: network failed", politeness: "assertive" }',
        label: "An assertive message jumps ahead of an already-queued polite one",
      },
      {
        input: "flush() again after the assertive message above",
        expected: '{ message: "Saved", politeness: "polite" }',
        label: "The polite message is still delivered once the assertive queue is empty",
      },
      {
        input: "flush() with both queues empty",
        expected: "null",
        label: "Flushing an empty announcer returns null instead of throwing",
      },
      {
        input: 'a second assertive message announced after a flush',
        expected: "it still interrupts",
        label: "Assertive priority applies every time flush is called, not just once",
      },
    ],
    hints: [
      "Two separate arrays, not one — politeness determines which queue a message goes into, not its position in a single queue.",
      "flush() should always check the assertive queue's length before even looking at the polite queue.",
      "Array.prototype.shift() both removes and returns the first element — exactly the FIFO behavior each queue needs.",
    ],
    isPremium: true,
    orderIndex: 58,
  },
  {
    slug: "combobox-keyboard-handler",
    conceptSlug: "accessible-component-patterns",
    title: "Implement a combobox's keyboard state machine",
    description: `The state transitions behind arrow-key navigation in an accessible combobox — as a pure state machine, no DOM involved.

## The problem

A combobox's keyboard behavior depends on more than the key pressed — the same ArrowDown key opens a closed list at its first option, but advances (and wraps) the highlighted option in an already-open one.

## The idea

Model the combobox as \`{ options, activeIndex, isOpen }\`. Handle each key as a pure transition: an unopened list responds only to the arrow that opens it; an open list responds to Home/End/Escape/Enter plus wrapping arrow-key movement.

## Your task

Write \`handleComboboxKey(state, key)\`, returning the new state:

\`\`\`js
handleComboboxKey({ options: ["Apple","Banana"], activeIndex: -1, isOpen: false }, "ArrowDown")
// → { options: ["Apple","Banana"], activeIndex: 0, isOpen: true }
\`\`\``,
    difficulty: "hard",
    starterCode: `function handleComboboxKey(state, key) {
  // pure state transition for ArrowDown/ArrowUp/Home/End/Escape/Enter, closed vs. open
}`,
    solutionCode: `function handleComboboxKey(state, key) {
  const { options, activeIndex, isOpen } = state;
  if (!isOpen) {
    if (key === "ArrowDown") return { options, activeIndex: 0, isOpen: true };
    if (key === "ArrowUp") return { options, activeIndex: options.length - 1, isOpen: true };
    return { ...state };
  }
  switch (key) {
    case "ArrowDown":
      return { options, activeIndex: (activeIndex + 1) % options.length, isOpen: true };
    case "ArrowUp":
      return { options, activeIndex: (activeIndex - 1 + options.length) % options.length, isOpen: true };
    case "Home":
      return { options, activeIndex: 0, isOpen: true };
    case "End":
      return { options, activeIndex: options.length - 1, isOpen: true };
    case "Escape":
      return { options, activeIndex: -1, isOpen: false };
    case "Enter":
      return { options, activeIndex, isOpen: false };
    default:
      return { ...state };
  }
}`,
    testCases: [
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:-1,isOpen:false}, "ArrowDown"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:0,isOpen:true}',
        label: "ArrowDown on a closed list opens it at the first option",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:2,isOpen:true}, "ArrowDown"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:0,isOpen:true}',
        label: "ArrowDown at the last option wraps back to the first",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:true}, "Escape"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:-1,isOpen:false}',
        label: "Escape closes the list and clears the active option entirely",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:true}, "Enter"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:false}',
        label: "Enter closes the list but keeps the selected option's index",
      },
    ],
    hints: [
      "Check isOpen first — a closed list only cares about the two arrow keys, everything else is a no-op.",
      "Wrapping math: (activeIndex + 1) % options.length handles the forward wrap; add options.length before the modulo for the backward wrap to avoid a negative result.",
      "Escape and Enter both close the list, but only Escape resets activeIndex to -1 — Enter is a selection, not a cancellation.",
    ],
    isPremium: true,
    orderIndex: 59,
  },
  {
    slug: "mini-a11y-linter",
    conceptSlug: "automated-a11y-testing",
    title: "Write a mini automated a11y rule checker",
    description: `A tiny version of what axe-core actually does — check a node against a fixed rule set and report what fails.

## The problem

Automated a11y tools work by mechanically checking a fixed set of rules against markup — this is two of the simplest, most common ones: images need alt text (unless decorative), and inputs need an accessible name.

## The idea

Given a simplified node \`{ tag, attrs }\`, apply only the rules relevant to that tag: an \`img\` needs \`alt\` unless it's marked decorative (\`role="presentation"\` or \`aria-hidden: true\`); an \`input\` needs an \`aria-label\` or \`aria-labelledby\`. Any other tag has no violations from this rule set.

## Your task

Write \`lintNode(node)\`, returning an array of violation message strings (empty if none):

\`\`\`js
lintNode({ tag: "img", attrs: {} }) // ["img missing alt text"]
lintNode({ tag: "img", attrs: { alt: "A dog" } }) // []
lintNode({ tag: "img", attrs: { role: "presentation" } }) // []
\`\`\``,
    difficulty: "hard",
    starterCode: `function lintNode(node) {
  // return an array of violation strings for this single node
}`,
    solutionCode: `function lintNode(node) {
  const violations = [];
  const attrs = node.attrs || {};
  if (node.tag === "img") {
    const isDecorative = attrs.role === "presentation" || attrs["aria-hidden"] === true;
    if (!isDecorative && !("alt" in attrs)) violations.push("img missing alt text");
  }
  if (node.tag === "input") {
    const hasName = Boolean(attrs["aria-label"] || attrs["aria-labelledby"]);
    if (!hasName) violations.push("input missing an accessible name");
  }
  return violations;
}`,
    testCases: [
      { input: '{ tag: "img", attrs: {} }', expected: '["img missing alt text"]', label: "An img with no alt attribute at all is flagged" },
      { input: '{ tag: "img", attrs: { alt: "A dog" } }', expected: "[]", label: "An img with any alt attribute passes, even if empty" },
      { input: '{ tag: "img", attrs: { role: "presentation" } }', expected: "[]", label: "A decorative img needs no alt attribute at all" },
      { input: '{ tag: "input", attrs: {} }', expected: '["input missing an accessible name"]', label: "An input with no accessible name is flagged" },
      { input: '{ tag: "div", attrs: {} }', expected: "[]", label: "Tags with no applicable rule always pass" },
    ],
    hints: [
      "\"alt\" in attrs checks that the attribute exists at all — even alt=\"\" should count as present.",
      "A decorative image is exempt from the alt-text rule entirely, checked before the alt-presence check runs.",
      "Only img and input have rules in this mini rule set — every other tag should return an empty array unconditionally.",
    ],
    isPremium: true,
    orderIndex: 60,
  },
  {
    slug: "pick-image-format-and-size",
    conceptSlug: "image-asset-optimization",
    title: "Pick the right image format and srcset width",
    description: `The two independent levers behind every "optimize this image" task — which format to serve, and which pixel width to serve it at.

## The problem

"Just compress the image" hides two separate decisions: which modern format actually fits this image's needs, and which of the available pre-generated widths is the smallest one that still covers the container at the current pixel density.

## The idea

Format depends on what the image needs to support (animation, transparency) more than on taste. Width depends purely on arithmetic: the target pixel width is \`containerWidth * dpr\`, and the right candidate is the smallest available width that's still \`>=\` that target — falling back to the largest available width if none is big enough.

## Your task

Write \`pickImageFormat({ hasTransparency, isPhoto, needsAnimation })\` returning \`"avif"\` or \`"webp"\`, and \`pickSrcsetWidth(containerWidth, dpr, availableWidths)\`:

\`\`\`js
pickImageFormat({ hasTransparency: false, isPhoto: true, needsAnimation: false }) // "avif"
pickSrcsetWidth(400, 2, [320, 640, 960, 1280]) // 960
\`\`\``,
    difficulty: "easy",
    starterCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  // "avif" for opaque, non-animated photos — "webp" otherwise
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  // smallest available width >= containerWidth * dpr, or the largest if none fit
}`,
    solutionCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  if (needsAnimation) return "webp";
  if (hasTransparency) return "webp";
  if (isPhoto) return "avif";
  return "webp";
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  const target = containerWidth * dpr;
  const sorted = [...availableWidths].sort((a, b) => a - b);
  const fit = sorted.find((w) => w >= target);
  return fit !== undefined ? fit : sorted[sorted.length - 1];
}`,
    testCases: [
      { input: '{ hasTransparency: false, isPhoto: true, needsAnimation: false }', expected: '"avif"', label: "An opaque photo picks AVIF for the best compression" },
      { input: '{ hasTransparency: true, isPhoto: false, needsAnimation: false }', expected: '"webp"', label: "A transparent graphic picks WebP" },
      { input: "pickSrcsetWidth(400, 2, [320, 640, 960, 1280])", expected: "960", label: "800px target (400 x 2 dpr) picks the smallest width that still covers it, 960" },
      { input: "pickSrcsetWidth(1000, 3, [320, 640, 960])", expected: "960", label: "When no candidate is big enough, fall back to the largest available" },
    ],
    hints: [
      "needsAnimation should override every other check — an animated image needs WebP regardless of transparency or photo content.",
      "The target pixel width is containerWidth multiplied by the device pixel ratio, not containerWidth alone.",
      "Sort the available widths first so 'smallest that still fits' and 'largest overall' are both simple array operations.",
    ],
    orderIndex: 61,
  },
  {
    slug: "split-shared-chunks",
    conceptSlug: "bundle-size-code-splitting",
    title: "Split a bundle into shared and per-route chunks",
    description: `The core signal a bundler starts from when deciding what goes in the shared chunk versus each route's own chunk.

## The problem

Given which modules each route imports, a naive bundle would duplicate every shared dependency (React, a UI library) into every single route's file. The fix is knowing exactly which modules qualify as "shared."

## The idea

A module used by exactly one route always stays in that route's own chunk. A module used by more than one route is at least a *candidate* for the shared chunk — real bundlers add size/request-count thresholds on top of this before actually splitting it out, but usage count is the starting signal this exercise models.

## Your task

Write \`splitChunks(routeModules)\`, where \`routeModules\` maps a route path to the array of module names it imports, returning \`{ shared, routes }\`:

\`\`\`js
splitChunks({
  "/home": ["react", "home-page", "utils"],
  "/about": ["react", "about-page", "utils"],
})
// → { shared: ["react", "utils"], routes: { "/home": ["home-page"], "/about": ["about-page"] } }
\`\`\``,
    difficulty: "medium",
    starterCode: `function splitChunks(routeModules) {
  // return { shared: [...], routes: { [route]: [...] } }
}`,
    solutionCode: `function splitChunks(routeModules) {
  const counts = new Map();
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      counts.set(mod, (counts.get(mod) || 0) + 1);
    }
  }
  const shared = [];
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      if (counts.get(mod) > 1 && !shared.includes(mod)) shared.push(mod);
    }
  }
  const routes = {};
  for (const route in routeModules) {
    routes[route] = routeModules[route].filter((m) => !shared.includes(m));
  }
  return { shared, routes };
}`,
    testCases: [
      {
        input: '{ "/a": ["react","a1"], "/b": ["react","b1"], "/c": ["react","utils","c1"] }',
        expected: '{ shared: ["react"], routes: { "/a": ["a1"], "/b": ["b1"], "/c": ["utils","c1"] } }',
        label: "A module used by three routes is shared; one used by a single route is not",
      },
      {
        input: '{ "/home": ["react","home-page","utils"], "/about": ["react","about-page","utils"] }',
        expected: '{ shared: ["react","utils"], routes: { "/home": ["home-page"], "/about": ["about-page"] } }',
        label: "Two modules shared across two routes both end up in the shared chunk",
      },
    ],
    hints: [
      "Count how many routes import each module first, before deciding anything.",
      "A module qualifies as shared purely by usage count (> 1) — it has nothing to do with which route it appears in first.",
      "Each route's own chunk is just its original module list with the shared ones filtered out.",
    ],
    isPremium: true,
    orderIndex: 62,
  },
  {
    slug: "classify-resource-loading-strategy",
    conceptSlug: "resource-loading-render-blocking",
    title: "Classify a resource's loading strategy",
    description: `Beyond "does this block rendering" — which of the six real loading strategies does a given resource actually use?

## The problem

Scripts and stylesheets can block the parser, but resource hints (\`preload\`, \`prefetch\`, \`preconnect\`) don't block anything at all — they only change when the browser starts a network step. Lumping every non-blocking resource into one bucket hides that distinction.

## The idea

A \`<link>\`'s \`rel\` decides its strategy directly (\`stylesheet\` still blocks; \`preload\`/\`prefetch\`/\`preconnect\` are hints, not blockers). A \`<script>\`'s \`async\`/\`defer\` flags decide its strategy; with neither, it blocks by default.

## Your task

Write \`classifyResource(resource)\`, where \`resource\` is \`{ tag: "script" | "link", rel?, async?, defer? }\`, returning one of \`"render-blocking" | "async" | "defer" | "preload" | "prefetch" | "preconnect"\`. Then write \`totalParseBlockingTime(resources)\`, summing the \`duration\` of only the resources that classify as \`"render-blocking"\`:

\`\`\`js
classifyResource({ tag: "link", rel: "stylesheet" }) // "render-blocking"
classifyResource({ tag: "script", async: true }) // "async"
\`\`\``,
    difficulty: "medium",
    starterCode: `function classifyResource(resource) {
  // return one of: "render-blocking" | "async" | "defer" | "preload" | "prefetch" | "preconnect"
}
function totalParseBlockingTime(resources) {
  // sum the duration of only the render-blocking resources
}`,
    solutionCode: `function classifyResource(resource) {
  if (resource.tag === "link") {
    if (resource.rel === "stylesheet") return "render-blocking";
    return resource.rel;
  }
  if (resource.async) return "async";
  if (resource.defer) return "defer";
  return "render-blocking";
}
function totalParseBlockingTime(resources) {
  return resources
    .filter((r) => classifyResource(r) === "render-blocking")
    .reduce((sum, r) => sum + (r.duration || 0), 0);
}`,
    testCases: [
      { input: '{ tag: "script" }', expected: '"render-blocking"', label: "A plain script with no async/defer blocks rendering" },
      { input: '{ tag: "script", defer: true }', expected: '"defer"', label: "A deferred script does not block rendering" },
      { input: '{ tag: "link", rel: "preconnect" }', expected: '"preconnect"', label: "A preconnect hint is its own strategy, not a blocker" },
      {
        input: '[{tag:"script",duration:100},{tag:"script",async:true,duration:50},{tag:"link",rel:"stylesheet",duration:30}]',
        expected: "130",
        label: "totalParseBlockingTime sums only the render-blocking resources' durations",
      },
    ],
    hints: [
      "A link's rel value that isn't 'stylesheet' is itself the strategy name — no extra mapping needed for preload/prefetch/preconnect.",
      "Check async before defer on a script — a script could theoretically carry both attributes, and async takes precedence in real browsers.",
      "totalParseBlockingTime should reuse classifyResource rather than re-implementing the blocking rule a second time.",
    ],
    isPremium: true,
    orderIndex: 63,
  },
  {
    slug: "rate-core-web-vitals",
    conceptSlug: "core-web-vitals",
    title: "Rate LCP, INP, and CLS against their real thresholds",
    description: `The exact published thresholds behind every "good/needs improvement/poor" badge in a real Core Web Vitals report.

## The problem

"Is this LCP good?" isn't a judgment call — Google publishes exact numeric thresholds per metric, and a page's overall rating is only as good as its worst individual metric.

## The idea

Each metric has its own good/poor cutoff (LCP and INP are lower-is-better durations; CLS is a lower-is-better unitless score). A value at or under the "good" cutoff is good; strictly over the "poor" cutoff is poor; anything between is "needs-improvement." The page's overall rating takes the worst rating among all three metrics.

## Your task

Write \`classifyMetric(metric, value)\` for \`"LCP"\` (ms, good ≤ 2500, poor > 4000), \`"INP"\` (ms, good ≤ 200, poor > 500), and \`"CLS"\` (good ≤ 0.1, poor > 0.25). Then write \`overallPageRating(metrics)\`, where \`metrics\` is \`{ LCP, INP, CLS }\`:

\`\`\`js
classifyMetric("LCP", 2000) // "good"
overallPageRating({ LCP: 4500, INP: 150, CLS: 0.05 }) // "poor"
\`\`\``,
    difficulty: "medium",
    starterCode: `function classifyMetric(metric, value) {
  // return "good" | "needs-improvement" | "poor" using the real published thresholds
}
function overallPageRating(metrics) {
  // the worst individual rating among LCP/INP/CLS wins
}`,
    solutionCode: `function classifyMetric(metric, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
  };
  const t = thresholds[metric];
  if (value <= t.good) return "good";
  if (value > t.poor) return "poor";
  return "needs-improvement";
}
function overallPageRating(metrics) {
  const ratings = Object.keys(metrics).map((m) => classifyMetric(m, metrics[m]));
  if (ratings.includes("poor")) return "poor";
  if (ratings.includes("needs-improvement")) return "needs-improvement";
  return "good";
}`,
    testCases: [
      { input: 'classifyMetric("LCP", 3000)', expected: '"needs-improvement"', label: "LCP between 2500 and 4000ms is needs-improvement" },
      { input: 'classifyMetric("CLS", 0.3)', expected: '"poor"', label: "CLS over 0.25 is poor" },
      { input: 'overallPageRating({ LCP: 2000, INP: 150, CLS: 0.05 })', expected: '"good"', label: "All three good metrics rate the page good" },
      { input: 'overallPageRating({ LCP: 4500, INP: 150, CLS: 0.05 })', expected: '"poor"', label: "A single poor metric makes the whole page poor" },
    ],
    hints: [
      "LCP and INP use millisecond thresholds; CLS uses a unitless score — don't mix them up in the threshold table.",
      "'Good' is inclusive (<=) at its cutoff; 'poor' is exclusive (> ) at its cutoff — the middle band handles everything else.",
      "overallPageRating should reuse classifyMetric for each metric rather than re-deriving the thresholds.",
    ],
    isPremium: true,
    orderIndex: 64,
  },
  {
    slug: "find-flame-chart-bottleneck",
    conceptSlug: "profiling-with-devtools",
    title: "Find the real bottleneck in a flame chart trace",
    description: `Self time versus total time — the distinction that separates the real bottleneck from a slow-looking wrapper function.

## The problem

The widest bar in a flame chart isn't necessarily the slow function — it might just be a thin wrapper around something slower underneath it. The function actually worth fixing is the one with the highest **self time**: time spent in that function alone, excluding its children.

## The idea

Walk the call tree recursively. A node's total time is its own \`selfTime\` plus every child's total time. The real bottleneck is whichever single node — anywhere in the tree — has the highest \`selfTime\` on its own.

## Your task

Write \`totalTime(node)\` and \`findBottleneck(node)\`, where each node is \`{ name, selfTime, children: [...] }\`:

\`\`\`js
const trace = {
  name: "render", selfTime: 10,
  children: [
    { name: "computeList", selfTime: 200, children: [] },
    { name: "paint", selfTime: 5, children: [{ name: "reflow", selfTime: 15, children: [] }] },
  ],
};
totalTime(trace) // 230
findBottleneck(trace) // "computeList"
\`\`\``,
    difficulty: "hard",
    starterCode: `function totalTime(node) {
  // node.selfTime + the totalTime of every child, recursively
}
function findBottleneck(node) {
  // the name of whichever node anywhere in the tree has the highest selfTime
}`,
    solutionCode: `function totalTime(node) {
  return node.selfTime + (node.children || []).reduce((sum, c) => sum + totalTime(c), 0);
}
function findBottleneck(node) {
  let best = { name: node.name, selfTime: node.selfTime };
  function walk(n) {
    if (n.selfTime > best.selfTime) best = { name: n.name, selfTime: n.selfTime };
    (n.children || []).forEach(walk);
  }
  walk(node);
  return best.name;
}`,
    testCases: [
      {
        input: '{ name:"render", selfTime:10, children:[{name:"computeList",selfTime:200,children:[]},{name:"paint",selfTime:5,children:[{name:"reflow",selfTime:15,children:[]}]}] }',
        expected: "230",
        label: "totalTime sums selfTime across the whole tree",
      },
      {
        input: "the same trace",
        expected: '"computeList"',
        label: "findBottleneck finds the highest selfTime anywhere in the tree, not just at the top level",
      },
    ],
    hints: [
      "totalTime is naturally recursive: a node's own selfTime plus the totalTime of each child.",
      "findBottleneck needs to walk every node in the tree, not just compare top-level children against each other.",
      "The root node itself is a candidate for the bottleneck too — don't start the comparison only from its children.",
    ],
    isPremium: true,
    orderIndex: 65,
  },
  {
    slug: "render-streamed-content-order",
    conceptSlug: "streaming-ssr-hydration",
    title: "Render streamed content in shell order, not arrival order",
    description: `The core insight behind streaming SSR: a chunk's arrival order has nothing to do with where it ends up on the page.

## The problem

Streamed sections resolve on the server in whatever order their data happens to finish — not necessarily the order they appear on the page. If the footer's data resolves before the main content's, does the footer render out of place?

## The idea

Each streamed chunk carries the id of the placeholder it belongs to, fixed by the original shell layout. However chunks arrive, each one just fills its own reserved slot — content not yet arrived stays as a skeleton placeholder.

## Your task

Write \`renderedContentAt(shellOrder, arrivedIds)\`, where \`shellOrder\` is the page's fixed layout order and \`arrivedIds\` is however many chunks have arrived so far (in arrival order) — return the shell positions, filling in arrived ids and \`"skeleton"\` for anything not yet arrived:

\`\`\`js
renderedContentAt(
  ["header", "sidebar", "main", "footer"],
  ["footer", "header"]
)
// → ["header", "skeleton", "skeleton", "footer"]
\`\`\``,
    difficulty: "hard",
    starterCode: `function renderedContentAt(shellOrder, arrivedIds) {
  // map shellOrder to itself where arrived, "skeleton" where not yet arrived
}`,
    solutionCode: `function renderedContentAt(shellOrder, arrivedIds) {
  return shellOrder.map((id) => (arrivedIds.includes(id) ? id : "skeleton"));
}`,
    testCases: [
      {
        input: 'renderedContentAt(["header","sidebar","main","footer"], ["footer","header"])',
        expected: '["header","skeleton","skeleton","footer"]',
        label: "Content keeps its shell position regardless of arrival order",
      },
      {
        input: 'renderedContentAt(["a","b","c"], [])',
        expected: '["skeleton","skeleton","skeleton"]',
        label: "Nothing arrived yet means every slot is still a skeleton",
      },
      {
        input: 'renderedContentAt(["a","b","c"], ["a","b","c"])',
        expected: '["a","b","c"]',
        label: "Once everything has arrived, the result matches the shell order exactly",
      },
    ],
    hints: [
      "The output array's length and position always match shellOrder — arrivedIds only decides which positions are filled in.",
      "Whether an id has 'arrived' is just an array membership check against arrivedIds.",
      "The order chunks arrived in never appears in the output — only which ones have arrived so far matters.",
    ],
    isPremium: true,
    orderIndex: 66,
  },
  {
    slug: "check-performance-budget",
    conceptSlug: "performance-budgets",
    title: "Check metrics against a performance budget",
    description: `The core mechanism behind every CI performance gate: measure, compare to the budget, and say pass or fail.

## The problem

A performance budget only works if it's actually enforced automatically — someone has to compute, for every metric that matters, whether the current build stayed under its limit.

## The idea

For each budgeted metric, a build passes if its actual value is at or under the budget's limit. The overall build only passes if every single budgeted metric passes — one failing metric fails the whole check.

## Your task

Write \`checkBudget(metrics, budgets)\`, where both are objects keyed by metric name, returning an array of \`{ metric, actual, budget, passed }\`. Then write \`overallBudgetStatus(results)\`, returning \`"pass"\` or \`"fail"\`:

\`\`\`js
checkBudget({ bundleSizeKb: 180, lcpMs: 3000 }, { bundleSizeKb: 170, lcpMs: 2500 })
// → [{ metric: "bundleSizeKb", actual: 180, budget: 170, passed: false }, { metric: "lcpMs", actual: 3000, budget: 2500, passed: false }]
\`\`\``,
    difficulty: "hard",
    starterCode: `function checkBudget(metrics, budgets) {
  // return [{ metric, actual, budget, passed }] for every key in budgets
}
function overallBudgetStatus(results) {
  // "pass" only if every result passed, otherwise "fail"
}`,
    solutionCode: `function checkBudget(metrics, budgets) {
  return Object.keys(budgets).map((metric) => ({
    metric,
    actual: metrics[metric],
    budget: budgets[metric],
    passed: metrics[metric] <= budgets[metric],
  }));
}
function overallBudgetStatus(results) {
  return results.every((r) => r.passed) ? "pass" : "fail";
}`,
    testCases: [
      {
        input: 'checkBudget({ bundleSizeKb: 150 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", actual: 150, budget: 170, passed: true }]',
        label: "A metric under its budget passes",
      },
      {
        input: 'checkBudget({ bundleSizeKb: 180 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", actual: 180, budget: 170, passed: false }]',
        label: "A metric over its budget fails",
      },
      {
        input: 'overallBudgetStatus(checkBudget({ bundleSizeKb: 180, lcpMs: 2000 }, { bundleSizeKb: 170, lcpMs: 2500 }))',
        expected: '"fail"',
        label: "One failing metric fails the whole build, even if others pass",
      },
    ],
    hints: [
      "Iterate over budgets' keys, not metrics' keys — the budget defines which metrics are actually being gated.",
      "passed is a plain <= comparison; nothing about it needs to be more clever than that.",
      "overallBudgetStatus should reuse the passed field checkBudget already computed, not re-run any comparisons.",
    ],
    isPremium: true,
    orderIndex: 67,
  },
  // ── system-design (Feature 48) ────────────────────────────────────────────
  {
    slug: "find-circular-component-imports",
    companies: ["LinkedIn"],
    conceptSlug: "component-driven-architecture",
    title: "Find a circular dependency in a component import graph",
    description: `The bug that turns a clean component tree into a tangled one: a cycle in the import graph.

## The problem

Component-driven architecture only stays reusable if the dependency direction is one-way — small components never import anything above them. When that breaks down (a shared \`Card\` accidentally imports a page-level component for "just one thing"), the import graph gets a cycle, and cycles cause real bundler/runtime problems (circular \`require\`s resolving to partially-initialized modules).

## The idea

Walk the graph with a depth-first search, tracking which nodes are on the *current* path (not just visited ever) — a node reappearing on the current path is exactly a cycle.

## Your task

Write \`findCycle(graph)\`, where \`graph\` is an adjacency list (\`{ [component]: string[] }\` of what it imports). Return the cycle as an array of component names, starting and ending on the repeated node, or \`null\` if the graph has none:

\`\`\`js
findCycle({ A: ["B"], B: ["C"], C: ["A"] })
// → ["A", "B", "C", "A"]
findCycle({ A: ["B"], B: ["C"], C: [] })
// → null
\`\`\``,
    difficulty: "medium",
    starterCode: `function findCycle(graph) {
  // DFS, tracking the current path — a repeated node on the path is a cycle
}`,
    solutionCode: `function findCycle(graph) {
  const visited = new Set();
  const stack = new Set();
  const path = [];
  function dfs(node) {
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const neighbor of graph[node] || []) {
      if (stack.has(neighbor)) {
        return [...path.slice(path.indexOf(neighbor)), neighbor];
      }
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor);
        if (result) return result;
      }
    }
    stack.delete(node);
    path.pop();
    return null;
  }
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const result = dfs(node);
      if (result) return result;
    }
  }
  return null;
}`,
    testCases: [
      {
        input: 'findCycle({ A: ["B"], B: ["C"], C: ["A"] })',
        expected: '["A", "B", "C", "A"]',
        label: "Detects a 3-node cycle",
      },
      {
        input: 'findCycle({ A: ["B"], B: ["C"], C: [] })',
        expected: "null",
        label: "Returns null for a simple chain",
      },
      {
        input: 'findCycle({ A: [], B: [] })',
        expected: "null",
        label: "Returns null with no edges at all",
      },
    ],
    hints: [
      "Track two sets: every node visited ever, and only the nodes currently on the path from the DFS root.",
      "A neighbor already visited but not on the current path is fine — it just means two components share a dependency, not a cycle.",
      "The cycle path is the slice of the current path starting from where the repeated node first appeared, plus that node again at the end.",
    ],
    isPremium: true,
    orderIndex: 68,
  },
  {
    slug: "plan-fetch-waterfall",
    companies: ["Uber", "Amazon"],
    conceptSlug: "api-design-data-fetching-strategy",
    title: "Group dependent data requests into parallel fetch waves",
    description: `The core planning step behind avoiding a request waterfall: figure out which requests can actually run at the same time.

## The problem

Fetching \`user\`, then \`posts\` (which needs \`user\`), then \`comments\` (which needs \`posts\`) one after another is a waterfall — but two independent requests with no dependency on each other shouldn't be forced to wait in line just because they were fetched at the same layer.

## The idea

Requests that have no unresolved dependencies can fire in the same wave. Once a wave resolves, some requests that depended only on that wave become fetchable in the next one.

## Your task

Write \`planFetchWaterfall(requests)\`, where \`requests\` is \`{ name, dependsOn: string[] }[]\`. Return an array of waves — each wave an array of names that can fetch in parallel — sorting names alphabetically within a wave for a deterministic result:

\`\`\`js
planFetchWaterfall([
  { name: "user", dependsOn: [] },
  { name: "settings", dependsOn: [] },
  { name: "posts", dependsOn: ["user"] },
])
// → [["settings", "user"], ["posts"]]
\`\`\``,
    difficulty: "hard",
    starterCode: `function planFetchWaterfall(requests) {
  // Repeatedly pull out every request whose dependsOn are all already resolved
}`,
    solutionCode: `function planFetchWaterfall(requests) {
  const byName = Object.fromEntries(requests.map((r) => [r.name, r]));
  const resolved = new Set();
  const waves = [];
  const remaining = new Set(requests.map((r) => r.name));
  while (remaining.size) {
    const wave = [...remaining].filter((name) => byName[name].dependsOn.every((d) => resolved.has(d)));
    if (wave.length === 0) throw new Error("circular dependency");
    wave.sort();
    for (const name of wave) { remaining.delete(name); resolved.add(name); }
    waves.push(wave);
  }
  return waves;
}`,
    testCases: [
      {
        input:
          'planFetchWaterfall([{ name: "user", dependsOn: [] }, { name: "posts", dependsOn: ["user"] }, { name: "comments", dependsOn: ["posts"] }])',
        expected: '[["user"], ["posts"], ["comments"]]',
        label: "A linear chain produces one request per wave",
      },
      {
        input:
          'planFetchWaterfall([{ name: "user", dependsOn: [] }, { name: "settings", dependsOn: [] }, { name: "posts", dependsOn: ["user"] }])',
        expected: '[["settings", "user"], ["posts"]]',
        label: "Independent requests share the first wave",
      },
    ],
    hints: [
      "A request belongs in the current wave if every name in its dependsOn has already been resolved in an earlier wave.",
      "Move every eligible request into the wave at once, not one at a time — that's what makes them parallel rather than sequential.",
      "Sort each wave's names before pushing it, so the result is deterministic regardless of the input array's order.",
    ],
    isPremium: true,
    orderIndex: 69,
  },
  {
    slug: "pick-realtime-transport",
    companies: ["Uber"],
    conceptSlug: "designing-real-time-updates",
    title: "Choose the right real-time transport for the constraints",
    description: `The decision behind every "polling vs. SSE vs. WebSocket" system design question, made concrete.

## The problem

Reaching for WebSockets "to be safe" adds bidirectional complexity a one-way feed never uses. The right transport depends on the actual constraints, not a default.

## The idea

Direction is the first fork: if the client ever needs to send data back over the same live channel, only a WebSocket does that. Otherwise, frequency and browser support decide between SSE and plain polling.

## Your task

Write \`chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired })\`, returning \`"websocket"\`, \`"sse"\`, or \`"polling"\`:

- \`needsBidirectional: true\` → \`"websocket"\`, always
- otherwise, \`browserSupportRequired: "legacy"\` → \`"polling"\` (no SSE/WebSocket support assumed)
- otherwise, \`updateFrequencySec <= 10\` → \`"sse"\`
- otherwise → \`"polling"\``,
    difficulty: "hard",
    starterCode: `function chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired }) {
  // bidirectional first, then legacy support, then frequency
}`,
    solutionCode: `function chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired }) {
  if (needsBidirectional) return "websocket";
  if (browserSupportRequired === "legacy") return "polling";
  if (updateFrequencySec <= 10) return "sse";
  return "polling";
}`,
    testCases: [
      {
        input:
          'chooseTransport({ needsBidirectional: true, updateFrequencySec: 1, browserSupportRequired: "modern" })',
        expected: '"websocket"',
        label: "Bidirectional always wins, regardless of frequency",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "modern" })',
        expected: '"sse"',
        label: "Frequent one-way updates pick SSE",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 60, browserSupportRequired: "modern" })',
        expected: '"polling"',
        label: "Infrequent updates fall back to polling",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "legacy" })',
        expected: '"polling"',
        label: "Legacy browser support forces polling even at high frequency",
      },
    ],
    hints: [
      "Check needsBidirectional first — nothing else matters if the client has to send data back over the same channel.",
      "browserSupportRequired === 'legacy' should short-circuit to polling before frequency is even considered.",
      "The frequency threshold only decides between SSE and polling, never between either of those and WebSocket.",
    ],
    isPremium: true,
    orderIndex: 70,
  },
  {
    slug: "merge-feed-page",
    companies: ["Meta", "TikTok"],
    conceptSlug: "designing-infinite-scroll-feed",
    title: "Merge a newly fetched feed page without duplicates",
    description: `The core operation behind a stable infinite-scroll feed: merging in a new page without corrupting what's already loaded.

## The problem

A feed re-fetching or re-rendering shouldn't duplicate an item that was already loaded — and it needs to remember the new cursor for the next fetch.

## The idea

Track which ids are already present. Append only the new page's items whose id hasn't been seen yet, preserving the existing order, then carry forward the new cursor.

## Your task

Write \`mergeFeedPage(existingItems, newPage)\`, where \`newPage\` is \`{ items: {id}[], nextCursor }\`. Return \`{ items, nextCursor }\`:

\`\`\`js
mergeFeedPage(
  [{ id: 1 }, { id: 2 }],
  { items: [{ id: 2 }, { id: 3 }], nextCursor: "c3" }
)
// → { items: [{ id: 1 }, { id: 2 }, { id: 3 }], nextCursor: "c3" }
\`\`\``,
    difficulty: "hard",
    starterCode: `function mergeFeedPage(existingItems, newPage) {
  // Append only items whose id isn't already present; carry forward nextCursor
}`,
    solutionCode: `function mergeFeedPage(existingItems, newPage) {
  const seen = new Set(existingItems.map((i) => i.id));
  const merged = [...existingItems];
  for (const item of newPage.items) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return { items: merged, nextCursor: newPage.nextCursor };
}`,
    testCases: [
      {
        input:
          'mergeFeedPage([{ id: 1 }, { id: 2 }], { items: [{ id: 2 }, { id: 3 }], nextCursor: "c3" })',
        expected: '{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], nextCursor: "c3" }',
        label: "Duplicate ids across the boundary aren't repeated",
      },
      {
        input: 'mergeFeedPage([], { items: [{ id: 1 }], nextCursor: "c1" })',
        expected: '{ items: [{ id: 1 }], nextCursor: "c1" }',
        label: "An empty starting feed just takes the new page",
      },
    ],
    hints: [
      "Build the seen-id set from existingItems before looking at newPage's items.",
      "Existing items keep their original order; only new, unseen items get appended at the end.",
      "The returned nextCursor always comes from newPage, never from the existing state.",
    ],
    isPremium: true,
    orderIndex: 71,
  },
  {
    slug: "transform-insert-operations",
    companies: ["Dropbox"],
    conceptSlug: "designing-realtime-collaborative-editor",
    title: "Transform a concurrent insert operation (Operational Transformation)",
    description: `The core mechanism behind Operational Transformation, reduced to its simplest case: two concurrent plain-text inserts.

## The problem

Two inserts computed against the same original text, both targeting position 5, can't both be applied at position 5 literally — one has to shift to account for the other already being there.

## The idea

Given an operation \`opA\` that's already been applied, adjust a concurrently-authored \`opB\` so that applying it next lands in the right place: if \`opB\`'s position is at or after \`opA\`'s, shift it forward by \`opA\`'s inserted text length; otherwise it's unaffected.

## Your task

Write \`transform(opA, opB)\`, where each op is \`{ pos, text }\`, returning the adjusted \`opB\`:

\`\`\`js
transform({ pos: 5, text: "X" }, { pos: 5, text: "Y" })
// → { pos: 6, text: "Y" } — Y now lands after X, not on top of it
transform({ pos: 5, text: "X" }, { pos: 2, text: "Y" })
// → { pos: 2, text: "Y" } — unaffected, Y was before X's position
\`\`\``,
    difficulty: "hard",
    starterCode: `function transform(opA, opB) {
  // Shift opB's position forward by opA's text length if opB.pos >= opA.pos
}`,
    solutionCode: `function transform(opA, opB) {
  if (opB.pos >= opA.pos) {
    return { ...opB, pos: opB.pos + opA.text.length };
  }
  return { ...opB };
}`,
    testCases: [
      {
        input: 'transform({ pos: 5, text: "X" }, { pos: 5, text: "Y" })',
        expected: '{ pos: 6, text: "Y" }',
        label: "A same-position concurrent insert shifts after the applied one",
      },
      {
        input: 'transform({ pos: 5, text: "X" }, { pos: 2, text: "Y" })',
        expected: '{ pos: 2, text: "Y" }',
        label: "An insert before the applied position is left untouched",
      },
      {
        input: 'transform({ pos: 2, text: "Hi" }, { pos: 5, text: "Y" })',
        expected: '{ pos: 7, text: "Y" }',
        label: "The shift amount always equals the applied op's text length",
      },
    ],
    hints: [
      "The comparison is opB.pos >= opA.pos, not just > — a tie means opB is treated as landing after opA.",
      "The shift amount is opA.text.length, not a fixed amount — a longer inserted string shifts everything after it further.",
      "An op whose position is strictly before opA's position is returned unchanged.",
    ],
    isPremium: true,
    orderIndex: 72,
  },
  {
    slug: "classify-architecture-fit",
    companies: ["Airbnb"],
    conceptSlug: "frontend-architecture-patterns",
    title: "Pick the right architecture for a team's actual constraints",
    description: `The decision tree behind "should this be a monolith, a monorepo, or micro-frontends?"

## The problem

Reaching for micro-frontends because a codebase feels big — rather than because separate teams are genuinely blocked by a shared deploy pipeline — trades a solvable code-organization problem for a harder distributed-systems one.

## The idea

Team count and the need for independent deploys are the two facts that actually decide this, not codebase size.

## Your task

Write \`classifyArchitectureFit({ teamCount, independentDeployNeeded })\`, returning \`"monolith"\`, \`"monorepo"\`, or \`"micro-frontend"\`:

- \`teamCount <= 1\` → \`"monolith"\`
- more than one team, no independent-deploy requirement → \`"monorepo"\`
- more than one team, independent deploys required → \`"micro-frontend"\``,
    difficulty: "hard",
    starterCode: `function classifyArchitectureFit({ teamCount, independentDeployNeeded }) {
  // teamCount decides monolith vs. multi-team; independentDeployNeeded decides the rest
}`,
    solutionCode: `function classifyArchitectureFit({ teamCount, independentDeployNeeded }) {
  if (teamCount <= 1) return "monolith";
  if (independentDeployNeeded) return "micro-frontend";
  return "monorepo";
}`,
    testCases: [
      {
        input: 'classifyArchitectureFit({ teamCount: 1, independentDeployNeeded: false })',
        expected: '"monolith"',
        label: "A single team never needs more than a monolith",
      },
      {
        input: 'classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: false })',
        expected: '"monorepo"',
        label: "Multiple teams sharing a release cadence fit a monorepo",
      },
      {
        input: 'classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: true })',
        expected: '"micro-frontend"',
        label: "Independent deploy requirements push toward micro-frontends",
      },
    ],
    hints: [
      "teamCount <= 1 short-circuits to monolith before independentDeployNeeded is even checked.",
      "The remaining split is entirely about independentDeployNeeded, not team count.",
      "There's no path back to monolith once teamCount > 1 — the choice is only monorepo vs. micro-frontend from there.",
    ],
    isPremium: true,
    orderIndex: 73,
  },
  {
    slug: "classify-state-layer",
    companies: ["Airbnb"],
    conceptSlug: "state-management-at-scale",
    title: "Classify a piece of state into its correct layer",
    description: `The decision every "where should this state live?" question ultimately reduces to.

## The problem

Putting server state in a generic global store — or hoisting local UI state into one — is the most common state-management mistake at scale.

## The idea

Whether data's source of truth is the server is checked first; then whether it's genuinely shared across the app; everything else is local.

## Your task

Write \`classifyStateLayer({ isServerData, isSharedAcrossRoutes })\`, returning \`"server"\`, \`"global"\`, or \`"local"\`:

- \`isServerData: true\` → \`"server"\`, regardless of the other flag
- otherwise, \`isSharedAcrossRoutes: true\` → \`"global"\`
- otherwise → \`"local"\``,
    difficulty: "hard",
    starterCode: `function classifyStateLayer({ isServerData, isSharedAcrossRoutes }) {
  // isServerData wins first; isSharedAcrossRoutes decides the rest
}`,
    solutionCode: `function classifyStateLayer({ isServerData, isSharedAcrossRoutes }) {
  if (isServerData) return "server";
  if (isSharedAcrossRoutes) return "global";
  return "local";
}`,
    testCases: [
      {
        input: 'classifyStateLayer({ isServerData: true, isSharedAcrossRoutes: false })',
        expected: '"server"',
        label: "Server-owned data is always server state",
      },
      {
        input: 'classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: true })',
        expected: '"global"',
        label: "Non-server state shared across routes is global",
      },
      {
        input: 'classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: false })',
        expected: '"local"',
        label: "Everything else defaults to local",
      },
    ],
    hints: [
      "isServerData is checked first and short-circuits everything else — a server-backed value is never global or local state.",
      "isSharedAcrossRoutes only matters once isServerData is false.",
      "The default case (neither flag set) is local, not global.",
    ],
    isPremium: true,
    orderIndex: 74,
  },
];

// ── Interview questions (5 per collection, plus concept-linked top-ups) ────────

const INTERVIEW_QUESTIONS: InterviewQuestionSeed[] = [
  // ff-75
  {
    collection: "ff-75",
    conceptSlug: "event-loop",
    question: "What is the event loop and why does it exist?",
    answer:
      "JavaScript is single-threaded — only one piece of code runs at a time. The event loop is the mechanism that lets it handle async work (timers, network requests, user events) without blocking. It continuously checks the call stack; when the stack is empty, it processes the microtask queue fully, then picks one task from the task queue, runs it to completion, and repeats.\n\nThis matters because blocking the call stack for even a few hundred milliseconds will make the UI unresponsive — the event loop is what lets JavaScript appear concurrent.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 1,
  },
  {
    collection: "ff-75",
    conceptSlug: "equality-type-coercion",
    question: "What is the difference between `null` and `undefined` in JavaScript?",
    answer:
      "`undefined` means a variable has been declared but not yet assigned a value — it's the runtime's default. `null` is an explicit absence of value intentionally set by the programmer.\n\nKey differences: `typeof undefined` is `'undefined'`; `typeof null` is `'object'` (a historical bug in JS). `undefined == null` is `true` (loose equality), but `undefined === null` is `false` (strict equality). Always use strict equality to distinguish them.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 2,
  },
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Explain CSS specificity and how conflicts are resolved.",
    answer:
      "When multiple CSS rules target the same element, the browser uses specificity to decide which rule wins. Specificity is a three-part score: [id, class, element]. IDs contribute to the first bucket, class selectors / attribute selectors / pseudo-classes to the second, and type selectors / pseudo-elements to the third.\n\nThe scores are compared left-to-right: a rule with any ID wins over one with no IDs, regardless of how many classes the loser has. If specificity ties, the last rule in source order wins. `!important` overrides all specificity and should be avoided.",
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 3,
  },
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What happens when you type a URL in the browser and press Enter?",
    answer:
      "1. **DNS resolution** — the browser resolves the hostname to an IP address, checking its cache, then the OS, then a DNS resolver.\n2. **TCP + TLS handshake** — a connection is established; HTTPS negotiates a TLS session.\n3. **HTTP request** — the browser sends a GET request; the server responds with HTML.\n4. **HTML parsing** — the browser parses HTML top-to-bottom, constructing the DOM. When it encounters `<link rel='stylesheet'>` it fetches CSS (render-blocking). `<script>` without `async`/`defer` is also render-blocking.\n5. **Render pipeline** — DOM + CSSOM → Render Tree → Layout → Paint → Composite → pixels on screen.\n6. **Subsequent requests** — images, fonts, JS, etc. are fetched as discovered.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft", "Stripe"],
    orderIndex: 4,
  },
  {
    collection: "ff-75",
    conceptSlug: "equality-type-coercion",
    question: "What is the difference between `==` and `===` in JavaScript?",
    answer:
      "`===` (strict equality) checks both value and type — no coercion. `==` (loose equality) performs type coercion before comparing, following a complex set of rules that can produce surprising results:\n\n```js\n0 == false   // true  (false coerces to 0)\n'' == false  // true\nnull == undefined // true\nnull == 0   // false\n```\n\nAlways prefer `===` unless you specifically need the `null == undefined` coercion (checking for either), which is the one common legitimate use of `==`.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 5,
  },
  // css-specificity concept top-ups (queried by concept_id on the Interview tab)
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "How do you calculate the specificity of a selector like `#nav ul.menu li a`?",
    answer:
      "Count the selector's parts into three buckets `[id, class, element]`:\n\n1. **IDs** — `#nav` → 1\n2. **Classes / attributes / pseudo-classes** — `.menu` → 1\n3. **Elements / pseudo-elements** — `ul`, `li`, `a` → 3\n\nSo the score is `[1, 1, 3]`. Comparison is left-to-right, and a higher bucket always dominates: `[1, 0, 0]` (a single `#id`) beats `[0, 10, 0]` (ten classes), because the first bucket is compared before the second. The universal selector `*` and combinators (`>`, `+`, `~`, whitespace) add nothing.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 6,
  },
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Why is using `!important` discouraged, and what problems does it cause?",
    answer:
      "`!important` overrides the entire specificity calculation, so the normal cascade no longer explains why a rule wins. That causes real problems:\n\n- **Escalation** — the only way to beat an `!important` is another `!important`, so one usage tends to breed more\n- **Debugging pain** — DevTools shows a rule winning even though a far more specific selector exists\n- **Broken overrides** — utility classes and component variants silently stop working\n\nLegitimate uses are narrow: overriding third-party styles you can't edit, or utility helpers like `.hidden { display: none !important }`. Prefer raising specificity or fixing source order instead.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 7,
  },
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "When two rules have equal specificity, how does the browser decide which wins?",
    answer:
      "When specificity ties, **source order** decides — the rule that appears later in the stylesheet (or in the later-loaded stylesheet) wins.\n\n```css\n.btn { color: blue; }\n.btn { color: green; } /* wins — same specificity, later */\n```\n\nThis is why the order you import stylesheets matters, and why utility-first frameworks depend on a predictable final layer. Note that the full cascade also weighs **origin and importance** (user-agent < user < author, with `!important` flipping the order) *before* specificity — but within the same origin and importance, specificity first, then source order.",
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 8,
  },
  {
    collection: "ff-75",
    conceptSlug: "css-specificity",
    question: "Do inline styles have specificity, and how do they compare to selectors?",
    answer:
      "Yes. An inline `style` attribute sits in a bucket *above* all selectors — think of it as `[1, 0, 0, 0]`, a fourth column to the left of `[id, class, element]`. So any inline style beats any selector-based rule, no matter how specific the selector is.\n\nThe only thing that overrides an inline style is a declaration marked `!important` in a stylesheet. This is a big reason inline styles are hard to override and are usually avoided for anything beyond dynamic, one-off values set by JavaScript.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 9,
  },
  // browser-rendering-pipeline concept top-ups
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What is the difference between the DOM and the CSSOM, and why does the browser build both?",
    answer:
      "The **DOM** (Document Object Model) is the tree the browser builds by parsing HTML — it represents the page's content and structure. The **CSSOM** (CSS Object Model) is the tree built by parsing CSS — it represents the style rules and how they cascade onto elements.\n\nThe browser needs both because content and presentation are separate inputs. It then combines them into the **Render Tree** — only the nodes that will actually be displayed, each with its computed styles attached. Both must be ready before the render tree can be built, which is why CSS is render-blocking: the browser won't paint content it might immediately have to restyle.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 10,
  },
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What is the difference between layout (reflow) and paint, and why does it matter for performance?",
    answer:
      "**Layout (reflow)** computes the geometry of every element — position and size. **Paint** fills in the pixels — colors, text, borders, shadows.\n\nWhy it matters: layout is expensive because changing one element's size can cascade to its siblings and descendants. Properties that trigger layout (`width`, `top`, `margin`, `font-size`) are costlier to animate than paint-only properties (`color`, `background`).\n\nThe cheapest changes are **composite-only** — `transform` and `opacity` — because they can be handled by the GPU without re-running layout or paint. That's the reason `transform: translate()` is preferred over animating `top`/`left`.",
    difficulty: "hard",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 11,
  },
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "What does 'render-blocking' mean, and which resources block rendering?",
    answer:
      "A render-blocking resource is one the browser must fetch and process **before** it can paint the first pixels.\n\n- **CSS** is render-blocking by default — the browser won't paint until the CSSOM is ready, to avoid a flash of unstyled content\n- **Synchronous `<script>`** (no `async`/`defer`) is parser-blocking: it halts HTML parsing until the script downloads and runs\n\nMitigations:\n1. Add `defer` (or `async`) to scripts so parsing continues\n2. Inline critical CSS and lazy-load the rest\n3. Use `media` attributes so non-matching stylesheets don't block\n4. Preload key fonts to avoid a later reflow",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 12,
  },
  {
    collection: "ff-75",
    conceptSlug: "browser-rendering-pipeline",
    question: "Why can an element be in the DOM but not appear in the render tree?",
    answer:
      "The render tree contains only nodes that are actually painted, so some DOM nodes are deliberately excluded:\n\n- Elements with `display: none` — removed from the render tree entirely (they take up no space)\n- Non-visual nodes like `<head>`, `<meta>`, `<script>`, `<title>`\n\nA key contrast: `visibility: hidden` and `opacity: 0` elements **do** stay in the render tree — they still occupy layout space, they're just not visible. Only `display: none` drops out. This is exactly why the render tree can be smaller than the DOM, and why toggling `display: none` triggers layout while toggling `visibility` only triggers paint.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 13,
  },
  // Phase 10 (Feature 41) — one flagship question per new JS Runtime concept,
  // matching the existing 1-per-concept ff-75 pattern above.
  {
    collection: "ff-75",
    conceptSlug: "hoisting-temporal-dead-zone",
    question:
      "What is hoisting in JavaScript, and how does it differ between var, let/const, and function declarations?",
    answer:
      "Before executing a scope, the engine registers every declaration it contains — that registration step is hoisting. The three kinds behave differently once hoisted:\n\n- **Function declarations** are hoisted with their full body available — you can call one before its line in the file.\n- **`var`** is hoisted and immediately initialized to `undefined` — reading it early gives `undefined`, not an error.\n- **`let`/`const`** are hoisted but left uninitialized until their declaration line runs. Reading them earlier throws a `ReferenceError` — this window is the **temporal dead zone (TDZ)**.\n\nThe TDZ is a deliberate improvement over `var`'s silent `undefined` — it turns a use-before-declare mistake into an immediate, loud error instead of a bug that surfaces somewhere else entirely.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 14,
  },
  {
    collection: "ff-75",
    conceptSlug: "closures",
    question:
      "What does this log, and why? `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i)); }`",
    answer:
      "It logs `3`, `3`, `3` — not `0`, `1`, `2` as most people expect.\n\n`var` creates a single shared binding for the entire loop, not one per iteration. All three arrow functions close over that same `i`, so by the time any of the `setTimeout` callbacks actually run (after the loop has already finished), `i` is `3` for all of them.\n\nSwapping `var` for `let` fixes it — `let` creates a **new binding per iteration**, so each closure captures its own snapshot (`0`, `1`, `2`) instead of one shared variable.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 15,
  },
  {
    collection: "ff-75",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What is a higher-order function? Give an example from the array methods you use daily.",
    answer:
      "A higher-order function is any function that takes another function as an argument, returns a function, or both — possible because functions are ordinary values in JavaScript.\n\n`Array.prototype.map`, `.filter`, and `.reduce` are all higher-order functions: each one accepts a callback and calls it for you. `map` calls it once per item and collects the return values; `filter` calls it once per item and keeps the ones where it returns `true`; `reduce` calls it once per item while carrying an accumulator forward.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 16,
  },
  {
    collection: "ff-75",
    conceptSlug: "array-object-methods-immutability",
    question: "Why do map/filter/reduce return new arrays instead of mutating the original, and why does that matter?",
    answer:
      "They're designed as pure transformations — given the same array and callback, they always produce a new array without touching the input. This matters because nothing else holding a reference to the original array gets silently surprised by a change it didn't expect.\n\nIt matters even more once state lives in a UI framework: React's rendering model compares an old reference to a new one to decide whether to re-render. That comparison only works correctly if updates always produce new arrays/objects instead of mutating existing ones — a mutated-in-place array still looks 'the same' to React and won't trigger a re-render at all.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 17,
  },
  {
    collection: "ff-75",
    conceptSlug: "this-binding-execution-context",
    question:
      "What does this log, and why? `const obj = { name: 'A', greet() { setTimeout(function () { console.log(this.name); }); } }; obj.greet();`",
    answer:
      "It logs `undefined` (or throws in strict mode), not `'A'`.\n\n`this` is determined by how a function is *called*, not where it's defined. `setTimeout`'s callback is invoked as a plain function call — no object to the left of a dot — so `this` inside it is `globalThis`/`undefined`, not `obj`, even though the callback is written lexically inside `greet`.\n\nThe fix is an arrow function for the callback (`setTimeout(() => console.log(this.name))`), since arrow functions don't have their own `this` and instead inherit it from `greet`'s method-call `this`, which is `obj`.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 18,
  },
  {
    collection: "ff-75",
    conceptSlug: "prototypal-inheritance",
    question: "What is the difference between `__proto__` and `prototype`?",
    answer:
      "`prototype` is a property that exists on **functions** (specifically constructor functions) — it's the object that becomes the `[[Prototype]]` of every instance created with `new Fn()`.\n\n`__proto__` is an accessor that exists on **instances** — it's the (informally standardized, but widely supported) way to read or set an object's actual internal `[[Prototype]]` link directly. `instance.__proto__ === Fn.prototype` for any instance created via `new Fn()`. `Object.getPrototypeOf(instance)` is the modern, preferred way to read the same link.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 19,
  },
  {
    collection: "ff-75",
    conceptSlug: "esm-vs-commonjs",
    question: "What's the core difference between ES Modules and CommonJS, and why does it affect tree-shaking?",
    answer:
      "ES Modules' `import`/`export` are **static** — they must appear at a module's top level, so a bundler can read the entire dependency graph just by parsing the file, before running any code. CommonJS's `require()` is a normal function call that can appear anywhere, including conditionally, so what a module actually needs is only knowable by executing it.\n\nBecause ESM's graph is knowable ahead of time, a bundler can prove an export is never imported anywhere and safely delete it — **tree-shaking**. CommonJS's dynamic `require()` calls can't be analyzed with the same confidence, so CommonJS code tends to ship larger, less-optimized bundles.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 20,
  },
  {
    collection: "ff-75",
    conceptSlug: "promises-async-await",
    question: "What happens if you forget to `await` an async function call inside another async function?",
    answer:
      "The call still starts running immediately — `async` functions execute synchronously up to their first `await` regardless of whether the caller awaits them. What you lose is the **result**: without `await`, you get back the Promise object itself, not its resolved value, and your code moves on immediately instead of waiting.\n\nIt also breaks error handling — a rejection from the un-awaited call won't be caught by a surrounding `try/catch`, since that `catch` only wraps code that's actually waiting on the Promise. It becomes an unhandled promise rejection instead.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 21,
  },
  {
    collection: "ff-75",
    conceptSlug: "debouncing-throttling",
    question: "What's the difference between debounce and throttle, and when would you use each?",
    answer:
      "**Debounce** delays running a function until a pause — every new call resets the timer, so only the final call in a burst actually runs. Use it when only the end state matters: search-as-you-type, form validation, autosave.\n\n**Throttle** runs a function at most once per fixed interval, no matter how many calls come in. Use it when the handler needs to keep responding continuously throughout activity, not just once it stops: scroll progress bars, resize-driven layout recalculation, drag handlers.",
    difficulty: "easy",
    companies: ["Meta", "Amazon", "Stripe"],
    orderIndex: 22,
  },
  {
    collection: "ff-75",
    conceptSlug: "function-composition-currying",
    question: "What is function composition, and why is it useful in real code?",
    answer:
      "Composition builds a new function by chaining smaller ones together — the output of one becomes the input of the next, so `compose(f, g)(x)` is `f(g(x))`.\n\nIt's useful because each composed function stays small and single-purpose, and the pipeline itself reads as a description of the overall transformation (e.g. `compose(slugify, lower, trim)`) rather than one large function doing everything at once — easier to test and reuse each individual step in isolation.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 23,
  },
  {
    collection: "ff-75",
    conceptSlug: "memory-management-leaks",
    question: "What causes memory leaks in JavaScript, given that it has automatic garbage collection?",
    answer:
      "The garbage collector only frees memory that's **unreachable** — it has no concept of 'unused.' A leak happens when some reference you didn't realize you were still holding keeps an object reachable long after you actually stopped needing it.\n\nThe most common patterns: forgotten event listeners (never removed, so their closures stay alive), detached DOM nodes still referenced by a variable after being removed from the page, stray long-lived closures referencing large data, and uncleared `setInterval`/`setTimeout` timers.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 24,
  },
  {
    collection: "ff-75",
    conceptSlug: "generators-iterators",
    question: "What is a generator function, and what problem does it solve that a regular function can't?",
    answer:
      "A generator function (`function*`) can pause itself mid-execution with `yield` and resume exactly where it left off on the next `.next()` call — a regular function always runs start-to-finish in one go with no way to pause partway through.\n\nThis makes generators the natural fit for lazy, on-demand sequences: an infinite sequence (like natural numbers) can never be fully computed by a regular function, but a generator only computes the next value when actually asked for one, so it works fine even for a sequence with no end.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 25,
  },

  // ff-javascript
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "Explain how prototypal inheritance works in JavaScript.",
    answer:
      "Every JavaScript object has an internal `[[Prototype]]` link to another object (or `null`). When you access a property, the engine first checks the object itself, then walks the prototype chain until it finds the property or reaches `null`.\n\nYou set up inheritance by linking prototypes: `Object.create(parentProto)` creates an object whose `[[Prototype]]` is `parentProto`. The `class` syntax is syntactic sugar over this mechanism — `extends` sets up the prototype chain and `super()` calls the parent constructor. Understanding the underlying chain explains why `instanceof` works, why methods can be shared across instances, and what `hasOwnProperty` guards against.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 1,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "What is a closure and when would you use one?",
    answer:
      "A closure is a function that retains access to the variables from its defining scope, even after that scope has returned. Every function in JavaScript closes over its surrounding scope.\n\nCommon uses:\n- **Private state** — module pattern, encapsulating variables that shouldn't be directly accessible\n- **Partial application / currying** — baking some arguments into a function\n- **Event handlers** — the handler closes over the relevant state at setup time\n- **Memoization** — a closure holds the cache object\n\nThe gotcha: all closures from the same scope share the same variable binding, so closures created in a `for` loop with `var` all see the final value of the loop variable unless you use `let` or an IIFE.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe", "Airbnb"],
    orderIndex: 2,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.any`, and `Promise.race`?",
    answer:
      "All four accept an iterable of promises:\n\n- **`Promise.all`** — resolves when all resolve, rejects immediately if any rejects (short-circuits). Use when you need every result and a single failure should abort.\n- **`Promise.allSettled`** — waits for every promise regardless of outcome, resolves with an array of `{ status, value/reason }` objects. Use when you need all outcomes.\n- **`Promise.any`** — resolves with the first successful result, rejects only if all reject (with an `AggregateError`). Use for fallback/racing to first success.\n- **`Promise.race`** — settles with the first promise to settle (resolve or reject). Use for timeouts.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 3,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "Explain the `this` keyword and how it's determined.",
    answer:
      "`this` is determined at call time, not definition time (except for arrow functions):\n\n1. **Regular function call** — `this` is `globalThis` (or `undefined` in strict mode)\n2. **Method call** — `obj.method()` → `this` is `obj`\n3. **Constructor call** — `new Fn()` → `this` is the new instance\n4. **Explicit binding** — `.call(ctx)`, `.apply(ctx)`, `.bind(ctx)` → `this` is `ctx`\n5. **Arrow function** — no own `this`; inherits from the enclosing lexical scope at definition time\n\nThe last rule is why arrow functions are preferred for callbacks: they don't rebind `this`, so a method using `setTimeout(() => this.update(), 100)` keeps the intended receiver.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft"],
    orderIndex: 4,
  },
  {
    collection: "ff-javascript",
    question: "What is event delegation and why is it useful?",
    answer:
      "Event delegation attaches a single event listener to a parent element instead of one listener per child, exploiting the fact that events bubble up the DOM tree.\n\n```js\ndocument.querySelector('#list').addEventListener('click', (e) => {\n  if (e.target.matches('li')) handleItem(e.target);\n});\n```\n\nWhy it matters:\n- **Performance** — one listener vs. potentially thousands\n- **Dynamic children** — works for elements added to the DOM after the listener is attached (the classic problem with directly-bound handlers)\n- **Memory** — fewer listeners means less memory retained\n\nThe tradeoff: the handler must check `e.target` to identify which child fired the event, adding a little logic overhead.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 5,
  },
  // event-loop concept top-ups (queried by concept_id on the Interview tab)
  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "What is the difference between the microtask queue and the task (macrotask) queue?",
    answer:
      "Both hold callbacks waiting to run, but they're drained differently:\n\n- **Microtask queue** — `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`. After each task, the event loop drains the **entire** microtask queue before doing anything else.\n- **Task (macrotask) queue** — `setTimeout`, `setInterval`, I/O, UI events. The loop takes **one** task per iteration.\n\nThe order each loop iteration: run one task → drain all microtasks → render (if needed) → repeat. This is why a promise callback always runs before a `setTimeout(…, 0)` queued at the same time — microtasks jump ahead of the next task.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 6,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question:
      "What does this log, and why? `console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4);`",
    answer:
      "It logs `1`, `4`, `3`, `2`.\n\n1. `console.log(1)` — synchronous, runs now\n2. `setTimeout(…)` — its callback goes to the **task queue**\n3. `Promise.resolve().then(…)` — its callback goes to the **microtask queue**\n4. `console.log(4)` — synchronous, runs now\n\nThe synchronous code finishes first (`1`, `4`). The call stack is now empty, so the loop drains all microtasks before touching tasks — `3` prints. Only then does the next task run — `2`. Microtasks always beat tasks queued in the same tick.",
    difficulty: "medium",
    companies: ["Meta", "Amazon", "Stripe"],
    orderIndex: 7,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "Does `setTimeout(fn, 0)` run `fn` immediately? Why or why not?",
    answer:
      "No. `setTimeout(fn, 0)` schedules `fn` as a **task** to run *as soon as possible*, but not before the current synchronous code finishes and the microtask queue is drained.\n\nThe `0` is a *minimum* delay, not a guarantee — the browser also clamps nested timeouts to ~4ms and won't run the callback while the call stack is busy. So `setTimeout(fn, 0)` really means \"run `fn` after the current execution and all pending microtasks complete,\" which is a common trick to defer work until after the current call stack unwinds.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 8,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "How does `async`/`await` interact with the event loop?",
    answer:
      "`async`/`await` is syntax over promises, so it runs on the **microtask** queue. When execution hits `await`, the async function pauses and returns control to the caller; everything *after* the `await` is scheduled as a microtask that resumes once the awaited value settles.\n\n```js\nasync function f() {\n  console.log('a');\n  await null;        // suspend here\n  console.log('b');  // resumes as a microtask\n}\nf();\nconsole.log('c');\n// logs: a, c, b\n```\n\nSo code after `await` never runs synchronously — it always yields to the microtask queue first, even when awaiting an already-resolved value.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 9,
  },

  // hoisting-temporal-dead-zone concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Are function declarations and function expressions hoisted the same way?",
    answer:
      "No. A **function declaration** (`function foo() {}`) is hoisted completely — both its name and its body are available from the top of the scope, so you can call it before its line in the file.\n\nA **function expression** (`const foo = function () {}` or `const foo = () => {}`) is not — only the variable declaration hoists, following that declaration's own rules. With `var`, the variable exists but is `undefined` until the assignment runs, so calling it early throws `TypeError: foo is not a function`. With `let`/`const`, it's in the TDZ, so calling it early throws a `ReferenceError` instead.",
    difficulty: "easy",
    companies: ["Amazon", "Meta"],
    orderIndex: 10,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "What does this log? `console.log(typeof x); var x = 5;`",
    answer:
      "It logs `\"undefined\"`. `var x` is hoisted to the top of its scope and pre-initialized to `undefined` before any code runs, so `typeof x` at that point sees a real (if unassigned) variable — not a missing one. `typeof` on a truly undeclared identifier would also return `\"undefined\"`, which is exactly why this particular check can't distinguish 'hoisted but not yet assigned' from 'never declared at all.'",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 11,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Why does accessing a `let` variable inside its temporal dead zone throw instead of quietly returning `undefined` like `var` would?",
    answer:
      "It's a deliberate design choice made when `let`/`const` were introduced. `var`'s silent `undefined` hides a real class of bugs — a use-before-declare mistake fails quietly and the actual bug surfaces somewhere downstream, far from its real cause.\n\nThrowing immediately inside the TDZ turns that same mistake into a loud, immediate error at the exact point it happened, matching `const`'s existing requirement that a binding be initialized before use. This consistency is part of why modern style guides default to `let`/`const` and treat `var` as legacy.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 12,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Is `const` hoisted?",
    answer:
      "Yes — exactly like `let`. Both are hoisted to the top of their scope but left uninitialized until their declaration line actually executes, so accessing either one earlier throws a `ReferenceError` inside the temporal dead zone.\n\nWhat's different about `const` is only what happens *after* initialization: its binding can never be reassigned. The hoisting behavior itself is identical to `let`.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 13,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "What's a real bug that hoisting explains, beyond a predict-the-output puzzle?",
    answer:
      "A `var` declared inside an `if` block or nested function doesn't create a new binding scoped to that block — `var` hoists to the nearest enclosing **function** scope, not the block. Reusing a variable name inside a conditional can silently overwrite an outer variable of the same name, because there's only ever one `var` binding for the whole function, no matter how many nested blocks re-declare it.\n\n`let`/`const` don't have this problem — they're genuinely block-scoped, so a re-declaration inside an `if` creates a real, separate binding that doesn't touch the outer one.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 14,
  },

  // equality-type-coercion concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "What does the abstract equality algorithm do differently when comparing an object to a primitive?",
    answer:
      "The object is converted to a primitive first — via its `valueOf()`, then `toString()` if needed — and *that* result is compared using the usual primitive coercion rules.\n\n```js\n[1] == 1; // true — [1] converts to \"1\" via toString, then to the number 1\n```\n\nThis is why array/object comparisons via `==` can look bizarre — the object is never compared 'as itself,' only whatever primitive it happens to convert to.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 15,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "Why is `Object.is` sometimes preferred over `===` for certain comparisons?",
    answer:
      "`Object.is` behaves like `===` for almost everything, but handles two edge cases differently: it treats `NaN` as equal to itself (`NaN === NaN` is `false`, but `Object.is(NaN, NaN)` is `true`), and it distinguishes `+0` from `-0` (`+0 === -0` is `true`, but `Object.is(+0, -0)` is `false`).\n\nThese edge cases matter in specific algorithms (checking for `NaN` without `Number.isNaN`, or code that cares about the sign of zero) and are exactly why React's internal `Object.is`-based comparison for `useState` bailouts can differ subtly from a naive `===` check.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 16,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "What does `[] == ![]` evaluate to, and why?",
    answer:
      "`true` — a classic coercion trick question.\n\n1. `![]` — `[]` is truthy, so negating it gives `false`.\n2. `[] == false` — the array coerces to a primitive: `[].toString()` is `\"\"`, and `\"\"` coerces to the number `0`. `false` also coerces to `0`.\n3. `0 == 0` — `true`.\n\nEach step is individually explainable, but chaining them together produces a result that looks nonsensical unless you trace every coercion step by step.",
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 17,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "How would you safely compare two values without any of `==`'s coercion surprises, including `NaN`?",
    answer:
      "Default to `===` for everyday comparisons — it never coerces, so `1 === '1'` is simply `false`, no surprises. For the rarer case where `NaN` or the sign of zero specifically matters, use `Object.is(a, b)` instead, since `===` alone can't distinguish `NaN` from itself or `+0` from `-0`.\n\nThe one place `==` earns its keep is an intentional `value == null` check, which is `true` for both `null` and `undefined` and `false` for everything else, including falsy values like `0` and `''`.",
    difficulty: "easy",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 18,
  },

  // closures concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "How would you implement a private counter using closures, without any class syntax?",
    answer:
      "```js\nfunction makeCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    get: () => count,\n  };\n}\n\nconst counter = makeCounter();\ncounter.increment();\ncounter.get(); // 1\ncounter.count; // undefined — count is not accessible directly\n```\n\n`count` only exists inside `makeCounter`'s scope — the only way to read or change it is through the functions returned alongside it, which is exactly what makes it 'private': there's no property on the returned object exposing the raw variable.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 19,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "What's the difference between a closure and simply passing a value as a function argument?",
    answer:
      "A closure keeps a **live reference** to the actual variable binding — if the outer scope's variable changes later, the closure sees the updated value. An argument, by contrast, is a copy of whatever value it was at call time (for primitives) — later changes to the original variable in the caller's scope have no effect on an already-passed argument.\n\nThis is exactly why two closures sharing the same outer scope can observe each other's updates to a shared variable, while two functions that each received a copied argument cannot.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 20,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "Can closures cause memory leaks? How?",
    answer:
      "Yes. If something keeps a closure alive longer than intended — a forgotten event listener, an uncleared `setInterval` — and that closure references a large object, the object stays reachable (and therefore un-collectable) for as long as the closure exists, even if nothing actually needs it anymore.\n\nThis is the same underlying mechanism the Memory Management & Leaks concept covers in depth: garbage collection only frees *unreachable* memory, and a live closure referencing something is enough to keep it reachable.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 21,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question:
      "What does this log, and why? `function outer() { let x = 1; function inner() { console.log(x); } x = 2; return inner; } outer()();`",
    answer:
      "It logs `2`, not `1`.\n\nClosures capture the **live binding** of a variable, not a snapshot of its value at the moment the inner function was created. By the time `inner` actually runs (after `outer` has already returned it), `x` has already been reassigned to `2` inside `outer`'s body — and `inner`'s closure sees that updated value, because it was always reading the same `x`, not a copy of it.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 22,
  },

  // callbacks-higher-order-functions concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What is 'callback hell,' and what patterns fixed it?",
    answer:
      "Callback hell is the deeply nested, hard-to-read code that results from chaining several async operations, each depending on the previous one's result, using nested callbacks — the classic 'pyramid of doom' shape.\n\nPromises fixed the nesting by letting `.then()` calls chain flatly instead of nesting. `async`/`await` went further, letting the same async logic read almost exactly like synchronous code, with `try/catch` handling errors the same way it would for sync code.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 23,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "How would you implement your own version of `Array.prototype.filter` using a plain loop?",
    answer:
      "```js\nfunction myFilter(array, predicate) {\n  const result = [];\n  for (let i = 0; i < array.length; i++) {\n    if (predicate(array[i], i, array)) {\n      result.push(array[i]);\n    }\n  }\n  return result;\n}\n```\n\nSame shape as `map` underneath — loop over the array, call the callback for each item — the only difference is `filter` uses the callback's return value as a keep/discard decision instead of a transformation.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 24,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What's the difference between `forEach` and `map`?",
    answer:
      "`forEach` calls the callback once per item purely for its side effects and always returns `undefined` — there's no way to get a transformed array back out of it. `map` calls the callback once per item and collects every return value into a **new array**.\n\nReaching for `forEach` when you actually want a transformed array is a common mistake — it forces you to manually push into an external array instead of just using `map`'s return value directly.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 25,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "Why are array methods like map/filter/reduce called 'higher-order functions' if map itself isn't the callback?",
    answer:
      "`map` is higher-order because it **accepts** a function as an argument — the callback you pass in is just a regular function, not itself higher-order. It's `map`'s acceptance (and, for some patterns, return) of a function that qualifies it as higher-order, not anything special about the callback itself.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 26,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "How does `reduce` differ fundamentally from `map` and `filter`?",
    answer:
      "`map` and `filter` always return arrays (the same length, or shorter). `reduce` can return **any single value** — a number, a string, an object, even a brand-new array — by folding the whole input array through an accumulator, one item at a time.\n\nThat generality is also why `reduce` is often the least readable of the three in practice — it can technically reimplement `map` or `filter` itself, but doing so usually trades away clarity for a flexibility the simpler method already provided.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 27,
  },

  // array-object-methods-immutability concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question:
      "What's wrong with `state.items.push(newItem)` in a React-like state update, even though `push` technically works?",
    answer:
      "`push` mutates the existing array in place and returns the new length — not a new array. React (and similar frameworks) detect updates by comparing the old state reference to a new one; since `push` never produces a new reference, the comparison sees 'no change' and skips the re-render entirely, even though the array's contents did change.\n\nThe fix is a non-mutating equivalent: `[...state.items, newItem]` or `state.items.concat(newItem)`, both of which return a genuinely new array.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 28,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "How would you remove an item from an array immutably, by index?",
    answer:
      "```js\nconst withoutIndex = (arr, i) => arr.filter((_, index) => index !== i);\n// or, equivalently:\nconst withoutIndex2 = (arr, i) => [...arr.slice(0, i), ...arr.slice(i + 1)];\n```\n\nBoth return a brand-new array with the target index excluded, leaving the original array (and every other item's reference) untouched — unlike `arr.splice(i, 1)`, which mutates the original array in place.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 29,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "Is spreading an object (`{ ...obj }`) a deep or shallow copy?",
    answer:
      "Shallow. Spread copies an object's own top-level properties into a new object, but any nested object or array inside it is still the **same reference** as in the original. Mutating a nested value through the 'copy' also mutates the original's nested value, since both point at the identical inner object.\n\nA true deep copy needs `structuredClone(obj)` or a recursive copy — spread alone only protects the top level.",
    difficulty: "medium",
    companies: ["Meta", "Microsoft"],
    orderIndex: 30,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "Which common array methods mutate their array, and which don't?",
    answer:
      "**Mutating** (change the array in place): `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`.\n\n**Non-mutating** (return a new array, original untouched): `map`, `filter`, `concat`, `slice`, `flat`, spread (`[...arr]`), and the newer `toSorted`/`toReversed`/`toSpliced` variants added specifically to give non-mutating equivalents of the mutating originals.\n\n`sort` and `reverse` are the two that catch people most often — they look like they should return a new array, but they mutate in place and return a reference to that same, now-mutated array.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 31,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "How would you sort an array without mutating the original?",
    answer:
      "`[...arr].sort(compareFn)` — spread first to create a shallow copy, then sort that copy, leaving the original array's order untouched. Newer engines also support `arr.toSorted(compareFn)` directly, a non-mutating equivalent added specifically to avoid needing the spread step.\n\nCalling `arr.sort(compareFn)` directly mutates `arr` in place and returns the same (now-reordered) array reference — easy to miss if you expected it to behave like `map`/`filter`.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 32,
  },

  // this-binding-execution-context concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "What does `this` refer to inside an arrow function defined at the top level of a module?",
    answer:
      "`undefined`. Arrow functions never have their own `this` — they always look outward to the enclosing scope for it. At a module's top level there's no enclosing function to inherit from, and ES modules always run in strict mode, so there's no `globalThis` fallback either — the result is `undefined`.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 33,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question:
      "How does `this` behave differently inside a regular function versus an arrow function passed as an event listener callback?",
    answer:
      "A **regular function** used as a listener has `this` set to the element the listener is attached to — the browser invokes it in a method-call-like way. An **arrow function** has no `this` of its own, so it inherits `this` from whatever scope it was lexically defined in — often not the element at all, and frequently `undefined` if defined at a module's top level.\n\nThis is why regular functions are still sometimes preferred for listeners that specifically need `this` to be the element (e.g. `this.classList.toggle(...)`), while arrow functions are preferred when you want to keep the surrounding `this`.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 34,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "What does `Function.prototype.call` do differently from `.apply`?",
    answer:
      "Both invoke the function immediately with a given `this` — the only difference is how the remaining arguments are passed. `fn.call(ctx, a, b)` takes them individually; `fn.apply(ctx, [a, b])` takes them as a single array.\n\nThey're otherwise functionally identical, and the spread operator (`fn.call(ctx, ...argsArray)`) has made `apply`'s array-based calling convention largely redundant in modern code, though it still shows up in older codebases and some `bind` polyfills.",
    difficulty: "easy",
    companies: ["Amazon", "Stripe"],
    orderIndex: 35,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question:
      "Why do class methods sometimes lose their `this` when passed as a callback (e.g. as an event handler), and how do you fix it?",
    answer:
      "A class method is just a function sitting on the class's prototype — passing it as a bare reference (`element.addEventListener('click', instance.method)`) detaches it from `instance` exactly the same way any plain object method would be detached. By the time it's called, there's no object to the left of a dot, so `this` isn't `instance` anymore.\n\nThree common fixes: bind it in the constructor (`this.method = this.method.bind(this)`), declare it as an arrow-function class field (`method = () => { ... }`), or wrap the call site (`() => instance.method()`).",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 36,
  },

  // prototypal-inheritance concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What does `Object.create(null)` do, and why would you use it?",
    answer:
      "It creates an object with **no prototype at all** — not even `Object.prototype`. That means it has none of the usual inherited methods (`toString`, `hasOwnProperty`, `valueOf`, etc.).\n\nThis is useful for a plain dictionary/map-like object, where you never want an inherited key (like `toString`) to accidentally collide with a real data key you're storing — a genuinely 'empty' object rather than one that merely looks empty until you check its inherited surface.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 37,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What's the difference between an object's own property and an inherited property?",
    answer:
      "An **own** property is defined directly on the object itself. An **inherited** property is found only by walking up the object's prototype chain — it isn't actually stored on the object.\n\n`obj.hasOwnProperty('key')` (or the newer `Object.hasOwn(obj, 'key')`) distinguishes the two. `for...in` iterates both own and inherited enumerable properties, which is exactly why it's usually paired with a `hasOwnProperty` check (or replaced with `Object.keys`, which only returns own properties) in real code.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 38,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "How does a longer prototype chain affect property lookup performance?",
    answer:
      "Every extra link in the chain is an extra step the engine has to check before a lookup for a missing property finally resolves at `null`. For any single lookup this cost is tiny, but it's a real, non-zero cost that grows with chain depth — one of the practical reasons deeply nested class hierarchies are generally discouraged in favor of flatter composition, alongside the more commonly cited readability and flexibility concerns.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 39,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What's the difference between `Object.getPrototypeOf(obj)` and `obj.constructor.prototype`?",
    answer:
      "They're usually the same object, but `constructor` is just an ordinary, overridable property that happens to live on the prototype — if it's reassigned, or the object was built via `Object.create(proto)` without explicitly resetting `constructor`, `obj.constructor.prototype` can point somewhere unexpected.\n\n`Object.getPrototypeOf(obj)` always reflects the object's real internal `[[Prototype]]` link directly, regardless of whether `constructor` was set up correctly — it's the more reliable of the two.",
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 40,
  },

  // esm-vs-commonjs concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why can't you use top-level `await` in a CommonJS module, but you can in an ES module?",
    answer:
      "ESM's loading model is inherently asynchronous and graph-aware, so a top-level `await` can suspend that module's own evaluation without blocking anything unrelated to it. CommonJS's `require()` is synchronous by design — there's no equivalent async suspension point available at a CommonJS module's top level, since the whole system assumes loading completes instantly and in order.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 41,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "What does `\"type\": \"module\"` in `package.json` actually change?",
    answer:
      "It tells Node to treat `.js` files in that package as ES Modules (`import`/`export`) by default, instead of CommonJS (`require`/`module.exports`). Without it, Node assumes CommonJS for `.js` files, and you'd need the `.mjs` extension on a specific file to opt that one file into ESM instead.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 42,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why can importing a CommonJS package from an ESM file sometimes produce a 'no default export' surprise?",
    answer:
      "CommonJS only ever exports one thing — the `module.exports` object — so ESM's interop layer treats that whole object as the package's default export. Named exports you might expect (`import { thing } from 'cjs-package'`) are Node's best-effort static analysis of the CJS module's shape, which doesn't always succeed, especially when `module.exports` is built up dynamically rather than as a static object literal.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 43,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "What is a circular dependency, and how do CJS and ESM handle it differently?",
    answer:
      "A circular dependency is two (or more) modules that import each other, directly or through a chain. CommonJS resolves it by handing back whatever's on the `exports` object **at the moment** the circular `require()` runs — some exports may still be `undefined` if they're assigned later in the file.\n\nESM's `import` bindings are **live references**, not copied values — a circularly-imported binding that hasn't been assigned yet is still accessible as a reference, and correctly reflects its real value once the module finishes evaluating, rather than staying frozen at whatever it was at import time.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 44,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why do bundlers care so much about the difference between ESM and CommonJS?",
    answer:
      "Because it directly determines how well they can optimize the output. ESM's static `import`/`export` let a bundler analyze the full dependency graph ahead of time and prove that a given export is never used anywhere, then delete it — tree-shaking. CommonJS's dynamic `require()` calls (which can be conditional, or have a computed path) can't be analyzed with the same certainty, so CommonJS code included in a bundle is much harder to shake, and tends to ship larger than an equivalent ESM module would.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 45,
  },

  // promises-async-await concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "What happens if a Promise executor function throws synchronously?",
    answer:
      "The Promise automatically rejects with the thrown error — you don't need to manually catch it and call `reject()` yourself. `new Promise((resolve, reject) => { throw new Error('boom'); })` produces a rejected Promise with that error as the rejection reason, exactly as if `reject(new Error('boom'))` had been called directly.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 46,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "How would you implement a timeout wrapper around a Promise that might never settle?",
    answer:
      "```js\nfunction withTimeout(promise, ms) {\n  const timeout = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error('timed out')), ms)\n  );\n  return Promise.race([promise, timeout]);\n}\n```\n\n`Promise.race` settles as soon as the **first** of its inputs settles — pairing the real promise against a timer-based rejection gives you a bounded wait even for a promise that would otherwise hang forever.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 47,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question:
      "Why is an `async function` different from a plain function that manually returns a Promise, when they can look similar?",
    answer:
      "The key difference is error handling. An `async function` automatically wraps a synchronously-thrown error into a **rejected Promise** — `try/catch` inside it works uniformly whether the error came from a synchronous throw or an awaited rejection.\n\nA plain function that just returns `new Promise(...)` doesn't get this for free: if it throws synchronously *before* even constructing the Promise, that error propagates immediately to the caller as a regular thrown exception, not as a rejection — a subtle but real difference in how callers need to handle failures.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 48,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "Why does an unhandled Promise rejection matter, and how would you make sure one never slips through?",
    answer:
      "A rejected Promise with no `.catch()` (or no surrounding `try/catch` around its `await`) anywhere in its chain surfaces as an 'unhandled promise rejection' — most runtimes log it loudly, and in Node it can even crash the process depending on configuration, since it usually signals a real, un-recovered failure.\n\nThe fix is discipline, not a special API: every `await`ed call should sit inside a `try/catch` (or its Promise chain should end in `.catch()`), and every 'fire and forget' async call should still have an explicit `.catch()` attached, even if it just logs the error.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 49,
  },

  // debouncing-throttling concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Would you use debounce or throttle for an autosave feature, and why?",
    answer:
      "Debounce. Autosave only cares about the **final** state once the user stops typing — firing a save on every keystroke would be wasteful and could even save an in-progress, incomplete edit. A short debounce delay after the last keystroke is exactly the 'wait for a pause' behavior autosave needs.",
    difficulty: "easy",
    companies: ["Google", "Notion"],
    orderIndex: 50,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "What's a 'leading edge' versus 'trailing edge' debounce?",
    answer:
      "**Trailing** (the default, and the version most simple implementations build) runs *after* the pause — once calls stop arriving, the delayed call fires. **Leading** runs immediately on the very first call in a burst, then ignores subsequent calls until a pause occurs.\n\nLeading-edge debounce is useful for things like preventing a double-submit on a fast double-click — you want the very first click to register immediately, not delayed until the user stops clicking.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 51,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "How would you implement throttle so it guarantees the very last call in a burst still eventually runs?",
    answer:
      "A basic throttle just drops calls that arrive before the interval elapses, which can silently lose the final, most up-to-date call in a burst. A 'trailing' throttle fixes this by tracking a pending flag alongside the last-run timestamp — if a call arrives before the interval elapses, it schedules (rather than drops) one trailing call for exactly when the interval does elapse, so the burst's final value is never lost, just delayed slightly.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 52,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Why does debounce's `.cancel()` method matter in a real component?",
    answer:
      "Without it, a debounced function scheduled right before a component unmounts (or a search input clears) still fires later — against a component that's gone, or state that's now stale. `.cancel()` gives cleanup code (like a `useEffect` cleanup function) a way to discard the pending call explicitly, instead of letting it fire into a context that no longer expects it.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 53,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Give a real example where throttle is clearly the better choice over debounce.",
    answer:
      "An infinite-scroll 'am I near the bottom yet' check on the `scroll` event. You want this evaluated at a steady rate **throughout** the scroll, not just once after the user stops scrolling — which is exactly what debounce would give you, missing the continuous progress checks the feature actually needs to trigger loading more content while still scrolling.",
    difficulty: "easy",
    companies: ["Twitter", "LinkedIn"],
    orderIndex: 54,
  },

  // function-composition-currying concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What is point-free style, and how does composition enable it?",
    answer:
      "Point-free style writes a function's transformation without ever naming the data ('the point') it operates on. `const cleanSlug = compose(slugify, lower, trim);` never mentions the string being transformed at all — it only describes the pipeline.\n\nComposition is what makes this possible: instead of writing `(s) => slugify(lower(trim(s)))`, which does name the argument, `compose` lets you describe the same pipeline as data — a list of functions to run in sequence — with no argument name needed anywhere.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 55,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "Why is composition typically written right-to-left, matching `f(g(x))`, rather than left-to-right?",
    answer:
      "It mirrors how nested function calls already read, both mathematically and in code — `compose(f, g)(x)` behaves exactly like writing `f(g(x))` by hand. Some libraries (lodash's `flow`, for example) offer a left-to-right 'pipe' variant instead, purely as a readability preference for people who find reading top-to-bottom/left-to-right more natural for a pipeline. The underlying mechanism — chaining outputs into inputs — is identical either way.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 56,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What's the practical benefit of currying a function like `add(a, b, c)` over just calling it normally?",
    answer:
      "Currying enables **partial application** — fixing some arguments early to produce a smaller, more specific, reusable function. `const addTax = curriedAdd(0.08)` bakes the tax rate in via closure, and the resulting function can be reused across many different prices without re-specifying the rate each time — something a normal multi-argument function can't do without writing a separate wrapper by hand.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 57,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "How would you compose two functions where one is async and returns a Promise?",
    answer:
      "A standard synchronous `compose` breaks here — it would try to call the next function with a Promise instead of the resolved value. An async-aware composition helper needs to `await` each step's result before calling the next function, chaining them sequentially (via `async`/`await` or `.then()`) rather than calling every function synchronously in one pass.",
    difficulty: "hard",
    companies: ["Google", "Amazon"],
    orderIndex: 58,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What's a real downside of overusing composition and currying in application code?",
    answer:
      "Heavily curried and composed code can be genuinely harder to debug — a stack trace shows a chain of many small, often anonymous functions instead of one clear call site, and stepping through in DevTools means jumping between many tiny functions instead of reading through one readable block of logic. It's a real tradeoff, not a free win — reserve it for genuinely reusable transformation pipelines, not every function in the codebase.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 59,
  },

  // memory-management-leaks concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's the difference between a memory leak and just using a lot of memory?",
    answer:
      "Using a lot of memory for something the app genuinely still needs is expected and fine. A **leak** is memory that stays reachable — and therefore never freed — even though the code no longer has any real use for it. The distinguishing test is behavioral: repeat the same action over and over (open/close a modal, navigate to a page and back) and watch whether memory keeps climbing indefinitely, or whether it settles back down after each cycle.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 60,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "Why do detached DOM nodes show up as a distinct category in Chrome DevTools' Memory panel?",
    answer:
      "A detached node — removed from the visible page but still referenced by a lingering JS variable — is a very common and easily fixed leak pattern, so DevTools calls it out specifically rather than making you infer it from generic object counts. Seeing 'Detached HTMLDivElement (12)' growing across repeated actions is an immediate, specific signal pointing at exactly what to go fix.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 61,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "How can an accidental global variable cause a memory leak?",
    answer:
      "Anything attached to the global object (`window`/`globalThis`) stays reachable for the entire lifetime of the page, since the global object itself is always reachable from the engine's roots. An accidentally-global variable — forgetting a declaration keyword in non-strict code, for instance — that ends up referencing a large object keeps that object alive indefinitely, with no scope ever going out of existence to release it.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 62,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's the specific benefit of `WeakMap`/`WeakSet` for avoiding leaks?",
    answer:
      "A `WeakMap` holds its keys **weakly** — if nothing else in the program still references a key object, that object can be garbage collected even while it's technically still 'in' the `WeakMap`. A regular `Map` holds a strong reference to every key, keeping each one (and its associated value) alive for as long as the `Map` itself exists, even after nothing else needs it — exactly the kind of accidental retention that causes leaks in long-lived caches.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 63,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's a practical first step when you suspect a leak, before diving into heap snapshots?",
    answer:
      "Reproduce the suspected action repeatedly — open and close the same modal ten times, navigate to a page and back ten times — and watch the Performance/Memory panel's overall usage trend. A real leak shows a persistent upward climb that never comes back down even after a forced garbage collection; normal fluctuation rises and falls with each cycle. Confirming the trend first tells you whether a deeper heap-snapshot comparison is even worth doing.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 64,
  },

  // generators-iterators concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "How do you pass a value back into a generator via `.next(value)`?",
    answer:
      "Whatever you pass to `.next(value)` becomes the result of the `yield` expression that was paused, waiting to resume.\n\n```js\nfunction* g() {\n  const x = yield 1;\n  console.log(x);\n}\nconst it = g();\nit.next();    // { value: 1, done: false } — pauses at `yield 1`\nit.next(5);   // resumes with x = 5, logs 5\n```\n\nThe first `.next()` call's argument is always discarded, since there's no `yield` expression yet waiting to receive it — it only starts the generator running up to its first `yield`.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 65,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "What does `yield*` do?",
    answer:
      "It delegates iteration to another iterable or generator. `yield* otherGenerator()` yields every value `otherGenerator` produces, one at a time, as if each had been `yield`ed directly in the outer generator — rather than yielding the inner generator object itself as a single value. It's the generator equivalent of spreading one array into another.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 66,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "What is `Symbol.iterator`, and how does it relate to generators?",
    answer:
      "`Symbol.iterator` is the well-known symbol every iterable must implement — an object with a `[Symbol.iterator]` method that returns an iterator (something with a `.next()` method). This is exactly what `for...of`, spread, and destructuring rely on under the hood.\n\nA generator function's returned object already satisfies this protocol automatically, which is why generators are the easiest way to make a custom data structure work with `for...of` — you don't have to hand-implement `.next()`/`{ value, done }` yourself.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 67,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "Can a generator's `.return()` method matter for cleanup?",
    answer:
      "Yes. Calling `it.return(value)` — or breaking out of a `for...of` loop early, which does this implicitly — causes any `try/finally` block currently paused inside the generator to run its `finally` clause immediately, as if a `return` had been hit right there. This matters for a generator that opened a resource (a file handle, a subscription) and needs to close it even when its consumer stops iterating early instead of exhausting it fully.",
    difficulty: "hard",
    companies: ["Amazon"],
    orderIndex: 68,
  },
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "How does an async generator (`async function*`) differ from a regular generator?",
    answer:
      "Each yielded value can itself come from an awaited async operation, and it's consumed with `for await...of` instead of plain `for...of`. This is useful for lazily streaming paginated API results — awaiting each page's fetch, then yielding its items one at a time — without needing to load every page into memory upfront the way a plain array-returning function would have to.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 69,
  },

  // ff-react
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "When does React re-render a component?",
    answer:
      "React re-renders a component in three situations:\n\n1. **Its own state changes** — via `setState` (class) or a state setter from `useState`/`useReducer`\n2. **Its parent re-renders** — by default, React re-renders all children when a parent re-renders, regardless of whether props changed\n3. **A context it consumes changes** — any component calling `useContext` re-renders when the context value changes\n\nTo opt out of parent-triggered re-renders, wrap the component in `React.memo`. To stabilize callbacks and objects passed as props (so `memo` actually helps), use `useCallback` and `useMemo`. The most common performance mistake is adding `memo`/`useCallback` before profiling — they have overhead too.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 1,
  },
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is the difference between `useEffect` and `useLayoutEffect`?",
    answer:
      "`useEffect` runs **after** the browser has painted — asynchronously. `useLayoutEffect` runs **before** the browser paints — synchronously after React commits DOM changes.\n\nUse `useLayoutEffect` when you need to read layout from the DOM (e.g. `getBoundingClientRect()`) and apply a change before the user sees the initial paint, preventing a visual flash. Otherwise, prefer `useEffect` — it doesn't block painting.\n\nPractical rule: start with `useEffect`. If you see a flicker on initial render, consider `useLayoutEffect`. On the server, `useLayoutEffect` does not run at all — prefer `useEffect` for SSR-safe logic.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 2,
  },
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "Explain the React reconciliation algorithm.",
    answer:
      "Reconciliation is how React decides what changed between renders and what DOM updates are needed.\n\nKey rules:\n1. **Different types → full remount** — if the element type changes (e.g. `<div>` → `<span>`), React destroys the old subtree and mounts a new one\n2. **Same type → update in place** — React updates only the changed attributes/children\n3. **Lists need keys** — when rendering arrays, React uses `key` props to match old and new children. Without stable keys, React resorts to positional matching, which causes incorrect updates (and subtle bugs) when items are reordered or added at the beginning\n\nThe algorithm runs in O(n) time by making two assumptions: elements of different types produce different trees, and keys identify stable elements across renders.",
    difficulty: "medium",
    companies: ["Meta", "Google", "Airbnb"],
    orderIndex: 3,
  },
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is the purpose of `useRef` and when should you use it over `useState`?",
    answer:
      "`useRef` returns a mutable object `{ current: value }` that persists across renders but does **not** trigger a re-render when changed.\n\nUse `useRef` when:\n- **DOM access** — attaching to an element with `ref={myRef}` to call `.focus()`, measure layout, etc.\n- **Storing mutable values** that shouldn't cause re-renders — timer IDs, previous values, event handler references, imperative library instances\n- **Breaking stale closure problems** — store the latest value of a prop/state in a ref so an event handler always reads the current value\n\nIf a change should update the UI, use `useState`. If it's internal bookkeeping that doesn't affect rendering, use `useRef`.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 4,
  },
  {
    collection: "ff-react",
    conceptSlug: "react-rendering",
    question: "What is React Suspense and how does it work?",
    answer:
      "Suspense lets components declare that they're waiting for something (data, a lazy-loaded component) before rendering. While waiting, React shows a fallback UI defined by the nearest `<Suspense fallback={...}>` boundary.\n\nHow it works: a component 'suspends' by throwing a Promise. React catches it, renders the fallback, and retries the component when the Promise resolves. You don't throw the Promise manually — libraries like React Query, Relay, or `React.lazy` do it for you.\n\n```jsx\nconst LazyChart = React.lazy(() => import('./Chart'));\n<Suspense fallback={<Spinner />}>\n  <LazyChart />\n</Suspense>\n```\n\nIn React 18+, Suspense integrates with concurrent features — it enables streaming SSR (rendering the shell immediately, streaming shell content as it resolves) and transitions (keeping the current UI visible while the next route loads).",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 5,
  },

  // ff-system-design
  {
    collection: "ff-system-design",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "How would you design a real-time collaborative text editor (like Google Docs)?",
    answer:
      "**Core challenge:** multiple users editing simultaneously without conflicting changes corrupting the document.\n\n**Approach: Operational Transformation (OT) or CRDTs**\n- OT transforms each operation relative to concurrent operations so they converge. Requires a central server to order operations.\n- CRDTs (e.g. Yjs, Automerge) allow peer-to-peer convergence without a central arbiter.\n\n**Architecture:**\n1. **Client** — local optimistic updates; send ops to server via WebSocket\n2. **Server** — orders ops, broadcasts to other clients, persists to DB\n3. **Transport** — WebSocket for real-time; HTTP fallback / periodic snapshots\n4. **Persistence** — store the op log + periodic document snapshots for efficient load\n5. **Presence** — cursor positions, user selections (ephemeral, not in op log)\n\n**Scalability:** Shard documents across servers; use a pub/sub (Redis, Kafka) to fan out ops to all connections for a given document.",
    difficulty: "hard",
    companies: ["Google", "Notion", "Figma"],
    isPremium: true,
    orderIndex: 1,
  },
  {
    collection: "ff-system-design",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "How would you design an infinite-scroll news feed?",
    answer:
      "**Requirements:** fast initial load, smooth scrolling, fresh content, back-navigation restores position.\n\n**API design:** cursor-based pagination (not offset) — `GET /feed?after=<cursor>&limit=20`. Cursor is an opaque server token (e.g. encoded timestamp + id) that's stable even if new posts are inserted.\n\n**Client:**\n- Fetch the first page on load; fetch the next page when the user scrolls near the bottom (IntersectionObserver on a sentinel element)\n- Cache pages in memory (React Query, SWR) — don't refetch on back-navigation\n- Virtualise the list with a library like `react-window` if posts are numerous\n- Store scroll position + cursor in session storage so the browser's back button restores the position\n\n**Freshness:** Poll for new items at the top at a low frequency (30s) without resetting the cursor; surface a 'X new posts' banner rather than auto-inserting and shifting the user's reading position.\n\n**CDN:** Edge-cache feed responses for a short TTL (5–30s) to reduce origin load.",
    difficulty: "medium",
    companies: ["Meta", "Twitter", "LinkedIn"],
    orderIndex: 2,
  },
  {
    collection: "ff-system-design",
    conceptSlug: "state-management-at-scale",
    question: "How would you design a client-side caching strategy for a large React application?",
    answer:
      "**Layers:**\n\n1. **Server state** (async, remote) — use a library (React Query, SWR, Apollo). They handle deduplication, background refetch, stale-while-revalidate, and cache invalidation. Never put server state in Redux/Zustand — that's the leading cause of stale data bugs.\n\n2. **UI state** (ephemeral, local) — useState, useReducer, or a lightweight store (Zustand, Jotai). Keep it as close to the consuming component as possible.\n\n3. **HTTP caching** — set correct `Cache-Control` headers on API responses. `stale-while-revalidate` allows serving a cached response while fetching a fresh one.\n\n4. **Persistent cache** — for offline support or faster first paint, serialise the React Query cache to `localStorage`/`IndexedDB` on unload and restore it on load (react-query's `persistQueryClient` plugin).\n\n**Cache invalidation strategy:** invalidate by tag (not by URL) — after a mutation, mark all queries with a given tag as stale so they refetch on next access. Optimistic updates (mutate the cache immediately, roll back on error) make mutations feel instant.",
    difficulty: "hard",
    companies: ["Google", "Airbnb", "Stripe"],
    isPremium: true,
    orderIndex: 3,
  },
  {
    collection: "ff-system-design",
    conceptSlug: "component-driven-architecture",
    question: "How would you design a component library for a large organisation?",
    answer:
      "**Goals:** consistency, accessibility, performance, developer ergonomics, and independently versioned releases.\n\n**Structure:**\n- Monorepo (Turborepo/Nx) — one package per logical group (`@org/button`, `@org/form`) or a single `@org/ui` bundle\n- Design token layer — spacing, color, typography as CSS variables or a token file; consumed by all components\n- Accessibility by default — every interactive component passes axe/Playwright accessibility checks in CI\n- Headless primitives layer (Radix UI, Base UI, Ariakit) for complex widgets (menus, dialogs, comboboxes) to avoid reimplementing keyboard navigation and ARIA\n\n**Distribution:**\n- Build to ESM + CJS with tree-shaking support (Rollup/tsup)\n- Ship TypeScript types, not just `.d.ts` declarations\n- Publish to a private npm registry or Verdaccio for internal use\n\n**Governance:**\n- Changelog discipline (Changesets) — never break APIs without a major bump\n- Visual regression tests (Chromatic/Percy) — screenshot every story in CI\n- Storybook — living documentation and interaction tests",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe", "Microsoft"],
    orderIndex: 4,
  },
  {
    collection: "ff-system-design",
    question: "How would you optimise a web app's Time to First Byte (TTFB) and Largest Contentful Paint (LCP)?",
    answer:
      "**TTFB (server response time):**\n- Move compute to the edge (Vercel Edge Functions, Cloudflare Workers) — run close to the user\n- Cache rendered HTML at the CDN with short TTLs (`s-maxage=60, stale-while-revalidate=300`)\n- Use streaming SSR (Next.js App Router) — flush the shell immediately, stream slow data\n- DB query optimisation — add missing indexes, avoid N+1, use connection pooling\n\n**LCP (largest visible element paints fast):**\n- The LCP element is usually a hero image or large heading — identify it with Chrome DevTools / WebPageTest\n- Preload the LCP image: `<link rel='preload' as='image' href='...'>`\n- Serve images in WebP/AVIF at the correct intrinsic size; use `srcset` + `sizes`\n- Eliminate render-blocking resources — defer non-critical JS, inline critical CSS\n- Use a CDN with edge PoPs close to users for static assets\n- Font loading: `font-display: swap` + `preload` the subset actually used above the fold",
    difficulty: "medium",
    companies: ["Google", "Stripe", "Amazon"],
    orderIndex: 5,
  },
  // Left unlinked deliberately (Feature 48): this question is a Performance topic
  // (TTFB/LCP), not a System Design one — none of the 7 system-design concepts
  // are a real fit for it, and Performance's own Feature 47 didn't cover it either
  // since it lives in this collection, not ff-75. Noted rather than force-linked.
  {
    collection: "ff-system-design",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "How would you decide between REST and GraphQL when designing a new API?",
    answer:
      "**Start from the client's actual access pattern, not a default preference.**\n\n**REST fits when:**\n- Resources map cleanly to URLs and CRUD operations\n- HTTP/CDN-level caching by URL is valuable (public, mostly-static resources)\n- Multiple independent client teams need a stable, documented contract they don't control the evolution of\n\n**GraphQL fits when:**\n- Clients have very different data needs from the same resources (a mobile app wanting a thin payload, a dashboard wanting a deep nested one) — one query shape per client instead of new REST endpoints per shape\n- Reducing round trips matters (one GraphQL query replaces several REST calls for related resources)\n- The frontend and backend teams evolve together, since the schema is the contract\n\n**What GraphQL costs:** the server does more work resolving arbitrary queries (N+1 query risk without a dataloader/batching layer), URL-based HTTP caching mostly disappears (client-side caching, keyed by query+variables, has to pick up the slack), and query complexity itself needs guarding against (depth limiting, query cost analysis) to stop a client from requesting something disproportionately expensive.\n\n**In practice:** a public API with many external, uncoordinated consumers leans REST; an internal API serving several first-party clients with divergent data needs leans GraphQL. Neither is a strictly superior default.",
    difficulty: "hard",
    companies: ["Meta", "GitHub", "Shopify"],
    isPremium: true,
    orderIndex: 6,
  },
  {
    collection: "ff-system-design",
    conceptSlug: "designing-real-time-updates",
    question: "How would you design a live sports score update feature — polling, SSE, or WebSockets?",
    answer:
      "**First question: does the client ever send data back over the same channel?** No — scores only flow server-to-client. That rules out needing a WebSocket's bidirectional complexity by default.\n\n**Between SSE and polling:**\n- Update frequency during a live game is high enough (every few seconds) that polling would mean frequent wasted requests when nothing's changed between polls\n- SSE (`EventSource`) keeps one connection open, built on plain HTTP — works through standard proxies/load balancers, reconnects automatically on drop, and the server only sends a message when a score actually changes\n\n**Architecture:**\n1. A score-change event publishes to a pub/sub channel (Redis/Kafka) keyed by game id\n2. Each server holding open SSE connections for that game subscribes and forwards the event to its connected clients\n3. Client falls back to a single poll on reconnect to catch anything missed while disconnected\n\n**Why not WebSockets here:** they'd work, but the operational cost (heartbeats, backpressure, WebSocket-aware load balancing) buys nothing this feature actually uses, since the client never talks back over that channel.\n\n**When it would change:** if the feature grew to include live chat or reactions alongside the score feed, that bidirectional need would justify a WebSocket for that part of the connection.",
    difficulty: "medium",
    companies: ["ESPN", "Amazon", "Google"],
    isPremium: true,
    orderIndex: 7,
  },
  {
    collection: "ff-system-design",
    conceptSlug: "frontend-architecture-patterns",
    question: "How would you decide between a monorepo and micro-frontends for a growing frontend organization?",
    answer:
      "**These answer different questions — check which one is actually blocking the team first.**\n\n**A monorepo solves a code-organization problem:** shared tooling, atomic cross-package commits, unified dependency versions. It says nothing about deployment — a monorepo can still ship one single deployed app.\n\n**Micro-frontends solve a deployment-independence problem:** separate teams shipping on separate schedules without waiting on a shared release train. This is a runtime-composition decision, independent of which repository the code lives in.\n\n**Decision path:**\n1. Is the actual pain point 'our shared tooling/dependency versions are inconsistent and PRs conflict across teams'? → a monorepo (Turborepo/Nx) solves this without touching how the app is deployed.\n2. Is the actual pain point 'team A can't ship without team B's approval/release cycle'? → that's a deployment bottleneck a monorepo alone doesn't fix — micro-frontends (Module Federation, or server-side composition) address it directly.\n3. Is the org small enough that no team is genuinely blocked by another's release cadence? → neither pattern is worth its overhead yet; a single well-organized app is simpler.\n\n**The real cost of getting it wrong:** adopting micro-frontends for a 'big codebase' rather than a genuine deploy-independence need trades a solved problem (code organization) for a harder one (shared dependency versions, design consistency, and composition across teams that no longer share a single build).",
    difficulty: "hard",
    companies: ["Spotify", "Zalando", "Microsoft"],
    isPremium: true,
    orderIndex: 8,
  },

  // Phase 10 (Feature 42) — Browser Internals, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "What is the difference between the DOM and the BOM?",
    answer:
      "The **DOM** (Document Object Model) is the standardized tree representing a page's HTML content — elements, attributes, text nodes. The **BOM** (Browser Object Model) represents the browser itself — `window`, `location`, `navigator`, `history`, `screen`.\n\nThere's an important asymmetry: the DOM is formally standardized by the W3C/WHATWG. The BOM has no equivalent spec — `window`, `navigator`, and friends exist because browser vendors converged on the same shape by convention, which is also why BOM APIs vary slightly more across browsers than DOM APIs do.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 26,
  },
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Is `document` part of the DOM or the BOM?",
    answer:
      "`document` is the **root of the DOM tree** — but it's reached as a property of `window`, the BOM's root (`window.document`). So `document` itself sits at the boundary between the two: it's accessed through the BOM's global object, but the tree it represents (elements, attributes, text) is entirely DOM content, not browser state.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 27,
  },
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Why doesn't calling `history.pushState()` update what's rendered on the page?",
    answer:
      "`pushState()` only changes the URL and adds a history entry — a purely BOM-level operation. It never touches the DOM, so the page's visible content stays exactly as it was.\n\nThis is exactly why every client-side router has to do extra work: it calls `pushState()` to change the URL, then **manually** re-renders the DOM to match, and listens for the `popstate` event (fired on back/forward navigation) to do the same re-render when the browser — not the app — changes the URL.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 28,
  },
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Name three BOM objects besides `document`, and what each one exposes.",
    answer:
      "- `navigator` — information about the browser and OS (`userAgent`, `onLine`, `language`)\n- `location` — the current URL and methods to navigate (`href`, `reload()`, `assign()`)\n- `history` — the tab's session history (`pushState`, `back()`, `length`)\n- `screen` — the physical display's dimensions (`width`, `height`, `availHeight`)\n\nAll four are reached as properties of `window`, but none of them represent page content — they represent the browser environment the page happens to be running in.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 29,
  },
  {
    collection: "ff-75",
    conceptSlug: "dom-vs-bom",
    question: "Why is there no official standard for \"the BOM\" the way there is for the DOM?",
    answer:
      "The DOM is formally specified by the W3C/WHATWG — every browser is expected to implement the same tree structure and API surface. The BOM was never formally standardized this way; `window`, `navigator`, `location`, and `history` exist purely because every browser vendor independently converged on roughly the same shape, largely for backward compatibility with the earliest browsers.\n\nThis is a real, practical consequence: BOM APIs (especially `navigator`) tend to have more cross-browser inconsistencies and quirks than DOM APIs do, precisely because there was never a single spec all vendors were implementing against from day one.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 30,
  },

  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What are the three phases of DOM event propagation?",
    answer:
      "1. **Capturing** — the event travels from `document` down through each ancestor toward the target\n2. **Target** — the event reaches the actual element that was interacted with\n3. **Bubbling** — the event travels back up from the target through the same ancestors to `document`\n\nBy default, `addEventListener` registers for the bubbling phase. Passing `{ capture: true }` registers for the capturing phase instead.",
    difficulty: "easy",
    companies: ["Google", "Amazon", "Microsoft"],
    orderIndex: 31,
  },
  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "How does event delegation let one listener handle clicks on elements added after the listener was attached?",
    answer:
      "Because a click on any descendant bubbles up through every ancestor, a listener on a shared parent (like a list container) sees every click that happens inside it — including on elements that didn't exist yet when the listener was registered:\n\n```js\nlist.addEventListener(\"click\", (e) => {\n  const item = e.target.closest(\"li\");\n  if (item) console.log(\"Clicked:\", item.textContent);\n});\n```\n\nThis single listener keeps working correctly even as `<li>` elements are added or removed dynamically, because it's bubbling — not the specific target element — that the listener depends on.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 32,
  },
  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What's the difference between `e.target` and `e.currentTarget`?",
    answer:
      "`e.target` is the actual element the event originated on — the specific element the user clicked, which might be a `<span>` nested deep inside a delegated listener's container.\n\n`e.currentTarget` is always the element the listener is *attached to* — inside a delegated handler on a `<ul>`, `e.currentTarget` is always that `<ul>`, no matter which descendant was actually clicked. This distinction is exactly why delegated handlers use `e.target.closest(...)` to find the specific item that was interacted with.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 33,
  },
  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "When would you register a listener with `{ capture: true }`?",
    answer:
      "When you need to intercept an event **before** it reaches a deeply nested element's own bubble-phase handlers — most commonly to detect an \"outside click\" that should close something (a dropdown, a modal) even if an inner element would otherwise stop the event from bubbling with `stopPropagation()`.\n\nA capture-phase listener on `document` always runs before any bubble-phase listener further down the tree, since capturing happens top-down before the event ever reaches the target.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 34,
  },
  {
    collection: "ff-75",
    conceptSlug: "event-delegation-bubbling-capturing",
    question: "What's the difference between `stopPropagation()` and `stopImmediatePropagation()`?",
    answer:
      "`stopPropagation()` prevents the event from continuing to the next phase/ancestor — but other listeners registered on the *same* element still run.\n\n`stopImmediatePropagation()` does that **and** prevents any other listener on the same element from running at all, even ones registered before it.\n\nBoth should be used sparingly: they can silently break a parent's delegated listener that was relying on the event actually reaching it.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 35,
  },

  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Compare localStorage, sessionStorage, and cookies along capacity, lifetime, and server visibility.",
    answer:
      "| | Capacity | Lifetime | Sent to server? |\n|---|---|---|---|\n| Cookies | ~4KB | configurable expiry, or session-only | yes, automatically, every matching request |\n| sessionStorage | ~5-10MB | until the tab closes | no |\n| localStorage | ~5-10MB | forever, until cleared | no |\n\nCookies are the only one of the three the server sees without any extra JavaScript — which is exactly why auth sessions traditionally use them, and exactly why a bloated cookie is a real performance cost (it's resent on every request, including images and stylesheets).",
    difficulty: "medium",
    companies: ["Google", "Amazon", "Stripe"],
    orderIndex: 36,
  },
  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Why are cookies sent automatically with every request, and why is that both useful and risky?",
    answer:
      "The browser attaches every cookie matching a request's domain/path automatically, with no JavaScript involved — which is exactly what makes cookies useful for auth: the server can identify a logged-in user on every request without the client doing anything special.\n\nThe risk is CSRF: because the browser attaches cookies automatically, a malicious page can trigger a request to another site and the browser will still attach that site's session cookie, making the forged request look legitimate. This is why `SameSite` cookie attributes and CSRF tokens exist — to make \"the cookie was present\" insufficient proof that the user actually intended the request.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 37,
  },
  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "Why is localStorage a poor choice for storing a large JSON blob?",
    answer:
      "`localStorage`'s API is **synchronous** — reading or writing a multi-megabyte value blocks the main thread for however long that read/write takes, which can visibly jank the page. It also silently fails once you're near the browser's storage quota, with no built-in warning.\n\nAnything beyond small key/value settings (a theme preference, a dismissed-banner flag) belongs in IndexedDB instead, which is asynchronous by design and built for exactly this scale of data.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 38,
  },
  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "When would you reach for IndexedDB instead of localStorage?",
    answer:
      "Whenever the data is large (multiple megabytes) or structured (needs querying/indexing, not just flat key/value pairs) — an offline cache of a user's documents, a local copy of a large dataset, anything a simple string-keyed store can't reasonably hold.\n\nIndexedDB is asynchronous, so reading or writing it never blocks rendering the way a large `localStorage` operation can — the tradeoff is a more verbose, callback/promise-based API, which is why most real apps wrap it in a small library rather than using it directly.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 39,
  },
  {
    collection: "ff-75",
    conceptSlug: "storage-apis",
    question: "What's the practical difference in lifetime between localStorage and sessionStorage?",
    answer:
      "`localStorage` persists indefinitely — across tab closes, browser restarts, even system reboots — until explicitly cleared by code or the user. `sessionStorage` is scoped to a single tab and is wiped the moment that tab closes; it doesn't even survive being duplicated into a new tab (each tab gets its own separate `sessionStorage`).\n\nThis makes `sessionStorage` the right fit for per-visit ephemeral state (an in-progress multi-step form, a \"don't show again this session\" flag) and `localStorage` the right fit for settings that should genuinely persist (theme, language preference).",
    difficulty: "easy",
    companies: ["Google", "Stripe"],
    orderIndex: 40,
  },

  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What determines whether two URLs are considered the same origin?",
    answer:
      "Three things must all match exactly: **scheme** (http vs. https), **host** (the domain), and **port**. `https://app.example.com:443` and `http://app.example.com:443` are different origins because the scheme differs, even though the host is identical — and `https://app.example.com` and `https://api.example.com` are different origins even though both are `example.com` subdomains.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 41,
  },
  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "Does CORS prevent the server from ever receiving a cross-origin request?",
    answer:
      "No — the request is still sent, and the server still receives and can act on it. CORS only controls whether the **browser** lets the calling JavaScript **read the response**. This is why CORS is a browser-side protection, not a server-side security boundary: a request blocked by CORS in the browser console still shows up in the server's logs, because it was never actually blocked from arriving.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 42,
  },
  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What triggers a CORS preflight request?",
    answer:
      "A request needs a preflight (an `OPTIONS` request sent first, asking permission) whenever it isn't a \"simple request\":\n\n- the method isn't `GET`, `HEAD`, or `POST`\n- it carries a header outside the simple set (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type` with a simple value)\n- it uses a custom header like `Authorization`\n\nOnly if the preflight's response allows the actual method and headers does the browser send the real request.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 43,
  },
  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "What does `Access-Control-Allow-Credentials` control, and why can't it be paired with a wildcard origin?",
    answer:
      "It controls whether the browser will include cookies/auth headers on a cross-origin request and expose a response that did. Pairing it with `Access-Control-Allow-Origin: *` is disallowed by the spec (and browsers will reject it) because that combination would mean \"any site on the internet may make an authenticated request on this user's behalf and read the result\" — exactly the CSRF-adjacent scenario CORS exists to prevent. An exact origin must be specified whenever credentials are involved.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 44,
  },
  {
    collection: "ff-75",
    conceptSlug: "cors-same-origin-policy",
    question: "If a request fails with a CORS error in the browser console, does that mean the server never received it?",
    answer:
      "No — for a simple request (no preflight needed), the request was already sent and the server already processed it; the browser only blocks the *response* from being readable by the page's JavaScript. For a preflighted request, the browser may stop before sending the real request if the preflight itself is rejected — but the preflight `OPTIONS` request still reached the server.\n\nThis is the most common source of wasted debugging time: assuming a CORS error means \"the backend didn't get this,\" when server logs usually show it did.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 45,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What is XSS, and why does using `textContent` instead of `innerHTML` prevent it?",
    answer:
      "XSS (Cross-Site Scripting) happens when attacker-controlled input is rendered as HTML/script rather than as plain text, letting it execute with the page's own privileges.\n\n`element.innerHTML = userInput` parses `userInput` as markup — any `<script>` tag or event-handler attribute inside it gets interpreted. `element.textContent = userInput` never parses the string as markup at all; it's always rendered literally as visible text, so there's nothing for the browser to execute, no matter what the string contains.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 46,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "How does CSRF exploit cookies, and how does the SameSite attribute defend against it?",
    answer:
      "The browser attaches a site's cookies to any request to that site, regardless of which page triggered the request. A malicious page can submit a form or fire a `fetch()` to your bank's API, and the browser dutifully attaches the bank's session cookie — the request looks legitimate to the server purely because the cookie is valid.\n\n`SameSite=Strict` or `SameSite=Lax` tells the browser not to attach the cookie at all on a request originating from a different site, which stops the forged request from ever carrying valid credentials in the first place.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 47,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What does a Content-Security-Policy header actually do?",
    answer:
      "CSP is a browser-enforced whitelist of what's allowed to load or execute on the page — e.g. `script-src 'self' https://trusted-cdn.com` tells the browser to refuse to run any script not from those origins, including inline `<script>` tags by default.\n\nIt's a second line of defense specifically for XSS: even if an attacker manages to inject a `<script>` tag through an XSS bug elsewhere in the app, a correctly configured CSP means the browser simply won't execute it.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 48,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "What is clickjacking, and how is it prevented?",
    answer:
      "Clickjacking overlays a legitimate page inside an invisible iframe on top of an attacker's own page, tricking the user into clicking something (like a \"confirm transfer\" button) they never saw.\n\nIt's prevented with `X-Frame-Options: DENY` (or `SameOrigin`) or CSP's `frame-ancestors 'none'` — both tell the browser to simply refuse to render the page inside any (or any cross-origin) frame at all.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 49,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-security-fundamentals",
    question: "Why doesn't a framework's auto-escaping fully eliminate XSS risk?",
    answer:
      "Auto-escaping (e.g. React escaping interpolated text by default) only protects the specific code path it covers — regular JSX text interpolation. It does nothing to stop a developer who explicitly opts out, such as calling `dangerouslySetInnerHTML` in React or setting `.innerHTML` directly anywhere in the codebase. Auto-escaping reduces the *default* risk, but any deliberate escape hatch reintroduces exactly the same vulnerability the framework was otherwise preventing — which is why sanitizing untrusted HTML remains the developer's responsibility whenever raw HTML rendering is genuinely needed.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 50,
  },

  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What are the four steps between typing a URL and the browser receiving a response?",
    answer:
      "1. **DNS resolution** — resolve the hostname to an IP address\n2. **TCP handshake** — establish a reliable connection (`SYN` → `SYN-ACK` → `ACK`)\n3. **TLS handshake** — negotiate an encrypted channel, for HTTPS\n4. **HTTP request/response** — the actual request goes out and the response comes back\n\nEach step is a full round trip (or more, for TLS), so a brand-new HTTPS connection can be 3-4 round trips deep before a single byte of the actual page content arrives.",
    difficulty: "easy",
    companies: ["Google", "Amazon", "Microsoft"],
    orderIndex: 51,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "Why is the first request to a new domain slower than every request after it?",
    answer:
      "The first request pays the full cost of all four stack steps: a fresh DNS lookup, a fresh TCP handshake, and (for HTTPS) a fresh TLS handshake, before the HTTP request can even go out. Subsequent requests to the *same* domain skip most of this — DNS is cached, and the TCP connection is typically kept alive and reused (HTTP/1.1+ keep-alive), so only the HTTP request/response actually needs to happen again.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 52,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What does `<link rel=\"preconnect\">` actually do?",
    answer:
      "It tells the browser to perform the DNS lookup, TCP handshake, and TLS handshake for a given origin **before** the browser has actually discovered a resource that needs it — hiding that latency behind other work that's already happening. When the real request for that origin's resource is eventually made, it can skip straight to the HTTP request/response step, since the connection is already fully established.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 53,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "Why does adding a third-party script from a new domain have an outsized performance cost?",
    answer:
      "Every distinct origin a page depends on means a brand-new DNS + TCP + TLS handshake cost — not just the bytes of the script itself. A single third-party analytics or ad script can silently add multiple full round trips to a page's load time purely from connection setup, on top of whatever the script itself downloads and executes. This is exactly why reducing the number of distinct third-party origins a page talks to is one of the highest-leverage performance wins available.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 54,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-network-stack",
    question: "What's the difference between DNS caching and TCP connection reuse (keep-alive)?",
    answer:
      "**DNS caching** avoids repeating the *hostname → IP address* lookup — the browser/OS remembers the answer for the DNS record's TTL. **Keep-alive** avoids repeating the *TCP handshake itself* — the same already-established connection is reused for multiple HTTP requests instead of tearing it down and reconnecting each time.\n\nThey're independent: a request can have a cached DNS answer but still need a fresh TCP handshake (e.g. the previous connection timed out), or vice versa.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 55,
  },

  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "How does a service worker intercept a page's network requests?",
    answer:
      "A registered service worker listens for the `fetch` event, which fires for every request the page makes. Calling `event.respondWith(promise)` inside that handler lets the service worker fully control what the page actually receives — an actual network response, something pulled from a `Cache` object, or a combination of both — instead of letting the request go straight to the network unmodified.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 56,
  },
  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "When would you use cache-first vs. network-first?",
    answer:
      "**Cache-first** — check the cache before ever hitting the network; only fetch on a miss. Right for resources that rarely change: versioned JS/CSS bundles, fonts, icons.\n\n**Network-first** — always try the network first, falling back to cache only if the network fails. Right for data that must be as fresh as possible whenever there's connectivity: a live feed, an account balance.\n\nUsing the wrong one causes real bugs — cache-first on live data means users see stale numbers indefinitely; network-first on a large static bundle means every load is blocked on an avoidable round trip.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 57,
  },
  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What is stale-while-revalidate, and what problem does it solve?",
    answer:
      "It responds from the cache **immediately** (possibly stale, but instant), while kicking off a network fetch in the background to refresh the cache for next time. It's the middle ground between cache-first (fast but can go stale forever) and network-first (always fresh but always waits on the network) — right for content that changes occasionally but shouldn't block the current view, like a news list or a settings page.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 58,
  },
  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What happens if a cache-first strategy is applied to an API that returns live data?",
    answer:
      "Once a response is cached, cache-first will keep serving that same stale response forever (or until the cache entry is explicitly invalidated) — the network is never consulted again for that request, no matter how much the underlying data changes server-side. This is a real, common misconfiguration bug: applying one strategy uniformly to every request a service worker intercepts, instead of choosing per-resource based on how often it actually changes.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 59,
  },
  {
    collection: "ff-75",
    conceptSlug: "service-workers-caching-strategies",
    question: "What's the role of `event.respondWith()` in a service worker's fetch handler?",
    answer:
      "It's how the service worker claims responsibility for a given request's response. Calling it with a promise tells the browser \"wait for this promise instead of hitting the network yourself\" — the promise can resolve with a cached `Response`, a fresh network `Response`, or a constructed one. If `respondWith()` is never called for a given `fetch` event, the browser just proceeds with its normal, un-intercepted network request.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 60,
  },

  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "Why does a long-running computation freeze the whole page, even inside an async function?",
    answer:
      "JavaScript's main thread handles rendering, layout, and input alongside running your code — there's only one thread. `async`/`await` only helps with *waiting* (I/O, timers, promises); it does nothing for a computation that's actually CPU-bound and synchronous. A 2-second `for` loop doing real work still occupies the main thread for those full 2 seconds, regardless of whether it's wrapped in an `async` function — the event loop simply can't get to rendering or input handling until that synchronous work finishes.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 61,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "What does a Web Worker not have access to, and why?",
    answer:
      "A worker has no access to the DOM — no `document`, no `window` (its global scope is `self`, not `window`). This is a deliberate constraint: it's exactly what makes it safe to run a worker on a genuinely separate thread in true parallel, with no risk of two threads racing to read or mutate the same DOM node at once. If a worker needs the UI updated, it must `postMessage` its result back to the main thread, which performs the actual DOM update itself.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 62,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "How do the main thread and a worker communicate, since they can't share memory?",
    answer:
      "Exclusively through `postMessage()` and the `message` event — the main thread posts to the worker via `worker.postMessage(data)`, and the worker posts back via `self.postMessage(result)`. Every value passed this way is **structured-cloned**: deep-copied, not referenced, so mutating the original after sending it has no effect on what the other side received.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 63,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "What is a Transferable object, and why is it faster than a normal postMessage?",
    answer:
      "A `Transferable` (like an `ArrayBuffer`) can be **transferred** to a worker instead of cloned: ownership of the underlying memory moves to the receiver at essentially zero cost, rather than the browser copying every byte. The tradeoff is that the sender loses access to it entirely once transferred — `worker.postMessage(buffer, [buffer])` empties `buffer` on the sending side. This matters a lot for large binary payloads (images, audio buffers), where a full clone would otherwise be an expensive copy proportional to the data's size.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 64,
  },
  {
    collection: "ff-75",
    conceptSlug: "web-workers-concurrency",
    question: "Why is `async`/`await` alone not enough to keep a CPU-heavy computation from blocking the UI?",
    answer:
      "`async`/`await` changes *when* code runs relative to other queued work (it yields at `await` points) — it doesn't change *which thread* the code runs on. A CPU-heavy computation with no `await` inside it (a tight loop doing real work) never yields, so it still monopolizes the single main thread for its entire duration, freezing rendering and input regardless of the `async` keyword. Only moving the computation to a Web Worker — a genuinely separate thread — actually frees the main thread to keep working while it runs.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 65,
  },

  // React Concepts (Feature 43) — 5 questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "jsx-virtual-dom",
    question: "What does JSX actually compile to?",
    answer:
      "JSX is syntax sugar compiled by Babel/SWC into plain `React.createElement(type, props, ...children)` calls before the code ever runs. `<button className=\"primary\">Save</button>` becomes `React.createElement('button', { className: 'primary' }, 'Save')`, which returns a plain JavaScript object describing the element — not a real DOM node.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 66,
  },
  {
    collection: "ff-75",
    conceptSlug: "jsx-virtual-dom",
    question: "Why does React use a Virtual DOM instead of updating the real DOM directly?",
    answer:
      "Reading and writing the real DOM triggers layout, style recalculation, and repaints — all comparatively expensive. Plain JavaScript objects are cheap to create and compare. By building a new Virtual DOM tree on every render and diffing it against the previous one first, React can compute the minimal set of real DOM operations needed and only pay the expensive cost for that minimal set, instead of on every render.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 67,
  },
  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "Is the Virtual DOM the same thing as the Shadow DOM?",
    answer:
      "No — they solve unrelated problems. The Shadow DOM is a real browser API for encapsulating a subtree's styles and markup (used by Web Components). The Virtual DOM is a React-specific, in-memory JavaScript representation used purely for diffing — it never touches the browser's rendering engine directly and has no encapsulation behavior at all.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 6,
  },
  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "What happens if you return two adjacent top-level elements from a component without wrapping them?",
    answer:
      "It's a compile error — JSX (really, `createElement`) requires exactly one root element per return value, since a single function call can only return one object. Wrapping siblings in `<>...</>` (a Fragment) or a real element satisfies this without adding an extra DOM node.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 7,
  },
  {
    collection: "ff-react",
    conceptSlug: "jsx-virtual-dom",
    question: "What is React.Fragment and why does it exist?",
    answer:
      "`<React.Fragment>` (shorthand `<>...</>`) groups a list of children into one JSX return value without adding an extra wrapping DOM node. It exists purely to satisfy JSX's single-root-element requirement — useful when adding a `<div>` wrapper would break CSS (e.g. flex/grid layouts that expect direct children) or table markup (`<tr>` requiring direct `<td>` children).",
    difficulty: "easy",
    companies: ["Airbnb"],
    orderIndex: 8,
  },

  {
    collection: "ff-75",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Why should you use the function form of a state setter (setCount(c => c + 1)) inside rapid or batched updates?",
    answer:
      "The function form always receives the latest pending state, even when multiple updates are batched together before a re-render. `setCount(count + 1)` called three times in a row all close over the same stale `count` from the current render and only apply once net; `setCount(c => c + 1)` called three times correctly compounds to +3, because each call receives the result of the previous one.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 68,
  },
  {
    collection: "ff-75",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "What is a 'stale closure' in the context of useEffect, and how does it happen?",
    answer:
      "An effect's function closes over the values from the render it was created in. If the effect reads a value but that value is missing from the dependency array, the effect keeps using its original value from whenever it last ran — even after the real value has since changed elsewhere in the component. The fix is always to include every value the effect reads in the dependency array, not to suppress the exhaustive-deps lint warning.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 69,
  },
  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "What are the three modes an effect's dependency array can be in?",
    answer:
      "No array at all runs the effect after every render. An empty array `[]` runs it once, after the first render only. An array with values runs it after the first render, and again any time one of those values changes (compared with `Object.is`).",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 9,
  },
  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Why does React call an effect's cleanup function before re-running it, not just on unmount?",
    answer:
      "Every run of an effect is treated as \"start syncing with this render's values\" — so before syncing with the *new* values, React must first undo whatever the previous run set up (clear the old timer, unsubscribe the old listener) to avoid leaking two overlapping subscriptions/timers. Cleanup runs on unmount too, for the same reason: tearing down whatever the last active run started.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 10,
  },
  {
    collection: "ff-react",
    conceptSlug: "usestate-useeffect-fundamentals",
    question: "Does calling a state setter with the exact same value it already holds trigger a re-render?",
    answer:
      "No — React compares the new value to the current one with `Object.is` (a `useState` bail-out) and skips re-rendering if they're equal, even though the setter was called. This only bails out the render for that state update, not any other state changes happening in the same batch.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 11,
  },

  {
    collection: "ff-75",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "What determines whether an input is controlled or uncontrolled in React?",
    answer:
      "Whether the input receives a `value` prop from React state. A controlled input's `value` always comes from state and is updated via `onChange`; an uncontrolled input manages its own value internally in the DOM, and React only reads it on demand through a ref.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 70,
  },
  {
    collection: "ff-75",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "Why does React warn about a component 'changing from uncontrolled to controlled'?",
    answer:
      "If `value` starts as `undefined` on the first render, React treats the input as uncontrolled. If `value` later becomes a real string, the source of truth flips mid-lifetime — a state React explicitly warns about, since it usually indicates state that was accidentally initialized to `undefined`/`null` instead of an empty string.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 71,
  },
  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "When would you deliberately choose an uncontrolled input over a controlled one?",
    answer:
      "For a simple form only read once on submit, where per-keystroke validation or live formatting isn't needed — the extra state and re-renders a controlled input requires add no value. It's also the right choice when integrating a non-React widget (some rich-text editors, some date pickers) that already manages its own DOM value internally.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 12,
  },
  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "How do you set a starting value for an uncontrolled input without controlling it?",
    answer:
      "Use `defaultValue` instead of `value`. `defaultValue` only sets the input's initial value when it first mounts — the DOM then owns the value from then on, and React never re-applies `defaultValue` on subsequent renders the way it would continuously re-apply a controlled `value`.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 13,
  },
  {
    collection: "ff-react",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    question: "Why can typing into a controlled input feel laggy in some apps?",
    answer:
      "Every keystroke fires `onChange`, which calls the state setter, which triggers a re-render before the input visually shows the new character. If `onChange` does anything expensive (validation, formatting, an API call) before calling the setter, that work now sits directly on the critical path between a keystroke and the screen updating.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 14,
  },

  {
    collection: "ff-75",
    conceptSlug: "useref-imperative-handles",
    question: "What's the core difference between useRef and useState?",
    answer:
      "Both persist a value across renders, but `useState` triggers a re-render when updated and `useRef` never does. `useRef` is for values the UI shouldn't reflect — DOM nodes, timer ids, previous values — while `useState` is for anything the rendered output should change in response to.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 72,
  },
  {
    collection: "ff-75",
    conceptSlug: "useref-imperative-handles",
    question: "Why doesn't mutating a ref's .current property trigger a re-render?",
    answer:
      "`useRef` returns a single, stable mutable object for the component's whole lifetime — React has no hook into assignments to its `.current` property, unlike a state setter, which explicitly schedules work when called. This is intentional: it's what makes refs safe for values that shouldn't cause re-renders, but also means changing `.current` is invisible to anything relying on React to notice.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 73,
  },
  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "What problem does useImperativeHandle solve that forwardRef alone doesn't?",
    answer:
      "`forwardRef` alone exposes a component's entire underlying DOM node (or whatever it forwards the ref to) to the parent. `useImperativeHandle` lets the component instead hand back a curated object — only the specific methods (`play()`, `focus()`) it wants the parent to call — hiding everything else about its internal implementation.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 15,
  },
  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "Give an example of a bug caused by storing a value in a ref instead of state.",
    answer:
      "Storing a filter value that should affect what's rendered (e.g. a search query used to filter a displayed list) in a ref instead of state: updating `.current` never triggers a re-render, so the UI keeps showing results from the old query even though the 'current' value has technically changed — the classic 'I set it but the screen didn't update' bug.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 16,
  },
  {
    collection: "ff-react",
    conceptSlug: "useref-imperative-handles",
    question: "Can you safely read or write a ref's .current value during the render phase itself?",
    answer:
      "Writing to a ref during render is discouraged and can produce unpredictable behavior (React may call the render function multiple times per commit in Strict Mode/concurrent features), since render is supposed to be pure. Refs are meant to be read and written in effects and event handlers, after render has committed — not as part of computing what to render.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 17,
  },

  {
    collection: "ff-75",
    conceptSlug: "context-api-prop-drilling",
    question: "What problem does prop drilling create in a component tree?",
    answer:
      "Every intermediate component between the value's source and its actual consumer has to accept and forward a prop it never uses itself. Renaming the prop, adding a new one, or inserting a component in the middle means touching every layer in between, even though most of them have no real relationship to the value.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 74,
  },
  {
    collection: "ff-75",
    conceptSlug: "context-api-prop-drilling",
    question: "What re-render cost does Context introduce that passing plain props doesn't?",
    answer:
      "Every component calling `useContext` for a given context re-renders whenever that Provider's `value` changes — regardless of which part of the value it actually reads. A context object holding `{ theme, user, cart }` re-renders a component that only reads `theme` on every `cart` update too, which plain, narrowly-scoped props would never do.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 75,
  },
  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "How would you stop every consumer of a context from re-rendering when only part of its value changes?",
    answer:
      "Split one large context into several narrower ones (a `ThemeContext` and a separate `UserContext` instead of one combined context), so a component only subscribes to — and only re-renders from — the specific slice it actually reads. Memoizing the Provider's `value` with `useMemo` also helps avoid re-renders caused purely by a new object reference on every parent render.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 18,
  },
  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "Does Context replace the need for useState or useReducer?",
    answer:
      "No — Context is purely a wiring mechanism for making a value available to descendants without passing props through every layer. The value it provides still has to come from somewhere, usually a `useState`/`useReducer` call in the component holding the `Provider`; Context doesn't manage state on its own.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 19,
  },
  {
    collection: "ff-react",
    conceptSlug: "context-api-prop-drilling",
    question: "What happens if a component calls useContext but there's no matching Provider above it in the tree?",
    answer:
      "It receives the `defaultValue` passed to `createContext(defaultValue)` — not an error or `undefined` by default. This is why a well-designed context usually gives its default value a sensible shape (or throws explicitly from a custom hook wrapper) rather than leaving consumers to silently work with an unexpected default.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 20,
  },

  {
    collection: "ff-75",
    conceptSlug: "component-composition-patterns",
    question: "Compare the render props pattern to a custom hook — when would you still reach for render props today?",
    answer:
      "Both share stateful logic while leaving the caller in control of rendering, but render props wrap the output in an extra component and level of JSX nesting, while a custom hook doesn't. Render props are still useful when the shared logic genuinely needs to inject markup *between* other elements the caller controls (rather than the caller receiving raw values and rendering however it wants), which a hook alone can't do.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 76,
  },
  {
    collection: "ff-75",
    conceptSlug: "component-composition-patterns",
    question: "How do compound components share state between siblings without prop drilling?",
    answer:
      "The parent (e.g. `<Tabs>`) holds the shared state (like the active tab) in a Context Provider internally; each child component (`Tabs.Trigger`, `Tabs.Panel`) reads that Context directly with `useContext`. The caller's JSX still reads like plain nested markup — no props are manually passed between the siblings themselves.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 77,
  },
  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "How does composition via children avoid the prop drilling problem entirely?",
    answer:
      "A component that just renders `props.children` doesn't need to know anything about what's inside — the caller supplies the content directly at the point where it's needed, instead of that content's data being threaded down as props through components that don't use it.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 21,
  },
  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "How would you design a component so its internals honor whatever markup a caller passes as children?",
    answer:
      "Render `props.children` directly rather than any hardcoded markup, and avoid assumptions about *what* children are (a specific component type, a fixed count) unless the component genuinely needs to coordinate between them — in which case compound components with Context is the pattern to reach for instead of inspecting `children` structurally.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 22,
  },
  {
    collection: "ff-react",
    conceptSlug: "component-composition-patterns",
    question: "What's a downside of the compound component pattern compared to plain props?",
    answer:
      "It requires internal plumbing (a Context Provider, and every sub-component consuming it) that plain, single-component APIs don't need, and it implicitly couples sub-components to being rendered somewhere inside their parent — `<Tabs.Panel>` rendered outside a `<Tabs>` silently gets the context's default value instead of a clear prop-types error.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 23,
  },

  {
    collection: "ff-75",
    conceptSlug: "custom-hooks-composition",
    question: "Why must hooks always be called in the same order on every render?",
    answer:
      "React tracks each `useState`/`useEffect` call by the position it's called in during render, not by any name — there's no variable-name binding at runtime. Skipping a hook call on some renders (by calling it conditionally) shifts every hook call after it into the wrong internal slot, corrupting state that has nothing to do with the skipped hook.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 78,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-hooks-composition",
    question: "Does a custom hook share state between the different components that call it?",
    answer:
      "No — a custom hook is just a function that calls other hooks; every component that calls it gets its own independent copy of that state. Two components both calling `useToggle()` end up with two completely separate booleans, not one shared boolean.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 79,
  },
  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "What's the modern replacement for higher-order components and render props, and why did it win out?",
    answer:
      "Custom hooks. They extract the same shared, stateful logic without wrapping the consuming component in an extra component layer or adding indirection to the JSX tree — a hook call is a plain function call, so there's no 'wrapper hell' from nesting several HOCs, and no extra component showing up in React DevTools' tree for logic that has no visual output of its own.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 24,
  },
  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "Can a custom hook call another custom hook? Give an example of why you'd do that.",
    answer:
      "Yes — composing hooks from other hooks is the standard way to build more specific behavior from simpler pieces, e.g. `useSearchResults(query)` internally calling `useDebouncedValue(query, 300)` to avoid firing a fetch on every keystroke, then using the debounced value to actually search. Each layer only needs to understand the hook directly below it.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 25,
  },
  {
    collection: "ff-react",
    conceptSlug: "custom-hooks-composition",
    question: "Why does calling a hook inside a conditional or loop corrupt state even in components after it?",
    answer:
      "Not \"components after it\" — hook state within the *same* component, in every hook call that comes after the conditional one in source order. Since React matches hook calls to state slots purely by call order, skipping one hook call on some renders shifts every subsequent hook call in that same component into the wrong slot for the rest of that render.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 26,
  },

  {
    collection: "ff-75",
    conceptSlug: "error-boundaries",
    question: "What kinds of errors does an Error Boundary NOT catch?",
    answer:
      "Errors inside event handlers (`onClick`, `onChange`), errors in asynchronous code (`setTimeout` callbacks, rejected promises), errors during server-side rendering, and errors thrown inside the boundary component itself. All of these need a regular `try/catch` at the source, since an Error Boundary only catches errors thrown synchronously during rendering, in lifecycle methods, or in constructors of its descendants.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 80,
  },
  {
    collection: "ff-75",
    conceptSlug: "error-boundaries",
    question: "Why must an Error Boundary be a class component?",
    answer:
      "It relies on `static getDerivedStateFromError` and `componentDidCatch`, two lifecycle methods with no hook equivalent as of React 18 — there is no `useDerivedStateFromError` or `useDidCatch` hook. Function components that need boundary behavior wrap a small class component internally, or use a library like `react-error-boundary` that does this for them.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 81,
  },
  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "What's the difference between getDerivedStateFromError and componentDidCatch?",
    answer:
      "`getDerivedStateFromError(error)` is called during the render phase and returns new state used to render the fallback UI — it must be pure, with no side effects. `componentDidCatch(error, info)` is called during the commit phase and is where side effects belong — logging the error to a reporting service, for instance.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 27,
  },
  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "How would you decide where in a component tree to place error boundaries?",
    answer:
      "It's a resilience tradeoff based on granularity: one boundary around the whole app means any single component's crash blanks the entire page. Wrapping each independent section (a dashboard's individual widgets, a feed's individual posts) in its own boundary means one broken widget shows its own fallback while everything else keeps working — usually the better default for anything with independently-failable sections.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 28,
  },
  {
    collection: "ff-react",
    conceptSlug: "error-boundaries",
    question: "How do you handle an error thrown inside an async event handler, since an Error Boundary won't catch it?",
    answer:
      "Wrap the async logic in its own `try/catch` and handle the error explicitly — often by setting local state (e.g. an `error` state variable) that the component's own render then uses to show an inline error message, since there's no boundary mechanism that will intercept it automatically the way rendering errors are.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 29,
  },

  {
    collection: "ff-75",
    conceptSlug: "render-performance-memoization",
    question: "What does React.memo actually compare, and what's a common way it silently fails to help?",
    answer:
      "By default, `React.memo` does a shallow comparison of the new props object against the previous one — same keys, `Object.is`-equal values. It silently stops helping the moment a parent passes a brand-new object, array, or inline function as a prop on every render, since a new reference always fails the shallow-equality check even if its contents are 'the same.'",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 82,
  },
  {
    collection: "ff-75",
    conceptSlug: "render-performance-memoization",
    question: "When would adding useMemo or useCallback make performance worse, not better?",
    answer:
      "When the calculation/function being memoized is cheap and the dependencies change on almost every render anyway — the comparison overhead, plus the memory held onto for the cached value, can exceed the cost of just recomputing it. This is why the React team's own guidance is to profile first and confirm an actual slow re-render before reaching for either.",
    difficulty: "hard",
    companies: ["Amazon", "Stripe"],
    orderIndex: 83,
  },
  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "What's the difference between what useMemo does and what useCallback does?",
    answer:
      "`useMemo` caches the *result* of a calculation, recomputing it only when its dependencies change. `useCallback` caches the *function reference itself*, returning the same function instance across renders until its dependencies change — it's really just `useMemo` specialized for the case where the cached value happens to be a function.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 30,
  },
  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "What tool would you use to confirm a component is actually re-rendering unnecessarily before optimizing it?",
    answer:
      "The React DevTools Profiler — it records which components rendered during an interaction, how long each took, and (with 'why did this render' options enabled) what actually changed. Optimizing based on a guess instead of a profile is the most common way memoization ends up adding overhead without fixing anything.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 31,
  },
  {
    collection: "ff-react",
    conceptSlug: "render-performance-memoization",
    question: "Why does passing an inline arrow function as a prop defeat a child's React.memo?",
    answer:
      "`onClick={() => handleClick(id)}` creates a brand-new function on every render of the parent, even if `handleClick` and `id` haven't changed. A `memo`-wrapped child's shallow-equality check compares this new function reference to the previous one, sees they differ, and re-renders anyway — `useCallback` around the function (with matching dependencies) is what keeps the reference stable so `memo` can actually skip the re-render.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 32,
  },

  {
    collection: "ff-75",
    conceptSlug: "concurrent-react-suspense",
    question: "What problem does useTransition solve that a plain state update doesn't?",
    answer:
      "A plain, synchronous state update blocks the UI from reflecting anything else — including a more urgent update like the next keystroke — until it finishes. `useTransition` marks an update as low-priority and interruptible: if a more urgent update comes in while it's still processing, React abandons the stale in-progress work and starts over with the latest input, keeping the rest of the UI responsive throughout.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 84,
  },
  {
    collection: "ff-75",
    conceptSlug: "concurrent-react-suspense",
    question: "How does Suspense actually catch a component that isn't ready to render yet?",
    answer:
      "A component (or the data-fetching library it uses) throws a Promise instead of returning JSX when it isn't ready. React catches that thrown Promise the same way a try/catch would, renders the nearest `<Suspense fallback>` in its place, and automatically retries rendering the component once the Promise resolves.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 85,
  },
  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "What's the difference between wrapping an update in startTransition versus not wrapping it at all?",
    answer:
      "An update wrapped in `startTransition` is marked low-priority and interruptible — React can pause it, prioritize a more urgent update, and resume or restart it later. An update outside `startTransition` runs at default (synchronous-feeling) priority and blocks other rendering until it completes.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 33,
  },
  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "How does Suspense enable streaming server-side rendering?",
    answer:
      "The server can send the HTML shell immediately and stream in the content of any component still wrapped in a pending `<Suspense>` boundary as its data becomes ready, rather than waiting for every single piece of data across the whole page before sending anything. Each streamed chunk 'hydrates in' as it arrives, instead of the user staring at a blank page until the slowest piece of data resolves.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 34,
  },
  {
    collection: "ff-react",
    conceptSlug: "concurrent-react-suspense",
    question: "Does React 18's concurrent rendering mean components can run twice unexpectedly? What should you watch out for?",
    answer:
      "Strict Mode in development intentionally double-invokes component functions and effects to help surface code that isn't safely repeatable (e.g. an effect with a side effect that isn't idempotent, or a render function relying on mutable external state). This is a development-only diagnostic, but it exists because concurrent rendering *can* genuinely discard and restart an in-progress render — so component functions and render logic need to stay pure regardless.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 35,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-tradeoffs",
    question: "How do you decide whether a piece of state should be local, lifted, or global?",
    answer:
      "Start local, in whichever component actually uses it. Lift it to the nearest common ancestor only once a sibling genuinely needs to read or update the same value. Reach for a broader mechanism (Context or an external store) only once lifting has pushed the state so many levels up that intermediate components are just forwarding props they never use themselves.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 86,
  },
  {
    collection: "ff-75",
    conceptSlug: "state-management-tradeoffs",
    question: "What's the main advantage of a store with selectors (Zustand/Redux) over Context for frequently-changing state?",
    answer:
      "A selector-based store lets a component subscribe to just the specific slice of state it reads (e.g. `state.cart.items.length`), re-rendering only when that slice changes. Context re-renders every consumer whenever the Provider's whole value changes, regardless of which part any individual consumer actually reads — for state that updates often, that difference in re-render granularity matters a lot at scale.",
    difficulty: "hard",
    companies: ["Amazon", "Stripe"],
    orderIndex: 87,
  },
  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "What's a sign that a codebase reached for a global store too early?",
    answer:
      "State that's only ever read and updated by one component (or its direct children) living in a global store anyway — meaning changes to it can, in principle, cause unrelated parts of the app to re-check their subscriptions for no reason, and any developer touching that state has to understand the global store's wiring for something that was never actually shared.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 36,
  },
  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "Compare colocating state near where it's used versus centralizing it in one global store.",
    answer:
      "Colocated state is easier to reason about locally (everything relevant is in or near the component) but has to be lifted or drilled once sibling components need it too. A centralized store makes any piece of state reachable from anywhere without lifting, at the cost of needing selectors (or careful Context splitting) to avoid over-triggering re-renders, and making it less obvious, just from reading a component, what state it actually depends on.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 37,
  },
  {
    collection: "ff-react",
    conceptSlug: "state-management-tradeoffs",
    question: "Why can a large Context value cause more re-renders than the prop drilling it was meant to replace?",
    answer:
      "Prop drilling, however tedious, only re-renders a component when the specific prop it actually receives changes. A single context bundling several unrelated fields re-renders every consumer on *any* field's change, since Context has no built-in concept of subscribing to part of a value — a component reading only `theme` from a `{ theme, user, cart }` context re-renders on every cart update too.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 38,
  },
  // Phase 10 (Feature 44) — CSS Concepts, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "What's the difference between content-box and border-box, and why do most CSS resets set box-sizing: border-box globally?",
    answer:
      "content-box (the default) has width/height describe only the content — padding and border are added on top, so the rendered box grows larger than its declared size. border-box has width/height describe the outer edge instead, so adding padding or border shrinks the content area rather than growing the box. Resets set border-box globally so a declared width stays the actual rendered width no matter how much padding gets added later — without it, every padding change would require recalculating the width by hand.",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 88,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "Do margin and padding both add to an element's rendered width the same way?",
    answer:
      "No. Padding is inside the border and is part of the element itself — it's included in border-box's width calculation and shares the element's background. Margin is outside the border, is always excluded from box-sizing's width calculation regardless of content-box or border-box, and is transparent with no background of its own. An element's total footprint on the page is its rendered box (affected by box-sizing) plus its margin on top, always added, never absorbed.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 89,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "What is margin collapsing, and when does it not apply?",
    answer:
      "Vertical margins between adjacent block-level siblings in normal flow collapse into a single margin equal to the larger of the two, rather than summing. It doesn't apply to horizontal margins, to elements inside a flex or grid container, or across elements with padding/border/a clearfix between them (anything that breaks the two margins from being directly adjacent).",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 90,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "A button mysteriously overflows its 100px-wide parent — what's the first CSS property you'd check?",
    answer:
      "box-sizing. If the button has a declared width close to 100px plus any padding or border under the default content-box, that padding/border pushes the rendered width past the parent's 100px. Setting box-sizing: border-box on the button (or globally) makes the declared width the actual rendered width, resolving the overflow without changing the padding.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 91,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-box-model",
    question: "Does box-sizing: border-box affect how margin is calculated?",
    answer:
      "No. box-sizing only changes whether width/height includes padding and border — margin is never part of that calculation under either mode. Margin always sits outside the border and is always added on top of the rendered box, regardless of box-sizing.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 92,
  },
  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "What's the difference between em and rem, and why does it matter for nested components?",
    answer:
      "em is relative to the current element's own font-size (or the parent's, when used to set font-size itself), so it compounds through nested elements — three nested 1.2em elements multiply to roughly 1.73× the root size. rem is always relative to the root <html> element's font-size, with no compounding regardless of nesting depth. This matters for nested components because an em-based value can silently grow or shrink depending on how deep it's nested, while a rem-based value stays predictable everywhere.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 93,
  },
  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "When would you reach for vh/vw instead of a percentage?",
    answer:
      "Percentage is relative to the containing block's own size, which only exists if that ancestor has a defined size in the same dimension — a height: 50% on a child with no explicitly-sized parent resolves to nothing. vh/vw are always relative to the viewport itself, independent of any ancestor's size, which makes them the right choice for things like a full-screen hero section that should size off the browser window regardless of what wraps it.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 94,
  },
  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "Why can 100vh behave inconsistently on mobile browsers?",
    answer:
      "Mobile browsers show and hide their own UI chrome (address bar, tab bar) as the user scrolls, which changes the actual visible viewport height in real time — but vh is computed against the layout viewport, which some browsers keep fixed at the largest possible height. The result is a 100vh element that's taller than what's actually visible on first load, or that jumps size as the chrome shows/hides. Newer units like dvh (dynamic viewport height) were introduced specifically to track the real, currently-visible viewport instead.",
    difficulty: "hard",
    companies: ["Airbnb", "Microsoft"],
    orderIndex: 95,
  },
  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "What are vmin and vmax used for?",
    answer:
      "vmin resolves to 1% of whichever viewport dimension (width or height) is currently smaller; vmax resolves to 1% of whichever is larger. They're useful for sizing something relative to 'whichever direction is tightest' — a square avatar or icon sized in vmin never overflows either axis, regardless of whether the viewport is in portrait or landscape orientation.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 96,
  },
  {
    collection: "ff-75",
    conceptSlug: "units-sizing",
    question: "Why is rem generally preferred over em for a design system's spacing and type scale?",
    answer:
      "Because rem always resolves against one flat reference (the root font-size) with no compounding, a single change — html { font-size: 112.5%; } — rescales an entire spacing and typography system proportionally and predictably. em-based systems can't do this safely, since a root-level change ripples unpredictably through however many levels of nested compounding exist across the app.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 97,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "What's the actual order the cascade uses to resolve competing rules?",
    answer:
      "First by origin and importance — user-agent defaults lose to author styles, which lose to a user's own styles, and !important flips each of those pairs, with a user's !important beating an author's !important. Within the same origin/importance tier, specificity decides. If specificity also ties, source order decides — the later declaration wins.",
    difficulty: "medium",
    companies: ["Amazon", "Google"],
    orderIndex: 98,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "Which CSS properties inherit from parent to child by default, and why those specifically?",
    answer:
      "Mostly text and typography properties — color, font-family, font-size, line-height, visibility, list-style — because it's rarely useful to have to reset every nested element's font individually. Box-model and layout properties (margin, padding, border, width, background) don't inherit by default, because a child having its own independent box is almost always what's wanted.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 99,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "How do you force a non-inherited property to inherit, or force an inherited one to reset?",
    answer:
      "The inherit keyword forces any property to take its parent's computed value, regardless of whether it inherits by default. The initial keyword resets any property to its spec-defined default, regardless of whether it would otherwise inherit — useful for explicitly opting a subtree out of an ancestor's styling.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 100,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "Why is !important considered a jump to an earlier cascade stage rather than just a specificity boost?",
    answer:
      "Specificity is only ever compared within the same origin/importance tier — !important moves a declaration to an entirely different, higher-priority tier before specificity is ever considered. That's why raising a normal rule's specificity can never beat an !important rule, and why the only way to override one is another !important, escalating a fight that specificity was never actually deciding.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 101,
  },
  {
    collection: "ff-75",
    conceptSlug: "the-cascade-inheritance",
    question: "What's the practical difference between the cascade and inheritance as two CSS concepts?",
    answer:
      "The cascade decides which of several competing declared rules wins for a given element and property. Inheritance is a separate fallback mechanism: if no rule at all applies to a property on a given element, some properties automatically take their parent's computed value instead of the browser's built-in default. A property can lose every cascade fight and still resolve correctly purely through inheritance.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 102,
  },
  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "When would you reach for Flexbox over Grid, and vice versa?",
    answer:
      "Flexbox fits one-dimensional, content-driven layouts — a nav bar, a button group, a card's internal stack — where item sizes should drive how space is shared along a single axis. Grid fits two-dimensional, structure-driven layouts — a page shell, a photo gallery, a dashboard — where rows and columns are defined as a shape first and content is placed into it. Most real layouts use Grid for the outer structural shell and Flexbox for the one-dimensional arrangements nested inside each cell.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 103,
  },
  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "Explain flex-grow, flex-shrink, and flex-basis.",
    answer:
      "flex-basis is an item's starting size before any growing or shrinking. flex-grow decides how much of the container's leftover space this item claims, relative to its siblings' flex-grow values — a value of 0 means it never grows. flex-shrink decides how much this item gives up when the container is too small to fit every item's basis, again relative to siblings, weighted by their basis too.",
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 104,
  },
  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "How does flex-wrap change alignment across multiple lines?",
    answer:
      "Without flex-wrap, all items are forced onto a single line, shrinking as needed to fit. With flex-wrap: wrap, items that don't fit spill onto a new line, and each wrapped line becomes its own independent flex line — items in one row don't align with items in the row below unless a two-dimensional system like Grid is used, since Flexbox only ever manages alignment within a single line at a time.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 105,
  },
  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "How would you build a typical page shell (sidebar + header + main) — Flexbox, Grid, or both?",
    answer:
      "Grid is the natural fit for the outer shell, since it needs to define both a row structure (header, main, footer) and a column structure (sidebar, content) at once — something Flexbox can't do in a single container. Flexbox is then used inside individual cells for one-dimensional arrangements, like a horizontal row of icons inside the header or a vertical stack inside a card in the main area.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 106,
  },
  {
    collection: "ff-75",
    conceptSlug: "flexbox-vs-grid",
    question: "What's the difference between justify-content and align-items in Flexbox?",
    answer:
      "justify-content aligns items along the main axis (the direction set by flex-direction — typically horizontal for row). align-items aligns items along the cross axis, perpendicular to the main axis. Swapping flex-direction from row to column swaps which axis each property actually controls, since 'main axis' is direction-relative, not always horizontal.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 107,
  },
  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What's the difference between position: absolute, fixed, and sticky?",
    answer:
      "absolute removes an element from flow and positions it relative to its nearest ancestor with a position other than static. fixed removes it from flow and positions it relative to the viewport, so it stays put while the page scrolls (unless an ancestor's transform/filter/will-change creates its own containing block and traps it). sticky behaves like relative until a scroll threshold is crossed, then behaves like fixed within its containing block's bounds.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 108,
  },
  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What creates a new stacking context?",
    answer:
      "The root element always creates one. Beyond that: position: relative/absolute combined with a z-index other than auto; position: fixed or sticky, always, regardless of z-index; opacity less than 1; and certain values of transform, filter, will-change, or contain. Once created, every descendant's z-index only ever competes within that context, never against elements outside it.",
    difficulty: "hard",
    companies: ["Meta", "Microsoft"],
    orderIndex: 109,
  },
  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "Why can z-index: 9999 still lose to a sibling with z-index: 2?",
    answer:
      "z-index only ever compares within the same stacking context — if the 9999 element's ancestor created its own stacking context with a lower z-index than the sibling's context, the 9999 is trapped inside that losing context and never actually competes against the sibling at all. What decides the outcome on screen is the two ancestor contexts' own z-index values, one level up, not the descendant's.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 110,
  },
  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "What determines the containing block for an absolutely positioned element?",
    answer:
      "Its nearest ancestor whose position is anything other than static — relative, absolute, fixed, or sticky. If no such ancestor exists, it falls back to the initial containing block (effectively the viewport). This is exactly why a common pattern is position: relative on a wrapper with no offsets at all — just to give an absolutely positioned child something to anchor to.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 111,
  },
  {
    collection: "ff-75",
    conceptSlug: "positioning-stacking-contexts",
    question: "Why might position: fixed unexpectedly stop working as expected?",
    answer:
      "A fixed element is normally positioned relative to the viewport — but if any ancestor has a transform, filter, perspective, or will-change value set, that ancestor creates its own containing block, and the fixed element becomes positioned relative to that ancestor instead of the viewport. The element still behaves as 'fixed' locally, but no longer stays put relative to the actual browser window.",
    difficulty: "hard",
    companies: ["Meta"],
    orderIndex: 112,
  },
  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What's the difference between a media query and a container query?",
    answer:
      "A media query can only ever read the browser viewport's dimensions, regardless of where the styled element actually sits on the page. A container query instead reads the size of a specific containing element, so the same component can respond correctly whether it's rendered in a full-width column or a narrow sidebar.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 113,
  },
  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What does container-type do, and why is it required for container queries to work?",
    answer:
      "container-type: inline-size (or size) opts an ancestor element into being a queryable container, establishing size containment on it. It's required because an element can't query its own size from within its own rules — that size might depend on the very rules being evaluated, a circular dependency — so the containment boundary always has to be declared on a parent, one level up from the element actually being styled.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 114,
  },
  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "Why do container queries make components more genuinely reusable than media queries?",
    answer:
      "A component styled with a media query has no way to know how wide the space it's actually rendering into is — only how wide the whole viewport is — so it silently breaks the moment it's reused somewhere narrower than the full page. A container query lets the component ask its own container's width instead, so the exact same component styles correctly no matter which layout context it's dropped into.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 115,
  },
  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "Can a container query read the size of the exact element it's styling?",
    answer:
      "No — the query always reads an ancestor's size, never the element's own. A rule can't safely depend on the size of the very element whose styles it's helping determine, since that would be circular; the queried container has to be declared on a parent via container-type, one or more levels above the element the @container rule actually styles.",
    difficulty: "hard",
    companies: ["Microsoft"],
    orderIndex: 116,
  },
  {
    collection: "ff-75",
    conceptSlug: "responsive-design-container-queries",
    question: "What's a common real-world use case for container queries?",
    answer:
      "A card component that needs to switch from a stacked to a side-by-side layout once it has enough room — correctly, whether it's placed in a full-width feed, a two-column grid, or a narrow sidebar widget. Before container queries, this required either JavaScript with a ResizeObserver, or accepting that the component would only look right in one specific layout context.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 117,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "What's the difference between a CSS custom property and a Sass/LESS variable?",
    answer:
      "A Sass variable is a compile-time text substitution — by the time the stylesheet ships, every reference has already been replaced with a fixed value, with no runtime awareness left. A CSS custom property ships to the browser as-is and is resolved live at render time by walking up the cascade from wherever var() is used, which means redefining it on any ancestor can retheme every descendant instantly, with no rebuild.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 118,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "How does var(--name) actually resolve at render time?",
    answer:
      "It's resolved by walking up the cascade from the element using var(), not from wherever --name happens to be declared in the file — checking that element first, then its ancestors, until a matching declaration is found. This is exactly like inheritance's lookup, which is why the same variable name can resolve to different actual values in different parts of the page.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 119,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "How would you implement a dark mode toggle using custom properties, without a JavaScript re-render?",
    answer:
      "Define the theme's custom properties (--accent-color, --surface-bg, etc.) at :root, and redefine them under a .theme-dark class scope. Toggling that single class on the <html> or <body> element (via classList.toggle, no React re-render needed) makes the browser re-resolve every var() reference beneath that point automatically, since custom properties genuinely cascade like any other CSS property.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 120,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "What happens if you reference a custom property that was never declared?",
    answer:
      "var() accepts an optional second argument as a fallback — var(--accent-color, blue) resolves to blue if --accent-color isn't declared anywhere in the element's ancestor chain. Without a fallback, an undefined custom property makes the property it's used in behave as if it were unset (its inherited or initial value), rather than causing an error.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 121,
  },
  {
    collection: "ff-75",
    conceptSlug: "custom-properties-theming",
    question: "Can custom properties be read and changed from JavaScript?",
    answer:
      "Yes — element.style.setProperty('--accent-color', 'cyan') sets it, and getComputedStyle(element).getPropertyValue('--accent-color') reads its resolved value. This is what makes custom properties useful for values JavaScript needs to drive dynamically, like a draggable slider's live position, without needing to rewrite an entire class's worth of styles imperatively.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 122,
  },
  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What's the difference between a pseudo-class and a pseudo-element?",
    answer:
      "A pseudo-class (single colon, like :hover or :nth-child) selects a real element in the DOM that happens to be in a particular state, position, or relationship. A pseudo-element (double colon, like ::before or ::first-line) targets a sub-part of an element's rendered content that has no corresponding node in the DOM at all — it's generated or implied by rendering, not a real element you could otherwise select.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 123,
  },
  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "How does :has() differ from every other CSS combinator?",
    answer:
      "Every other combinator (descendant, child >, sibling ~/+) only lets a selector reach downward or sideways from where it's anchored. :has() is the first selector that lets an element match based on its descendants — form:has(:invalid) selects the <form> itself, driven by whether some input inside it is currently invalid, effectively acting as a 'parent selector' that nothing in CSS could express before.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 124,
  },
  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "Give an example of something :has() lets you do in pure CSS that used to require JavaScript.",
    answer:
      "Highlighting a form as invalid whenever any of its fields are invalid — form:has(:invalid) { border-color: red; } — previously required a JavaScript event listener toggling a class based on each field's validity. Similarly, .card:has(img) can style a card differently only when it actually contains an image, without a conditional class from a component's render logic.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 125,
  },
  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What's the difference between :nth-child() and :nth-of-type()?",
    answer:
      ":nth-child(n) counts an element's position among all its siblings, regardless of tag name — so li:nth-child(2) only matches if the <li> is literally the second child overall. :nth-of-type(n) counts an element's position only among siblings of the same tag name, ignoring any other elements interspersed between them.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 126,
  },
  {
    collection: "ff-75",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    question: "What do :is() and :where() do, and how do they differ in specificity?",
    answer:
      "Both let you group several selectors into one, shorter rule — :is(header, footer) nav matches a nav inside either a header or a footer. The difference is specificity: :is() takes on the specificity of its most specific argument, while :where() always contributes zero specificity, regardless of what's inside it — useful for writing overridable base styles that shouldn't fight with more specific component rules later.",
    difficulty: "hard",
    companies: ["Microsoft", "Meta"],
    orderIndex: 127,
  },
  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "Why do transform and opacity animate more smoothly than width or top?",
    answer:
      "transform and opacity are Composite-only properties — the browser can hand an already-painted layer straight to the GPU and just reposition or fade it, skipping Layout and Paint entirely on every frame. width and top are layout-triggering — changing either forces the browser to recompute geometry (Layout), re-rasterize pixels (Paint), and then recomposite, on every single frame, which is far more expensive at 60fps.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 128,
  },
  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "What's a compositor layer, and how does will-change relate to it?",
    answer:
      "A compositor layer is a separately rasterized bitmap the GPU can move, scale, or fade independently of the rest of the page, which is what makes transform/opacity animations cheap. will-change: transform hints the browser to pre-promote an element onto its own layer before an animation starts, avoiding a layer-creation cost on the very first frame — but it should be used sparingly, since promoting many elements trades memory for that benefit.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 129,
  },
  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "How would you diagnose a janky animation using browser DevTools?",
    answer:
      "The Performance panel's frame-by-frame breakdown shows purple bars for Layout and green bars for Paint on each frame — a janky animation shows repeated purple/green activity on every frame, while a smooth 60fps one shows almost nothing but a thin composite step. Seeing repeated Layout/Paint work points directly at which animated property is the culprit.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 130,
  },
  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "Why might overusing will-change actually hurt performance?",
    answer:
      "Every element with will-change gets promoted to its own compositor layer, and each layer consumes GPU memory. Applying it broadly (or leaving it on elements that aren't actively animating) can create far more layers than the device can comfortably manage, trading away the memory budget it was meant to save time with — it's a targeted, temporary hint for elements about to animate, not a default optimization to sprinkle everywhere.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 131,
  },
  {
    collection: "ff-75",
    conceptSlug: "animation-performance",
    question: "What rendering pipeline stages does each property tier skip when animated?",
    answer:
      "Layout-triggering properties (width, top, margin) skip nothing — Layout, Paint, and Composite all re-run every frame. Paint-only properties (color, box-shadow) skip Layout but still re-run Paint and Composite. Composite-only properties (transform, opacity) skip both Layout and Paint, running only Composite — the cheapest possible path, and the only one that reliably holds 60fps under load.",
    difficulty: "medium",
    companies: ["Microsoft", "Meta"],
    orderIndex: 132,
  },
  // Phase 10 (Feature 45) — TypeScript Concepts, 5 flagship questions per new concept
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "What's the difference between `any` and `unknown` in TypeScript?",
    answer:
      "Both accept any value on assignment, but they differ completely on what you can do with that value afterward. `any` disables type checking entirely — every operation on it is allowed, including ones that will crash at runtime, and it silently spreads to any variable it's assigned to. `unknown` blocks every operation until you've narrowed it with a type guard (`typeof`, `instanceof`, etc.) — it's the safe choice for a genuinely untyped boundary like a JSON response or `localStorage` read.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 133,
  },
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "When does TypeScript infer a type instead of requiring an annotation?",
    answer:
      "Whenever a variable is assigned a value at declaration, TypeScript infers the narrowest type that fits and holds the variable to it going forward — `let count = 5` is inferred as `number` with no annotation needed. Inference also flows through function return values and generic calls. Annotations mostly earn their keep on function parameters and public APIs, where there's no assigned value yet for TypeScript to infer from.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 134,
  },
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "What does the `never` type represent, and when would a function return it?",
    answer:
      "`never` is the type of a value that can't exist — it represents an unreachable case. A function returns `never` when it never actually produces a value: one that always throws, or one that infinite-loops. It also shows up as the result of narrowing away every possibility in a union, which is exactly what powers exhaustiveness checks.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 135,
  },
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "Why is `unknown` considered safer than `any` even though both accept any value?",
    answer:
      "The safety difference is entirely about what happens *after* assignment, not at assignment. `any` propagates silently and permits every operation with no error, so a type mistake surfaces as a runtime crash instead of a compile error. `unknown` requires an explicit narrowing check before any operation is allowed, so the compiler keeps enforcing safety the moment the value is actually used, not just when it first enters the system.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 136,
  },
  {
    collection: "ff-75",
    conceptSlug: "basic-types-inference",
    question: "How does exhaustiveness checking use the `never` type?",
    answer:
      "A `default` case (or final `else`) that assigns the remaining value to a parameter typed `never` only compiles if every other case has truly been handled — once all real possibilities are narrowed away in the preceding branches, what's left is provably nothing, i.e. `never`. Add a new variant to the original union without handling it, and that assignment stops compiling, catching the missing case at build time instead of at runtime.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 137,
  },
  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "What is declaration merging, and which of `interface`/`type` supports it?",
    answer:
      "Declaration merging is when multiple declarations with the same name automatically combine into one — two separate `interface Config { ... }` blocks anywhere in scope merge into a single shape with every field from both. Only `interface` supports this; declaring `type Config = { ... }` a second time is a compile error (\"Duplicate identifier\"), not a merge. It's how libraries safely extend global or third-party types without editing the original source.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 138,
  },
  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "When would you choose `type` over `interface`, or vice versa?",
    answer:
      "`type` is the only option once a shape needs to be a union, a tuple, or any non-object type expression — `interface` has no syntax for \"one of these three string literals.\" `interface` is preferable for object shapes a consumer might reasonably need to extend later, like component props or a public API's request/response shape, since it supports declaration merging and a slightly more familiar `extends` syntax.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 139,
  },
  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "Can a `type` alias express a union? Can an `interface`?",
    answer:
      "`type` can — `type Status = \"idle\" | \"loading\" | \"error\"` is a completely ordinary type alias. `interface` cannot; it can only describe the shape of a single object, function, or class, so there's no way to write an interface that means \"one of these three specific things.\" This is the clearest case where `type` is not optional.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 140,
  },
  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "What happens if you declare two `type` aliases with the same name?",
    answer:
      "It's a compile error — \"Duplicate identifier\" — because `type` aliases don't merge the way `interface` declarations do. Each `type` name can only be declared once in a given scope; if you need to add fields to an existing type-aliased shape, you have to define a new type and intersect it (`type Extended = Original & { extra: string }`) rather than redeclare the original name.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 141,
  },
  {
    collection: "ff-75",
    conceptSlug: "interfaces-vs-type-aliases",
    question: "How do you extend an interface, and how does that compare to intersecting a type?",
    answer:
      "`interface Admin extends User { role: string }` adds fields on top of `User`'s shape, and TypeScript reports a clear error if a field conflicts incompatibly. The `type` equivalent is an intersection — `type Admin = User & { role: string }` — which produces a structurally identical result but resolves conflicting fields differently (an intersection of two incompatible types for the same key collapses to `never` for that field, rather than raising the same explicit conflict error `extends` does).",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 142,
  },
  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "What problem do generics solve compared to using `any`?",
    answer:
      "Without generics, a reusable function has two bad options: duplicate it once per concrete type, or type its parameters `any` and lose type checking entirely. A generic type parameter (`<T>`) lets one function definition work across every type while TypeScript still infers and enforces the actual type per call — `first(numbers)[0]` is known to be `number`, `first(strings)[0]` is known to be `string`, from the exact same function body.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 143,
  },
  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "How does `K extends keyof T` constrain a generic type parameter?",
    answer:
      "`keyof T` produces a union of `T`'s actual property names, and `K extends keyof T` restricts the generic parameter `K` to only those names. A function like `pluck<T, K extends keyof T>(obj: T, key: K): T[K]` then rejects a typo'd or nonexistent key at compile time, since a string that isn't one of `T`'s real keys simply isn't assignable to `K`.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 144,
  },
  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "What happens when you call a generic function without an explicit type argument?",
    answer:
      "TypeScript infers the type argument from the actual arguments passed at the call site — `first([1, 2, 3])` infers `T` as `number` without needing `first<number>([1, 2, 3])` written out. Explicit type arguments are only needed when inference genuinely can't determine `T` from the call, such as calling a generic function with no arguments that reference `T` at all.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 145,
  },
  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "Can a function declare more than one generic type parameter?",
    answer:
      "Yes — a signature can declare as many generic parameters as it needs, each inferred independently from a different argument. `function merge<A, B>(a: A, b: B): A & B` infers `A` from the first argument and `B` from the second, and returns their intersection, with no relationship required between the two type parameters unless one is explicitly constrained against the other.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 146,
  },
  {
    collection: "ff-75",
    conceptSlug: "generics",
    question: "Why doesn't `first<T>(arr: T[]): T` need to be duplicated per array type?",
    answer:
      "`T` is a placeholder that gets filled in per call rather than fixed at the function's definition — TypeScript infers a fresh `T` for `first([1,2,3])` (`number`) and a different fresh `T` for `first([\"a\",\"b\"])` (`string`) from the same compiled function. The alternative — `firstNumber`, `firstString`, and so on — would require identical logic copy-pasted once per concrete type, which is exactly the duplication generics exist to eliminate.",
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 147,
  },
  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "What does `Partial<T>` do, and where is it commonly used?",
    answer:
      "`Partial<T>` produces a new type identical to `T` but with every property made optional. It's most common for \"update\" payloads, where a caller only sends the fields that actually changed, and for objects that get built up incrementally across several steps before every required field has a value.",
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 148,
  },
  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "What's the difference between `Pick<T, K>` and `Omit<T, K>`?",
    answer:
      "`Pick<T, K>` keeps only the listed keys `K` from `T` and drops everything else — useful for a narrow view like a list-item type. `Omit<T, K>` is the inverse: it keeps every key of `T` *except* the listed ones — useful for a \"create\" input type that excludes a server-assigned field like `id`. Both are derived from `T`, so they stay accurate automatically if `T` gains or loses fields later.",
    difficulty: "easy",
    companies: ["Google", "Microsoft"],
    orderIndex: 149,
  },
  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "How does `Record<K, V>` differ from the other utility types in what it derives?",
    answer:
      "`Partial`, `Pick`, and `Omit` all transform an *existing* object type. `Record<K, V>` doesn't start from an object type at all — it constructs one from a union of keys `K` and a single value type `V`, mapping every key in `K` to `V`. It's the one utility type here whose job is to build a shape from a key list, not derive a variant of an existing shape.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 150,
  },
  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "How would you combine `Partial` and `Omit` to build an \"update\" input type?",
    answer:
      "`type UserUpdateInput = Partial<Omit<User, \"id\">>` — `Omit` first drops the server-assigned `id` field entirely, then `Partial` makes every remaining field optional, since an update payload might only touch one or two fields at a time. Utility types compose freely because each one is just a function from a type to a type, so nesting them is ordinary function composition at the type level.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 151,
  },
  {
    collection: "ff-75",
    conceptSlug: "utility-types",
    question: "Why do utility types stay in sync automatically when the source type changes?",
    answer:
      "Because they're computed from `T`, not redefined by hand — `Pick<User, \"id\" | \"name\">` re-derives its shape from `User`'s current definition every time it's used, so adding a field to `User` doesn't require touching every derived type separately. A hand-written duplicate type has no such connection and silently drifts out of sync the moment the source type changes and the duplicate isn't updated to match.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 152,
  },
  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "What's the difference between `typeof` narrowing and `instanceof` narrowing?",
    answer:
      "`typeof` distinguishes JavaScript's primitive types — `\"string\"`, `\"number\"`, `\"boolean\"`, `\"object\"`, `\"function\"`, `\"undefined\"` — but can't tell apart different object shapes or class instances, since they're all `\"object\"`. `instanceof` fills that gap by checking against a constructor's prototype chain, so `err instanceof RangeError` narrows correctly even though `typeof err` would just say `\"object\"` for any `Error` subclass.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 153,
  },
  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "How does the `in` operator narrow a union of object types?",
    answer:
      "`if (\"radius\" in shape)` checks whether a property actually exists on the value at runtime, and TypeScript uses that check to narrow `shape` to whichever union member(s) declare a `radius` field. It's the tool for narrowing object shapes that don't share a common literal discriminant field — where `typeof`/`instanceof` can't help because both variants are plain objects.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 154,
  },
  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "Why does narrowing stop working once a value is passed into a callback?",
    answer:
      "Narrowing is control-flow analysis — TypeScript tracks which checks are guaranteed to have run by a given line, based on the literal shape of the surrounding `if`/`switch`/early-return statements. Once a narrowed value crosses into a separate callback (especially an async one, or one stored and called later), the compiler can no longer statically prove the original check still holds by the time that callback runs, so the narrowing doesn't carry over automatically.",
    difficulty: "hard",
    companies: ["Stripe", "Meta"],
    orderIndex: 155,
  },
  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "What's the difference between narrowing and a type assertion (`as`)?",
    answer:
      "Narrowing is always backed by a real runtime check the compiler can verify — `typeof value === \"string\"` genuinely proves `value` is a string in that branch. A type assertion (`value as string`) makes no such promise; it just tells the compiler to trust you, with zero runtime check behind it, so an incorrect assertion compiles cleanly and fails later at the point the value is actually used incorrectly.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 156,
  },
  {
    collection: "ff-75",
    conceptSlug: "type-narrowing",
    question: "How does `Array.isArray` help narrow a `T | T[]` union?",
    answer:
      "`typeof` can't distinguish an array from a plain object — both report `\"object\"` — so `Array.isArray(value)` is the dedicated check for that specific split. Inside the `if (Array.isArray(value))` branch, TypeScript narrows `value` to the array member of the union; in the `else`, it narrows to the non-array member, letting each branch use the value's real shape with no cast.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 157,
  },
  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "What is a discriminant field, and why does it need to be a literal type?",
    answer:
      "A discriminant is a field every variant in a union shares, holding a distinct literal value — often `type` or `kind`. It has to be a literal type (`\"circle\"`, not the general type `string`) specifically because narrowing depends on TypeScript being able to prove that `shape.kind === \"circle\"` rules out every other variant; if `kind` were typed as plain `string`, no single check could ever eliminate the other possibilities.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 158,
  },
  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "How does exhaustiveness checking work with a discriminated union and `never`?",
    answer:
      "A `default` case that passes the remaining value into a function typed to accept only `never` will only compile if every other `case` in the `switch` has already narrowed away every real variant. Add a new variant to the union without adding its `case`, and the `default` branch's value is no longer narrowed to `never` — the compile error lands exactly where the new case needs to be added.",
    difficulty: "hard",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 159,
  },
  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "Why are discriminated unions the standard pattern for Redux-style reducers?",
    answer:
      "A reducer's whole job is branching on `action.type` and reading whatever data that specific action carries — exactly what a discriminated union is designed for. Typing `Action` as a union of `{ type: \"increment\" } | { type: \"set\"; value: number }` means `switch (action.type) { case \"set\": return action.value; }` gets `action.value` fully type-checked, with no manual cast, and no risk of reading a field that variant doesn't actually have.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 160,
  },
  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "What breaks if two variants in a discriminated union share the same discriminant value?",
    answer:
      "Narrowing becomes ambiguous — if both `Circle` and `Ellipse` used `kind: \"circle\"`, checking `shape.kind === \"circle\"` couldn't narrow to just one of them, since TypeScript can't tell which fields are actually present without a unique literal per variant. Each variant's discriminant value has to be distinct for the whole pattern to work at all.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 161,
  },
  {
    collection: "ff-75",
    conceptSlug: "discriminated-unions",
    question: "How does a `switch` on the discriminant narrow the entire object, not just that field?",
    answer:
      "TypeScript's control-flow analysis ties the discriminant's narrowed value back to which union member the whole object must be — inside `case \"circle\":`, it's not just `shape.kind` that's known to be `\"circle\"`, the compiler has eliminated every other possibility for `shape` itself, so `shape.radius` becomes accessible with no cast, even though `radius` and `kind` are two separate fields.",
    difficulty: "hard",
    companies: ["Microsoft", "Stripe"],
    orderIndex: 162,
  },
  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "What does `{ [K in keyof T]: ... }` do?",
    answer:
      "It's a mapped type — `keyof T` produces a union of `T`'s property names, and `[K in ...]` iterates over that union once per key, producing a new value type for each, the same way `Array.prototype.map` transforms every array element the same way. `T[K]` inside the mapping looks up that specific key's original value type, so the result stays connected to `T`'s real shape.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 163,
  },
  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How does a conditional type like `T extends U ? X : Y` get evaluated?",
    answer:
      "It's the type-level equivalent of a ternary — the compiler checks whether `T` is assignable to `U`, and resolves to `X` if so, `Y` if not, entirely at compile time with no runtime cost. It's most powerful combined with a generic `T`, since the same conditional type expression can resolve differently for every concrete type it's applied to.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 164,
  },
  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "What does `infer` do inside a conditional type?",
    answer:
      "`infer` introduces a new type variable inside a conditional type's `extends` clause, capturing whatever type appears in that specific position if the match succeeds. `T extends (...args: never[]) => infer R ? R : never` matches any function type and captures its actual return type as `R` — it's how `ReturnType<T>` and similar utility types extract a piece of a larger type instead of just testing it.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 165,
  },
  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How is `Partial<T>` implemented using a mapped type?",
    answer:
      "`type MyPartial<T> = { [K in keyof T]?: T[K] }` — every key of `T` maps to itself, with a `?` added to make it optional. There's no special compiler feature behind `Partial`; it's a three-line mapped type shipped as a named utility so nobody has to write it themselves.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 166,
  },
  {
    collection: "ff-75",
    conceptSlug: "conditional-mapped-types",
    question: "How is `ReturnType<T>` implemented using a conditional type?",
    answer:
      "`type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never` — the conditional checks whether `T` matches a function type pattern, and if so, `infer R` captures the function's actual return type; if `T` isn't a function at all, the result falls back to `never`. It's a conditional type using `infer` to pull one specific piece out of a larger matched type.",
    difficulty: "hard",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 167,
  },
  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What can a template literal type express that a plain `string` type can't?",
    answer:
      "A template literal type describes every string matching a specific pattern, checked at compile time — `type Margin = \\`margin-${\"top\" | \"right\" | \"bottom\" | \"left\"}\\`` is exactly those four literal strings, not any arbitrary string. A plain `string` accepts any value at all, so a typo like `\"margin-diagonal\"` would compile; as the template literal type, it's a compile error instead.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 168,
  },
  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "Why does TypeScript's structural typing let you pass an `OrderId` where a `UserId` is expected, if both are just `string`?",
    answer:
      "TypeScript compares types by shape, not by name — `type UserId = string` and `type OrderId = string` both compile down to exactly `string`, and structurally there's nothing distinguishing them, so a function expecting `UserId` happily accepts a value typed `OrderId`. This is exactly the class of bug — passing the wrong kind of ID where a similarly-shaped one belongs — that structural typing alone can't catch.",
    difficulty: "hard",
    companies: ["Stripe", "Amazon"],
    orderIndex: 169,
  },
  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What is a \"branded type,\" and how does it fix that problem?",
    answer:
      "A branded type intersects a base type with a fake marker property that only exists in the type system — `type UserId = string & { readonly __brand: \"UserId\" }`. Two brands with different marker values become structurally incompatible even though their base type is identical, so `OrderId` is no longer assignable where `UserId` is expected, simulating the nominal typing (matched by name, not shape) that TypeScript doesn't have natively.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 170,
  },
  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "Does a brand exist at runtime?",
    answer:
      "No — the `__brand` marker property is purely a type-level fiction that never actually exists on any real value; a branded `UserId` is, at runtime, just a plain string like any other. The brand only affects what the compiler will and won't let you assign; it adds zero runtime behavior or overhead.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 171,
  },
  {
    collection: "ff-75",
    conceptSlug: "template-literal-branded-types",
    question: "What are two real-world use cases for branded types?",
    answer:
      "Distinguishing structurally-identical ID types (a `UserId` from an `OrderId`, both really `string`, so they can't be passed to the wrong function by accident) and distinguishing units or currencies (a dollar amount from a cent amount, or meters from feet, both really `number`, so they can't be silently mixed in a calculation). Both are cases where the underlying primitive type is the same but the *meaning* genuinely isn't interchangeable.",
    difficulty: "medium",
    companies: ["Stripe", "Google"],
    orderIndex: 172,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What is the \"First Rule of ARIA\"?",
    answer:
      "No ARIA is better than bad ARIA — always prefer a real semantic HTML element over recreating its behavior with ARIA attributes on a generic element like a div. A native `<button>` already ships with the correct role, keyboard support, and focusability; a `<div role=\"button\">` only gets the announced role, and every other piece of behavior has to be rebuilt by hand and is easy to get wrong.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 173,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "Why is a `<div onclick=\"...\">` less accessible than a `<button onclick=\"...\">`, even if they look identical?",
    answer:
      "A `<div>` has no implicit role, isn't in the Tab order by default, has no visible focus indicator, and doesn't respond to Enter or Space — all of that is native, free behavior on `<button>`. Recreating it on a div means adding `role=\"button\"`, `tabindex=\"0\"`, a focus style, and manual keydown handlers for both Enter and Space, and missing any one of them leaves a control that mouse users can operate but keyboard and screen reader users can't.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 174,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What are landmark elements and why do they matter for screen reader users?",
    answer:
      "Landmarks — `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — mark out the major regions of a page in a way screen readers expose as a navigable list. Instead of reading through the entire page linearly, a screen reader user can jump directly to the main content or the navigation menu, the same way a sighted user visually scans straight to the section they want.",
    difficulty: "easy",
    companies: ["Stripe"],
    orderIndex: 175,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "When is it actually appropriate to add an ARIA role to a non-semantic element?",
    answer:
      "Only when there's no native HTML element for the pattern at all — a tab panel, a combobox, a custom slider. Even then, the underlying element should still be a real focusable, keyboard-operable base (often a `<button>` or a div with `tabindex=\"0\"` and full key handling) — ARIA augments the semantics on top of working keyboard behavior, it doesn't substitute for it.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 176,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-roles-and-semantic-html",
    question: "What's wrong with adding `role=\"button\"` to a div and stopping there?",
    answer:
      "It announces to assistive tech that the element behaves like a button, without actually making it behave like one — no keyboard focusability, no Enter/Space activation. That's arguably worse than no ARIA at all: a screen reader user is told \"this is a button\" and then discovers it doesn't respond the way every other button on the page does.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 177,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "What's the difference between `alt=\"\"` and omitting the `alt` attribute entirely?",
    answer:
      "`alt=\"\"` is a deliberate signal that the image is decorative — a screen reader silently skips it. Omitting `alt` altogether is usually a bug: many screen readers fall back to announcing the image's file path or name as if it were real content, which is worse than saying nothing.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 178,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How should alt text differ for a functional image (one inside a link or button) versus a purely informational image?",
    answer:
      "A functional image's alt text should describe the destination or action it performs — \"View shopping cart\" for a cart icon inside a link — not what the icon literally looks like. An informational image's alt text should describe the content or meaning of the image itself, since there's no action for it to describe.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 179,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "What's the difference between captions and a transcript?",
    answer:
      "Captions are text synced to a video's timeline, covering dialogue and important non-speech sound, meant to be read alongside real-time playback. A transcript is a full text version with no timeline — used for audio-only content, or as a scannable/searchable alternative alongside a captioned video.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 180,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How do you make an icon-only button (no visible text label) accessible?",
    answer:
      "Give the button itself an accessible name via `aria-label` (or visually-hidden text inside it), and mark the icon `aria-hidden=\"true\"` so it isn't announced redundantly alongside the label. Without one of these, a screen reader either announces nothing useful or announces the icon's raw file/asset name.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 181,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-images-media",
    question: "How would you handle alt text for a complex image like a bar chart?",
    answer:
      "A short `alt` names what the image is, but the real information — the actual data or takeaway the chart communicates — needs to exist as accessible text nearby: a data table, or a text summary of the key insight. A one-line alt attribute alone can't reasonably convey a multi-series chart's full content.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 182,
  },
  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What WCAG AA contrast ratio is required for normal text versus large text?",
    answer:
      "4.5:1 for normal text, and 3:1 for large text (18pt and up, or 14pt and up if bold). Large text gets a lower bar because its bigger, heavier letterforms stay legible at a lower contrast ratio than small text needs.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 183,
  },
  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What is relative luminance, and how does it relate to contrast ratio?",
    answer:
      "Relative luminance is a standardized 0–1 measure of how much light a given color reflects, computed from its red/green/blue channel values with a gamma-correction step per channel. Contrast ratio compares the relative luminance of two colors — `(lighter + 0.05) / (darker + 0.05)` — giving a single number from 1:1 (no contrast) to 21:1 (pure black on pure white).",
    difficulty: "medium",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 184,
  },
  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "Why do UI components like input borders have their own contrast requirement, separate from text contrast?",
    answer:
      "WCAG 1.4.11 (Non-text Contrast) requires a 3:1 ratio for meaningful graphical elements — input borders, icons, focus indicators — because those convey information visually just like text does. A form field can pass every text-contrast check and still fail accessibility if its border is nearly invisible against the page background.",
    difficulty: "medium",
    companies: ["Amazon", "Meta"],
    orderIndex: 185,
  },
  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "Why shouldn't color alone convey information, and what's a compliant alternative?",
    answer:
      "Roughly 1 in 12 men have some form of color vision deficiency, so a red-versus-green distinction alone can be imperceptible to a real portion of users. WCAG 1.4.1 requires a second signal alongside color — an icon, text label, or pattern — such as pairing a red error border with an error icon and message text, not the color change alone.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 186,
  },
  {
    collection: "ff-75",
    conceptSlug: "color-contrast-visual-accessibility",
    question: "What's the maximum possible WCAG contrast ratio, and which two colors produce it?",
    answer:
      "21:1, produced by pure black (`#000000`) against pure white (`#FFFFFF`) — their relative luminance values are exactly 0 and 1, which plug into the ratio formula `(1 + 0.05) / (0 + 0.05)` to give exactly 21.",
    difficulty: "hard",
    companies: ["Stripe"],
    orderIndex: 187,
  },
  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What's the difference between `tabindex=\"0\"`, `tabindex=\"-1\"`, and a positive `tabindex`?",
    answer:
      "`tabindex=\"0\"` inserts an otherwise-unfocusable element into the natural Tab order at its DOM position. `tabindex=\"-1\"` makes an element focusable only via JavaScript (`element.focus()`), removing it from the Tab sequence entirely. A positive `tabindex` creates a separate manually-numbered sequence that overrides DOM order completely, running before every `tabindex=\"0\"`/unset element.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 188,
  },
  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "Why is a positive `tabindex` generally considered an anti-pattern?",
    answer:
      "It builds a manually-numbered sequence that's brittle to maintain — inserting a single new focusable element anywhere on the page usually means renumbering everything that should come after it, and forgetting to do so silently produces the wrong tab order. The natural DOM-order sequence needs no such bookkeeping at all.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 189,
  },
  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What is a focus trap, and why does a modal dialog need one?",
    answer:
      "A focus trap constrains Tab and Shift+Tab to cycle only within the modal's own focusable elements while it's open — reaching the last one and pressing Tab wraps back to the first, instead of escaping into page content sitting behind the modal. Without it, a keyboard user can tab into content they can't see (it's visually behind the modal overlay) and lose track of where focus even is.",
    difficulty: "medium",
    companies: ["Stripe", "Microsoft"],
    orderIndex: 190,
  },
  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What does `tabindex=\"-1\"` on a `<main>` element enable for a skip link, and why is it needed?",
    answer:
      "A skip link's `href=\"#main-content\"` scrolls the page to `<main>` on activation, but doesn't move keyboard focus there by default since `<main>` isn't natively focusable. Adding `tabindex=\"-1\"` makes it programmatically focusable, so the browser can actually move focus to it when the anchor link is activated — without it, the page scrolls but subsequent Tab presses resume from wherever focus actually still is, not from the new visual position.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 191,
  },
  {
    collection: "ff-75",
    conceptSlug: "keyboard-navigation-focus-management",
    question: "What accessibility problem does `outline: none` with no replacement introduce?",
    answer:
      "It removes the visible indicator of which element currently has keyboard focus, without removing keyboard navigation itself — a keyboard-only user can still Tab through the page, but has no way to see where they currently are. It's one of the most common accessibility regressions, usually introduced purely for cosmetic reasons.",
    difficulty: "easy",
    companies: ["Meta"],
    orderIndex: 192,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What are the two ways to programmatically associate a `<label>` with an input?",
    answer:
      "A matching `for`/`id` pair (`<label for=\"email\">` with `<input id=\"email\">`), or wrapping the input directly inside the `<label>` element with no `for`/`id` needed. Either way, a screen reader announces the label text when the input receives focus, and clicking the label focuses (or toggles) the input.",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 193,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "Why isn't placeholder text a substitute for a `<label>`?",
    answer:
      "Placeholder text disappears the moment the user types, typically renders at lower contrast than real body text, and isn't reliably announced as the field's accessible name by every screen reader. A label persists regardless of the field's content and is the correct source of the field's name — placeholder text can only supplement it as a formatting hint.",
    difficulty: "easy",
    companies: ["Stripe"],
    orderIndex: 194,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What does `aria-describedby` do, and how is it different from a label?",
    answer:
      "`aria-describedby` points at the id of separate text — a hint or error message — that gets appended after a field's accessible name is announced, giving extra context. It never replaces the accessible name a label provides; a field needs both a real label (\"what is this field\") and, when relevant, an `aria-describedby` (\"what else should I know\") — neither covers for the other.",
    difficulty: "medium",
    companies: ["Meta", "Microsoft"],
    orderIndex: 195,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "What's the purpose of pairing `aria-invalid=\"true\"` with `aria-describedby` on an errored field?",
    answer:
      "`aria-invalid=\"true\"` announces the field's current validation state as part of its accessible description, while `aria-describedby` points at the specific error text explaining why. Together, a screen reader user hears both that the field is invalid and what to fix — a visual-only red border communicates neither.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 196,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-forms",
    question: "Why use `<fieldset>`/`<legend>` for a group of radio buttons instead of just a heading above them?",
    answer:
      "`<fieldset>`/`<legend>` creates a real programmatic grouping — a screen reader announces the legend's question once as part of each radio button's accessible name, so \"Preferred contact method, Email, radio button\" is heard, not just \"Email, radio button\" with the grouping question lost. A visual heading above the group has no such programmatic connection to the inputs below it.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 197,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "What's the difference between `aria-live=\"polite\"` and `aria-live=\"assertive\"`?",
    answer:
      "`polite` waits until the screen reader finishes whatever it's currently reading before announcing the change, without interrupting. `assertive` interrupts immediately, and should be reserved for genuinely urgent, time-sensitive content since every use of it cuts off whatever the user was already listening to.",
    difficulty: "easy",
    companies: ["Meta", "Google"],
    orderIndex: 198,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "What do `role=\"status\"` and `role=\"alert\"` imply, in terms of `aria-live`?",
    answer:
      "`role=\"status\"` implies `aria-live=\"polite\"` plus the semantics of a status message. `role=\"alert\"` implies `aria-live=\"assertive\"` plus alert semantics. Both are shorthands — using the explicit role is often clearer than the raw `aria-live` attribute for these common cases.",
    difficulty: "medium",
    companies: ["Stripe"],
    orderIndex: 199,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Why might a screen reader fail to announce a live region that's inserted into the DOM already containing its final text?",
    answer:
      "A live region only announces content that changes after it's already present in the accessibility tree — it detects a delta, not an appearance. If the container and its final text arrive together in one DOM update, there's no \"before\" state to compare against, so no change event fires and many screen readers never announce it, even though the markup looks entirely correct.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 200,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Why should `aria-live=\"assertive\"` be used sparingly?",
    answer:
      "Every assertive announcement interrupts whatever the screen reader is currently reading, regardless of how minor the update is. Overusing it for routine updates (a save confirmation, a result count) constantly disrupts the user's listening experience — it should be reserved for content a sighted user would also treat as urgent.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 201,
  },
  {
    collection: "ff-75",
    conceptSlug: "aria-live-regions",
    question: "Name two real UI patterns that commonly use a live region.",
    answer:
      "Toast/snackbar notifications (\"Changes saved\", \"Item added to cart\") and live search result counts that update as a user types — both need to be announced to a screen reader user without stealing keyboard focus away from where they're currently working.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 202,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What three things does a custom widget like a modal or combobox need to be accessible?",
    answer:
      "The correct ARIA role and state (announcing what it is and its current condition), full keyboard operability matching the established pattern for that widget type, and correct focus management on open and close (focus moves into the widget when it appears, and back to its trigger when it's dismissed). Missing any one of the three leaves a widget that looks right but doesn't actually work for keyboard or screen reader users.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 203,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What is `aria-activedescendant`, and what problem does it solve?",
    answer:
      "It lets one element (usually a combobox's text input) keep real DOM keyboard focus the entire time, while `aria-activedescendant` points at the id of whichever option is currently highlighted — a 'virtual focus'. This is why typing continues to work in a combobox while arrow keys move the highlighted option: actual focus never leaves the input.",
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 204,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What is \"roving tabindex\", and how does it differ from `aria-activedescendant`?",
    answer:
      "Roving tabindex gives only the currently-active option `tabindex=\"0\"` (every other option gets `tabindex=\"-1\"`), and moves real DOM focus between options via JavaScript as arrow keys are pressed. Unlike `aria-activedescendant`, focus genuinely moves — this fits standalone widgets like menus and toolbars well, while `aria-activedescendant` fits widgets with a text input to keep focus in, like a combobox.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 205,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What should happen to focus when a modal dialog closes?",
    answer:
      "Focus should return to whatever element originally triggered the dialog's opening — not get lost at the top of the document or left on a now-removed element. Losing this return step is a common bug: after closing a modal, a keyboard user's next Tab press starts from an unpredictable point instead of picking back up where they were.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 206,
  },
  {
    collection: "ff-75",
    conceptSlug: "accessible-component-patterns",
    question: "What does `aria-modal=\"true\"` communicate, and what should happen to content outside the dialog?",
    answer:
      "It tells assistive technology that everything outside the dialog is currently inert while it's open — a screen reader shouldn't navigate into background content, matching the visual reality that it's usually obscured or dimmed. This should be paired with an actual focus trap so keyboard navigation respects the same boundary, not just the announced state.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 207,
  },
  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What kinds of accessibility issues can tools like axe-core or Lighthouse reliably catch?",
    answer:
      "Objectively-checkable, rule-based violations: missing `alt` attributes, insufficient computed color contrast, form inputs with no associated label, invalid or contradictory ARIA attribute values, duplicate ids, and a missing document `lang` attribute. All of these can be verified mechanically by inspecting the DOM and computed styles, with no ambiguity.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 208,
  },
  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's a commonly cited estimate for how much of WCAG automated tools catch, and what covers the rest?",
    answer:
      "Roughly 30–50% of real WCAG issues — the objectively rule-checkable subset. The rest requires human judgment: a keyboard-only walkthrough and real screen reader testing (VoiceOver, NVDA, JAWS) to evaluate things no static scan can verify, like whether content and interaction actually make sense.",
    difficulty: "medium",
    companies: ["Stripe", "Amazon"],
    orderIndex: 209,
  },
  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "Why can't an automated tool verify that alt text is accurate?",
    answer:
      "A scanner can confirm an `alt` attribute exists and even flag some likely-bad patterns (identical to the filename, or literally the word \"image\"), but it has no way to know whether the text actually describes what's in that specific image correctly. That's a judgment call about meaning, which is exactly the class of problem manual review exists to catch.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 210,
  },
  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's a sound workflow for combining automated and manual accessibility testing?",
    answer:
      "Run an automated scan first — it's fast and clears the objectively-checkable issues out of the way. Then do a manual pass (keyboard-only walkthrough, real screen reader testing) focused on the judgment calls a scanner structurally can't make, since that's where human review time is best spent once the easy issues are already handled.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 211,
  },
  {
    collection: "ff-75",
    conceptSlug: "automated-a11y-testing",
    question: "What's the risk of treating a passing axe-core/Lighthouse CI check as your full accessibility sign-off?",
    answer:
      "A passing automated scan only confirms the objectively-checkable ~30-50% subset of issues — it says nothing about whether a custom widget is actually keyboard-operable end to end, whether the tab order is logical, or whether content genuinely makes sense read aloud. Treating a green CI check as a complete accessibility guarantee lets real, user-facing issues ship undetected.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 212,
  },
  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "Why doesn't compressing an image's file size alone guarantee it's optimized?",
    answer:
      "Compression only addresses one of three independent levers: format. An image can be maximally compressed for its format and still waste bandwidth if it's served at 4x the dimensions it will actually render at, or if the browser has no srcset menu to pick a smaller candidate for a smaller viewport. Format, sizing, and responsive delivery all have to be right together.",
    difficulty: "easy",
    companies: ["Google", "Shopify"],
    orderIndex: 213,
  },
  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "When would you choose WebP over AVIF, given AVIF usually compresses better?",
    answer:
      "When broad, safe support matters more than squeezing out the last few percent of compression, or when the image needs animation — WebP's tooling and encoder support for animated images is more mature and consistent than AVIF's today. AVIF is the better default for static photographic content where maximum compression is the priority.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 214,
  },
  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "How do srcset and sizes work together, and why do you need both?",
    answer:
      "srcset lists candidate image files with their real pixel widths; sizes tells the browser how wide the image will actually render at different viewport widths. The browser needs both to do the math — sizes gives it the target render width at the current viewport, and srcset gives it the menu of real file widths to pick the smallest sufficient one from. Without sizes, the browser has to guess the render width, usually assuming full viewport width, which defeats the purpose.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 215,
  },
  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "What's the relationship between missing width/height on an image and layout shift?",
    answer:
      "Without explicit width/height (or an aspect-ratio), the browser doesn't know how much vertical space to reserve for the image before it loads, so surrounding content renders as if the image weren't there yet — then jumps down once the image arrives and its real dimensions are known. This is one of the most common real-world causes of a poor CLS score.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 216,
  },
  {
    collection: "ff-75",
    conceptSlug: "image-asset-optimization",
    question: "Why does loading=\"lazy\" help page weight, and when is it the wrong choice?",
    answer:
      "It defers downloading off-screen images until the user scrolls near them, so a long page with dozens of images doesn't pay for all of them up front. It's the wrong choice for above-the-fold images — especially a likely LCP candidate — since deferring the very image the user sees first only delays it further and can hurt LCP instead of helping overall performance.",
    difficulty: "medium",
    companies: ["Meta", "Uber"],
    orderIndex: 217,
  },
  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "What decides whether a module ends up in a shared chunk versus a route's own chunk?",
    answer:
      "Purely how many separate entry points (routes, in the common case) import it. A module imported by more than one route graduates into a shared chunk so it's only downloaded once; a module imported by exactly one route stays local to that route's own chunk. It has nothing to do with the module's size or perceived importance.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 218,
  },
  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "How does route-based code splitting differ from splitting a single heavy component with a dynamic import?",
    answer:
      "Route-based splitting happens automatically at a navigation boundary — visiting one route doesn't download another route's code. Splitting a single component (a rich text editor, a chart library) is the same underlying mechanism triggered manually at a component boundary instead, useful when one part of a route is disproportionately heavy and not needed until a specific interaction, like opening a modal.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 219,
  },
  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "How would you use a bundle analyzer to find what's bloating a bundle?",
    answer:
      "A bundle analyzer renders each module as a box sized proportionally to its contribution to the final bundle, usually grouped by chunk. Scanning for an unexpectedly large box — a full utility library imported for one function, an icon set pulled in whole instead of per-icon — surfaces concrete, fixable bloat far faster than guessing from the file list alone.",
    difficulty: "easy",
    companies: ["Amazon", "Shopify"],
    orderIndex: 220,
  },
  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "Can over-splitting a bundle hurt performance? How?",
    answer:
      "Yes — every chunk is a separate network request, and each one carries its own overhead (HTTP request cost, and in HTTP/1.1 environments, real connection limits). Splitting so finely that dozens of tiny chunks load for one page can net out worse than one moderately-sized bundle, especially on higher-latency connections where per-request overhead dominates. Splitting is a tradeoff to tune, not a lever to maximize.",
    difficulty: "hard",
    companies: ["Netflix", "Google"],
    orderIndex: 221,
  },
  {
    collection: "ff-75",
    conceptSlug: "bundle-size-code-splitting",
    question: "Why does Next.js's App Router split per route segment by default, without extra config?",
    answer:
      "Because the router already knows the full route tree and which segment's code a given navigation needs — it can generate a separate chunk per segment as part of the build without a developer manually drawing the split points, unlike a traditional SPA router where code splitting has to be wired up explicitly per route.",
    difficulty: "medium",
    companies: ["Vercel", "Meta"],
    orderIndex: 222,
  },
  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "What's the actual difference between async and defer on a script tag?",
    answer:
      "Both download in parallel with HTML parsing instead of blocking it immediately. async executes the moment its download finishes, whenever that happens to be — potentially interrupting parsing mid-stream. defer always waits until parsing has fully completed, and multiple defer scripts run in their original document order relative to each other; async scripts have no such ordering guarantee.",
    difficulty: "medium",
    companies: ["Google", "Amazon"],
    orderIndex: 223,
  },
  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "Why does preconnect help even though it doesn't fetch any actual resource?",
    answer:
      "Establishing a connection to a new origin (DNS lookup, TCP handshake, TLS negotiation) has real latency before the very first byte of any real request can even be sent. preconnect does that connection setup ahead of time, so when the actual request for a resource on that origin does fire, it skips straight to the request/response instead of paying the connection cost first.",
    difficulty: "medium",
    companies: ["Meta", "Cloudflare"],
    orderIndex: 224,
  },
  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "When would you reach for preload instead of just relying on the browser's normal resource discovery?",
    answer:
      "When a critical resource is discovered late by normal parsing — a font only referenced inside a CSS file, or an image set via a background-image rule the browser can't see until it's parsed the stylesheet. preload tells the browser about it immediately, from the HTML itself, so the fetch starts as early as possible instead of waiting for CSS parsing to reveal the need.",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 225,
  },
  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "Why does a <link rel=\"stylesheet\"> block rendering even though it isn't a script?",
    answer:
      "The browser can't safely paint anything until it knows the full set of styles that could apply — rendering with an incomplete stylesheet and then having to repaint once the rest arrives would produce a worse experience (a flash of unstyled or wrongly-styled content) than simply waiting. A media attribute that doesn't match the current context (like media=\"print\") is the one common escape hatch, since the browser knows that stylesheet doesn't apply to this render at all.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 226,
  },
  {
    collection: "ff-75",
    conceptSlug: "resource-loading-render-blocking",
    question: "How would you decide which scripts on a real page should be async versus defer versus left blocking?",
    answer:
      "Leave blocking only what's genuinely required before first paint — usually nothing, if styles are handled separately. Use defer for scripts that need the full DOM or a specific execution order relative to each other (most app bootstrap code). Use async for scripts with no DOM dependency and no ordering requirement relative to other scripts, like independent analytics or ad tags.",
    difficulty: "hard",
    companies: ["Meta", "Uber"],
    orderIndex: 227,
  },
  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "Why does Google use the 75th percentile of real user data instead of an average or a lab test?",
    answer:
      "An average can hide a large slow-user population behind a handful of fast ones, and a single lab test only reflects one simulated device and network. The 75th percentile requires at least three out of every four real visits — across real devices and real networks — to meet the threshold, which is a much more honest bar for 'is this page actually fast for most people' than either alternative.",
    difficulty: "hard",
    companies: ["Google", "Shopify"],
    orderIndex: 228,
  },
  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What replaced First Input Delay, and why?",
    answer:
      "Interaction to Next Paint (INP). FID only measured the delay before the browser started processing the very first interaction — it said nothing about how long that processing actually took, and nothing about any interaction after the first one. INP measures the full interaction-to-paint duration across every interaction in the visit, catching a page that's fine on the first click but janky by the fifth.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 229,
  },
  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What are the most common real causes of a poor CLS score?",
    answer:
      "Images or embeds with no reserved width/height (or aspect-ratio), causing surrounding content to jump once the real dimensions are known; web fonts that swap in and reflow text (FOIT/FOUT); and content — most often ads — injected above existing content after the initial layout has already settled.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 230,
  },
  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "What's usually responsible for a slow LCP, and how would you diagnose which one it is on a real page?",
    answer:
      "The most common culprits are a slow initial server response, render-blocking CSS/JS delaying first paint, or the LCP resource itself (usually a hero image) being discovered late or not preloaded. The Performance panel's timeline shows exactly when the LCP element rendered relative to when its own resource started downloading — a big gap there points at discovery/priority, not raw download speed.",
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 231,
  },
  {
    collection: "ff-75",
    conceptSlug: "core-web-vitals",
    question: "Is a page with excellent Core Web Vitals guaranteed to feel fast to use?",
    answer:
      "Not entirely — CWV measures three specific, well-chosen dimensions (load, responsiveness, stability), but a page could still feel slow for reasons outside those three, like a slow API response that leaves a spinner on screen well after LCP has fired, or content that's technically stable and responsive but poorly organized. CWV is a strong, standardized proxy for real experience, not an exhaustive measure of it.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 232,
  },
  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "Why does virtualization keep the DOM node count roughly constant regardless of list length?",
    answer:
      "Because only the rows currently within the viewport (plus a small overscan buffer) are ever mounted — the rest of the list simply doesn't exist as real DOM nodes at any given moment. A list of 100 rows and a list of 1,000,000 rows end up mounting a similar handful of rows at once; only which rows they are changes as the user scrolls.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 233,
  },
  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "What role does the spacer element play in a virtualized list?",
    answer:
      "It's sized to the full list's total height (totalRows × rowHeight in the fixed-height case), even though almost none of that height is filled with real rendered rows. It keeps the scrollbar's size and position behaving exactly as if every row were really mounted, while the actual visible rows are absolutely positioned inside it at their real offsets.",
    difficulty: "medium",
    companies: ["Airbnb", "Uber"],
    orderIndex: 234,
  },
  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "Why is variable-height virtualization meaningfully harder than fixed-height?",
    answer:
      "Fixed-height virtualization can compute any row's position with a single multiplication (index × rowHeight). Variable-height rows break that — a row's position depends on the cumulative height of every row before it, which needs an offset cache (and usually a measurement pass, since heights often aren't known until content renders) instead of a constant-time formula.",
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 235,
  },
  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "What real UX and accessibility tradeoffs does virtualization introduce?",
    answer:
      "Browser find-in-page and screen readers generally expect content to actually exist in the DOM — a virtualized list's off-screen rows genuinely aren't there, so Ctrl+F won't find them and some assistive technology won't announce list length correctly without extra ARIA work. Scroll-to-index and deep-linking to a specific row also need custom logic, since the browser's native anchor-scrolling has nothing to scroll to until that row is mounted.",
    difficulty: "hard",
    companies: ["Google", "Amazon"],
    orderIndex: 236,
  },
  {
    collection: "ff-75",
    conceptSlug: "list-virtualization",
    question: "How would you decide whether a given list actually needs virtualization?",
    answer:
      "By whether full rendering visibly hurts — typically somewhere in the low hundreds of rows and up, depending on row complexity. A 20-row list gains nothing from virtualization but inherits all of its added complexity (scroll-to-index, accessibility workarounds); the decision should be driven by measured jank, not a blanket rule to virtualize every list.",
    difficulty: "medium",
    companies: ["Stripe", "Shopify"],
    orderIndex: 237,
  },
  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "What's the difference between a function's self time and total time in a flame chart?",
    answer:
      "Total time is the function's duration including everything it called — its whole subtree. Self time is the function's duration excluding its children — the work it did itself, directly. A function can have huge total time and tiny self time if it's mostly a wrapper around slower children; the real bottleneck is found by self time, not total time.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 238,
  },
  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "Why might the widest bar in a flame chart not be the actual bottleneck?",
    answer:
      "A wide bar reflects total time — how long that function's entire subtree took — which is often dominated by its children's work rather than its own. Chasing the widest bar can lead straight to a high-level orchestrating function that's doing almost no real work itself, while the genuine bottleneck sits several levels deeper with a much narrower-looking bar but high self time.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 239,
  },
  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "What does the Performance panel's Bottom-Up view show that a single flame chart recording doesn't make obvious?",
    answer:
      "It aggregates self time for each function across every place it was called during the entire recording, not just within one call stack. A helper function called from a dozen different components might never be the widest bar in any single stack, yet its aggregate cost across all those calls could be the biggest single line item in the whole recording — exactly what Bottom-Up is built to surface.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 240,
  },
  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "How does the React DevTools Profiler complement the generic Performance panel?",
    answer:
      "The generic Performance panel only sees function calls — it has no concept of a 'component.' The React Profiler adds that layer back, recording commits and showing which components rendered on each one along with an estimated render duration, making it far faster to spot 'this component re-rendered on every keystroke despite unchanged props' than reconstructing the same insight from a raw flame chart.",
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 241,
  },
  {
    collection: "ff-75",
    conceptSlug: "profiling-with-devtools",
    question: "Why is profiling a real, representative interaction more valuable than profiling a guess?",
    answer:
      "Performance problems are frequently non-obvious and non-intuitive — the function a developer assumes is slow is often not the one a recording actually flags. Recording the real interaction a user reported as slow, then reading the trace for the true self-time bottleneck, replaces guesswork with evidence and avoids optimizing code that was never the problem in the first place.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 242,
  },
  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "How does streaming SSR avoid one slow section holding up the entire page response?",
    answer:
      "The server sends the page shell — layout, nav, anything with no slow dependency — immediately, with a placeholder for any section wrapped in a Suspense boundary that isn't ready yet. Each slow section streams in separately, replacing its placeholder, the moment its own data resolves — so a single slow widget no longer blocks the fast parts of the page from showing up right away.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 243,
  },
  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "Does a streamed chunk's arrival order affect where it ends up on the page? Why or why not?",
    answer:
      "No — each streamed chunk is tagged with the id of the placeholder it belongs to, which is fixed by the original shell layout. The browser slots each chunk into its already-reserved position rather than appending it wherever it happens to arrive, so a footer that resolves before the main content still renders in the footer's spot, not ahead of main content.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 244,
  },
  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "What is hydration actually doing to already-rendered server HTML?",
    answer:
      "React walks the existing, already-visible DOM tree the server produced and matches it up node-for-node against what a client-side render of the same tree would produce, attaching real event handlers and internal component state to the existing nodes — without throwing the DOM away and rebuilding it. This is why content is visible before it's interactive: paint happens first, hydration happens after.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 245,
  },
  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "What commonly causes a hydration mismatch, and why can't React just silently fix it like a normal re-render?",
    answer:
      "Common causes: rendering something dependent on Date.now()/Math.random() differently between server and client, or reading browser-only globals (window, localStorage) during the server render, which the client then renders differently. React can't silently reconcile a mismatch the way a normal re-render diffs old vs. new — it has to detect that the assumed-matching subtree actually diverged, then recover, typically by discarding and re-rendering that section client-side, which is slower and can cause a visible flash.",
    difficulty: "hard",
    companies: ["Meta", "Netflix"],
    orderIndex: 246,
  },
  {
    collection: "ff-75",
    conceptSlug: "streaming-ssr-hydration",
    question: "Why does streaming let hydration start earlier than it could with traditional SSR?",
    answer:
      "With traditional (non-streaming) SSR, the whole response has to arrive before the client has any HTML to hydrate at all. With streaming, each chunk can be hydrated as it arrives and its placeholder is replaced — the shell's fast sections can become interactive well before the slowest section has even finished loading, instead of the entire page waiting on the slowest common denominator.",
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 247,
  },
  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does performance tend to regress gradually rather than in one obvious jump?",
    answer:
      "No single change usually looks bad enough to block on its own — one more small dependency, a slightly heavier image, one extra icon library — each individually invisible. Without an enforced ceiling, there's no single moment any of these gets stopped, so the page just gets slower release over release with no clear point anyone could have caught it.",
    difficulty: "easy",
    companies: ["Google", "Shopify"],
    orderIndex: 248,
  },
  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does a budget only work as a hard CI gate rather than a dashboard someone checks periodically?",
    answer:
      "A dashboard that's merely monitored still lets regressions land — nothing actually stops a PR that crosses the line from merging, so drift continues one 'acceptable-looking' change at a time. A budget enforced in CI fails the build the same way a broken test would, which is the only mechanism that actually prevents the regression from shipping rather than just documenting it after the fact.",
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 249,
  },
  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "What's the advantage of comparing a build against its previous baseline, not just a fixed budget ceiling?",
    answer:
      "A fixed budget only fails once the absolute number crosses the line — it can miss a real, meaningful regression in a PR that started well under budget with room to spare. Comparing against the immediately previous build's baseline instead catches 'this specific PR alone grew the bundle by 15%,' which is a much more actionable, attributable signal for the PR under review, even before the fixed ceiling is actually crossed.",
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 250,
  },
  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "What typically gets budgeted, and why is bundle size the easiest to enforce mechanically?",
    answer:
      "Common targets: total JS bundle size (often per route), image payload weight, and the Core Web Vitals scores themselves. Bundle size is the easiest to gate mechanically because it's computed at build time with no real-user variability involved — unlike CWV metrics, which depend on real devices and networks and need real-user or lab measurement rather than a deterministic build-time number.",
    difficulty: "medium",
    companies: ["Vercel", "Stripe"],
    orderIndex: 251,
  },
  {
    collection: "ff-75",
    conceptSlug: "performance-budgets",
    question: "Why does a budget check need a clear next step, not just a pass/fail result?",
    answer:
      "A failing check with no obvious fix just gets bypassed under deadline pressure — someone force-merges past it because there's no clear path to actually resolving it. Pairing every budget with an obvious remediation (split this chunk, defer this dependency, revisit this image) turns a failing check into a solvable problem instead of a blocker people learn to argue their way around.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 252,
  },

  // Phase 10 (Feature 48) — System Design, 4 ff-75 top-ups per concept (each
  // concept's flagship question already lives in the ff-system-design collection
  // above, either an existing re-linked one or one of the 3 written for this feature)
  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "What's the difference between a presentational and a container component?",
    answer:
      "A **presentational** component only cares about how things look — it receives data and callbacks via props and renders UI, with no knowledge of where that data came from. A **container** component owns data-fetching, state, or business logic, and passes the results down to presentational components as props.\n\nThis split is what makes a presentational component reusable across completely different data sources — a `UserCard` that just renders `{ name, avatarUrl }` works identically whether the data came from a REST call, a GraphQL query, or a Storybook mock. Hooks blurred the strict 1990s-style split (a component can now both fetch and render), but the underlying principle — keep the reusable, generic rendering logic free of business/data concerns — still holds.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 253,
  },
  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "Why shouldn't a design system's base components (Button, Input) contain business logic?",
    answer:
      "A base component's entire value is that it's reusable in contexts its author never anticipated. The moment a `Button` reaches into a specific feature's state or API — even something as small as logging a specific analytics event — it stops being generic and becomes coupled to that one feature, and every other consumer either inherits logic it doesn't need or has to work around it.\n\nThe fix is keeping the base layer prop-driven and side-effect-free: an `onClick` prop, not a hardcoded call to a specific tracking function. Anything feature-specific belongs one layer up, in the component that composes the base primitive for that particular use case.",
    difficulty: "easy",
    companies: ["Stripe", "Shopify"],
    orderIndex: 254,
  },
  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "How do you decide whether a piece of UI is worth extracting into its own component?",
    answer:
      "Two independent signals, not one: **reuse** (is this markup/logic duplicated, or likely to be, in more than one place?) and **isolation of complexity** (is this piece of the tree independently complex enough that separating it makes the parent easier to read, even with only one caller?).\n\nExtracting purely on 'this file got long' without either signal tends to produce components that are only separated by file boundary, not by responsibility — they still reach into the same parent state and can't be tested or reused independently. A component earns its extraction when its props are a genuinely sufficient contract, not just when it's been cut out of a bigger file.",
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 255,
  },
  {
    collection: "ff-75",
    conceptSlug: "component-driven-architecture",
    question: "How does component composition help avoid prop drilling without reaching for global state?",
    answer:
      "Prop drilling happens when a value is threaded through several layers that don't use it themselves, just to reach a deeply nested consumer. Composition sidesteps this by passing the *already-rendered* consumer down as a prop or `children`, rather than passing the raw data down and re-rendering it at each layer.\n\n```jsx\n// Drilled: Layout must know about `user` just to forward it\n<Layout user={user}><Sidebar user={user} /></Layout>\n\n// Composed: Layout never touches `user` at all\n<Layout>\n  <Sidebar>{<UserBadge user={user} />}</Sidebar>\n</Layout>\n```\n\nThis isn't a universal fix — a value genuinely needed at many unrelated points in the tree is still a real case for Context or a shared store — but it eliminates the large share of 'prop drilling' that's really just intermediate components blindly forwarding something they never use.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 256,
  },

  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What are over-fetching and under-fetching, and which API style is each usually associated with?",
    answer:
      "**Over-fetching** is receiving more data than the screen actually needs (a REST `/users/1` endpoint returning 20 fields when a list view only renders 3). **Under-fetching** is the opposite — needing data from several endpoints to render one screen, forcing multiple round trips or a chain of dependent requests.\n\nREST's fixed-shape-per-endpoint design is the classic source of both, since one endpoint has to serve every consumer's needs. GraphQL was designed specifically to eliminate both by letting the client specify the exact fields and relationships it wants in a single query — at the cost of the server doing more work to resolve an arbitrary shape.",
    difficulty: "easy",
    companies: ["Meta", "GitHub"],
    orderIndex: 257,
  },
  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "Why does request deduplication matter in a data-fetching library like React Query?",
    answer:
      "Without it, two components independently requesting the same resource (say, both rendering after the same navigation) each fire their own network request for identical data — wasted bandwidth, wasted server load, and a real risk the two responses arrive out of order and momentarily show inconsistent data.\n\nA cache-aware library keys in-flight requests by their arguments: a second request for the same key while the first is still pending is handed the same in-flight promise instead of starting a new one. This is invisible to the calling components — each just calls the hook normally — but collapses what would've been N network calls into 1.",
    difficulty: "medium",
    companies: ["Airbnb", "Uber"],
    orderIndex: 258,
  },
  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What's the tradeoff of an RPC-style API (like tRPC) compared to REST?",
    answer:
      "RPC-style APIs make a network call look like calling a local function (`getUserPosts(userId)`), often with end-to-end type inference — the client gets the server's real return type with zero manually-maintained schema. This removes an entire class of client/server type-mismatch bugs.\n\nThe cost: it's tightly coupled to that specific backend's function signatures rather than a documented, stable resource contract. It works well for a first-party frontend and backend shipped by the same team, but isn't suited to a public API other, independent teams need to consume without being coupled to internal implementation details.",
    difficulty: "medium",
    companies: ["Vercel", "Linear"],
    orderIndex: 259,
  },
  {
    collection: "ff-75",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "What is stale-while-revalidate and why does it help perceived performance?",
    answer:
      "Stale-while-revalidate serves the cached (possibly outdated) response immediately, then fetches a fresh copy in the background and updates the UI once it resolves. The user sees data instantly instead of a loading spinner, and gets corrected data moments later if anything changed.\n\nIt's the default behavior in cache-aware libraries like React Query/SWR (the acronym is literally the library's name), and is also a real HTTP `Cache-Control` directive CDNs respect — both layers apply the same idea: prefer showing something now over blocking on a guaranteed-fresh response.",
    difficulty: "easy",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 260,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "What's the key architectural difference between Server-Sent Events and WebSockets?",
    answer:
      "SSE is one-directional (server-to-client only) and built entirely on plain HTTP — the client opens a long-lived connection via `EventSource`, and the server streams events down it. It reconnects automatically on drop and works through nearly any HTTP-aware proxy or load balancer with no special handling.\n\nWebSockets are full-duplex over their own protocol (upgraded from an HTTP handshake) — either side can send at any time. That flexibility costs more: your own reconnection, heartbeat, and backpressure handling, plus infrastructure that's aware WebSocket connections need to stay pinned rather than load-balanced per-request like normal HTTP.",
    difficulty: "medium",
    companies: ["Slack", "Discord"],
    orderIndex: 261,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "Why does polling waste resources even when nothing has changed?",
    answer:
      "Every poll is a full request/response cycle — DNS, TLS, server processing, a response body — even if the answer is 'nothing changed since last time.' At scale, that's a constant baseline of load proportional to (client count × poll frequency), regardless of how often data actually changes.\n\nA push-based mechanism (SSE or WebSocket) inverts this: the server only sends something when there's actually something to send, so idle periods cost nothing beyond holding an open connection — which is far cheaper than a repeated full request cycle.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 262,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "What is exponential backoff, and why does a real-time client's reconnect logic need it?",
    answer:
      "Exponential backoff increases the delay between retry attempts after each failure (e.g. 1s, 2s, 4s, 8s...), typically capped at a maximum. For a dropped WebSocket or SSE connection, this matters because a connection often drops *because* the server is struggling — every client immediately retrying at a fixed short interval is exactly the pattern that turns a brief server hiccup into a thundering-herd outage.\n\nA real implementation also caps the number of attempts (giving up and surfacing an error after enough failures) rather than retrying forever, and often adds jitter (a small random offset) so many clients' retries don't all land in the same instant.",
    difficulty: "medium",
    companies: ["Netflix", "Cloudflare"],
    orderIndex: 263,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-real-time-updates",
    question: "Can a WebSocket connection pass through a corporate proxy or load balancer without extra configuration?",
    answer:
      "Not reliably. A WebSocket starts as a normal HTTP request that gets upgraded to a persistent connection — some older or strictly-configured proxies don't support the upgrade at all, and load balancers need to be explicitly configured to keep a WebSocket connection pinned to the same backend instance for its whole lifetime, rather than load-balancing it per-request the way they do normal HTTP.\n\nThis is one reason SSE is sometimes preferred for one-directional use cases: since it's just a long-lived plain HTTP response, it needs none of that special-case infrastructure support.",
    difficulty: "hard",
    companies: ["Microsoft", "Cisco"],
    orderIndex: 264,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "Why is cursor-based pagination preferred over offset-based pagination for a live feed?",
    answer:
      "Offset pagination (`?offset=20&limit=20`) identifies a page by numeric position — if a new item gets inserted above position 20 between two requests, every subsequent page shifts by one, causing duplicated or skipped items. A cursor (an opaque token pointing at a specific item, commonly an encoded `(timestamp, id)`) identifies 'everything after this specific row,' so it stays correct regardless of what gets inserted before or after it.\n\nThe cost is that cursors don't support jumping to an arbitrary page number the way offsets do — but a feed's UI (scroll, not page numbers) never needed that capability in the first place.",
    difficulty: "medium",
    companies: ["Meta", "Twitter"],
    orderIndex: 265,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "How do you preserve a feed's scroll position when a user navigates away and back?",
    answer:
      "Two things have to both be cached: the fetched pages themselves (so returning doesn't refetch from page 1 — a cache-aware library keyed by request handles this) and the scroll offset itself, typically stored in `sessionStorage` keyed by route.\n\nThe order matters: the scroll position has to be restored *after* the cached items have re-rendered, not before — restoring a scroll offset against an empty or partially-rendered list just lands in the wrong place once the real content finishes rendering underneath it.",
    difficulty: "medium",
    companies: ["LinkedIn", "Reddit"],
    orderIndex: 266,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "What UX pattern avoids disrupting a user's reading position when new items arrive at the top of a feed?",
    answer:
      "Auto-inserting new items at the top shifts everything the user is currently reading further down the screen — a jarring, disorienting jump. The standard fix is polling for new items in the background without inserting them automatically, and instead surfacing a small 'X new posts' banner at the top.\n\nThe user only sees the new content — and the layout shift that comes with it — after an explicit tap, at a moment they're prepared for it rather than mid-read.",
    difficulty: "easy",
    companies: ["Meta", "Twitter"],
    orderIndex: 267,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-infinite-scroll-feed",
    question: "What role does IntersectionObserver play in implementing infinite scroll?",
    answer:
      "A sentinel element (an otherwise-invisible element) is placed near the bottom of the rendered list, and an `IntersectionObserver` watches when it enters the viewport. When it does, that's the trigger to fetch the next page — no manual scroll-event math (comparing `scrollTop`/`scrollHeight`/`clientHeight` on every scroll tick) required.\n\nThis is significantly cheaper than a `scroll` event listener, since the browser only needs to notify the callback on actual intersection changes rather than firing on every pixel of scroll movement, which matters a lot for scroll-performance-sensitive feeds.",
    difficulty: "medium",
    companies: ["Google", "Pinterest"],
    orderIndex: 268,
  },

  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "What problem does Operational Transformation solve that naive last-write-wins doesn't?",
    answer:
      "Last-write-wins simply lets whichever edit arrives last overwrite everything before it — for a shared document, that silently discards other users' concurrent edits rather than merging them. OT instead transforms each incoming operation's position against every operation already applied ahead of it, so two users' concurrent inserts both end up present in the final document, in a well-defined order, rather than one clobbering the other.",
    difficulty: "medium",
    companies: ["Google", "Notion"],
    orderIndex: 269,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "How do CRDTs achieve conflict-free merging without a central server?",
    answer:
      "A CRDT designs the data structure itself so that operations commute — applying the same set of edits in any order produces the same final result. For text, this typically means giving every character a unique, globally-ordered identifier rather than a plain array index, so inserting 'between' two characters is well-defined regardless of what else got inserted concurrently elsewhere.\n\nBecause the merge rule is baked into the structure rather than enforced by a server ordering operations, any two replicas (even offline, peer-to-peer copies) can exchange their edits directly and converge to the same state with no arbiter required.",
    difficulty: "hard",
    companies: ["Figma", "Linear"],
    orderIndex: 270,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "Why aren't cursor positions and user presence stored in the same persisted log as document edits?",
    answer:
      "Cursor position and presence (who's online, where their selection is) are ephemeral — useful only while a user is actively connected, and meaningless once they leave. Persisting them in the same op log or snapshot as real document content would bloat storage with data that's never meant to be replayed or restored on reload.\n\nThey're broadcast live (typically over the same WebSocket connection) but kept entirely separate from the durable edit history, which only needs to reconstruct the document's actual content.",
    difficulty: "medium",
    companies: ["Figma", "Google"],
    orderIndex: 271,
  },
  {
    collection: "ff-75",
    conceptSlug: "designing-realtime-collaborative-editor",
    question: "What tradeoff do CRDTs make compared to OT in terms of overhead?",
    answer:
      "CRDTs avoid needing a central ordering server, but typically carry more per-character metadata (a unique id, sometimes tombstones for deleted characters that can't simply be removed without breaking convergence) than an OT-based document needs, since OT relies on a server enforcing a single authoritative order instead of encoding that guarantee into every character.\n\nIn practice this shows up as larger documents in memory/storage for a CRDT-backed editor, traded against not needing (and not being bottlenecked by) a single ordering server.",
    difficulty: "hard",
    companies: ["Figma", "Notion"],
    orderIndex: 272,
  },

  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What's the difference between a monorepo and a micro-frontend architecture?",
    answer:
      "A monorepo is a code-organization choice — many packages in one repository with shared tooling and dependency versions. It says nothing about how the app is deployed; a monorepo can still ship one single monolithic app.\n\nMicro-frontends are a runtime-deployment choice — the running application itself is split into separately built and deployed pieces, composed together in the browser. They're frequently adopted together, but a monorepo doesn't require micro-frontends, and micro-frontends can be built from entirely separate repositories.",
    difficulty: "medium",
    companies: ["Spotify", "IKEA"],
    orderIndex: 273,
  },
  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What is Module Federation, and what problem does it solve for micro-frontends?",
    answer:
      "Module Federation (a webpack/Rspack feature) lets one independently-built and independently-deployed application load code — a component, a whole page — from another application at runtime, without either being compiled together at build time. It's what makes 'separately deployed pieces composed into one experience' actually work in the browser, rather than requiring a full page reload or an iframe boundary between them.\n\nIt solves the practical composition problem micro-frontends need: how does the checkout team's independently-deployed bundle actually end up rendering inside the shell app the user loaded, sharing the same page without a hard iframe boundary.",
    difficulty: "hard",
    companies: ["Zalando", "American Express"],
    orderIndex: 274,
  },
  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "What's the biggest operational cost micro-frontends introduce that a monolith doesn't have?",
    answer:
      "Shared dependency drift. Once teams deploy independently, nothing forces every micro-frontend to agree on a shared library's version — one team upgrading React while another hasn't can mean two different React instances loaded on the same page at once, a common real-world source of subtle bugs (broken hooks, duplicated context) that a monolith's single build simply can't have, since it only ever has one version of anything installed.",
    difficulty: "medium",
    companies: ["Microsoft", "Zalando"],
    orderIndex: 275,
  },
  {
    collection: "ff-75",
    conceptSlug: "frontend-architecture-patterns",
    question: "When is splitting an application into micro-frontends premature?",
    answer:
      "When no team is actually blocked by another team's release schedule. If the real pain is inconsistent tooling or dependency versions across teams sharing one product, a monorepo solves that without runtime-composition complexity. Micro-frontends earn their cost specifically when independent deploy schedules are the bottleneck — reaching for them just because a codebase feels large trades a solvable code-organization problem for a genuinely harder distributed-systems one (dependency drift, cross-team design consistency, runtime composition).",
    difficulty: "medium",
    companies: ["Spotify", "Amazon"],
    orderIndex: 276,
  },

  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "Why shouldn't server data (like an API response) be stored directly in Redux or Zustand?",
    answer:
      "A generic global store has no built-in concept of staleness — it just holds whatever was put there. Server data, by definition, can change on the backend without the client doing anything, so storing it in a plain store either goes silently stale forever, or the team ends up hand-rolling refetch-on-mount/refetch-on-focus logic that a dedicated server-state library (React Query, SWR, Apollo) already solves correctly, once, with cache invalidation and background revalidation built in.",
    difficulty: "medium",
    companies: ["Airbnb", "Google"],
    orderIndex: 277,
  },
  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What's the difference between UI state and global app state?",
    answer:
      "UI state is ephemeral and local to a specific interaction — a dropdown being open, an unsubmitted form field's current value. It doesn't need to survive a refresh or be visible anywhere outside the component (or its nearest shared ancestor) that owns it.\n\nGlobal app state is genuinely shared across the whole session but small — the logged-in user, the active theme, feature flags. The defining trait isn't 'used in a few places'; it's 'there's exactly one source of truth for the entire app,' unlike UI state (many independent, unrelated instances) or server state (many independent remote resources).",
    difficulty: "easy",
    companies: ["Meta", "Netflix"],
    orderIndex: 278,
  },
  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What problems come from putting every piece of state into one global store?",
    answer:
      "Two, both from treating fundamentally different kinds of state the same way: server data goes stale silently (no built-in revalidation), and hoisting local UI state (a single dropdown's open/closed flag) into the shared store causes unrelated components to re-render whenever unrelated global state changes, since a plain store typically notifies all subscribers on any update rather than only the ones reading the specific slice that changed.",
    difficulty: "medium",
    companies: ["Amazon", "Uber"],
    orderIndex: 279,
  },
  {
    collection: "ff-75",
    conceptSlug: "state-management-at-scale",
    question: "What does 'colocate state as close to where it's used as possible' mean in practice?",
    answer:
      "State should live in the lowest component in the tree that both needs it and is a common ancestor of everything that needs it — not hoisted further up (or all the way into a global store) by default. A form field's value only read by that one input stays in that input's own `useState`; it only moves up once a sibling genuinely needs to read or react to it too.\n\nThe payoff is fewer unrelated re-renders (a state change only affects the subtree that actually owns it) and a codebase where finding 'what can change this value' means reading one component, not searching the entire app for every dispatch to a shared store.",
    difficulty: "medium",
    companies: ["Meta", "Vercel"],
    orderIndex: 280,
  },
];

// ── Project briefs (Build tab, Feature 26) ─────────────────────────────────────
// One per concept that has full Simulate/Challenge/Interview content — matching
// the breadth precedent set by CHALLENGES/INTERVIEW_QUESTIONS. react-rendering's
// Kanban Board is the free flagship (ties back to the homepage's
// ProjectEditorMiniVisual, which already shows a KanbanBoard.tsx mockup); the
// other 3 are premium. No solution_code/hints in the schema — build-plan.md's
// Build tab UI has no Solution or Hints panel, only description/editor/tests/
// Mark Build Complete.

const PROJECT_BRIEFS: ProjectBriefSeed[] = [
  {
    slug: "kanban-board",
    conceptSlug: "react-rendering",
    title: "Build a Kanban Board",
    description: `Build the reordering engine behind a **Kanban board** — drag a card between columns and it has to land in exactly the right spot, without ever mutating state directly.

## The problem

A Kanban board's core interaction is deceptively fiddly: drag a card from "In Progress" to "Done," or reorder cards within the same column, and the board's state has to update immutably — React re-renders correctly only when it gets a **new** object, not a mutated one.

## The idea

Every drag-and-drop library (\`@dnd-kit\`, \`react-beautiful-dnd\`) eventually calls something like this underneath: given the current columns, where a card came from, where it's going, and what index it should land at — compute the **next** state.

## Your task

Write \`moveCard(columns, fromColumn, toColumn, cardId, toIndex)\` that returns a **new** \`columns\` object with \`cardId\` removed from \`fromColumn\` and inserted into \`toColumn\` at \`toIndex\`:

- never mutate the input \`columns\` object or its arrays
- moving within the same column (\`fromColumn === toColumn\`) reorders it
- clamp \`toIndex\` to \`[0, destination.length]\` so an out-of-range drop still lands somewhere sane

\`\`\`js
moveCard({ todo: ['a', 'b'], doing: [] }, 'todo', 'doing', 'a', 0)
// { todo: ['b'], doing: ['a'] }
\`\`\`

> **Why immutability matters here:** React's reconciliation compares by reference. If \`moveCard\` mutated the original \`columns\` object instead of returning a new one, every column would look "unchanged" to React and the board would silently fail to re-render.

Wire this into a real board with 3 columns and drag-and-drop once it passes — that's the project.`,
    starterCode: `function moveCard(columns, fromColumn, toColumn, cardId, toIndex) {
  // return a NEW columns object — don't mutate \`columns\` or its arrays
}`,
    solutionCode: `function moveCard(columns, fromColumn, toColumn, cardId, toIndex) {
  const source = columns[fromColumn].filter((id) => id !== cardId);
  const destinationBase = fromColumn === toColumn ? source : columns[toColumn];
  const clampedIndex = Math.max(0, Math.min(toIndex, destinationBase.length));
  const destination = [
    ...destinationBase.slice(0, clampedIndex),
    cardId,
    ...destinationBase.slice(clampedIndex),
  ];
  if (fromColumn === toColumn) {
    return { ...columns, [fromColumn]: destination };
  }
  return { ...columns, [fromColumn]: source, [toColumn]: destination };
}`,
    testCases: [
      {
        input: "moveCard({ todo: ['a','b'], doing: [] }, 'todo', 'doing', 'a', 0)",
        expected: "{ todo: ['b'], doing: ['a'] }",
        label: "Moves a card to a different column",
      },
      {
        input: "moveCard({ todo: ['a','b','c'] }, 'todo', 'todo', 'c', 0)",
        expected: "{ todo: ['c','a','b'] }",
        label: "Reorders within the same column",
      },
      {
        input: "the original columns object, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input",
      },
      {
        input: "toIndex: 99 on a 2-card destination column",
        expected: "clamped to the end",
        label: "Clamps an out-of-range index to the end",
      },
    ],
    isPremium: false,
    orderIndex: 1,
  },
  {
    slug: "async-task-runner",
    conceptSlug: "event-loop",
    title: "Build an Async Task Runner",
    description: `Build a small **concurrency-limited task runner** — the pattern behind every "upload these 200 files, but only 4 at a time" feature.

## The problem

Fire off 200 \`fetch()\` calls at once and you'll flood the network (and often hit the browser's own per-host connection limit). Run them one at a time with a \`for\` loop and \`await\` and you'll be waiting far longer than necessary. Real apps need something in between.

## The idea

A concurrency-limited runner keeps exactly \`limit\` tasks in flight at any moment. The moment one finishes, the next queued task starts — no more, no less. This leans directly on how the event loop schedules microtasks: each "worker" is really just a loop that keeps \`await\`-ing the next task from a shared queue.

## Your task

Write \`async runWithConcurrency(tasks, limit)\` where \`tasks\` is an array of functions, each returning a Promise:

- run at most \`limit\` tasks at the same time
- return an array of results in the **same order as \`tasks\`** — not the order they finished in
- resolve only once every task has settled

\`\`\`js
const tasks = [() => fetch('/a'), () => fetch('/b'), () => fetch('/c')];
await runWithConcurrency(tasks, 2); // only 2 requests in flight at once
\`\`\`

> **Why order matters:** two tasks started at the same time can resolve in either order depending on network timing. The caller shouldn't have to guess — \`runWithConcurrency\` must always hand back results indexed the same way \`tasks\` was.

Once this passes, use it to build a small "upload queue" UI showing live progress per file.`,
    starterCode: `async function runWithConcurrency(tasks, limit) {
  // run at most \`limit\` tasks concurrently; return results in the same
  // order as \`tasks\`, once every task has settled
}`,
    solutionCode: `async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const current = nextIndex++;
      results[current] = await tasks[current]();
    }
  }

  const workerCount = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}`,
    testCases: [
      {
        input: "3 tasks with different delays, limit 3",
        expected: "results in original order",
        label: "Returns results in original order",
      },
      {
        input: "6 tasks, limit 2",
        expected: "never more than 2 running at once",
        label: "Never runs more than `limit` tasks concurrently",
      },
      {
        input: "5 tasks, limit 2",
        expected: "all 5 tasks eventually run",
        label: "Runs all tasks, not just the first `limit`",
      },
      {
        input: "one task with a much longer delay",
        expected: "awaited before the runner resolves",
        label: "Resolves once every task settles",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "render-blocking-analyzer",
    conceptSlug: "browser-rendering-pipeline",
    title: "Build a Render-Blocking Resource Analyzer",
    description: `Build the logic behind a Lighthouse-style audit: given a page's resources, which ones are actually **blocking the first paint**?

## The problem

Every stylesheet and script a page loads can silently delay the first pixel on screen. Knowing *which* resources are the real offenders — rather than "just add \`defer\` to everything and hope" — is the first step to fixing a slow page.

## The idea

Two resource types can block rendering, each with its own escape hatch:

- **Stylesheets** block by default — unless a \`media\` attribute (like \`print\`) means the current context doesn't need them right away
- **Scripts** block by default — unless they carry \`async\` or \`defer\`, which let HTML parsing continue without waiting for them

## Your task

Write \`getRenderBlockingResources(resources)\` — given an array of \`{ type: 'script' | 'style', src, async?, defer?, media? }\` objects, return only the ones that actually block the initial render:

- a \`style\` resource blocks unless \`media\` is set and isn't \`'screen'\`/\`'all'\`
- a \`script\` resource blocks unless \`async\` or \`defer\` is \`true\`

\`\`\`js
getRenderBlockingResources([
  { type: 'style', src: 'print.css', media: 'print' },
  { type: 'script', src: 'analytics.js', async: true },
  { type: 'script', src: 'app.js' },
])
// → [{ type: 'script', src: 'app.js' }]
\`\`\`

> **Why this matters in real audits:** this exact classification is what tools like Lighthouse use to flag "eliminate render-blocking resources" — the fix is almost always adding \`defer\`/\`async\`, or scoping a stylesheet's \`media\` so it isn't render-blocking for the common case.

Once this passes, feed it a real page's resource list (from the Network tab) and render the blocking ones as a warning list.`,
    starterCode: `function getRenderBlockingResources(resources) {
  // return only the resources that block the initial render
}`,
    solutionCode: `function getRenderBlockingResources(resources) {
  return resources.filter((resource) => {
    if (resource.type === "style") {
      const nonBlockingMedia = resource.media && resource.media !== "screen" && resource.media !== "all";
      return !nonBlockingMedia;
    }
    if (resource.type === "script") {
      return !resource.async && !resource.defer;
    }
    return false;
  });
}`,
    testCases: [
      {
        input: "a plain style resource with no media",
        expected: "blocks rendering",
        label: "A plain stylesheet blocks rendering",
      },
      {
        input: "media: 'print'",
        expected: "does not block rendering",
        label: "A print-only stylesheet does not block rendering",
      },
      {
        input: "a script with no async/defer",
        expected: "blocks rendering",
        label: "A synchronous script blocks rendering",
      },
      {
        input: "async: true or defer: true",
        expected: "does not block rendering",
        label: "async/defer scripts do not block rendering",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "specificity-conflict-finder",
    conceptSlug: "css-specificity",
    title: "Build a Specificity Conflict Finder",
    description: `Build a small linter that catches CSS's most common silent bug: a rule that can **never win**, no matter where you put it in the file.

## The problem

You add a rule, refresh the page, and nothing changes. Nine times out of ten, an earlier (or later, tie-broken) rule with equal-or-higher specificity is already winning that property — and nothing tells you that except trial and error in DevTools.

## The idea

Walk a stylesheet's rules in source order, tracking the current specificity "winner" for each CSS property. A rule is dead on arrival if an existing winner for that property already beats — or ties — it (ties go to the later rule in the real cascade, so a tie replaces the winner rather than losing to it).

## Your task

Write \`specificity(selector)\` (same \`[id, class, element]\` scoring as the CSS Specificity concept) and \`findOverriddenRules(rules)\` — given \`rules: { selector, property }[]\` in source order, return the **indices** of rules that can never apply:

\`\`\`js
findOverriddenRules([
  { selector: '.btn', property: 'color' },
  { selector: '#cta', property: 'color' },
])
// → [0] — the #cta rule always beats .btn for color
\`\`\`

- only rules targeting the **same property** compete with each other
- on a specificity tie, the later rule wins (matches the real cascade) — so the *earlier* one becomes overridden

> **Why this is worth building:** this is a real, shippable idea — a "specificity linter" that flags dead CSS rules before they ship, instead of after someone spends twenty minutes in DevTools wondering why a color won't change.

Once this passes, feed it a real stylesheet's parsed rules and render the dead ones as warnings.`,
    starterCode: `function specificity(selector) {
  // returns [idCount, classCount, elementCount]
}

function findOverriddenRules(rules) {
  // return the indices of rules that can never apply — an earlier-or-tied
  // higher-specificity rule for the same property already wins
}`,
    solutionCode: `function specificity(selector) {
  let id = 0, cls = 0, el = 0;
  const s = selector.replace(/\\[[^\\]]*\\]/g, () => { cls++; return ''; });
  for (const part of s.split(/[ >+~]/)) {
    id  += (part.match(/#[a-zA-Z]/g) || []).length;
    cls += (part.match(/\\.[a-zA-Z]|:[^:]/g) || []).length;
    el  += (part.match(/^[a-zA-Z]|::[a-zA-Z]/g) || []).length;
  }
  return [id, cls, el];
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function findOverriddenRules(rules) {
  const winnerByProperty = {};
  const overridden = [];

  rules.forEach((rule, index) => {
    const score = specificity(rule.selector);
    const current = winnerByProperty[rule.property];
    // A tie goes to the later rule (matches the real cascade), so >= 0 means
    // this rule becomes the new winner and the previous one is overridden.
    if (!current || compareSpecificity(score, current.score) >= 0) {
      if (current) overridden.push(current.index);
      winnerByProperty[rule.property] = { index, score };
    } else {
      overridden.push(index);
    }
  });

  return overridden.sort((a, b) => a - b);
}`,
    testCases: [
      {
        input: "['.btn', '#cta'] both set color",
        expected: "[0] — #cta overrides .btn",
        label: "A later rule with higher specificity overrides an earlier one",
      },
      {
        input: "['#cta', '.btn'] both set color",
        expected: "[1] — .btn can never win",
        label: "An earlier rule with higher specificity is not overridden by a later weaker one",
      },
      {
        input: "['.btn', '.primary'] both set color, equal specificity",
        expected: "[0] — the later rule wins the tie",
        label: "Equal specificity — the later rule wins (source order tiebreak)",
      },
      {
        input: "'.btn' sets color, '.btn' sets background",
        expected: "[] — different properties never conflict",
        label: "Different properties never conflict",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "lazy-config-loader",
    conceptSlug: "hoisting-temporal-dead-zone",
    title: "Build a Lazy Config Loader",
    description: `Build a config accessor that fails loudly if a value is read before it's actually set — turning \`var\`'s silent \`undefined\` bug into an error you'd actually notice.

## The problem

A hoisted \`var\` that's read before its assignment line quietly returns \`undefined\` instead of failing where the real mistake is — the bug surfaces somewhere else entirely, far from its cause. Application config often has this exact shape: a value gets read before whatever sets it up has actually run.

## The idea

Instead of a plain object (which returns \`undefined\` for any missing key, hiding the same class of bug \`var\` does), build a config store that explicitly distinguishes "not set yet" from "set to undefined" — and throws a clear error for the former.

## Your task

Write \`createLazyConfig()\` returning \`{ set(key, value), get(key) }\`:

- \`get(key)\` on a key that hasn't been \`set()\` yet throws a descriptive \`Error\`
- \`set(key, value)\` then \`get(key)\` returns the value that was set
- keys are independent — reading one unset key throws even if a different key has already been set

\`\`\`js
const config = createLazyConfig();
config.get("apiUrl"); // throws — never set
config.set("apiUrl", "https://api.example.com");
config.get("apiUrl"); // "https://api.example.com"
\`\`\`

> **Why this is worth building deliberately:** it's the opposite failure mode of \`var\`'s hoisting — instead of a config bug silently returning \`undefined\` and failing downstream, this store fails immediately and specifically, right where the real mistake is.

Once this passes, wire it into a small settings panel where each field reads its default through \`get()\` before a "Load Config" button calls \`set()\` for each key.`,
    starterCode: `function createLazyConfig() {
  // return { set(key, value), get(key) }
  // get(key) on a key that hasn't been set() yet must throw, not return undefined
}`,
    solutionCode: `function createLazyConfig() {
  const store = new Map();
  return {
    set(key, value) {
      store.set(key, value);
    },
    get(key) {
      if (!store.has(key)) {
        throw new Error('Config key "' + key + '" was read before it was set.');
      }
      return store.get(key);
    },
  };
}`,
    testCases: [
      { input: "get('apiUrl') before any set() call", expected: "throws an Error", label: "Reading an unset key throws" },
      { input: "set('apiUrl', '...') then get('apiUrl')", expected: "returns the set value", label: "Reading a set key returns its value" },
      {
        input: "one key set, a different key read",
        expected: "the unset key still throws",
        label: "Keys are tracked independently",
      },
    ],
    isPremium: false,
    orderIndex: 2,
  },
  {
    slug: "strict-query-param-parser",
    conceptSlug: "equality-type-coercion",
    title: "Build a Strict Query Param Parser",
    description: `Build a query-string-to-object parser that converts values to their real types explicitly — without leaning on any of \`==\`'s implicit coercion.

## The problem

URL query params arrive as strings — \`?page=2&active=false\` — but application code usually wants a real number and a real boolean, not the literal strings \`"2"\` and \`"false"\` (which, notably, is a *truthy* string despite reading like it should be falsy — a classic coercion trap).

## The idea

Explicit, deliberate type conversion beats implicit coercion every time. Check each string's shape directly — does it look like a number? Is it exactly \`"true"\` or \`"false"\`? — and convert accordingly, rather than trusting truthiness or \`==\` to sort it out.

## Your task

Write \`parseParams(params)\` — given a flat object of string values, return a new object where:

- a string that parses fully as a number becomes a \`number\`
- the exact strings \`"true"\`/\`"false"\` become the boolean \`true\`/\`false\`
- anything else stays a string, unchanged

\`\`\`js
parseParams({ page: "2", active: "false", name: "Ada" });
// { page: 2, active: false, name: "Ada" }
\`\`\`

> **The trap this avoids:** \`Boolean("false")\` is \`true\` — a non-empty string is always truthy, regardless of what it says. Converting the string \`"false"\` to a real boolean requires an explicit string comparison, not a truthiness check.

Once this passes, wire it into a page that reads \`window.location.search\` and renders the parsed, correctly-typed params.`,
    starterCode: `function parseParams(params) {
  // return a new object with numeric strings converted to numbers,
  // "true"/"false" converted to real booleans, everything else left as a string
}`,
    solutionCode: `function parseParams(params) {
  const result = {};
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === "true" || value === "false") {
      result[key] = value === "true";
    } else if (value.trim() !== "" && !Number.isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}`,
    testCases: [
      { input: "parseParams({ page: '2' })", expected: "{ page: 2 }", label: "Numeric strings convert to numbers" },
      {
        input: "parseParams({ active: 'false' })",
        expected: "{ active: false }",
        label: "'false' converts to the real boolean false, not a truthy string",
      },
      {
        input: "parseParams({ name: 'Ada' })",
        expected: "{ name: 'Ada' }",
        label: "Non-numeric, non-boolean strings stay strings",
      },
    ],
    isPremium: false,
    orderIndex: 3,
  },
  {
    slug: "undo-redo-history",
    conceptSlug: "closures",
    title: "Build an Undo/Redo History Stack",
    description: `Build the state-tracking engine behind every editor's Undo/Redo buttons — using a closure to keep the history private instead of scattering it across component state.

## The problem

Undo/Redo needs to remember every previous state (to go back) and every undone state (to go forward again, until a new change discards that "future"). Managing this correctly — especially clearing the redo stack the moment a *new* change happens after an undo — is easy to get subtly wrong.

## The idea

A closure over two private stacks — past and future — is a clean fit: nothing outside the returned object can reach into those stacks directly, so accidental external mutation of history isn't possible, and each returned method has clear access to exactly the shared state it needs.

## Your task

Write \`createHistory(initialState)\` returning \`{ set(newState), undo(), redo(), current() }\`:

- \`set(newState)\` records the current state into the past stack and makes \`newState\` current, **clearing any redo history**
- \`undo()\` moves the current state into the future stack and restores the most recent past state (no-op if there's no past)
- \`redo()\` moves the current state back into the past stack and restores the most recent future state (no-op if there's no future)
- \`current()\` returns whatever state is active right now

\`\`\`js
const h = createHistory(0);
h.set(1); h.set(2);
h.undo(); h.current(); // 1
h.undo(); h.current(); // 0
h.redo(); h.current(); // 1
h.set(5); // discards the "2" redo entry entirely
h.redo(); h.current(); // still 5 — nothing left to redo
\`\`\`

> **Why \`set\` has to clear the future stack:** once you make a genuinely new change after undoing, the old "future" (the states you'd undone away from) is no longer a valid path forward — keeping it around would let redo jump to a state that doesn't follow from what's now current.

Once this passes, wire it into a tiny text editor with visible Undo/Redo buttons that disable themselves when there's nothing left to undo/redo.`,
    starterCode: `function createHistory(initialState) {
  // return { set(newState), undo(), redo(), current() }
  // set() must clear any redo (future) history
}`,
    solutionCode: `function createHistory(initialState) {
  let current = initialState;
  const past = [];
  const future = [];

  return {
    set(newState) {
      past.push(current);
      current = newState;
      future.length = 0;
    },
    undo() {
      if (past.length === 0) return;
      future.push(current);
      current = past.pop();
    },
    redo() {
      if (future.length === 0) return;
      past.push(current);
      current = future.pop();
    },
    current() {
      return current;
    },
  };
}`,
    testCases: [
      { input: "set(1), set(2), then undo() twice", expected: "current() is the initial state", label: "Undo walks back through history in order" },
      { input: "undo() then redo()", expected: "current() returns to the undone state", label: "Redo restores what undo just removed" },
      {
        input: "undo(), then set(a new value)",
        expected: "redo() is now a no-op",
        label: "A new set() after undo clears the redo stack",
      },
    ],
    isPremium: false,
    orderIndex: 4,
  },
  {
    slug: "middleware-pipeline",
    conceptSlug: "callbacks-higher-order-functions",
    title: "Build a Middleware Pipeline",
    description: `Build the same "chain of small functions" engine behind Express middleware and Redux middleware — a callback-driven pipeline where each step can act, then hand off to the next.

## The problem

Real request/action handling is rarely one big function — logging, auth checks, validation, and the actual handler are usually separate concerns that all need to run, in order, on the same input, with any one of them able to short-circuit the rest.

## The idea

Each middleware is a callback of the shape \`(input, next) => void\` — it does its work, then calls \`next()\` to continue to the following middleware, or doesn't call it at all to stop the chain there. The pipeline itself doesn't know what any middleware does; it just wires each one's \`next\` to the following middleware.

## Your task

Write \`createPipeline()\` returning \`{ use(fn), run(input) }\`:

- \`use(fn)\` registers a middleware, in the order added
- \`run(input)\` invokes the first middleware with \`(input, next)\`, where calling \`next()\` invokes the next registered middleware the same way
- if a middleware never calls \`next()\`, the chain stops there — later middleware never runs

\`\`\`js
const pipeline = createPipeline();
pipeline.use((input, next) => { console.log("logging:", input); next(); });
pipeline.use((input, next) => { if (!input.authed) return; next(); });
pipeline.use((input) => console.log("handled:", input));
pipeline.run({ authed: true }); // logs "logging:" then "handled:"
pipeline.run({ authed: false }); // logs only "logging:" — chain stops at the auth check
\`\`\`

> **This is the exact same shape as Express's \`app.use((req, res, next) => ...)\`** — a middleware pipeline is nothing more than callbacks and higher-order functions applied to one specific domain (requests), generalized here to any input.

Once this passes, add a real logging + validation + handler chain and confirm a failed validation step correctly stops the handler from running.`,
    starterCode: `function createPipeline() {
  // return { use(fn), run(input) }
  // run() should invoke middleware in order, each one deciding whether to call next()
}`,
    solutionCode: `function createPipeline() {
  const middlewares = [];
  return {
    use(fn) {
      middlewares.push(fn);
    },
    run(input) {
      let index = 0;
      function next() {
        const middleware = middlewares[index++];
        if (middleware) middleware(input, next);
      }
      next();
    },
  };
}`,
    testCases: [
      { input: "3 middlewares, each calling next()", expected: "all 3 run in registration order", label: "Runs every middleware in order when each calls next" },
      {
        input: "a middleware that never calls next()",
        expected: "later middlewares never run",
        label: "Not calling next() stops the chain",
      },
      {
        input: "run() called twice on the same pipeline",
        expected: "each run executes the full chain independently",
        label: "Each run() call is independent",
      },
    ],
    isPremium: false,
    orderIndex: 5,
  },
  {
    slug: "shopping-cart-reducer",
    conceptSlug: "array-object-methods-immutability",
    title: "Build a Shopping Cart Reducer",
    description: `Build the reducer behind a shopping cart — the pattern used everywhere state updates need to be predictable and undo-able: add, remove, and update quantity, all without ever mutating the previous state.

## The problem

A cart has three basic operations — add an item, remove one, change a quantity — and every one of them has to produce a **new** cart state, never mutate the old one directly. Get this wrong and anything comparing old vs. new state (undo history, a UI framework's re-render check) breaks silently.

## The idea

A reducer is just a function: given the current state and an action describing what happened, return the next state. Each action type needs its own immutable-update logic — array methods that return new arrays (\`map\`, \`filter\`, spread) do all the real work here.

## Your task

Write \`cartReducer(state, action)\` where \`state\` is \`{ items: { id, qty }[] }\` and \`action\` is one of:

- \`{ type: 'ADD_ITEM', id }\` — adds a new item with \`qty: 1\`, or increments \`qty\` if \`id\` already exists
- \`{ type: 'REMOVE_ITEM', id }\` — removes the item entirely
- \`{ type: 'UPDATE_QTY', id, qty }\` — sets that item's quantity directly

Every branch must return a **new** \`state\` object, never mutate the input.

\`\`\`js
cartReducer({ items: [] }, { type: "ADD_ITEM", id: "sku-1" });
// { items: [{ id: "sku-1", qty: 1 }] }
\`\`\`

> **Why this shape scales:** this is exactly the reducer pattern Redux (and \`useReducer\`) are built around — one pure function, one action at a time, always returning new state — which is what makes time-travel debugging and undo history possible for free.

Once this passes, wire it to a small cart UI with add/remove/quantity controls and confirm the displayed total updates correctly after each action.`,
    starterCode: `function cartReducer(state, action) {
  // handle ADD_ITEM, REMOVE_ITEM, UPDATE_QTY — always return a new state object
}`,
    solutionCode: `function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.id === action.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }
      return { items: [...state.items, { id: action.id, qty: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.id) };
    case "UPDATE_QTY":
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, qty: action.qty } : item
        ),
      };
    default:
      return state;
  }
}`,
    testCases: [
      { input: "ADD_ITEM for a new sku", expected: "adds it with qty: 1", label: "Adding a new item" },
      { input: "ADD_ITEM for an sku already in the cart", expected: "increments its qty instead of duplicating", label: "Adding an existing item increments quantity" },
      { input: "REMOVE_ITEM for an sku", expected: "the item is gone from items", label: "Removing an item" },
      {
        input: "the original state object, checked after any action",
        expected: "unchanged",
        label: "Never mutates the input state",
      },
    ],
    isPremium: false,
    orderIndex: 6,
  },
  {
    slug: "auto-bound-event-emitter",
    conceptSlug: "this-binding-execution-context",
    title: "Build an Auto-Bound Event Emitter",
    description: `Build a small event emitter — the pattern behind most pub/sub and custom-event systems — that guarantees a handler's \`this\` is always correct, no matter how the event later fires.

## The problem

Event handlers are exactly the kind of function that gets detached from its original object and called back later, elsewhere — the classic setup for a lost \`this\`. Registering a class method directly (\`emitter.on('login', instance.handleLogin)\`) hands the emitter a bare function reference — by the time \`emit\` calls it, there's no object to the left of a dot anymore, so \`this\` inside \`handleLogin\` isn't \`instance\`.

## The idea

Rather than relying on every *caller* to remember \`.bind(this)\` before registering a method, the emitter itself can guarantee correct \`this\`: accept an optional \`context\` alongside each handler, and always invoke that handler with \`.call(context, payload)\` — never as a bare call — regardless of how \`.emit()\` itself gets called.

## Your task

Write \`createEmitter()\` returning \`{ on(event, handler, context), emit(event, payload) }\`:

- \`on(event, handler, context)\` registers \`handler\` for that event name, remembering \`context\` alongside it (\`context\` is optional)
- \`emit(event, payload)\` calls every handler registered for that event with \`payload\`, invoking each one with \`this\` set to whatever \`context\` was passed at registration time
- multiple handlers can be registered for the same event, each with its own independent \`context\`, and all of them run on \`emit\`

\`\`\`js
class Dashboard {
  constructor(name) { this.name = name; }
  handleLogin(user) { console.log(this.name, "saw", user.name, "log in"); }
}

const emitter = createEmitter();
const dash = new Dashboard("Admin Panel");
emitter.on("login", dash.handleLogin, dash); // bare method reference — no manual .bind() needed
emitter.emit("login", { name: "Ada" }); // logs "Admin Panel saw Ada log in"
\`\`\`

> **Why this actually solves the problem, not just avoids it:** \`dash.handleLogin\` is passed as a bare reference above — exactly the detachment that normally loses \`this\`. It works here because the emitter, not the caller, is responsible for calling it correctly every time, via \`handler.call(context, payload)\` internally.

Once this passes, register two different class instances' methods on the same event and confirm each one's \`this\` still refers to its own instance, not the other's, when both fire from a single \`emit\`.`,
    starterCode: `function createEmitter() {
  // return { on(event, handler, context), emit(event, payload) }
  // emit() must invoke each handler with this set to its own registered context
}`,
    solutionCode: `function createEmitter() {
  const handlers = {};
  return {
    on(event, handler, context) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push({ handler, context });
    },
    emit(event, payload) {
      (handlers[event] || []).forEach(({ handler, context }) => handler.call(context, payload));
    },
  };
}`,
    testCases: [
      {
        input: "on('login', instance.handleLogin, instance), then emit('login', payload)",
        expected: "this inside handleLogin refers to instance",
        label: "A bare method reference still gets the right this, with no manual .bind() by the caller",
      },
      {
        input: "two instances' methods registered on the same event, each with its own context",
        expected: "each handler's this refers to its own instance, not the other's",
        label: "Independent context per handler, even for the same event",
      },
      {
        input: "on('login', handler) with no context passed",
        expected: "handler still runs, this is undefined inside it",
        label: "context is optional — omitting it behaves like a plain function call",
      },
      {
        input: "emit() for an event with no registered handlers",
        expected: "does nothing, does not throw",
        label: "Emitting an unregistered event is a safe no-op",
      },
    ],
    isPremium: true,
    orderIndex: 7,
  },
  {
    slug: "shape-hierarchy-without-class",
    conceptSlug: "prototypal-inheritance",
    title: "Build a Shape Hierarchy Without class",
    description: `Build a small hierarchy of shapes — the "hello world" of inheritance — using the raw prototype mechanism directly, with no \`class\`/\`extends\` sugar anywhere.

## The problem

\`class\` and \`extends\` make inheritance easy to write, but easy to write without ever understanding what's actually happening underneath — the linked \`[[Prototype]]\` chain that makes shared methods and \`instanceof\` work at all.

## The idea

Build \`Shape\`, then \`Circle\` and \`Rectangle\` that inherit from it, wiring the prototype chain by hand with \`Object.create\` — exactly what \`extends\` compiles down to — so each subclass's instances can call \`Shape\`'s shared methods while still overriding \`area()\` with their own shape-specific formula.

## Your task

Write constructor functions \`Shape(name)\`, \`Circle(radius)\`, and \`Rectangle(width, height)\`, wiring \`Circle\`/\`Rectangle\` to inherit from \`Shape\` via the prototype chain (no \`class\` keyword):

- \`Shape.prototype.describe()\` returns a string using \`this.name\` and \`this.area()\`
- \`Circle\`/\`Rectangle\` each implement their own \`area()\`, overriding nothing on \`Shape\` itself
- both \`new Circle(2) instanceof Shape\` and \`new Rectangle(2, 3) instanceof Shape\` are \`true\`

\`\`\`js
const c = new Circle(2);
c.describe(); // "circle has area 12.57"
c instanceof Shape; // true
\`\`\`

> **Why build this without \`class\` at all:** \`class\`/\`extends\` are syntax over exactly this mechanism — building it by hand once is what makes every later use of \`class\` feel like a shorthand for something you understand, not a separate feature to memorize.

Once this passes, render a few shapes on a canvas or as SVG, each computing its own area through the shared \`describe()\` method.`,
    starterCode: `function Shape(name) {
  this.name = name;
}
Shape.prototype.describe = function () {
  // return a string using this.name and this.area()
};

function Circle(radius) {
  // call Shape's constructor with the right name
  this.radius = radius;
}
// wire Circle to inherit from Shape, then implement Circle.prototype.area

function Rectangle(width, height) {
  // call Shape's constructor with the right name
  this.width = width;
  this.height = height;
}
// wire Rectangle to inherit from Shape, then implement Rectangle.prototype.area`,
    solutionCode: `function Shape(name) {
  this.name = name;
}
Shape.prototype.describe = function () {
  return this.name + " has area " + this.area().toFixed(2);
};

function Circle(radius) {
  Shape.call(this, "circle");
  this.radius = radius;
}
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;
Circle.prototype.area = function () {
  return Math.PI * this.radius * this.radius;
};

function Rectangle(width, height) {
  Shape.call(this, "rectangle");
  this.width = width;
  this.height = height;
}
Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.area = function () {
  return this.width * this.height;
};`,
    testCases: [
      { input: "new Circle(2).describe()", expected: "\"circle has area 12.57\"", label: "Circle computes its own area formula" },
      { input: "new Rectangle(2, 3).describe()", expected: "\"rectangle has area 6.00\"", label: "Rectangle computes its own area formula" },
      { input: "new Circle(2) instanceof Shape", expected: "true", label: "Both subclasses are recognized as Shape instances" },
    ],
    isPremium: true,
    orderIndex: 8,
  },
  {
    slug: "minimal-module-resolver",
    conceptSlug: "esm-vs-commonjs",
    title: "Build a Minimal Module Resolver",
    description: `Build a tiny in-memory version of CommonJS's \`require()\` — the same caching and evaluation model Node itself uses underneath, simplified down to its essentials.

## The problem

\`require()\` looks simple from the outside, but it's doing real work: running a module's code exactly once, caching its \`exports\`, and handing back that same cached object every time the same module is required again — even from many different files.

## The idea

Keep a registry of module definitions (functions that build a module's exports) and a cache of already-evaluated results. The first \`require()\` for a given id runs its definition function and caches the result; every subsequent \`require()\` for that same id returns the cached exports without re-running anything.

## Your task

Write \`createModuleSystem()\` returning \`{ define(id, factory), require(id) }\`:

- \`define(id, factory)\` registers a module, where \`factory\` is \`(require, module) => void\` and sets \`module.exports\` to whatever the module wants to expose
- \`require(id)\` runs \`id\`'s factory **the first time only**, passing it \`require\` (so modules can require each other) and a fresh \`{ exports: {} }\` object, then returns \`module.exports\`
- every later \`require(id)\` for the same id returns the **cached** exports object without re-running the factory

\`\`\`js
const mod = createModuleSystem();
mod.define("math", (require, module) => { module.exports = { double: (n) => n * 2 }; });
mod.require("math").double(5); // 10
mod.require("math") === mod.require("math"); // true — same cached object
\`\`\`

> **This is a simplified model of exactly what Node does** — real \`require()\` also resolves file paths and handles circular requires by returning a partially-built \`exports\` object, but the core "run once, cache forever" behavior is the same mechanism you just built.

Once this passes, define two modules where one requires the other, and confirm both see the same cached instance of any shared state.`,
    starterCode: `function createModuleSystem() {
  // return { define(id, factory), require(id) }
  // require(id) must run factory only once per id, caching module.exports after
}`,
    solutionCode: `function createModuleSystem() {
  const factories = {};
  const cache = {};

  function require(id) {
    if (cache[id]) return cache[id].exports;
    const module = { exports: {} };
    cache[id] = module;
    factories[id](require, module);
    return module.exports;
  }

  return {
    define(id, factory) {
      factories[id] = factory;
    },
    require,
  };
}`,
    testCases: [
      { input: "define + require a module exporting a function", expected: "the function works as defined", label: "A defined module's exports are usable" },
      {
        input: "require() the same module id twice",
        expected: "returns the exact same cached exports object both times",
        label: "A module's factory runs only once, ever",
      },
      {
        input: "module A's factory calls require('B') internally",
        expected: "B's exports are available inside A's factory",
        label: "Modules can require each other",
      },
    ],
    isPremium: true,
    orderIndex: 9,
  },
  {
    slug: "retry-with-backoff",
    conceptSlug: "promises-async-await",
    title: "Build a Retry-With-Backoff Utility",
    description: `Build the retry logic behind almost every resilient API client — retrying a failing async call with increasing delays between attempts, instead of hammering a struggling server immediately.

## The problem

A flaky network call that fails once might succeed on a second try — but retrying it instantly, over and over, can make things worse (overloading a server that's already struggling). Waiting a bit longer after each failure gives the failing dependency room to recover.

## The idea

Wrap any async function in a loop that catches a rejection, waits an increasing delay (doubling each time — "exponential backoff"), and tries again, up to a maximum number of attempts — finally rejecting for real once every attempt is exhausted.

## Your task

Write \`async retryWithBackoff(fn, { maxAttempts, baseDelay })\`:

- calls \`fn()\` (an async function) and returns its result if it succeeds
- on rejection, waits \`baseDelay * 2^attemptNumber\` ms, then retries, up to \`maxAttempts\` total attempts
- if every attempt fails, rejects with the **last** attempt's error

\`\`\`js
await retryWithBackoff(flakyFetch, { maxAttempts: 3, baseDelay: 100 });
// tries immediately, then after ~100ms, then after ~200ms, before giving up
\`\`\`

> **Why the delay grows instead of staying fixed:** a fixed short delay retries too aggressively against a genuinely struggling dependency; a growing delay backs off progressively, giving the dependency real room to recover before the next attempt.

Once this passes, wire it around a real \`fetch\` call and simulate a flaky endpoint that fails the first two times to confirm the third attempt succeeds.`,
    starterCode: `async function retryWithBackoff(fn, { maxAttempts, baseDelay }) {
  // call fn(); on rejection, wait baseDelay * 2^attemptNumber ms and retry,
  // up to maxAttempts total attempts; reject with the last error if all fail
}`,
    solutionCode: `async function retryWithBackoff(fn, { maxAttempts, baseDelay }) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}`,
    testCases: [
      { input: "fn succeeds on the first call", expected: "resolves immediately with no delay", label: "Succeeds immediately when fn doesn't fail" },
      {
        input: "fn fails twice then succeeds, maxAttempts: 3",
        expected: "resolves with the third attempt's result",
        label: "Retries through failures up to the attempt limit",
      },
      {
        input: "fn always rejects, maxAttempts: 3",
        expected: "rejects with the last attempt's error after 3 tries",
        label: "Rejects with the final error once every attempt fails",
      },
    ],
    isPremium: true,
    orderIndex: 10,
  },
  {
    slug: "live-search-autocomplete",
    conceptSlug: "debouncing-throttling",
    title: "Build a Live Search Autocomplete",
    description: `Build the controller behind a real autocomplete search box — debounced input, plus the one bug a plain debounce alone doesn't fix: a slow earlier response landing *after* a newer one and overwriting it.

## The problem

Debouncing the search input cuts down request volume, but it doesn't protect against a different race condition: request A (for "ind") and request B (for "india") can still resolve out of order over the network, so a slow response to an earlier, now-stale query can land after — and overwrite — the correct latest result.

## The idea

Alongside debouncing the calls themselves, tag every request with a sequence number when it's sent. When a response comes back, only apply it if its sequence number is still the most recent one issued — any older, now-stale response gets silently discarded instead of overwriting fresher results.

## Your task

Write \`createSearchController(fetchResults)\` returning \`{ search(query), onResults(callback) }\`:

- \`search(query)\` debounces calls to \`fetchResults(query)\` by 300ms, same as the standard debounce pattern
- when a \`fetchResults\` call resolves, its results are only passed to \`callback\` if no *newer* \`search()\` call has been made since it was sent
- \`onResults(callback)\` registers the function that receives valid, non-stale results

\`\`\`js
const controller = createSearchController(fetchResults);
controller.onResults((results) => renderResults(results));
controller.search("ind");   // request A sent (after debounce)
controller.search("india"); // request B sent (after debounce) — A's eventual response is now stale
// if A resolves after B, its results are discarded; only B's are ever rendered
\`\`\`

> **This combines two separate concepts on purpose:** debounce (from this concept) cuts down *how many* requests fire; the sequence-number check (a general async-ordering technique) makes sure that even the requests that do fire can never overwrite a newer result — each solves a different half of the "search box" problem.

Once this passes, wire it to a real input and a fake \`fetchResults\` with randomized delay, and confirm results never flicker back to an older, wrong query's results.`,
    starterCode: `function createSearchController(fetchResults) {
  // return { search(query), onResults(callback) }
  // debounce fetchResults by 300ms, and discard stale (out-of-order) responses
}`,
    solutionCode: `function createSearchController(fetchResults) {
  let timer;
  let latestSequence = 0;
  let onResultsCallback = () => {};

  return {
    search(query) {
      clearTimeout(timer);
      const sequence = ++latestSequence;
      timer = setTimeout(async () => {
        const results = await fetchResults(query);
        if (sequence === latestSequence) {
          onResultsCallback(results);
        }
      }, 300);
    },
    onResults(callback) {
      onResultsCallback = callback;
    },
  };
}`,
    testCases: [
      { input: "several search() calls within 300ms", expected: "only one fetchResults call fires, for the last query", label: "Debounces rapid search() calls" },
      {
        input: "an earlier request resolves after a newer one",
        expected: "the earlier (stale) results are discarded, never passed to the callback",
        label: "Out-of-order responses don't overwrite newer results",
      },
      {
        input: "a single search() call with no further calls",
        expected: "its results reach the callback normally",
        label: "A single, non-stale search still resolves normally",
      },
    ],
    isPremium: true,
    orderIndex: 11,
  },
  {
    slug: "data-transformation-pipeline",
    conceptSlug: "function-composition-currying",
    title: "Build a Data Transformation Pipeline",
    description: `Build a small pipeline that cleans up raw API records through a series of composed, single-purpose steps — instead of one large function doing everything at once.

## The problem

Raw API data is rarely ready to use directly — dates come as strings, fields are inconsistently cased, some records are missing required data entirely. Handling all of that in one function works, but makes it hard to test, reuse, or change any single step independently.

## The idea

Break the cleanup into small, single-purpose functions — parse a date field, normalize field casing, drop invalid records — and compose them into one pipeline. Each step only knows how to do its own job; the pipeline itself just describes the order.

## Your task

Write \`compose(...fns)\` (right-to-left, matching \`f(g(x))\`) and use it to build \`cleanRecords(records)\`, which:

- parses each record's \`createdAt\` string into a real \`Date\`
- lowercases each record's \`status\` field
- filters out any record missing an \`id\`

\`\`\`js
cleanRecords([
  { id: "1", status: "ACTIVE", createdAt: "2024-01-01" },
  { status: "DONE", createdAt: "2024-01-02" }, // no id — dropped
]);
// [{ id: "1", status: "active", createdAt: Date(2024-01-01) }]
\`\`\`

> **Why build this as composed steps instead of one function:** each step (parse dates, normalize casing, filter invalid) is independently testable and reusable — a different pipeline elsewhere in the app could reuse the date-parsing or casing step alone, without duplicating logic.

Once this passes, feed it a real API response shape and render the cleaned records in a table.`,
    starterCode: `function compose(...fns) {
  // return a function that applies fns right-to-left: compose(f, g)(x) === f(g(x))
}

function cleanRecords(records) {
  // use compose() to chain: parse createdAt, lowercase status, filter records without an id
}`,
    solutionCode: `function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

function parseDates(records) {
  return records.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}

function normalizeStatus(records) {
  return records.map((r) => ({ ...r, status: r.status ? r.status.toLowerCase() : r.status }));
}

function dropInvalid(records) {
  return records.filter((r) => Boolean(r.id));
}

function cleanRecords(records) {
  return compose(parseDates, normalizeStatus, dropInvalid)(records);
}`,
    testCases: [
      { input: "a record with createdAt: '2024-01-01'", expected: "createdAt becomes a real Date object", label: "Parses date strings into Date objects" },
      { input: "a record with status: 'ACTIVE'", expected: "status becomes 'active'", label: "Normalizes status casing" },
      { input: "a record with no id field", expected: "removed from the result entirely", label: "Filters out records missing an id" },
    ],
    isPremium: true,
    orderIndex: 12,
  },
  {
    slug: "leak-safe-subscription-manager",
    conceptSlug: "memory-management-leaks",
    title: "Build a Leak-Safe Subscription Manager",
    description: `Build a small utility that tracks every subscription a feature creates — listeners, intervals, timeouts — so all of them can be released with a single call, instead of leaking one at a time from a forgotten cleanup.

## The problem

A feature that sets up several things — an event listener, a polling interval, a timeout — needs to release every single one when it's done, or each forgotten one keeps its closure (and whatever it references) reachable forever. Remembering to individually clean up N different subscriptions, in N different ways, is exactly where leaks slip in.

## The idea

Instead of manually tracking each subscription's own cleanup function separately, register every cleanup function with one manager as it's created. The manager doesn't need to know *what* kind of subscription it is — only that it has a \`()  => void\` function that undoes it — and can release everything at once, in one place.

## Your task

Write \`createSubscriptionManager()\` returning \`{ add(cleanupFn), cleanupAll() }\`:

- \`add(cleanupFn)\` registers a cleanup function (e.g. one that calls \`removeEventListener\` or \`clearInterval\`)
- \`cleanupAll()\` calls **every** registered cleanup function, in the order they were added, then clears the registry so calling \`cleanupAll()\` again does nothing

\`\`\`js
const manager = createSubscriptionManager();
const id = setInterval(poll, 1000);
manager.add(() => clearInterval(id));
manager.add(() => window.removeEventListener("resize", onResize));
// later, e.g. in a useEffect cleanup:
manager.cleanupAll(); // both the interval and the listener are released
\`\`\`

> **This is exactly the shape of a \`useEffect\` cleanup function, generalized** — instead of one effect with one inline cleanup, this lets a feature register an arbitrary number of cleanups from anywhere in its code and release them all through a single call.

Once this passes, wire it into a small component-like feature that opens a WebSocket, a polling interval, and a resize listener, and confirm one \`cleanupAll()\` call releases all three.`,
    starterCode: `function createSubscriptionManager() {
  // return { add(cleanupFn), cleanupAll() }
  // cleanupAll() must run every registered cleanup once, then clear the registry
}`,
    solutionCode: `function createSubscriptionManager() {
  let cleanups = [];
  return {
    add(cleanupFn) {
      cleanups.push(cleanupFn);
    },
    cleanupAll() {
      cleanups.forEach((cleanupFn) => cleanupFn());
      cleanups = [];
    },
  };
}`,
    testCases: [
      { input: "3 cleanup functions added, then cleanupAll()", expected: "all 3 are called, in the order added", label: "Runs every registered cleanup" },
      {
        input: "cleanupAll() called twice in a row",
        expected: "the second call runs nothing — the registry is already empty",
        label: "cleanupAll() clears the registry so it can't double-run",
      },
      {
        input: "add() called again after a cleanupAll()",
        expected: "the new cleanup is tracked normally for the next cleanupAll()",
        label: "The manager is reusable after clearing",
      },
    ],
    isPremium: true,
    orderIndex: 13,
  },
  {
    slug: "paginated-data-loader",
    conceptSlug: "generators-iterators",
    title: "Build a Paginated Data Loader",
    description: `Build a lazy, page-by-page data loader using an async generator — pulling one page at a time, on demand, instead of eagerly loading everything upfront.

## The problem

An API that paginates results (\`?page=1\`, \`?page=2\`, ...) shouldn't require the caller to fetch every page upfront just to start showing the first few items — especially when the caller might stop after a handful of items and never need the rest.

## The idea

An async generator can \`yield\` each page's items as soon as that page arrives, pausing in between — the caller consumes it with \`for await...of\`, pulling exactly as many pages as it actually needs, and never more.

## Your task

Write \`async function* paginate(fetchPage)\`, where \`fetchPage(pageNumber)\` returns a Promise resolving to an array of items for that page (an empty array signals no more pages):

- starts at page \`1\` and calls \`fetchPage\` for increasing page numbers
- \`yield\`s each item individually (not each page as a whole array)
- stops entirely once \`fetchPage\` resolves with an empty array

\`\`\`js
for await (const item of paginate(fetchPage)) {
  console.log(item);
  if (haveEnough()) break; // stops fetching further pages immediately
}
\`\`\`

> **Why yield individual items, not whole pages:** it lets the consumer \`break\` out mid-page without needing to know anything about pages at all — from the caller's perspective, it's just one continuous, lazy stream of items.

Once this passes, wire it to a real paginated endpoint and render items into an infinite-scroll list as they're lazily loaded.`,
    starterCode: `async function* paginate(fetchPage) {
  // yield individual items across increasing page numbers, starting at page 1
  // stop once fetchPage resolves with an empty array
}`,
    solutionCode: `async function* paginate(fetchPage) {
  let page = 1;
  while (true) {
    const items = await fetchPage(page);
    if (items.length === 0) return;
    for (const item of items) {
      yield item;
    }
    page += 1;
  }
}`,
    testCases: [
      { input: "fetchPage returns 2 pages of items, then an empty array", expected: "yields every item across both pages, then stops", label: "Lazily yields items across multiple pages" },
      {
        input: "consuming with for await...of and breaking after the first item",
        expected: "later pages are never fetched",
        label: "Stops fetching further pages once the consumer stops iterating",
      },
      {
        input: "fetchPage returns an empty array on the very first call",
        expected: "the generator yields nothing and completes immediately",
        label: "Handles a fully empty result set",
      },
    ],
    isPremium: true,
    orderIndex: 14,
  },

  // ── Phase 10 (Feature 42) — Browser Internals ─────────────────────────────
  {
    slug: "environment-report-generator",
    conceptSlug: "dom-vs-bom",
    title: "Build an Environment Report Generator",
    description: `Build the logic behind a "what does this page know about its environment" debug panel — the kind that groups every browser reference by what it actually represents.

## The problem

A real debug panel collects raw \`{ name, value }\` pairs from all over the codebase — some from the DOM, some from the BOM — and needs to present them grouped correctly, not as one flat undifferentiated list.

## The idea

Reuse the same classification rule as the DOM vs. BOM Challenge — strip a leading \`window.\` first, then anything rooted at \`document\` is DOM, everything else is BOM — and bucket each entry under the right group instead of just classifying one reference at a time.

## Your task

Write \`buildEnvironmentReport(entries)\` — given an array of \`{ name, value }\` objects where \`name\` is a reference string like \`"document.title"\` or \`"window.location.href"\`, return \`{ dom: {...}, bom: {...} }\` with each entry placed under the correct bucket, keyed by its original \`name\`.

Once this passes, imagine wiring it to real values collected via \`document.title\`, \`navigator.userAgent\`, etc., and rendering the two groups as separate panel sections.`,
    starterCode: `function buildEnvironmentReport(entries) {
  // entries: { name: string, value: unknown }[]
  // return { dom: Record<string, unknown>, bom: Record<string, unknown> }
}`,
    solutionCode: `function buildEnvironmentReport(entries) {
  const report = { dom: {}, bom: {} };
  for (const { name, value } of entries) {
    const stripped = name.startsWith("window.") ? name.slice("window.".length) : name;
    const root = stripped.split(".")[0];
    const bucket = root === "document" ? "dom" : "bom";
    report[bucket][name] = value;
  }
  return report;
}`,
    testCases: [
      {
        input: "a document.title entry and a navigator.userAgent entry",
        expected: "each placed under its correct bucket",
        label: "Groups a DOM and a BOM entry correctly",
      },
      { input: "an empty entries array", expected: "{ dom: {}, bom: {} }", label: "Handles an empty entry list" },
      {
        input: "window.document.body",
        expected: "placed under dom despite the window. prefix",
        label: "A window.document reference is still DOM",
      },
      {
        input: "window.location.href and history.length",
        expected: "both placed under bom",
        label: "Multiple BOM entries are grouped together",
      },
    ],
    isPremium: false,
    orderIndex: 15,
  },
  {
    slug: "delegated-click-router",
    conceptSlug: "event-delegation-bubbling-capturing",
    title: "Build a Delegated Click Router",
    description: `Build the routing logic behind a single delegated click listener on a list container — the pattern that lets one listener handle clicks for every row, including rows added later.

## The problem

A real delegated handler walks from the clicked element up toward the container, checking each ancestor's class list against a table of registered routes, and invokes the *nearest* match — exactly like \`element.closest()\` does, but data-driven.

## The idea

Walk the path from the target outward toward the root, one level at a time, and invoke the first registered route found along the way — the target's own classes are checked before any ancestor's, so a closer match always wins over a farther one.

## Your task

Write \`createDelegatedClickHandler(routes)\` — \`routes\` maps a class name to a handler function. It returns a \`dispatch(path)\` function, where \`path\` is an array of class-name arrays ordered from the clicked target outward to the root. \`dispatch\` should invoke the handler for the *first* matching class name found (starting from the target and working outward) and return that class name, or return \`null\` if nothing matched.

Once this passes, imagine feeding it a real \`path\` built by walking \`element.classList\` up through \`element.parentElement\` on an actual click event.`,
    starterCode: `function createDelegatedClickHandler(routes) {
  // return dispatch(path) — path: string[][], target-first
}`,
    solutionCode: `function createDelegatedClickHandler(routes) {
  return function dispatch(path) {
    for (const classNames of path) {
      for (const className of classNames) {
        if (routes[className]) {
          routes[className]();
          return className;
        }
      }
    }
    return null;
  };
}`,
    testCases: [
      {
        input: "the target itself matches a registered route",
        expected: "that route's handler runs, its name is returned",
        label: "A direct target match invokes its own handler",
      },
      {
        input: "the target doesn't match, but an ancestor does",
        expected: "the ancestor's handler runs (delegation)",
        label: "Falls back to a matching ancestor",
      },
      {
        input: "no level in the path matches any registered route",
        expected: "null, no handler invoked",
        label: "Returns null when nothing matches",
      },
      {
        input: "both the target and an ancestor match different routes",
        expected: "only the nearest (target) match runs",
        label: "The nearest match wins over a farther one",
      },
    ],
    isPremium: false,
    orderIndex: 16,
  },
  {
    slug: "ttl-aware-storage-wrapper",
    conceptSlug: "storage-apis",
    title: "Build a TTL-Aware Storage Wrapper",
    description: `Build a small wrapper that adds automatic expiration on top of a plain key/value store — the kind of utility that sits in front of \`localStorage\` to stop stale cached values from being trusted forever.

## The problem

Plain storage APIs have no concept of "this value is only good for 5 minutes" — that has to be layered on top, by storing an expiration timestamp alongside the value and checking it on every read.

## The idea

Store each value together with an expiration timestamp computed from an injectable clock. On every read, compare the current time against that timestamp — past it, the value is treated as gone, exactly as if it were never set.

## Your task

Write \`createTTLStore(now)\` — \`now\` is an injectable clock function (so tests don't need real timers). It returns a store with:

- \`set(key, value, ttlMs)\` — stores the value along with an expiration computed from \`now() + ttlMs\`
- \`get(key)\` — returns the value if it hasn't expired yet, or \`undefined\` if it's missing or expired (and should stop returning it from then on)

Once this passes, imagine swapping the injected clock for \`Date.now\` and the internal map for real \`localStorage\` calls.`,
    starterCode: `function createTTLStore(now) {
  // return { set(key, value, ttlMs), get(key) }
}`,
    solutionCode: `function createTTLStore(now) {
  const store = new Map();
  return {
    set(key, value, ttlMs) {
      store.set(key, { value, expiresAt: now() + ttlMs });
    },
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
  };
}`,
    testCases: [
      { input: "a value read before its TTL elapses", expected: "the stored value", label: "Returns a value before it expires" },
      { input: "a value read after its TTL elapses", expected: "undefined", label: "Returns undefined once the value has expired" },
      {
        input: "two keys with different TTLs",
        expected: "each expires independently",
        label: "Keys expire independently of one another",
      },
      {
        input: "a key set again before its previous TTL elapses",
        expected: "the new value, with a freshly reset expiration",
        label: "Re-setting a key refreshes its expiration",
      },
    ],
    isPremium: true,
    orderIndex: 17,
  },
  {
    slug: "same-origin-request-guard",
    conceptSlug: "cors-same-origin-policy",
    title: "Build a Same-Origin Request Guard",
    description: `Build a small client-side guard that refuses to even attempt a request to a non-allowed origin — a defensive layer in front of \`fetch\`, not a replacement for real CORS enforcement (which only the server can do).

## The problem

CORS itself is enforced by the browser reading the server's response headers — by the time that happens, the request has already gone out. A client-side allowlist can't replace that, but it *can* stop your own app's code from ever attempting a call to an origin it wasn't meant to talk to, failing fast with a clear error instead of a confusing network-level CORS rejection.

## The idea

Check the origin against an allowlist *before* the request function ever runs — if the origin isn't on the list, refuse immediately and never invoke the caller's request logic at all.

## Your task

Write \`createOriginGuard(allowedOrigins)\` — returns an object with:

- \`isAllowed(origin)\` — \`true\`/\`false\`
- \`guardedFetch(origin, requestFn)\` — an async function; if \`origin\` isn't allowed, it throws *without ever calling* \`requestFn\`; otherwise it calls and returns \`requestFn()\`'s result

Once this passes, imagine wiring \`requestFn\` to a real \`fetch\` call, so a typo'd or malicious origin never even reaches the network.`,
    starterCode: `function createOriginGuard(allowedOrigins) {
  // return { isAllowed(origin), guardedFetch(origin, requestFn) }
}`,
    solutionCode: `function createOriginGuard(allowedOrigins) {
  return {
    isAllowed(origin) {
      return allowedOrigins.includes(origin);
    },
    async guardedFetch(origin, requestFn) {
      if (!allowedOrigins.includes(origin)) {
        throw new Error("Origin not allowed: " + origin);
      }
      return requestFn();
    },
  };
}`,
    testCases: [
      { input: "a listed origin", expected: "true", label: "isAllowed is true for a listed origin" },
      { input: "an unlisted origin", expected: "false", label: "isAllowed is false for an unlisted origin" },
      {
        input: "guardedFetch with an allowed origin",
        expected: "requestFn runs and its result is returned",
        label: "guardedFetch runs requestFn when the origin is allowed",
      },
      {
        input: "guardedFetch with a disallowed origin",
        expected: "throws, requestFn never runs",
        label: "guardedFetch never calls requestFn for a disallowed origin",
      },
    ],
    isPremium: true,
    orderIndex: 18,
  },
  {
    slug: "csp-header-builder",
    conceptSlug: "web-security-fundamentals",
    title: "Build a CSP Header Builder",
    description: `Build the logic that turns a structured policy definition into the actual \`Content-Security-Policy\` header string a server sends.

## The problem

Hand-writing a CSP header string is error-prone at scale — a real app assembles it from a config object (often merged from multiple sources) and needs the exact directive syntax the browser expects, every time.

## The idea

Format each directive as its name followed by its space-separated values, then join every directive with \`"; "\` — the exact syntax the \`Content-Security-Policy\` header expects, preserving whatever order the directives were defined in.

## Your task

Write \`buildCspHeader(directives)\` — given an object like \`{ "script-src": ["'self'", "https://cdn.com"], "object-src": ["'none'"] }\`, return the formatted header string: each directive as \`"name value1 value2"\`, joined with \`"; "\`, preserving the object's key order.

Once this passes, imagine setting the result directly as the \`Content-Security-Policy\` response header in a real server.`,
    starterCode: `function buildCspHeader(directives) {
  // directives: Record<string, string[]>
}`,
    solutionCode: `function buildCspHeader(directives) {
  return Object.entries(directives)
    .map(([name, values]) => name + " " + values.join(" "))
    .join("; ");
}`,
    testCases: [
      {
        input: `{ "script-src": ["'self'", "https://cdn.com"] }`,
        expected: `"script-src 'self' https://cdn.com"`,
        label: "Formats a single directive with multiple values",
      },
      {
        input: `{ "script-src": ["'self'"], "object-src": ["'none'"] }`,
        expected: `"script-src 'self'; object-src 'none'"`,
        label: "Joins multiple directives with '; ', preserving order",
      },
      { input: "{}", expected: `""`, label: "An empty directives object produces an empty string" },
      {
        input: `{ "frame-ancestors": ["'none'"] }`,
        expected: `"frame-ancestors 'none'"`,
        label: "Formats a single-value directive",
      },
    ],
    isPremium: true,
    orderIndex: 19,
  },
  {
    slug: "connection-cost-estimator",
    conceptSlug: "the-network-stack",
    title: "Build a Connection Cost Estimator",
    description: `Build the logic behind a "why is this request slow" estimator — given the steps a connection actually performs, compute the total round-trip cost.

## The problem

Not every step in the network stack costs the same number of round trips — a TLS handshake alone typically costs twice what a plain TCP handshake does. A cost estimator needs a per-step weight table, not a flat "steps × one round trip" assumption.

## The idea

Look up each step's weight in round trips, multiply by the measured round-trip time, and sum across every step that actually ran — steps that were skipped (cached DNS, a reused connection) simply aren't in the list, so they contribute nothing.

## Your task

Write \`estimateLatency(steps, roundTripMs)\` — given an ordered array of step names (the same ones \`getConnectionSteps\` from the Challenge produces: \`"dns-lookup"\`, \`"tcp-handshake"\`, \`"tls-handshake"\`, \`"http-request"\`) and a single round-trip time in ms, return the total estimated latency using this per-step weight table:

- \`dns-lookup\`: 1 round trip
- \`tcp-handshake\`: 1 round trip
- \`tls-handshake\`: 2 round trips
- \`http-request\`: 1 round trip

Once this passes, imagine feeding it the real steps produced by \`getConnectionSteps\` plus a measured round-trip time, to estimate a page's actual connection overhead before a single byte of content arrives.`,
    starterCode: `function estimateLatency(steps, roundTripMs) {
  // steps: string[] of connection step names
}`,
    solutionCode: `function estimateLatency(steps, roundTripMs) {
  const COST = { "dns-lookup": 1, "tcp-handshake": 1, "tls-handshake": 2, "http-request": 1 };
  return steps.reduce((total, step) => total + (COST[step] || 0) * roundTripMs, 0);
}`,
    testCases: [
      {
        input: `["dns-lookup","tcp-handshake","tls-handshake","http-request"], 50`,
        expected: "250",
        label: "A full fresh HTTPS connection costs 5 round trips total",
      },
      { input: `["http-request"], 50`, expected: "50", label: "A single reused connection costs one round trip" },
      {
        input: `["tcp-handshake","http-request"], 100`,
        expected: "200",
        label: "A plain HTTP fresh connection costs 2 round trips",
      },
      { input: "[], 50", expected: "0", label: "No steps means zero estimated latency" },
    ],
    isPremium: true,
    orderIndex: 20,
  },
  {
    slug: "caching-strategy-picker",
    conceptSlug: "service-workers-caching-strategies",
    title: "Build a Caching Strategy Picker",
    description: `Build the routing logic a real service worker's \`fetch\` handler needs: given an incoming request, decide *which* caching strategy should handle it.

## The problem

A service worker intercepts every request the page makes — static assets, API calls, and page navigations all pass through the same \`fetch\` handler, but each needs a different strategy. Hardcoding one strategy for everything is exactly the mistake that causes either stale API data or unnecessarily slow static assets.

## The idea

Route on the shape of the URL: a recognizable static asset extension means cache-first is safe, an \`/api/\` path means the data is live enough to need network-first, and everything else falls back to stale-while-revalidate as the reasonable default.

## Your task

Write \`pickCachingStrategy(request)\` — given \`{ url }\`, return which strategy name should handle it:

- a URL ending in a static asset extension (\`.js\`, \`.css\`, \`.png\`, \`.jpg\`, \`.jpeg\`, \`.svg\`, \`.woff\`, \`.woff2\`) → \`"cache-first"\`
- a URL starting with \`/api/\` → \`"network-first"\`
- anything else → \`"stale-while-revalidate"\`

Once this passes, imagine wiring the result directly into the \`cacheFirst\`/\`networkFirst\`/\`staleWhileRevalidate\` functions from the Understand guide's examples, inside a real \`fetch\` event handler.`,
    starterCode: `function pickCachingStrategy(request) {
  // request: { url: string }
}`,
    solutionCode: `function pickCachingStrategy(request) {
  const url = request.url;
  if (/\\.(js|css|png|jpe?g|svg|woff2?)$/i.test(url)) return "cache-first";
  if (url.startsWith("/api/")) return "network-first";
  return "stale-while-revalidate";
}`,
    testCases: [
      { input: `{ url: "/assets/app.js" }`, expected: `"cache-first"`, label: "A static JS asset uses cache-first" },
      { input: `{ url: "/api/users" }`, expected: `"network-first"`, label: "An API route uses network-first" },
      {
        input: `{ url: "/dashboard" }`,
        expected: `"stale-while-revalidate"`,
        label: "A regular page navigation uses stale-while-revalidate",
      },
      { input: `{ url: "/images/logo.svg" }`, expected: `"cache-first"`, label: "A static image asset uses cache-first" },
    ],
    isPremium: true,
    orderIndex: 21,
  },
  {
    slug: "worker-task-dispatcher",
    conceptSlug: "web-workers-concurrency",
    title: "Build a Worker Task Dispatcher",
    description: `Build the load-balancing logic behind a real Web Worker pool — the part that decides which of N workers gets the next task.

## The problem

Spinning up one worker per task defeats the purpose (thread creation itself isn't free); spinning up a single worker serializes everything. A worker *pool* needs a dispatcher that spreads incoming tasks evenly across a fixed number of workers.

## The idea

Cycle through worker indices round-robin — each call to \`dispatch()\` hands out the next index in sequence, wrapping back to \`0\` after the last worker, while a running count per worker tracks exactly how much load it's been given.

## Your task

Write \`createWorkerPool(workerCount)\` — returns an object with:

- \`dispatch()\` — returns the index (0 to \`workerCount - 1\`) of the worker assigned to handle the next task, cycling round-robin
- \`getLoads()\` — returns an array of length \`workerCount\`, each entry the number of tasks assigned to that worker index so far

Once this passes, imagine calling \`dispatch()\` to pick an index, then actually posting the task to \`workers[index].postMessage(task)\` in a real pool.`,
    starterCode: `function createWorkerPool(workerCount) {
  // return { dispatch(), getLoads() }
}`,
    solutionCode: `function createWorkerPool(workerCount) {
  let next = 0;
  const loads = new Array(workerCount).fill(0);
  return {
    dispatch() {
      const worker = next % workerCount;
      loads[worker] += 1;
      next += 1;
      return worker;
    },
    getLoads() {
      return loads.slice();
    },
  };
}`,
    testCases: [
      {
        input: "5 dispatches on a 3-worker pool",
        expected: "[0, 1, 2, 0, 1]",
        label: "Assigns workers round-robin",
      },
      {
        input: "getLoads() after 5 dispatches on a 3-worker pool",
        expected: "[2, 2, 1]",
        label: "Tracks each worker's task count correctly",
      },
      { input: "a 1-worker pool, 3 dispatches", expected: "[0, 0, 0]", label: "A single-worker pool always assigns index 0" },
      { input: "4 dispatches on a 2-worker pool", expected: "loads: [2, 2]", label: "Splits evenly across an even number of dispatches" },
    ],
    isPremium: true,
    orderIndex: 22,
  },
  {
    slug: "mini-jsx-renderer",
    conceptSlug: "jsx-virtual-dom",
    title: "Build a Mini JSX Renderer",
    description: `Build the function that turns a Virtual DOM tree into real HTML — the missing half of what a JSX compiler sets up, completing the loop from \`<button>Save</button>\` to actual markup.

## The problem

\`createElement\`-style calls produce plain \`{ type, props }\` objects, not HTML — something still has to walk that tree and turn it into markup a browser can render. Real React does this with the DOM API directly; a static renderer (like this project) does it by building an HTML string instead.

## The idea

Recursively walk the vnode tree: a string/number child is text, rendered as-is; an object vnode renders as \`<type attrs>...children...</type>\`; a \`false\`/\`null\`/\`undefined\` child (from conditional rendering) renders as nothing at all.

## Your task

Write \`render(vnode)\` returning an HTML string for a vnode shaped like \`{ type, props }\`, where \`props.children\` may be a string, a single vnode, an array of any mix of strings/vnodes/\`false\`/\`null\`, and any other key in \`props\` is a plain attribute.

Wire this into a real page once it passes — take a vnode tree and actually mount its rendered HTML string into a container element.`,
    starterCode: `function render(vnode) {
  // recursively turn a { type, props } vnode tree into an HTML string
}`,
    solutionCode: `function render(vnode) {
  if (vnode === null || vnode === undefined || vnode === false) return "";
  if (typeof vnode === "string" || typeof vnode === "number") return String(vnode);

  const { type, props } = vnode;
  const { children, ...attrs } = props || {};
  const attrString = Object.keys(attrs)
    .map((key) => " " + key + '="' + attrs[key] + '"')
    .join("");
  const childList = Array.isArray(children) ? children : [children];
  const innerHTML = childList.map(render).join("");
  return "<" + type + attrString + ">" + innerHTML + "</" + type + ">";
}`,
    testCases: [
      { input: `render({ type: "div", props: { children: [] } })`, expected: `"<div></div>"`, label: "An empty children array renders as an empty tag" },
      {
        input: `render({ type: "button", props: { className: "primary", children: "Save" } })`,
        expected: `'<button className="primary">Save</button>'`,
        label: "Attributes and a single text child both render correctly",
      },
      {
        input: `render({ type: "div", props: { children: [false, "a", null] } })`,
        expected: `"<div>a</div>"`,
        label: "false/null children from conditional rendering are skipped entirely",
      },
      {
        input: `render({ type: "div", props: { children: { type: "span", props: { children: "hi" } } } })`,
        expected: `"<div><span>hi</span></div>"`,
        label: "Nested vnodes render recursively",
      },
    ],
    isPremium: false,
    orderIndex: 23,
  },
  {
    slug: "autosave-dirty-fields",
    conceptSlug: "usestate-useeffect-fundamentals",
    title: "Build an Auto-Saving Form",
    description: `Build the piece that decides *when* an auto-save effect should actually fire — the same kind of comparison useEffect's dependency array runs internally, applied to a form's fields.

## The problem

An auto-saving form shouldn't fire a save request on every render — only when a field actually changed since the last save. Saving unconditionally on every render wastes requests; comparing the wrong things means missing real edits or re-saving unchanged data.

## The idea

Compare each field in the current values against the last-saved snapshot with \`Object.is\` — the same comparison React itself uses for dependency arrays. Any field where the two differ (including a brand-new field that wasn't in the last snapshot at all) is "dirty" and belongs in the next save.

## Your task

Write \`getDirtyFields(initial, current)\` returning an array of the field names in \`current\` whose value differs from \`initial\`'s value for that same key.

Wire this into a real form: call it inside a debounced \`useEffect\` and only POST the fields it returns.`,
    starterCode: `function getDirtyFields(initial, current) {
  // return the keys of \`current\` whose value differs from \`initial\`
}`,
    solutionCode: `function getDirtyFields(initial, current) {
  return Object.keys(current).filter((key) => !Object.is(initial[key], current[key]));
}`,
    testCases: [
      {
        input: `getDirtyFields({ name: "Ana", email: "a@x.com" }, { name: "Ana", email: "b@x.com" })`,
        expected: `["email"]`,
        label: "Only the field that actually changed is flagged dirty",
      },
      {
        input: `getDirtyFields({ name: "Ana" }, { name: "Ana" })`,
        expected: "[]",
        label: "Identical values produce no dirty fields",
      },
      {
        input: `getDirtyFields({ name: "Ana" }, { name: "Ana", phone: "555" })`,
        expected: `["phone"]`,
        label: "A brand-new field not present in the initial snapshot counts as dirty",
      },
      {
        input: `getDirtyFields({ age: NaN }, { age: NaN })`,
        expected: "[]",
        label: "Object.is treats NaN as equal to itself, so it is not flagged dirty",
      },
    ],
    isPremium: false,
    orderIndex: 24,
  },
  {
    slug: "multi-step-form-validator",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    title: "Build a Multi-Step Form Wizard",
    description: `Build the validator that decides whether a controlled multi-step form can advance to the next step — the gatekeeper every "Next" button in a wizard actually calls.

## The problem

A multi-step form (signup, checkout) shouldn't let the user advance past a step with missing required fields or invalid formats — but each step usually only cares about a handful of its own fields, not the whole form's schema.

## The idea

Each step has a schema describing its own fields: whether each is required, and an optional pattern it must match if a value is present. A field only fails validation if it's required and empty, or if it has a value that doesn't match its pattern — an empty, non-required field is always fine.

## Your task

Write \`validateStep(schema, values)\`, where \`schema\` is \`{ [field]: { required: boolean, pattern?: RegExp } }\` and \`values\` is \`{ [field]: string }\`. Return an array of the field names that fail validation.

Wire this into a real 3-step wizard: block the "Next" button while \`validateStep\` returns any errors for the current step.`,
    starterCode: `function validateStep(schema, values) {
  // return the field names in \`schema\` that fail validation against \`values\`
}`,
    solutionCode: `function validateStep(schema, values) {
  const errors = [];
  for (const field of Object.keys(schema)) {
    const rule = schema[field];
    const value = values[field];
    const isEmpty = value === undefined || value === null || value === "";
    if (rule.required && isEmpty) {
      errors.push(field);
      continue;
    }
    if (!isEmpty && rule.pattern && !rule.pattern.test(value)) {
      errors.push(field);
    }
  }
  return errors;
}`,
    testCases: [
      {
        input: `validateStep({ email: { required: true } }, { email: "" })`,
        expected: `["email"]`,
        label: "A missing required field fails validation",
      },
      {
        input: `validateStep({ nickname: { required: false } }, {})`,
        expected: "[]",
        label: "A missing optional field never fails validation",
      },
      {
        input: `validateStep({ zip: { required: true, pattern: /^\\d{5}$/ } }, { zip: "abc" })`,
        expected: `["zip"]`,
        label: "A present value that fails its pattern is flagged",
      },
      {
        input: `validateStep({ email: { required: true }, zip: { required: true, pattern: /^\\d{5}$/ } }, { email: "a@x.com", zip: "94107" })`,
        expected: "[]",
        label: "A fully valid step returns no errors",
      },
    ],
    isPremium: false,
    orderIndex: 25,
  },
  {
    slug: "focus-trap-elements",
    conceptSlug: "useref-imperative-handles",
    title: "Build a Focus-Trap Modal",
    description: `Build the lookup that powers a modal's focus trap — the piece that decides which elements Tab should even be allowed to land on while the modal is open.

## The problem

An accessible modal must trap keyboard focus inside itself — Tab should cycle only through the modal's own focusable elements, never escaping to the page underneath. That starts with correctly identifying which elements in the modal actually are focusable in the first place.

## The idea

An element is focusable if it isn't hidden or disabled, its \`tabIndex\` isn't explicitly \`-1\` (removed from the tab order), and it's either a naturally-focusable tag (\`button\`, \`input\`, \`select\`, \`textarea\`, \`a\`) or has an explicit non-negative \`tabIndex\` (like a \`div\` with \`tabIndex={0}\`).

## Your task

Write \`getFocusableElements(nodes)\`, where each node is \`{ id, tag, disabled, hidden, tabIndex }\`. Return the \`id\`s of every focusable node, in their original order.

Wire this into a real modal: use \`useRef\` on the container, call this over its actual children on mount, and cycle \`Tab\`/\`Shift+Tab\` between only those elements.`,
    starterCode: `function getFocusableElements(nodes) {
  // return the ids of focusable nodes, in order
}`,
    solutionCode: `function getFocusableElements(nodes) {
  const FOCUSABLE_TAGS = ["button", "input", "select", "textarea", "a"];
  return nodes
    .filter((node) => {
      if (node.hidden || node.disabled) return false;
      if (node.tabIndex === -1) return false;
      return FOCUSABLE_TAGS.includes(node.tag) || node.tabIndex >= 0;
    })
    .map((node) => node.id);
}`,
    testCases: [
      {
        input: `getFocusableElements([{ id: "btn", tag: "button", disabled: false }, { id: "input", tag: "input", disabled: true }])`,
        expected: `["btn"]`,
        label: "A disabled element is excluded even though its tag is naturally focusable",
      },
      {
        input: `getFocusableElements([{ id: "custom", tag: "div", tabIndex: 0 }])`,
        expected: `["custom"]`,
        label: "A div with an explicit non-negative tabIndex is focusable",
      },
      {
        input: `getFocusableElements([{ id: "removed", tag: "button", tabIndex: -1 }])`,
        expected: "[]",
        label: "tabIndex -1 removes an otherwise-focusable element from the tab order",
      },
      {
        input: `getFocusableElements([{ id: "a", tag: "input" }, { id: "b", tag: "div" }, { id: "c", tag: "a" }])`,
        expected: `["a", "c"]`,
        label: "Order is preserved, and non-focusable plain tags are dropped",
      },
    ],
    isPremium: true,
    orderIndex: 26,
  },
  {
    slug: "resolve-theme-value",
    conceptSlug: "context-api-prop-drilling",
    title: "Build a Theme Switcher",
    description: `Build the resolution logic behind nested Context providers — given a stack of nested theme values, figure out which one a consumer actually sees for a given key.

## The problem

A component reads whatever value the *nearest* ancestor Provider set — a \`<ThemeContext.Provider value={{ accent: 'blue' }}>\` nested inside another one with \`value={{ accent: 'red', bg: 'white' }}\` means a consumer inside both sees \`accent: 'blue'\` (the nearer one wins) but still falls back to \`bg: 'white'\` from the outer one, since the inner provider never set \`bg\` at all.

## The idea

Walk the provider stack from nearest to farthest, and return the first value found that actually defines the requested key — not just the nearest provider overall, since a nearer provider might not set every key.

## Your task

Write \`resolveThemeValue(providerStack, key)\`, where \`providerStack\` is an array of value objects ordered nearest-first. Return the first defined value for \`key\`, or \`undefined\` if no provider in the stack sets it.

Wire this into a real nested theme switcher: a \`<ThemeProvider>\` per section of the page, each overriding only the keys it cares about.`,
    starterCode: `function resolveThemeValue(providerStack, key) {
  // walk nearest-to-farthest, return the first value that defines key
}`,
    solutionCode: `function resolveThemeValue(providerStack, key) {
  for (const values of providerStack) {
    if (values && Object.prototype.hasOwnProperty.call(values, key)) {
      return values[key];
    }
  }
  return undefined;
}`,
    testCases: [
      {
        input: `resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "accent")`,
        expected: `"blue"`,
        label: "The nearest provider's value wins when both define the key",
      },
      {
        input: `resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "bg")`,
        expected: `"white"`,
        label: "Falls through to a farther provider for a key the nearer one never set",
      },
      {
        input: `resolveThemeValue([{ accent: "blue" }], "font")`,
        expected: "undefined",
        label: "Returns undefined when no provider in the stack defines the key",
      },
      {
        input: `resolveThemeValue([{}, { accent: "red" }], "accent")`,
        expected: `"red"`,
        label: "Skips a nearer provider that doesn't define the key at all",
      },
    ],
    isPremium: true,
    orderIndex: 27,
  },
  {
    slug: "accordion-toggle-state",
    conceptSlug: "component-composition-patterns",
    title: "Build an Accordion",
    description: `Build the state transition behind an accordion's open/close behavior — the logic a compound \`<Accordion>\`/\`<Accordion.Item>\` API shares internally through Context.

## The problem

An accordion can allow multiple sections open at once, or restrict it to exactly one at a time — and clicking an already-open section should close it either way. Getting this transition right (and doing it immutably, since it drives a re-render) is the actual state-management core of the component; the compound-component wiring around it is just plumbing.

## The idea

In multiple-open mode, clicking a section simply toggles its own membership in the open set. In single-open mode, clicking the currently-open section closes everything, and clicking any other section replaces the open set with just that one item.

## Your task

Write \`toggleAccordionItem(openIds, itemId, allowMultiple)\` returning the **new** array of open item ids — never mutate \`openIds\`.

Wire this into a real accordion with 4 sections, toggling between single-open and multiple-open modes via a prop.`,
    starterCode: `function toggleAccordionItem(openIds, itemId, allowMultiple) {
  // return a NEW array — don't mutate openIds
}`,
    solutionCode: `function toggleAccordionItem(openIds, itemId, allowMultiple) {
  const isOpen = openIds.includes(itemId);
  if (allowMultiple) {
    return isOpen ? openIds.filter((id) => id !== itemId) : [...openIds, itemId];
  }
  return isOpen ? [] : [itemId];
}`,
    testCases: [
      {
        input: `toggleAccordionItem(["a"], "b", true)`,
        expected: `["a", "b"]`,
        label: "Multiple-open mode adds a newly clicked section",
      },
      {
        input: `toggleAccordionItem(["a", "b"], "a", true)`,
        expected: `["b"]`,
        label: "Multiple-open mode removes an already-open section when clicked again",
      },
      {
        input: `toggleAccordionItem(["a"], "b", false)`,
        expected: `["b"]`,
        label: "Single-open mode replaces the open section with the newly clicked one",
      },
      {
        input: `toggleAccordionItem(["a"], "a", false)`,
        expected: "[]",
        label: "Single-open mode closes everything when the already-open section is clicked again",
      },
    ],
    isPremium: true,
    orderIndex: 28,
  },
  {
    slug: "use-undo-reducer",
    conceptSlug: "custom-hooks-composition",
    title: "Build a useUndo Custom Hook",
    description: `Build the reducer behind a reusable \`useUndo\` custom hook — the classic past/present/future history pattern shared by every undo-able editor.

## The problem

Undo/redo needs more than just the current value — it needs a history of past values to step back into, and a "redo" stack to step forward into again after an undo, which gets cleared the moment a genuinely new change is made.

## The idea

State is \`{ past: [], present, future: [] }\`. Setting a new value pushes the current \`present\` onto \`past\` and clears \`future\` entirely (a new branch of history invalidates any "redo" path). Undo pops the last \`past\` entry into \`present\` and pushes the old \`present\` onto the front of \`future\`. Redo does the mirror image.

## Your task

Write \`undoReducer(state, action)\`, where \`action\` is \`{ type: 'SET' | 'UNDO' | 'REDO', payload }\`. \`UNDO\` with an empty \`past\` (or \`REDO\` with an empty \`future\`) must return the state unchanged.

Wire this into a real \`useUndo(initialValue)\` hook (\`useReducer(undoReducer, ...)\`) and use it in a small text editor with Undo/Redo buttons.`,
    starterCode: `function undoReducer(state, action) {
  // state: { past: [], present, future: [] }
}`,
    solutionCode: `function undoReducer(state, action) {
  switch (action.type) {
    case "SET": {
      if (Object.is(action.payload, state.present)) return state;
      return { past: [...state.past, state.present], present: action.payload, future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}`,
    testCases: [
      {
        input: `undoReducer({ past: [], present: "a", future: [] }, { type: "SET", payload: "b" })`,
        expected: `{ past: ["a"], present: "b", future: [] }`,
        label: "SET pushes the current present into past and clears future",
      },
      {
        input: `undoReducer({ past: ["a"], present: "b", future: [] }, { type: "UNDO" })`,
        expected: `{ past: [], present: "a", future: ["b"] }`,
        label: "UNDO restores the previous value and moves the current one into future",
      },
      {
        input: `undoReducer({ past: [], present: "a", future: ["b"] }, { type: "REDO" })`,
        expected: `{ past: ["a"], present: "b", future: [] }`,
        label: "REDO restores the next future value and pushes the current one back into past",
      },
      {
        input: `undoReducer({ past: [], present: "a", future: [] }, { type: "UNDO" })`,
        expected: `{ past: [], present: "a", future: [] }`,
        label: "UNDO with no history is a no-op",
      },
    ],
    isPremium: true,
    orderIndex: 29,
  },
  {
    slug: "resolve-error-fallback",
    conceptSlug: "error-boundaries",
    title: "Build an Error-Resilient Dashboard",
    description: `Build the routing logic behind a dashboard where different widgets show different, purpose-built fallback UIs instead of one generic "Something went wrong" for every crash.

## The problem

A single generic fallback treats a network-timeout error in a chart widget the same as a corrupt-data error in a table widget — but a real dashboard usually wants a distinct fallback per error type (a "retry" UI for a network error, a "report a bug" UI for anything unexpected).

## The idea

Each widget's Error Boundary is configured with a map from error name to a fallback key. Looking up the thrown error's \`name\` in that map gives the right fallback; anything not explicitly mapped falls back to a \`default\` entry instead of crashing the lookup itself.

## Your task

Write \`getFallbackForError(error, fallbackMap)\`, where \`error\` is \`{ name: string }\` and \`fallbackMap\` is \`{ [errorName]: fallbackKey, default: fallbackKey }\`. Return the matching fallback key, or \`fallbackMap.default\` if \`error.name\` isn't a key in the map.

Wire this into a real dashboard: give each widget its own Error Boundary, and render the fallback key this function returns as the actual fallback component.`,
    starterCode: `function getFallbackForError(error, fallbackMap) {
  // look up error.name in fallbackMap, falling back to fallbackMap.default
}`,
    solutionCode: `function getFallbackForError(error, fallbackMap) {
  return Object.prototype.hasOwnProperty.call(fallbackMap, error.name)
    ? fallbackMap[error.name]
    : fallbackMap.default;
}`,
    testCases: [
      {
        input: `getFallbackForError({ name: "NetworkError" }, { NetworkError: "retry-banner", default: "generic-error" })`,
        expected: `"retry-banner"`,
        label: "A mapped error name resolves to its specific fallback",
      },
      {
        input: `getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner", default: "generic-error" })`,
        expected: `"generic-error"`,
        label: "An unmapped error name falls back to the default entry",
      },
      {
        input: `getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner" })`,
        expected: "undefined",
        label: "With no default entry, an unmapped error resolves to undefined",
      },
      {
        input: `getFallbackForError({ name: "AuthError" }, { NetworkError: "retry-banner", AuthError: "login-prompt", default: "generic-error" })`,
        expected: `"login-prompt"`,
        label: "Different widgets' maps can route the same kind of error to different fallbacks",
      },
    ],
    isPremium: true,
    orderIndex: 30,
  },
  {
    slug: "diff-changed-rows",
    conceptSlug: "render-performance-memoization",
    title: "Build a Memoized Data Table",
    description: `Build the comparison a memoized data table actually needs — given the previous and next set of rows, figure out which rows genuinely changed, so only those rows' components have to re-render.

## The problem

Re-rendering every row of a large table whenever any single row's data updates wastes work identical to what \`React.memo\` is meant to prevent — but \`memo\` only helps if something first identifies *which* rows actually changed, so the rest can be left alone with stable props.

## The idea

Match rows between the two snapshots by \`id\`. A row with no match in the previous snapshot is new (changed by definition). A row that does have a match is changed only if any of its fields differ from the matching previous row, compared shallowly.

## Your task

Write \`getChangedRows(prevRows, nextRows)\`, where each row is \`{ id, ...fields }\`. Return the \`id\`s (from \`nextRows\`) of every row that is new or has at least one changed field.

Wire this into a real table: wrap each row component in \`React.memo\`, and only pass a changed \`key\`/prop reference for the ids this function returns.`,
    starterCode: `function getChangedRows(prevRows, nextRows) {
  // return the ids of rows in nextRows that are new or have a changed field
}`,
    solutionCode: `function rowsShallowEqual(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

function getChangedRows(prevRows, nextRows) {
  const prevById = new Map(prevRows.map((row) => [row.id, row]));
  return nextRows
    .filter((row) => {
      const prev = prevById.get(row.id);
      if (!prev) return true;
      return !rowsShallowEqual(prev, row);
    })
    .map((row) => row.id);
}`,
    testCases: [
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }])`,
        expected: "[]",
        label: "An unchanged row is not reported as changed",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 12 }])`,
        expected: `["1"]`,
        label: "A row with a changed field is reported",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }, { id: "2", price: 5 }])`,
        expected: `["2"]`,
        label: "A brand-new row (no match in prevRows) is always reported",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }, { id: "2", price: 5 }], [{ id: "1", price: 11 }, { id: "2", price: 5 }])`,
        expected: `["1"]`,
        label: "Only the actually-changed row is reported, not every row",
      },
    ],
    isPremium: true,
    orderIndex: 31,
  },
  {
    slug: "merge-transition-results",
    conceptSlug: "concurrent-react-suspense",
    title: "Build a Search-as-You-Type UI with Transitions",
    description: `Build the decision a search-as-you-type UI has to make on every keystroke while a transition-wrapped search is still pending: keep showing the last real results, or show the newly-arrived ones?

## The problem

Wrapping a search update in \`startTransition\` keeps the input responsive, but the UI still needs to decide what to render *while* that transition is pending — showing nothing looks broken, and showing half-computed results is worse than showing the previous, complete results with a "stale" indicator.

## The idea

While a transition is still pending, keep rendering the previous results (marked stale, so the UI can dim them or show a spinner alongside). The moment the transition resolves, switch fully to the new results and clear the stale flag.

## Your task

Write \`mergeTransitionResults(previousResults, incomingResults, isPending)\` returning \`{ results, stale }\`.

Wire this into a real search box: call this inside the component using \`useTransition\`'s \`isPending\` flag, and dim the results list whenever \`stale\` is true.`,
    starterCode: `function mergeTransitionResults(previousResults, incomingResults, isPending) {
  // return { results, stale }
}`,
    solutionCode: `function mergeTransitionResults(previousResults, incomingResults, isPending) {
  if (isPending) {
    return { results: previousResults, stale: true };
  }
  return { results: incomingResults, stale: false };
}`,
    testCases: [
      {
        input: `mergeTransitionResults(["a", "b"], ["c"], true)`,
        expected: `{ results: ["a", "b"], stale: true }`,
        label: "While pending, the previous results are kept and marked stale",
      },
      {
        input: `mergeTransitionResults(["a", "b"], ["c"], false)`,
        expected: `{ results: ["c"], stale: false }`,
        label: "Once resolved, the incoming results replace the previous ones",
      },
      {
        input: `mergeTransitionResults([], ["c"], true)`,
        expected: `{ results: [], stale: true }`,
        label: "An empty previous result set stays empty while pending, rather than showing incoming results early",
      },
      {
        input: `mergeTransitionResults(["a"], ["a"], false)`,
        expected: `{ results: ["a"], stale: false }`,
        label: "Resolving to identical results still clears the stale flag",
      },
    ],
    isPremium: true,
    orderIndex: 32,
  },
  {
    slug: "memoized-selector",
    conceptSlug: "state-management-tradeoffs",
    title: "Build a Shopping Cart with Selector-Based State",
    description: `Build the memoization wrapper behind selector-based state libraries (Redux + Reselect, Zustand selectors) — the piece that lets a component subscribe to a derived value without recomputing it on every single state change.

## The problem

Deriving a cart total from a list of items is cheap once, but recomputing it on every render — even when the cart hasn't changed — adds up in a large app, and a derived value recomputed with a new object/array reference every time also defeats any \`memo\`-wrapped consumer downstream.

## The idea

Cache the last arguments a selector was called with alongside its result. If the next call's arguments are the same (shallow, in order, via \`Object.is\`), return the cached result without invoking the selector function again; otherwise recompute and cache the new result.

## Your task

Write \`createSelector(selectorFn)\` returning a memoized version of \`selectorFn\` — calling it with the same arguments as last time must not invoke \`selectorFn\` again.

Wire this into a real cart: create a \`selectCartTotal = createSelector((items) => items.reduce(...))\` and confirm (e.g. with a call counter) it isn't recomputed on unrelated re-renders.`,
    starterCode: `function createSelector(selectorFn) {
  // return a memoized version of selectorFn
}`,
    solutionCode: `function createSelector(selectorFn) {
  let lastArgs = null;
  let lastResult;
  return function (...args) {
    const sameArgs =
      lastArgs !== null &&
      lastArgs.length === args.length &&
      lastArgs.every((arg, i) => Object.is(arg, args[i]));
    if (sameArgs) return lastResult;
    lastArgs = args;
    lastResult = selectorFn(...args);
    return lastResult;
  };
}`,
    testCases: [
      {
        input: "a selector counting its own calls, invoked twice with the identical array reference",
        expected: "the selector function itself is only actually invoked once",
        label: "Calling with the same arguments returns the cached result without recomputing",
      },
      {
        input: "the same selector invoked with two different array references",
        expected: "the selector function is invoked again and returns the new, correct result",
        label: "Calling with different arguments recomputes and returns the new result",
      },
      {
        input: `createSelector((items) => items.reduce((sum, i) => sum + i.price, 0))([{ price: 10 }, { price: 5 }])`,
        expected: "15",
        label: "The memoized selector still returns the selector function's real result",
      },
      {
        input: "the selector called with (1, 2) then with (2, 1)",
        expected: "recomputed, since argument order is part of what defines 'the same arguments'",
        label: "A different argument order counts as different arguments",
      },
    ],
    isPremium: true,
    orderIndex: 33,
  },
  // ── Phase 10 (Feature 44) — CSS Concepts ──────────────────────────────────
  {
    slug: "box-model-inspector",
    conceptSlug: "the-box-model",
    title: "Build a Box Model Inspector",
    description: `Build the calculation behind a browser DevTools-style box model panel — given a declared size and box-sizing mode, report every layer's actual dimensions.

## The problem

DevTools' box model overlay shows content, padding, border, and margin as separate numbers, worked out from whatever mix of \`width\`, padding, and border was actually declared — the exact math depends on \`box-sizing\`.

## The idea

Under \`content-box\`, the declared width IS the content width, and padding/border are added on top to get the rendered width. Under \`border-box\`, the declared width IS the rendered width, and the content width is what's left over after subtracting padding and border.

## Your task

Write \`computeBoxDimensions({ width, height, padding, border, boxSizing })\`. Return \`{ contentWidth, contentHeight, renderedWidth, renderedHeight }\` (padding/border apply to both sides of each axis).

\`\`\`js
computeBoxDimensions({ width: 200, height: 100, padding: 20, border: 2, boxSizing: "border-box" })
// → { contentWidth: 156, contentHeight: 56, renderedWidth: 200, renderedHeight: 100 }
\`\`\`

Once this passes, imagine wiring it up to a live overlay that redraws the four nested boxes to scale as a user edits the inputs — exactly what a DevTools box model panel does.`,
    starterCode: `function computeBoxDimensions({ width, height, padding, border, boxSizing }) {
  // return { contentWidth, contentHeight, renderedWidth, renderedHeight }
}`,
    solutionCode: `function computeBoxDimensions({ width, height, padding, border, boxSizing }) {
  const extra = (padding + border) * 2;
  if (boxSizing === "border-box") {
    return {
      contentWidth: width - extra,
      contentHeight: height - extra,
      renderedWidth: width,
      renderedHeight: height,
    };
  }
  return {
    contentWidth: width,
    contentHeight: height,
    renderedWidth: width + extra,
    renderedHeight: height + extra,
  };
}`,
    testCases: [
      {
        input: "{ width:200, height:100, padding:20, border:2, boxSizing:'border-box' }",
        expected: "{ contentWidth:156, contentHeight:56, renderedWidth:200, renderedHeight:100 }",
        label: "border-box: rendered size matches the declared width/height exactly",
      },
      {
        input: "{ width:200, height:100, padding:20, border:2, boxSizing:'content-box' }",
        expected: "{ contentWidth:200, contentHeight:100, renderedWidth:244, renderedHeight:144 }",
        label: "content-box: rendered size grows beyond the declared width/height",
      },
      {
        input: "{ width:100, height:100, padding:0, border:0, boxSizing:'content-box' }",
        expected: "{ contentWidth:100, contentHeight:100, renderedWidth:100, renderedHeight:100 }",
        label: "Zero padding/border renders identically under either mode",
      },
    ],
    isPremium: false,
    orderIndex: 34,
  },
  {
    slug: "responsive-style-resolver",
    conceptSlug: "units-sizing",
    title: "Build a Responsive Style Resolver",
    description: `Build the resolver behind a "computed styles" panel — given a component's declared styles in mixed units, resolve every value to a final pixel number for a given context.

## The problem

A component's styles might mix \`rem\` (root-relative), \`em\` (parent-relative), and \`vw\` (viewport-relative) — each resolves differently depending on where the component actually renders, which is exactly why "it works standalone but breaks nested" bugs happen.

## The idea

Parse each declared value into a number and a unit, then resolve it against the right piece of context: \`rootFontSize\` for \`rem\`, \`parentFontSize\` for \`em\`, \`viewportWidth\`/\`viewportHeight\` for \`vw\`/\`vh\`, and pass \`px\` straight through.

## Your task

Write \`resolveStyles(styleMap, context)\`, where \`styleMap\` is \`{ [property]: "<number><unit>" }\` (e.g. \`"1.5rem"\`) and \`context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }\`. Return an object with the same keys, each resolved to a plain pixel number.

\`\`\`js
resolveStyles({ padding: "1rem", fontSize: "1.2em", width: "50vw" }, { rootFontSize: 16, parentFontSize: 20, viewportWidth: 1000 })
// → { padding: 16, fontSize: 24, width: 500 }
\`\`\`

Once this passes, imagine feeding it a component's real declared styles plus its live rendering context, to power a "computed styles" panel that always shows accurate pixel values regardless of how deeply the component is nested.`,
    starterCode: `function resolveStyles(styleMap, context) {
  // styleMap: { [property]: "<number><unit>" }
}`,
    solutionCode: `function resolveLength(value, unit, context) {
  switch (unit) {
    case "px": return value;
    case "rem": return value * context.rootFontSize;
    case "em": return value * context.parentFontSize;
    case "vw": return (value / 100) * context.viewportWidth;
    case "vh": return (value / 100) * context.viewportHeight;
    default: throw new Error(\`Unknown unit: \${unit}\`);
  }
}

function resolveStyles(styleMap, context) {
  const result = {};
  for (const [prop, declared] of Object.entries(styleMap)) {
    const match = declared.match(/^(-?[\\d.]+)([a-z%]+)$/);
    const [, num, unit] = match;
    result[prop] = resolveLength(parseFloat(num), unit, context);
  }
  return result;
}`,
    testCases: [
      {
        input: "{ padding:'1rem', fontSize:'1.2em', width:'50vw' }, { rootFontSize:16, parentFontSize:20, viewportWidth:1000 }",
        expected: "{ padding:16, fontSize:24, width:500 }",
        label: "Resolves a mixed rem/em/vw style object against the given context",
      },
      {
        input: "{ margin:'8px' }, {}",
        expected: "{ margin:8 }",
        label: "px values pass through unchanged, independent of context",
      },
      {
        input: "{ height:'2rem' }, { rootFontSize:10 }",
        expected: "{ height:20 }",
        label: "Multiple rem values all resolve against the same root font-size",
      },
    ],
    isPremium: false,
    orderIndex: 35,
  },
  {
    slug: "computed-style-engine",
    conceptSlug: "the-cascade-inheritance",
    title: "Build a Computed Style Engine",
    description: `Build the two-step lookup a browser actually performs to answer "what's this element's computed value for this property?" — cascade first, inheritance second.

## The problem

If no rule at all targets an element for a given property, the browser doesn't just give up — inheritable properties fall back to the parent's own computed value, walking up until either a rule wins or the root's initial value is reached.

## The idea

First, resolve the cascade among any rules that directly target this element (importance → specificity → source order, same as the CSS Specificity concept). If nothing targets it and the property is inheritable, recurse upward to the parent. If nothing targets it anywhere in the chain, fall back to the property's initial value.

## Your task

Write \`computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue)\`, where \`tree\` is \`{ id, parentId }[]\` and \`declarationsByElement[elementId][property]\` is an array of \`{ value, important, specificity, order }\`.

\`\`\`js
computedValue("child", "color", tree, { root: { color: [{ value: "navy", important: false, specificity: [0,0,1], order: 0 }] } }, true, "black")
// → "navy" — no rule targets "child" directly, so it inherits from "root"
\`\`\``,
    starterCode: `function computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue) {
  // tree: { id, parentId }[]
}`,
    solutionCode: `function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function resolveCascade(declarations) {
  return declarations.reduce((winner, d) => {
    if (!winner) return d;
    if (d.important !== winner.important) return d.important ? d : winner;
    const cmp = compareSpecificity(d.specificity, winner.specificity);
    if (cmp !== 0) return cmp > 0 ? d : winner;
    return d.order >= winner.order ? d : winner;
  }, null).value;
}

function computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  const own = declarationsByElement[elementId]?.[property];
  if (own && own.length > 0) return resolveCascade(own);

  const parentId = byId[elementId]?.parentId;
  if (inheritable && parentId != null) {
    return computedValue(parentId, property, tree, declarationsByElement, inheritable, initialValue);
  }
  return initialValue;
}`,
    testCases: [
      {
        input: "'child' has no color rule, its parent 'root' does, color is inheritable",
        expected: "root's resolved color",
        label: "Falls back to the nearest ancestor's computed value when inheritable",
      },
      {
        input: "'child' has its own color rule",
        expected: "child's own resolved value",
        label: "An element's own cascade-won rule always wins before inheritance is considered",
      },
      {
        input: "no element in the chain has a margin rule, margin is not inheritable",
        expected: "the initial value",
        label: "A non-inheritable property with no matching rule falls back to its initial value, not the parent's",
      },
    ],
    isPremium: false,
    orderIndex: 36,
  },
  {
    slug: "flex-line-layout-engine",
    conceptSlug: "flexbox-vs-grid",
    title: "Build a Flex Line Layout Engine",
    description: `Extend a flex distribution calculator to handle \`flex-wrap: wrap\` — splitting items across multiple lines and distributing space independently per line.

## The problem

Without wrapping, items simply shrink to fit one line. With \`flex-wrap: wrap\`, items that don't fit spill onto a new line instead — and each line then distributes its own leftover space independently, with no awareness of the other lines.

## The idea

Walk the items in order, accumulating basis widths onto the current line. Once adding the next item's basis would overflow the container (and the line isn't empty), start a new line. Once every line is built, distribute each line's own leftover space across its own items by \`flex-grow\`, exactly like a non-wrapping flex container would.

## Your task

Write \`layoutFlexLines(items, containerWidth)\`, where each item is \`{ basis, grow }\`. Return an array of lines, each an array of that line's items' final widths.

\`\`\`js
layoutFlexLines([{ basis: 150, grow: 1 }, { basis: 150, grow: 1 }, { basis: 150, grow: 1 }], 300)
// → [[150, 150], [300]] — the first two fill line one exactly, the third wraps alone and grows to fill its own line
\`\`\`

Once this passes, imagine feeding it a real card grid's item widths and container size to preview exactly how many cards fit per row before a single pixel is rendered.`,
    starterCode: `function layoutFlexLines(items, containerWidth) {
  // items: [{ basis, grow }]
}`,
    solutionCode: `function layoutFlexLines(items, containerWidth) {
  const lines = [];
  let currentLine = [];
  let currentBasisTotal = 0;

  for (const item of items) {
    if (currentLine.length > 0 && currentBasisTotal + item.basis > containerWidth) {
      lines.push(currentLine);
      currentLine = [];
      currentBasisTotal = 0;
    }
    currentLine.push(item);
    currentBasisTotal += item.basis;
  }
  if (currentLine.length > 0) lines.push(currentLine);

  return lines.map((line) => {
    const totalBasis = line.reduce((sum, i) => sum + i.basis, 0);
    const totalGrow = line.reduce((sum, i) => sum + i.grow, 0);
    const extra = containerWidth - totalBasis;
    if (totalGrow === 0 || extra <= 0) return line.map((i) => i.basis);
    return line.map((i) => i.basis + (i.grow / totalGrow) * extra);
  });
}`,
    testCases: [
      {
        input: "[{150,1},{150,1},{150,1}], 300",
        expected: "[[150, 150], [300]]",
        label: "Items that don't fit wrap onto a new line, which grows independently",
      },
      {
        input: "[{100,1},{100,1}], 300",
        expected: "[[150, 150]]",
        label: "Items that all fit on one line never wrap, and share leftover space together",
      },
      {
        input: "[{200,0},{200,0},{200,0}], 400",
        expected: "[[200, 200], [200]]",
        label: "grow: 0 items still wrap correctly, they just never expand past their basis",
      },
    ],
    isPremium: false,
    orderIndex: 37,
  },
  {
    slug: "full-paint-order-resolver",
    conceptSlug: "positioning-stacking-contexts",
    title: "Build a Full Paint-Order Resolver",
    description: `Extend a "topmost element" check into a full paint-order resolver — the same tool a DevTools "3D view" of stacking contexts is built on.

## The problem

Knowing which single element is on top isn't enough to debug a real layering bug — you need the *entire* back-to-front order, so you can see exactly where an unexpected element sits relative to everything else.

## The idea

Every element's position in the final paint order is decided by its full z-index path from the root down to itself, compared level by level — exactly like specificity tuples. Sorting all elements by that path (with array position breaking any exact tie) produces the complete bottom-to-top order in one pass.

## Your task

Write \`paintOrder(elements)\`, where each element is \`{ id, zIndex, parentId }\`. Return an array of every \`id\`, sorted from bottom (painted first) to top (painted last).

\`\`\`js
paintOrder([
  { id: "a", zIndex: 1, parentId: null },
  { id: "a-inner", zIndex: 9999, parentId: "a" },
  { id: "b", zIndex: 2, parentId: null },
])
// → ["a", "a-inner", "b"] — a-inner paints above a (its own context), but the whole "a" branch stays below "b"
\`\`\`

Once this passes, imagine rendering each id as a labeled layer in a 3D stack view, exactly matching what a real stacking-context DevTools panel visualizes.`,
    starterCode: `function paintOrder(elements) {
  // elements: [{ id, zIndex, parentId }]
}`,
    solutionCode: `function paintOrder(elements) {
  const byId = Object.fromEntries(elements.map((el, index) => [el.id, { ...el, index }]));

  function pathOf(id) {
    const el = byId[id];
    const parentPath = el.parentId != null ? pathOf(el.parentId) : [];
    return [...parentPath, el.zIndex];
  }

  function comparePaths(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }

  return elements
    .map((el) => ({ id: el.id, path: pathOf(el.id), index: byId[el.id].index }))
    .sort((a, b) => comparePaths(a.path, b.path) || a.index - b.index)
    .map((el) => el.id);
}`,
    testCases: [
      {
        input: "a(z:1) > a-inner(z:9999), sibling b(z:2)",
        expected: "['a', 'a-inner', 'b']",
        label: "A trapped high z-index still paints above its own ancestor, but the whole branch stays below the sibling context",
      },
      {
        input: "three top-level siblings with zIndex 3, 1, 2",
        expected: "the one with zIndex 1 first, then 2, then 3",
        label: "Top-level siblings sort purely by their own zIndex",
      },
      {
        input: "two top-level siblings with equal zIndex",
        expected: "the earlier one in the input array first",
        label: "Equal zIndex at the same level preserves source order",
      },
    ],
    isPremium: true,
    orderIndex: 38,
  },
  {
    slug: "multi-container-style-resolver",
    conceptSlug: "responsive-design-container-queries",
    title: "Build a Multi-Container Style Resolver",
    description: `Extend a single-container breakpoint matcher to a whole page's worth of independently-sized containers at once — the same lookup a container-query-aware style engine performs on every render.

## The problem

A real page has multiple named containers — a sidebar, a main column, a card grid — each with its own independent width, and each one's components need their own breakpoint resolved independently of the others.

## The idea

Given a map of container widths and a matching map of each container's breakpoint queries, resolve each container's matching value separately using the same "largest minWidth ≤ containerWidth" rule as a single container query.

## Your task

Write \`resolveComponentStyles(containerWidths, queriesByContainer)\`, where \`containerWidths = { [name]: width }\` and \`queriesByContainer = { [name]: { minWidth, value }[] }\`. Return \`{ [name]: resolvedValue }\`.

\`\`\`js
resolveComponentStyles(
  { sidebar: 280, main: 900 },
  {
    sidebar: [{ minWidth: 0, value: "compact" }, { minWidth: 300, value: "wide" }],
    main: [{ minWidth: 0, value: "compact" }, { minWidth: 700, value: "wide" }],
  },
)
// → { sidebar: "compact", main: "wide" } — same query set, different result per container's own width
\`\`\``,
    starterCode: `function resolveComponentStyles(containerWidths, queriesByContainer) {
  // containerWidths: { [name]: width }, queriesByContainer: { [name]: { minWidth, value }[] }
}`,
    solutionCode: `function resolveContainerValue(containerWidth, queries) {
  const sorted = [...queries].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const q of sorted) {
    if (q.minWidth <= containerWidth) match = q;
    else break;
  }
  return match.value;
}

function resolveComponentStyles(containerWidths, queriesByContainer) {
  const result = {};
  for (const [name, width] of Object.entries(containerWidths)) {
    result[name] = resolveContainerValue(width, queriesByContainer[name]);
  }
  return result;
}`,
    testCases: [
      {
        input: "{sidebar:280, main:900}, matching per-container query sets",
        expected: "{ sidebar: 'compact', main: 'wide' }",
        label: "The same query shape resolves differently per container, based on each one's own width",
      },
      {
        input: "a single container below every breakpoint's minWidth",
        expected: "the minWidth: 0 fallback value",
        label: "Falls back to the smallest breakpoint when a container is narrower than every other one",
      },
      {
        input: "three independent containers with three different widths",
        expected: "three independently correct resolved values",
        label: "Each container in the map is resolved independently of the others",
      },
    ],
    isPremium: true,
    orderIndex: 39,
  },
  {
    slug: "multi-property-theme-resolver",
    conceptSlug: "custom-properties-theming",
    title: "Build a Multi-Property Theme Resolver",
    description: `Extend a single custom-property lookup into a full theme resolver — computing every themed value a component actually needs in one call.

## The problem

A real themed component doesn't read just one custom property — it reads several (\`--accent-color\`, \`--surface-bg\`, \`--text-color\`), each independently walking up the same cascade to find its nearest declaration.

## The idea

Resolving a whole theme for a component is just resolving each property name independently, using the same "check this element, then walk up ancestors" lookup — bundled into a single call that returns every requested property's resolved value at once.

## Your task

Write \`resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks)\`, where \`tree\` is \`{ id, parentId }[]\`, \`declarationsByElement[elementId]\` is \`{ [propName]: value }\`, and \`fallbacks\` is \`{ [propName]: value }\`. Return \`{ [propName]: resolvedValue }\` for every name in \`propNames\`.

\`\`\`js
resolveTheme("card", ["--accent", "--surface-bg"], tree, declarations, { "--accent": "black", "--surface-bg": "white" })
// → { "--accent": "cyan", "--surface-bg": "white" } — one resolved, one falls back
\`\`\``,
    starterCode: `function resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks) {
  // tree: { id, parentId }[]
}`,
    solutionCode: `function resolveVar(elementId, propName, tree, declarationsByElement, fallback) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  let current = elementId;
  while (current != null) {
    const decl = declarationsByElement[current];
    if (decl && propName in decl) return decl[propName];
    current = byId[current]?.parentId ?? null;
  }
  return fallback;
}

function resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks) {
  const result = {};
  for (const propName of propNames) {
    result[propName] = resolveVar(elementId, propName, tree, declarationsByElement, fallbacks[propName]);
  }
  return result;
}`,
    testCases: [
      {
        input: "'card' asking for --accent (declared on an ancestor) and --surface-bg (declared nowhere)",
        expected: "{ '--accent': ancestor's value, '--surface-bg': the fallback }",
        label: "Resolves each requested property independently, mixing found and fallback results",
      },
      {
        input: "'card' declares --accent itself, an ancestor also declares it",
        expected: "card's own value wins for --accent",
        label: "The element's own declaration takes priority over any ancestor's, per property",
      },
      {
        input: "no propNames requested",
        expected: "{}",
        label: "Requesting zero properties returns an empty result object",
      },
    ],
    isPremium: true,
    orderIndex: 40,
  },
  {
    slug: "form-validity-watcher",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    title: "Build a Form Validity Watcher",
    description: `Extend a \`:has()\`-style descendant check into a real utility — scanning every form on a page and flagging the ones that need attention.

## The problem

\`form:has(:invalid)\` is a single-form check — a real page-level validity watcher needs to scan every form at once and report which ones currently have an invalid field somewhere inside them.

## The idea

Run the same "any descendant matching a predicate" check across a whole list of forms, collecting only the ids of the ones that match — exactly what a page-wide validation summary needs to highlight.

## Your task

Write \`formsNeedingAttention(forms)\`, where each form is \`{ id, tag: "form", children: [] }\` (children may nest arbitrarily deep, e.g. through fieldsets). Return the \`id\`s of every form containing at least one descendant with \`valid: false\`.

\`\`\`js
formsNeedingAttention([
  { id: "signup", tag: "form", children: [{ id: "email", valid: false }] },
  { id: "search", tag: "form", children: [{ id: "query", valid: true }] },
])
// → ["signup"]
\`\`\`

Once this passes, imagine wiring it to re-run on every input's blur event, highlighting exactly which forms on the page currently need the user's attention.`,
    starterCode: `function formsNeedingAttention(forms) {
  // forms: [{ id, tag: "form", children: [] }]
}`,
    solutionCode: `function hasDescendantMatching(node, predicate) {
  for (const child of node.children || []) {
    if (predicate(child)) return true;
    if (hasDescendantMatching(child, predicate)) return true;
  }
  return false;
}

function formsNeedingAttention(forms) {
  return forms
    .filter((form) => hasDescendantMatching(form, (n) => n.valid === false))
    .map((form) => form.id);
}`,
    testCases: [
      {
        input: "one form with an invalid field, one form fully valid",
        expected: "['signup']",
        label: "Only forms with at least one invalid descendant are returned",
      },
      {
        input: "a form with an invalid field nested inside two levels of fieldsets",
        expected: "that form's id is included",
        label: "Detects an invalid field regardless of nesting depth",
      },
      {
        input: "no forms have any invalid descendants",
        expected: "[]",
        label: "Returns an empty array when every form is fully valid",
      },
    ],
    isPremium: true,
    orderIndex: 41,
  },
  {
    slug: "animation-cost-linter",
    conceptSlug: "animation-performance",
    title: "Build an Animation Cost Linter",
    description: `Extend a single animation-cost classifier into a linter that scans a whole stylesheet's transition rules and flags the expensive ones before they ship.

## The problem

A single \`transition: top 300ms, transform 300ms\` rule looks harmless at a glance, but the \`top\` alone is enough to force Layout on every frame — exactly the kind of rule a linter should catch automatically, before it causes jank on a lower-end device.

## The idea

Classify every rule's animated properties using the same worst-tier logic as the single-property classifier, then report only the rules whose worst tier is \`"layout"\` — the ones actually worth flagging.

## Your task

Write \`lintAnimatedRules(rules)\`, where each rule is \`{ selector, properties: string[] }\`. Return the \`selector\`s of every rule classified as \`"layout"\`.

\`\`\`js
lintAnimatedRules([
  { selector: ".modal", properties: ["transform", "opacity"] },
  { selector: ".drawer", properties: ["left", "opacity"] },
])
// → [".drawer"] — .modal is Composite-only, .drawer's "left" forces Layout
\`\`\`

Once this passes, imagine running it as a build-time check across a real stylesheet's \`transition\` declarations, failing CI on any rule that would force Layout on every animated frame.`,
    starterCode: `function lintAnimatedRules(rules) {
  // rules: [{ selector, properties: string[] }]
}`,
    solutionCode: `const TIERS = {
  transform: "compositor",
  opacity: "compositor",
  color: "paint",
  "background-color": "paint",
  "box-shadow": "paint",
  "border-color": "paint",
  width: "layout",
  height: "layout",
  top: "layout",
  left: "layout",
  margin: "layout",
  "font-size": "layout",
};
const RANK = { compositor: 0, paint: 1, layout: 2 };

function classifyAnimationCost(properties) {
  let worst = "compositor";
  for (const prop of properties) {
    const tier = TIERS[prop] ?? "layout";
    if (RANK[tier] > RANK[worst]) worst = tier;
  }
  return worst;
}

function lintAnimatedRules(rules) {
  return rules
    .filter((rule) => classifyAnimationCost(rule.properties) === "layout")
    .map((rule) => rule.selector);
}`,
    testCases: [
      {
        input: "[{'.modal',['transform','opacity']}, {'.drawer',['left','opacity']}]",
        expected: "['.drawer']",
        label: "Only the rule with a layout-triggering property is flagged",
      },
      {
        input: "every rule only animates transform/opacity",
        expected: "[]",
        label: "Returns an empty array when nothing in the stylesheet forces Layout",
      },
      {
        input: "a rule animating color and box-shadow only",
        expected: "not included in the result",
        label: "Paint-only rules are not flagged — only 'layout'-tier rules are",
      },
    ],
    isPremium: true,
    orderIndex: 42,
  },
  // ── Phase 10 (Feature 45) — TypeScript Concepts ───────────────────────────
  {
    slug: "runtime-shape-validator",
    conceptSlug: "basic-types-inference",
    title: "Build a Runtime Shape Validator",
    description: `Extend the "prove it before you use it" idea behind \`unknown\` into validating a whole object shape — exactly what's needed before trusting a JSON API response.

## The problem

A JSON response is typed \`unknown\` (or worse, silently trusted as \`any\`) the moment it arrives — using any of its fields without checking first is exactly the class of bug \`unknown\` exists to prevent.

## The idea

Given a simple schema describing each field's expected \`typeof\`, check every field on the incoming value before returning it — if anything is missing or has the wrong type, the whole value is rejected rather than partially trusted.

## Your task

Write \`validateShape(value, schema)\`, where \`schema\` is \`{ fieldName: "string" | "number" | "boolean" }\`. Return \`value\` unchanged if every field matches, otherwise \`null\`.

\`\`\`js
validateShape({ name: "Ada", age: 36 }, { name: "string", age: "number" })
// → { name: "Ada", age: 36 }
validateShape({ name: "Ada" }, { name: "string", age: "number" })
// → null — missing "age"
\`\`\`

Once this passes, imagine wiring it into a real \`fetch\` wrapper that rejects malformed API responses before they ever reach application code.`,
    starterCode: `function validateShape(value, schema) {
  // return value unchanged if every schema field matches, else null
}`,
    solutionCode: `function validateShape(value, schema) {
  if (typeof value !== "object" || value === null) return null;
  for (const key of Object.keys(schema)) {
    if (typeof value[key] !== schema[key]) return null;
  }
  return value;
}`,
    testCases: [
      {
        input: "{ name: 'Ada', age: 36 }, { name: 'string', age: 'number' }",
        expected: "{ name: 'Ada', age: 36 }",
        label: "A value matching every field's type passes through narrowed",
      },
      {
        input: "{ name: 'Ada' }, { name: 'string', age: 'number' }",
        expected: "null",
        label: "A missing field fails validation",
      },
      {
        input: "{ name: 'Ada', age: '36' }, { name: 'string', age: 'number' }",
        expected: "null",
        label: "A field with the wrong runtime type fails validation",
      },
      {
        input: "null, { name: 'string' }",
        expected: "null",
        label: "null never satisfies any schema",
      },
    ],
    isPremium: false,
    orderIndex: 43,
  },
  {
    slug: "config-source-merger",
    conceptSlug: "interfaces-vs-type-aliases",
    title: "Build a Layered Config Merger",
    description: `Extend declaration merging's "combine, don't silently overwrite" idea into a realistic layered config loader — defaults, then environment overrides, then CLI flags.

## The problem

Merging config from several sources (defaults → env → CLI) usually means later sources should win for a single value like \`timeout\`, but list-like settings like \`plugins\` should accumulate across sources instead of the last one wiping out the rest.

## The idea

Walk the sources in order. For a plain scalar value, the later source simply overwrites the earlier one. For an array value present in both the accumulated result and the new source, concatenate and de-duplicate instead of overwriting.

## Your task

Write \`mergeConfigSources(sources)\`, where \`sources\` is an array of plain config objects applied in order:

\`\`\`js
mergeConfigSources([{ timeout: 1000 }, { timeout: 5000 }])
// → { timeout: 5000 }
mergeConfigSources([{ plugins: ["a"] }, { plugins: ["b"] }])
// → { plugins: ["a", "b"] }
\`\`\`

Once this passes, imagine loading \`defaults.json\`, \`.env\`-derived overrides, and CLI flags through the same function, in that order, to produce one final config.`,
    starterCode: `function mergeConfigSources(sources) {
  // scalars: later source wins. arrays: concatenate + de-duplicate.
}`,
    solutionCode: `function mergeConfigSources(sources) {
  const result = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (Array.isArray(value) && Array.isArray(result[key])) {
        result[key] = [...new Set([...result[key], ...value])];
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}`,
    testCases: [
      {
        input: "[{ timeout: 1000 }, { timeout: 5000 }]",
        expected: "{ timeout: 5000 }",
        label: "A scalar value is overwritten by the later source",
      },
      {
        input: "[{ plugins: ['a'] }, { plugins: ['b'] }]",
        expected: "{ plugins: ['a', 'b'] }",
        label: "Array values accumulate across sources instead of overwriting",
      },
      {
        input: "[{ plugins: ['a', 'b'] }, { plugins: ['b', 'c'] }]",
        expected: "{ plugins: ['a', 'b', 'c'] }",
        label: "Accumulated array values are de-duplicated",
      },
      {
        input: "[{ debug: false }, { debug: true }]",
        expected: "{ debug: true }",
        label: "A boolean scalar follows the same later-wins rule as any other scalar",
      },
    ],
    isPremium: false,
    orderIndex: 44,
  },
  {
    slug: "pluck-with-key-constraint",
    conceptSlug: "generics",
    title: "Build a Constrained Property Plucker",
    description: `Extend the generic-constraint idea (\`K extends keyof T\`) into a runtime plucker that rejects a key the object doesn't actually have, instead of silently returning \`undefined\`.

## The problem

\`obj[key]\` never fails in JavaScript, even when \`key\` isn't a real property — it just quietly returns \`undefined\`, hiding what would be a compile error in TypeScript (\`K extends keyof T\` catching a typo'd key at the call site).

## The idea

Before reading anything, check that every requested key genuinely exists on the object — if any don't, throw and name them, rather than let a typo pass through as a silent \`undefined\`.

## Your task

Write \`pluck(obj, keys)\`. A single string \`keys\` returns that one value; an array of keys returns an object of just those keys. Any key not present on \`obj\` should throw.

\`\`\`js
pluck({ name: "Ada", age: 36 }, "name")            // "Ada"
pluck({ name: "Ada", age: 36 }, ["name", "age"])   // { name: "Ada", age: 36 }
pluck({ name: "Ada" }, ["name", "email"])          // throws — "email" isn't a real key
\`\`\``,
    starterCode: `function pluck(obj, keys) {
  // single key -> that value. array of keys -> an object of just those keys.
  // throw if any requested key isn't a real property of obj.
}`,
    solutionCode: `function pluck(obj, keys) {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const missing = keyList.filter((k) => !Object.prototype.hasOwnProperty.call(obj, k));
  if (missing.length > 0) {
    throw new Error(\`Not a key of the given object: \${missing.join(", ")}\`);
  }
  if (!Array.isArray(keys)) return obj[keys];
  const result = {};
  for (const k of keyList) result[k] = obj[k];
  return result;
}`,
    testCases: [
      {
        input: "{ name: 'Ada', age: 36 }, 'name'",
        expected: "'Ada'",
        label: "A single valid key returns that key's value directly",
      },
      {
        input: "{ name: 'Ada', age: 36 }, ['name', 'age']",
        expected: "{ name: 'Ada', age: 36 }",
        label: "An array of valid keys returns an object of just those keys",
      },
      {
        input: "{ name: 'Ada' }, ['name', 'email']",
        expected: "throws an Error naming 'email'",
        label: "A nonexistent key in the array throws instead of returning undefined",
      },
      {
        input: "{ name: 'Ada' }, 'email'",
        expected: "throws an Error naming 'email'",
        label: "A single nonexistent key also throws",
      },
    ],
    isPremium: true,
    orderIndex: 45,
  },
  {
    slug: "record-defaults-builder",
    conceptSlug: "utility-types",
    title: "Build a Record-Style Defaults Generator",
    description: `\`Record<K, V>\` builds an object type from a list of keys and one value type — this builds the same shape of object from an actual list of keys, at runtime.

## The problem

Initializing a config or state object with the same default for every one of a known set of keys (\`{ admin: [], editor: [], viewer: [] }\`) usually means writing each key out by hand, one line at a time.

## The idea

Given a list of keys and a factory function, generate one entry per key by calling the factory — mirroring how \`Record<K, V>\` maps every key in \`K\` to the same value type \`V\`, except here each value can be freshly computed rather than shared by reference.

## Your task

Write \`createRecordDefaults(keys, factory)\`:

\`\`\`js
createRecordDefaults(["admin", "editor", "viewer"], () => [])
// → { admin: [], editor: [], viewer: [] }
createRecordDefaults(["a", "b"], (key) => key.toUpperCase())
// → { a: "A", b: "B" }
\`\`\`

Once this passes, imagine using it to build per-role permission lists or per-route default state from a single source list of keys.`,
    starterCode: `function createRecordDefaults(keys, factory) {
  // return an object with one entry per key, value = factory(key)
}`,
    solutionCode: `function createRecordDefaults(keys, factory) {
  const result = {};
  for (const key of keys) {
    result[key] = factory(key);
  }
  return result;
}`,
    testCases: [
      {
        input: "['admin', 'editor', 'viewer'], () => []",
        expected: "{ admin: [], editor: [], viewer: [] }",
        label: "Every key gets its own freshly-generated default value",
      },
      {
        input: "['a', 'b'], (key) => key.toUpperCase()",
        expected: "{ a: 'A', b: 'B' }",
        label: "The factory receives each key and can compute a value from it",
      },
      {
        input: "[], () => 0",
        expected: "{}",
        label: "An empty key list produces an empty object",
      },
    ],
    isPremium: true,
    orderIndex: 46,
  },
  {
    slug: "format-value-safely",
    conceptSlug: "type-narrowing",
    title: "Build a Narrowing-Based Value Formatter",
    description: `Extend a chain of narrowing checks into a small, safe "pretty-print anything" utility — the kind of thing a real logger reaches for constantly.

## The problem

A generic logging utility receives values of every shape — strings, numbers, \`null\`, arrays, plain objects — and formatting them all the same way (\`String(value)\`) produces useless output like \`[object Object]\`.

## The idea

Narrow the value through each case in turn — \`null\`/\`undefined\` first (since \`typeof null\` lies and says \`"object"\`), then string, number/boolean, array, then plain object — formatting each shape appropriately, recursing into arrays and objects.

## Your task

Write \`formatValue(value)\`, returning a readable string:

\`\`\`js
formatValue("hi")             // '"hi"'
formatValue(42)                // "42"
formatValue(null)              // "null"
formatValue([1, "a", null])    // '[1, "a", null]'
formatValue({ a: 1, b: "x" })  // '{ a: 1, b: "x" }'
\`\`\``,
    starterCode: `function formatValue(value) {
  // narrow through null/undefined, string, number/boolean, array, object
}`,
    solutionCode: `function formatValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return \`"\${value}"\`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return \`[\${value.map(formatValue).join(", ")}]\`;
  if (typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => \`\${k}: \${formatValue(v)}\`);
    return \`{ \${entries.join(", ")} }\`;
  }
  return String(value);
}`,
    testCases: [
      { input: "'hi'", expected: '\'"hi"\'', label: "A string is wrapped in quotes to distinguish it from other output" },
      { input: "42", expected: "'42'", label: "A number is formatted as-is" },
      { input: "null", expected: "'null'", label: "null is narrowed correctly, not confused with an object" },
      { input: "[1, 'a', null]", expected: "'[1, \"a\", null]'", label: "An array recursively formats each of its own elements" },
      { input: "{ a: 1, b: 'x' }", expected: "'{ a: 1, b: \"x\" }'", label: "A plain object recursively formats each of its values" },
    ],
    isPremium: true,
    orderIndex: 47,
  },
  {
    slug: "mini-redux-store",
    conceptSlug: "discriminated-unions",
    title: "Build a Mini Redux-Style Store",
    description: `Wire a discriminated-union reducer into a real, minimal store — \`getState\`, \`dispatch\`, and \`subscribe\`, the same three-method core every Redux-style store is built from.

## The problem

A reducer alone only computes the *next* state from the current one — it doesn't hold onto that state between calls, or notify anything when it changes.

## The idea

Keep the current state in a closure. \`dispatch\` runs the reducer against it, stores the result, and notifies every subscribed listener with the new state. \`subscribe\` registers a listener and returns an unsubscribe function.

## Your task

Write \`createStore(reducer, initialState)\`, returning \`{ getState(), dispatch(action), subscribe(listener) }\`:

\`\`\`js
const store = createStore((state, action) =>
  action.type === "increment" ? state + 1 : state, 0);
store.subscribe((state) => console.log("now:", state));
store.dispatch({ type: "increment" }); // logs "now: 1"
store.getState(); // 1
\`\`\``,
    starterCode: `function createStore(reducer, initialState) {
  // return { getState(), dispatch(action), subscribe(listener) }
  // subscribe(listener) should return an unsubscribe function
}`,
    solutionCode: `function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener(state));
      return state;
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },
  };
}`,
    testCases: [
      {
        input: "createStore(reducer, 0).getState()",
        expected: "0",
        label: "getState() reflects the initial state before any dispatch",
      },
      {
        input: "dispatch({ type: 'increment' }) against state 0",
        expected: "1",
        label: "dispatch runs the reducer and updates the stored state",
      },
      {
        input: "a subscribed listener, after one dispatch",
        expected: "called once with the new state",
        label: "subscribe registers a listener that's notified on dispatch",
      },
      {
        input: "subscribe(...)() then dispatch again",
        expected: "the unsubscribed listener is not called again",
        label: "The function returned by subscribe unsubscribes that listener",
      },
    ],
    isPremium: true,
    orderIndex: 48,
  },
  {
    slug: "deep-map-values",
    conceptSlug: "conditional-mapped-types",
    title: "Build a Deep Mapped-Value Transformer",
    description: `Extend a single-level mapped-type-style transformer into a recursive one — the runtime equivalent of a recursive conditional/mapped type like a hand-rolled \`DeepPartial\`.

## The problem

A flat \`mapValues\` only transforms an object's top-level values — a nested object's inner values pass through completely untouched, exactly the gap a recursive mapped type is needed to close.

## The idea

For each key, if the value is itself a plain object, recurse into it with the same transform; otherwise apply \`transform\` directly, exactly like a mapped type conditionally recursing into a nested object type instead of transforming it directly.

## Your task

Write \`deepMapValues(obj, transform)\`:

\`\`\`js
deepMapValues({ a: 1, b: { c: 2, d: 3 } }, (v) => v * 2)
// → { a: 2, b: { c: 4, d: 6 } }
\`\`\`

Once this passes, imagine using it to deep-freeze or deep-validate an arbitrarily nested config object with one function instead of one per nesting level.`,
    starterCode: `function deepMapValues(obj, transform) {
  // recurse into nested plain objects; apply transform to every leaf value
}`,
    solutionCode: `function deepMapValues(obj, transform) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = deepMapValues(value, transform);
    } else {
      result[key] = transform(value, key);
    }
  }
  return result;
}`,
    testCases: [
      {
        input: "{ a: 1, b: { c: 2, d: 3 } }, (v) => v * 2",
        expected: "{ a: 2, b: { c: 4, d: 6 } }",
        label: "Nested object values are transformed recursively, not skipped",
      },
      {
        input: "{ a: 1 }, (v) => v * 2",
        expected: "{ a: 2 }",
        label: "A flat object with no nesting still transforms correctly",
      },
      {
        input: "{}, (v) => v",
        expected: "{}",
        label: "An empty object maps to an empty object",
      },
      {
        input: "{ a: { b: { c: 1 } } }, (v) => v + 1",
        expected: "{ a: { b: { c: 2 } } }",
        label: "Recursion goes as deep as the nesting actually goes, not just one level",
      },
    ],
    isPremium: true,
    orderIndex: 49,
  },
  {
    slug: "brand-and-verify",
    conceptSlug: "template-literal-branded-types",
    title: "Build a Runtime Brand Checker",
    description: `TypeScript's brand is erased at compile time — this rebuilds the same nominal-typing idea as a real runtime tag, so a mismatched brand fails loudly instead of silently.

## The problem

Two values that are structurally identical (both just a string, or both just a wrapped primitive) can be passed to the wrong place with no error, if nothing distinguishes what they're actually *for*.

## The idea

Wrap a raw value together with a brand name tag. A value can only be unwrapped by code that names the exact matching brand — unwrapping with the wrong brand name fails, the same way TypeScript's compile-time brand would refuse an incompatible assignment.

## Your task

Write \`brand(value, brandName)\`, \`isBranded(branded, brandName)\`, and \`unwrapBrand(branded, brandName)\` (throws if the brand doesn't match):

\`\`\`js
const userId = brand("u_1", "UserId");
isBranded(userId, "UserId")   // true
isBranded(userId, "OrderId")  // false
unwrapBrand(userId, "UserId") // "u_1"
unwrapBrand(userId, "OrderId") // throws
\`\`\``,
    starterCode: `function brand(value, brandName) {
  // wrap value with a brand tag
}
function isBranded(branded, brandName) {
  // true only if branded carries exactly this brandName
}
function unwrapBrand(branded, brandName) {
  // return the raw value if the brand matches, else throw
}`,
    solutionCode: `function brand(value, brandName) {
  return { value, __brand: brandName };
}
function isBranded(branded, brandName) {
  return !!branded && typeof branded === "object" && branded.__brand === brandName;
}
function unwrapBrand(branded, brandName) {
  if (!isBranded(branded, brandName)) {
    throw new Error(\`Expected a value branded "\${brandName}"\`);
  }
  return branded.value;
}`,
    testCases: [
      {
        input: "isBranded(brand('u_1', 'UserId'), 'UserId')",
        expected: "true",
        label: "A value checked against its own brand name matches",
      },
      {
        input: "isBranded(brand('u_1', 'UserId'), 'OrderId')",
        expected: "false",
        label: "A value checked against a different brand name doesn't match",
      },
      {
        input: "unwrapBrand(brand('u_1', 'UserId'), 'UserId')",
        expected: "'u_1'",
        label: "Unwrapping with the matching brand returns the raw value",
      },
      {
        input: "unwrapBrand(brand('u_1', 'UserId'), 'OrderId')",
        expected: "throws an Error",
        label: "Unwrapping with the wrong brand throws instead of returning the value anyway",
      },
    ],
    isPremium: true,
    orderIndex: 50,
  },
  {
    slug: "semantic-landmark-outliner",
    conceptSlug: "aria-roles-and-semantic-html",
    title: "Build a Page Landmark & Heading Outliner",
    description: `Extends the tag-chooser into a full page auditor — the same lookup that picks a section's semantic tag, plus a check that its heading levels don't skip a step.

## The problem

A page's landmark structure and its heading hierarchy are both things screen reader users navigate by directly — a skipped heading level (jumping from an h2 straight to an h4) breaks that navigation just as much as a missing landmark does.

## The idea

Map every section's purpose to its correct tag with the same table from the core lookup, then walk the sections in order tracking the last heading level seen — any section whose heading level jumps by more than one from the previous heading is a violation.

## Your task

Write \`buildLandmarkOutline(sections)\`, where each section is \`{ purpose, headingLevel }\`, returning \`{ outline, violations }\`:

\`\`\`js
buildLandmarkOutline([
  { purpose: "page banner/header", headingLevel: 1 },
  { purpose: "main content region", headingLevel: 2 },
  { purpose: "sidebar/complementary content", headingLevel: 4 },
])
// → { outline: [...], violations: ["Section 2 skips a heading level (from h2 to h4)"] }
\`\`\``,
    starterCode: `function chooseSemanticTag(purpose) {
  // same lookup as the Challenge — return the correct tag, or "div"
}
function buildLandmarkOutline(sections) {
  // map each section to { tag, headingLevel }, then flag any skipped heading level
}`,
    solutionCode: `function chooseSemanticTag(purpose) {
  const map = {
    "primary navigation": "nav",
    "page banner/header": "header",
    "page footer": "footer",
    "main content region": "main",
    "sidebar/complementary content": "aside",
    "self-contained article": "article",
    "navigates to another page/URL": "a",
    "performs an action on the current page": "button",
  };
  return map[purpose] ?? "div";
}
function buildLandmarkOutline(sections) {
  const outline = sections.map((s) => ({
    tag: chooseSemanticTag(s.purpose),
    headingLevel: s.headingLevel ?? null,
  }));
  const violations = [];
  let lastLevel = 0;
  outline.forEach((entry, i) => {
    if (entry.headingLevel != null) {
      if (entry.headingLevel > lastLevel + 1) {
        violations.push(\`Section \${i} skips a heading level (from h\${lastLevel} to h\${entry.headingLevel})\`);
      }
      lastLevel = entry.headingLevel;
    }
  });
  return { outline, violations };
}`,
    testCases: [
      {
        input: '[{purpose:"page banner/header",headingLevel:1},{purpose:"main content region",headingLevel:2},{purpose:"sidebar/complementary content",headingLevel:4}]',
        expected: '{outline:[{tag:"header",headingLevel:1},{tag:"main",headingLevel:2},{tag:"aside",headingLevel:4}],violations:["Section 2 skips a heading level (from h2 to h4)"]}',
        label: "A heading jump from h2 to h4 is flagged as a skipped level",
      },
      {
        input: '[{purpose:"page banner/header",headingLevel:1},{purpose:"main content region",headingLevel:2},{purpose:"self-contained article",headingLevel:3}]',
        expected: '{outline:[{tag:"header",headingLevel:1},{tag:"main",headingLevel:2},{tag:"article",headingLevel:3}],violations:[]}',
        label: "Sequential heading levels with no gaps produce no violations",
      },
    ],
    isPremium: false,
    orderIndex: 51,
  },
  {
    slug: "media-accessibility-auditor",
    conceptSlug: "accessible-images-media",
    title: "Build a Media Accessibility Auditor",
    description: `Extends the alt-text decision into a full auditor over a whole page's media — one that reports every problem instead of crashing on the first one.

## The problem

A real page has many images, videos, and audio clips at once — auditing them means checking every item against its own rule (alt text for images, captions for video, a transcript for audio) and collecting every failure, not stopping at the first.

## The idea

Reuse the alt-text decision for images, but catch its thrown error and convert it into a violation message instead of letting it crash the whole audit. Apply a parallel rule for video (needs captions) and audio (needs a transcript).

## Your task

Write \`auditMedia(items)\`, where each item is \`{ type, isDecorative, description, hasCaptions, hasTranscript }\`, returning an array of violation strings:

\`\`\`js
auditMedia([
  { type: "image", isDecorative: false, description: "Team photo" },
  { type: "image", isDecorative: false },
  { type: "video", hasCaptions: false },
])
// → ["Item 1: Meaningful images must have alt text", "Item 2: video is missing captions"]
\`\`\``,
    starterCode: `function getAltText(image) {
  // same as the Challenge
}
function auditMedia(items) {
  // check every item against its type's rule, collecting violation strings by index
}`,
    solutionCode: `function getAltText(image) {
  if (image.isDecorative) return "";
  if (!image.description || !image.description.trim()) {
    throw new Error("Meaningful images must have alt text");
  }
  return image.description.trim();
}
function auditMedia(items) {
  const violations = [];
  items.forEach((item, i) => {
    if (item.type === "image") {
      try {
        getAltText(item);
      } catch (e) {
        violations.push(\`Item \${i}: \${e.message}\`);
      }
    } else if (item.type === "video" && !item.hasCaptions) {
      violations.push(\`Item \${i}: video is missing captions\`);
    } else if (item.type === "audio" && !item.hasTranscript) {
      violations.push(\`Item \${i}: audio is missing a transcript\`);
    }
  });
  return violations;
}`,
    testCases: [
      {
        input: '[{type:"image",isDecorative:false,description:"Team photo"},{type:"image",isDecorative:false},{type:"video",hasCaptions:false},{type:"audio",hasTranscript:true}]',
        expected: '["Item 1: Meaningful images must have alt text","Item 2: video is missing captions"]',
        label: "Only the items that actually fail their rule are reported, by index",
      },
      {
        input: '[{type:"image",isDecorative:true},{type:"video",hasCaptions:true},{type:"audio",hasTranscript:true}]',
        expected: "[]",
        label: "A fully compliant media list produces no violations",
      },
    ],
    isPremium: false,
    orderIndex: 52,
  },
  {
    slug: "theme-contrast-auditor",
    conceptSlug: "color-contrast-visual-accessibility",
    title: "Build a Theme Contrast Auditor",
    description: `Extends the single contrast-ratio calculation into a full theme auditor — checking every foreground/background pair a design system defines against WCAG AA at once.

## The problem

A design system might define a dozen text/background color pairs — checking each individually is tedious and easy to fall behind on as the palette evolves.

## The idea

Reuse the same relative-luminance-based contrast ratio calculation, run it across a whole list of named pairs, and report each pair's ratio and pass/fail against its own required threshold (3:1 for large text, 4.5:1 otherwise).

## Your task

Write \`auditThemeContrast(pairs)\`, where each pair is \`{ name, foreground, background, isLargeText }\`, returning an array of \`{ name, ratio, passes }\`:

\`\`\`js
auditThemeContrast([
  { name: "body-text", foreground: "#000000", background: "#FFFFFF", isLargeText: false },
])
// → [{ name: "body-text", ratio: 21, passes: true }]
\`\`\``,
    starterCode: `function getContrastRatio(hex1, hex2) {
  // same as the Challenge
}
function auditThemeContrast(pairs) {
  // compute ratio + pass/fail for every named pair
}`,
    solutionCode: `function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}
function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
function auditThemeContrast(pairs) {
  return pairs.map((p) => {
    const ratio = getContrastRatio(p.foreground, p.background);
    const required = p.isLargeText ? 3 : 4.5;
    return { name: p.name, ratio, passes: ratio >= required };
  });
}`,
    testCases: [
      {
        input: '[{name:"body-text",foreground:"#000000",background:"#FFFFFF",isLargeText:false},{name:"muted-text",foreground:"#777777",background:"#FFFFFF",isLargeText:false},{name:"muted-text-safe",foreground:"#767676",background:"#FFFFFF",isLargeText:false}]',
        expected: '[{name:"body-text",ratio:21,passes:true},{name:"muted-text",ratio:4.48,passes:false},{name:"muted-text-safe",ratio:4.54,passes:true}]',
        label: "A near-miss gray (#777777) fails AA by a hair while a slightly darker one (#767676) passes",
      },
    ],
    isPremium: false,
    orderIndex: 53,
  },
  {
    slug: "keyboard-focus-trap-navigator",
    conceptSlug: "keyboard-navigation-focus-management",
    title: "Build a Modal Focus-Trap Navigator",
    description: `Extends tab-order computation into a full focus trap — the object a real modal dialog would use to cycle Tab/Shift+Tab within itself.

## The problem

Computing the correct tab order is only half of a focus trap — the other half is cycling through it with wraparound, so Tab past the last element loops to the first instead of escaping the modal.

## The idea

Compute the real tab order once (reusing the same logic as the Challenge), then expose \`next\`/\`prev\` methods that move through that order and wrap around at both ends.

## Your task

Write \`createFocusTrap(elements)\`, returning \`{ getOrder(), next(currentId), prev(currentId) }\`:

\`\`\`js
const trap = createFocusTrap([
  { id: "a", domOrder: 0 },
  { id: "b", domOrder: 1 },
  { id: "c", domOrder: 2 },
]);
trap.next("c") // → "a" (wraps)
trap.prev("a") // → "c" (wraps)
\`\`\``,
    starterCode: `function computeTabOrder(elements) {
  // same as the Challenge
}
function createFocusTrap(elements) {
  // return { getOrder(), next(currentId), prev(currentId) } cycling with wraparound
}`,
    solutionCode: `function computeTabOrder(elements) {
  const positive = elements.filter((el) => el.tabIndex > 0);
  const zero = elements.filter((el) => !el.tabIndex || el.tabIndex === 0);
  positive.sort((a, b) => a.tabIndex - b.tabIndex || a.domOrder - b.domOrder);
  zero.sort((a, b) => a.domOrder - b.domOrder);
  return [...positive, ...zero].map((el) => el.id);
}
function createFocusTrap(elements) {
  const order = computeTabOrder(elements);
  return {
    getOrder() {
      return order;
    },
    next(currentId) {
      const idx = order.indexOf(currentId);
      if (idx === -1) return order[0] ?? null;
      return order[(idx + 1) % order.length];
    },
    prev(currentId) {
      const idx = order.indexOf(currentId);
      if (idx === -1) return order[order.length - 1] ?? null;
      return order[(idx - 1 + order.length) % order.length];
    },
  };
}`,
    testCases: [
      {
        input: 'createFocusTrap([{id:"a",domOrder:0},{id:"b",domOrder:1},{id:"c",domOrder:2}]).getOrder()',
        expected: '["a","b","c"]',
        label: "getOrder reuses the same tab-order computation as the Challenge",
      },
      {
        input: '...trap.next("c")',
        expected: '"a"',
        label: "next() at the last element wraps around to the first",
      },
      {
        input: '...trap.prev("a")',
        expected: '"c"',
        label: "prev() at the first element wraps around to the last",
      },
    ],
    isPremium: true,
    orderIndex: 54,
  },
  {
    slug: "form-error-summary-builder",
    conceptSlug: "accessible-forms",
    title: "Build a Form Error Summary",
    description: `Extends the single field-aria helper into a whole form's error summary — the accessible pattern of listing every error together and directing focus to the first one.

## The problem

Announcing each field's own error individually is necessary but not sufficient — on submit, a screen reader user benefits from one summary of everything wrong at once, with a clear place for focus to land first.

## The idea

Annotate every field with its own aria attributes (reusing the single-field logic), collect only the fields with errors into a summary list, and identify the first errored field as the target for focus after submission.

## Your task

Write \`buildFormErrorSummary(fields)\`, where each field is \`{ id, hasError, errorMessage }\`, returning \`{ fields, summary, focusFirstErrorId }\`:

\`\`\`js
buildFormErrorSummary([
  { id: "name", hasError: false },
  { id: "email", hasError: true, errorMessage: "Enter a valid email" },
])
// → { fields: [...], summary: [{ id: "email", message: "Enter a valid email" }], focusFirstErrorId: "email" }
\`\`\``,
    starterCode: `function buildFieldAria(field) {
  // same as the Challenge
}
function buildFormErrorSummary(fields) {
  // annotate every field, collect only errored ones into a summary, find the first error's id
}`,
    solutionCode: `function buildFieldAria(field) {
  if (field.hasError) {
    return { "aria-invalid": true, "aria-describedby": \`\${field.id}-error\` };
  }
  return { "aria-invalid": false, "aria-describedby": undefined };
}
function buildFormErrorSummary(fields) {
  const annotated = fields.map((f) => ({ ...f, aria: buildFieldAria(f) }));
  const summary = fields.filter((f) => f.hasError).map((f) => ({ id: f.id, message: f.errorMessage }));
  const focusFirstErrorId = summary.length ? summary[0].id : null;
  return { fields: annotated, summary, focusFirstErrorId };
}`,
    testCases: [
      {
        input: '[{id:"name",hasError:false},{id:"email",hasError:true,errorMessage:"Enter a valid email"},{id:"password",hasError:true,errorMessage:"Password too short"}]',
        expected: '{summary:[{id:"email",message:"Enter a valid email"},{id:"password",message:"Password too short"}],focusFirstErrorId:"email"}',
        label: "Summary lists only errored fields in order, and focus targets the first one",
      },
      {
        input: '[{id:"name",hasError:false}]',
        expected: '{summary:[],focusFirstErrorId:null}',
        label: "A form with no errors has an empty summary and a null focus target",
      },
    ],
    isPremium: true,
    orderIndex: 55,
  },
  {
    slug: "toast-announcer-service",
    conceptSlug: "aria-live-regions",
    title: "Build a Toast Announcer Service",
    description: `Extends the announcer queue into a real toast-notification service — with deduplication and a bounded visible list, the two concerns a raw queue alone doesn't handle.

## The problem

A raw announcer queue doesn't guard against the same message being pushed twice in a row, and a real toast UI can't display an unbounded number of toasts at once.

## The idea

Wrap the core announcer: skip pushing a message that's identical to the immediately preceding one, and on each "tick," pull the next announcement off the queue and keep only the most recent N in the visible list.

## Your task

Write \`createToastAnnouncerService(maxVisible)\`, returning \`{ push(message, politeness), tick() }\`:

\`\`\`js
const svc = createToastAnnouncerService(2);
svc.push("Saved");
svc.push("Saved"); // deduped, ignored
svc.push("Error occurred", "assertive");
svc.tick() // → [{ message: "Error occurred", politeness: "assertive" }]
\`\`\``,
    starterCode: `function createAnnouncer() {
  // same as the Challenge
}
function createToastAnnouncerService(maxVisible = 3) {
  // wrap createAnnouncer with consecutive-message dedupe and a bounded visible list
}`,
    solutionCode: `function createAnnouncer() {
  let assertiveQueue = [];
  let politeQueue = [];
  return {
    announce(message, politeness) {
      if (politeness === "assertive") assertiveQueue.push(message);
      else politeQueue.push(message);
    },
    flush() {
      if (assertiveQueue.length) return { message: assertiveQueue.shift(), politeness: "assertive" };
      if (politeQueue.length) return { message: politeQueue.shift(), politeness: "polite" };
      return null;
    },
  };
}
function createToastAnnouncerService(maxVisible = 3) {
  const announcer = createAnnouncer();
  let lastMessage = null;
  let visible = [];
  return {
    push(message, politeness = "polite") {
      if (message === lastMessage) return;
      lastMessage = message;
      announcer.announce(message, politeness);
    },
    tick() {
      const next = announcer.flush();
      if (!next) return visible;
      visible = [...visible, next].slice(-maxVisible);
      return visible;
    },
  };
}`,
    testCases: [
      {
        input: 'push("Saved"); push("Saved"); push("Error occurred","assertive"); tick()',
        expected: '[{message:"Error occurred",politeness:"assertive"}]',
        label: "A duplicate consecutive push is ignored, and assertive is announced first",
      },
      {
        input: "tick() again after the above",
        expected: '[{message:"Error occurred",politeness:"assertive"},{message:"Saved",politeness:"polite"}]',
        label: "The deduped polite message still gets delivered on the next tick",
      },
      {
        input: "a service created with maxVisible: 1, after 2 ticks",
        expected: '[{message:"B",politeness:"polite"}]',
        label: "The visible list is trimmed to the most recent maxVisible entries",
      },
    ],
    isPremium: true,
    orderIndex: 56,
  },
  {
    slug: "accessible-combobox-controller",
    conceptSlug: "accessible-component-patterns",
    title: "Build an Accessible Combobox Controller",
    description: `Extends the keyboard state machine into a full combobox controller — adding typeahead filtering and the aria-activedescendant id a real widget would render.

## The problem

A combobox's keyboard handling alone isn't the whole widget — filtering by what's typed, and computing which option id should be marked active for assistive tech, both have to stay in sync with the same state.

## The idea

Wrap the keyboard state machine with a filter step: typing narrows the option list and resets the highlighted option to the first match (or none, if nothing matches), while arrow-key navigation continues to operate over whatever the currently filtered list is.

## Your task

Write \`createComboboxController(options)\`, returning \`{ getState(), handleKey(key), setFilter(text), getActiveDescendantId() }\`:

\`\`\`js
const c = createComboboxController(["Apple", "Apricot", "Banana"]);
c.setFilter("ap");
c.getActiveDescendantId() // → "option-0"
\`\`\``,
    starterCode: `function handleComboboxKey(state, key) {
  // same as the Challenge
}
function createComboboxController(options) {
  // wrap handleComboboxKey with typeahead filtering + an active-descendant id
}`,
    solutionCode: `function handleComboboxKey(state, key) {
  const { options, activeIndex, isOpen } = state;
  if (!isOpen) {
    if (key === "ArrowDown") return { options, activeIndex: 0, isOpen: true };
    if (key === "ArrowUp") return { options, activeIndex: options.length - 1, isOpen: true };
    return { ...state };
  }
  switch (key) {
    case "ArrowDown":
      return { options, activeIndex: (activeIndex + 1) % options.length, isOpen: true };
    case "ArrowUp":
      return { options, activeIndex: (activeIndex - 1 + options.length) % options.length, isOpen: true };
    case "Home":
      return { options, activeIndex: 0, isOpen: true };
    case "End":
      return { options, activeIndex: options.length - 1, isOpen: true };
    case "Escape":
      return { options, activeIndex: -1, isOpen: false };
    case "Enter":
      return { options, activeIndex, isOpen: false };
    default:
      return { ...state };
  }
}
function createComboboxController(options) {
  let state = { options, activeIndex: -1, isOpen: false, filter: "" };
  return {
    getState() {
      return state;
    },
    handleKey(key) {
      state = handleComboboxKey(state, key);
      return state;
    },
    setFilter(text) {
      const filtered = options.filter((o) => o.toLowerCase().startsWith(text.toLowerCase()));
      state = { options: filtered, activeIndex: filtered.length ? 0 : -1, isOpen: filtered.length > 0, filter: text };
      return state;
    },
    getActiveDescendantId() {
      return state.activeIndex === -1 ? null : \`option-\${state.activeIndex}\`;
    },
  };
}`,
    testCases: [
      {
        input: 'setFilter("ap") on ["Apple","Apricot","Banana"]',
        expected: '{options:["Apple","Apricot"],activeIndex:0,isOpen:true}',
        label: "Filtering narrows the option list and activates the first match",
      },
      {
        input: "getActiveDescendantId() after the filter above",
        expected: '"option-0"',
        label: "The active-descendant id reflects the currently highlighted filtered option",
      },
      {
        input: 'handleKey("ArrowDown") twice on a 2-item filtered list',
        expected: '"option-0"',
        label: "Arrow navigation wraps within the filtered set, not the original full option list",
      },
      {
        input: 'setFilter("xyz") with no matches',
        expected: "isOpen: false, getActiveDescendantId(): null",
        label: "A filter with zero matches closes the list and clears the active descendant",
      },
    ],
    isPremium: true,
    orderIndex: 57,
  },
  {
    slug: "a11y-rule-report-generator",
    conceptSlug: "automated-a11y-testing",
    title: "Build a Multi-Rule Accessibility Report Generator",
    description: `Extends the single-node linter into a full tree-walking report generator — the same kind of pass a real tool like axe-core runs over an entire page.

## The problem

A real page is a tree, not one isolated element — a useful report needs to walk every node, run every applicable rule (including one this Challenge didn't cover: color contrast), and say *where* each violation was found.

## The idea

Reuse the single-node rule check for every node visited, add a contrast-ratio rule for any node carrying inline color/background-color style values, and recurse into children while building a readable path string as you go.

## Your task

Write \`lintTree(node, path)\`, where a node is \`{ tag, attrs, style, children }\`, returning an array of \`{ path, message }\`:

\`\`\`js
lintTree({ tag: "div", attrs: {}, children: [{ tag: "img", attrs: {} }] })
// → [{ path: "div>img[0]", message: "img missing alt text" }]
\`\`\``,
    starterCode: `function lintNode(node) {
  // same as the Challenge
}
function lintTree(node, path) {
  // walk the tree, reusing lintNode + a contrast check, building a path per violation
}`,
    solutionCode: `function lintNode(node) {
  const violations = [];
  const attrs = node.attrs || {};
  if (node.tag === "img") {
    const isDecorative = attrs.role === "presentation" || attrs["aria-hidden"] === true;
    if (!isDecorative && !("alt" in attrs)) violations.push("img missing alt text");
  }
  if (node.tag === "input") {
    const hasName = Boolean(attrs["aria-label"] || attrs["aria-labelledby"]);
    if (!hasName) violations.push("input missing an accessible name");
  }
  return violations;
}
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}
function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
function lintTree(node, path) {
  path = path || node.tag;
  const violations = lintNode(node).map((message) => ({ path, message }));
  if (node.style && node.style.color && node.style.backgroundColor) {
    const ratio = getContrastRatio(node.style.color, node.style.backgroundColor);
    if (ratio < 4.5) violations.push({ path, message: \`low contrast ratio \${ratio}:1 (needs 4.5:1)\` });
  }
  (node.children || []).forEach((child, i) => {
    violations.push(...lintTree(child, \`\${path}>\${child.tag}[\${i}]\`));
  });
  return violations;
}`,
    testCases: [
      {
        input: 'a tree with an <img> missing alt, an <input> with aria-label, and a low-contrast <p>',
        expected: '[{path:"div>img[0]",message:"img missing alt text"},{path:"div>p[2]",message:"low contrast ratio 1:1 (needs 4.5:1)"}]',
        label: "Violations are collected from every level of the tree, each with its own path",
      },
      {
        input: "a tree where every node passes every rule",
        expected: "[]",
        label: "A fully compliant tree produces no violations",
      },
    ],
    isPremium: true,
    orderIndex: 58,
  },
  {
    slug: "responsive-image-config-builder",
    conceptSlug: "image-asset-optimization",
    title: "Build a Responsive Image Config Builder",
    description: `Extends the format/width picker into the full config a real \`<img>\` component needs — a single source, plus a complete \`srcset\` string.

## The problem

Picking a format and a single width is only half of a real responsive image — a production \`<img>\` needs a whole \`srcset\` listing every candidate width, so the browser can choose differently per device.

## The idea

Reuse the format and width pickers to build one recommended image config, then generate the full \`srcset\` attribute string across every available width in the same format.

## Your task

Write \`buildImageConfig(options)\`, reusing \`pickImageFormat\`/\`pickSrcsetWidth\`, returning \`{ format, width, src }\`. Then write \`buildSrcSet(baseUrl, format, availableWidths)\`, returning the full \`srcset\` string:

\`\`\`js
buildSrcSet("/img/hero", "avif", [320, 640, 960])
// → "/img/hero?w=320&fmt=avif 320w, /img/hero?w=640&fmt=avif 640w, /img/hero?w=960&fmt=avif 960w"
\`\`\``,
    starterCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  // same as the Challenge
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  // same as the Challenge
}
function buildImageConfig({ hasTransparency, isPhoto, needsAnimation, containerWidth, dpr, availableWidths, baseUrl }) {
  // return { format, width, src }
}
function buildSrcSet(baseUrl, format, availableWidths) {
  // return the full srcset attribute string
}`,
    solutionCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  if (needsAnimation) return "webp";
  if (hasTransparency) return "webp";
  if (isPhoto) return "avif";
  return "webp";
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  const target = containerWidth * dpr;
  const sorted = [...availableWidths].sort((a, b) => a - b);
  const fit = sorted.find((w) => w >= target);
  return fit !== undefined ? fit : sorted[sorted.length - 1];
}
function buildImageConfig({ hasTransparency, isPhoto, needsAnimation, containerWidth, dpr, availableWidths, baseUrl }) {
  const format = pickImageFormat({ hasTransparency, isPhoto, needsAnimation });
  const width = pickSrcsetWidth(containerWidth, dpr, availableWidths);
  return { format, width, src: \`\${baseUrl}?w=\${width}&fmt=\${format}\` };
}
function buildSrcSet(baseUrl, format, availableWidths) {
  return availableWidths.map((w) => \`\${baseUrl}?w=\${w}&fmt=\${format} \${w}w\`).join(", ");
}`,
    testCases: [
      {
        input: 'buildImageConfig({ hasTransparency: false, isPhoto: true, needsAnimation: false, containerWidth: 400, dpr: 2, availableWidths: [320,640,960,1280], baseUrl: "/img/hero" })',
        expected: '{ format: "avif", width: 960, src: "/img/hero?w=960&fmt=avif" }',
        label: "buildImageConfig combines format and width into one config",
      },
      {
        input: 'buildSrcSet("/img/hero", "avif", [320,640,960])',
        expected: '"/img/hero?w=320&fmt=avif 320w, /img/hero?w=640&fmt=avif 640w, /img/hero?w=960&fmt=avif 960w"',
        label: "buildSrcSet produces the full srcset string across every width",
      },
    ],
    orderIndex: 1,
  },
  {
    slug: "chunk-size-report-builder",
    conceptSlug: "bundle-size-code-splitting",
    title: "Build a Chunk Size Report",
    description: `Extends the shared/route chunk splitter with real byte sizes — the report a bundle analyzer actually shows.

## The problem

Knowing *which* modules are shared is only useful once it's tied to actual byte weight — a shared chunk with three tiny modules matters far less than a route chunk with one enormous one.

## The idea

Reuse the chunk-splitting logic, then look up each module's size and sum it per chunk, producing a byte total for the shared chunk and for every route's own chunk.

## Your task

Write \`computeChunkSizes(routeModules, moduleSizes)\`, reusing \`splitChunks\`, returning \`{ shared: { modules, totalBytes }, routes: { [route]: { modules, totalBytes } } }\`:

\`\`\`js
computeChunkSizes(
  { "/home": ["react", "home-page"], "/about": ["react", "about-page"] },
  { react: 100, "home-page": 20, "about-page": 15 }
)
// → { shared: { modules: ["react"], totalBytes: 100 }, routes: { "/home": { modules: ["home-page"], totalBytes: 20 }, "/about": { modules: ["about-page"], totalBytes: 15 } } }
\`\`\``,
    starterCode: `function splitChunks(routeModules) {
  // same as the Challenge
}
function computeChunkSizes(routeModules, moduleSizes) {
  // reuse splitChunks, then attach a totalBytes sum to the shared chunk and each route chunk
}`,
    solutionCode: `function splitChunks(routeModules) {
  const counts = new Map();
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      counts.set(mod, (counts.get(mod) || 0) + 1);
    }
  }
  const shared = [];
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      if (counts.get(mod) > 1 && !shared.includes(mod)) shared.push(mod);
    }
  }
  const routes = {};
  for (const route in routeModules) {
    routes[route] = routeModules[route].filter((m) => !shared.includes(m));
  }
  return { shared, routes };
}
function computeChunkSizes(routeModules, moduleSizes) {
  const { shared, routes } = splitChunks(routeModules);
  const sizeOf = (mods) => mods.reduce((sum, m) => sum + (moduleSizes[m] || 0), 0);
  const result = { shared: { modules: shared, totalBytes: sizeOf(shared) }, routes: {} };
  for (const route in routes) {
    result.routes[route] = { modules: routes[route], totalBytes: sizeOf(routes[route]) };
  }
  return result;
}`,
    testCases: [
      {
        input: 'computeChunkSizes({ "/home": ["react","home-page"], "/about": ["react","about-page"] }, { react: 100, "home-page": 20, "about-page": 15 })',
        expected: '{ shared: { modules: ["react"], totalBytes: 100 }, routes: { "/home": { modules: ["home-page"], totalBytes: 20 }, "/about": { modules: ["about-page"], totalBytes: 15 } } }',
        label: "computeChunkSizes attaches byte totals to the shared chunk and each route chunk",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "resource-load-strategy-planner",
    conceptSlug: "resource-loading-render-blocking",
    title: "Build a Resource Load Strategy Planner",
    description: `Extends single-resource classification into a full loading plan — the report a build tool would use to flag what's on the critical path.

## The problem

Classifying one resource at a time doesn't answer the actual question a team asks before optimizing a page: across everything this page loads, what's actually blocking, what's deferred, and what's just a background hint?

## The idea

Reuse the classifier across a whole resource list, grouping every resource's id into the bucket matching its strategy.

## Your task

Write \`groupResourcesByLoadStrategy(resources)\`, reusing \`classifyResource\`, returning \`{ blocking, async, deferred, background }\` — each an array of resource ids:

\`\`\`js
groupResourcesByLoadStrategy([
  { id: "a", tag: "script", duration: 100 },
  { id: "b", tag: "script", async: true, duration: 50 },
  { id: "c", tag: "link", rel: "stylesheet", duration: 30 },
  { id: "d", tag: "link", rel: "preload" },
])
// → { blocking: ["a","c"], async: ["b"], deferred: [], background: ["d"] }
\`\`\``,
    starterCode: `function classifyResource(resource) {
  // same as the Challenge
}
function groupResourcesByLoadStrategy(resources) {
  // return { blocking, async, deferred, background }, each an array of ids
}`,
    solutionCode: `function classifyResource(resource) {
  if (resource.tag === "link") {
    if (resource.rel === "stylesheet") return "render-blocking";
    return resource.rel;
  }
  if (resource.async) return "async";
  if (resource.defer) return "defer";
  return "render-blocking";
}
function groupResourcesByLoadStrategy(resources) {
  const groups = { blocking: [], async: [], deferred: [], background: [] };
  for (const r of resources) {
    const cls = classifyResource(r);
    if (cls === "render-blocking") groups.blocking.push(r.id);
    else if (cls === "async") groups.async.push(r.id);
    else if (cls === "defer") groups.deferred.push(r.id);
    else groups.background.push(r.id);
  }
  return groups;
}`,
    testCases: [
      {
        input: 'groupResourcesByLoadStrategy([{id:"a",tag:"script",duration:100},{id:"b",tag:"script",async:true,duration:50},{id:"c",tag:"link",rel:"stylesheet",duration:30},{id:"d",tag:"link",rel:"preload"}])',
        expected: '{ blocking: ["a","c"], async: ["b"], deferred: [], background: ["d"] }',
        label: "groupResourcesByLoadStrategy buckets every resource id by its classification",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "core-web-vitals-page-auditor",
    conceptSlug: "core-web-vitals",
    title: "Build a Core Web Vitals Page Auditor",
    description: `Extends single-snapshot classification into the real methodology: rating a page off the 75th percentile across many real visits, not one sample.

## The problem

A single LCP/INP/CLS reading only describes one visit. Google's actual Core Web Vitals score is the 75th percentile across many real user sessions — a page has to clear the bar for at least three out of every four real visits, not just its best one.

## The idea

Compute the 75th percentile of each metric across a set of samples, then classify and rate the page off those percentile values, reusing the classifier from the Challenge.

## Your task

Write \`percentile(values, p)\` (nearest-rank: sort ascending, index \`Math.ceil((p/100)*length)-1\`), then \`auditPage(samples)\`, where \`samples\` is an array of \`{ LCP, INP, CLS }\` readings:

\`\`\`js
auditPage([
  { LCP: 2000, INP: 100, CLS: 0.02 },
  { LCP: 2400, INP: 150, CLS: 0.05 },
  { LCP: 4800, INP: 600, CLS: 0.3 },
  { LCP: 2600, INP: 180, CLS: 0.08 },
])
// → { LCP: { value: 2600, rating: "needs-improvement" }, INP: { value: 180, rating: "good" }, CLS: { value: 0.08, rating: "good" }, overall: "needs-improvement" }
\`\`\``,
    starterCode: `function classifyMetric(metric, value) {
  // same as the Challenge
}
function overallPageRating(metrics) {
  // same as the Challenge
}
function percentile(values, p) {
  // nearest-rank percentile: sort ascending, index = ceil((p/100) * length) - 1
}
function auditPage(samples) {
  // compute the p75 of LCP/INP/CLS across samples, classify each, and rate the page overall
}`,
    solutionCode: `function classifyMetric(metric, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
  };
  const t = thresholds[metric];
  if (value <= t.good) return "good";
  if (value > t.poor) return "poor";
  return "needs-improvement";
}
function overallPageRating(metrics) {
  const ratings = Object.keys(metrics).map((m) => classifyMetric(m, metrics[m]));
  if (ratings.includes("poor")) return "poor";
  if (ratings.includes("needs-improvement")) return "needs-improvement";
  return "good";
}
function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
function auditPage(samples) {
  const metrics = ["LCP", "INP", "CLS"];
  const result = {};
  for (const m of metrics) {
    const value = percentile(samples.map((s) => s[m]), 75);
    result[m] = { value, rating: classifyMetric(m, value) };
  }
  result.overall = overallPageRating({ LCP: result.LCP.value, INP: result.INP.value, CLS: result.CLS.value });
  return result;
}`,
    testCases: [
      { input: "percentile([4000,1000,3000,2000], 75)", expected: "3000", label: "percentile computes the p75 value via nearest-rank" },
      {
        input: 'auditPage([{LCP:2000,INP:100,CLS:0.02},{LCP:2400,INP:150,CLS:0.05},{LCP:4800,INP:600,CLS:0.3},{LCP:2600,INP:180,CLS:0.08}])',
        expected: '{ LCP: { value: 2600, rating: "needs-improvement" }, INP: { value: 180, rating: "good" }, CLS: { value: 0.08, rating: "good" }, overall: "needs-improvement" }',
        label: "auditPage rates the page off the p75 of each metric, matching real CWV methodology",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "virtual-list-controller",
    conceptSlug: "list-virtualization",
    title: "Build a Virtual List Controller",
    description: `Extends the windowing math into a stateful controller with scroll-to-index support — the shape a real virtualized list component wraps.

## The problem

The raw windowing formula answers "what's visible right now," but a real component also needs the reverse question: to jump programmatically to a given row (a "scroll to item 500" button, for instance), what scroll position gets it there?

## The idea

Wrap the same windowing math in a small object configured once with the list's fixed dimensions, exposing both directions: current scroll position → visible range, and target row index → required scroll position.

## Your task

Write \`createVirtualList({ rowHeight, containerHeight, totalRows, overscan })\`, returning \`{ getVisibleRange(scrollTop), scrollTopForIndex(index) }\`:

\`\`\`js
const vl = createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 });
vl.getVisibleRange(0) // { start: 0, end: 13 }
vl.scrollTopForIndex(50) // 2000
\`\`\``,
    starterCode: `function createVirtualList({ rowHeight, containerHeight, totalRows, overscan }) {
  // return { getVisibleRange(scrollTop), scrollTopForIndex(index) }
}`,
    solutionCode: `function createVirtualList({ rowHeight, containerHeight, totalRows, overscan }) {
  return {
    getVisibleRange(scrollTop) {
      const first = Math.floor(scrollTop / rowHeight);
      const last = Math.floor((scrollTop + containerHeight) / rowHeight);
      const start = Math.max(0, first - overscan);
      const end = Math.min(totalRows - 1, last + overscan);
      return { start, end };
    },
    scrollTopForIndex(index) {
      return index * rowHeight;
    },
  };
}`,
    testCases: [
      {
        input: 'createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 }).getVisibleRange(0)',
        expected: "{ start: 0, end: 13 }",
        label: "getVisibleRange reuses the same windowing math as the Challenge",
      },
      {
        input: 'createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 }).scrollTopForIndex(50)',
        expected: "2000",
        label: "scrollTopForIndex computes the scroll position needed to bring a given row to the top",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "aggregate-bottleneck-finder",
    conceptSlug: "profiling-with-devtools",
    title: "Build an Aggregate Bottleneck Finder",
    description: `Extends single-trace bottleneck-finding into DevTools' real "Bottom-Up" view: aggregating self time for a function across many recorded traces, not just one.

## The problem

A function that costs 20ms here and 25ms there across a dozen different call stacks might never be the single widest bar in any one flame chart — but its total cost across the whole session could dwarf anything that is.

## The idea

Walk every trace, summing self time per function name (not per tree position), then find whichever name has the highest aggregate — the real target the Bottom-Up view is built to surface.

## Your task

Write \`aggregateSelfTime(traces)\`, returning a map of function name to total self time across all traces, and \`findTopAggregateBottleneck(traces)\`, returning the name with the highest aggregate:

\`\`\`js
const traces = [
  { name: "a", selfTime: 5, children: [{ name: "format", selfTime: 20, children: [] }] },
  { name: "b", selfTime: 5, children: [{ name: "format", selfTime: 25, children: [] }, { name: "render", selfTime: 10, children: [] }] },
];
aggregateSelfTime(traces) // { a: 5, format: 45, b: 5, render: 10 }
findTopAggregateBottleneck(traces) // "format"
\`\`\``,
    starterCode: `function aggregateSelfTime(traces) {
  // sum selfTime per function name, walking every trace's whole tree
}
function findTopAggregateBottleneck(traces) {
  // the name with the highest total in aggregateSelfTime(traces)
}`,
    solutionCode: `function aggregateSelfTime(traces) {
  const totals = {};
  function walk(n) {
    totals[n.name] = (totals[n.name] || 0) + n.selfTime;
    (n.children || []).forEach(walk);
  }
  traces.forEach(walk);
  return totals;
}
function findTopAggregateBottleneck(traces) {
  const totals = aggregateSelfTime(traces);
  let bestName = null;
  let bestValue = -Infinity;
  for (const name in totals) {
    if (totals[name] > bestValue) {
      bestValue = totals[name];
      bestName = name;
    }
  }
  return bestName;
}`,
    testCases: [
      {
        input: '[{name:"a",selfTime:5,children:[{name:"format",selfTime:20,children:[]}]},{name:"b",selfTime:5,children:[{name:"format",selfTime:25,children:[]},{name:"render",selfTime:10,children:[]}]}]',
        expected: '{ a: 5, format: 45, b: 5, render: 10 }',
        label: "aggregateSelfTime sums selfTime for a repeated function name across separate traces",
      },
      {
        input: "the same traces",
        expected: '"format"',
        label: "findTopAggregateBottleneck picks the highest aggregate, not the highest single-node selfTime",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "streaming-hydration-timeline-simulator",
    conceptSlug: "streaming-ssr-hydration",
    title: "Build a Streaming Hydration Timeline Simulator",
    description: `Extends shell-position rendering into a full timeline: progressive snapshots as chunks arrive, plus a hydration mismatch check against what the client expects.

## The problem

Understanding one snapshot in time is a start, but a real streaming page changes over the course of several arrivals — and once everything has streamed in, the client still has to successfully hydrate it, which can fail if server and client disagree on what was rendered.

## The idea

Replay the arrival sequence one chunk at a time, recording a snapshot after each arrival, then separately check the final server-rendered order against what the client expects to hydrate.

## Your task

Write \`runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds)\`, reusing \`renderedContentAt\` and a mismatch-finder, returning \`{ snapshots, finalOrder, hydrationMismatchIndex }\`:

\`\`\`js
runStreamingTimeline(
  ["header", "sidebar", "main", "footer"],
  ["footer", "header", "main", "sidebar"],
  ["header", "sidebar", "main", "footer"]
)
// → { snapshots: [...4 progressive snapshots], finalOrder: ["header","sidebar","main","footer"], hydrationMismatchIndex: -1 }
\`\`\``,
    starterCode: `function renderedContentAt(shellOrder, arrivedIds) {
  // same as the Challenge
}
function findHydrationMismatch(serverIds, clientIds) {
  // return the first index where serverIds and clientIds differ, or -1 if none
}
function runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds) {
  // return { snapshots, finalOrder, hydrationMismatchIndex }
}`,
    solutionCode: `function renderedContentAt(shellOrder, arrivedIds) {
  return shellOrder.map((id) => (arrivedIds.includes(id) ? id : "skeleton"));
}
function findHydrationMismatch(serverIds, clientIds) {
  const len = Math.max(serverIds.length, clientIds.length);
  for (let i = 0; i < len; i++) {
    if (serverIds[i] !== clientIds[i]) return i;
  }
  return -1;
}
function runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds) {
  const snapshots = arrivalSequence.map((_, i) => renderedContentAt(shellOrder, arrivalSequence.slice(0, i + 1)));
  return {
    snapshots,
    finalOrder: shellOrder,
    hydrationMismatchIndex: findHydrationMismatch(shellOrder, clientHydrationIds),
  };
}`,
    testCases: [
      {
        input: 'runStreamingTimeline(["header","sidebar","main","footer"], ["footer","header","main","sidebar"], ["header","sidebar","main","footer"]).snapshots',
        expected: '[["skeleton","skeleton","skeleton","footer"],["header","skeleton","skeleton","footer"],["header","skeleton","main","footer"],["header","sidebar","main","footer"]]',
        label: "snapshots show progressively more content filled in as each chunk arrives",
      },
      {
        input: "the same call's hydrationMismatchIndex",
        expected: "-1",
        label: "No hydration mismatch when the client's ids match the shell order exactly",
      },
      {
        input: 'runStreamingTimeline(["header","sidebar","main","footer"], ["footer","header","main","sidebar"], ["header","wrong","main","footer"]).hydrationMismatchIndex',
        expected: "1",
        label: "A client id that actually diverges from the shell order is caught at its exact index",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "budget-regression-reporter",
    conceptSlug: "performance-budgets",
    title: "Build a Budget Regression Reporter",
    description: `Extends the pass/fail budget check into a CI-bot-style report: how much did each metric change versus the last build, and did any of that change cause a new failure?

## The problem

A flat pass/fail check doesn't tell a reviewer *why* something failed — a bundle that grew 15% since the last build and now exceeds budget is a much more actionable message than just "failed."

## The idea

Reuse the budget check for both the current and baseline builds, then compute the percentage change per metric and flag a **regression** specifically when the current build fails a budget that the baseline build had been passing.

## Your task

Write \`compareToBaseline(current, baseline, budgets)\`, reusing \`checkBudget\`, returning an array of \`{ metric, current, baseline, deltaPercent, passed, regressed }\` (deltaPercent rounded to 1 decimal):

\`\`\`js
compareToBaseline({ bundleSizeKb: 190 }, { bundleSizeKb: 150 }, { bundleSizeKb: 170 })
// → [{ metric: "bundleSizeKb", current: 190, baseline: 150, deltaPercent: 26.7, passed: false, regressed: true }]
\`\`\``,
    starterCode: `function checkBudget(metrics, budgets) {
  // same as the Challenge
}
function compareToBaseline(current, baseline, budgets) {
  // return [{ metric, current, baseline, deltaPercent, passed, regressed }]
}`,
    solutionCode: `function checkBudget(metrics, budgets) {
  return Object.keys(budgets).map((metric) => ({
    metric,
    actual: metrics[metric],
    budget: budgets[metric],
    passed: metrics[metric] <= budgets[metric],
  }));
}
function compareToBaseline(current, baseline, budgets) {
  const results = checkBudget(current, budgets);
  const baselineResults = checkBudget(baseline, budgets);
  return results.map((r, i) => {
    const baselineVal = baselineResults[i].actual;
    const deltaPercent = baselineVal === 0 ? 0 : Math.round(((r.actual - baselineVal) / baselineVal) * 1000) / 10;
    return {
      metric: r.metric,
      current: r.actual,
      baseline: baselineVal,
      deltaPercent,
      passed: r.passed,
      regressed: !r.passed && baselineResults[i].passed,
    };
  });
}`,
    testCases: [
      {
        input: 'compareToBaseline({ bundleSizeKb: 190 }, { bundleSizeKb: 150 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", current: 190, baseline: 150, deltaPercent: 26.7, passed: false, regressed: true }]',
        label: "A build that grew past budget after a passing baseline is flagged as a regression",
      },
      {
        input: 'compareToBaseline({ bundleSizeKb: 160 }, { bundleSizeKb: 180 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", current: 160, baseline: 180, deltaPercent: -11.1, passed: true, regressed: false }]',
        label: "An improvement shows a negative deltaPercent and is never a regression",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  // ── system-design (Feature 48) ────────────────────────────────────────────
  {
    slug: "resolve-build-order",
    conceptSlug: "component-driven-architecture",
    title: "Resolve a safe build order from a component dependency graph",
    description: `Extends the cycle detector into the tool a real build system needs: not just "is there a cycle," but "what order should things build in."

## The problem

Once a component import graph is known to be cycle-free, a build system (or a bundler resolving module order) still needs an actual order to build in — every dependency has to build before whatever depends on it.

## The idea

A topological sort produces exactly that order: visit each node's dependencies first (depth-first), then add the node itself once all its dependencies are already in the result. If a node is revisited while it's still being visited (not yet finished), that's a cycle.

## Your task

Write \`resolveBuildOrder(graph)\`, the same adjacency-list shape as the Challenge's \`findCycle\`. Return a valid build order (dependencies before dependents), or \`null\` if the graph has a cycle:

\`\`\`js
resolveBuildOrder({ A: ["B"], B: ["C"], C: [] })
// → ["C", "B", "A"]
resolveBuildOrder({ A: ["B"], B: ["A"] })
// → null
\`\`\``,
    starterCode: `function resolveBuildOrder(graph) {
  // DFS post-order: a node is added to the result only after all its deps are
}`,
    solutionCode: `function resolveBuildOrder(graph) {
  const visited = new Set();
  const visiting = new Set();
  const order = [];
  function dfs(node) {
    if (visited.has(node)) return true;
    if (visiting.has(node)) return false;
    visiting.add(node);
    for (const dep of graph[node] || []) {
      if (!dfs(dep)) return false;
    }
    visiting.delete(node);
    visited.add(node);
    order.push(node);
    return true;
  }
  for (const node of Object.keys(graph)) {
    if (!dfs(node)) return null;
  }
  return order;
}`,
    testCases: [
      {
        input: 'resolveBuildOrder({ A: ["B"], B: ["C"], C: [] })',
        expected: '["C", "B", "A"]',
        label: "Dependencies always appear before whatever depends on them",
      },
      {
        input: 'resolveBuildOrder({ A: ["B"], B: ["A"] })',
        expected: "null",
        label: "A cycle makes a valid build order impossible",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "dedupe-and-cache-fetcher",
    conceptSlug: "api-design-data-fetching-strategy",
    title: "Build a request-deduplicating, caching fetcher",
    description: `The single mechanism that fixes the most common real-world data-fetching bug: two components independently requesting the same resource at the same time.

## The problem

Without deduplication, two components mounting at once and both asking for the same resource fire two separate network requests for identical data — wasted work, and a real risk of the two responses arriving in a different order than they were sent.

## The idea

A fetcher keyed by request key tracks in-flight promises: a second \`get(key)\` call while the first is still pending returns the *same* promise instead of starting a new fetch. Once resolved, the value is cached so later calls skip the network entirely — until explicitly invalidated.

## Your task

Write \`createFetcher(fetchFn)\`, returning \`{ get(key), invalidate(key) }\`. Concurrent \`get\` calls for the same key must only invoke \`fetchFn\` once; a resolved value must be served from cache on subsequent calls; \`invalidate(key)\` clears the cache so the next \`get\` re-fetches.`,
    starterCode: `function createFetcher(fetchFn) {
  // track in-flight promises per key, plus a resolved-value cache
}`,
    solutionCode: `function createFetcher(fetchFn) {
  const cache = new Map();
  const inflight = new Map();
  return {
    async get(key) {
      if (cache.has(key)) return cache.get(key);
      if (inflight.has(key)) return inflight.get(key);
      const promise = fetchFn(key)
        .then((value) => {
          cache.set(key, value);
          return value;
        })
        .finally(() => {
          inflight.delete(key);
        });
      inflight.set(key, promise);
      return promise;
    },
    invalidate(key) {
      cache.delete(key);
    },
  };
}`,
    testCases: [
      {
        input: "two concurrent get(\\\"x\\\") calls against a counting fetchFn",
        expected: "fetchFn called exactly once",
        label: "Concurrent gets for the same key dedupe to a single underlying call",
      },
      {
        input: "get(key) called again after invalidate(key)",
        expected: "fetchFn called again",
        label: "invalidate() forces the next get() to re-fetch",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "reconnect-scheduler",
    conceptSlug: "designing-real-time-updates",
    title: "Build a capped exponential-backoff reconnect scheduler",
    description: `The reconnection logic every persistent-connection client (WebSocket or SSE) needs, since a dropped connection is a certainty, not an edge case.

## The problem

Reconnecting immediately after every drop hammers the server the moment it's struggling (which is often exactly when connections are dropping in the first place). Reconnecting on a fixed delay wastes time once the server has recovered.

## The idea

Exponential backoff increases the delay after each failed attempt, capped at a maximum so it never grows unbounded — and gives up entirely after too many attempts rather than retrying forever.

## Your task

Write \`nextRetryDelay(attempt, { baseMs, maxMs })\`, doubling the delay for each attempt starting at \`baseMs\`, capped at \`maxMs\`. Write \`shouldGiveUp(attempt, maxAttempts)\`, returning whether the attempt count has reached the cap:

\`\`\`js
nextRetryDelay(1, { baseMs: 100, maxMs: 5000 }) // → 100
nextRetryDelay(3, { baseMs: 100, maxMs: 5000 }) // → 400
nextRetryDelay(10, { baseMs: 100, maxMs: 5000 }) // → 5000 (capped)
\`\`\``,
    starterCode: `function nextRetryDelay(attempt, { baseMs, maxMs }) {
  // baseMs * 2^(attempt - 1), capped at maxMs
}
function shouldGiveUp(attempt, maxAttempts) {
  // true once attempt has reached maxAttempts
}`,
    solutionCode: `function nextRetryDelay(attempt, { baseMs, maxMs }) {
  const delay = baseMs * Math.pow(2, attempt - 1);
  return Math.min(delay, maxMs);
}
function shouldGiveUp(attempt, maxAttempts) {
  return attempt >= maxAttempts;
}`,
    testCases: [
      {
        input: "nextRetryDelay(3, { baseMs: 100, maxMs: 5000 })",
        expected: "400",
        label: "Delay doubles with each attempt",
      },
      {
        input: "nextRetryDelay(10, { baseMs: 100, maxMs: 5000 })",
        expected: "5000",
        label: "Delay never exceeds maxMs",
      },
      {
        input: "shouldGiveUp(5, 5)",
        expected: "true",
        label: "Giving up triggers once the attempt count reaches the cap",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "infinite-scroll-controller",
    conceptSlug: "designing-infinite-scroll-feed",
    title: "Build a stateful infinite-scroll feed controller",
    description: `Extends the page-merge Challenge into the full controller a real infinite-scroll feed needs: accumulated state, plus the scroll-threshold check that decides when to fetch the next page.

## The problem

Merging one page into the next is only half the feature — something also has to decide *when* to trigger the next fetch based on how close the user has scrolled to the bottom, and hold the running feed state across however many pages have loaded.

## The idea

A small stateful controller wraps the page-merge logic, tracking the accumulated items and current cursor, plus a pure scroll-threshold check that's easy to test independent of any real DOM scroll event.

## Your task

Write \`createFeedController()\`, returning \`{ loadPage(newPage), getState(), shouldFetchNext(scrollTop, scrollHeight, clientHeight, thresholdPx = 200) }\`. \`loadPage\` merges a new page into the running state (same dedup-by-id rule as the Challenge) and returns the updated state; \`shouldFetchNext\` returns whether the remaining scroll distance is at or under the threshold:

\`\`\`js
const feed = createFeedController();
feed.loadPage({ items: [{ id: 1 }, { id: 2 }], nextCursor: "c1" });
feed.loadPage({ items: [{ id: 2 }, { id: 3 }], nextCursor: "c2" });
feed.getState() // → { items: [{id:1},{id:2},{id:3}], cursor: "c2" }
\`\`\``,
    starterCode: `function createFeedController() {
  // wrap mergeFeedPage-style logic in running state, plus shouldFetchNext
}`,
    solutionCode: `function mergeFeedPage(existingItems, newPage) {
  const seen = new Set(existingItems.map((i) => i.id));
  const merged = [...existingItems];
  for (const item of newPage.items) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return { items: merged, nextCursor: newPage.nextCursor };
}
function shouldFetchNext(scrollTop, scrollHeight, clientHeight, thresholdPx = 200) {
  return scrollHeight - scrollTop - clientHeight <= thresholdPx;
}
function createFeedController() {
  let items = [];
  let cursor = null;
  return {
    loadPage(newPage) {
      const merged = mergeFeedPage(items, newPage);
      items = merged.items;
      cursor = merged.nextCursor;
      return { items, cursor };
    },
    getState() {
      return { items, cursor };
    },
    shouldFetchNext,
  };
}`,
    testCases: [
      {
        input: "two loadPage() calls with an overlapping id",
        expected: "state.items has no duplicate ids, cursor is the latest nextCursor",
        label: "The controller accumulates pages without duplicating items",
      },
      {
        input: "shouldFetchNext(100, 1000, 800, 200)",
        expected: "true",
        label: "Scrolling within the threshold of the bottom triggers a fetch",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "apply-collab-ops",
    conceptSlug: "designing-realtime-collaborative-editor",
    title: "Apply a log of concurrent insert operations to converge on one document",
    description: `Extends the single-pair transform Challenge into the real OT loop: a whole log of concurrent operations, applied so every one lands correctly relative to everything already applied.

## The problem

A single \`transform(opA, opB)\` call only handles two operations. A real document has to apply an arbitrary-length stream of operations, each one authored against the document as it looked *before* any of the concurrent ones were applied.

## The idea

Apply operations one at a time. Before applying each one, transform it against every operation already applied so far, in the order they were applied — folding the transform across the growing "already applied" list.

## Your task

Write \`applyOps(initialText, ops)\`, where \`ops\` is a list of \`{ pos, text }\` insert operations, all authored against \`initialText\`. Return the final text after applying all of them, each correctly transformed against every operation applied before it:

\`\`\`js
applyOps("Hello", [{ pos: 5, text: " World" }, { pos: 5, text: "!" }])
// → "Hello World!"
\`\`\``,
    starterCode: `function transform(opA, opB) {
  // same as the Challenge
}
function applyOps(initialText, ops) {
  // apply each op after folding transform() across all previously applied ops
}`,
    solutionCode: `function transform(opA, opB) {
  if (opB.pos >= opA.pos) {
    return { ...opB, pos: opB.pos + opA.text.length };
  }
  return { ...opB };
}
function applyOps(initialText, ops) {
  let text = initialText;
  const applied = [];
  for (const rawOp of ops) {
    let op = rawOp;
    for (const prev of applied) {
      op = transform(prev, op);
    }
    text = text.slice(0, op.pos) + op.text + text.slice(op.pos);
    applied.push(op);
  }
  return text;
}`,
    testCases: [
      {
        input: 'applyOps("Hello", [{ pos: 5, text: " World" }, { pos: 5, text: "!" }])',
        expected: '"Hello World!"',
        label: "Concurrent inserts at the same position converge without corrupting the text",
      },
      {
        input: 'applyOps("ab", [{ pos: 1, text: "X" }, { pos: 0, text: "Y" }])',
        expected: '"YaXb"',
        label: "An earlier-position insert is unaffected by a later concurrent one",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "find-shared-dependency-conflicts",
    conceptSlug: "frontend-architecture-patterns",
    title: "Find mismatched shared dependency versions across micro-frontends",
    description: `The concrete cost micro-frontends pay for their deployment independence: nothing forces every app to agree on a shared dependency's version.

## The problem

Once separate teams own separate deploys, one app upgrading React while another hasn't creates two different React instances loaded at once — a real, common source of "why are hooks broken" bugs in production micro-frontend setups.

## The idea

Collect every app's declared dependency versions, grouped by dependency name. Any dependency with more than one distinct version across apps is a conflict that needs a resolution strategy (a shared singleton version, or accepting the duplication).

## Your task

Write \`findSharedDependencyConflicts(apps)\`, where \`apps\` is \`{ name, dependencies: Record<string, string> }[]\`. Return an array of \`{ dependency, versions }\` (versions keyed by app name) for every dependency where apps disagree:

\`\`\`js
findSharedDependencyConflicts([
  { name: "checkout", dependencies: { react: "18.2.0" } },
  { name: "catalog", dependencies: { react: "17.0.0" } },
])
// → [{ dependency: "react", versions: { checkout: "18.2.0", catalog: "17.0.0" } }]
\`\`\``,
    starterCode: `function findSharedDependencyConflicts(apps) {
  // group versions by dependency name, flag any with more than one distinct value
}`,
    solutionCode: `function findSharedDependencyConflicts(apps) {
  const depVersions = {};
  for (const app of apps) {
    for (const [dep, version] of Object.entries(app.dependencies)) {
      if (!depVersions[dep]) depVersions[dep] = {};
      depVersions[dep][app.name] = version;
    }
  }
  const conflicts = [];
  for (const [dep, versions] of Object.entries(depVersions)) {
    const uniqueVersions = new Set(Object.values(versions));
    if (uniqueVersions.size > 1) conflicts.push({ dependency: dep, versions });
  }
  return conflicts;
}`,
    testCases: [
      {
        input:
          'findSharedDependencyConflicts([{ name: "checkout", dependencies: { react: "18.2.0" } }, { name: "catalog", dependencies: { react: "17.0.0" } }])',
        expected:
          '[{ dependency: "react", versions: { checkout: "18.2.0", catalog: "17.0.0" } }]',
        label: "A mismatched shared dependency version is flagged",
      },
      {
        input:
          'findSharedDependencyConflicts([{ name: "checkout", dependencies: { react: "18.2.0" } }, { name: "catalog", dependencies: { react: "18.2.0" } }])',
        expected: "[]",
        label: "Matching versions across every app produce no conflicts",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
  {
    slug: "memoized-store-selector",
    conceptSlug: "state-management-at-scale",
    title: "Build a tiny store with a memoized selector",
    description: `The mechanism behind why a well-layered global store doesn't cause unrelated re-renders: selectors that only "change" when the slice they read actually changes.

## The problem

A naive global store re-renders every subscriber whenever *any* part of the state changes — a component reading only \`user\` shouldn't recompute or re-render when an unrelated \`theme\` field changes.

## The idea

A selector wraps a plain function over the store's state, but only counts as having "changed" when the value it extracts is different from last time — an unrelated state change still calls the selector function, but its result is recognized as unchanged.

## Your task

Write \`createStore(initialState)\`, returning \`{ getState(), setState(partial), subscribe(listener) }\` (a shallow-merging store). Write \`createSelector(store, selectorFn)\`, returning a \`select()\` function whose \`.getComputeCount()\` only increments when \`selectorFn\`'s result actually differs from the previous call:

\`\`\`js
const store = createStore({ user: "Alice", theme: "dark" });
const selectUser = createSelector(store, (s) => s.user);
selectUser(); // "Alice", computeCount → 1
store.setState({ theme: "light" }); // unrelated change
selectUser(); // "Alice", computeCount still 1
store.setState({ user: "Bob" });
selectUser(); // "Bob", computeCount → 2
\`\`\``,
    starterCode: `function createStore(initialState) {
  // getState/setState (shallow merge)/subscribe
}
function createSelector(store, selectorFn) {
  // select() recomputes selectorFn every call, but only bumps computeCount
  // when the result actually differs from the previous one
}`,
    solutionCode: `function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState() {
      return state;
    },
    setState(partial) {
      state = { ...state, ...partial };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
function createSelector(store, selectorFn) {
  let lastResult;
  let hasRun = false;
  let computeCount = 0;
  function select() {
    const result = selectorFn(store.getState());
    if (!hasRun || result !== lastResult) {
      computeCount++;
      lastResult = result;
      hasRun = true;
    }
    return lastResult;
  }
  select.getComputeCount = () => computeCount;
  return select;
}`,
    testCases: [
      {
        input: "an unrelated setState() call after selecting once",
        expected: "getComputeCount() stays the same",
        label: "A change to a different field never bumps the selector's compute count",
      },
      {
        input: "a setState() call that changes the selected field",
        expected: "getComputeCount() increments",
        label: "A change to the selected field itself bumps the compute count",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },
];

// ── Roadmaps ──────────────────────────────────────────────────────────────────

const ROADMAPS: RoadmapSeed[] = [
  {
    slug: "frontend-foundations",
    title: "Frontend Foundations",
    description:
      "Build a solid mental model of how browsers and JavaScript actually work — the concepts that underpin every frontend interview.",
    orderIndex: 1,
    steps: ["event-loop", "browser-rendering-pipeline", "css-specificity", "react-rendering"],
  },
  {
    slug: "react-expert-path",
    title: "React Expert Path",
    description:
      "Go deep on React, TypeScript, performance, and accessibility — the stack expected of a senior frontend engineer.",
    orderIndex: 2,
    steps: ["type-narrowing", "react-rendering", "core-web-vitals", "aria-roles-and-semantic-html"],
  },
];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("[seed] Inserting concepts...");
  // onConflictDoUpdate (not DoNothing) so re-running backfills orderIndex/title
  // changes onto existing concepts — needed by Feature 40, which renumbers and
  // renames concepts already seeded by earlier features as Phase 10 slots new
  // concepts in around them. Still idempotent on slug.
  const insertedConcepts = await db
    .insert(concepts)
    .values(CONCEPTS.map((c) => ({ ...c })))
    .onConflictDoUpdate({
      target: concepts.slug,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        difficulty: sql`excluded.difficulty`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ id: concepts.id, slug: concepts.slug });

  // Build a slug → id map from what's now in the DB (inserted + pre-existing)
  const allConcepts = await db
    .select({ id: concepts.id, slug: concepts.slug })
    .from(concepts);
  const conceptBySlug = Object.fromEntries(allConcepts.map((c) => [c.slug, c.id]));
  console.log(`[seed] ${insertedConcepts.length} concept(s) upserted (${allConcepts.length} total)`);

  console.log("[seed] Inserting challenges...");
  const challengeValues = CHALLENGES.map(({ conceptSlug, ...ch }) => {
    // Fail fast: a conceptSlug that doesn't resolve is a seed-data bug, not a
    // reason to silently insert an unlinked challenge.
    if (conceptSlug && !conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Challenge "${ch.slug}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return {
      ...ch,
      isPremium: ch.isPremium ?? false,
      conceptId: conceptSlug ? conceptBySlug[conceptSlug] : null,
    };
  });
  // onConflictDoUpdate (not DoNothing) so re-running backfills conceptId onto
  // challenges seeded before they were concept-linked. Still idempotent on slug.
  const insertedChallenges = await db
    .insert(challenges)
    .values(challengeValues)
    .onConflictDoUpdate({
      target: challenges.slug,
      set: {
        // COALESCE so a standalone challenge (no conceptSlug → null) never
        // clobbers an existing link on re-run; a real new link still applies.
        conceptId: sql`COALESCE(excluded.concept_id, ${challenges.conceptId})`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        difficulty: sql`excluded.difficulty`,
        starterCode: sql`excluded.starter_code`,
        solutionCode: sql`excluded.solution_code`,
        testCases: sql`excluded.test_cases`,
        hints: sql`excluded.hints`,
        companies: sql`excluded.companies`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: challenges.slug });
  console.log(`[seed] ${insertedChallenges.length} challenge(s) upserted`);

  console.log("[seed] Inserting interview questions...");
  const questionValues = INTERVIEW_QUESTIONS.map(({ conceptSlug, ...q }) => {
    // Fail fast: a conceptSlug that doesn't resolve is a seed-data bug, not a
    // reason to silently insert an unlinked question (mirrors challenges above).
    if (conceptSlug && !conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Interview question "${q.question}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return {
      ...q,
      isPremium: q.isPremium ?? false,
      conceptId: conceptSlug ? conceptBySlug[conceptSlug] : null,
    };
  });
  // onConflictDoUpdate (not DoNothing) so re-running backfills concept_id onto
  // questions seeded before they were concept-linked. Idempotent on (collection,
  // order_index) — same caveat as CHALLENGES' slug-based identity, but this table
  // has no stable per-row key: reordering questions within a collection (rather
  // than appending) will upsert onto the wrong existing row instead of the
  // intended one, and can leave a stale duplicate behind. Fixing this properly
  // needs a schema change (a stable `slug`/key column, unique per row) — tracked
  // as a known follow-up, out of scope for this pass since it isn't hit by any
  // seed edit made so far (only appends, never reorders).
  const insertedQuestions = await db
    .insert(interviewQuestions)
    .values(questionValues)
    .onConflictDoUpdate({
      target: [interviewQuestions.collection, interviewQuestions.orderIndex],
      set: {
        // COALESCE so an unlinked question (null) never clobbers an existing
        // link on re-run; a real new link still applies.
        conceptId: sql`COALESCE(excluded.concept_id, ${interviewQuestions.conceptId})`,
        question: sql`excluded.question`,
        answer: sql`excluded.answer`,
        difficulty: sql`excluded.difficulty`,
        companies: sql`excluded.companies`,
        isPremium: sql`excluded.is_premium`,
      },
    })
    .returning({ id: interviewQuestions.id });
  console.log(`[seed] ${insertedQuestions.length} question(s) upserted`);

  console.log("[seed] Inserting project briefs...");
  const projectBriefValues = PROJECT_BRIEFS.map(({ conceptSlug, ...pb }) => {
    // Fail fast, same as CHALLENGES/INTERVIEW_QUESTIONS above — a project brief
    // is always concept-linked (no standalone case), so an unknown conceptSlug
    // is a seed-data bug.
    if (!conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Project brief "${pb.slug}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return { ...pb, isPremium: pb.isPremium ?? false, conceptId: conceptBySlug[conceptSlug] };
  });
  const insertedProjectBriefs = await db
    .insert(projectBriefs)
    .values(projectBriefValues)
    .onConflictDoUpdate({
      target: projectBriefs.slug,
      set: {
        conceptId: sql`excluded.concept_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        starterCode: sql`excluded.starter_code`,
        solutionCode: sql`excluded.solution_code`,
        testCases: sql`excluded.test_cases`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: projectBriefs.slug });
  console.log(`[seed] ${insertedProjectBriefs.length} project brief(s) upserted`);

  console.log("[seed] Inserting roadmaps...");
  for (const roadmap of ROADMAPS) {
    const { steps: stepSlugs, ...roadmapData } = roadmap;

    const [inserted] = await db
      .insert(roadmaps)
      .values(roadmapData)
      .onConflictDoNothing({ target: roadmaps.slug })
      .returning({ id: roadmaps.id, slug: roadmaps.slug });

    // Fetch the ID whether we just inserted or it pre-existed
    const allRoadmaps = await db
      .select({ id: roadmaps.id, slug: roadmaps.slug })
      .from(roadmaps);
    const roadmapId = allRoadmaps.find((r) => r.slug === roadmap.slug)?.id;
    if (!roadmapId) continue;

    const stepRows = stepSlugs
      .map((slug, i) => {
        const conceptId = conceptBySlug[slug];
        if (!conceptId) {
          console.warn(`[seed] No concept found for slug "${slug}" — skipping step`);
          return null;
        }
        return { roadmapId, conceptId, orderIndex: i + 1 };
      })
      .filter(Boolean) as { roadmapId: string; conceptId: string; orderIndex: number }[];

    if (stepRows.length) {
      await db
        .insert(roadmapSteps)
        .values(stepRows)
        .onConflictDoNothing({ target: [roadmapSteps.roadmapId, roadmapSteps.orderIndex] });
    }

    const action = inserted ? "inserted" : "already existed";
    console.log(`[seed] Roadmap "${roadmap.slug}" ${action}, ${stepRows.length} step(s) upserted`);
  }

  console.log("[seed] Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error("[seed] Fatal error:", err);
  pool.end();
  process.exit(1);
});

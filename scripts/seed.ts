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
    orderIndex: 5,
  },
  {
    slug: "web-security-fundamentals",
    title: "Web Security Fundamentals (XSS, CSRF, CSP)",
    description:
      "Learn the three attacks every frontend has to defend against — XSS, CSRF, and clickjacking — and how CSP, sanitization, and same-site cookies stop them.",
    category: "browser-internals",
    difficulty: "advanced",
    orderIndex: 6,
  },
  {
    slug: "the-network-stack",
    title: "The Network Stack (DNS → TCP → TLS → HTTP)",
    description:
      "Trace what actually happens between typing a URL and seeing a page: DNS resolution, the TCP handshake, TLS negotiation, and the HTTP request/response itself.",
    category: "browser-internals",
    difficulty: "advanced",
    orderIndex: 7,
  },
  {
    slug: "service-workers-caching-strategies",
    title: "Service Workers & Caching Strategies",
    description:
      "See how a service worker intercepts network requests to enable offline support, and compare cache-first, network-first, and stale-while-revalidate strategies.",
    category: "browser-internals",
    difficulty: "advanced",
    orderIndex: 8,
  },
  {
    slug: "web-workers-concurrency",
    title: "Web Workers & Concurrency",
    description:
      "Learn how Web Workers run JavaScript on a separate thread to keep expensive computation off the main thread, and how they communicate via postMessage.",
    category: "browser-internals",
    difficulty: "advanced",
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
    orderIndex: 4,
  },
  {
    slug: "context-api-prop-drilling",
    title: "Context API & Prop Drilling",
    description:
      "See how prop drilling forces data through components that don't need it, and how the Context API lets any descendant read shared state directly.",
    category: "react",
    difficulty: "intermediate",
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
    orderIndex: 7,
  },
  {
    slug: "custom-hooks-composition",
    title: "Custom Hooks & Composition",
    description:
      "Learn how extracting a use* function lets you share stateful logic between components, and the rules that keep custom hooks composable.",
    category: "react",
    difficulty: "intermediate",
    orderIndex: 8,
  },
  {
    slug: "error-boundaries",
    title: "Error Boundaries",
    description:
      "See how an Error Boundary component catches render-time errors in its subtree and shows a fallback UI instead of crashing the whole app.",
    category: "react",
    difficulty: "advanced",
    orderIndex: 9,
  },
  {
    slug: "render-performance-memoization",
    title: "Render Performance: memo, useMemo, useCallback",
    description:
      "Learn how React.memo, useMemo, and useCallback skip unnecessary re-renders and recalculations — and why profiling before adding them matters more than the APIs themselves.",
    category: "react",
    difficulty: "advanced",
    orderIndex: 10,
  },
  {
    slug: "concurrent-react-suspense",
    title: "Concurrent React & Suspense",
    description:
      "Understand how Concurrent React lets rendering be interrupted and resumed, and how Suspense boundaries show a fallback while a component waits on data.",
    category: "react",
    difficulty: "advanced",
    orderIndex: 11,
  },
  {
    slug: "state-management-tradeoffs",
    title: "State Management Tradeoffs",
    description:
      "Compare local state, Context, and external stores (Redux, Zustand, Jotai) for where shared state should live, and the tradeoffs of each as an app scales.",
    category: "react",
    difficulty: "advanced",
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
    orderIndex: 6,
  },
  {
    slug: "responsive-design-container-queries",
    title: "Responsive Design & Container Queries",
    description:
      "Learn how media queries respond to the viewport while container queries respond to a component's own size — and why the latter makes components truly reusable.",
    category: "css",
    difficulty: "intermediate",
    orderIndex: 7,
  },
  {
    slug: "custom-properties-theming",
    title: "Custom Properties & Theming",
    description:
      "See how CSS custom properties (--variables) cascade and can be redefined per scope, powering runtime theming without a CSS-in-JS build step.",
    category: "css",
    difficulty: "intermediate",
    orderIndex: 8,
  },
  {
    slug: "pseudo-classes-pseudo-elements-has",
    title: "Selectors: Pseudo-classes, Pseudo-elements & :has()",
    description:
      "Compare pseudo-classes like :hover/:nth-child to pseudo-elements like ::before, and see how :has() finally lets CSS select a parent based on its children.",
    category: "css",
    difficulty: "advanced",
    orderIndex: 9,
  },
  {
    slug: "animation-performance",
    title: "Animation Performance",
    description:
      "Understand why transform and opacity animate on the GPU compositor while properties like width or top trigger layout and paint, and cost far more.",
    category: "css",
    difficulty: "advanced",
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
    orderIndex: 3,
  },
  {
    slug: "utility-types",
    title: "Utility Types (Partial, Pick, Omit, Record)",
    description:
      "Learn how Partial, Pick, Omit, and Record transform existing types instead of redefining them by hand, and how they compose together.",
    category: "typescript",
    difficulty: "intermediate",
    orderIndex: 4,
  },
  {
    slug: "type-narrowing",
    title: "Type Narrowing",
    description:
      "Use control-flow analysis, type guards, and discriminated unions to refine wide types to precise ones at compile time.",
    category: "typescript",
    difficulty: "intermediate",
    orderIndex: 5,
  },
  {
    slug: "discriminated-unions",
    title: "Discriminated Unions in Practice",
    description:
      "See how a shared literal type/kind field lets TypeScript narrow a union to the exact variant inside a conditional, eliminating a whole class of runtime checks.",
    category: "typescript",
    difficulty: "advanced",
    orderIndex: 6,
  },
  {
    slug: "conditional-mapped-types",
    title: "Conditional & Mapped Types",
    description:
      "Learn how conditional types (T extends U ? X : Y) and mapped types ({ [K in keyof T]: ... }) let TypeScript compute new types from existing ones.",
    category: "typescript",
    difficulty: "advanced",
    orderIndex: 7,
  },
  {
    slug: "template-literal-branded-types",
    title: "Template Literal & Branded Types",
    description:
      "See how template literal types build string types from patterns, and how branded types simulate nominal typing to stop structurally-identical values from being mixed up.",
    category: "typescript",
    difficulty: "advanced",
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
    orderIndex: 4,
  },
  {
    slug: "accessible-forms",
    title: "Accessible Forms",
    description:
      "See how labels, error messaging, and aria-describedby connect a form control to the information a screen reader needs to announce it correctly.",
    category: "accessibility",
    difficulty: "intermediate",
    orderIndex: 5,
  },
  {
    slug: "aria-live-regions",
    title: "ARIA Live Regions",
    description:
      "Learn how aria-live announces dynamic content changes — toasts, form errors, loading states — to screen reader users without moving their focus.",
    category: "accessibility",
    difficulty: "advanced",
    orderIndex: 6,
  },
  {
    slug: "accessible-component-patterns",
    title: "Accessible Component Patterns",
    description:
      "Compare the keyboard and ARIA requirements for modals, menus, and comboboxes — the widgets most commonly built inaccessibly from scratch.",
    category: "accessibility",
    difficulty: "advanced",
    orderIndex: 7,
  },
  {
    slug: "automated-a11y-testing",
    title: "Automated a11y Testing (axe-core, Lighthouse)",
    description:
      "Learn what automated tools like axe-core and Lighthouse can and can't catch, and where manual keyboard/screen-reader testing still has to fill the gap.",
    category: "accessibility",
    difficulty: "advanced",
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
    orderIndex: 2,
  },
  {
    slug: "resource-loading-render-blocking",
    title: "Resource Loading & Render-Blocking",
    description:
      "Understand preload/prefetch/preconnect hints and async/defer script loading, and how each changes what the browser fetches early versus what it can defer.",
    category: "performance",
    difficulty: "intermediate",
    orderIndex: 3,
  },
  {
    slug: "core-web-vitals",
    title: "Core Web Vitals",
    description:
      "Measure and optimize LCP, INP, and CLS — Google's metrics for real-world page experience and search ranking.",
    category: "performance",
    difficulty: "intermediate",
    orderIndex: 4,
  },
  {
    slug: "list-virtualization",
    title: "List Virtualization",
    description:
      "See how windowing renders only the visible rows of a huge list, keeping the DOM node count — and scroll performance — constant regardless of list size.",
    category: "performance",
    difficulty: "intermediate",
    orderIndex: 5,
  },
  {
    slug: "profiling-with-devtools",
    title: "Profiling with DevTools",
    description:
      "Learn how to read a Performance panel flame chart and the React DevTools Profiler to find the actual bottleneck instead of guessing.",
    category: "performance",
    difficulty: "advanced",
    orderIndex: 6,
  },
  {
    slug: "streaming-ssr-hydration",
    title: "Streaming SSR & Hydration",
    description:
      "Understand how streaming SSR sends the page shell immediately and streams in slower content, and how hydration attaches React's event handlers to that server-rendered HTML.",
    category: "performance",
    difficulty: "advanced",
    orderIndex: 7,
  },
  {
    slug: "performance-budgets",
    title: "Performance Budgets",
    description:
      "Learn how setting hard limits on bundle size, load time, or Core Web Vitals scores in CI keeps performance from silently regressing over time.",
    category: "performance",
    difficulty: "advanced",
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
    orderIndex: 1,
  },
  {
    slug: "api-design-data-fetching-strategy",
    title: "API Design & Data-Fetching Strategy",
    description:
      "Compare REST, GraphQL, and RPC-style APIs, and the client-side tradeoffs of fetching data on the server, on mount, or via a cache-aware library.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 2,
  },
  {
    slug: "designing-real-time-updates",
    title: "Designing Real-Time Updates (WebSockets, SSE, polling)",
    description:
      "Compare polling, Server-Sent Events, and WebSockets for pushing live updates to a client, and when each one's tradeoffs make it the right choice.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 3,
  },
  {
    slug: "designing-infinite-scroll-feed",
    title: "Designing an Infinite-Scroll Feed",
    description:
      "Design the pagination, caching, and scroll-position contract behind a feed that loads more content as the user scrolls, without janky re-fetches or lost position.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 4,
  },
  {
    slug: "designing-realtime-collaborative-editor",
    title: "Designing a Real-Time Collaborative Editor",
    description:
      "Design the conflict-resolution layer — Operational Transformation or CRDTs — behind a document multiple users can edit at once without corrupting each other's changes.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 5,
  },
  {
    slug: "frontend-architecture-patterns",
    title: "Frontend Architecture Patterns",
    description:
      "Compare component-driven, micro-frontend, and monorepo architectures and know when to use each at scale.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 6,
  },
  {
    slug: "state-management-at-scale",
    title: "State Management at Scale",
    description:
      "Compare how server state, UI state, and global app state should be layered differently as a frontend codebase and team both grow.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 7,
  },
];

// ── Challenges ────────────────────────────────────────────────────────────────

const CHALLENGES: ChallengeSeed[] = [
  {
    slug: "implement-debounce",
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
    conceptSlug: "react-rendering",
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
    isPremium: false,
    orderIndex: 2,
  },
  {
    slug: "specificity-calculator",
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
    question: "How would you design an infinite-scroll news feed?",
    answer:
      "**Requirements:** fast initial load, smooth scrolling, fresh content, back-navigation restores position.\n\n**API design:** cursor-based pagination (not offset) — `GET /feed?after=<cursor>&limit=20`. Cursor is an opaque server token (e.g. encoded timestamp + id) that's stable even if new posts are inserted.\n\n**Client:**\n- Fetch the first page on load; fetch the next page when the user scrolls near the bottom (IntersectionObserver on a sentinel element)\n- Cache pages in memory (React Query, SWR) — don't refetch on back-navigation\n- Virtualise the list with a library like `react-window` if posts are numerous\n- Store scroll position + cursor in session storage so the browser's back button restores the position\n\n**Freshness:** Poll for new items at the top at a low frequency (30s) without resetting the cursor; surface a 'X new posts' banner rather than auto-inserting and shifting the user's reading position.\n\n**CDN:** Edge-cache feed responses for a short TTL (5–30s) to reduce origin load.",
    difficulty: "medium",
    companies: ["Meta", "Twitter", "LinkedIn"],
    orderIndex: 2,
  },
  {
    collection: "ff-system-design",
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

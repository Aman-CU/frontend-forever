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
    conceptSlug: "event-loop",
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

  // ff-javascript
  {
    collection: "ff-javascript",
    question: "Explain how prototypal inheritance works in JavaScript.",
    answer:
      "Every JavaScript object has an internal `[[Prototype]]` link to another object (or `null`). When you access a property, the engine first checks the object itself, then walks the prototype chain until it finds the property or reaches `null`.\n\nYou set up inheritance by linking prototypes: `Object.create(parentProto)` creates an object whose `[[Prototype]]` is `parentProto`. The `class` syntax is syntactic sugar over this mechanism — `extends` sets up the prototype chain and `super()` calls the parent constructor. Understanding the underlying chain explains why `instanceof` works, why methods can be shared across instances, and what `hasOwnProperty` guards against.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 1,
  },
  {
    collection: "ff-javascript",
    question: "What is a closure and when would you use one?",
    answer:
      "A closure is a function that retains access to the variables from its defining scope, even after that scope has returned. Every function in JavaScript closes over its surrounding scope.\n\nCommon uses:\n- **Private state** — module pattern, encapsulating variables that shouldn't be directly accessible\n- **Partial application / currying** — baking some arguments into a function\n- **Event handlers** — the handler closes over the relevant state at setup time\n- **Memoization** — a closure holds the cache object\n\nThe gotcha: all closures from the same scope share the same variable binding, so closures created in a `for` loop with `var` all see the final value of the loop variable unless you use `let` or an IIFE.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe", "Airbnb"],
    orderIndex: 2,
  },
  {
    collection: "ff-javascript",
    question: "What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.any`, and `Promise.race`?",
    answer:
      "All four accept an iterable of promises:\n\n- **`Promise.all`** — resolves when all resolve, rejects immediately if any rejects (short-circuits). Use when you need every result and a single failure should abort.\n- **`Promise.allSettled`** — waits for every promise regardless of outcome, resolves with an array of `{ status, value/reason }` objects. Use when you need all outcomes.\n- **`Promise.any`** — resolves with the first successful result, rejects only if all reject (with an `AggregateError`). Use for fallback/racing to first success.\n- **`Promise.race`** — settles with the first promise to settle (resolve or reject). Use for timeouts.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 3,
  },
  {
    collection: "ff-javascript",
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

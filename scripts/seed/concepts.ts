import type { ConceptSeed } from "./types";

export const CONCEPTS: ConceptSeed[] = [
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
  }
];

/**
 * Seed script â€” run with: npx tsx scripts/seed.ts
 * Safe to re-run: all inserts are idempotent (keyed on slug or collection+order_index).
 * Extend this file as platform content grows; never bake seeds into migrations.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { concepts, challenges, interviewQuestions, roadmaps, roadmapSteps } from "../src/lib/schema";
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
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
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

// â”€â”€ DB connection (same TLS pattern as drizzle.config.ts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: url.toString(),
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
});

const db = drizzle(pool);

// â”€â”€ Concepts (one per category) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CONCEPTS: ConceptSeed[] = [
  {
    slug: "event-loop",
    title: "Event Loop",
    description:
      "Understand how JavaScript's single-threaded runtime handles async code via the call stack, task queue, and microtask queue.",
    category: "javascript-runtime",
    difficulty: "intermediate",
    orderIndex: 1,
  },
  {
    slug: "browser-rendering-pipeline",
    title: "Browser Rendering Pipeline",
    description:
      "Trace how a browser turns HTML and CSS into pixels: DOM, CSSOM, Render Tree, Layout, Paint, and Composite.",
    category: "browser-internals",
    difficulty: "intermediate",
    orderIndex: 1,
  },
  {
    slug: "react-rendering",
    title: "React Rendering",
    description:
      "See how React's reconciler decides which components to re-render, diffs the Virtual DOM, and commits changes to the real DOM.",
    category: "react",
    difficulty: "intermediate",
    orderIndex: 1,
  },
  {
    slug: "css-specificity",
    title: "CSS Specificity",
    description:
      "Learn how browsers resolve competing CSS rules using the [id, class, element] specificity scoring system.",
    category: "css",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "type-narrowing",
    title: "Type Narrowing",
    description:
      "Use control-flow analysis, type guards, and discriminated unions to refine wide types to precise ones at compile time.",
    category: "typescript",
    difficulty: "intermediate",
    orderIndex: 1,
  },
  {
    slug: "aria-roles-and-semantic-html",
    title: "ARIA Roles and Semantic HTML",
    description:
      "Make your UIs usable by everyone: learn when to use semantic HTML, when ARIA roles are needed, and what to never do.",
    category: "accessibility",
    difficulty: "beginner",
    orderIndex: 1,
  },
  {
    slug: "core-web-vitals",
    title: "Core Web Vitals",
    description:
      "Measure and optimize LCP, INP, and CLS â€” Google's metrics for real-world page experience and search ranking.",
    category: "performance",
    difficulty: "intermediate",
    orderIndex: 1,
  },
  {
    slug: "frontend-architecture-patterns",
    title: "Frontend Architecture Patterns",
    description:
      "Compare component-driven, micro-frontend, and monorepo architectures and know when to use each at scale.",
    category: "system-design",
    difficulty: "advanced",
    orderIndex: 1,
  },
];

// â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    description:
      "Virtualization keeps a list of 10,000 rows at 60fps by only rendering the rows currently in view. The heart of it is the windowing math. Write `visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan)` that returns `{ start, end }` — the inclusive index range of rows to render. Clamp to `[0, totalRows - 1]` and include an `overscan` buffer of extra rows above and below the viewport to prevent flicker.",
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
    description:
      "Given a CSS selector string, return its specificity as a `[id, class, element]` tuple. Handle IDs (`#`), classes (`.`), attributes (`[]`), pseudo-classes (`:`), elements, and pseudo-elements (`::`). Ignore the universal selector (`*`) and combinators.",
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
      "Attribute selectors `[...]` count as a class-level specificity â€” strip them first to avoid false matches.",
      "The universal selector `*` contributes 0 to all three counts.",
    ],
    orderIndex: 1,
  },
];

// â”€â”€ Interview questions (5 per collection) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INTERVIEW_QUESTIONS: InterviewQuestionSeed[] = [
  // ff-75
  {
    collection: "ff-75",
    question: "What is the event loop and why does it exist?",
    answer:
      "JavaScript is single-threaded â€” only one piece of code runs at a time. The event loop is the mechanism that lets it handle async work (timers, network requests, user events) without blocking. It continuously checks the call stack; when the stack is empty, it processes the microtask queue fully, then picks one task from the task queue, runs it to completion, and repeats.\n\nThis matters because blocking the call stack for even a few hundred milliseconds will make the UI unresponsive â€” the event loop is what lets JavaScript appear concurrent.",
    difficulty: "easy",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 1,
  },
  {
    collection: "ff-75",
    question: "What is the difference between `null` and `undefined` in JavaScript?",
    answer:
      "`undefined` means a variable has been declared but not yet assigned a value â€” it's the runtime's default. `null` is an explicit absence of value intentionally set by the programmer.\n\nKey differences: `typeof undefined` is `'undefined'`; `typeof null` is `'object'` (a historical bug in JS). `undefined == null` is `true` (loose equality), but `undefined === null` is `false` (strict equality). Always use strict equality to distinguish them.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 2,
  },
  {
    collection: "ff-75",
    question: "Explain CSS specificity and how conflicts are resolved.",
    answer:
      "When multiple CSS rules target the same element, the browser uses specificity to decide which rule wins. Specificity is a three-part score: [id, class, element]. IDs contribute to the first bucket, class selectors / attribute selectors / pseudo-classes to the second, and type selectors / pseudo-elements to the third.\n\nThe scores are compared left-to-right: a rule with any ID wins over one with no IDs, regardless of how many classes the loser has. If specificity ties, the last rule in source order wins. `!important` overrides all specificity and should be avoided.",
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 3,
  },
  {
    collection: "ff-75",
    question: "What happens when you type a URL in the browser and press Enter?",
    answer:
      "1. **DNS resolution** â€” the browser resolves the hostname to an IP address, checking its cache, then the OS, then a DNS resolver.\n2. **TCP + TLS handshake** â€” a connection is established; HTTPS negotiates a TLS session.\n3. **HTTP request** â€” the browser sends a GET request; the server responds with HTML.\n4. **HTML parsing** â€” the browser parses HTML top-to-bottom, constructing the DOM. When it encounters `<link rel='stylesheet'>` it fetches CSS (render-blocking). `<script>` without `async`/`defer` is also render-blocking.\n5. **Render pipeline** â€” DOM + CSSOM â†’ Render Tree â†’ Layout â†’ Paint â†’ Composite â†’ pixels on screen.\n6. **Subsequent requests** â€” images, fonts, JS, etc. are fetched as discovered.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft", "Stripe"],
    orderIndex: 4,
  },
  {
    collection: "ff-75",
    question: "What is the difference between `==` and `===` in JavaScript?",
    answer:
      "`===` (strict equality) checks both value and type â€” no coercion. `==` (loose equality) performs type coercion before comparing, following a complex set of rules that can produce surprising results:\n\n```js\n0 == false   // true  (false coerces to 0)\n'' == false  // true\nnull == undefined // true\nnull == 0   // false\n```\n\nAlways prefer `===` unless you specifically need the `null == undefined` coercion (checking for either), which is the one common legitimate use of `==`.",
    difficulty: "easy",
    companies: ["Meta", "Stripe"],
    orderIndex: 5,
  },

  // ff-javascript
  {
    collection: "ff-javascript",
    question: "Explain how prototypal inheritance works in JavaScript.",
    answer:
      "Every JavaScript object has an internal `[[Prototype]]` link to another object (or `null`). When you access a property, the engine first checks the object itself, then walks the prototype chain until it finds the property or reaches `null`.\n\nYou set up inheritance by linking prototypes: `Object.create(parentProto)` creates an object whose `[[Prototype]]` is `parentProto`. The `class` syntax is syntactic sugar over this mechanism â€” `extends` sets up the prototype chain and `super()` calls the parent constructor. Understanding the underlying chain explains why `instanceof` works, why methods can be shared across instances, and what `hasOwnProperty` guards against.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 1,
  },
  {
    collection: "ff-javascript",
    question: "What is a closure and when would you use one?",
    answer:
      "A closure is a function that retains access to the variables from its defining scope, even after that scope has returned. Every function in JavaScript closes over its surrounding scope.\n\nCommon uses:\n- **Private state** â€” module pattern, encapsulating variables that shouldn't be directly accessible\n- **Partial application / currying** â€” baking some arguments into a function\n- **Event handlers** â€” the handler closes over the relevant state at setup time\n- **Memoization** â€” a closure holds the cache object\n\nThe gotcha: all closures from the same scope share the same variable binding, so closures created in a `for` loop with `var` all see the final value of the loop variable unless you use `let` or an IIFE.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe", "Airbnb"],
    orderIndex: 2,
  },
  {
    collection: "ff-javascript",
    question: "What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.any`, and `Promise.race`?",
    answer:
      "All four accept an iterable of promises:\n\n- **`Promise.all`** â€” resolves when all resolve, rejects immediately if any rejects (short-circuits). Use when you need every result and a single failure should abort.\n- **`Promise.allSettled`** â€” waits for every promise regardless of outcome, resolves with an array of `{ status, value/reason }` objects. Use when you need all outcomes.\n- **`Promise.any`** â€” resolves with the first successful result, rejects only if all reject (with an `AggregateError`). Use for fallback/racing to first success.\n- **`Promise.race`** â€” settles with the first promise to settle (resolve or reject). Use for timeouts.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 3,
  },
  {
    collection: "ff-javascript",
    question: "Explain the `this` keyword and how it's determined.",
    answer:
      "`this` is determined at call time, not definition time (except for arrow functions):\n\n1. **Regular function call** â€” `this` is `globalThis` (or `undefined` in strict mode)\n2. **Method call** â€” `obj.method()` â†’ `this` is `obj`\n3. **Constructor call** â€” `new Fn()` â†’ `this` is the new instance\n4. **Explicit binding** â€” `.call(ctx)`, `.apply(ctx)`, `.bind(ctx)` â†’ `this` is `ctx`\n5. **Arrow function** â€” no own `this`; inherits from the enclosing lexical scope at definition time\n\nThe last rule is why arrow functions are preferred for callbacks: they don't rebind `this`, so a method using `setTimeout(() => this.update(), 100)` keeps the intended receiver.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft"],
    orderIndex: 4,
  },
  {
    collection: "ff-javascript",
    question: "What is event delegation and why is it useful?",
    answer:
      "Event delegation attaches a single event listener to a parent element instead of one listener per child, exploiting the fact that events bubble up the DOM tree.\n\n```js\ndocument.querySelector('#list').addEventListener('click', (e) => {\n  if (e.target.matches('li')) handleItem(e.target);\n});\n```\n\nWhy it matters:\n- **Performance** â€” one listener vs. potentially thousands\n- **Dynamic children** â€” works for elements added to the DOM after the listener is attached (the classic problem with directly-bound handlers)\n- **Memory** â€” fewer listeners means less memory retained\n\nThe tradeoff: the handler must check `e.target` to identify which child fired the event, adding a little logic overhead.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 5,
  },

  // ff-react
  {
    collection: "ff-react",
    question: "When does React re-render a component?",
    answer:
      "React re-renders a component in three situations:\n\n1. **Its own state changes** â€” via `setState` (class) or a state setter from `useState`/`useReducer`\n2. **Its parent re-renders** â€” by default, React re-renders all children when a parent re-renders, regardless of whether props changed\n3. **A context it consumes changes** â€” any component calling `useContext` re-renders when the context value changes\n\nTo opt out of parent-triggered re-renders, wrap the component in `React.memo`. To stabilize callbacks and objects passed as props (so `memo` actually helps), use `useCallback` and `useMemo`. The most common performance mistake is adding `memo`/`useCallback` before profiling â€” they have overhead too.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 1,
  },
  {
    collection: "ff-react",
    question: "What is the difference between `useEffect` and `useLayoutEffect`?",
    answer:
      "`useEffect` runs **after** the browser has painted â€” asynchronously. `useLayoutEffect` runs **before** the browser paints â€” synchronously after React commits DOM changes.\n\nUse `useLayoutEffect` when you need to read layout from the DOM (e.g. `getBoundingClientRect()`) and apply a change before the user sees the initial paint, preventing a visual flash. Otherwise, prefer `useEffect` â€” it doesn't block painting.\n\nPractical rule: start with `useEffect`. If you see a flicker on initial render, consider `useLayoutEffect`. On the server, `useLayoutEffect` emits a warning (it can't run on the server); use `useEffect` for SSR-safe logic.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 2,
  },
  {
    collection: "ff-react",
    question: "Explain the React reconciliation algorithm.",
    answer:
      "Reconciliation is how React decides what changed between renders and what DOM updates are needed.\n\nKey rules:\n1. **Different types â†’ full remount** â€” if the element type changes (e.g. `<div>` â†’ `<span>`), React destroys the old subtree and mounts a new one\n2. **Same type â†’ update in place** â€” React updates only the changed attributes/children\n3. **Lists need keys** â€” when rendering arrays, React uses `key` props to match old and new children. Without stable keys, React resorts to positional matching, which causes incorrect updates (and subtle bugs) when items are reordered or added at the beginning\n\nThe algorithm runs in O(n) time by making two assumptions: elements of different types produce different trees, and keys identify stable elements across renders.",
    difficulty: "medium",
    companies: ["Meta", "Google", "Airbnb"],
    orderIndex: 3,
  },
  {
    collection: "ff-react",
    question: "What is the purpose of `useRef` and when should you use it over `useState`?",
    answer:
      "`useRef` returns a mutable object `{ current: value }` that persists across renders but does **not** trigger a re-render when changed.\n\nUse `useRef` when:\n- **DOM access** â€” attaching to an element with `ref={myRef}` to call `.focus()`, measure layout, etc.\n- **Storing mutable values** that shouldn't cause re-renders â€” timer IDs, previous values, event handler references, imperative library instances\n- **Breaking stale closure problems** â€” store the latest value of a prop/state in a ref so an event handler always reads the current value\n\nIf a change should update the UI, use `useState`. If it's internal bookkeeping that doesn't affect rendering, use `useRef`.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 4,
  },
  {
    collection: "ff-react",
    question: "What is React Suspense and how does it work?",
    answer:
      "Suspense lets components declare that they're waiting for something (data, a lazy-loaded component) before rendering. While waiting, React shows a fallback UI defined by the nearest `<Suspense fallback={...}>` boundary.\n\nHow it works: a component 'suspends' by throwing a Promise. React catches it, renders the fallback, and retries the component when the Promise resolves. You don't throw the Promise manually â€” libraries like React Query, Relay, or `React.lazy` do it for you.\n\n```jsx\nconst LazyChart = React.lazy(() => import('./Chart'));\n<Suspense fallback={<Spinner />}>\n  <LazyChart />\n</Suspense>\n```\n\nIn React 18+, Suspense integrates with concurrent features â€” it enables streaming SSR (rendering the shell immediately, streaming shell content as it resolves) and transitions (keeping the current UI visible while the next route loads).",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 5,
  },

  // ff-system-design
  {
    collection: "ff-system-design",
    question: "How would you design a real-time collaborative text editor (like Google Docs)?",
    answer:
      "**Core challenge:** multiple users editing simultaneously without conflicting changes corrupting the document.\n\n**Approach: Operational Transformation (OT) or CRDTs**\n- OT transforms each operation relative to concurrent operations so they converge. Requires a central server to order operations.\n- CRDTs (e.g. Yjs, Automerge) allow peer-to-peer convergence without a central arbiter.\n\n**Architecture:**\n1. **Client** â€” local optimistic updates; send ops to server via WebSocket\n2. **Server** â€” orders ops, broadcasts to other clients, persists to DB\n3. **Transport** â€” WebSocket for real-time; HTTP fallback / periodic snapshots\n4. **Persistence** â€” store the op log + periodic document snapshots for efficient load\n5. **Presence** â€” cursor positions, user selections (ephemeral, not in op log)\n\n**Scalability:** Shard documents across servers; use a pub/sub (Redis, Kafka) to fan out ops to all connections for a given document.",
    difficulty: "hard",
    companies: ["Google", "Notion", "Figma"],
    isPremium: true,
    orderIndex: 1,
  },
  {
    collection: "ff-system-design",
    question: "How would you design an infinite-scroll news feed?",
    answer:
      "**Requirements:** fast initial load, smooth scrolling, fresh content, back-navigation restores position.\n\n**API design:** cursor-based pagination (not offset) â€” `GET /feed?after=<cursor>&limit=20`. Cursor is an opaque server token (e.g. encoded timestamp + id) that's stable even if new posts are inserted.\n\n**Client:**\n- Fetch the first page on load; fetch the next page when the user scrolls near the bottom (IntersectionObserver on a sentinel element)\n- Cache pages in memory (React Query, SWR) â€” don't refetch on back-navigation\n- Virtualise the list with a library like `react-window` if posts are numerous\n- Store scroll position + cursor in session storage so the browser's back button restores the position\n\n**Freshness:** Poll for new items at the top at a low frequency (30s) without resetting the cursor; surface a 'X new posts' banner rather than auto-inserting and shifting the user's reading position.\n\n**CDN:** Edge-cache feed responses for a short TTL (5â€“30s) to reduce origin load.",
    difficulty: "medium",
    companies: ["Meta", "Twitter", "LinkedIn"],
    orderIndex: 2,
  },
  {
    collection: "ff-system-design",
    question: "How would you design a client-side caching strategy for a large React application?",
    answer:
      "**Layers:**\n\n1. **Server state** (async, remote) â€” use a library (React Query, SWR, Apollo). They handle deduplication, background refetch, stale-while-revalidate, and cache invalidation. Never put server state in Redux/Zustand â€” that's the leading cause of stale data bugs.\n\n2. **UI state** (ephemeral, local) â€” useState, useReducer, or a lightweight store (Zustand, Jotai). Keep it as close to the consuming component as possible.\n\n3. **HTTP caching** â€” set correct `Cache-Control` headers on API responses. `stale-while-revalidate` allows serving a cached response while fetching a fresh one.\n\n4. **Persistent cache** â€” for offline support or faster first paint, serialise the React Query cache to `localStorage`/`IndexedDB` on unload and restore it on load (react-query's `persistQueryClient` plugin).\n\n**Cache invalidation strategy:** invalidate by tag (not by URL) â€” after a mutation, mark all queries with a given tag as stale so they refetch on next access. Optimistic updates (mutate the cache immediately, roll back on error) make mutations feel instant.",
    difficulty: "hard",
    companies: ["Google", "Airbnb", "Stripe"],
    isPremium: true,
    orderIndex: 3,
  },
  {
    collection: "ff-system-design",
    question: "How would you design a component library for a large organisation?",
    answer:
      "**Goals:** consistency, accessibility, performance, developer ergonomics, and independently versioned releases.\n\n**Structure:**\n- Monorepo (Turborepo/Nx) â€” one package per logical group (`@org/button`, `@org/form`) or a single `@org/ui` bundle\n- Design token layer â€” spacing, color, typography as CSS variables or a token file; consumed by all components\n- Accessibility by default â€” every interactive component passes axe/Playwright accessibility checks in CI\n- Headless primitives layer (Radix UI, Base UI, Ariakit) for complex widgets (menus, dialogs, comboboxes) to avoid reimplementing keyboard navigation and ARIA\n\n**Distribution:**\n- Build to ESM + CJS with tree-shaking support (Rollup/tsup)\n- Ship TypeScript types, not just `.d.ts` declarations\n- Publish to a private npm registry or Verdaccio for internal use\n\n**Governance:**\n- Changelog discipline (Changesets) â€” never break APIs without a major bump\n- Visual regression tests (Chromatic/Percy) â€” screenshot every story in CI\n- Storybook â€” living documentation and interaction tests",
    difficulty: "medium",
    companies: ["Airbnb", "Stripe", "Microsoft"],
    orderIndex: 4,
  },
  {
    collection: "ff-system-design",
    question: "How would you optimise a web app's Time to First Byte (TTFB) and Largest Contentful Paint (LCP)?",
    answer:
      "**TTFB (server response time):**\n- Move compute to the edge (Vercel Edge Functions, Cloudflare Workers) â€” run close to the user\n- Cache rendered HTML at the CDN with short TTLs (`s-maxage=60, stale-while-revalidate=300`)\n- Use streaming SSR (Next.js App Router) â€” flush the shell immediately, stream slow data\n- DB query optimisation â€” add missing indexes, avoid N+1, use connection pooling\n\n**LCP (largest visible element paints fast):**\n- The LCP element is usually a hero image or large heading â€” identify it with Chrome DevTools / WebPageTest\n- Preload the LCP image: `<link rel='preload' as='image' href='...'>`\n- Serve images in WebP/AVIF at the correct intrinsic size; use `srcset` + `sizes`\n- Eliminate render-blocking resources â€” defer non-critical JS, inline critical CSS\n- Use a CDN with edge PoPs close to users for static assets\n- Font loading: `font-display: swap` + `preload` the subset actually used above the fold",
    difficulty: "medium",
    companies: ["Google", "Stripe", "Amazon"],
    orderIndex: 5,
  },
];

// â”€â”€ Roadmaps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ROADMAPS: RoadmapSeed[] = [
  {
    slug: "frontend-foundations",
    title: "Frontend Foundations",
    description:
      "Build a solid mental model of how browsers and JavaScript actually work â€” the concepts that underpin every frontend interview.",
    orderIndex: 1,
    steps: ["event-loop", "browser-rendering-pipeline", "css-specificity", "react-rendering"],
  },
  {
    slug: "react-expert-path",
    title: "React Expert Path",
    description:
      "Go deep on React, TypeScript, performance, and accessibility â€” the stack expected of a senior frontend engineer.",
    orderIndex: 2,
    steps: ["type-narrowing", "react-rendering", "core-web-vitals", "aria-roles-and-semantic-html"],
  },
];

// â”€â”€ Seed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function seed() {
  console.log("[seed] Inserting concepts...");
  const insertedConcepts = await db
    .insert(concepts)
    .values(CONCEPTS.map((c) => ({ ...c })))
    .onConflictDoNothing({ target: concepts.slug })
    .returning({ id: concepts.id, slug: concepts.slug });

  // Build a slug â†’ id map from what's now in the DB (inserted + pre-existing)
  const allConcepts = await db
    .select({ id: concepts.id, slug: concepts.slug })
    .from(concepts);
  const conceptBySlug = Object.fromEntries(allConcepts.map((c) => [c.slug, c.id]));
  console.log(`[seed] ${insertedConcepts.length} new concept(s) inserted (${allConcepts.length} total)`);

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
  const insertedQuestions = await db
    .insert(interviewQuestions)
    .values(INTERVIEW_QUESTIONS.map((q) => ({ ...q, isPremium: q.isPremium ?? false })))
    .onConflictDoNothing({
      target: [interviewQuestions.collection, interviewQuestions.orderIndex],
    })
    .returning({ id: interviewQuestions.id });
  console.log(`[seed] ${insertedQuestions.length} new question(s) inserted`);

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
          console.warn(`[seed] No concept found for slug "${slug}" â€” skipping step`);
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

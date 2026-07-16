# Interview Prep Content Guide

Governs every question/answer written for Features 31 (FF Collections), 49 (FF System Design), and 50 (Playbook). Read this before authoring any Interview Prep content — the format was deliberately designed (not the simpler pattern Feature 29 used) and signed off via a 6-answer pilot before the full 299-question run started. See `progress-tracker.md` → Decisions Made, Pre-Feature-30 entry, for how this format was arrived at.

---

## The format, as a checklist

Every question page (`/interview-prep/[collection]/[question-slug]`) follows this shape:

1. **Meta title** — `[Question, phrased naturally] | Frontend Forever`, under ~60 characters
2. **Meta description** — one sentence, ~150–160 characters, itself a compressed answer (doubles as the SEO snippet and a GEO-quotable summary)
3. **H1** — the question, verbatim
4. **Answer-first paragraph** — the very next line after the H1. One self-contained sentence (or two) that fully answers the question before any elaboration. This is the single highest-leverage line on the page — it's what gets lifted into a featured snippet or quoted by an AI answer engine. Never bury the answer under throat-clearing ("Great question! Let's dive in...").
5. **Body sections**, each self-contained — no "as mentioned above," no pronoun dependencies on a prior paragraph. Assume any section may be extracted in isolation by a crawler or RAG chunker.
6. **Code examples** where the question is code-shaped — real, runnable-looking snippets, not pseudo-code, using the platform-wide syntax-highlighted code block renderer (Feature 29).
7. **Comparison tables** wherever the question is inherently comparative (`X vs Y`) — LLMs and search snippets both extract structured tables more reliably than prose.
8. **Diagrams** only for the subset of questions that are genuinely a flow/process concept (event loop, hydration, reconciliation, SSR/CSR/SSG, ISR, prototypal inheritance, virtual DOM diffing — an estimated 40–50 of the 299 seeded JS/React/Next.js questions). Hand-authored SVG, theme-aware via CSS variables, not raster images. **Not** the `rough.js`/sketchy-diagram treatment — that's reserved for Feature 49's System Design guide pages only.
9. **Related-content links** — related questions, the matching Learn concept (where one exists), the relevant Playbook chapter. Internal linking is part of the SEO/GEO strategy, not decoration.
10. **Structured data** — `FAQPage` JSON-LD on collection list pages (multiple Q&As); `Article`/`TechArticle` + `mainEntity` Q&A schema on individual question pages. `dateModified`/`datePublished` on every answer.
11. **Sources line** — for anything version-sensitive (a JS/TS language feature is usually safe; anything React- or Next.js-specific almost never is), web-search before writing and list what was checked at the bottom of the answer, same as the pilot did. Don't answer framework-API questions from training data alone — see the two corrections below for why.

## Non-negotiable accuracy rule

**Web-search before writing any React or Next.js API question.** Both frameworks move fast enough that "obviously true" answers from training data can be stale by the time they're published. Two real corrections the pilot caught, both worth internalizing before writing the remaining ~293:

- **`useMemo`**: React Compiler (stable as of v1.0, October 2025, part of the React 19.x line — there is no "React 20") auto-memoizes most cases now — manual `useMemo`/`useCallback` shifted from routine practice to a targeted escape hatch (mainly for guaranteeing referential stability into an effect dependency). An answer that doesn't mention this reads as outdated to anyone who's used React recently.
- **`getStaticProps`**: Pages Router only. Does not exist in the App Router — replaced by `fetch()` + `cache`/`next.revalidate` options and `generateStaticParams`. An answer that doesn't say this explicitly will confuse anyone working in a modern (App Router) codebase, which is the default for new projects as of 2026.

Assume every Next.js caching/rendering/routing question and every "how do you optimize X" React question needs the same scrutiny.

---

## The 6 pilot answers (approved by the user, 2026-07-14)

These are the concrete reference examples — closer to the source of truth than the checklist above, if the two ever seem to disagree.

### 1. JavaScript — Easy

**Meta title:** What's the Difference Between var, let, and const? | Frontend Forever
**Meta description:** var is function-scoped and hoisted as undefined; let and const are block-scoped and live in the temporal dead zone until initialized. const additionally forbids reassignment.

# What is the difference between `var`, `let`, and `const`?

`var` is function-scoped and hoisted with an initial value of `undefined`; `let` and `const` are block-scoped and stay uninitialized in the "temporal dead zone" until their declaration line runs. `const` additionally forbids reassigning the binding (though it doesn't make the value itself immutable).

### Scope

```js
function example() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  console.log(a); // 1 — var leaked out of the if block
  console.log(b); // ReferenceError — let is block-scoped
}
```

`var` only respects function boundaries, not block boundaries (`if`, `for`, `{}`). `let`/`const` respect both.

### Hoisting and the Temporal Dead Zone

All three are hoisted to the top of their scope, but differently:

| | Hoisted as | Accessible before declaration? |
|---|---|---|
| `var` | `undefined` | Yes — reads as `undefined`, no error |
| `let` | uninitialized | No — throws `ReferenceError` (temporal dead zone) |
| `const` | uninitialized | No — throws `ReferenceError` (temporal dead zone) |

### Reassignment vs. mutation

`const` blocks reassigning the *binding*, not mutating the *value*:

```js
const arr = [1, 2, 3];
arr.push(4);       // fine — mutating the array
arr = [5, 6];       // TypeError — reassigning the binding
```

### The practical rule

Default to `const`. Use `let` only when a variable genuinely needs reassignment (loop counters, accumulators). Avoid `var` in new code — its function-scoping and silent hoisting are the source of a whole class of classic JS bugs (loop-variable-capture in closures being the most common interview follow-up to this exact question).

**Diagram:** none needed — this is a comparison question, the table above does the job.

**Related:** Hoisting & the Temporal Dead Zone (Learn concept) · What are closures and how do they work? · What is the Temporal Dead Zone (TDZ)?

---

### 2. JavaScript — Hard

**Meta title:** What is the Event Loop in JavaScript? | Frontend Forever
**Meta description:** The event loop is the mechanism that lets single-threaded JavaScript handle async work without blocking — it drains the microtask queue completely between every single macrotask.

# What is the event loop in JavaScript?

JavaScript runs on a single thread, so the event loop is the mechanism that lets it handle asynchronous work — timers, network requests, user input — without blocking. It continuously checks whether the call stack is empty; whenever it is, it fully drains the microtask queue, then takes exactly one task from the macrotask queue, runs it to completion, and repeats.

### The three moving parts

- **Call stack** — synchronous code executes here, one frame at a time
- **Microtask queue** — Promise `.then`/`.catch`/`.finally` callbacks, `queueMicrotask`
- **Macrotask queue** — `setTimeout`, `setInterval`, I/O callbacks, UI events

### The rule that trips people up in interviews

The microtask queue is drained **completely** — every microtask, including ones a running microtask itself adds — before the loop even looks at the macrotask queue again. This is why `Promise.resolve().then()` always runs before `setTimeout(fn, 0)`, no matter the order they were called in.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

**Diagram (hand-authored SVG, theme-aware):** a 4-lane flow — Call Stack / Web APIs / Microtask Queue / Macrotask Queue — with the 4 lines above walked through as animated steps: `console.log('1')` and `'4'` execute directly on the stack; `setTimeout` hands off to Web APIs then queues in the macrotask lane; `Promise.then` queues directly in the microtask lane; an arrow shows the microtask lane fully draining into the stack before the macrotask lane gets a turn. Same visual grammar as the existing Event Loop *simulator* (Feature 09) so a reader who's already played with that gets an instantly familiar diagram here, just static.

### Common follow-up: why does this matter?

Blocking the call stack for even a few hundred milliseconds freezes the entire page — no scrolling, no clicks, no repaints. Understanding the event loop is really understanding *why* long synchronous work (a huge `for` loop, a heavy `JSON.parse`) is a real performance bug, not just a style issue.

**Related:** Promises & Async/Await · What is microtask queue vs macrotask queue? · Event Loop (Learn concept + full simulator) · Debouncing & Throttling

---

### 3. React — Medium

**Meta title:** Controlled vs. Uncontrolled Components in React | Frontend Forever
**Meta description:** A controlled component's value lives in React state and is set via a value prop; an uncontrolled component manages its own value internally, read on demand via a ref.

# What is the difference between controlled and uncontrolled components?

A controlled component's value lives in React state — you set it via a `value` prop and update it via `onChange`, so React is the single source of truth. An uncontrolled component manages its own value internally in the DOM, and you read it on demand with a `ref` instead of tracking every keystroke in state.

### Controlled

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

React re-renders on every keystroke. You always know the current value, can validate/transform it live, and can drive other UI off it immediately.

### Uncontrolled

```jsx
function UncontrolledInput() {
  const ref = useRef(null);
  const handleSubmit = () => console.log(ref.current.value);
  return <input ref={ref} defaultValue="" />;
}
```

The DOM owns the value; React only reads it when asked (`ref.current.value`). No re-render per keystroke.

### When to reach for which

| | Controlled | Uncontrolled |
|---|---|---|
| Live validation / formatting as you type | Yes | No |
| Disabling a submit button until valid | Yes | No (only knows value on read) |
| Large forms, performance-sensitive | re-renders per field | Yes — fewer re-renders |
| Simple "read it once on submit" forms | overkill | Yes — simplest option |
| File inputs | can't be controlled (browser-owned) | Yes — only option |

Most real forms end up controlled for validation UX, but file inputs are always uncontrolled — the browser refuses to let you set a `value` on `<input type="file">` programmatically for security reasons, which is itself a common follow-up question.

**Related:** How do you handle forms in React? · What is the difference between state and props? · Forms: Controlled vs. Uncontrolled (Learn concept)

---

### 4. React — Hard *(post-React-Compiler answer, not the pre-2026 default advice)*

**Meta title:** What is useMemo and When Should You Use It? | Frontend Forever
**Meta description:** useMemo caches an expensive computation between renders. As of the stable React Compiler, it's mostly an escape hatch now — the compiler auto-memoizes most cases for you.

# What is `useMemo` and when should you use it?

`useMemo(fn, deps)` caches the return value of an expensive computation across renders, only recomputing it when one of the values in `deps` changes. **As of the React Compiler (stable since v1.0, October 2025 — part of the React 19.x line, not a "React 20" that doesn't exist), this is worth answering carefully** — the compiler now auto-memoizes most component output, so manual `useMemo` has shifted from routine practice to a targeted escape hatch.

### The classic pre-compiler use case

```jsx
function ProductList({ products, query }) {
  const filtered = useMemo(
    () => products.filter((p) => p.name.includes(query)),
    [products, query]
  );
  return filtered.map((p) => <Product key={p.id} {...p} />);
}
```

Without `useMemo`, `.filter()` re-runs on *every* render of this component, even ones triggered by unrelated state elsewhere. `useMemo` skips that work unless `products` or `query` actually changed.

### What changed with React Compiler

The compiler statically analyzes component code and inserts the equivalent of `useMemo`/`useCallback`/`React.memo` automatically, for most cases, without you writing them. Two real consequences worth stating precisely, not just "it's obsolete now":

- **It's not gone, it's optional for the common case.** Existing `useMemo` calls still work — the compiler respects them, and if you leave one in place, you get double-memoization (harmless, just a small per-render overhead), not a conflict.
- **Manual `useMemo` is still the right tool when you need to guarantee referential stability for something the compiler can't see through** — most commonly, when a memoized value feeds an `useEffect` dependency array and you need to be certain it doesn't change identity between renders for reasons the compiler's static analysis can't infer (e.g. an object built from external, non-reactive data).

### The current, accurate rule (2026)

Write plain code first and let the compiler handle memoization. Reach for `useMemo` explicitly only when: (1) you're in a codebase without the compiler enabled, or (2) you need precise, guaranteed control over a value's identity — most often for an effect dependency — that the compiler's inference can't be trusted to get right.

**Related:** What is useCallback and how does it prevent re-renders? · What is React.memo and how does it work? · What is the React Compiler (React Forget)? · Render Performance: memo, useMemo, useCallback (Learn concept)

**Sources checked:** react.dev/reference/react/useMemo, react.dev — React Compiler introduction

---

### 5. Next.js — Medium *(Pages Router API, App Router equivalent given explicitly)*

**Meta title:** What is getStaticProps and When Do You Use It? | Frontend Forever
**Meta description:** getStaticProps is a Pages Router function that fetches data at build time for static generation. In the App Router, it's replaced by fetch() with cache: 'force-cache' and generateStaticParams.

# What is `getStaticProps` and when do you use it?

`getStaticProps` is a **Pages Router** data-fetching function — exported from a page file, it runs at build time (or on a schedule with ISR), fetches data server-side, and passes it to the page as props for a fully pre-rendered HTML page. **It's important to answer this precisely: `getStaticProps` does not exist in the App Router** — a genuinely common source of confusion, and worth naming directly rather than glossing over.

### Pages Router usage

```js
// pages/posts/[id].js
export async function getStaticProps({ params }) {
  const post = await getPostById(params.id);
  return { props: { post }, revalidate: 60 }; // ISR: regenerate at most every 60s
}
```

### When to use it (Pages Router)

Use it when the page's content doesn't need to be unique per-request — blog posts, marketing pages, product listings — anything that can be built once and served to everyone, optionally refreshed on an interval via ISR's `revalidate` field.

### The App Router equivalent

If you're working in the App Router (the default for any new Next.js project as of 2026), the same outcome comes from a plain `fetch()` inside an async Server Component, with the caching behavior controlled by options instead of a separate function:

```jsx
// app/posts/[id]/page.tsx
async function Post({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 60 }, // same ISR behavior as getStaticProps's revalidate
  });
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

`cache: 'force-cache'` behaves like `getStaticProps`'s default (cache indefinitely); `next: { revalidate: N }` behaves like ISR; `cache: 'no-store'` behaves like `getServerSideProps` (always fresh, no caching). `getStaticPaths`'s job — declaring which dynamic routes to pre-render — is now `generateStaticParams`.

### Why this question still gets asked

Plenty of production codebases are still on the Pages Router, and interviewers use this question to check whether a candidate actually understands the caching model underneath — not just which function name to type.

**Related:** What is getServerSideProps and when do you use it? · What is getStaticPaths? · What is Incremental Static Regeneration (ISR)? · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — Migrating to App Router docs, Next.js — getStaticProps docs

---

### 6. Next.js — Hard

**Meta title:** What is Incremental Static Regeneration (ISR) in Next.js? | Frontend Forever
**Meta description:** ISR serves a cached static page instantly, then regenerates it in the background once it goes stale — giving static-site speed with data that stays fresh, without a full rebuild.

# What is Incremental Static Regeneration (ISR)?

Incremental Static Regeneration lets a statically generated page stay fast *and* stay fresh: Next.js serves the cached HTML instantly on every request, and once a page passes its `revalidate` age, the **next** visitor still gets the fast cached version immediately while Next.js regenerates a fresh copy in the background for everyone after them — a stale-while-revalidate pattern, not a rebuild-and-wait one.

### Time-based ISR

```js
export async function getStaticProps() {
  const products = await getProducts();
  return { props: { products }, revalidate: 3600 }; // regenerate at most once/hour
}
```

Nobody ever waits on a rebuild — the worst case is one visitor sees data that's up to `revalidate` seconds old, which then self-heals on the next background regeneration.

**Diagram (hand-authored SVG):** a timeline showing 3 visitors hitting the same page — Visitor A (page still fresh, gets cached HTML), Visitor B (page just went stale, gets the *same* cached HTML instantly while a regeneration kicks off silently in the background), Visitor C (arrives after regeneration finished, gets the new HTML) — makes the "nobody blocks on a rebuild" property visually obvious in a way the prose alone doesn't.

### On-demand revalidation

Time-based ISR is a safety net; most real production setups pair it with on-demand revalidation triggered by a webhook (e.g. a CMS save):

```js
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

This regenerates a specific page immediately instead of waiting for its `revalidate` window — near-instant freshness with far less compute than rebuilding the whole site.

### Real constraints worth knowing

ISR requires the Node.js runtime (the default) — it's not supported with `output: 'export'` (a static export has no server to regenerate anything on). This is a common gotcha: teams deploying a fully static export lose ISR entirely and need to pick one or the other.

**Related:** What is getStaticProps and when do you use it? · What is the revalidatePath and revalidateTag function? · What is Partial Prerendering (PPR)? · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — ISR guide, Vercel — ISR docs

---

## Status

Pilot approved 2026-07-14, seeded as real rows in `collection_questions` during Feature 31's build (`scripts/seed/collectionQuestions/`) — live at `/interview-prep/ff-javascript/var-let-const-differences` etc. Full 299-question run (101 JavaScript / 99 React / 99 Next.js, source PDFs supplied by the user) started 2026-07-15, working collection by collection (JavaScript first, then React, then Next.js), sub-batched within each collection. **Both of the pilot's diagram-eligible answers now have real hand-authored SVG diagrams** (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `features/interview-prep/components/diagrams/`) — the intended cadence going forward (user-confirmed) is one diagram authored alongside each eligible question as it's written, not a single batch pass after all 299 questions land.

**JavaScript collection complete** (101/101 questions, 5 batches, 8 diagram components) — full history tracked on the `content/ff-javascript-questions` branch's copy of this file; not duplicated here since React content lives on a separate `content/ff-react-questions` branch (mirroring the `content/practice-challenge-descriptions` precedent) to keep each collection's PR independently reviewable. The two branches will reconcile when both are merged.

**React — pilot fact correction (2026-07-15):** while researching for Batch 1 (per the non-negotiable accuracy rule), discovered the already-approved pilot's `useMemo` answer claimed the React Compiler "shipped in React 20" — **there is no React 20.** Verified directly against react.dev/versions: current stable is React 19.2 (released October 2025), and React Compiler went stable at v1.0 in October 2025, part of the 19.x line. Fixed in the seeded `usememo-when-to-use` answer and in this guide's own pilot-example copy and non-negotiable-accuracy-rule section (3 occurrences). A reminder that even already-approved, already-seeded content isn't exempt from this rule — training-data assumptions about fast-moving React internals can be wrong even after being "verified" once. Also corrected both pilot questions' `orderIndex` to match the source PDF's own numbering (`usememo-when-to-use` 2→9, `controlled-vs-uncontrolled-components` 1→22), same convention as the JavaScript collection's `event-loop` fix.

**React — Batch 1 done:** questions #1–8, #10–20 (19 questions; #9 already covered by the pilot). Every question has a real "classic interview gotcha" section (e.g. calling a state setter multiple times per event using the same stale closed-over value, `React.memo` being defeated by an inline object/function prop creating a new reference every render, index-based keys silently misattaching state when a list reorders, Error Boundaries not catching event-handler or async errors). Diagram-eligibility was evaluated per-question against the corrected standard (not the named-list shortcut) — 2 new diagrams: `VirtualDomDiffDiagram` (new, reused across both `what-is-react-and-virtual-dom` and `what-is-reconciliation-in-react`, since reconciliation is the general name for the same node-by-node diffing mechanism) and `LayoutEffectVsEffectTimingDiagram` (new, for `useLayoutEffect` vs `useEffect`'s before/after-paint ordering — the same "trickier timing" bar that justified JavaScript's microtask/macrotask diagram). Several React-specific facts were web-search-verified rather than answered from training data, per the non-negotiable accuracy rule: Error Boundaries remain class-only with no stable hook equivalent as of React 19.2; `useEffectEvent` (React 19.2, October 2025) is the current, accurate answer for splitting non-reactive "read the latest value without re-running the effect" logic out of a `useEffect` — mentioned in the dependency-array question with a sources-checked line. Real links used wherever a genuine target exists (all 12 of the React collection's existing Learn concepts got used at least once), several cross-links between newly-seeded questions, no fabricated hrefs. **21 of 99 React questions now done** (2 pilot + 19 Batch 1); #21–99 remain. Next.js (99 questions) hasn't started.

**React — Batch 2 done (2026-07-16):** questions #21, #23–40 (19 questions; #22 already covered by the pilot). Covers Redux, form handling, `forwardRef`/`useImperativeHandle`, PropTypes vs. TypeScript, the HOC/render-props/compound-component patterns, state vs. props, what causes unnecessary re-renders, React 18 batching/concurrent features/`useTransition`/`useDeferredValue`, Fiber architecture, SSR, hydration, general performance optimization, and `StrictMode`. Web-search verified several facts that would have been wrong from training data alone, per the non-negotiable accuracy rule: `React.forwardRef` and `propTypes`/`defaultProps` (on function components) are both deprecated/ignored as of React 19, with `ref` now a plain prop; **"Concurrent Mode" was dropped as a named concept before React 18 shipped** — React 18 ships opt-in concurrent *features*, not a global mode toggle, a real and common misconception worth naming directly (mirrors the pilot's `getStaticProps` correction pattern); **selective hydration shipped in React 18** (via Suspense), not a later version — this one was double-checked after an initial ambiguous search result implied otherwise. 4 new diagrams, each evaluated against the corrected per-question standard: `ReduxDataFlowDiagram` (unidirectional action → reducer → store → view loop), `AutomaticBatchingDiagram` (pre-React-18 vs. React-18 batching of two state updates in the same tick), `FiberArchitectureDiagram` (interruptible render phase vs. uninterruptible commit phase), `HydrationFlowDiagram` (server HTML → paint → React attaches → interactive). Deliberately *not* diagrammed: the HOC/render-props/compound-component patterns (structural, not process-flow — a comparison/prose treatment fits better), `useTransition`/`useDeferredValue`/concurrent mode (conceptually adjacent to the Fiber/batching diagrams already covering the same underlying mechanism), and unnecessary re-renders (a causes/fixes table did the job, per the checklist's own comparison-table convention). New forward-referenced slugs for future batches to match exactly: `react-component-vs-purecomponent` (#41), `fetching-data-in-react-hooks` (#44), `redux-toolkit-vs-redux` (#52), `zustand-vs-redux` (#53), `react-window-vs-react-virtualized` (#60), `defaultprops-and-typescript-defaults` (#67), `render-vs-commit-phases-in-react` (#64), `sharing-state-between-siblings` (#69), `lifting-state-up-in-react` (#70), `ssr-vs-csr-vs-ssg` (#78), `profiler-api-in-react` (#99). **40 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2); #41–99 remain. Next.js (99 questions) hasn't started.

**React — Batch 3 done (2026-07-16):** questions #41–60 (20 questions), closing out every forward-referenced slug Batches 1–2 had queued for this range (`react-component-vs-purecomponent`, `fetching-data-in-react-hooks`, `redux-toolkit-vs-redux`, `zustand-vs-redux`, `react-window-vs-react-virtualized`). Covers `PureComponent`, the class-lifecycle-to-hooks mapping (`componentDidMount`/`componentWillUnmount`), data fetching in hooks, the stale closure problem, `exhaustive-deps`, React DevTools, image lazy-loading, testing (React Testing Library and Enzyme), Redux side effects/Redux Toolkit/Zustand, TanStack Query/SWR, optimistic UI, Portals, infinite scroll, and list virtualization. Real, current-as-of-2026 facts verified rather than assumed from training data: **Enzyme has no official React 18 or 19 adapter and its ecosystem is frozen** — not a stylistic preference, a hard current blocker; `renderHook` now lives directly in `@testing-library/react` (React 18+), not the old separate `@testing-library/react-hooks` package; `eslint-plugin-react-hooks` v6+ bundles the React Compiler's own generated lint rules (`react-hooks/immutability`, `react-hooks/purity`) under the same prefix, not just `exhaustive-deps`/`rules-of-hooks`; and **react-window and react-virtualized are both mature-to-legacy as of 2026**, with new projects steered toward `@tanstack/react-virtual` or `react-virtuoso` instead — stated directly rather than implying react-window is simply "the modern pick." 3 new diagrams, each passing the corrected per-question eligibility check: `OptimisticVsPessimisticDiagram` (two timelines for the same action), `PortalDiagram` (React component tree vs. actual DOM tree divergence), `VirtualizedListDiagram` (only in-viewport rows get real DOM nodes). Deliberately *not* diagrammed: `componentDidMount`/`componentWillUnmount` equivalents (already covered by Batch 1's lifecycle table/diagram-adjacent question — cross-linked instead of re-diagrammed), Redux Toolkit/Zustand/TanStack Query/SWR (comparison tables did the job). **60 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2 + 20 Batch 3); #61–99 remain (minus already-covered #64/#67/#69/#70/#78/#99 once written). Next.js (99 questions) hasn't started.

**React — Batch 4 done (2026-07-16):** questions #61–80 (20 questions), closing out every remaining forward-referenced slug except `profiler-api-in-react` (#99, still pending). Covers `useState` vs. `useRef` for values, preventing memory leaks, dependency injection via Context, render vs. commit phases, Fragments, the legacy `React.Children` API, `defaultProps`/TypeScript defaults, `displayName`, sharing/lifting state between siblings, global state without Redux, the Provider pattern, undo/redo, event pooling, animation (CSS/Motion), drag and drop, SSR vs. CSR vs. SSG, React Server Components, and the rules of hooks. Real, current-as-of-2026 facts verified rather than assumed: **React 17 (not 18 or 19) removed event pooling entirely** — `event.persist()` is a no-op in every actively-maintained version; **React 18 removed the "state update on an unmounted component" warning itself**, not just changed it, because most triggers weren't real leaks (subscriptions are the case that still matters); **Framer Motion was renamed to Motion in 2025** (package `framer-motion` → `motion`, import `motion/react`); **`@dnd-kit` is the 2026-standard drag-and-drop choice**, with `react-beautiful-dnd` deprecated and uncertain on React 19; **`React.Children` is listed as a legacy API in React's own docs**, not recommended for new code. 4 new diagrams, one reused across two questions: `LiftingStateUpDiagram` (shared between `sharing-state-between-siblings` and `lifting-state-up-in-react`, since they're the same mechanism — same reuse pattern as Batch 1's `VirtualDomDiffDiagram`), `UndoRedoDiagram` (past/present/future stacks), `SsrCsrSsgDiagram` (when HTML gets built, for each of the three), `ReactServerComponentsDiagram` (server vs. client component tree split). Deliberately *not* re-diagrammed: render vs. commit phases (cross-links to Batch 2's Fiber diagram instead of duplicating it). **80 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2 + 20 Batch 3 + 20 Batch 4); #81–99 remain (19 questions). Next.js (99 questions) hasn't started.

**React collection complete (2026-07-16):** final batch, questions #81–99 (19 questions), closes out the 99-question React collection — `profiler-api-in-react` (#99) was the last outstanding forward reference from earlier batches, now written. Covers the React 19 `use()` API, the React Compiler by name, authentication and protected routes, React Router's v6 changes and current status, breadcrumbs, push vs. replace, 404 handling, accessibility/ARIA, synthetic events, memoization tradeoffs, design systems, Storybook, custom renderers, `react-dom` vs. `react`, `createRoot`, and performance debugging (Profiler API and DevTools). Real, current-as-of-2026 facts verified rather than assumed: **`use()` is explicitly not a hook and doesn't follow the Rules of Hooks** — callable conditionally, in loops, or after an early return, tracked by reference (the Promise/Context itself) rather than call order; **React 17 (not 18/19) moved event delegation from `document` to the root container**; and, the most significant correction this batch, **React Router v6 is now end-of-life as of 2026** — Remix merged into React Router (what would have been Remix v3 shipped as React Router v7), and React Router v8 is current, so the v6-and-its-changes answer states v6's real historical changes but names the current EOL status directly rather than presenting v6 as if it were still the latest version. 3 new diagrams: `PushVsReplaceDiagram` (history-stack behavior), `SyntheticEventDelegationDiagram` (native event → root-container delegation → SyntheticEvent → component-tree dispatch, tying back to the Portal question's event-bubbling gotcha), `CustomRendererArchitectureDiagram` (shared reconciler core vs. per-target host configs — react-dom, react-native, react-three-fiber, Ink). Deliberately not diagrammed: the React Compiler, `use()`, memoization tradeoffs, and Profiler API (all well-served by code examples and tables, avoiding redundancy with existing useMemo/useCallback/React.memo/Fiber diagrams already in the collection).

**Final tally: 99 of 99 React questions done** — 2 pilot answers + 5 batches (19 + 19 + 20 + 20 + 19 = 97 questions). 16 new diagram components authored across the React collection (2 in Batch 1, 4 in Batch 2, 3 in Batch 3, 4 in Batch 4, 3 in the final batch), each added only after passing the corrected per-question eligibility check, not a fixed quota per batch. All pages verified 200, every diagram confirmed rendering its specific content, the `ff-react` list page confirmed showing all 99 questions, and `/interview-prep`, `/practice`, `/learn` regression-checked clean after every batch.

Next.js content (99 questions) lives on a separate `content/ff-nextjs-questions` branch, same convention as JS and React — not duplicated here.

When continuing any collection's run, batch it (do not attempt all remaining questions in one pass) and update this file's Status section as batches complete.

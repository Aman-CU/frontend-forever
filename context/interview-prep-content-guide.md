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

- **`useMemo`**: React Compiler (React 20-era) auto-memoizes most cases now — manual `useMemo`/`useCallback` shifted from routine practice to a targeted escape hatch (mainly for guaranteeing referential stability into an effect dependency). An answer that doesn't mention this reads as outdated to anyone who's used React recently.
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
**Meta description:** useMemo caches an expensive computation between renders. As of React Compiler (React 20), it's mostly an escape hatch now — the compiler auto-memoizes most cases for you.

# What is `useMemo` and when should you use it?

`useMemo(fn, deps)` caches the return value of an expensive computation across renders, only recomputing it when one of the values in `deps` changes. **As of React Compiler (shipped in React 20), this is worth answering carefully** — the compiler now auto-memoizes most component output, so manual `useMemo` has shifted from routine practice to a targeted escape hatch.

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

Pilot approved 2026-07-14, seeded as real rows in `collection_questions` during Feature 31's build (`scripts/seed/collectionQuestions/`) — live at `/interview-prep/ff-javascript/var-let-const-differences` etc. Full 299-question run (101 JavaScript / 99 React / 99 Next.js, source PDFs supplied by the user, 6 of the 299 now done) not yet started. **Both of this pilot's diagram-eligible answers now have real hand-authored SVG diagrams** (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `features/interview-prep/components/diagrams/`) — the intended cadence going forward (user-confirmed) is one diagram authored alongside each eligible question as it's written, not a single batch pass after all 299 questions land. When the full run starts, batch it (do not attempt all 299 in one pass) and update this file's Status section as batches complete.

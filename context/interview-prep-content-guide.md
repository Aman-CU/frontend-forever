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
7. **"Classic interview gotcha" section** — a required section (not incidental) whenever the topic genuinely has a well-known tricky edge case, surprising output, or common misconception interviewers actually probe for. Same shape as the `var`-in-a-loop-closure example in "What are closures and how do they work?" (Batch 1, `what-are-closures`): a short, concrete code snippet showing the surprising behavior, then one or two sentences explaining *why* it happens. This is what separates a textbook-correct answer from one that reads like it was actually written by someone who's been asked this in a real interview — added as a standing rule starting with JavaScript Batch 2 (2026-07-15), not retrofitted onto the pilot/Batch 1 answers that predate it. Skip it honestly when a question has no real gotcha rather than manufacturing a weak one just to fill the slot.
8. **Comparison tables** wherever the question is inherently comparative (`X vs Y`) — LLMs and search snippets both extract structured tables more reliably than prose.
9. **Diagrams** only for the subset of questions that are genuinely a flow/process concept (event loop, hydration, reconciliation, SSR/CSR/SSG, ISR, prototypal inheritance, virtual DOM diffing — an estimated 40–50 of the 299 seeded JS/React/Next.js questions). Hand-authored SVG, theme-aware via CSS variables, not raster images. **Not** the `rough.js`/sketchy-diagram treatment — that's reserved for Feature 49's System Design guide pages only.
10. **Related-content links** — related questions, the matching Learn concept (where one exists), the relevant Playbook chapter. Internal linking is part of the SEO/GEO strategy, not decoration.
11. **Structured data** — `FAQPage` JSON-LD on collection list pages (multiple Q&As); `Article`/`TechArticle` + `mainEntity` Q&A schema on individual question pages. `dateModified`/`datePublished` on every answer.
12. **Sources line** — for anything version-sensitive (a JS/TS language feature is usually safe; anything React- or Next.js-specific almost never is), web-search before writing and list what was checked at the bottom of the answer, same as the pilot did. Don't answer framework-API questions from training data alone — see the two corrections below for why.

## Non-negotiable accuracy rule

**Web-search before writing any React or Next.js API question.** Both frameworks move fast enough that "obviously true" answers from training data can be stale by the time they're published. Two real corrections the pilot caught, both worth internalizing before writing the remaining ~293:

- **`useMemo`**: React Compiler (stable as of v1.0, October 2025 — independently versioned from React itself, officially compatible with React 17+; there is no "React 20") auto-memoizes most cases now — manual `useMemo`/`useCallback` shifted from routine practice to a targeted escape hatch (mainly for guaranteeing referential stability into an effect dependency). An answer that doesn't mention this reads as outdated to anyone who's used React recently.
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

`useMemo(fn, deps)` caches the return value of an expensive computation across renders, only recomputing it when one of the values in `deps` changes. **As of the React Compiler (stable since v1.0, October 2025 — independently versioned from React itself, officially compatible with React 17+; not a "React 20" that doesn't exist), this is worth answering carefully** — the compiler now auto-memoizes most component output, so manual `useMemo` has shifted from routine practice to a targeted escape hatch.

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

Pilot approved 2026-07-14, seeded as real rows in `collection_questions` during Feature 31's build (`scripts/seed/collectionQuestions/`) — live at `/interview-prep/ff-javascript/var-let-const-differences` etc. Full 299-question run (101 JavaScript / 99 React / 99 Next.js, source PDFs supplied by the user) started 2026-07-15, working collection by collection (JavaScript first, then React, then Next.js — user's own call), sub-batched within each collection. **Both of the pilot's diagram-eligible answers now have real hand-authored SVG diagrams** (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `features/interview-prep/components/diagrams/`) — the intended cadence going forward (user-confirmed) is one diagram authored alongside each eligible question as it's written, not a single batch pass after all 299 questions land.

**JavaScript — Batch 1 done** (source: the user's "Javascript questions.pdf"): questions #2, #3, #5–20 (18 questions; #1 and #4 were already covered by the pilot). Every question authored with a real internal link wherever a matching Learn concept genuinely exists (`hoisting-temporal-dead-zone`, `closures`, `prototypal-inheritance`, `equality-type-coercion`, `promises-async-await`, `callbacks-higher-order-functions`, `this-binding-execution-context`, `event-delegation-bubbling-capturing`, `generators-iterators`, `memory-management-leaks`), plus real cross-links between newly-seeded questions themselves where genuinely related (e.g. `call-apply-bind-differences` ↔ `how-does-this-behave`). One new diagram: `PrototypeChainDiagram` for "Explain the concept of prototypal inheritance." (#5 — matches the checklist's named diagram-eligible list). `event-loop`'s `orderIndex` corrected from 2 → 4 to match the source PDF's own numbering, now that more of the sequence is filled in. **20 of 101 JavaScript questions now done** (2 pilot + 18 batch 1); #21–101 remain, in further batches. React and Next.js (99 each) haven't started.

**Format rule added after Batch 1 (user feedback):** the "classic interview gotcha" section — Batch 1's `what-are-closures` answer had one (the `var`-in-a-loop closure surprise) almost incidentally; the user liked it enough to make it a required checklist item (see the format checklist's item 7) starting with Batch 2, not just something that shows up when a question happens to lend itself to it.

**JavaScript — Batch 2 done:** questions #21–40 (20 questions), every one with a real "classic interview gotcha" section per the new rule above (e.g. debounce-never-fires-during-a-continuous-burst, the `??` vs `||` zero/empty-string trap, `Array.prototype.sort()`'s in-place mutation, the `null` vs `undefined` default-parameter distinction). Real links continue wherever a genuine target exists: 6 more Learn concepts (`function-composition-currying`, `array-object-methods-immutability` — reused 3×, `memory-management-leaks` — reused), several cross-links between newly-seeded questions (`debouncing-and-throttling` ↔ `settimeout-vs-setinterval`, `how-javascript-handles-async` ↔ `what-is-the-event-loop`, `how-the-prototype-chain-works` ↔ `prototypal-inheritance-explained`, `commonjs-vs-es-modules` ↔ `what-is-tree-shaking`, others), and a few honest "none yet" cases where no real Learn concept or seeded question covers the topic (`template-literals-and-tagged-templates`, `map-vs-object`, `set-vs-array`, `proxy-object-in-javascript`) rather than a fabricated link. No new diagrams this batch — none of #21–40 are on the checklist's named flow/process list.

**JavaScript — Batch 3 done:** questions #41–60 (20 questions), every one with a real "classic interview gotcha" section (e.g. `reduce()` on an empty array with no initial value, `Object.freeze()`'s shallow-only guarantee, `postMessage`'s structured-clone semantics defeating shared-memory assumptions, `Promise.all` discarding still-pending results on the first rejection, a microtask chain starving the macrotask queue indefinitely). New Learn concept links used for the first time this run: `event-delegation-bubbling-capturing` (event bubbling/capturing, reused from the delegation question's existing link), `storage-apis` (IndexedDB, localStorage/sessionStorage/cookies), `cors-same-origin-policy`, `web-security-fundamentals` (XSS/CSRF), `web-workers-concurrency`, `service-workers-caching-strategies`; `array-object-methods-immutability` reused again (map/filter/reduce, flat/flatMap). Several new cross-links between sibling questions (`array-map-filter-reduce-differences` ↔ `array-flat-and-flatmap`, `proxy-and-reflect` ↔ `proxy-object-in-javascript`, `what-is-indexeddb` ↔ `localstorage-vs-sessionstorage-vs-cookies` ↔ `xss-and-csrf-explained`, `promise-all-vs-race-vs-allsettled-vs-any` ↔ `microtask-vs-macrotask-queue`, `event-bubbling-and-capturing` ↔ `stoppropagation-vs-preventdefault`), and one honest "none yet" (`function-overloading-in-javascript` — no Learn concept covers JS's lack of native overloading). No new diagrams — none of #41–60 are on the named flow/process list. **Tooling note:** mid-session verification hit a batch-wide false-alarm — all 20 pages 404'd on first check even though the DB rows were confirmed present and correct; root cause was Turbopack's dev-mode fetch-cache (`.next/dev/cache`, disk-persisted, independent of the `unstable_cache` `revalidate: 3600`/`"concepts"` tag) surviving from an earlier verification session and predating this batch's seed. A dev server restart alone does **not** clear it — the directory has to be deleted manually. Worth remembering for future batches: after seeding new content mid-session, clear `.next/dev/cache` before trusting a 404 as a real content bug. **60 of 101 JavaScript questions now done** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3); #61–101 remain (41 questions). React and Next.js (99 each) haven't started.

**Diagram-coverage correction (2026-07-15, user-caught):** Batches 2 and 3 were marked "no new diagrams" too quickly — the checklist's named list (event loop, hydration, reconciliation, SSR/CSR/SSG, ISR, prototypal inheritance, virtual DOM diffing) is explicitly described as an *estimate* ("an estimated 40-50 of the 299 questions"), i.e. examples, not the exhaustive set — every question still needs an honest "is this genuinely a flow/process concept" check, not just a match against the named list. Four were missed and have now been added, with **zero changes to any answer text** (diagram wiring only): `how-the-prototype-chain-works` (#25, reuses the existing `PrototypeChainDiagram` as-is — same prototype-chain-walk mechanism as `prototypal-inheritance-explained`, just via a plain array instead of `Object.create()`), `event-bubbling-and-capturing` (#47, new `EventBubblingCapturingDiagram` — capture/target/bubble phases through a nested DOM tree), `how-garbage-collection-works` (#35, new `GarbageCollectionDiagram` — before/after reachability panels matching the `user = null` example already in the answer), `microtask-vs-macrotask-queue` (#59, new `MicrotaskMacrotaskDiagram` — same 4-lane grammar as `EventLoopFlowDiagram` but walking this question's own trickier 6-step nested-microtask example, since reusing the event-loop diagram unchanged would have shown the wrong output numbers). All 4 wired into `DIAGRAM_BY_SLUG` in `page.tsx`, typecheck/lint clean, all 4 pages verified rendering their diagram's actual SVG content (not just a generic svg count). **Standing correction for all future batches:** evaluate diagram-eligibility per-question against the actual definition ("genuinely a flow/process concept"), not just against the named examples.

**JavaScript — Batch 4 done:** questions #61–80 (20 questions), every one with a real "classic interview gotcha" section (e.g. a getter with no setter silently no-opping in non-strict mode, calling a function constructor without `new` producing a silently broken object, the default string-sort producing `[1, 10, 2]`, `finally`'s `return` silently overriding `try`'s, forgetting `await` on a `return`ed Promise inside `try` skipping `catch` entirely). This batch applied the corrected diagram-eligibility check properly (see the correction above) rather than defaulting to "no diagram" — **2 new diagrams** genuinely earned it: `tail-call-optimization` (new `TailCallOptimizationDiagram` — stack frames growing without TCO vs. a single frame reused with it) and `observer-pattern-explained` (new `ObserverPatternDiagram` — one `notify()` fanning out to every subscribed observer). No existing Learn concepts matched most of this batch's topics (class/constructor mechanics, sort internals, design patterns, error handling) — mostly honest "none yet" links, with cross-links between sibling questions instead (`class-vs-function-constructors` ↔ `how-does-this-behave`, `what-are-design-patterns` ↔ its 3 dedicated pattern questions, `error-handling-in-async-await` ↔ `try-catch-finally-explained`, `observer-pattern-explained` ↔ `how-garbage-collection-works` for the forgotten-unsubscribe leak parallel, others). **80 of 101 JavaScript questions now done** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3 + 20 Batch 4); #81–101 remain (21 questions, the last JavaScript batch). React and Next.js (99 each) haven't started.

**JavaScript — Batch 5 done (final batch):** questions #81–101 (21 questions), completing the full 101-question JavaScript collection. Every question has a real "classic interview gotcha" section (e.g. `throw` inside a `setTimeout` callback being a genuinely uncaught exception no `.catch()` can intercept, memoizing a recursive function only working if its own internal calls go through the memoized wrapper, `BigInt`/`Number` throwing on mixed arithmetic instead of coercing, `Object.create(null)` producing an object with no `hasOwnProperty` at all). Two questions (#82 memoization, #92 tagged templates) are near-duplicates of earlier questions in the source PDF itself — both were written with a genuinely distinct, deeper angle (recursive/multi-arg memoization; `String.raw` and real production tag-function use cases) rather than repeating the same content, and cross-linked back to the originals. Diagram-eligibility was evaluated per-question against the corrected standard (see the correction above) and genuinely **no new diagrams were needed** this batch — the topics are mostly API/comparison questions well-served by tables and code, not flow/process concepts. One real bug caught and fixed during authoring: an attempt to show tagged-template call syntax as inline code with embedded backticks would have rendered literal backslashes to the reader — rewritten in prose instead, with the actual working example left to the fenced code block. **101 of 101 JavaScript questions now done — the JavaScript collection is complete** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3 + 20 Batch 4 + 21 Batch 5), with 8 diagram components across 9 diagram-eligible question pages (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `PrototypeChainDiagram` — reused across 2 questions, `EventBubblingCapturingDiagram`, `GarbageCollectionDiagram`, `MicrotaskMacrotaskDiagram`, `TailCallOptimizationDiagram`, `ObserverPatternDiagram`). React and Next.js (99 questions each) haven't started — next up.

**Post-merge CodeRabbit follow-up (2026-07-16):** review on the JavaScript collection's PR (#78) caught 9 real issues, all fixed on that branch and carried forward here since this file and `ffJavascript.ts`/`ffReact.ts` are shared across all three collection branches: two TDZ examples throwing the wrong error type (`TypeError` → `ReferenceError`, for both the default-parameter and the `const`-bound cases — the `var`-hoisted case correctly stays `TypeError`), a Fibonacci custom-iterator example whose math was actually broken (rewritten to init `[1, 1]` and emit before advancing), a misleading arrow-function `arguments` example (rewritten to actually demonstrate lexical inheritance from an enclosing function, not just "arguments doesn't exist at all here"), an event-delegation handler using `.matches("li")` instead of `.closest("li")` (breaks on nested markup inside the `<li>`), an `Array.prototype.includes` polyfill missing negative-`fromIndex` normalization, an inverted Proxy `set`-trap comment (silent failure is non-strict mode, not strict), an overstated `WeakMap`/`WeakSet` restriction (objects *or* non-registered symbols, since ES2023, not objects-only), an overstated truthiness claim (the real `document.all` exception, not "every object is truthy" with no caveat), and the React Compiler's actual version/compatibility facts (independently versioned, React 17+, not "part of the React 19.x line" — this same fact needed the identical fix in this branch's own copy of `ffReact.ts` below, since it repeats the pilot's original error).

**React — pilot fact correction (2026-07-15):** while researching for Batch 1 (per the non-negotiable accuracy rule), discovered the already-approved pilot's `useMemo` answer claimed the React Compiler "shipped in React 20" — **there is no React 20.** Verified directly against react.dev/versions: current stable is React 19.2 (released October 2025), and React Compiler went stable at v1.0 in October 2025 — independently versioned from React itself, officially compatible with React 17+. Fixed in the seeded `usememo-when-to-use` answer and in this guide's own pilot-example copy and non-negotiable-accuracy-rule section (3 occurrences). A reminder that even already-approved, already-seeded content isn't exempt from this rule — training-data assumptions about fast-moving React internals can be wrong even after being "verified" once. Also corrected both pilot questions' `orderIndex` to match the source PDF's own numbering (`usememo-when-to-use` 2→9, `controlled-vs-uncontrolled-components` 1→22), same convention as the JavaScript collection's `event-loop` fix.

**React — Batch 1 done:** questions #1–8, #10–20 (19 questions; #9 already covered by the pilot). Every question has a real "classic interview gotcha" section (e.g. calling a state setter multiple times per event using the same stale closed-over value, `React.memo` being defeated by an inline object/function prop creating a new reference every render, index-based keys silently misattaching state when a list reorders, Error Boundaries not catching event-handler or async errors). Diagram-eligibility was evaluated per-question against the corrected standard (not the named-list shortcut) — 2 new diagrams: `VirtualDomDiffDiagram` (new, reused across both `what-is-react-and-virtual-dom` and `what-is-reconciliation-in-react`, since reconciliation is the general name for the same node-by-node diffing mechanism) and `LayoutEffectVsEffectTimingDiagram` (new, for `useLayoutEffect` vs `useEffect`'s before/after-paint ordering — the same "trickier timing" bar that justified JavaScript's microtask/macrotask diagram). Several React-specific facts were web-search-verified rather than answered from training data, per the non-negotiable accuracy rule: Error Boundaries remain class-only with no stable hook equivalent as of React 19.2; `useEffectEvent` (React 19.2, October 2025) is the current, accurate answer for splitting non-reactive "read the latest value without re-running the effect" logic out of a `useEffect` — mentioned in the dependency-array question with a sources-checked line. Real links used wherever a genuine target exists (all 12 of the React collection's existing Learn concepts got used at least once), several cross-links between newly-seeded questions, no fabricated hrefs. **21 of 99 React questions now done** (2 pilot + 19 Batch 1); #21–99 remain. Next.js (99 questions) hasn't started.

**React — Batch 2 done (2026-07-16):** questions #21, #23–40 (19 questions; #22 already covered by the pilot). Covers Redux, form handling, `forwardRef`/`useImperativeHandle`, PropTypes vs. TypeScript, the HOC/render-props/compound-component patterns, state vs. props, what causes unnecessary re-renders, React 18 batching/concurrent features/`useTransition`/`useDeferredValue`, Fiber architecture, SSR, hydration, general performance optimization, and `StrictMode`. Web-search verified several facts that would have been wrong from training data alone, per the non-negotiable accuracy rule: `React.forwardRef` and `propTypes`/`defaultProps` (on function components) are both deprecated/ignored as of React 19, with `ref` now a plain prop; **"Concurrent Mode" was dropped as a named concept before React 18 shipped** — React 18 ships opt-in concurrent *features*, not a global mode toggle, a real and common misconception worth naming directly (mirrors the pilot's `getStaticProps` correction pattern); **selective hydration shipped in React 18** (via Suspense), not a later version — this one was double-checked after an initial ambiguous search result implied otherwise. 4 new diagrams, each evaluated against the corrected per-question standard: `ReduxDataFlowDiagram` (unidirectional action → reducer → store → view loop), `AutomaticBatchingDiagram` (pre-React-18 vs. React-18 batching of two state updates in the same tick), `FiberArchitectureDiagram` (interruptible render phase vs. uninterruptible commit phase), `HydrationFlowDiagram` (server HTML → paint → React attaches → interactive). Deliberately *not* diagrammed: the HOC/render-props/compound-component patterns (structural, not process-flow — a comparison/prose treatment fits better), `useTransition`/`useDeferredValue`/concurrent mode (conceptually adjacent to the Fiber/batching diagrams already covering the same underlying mechanism), and unnecessary re-renders (a causes/fixes table did the job, per the checklist's own comparison-table convention). New forward-referenced slugs for future batches to match exactly: `react-component-vs-purecomponent` (#41), `fetching-data-in-react-hooks` (#44), `redux-toolkit-vs-redux` (#52), `zustand-vs-redux` (#53), `react-window-vs-react-virtualized` (#60), `defaultprops-and-typescript-defaults` (#67), `render-vs-commit-phases-in-react` (#64), `sharing-state-between-siblings` (#69), `lifting-state-up-in-react` (#70), `ssr-vs-csr-vs-ssg` (#78), `profiler-api-in-react` (#99). **40 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2); #41–99 remain. Next.js (99 questions) hasn't started.

**React — Batch 3 done (2026-07-16):** questions #41–60 (20 questions), closing out every forward-referenced slug Batches 1–2 had queued for this range (`react-component-vs-purecomponent`, `fetching-data-in-react-hooks`, `redux-toolkit-vs-redux`, `zustand-vs-redux`, `react-window-vs-react-virtualized`). Covers `PureComponent`, the class-lifecycle-to-hooks mapping (`componentDidMount`/`componentWillUnmount`), data fetching in hooks, the stale closure problem, `exhaustive-deps`, React DevTools, image lazy-loading, testing (React Testing Library and Enzyme), Redux side effects/Redux Toolkit/Zustand, TanStack Query/SWR, optimistic UI, Portals, infinite scroll, and list virtualization. Real, current-as-of-2026 facts verified rather than assumed from training data: **Enzyme has no official React 18 or 19 adapter and its ecosystem is frozen** — not a stylistic preference, a hard current blocker; `renderHook` now lives directly in `@testing-library/react` (React 18+), not the old separate `@testing-library/react-hooks` package; `eslint-plugin-react-hooks` v6+ bundles the React Compiler's own generated lint rules (`react-hooks/immutability`, `react-hooks/purity`) under the same prefix, not just `exhaustive-deps`/`rules-of-hooks`; and **react-virtualized is largely in maintenance mode, while react-window remains actively maintained** (later corrected further still — a CodeRabbit review caught this batch's original wording overstating react-window as "feature-frozen," when it had in fact shipped a v2), with new projects steered toward `@tanstack/react-virtual` or `react-virtuoso` mainly for a more modern, headless API design rather than because react-window is unmaintained. 3 new diagrams, each passing the corrected per-question eligibility check: `OptimisticVsPessimisticDiagram` (two timelines for the same action), `PortalDiagram` (React component tree vs. actual DOM tree divergence), `VirtualizedListDiagram` (only in-viewport rows get real DOM nodes). Deliberately *not* diagrammed: `componentDidMount`/`componentWillUnmount` equivalents (already covered by Batch 1's lifecycle table/diagram-adjacent question — cross-linked instead of re-diagrammed), Redux Toolkit/Zustand/TanStack Query/SWR (comparison tables did the job). **60 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2 + 20 Batch 3); #61–99 remain (minus already-covered #64/#67/#69/#70/#78/#99 once written). Next.js (99 questions) hasn't started.

**React — Batch 4 done (2026-07-16):** questions #61–80 (20 questions), closing out every remaining forward-referenced slug except `profiler-api-in-react` (#99, still pending). Covers `useState` vs. `useRef` for values, preventing memory leaks, dependency injection via Context, render vs. commit phases, Fragments, the legacy `React.Children` API, `defaultProps`/TypeScript defaults, `displayName`, sharing/lifting state between siblings, global state without Redux, the Provider pattern, undo/redo, event pooling, animation (CSS/Motion), drag and drop, SSR vs. CSR vs. SSG, React Server Components, and the rules of hooks. Real, current-as-of-2026 facts verified rather than assumed: **React 17 (not 18 or 19) removed event pooling entirely** — `event.persist()` is a no-op in every actively-maintained version; **React 18 removed the "state update on an unmounted component" warning itself**, not just changed it, because most triggers weren't real leaks (subscriptions are the case that still matters); **Framer Motion was renamed to Motion in 2025** (package `framer-motion` → `motion`, import `motion/react`); **`@dnd-kit` is the 2026-standard drag-and-drop choice**, with `react-beautiful-dnd` deprecated and uncertain on React 19; **`React.Children` is listed as a legacy API in React's own docs**, not recommended for new code. 4 new diagrams, one reused across two questions: `LiftingStateUpDiagram` (shared between `sharing-state-between-siblings` and `lifting-state-up-in-react`, since they're the same mechanism — same reuse pattern as Batch 1's `VirtualDomDiffDiagram`), `UndoRedoDiagram` (past/present/future stacks), `SsrCsrSsgDiagram` (when HTML gets built, for each of the three), `ReactServerComponentsDiagram` (server vs. client component tree split). Deliberately *not* re-diagrammed: render vs. commit phases (cross-links to Batch 2's Fiber diagram instead of duplicating it). **80 of 99 React questions now done** (2 pilot + 19 Batch 1 + 19 Batch 2 + 20 Batch 3 + 20 Batch 4); #81–99 remain (19 questions). Next.js (99 questions) hasn't started.

**React collection complete (2026-07-16):** final batch, questions #81–99 (19 questions), closes out the 99-question React collection — `profiler-api-in-react` (#99) was the last outstanding forward reference from earlier batches, now written. Covers the React 19 `use()` API, the React Compiler by name, authentication and protected routes, React Router's v6 changes and current status, breadcrumbs, push vs. replace, 404 handling, accessibility/ARIA, synthetic events, memoization tradeoffs, design systems, Storybook, custom renderers, `react-dom` vs. `react`, `createRoot`, and performance debugging (Profiler API and DevTools). Real, current-as-of-2026 facts verified rather than assumed: **`use()` is explicitly not a hook and doesn't follow the Rules of Hooks** — callable conditionally, in loops, or after an early return, tracked by reference (the Promise/Context itself) rather than call order; **React 17 (not 18/19) moved event delegation from `document` to the root container**; and, the most significant correction this batch, **React Router v6 is now end-of-life as of 2026** — Remix merged into React Router (what would have been Remix v3 shipped as React Router v7), and React Router v8 is current, so the v6-and-its-changes answer states v6's real historical changes but names the current EOL status directly rather than presenting v6 as if it were still the latest version. 3 new diagrams: `PushVsReplaceDiagram` (history-stack behavior), `SyntheticEventDelegationDiagram` (native event → root-container delegation → SyntheticEvent → component-tree dispatch, tying back to the Portal question's event-bubbling gotcha), `CustomRendererArchitectureDiagram` (shared reconciler core vs. per-target host configs — react-dom, react-native, react-three-fiber, Ink). Deliberately not diagrammed: the React Compiler, `use()`, memoization tradeoffs, and Profiler API (all well-served by code examples and tables, avoiding redundancy with existing useMemo/useCallback/React.memo/Fiber diagrams already in the collection).

**Final tally: 99 of 99 React questions done** — 2 pilot answers + 5 batches (19 + 19 + 20 + 20 + 19 = 97 questions). 16 new diagram components authored across the React collection (2 in Batch 1, 4 in Batch 2, 3 in Batch 3, 4 in Batch 4, 3 in the final batch), each added only after passing the corrected per-question eligibility check, not a fixed quota per batch. All pages verified 200, every diagram confirmed rendering its specific content, the `ff-react` list page confirmed showing all 99 questions, and `/interview-prep`, `/practice`, `/learn` regression-checked clean after every batch.

Next.js content (99 questions) lives on a separate `content/ff-nextjs-questions` branch, same convention as JS and React — not duplicated here.

When continuing any collection's run, batch it (do not attempt all remaining questions in one pass) and update this file's Status section as batches complete.

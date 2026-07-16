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

Pilot approved 2026-07-14, seeded as real rows in `collection_questions` during Feature 31's build (`scripts/seed/collectionQuestions/`) — live at `/interview-prep/ff-javascript/var-let-const-differences` etc. **Both of this pilot's diagram-eligible answers now have real hand-authored SVG diagrams** (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `features/interview-prep/components/diagrams/`) — the intended cadence going forward (user-confirmed) is one diagram authored alongside each eligible question as it's written, not a single batch pass after all 299 questions land.

Full 299-question run (101 JavaScript / 99 React / 99 Next.js) started 2026-07-15, working collection by collection (JavaScript first, then React, then Next.js — user's own call), sub-batched within each collection (per the "don't attempt it all at once" rule below).

**JavaScript — Batch 1 done** (source: the user's "Javascript questions.pdf"): questions #2, #3, #5–20 (18 questions; #1 and #4 were already covered by the pilot). Every question authored with a real internal link wherever a matching Learn concept genuinely exists (`hoisting-temporal-dead-zone`, `closures`, `prototypal-inheritance`, `equality-type-coercion`, `promises-async-await`, `callbacks-higher-order-functions`, `this-binding-execution-context`, `event-delegation-bubbling-capturing`, `generators-iterators`, `memory-management-leaks`), plus real cross-links between newly-seeded questions themselves where genuinely related (e.g. `call-apply-bind-differences` ↔ `how-does-this-behave`). One new diagram: `PrototypeChainDiagram` for "Explain the concept of prototypal inheritance." (#5 — matches the checklist's named diagram-eligible list). `event-loop`'s `orderIndex` corrected from 2 → 4 to match the source PDF's own numbering, now that more of the sequence is filled in. **20 of 101 JavaScript questions now done** (2 pilot + 18 batch 1); #21–101 remain, in further batches. React and Next.js (99 each) haven't started.

**Format rule added after Batch 1 (user feedback):** the "classic interview gotcha" section — Batch 1's `what-are-closures` answer had one (the `var`-in-a-loop closure surprise) almost incidentally; the user liked it enough to make it a required checklist item (see the format checklist's item 7) starting with Batch 2, not just something that shows up when a question happens to lend itself to it.

**JavaScript — Batch 2 done:** questions #21–40 (20 questions), every one with a real "classic interview gotcha" section per the new rule above (e.g. debounce-never-fires-during-a-continuous-burst, the `??` vs `||` zero/empty-string trap, `Array.prototype.sort()`'s in-place mutation, the `null` vs `undefined` default-parameter distinction). Real links continue wherever a genuine target exists: 6 more Learn concepts (`function-composition-currying`, `array-object-methods-immutability` — reused 3×, `memory-management-leaks` — reused), several cross-links between newly-seeded questions (`debouncing-and-throttling` ↔ `settimeout-vs-setinterval`, `how-javascript-handles-async` ↔ `what-is-the-event-loop`, `how-the-prototype-chain-works` ↔ `prototypal-inheritance-explained`, `commonjs-vs-es-modules` ↔ `what-is-tree-shaking`, others), and a few honest "none yet" cases where no real Learn concept or seeded question covers the topic (`template-literals-and-tagged-templates`, `map-vs-object`, `set-vs-array`, `proxy-object-in-javascript`) rather than a fabricated link. No new diagrams this batch — none of #21–40 are on the checklist's named flow/process list.

**JavaScript — Batch 3 done:** questions #41–60 (20 questions), every one with a real "classic interview gotcha" section (e.g. `reduce()` on an empty array with no initial value, `Object.freeze()`'s shallow-only guarantee, `postMessage`'s structured-clone semantics defeating shared-memory assumptions, `Promise.all` discarding still-pending results on the first rejection, a microtask chain starving the macrotask queue indefinitely). New Learn concept links used for the first time this run: `event-delegation-bubbling-capturing` (event bubbling/capturing, reused from the delegation question's existing link), `storage-apis` (IndexedDB, localStorage/sessionStorage/cookies), `cors-same-origin-policy`, `web-security-fundamentals` (XSS/CSRF), `web-workers-concurrency`, `service-workers-caching-strategies`; `array-object-methods-immutability` reused again (map/filter/reduce, flat/flatMap). Several new cross-links between sibling questions (`array-map-filter-reduce-differences` ↔ `array-flat-and-flatmap`, `proxy-and-reflect` ↔ `proxy-object-in-javascript`, `what-is-indexeddb` ↔ `localstorage-vs-sessionstorage-vs-cookies` ↔ `xss-and-csrf-explained`, `promise-all-vs-race-vs-allsettled-vs-any` ↔ `microtask-vs-macrotask-queue`, `event-bubbling-and-capturing` ↔ `stoppropagation-vs-preventdefault`), and one honest "none yet" (`function-overloading-in-javascript` — no Learn concept covers JS's lack of native overloading). No new diagrams — none of #41–60 are on the named flow/process list. **Tooling note:** mid-session verification hit a batch-wide false-alarm — all 20 pages 404'd on first check even though the DB rows were confirmed present and correct; root cause was Turbopack's dev-mode fetch-cache (`.next/dev/cache`, disk-persisted, independent of the `unstable_cache` `revalidate: 3600`/`"concepts"` tag) surviving from an earlier verification session and predating this batch's seed. A dev server restart alone does **not** clear it — the directory has to be deleted manually. Worth remembering for future batches: after seeding new content mid-session, clear `.next/dev/cache` before trusting a 404 as a real content bug. **60 of 101 JavaScript questions now done** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3); #61–101 remain (41 questions). React and Next.js (99 each) haven't started.

**Diagram-coverage correction (2026-07-15, user-caught):** Batches 2 and 3 were marked "no new diagrams" too quickly — the checklist's named list (event loop, hydration, reconciliation, SSR/CSR/SSG, ISR, prototypal inheritance, virtual DOM diffing) is explicitly described as an *estimate* ("an estimated 40-50 of the 299 questions"), i.e. examples, not the exhaustive set — every question still needs an honest "is this genuinely a flow/process concept" check, not just a match against the named list. Four were missed and have now been added, with **zero changes to any answer text** (diagram wiring only): `how-the-prototype-chain-works` (#25, reuses the existing `PrototypeChainDiagram` as-is — same prototype-chain-walk mechanism as `prototypal-inheritance-explained`, just via a plain array instead of `Object.create()`), `event-bubbling-and-capturing` (#47, new `EventBubblingCapturingDiagram` — capture/target/bubble phases through a nested DOM tree), `how-garbage-collection-works` (#35, new `GarbageCollectionDiagram` — before/after reachability panels matching the `user = null` example already in the answer), `microtask-vs-macrotask-queue` (#59, new `MicrotaskMacrotaskDiagram` — same 4-lane grammar as `EventLoopFlowDiagram` but walking this question's own trickier 6-step nested-microtask example, since reusing the event-loop diagram unchanged would have shown the wrong output numbers). All 4 wired into `DIAGRAM_BY_SLUG` in `page.tsx`, typecheck/lint clean, all 4 pages verified rendering their diagram's actual SVG content (not just a generic svg count). **Standing correction for all future batches:** evaluate diagram-eligibility per-question against the actual definition ("genuinely a flow/process concept"), not just against the named examples.

**JavaScript — Batch 4 done:** questions #61–80 (20 questions), every one with a real "classic interview gotcha" section (e.g. a getter with no setter silently no-opping in non-strict mode, calling a function constructor without `new` producing a silently broken object, the default string-sort producing `[1, 10, 2]`, `finally`'s `return` silently overriding `try`'s, forgetting `await` on a `return`ed Promise inside `try` skipping `catch` entirely). This batch applied the corrected diagram-eligibility check properly (see the correction above) rather than defaulting to "no diagram" — **2 new diagrams** genuinely earned it: `tail-call-optimization` (new `TailCallOptimizationDiagram` — stack frames growing without TCO vs. a single frame reused with it) and `observer-pattern-explained` (new `ObserverPatternDiagram` — one `notify()` fanning out to every subscribed observer). No existing Learn concepts matched most of this batch's topics (class/constructor mechanics, sort internals, design patterns, error handling) — mostly honest "none yet" links, with cross-links between sibling questions instead (`class-vs-function-constructors` ↔ `how-does-this-behave`, `what-are-design-patterns` ↔ its 3 dedicated pattern questions, `error-handling-in-async-await` ↔ `try-catch-finally-explained`, `observer-pattern-explained` ↔ `how-garbage-collection-works` for the forgotten-unsubscribe leak parallel, others). **80 of 101 JavaScript questions now done** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3 + 20 Batch 4); #81–101 remain (21 questions, the last JavaScript batch). React and Next.js (99 each) haven't started.

**JavaScript — Batch 5 done (final batch):** questions #81–101 (21 questions), completing the full 101-question JavaScript collection. Every question has a real "classic interview gotcha" section (e.g. `throw` inside a `setTimeout` callback being a genuinely uncaught exception no `.catch()` can intercept, memoizing a recursive function only working if its own internal calls go through the memoized wrapper, `BigInt`/`Number` throwing on mixed arithmetic instead of coercing, `Object.create(null)` producing an object with no `hasOwnProperty` at all). Two questions (#82 memoization, #92 tagged templates) are near-duplicates of earlier questions in the source PDF itself — both were written with a genuinely distinct, deeper angle (recursive/multi-arg memoization; `String.raw` and real production tag-function use cases) rather than repeating the same content, and cross-linked back to the originals. Diagram-eligibility was evaluated per-question against the corrected standard (see the correction above) and genuinely **no new diagrams were needed** this batch — the topics are mostly API/comparison questions well-served by tables and code, not flow/process concepts. One real bug caught and fixed during authoring: an attempt to show tagged-template call syntax as inline code with embedded backticks would have rendered literal backslashes to the reader — rewritten in prose instead, with the actual working example left to the fenced code block. **101 of 101 JavaScript questions now done — the JavaScript collection is complete** (2 pilot + 18 Batch 1 + 20 Batch 2 + 20 Batch 3 + 20 Batch 4 + 21 Batch 5), with 8 diagram components across 9 diagram-eligible question pages (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `PrototypeChainDiagram` — reused across 2 questions, `EventBubblingCapturingDiagram`, `GarbageCollectionDiagram`, `MicrotaskMacrotaskDiagram`, `TailCallOptimizationDiagram`, `ObserverPatternDiagram`). React and Next.js (99 questions each) haven't started — next up.

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

Pilot approved 2026-07-14, seeded as real rows in `collection_questions` during Feature 31's build (`scripts/seed/collectionQuestions/`) — live at `/interview-prep/ff-javascript/var-let-const-differences` etc. Full 299-question run (101 JavaScript / 99 React / 99 Next.js, source PDFs supplied by the user) started 2026-07-15, working collection by collection. **Both of this pilot's diagram-eligible answers now have real hand-authored SVG diagrams** (`EventLoopFlowDiagram`, `IsrTimelineDiagram`, `features/interview-prep/components/diagrams/`) — the intended cadence going forward (user-confirmed) is one diagram authored alongside each eligible question as it's written, not a single batch pass after all 299 questions land.

**JavaScript and React collections are both complete** (101/101 and 99/99 questions respectively) — full history tracked on the `content/ff-javascript-questions` and `content/ff-react-questions` branches' own copies of this file; not duplicated here, same convention those two branches already established, to keep each collection's PR independently reviewable. All three branches will reconcile when merged.

**Next.js — Batch 1 done (2026-07-16):** corrected both pilot questions' `orderIndex` to match the source PDF's own numbering (`getstaticprops-when-to-use` 1→4, `incremental-static-regeneration` 2→7), same convention as JS/React, and upgraded their `Related` lines from plain text to real links now that some of those targets exist. Batch 1 covers questions #1–3, 5, 6, 8–21 (19 questions; #4/#7 already covered by the pilot): Next.js vs. plain React, Pages Router vs. App Router, file-based routing, `getServerSideProps`/`getStaticPaths`, Server Components/Client Components/the `'use client'` vs. `'use server'` split, Server Actions, and the `layout.js`/`loading.js`/`error.js`/`not-found.js`/`template.js` file conventions, metadata, and `next/image`/`next/link`/`next/font`/`next/script`. Real, current-as-of-2026 facts verified rather than assumed: **Next.js is currently at major version 16**, with Turbopack now stable and the default bundler, Cache Components (`"use cache"`) as the current caching paradigm, and React 19.2 integrated; the **App Router is the default and actively-developed target**, with the Pages Router explicitly in maintenance mode (not a neutral "pick either" choice); `generateMetadata`'s `params` is a Promise that must be awaited as of Next.js 15+; and the precise **file-convention nesting order** — `layout.js` (persists) wraps `template.js` (remounts every navigation), which wraps `error.js`'s Error Boundary, which wraps `loading.js`'s Suspense boundary, which wraps `page.js`/`not-found.js` — was verified directly against Next.js's own file-conventions docs rather than assumed. 3 new diagram components (`ServerActionsFlowDiagram`, `StreamingDiagram`, `AppRouterFileHierarchyDiagram`) plus one deliberate cross-branch reuse: the React collection's `ReactServerComponentsDiagram` is reused as-is for `server-components-in-nextjs-app-router`, since it's the identical server/client tree-split mechanism, just in the Next.js context — duplicated identically as a file on both `content/ff-react-questions` and this branch so each stays independently buildable without depending on the other's commits. 10 new forward-referenced slugs queued for later batches (see this file's top-of-file comment in `ffNextjs.ts` for the exact list). **21 of 99 Next.js questions now done** (2 pilot + 19 Batch 1); #22–99 remain. This is the final collection in the 299-question run.

**Next.js — Batch 2 done (2026-07-16):** covers questions #22–41 (20 questions): environment variables, the `public` directory, `next.config.js`, API routes vs. Route Handlers, middleware, authentication (NextAuth.js/Auth.js), static vs. dynamic rendering, Partial Prerendering, Streaming/Suspense, `fetch()` caching, cache tags, `revalidatePath`/`revalidateTag`, `unstable_cache`, redirects/rewrites, dynamic routes, catch-all routes, optional catch-all routes, and parallel routes — all four forward-referenced slugs from Batch 1 landed exactly as queued (`dynamic-routes-in-nextjs`, `catch-all-routes-in-nextjs`, `revalidatepath-and-revalidatetag-function`, `streaming-in-nextjs-and-suspense`). Two real, version-sensitive facts verified rather than assumed, both significant enough to flag directly in their answers: **Next.js 16 renamed `middleware.ts` to `proxy.ts`**, moving it from the Edge Runtime to the Node.js runtime by default (`middleware.ts` still works but is deprecated); and **NextAuth.js rebranded to Auth.js** (stable v5 since late 2024), with the Next.js-specific package still published as `next-auth`. Also verified: PPR shipped stable in Next.js 16 as part of Cache Components (the old `experimental.ppr` flag was removed, replaced by `cacheComponents: true`); `fetch()`'s default flipped from cache-by-default to `no-store`-by-default starting Next.js 15, and Cache Components keeps that dynamic-by-default direction; `unstable_cache` is now formally deprecated in favor of the `"use cache"` directive; dynamic/catch-all/optional-catch-all route conventions are unchanged. 3 new diagram components (`MiddlewareFlowDiagram`, `PartialPrerenderingDiagram`, `ParallelRoutesDiagram`) plus one same-collection diagram reuse: `StreamingDiagram` (authored in Batch 1 for `loadingjs-and-streaming`) is reused as-is for `streaming-in-nextjs-and-suspense`, since both questions describe the identical Suspense-streaming mechanism from different angles. **41 of 99 Next.js questions now done** (2 pilot + 19 Batch 1 + 20 Batch 2); #42–99 remain.

**Next.js — Batch 3 done (2026-07-16):** covers questions #42–61 (20 questions): intercepting routes, the `@folder` convention (clarified against route groups' `(folder)` convention, easy to confuse), i18n (`next-intl` as the 2026 App Router standard), `next/navigation` vs `next/router`, the `useRouter`/`usePathname`/`useSearchParams` hooks, persisting state across navigation, Link prefetching, 404/500 error handling, middleware/Edge Runtime, the Node.js vs. Edge Runtime split, Turbopack vs. Webpack, automatic image optimization, the Vercel Image Optimization API, deploying outside Vercel, `output: 'export'`, `output: 'standalone'`, dark mode (`next-themes`), the `cookies()`/`headers()` API, and `connection()`. One question (#50, "how middleware runs at the edge") needed careful, version-aware handling given Batch 2's `proxy.ts` finding: answered precisely as "historically Edge-only through Next.js 15; `proxy.ts` (Next.js 16+) now runs on Node.js by default, while the deprecated `middleware.ts` still runs on Edge" rather than restating the old flat "middleware runs at the edge" claim as if still fully current. Also verified: Turbopack is stable and the default bundler for both `next dev`/`next build` as of Next.js 16, with Webpack still available via an opt-out flag; `next-intl` is the de facto standard i18n library for App Router in 2026; `next-themes` (with `attribute="class"` + `suppressHydrationWarning`) is the standard dark-mode pattern; `cookies()`/`headers()` have been async since Next.js 15 (same as `params`/`searchParams`, consistent with Batch 1/2's findings). 1 new diagram component (`InterceptingRoutesDiagram`), explicitly paired with Batch 2's `ParallelRoutesDiagram` since intercepting routes are near-always used together with a parallel-routes slot for the shareable-modal pattern. One new forward-referenced slug queued (`implementing-search-params-in-app-router`, #63 — see `ffNextjs.ts`'s top-of-file comment). **61 of 99 Next.js questions now done** (2 pilot + 19 Batch 1 + 20 Batch 2 + 20 Batch 3); #62–99 remain.

**Next.js — Batch 4 done (2026-07-16):** covers questions #62–81 (20 questions): React `cache()`/`use()` in the Next.js context, search params (the `searchParams` prop vs. the `useSearchParams` hook), handling form submissions with Server Actions, `useFormState`/`useFormStatus`, `useOptimistic`, file uploads, `instrumentation.ts`, OpenTelemetry, Content Security Policy, TypeScript configuration, the `tsconfig` paths alias, CSS Modules/Tailwind/global CSS/Sass, the RSC payload, how the App Router handles data mutations, `push()` vs. `replace()`, and `next/dynamic`. One genuinely important rename verified and flagged directly in its answer: **`useFormState` is deprecated in React 19, replaced by `useActionState`** — imported from `react` itself, not `react-dom` (unlike `useFormStatus`, which is unchanged) — a stale answer here is an easy, concrete tell of pre-React-19 knowledge. Also verified: Server Actions have a default 1MB request body size limit (relevant to the file-uploads question); a per-request CSP nonce forces dynamic rendering, since a value that must be unique per-request can't be part of a statically-cached response; Tailwind v4's dark-mode config moved from `tailwind.config.js`'s `darkMode: 'class'` to a CSS-based `@custom-variant` directive; and Next.js 16 added `updateTag` as a newer, Server-Action-only immediate-invalidation API alongside the existing `revalidatePath`/`revalidateTag`. 1 new diagram component (`RscPayloadDiagram`, for the RSC-payload-as-a-distinct-wire-format question) plus one same-collection reuse: Batch 1's `ServerActionsFlowDiagram` is reused for the broader "how does the App Router handle data mutations" question, since it's the identical underlying mechanism. One new forward-referenced slug queued (`dynamic-over-react-lazy`, #82 — see `ffNextjs.ts`'s top-of-file comment). **81 of 99 Next.js questions now done** (2 pilot + 19 Batch 1 + 20 Batch 2 + 20 Batch 3 + 20 Batch 4); #82–99 (18 questions) remain — the final batch for the entire 299-question run.

**Next.js — Batch 5 done (2026-07-16), the final batch of the entire 299-question run:** covers questions #82–99 (18 questions): `dynamic()` vs. `React.lazy()`, loading skeletons, the `next.config.js` `headers()` function, Multi-Zone architecture, the `_app.js` equivalent, root layouts, nested layouts and performance, measuring Core Web Vitals, `next/analytics`, Next.js 14 vs. 13, what's new in Next.js 15, `generateStaticParams`, caching database queries, `draftMode()`, rate limiting in middleware, `forbidden()`/`unauthorized()`, testing Next.js apps, and Playwright vs. Cypress. One question (#90, "What is `next/analytics`?") was a deliberate check on fabrication risk: **no such package exists** — verified directly rather than guessing, and the answer says so plainly before naming the real, separate tools (`next/web-vitals`'s `useReportWebVitals`, `@vercel/analytics`, `@next/third-parties`) the question was likely probing for. Other real, version-sensitive facts verified: Next.js 14's actual headline change was stabilizing Server Actions (the App Router itself was 13's contribution, a common easy-to-invert detail); Next.js 15 made `params`/`searchParams`/`cookies()`/`headers()` async and flipped `fetch()`'s default from cached to `no-store`; `forbidden()`/`unauthorized()` remain experimental (behind `experimental.authInterrupts`) as of Next.js 15.1, not a stabilized API; Vitest cannot currently test async Server Components directly, which is why Playwright is the recommended tool for that specific case; and Playwright is the more common 2026 default recommendation over Cypress for Next.js specifically due to native multi-origin support for OAuth/SSO flows. 1 new diagram component (`MultiZoneDiagram`, for the Multi-Zone architecture question — a genuinely distinct, novel architecture concept from anything diagrammed in earlier batches). Caught and fixed one real bug during this batch: an unescaped literal backtick around `window` inside a code-comment (nested inside an outer template-literal string) broke the file's syntax entirely — caught immediately by `npx tsc --noEmit`, fixed, and reverified clean before seeding.

**The Next.js collection is now complete: 99/99 questions**, and with it, **the entire 299-question interview-prep content run across all three collections (101 JavaScript / 99 React / 99 Next.js) is complete.** Verified end-to-end on this branch: `npx tsc --noEmit` clean, and `npx tsx scripts/seed.ts` succeeds seeding all 103 collection-question rows on this branch (2 JS pilot + 2 React pilot + 99 Next.js — the full JS and React collections live on their own branches per [[feedback_content_branch_per_collection]] and aren't duplicated here). This branch alone now has 12 hand-authored diagram components (10 authored across the Next.js batches, plus the 2 shared pilot diagrams and one deliberate duplicate of the React branch's `ReactServerComponentsDiagram`) — each added one at a time as its question was written, per the cadence established back at the pilot; the JavaScript and React branches carry their own diagram counts, not reconciled or totaled here yet. Next step is reconciling the three collection branches (`content/ff-javascript-questions`, `content/ff-react-questions`, `content/ff-nextjs-questions`) — not yet done, pending explicit go-ahead.

When continuing any collection's run, batch it (do not attempt all remaining questions in one pass) and update this file's Status section as batches complete.

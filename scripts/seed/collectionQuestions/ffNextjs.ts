import type { CollectionQuestionSeed } from "../types";

// Full 99-question FF Next.js collection (source: the user's "Next.js
// Interview Questions.pdf"), built across 5 authoring passes: the pilot (2 of
// interview-prep-content-guide.md's 6 approved pilot answers, orderIndex
// corrected to 4 and 7 to match the source PDF's own numbering, same
// convention as the JavaScript and React collections), then Batch 1 (#1-3, 5,
// 6, 8-21), Batch 2 (#22-41), Batch 3 (#42-61), Batch 4 (#62-81), and Batch 5
// — the final batch (#82-99). Every Next.js API/behavior fact in this file is
// web-search-verified per interview-prep-content-guide.md's non-negotiable
// accuracy rule — current stable is Next.js 16.x (Turbopack stable and the
// default bundler, Cache Components/"use cache" as the current caching
// model, React 19.2 integration); the App Router is the default and
// actively-developed target, with the Pages Router in maintenance mode only.
// All forward-referenced slugs used across earlier batches' links landed
// exactly as queued by the batch that eventually wrote them; none remain
// outstanding now that the collection is complete. Full batch-by-batch
// details are in interview-prep-content-guide.md's Status section.
export const FF_NEXTJS_COLLECTION_QUESTIONS: CollectionQuestionSeed[] = [
  {
    collection: "ff-nextjs",
    slug: "getstaticprops-when-to-use",
    question: "What is `getStaticProps` and when do you use it?",
    answer: `\`getStaticProps\` is a **Pages Router** data-fetching function — exported from a page file, it runs at build time (or on a schedule with ISR), fetches data server-side, and passes it to the page as props for a fully pre-rendered HTML page. **It's important to answer this precisely: \`getStaticProps\` does not exist in the App Router** — a genuinely common source of confusion, and worth naming directly rather than glossing over.

### Pages Router usage

\`\`\`js
// pages/posts/[id].js
export async function getStaticProps({ params }) {
  const post = await getPostById(params.id);
  return { props: { post }, revalidate: 60 }; // ISR: regenerate at most every 60s
}
\`\`\`

### When to use it (Pages Router)

Use it when the page's content doesn't need to be unique per-request — blog posts, marketing pages, product listings — anything that can be built once and served to everyone, optionally refreshed on an interval via ISR's \`revalidate\` field.

### The App Router equivalent

If you're working in the App Router (the default for any new Next.js project as of 2026), the same outcome comes from a plain \`fetch()\` inside an async Server Component, with the caching behavior controlled by options instead of a separate function:

\`\`\`jsx
// app/posts/[id]/page.tsx
async function Post({ params }) {
  const res = await fetch(\`https://api.example.com/posts/\${params.id}\`, {
    next: { revalidate: 60 }, // same ISR behavior as getStaticProps's revalidate
  });
  const post = await res.json();
  return <article>{post.title}</article>;
}
\`\`\`

\`cache: 'force-cache'\` behaves like \`getStaticProps\`'s default (cache indefinitely); \`next: { revalidate: N }\` behaves like ISR; \`cache: 'no-store'\` behaves like \`getServerSideProps\` (always fresh, no caching). \`getStaticPaths\`'s job — declaring which dynamic routes to pre-render — is now \`generateStaticParams\`.

### Why this question still gets asked

Plenty of production codebases are still on the Pages Router, and interviewers use this question to check whether a candidate actually understands the caching model underneath — not just which function name to type.

**Related:** [What is getServerSideProps and when do you use it?](/interview-prep/ff-nextjs/getserversideprops-when-to-use) · [What is getStaticPaths?](/interview-prep/ff-nextjs/getstaticpaths-explained) · [What is Incremental Static Regeneration (ISR)?](/interview-prep/ff-nextjs/incremental-static-regeneration) · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — Migrating to App Router docs, Next.js — getStaticProps docs`,
    difficulty: "medium",
    companies: ["Vercel"],
    orderIndex: 4,
  },
  {
    collection: "ff-nextjs",
    slug: "incremental-static-regeneration",
    question: "What is Incremental Static Regeneration (ISR)?",
    answer: `Incremental Static Regeneration lets a statically generated page stay fast *and* stay fresh: Next.js serves the cached HTML instantly on every request, and once a page passes its \`revalidate\` age, the **next** visitor still gets the fast cached version immediately while Next.js regenerates a fresh copy in the background for everyone after them — a stale-while-revalidate pattern, not a rebuild-and-wait one.

### Time-based ISR

\`\`\`js
export async function getStaticProps() {
  const products = await getProducts();
  return { props: { products }, revalidate: 3600 }; // regenerate at most once/hour
}
\`\`\`

Nobody ever waits on a rebuild — the worst case is one visitor sees data that's up to \`revalidate\` seconds old, which then self-heals on the next background regeneration.

### On-demand revalidation

Time-based ISR is a safety net; most real production setups pair it with on-demand revalidation triggered by a webhook (e.g. a CMS save):

\`\`\`js
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
\`\`\`

This regenerates a specific page immediately instead of waiting for its \`revalidate\` window — near-instant freshness with far less compute than rebuilding the whole site.

### Real constraints worth knowing

ISR requires the Node.js runtime (the default) — it's not supported with \`output: 'export'\` (a static export has no server to regenerate anything on). This is a common gotcha: teams deploying a fully static export lose ISR entirely and need to pick one or the other.

**Related:** [What is getStaticProps and when do you use it?](/interview-prep/ff-nextjs/getstaticprops-when-to-use) · What is the revalidatePath and revalidateTag function? · What is Partial Prerendering (PPR)? · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — ISR guide, Vercel — ISR docs`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 7,
  },
  {
    collection: "ff-nextjs",
    slug: "what-is-nextjs-and-how-it-differs-from-react",
    question: "What is Next.js and how does it differ from plain React?",
    answer: `React is a UI library — it renders components but has no built-in opinion on routing, data fetching, or how a page actually reaches the browser. Next.js is a full framework built on top of React that adds file-based routing, multiple rendering strategies (static, server, streaming) out of the box, and a complete build/deploy pipeline. As of 2026, Next.js is at major version 16, with Turbopack now the stable, default bundler and Cache Components (\`"use cache"\`) as its current caching model.

\`\`\`jsx
// Plain React: you glue together a router, a data-fetching library, and a build tool yourself
import { BrowserRouter } from "react-router";

// Next.js: routing, rendering strategy, and the build pipeline are already decided
// app/blog/[slug]/page.tsx — this file IS the route
export default async function BlogPost({ params }) {
  const post = await getPost((await params).slug);
  return <article>{post.title}</article>;
}
\`\`\`

### Classic interview gotcha

"Next.js is just React with extra features" undersells a genuinely meaningful distinction: plain React has no concept of a server at all — it's a client-side rendering library by default, even with SSR bolted on via a separate setup. Next.js's App Router is built around **Server Components as the default**, meaning most components in a Next.js app never ship any JavaScript to the browser at all unless explicitly marked \`"use client"\` — a fundamentally different default, not just a convenience layer on top of the same rendering model.

**Related:** [What is the difference between Pages Router and App Router?](/interview-prep/ff-nextjs/pages-router-vs-app-router) · [What are Server Components in Next.js App Router?](/interview-prep/ff-nextjs/server-components-in-nextjs-app-router)

**Sources checked:** nextjs.org/blog/next-16, nextjs.org/docs (Server Components as the App Router default)`,
    difficulty: "easy",
    companies: ["Vercel", "Meta"],
    orderIndex: 1,
  },
  {
    collection: "ff-nextjs",
    slug: "pages-router-vs-app-router",
    question: "What is the difference between Pages Router and App Router?",
    answer: `Pages Router (the \`pages/\` directory) is Next.js's original routing system — one file per route, data fetching via \`getStaticProps\`/\`getServerSideProps\`, and every component ships as a Client Component by default. App Router (the \`app/\` directory) is the current, default system since Next.js 13 — nested layouts, Server Components by default, streaming, and data fetching via a plain \`fetch()\` with caching options instead of special exported functions. **As of 2026, the App Router is the default and actively-developed target for all new Next.js features; the Pages Router is in long-term maintenance mode.**

| | Pages Router | App Router |
|---|---|---|
| Directory | \`pages/\` | \`app/\` |
| Default component type | Client Component | Server Component |
| Data fetching | \`getStaticProps\`/\`getServerSideProps\` | \`fetch()\` with cache options |
| Layouts | Manual (\`_app.js\`) | Nested, built-in \`layout.js\` |
| Streaming | No | Yes, via \`loading.js\`/Suspense |
| Status (2026) | Maintenance mode | Default, active development |

### Classic interview gotcha

This question is often answered as a neutral "here are the differences, pick whichever" — the more precise, current answer is that they're not two equally-current options: Vercel has stated new Next.js features are built for the App Router first, and often only. A Pages-Router-based answer to "how would you build X in Next.js today" is itself a signal of working from outdated defaults, even though Pages Router apps remain fully supported and aren't on any forced migration timeline.

**Related:** [What is Next.js and how does it differ from plain React?](/interview-prep/ff-nextjs/what-is-nextjs-and-how-it-differs-from-react) · [What is file-based routing in Next.js?](/interview-prep/ff-nextjs/file-based-routing-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 2,
  },
  {
    collection: "ff-nextjs",
    slug: "file-based-routing-in-nextjs",
    question: "What is file-based routing in Next.js?",
    answer: `A file's path inside the \`app/\` (or \`pages/\`) directory directly determines its URL — \`app/blog/page.tsx\` becomes \`/blog\`, \`app/blog/[slug]/page.tsx\` becomes \`/blog/some-post\` — with no separate route-configuration file to keep in sync, since the filesystem itself is the routing table.

| File path | URL |
|---|---|
| \`app/page.tsx\` | \`/\` |
| \`app/about/page.tsx\` | \`/about\` |
| \`app/blog/[slug]/page.tsx\` | \`/blog/:slug\` |
| \`app/blog/[...slug]/page.tsx\` | \`/blog/*\` (catch-all) |

### Classic interview gotcha

In the App Router, a folder alone does **not** create a route — a segment only becomes a publicly reachable page once it contains a \`page.tsx\` file. A folder with only a \`layout.tsx\`, or used purely for colocating components and utilities, doesn't add a URL at all. This trips up people coming from the Pages Router, where nearly every file under \`pages/\` directly became a route.

**Related:** [What are dynamic routes in Next.js?](/interview-prep/ff-nextjs/dynamic-routes-in-nextjs) · [What are catch-all routes ([...slug])?](/interview-prep/ff-nextjs/catch-all-routes-in-nextjs)`,
    difficulty: "easy",
    companies: ["Meta", "Shopify"],
    orderIndex: 3,
  },
  {
    collection: "ff-nextjs",
    slug: "getserversideprops-when-to-use",
    question: "What is getServerSideProps and when do you use it?",
    answer: `\`getServerSideProps\` is a **Pages Router** function that runs on every single request, server-side, fetching fresh data before the page renders — unlike \`getStaticProps\`, nothing is cached or pre-built; every visit re-runs it. **It does not exist in the App Router** — the equivalent there is a plain \`fetch()\` with \`cache: 'no-store'\`, or, since Next.js 15, request-time APIs like \`cookies()\`/\`headers()\` that opt a route into dynamic rendering automatically.

\`\`\`js
// Pages Router
export async function getServerSideProps() {
  const data = await getFreshData(); // re-runs on every single request
  return { props: { data } };
}

// App Router equivalent
async function Page() {
  const res = await fetch("https://api.example.com/data", { cache: "no-store" });
  const data = await res.json();
}
\`\`\`

### Classic interview gotcha

Reaching for \`getServerSideProps\` (or its App Router \`fetch\` equivalent) for data that's actually fine being cached is a common, real performance mistake — every request pays the full server-render-plus-data-fetch cost with zero caching benefit, when ISR (even a short \`revalidate\` window) would serve nearly all the same freshness with dramatically less server load. Reserve it for genuinely per-request-unique data — something tied to the specific requesting user, a real-time price — not as a default "just to be safe" choice.

**Related:** [What is getStaticProps and when do you use it?](/interview-prep/ff-nextjs/getstaticprops-when-to-use) · [What is Incremental Static Regeneration (ISR)?](/interview-prep/ff-nextjs/incremental-static-regeneration)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 5,
  },
  {
    collection: "ff-nextjs",
    slug: "getstaticpaths-explained",
    question: "What is getStaticPaths?",
    answer: `\`getStaticPaths\` is a **Pages Router** function, used alongside \`getStaticProps\` on a dynamic route, that declares which specific dynamic values (which blog slugs, which product IDs) should be pre-rendered at build time — plus a \`fallback\` mode controlling what happens for a path not included in that list. **It does not exist in the App Router** — the direct equivalent is \`generateStaticParams\`.

\`\`\`js
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: "blocking",
  };
}
\`\`\`

| \`fallback\` | Behavior for a path not pre-built |
|---|---|
| \`false\` | 404 |
| \`true\` | Serves a fallback/loading state, then renders and caches on first request |
| \`"blocking"\` | Waits (SSR-style) for the first request, then caches — no fallback UI shown |

### Classic interview gotcha

\`fallback: true\` requires the page component to explicitly handle a not-yet-generated state (checking \`router.isFallback\` in the Pages Router) — forgetting this check is a common bug that crashes the page or shows broken UI for any path outside the pre-built list, since the component receives incomplete or undefined props on that very first render, before the real data has arrived.

**Related:** [What is getStaticProps and when do you use it?](/interview-prep/ff-nextjs/getstaticprops-when-to-use) · [What is the use of generateStaticParams?](/interview-prep/ff-nextjs/use-of-generatestaticparams)`,
    difficulty: "medium",
    companies: ["Vercel", "Adobe"],
    orderIndex: 6,
  },
  {
    collection: "ff-nextjs",
    slug: "server-components-in-nextjs-app-router",
    question: "What are Server Components in Next.js App Router?",
    answer: `Every component in the App Router is a Server Component by default — rendered only on the server, never shipping its own JavaScript to the browser, able to read data directly (a database call, a filesystem read) without a separate API layer. This is the App Router's actual default rendering model, not an opt-in feature layered on top of Client Components.

### Diagram

The same server-vs-client tree split covered in the React collection's Server Components question — \`Page\` and \`ProductList\` render entirely on the server; only a component explicitly marked \`"use client"\` ships JS and hydrates.

\`\`\`jsx
// app/products/page.tsx — a Server Component by default, no directive needed
async function ProductsPage() {
  const products = await db.query("SELECT * FROM products"); // reads data directly
  return products.map((p) => <ProductCard key={p.id} product={p} />);
}
\`\`\`

### Classic interview gotcha

Because Server Components are the default, it's **Client Components** that require the explicit opt-in (\`"use client"\`), not the other way around. A common beginner mistake is sprinkling \`"use client"\` at the top of every file "just in case," which unnecessarily drags components — and everything they import — into the client bundle, giving up the App Router's core benefit for no reason. Write Server Components by default; mark only the specific boundary that genuinely needs interactivity, state, or a browser API.

**Related:** [What are Client Components and when do you need them?](/interview-prep/ff-nextjs/client-components-and-when-needed) · [What is React Server Components (RSC)?](/interview-prep/ff-react/react-server-components-explained) (React collection)

**Sources checked:** nextjs.org/docs (Server Components as the App Router's default rendering model)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 8,
  },
  {
    collection: "ff-nextjs",
    slug: "client-components-and-when-needed",
    question: "What are Client Components and when do you need them?",
    answer: `A Client Component — any file starting with the \`"use client"\` directive — is the only kind of component that can use state, effects, event handlers, or browser-only APIs. Marking a file \`"use client"\` doesn't mean it only runs in the browser — it means the component is *also* sent to and hydrated in the browser; it still renders on the server too, for the initial HTML.

\`\`\`jsx
"use client";

function LikeButton() {
  const [liked, setLiked] = useState(false); // needs state — must be a Client Component
  return <button onClick={() => setLiked(!liked)}>{liked ? "Liked" : "Like"}</button>;
}
\`\`\`

### Classic interview gotcha

\`"use client"\` marks a **boundary**, not an isolated island — everything a Client Component imports also becomes part of the client bundle, even a plain, non-interactive helper function. A common real mistake is marking a large component \`"use client"\` for one small interactive button buried deep inside it, unnecessarily pulling everything else in that file (and its imports) into client-side JS. Extracting just the interactive part into its own small Client Component, and keeping everything around it a Server Component, keeps the client bundle far smaller.

**Related:** [What are Server Components in Next.js App Router?](/interview-prep/ff-nextjs/server-components-in-nextjs-app-router) · [What is the difference between 'use client' and 'use server' directives?](/interview-prep/ff-nextjs/difference-between-use-client-and-use-server)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 9,
  },
  {
    collection: "ff-nextjs",
    slug: "difference-between-use-client-and-use-server",
    question: "What is the difference between 'use client' and 'use server' directives?",
    answer: `\`"use client"\` marks the boundary above which a component tree is Server-rendered-only, and below which it also ships to and hydrates in the browser — it's about **where a component's code runs and is sent**. \`"use server"\` marks a function (not a component) as a Server Action — callable from client code but always executing on the server, functioning like an automatically-generated API endpoint for that one function.

| | \`'use client'\` | \`'use server'\` |
|---|---|---|
| Marks | A component/module boundary | A function (Server Action) |
| Meaning | Ships to and hydrates in the browser | Callable from the client, always runs on the server |
| Where it appears | Top of a component file | Top of a function, or top of a file of Server Actions |

### Classic interview gotcha

These two directives are easy to conflate since they sound like opposites of the same thing, but they don't compose the way that intuition suggests — a Server Action (\`"use server"\`) is very commonly **called from inside** a Client Component (\`"use client"\`), since that's exactly the pattern that lets an interactive form (needing \`"use client"\` for its input state and event handlers) submit data via a function that still only ever executes on the server.

**Related:** [What are Server Components in Next.js App Router?](/interview-prep/ff-nextjs/server-components-in-nextjs-app-router) · [What are Server Actions in Next.js?](/interview-prep/ff-nextjs/server-actions-in-nextjs)`,
    difficulty: "hard",
    companies: ["Meta", "Vercel"],
    orderIndex: 10,
  },
  {
    collection: "ff-nextjs",
    slug: "server-actions-in-nextjs",
    question: "What are Server Actions in Next.js?",
    answer: `A Server Action is an async function marked with \`"use server"\` that runs exclusively on the server but can be called directly from client code — most commonly wired to \`<form action={myAction}>\`, which automatically receives the submitted \`FormData\` — without hand-writing a separate API route and a client-side \`fetch\` call to reach it.

### Diagram

A form submission calls the Server Action directly — no hand-written API route or client-side fetch in between — and the action must explicitly revalidate before any cached UI reflects the change.

\`\`\`jsx
async function createInvoice(formData) {
  "use server";
  await db.invoices.create({ amount: formData.get("amount") });
  revalidatePath("/invoices"); // without this, the page keeps showing stale data
}

<form action={createInvoice}>
  <input name="amount" />
  <button type="submit">Create</button>
</form>
\`\`\`

### Classic interview gotcha

A Server Action doesn't automatically refresh any UI that displayed the data it just changed — after a mutation, the action needs to explicitly call \`revalidatePath\`/\`revalidateTag\` (or return updated data directly), or the page keeps showing stale, cached content even though the underlying data changed. This is a very common "why didn't my UI update after submitting the form" bug for anyone assuming a Server Action's side effect alone is enough to invalidate a cached page.

**Related:** [What is the difference between 'use client' and 'use server' directives?](/interview-prep/ff-nextjs/difference-between-use-client-and-use-server) · [What is the revalidatePath and revalidateTag function?](/interview-prep/ff-nextjs/revalidatepath-and-revalidatetag-function)

**Sources checked:** nextjs.org/docs/app/guides/server-actions, nextjs.org/docs/app/guides/forms`,
    difficulty: "hard",
    companies: ["Vercel", "Stripe"],
    orderIndex: 11,
  },
  {
    collection: "ff-nextjs",
    slug: "layoutjs-file-in-app-router",
    question: "What is the layout.js file in App Router?",
    answer: `A \`layout.js\` file wraps a route segment and everything nested beneath it, rendering shared UI (navigation, a sidebar) around the segment's \`page.js\`. Critically, layouts **persist across navigation** within their segment — only the parts of the tree that actually changed re-render, not the whole layout, which is why a layout's own state (an open sidebar, scroll position) survives navigating between sibling pages.

\`\`\`jsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      {children} {/* only this part changes between /dashboard/settings and /dashboard/billing */}
    </div>
  );
}
\`\`\`

### Classic interview gotcha

Because layouts persist and are never remounted on navigation between their own child routes, a layout can't directly access the current page's data via props the way \`page.js\` can — it has no \`params\`/\`searchParams\` for the active leaf page by default, precisely because it isn't re-created per navigation. Needing page-specific data inside a layout usually means that data belongs in the page itself, or the layout needs to read it via a hook like \`usePathname\`, not expect it as a prop.

**Related:** [What is the template.js file?](/interview-prep/ff-nextjs/templatejs-file-explained) · [What is a root layout in Next.js?](/interview-prep/ff-nextjs/root-layout-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 12,
  },
  {
    collection: "ff-nextjs",
    slug: "loadingjs-and-streaming",
    question: "What is loading.js and how does it enable streaming?",
    answer: `A \`loading.js\` file automatically wraps its segment's \`page.js\` (and nested layouts) in a Suspense boundary. The moment that segment starts rendering, Next.js can stream the rest of the already-ready page to the browser immediately, showing \`loading.js\`'s fallback only for the specific slower part — instead of the entire page waiting on its slowest data source before anything is sent at all.

### Diagram

The fast shell and fast segments are sent immediately at \`t = 0\`; a slow segment shows its \`loading.js\` fallback in the meantime, then streams in and swaps once its data resolves — the fast parts never waited on it.

\`\`\`jsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />; // shown automatically while page.tsx's data is still loading
}
\`\`\`

### Classic interview gotcha

\`loading.js\` automatically applies to the **entire** segment it's placed in — if only one specific component within that segment is genuinely slow, wrapping just that component in its own \`<Suspense>\` boundary (rather than relying on the segment-wide \`loading.js\`) lets the rest of that same page's fast content render immediately, streaming in only the genuinely slow piece separately.

**Related:** [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react) (React collection) · [What is Streaming in Next.js and how does Suspense enable it?](/interview-prep/ff-nextjs/streaming-in-nextjs-and-suspense)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/loading`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 13,
  },
  {
    collection: "ff-nextjs",
    slug: "errorjs-in-nextjs",
    question: "What is error.js in Next.js?",
    answer: `An \`error.js\` file automatically wraps its segment's \`page.js\`, nested layouts, and \`loading.js\` in a React Error Boundary — catching any error thrown during rendering in that part of the tree and showing its fallback UI instead of the whole app crashing. It must be a Client Component, since it needs to use the \`reset()\` function passed as a prop to let the user retry.

\`\`\`jsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
\`\`\`

### Classic interview gotcha

\`error.js\` does **not** catch errors thrown in its own segment's \`layout.js\` (or anything above it) — an error boundary can't catch an error thrown by the component that renders it, only by its children. An error in a segment's own layout has to be caught by the nearest \`error.js\` **above** that layout, in the parent segment, not the one in the same folder.

**Related:** [What are Error Boundaries in React?](/interview-prep/ff-react/error-boundaries-in-react) (React collection) · [What is the template.js file?](/interview-prep/ff-nextjs/templatejs-file-explained)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/error`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 14,
  },
  {
    collection: "ff-nextjs",
    slug: "not-foundjs-explained",
    question: "What is not-found.js?",
    answer: `A \`not-found.js\` file renders whenever the \`notFound()\` function is called from within that route segment — typically after a lookup returns nothing, like a missing blog post or an invalid ID — distinct from Next.js's default global 404 page, letting a specific section of the app show more contextual "not found" UI.

\`\`\`jsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function Post({ params }) {
  const post = await getPost((await params).slug);
  if (!post) notFound(); // renders the nearest not-found.js and returns a real 404 status
  return <article>{post.title}</article>;
}
\`\`\`

### Classic interview gotcha

Calling \`notFound()\` doesn't just render fallback UI in place — it actually stops rendering the rest of that page entirely and returns an HTTP 404 status code, the same as a URL that genuinely doesn't exist. A common mistake is expecting \`notFound()\` to behave like returning early with some UI, when it more closely behaves like throwing, unwinding up to the nearest \`not-found.js\`.

**Related:** [How do you handle 404 and 500 errors in Next.js?](/interview-prep/ff-nextjs/handling-404-and-500-errors-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/not-found`,
    difficulty: "easy",
    companies: ["Vercel", "Shopify"],
    orderIndex: 15,
  },
  {
    collection: "ff-nextjs",
    slug: "templatejs-file-explained",
    question: "What is the template.js file?",
    answer: `A \`template.js\` file looks almost identical to \`layout.js\` — it wraps a segment's content — but with one key difference: **it doesn't persist across navigation**. Each time a route using a \`template.js\` is visited, React creates a brand-new instance of it (and everything below it in that segment), resetting any Client Component state, re-running effects, and losing DOM state that a \`layout.js\` would have preserved.

### Diagram

The full nesting order within one route segment: \`layout.js\` (outermost, persists) wraps \`template.js\` (remounts every navigation), which wraps \`error.js\`'s Error Boundary, which wraps \`loading.js\`'s Suspense boundary, which wraps \`page.js\`/\`not-found.js\` at the center.

\`\`\`jsx
// app/dashboard/template.tsx
export default function Template({ children }) {
  useEffect(() => {
    triggerEnterAnimation(); // re-runs on every navigation into this segment — a layout wouldn't do this
  }, []);
  return <div>{children}</div>;
}
\`\`\`

### Classic interview gotcha

Reaching for a \`template.js\` "just in case" instead of a \`layout.js\` throws away layout persistence for the entire segment, including state you probably wanted to keep (scroll position, an open dropdown). \`template.js\` earns its place specifically for the rare case where you *want* a fresh instance on every navigation — a per-visit enter animation, or deliberately resetting state tied to "did the user just navigate here" — not as a default alternative to \`layout.js\`.

**Related:** [What is the layout.js file in App Router?](/interview-prep/ff-nextjs/layoutjs-file-in-app-router) · [What is error.js in Next.js?](/interview-prep/ff-nextjs/errorjs-in-nextjs) · [What is loading.js and how does it enable streaming?](/interview-prep/ff-nextjs/loadingjs-and-streaming)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/template (component hierarchy: layout wraps template; template wraps error; error wraps loading; loading wraps not-found/page)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 16,
  },
  {
    collection: "ff-nextjs",
    slug: "how-nextjs-handles-metadata-seo",
    question: "How does Next.js handle metadata (SEO)?",
    answer: `Instead of manually rendering a \`<head>\` with meta tags, a \`layout.js\` or \`page.js\` exports either a static \`metadata\` object or an async \`generateMetadata()\` function — for metadata that depends on route params or fetched data — and Next.js handles deduplication, inheritance between nested layouts, and streaming the resolved metadata into the document head automatically.

\`\`\`jsx
// Static
export const metadata = { title: "My Blog" };

// Dynamic — params is a Promise as of Next.js 15+
export async function generateMetadata({ params }) {
  const post = await getPost((await params).slug);
  return { title: post.title, description: post.excerpt };
}
\`\`\`

### Classic interview gotcha

\`generateMetadata\` and the page component frequently need the *same* fetched data — a blog post's title, for both its \`<title>\` tag and its content. Calling \`fetch()\` separately in each would seem to double the request, but Next.js automatically **deduplicates identical \`fetch()\` calls** made during the same render pass, so calling the same \`fetch(url)\` in both \`generateMetadata\` and the page component only actually hits the network once. Not knowing this leads people to manually pass data between the two via awkward, unnecessary workarounds.

**Related:** [What are Server Components in Next.js App Router?](/interview-prep/ff-nextjs/server-components-in-nextjs-app-router)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/generate-metadata (params as a Promise since Next.js 15)`,
    difficulty: "medium",
    companies: ["Vercel", "Google"],
    orderIndex: 17,
  },
  {
    collection: "ff-nextjs",
    slug: "next-image-component-and-benefits",
    question: "What is the next/image component and its benefits?",
    answer: `\`next/image\` automatically optimizes images: serving modern formats (WebP/AVIF) when the browser supports them, resizing to the exact dimensions actually rendered, lazy-loading by default (except images marked \`priority\`), and preventing layout shift by requiring \`width\`/\`height\` (or \`fill\`) up front so the browser reserves the correct space before the image loads.

\`\`\`jsx
import Image from "next/image";

<Image src="/hero.jpg" width={800} height={400} alt="Hero" priority />
\`\`\`

### Classic interview gotcha

\`next/image\` requires explicit \`width\`/\`height\` (or the \`fill\` prop with a sized parent) specifically to prevent Cumulative Layout Shift — omitting them, or reaching for a plain \`<img>\` instead, is a common, measurable Core Web Vitals regression, since the browser has nowhere to reserve space for the image before it loads, causing surrounding content to visibly jump once it does.

**Related:** [How does Next.js optimize images automatically?](/interview-prep/ff-nextjs/how-nextjs-optimizes-images-automatically) · [What is the Vercel Image Optimization API?](/interview-prep/ff-nextjs/vercel-image-optimization-api)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 18,
  },
  {
    collection: "ff-nextjs",
    slug: "next-link-component",
    question: "What is the next/link component?",
    answer: `\`<Link>\` is Next.js's client-side navigation component — it renders a real, crawlable \`<a>\` tag (good for SEO and "open in new tab"), but intercepts the click to navigate without a full page reload, and automatically prefetches the linked page's code (and, in some cases, data) when the link scrolls into view, so the navigation feels instant by the time the user actually clicks.

\`\`\`jsx
import Link from "next/link";

<Link href="/about">About</Link>
\`\`\`

### Classic interview gotcha

\`<Link>\`'s automatic prefetching means every visible link on a page can trigger a network request even if the user never clicks it — usually a worthwhile tradeoff for perceived speed, but a real, measurable cost on a page with dozens of links, or for users on limited or metered connections. The \`prefetch={false}\` prop exists specifically to opt individual links out of this behavior when it isn't worth the cost.

**Related:** [What is the Link prefetching behavior?](/interview-prep/ff-nextjs/link-prefetching-behavior)`,
    difficulty: "easy",
    companies: ["Vercel", "Netflix"],
    orderIndex: 19,
  },
  {
    collection: "ff-nextjs",
    slug: "next-font-system",
    question: "What is the next/font system?",
    answer: `\`next/font\` self-hosts font files at build time. For \`next/font/google\`, it downloads the font CSS and files during the build and serves them from your own domain, so the browser never makes a request to Google's servers at all; for \`next/font/local\`, it optimizes a font file you already have. Either way, it automatically generates a fallback font with matched metrics to minimize layout shift while the real font loads.

\`\`\`jsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return <html className={inter.className}>{children}</html>;
}
\`\`\`

### Classic interview gotcha

Self-hosting via \`next/font\` isn't just a performance nicety — a browser making a direct request to Google Fonts' CDN on every page load is itself a privacy surface (Google's servers see every visitor's IP address and User-Agent), which is a real, cited reason some regions and privacy-conscious teams require self-hosted fonts specifically. \`next/font\` gets this by default with zero extra configuration, not just faster load times.

**Sources checked:** nextjs.org/docs/app/getting-started/fonts`,
    difficulty: "medium",
    companies: ["Vercel", "Adobe"],
    orderIndex: 20,
  },
  {
    collection: "ff-nextjs",
    slug: "next-script-component",
    question: "What is the next/script component?",
    answer: `\`<Script>\` loads third-party scripts (analytics, ads, chat widgets) with an explicit \`strategy\` controlling *when* they load relative to page interactivity: \`beforeInteractive\` (before any page JS runs, for genuinely critical scripts), \`afterInteractive\` (the default, soon after the page becomes interactive), or \`lazyOnload\` (during idle time, for genuinely low-priority scripts) — instead of a plain \`<script>\` tag, which always blocks the same way regardless of how important the script actually is.

\`\`\`jsx
import Script from "next/script";

<Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />
\`\`\`

### Classic interview gotcha

Reaching for \`beforeInteractive\` by default "to be safe" is a common real performance mistake — it's meant for scripts a page genuinely cannot function correctly without before any interactivity, like a consent-management or cookie-banner script. Using it for something like an analytics tag delays the page becoming interactive for no real benefit; \`afterInteractive\` (the default) or \`lazyOnload\` is the right choice for the vast majority of third-party scripts.`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 21,
  },
  {
    collection: "ff-nextjs",
    slug: "how-nextjs-handles-environment-variables",
    question: "How does Next.js handle environment variables?",
    answer: `Next.js loads \`.env\` files automatically (\`.env.local\` overrides \`.env.development\`/\`.env.production\`, which override \`.env\`) and exposes their values through \`process.env\` — but only variables prefixed \`NEXT_PUBLIC_\` are inlined into the browser bundle at build time. Everything else stays server-only, never shipped to the client.

\`\`\`
# .env.local
DATABASE_URL=postgres://...          # server-only — never reaches the browser
NEXT_PUBLIC_ANALYTICS_ID=UA-12345    # inlined into client JS at build time
\`\`\`

\`\`\`jsx
// Server Component — both are readable
console.log(process.env.DATABASE_URL);        // works
console.log(process.env.NEXT_PUBLIC_ANALYTICS_ID); // works

// Client Component — only the NEXT_PUBLIC_ one is defined
"use client";
console.log(process.env.DATABASE_URL);        // undefined — stripped at build time
\`\`\`

### Classic interview gotcha

The \`NEXT_PUBLIC_\` prefix isn't a runtime check — it's a **build-time string replacement**. Next.js literally substitutes \`process.env.NEXT_PUBLIC_ANALYTICS_ID\` with its actual value directly into the compiled bundle wherever that exact expression appears, which is why dynamically constructing the key (\`process.env[\`NEXT_PUBLIC_\${name}\`]\`) silently fails in client code — there's no runtime lookup happening, so anything other than the literal, statically-analyzable expression can't be inlined.

**Sources checked:** nextjs.org/docs/app/guides/environment-variables`,
    difficulty: "medium",
    companies: ["Vercel", "Stripe"],
    orderIndex: 22,
  },
  {
    collection: "ff-nextjs",
    slug: "public-directory-in-nextjs",
    question: "What is the public directory in Next.js?",
    answer: `Anything placed in \`public/\` is served as-is from the site root, with no processing or optimization — \`public/favicon.ico\` becomes \`/favicon.ico\`. It's for static assets that need a stable, predictable URL: favicons, \`robots.txt\`, a manifest file, or images you intentionally don't want run through \`next/image\`'s optimization pipeline.

\`\`\`
public/
├── favicon.ico       → /favicon.ico
├── robots.txt        → /robots.txt
└── images/logo.png   → /images/logo.png
\`\`\`

### Classic interview gotcha

Files in \`public/\` are **never optimized or resized** — using a plain \`<img src="/images/logo.png">\` (or even \`next/image\` pointed at a public-directory file) skips none of the format/size benefits automatically for anything referenced this way beyond what \`next/image\` does on its own; the directory itself adds no optimization. For images that should get automatic format conversion and responsive sizing, route them through \`next/image\`'s \`src\` regardless of whether the file lives in \`public/\` or is fetched remotely — the directory is just a static file server, not an asset pipeline.

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/public-folder`,
    difficulty: "easy",
    companies: ["Vercel", "Shopify"],
    orderIndex: 23,
  },
  {
    collection: "ff-nextjs",
    slug: "what-is-nextconfigjs",
    question: "What is the next.config.js file?",
    answer: `\`next.config.js\` (or \`.ts\`) is Next.js's project-wide configuration file — redirects, rewrites, response headers, image domains, experimental flags like \`cacheComponents\`, custom Webpack/Turbopack tweaks, and build output mode (\`standalone\`, \`export\`) are all set here, read once at build/start time.

\`\`\`ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: { remotePatterns: [{ hostname: "cdn.example.com" }] },
  async redirects() {
    return [{ source: "/old", destination: "/new", permanent: true }];
  },
};

export default nextConfig;
\`\`\`

### Classic interview gotcha

Because it's read once at build/start time — not per-request — anything in \`next.config.js\` that depends on \`process.env\` reads whatever value was present at **build** time, not at runtime. This is a common source of "why did my config value not change after I updated the environment variable in production" confusion: the fix is either rebuilding after the env var changes, or moving that specific decision into request-time code (middleware/proxy, a Server Component) instead of the config file.

**Sources checked:** nextjs.org/docs/app/api-reference/config/next-config-js`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 24,
  },
  {
    collection: "ff-nextjs",
    slug: "creating-api-routes-in-nextjs",
    question: "How do you create API routes in Next.js?",
    answer: `In the **Pages Router**, any file under \`pages/api/\` is treated as a backend endpoint instead of a page, exporting a default handler that receives Express-style \`req\`/\`res\` objects. In the **App Router** (the current default), the equivalent is a Route Handler — a \`route.ts\` file exporting named functions per HTTP method, built on the standard Web \`Request\`/\`Response\` objects instead.

\`\`\`js
// Pages Router — pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: "Hello" });
}
\`\`\`

\`\`\`ts
// App Router — app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "Hello" });
}
\`\`\`

### Classic interview gotcha

These two aren't meant to be combined for the same route — \`pages/api/hello.js\` and \`app/api/hello/route.ts\` would conflict if both existed for the same path, and more importantly, **App Router projects should reach for Route Handlers, not \`pages/api\`**, since a project can only have one or the other directory active for the same URL, and \`pages/api\` is the legacy shape being kept only for Pages Router codebases.

**Related:** [What are Route Handlers in App Router (route.ts)?](/interview-prep/ff-nextjs/route-handlers-in-app-router)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 25,
  },
  {
    collection: "ff-nextjs",
    slug: "route-handlers-in-app-router",
    question: "What are Route Handlers in App Router (route.ts)?",
    answer: `A \`route.ts\` file, placed anywhere inside \`app/\`, defines an API endpoint by exporting one async function per HTTP method it supports (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`, \`HEAD\`, \`OPTIONS\`) — built entirely on standard Web \`Request\`/\`Response\` objects, the App Router's replacement for the Pages Router's \`pages/api/\`.

\`\`\`ts
// app/api/posts/[id]/route.ts
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.posts.findById(id);
  return Response.json(post);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.posts.delete(id);
  return new Response(null, { status: 204 });
}
\`\`\`

### Classic interview gotcha

A \`route.ts\` file cannot coexist with a \`page.tsx\` in the **same** route segment — a folder is either a page or an API endpoint at that exact path, not both, since both would try to handle the same URL. This is a common structural mistake for anyone expecting to colocate a page and its "backend" at the identical path the way some other frameworks allow.

**Related:** [How do you create API routes in Next.js?](/interview-prep/ff-nextjs/creating-api-routes-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Meta"],
    orderIndex: 26,
  },
  {
    collection: "ff-nextjs",
    slug: "middleware-in-nextjs",
    question: "What is middleware in Next.js?",
    answer: `Middleware is code that runs for every matched request **before** it reaches a route, cache, or page — used for routing decisions: rewriting a path, redirecting, or modifying response headers based on the incoming request (cookies, geolocation, auth tokens). **As of Next.js 16, this file convention was renamed: \`middleware.ts\` is deprecated in favor of \`proxy.ts\`, which runs on the Node.js runtime by default instead of the Edge Runtime** — a genuinely important, easy-to-miss update for this exact interview question.

### Diagram

Every request passes through \`proxy.ts\` first; it branches into a rewrite, a redirect, or continuing on to the originally matched route.

\`\`\`ts
// proxy.ts (Next.js 16+) — was middleware.ts, exported function was "middleware"
import { NextResponse } from "next/server";

export function proxy(request: Request) {
  const country = request.headers.get("x-vercel-ip-country");
  if (country === "GB") {
    return NextResponse.rewrite(new URL("/uk", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/((?!_next|api).*)" };
\`\`\`

### Classic interview gotcha

Despite the rename hint, \`proxy.ts\` is explicitly **not** meant for authentication logic — Vercel's own guidance is that it's for routing concerns (rewrites, redirects, headers) only, since checking a session there and letting a request through based on that check has repeatedly proven to be an easy place to introduce an auth bypass bug if the check is subtly wrong or skipped for an unmatched path. Real authorization checks belong in the route/page/Server Action itself, not solely in this layer.

**Related:** [How does Next.js handle authentication?](/interview-prep/ff-nextjs/how-nextjs-handles-authentication)

**Sources checked:** nextjs.org/blog/next-16 (middleware.ts → proxy.ts rename), nextjs.org/docs/messages/middleware-to-proxy, nextjs.org/docs/app/api-reference/file-conventions/proxy`,
    difficulty: "hard",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 27,
  },
  {
    collection: "ff-nextjs",
    slug: "how-nextjs-handles-authentication",
    question: "How does Next.js handle authentication?",
    answer: `Next.js has no built-in auth system — it provides the primitives (cookies, Server Actions, Route Handlers, \`proxy.ts\`/middleware for route protection) and leaves the actual implementation to a library. The two most common choices in 2026 are **Auth.js** (the framework-agnostic project formerly known as NextAuth.js, still installed as the \`next-auth\` package for Next.js specifically) and dedicated libraries like Better Auth, chosen for a more explicit, database-first session model.

\`\`\`ts
// Reading the session in a Server Component — works with either library
import { auth } from "@/lib/auth"; // however the chosen library exposes it

async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <p>Welcome, {session.user.name}</p>;
}
\`\`\`

### Classic interview gotcha

Route protection is commonly (and incompletely) implemented only in \`proxy.ts\`/middleware — checking a cookie there and redirecting unauthenticated requests. The gotcha is that this single layer is not sufficient defense in depth: Server Actions and Route Handlers callable directly (not just through a protected page) need their **own** session check inside the function itself, since a Server Action can be invoked without ever going through the page that would normally gate access to it.

**Related:** [What is NextAuth.js?](/interview-prep/ff-nextjs/what-is-nextauthjs) · [What is middleware in Next.js?](/interview-prep/ff-nextjs/middleware-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Auth0"],
    orderIndex: 28,
  },
  {
    collection: "ff-nextjs",
    slug: "what-is-nextauthjs",
    question: "What is NextAuth.js?",
    answer: `NextAuth.js is an authentication library for Next.js supporting OAuth providers (Google, GitHub, etc.), email/passwordless sign-in, and credentials-based login, with built-in session handling. **As of 2026, it's important to state this precisely: the project rebranded to Auth.js**, restructured as a framework-agnostic core (\`@auth/core\`) supporting SvelteKit and Express in addition to Next.js — while the Next.js-specific package remains published under its original name, \`next-auth\`, now running Auth.js v5 (stable since late 2024) under the hood.

\`\`\`ts
// auth.ts — Auth.js v5 / "next-auth" package
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
});

// app/api/auth/[...nextauth]/route.ts
export const { GET, POST } = handlers;
\`\`\`

### Classic interview gotcha

Answering "NextAuth.js" as if it's still the project's only name, with no mention of the Auth.js rebrand, is a stale answer in 2026 — the accurate framing is: **Auth.js** is the umbrella, framework-agnostic project; \`next-auth\` is the Next.js-specific package built on it, currently on major version 5. Both names are correct depending on what you're referring to (the project vs. the npm package), and conflating them or citing only the old name misses a real, citable update.

**Related:** [How does Next.js handle authentication?](/interview-prep/ff-nextjs/how-nextjs-handles-authentication)

**Sources checked:** authjs.dev, npmjs.com/package/next-auth (Auth.js v5, package name unchanged)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 29,
  },
  {
    collection: "ff-nextjs",
    slug: "static-vs-dynamic-rendering-in-nextjs",
    question: "What is the difference between static and dynamic rendering in Next.js?",
    answer: `Static rendering generates HTML once (at build time, or once and cached) and serves the identical result to every visitor until it's revalidated. Dynamic rendering generates HTML fresh **on every request** — required whenever a route reads something request-specific (\`cookies()\`, \`headers()\`, \`searchParams\`, an uncached \`fetch\`), since that data literally can't be known ahead of time.

| | Static | Dynamic |
|---|---|---|
| When HTML is generated | Build time (or cached after first request) | Every request |
| Can use \`cookies()\`/\`headers()\` | No — opts the route into dynamic | Yes |
| Speed | Fastest — served from cache/CDN | Slower — full render per request |
| Freshness | Only as fresh as its last revalidation | Always current |

### Classic interview gotcha

A route doesn't need an explicit flag to become dynamic — using **any** request-specific API anywhere in that route's render tree automatically opts the *entire* route into dynamic rendering, even if only one small component needs it. This is precisely the problem Partial Prerendering solves: without it, one \`cookies()\` call deep in a single component drags the whole page — including genuinely static content — into per-request rendering.

**Related:** [What is Partial Prerendering (PPR)?](/interview-prep/ff-nextjs/partial-prerendering-ppr) · [What is Incremental Static Regeneration (ISR)?](/interview-prep/ff-nextjs/incremental-static-regeneration)

**Sources checked:** nextjs.org/docs/app/getting-started/partial-prerendering, nextjs.org/learn/dashboard-app/static-and-dynamic-rendering`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 30,
  },
  {
    collection: "ff-nextjs",
    slug: "partial-prerendering-ppr",
    question: "What is Partial Prerendering (PPR)?",
    answer: `Partial Prerendering lets a single route combine static and dynamic rendering instead of forcing an all-or-nothing choice: Next.js generates one static shell at build time (with a "hole" left where dynamic content will go), serves that shell instantly on every request, then renders and streams the dynamic hole in per-request. **PPR shipped as stable in Next.js 16 (October 2025), as part of Cache Components** — the old \`experimental.ppr\` flag and \`experimental_ppr\` route config were removed; enabling \`cacheComponents: true\` in \`next.config\` now implements PPR as the default rendering behavior.

### Diagram

The static shell (nav, layout, product info) is prebuilt once; the dynamic hole (a per-user cart total) is rendered fresh and streamed into that hole on every request, in the same response as the shell.

\`\`\`ts
// next.config.ts
const nextConfig = { cacheComponents: true }; // enables PPR as the default model
\`\`\`

\`\`\`jsx
async function ProductPage() {
  return (
    <>
      <ProductInfo />              {/* static — same for every visitor */}
      <Suspense fallback={<CartSkeleton />}>
        <CartTotal />               {/* dynamic — reads cookies(), rendered per request */}
      </Suspense>
    </>
  );
}
\`\`\`

### Classic interview gotcha

PPR isn't "SSR with caching bolted on" — the key distinction is that the static and dynamic parts are served in a **single HTTP response**, not two round trips. The static shell and the dynamic hole's eventual content both arrive as part of the same streamed response; nothing about it resembles a client making a second request after the page loads, which is a common (incorrect) assumption about how the "hole" gets filled.

**Related:** [What is the difference between static and dynamic rendering in Next.js?](/interview-prep/ff-nextjs/static-vs-dynamic-rendering-in-nextjs) · [What is Streaming in Next.js and how does Suspense enable it?](/interview-prep/ff-nextjs/streaming-in-nextjs-and-suspense)

**Sources checked:** nextjs.org/blog/next-16, nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents (PPR stable via Cache Components, experimental flags removed)`,
    difficulty: "hard",
    companies: ["Vercel", "Shopify"],
    orderIndex: 31,
  },
  {
    collection: "ff-nextjs",
    slug: "streaming-in-nextjs-and-suspense",
    question: "What is Streaming in Next.js and how does Suspense enable it?",
    answer: `Streaming sends a page's HTML to the browser in pieces as each piece becomes ready, instead of waiting for the entire page's data to resolve before sending anything. In the App Router, wrapping a slow component in \`<Suspense>\` marks that specific boundary as streamable: everything outside it renders and is sent immediately, and the Suspense fallback is swapped for the real content the moment that component's data resolves — the same mechanism \`loading.js\` uses automatically for a whole segment.

\`\`\`jsx
async function Dashboard() {
  return (
    <>
      <Header />                     {/* sent immediately */}
      <Suspense fallback={<Spinner />}>
        <SlowRevenueChart />          {/* streamed in once its data resolves */}
      </Suspense>
    </>
  );
}
\`\`\`

### Classic interview gotcha

\`loading.js\` and a manual \`<Suspense>\` boundary are the **same underlying mechanism**, just at different granularity — \`loading.js\` automatically wraps an entire route segment, while a hand-placed \`<Suspense>\` lets you stream just one slow component within an otherwise-fast page. Reaching for \`loading.js\` when only one small piece of a page is actually slow needlessly shows a full-page loading state for content that was already available; a targeted \`<Suspense>\` boundary around just the slow piece is the more precise tool.

**Related:** [What is loading.js and how does it enable streaming?](/interview-prep/ff-nextjs/loadingjs-and-streaming) · [What is Suspense in React?](/interview-prep/ff-react/what-is-suspense-in-react) (React collection)`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 32,
  },
  {
    collection: "ff-nextjs",
    slug: "fetch-caching-behavior-in-nextjs",
    question: "What is the fetch() caching behavior in Next.js App Router?",
    answer: `Next.js patches the global \`fetch()\` inside Server Components to add caching options as a second argument. **This behavior has changed across recent major versions — a genuinely version-sensitive fact worth stating precisely rather than from memory:** in the classic model, \`fetch()\` defaulted to \`cache: 'force-cache'\` (cache indefinitely); Next.js 15 changed the default to \`no-store\` (always fresh, request the classic \`getServerSideProps\` behavior); **Next.js 16's Cache Components model keeps that same "dynamic by default" behavior — nothing is cached unless you opt in, now via the \`"use cache"\` directive rather than fetch options.**

\`\`\`ts
// Uncached — the current default, always fresh
fetch("https://api.example.com/data");

// Explicitly time-based revalidation (classic model)
fetch("https://api.example.com/data", { next: { revalidate: 3600 } });

// Cache Components model (Next.js 16+, cacheComponents: true)
async function getData() {
  "use cache";
  const res = await fetch("https://api.example.com/data");
  return res.json();
}
\`\`\`

### Classic interview gotcha

Citing "\`fetch\` caches by default" as a blanket Next.js fact is now outdated for any project on Next.js 15+ — the direction of the default flipped from "cached unless told otherwise" to "fresh unless told otherwise." Getting this backwards is a common, easy-to-catch sign of stale knowledge in an interview, since it's the exact opposite of the current behavior.

**Related:** [What are cache tags and revalidation in Next.js?](/interview-prep/ff-nextjs/cache-tags-and-revalidation-in-nextjs) · [What is unstable_cache in Next.js?](/interview-prep/ff-nextjs/unstable-cache-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/fetch, nextjs.org/docs/app/guides/caching-without-cache-components (fetch defaults to no-store as of Next.js 15+)`,
    difficulty: "hard",
    companies: ["Vercel", "Stripe"],
    orderIndex: 33,
  },
  {
    collection: "ff-nextjs",
    slug: "cache-tags-and-revalidation-in-nextjs",
    question: "What are cache tags and revalidation in Next.js?",
    answer: `A cache tag is a label attached to a cached entry — a \`fetch\` call or a \`"use cache"\`-marked function — that lets you invalidate every entry sharing that tag in one call, instead of needing to know each cached entry's exact path. This is the mechanism behind on-demand revalidation: tag data by what it *is* ("products", "user-42"), not by which page happened to render it.

\`\`\`ts
async function getProduct(id: string) {
  "use cache";
  cacheTag(\`product-\${id}\`);
  return db.products.findById(id);
}

// After a mutation, anywhere:
import { revalidateTag } from "next/cache";
await revalidateTag(\`product-\${id}\`); // invalidates every cache entry tagged with it
\`\`\`

### Classic interview gotcha

Tag-based revalidation is more precise than path-based revalidation (\`revalidatePath\`) specifically because the **same** piece of data is often rendered on multiple, unrelated pages — a product might appear on its own detail page, a category listing, and the homepage's "featured" section. Tagging the data itself and calling \`revalidateTag\` invalidates it everywhere it's used in one call; \`revalidatePath\`-ing each of those pages individually is easy to get incomplete if a new page later starts using the same data and the reval list isn't updated to match.

**Related:** [What is the revalidatePath and revalidateTag function?](/interview-prep/ff-nextjs/revalidatepath-and-revalidatetag-function) · [What is the fetch() caching behavior in Next.js App Router?](/interview-prep/ff-nextjs/fetch-caching-behavior-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Shopify"],
    orderIndex: 34,
  },
  {
    collection: "ff-nextjs",
    slug: "revalidatepath-and-revalidatetag-function",
    question: "What is the revalidatePath and revalidateTag function?",
    answer: `Both force Next.js to treat cached data as stale on the next request, triggering a fresh render — \`revalidatePath(path)\` invalidates everything cached for a specific route path, while \`revalidateTag(tag)\` invalidates every cache entry (potentially across many different routes) that was tagged with that specific tag. Both are most commonly called from inside a Server Action right after a mutation.

\`\`\`ts
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

async function updateProduct(id: string, data: FormData) {
  await db.products.update(id, data);
  revalidatePath(\`/products/\${id}\`);  // just this one route's cache
  revalidateTag(\`product-\${id}\`);     // every route that cached this product's data
}
\`\`\`

### Classic interview gotcha

\`revalidatePath\` and \`revalidateTag\` don't return anything the caller can await meaningfully to confirm "the new data is now visible" — they mark cache entries stale so the **next** request regenerates them; they don't synchronously re-render anything themselves. Calling one and then immediately reading from the same cache in the same function execution won't see updated data — the regeneration happens on the subsequent request, not inline.

**Related:** [What are cache tags and revalidation in Next.js?](/interview-prep/ff-nextjs/cache-tags-and-revalidation-in-nextjs) · [What are Server Actions in Next.js?](/interview-prep/ff-nextjs/server-actions-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 35,
  },
  {
    collection: "ff-nextjs",
    slug: "unstable-cache-in-nextjs",
    question: "What is unstable_cache in Next.js?",
    answer: `\`unstable_cache\` is a function-wrapping API for caching the result of an arbitrary async function (a direct database query, not just a \`fetch\` call) — you pass the function, a cache-key-parts array, and options (\`revalidate\`, \`tags\`). **As of Next.js 16, it's important to state this precisely: \`unstable_cache\` is formally deprecated in favor of the \`"use cache"\` directive**, which achieves the same goal by having the compiler derive the cache key automatically from the function's arguments and closure, rather than requiring a manually-specified key-parts array.

\`\`\`ts
// Legacy — unstable_cache
import { unstable_cache } from "next/cache";
const getProduct = unstable_cache(
  async (id) => db.products.findById(id),
  ["product"],                 // manual cache-key parts
  { revalidate: 3600, tags: ["products"] },
);

// Current — "use cache" (Next.js 16+, cacheComponents: true)
async function getProduct(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return db.products.findById(id);   // cache key derived automatically from args/closure
}
\`\`\`

### Classic interview gotcha

Despite "unstable" in the name for years, teams have shipped it to production at scale for a long time — the name always signaled "API surface not finalized," not "unreliable at runtime." The genuinely new information for 2026 is that it now has a real, stable successor: keep \`unstable_cache\` only in code predating the migration, and default to \`"use cache"\` in new code rather than reaching for the older API out of habit.

**Related:** [What is the fetch() caching behavior in Next.js App Router?](/interview-prep/ff-nextjs/fetch-caching-behavior-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/unstable_cache, nextjs.org/docs/app/api-reference/directives/use-cache (unstable_cache deprecated, use cache is the Next.js 16 successor)`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 36,
  },
  {
    collection: "ff-nextjs",
    slug: "redirects-and-rewrites-in-nextjs",
    question: "How does Next.js handle redirects and rewrites?",
    answer: `A redirect sends the browser a new URL and the address bar changes — visiting \`/old-blog\` navigates to \`/new-blog\`. A rewrite serves a different path's content while the URL the user sees stays exactly the same — visiting \`/old-blog\` shows \`/new-blog\`'s content, but the address bar still says \`/old-blog\`. Both can be configured statically in \`next.config.js\`, or dynamically per-request in \`proxy.ts\`.

\`\`\`ts
// next.config.ts — static, known ahead of time
const nextConfig = {
  async redirects() {
    return [{ source: "/old-blog", destination: "/new-blog", permanent: true }];
  },
  async rewrites() {
    return [{ source: "/old-blog", destination: "/new-blog" }]; // URL unchanged
  },
};
\`\`\`

### Classic interview gotcha

A rewrite is invisible to the browser and to the client-rendered JavaScript, but **not** invisible to \`generateMetadata\`/canonical URLs — a page rewritten from \`/old-blog\` still needs its canonical tag pointed correctly (usually at the visible, unrewritten URL), or search engines can end up indexing confusing duplicate-content signals between the visible path and the path actually serving the content.

**Related:** [What is Next.js and how does it differ from plain React?](/interview-prep/ff-nextjs/what-is-nextjs-and-how-it-differs-from-react)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 37,
  },
  {
    collection: "ff-nextjs",
    slug: "dynamic-routes-in-nextjs",
    question: "What are dynamic routes in Next.js?",
    answer: `Wrapping a folder name in square brackets creates a dynamic segment that matches any value at that position in the URL — \`app/blog/[slug]/page.tsx\` matches \`/blog/anything\`, with \`anything\` available to the page as \`params.slug\`.

\`\`\`jsx
// app/blog/[slug]/page.tsx
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;   // params is a Promise as of Next.js 15+
  const post = await getPost(slug);
  return <article>{post.title}</article>;
}
\`\`\`

### Classic interview gotcha

Since Next.js 15, \`params\` (and \`searchParams\`) is a **Promise**, not a plain object — a common, immediate build error for anyone writing code from slightly older tutorials is destructuring \`{ params: { slug } }\` directly in the function signature without awaiting it first. The fix is always \`await params\` (or \`use(params)\` in a Client Component) before reading its properties.

**Related:** [What are catch-all routes ([...slug])?](/interview-prep/ff-nextjs/catch-all-routes-in-nextjs) · [What are optional catch-all routes ([[...slug]])?](/interview-prep/ff-nextjs/optional-catch-all-routes-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes (params as a Promise since Next.js 15)`,
    difficulty: "medium",
    companies: ["Vercel", "Meta"],
    orderIndex: 38,
  },
  {
    collection: "ff-nextjs",
    slug: "catch-all-routes-in-nextjs",
    question: "What are catch-all routes ([...slug])?",
    answer: `A folder named \`[...slug]\` matches **any number** of path segments from that point on, capturing them as an array — \`app/shop/[...slug]/page.tsx\` matches \`/shop/clothes\`, \`/shop/clothes/tops\`, and \`/shop/clothes/tops/t-shirts\`, with \`slug\` received as \`["clothes"]\`, \`["clothes", "tops"]\`, etc.

\`\`\`jsx
// app/shop/[...slug]/page.tsx
export default async function Shop({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;   // e.g. ["clothes", "tops"]
  return <p>Category path: {slug.join(" / ")}</p>;
}
\`\`\`

### Classic interview gotcha

A plain catch-all (\`[...slug]\`) does **not** match the base path with zero segments — \`/shop\` itself returns a 404 unless an optional catch-all (\`[[...slug]]\`) is used instead, or a separate \`app/shop/page.tsx\` exists to handle that exact case. Forgetting this is a common bug where a category-browsing UI works for every nested path but breaks specifically on the top-level "all categories" URL.

**Related:** [What are dynamic routes in Next.js?](/interview-prep/ff-nextjs/dynamic-routes-in-nextjs) · [What are optional catch-all routes ([[...slug]])?](/interview-prep/ff-nextjs/optional-catch-all-routes-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 39,
  },
  {
    collection: "ff-nextjs",
    slug: "optional-catch-all-routes-in-nextjs",
    question: "What are optional catch-all routes ([[...slug]])?",
    answer: `Wrapping a catch-all segment in a *second* pair of brackets (\`[[...slug]]\`) makes the entire segment optional — it matches everything a regular catch-all does, **plus** the base path with zero segments. \`app/shop/[[...slug]]/page.tsx\` matches \`/shop\`, \`/shop/clothes\`, and \`/shop/clothes/tops\` all with the same single file.

\`\`\`jsx
// app/shop/[[...slug]]/page.tsx
export default async function Shop({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;   // undefined at /shop, ["clothes"] at /shop/clothes
  if (!slug) return <p>All categories</p>;
  return <p>Category path: {slug.join(" / ")}</p>;
}
\`\`\`

### Classic interview gotcha

Because the base path is now genuinely matched, \`params.slug\` can be **\`undefined\`**, not just a short array — code that assumes \`slug\` is always at least an array of length one (calling \`.join()\` or \`.map()\` on it unconditionally) throws at the exact base path this segment type exists to support. The type signature itself (\`string[] | undefined\`) is the interview-relevant detail: it's not just a convenience feature, it changes what the params type actually is.

**Related:** [What are catch-all routes ([...slug])?](/interview-prep/ff-nextjs/catch-all-routes-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Adobe"],
    orderIndex: 40,
  },
  {
    collection: "ff-nextjs",
    slug: "parallel-routes-in-nextjs",
    question: "What are parallel routes in Next.js?",
    answer: `Parallel routes let a layout render **multiple independent pages simultaneously** within the same view, each defined by its own named "slot" folder using the \`@folder\` convention — a layout receives each slot as a prop (matching the folder name) alongside the regular \`children\` prop, and every slot streams, loads, and errors independently.

### Diagram

\`app/dashboard/layout.tsx\` receives \`@team\` and \`@analytics\` as separate props and renders both at once — each is its own subtree with its own \`loading.js\`/\`error.js\`.

\`\`\`jsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children, team, analytics,
}: { children: React.ReactNode; team: React.ReactNode; analytics: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="grid grid-cols-2">
        {team}       {/* app/dashboard/@team/page.tsx */}
        {analytics}  {/* app/dashboard/@analytics/page.tsx */}
      </div>
    </>
  );
}
\`\`\`

### Classic interview gotcha

A slot without its own \`default.js\` will 404 on any URL it can't match during client-side navigation, even if the rest of the layout is perfectly fine — since Next.js can't always determine what a slot should render for an arbitrary sub-navigation it wasn't explicitly given content for. Defining \`@analytics/default.js\` as a fallback (often just rendering \`null\` or the slot's own top-level page) is the fix, and forgetting it is a very common source of "why does part of my dashboard disappear on navigation" bugs.

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/parallel-routes`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 41,
  },
  {
    collection: "ff-nextjs",
    slug: "intercepting-routes-in-nextjs",
    question: "What are intercepting routes?",
    answer: `An intercepting route lets a link clicked **from within the app** render a different UI than a direct visit to that same URL would — most commonly used to show a photo as a modal when clicked from a feed, while a direct visit or page refresh on that identical URL still renders the full, standalone page. The convention uses relative segment markers: \`(.)\` intercepts a route in the same segment level, \`(..)\` one level above, \`(..)(..)\` two levels above, and \`(...)\` from the root.

### Diagram

Clicking a photo from the feed intercepts the navigation and shows a modal over the still-visible feed; visiting or refreshing that exact same URL directly skips the interception, since there's no prior route to intercept from.

\`\`\`
app/
├── feed/
│   ├── page.tsx                      # the feed
│   └── @modal/
│       └── (.)photo/[id]/page.tsx    # intercepts /photo/[id] when clicked from /feed
└── photo/[id]/page.tsx               # the real, standalone page
\`\`\`

### Classic interview gotcha

Intercepting routes are near-useless on their own for the modal use case — they're almost always paired with **parallel routes** (an \`@modal\` slot), since the intercepted route needs somewhere to render *alongside* the page it's intercepting from, not in place of it. Mentioning intercepting routes without their usual parallel-routes partner is a common, incomplete answer to "how do you build a shareable modal in Next.js."

**Related:** [What are parallel routes in Next.js?](/interview-prep/ff-nextjs/parallel-routes-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes`,
    difficulty: "hard",
    companies: ["Vercel", "Instagram"],
    orderIndex: 42,
  },
  {
    collection: "ff-nextjs",
    slug: "atfolder-convention-in-app-router",
    question: "What is the @folder convention in App Router?",
    answer: `A folder name prefixed with \`@\` (e.g. \`@team\`, \`@modal\`) defines a **parallel route slot** — it's excluded from the URL path entirely and instead becomes a named prop passed to the nearest \`layout.tsx\`, letting that layout render the slot's content alongside its regular \`children\`.

\`\`\`
app/dashboard/
├── layout.tsx        # receives { children, team } as props
├── page.tsx           # → children
└── @team/
    └── page.tsx        # → team
\`\`\`

### Classic interview gotcha

\`@folder\` (parallel route slots) is easy to confuse with \`(folder)\` (route groups) — both exclude the folder name from the URL, but for entirely different reasons. A route group, \`(marketing)\`, exists purely to **organize files** without affecting the URL at all — it doesn't create a prop or render anything extra. An \`@folder\` slot genuinely changes what the layout receives and renders — it's not just an organizational convenience, it's an actual second (or third) subtree being rendered in parallel. Naming the wrong one when asked to explain either is a common mix-up.

**Related:** [What are parallel routes in Next.js?](/interview-prep/ff-nextjs/parallel-routes-in-nextjs) · [What are intercepting routes?](/interview-prep/ff-nextjs/intercepting-routes-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 43,
  },
  {
    collection: "ff-nextjs",
    slug: "internationalization-i18n-in-nextjs",
    question: "How do you implement internationalization (i18n) in Next.js?",
    answer: `The App Router has no built-in i18n routing system — Next.js's own docs point teams toward a dynamic \`[locale]\` segment (\`app/[locale]/page.tsx\`) combined with a library that handles translations, locale detection, and formatting. **As of 2026, \`next-intl\` is the de facto standard choice** for App Router projects — it has native Server Component support, a small (~2KB) bundle, and works via middleware/proxy for locale detection and routing.

\`\`\`
app/
└── [locale]/
    ├── layout.tsx
    └── page.tsx
\`\`\`

\`\`\`tsx
// A Server Component reading translations via next-intl
import { getTranslations } from "next-intl/server";

async function HomePage() {
  const t = await getTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}
\`\`\`

### Classic interview gotcha

Locale detection commonly happens in \`proxy.ts\` (the Next.js 16 rename of \`middleware.ts\`) — redirecting \`/\` to \`/en\` or \`/fr\` based on the \`Accept-Language\` header or a cookie. A common real bug is applying this redirect to **every** path, including static assets and API routes, which breaks things like \`/api/webhook\` or \`/favicon.ico\` by prefixing them with a locale segment that was never intended to apply there — the middleware's \`matcher\` needs to explicitly exclude those paths.

**Related:** [What is middleware in Next.js?](/interview-prep/ff-nextjs/middleware-in-nextjs) · [What are dynamic routes in Next.js?](/interview-prep/ff-nextjs/dynamic-routes-in-nextjs)

**Sources checked:** nextjs.org/docs/app/guides/internationalization, next-intl.dev/docs/getting-started/app-router`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 44,
  },
  {
    collection: "ff-nextjs",
    slug: "next-navigation-vs-next-router",
    question: "What is next/navigation vs next/router?",
    answer: `\`next/router\` is the **Pages Router**'s navigation module — its \`useRouter()\` returns a single object bundling the pathname, query params, and navigation methods together. \`next/navigation\` is the **App Router**'s equivalent — its \`useRouter()\` only returns navigation methods (\`push\`, \`replace\`, \`refresh\`, \`back\`), with the pathname and search params split into their own separate hooks (\`usePathname\`, \`useSearchParams\`).

| | \`next/router\` (Pages Router) | \`next/navigation\` (App Router) |
|---|---|---|
| \`useRouter()\` returns | \`{ pathname, query, push, replace, ... }\` | \`{ push, replace, back, refresh, ... }\` only |
| Getting the current path | \`router.pathname\` | \`usePathname()\` |
| Getting query/search params | \`router.query\` | \`useSearchParams()\` |
| Dynamic route params | part of \`router.query\` | \`useParams()\` |

### Classic interview gotcha

Importing \`useRouter\` from the wrong module in an App Router project is a common, confusing mistake — \`next/router\`'s \`useRouter\` throws a runtime error ("NextRouter was not mounted") when called inside the App Router, since that entire module assumes the Pages Router context exists. The fix is always importing from \`next/navigation\` in any App Router component, never \`next/router\`.

**Related:** [What are the useRouter, usePathname, and useSearchParams hooks?](/interview-prep/ff-nextjs/userouter-usepathname-usesearchparams-hooks)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/use-router`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 45,
  },
  {
    collection: "ff-nextjs",
    slug: "userouter-usepathname-usesearchparams-hooks",
    question: "What are the useRouter, usePathname, and useSearchParams hooks?",
    answer: `These three, all from \`next/navigation\`, split what the Pages Router bundled into one \`router\` object: \`useRouter()\` gives imperative navigation methods (\`push\`, \`replace\`, \`back\`, \`refresh\`); \`usePathname()\` returns the current URL's path as a plain string; \`useSearchParams()\` returns the query string as a read-only \`URLSearchParams\` object.

\`\`\`tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function SortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(\`\${pathname}?\${params.toString()}\`);
  }
  return <select onChange={(e) => setSort(e.target.value)}>...</select>;
}
\`\`\`

### Classic interview gotcha

All three are **Client Component-only hooks** — they can't be called in a Server Component. A common mistake is reaching for \`useSearchParams()\` in a Server Component when the \`searchParams\` prop passed directly to \`page.tsx\` already provides the exact same data server-side, with no \`"use client"\` boundary required at all. Reaching for the hook version by habit, even when a Server Component would do, unnecessarily pulls that component into the client bundle.

**Related:** [What is next/navigation vs next/router?](/interview-prep/ff-nextjs/next-navigation-vs-next-router) · [How do you implement search params in App Router?](/interview-prep/ff-nextjs/implementing-search-params-in-app-router)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 46,
  },
  {
    collection: "ff-nextjs",
    slug: "persisting-state-across-navigation-in-nextjs",
    question: "How do you persist state across navigation in Next.js?",
    answer: `State placed in a shared \`layout.tsx\` naturally persists across navigations between that layout's own child routes, since layouts don't remount on sibling navigation — but for state that needs to survive a full page reload, or be shareable via a link, the URL itself (via \`searchParams\`) is usually the right place, not React state or a client store.

\`\`\`tsx
// Layout state — survives navigating between sibling pages, lost on reload
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // persists across /dashboard/* navigation
  return <div>{sidebarOpen && <Sidebar />}{children}</div>;
}

// URL state — survives reload, shareable, bookmarkable
// /products?category=shoes&sort=price
const category = useSearchParams().get("category");
\`\`\`

### Classic interview gotcha

Reaching for a global client-side store (Redux, Zustand, React Context) purely to keep something like a filter selection alive across navigation is often solving a problem the URL already solves better — state in a client store doesn't survive a page reload or a shared link the way a query parameter does, and it adds a client-side dependency for something that's naturally a routing concern. The URL is frequently the simplest, most correct "state manager" for anything that should be shareable or refresh-safe.

**Related:** [What are the useRouter, usePathname, and useSearchParams hooks?](/interview-prep/ff-nextjs/userouter-usepathname-usesearchparams-hooks) · [What is the layout.js file in App Router?](/interview-prep/ff-nextjs/layoutjs-file-in-app-router)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 47,
  },
  {
    collection: "ff-nextjs",
    slug: "link-prefetching-behavior",
    question: "What is the Link prefetching behavior?",
    answer: `By default, \`<Link>\` prefetches a linked page's code (and for static routes, its data) the moment it scrolls into the viewport — not on hover, and not only on click — so that by the time a user actually clicks, the navigation feels instant because the work already happened in the background. This is opt-out, not opt-in: every visible \`<Link>\` prefetches unless told not to.

\`\`\`jsx
<Link href="/about">About</Link>                    {/* prefetches on viewport visibility */}
<Link href="/heavy-page" prefetch={false}>Heavy</Link> {/* opts out */}
\`\`\`

### Classic interview gotcha

Prefetch behavior differs by route type: for a fully **static** route, both the code and the rendered data are prefetched. For a **dynamic** route, only the shared layout code down to the first \`loading.js\` boundary is prefetched (not the page's actual dynamic data), specifically because prefetching genuinely fresh, request-specific data ahead of time would defeat the purpose of it being dynamic. Assuming prefetch always includes full page data regardless of the route's rendering strategy is a common, incorrect simplification.

**Related:** [What is the next/link component?](/interview-prep/ff-nextjs/next-link-component)

**Sources checked:** nextjs.org/docs/app/api-reference/components/link (prefetch behavior differs for static vs. dynamic routes)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 48,
  },
  {
    collection: "ff-nextjs",
    slug: "handling-404-and-500-errors-in-nextjs",
    question: "How do you handle 404 and 500 errors in Next.js?",
    answer: `A 404 (not found) is handled by calling \`notFound()\` from \`next/navigation\` inside a route, which renders the nearest \`not-found.js\` and returns a real HTTP 404 status. A 500 (server error) is handled automatically by the nearest \`error.js\` Error Boundary catching any thrown error during rendering — Next.js also ships default fallback pages for both if no custom \`not-found.js\`/\`error.js\` exists in the tree.

\`\`\`jsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

async function Post({ params }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();          // 404 — renders the nearest not-found.js
  return <article>{post.title}</article>;
}
\`\`\`

\`\`\`jsx
// app/blog/error.tsx — must be a Client Component
"use client";
export default function Error({ error, reset }) {
  return <button onClick={reset}>Something broke. Try again.</button>;
}
\`\`\`

### Classic interview gotcha

The root-level \`error.js\` **cannot catch an error thrown in the root \`layout.js\` itself** — an error boundary can never catch an error from the component that renders it, and there's nothing above the root layout to place another \`error.js\`. A genuinely uncaught root-layout error falls back to Next.js's own default error UI, which is why the root layout is usually kept deliberately minimal and low-risk.

**Related:** [What is not-found.js?](/interview-prep/ff-nextjs/not-foundjs-explained) · [What is error.js in Next.js?](/interview-prep/ff-nextjs/errorjs-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 49,
  },
  {
    collection: "ff-nextjs",
    slug: "nextjs-middleware-edge-runtime",
    question: "What is Next.js middleware and how does it run at the edge?",
    answer: `Historically (through Next.js 15), \`middleware.ts\` ran exclusively on the **Edge Runtime** — a lightweight, V8-isolate-based environment deployed to edge locations close to the user, running before a request reaches any specific region's server, with a restricted API surface (no native Node.js modules, no raw TCP). **This changed in Next.js 16: this question now needs a precise, version-aware answer rather than the old default assumption.** The file was renamed to \`proxy.ts\`, and it now runs on the **Node.js runtime by default** — the Edge Runtime is no longer where routing interception happens automatically.

\`\`\`ts
// Next.js 16+ — proxy.ts, Node.js runtime, no edge config available
export function proxy(request: Request) {
  // full Node.js APIs available here now — no more edge-runtime restrictions
}
\`\`\`

### Classic interview gotcha

Edge Runtime execution for request interception isn't gone — it's just no longer the automatic default. \`middleware.ts\` still exists, is still deprecated-but-functional, and still runs on the Edge Runtime exactly as before; a Route Handler can also explicitly opt into \`export const runtime = 'edge'\`. Answering that "middleware only runs on the edge" as a flat, current-tense fact is now the outdated version of this answer — the accurate 2026 answer distinguishes what's deprecated-but-edge (\`middleware.ts\`) from what's current-but-Node (\`proxy.ts\`).

**Related:** [What is middleware in Next.js?](/interview-prep/ff-nextjs/middleware-in-nextjs) · [What is the Edge Runtime in Next.js?](/interview-prep/ff-nextjs/edge-runtime-in-nextjs)

**Sources checked:** nextjs.org/blog/next-16, nextjs.org/docs/messages/middleware-to-proxy (proxy.ts runs on Node.js by default; middleware.ts remains Edge Runtime but deprecated)`,
    difficulty: "hard",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 50,
  },
  {
    collection: "ff-nextjs",
    slug: "edge-runtime-in-nextjs",
    question: "What is the Edge Runtime in Next.js?",
    answer: `The Edge Runtime is a lightweight JavaScript environment (based on V8 isolates, the same technology behind Cloudflare Workers) that runs at edge locations geographically close to the requesting user — smaller cold-start times than a full Node.js server, but a restricted API surface: no native Node.js modules (\`fs\`, most of \`net\`), only Web-standard APIs (\`fetch\`, \`Request\`/\`Response\`, Web Crypto).

\`\`\`ts
// Route Handler explicitly opting into the Edge Runtime
export const runtime = "edge";

export async function GET(request: Request) {
  return Response.json({ message: "Running at the edge" });
}
\`\`\`

### Classic interview gotcha

The Edge Runtime's restricted API surface is a real, common source of "works locally, breaks in production" bugs — a library that depends on a native Node.js module (a database driver using raw TCP sockets, for instance) fails specifically when a route is deployed with \`runtime: 'edge'\`, even though it works fine in the (Node.js-based) local dev server, since local development doesn't always enforce the same restrictions as strictly as some edge deployment targets do.

**Related:** [What is the Node.js Runtime vs Edge Runtime?](/interview-prep/ff-nextjs/nodejs-runtime-vs-edge-runtime)

**Sources checked:** nextjs.org/docs/app/api-reference/edge`,
    difficulty: "hard",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 51,
  },
  {
    collection: "ff-nextjs",
    slug: "nodejs-runtime-vs-edge-runtime",
    question: "What is the Node.js Runtime vs Edge Runtime?",
    answer: `The Node.js Runtime is the full, standard Node.js environment — every Node API, native modules, longer cold starts, typically deployed to one or a few regions. The Edge Runtime is a restricted, V8-isolate-based environment — only Web-standard APIs, much faster cold starts, deployed to many locations near users. Next.js lets most things (Route Handlers, and as of Next.js 16, \`proxy.ts\`) choose between them.

| | Node.js Runtime | Edge Runtime |
|---|---|---|
| API surface | Full Node.js (\`fs\`, \`net\`, native modules) | Web-standard only (\`fetch\`, Web Crypto) |
| Cold start | Slower | Much faster |
| Deployment | Regional | Distributed, near the user |
| Default for \`proxy.ts\` (Next.js 16+) | Yes | No — not configurable |
| Default for Route Handlers/pages | Yes | Opt-in via \`runtime = 'edge'\` |

### Classic interview gotcha

The choice isn't "Edge is always faster, so prefer it" — Edge's speed advantage comes specifically from **not needing a database connection pool or native modules**; a route that genuinely needs a full SQL client library with a persistent connection has no faster Edge equivalent and simply can't run there at all. The right framing is: use Edge for latency-sensitive, API-surface-light logic; use Node.js for anything needing the full platform.

**Related:** [What is the Edge Runtime in Next.js?](/interview-prep/ff-nextjs/edge-runtime-in-nextjs) · [What is Next.js middleware and how does it run at the edge?](/interview-prep/ff-nextjs/nextjs-middleware-edge-runtime)`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 52,
  },
  {
    collection: "ff-nextjs",
    slug: "turbopack-vs-webpack",
    question: "What is Turbopack and how does it compare to Webpack?",
    answer: `Turbopack is Vercel's Rust-based bundler, built as Webpack's eventual successor with function-level incremental caching — changing one file only recompiles what actually depends on that file, not the whole dependency graph. **As of Next.js 16 (October 2025), Turbopack is stable and the default bundler for both \`next dev\` and \`next build\`**; Webpack is still available (\`next dev --webpack\` / \`next build --webpack\`) but is no longer the default.

| | Webpack | Turbopack |
|---|---|---|
| Language | JavaScript | Rust |
| Incremental rebuilds | Re-evaluates affected parts of the graph | Fine-grained, function-level caching |
| Status (Next.js 16+) | Available via opt-out flag | Stable, default |
| Typical dev refresh speed | Baseline | Reported 5-10x faster Fast Refresh |

### Classic interview gotcha

Turbopack becoming the default doesn't mean every project builds unchanged — projects with a custom, non-trivial \`webpack()\` config in \`next.config.js\` need that configuration reworked for Turbopack's plugin/loader model (or must explicitly opt back into Webpack) rather than silently continuing to work; Next.js 16 deliberately blocks a build rather than silently ignoring an incompatible custom Webpack config. Assuming an existing custom-Webpack project upgrades to Next.js 16 with zero changes is a common, incorrect assumption.

**Sources checked:** nextjs.org/blog/next-16 (Turbopack stable and default for dev and build), nextjs.org/docs/app/api-reference/turbopack`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 53,
  },
  {
    collection: "ff-nextjs",
    slug: "how-nextjs-optimizes-images-automatically",
    question: "How does Next.js optimize images automatically?",
    answer: `\`next/image\` optimizes images **on-demand at request time** (not ahead of time for every possible size): when a browser requests an image, Next.js's image optimization endpoint resizes it to the exact dimensions needed, converts it to a modern format (WebP/AVIF) if the browser supports it, and caches that specific transformed version so the next request for the same size/format is served instantly from cache.

\`\`\`jsx
import Image from "next/image";
<Image src="/hero.jpg" width={800} height={400} alt="Hero" />
// Requests: /_next/image?url=%2Fhero.jpg&w=800&q=75
\`\`\`

### Classic interview gotcha

Optimization happens **per unique size actually requested by a real device**, not for every theoretically possible size up front — this is precisely why \`next/image\`'s automatic \`srcset\` generation matters: it ensures browsers request from a small, predictable set of sizes (matching common device widths) rather than one unique size per device, which would otherwise blow up the number of distinct cached variants Next.js has to generate and store.

**Related:** [What is the next/image component and its benefits?](/interview-prep/ff-nextjs/next-image-component-and-benefits) · [What is the Vercel Image Optimization API?](/interview-prep/ff-nextjs/vercel-image-optimization-api)

**Sources checked:** vercel.com/docs/image-optimization`,
    difficulty: "medium",
    companies: ["Vercel", "Adobe"],
    orderIndex: 54,
  },
  {
    collection: "ff-nextjs",
    slug: "vercel-image-optimization-api",
    question: "What is the Vercel Image Optimization API?",
    answer: `When a Next.js app is deployed on Vercel, \`next/image\`'s optimization requests are handled by Vercel's own Image Optimization service — it performs the resize/format-conversion/caching work and serves the result from Vercel's CDN, with transformed images cached for up to 31 days. It's usage-metered: the free tier includes 1,000 source image optimizations per month, with paid tiers covering more before additional per-image charges apply.

\`\`\`ts
// next.config.ts — remote images still need explicit allowlisting
const nextConfig = {
  images: { remotePatterns: [{ hostname: "cdn.example.com" }] },
};
\`\`\`

### Classic interview gotcha

The billed unit is **unique source images optimized**, not total image requests or page views — a single popular image viewed by a million visitors, at a handful of common responsive sizes, counts as only a few "source image optimizations" (one per distinct size/format actually generated and cached), not a million. A common cost surprise instead comes from **many unique, rarely-repeated images** (e.g. user-uploaded avatars) each needing their own first-time optimization, not from raw traffic volume to already-cached images.

**Related:** [How does Next.js optimize images automatically?](/interview-prep/ff-nextjs/how-nextjs-optimizes-images-automatically)

**Sources checked:** vercel.com/docs/image-optimization/managing-image-optimization-costs`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 55,
  },
  {
    collection: "ff-nextjs",
    slug: "deploying-nextjs-outside-vercel",
    question: "How do you deploy Next.js outside of Vercel?",
    answer: `Next.js explicitly supports self-hosting as a first-class deployment target — the two main paths are running \`next start\` on any Node.js server (a full server, all features supported), or building with \`output: 'standalone'\` to produce a minimal, self-contained bundle (just the necessary files and a tiny \`server.js\`, no \`node_modules\` needed) ideal for a Docker image.

\`\`\`ts
// next.config.ts
const nextConfig = { output: "standalone" };
\`\`\`

\`\`\`dockerfile
# Copies only what standalone output actually needs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
\`\`\`

### Classic interview gotcha

Self-hosting means giving up features that depend on Vercel's specific infrastructure — most notably, ISR/on-demand revalidation and the managed Image Optimization API rely on Vercel's edge network and caching layer by default; self-hosting requires configuring an equivalent (a custom cache handler, \`sharp\` for image optimization, which Next.js uses automatically without manual install since Next.js 15) to get the same behavior. "Self-hosting works exactly like Vercel with zero setup" is a common, incorrect assumption.

**Related:** [What is output: 'standalone' mode?](/interview-prep/ff-nextjs/output-standalone-mode)

**Sources checked:** nextjs.org/docs/app/guides/self-hosting`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 56,
  },
  {
    collection: "ff-nextjs",
    slug: "output-export-option-in-nextjs",
    question: "What is output: 'export' option in Next.js?",
    answer: `\`output: 'export'\` produces a fully static site — plain HTML, CSS, and JS files with no Node.js server involved at all — deployable to any static file host (S3, GitHub Pages, a CDN). It's the most restrictive output mode: no Server Actions, no Route Handlers with dynamic behavior, no ISR, no Image Optimization API, no \`cookies()\`/\`headers()\` — anything requiring a server at request time simply isn't available.

\`\`\`ts
// next.config.ts
const nextConfig = { output: "export" };
// next build now writes a fully static site to the out/ directory
\`\`\`

### Classic interview gotcha

Choosing \`output: 'export'\` is an **all-or-nothing** decision for the whole app, not per-route — a single route using \`cookies()\`, a Server Action, or ISR anywhere in the app makes the entire static export build fail, not just that one route. Teams need every single route to be genuinely static-compatible before this option works at all, which is why it's usually decided at project-start, not retrofitted onto an app that already leans on server features.

**Related:** [What is output: 'standalone' mode?](/interview-prep/ff-nextjs/output-standalone-mode) · [What is Incremental Static Regeneration (ISR)?](/interview-prep/ff-nextjs/incremental-static-regeneration)`,
    difficulty: "medium",
    companies: ["Vercel", "GitHub"],
    orderIndex: 57,
  },
  {
    collection: "ff-nextjs",
    slug: "output-standalone-mode",
    question: "What is output: 'standalone' mode?",
    answer: `\`output: 'standalone'\` produces a minimal, self-contained server bundle in \`.next/standalone\` — Next.js traces exactly which \`node_modules\` files each route actually needs and copies only those, plus a small \`server.js\` that can replace \`next start\` entirely. Unlike \`output: 'export'\`, this is a real Node.js server — SSR, Route Handlers, Server Actions, and middleware/proxy all still work.

\`\`\`ts
// next.config.ts
const nextConfig = { output: "standalone" };
// .next/standalone/server.js can run with zero installed dependencies
\`\`\`

### Classic interview gotcha

The generated \`server.js\` deliberately does **not** copy the \`public/\` folder or \`.next/static\` by default — the assumption is a CDN serves those directly. A common deployment bug is running \`node server.js\` from the standalone output and getting broken images/missing CSS, purely because those two folders need to be manually copied alongside the standalone output (\`standalone/public\`, \`standalone/.next/static\`) — a genuinely easy step to miss since the app otherwise appears to build and start successfully.

**Related:** [How do you deploy Next.js outside of Vercel?](/interview-prep/ff-nextjs/deploying-nextjs-outside-vercel) · [What is output: 'export' option in Next.js?](/interview-prep/ff-nextjs/output-export-option-in-nextjs)

**Sources checked:** nextjs.org/docs/app/guides/self-hosting (standalone doesn't copy public/.next/static by default)`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 58,
  },
  {
    collection: "ff-nextjs",
    slug: "implementing-dark-mode-in-nextjs",
    question: "How do you implement dark mode in Next.js?",
    answer: `The standard 2026 approach is the \`next-themes\` library: wrap the app in its \`<ThemeProvider attribute="class">\`, add \`suppressHydrationWarning\` to \`<html>\`, and it injects a small inline script that applies the correct theme class **before** React hydrates — avoiding the classic "flash of wrong theme" that a purely client-side \`useEffect\`-based approach can't avoid.

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
\`\`\`

### Classic interview gotcha

The theme genuinely can't be known at build/server-render time — the server has no way to know the visitor's preference or previously-saved choice before the page reaches the browser. \`suppressHydrationWarning\` is specifically there to tell React "this one element's attribute is expected to differ between server and client render, don't warn about it" — it's a narrow, deliberate exception, not a general-purpose way to silence unrelated hydration mismatches, and applying it more broadly than just the \`<html>\` tag is a common overuse mistake.

**Sources checked:** github.com/pacocoursey/next-themes, ui.shadcn.com/docs/dark-mode/next`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 59,
  },
  {
    collection: "ff-nextjs",
    slug: "cookies-and-headers-api-in-app-router",
    question: "What is the cookies() and headers() API in App Router?",
    answer: `\`cookies()\` and \`headers()\` (both from \`next/headers\`) give Server Components, Route Handlers, and Server Actions read access to the incoming request's cookies and headers — and, for \`cookies()\`, a way to set/delete cookies from a Server Action or Route Handler. Both are **async functions as of Next.js 15** and must be awaited.

\`\`\`tsx
import { cookies, headers } from "next/headers";

async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return <p>Theme: {theme}, UA: {userAgent}</p>;
}
\`\`\`

### Classic interview gotcha

Calling either of these **always opts the entire route into dynamic rendering** — there's no way to read a per-request cookie or header while keeping that route statically rendered, since both APIs are, by definition, request-specific information that doesn't exist at build time. Reaching for \`cookies()\` "just in case" on an otherwise fully static page is a common way to silently lose all of that page's static-rendering performance benefits.

**Related:** [What is the difference between static and dynamic rendering in Next.js?](/interview-prep/ff-nextjs/static-vs-dynamic-rendering-in-nextjs) · [What is the connection() function in Next.js 15?](/interview-prep/ff-nextjs/connection-function-in-nextjs-15)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/cookies, nextjs.org/docs/app/api-reference/functions/headers (both async since Next.js 15)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 60,
  },
  {
    collection: "ff-nextjs",
    slug: "connection-function-in-nextjs-15",
    question: "What is the connection() function in Next.js 15?",
    answer: `\`connection()\` (from \`next/server\`) explicitly forces a component into dynamic, request-time rendering **without** relying on a request-specific API like \`cookies()\`/\`headers()\` — useful when a component needs a different result per request for a reason Next.js can't otherwise detect, like \`Math.random()\` or \`new Date()\`, which look like ordinary, static-safe code to the static analysis that normally decides a route's rendering strategy.

\`\`\`tsx
import { connection } from "next/server";

async function RandomBanner() {
  await connection(); // everything below this line only runs at request time
  const message = Math.random() > 0.5 ? "A" : "B";
  return <p>Variant: {message}</p>;
}
\`\`\`

### Classic interview gotcha

Without \`connection()\`, \`Math.random()\`/\`new Date()\` inside an otherwise-static component gets evaluated **once at build time** and baked into the static HTML forever — every visitor sees the exact same "random" value until the next rebuild, which is a genuinely surprising, easy-to-miss bug precisely because nothing about the code looks wrong; it's syntactically fine, just semantically frozen at build time. \`connection()\` exists specifically to close this gap for non-obvious-dynamic code.

**Related:** [What is the cookies() and headers() API in App Router?](/interview-prep/ff-nextjs/cookies-and-headers-api-in-app-router)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/connection`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 61,
  },
  {
    collection: "ff-nextjs",
    slug: "react-cache-and-use-in-nextjs-context",
    question: "What are React cache() and use() in the Next.js context?",
    answer: `\`cache()\` (from React) memoizes an arbitrary function's return value **for the duration of a single request** — the same mechanism behind \`fetch()\`'s automatic deduplication in Next.js, but generalized to any function, most usefully a direct database or ORM call that isn't a \`fetch\`. \`use()\` reads the value out of a Promise or Context directly inside render — it's not a hook (it doesn't follow the Rules of Hooks) and can be called conditionally, most commonly to unwrap a Promise passed down from a Server Component into a Client Component.

\`\`\`ts
// cache() — dedupes a raw DB call across the same request, same as fetch's auto-dedup
import { cache } from "react";
const getUser = cache(async (id: string) => db.users.findById(id));

// Called from both a layout and a page in the same request — only queries once
\`\`\`

\`\`\`tsx
// use() — unwraps a Promise passed from a Server Component
"use client";
import { use } from "react";

function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise); // suspends until the promise resolves
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
\`\`\`

### Classic interview gotcha

\`cache()\`'s deduplication window is **per-request only** — it does not persist data across separate requests or separate users the way \`unstable_cache\`/\`"use cache"\` do. Reaching for \`cache()\` expecting it to reduce database load across multiple users' requests is a common misunderstanding; it only prevents the *same* request from querying the same thing twice, not from querying it again on the next request.

**Related:** [What is the fetch() caching behavior in Next.js App Router?](/interview-prep/ff-nextjs/fetch-caching-behavior-in-nextjs) · [What is use() in React?](/interview-prep/ff-react/use-hook-in-react) (React collection)

**Sources checked:** react.dev/reference/react/cache, react.dev/reference/react/use`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 62,
  },
  {
    collection: "ff-nextjs",
    slug: "implementing-search-params-in-app-router",
    question: "How do you implement search params in App Router?",
    answer: `A Server Component page reads query parameters directly via its \`searchParams\` prop — a Promise (as of Next.js 15+) resolving to a plain object — with no hook needed at all, since the data is already available server-side. Reading a query parameter is precisely one of the request-specific facts that opts a route into dynamic rendering.

\`\`\`tsx
// app/products/page.tsx
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const products = await getProducts({ category, sort });
  return <ProductGrid products={products} />;
}
\`\`\`

### Classic interview gotcha

Reaching for the \`useSearchParams()\` **hook** in a Server Component page is unnecessary and wrong — that hook is Client Component-only and requires \`"use client"\`, needlessly moving data-reading logic to the browser when the exact same data is already sitting in the page's own \`searchParams\` prop, server-side, for free. The hook exists specifically for Client Components that need to read the query string themselves (a controlled filter UI, for instance), not as the default way to access search params generally.

**Related:** [What is the difference between the searchParams prop and useSearchParams?](/interview-prep/ff-nextjs/searchparams-prop-vs-usesearchparams)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 63,
  },
  {
    collection: "ff-nextjs",
    slug: "searchparams-prop-vs-usesearchparams",
    question: "What is the difference between the searchParams prop and useSearchParams?",
    answer: `The \`searchParams\` **prop** is passed only to \`page.tsx\` files, works in Server Components, requires no \`"use client"\`, and is read once at render — it's the server-side source of truth for a page's query string. The \`useSearchParams\` **hook** is Client Component-only, can be called from any component (not just the top-level page), and re-reads reactively whenever the URL's query string changes via client-side navigation, without a full page reload.

| | \`searchParams\` prop | \`useSearchParams()\` hook |
|---|---|---|
| Where usable | \`page.tsx\` only | Any Client Component |
| Requires \`"use client"\` | No | Yes |
| Reactivity | Read once per render | Re-renders on client-side URL changes |
| Type | \`Promise<Record<string, string \\| string[] \\| undefined>>\` | \`ReadonlyURLSearchParams\` |

### Classic interview gotcha

A component deep in the tree that needs the current search params — say, a filter sidebar living several levels below the page — can't receive the \`searchParams\` prop directly unless it's manually threaded down through every intermediate component, which gets awkward fast. \`useSearchParams()\` exists precisely to let a deeply nested Client Component read the current query string **without** prop-drilling it down from the page — that's the real reason both exist, not just "server vs. client," but "top-level, no extra plumbing" vs. "reach in from anywhere."

**Related:** [How do you implement search params in App Router?](/interview-prep/ff-nextjs/implementing-search-params-in-app-router)`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 64,
  },
  {
    collection: "ff-nextjs",
    slug: "handling-form-submissions-with-server-actions",
    question: "How do you handle form submissions with Server Actions?",
    answer: `A form's \`action\` prop can point directly at a \`"use server"\`-marked function — the browser submits the form (working even with JavaScript disabled, since it's built on the native HTML form submission model), Next.js intercepts it, calls the function on the server with a \`FormData\` object, and the action typically ends by revalidating whatever cached data the mutation affected.

\`\`\`tsx
// app/actions.ts
"use server";
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.posts.create({ title });
  revalidatePath("/posts");
}

// app/new-post/page.tsx
import { createPost } from "@/app/actions";
function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
\`\`\`

### Classic interview gotcha

Because the form works via the browser's native submission mechanism, it functions **without any client-side JavaScript at all** — the exact opposite of the assumption that Server Actions require a fully-hydrated Client Component to work. The progressive-enhancement angle (works with JS disabled or not yet loaded, then gets nicer pending/optimistic UI once JS is available via \`useActionState\`/\`useFormStatus\`) is a genuinely distinguishing, frequently-tested detail versus a plain client-side \`fetch\`-based form handler.

**Related:** [What are Server Actions in Next.js?](/interview-prep/ff-nextjs/server-actions-in-nextjs) · [What are useFormState and useFormStatus?](/interview-prep/ff-nextjs/useformstate-and-useformstatus)`,
    difficulty: "hard",
    companies: ["Vercel", "Stripe"],
    orderIndex: 65,
  },
  {
    collection: "ff-nextjs",
    slug: "useformstate-and-useformstatus",
    question: "What are useFormState and useFormStatus?",
    answer: `\`useFormStatus\` (from \`react-dom\`) reads the pending state of the **nearest parent \`<form>\`**, letting a submit button disable itself or show a spinner during submission — without any state being manually wired up. \`useFormState\` was the original hook for reading a Server Action's returned state (validation errors, a success message) across submissions. **This is a genuinely important rename to get right in 2026: \`useFormState\` is deprecated, replaced by \`useActionState\` — which is imported from \`react\` itself, not \`react-dom\`, and additionally exposes the pending state directly.**

\`\`\`tsx
"use client";
import { useActionState } from "react"; // not useFormState, and not from react-dom
import { useFormStatus } from "react-dom"; // this one is unchanged

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}

function Form() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p>{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
\`\`\`

### Classic interview gotcha

Answering with only \`useFormState\` and no mention of \`useActionState\` is a stale, pre-React-19 answer as of 2026 — \`useFormState\` still technically works (deprecated APIs aren't removed immediately) but citing it as the *current* recommended hook, without naming its replacement or the \`react\` vs. \`react-dom\` import-source distinction, is exactly the kind of easy-to-catch outdated detail this question is designed to surface.

**Related:** [What is the optimistic UI pattern with useOptimistic?](/interview-prep/ff-nextjs/optimistic-ui-pattern-with-useoptimistic)

**Sources checked:** react.dev/blog/2024/12/05/react-19 (useFormState deprecated, renamed useActionState, imported from react not react-dom)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 66,
  },
  {
    collection: "ff-nextjs",
    slug: "optimistic-ui-pattern-with-useoptimistic",
    question: "What is the optimistic UI pattern with useOptimistic?",
    answer: `\`useOptimistic\` shows a predicted result **immediately**, before a Server Action actually finishes — you give it the current real state and an update function; it returns an "optimistic" value to render right away, then automatically reverts to the real state once the action resolves (or rolls back automatically if the action throws).

\`\`\`tsx
"use client";
import { useOptimistic } from "react";

function LikeButton({ likes, addLike }: { likes: number; addLike: () => Promise<number> }) {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes, (state) => state + 1);

  async function handleLike() {
    setOptimisticLikes(optimisticLikes + 1); // shown instantly
    await addLike();                          // real mutation + revalidation catches up after
  }

  return <button onClick={handleLike}>{optimisticLikes} likes</button>;
}
\`\`\`

### Classic interview gotcha

The optimistic value isn't a separate piece of state you manage yourself — it's automatically discarded and replaced by the real value the moment the underlying action's promise settles, whether it resolves or rejects. A common mistake is trying to manually reset the optimistic state in a \`.catch\` block; \`useOptimistic\` already handles the revert-on-error case internally, and adding your own reset logic on top is redundant at best and can cause a visible double-flicker at worst.

**Related:** [What are useFormState and useFormStatus?](/interview-prep/ff-nextjs/useformstate-and-useformstatus) · [What is the optimistic vs. pessimistic UI pattern?](/interview-prep/ff-react/optimistic-vs-pessimistic-ui) (React collection)

**Sources checked:** react.dev/reference/react/useOptimistic, nextjs.org/docs/app/guides/forms`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 67,
  },
  {
    collection: "ff-nextjs",
    slug: "implementing-file-uploads-in-nextjs",
    question: "How do you implement file uploads in Next.js?",
    answer: `A \`<form>\` with \`encType\` handled automatically by the browser can submit files straight to a Server Action, which receives them as \`File\` objects inside the \`FormData\` — no separate multipart-parsing library needed, since \`FormData\` natively represents file uploads and Next.js's Server Actions handle it directly.

\`\`\`tsx
// app/actions.ts
"use server";
export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToStorage(file.name, buffer); // e.g. S3, Vercel Blob, Supabase Storage
}

// Client
<form action={uploadAvatar}>
  <input type="file" name="avatar" />
  <button type="submit">Upload</button>
</form>
\`\`\`

### Classic interview gotcha

Server Actions have a **default body size limit** (1MB for the request body) — a file upload beyond that fails outright unless \`serverActions.bodySizeLimit\` is explicitly raised in \`next.config.js\`. This is a common, confusing first-time bug: the code looks entirely correct, and small test files work fine, but a real-world image or video upload fails with no obviously-related error message pointing at the actual (easily overlooked) config limit.

**Sources checked:** nextjs.org/docs/app/api-reference/config/next-config-js/serverActions (default 1MB body size limit)`,
    difficulty: "hard",
    companies: ["Vercel", "Adobe"],
    orderIndex: 68,
  },
  {
    collection: "ff-nextjs",
    slug: "nextjs-instrumentationts-file",
    question: "What is the Next.js instrumentation.ts file?",
    answer: `An \`instrumentation.ts\` file at the project root (not inside \`app/\` or \`pages/\`) exports a \`register()\` function that Next.js calls exactly once, when a new server instance starts — before it begins handling any requests — making it the correct place to initialize monitoring, tracing, or any setup that needs to run once per server lifecycle rather than once per request.

\`\`\`ts
// instrumentation.ts (project root)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node"); // Node-only setup, e.g. OpenTelemetry's NodeSDK
  }
}
\`\`\`

### Classic interview gotcha

\`register()\` runs in **both** the Node.js runtime and the Edge Runtime contexts a project uses — code that only works in Node.js (most OpenTelemetry SDK setup, for instance) needs an explicit \`process.env.NEXT_RUNTIME === "nodejs"\` guard before importing it, or the app crashes the moment that same \`instrumentation.ts\` runs in an Edge Runtime context that doesn't support those Node-only APIs at all.

**Related:** [What is OpenTelemetry support in Next.js?](/interview-prep/ff-nextjs/opentelemetry-support-in-nextjs)

**Sources checked:** nextjs.org/docs/app/guides/instrumentation`,
    difficulty: "hard",
    companies: ["Vercel", "Datadog"],
    orderIndex: 69,
  },
  {
    collection: "ff-nextjs",
    slug: "opentelemetry-support-in-nextjs",
    question: "What is OpenTelemetry support in Next.js?",
    answer: `Next.js ships built-in OpenTelemetry instrumentation for its own internals (request handling, rendering, data fetching) — wiring it up is a matter of calling \`registerOTel()\` (from Vercel's \`@vercel/otel\` package, the simplest path) inside \`instrumentation.ts\`'s \`register()\` function, which automatically produces traces/spans for App Router requests without manually instrumenting every route.

\`\`\`ts
// instrumentation.ts
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "my-nextjs-app" });
}
\`\`\`

### Classic interview gotcha

The simple \`@vercel/otel\` setup is fine for standard use, but for a fully custom OpenTelemetry configuration (a specific exporter, custom sampling), teams reach for the full \`NodeSDK\` directly — and that path is **not compatible with the Edge Runtime** at all, meaning any such custom setup must be guarded to only import and run under the Node.js runtime (the same \`NEXT_RUNTIME === "nodejs"\` check as \`instrumentation.ts\` generally), or it throws in an Edge Runtime context.

**Related:** [What is the Next.js instrumentation.ts file?](/interview-prep/ff-nextjs/nextjs-instrumentationts-file)

**Sources checked:** nextjs.org/docs/app/guides/open-telemetry`,
    difficulty: "hard",
    companies: ["Vercel", "Datadog"],
    orderIndex: 70,
  },
  {
    collection: "ff-nextjs",
    slug: "configuring-content-security-policy-in-nextjs",
    question: "How do you configure Content Security Policy in Next.js?",
    answer: `A strict CSP (blocking inline scripts by default) needs a fresh, unpredictable **nonce** generated per request and attached both to the response's \`Content-Security-Policy\` header and to every inline \`<script>\` Next.js itself injects — Next.js reads a nonce you set on a specific request header and automatically applies it to its own inline scripts. The nonce is typically generated in \`proxy.ts\`/\`middleware.ts\`, since it needs to run before rendering, per request.

\`\`\`ts
// proxy.ts
export function proxy(request: Request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = \`script-src 'self' 'nonce-\${nonce}'; object-src 'none';\`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  return NextResponse.next({ request: { headers: requestHeaders } });
}
\`\`\`

### Classic interview gotcha

A per-request nonce **requires dynamic rendering** — it's a genuinely new, unique value on every single request by definition, which is fundamentally incompatible with a page being statically cached and served identically to everyone. Adopting a strict, nonce-based CSP on a route that was previously fully static is a real, easy-to-miss tradeoff: it silently opts that route out of static optimization and ISR entirely, not just an extra header.

**Sources checked:** nextjs.org/docs/app/guides/content-security-policy (nonce requires dynamic rendering)`,
    difficulty: "hard",
    companies: ["Vercel", "Stripe"],
    orderIndex: 71,
  },
  {
    collection: "ff-nextjs",
    slug: "how-nextjs-handles-typescript-configuration",
    question: "How does Next.js handle TypeScript configuration?",
    answer: `Running \`next dev\` or \`next build\` in a project with a \`.ts\`/\`.tsx\` file (or no \`tsconfig.json\` at all) auto-detects TypeScript, installs the necessary type packages if missing, and generates a \`tsconfig.json\` pre-populated with Next.js-specific recommended settings (\`strict\`, the \`next\` plugin for App Router type-checking, path aliases scaffolding) — no manual TypeScript setup required to start a new project.

\`\`\`json
// Auto-generated tsconfig.json (abridged)
{
  "compilerOptions": {
    "strict": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  }
}
\`\`\`

### Classic interview gotcha

The \`"next"\` TypeScript plugin isn't just editor convenience — it's what enforces App Router-specific type rules, like flagging a Server Component that isn't allowed to be async in certain contexts, or catching an invalid \`generateStaticParams\` return shape, at the editor level before a build ever fails. Removing that plugin entry from \`tsconfig.json\` "to simplify config" silently loses these Next.js-specific checks, leaving only generic TypeScript validation.

**Related:** [What is the tsconfig paths alias in Next.js?](/interview-prep/ff-nextjs/tsconfig-paths-alias-in-nextjs)

**Sources checked:** nextjs.org/docs/app/api-reference/config/typescript`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 72,
  },
  {
    collection: "ff-nextjs",
    slug: "tsconfig-paths-alias-in-nextjs",
    question: "What is the tsconfig paths alias in Next.js?",
    answer: `\`tsconfig.json\`'s \`paths\` option maps an import prefix (conventionally \`@/*\`) to a real directory, letting imports use a stable, absolute-feeling path instead of long chains of \`../../../\` regardless of how deeply nested the importing file is — purely a TypeScript/build-tool feature (resolved by the bundler), not a Next.js-specific runtime mechanism, though Next.js scaffolds it by default in new projects.

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
\`\`\`

\`\`\`ts
// Anywhere in the project, regardless of nesting depth
import { Button } from "@/components/Button";
// instead of: import { Button } from "../../../components/Button";
\`\`\`

### Classic interview gotcha

The \`paths\` mapping only affects **type-checking and how the bundler resolves the import** — it does nothing on its own for tools that don't read \`tsconfig.json\`, most notably a plain Node.js script run outside Next.js's own build pipeline (a standalone seed script, for instance) which would need its own separate resolution setup (or a runtime helper) to understand the same \`@/\` alias, since Node's own module resolution has no idea \`tsconfig.json\` exists.

**Related:** [How does Next.js handle TypeScript configuration?](/interview-prep/ff-nextjs/how-nextjs-handles-typescript-configuration)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 73,
  },
  {
    collection: "ff-nextjs",
    slug: "using-css-modules-in-nextjs",
    question: "How do you use CSS Modules in Next.js?",
    answer: `Any file named \`*.module.css\` is automatically treated as a CSS Module — Next.js generates locally-scoped, unique class names at build time, so styles in one file never accidentally leak into or collide with another component's identically-named class.

\`\`\`css
/* Button.module.css */
.button { background: blue; }
\`\`\`

\`\`\`tsx
import styles from "./Button.module.css";
<button className={styles.button}>Click</button>
// Rendered class is something like Button_button__a1b2c, not just "button"
\`\`\`

### Classic interview gotcha

CSS Modules work identically in both Server and Client Components — the scoping happens entirely at **build time**, not via any runtime JavaScript, which is precisely why they add zero client-side bundle cost or runtime overhead unlike some CSS-in-JS libraries. This is a common, useful distinguishing fact in an interview: CSS Modules are effectively "free" from a Server Components performance standpoint, since there's no client-side runtime involved at all.

**Related:** [What is the global CSS file in Next.js?](/interview-prep/ff-nextjs/global-css-file-in-nextjs)`,
    difficulty: "easy",
    companies: ["Vercel", "Meta"],
    orderIndex: 74,
  },
  {
    collection: "ff-nextjs",
    slug: "using-tailwind-css-in-nextjs",
    question: "How do you use Tailwind CSS in Next.js?",
    answer: `\`create-next-app\` offers Tailwind as a setup option out of the box, wiring up its PostCSS plugin and a single global stylesheet import in the root layout — after that, utility classes are used directly in JSX with no per-component CSS file needed.

\`\`\`tsx
// app/layout.tsx
import "./globals.css"; // contains Tailwind's directives/imports

// Any component
<button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Click
</button>
\`\`\`

### Classic interview gotcha

Tailwind CSS v4 changed its own configuration model in a way that trips people up specifically in a Next.js context: the classic \`darkMode: 'class'\` setting from a JavaScript \`tailwind.config.js\` file **has no effect** in Tailwind v4 — the v4 approach configures this via a CSS-based \`@custom-variant\` directive in the global stylesheet instead. Following an older Tailwind v3-era tutorial's dark-mode setup in a Tailwind v4 project silently does nothing.

**Sources checked:** ui.shadcn.com/docs/dark-mode/next (Tailwind v4's CSS-based dark mode variant, replacing the v3 config option)`,
    difficulty: "easy",
    companies: ["Vercel", "Netflix"],
    orderIndex: 75,
  },
  {
    collection: "ff-nextjs",
    slug: "global-css-file-in-nextjs",
    question: "What is the global CSS file in Next.js?",
    answer: `A plain (non-module) \`.css\` file imported once, in the root layout, applies its styles application-wide — unlike CSS Modules, its class names are **not** scoped, so \`.card { }\` in a global stylesheet can collide with an identically-named class anywhere else in the app.

\`\`\`tsx
// app/layout.tsx
import "./globals.css"; // applies everywhere; must be imported at the root

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
\`\`\`

### Classic interview gotcha

A global stylesheet can only be imported in the **root layout** (or another top-level file it depends on) — importing a global CSS file from a component deep in the tree is a build error in the App Router, precisely because global styles apply everywhere and Next.js wants that intent declared once, at the top, rather than scattered and easy to lose track of across many files.

**Related:** [How do you use CSS Modules in Next.js?](/interview-prep/ff-nextjs/using-css-modules-in-nextjs)`,
    difficulty: "easy",
    companies: ["Vercel", "Adobe"],
    orderIndex: 76,
  },
  {
    collection: "ff-nextjs",
    slug: "using-sass-in-nextjs",
    question: "How do you use Sass in Next.js?",
    answer: `Installing the \`sass\` package is the only setup step — Next.js then supports \`.scss\`/\`.sass\` files natively, including \`.module.scss\` for scoped CSS Modules combined with Sass's nesting, variables, and mixins, with no extra Webpack/Turbopack loader configuration needed.

\`\`\`bash
npm install --save-dev sass
\`\`\`

\`\`\`scss
// Button.module.scss
.button {
  background: blue;
  &:hover { background: darkblue; } // Sass nesting
}
\`\`\`

### Classic interview gotcha

Because \`sass\` is a **build-time-only** dependency (it compiles \`.scss\` to plain CSS before anything reaches the browser), it should be a \`devDependency\`, not a regular \`dependency\` — installing it as a production dependency needlessly bloats what a deployment installs on a server that never actually needs the Sass compiler at runtime, only the already-compiled CSS output.

**Related:** [How do you use CSS Modules in Next.js?](/interview-prep/ff-nextjs/using-css-modules-in-nextjs)`,
    difficulty: "easy",
    companies: ["Vercel", "Shopify"],
    orderIndex: 77,
  },
  {
    collection: "ff-nextjs",
    slug: "react-server-component-payload",
    question: "What is the React Server Component payload?",
    answer: `The RSC payload is a compact, streamable serialized format — **not JSON, and not HTML** — representing a rendered Server Component tree: the actual rendered output of Server Components, plus placeholders and serialized props for wherever a Client Component needs to be mounted. It's what the browser actually receives and uses both to paint the page and to know exactly which Client Component bundles to fetch and hydrate.

### Diagram

The server serializes its rendered component tree into the RSC payload — containing rendered Server Component output plus placeholder/prop references for Client Components — and streams it to the browser, which paints the result and hydrates only the Client Component placeholders.

\`\`\`
$1:["$","div",null,{"children":["Hello, ","$L2"]}]
$L2:["$","ClientButton",null,{"label":"Click me"}]
\`\`\`

Every \`page.tsx\` navigation in the App Router, and every Server Action, ultimately produces and streams this format — not a plain HTML document, and not a conventional REST/JSON API response, since the format needs to represent things plain JSON can't (Promises, references, streamed chunks).

### Classic interview gotcha

Confusing the RSC payload with either "just the HTML" or "just a JSON API response" is a common, imprecise answer. It's neither: it's a distinct wire format that a browser's DevTools Network tab will show as separate requests during App Router client-side navigation (distinguishable from the initial full-page HTML load), specifically because subsequent navigations only need the *new* payload for what changed, not a full re-fetch of the whole document.

**Related:** [What are Server Components in Next.js App Router?](/interview-prep/ff-nextjs/server-components-in-nextjs-app-router)

**Sources checked:** nextjs.org/docs/app/getting-started/server-and-client-components (RSC payload as a distinct serialized format)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 78,
  },
  {
    collection: "ff-nextjs",
    slug: "how-app-router-handles-data-mutations",
    question: "How does the App Router handle data mutations?",
    answer: `Mutations are handled through Server Actions, not a separate API-plus-client-fetch layer — a form (or any event handler) calls a \`"use server"\` function directly, that function performs the write, and it explicitly tells Next.js which cached data is now stale via \`revalidatePath\`/\`revalidateTag\` (or, as of Next.js 16, the newer Server-Action-only \`updateTag\` for immediate invalidation), so the next read reflects the change.

\`\`\`ts
"use server";
export async function updateProfile(formData: FormData) {
  await db.users.update({ name: formData.get("name") });
  revalidatePath("/profile"); // tells Next.js this page's cache is now stale
}
\`\`\`

### Classic interview gotcha

Rule of thumb worth stating precisely: **start with \`revalidatePath\`** since it's the easiest to reason about (invalidate exactly the pages you know were affected); reach for \`revalidateTag\` only once the same underlying data appears behind multiple, hard-to-enumerate URLs. Defaulting to tag-based revalidation everywhere "to be safe" adds indirection (needing to remember which tag maps to which data) for cases where a simple, explicit path invalidation would have been just as correct and far easier to follow later.

**Related:** [What are Server Actions in Next.js?](/interview-prep/ff-nextjs/server-actions-in-nextjs) · [What is the revalidatePath and revalidateTag function?](/interview-prep/ff-nextjs/revalidatepath-and-revalidatetag-function)

**Sources checked:** nextjs.org/docs/app/getting-started/mutating-data, nextjs.org (updateTag as the Next.js 16 Server-Action-only immediate-invalidation API)`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 79,
  },
  {
    collection: "ff-nextjs",
    slug: "push-vs-replace-in-userouter",
    question: "What is the difference between push() and replace() in useRouter?",
    answer: `\`router.push(url)\` adds a new entry to the browser's history stack — pressing the back button afterward returns to the page the user navigated *from*. \`router.replace(url)\` swaps the **current** history entry instead of adding a new one — pressing back afterward skips over the replaced page entirely, landing on whatever came before it.

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  async function handleLogin() {
    await login();
    router.replace("/dashboard"); // back button won't return to the login form
  }
}
\`\`\`

### Classic interview gotcha

\`replace()\` is the deliberate, correct choice for post-login or post-form-submission redirects specifically to prevent a broken or confusing back-button experience — using \`push()\` for a login redirect means pressing back after logging in returns the user to the login form (and, worse, sometimes resubmits a form via the browser's own back/forward cache behavior). Defaulting to \`push()\` everywhere, out of habit, is a common real UX bug for exactly this kind of one-way navigation.

**Related:** [What are the useRouter, usePathname, and useSearchParams hooks?](/interview-prep/ff-nextjs/userouter-usepathname-usesearchparams-hooks)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 80,
  },
  {
    collection: "ff-nextjs",
    slug: "what-is-next-dynamic",
    question: "What is next/dynamic?",
    answer: `\`dynamic()\` (from \`next/dynamic\`) lazy-loads a component with Next.js-specific integration on top of plain \`React.lazy\`: built-in support for a custom loading component, and — critically — the ability to disable server-side rendering entirely for that one component via \`{ ssr: false }\`, which \`React.lazy\` alone cannot do.

\`\`\`tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // this component never renders on the server at all
});
\`\`\`

### Classic interview gotcha

\`{ ssr: false }\` is the specific reason \`next/dynamic\` still matters even though React itself now has \`lazy\` and \`Suspense\` built in — a component that depends on a browser-only API (\`window\`, a canvas/WebGL library) throws if the server ever tries to render it at all, and \`React.lazy\` has no equivalent "skip SSR entirely for this" escape hatch on its own. This is the concrete answer to "when would you use \`dynamic()\` over \`React.lazy()\`" — it's not a stylistic preference, it's the one capability plain \`React.lazy\` genuinely lacks in a server-rendering framework.

**Related:** [When would you use dynamic() over React.lazy()?](/interview-prep/ff-nextjs/dynamic-over-react-lazy)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 81,
  },
  {
    collection: "ff-nextjs",
    slug: "dynamic-over-react-lazy",
    question: "When would you use dynamic() over React.lazy()?",
    answer: `Reach for \`next/dynamic\` specifically when a lazy-loaded component needs \`{ ssr: false }\` — skipping server rendering entirely — because it depends on a browser-only API (\`window\`, \`document\`, a canvas/WebGL library) that throws if Next.js ever tries to render it on the server. Plain \`React.lazy\` has no equivalent option; it always participates in whatever rendering the framework does, server included.

\`\`\`tsx
// A map library that reads window at module-evaluation time — must never run on the server
const MapWidget = dynamic(() => import("./MapWidget"), { ssr: false });

// React.lazy has no ssr option — this would throw during server rendering
const LazyMap = lazy(() => import("./MapWidget")); // unsafe if MapWidget touches window
\`\`\`

### Classic interview gotcha

Outside of that one specific need, the two are largely interchangeable in the App Router — both suspend and show a fallback while the module loads. Framing this as "always use \`next/dynamic\` in Next.js, never \`React.lazy\`" overstates the difference; the precise, correct answer names the **one** concrete capability (\`ssr: false\`) that actually distinguishes them, rather than a vague sense that "the Next.js one is just better."

**Related:** [What is next/dynamic?](/interview-prep/ff-nextjs/what-is-next-dynamic)

**Sources checked:** nextjs.org/docs/app/guides/lazy-loading`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 82,
  },
  {
    collection: "ff-nextjs",
    slug: "implementing-loading-skeleton-in-nextjs",
    question: "How do you implement a loading skeleton in Next.js?",
    answer: `A skeleton is just the fallback UI rendered by \`loading.js\` (for a whole segment) or a manually-placed \`<Suspense fallback={...}>\` (for a specific slow component) — matching the real content's approximate layout with pulsing placeholder shapes, so the perceived wait feels shorter and nothing visibly jumps once real content arrives.

\`\`\`jsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-32 w-full rounded bg-gray-200" />
    </div>
  );
}
\`\`\`

### Classic interview gotcha

A skeleton that doesn't roughly match the real content's eventual size and shape defeats its own purpose — the whole point is minimizing layout shift when the fallback is swapped for real content, so a generic spinner (or a skeleton with wildly different dimensions than the actual data) can cause the same jarring layout jump it was meant to prevent, just with a slightly nicer-looking placeholder in between.

**Related:** [What is loading.js and how does it enable streaming?](/interview-prep/ff-nextjs/loadingjs-and-streaming)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 83,
  },
  {
    collection: "ff-nextjs",
    slug: "nextconfigjs-headers-function",
    question: "What is the next.config.js headers() function?",
    answer: `An async \`headers()\` function exported from \`next.config.js\` returns an array of rules mapping a path pattern to a set of HTTP response headers — applied by Next.js itself at the framework level, before a request reaches any page or Route Handler, most commonly used for security headers (\`X-Frame-Options\`, a static CSP) that should apply broadly and don't need to vary per-request.

\`\`\`ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
\`\`\`

### Classic interview gotcha

This config-level \`headers()\` is static, decided at build time — it cannot vary per-request (no per-request nonce, no conditional logic based on the actual request). A dynamic, per-request header — most notably a CSP nonce, which by definition must be different every time — has to be set in \`proxy.ts\`/\`middleware.ts\` instead, not here; reaching for config-level \`headers()\` for anything request-dependent simply won't work.

**Related:** [How do you configure Content Security Policy in Next.js?](/interview-prep/ff-nextjs/configuring-content-security-policy-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Stripe"],
    orderIndex: 84,
  },
  {
    collection: "ff-nextjs",
    slug: "multi-zone-architecture-in-nextjs",
    question: "What is Multi-Zone architecture in Next.js?",
    answer: `Multi-Zones split one large application, on one visible domain, into several **independently built and deployed** Next.js apps, each owning a set of path prefixes — stitched together via \`rewrites\` in the entry zone's \`next.config.js\`. Each zone gets its own build, its own deploy pipeline, and can even be on a different Next.js version, without the other zones being affected.

### Diagram

One visible domain (\`example.com\`) is actually served by three separately deployed apps: a marketing zone at \`/\`, a dashboard zone at \`/dashboard/*\`, and a docs zone at \`/docs/*\`, stitched together with rewrites.

\`\`\`ts
// Marketing zone's next.config.ts — the entry point stitching zones together
const nextConfig = {
  async rewrites() {
    return [
      { source: "/dashboard/:path*", destination: "https://dashboard.internal/dashboard/:path*" },
      { source: "/docs/:path*", destination: "https://docs.internal/docs/:path*" },
    ];
  },
};
\`\`\`

### Classic interview gotcha

A soft, client-side \`<Link>\` navigation only works **within** the same zone — crossing a zone boundary (from \`/\` to \`/dashboard\`) is always a full, hard page navigation (a real browser request), even though the URL bar makes it look like one seamless app. This is the real tradeoff versus Module Federation, which solves runtime code-sharing between bundles: Multi-Zones solve independent team ownership and deploys, at the cost of a hard navigation at every zone boundary.

**Sources checked:** nextjs.org/docs/app/guides/multi-zones`,
    difficulty: "hard",
    companies: ["Vercel", "Spotify"],
    orderIndex: 85,
  },
  {
    collection: "ff-nextjs",
    slug: "app-js-equivalent-in-app-router",
    question: "What is the _app.js equivalent in App Router?",
    answer: `\`pages/_app.js\` was the Pages Router's single place to wrap every page in shared providers/layout and persist state across page changes. The App Router splits that one responsibility across two different files: the **root \`layout.tsx\`** (\`app/layout.tsx\`) for shared UI and top-level providers, and **nested layouts** for anything more specific than the whole app — there's no single one-to-one file replacement.

\`\`\`jsx
// Pages Router — pages/_app.js
function MyApp({ Component, pageProps }) {
  return <ThemeProvider><Component {...pageProps} /></ThemeProvider>;
}

// App Router — app/layout.tsx (must include <html>/<body>, _app.js never did)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
\`\`\`

### Classic interview gotcha

The root \`layout.tsx\` must render the actual \`<html>\` and \`<body>\` tags itself — \`_app.js\` never did this (that was \`_document.js\`'s job, the Pages Router's other, separate file for the base HTML shell). The App Router's root layout genuinely merges what used to be **two** separate files (\`_app.js\` and \`_document.js\`) into one, which is a common, precise detail worth naming rather than treating it as a simple one-to-one rename.

**Related:** [What is a root layout in Next.js?](/interview-prep/ff-nextjs/root-layout-in-nextjs)`,
    difficulty: "medium",
    companies: ["Vercel", "Netflix"],
    orderIndex: 86,
  },
  {
    collection: "ff-nextjs",
    slug: "root-layout-in-nextjs",
    question: "What is a root layout in Next.js?",
    answer: `The root layout (\`app/layout.tsx\`) is the one required layout every App Router project must have — it wraps the entire application, is the only layout allowed to render \`<html>\` and \`<body>\`, and (like every layout) persists across navigation rather than remounting on every page change.

\`\`\`tsx
// app/layout.tsx — required, must include <html> and <body>
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
\`\`\`

### Classic interview gotcha

Because it never remounts, the root layout is a poor place for anything that genuinely needs to run once per navigation — but it's also the **one place an uncaught error has no \`error.js\` above it to catch it**, since there's no parent segment to place one in. This is precisely why the root layout is conventionally kept minimal and low-risk: the blast radius of a thrown error there is the entire app falling back to Next.js's own generic error page, with no custom recovery UI possible at that level.

**Related:** [What is the _app.js equivalent in App Router?](/interview-prep/ff-nextjs/app-js-equivalent-in-app-router) · [What is a nested layout and how does it improve performance?](/interview-prep/ff-nextjs/nested-layout-and-performance)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 87,
  },
  {
    collection: "ff-nextjs",
    slug: "nested-layout-and-performance",
    question: "What is a nested layout and how does it improve performance?",
    answer: `A layout can be defined at any nested route segment, not just the root — \`app/dashboard/layout.tsx\` wraps only \`/dashboard\` and everything beneath it, not the whole app. The performance benefit comes from what **doesn't** re-render: navigating between \`/dashboard/settings\` and \`/dashboard/billing\` re-renders only the changed leaf content, while every layout shared by both routes — root layout, dashboard layout — stays mounted, keeping its state and skipping unnecessary re-renders entirely.

\`\`\`
app/
├── layout.tsx              # persists across the entire app
└── dashboard/
    ├── layout.tsx           # persists across all of /dashboard/*
    ├── settings/page.tsx
    └── billing/page.tsx     # only this leaf changes navigating settings → billing
\`\`\`

### Classic interview gotcha

This persistence is exactly why a component that genuinely needs to reset on every navigation into a section (an enter animation, for instance) **can't** live in a nested layout at all — that's precisely the case \`template.js\` exists to solve instead, since a layout by definition avoids re-mounting, and fighting that behavior with a key-reset trick undoes the performance benefit nested layouts are designed to provide in the first place.

**Related:** [What is the layout.js file in App Router?](/interview-prep/ff-nextjs/layoutjs-file-in-app-router) · [What is the template.js file?](/interview-prep/ff-nextjs/templatejs-file-explained)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 88,
  },
  {
    collection: "ff-nextjs",
    slug: "measuring-core-web-vitals-in-nextjs",
    question: "How do you measure Core Web Vitals in Next.js?",
    answer: `Next.js ships a built-in \`useReportWebVitals\` hook that fires a callback with each Core Web Vitals metric (LCP, CLS, INP, and others) as the browser reports them — letting a project send that data to any analytics endpoint of its choice, with no separate instrumentation library required for the measurement itself.

\`\`\`tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric); // { name: 'LCP', value: 2400, id: '...' }
    sendToAnalytics(metric); // ship it wherever you actually track metrics
  });
  return null;
}
\`\`\`

### Classic interview gotcha

\`useReportWebVitals\` reports **real, field data from actual visitors' browsers** (each real user's real device and network conditions) — it is not a substitute for lab-based testing tools like Lighthouse, which measure a single, controlled, simulated run. Citing only one of the two (usually Lighthouse) as "how we measure Core Web Vitals" misses that field data from real users is what search engines and Core Web Vitals scoring actually weigh most heavily, precisely because lab conditions can't capture the full range of real-world device/network variability.

**Sources checked:** nextjs.org/docs/app/api-reference/functions/use-report-web-vitals`,
    difficulty: "hard",
    companies: ["Vercel", "Google"],
    orderIndex: 89,
  },
  {
    collection: "ff-nextjs",
    slug: "what-is-next-analytics",
    question: "What is next/analytics?",
    answer: `**There is no official \`next/analytics\` package or import path** — this is worth stating directly and precisely rather than guessing at what it might be, since inventing a plausible-sounding answer for a package that doesn't exist is a worse outcome than saying so. What Next.js and Vercel actually provide is a small family of distinct, real tools that this question is likely probing for: the built-in \`next/web-vitals\` (\`useReportWebVitals\`) for Core Web Vitals reporting, the separate \`@vercel/analytics\` package (imported from \`'@vercel/analytics/next'\`) for Vercel's own page-view/visitor analytics product, and \`@next/third-parties\` for optimized loading of third-party scripts like Google Analytics.

\`\`\`tsx
// The real, separate packages this question is probably pointing at:
import { Analytics } from "@vercel/analytics/next";        // Vercel Web Analytics
import { GoogleAnalytics } from "@next/third-parties/google"; // Google Analytics, optimized loading
import { useReportWebVitals } from "next/web-vitals";       // Core Web Vitals, built into Next.js itself
\`\`\`

### Classic interview gotcha

Confidently describing a specific, detailed API for a package that doesn't actually exist is a worse answer than admitting uncertainty — this question is a useful, deliberate check for exactly that instinct. The precise, correct answer names the real, existing alternatives rather than fabricating plausible-sounding behavior for \`next/analytics\` itself.

**Sources checked:** nextjs.org/docs/app/guides/analytics, vercel.com/docs/analytics/package (no official next/analytics package exists)`,
    difficulty: "medium",
    companies: ["Vercel"],
    orderIndex: 90,
  },
  {
    collection: "ff-nextjs",
    slug: "nextjs-14-vs-13-changes",
    question: "What changed in Next.js 14 vs 13?",
    answer: `Next.js 13 introduced the App Router itself, but as experimental — Server Actions, in particular, required manually enabling \`experimental.serverActions\` in \`next.config.js\`. **Next.js 14's headline change was stabilizing what 13 shipped experimentally**: Server Actions became stable with zero config flags needed, and Next.js upgraded to a React canary release that included them as a first-class, non-experimental feature.

| | Next.js 13 | Next.js 14 |
|---|---|---|
| App Router | Introduced (usable, still maturing) | Same directory structure, more stable |
| Server Actions | Experimental, required a config flag | Stable, no flag needed |
| Turbopack (dev) | Early alpha | Improved, still opt-in |

### Classic interview gotcha

A common imprecise answer treats 13→14 as "the version that introduced the App Router" — that's actually 13's headline feature. 14's real, specific contribution was **stabilizing** the App Router's rough experimental edges (most concretely, Server Actions), not introducing the App Router paradigm itself. Getting this order backwards is an easy, checkable sign of not having the actual version history straight.

**Related:** [What is new in Next.js 15?](/interview-prep/ff-nextjs/whats-new-in-nextjs-15)

**Sources checked:** nextjs.org/blog/next-14 (Server Actions stable, no config flag needed)`,
    difficulty: "hard",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 91,
  },
  {
    collection: "ff-nextjs",
    slug: "whats-new-in-nextjs-15",
    question: "What is new in Next.js 15?",
    answer: `Next.js 15's most consequential change was making the request-time dynamic APIs — \`params\`, \`searchParams\`, \`cookies()\`, \`headers()\` — **asynchronous**, requiring \`await\` (or \`use()\` in Client Components) everywhere they're read; a codemod (\`next-async-request-api\`) exists specifically to automate this migration. It also flipped \`fetch()\`'s default from cached to \`no-store\`, added stable Turbopack for \`next dev\`, and added full React 19 support.

\`\`\`tsx
// Next.js 14 and earlier — params was a plain object
function Page({ params }) { const { slug } = params; }

// Next.js 15+ — params is a Promise, must be awaited
async function Page({ params }) { const { slug } = await params; }
\`\`\`

### Classic interview gotcha

The \`fetch()\` default-caching flip is easy to get backwards in conversation — Next.js 15 changed the default **from** cached (\`force-cache\`) **to** uncached (\`no-store\`), the opposite direction of what some assume "moving toward more caching" would mean. Stating the direction of this change incorrectly is a common, checkable interview mistake, especially since it directly contradicts how earlier Next.js versions behaved by default.

**Related:** [What changed in Next.js 14 vs 13?](/interview-prep/ff-nextjs/nextjs-14-vs-13-changes) · [What is the fetch() caching behavior in Next.js App Router?](/interview-prep/ff-nextjs/fetch-caching-behavior-in-nextjs)

**Sources checked:** nextjs.org/blog/next-15, nextjs.org/docs/app/guides/upgrading/version-15 (async dynamic APIs, fetch default flipped to no-store)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 92,
  },
  {
    collection: "ff-nextjs",
    slug: "use-of-generatestaticparams",
    question: "What is the use of generateStaticParams?",
    answer: `\`generateStaticParams\` is the App Router's direct replacement for the Pages Router's \`getStaticPaths\` — exported from a dynamic route segment, it returns an array declaring exactly which values of that segment should be pre-rendered at build time, with any value not in that list either 404ing or being rendered (and cached) on first request, depending on \`dynamicParams\`.

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug })); // pre-rendered at build time
}

export const dynamicParams = true; // default: unlisted slugs still render (and cache) on demand

async function Post({ params }) {
  const { slug } = await params;
  return <article>{(await getPost(slug)).title}</article>;
}
\`\`\`

### Classic interview gotcha

Unlike \`getStaticPaths\`'s explicit three-way \`fallback\` option (\`false\`/\`true\`/\`"blocking"\`), \`generateStaticParams\`'s equivalent behavior is controlled by the separate \`dynamicParams\` export, and its **default is \`true\`** — meaning any slug not returned by \`generateStaticParams\` still renders successfully (and gets cached after) rather than 404ing, unless \`dynamicParams = false\` is explicitly set. Assuming an omitted slug 404s by default, carrying over the old Pages Router mental model, is a common, incorrect assumption about the App Router's actual default.

**Related:** [What is getStaticPaths?](/interview-prep/ff-nextjs/getstaticpaths-explained)

**Sources checked:** nextjs.org/docs/app/api-reference/functions/generate-static-params (dynamicParams defaults to true)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 93,
  },
  {
    collection: "ff-nextjs",
    slug: "caching-database-queries-in-nextjs",
    question: "How do you cache database queries in Next.js?",
    answer: `A direct database call (not a \`fetch\`) isn't covered by Next.js's \`fetch\`-patching cache automatically — it needs an explicit caching layer: React's \`cache()\` for per-request deduplication only, or the \`"use cache"\` directive (Next.js 16+, replacing the older \`unstable_cache\`) for genuine cross-request caching with a lifetime and invalidation tags.

\`\`\`ts
// Per-request dedup only — resets on the next request
import { cache } from "react";
const getUser = cache((id: string) => db.users.findById(id));

// Genuine cross-request caching (Next.js 16+)
async function getUser(id: string) {
  "use cache";
  cacheTag(\`user-\${id}\`);
  cacheLife("hours");
  return db.users.findById(id);
}
\`\`\`

### Classic interview gotcha

React's \`cache()\` alone is frequently mistaken for a real caching solution when it only deduplicates identical calls **within the same request** — it provides zero cross-request caching or invalidation on its own. Genuinely reducing database load across many separate users' requests requires \`"use cache"\` (or its predecessor \`unstable_cache\`), not \`cache()\`; conflating the two is a common, real misunderstanding with actual performance consequences if shipped as-is.

**Related:** [What are React cache() and use() in the Next.js context?](/interview-prep/ff-nextjs/react-cache-and-use-in-nextjs-context) · [What is unstable_cache in Next.js?](/interview-prep/ff-nextjs/unstable-cache-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 94,
  },
  {
    collection: "ff-nextjs",
    slug: "draftmode-api-in-nextjs",
    question: "What is the draftMode() API in Next.js?",
    answer: `\`draftMode()\` lets an editor preview unpublished content from a headless CMS by bypassing Next.js's caching for their session specifically — calling \`draftMode().enable()\` in a Route Handler sets a signed, \`HttpOnly\` cookie; while that cookie is present, \`fetch\` calls skip the cache entirely and hit the CMS for the live draft, without affecting what any other visitor sees.

\`\`\`ts
// app/api/draft/route.ts — a CMS webhook hits this to enter draft mode
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  (await draftMode()).enable();
  return Response.redirect(new URL("/posts/preview-slug", request.url));
}
\`\`\`

### Classic interview gotcha

Calling \`draftMode().enable()\`/\`.disable()\` **throws if the Route Handler runs on the Edge Runtime** — Draft Mode depends on the full \`cookies()\` API's signing/verification mechanism, which the Edge Runtime's restricted surface doesn't fully support. A common, confusing first-time bug is a preview route working fine locally, then failing specifically when that one Route Handler is deployed with \`runtime: 'edge'\`.

**Sources checked:** nextjs.org/docs/app/guides/draft-mode, nextjs.org/docs/app/api-reference/functions/draft-mode (draftMode throws on the Edge Runtime)`,
    difficulty: "hard",
    companies: ["Vercel", "Contentful"],
    orderIndex: 95,
  },
  {
    collection: "ff-nextjs",
    slug: "rate-limiting-in-nextjs-middleware",
    question: "How do you implement rate limiting in Next.js middleware?",
    answer: `Rate limiting checks a request's identity (IP address, a user/session ID) against a shared counter — typically backed by an HTTP-based Redis service like Upstash, since a serverless/edge-adjacent environment has no reliable in-memory state shared across instances — and rejects the request with a 429 before it reaches any route, in \`proxy.ts\` (or \`middleware.ts\`).

\`\`\`ts
// proxy.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "60 s") });

export async function proxy(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });
}
\`\`\`

### Classic interview gotcha

An in-memory counter (a plain JavaScript \`Map\`) does **not** work correctly for rate limiting in this context, even though it looks fine in local development — a serverless/multi-instance deployment runs many separate instances of the same code, each with its own isolated memory, so an in-memory count resets per-instance and never reflects the true global request count for a given IP. This is precisely why an external, shared store (Redis) is required, not just a convenient implementation detail — it's the actual correctness requirement.

**Related:** [What is middleware in Next.js?](/interview-prep/ff-nextjs/middleware-in-nextjs)`,
    difficulty: "hard",
    companies: ["Vercel", "Cloudflare"],
    orderIndex: 96,
  },
  {
    collection: "ff-nextjs",
    slug: "forbidden-and-unauthorized-response-in-nextjs-15",
    question: "What is the forbidden() and unauthorized() response in Next.js 15?",
    answer: `\`forbidden()\` and \`unauthorized()\` (from \`next/navigation\`) are **experimental** APIs, gated behind \`experimental.authInterrupts\` in \`next.config.js\`, that let a Server Component, Server Action, or Route Handler throw a semantic 403 or 401 directly — rendering a custom \`forbidden.tsx\`/\`unauthorized.tsx\` file, the same pattern as \`notFound()\` and \`not-found.tsx\`, instead of hand-rolling a redirect or a generic thrown error for authorization failures.

\`\`\`ts
// next.config.ts — required, since these are still experimental
const nextConfig = { experimental: { authInterrupts: true } };
\`\`\`

\`\`\`tsx
import { forbidden, unauthorized } from "next/navigation";

async function AdminPage() {
  const session = await getSession();
  if (!session) unauthorized();           // renders unauthorized.tsx, HTTP 401
  if (session.role !== "admin") forbidden(); // renders forbidden.tsx, HTTP 403
  return <AdminDashboard />;
}
\`\`\`

### Classic interview gotcha

These aren't stable APIs to build a production authorization system entirely around yet — they're explicitly experimental as of Next.js 15.1, gated behind a flag specifically because the team has stated more capabilities and refinements are still planned before stabilization. Presenting them as a fully finalized, production-ready authorization primitive overstates their actual 2026 status; the accurate framing is "a promising, real, but still-experimental convenience API," not an established standard.

**Sources checked:** nextjs.org/docs/app/api-reference/functions/forbidden, nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts (experimental as of Next.js 15.1)`,
    difficulty: "hard",
    companies: ["Vercel", "Auth0"],
    orderIndex: 97,
  },
  {
    collection: "ff-nextjs",
    slug: "testing-nextjs-applications",
    question: "How do you test Next.js applications?",
    answer: `Next.js's own docs and 2026 practice split testing into layers: **Vitest** (or Jest) with React Testing Library for unit/component tests of synchronous components, utility functions, and Server Actions treated as plain functions; **Playwright** for end-to-end tests and, critically, anything Vitest genuinely can't cover yet — **async Server Components**, which Vitest does not currently support testing directly.

\`\`\`tsx
// Vitest + RTL — a synchronous Client Component or a Server Action as a plain function
import { render, screen } from "@testing-library/react";
test("renders the like count", () => {
  render(<LikeButton count={5} />);
  expect(screen.getByText("5 likes")).toBeInTheDocument();
});
\`\`\`

\`\`\`ts
// Playwright — for async Server Components and full auth flows, end-to-end
import { test, expect } from "@playwright/test";
test("dashboard loads for a logged-in user", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
\`\`\`

### Classic interview gotcha

Attempting to unit-test an **async Server Component** directly with Vitest/RTL the same way you'd test a Client Component is a real, current limitation, not a configuration mistake to be debugged away — async Server Components genuinely aren't supported by Vitest's rendering model yet, which is precisely why the recommended pattern routes that specific case to Playwright's full end-to-end rendering instead of trying to force a unit-test-level solution that doesn't exist yet.

**Related:** [What is Playwright vs Cypress for Next.js E2E tests?](/interview-prep/ff-nextjs/playwright-vs-cypress-for-nextjs-e2e)

**Sources checked:** nextjs.org/docs/app/guides/testing (Vitest does not currently support testing async Server Components directly)`,
    difficulty: "hard",
    companies: ["Vercel", "Meta"],
    orderIndex: 98,
  },
  {
    collection: "ff-nextjs",
    slug: "playwright-vs-cypress-for-nextjs-e2e",
    question: "What is Playwright vs Cypress for Next.js E2E tests?",
    answer: `Both are real, capable end-to-end testing tools; **as of 2026, Playwright is the more common default recommendation for new Next.js projects** — native multi-tab/multi-origin support (useful for OAuth/SSO redirect flows), free built-in parallelization/sharding with no paid tier required, and multi-browser-engine coverage. Cypress's strength remains its interactive time-travel debugger, which many teams still find the more pleasant day-to-day local debugging experience.

| | Playwright | Cypress |
|---|---|---|
| Multi-tab / multi-origin (SSO flows) | Yes, natively | Limited |
| Parallelization | Free, built-in | Requires paid Cypress Cloud at scale |
| Browser engines | Chromium, Firefox, WebKit | Primarily Chromium-based |
| Local debugging experience | Trace Viewer | Time-travel debugger (often considered more approachable) |

### Classic interview gotcha

The deciding factor for a Next.js project specifically is often **authentication flow complexity**, not a general preference — an app using an external OAuth provider (Google/GitHub login, involving real cross-origin redirects) is measurably harder to test reliably in Cypress's single-origin-oriented model than in Playwright's native multi-origin support. Framing the choice as purely "which tool do you personally prefer" skips over this concrete, technical reason Playwright is specifically favored for Next.js apps with real third-party auth.

**Related:** [How do you test Next.js applications?](/interview-prep/ff-nextjs/testing-nextjs-applications)

**Sources checked:** playwright.dev, docs.cypress.io (Playwright's native multi-origin support vs. Cypress's single-origin model)`,
    difficulty: "medium",
    companies: ["Vercel", "Airbnb"],
    orderIndex: 99,
  },
];

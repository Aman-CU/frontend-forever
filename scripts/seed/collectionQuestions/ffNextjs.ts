import type { CollectionQuestionSeed } from "../types";

// 2 of the 6 approved pilot answers (interview-prep-content-guide.md, approved
// 2026-07-14) — the remaining ~97 FF Next.js questions are a separate
// content-authoring pass, tracked in that same file's Status section.
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

**Related:** What is getServerSideProps and when do you use it? · What is getStaticPaths? · What is Incremental Static Regeneration (ISR)? · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — Migrating to App Router docs, Next.js — getStaticProps docs`,
    difficulty: "medium",
    companies: ["Vercel"],
    orderIndex: 1,
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

**Related:** What is getStaticProps and when do you use it? · What is the revalidatePath and revalidateTag function? · What is Partial Prerendering (PPR)? · What is the difference between static and dynamic rendering in Next.js?

**Sources checked:** Next.js — ISR guide, Vercel — ISR docs`,
    difficulty: "hard",
    companies: ["Vercel", "Netflix"],
    orderIndex: 2,
  },
];

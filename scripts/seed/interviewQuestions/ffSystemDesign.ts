import type { InterviewQuestionSeed } from "../types";

export const FF_SYSTEM_DESIGN_QUESTIONS: InterviewQuestionSeed[] = [

  // ff-system-design
  {
    collection: "ff-system-design",
    conceptSlug: "designing-realtime-collaborative-editor",
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
    conceptSlug: "designing-infinite-scroll-feed",
    question: "How would you design an infinite-scroll news feed?",
    answer:
      "**Requirements:** fast initial load, smooth scrolling, fresh content, back-navigation restores position.\n\n**API design:** cursor-based pagination (not offset) — `GET /feed?after=<cursor>&limit=20`. Cursor is an opaque server token (e.g. encoded timestamp + id) that's stable even if new posts are inserted.\n\n**Client:**\n- Fetch the first page on load; fetch the next page when the user scrolls near the bottom (IntersectionObserver on a sentinel element)\n- Cache pages in memory (React Query, SWR) — don't refetch on back-navigation\n- Virtualise the list with a library like `react-window` if posts are numerous\n- Store scroll position + cursor in session storage so the browser's back button restores the position\n\n**Freshness:** Poll for new items at the top at a low frequency (30s) without resetting the cursor; surface a 'X new posts' banner rather than auto-inserting and shifting the user's reading position.\n\n**CDN:** Edge-cache feed responses for a short TTL (5–30s) to reduce origin load.",
    difficulty: "medium",
    companies: ["Meta", "Twitter", "LinkedIn"],
    orderIndex: 2,
  },

  {
    collection: "ff-system-design",
    conceptSlug: "state-management-at-scale",
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
    conceptSlug: "component-driven-architecture",
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

  // Left unlinked deliberately (Feature 48): this question is a Performance topic
  // (TTFB/LCP), not a System Design one — none of the 7 system-design concepts
  // are a real fit for it, and Performance's own Feature 47 didn't cover it either
  // since it lives in this collection, not ff-75. Noted rather than force-linked.
  {
    collection: "ff-system-design",
    conceptSlug: "api-design-data-fetching-strategy",
    question: "How would you decide between REST and GraphQL when designing a new API?",
    answer:
      "**Start from the client's actual access pattern, not a default preference.**\n\n**REST fits when:**\n- Resources map cleanly to URLs and CRUD operations\n- HTTP/CDN-level caching by URL is valuable (public, mostly-static resources)\n- Multiple independent client teams need a stable, documented contract they don't control the evolution of\n\n**GraphQL fits when:**\n- Clients have very different data needs from the same resources (a mobile app wanting a thin payload, a dashboard wanting a deep nested one) — one query shape per client instead of new REST endpoints per shape\n- Reducing round trips matters (one GraphQL query replaces several REST calls for related resources)\n- The frontend and backend teams evolve together, since the schema is the contract\n\n**What GraphQL costs:** the server does more work resolving arbitrary queries (N+1 query risk without a dataloader/batching layer), URL-based HTTP caching mostly disappears (client-side caching, keyed by query+variables, has to pick up the slack), and query complexity itself needs guarding against (depth limiting, query cost analysis) to stop a client from requesting something disproportionately expensive.\n\n**In practice:** a public API with many external, uncoordinated consumers leans REST; an internal API serving several first-party clients with divergent data needs leans GraphQL. Neither is a strictly superior default.",
    difficulty: "hard",
    companies: ["Meta", "GitHub", "Shopify"],
    isPremium: true,
    orderIndex: 6,
  },

  {
    collection: "ff-system-design",
    conceptSlug: "designing-real-time-updates",
    question: "How would you design a live sports score update feature — polling, SSE, or WebSockets?",
    answer:
      "**First question: does the client ever send data back over the same channel?** No — scores only flow server-to-client. That rules out needing a WebSocket's bidirectional complexity by default.\n\n**Between SSE and polling:**\n- Update frequency during a live game is high enough (every few seconds) that polling would mean frequent wasted requests when nothing's changed between polls\n- SSE (`EventSource`) keeps one connection open, built on plain HTTP — works through standard proxies/load balancers, reconnects automatically on drop, and the server only sends a message when a score actually changes\n\n**Architecture:**\n1. A score-change event publishes to a pub/sub channel (Redis/Kafka) keyed by game id\n2. Each server holding open SSE connections for that game subscribes and forwards the event to its connected clients\n3. Client falls back to a single poll on reconnect to catch anything missed while disconnected\n\n**Why not WebSockets here:** they'd work, but the operational cost (heartbeats, backpressure, WebSocket-aware load balancing) buys nothing this feature actually uses, since the client never talks back over that channel.\n\n**When it would change:** if the feature grew to include live chat or reactions alongside the score feed, that bidirectional need would justify a WebSocket for that part of the connection.",
    difficulty: "medium",
    companies: ["ESPN", "Amazon", "Google"],
    isPremium: true,
    orderIndex: 7,
  },

  {
    collection: "ff-system-design",
    conceptSlug: "frontend-architecture-patterns",
    question: "How would you decide between a monorepo and micro-frontends for a growing frontend organization?",
    answer:
      "**These answer different questions — check which one is actually blocking the team first.**\n\n**A monorepo solves a code-organization problem:** shared tooling, atomic cross-package commits, unified dependency versions. It says nothing about deployment — a monorepo can still ship one single deployed app.\n\n**Micro-frontends solve a deployment-independence problem:** separate teams shipping on separate schedules without waiting on a shared release train. This is a runtime-composition decision, independent of which repository the code lives in.\n\n**Decision path:**\n1. Is the actual pain point 'our shared tooling/dependency versions are inconsistent and PRs conflict across teams'? → a monorepo (Turborepo/Nx) solves this without touching how the app is deployed.\n2. Is the actual pain point 'team A can't ship without team B's approval/release cycle'? → that's a deployment bottleneck a monorepo alone doesn't fix — micro-frontends (Module Federation, or server-side composition) address it directly.\n3. Is the org small enough that no team is genuinely blocked by another's release cadence? → neither pattern is worth its overhead yet; a single well-organized app is simpler.\n\n**The real cost of getting it wrong:** adopting micro-frontends for a 'big codebase' rather than a genuine deploy-independence need trades a solved problem (code organization) for a harder one (shared dependency versions, design consistency, and composition across teams that no longer share a single build).",
    difficulty: "hard",
    companies: ["Spotify", "Zalando", "Microsoft"],
    isPremium: true,
    orderIndex: 8,
  }
];

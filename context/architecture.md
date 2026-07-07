# Architecture

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack, SSR, RSC, API routes, static generation |
| Language | TypeScript (strict mode) | Throughout — no `any`, no implicit types |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility classes + accessible UI primitives |
| Animation | Framer Motion | Simulator animations, page transitions, motion design |
| Database + Storage | Supabase (Postgres) | Hosted Postgres, file storage. **No longer used for Auth** — accessed via a direct Postgres connection (see DB Client Pattern below), not the `supabase-js`/PostgREST client |
| Auth | Better-Auth | Self-hosted auth — full control over session/JWT, no vendor lock-in for auth specifically. Google/GitHub OAuth only, same as before |
| Rate Limiting | Upstash Redis | API route protection — active from day one |
| Content | MDX (in-repo files) | Concept guides, statically generated at build time |
| Code Editor | Monaco Editor | Practice section + Build tab |
| Hosting | Vercel | Edge deployment, preview environments, CDN |
| Payments | Stripe | Premium subscriptions (Phase 9 — not yet implemented) |

---

## Folder Structure

```
/
├── AGENTS.md                            ← Skills and instructions for AI agents
├── context/                             ← All project context files live here
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── content/
│   └── concepts/                        ← MDX files, one per concept
│       ├── javascript-runtime/
│       │   ├── event-loop.mdx
│       │   ├── closures.mdx
│       │   ├── hoisting.mdx
│       │   ├── scope-and-context.mdx
│       │   ├── call-stack.mdx
│       │   ├── promises.mdx
│       │   ├── async-await.mdx
│       │   └── generators.mdx
│       ├── browser-internals/
│       ├── react/
│       ├── css/
│       ├── typescript/
│       ├── accessibility/
│       ├── performance/
│       └── system-design/
├── src/
│   ├── app/                             ← Next.js routes ONLY — no business logic here
│   │   ├── layout.tsx                   ← Root layout, theme provider, fonts
│   │   ├── page.tsx                     ← Homepage
│   │   ├── (auth)/
│   │   │   └── login/page.tsx           ← No callback page — Better-Auth's catch-all route handles the OAuth redirect
│   │   ├── explore/page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx                 ← Learn index (all categories)
│   │   │   └── [category]/
│   │   │       └── [slug]/page.tsx      ← Concept page
│   │   ├── practice/
│   │   │   ├── page.tsx                 ← Challenges list
│   │   │   └── [slug]/page.tsx          ← Individual challenge
│   │   ├── roadmaps/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── interview-prep/
│   │   │   ├── page.tsx
│   │   │   └── [collection]/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts   ← Better-Auth's Next.js catch-all handler (sign-in, callback, sign-out, session — all of it)
│   │       ├── progress/
│   │       │   └── route.ts             ← Progress write endpoint (rate limited)
│   │       └── interview-rating/
│   │           └── route.ts             ← Per-question Interview tab rating upsert into user_interview_reviews (rate limited) — Feature 27 follow-up
│   │
│   ├── features/                        ← Feature modules — self-contained
│   │   ├── simulators/
│   │   │   ├── event-loop/
│   │   │   │   ├── components/          ← EventLoopSimulator, CallStack, MicrotaskQueue, etc.
│   │   │   │   ├── hooks/               ← useEventLoopSimulator
│   │   │   │   ├── data/                ← Step scripts (scenario JSON)
│   │   │   │   └── types.ts
│   │   │   ├── react-rendering/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── data/
│   │   │   │   └── types.ts
│   │   │   ├── browser-pipeline/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── data/
│   │   │   │   └── types.ts
│   │   │   └── css-specificity/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── data/
│   │   │       └── types.ts
│   │   ├── learn/
│   │   │   ├── components/              ← ConceptTabs, UnderstandTab, InterviewTab, BuildTab
│   │   │   └── hooks/                   ← useConceptProgress
│   │   ├── practice/
│   │   │   ├── components/              ← HintsPanel, SolutionPanel, ChallengePrompt, etc.
│   │   │   └── sandbox/                 ← Practice-only content (testSpecs, live-playground drivers) — the run engine itself lives in lib/sandbox + hooks/ (see below)
│   │   ├── build/
│   │   │   ├── components/              ← BuildStates, MarkBuildCompleteButton
│   │   │   └── data/                    ← testSpecs (per-project-brief executable assertions)
│   │   ├── interview-prep/
│   │   │   ├── components/              ← QuestionCard, ReviewSession, CollectionList
│   │   │   ├── hooks/                   ← useSpacedRepetition
│   │   │   └── spaced-repetition/       ← SM-2 algorithm implementation
│   │   ├── explore/
│   │   │   └── components/
│   │   ├── roadmaps/
│   │   │   └── components/
│   │   ├── leaderboard/
│   │   │   └── components/
│   │   └── auth/
│   │       └── components/              ← LoginButton, OAuthButton (call authClient.signIn.social(...))
│   │
│   ├── components/                      ← Truly shared UI — used across multiple features
│   │   ├── ui/                          ← shadcn/ui components (never modify these directly)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx               ← Logged-out variant
│   │   │   ├── AppNavbar.tsx            ← Logged-in variant (Feature 17) — real streak/XP as of Feature 27, orchestration only post-split
│   │   │   ├── AppNavbarStats.tsx       ← The XP+streak pair, shared by AppNavbar's desktop + mobile clusters — split out of AppNavbar.tsx in a Feature 27 /review follow-up (200-line file limit)
│   │   │   ├── AppNavLinks.tsx          ← AppNavLink/AppMobileNavLink — same split as above
│   │   │   ├── Footer.tsx
│   │   │   └── LearnSidebar.tsx
│   │   └── shared/
│   │       ├── ConceptCard.tsx
│   │       ├── DifficultyBadge.tsx
│   │       ├── ProgressRing.tsx
│   │       ├── XPBadge.tsx
│   │       ├── PremiumBadge.tsx
│   │       ├── ThemeToggle.tsx
│   │       ├── CodeEditor.tsx           ← Monaco wrapper — promoted from features/practice/ in Feature 26, shared by Challenge + Build tabs
│   │       └── TestResultsPanel.tsx     ← same promotion, same two consumers
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── server.ts                ← betterAuth() instance — Postgres adapter, Google/GitHub social providers, session config, databaseHooks
│   │   │   └── client.ts                ← createAuthClient() — browser React client ("use client"; signIn.social, signOut, useSession)
│   │   ├── db.ts                        ← Shared Drizzle instance (over a `pg` Pool) — direct Postgres access for both Better-Auth's adapter and app queries
│   │   ├── dbErrors.ts                  ← getPostgresErrorCode(error) — safe-to-log Postgres error code extraction (never logs the raw error, which can embed a full insert payload — see lib/auth/provisionProfile.ts); added Feature 27 /review follow-up, used by api/progress and api/interview-rating
│   │   ├── profile.ts                   ← getProfileSummary(userId) — { xp, streakCurrent }, cache()-wrapped; feeds AppNavbar's real streak/XP (Feature 27)
│   │   ├── env.ts                       ← Typed env var wrapper (`import "server-only"` — prevents accidental client-bundle inclusion)
│   │   ├── schema/                      ← Drizzle table definitions (app tables + Better-Auth's generated user/session/account/verification tables)
│   │   ├── sandbox/                     ← Browser code-execution engine (runInSandbox, buildSandboxDoc, types) — promoted from features/practice/ in Feature 26 so features/build can use it too (features never import features)
│   │   ├── progress/
│   │   │   └── applyProgressUpdate.ts   ← Feature 27: the transactional progress/XP/streak write, called by api/progress/route.ts inside db.transaction() — split out of the route so it stays under the 200-line file limit and is directly testable
│   │   ├── upstash.ts                   ← Upstash Redis rate limiter
│   │   ├── mdx.ts                       ← MDX parsing and rendering utilities
│   │   └── utils.ts                     ← cn(), formatXP(), etc.
│   │
│   ├── hooks/                           ← Global hooks (used across features)
│   │   ├── useUser.ts                   ← Current authenticated user (wraps authClient.useSession())
│   │   ├── useTheme.ts                  ← Light/dark theme
│   │   ├── useSandbox.ts                ← React wrapper around lib/sandbox's runInSandbox — promoted from features/practice/ in Feature 26
│   │   └── useSearch.ts                 ← Global search (⌘K)
│   │
│   └── types/
│       └── index.ts                     ← Global TypeScript types
│
├── proxy.ts                              ← Auth session guard on protected routes (Next 16 renames middleware.ts → proxy.ts; see Decisions Made in progress-tracker.md)
└── public/
    └── logos/                           ← Company logo SVGs for homepage
```

---

## System Boundaries

| Folder | Owns | Does NOT own |
|---|---|---|
| `app/` | Pages, layouts, API routes | Business logic, DB queries |
| `features/` | Feature-specific components, hooks, data, types | Cross-feature imports |
| `components/` | Shared UI only | Data fetching, DB calls, feature logic |
| `lib/` | Third-party client initialization, utilities | React components, feature logic |
| `hooks/` | Global reusable React hooks | Feature-specific state |
| `types/` | Shared TypeScript types | Runtime logic |
| `content/` | MDX source files | Anything touched at runtime |

---

## Data Flow

### OAuth Authentication

```
User clicks "Continue with Google"
        ↓
authClient.signIn.social({ provider: 'google', callbackURL: '/learn' })
        ↓
Better-Auth redirects to Google OAuth
        ↓
Google redirects to Better-Auth's built-in callback route (/api/auth/callback/google)
        ↓
Better-Auth verifies, creates session + user row (Postgres, direct connection)
        ↓
databaseHooks.user.create.after fires → upserts the matching profiles row
        ↓
Redirect to /learn (no custom callback page involved)
        ↓
proxy.ts checks the session cookie on every protected route (optimistic);
each Server Component / API route calls auth.api.getSession() for real verification
```

### Progress Tracking

```
User completes a concept tab (e.g. Simulate)
        ↓
Feature hook calls POST /api/progress
        ↓
Rate limiter (Upstash) checks request
        ↓
db.transaction() wraps everything below — all-or-nothing (Feature 27,
the first transaction in the codebase; see lib/progress/applyProgressUpdate.ts)
        ↓
user_concept_progress row locked (SELECT ... FOR UPDATE), scoped to session.user.id
        ↓
Tab's completion flag upserted; XP event written to xp_events ONLY if that
flag was false→true (idempotent — repeat completions award nothing)
        ↓
If all 5 tab flags are now true and weren't before: fully_completed set,
completed_at stamped, a +50 XP concept_completed bonus event written
        ↓
profiles row locked (SELECT ... FOR UPDATE); if streak_last_activity isn't
today (UTC): streak_current incremented (or reset to 1 after a gap),
streak_longest updated, a +5 XP streak_bonus event written — at most once
per UTC calendar day regardless of how many tabs are completed that day
        ↓
profiles.xp incremented by the total XP awarded this request
```

### MDX Content (Static Generation)

```
Build time:
  content/concepts/**/*.mdx
        ↓
  generateStaticParams() enumerates all concept slugs
        ↓
  Each concept page pre-rendered to static HTML
        ↓
  Zero DB queries for content at runtime

Runtime:
  /learn/[category]/[slug]
        ↓
  Serves pre-built static page instantly (CDN-cached)
        ↓
  Client hydrates for interactive tabs and progress
```

### Simulator (Fully Client-Side)

```
User visits Simulate tab
        ↓
Self-contained simulator component mounts
        ↓
Local state machine loads pre-scripted step data
        ↓
User controls: Play / Step / Step Back / Restart / Autoplay / Speed
        ↓
Framer Motion animates each state transition
        ↓
Zero network requests — fully offline capable
```

### Spaced Repetition (Interview Prep)

```
User completes a review session
        ↓
SM-2 algorithm computes new interval + ease factor
        ↓
POST /api/progress writes to user_interview_reviews
        ↓
next_review_at updated
        ↓
Dashboard surfaces due questions on next visit
```

---

## Database Schema (Postgres, hosted on Supabase)

Accessed via a direct Postgres connection (`lib/db.ts`, Drizzle ORM over `pg`), not the `supabase-js`/PostgREST client. Better-Auth owns its own `user` / `session` / `account` / `verification` tables in the same database, in the same Drizzle schema — see Authentication below.

### `profiles`

**Pulled forward from Feature 18 during Feature 16** (Profile Provisioning Hook needed a real table to upsert into — see `progress-tracker.md`). The other 10 app tables are still Feature 18's scope.

| Column | Type | Notes |
|---|---|---|
| id | text (Postgres column type) | References Better-Auth's `user.id`. Despite the logical "uuid" framing elsewhere in this doc, the Postgres column is `text`, not `uuid` — it must match `user.id`'s actual column type (`text`, populated with uuid strings via `advanced.database.generateId`) for the FK to be valid, same pattern as `session.userId`/`account.userId` |
| username | text | Unique, URL-safe slug. OAuth never supplies one — generated on first sign-in by slugifying the OAuth display name, retrying with a random suffix on collision. See `lib/auth/provisionProfile.ts` |
| full_name | text | From OAuth provider |
| email | text | From OAuth provider |
| avatar_url | text | From OAuth or custom upload |
| bio | text | Optional, user-written |
| xp | integer | Total XP earned, default 0 |
| streak_current | integer | Current day streak, default 0 |
| streak_longest | integer | All-time longest streak, default 0 |
| streak_last_activity | date | Last date user completed any activity |
| is_premium | boolean | Premium subscription active, default false |
| premium_expires_at | timestamptz | null if never subscribed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `concepts`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| slug | text | Unique — matches MDX filename and URL segment |
| title | text | Display name (e.g. "Event Loop") |
| description | text | One-line summary shown on cards |
| category | text | javascript-runtime / browser-internals / react / css / typescript / accessibility / performance / system-design |
| difficulty | text | beginner / intermediate / advanced |
| is_premium | boolean | Default false |
| order_index | integer | Display order within category |
| created_at | timestamptz | |

### `user_concept_progress`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | References profiles |
| concept_id | uuid | References concepts |
| understand_completed | boolean | Default false |
| simulate_completed | boolean | Default false |
| challenge_completed | boolean | Default false |
| interview_completed | boolean | Default false |
| build_completed | boolean | Default false |
| fully_completed | boolean | True when all 5 tabs done |
| completed_at | timestamptz | When fully_completed first became true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `xp_events`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | References profiles |
| concept_id | uuid | Nullable |
| challenge_id | uuid | Nullable |
| question_id | uuid | Nullable |
| event_type | text | concept_understand / concept_simulate / concept_challenge / concept_interview / concept_build / concept_completed / challenge_solved / interview_answered / streak_bonus |
| xp_amount | integer | |
| created_at | timestamptz | |

### `challenges`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| concept_id | uuid | References concepts (nullable for standalone) |
| slug | text | Unique |
| title | text | |
| description | text | Markdown |
| difficulty | text | easy / medium / hard |
| starter_code | text | Default editor content |
| solution_code | text | Reference solution (hidden from users) |
| test_cases | jsonb | Array of {input, expected, label} |
| hints | text[] | Progressive hints, ordered |
| is_premium | boolean | Default false |
| order_index | integer | |
| created_at | timestamptz | |

### `user_challenge_submissions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | References profiles |
| challenge_id | uuid | References challenges |
| status | text | passed / failed |
| code | text | Submitted code snapshot |
| submitted_at | timestamptz | |

### `interview_questions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| concept_id | uuid | Nullable — some questions span concepts |
| collection | text | ff-75 / ff-javascript / ff-react / ff-system-design |
| question | text | |
| answer | text | Markdown |
| difficulty | text | easy / medium / hard |
| companies | text[] | Companies known to ask this (e.g. ['Google', 'Meta']) |
| is_premium | boolean | Default false |
| order_index | integer | |
| created_at | timestamptz | |

### `project_briefs`

**Build tab content (Feature 26).** Unlike `challenges` (nullable `concept_id`, some standalone), a project brief is always concept-linked. No `hints`/`difficulty` columns — the Build tab has no Hints panel and no difficulty badge of its own (see `build-plan.md`'s Feature 26 spec; the concept's own difficulty already shows in the page header). `solution_code` was dropped for the same reason at first, then added back in a same-feature follow-up on explicit user request (someone stuck on the project needs somewhere to find the answer) — migration `0007_common_anthem`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| concept_id | uuid | References concepts — **not nullable**, always concept-linked |
| slug | text | Unique |
| title | text | |
| description | text | Markdown |
| starter_code | text | Default editor content |
| solution_code | text | Reference solution — unlike `challenges.solution_code`, never attempt-gated (Build has no attempt-tracking concept); still redacted server-side when the project is premium-locked |
| test_cases | jsonb | Array of `{input, expected, label}` — informational only, never gates "Mark Build Complete" |
| is_premium | boolean | Default false |
| order_index | integer | |
| created_at | timestamptz | |

### `user_interview_reviews` (spaced repetition — SM-2)

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | References profiles |
| question_id | uuid | References interview_questions |
| ease_factor | float | SM-2 ease factor, default 2.5 |
| interval_days | integer | Days until next review, default 1 |
| repetitions | integer | Total times reviewed, default 0 |
| quality | integer | Last quality rating 0–5 |
| next_review_at | timestamptz | |
| last_reviewed_at | timestamptz | |

### `roadmaps`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| slug | text | Unique |
| title | text | e.g. "React Expert Path" |
| description | text | |
| is_premium | boolean | Default false |
| order_index | integer | |

### `roadmap_steps`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| roadmap_id | uuid | References roadmaps |
| concept_id | uuid | References concepts |
| order_index | integer | Step number in the path |
| is_optional | boolean | Default false |

### `bookmarks`

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | References profiles |
| concept_id | uuid | Nullable |
| question_id | uuid | Nullable |
| challenge_id | uuid | Nullable |
| created_at | timestamptz | |

---

## Authorization Model (RLS enabled, but not the app's boundary — enforced in application code)

**This is a deliberate change from the original Supabase-Auth design.** RLS policies like `USING (user_id = auth.uid())` only work when queries go through Supabase's PostgREST layer with a Supabase-issued JWT. Better-Auth doesn't issue Supabase-compatible JWTs, and app data is now queried via a direct Postgres connection (`lib/db.ts`) using a single privileged connection string — there is no per-request Supabase JWT for `auth.uid()` to read, and a direct connection using a role with `BYPASSRLS` (the default for Supabase's `postgres` role, which `DATABASE_URL` connects as) skips RLS entirely regardless of what policies exist.

Consequences:
- RLS is **not** the app's authorization boundary. Every query against a user-owned table must filter `WHERE user_id = session.user.id` in application code — this is the *only* line of defense the app itself has, since its connection bypasses RLS outright.
- `DATABASE_URL` is as sensitive as the old `SUPABASE_SERVICE_ROLE_KEY` was — it has full table access with no policy layer underneath it (from the app's point of view). Treat it with the same care (server-only, never in client code, never logged).
- **Every table has RLS enabled with zero policies** (`.enableRLS()` in every `src/lib/schema/*.ts` table definition — see `security.md`'s RLS section for the incident that prompted this). This is unrelated to the app's own authorization: it exists solely to block Supabase's auto-generated PostgREST API (which runs over the `public` schema independently of anything the app does) from serving these tables to the `anon`/`authenticated` roles. RLS-enabled-with-no-policies means Postgres denies all access by default to any role without `BYPASSRLS` — exactly what's needed here, since the app's own role bypasses it and PostgREST's roles don't.

Never query any user-owned table without an explicit `user_id` filter in the query itself.

---

## Authentication

- Provider: Better-Auth (self-hosted, direct Postgres connection — see `lib/auth/server.ts`)
- Methods: Google OAuth, GitHub OAuth — no email/password
- Protected routes: `/learn/**`, `/practice/**`, `/interview-prep/**`, `/leaderboard`, `/settings`
- Public routes: `/`, `/login`, `/explore`, `/roadmaps`, `/roadmaps/[slug]`
- `proxy.ts` (Next 16's renamed `middleware.ts`) does an optimistic session-cookie check on every request to a protected route via Better-Auth's `getSessionCookie()` helper — cookie presence only, not full verification
- Every protected Server Component / API route additionally calls `auth.api.getSession()` for real, server-verified session validation — the proxy redirect is UX, not the security boundary (same principle the old Supabase setup already documented: middleware/proxy alone is never sufficient)
- After login → redirect to `/learn`

---

## Auth + DB Client Patterns

Two separate concerns, two separate clients — never mix them:

```typescript
// lib/auth/server.ts — the Better-Auth instance, server-side only
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
    github: {
      clientId: env.githubClientId,
      clientSecret: env.githubClientSecret,
    },
  },
  advanced: {
    database: { generateId: () => crypto.randomUUID() }, // keep ids uuid, consistent with the rest of the schema
  },
  databaseHooks: {
    user: {
      create: {
        // Real implementation in lib/auth/provisionProfile.ts (Feature 16) —
        // try/catch'd here so a profile-write failure never blocks sign-in.
        after: async (user) => {
          try {
            await provisionProfile(user)
          } catch (error) {
            console.error('Failed to provision profile for user', user.id, error)
          }
        },
      },
    },
  },
})
```

```typescript
// lib/auth/client.ts — browser context only
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()
// authClient.signIn.social({ provider: 'google' | 'github', callbackURL: '/learn' })
// authClient.signOut()
// authClient.useSession()
```

```typescript
// lib/db.ts — shared Drizzle instance over the Postgres connection, used by Better-Auth's adapter AND app queries
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema' // src/lib/schema/ — Drizzle table definitions matching architecture.md's tables
import { env } from '@/lib/env'    // never use process.env directly — always go through lib/env

const pool = new Pool({ connectionString: env.databaseUrl })
export const db = drizzle(pool, { schema })
```

Schema lives in TypeScript (`lib/schema/`), one file per table group, migrated via `drizzle-kit` (`drizzle.config.ts` at the project root) — not hand-written SQL. Better-Auth's own `user`/`session`/`account`/`verification` tables are generated into this same schema directory via `npx @better-auth/cli generate` (configured for the Drizzle adapter), so `drizzle-kit` manages migrations for Better-Auth's tables and the app's tables together, in one schema, against one `DATABASE_URL`.

Rules:
- `lib/auth/client.ts` → Client Components only (sign-in buttons, session display)
- `lib/auth/server.ts` (`auth.api.getSession()`) → Server Components, API routes, Server Actions — the only place session verification happens
- `lib/db.ts` → server-side only (Server Components, API routes, Server Actions) — never imported into a Client Component, since `DATABASE_URL` must never reach the browser
- Never use the browser auth client to make authorization decisions server-side, and never import `lib/db.ts` client-side

---

## Rate Limiting Pattern (Upstash)

Every API route that writes data applies rate limiting before any logic runs.

```typescript
// lib/upstash.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
})

// In every write API route:
const { success } = await ratelimit.limit(userId)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

### Better-Auth's Own Rate Limiter (separate mechanism, not the Upstash instance above)

Better-Auth ships its own built-in rate limiter, configured directly on the `betterAuth()` instance in `lib/auth/server.ts` — a global `{ window: 60, max: 5 }`, stored in Redis via `secondaryStorage` (the same Upstash Redis, but a different code path than `lib/upstash.ts`'s `Ratelimit` object above). It governs Better-Auth's own endpoints (`/sign-in/social`, `/get-session`, etc.), not the app's own API routes.

**`/get-session` needs its own, much higher ceiling — confirmed by a real incident, not a hypothetical:** unlike sign-in (a genuinely brute-forceable action worth throttling hard), `get-session` just validates the caller's own already-issued cookie — there's no secret to guess, so hammering it gains an attacker nothing. But it fires on *every single page load* (the client session store remounts from scratch on each full navigation), so a handful of ordinary page-to-page clicks in under a minute can trip the same 5-req/60s limit meant for sign-in abuse. When that happens on a fresh page (no prior session data cached yet to fall back on — Better-Auth's client correctly preserves the last-known session on non-401 errors, but there's nothing to preserve on a page's very first fetch), the Navbar renders logged-out until the window resets — up to a minute, sometimes closer to two if a user's own refreshes re-trip it. Fixed via `rateLimit.customRules`:

```typescript
rateLimit: {
  window: 60,
  max: 5, // stays strict for sign-in/sign-up (Better-Auth's own built-in special rules already cover those separately)
  customRules: {
    "/get-session": { window: 60, max: 100 }, // read-only, not brute-forceable — the global default was never meant for this endpoint
  },
}
```

Verified via repeated `curl` bursts against the running dev server: before the fix, 6 rapid requests reliably produced a `429` on the 6th; after, the same burst stayed `200` up through ~100 requests before capping (confirming the override is live, not just configured).

---

## XP System

| Action | XP Reward |
|---|---|
| Complete Understand tab | 10 XP |
| Complete Simulate tab | 15 XP |
| Complete Challenge tab | 25 XP |
| Complete Interview tab | 20 XP |
| Complete Build tab | 30 XP |
| Solve a practice challenge | 20 XP |
| Answer an interview question (review) | 10 XP |
| Daily streak bonus | 5 XP |
| First-time concept completion bonus | +50 XP |

---

## Simulator Architecture

Each simulator is a fully self-contained feature module. There is no shared simulator engine.

```
features/simulators/event-loop/
  components/
    EventLoopSimulator.tsx      ← Root component (hero + full variants)
    CallStack.tsx
    WebAPIs.tsx
    MicrotaskQueue.tsx
    TaskQueue.tsx
    ConsoleOutput.tsx
    SimulatorControls.tsx       ← Play/Step/StepBack/Restart/Autoplay/Speed
    CodePanel.tsx
    ExecutionOrder.tsx
  hooks/
    useEventLoopSimulator.ts    ← State machine: current step, play/pause, autoplay
  data/
    scenarios.ts                ← Pre-scripted step sequences for each code example
  types.ts                      ← SimulatorStep, SimulatorState, etc.
```

Step scripts are pre-authored data — not real JS execution:

```typescript
// features/simulators/event-loop/data/scenarios.ts
export const promiseVsTimeoutScenario: SimulatorStep[] = [
  { step: 1, action: 'push', target: 'callStack', item: "console.log('start')", highlight: [1] },
  { step: 2, action: 'execute', target: 'callStack', item: "console.log('start')", output: 'start' },
  { step: 3, action: 'push', target: 'callStack', item: 'setTimeout(...)' },
  { step: 4, action: 'move', from: 'callStack', to: 'webAPIs', item: 'setTimeout(...)' },
  // ...
]
```

This approach is intentional. Pre-scripted steps allow the exact pedagogical moment to be crafted — what the learner sees is always correct and always teaches the right thing.

---

## Invariants

Rules never to violate:

- `app/` contains pages and API routes only — no business logic, no direct DB calls
- Features in `features/` never import from other features — only from `components/`, `lib/`, `hooks/`, `types/`
- Simulators are fully self-contained — each owns its own state, components, data, and types. No shared simulator engine or cross-simulator imports
- All session verification uses `auth.api.getSession()` server-side — never trust a client-reported session for authorization
- `lib/db.ts` (direct Postgres access) is never imported into a Client Component — server-side only
- All DB queries on user-owned tables are scoped to `WHERE user_id = session.user.id` in application code — there is no RLS/`auth.uid()` safety net underneath a direct Postgres connection, so never query user data without an explicit user filter
- No hex values or raw Tailwind color classes in components — use design tokens from `ui-tokens.md` only
- MDX content files are read-only at runtime — never write to `content/` at runtime
- Rate limiting runs before any write logic in every API route — never skip it
- Protected route redirects are handled by `proxy.ts` (optimistic) plus each route's own `auth.api.getSession()` check (real verification) — never duplicate the optimistic redirect logic in page components
- `is_premium` on DB rows controls access gating — never hardcode which content is premium in component logic
- Simulator step scripts are the source of truth for what the simulator shows — never derive steps from runtime computation

# Architecture

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack, SSR, RSC, API routes, static generation |
| Language | TypeScript (strict mode) | Throughout — no `any`, no implicit types |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility classes + accessible UI primitives |
| Animation | Framer Motion | Simulator animations, page transitions, motion design |
| Auth + DB + Storage | Supabase | Postgres, Google/GitHub OAuth, file storage, realtime |
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
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx        ← Supabase OAuth callback
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
│   │       ├── auth/callback/route.ts
│   │       └── progress/
│   │           └── route.ts             ← Progress write endpoint (rate limited)
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
│   │   │   ├── components/              ← ChallengeEditor, TestRunner, HintsPanel
│   │   │   ├── hooks/                   ← useChallenge, useSandbox
│   │   │   └── sandbox/                 ← iframe execution engine
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
│   │       └── components/              ← LoginButton, OAuthButton
│   │
│   ├── components/                      ← Truly shared UI — used across multiple features
│   │   ├── ui/                          ← shadcn/ui components (never modify these directly)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx               ← Handles both logged-out and logged-in states
│   │   │   ├── Footer.tsx
│   │   │   └── LearnSidebar.tsx
│   │   └── shared/
│   │       ├── ConceptCard.tsx
│   │       ├── DifficultyBadge.tsx
│   │       ├── ProgressRing.tsx
│   │       ├── XPBadge.tsx
│   │       ├── PremiumBadge.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                ← Browser Supabase client
│   │   │   └── server.ts                ← Server Supabase client factory
│   │   ├── upstash.ts                   ← Upstash Redis rate limiter
│   │   ├── mdx.ts                       ← MDX parsing and rendering utilities
│   │   └── utils.ts                     ← cn(), formatXP(), etc.
│   │
│   ├── hooks/                           ← Global hooks (used across features)
│   │   ├── useUser.ts                   ← Current authenticated user
│   │   ├── useTheme.ts                  ← Light/dark theme
│   │   └── useSearch.ts                 ← Global search (⌘K)
│   │
│   └── types/
│       └── index.ts                     ← Global TypeScript types
│
├── middleware.ts                         ← Auth session guard on protected routes
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
Supabase redirects to Google OAuth
        ↓
Google redirects to /auth/callback
        ↓
Supabase creates session + profile row
        ↓
Redirect to /learn
        ↓
middleware.ts validates session on every protected route
```

### Progress Tracking

```
User completes a concept tab (e.g. Simulate)
        ↓
Feature hook calls POST /api/progress
        ↓
Rate limiter (Upstash) checks request
        ↓
Supabase writes to user_concept_progress
        ↓
XP event written to xp_events
        ↓
profiles.xp incremented
        ↓
profiles.streak_current updated if new day
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

## Supabase Database Schema

### `profiles`

| Column | Type | Notes |
|---|---|---|
| id | uuid | References auth.users |
| username | text | Unique, URL-safe slug |
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
| event_type | text | concept_understand / concept_simulate / concept_challenge / concept_interview / concept_build / challenge_solved / interview_answered / streak_bonus |
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

## Row Level Security

All tables enforce RLS. Every query scoped to the authenticated user.

```sql
-- Applied to every table with a user_id column
CREATE POLICY "Users access own data only"
  ON [table_name]
  FOR ALL
  USING (user_id = auth.uid());
```

Never query any user-owned table without a `user_id` filter.

---

## Authentication

- Provider: Supabase Auth
- Methods: Google OAuth, GitHub OAuth — no email/password
- Protected routes: `/learn/**`, `/practice/**`, `/interview-prep/**`, `/leaderboard`, `/settings`
- Public routes: `/`, `/login`, `/explore`, `/roadmaps`, `/roadmaps/[slug]`
- `middleware.ts` validates session on every request to protected routes
- After login → redirect to `/learn`

---

## Supabase Client Pattern

Two separate instances — never mix them:

```typescript
// lib/supabase/client.ts — browser context only
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// lib/supabase/server.ts — server context only
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createSupabaseServer = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

Rules:
- Browser client → Client Components, auth state, realtime subscriptions
- Server client → Server Components, API routes, Server Actions
- Never use browser client in server context
- Never use server client in browser context

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
- All Supabase server-side operations use `createSupabaseServer()` — never the browser client
- All DB queries are scoped to `user_id = auth.uid()` — never query user data without a user filter
- No hex values or raw Tailwind color classes in components — use design tokens from `ui-tokens.md` only
- MDX content files are read-only at runtime — never write to `content/` at runtime
- Rate limiting runs before any write logic in every API route — never skip it
- Protected route redirects are handled entirely by `middleware.ts` — never duplicate in page components
- `is_premium` on DB rows controls access gating — never hardcode which content is premium in component logic
- Simulator step scripts are the source of truth for what the simulator shows — never derive steps from runtime computation

# Build Plan

## Core Principle

Full page UI built with realistic placeholder content first — verified visually before any logic is written. Then functionality is wired step by step. Every feature must be visible and correct before moving to the next. No invisible backend phases.

Build order: **Homepage first → Auth → Database → Learn → Practice → Interview Prep → Roadmaps → Leaderboard → Premium**

**Sequencing note (added after Feature 25):** Phase 10 — Concept Curriculum Expansion is numbered last (features are append-only so existing numbers/branches never shift) but is *scheduled* to run right after Features 26 and 27 finish Phase 4 (Build Tab, then Progress API + XP System), before Phase 5 (Practice) resumes — see `progress-tracker.md` → Decisions Made and the Phase 10 section below for why.

---

## Phase 0 — Foundation

### 00 Project Setup

Initialize the Next.js project with full stack configuration.

**Steps:**

- `npx create-next-app@latest frontend-forever --typescript --tailwind --app --src-dir`
- Install dependencies: `framer-motion`, `better-auth`, `drizzle-orm`, `pg`, `@upstash/ratelimit`, `@upstash/redis`, `lucide-react`, `next-mdx-remote`, `gray-matter`, `@monaco-editor/react`
- Install dev dependency: `drizzle-kit` (schema migrations)
- Install shadcn/ui: `npx shadcn@latest init`
- Install base shadcn components: `button`, `dialog`, `tabs`, `dropdown-menu`, `tooltip`, `badge`, `avatar`, `switch`, `input`, `textarea`, `separator`
- Configure `tsconfig.json` with strict mode and `@/*` alias to `./src/*`
- Configure `.env.local` with all required environment variables (template only — no real keys)

> **Note (added when Auth moved from Supabase to Better-Auth, then the DB layer from Kysely to Drizzle, both before Phase 2 started):** Phase 0 originally installed `@supabase/ssr`/`@supabase/supabase-js` per the line above. Nothing in Phase 0–1 ever used them (Phase 1 was UI-only). When Feature 14 actually starts, uninstall both and install `better-auth`, `drizzle-orm`, `pg` (+ `drizzle-kit` as a dev dependency) instead — the dependency line above already reflects the corrected list.

**ENV Variables required:**

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`DATABASE_URL` points at the same Supabase-hosted Postgres instance (its connection-pooler string, not the Supabase project URL) — Supabase is now used purely as hosted Postgres + Storage, not as the auth/client layer. See `context/architecture.md` → Auth + DB Client Patterns.

---

### 01 Design System + Global Styles

**UI:**

- `src/app/globals.css` — complete token definition from `ui-tokens.md` (light + dark themes)
- Root layout with Geist font, theme class on `<html>`, metadata
- Theme provider component that reads `localStorage` + system preference
- `lib/utils.ts` with `cn()` helper

**Verify:** Page background is `#FAFAF9`, Geist loads correctly, theme toggle switches between light and dark

---

### 02 Navbar + Footer

**UI:**

- `components/layout/Navbar.tsx` — logged-out state (logo, 6 nav links, Follow on X, theme toggle, Log In)
- `components/layout/Footer.tsx` — grouped nav links, social icons, newsletter input, legal links
- Navbar is sticky, `z-50`, `bg-surface border-b border-border`
- Active nav link: `text-accent border-b-2 border-accent`

**Verify:** Navbar renders correctly in light and dark mode, all links present, mobile responsive hamburger menu

---

## Phase 1 — Homepage

### 03 Hero Section (Static)

**UI:**

- Announcement pill: "• Interactive Learning • Real Challenges • Interview Ready"
- Headline: "Frontend Interview-Ready Concepts" (black) + "You Can Play With." (teal — `text-accent`)
- Subheadline: supporting copy
- Two CTA buttons: "Start Learning →" (primary teal) + "Explore Roadmaps" (secondary outlined)
- Concept switcher tabs placeholder: 4 tabs (Event Loop, React Rendering, Browser Pipeline, CSS Specificity)
- Simulator panel placeholder: card with "LIVE CONCEPT ENGINE" label and "Running" badge
- Scroll indicator at bottom

**Motion:**

- Announcement pill fades in first
- Headline slides up with stagger between lines
- CTAs fade in after headline
- Simulator panel floats in from below

---

### 04 Company Logos Strip

**UI:**

- "Practice concepts discussed in interviews at" label in `text-text-muted`
- Logo row: Google, Meta, Amazon, Microsoft, Stripe, Airbnb
- SVG logos in `public/logos/`
- Subtle horizontal scroll fade on edges (CSS mask)

**Motion:**

- Logos fade in staggered left-to-right

---

### 05 How It Works Section

**UI:**

- Section heading: "The Learning Model"
- 5 steps in a horizontal flow (desktop) / vertical (mobile):
  1. Understand — lightbulb icon
  2. Simulate — code arrows icon
  3. Challenge — trophy icon
  4. Interview — chat icon
  5. Build — tools icon
- Arrows connecting each step
- Each step: icon + title + 1-line description

**Motion:**

- Steps animate in left to right with stagger
- Arrows draw in between steps (SVG pathLength animation)

---

### 06 Feature Highlights Section

**UI:**

- Section heading: "What Makes Frontend Forever Different"
- 4 feature cards in 2×2 grid (desktop) / single column (mobile):
  1. "Concepts You Can See" — simulator preview mini-visual
  2. "Real Engineering Challenges" — code snippet visual
  3. "Interview-Ready Questions" — Q&A visual
  4. "Build Real Things" — Monaco editor mini-visual
- Each card: icon + title + description + mini visual on right

**Motion:**

- Cards fade in with stagger on scroll enter

---

### 07 Testimonials Section

**UI:**

- Section heading: "Developers who get it now"
- 6 testimonial cards in a 3-column grid (desktop) / 1-column (mobile)
- Each card: quote text + avatar + name + role + company
- Cards at slightly different heights for visual interest

**Motion:**

- Cards animate in with stagger on scroll enter

---

### 08 CTA Section

**UI:**

- Dark background section (`bg-accent-dark` or rich dark with teal accent)
- Large heading: "Start learning for free"
- Subtext: supporting copy
- Single "Get Started" primary button (white bg, dark text on dark section)

**Motion:**

- Full section scales slightly up on scroll enter

---

### 09 Event Loop Simulator (Hero Version)

The hero simulator for the "Event Loop" tab. Simplified version of the full simulator.

**UI Components:**

- Call Stack panel (left)
- Web APIs panel (center-left)
- Microtask Queue panel (center-right)
- Task Queue panel (right)
- Code panel: 11 lines of JS with syntax highlighting
- Step indicator: "Step X of 8"
- "LIVE CONCEPT ENGINE" header + "Running" status badge
- Execution Order bar at bottom: numbered steps
- Insight callout: "Microtasks are executed before tasks."
- Controls: Play, Step, Step Back, Restart, Autoplay toggle, Speed selector

**Step Scripts (`features/simulators/event-loop/data/scenarios.ts`):**
Define all 8 steps for the default scenario (console.log + setTimeout + Promise.then):

```
Step 1: console.log('start') → CallStack
Step 2: execute → output "start"
Step 3: setTimeout → CallStack → WebAPIs
Step 4: Promise.resolve().then → CallStack → WebAPIs
Step 5: console.log('end') → CallStack
Step 6: execute → output "end"
Step 7: Promise.then callback → MicrotaskQueue → CallStack → execute "promise"
Step 8: setTimeout callback → TaskQueue → CallStack → execute "timeout"
```

**State machine (`useEventLoopSimulator`):**

- `currentStep`: number
- `isPlaying`: boolean
- `autoplay`: boolean
- `speed`: 0.5 | 1 | 1.5 | 2
- `callStack`: item[]
- `webAPIs`: item[]
- `microtaskQueue`: item[]
- `taskQueue`: item[]
- `consoleOutput`: string[]
- Methods: play(), pause(), step(), stepBack(), restart()

**Motion:**

- Items move between panels with `layout` + `AnimatePresence`
- Active item in CallStack has pulse highlight
- New output line in console slides in from left

---

### 10 React Rendering Simulator (Hero Version)

**UI Components:**

- Component tree visualization (nodes and edges)
- State display: `count = 0`
- "Increment" button that triggers the flow
- Flow stages: State Update → Render Phase → Virtual DOM → Diffing → Real DOM Update
- Highlighted nodes show which components re-rendered
- "Only changed nodes update" callout

**Step Scripts:** Pre-scripted flow for count increment scenario

---

### 11 Browser Pipeline Simulator (Hero Version)

**UI Components:**

- Pipeline stages as a vertical or horizontal flow:
  HTML → DOM → CSS → CSSOM → Render Tree → Layout → Paint → Composite
- Each stage lights up as active
- Input panel showing HTML/CSS source
- Output visual at the end
- Connecting arrows animate between stages

**Step Scripts:** Pre-scripted walk through the full rendering pipeline

---

### 12 CSS Specificity Simulator (Hero Version)

**UI Components:**

- Target element display: `<button id="cta" class="primary btn">Click</button>`
- Competing selectors list: `button`, `.btn`, `.primary`, `#cta`
- Specificity score calculator: [id, class, element] = [0,0,1] etc.
- Bar chart comparing scores — winner grows largest
- Final style preview: winning rule's styles applied

**Step Scripts:** Pre-scripted selector competition for a button element

---

### 13 Concept Switcher Wiring

Wire the 4 hero tabs to their respective simulators with animated transitions.

**Logic:**

- `useState` for `activeTab`: 'event-loop' | 'react-rendering' | 'browser-pipeline' | 'css-specificity'
- Tab click → `AnimatePresence mode="wait"` cross-fades to new simulator
- Each simulator resets to step 1 when its tab becomes active

---

## Phase 2 — Auth

**Switched from Supabase Auth to Better-Auth, decided before this phase started (see `context/progress-tracker.md` → Decisions Made).** Supabase remains the hosted Postgres database (and Storage, if needed later) — only the auth/session/OAuth layer moved. Full rationale and the new client/data-flow patterns are in `context/architecture.md`.

### 14 Better-Auth Setup

**Logic:**

- `lib/schema/` — Drizzle table definitions in TypeScript; `drizzle.config.ts` at the project root points `drizzle-kit` at `DATABASE_URL`
- `lib/db.ts` — shared Drizzle instance (`drizzle-orm/node-postgres` over a `pg` Pool, `DATABASE_URL`), used by both Better-Auth's adapter and app data queries
- `lib/auth/server.ts` — the `betterAuth()` instance: `drizzleAdapter(db, { provider: 'pg' })` (reuses the same `db` from `lib/db.ts`), `socialProviders: { google, github }`, `advanced.database.generateId` configured to emit uuids (keeps `profiles.id` consistent with every other uuid PK in the schema), and a `databaseHooks.user.create.after` hook that upserts the matching `profiles` row on first sign-in (absorbs what Feature 16 used to do as a separate callback step)
- `lib/auth/client.ts` — `createAuthClient()` from `better-auth/react`, the browser-side client (`signIn.social`, `signOut`, `useSession`)
- `app/api/auth/[...all]/route.ts` — Better-Auth's Next.js catch-all route handler (`toNextJsHandler(auth)`) — this single route handles sign-in, the OAuth callback, sign-out, and session reads; there is no separate callback page
- Run `npx @better-auth/cli generate` once (configured for the Drizzle adapter) to generate its `user` / `session` / `account` / `verification` table definitions into `lib/schema/`, then `npx drizzle-kit migrate` against `DATABASE_URL` to create them (and every app table from Feature 18) in the same Postgres database
- `src/proxy.ts` (Next 16's renamed `middleware.ts`; must live inside `src/`, not the repo root, given this project's `--src-dir` scaffold) — optimistic session-cookie check via Better-Auth's `getSessionCookie()` on its matched routes (cookie presence only; real verification happens per-route via `auth.api.getSession()`)
- `proxy.ts` matcher list (login-required routes only): `/leaderboard`, `/settings/**`, `/profile/**`. `/learn`, `/practice`, and `/interview-prep` are publicly browsable — login only gates personalization within them, enforced per-route, not via the proxy matcher. (Fixed 2026-07-14 in `fix/proxy-route-protection`: the file originally shipped at the repo root, which Next.js never picks up given the `--src-dir` scaffold, so this guard silently never ran for any route.)

---

### 15 Login Page

**UI:**

- Centered card on `bg-background`
- Frontend Forever logo at top
- Heading: "Welcome back"
- Subheading: "Sign in to continue learning"
- "Continue with Google" button (Google icon + text)
- "Continue with GitHub" button (GitHub icon + text)
- Divider or subtle separator between them
- Link back to homepage

**Logic:**

- `authClient.signIn.social({ provider: 'google', callbackURL: '/learn' })`
- `authClient.signIn.social({ provider: 'github', callbackURL: '/learn' })`
- On failure, Better-Auth redirects back to `/login?error=...` — surface that query param as an error message on this page (same UX contract the old `?error=auth_failed` callback had, just sourced differently)

---

### 16 Profile Provisioning Hook

**Renamed from "Auth Callback Handler"** — Better-Auth's catch-all route (built in Feature 14) *is* the callback handler, so there is no custom callback page to build. This feature's only remaining scope is the profile-creation side effect:

**Logic:**

- Implement the `databaseHooks.user.create.after` hook in `lib/auth/server.ts` (stubbed in Feature 14): on a new Better-Auth user row, `upsert` into `profiles` using the OAuth profile data Better-Auth already captured (`full_name`, `email`, `avatar_url`)
- No redirect logic needed here — Better-Auth's own `callbackURL`/error-redirect handling (configured in Feature 14/15) covers success and failure paths

---

### 17 Logged-In Navbar Variant

Update `Navbar.tsx` to handle the authenticated state.

**UI:**

- Search bar: `"Search labs, topics, questions..."` + `⌘K` chip (opens search modal)
- Streak: 🔥 icon + `streak_current` number
- Notification bell icon (badge if unread — static for now)
- "Upgrade to Premium" pill — only if `!user.is_premium`
- Avatar with dropdown: Profile, Settings, Theme, Sign Out

**Logic:**

- `useUser()` (global hook, `src/hooks/useUser.ts`) wraps `authClient.useSession()` instead of a Supabase auth listener
- Sign Out calls `authClient.signOut()`

---

## Phase 3 — Database

### 18 Database Tables

Define all tables from `architecture.md` schema as Drizzle table definitions in `lib/schema/`, then run `npx drizzle-kit migrate` against `DATABASE_URL` (the same direct Postgres connection Better-Auth's adapter uses for its own tables):

**Tables to create:**

1. `profiles` — `id` references Better-Auth's `user.id` (no `auth.users` trigger — provisioning happens via the `databaseHooks.user.create.after` hook from Feature 16, not a Postgres trigger)
2. `concepts` — seed with initial concept list
3. `user_concept_progress`
4. `xp_events`
5. `challenges` — seed with initial challenges
6. `user_challenge_submissions`
7. `interview_questions` — seed with FF 75
8. `user_interview_reviews`
9. `roadmaps` — seed with initial roadmaps
10. `roadmap_steps`
11. `bookmarks`

**Authorization:** No RLS policies — see `architecture.md` → Authorization Model. Every query against a user-owned table must filter `WHERE user_id = session.user.id` in application code (`lib/db.ts`/Drizzle), since the app's Postgres connection is direct and not subject to RLS.

---

### 19 Upstash Redis Setup

**Logic:**

- `lib/upstash.ts` — Ratelimit instance with sliding window config
- Apply to `/api/progress/route.ts`
- Test rate limiting works in development

---

## Phase 4 — Learn Experience

### 20 Learn Index Page

**UI:**

- Page heading: "Learn"
- Category grid: 8 category cards, each with icon + name + concept count + completion percentage for logged-in users
- Category colors coordinate with concept types

---

### 21 Concept Page Shell

**UI:**

- Left sidebar: `LearnSidebar.tsx` with all concepts grouped by category, each with completion indicator
- Main area: breadcrumb (Learn → Category → Concept), concept title, bookmark button, Guide/Save/Share buttons
- 5 tab navigation: Understand | Simulate | Challenge | Interview | Build
- Each tab renders its own section below
- "Your Turn" sidebar on right (visible in Understand tab for quick quizzes)

---

### 22 Understand Tab

**UI:**

- MDX content rendered with styled components
- "What's Happening?", "Key Insight", "Memory Hook", "In Real Life" info cards at bottom
- Smooth scroll through content
- "Mark as understood" button at bottom → writes progress to DB

**Logic:**

- Read MDX file from `content/concepts/[category]/[slug].mdx`
- On "Mark as understood": POST `/api/progress` with `{ conceptId, tab: 'understand' }`

---

### 23 Simulate Tab — Full Simulators

Full versions of all 4 simulators with complete controls:

- Play / Pause
- Step (forward)
- Step Back
- Restart
- Autoplay toggle
- Speed selector (0.5x, 1x, 1.5x, 2x)
- Multiple scenarios per concept (switchable)

Each simulator tracks `simulate_completed` when the user plays through all steps at least once.

---

### 24 Challenge Tab

**UI:**

- Challenge description
- Difficulty badge
- Code editor (Monaco, browser sandbox execution)
- Run Tests button
- Test results panel
- Hints panel (collapsible, progressive reveal)
- View Solution button (after passing or after 3 failed attempts)

**Logic:**

- Code runs in iframe sandbox
- On all tests passing: POST `/api/progress` with `{ conceptId, tab: 'challenge' }`

---

### 25 Interview Tab

**UI:**

- List of 5–8 questions related to this concept
- Each question: expandable card
- Revealed answer on click
- "I knew this" / "Need to review" buttons
- Progress indicator: X of Y answered

**Logic:**

- On completing all questions: POST `/api/progress` with `{ conceptId, tab: 'interview' }`

---

### 26 Build Tab

**UI:**

- Project brief description
- Monaco editor with starter code
- Run / Test buttons
- Test results
- "Mark Build Complete" button

**Logic:**

- Browser sandbox execution
- On completion: POST `/api/progress` with `{ conceptId, tab: 'build' }`
- Gate premium build tabs: show upgrade prompt for `is_premium: false` users

---

### 27 Progress API + XP System

**Logic:**

- `POST /api/progress` — auth check → rate limit → write `user_concept_progress` → write `xp_events` → increment `profiles.xp` → update streak
- Streak logic: if `streak_last_activity` is yesterday → increment `streak_current`, if today → no change, if older → reset to 1
- If `fully_completed` becomes true → add +50 XP bonus event

---

## Phase 5 — Practice Section

### 28 Practice Hub + Category List Pages

**Restructured from a single flat list into a two-level browse flow** — see `progress-tracker.md` → Decisions Made, Pre-Feature-28 entry, for the full reasoning. Structurally inspired by BFE.dev's category → filtered list flow, but built on FF's own 8-concept-category taxonomy (the same one driving Learn) and FF's own design system — card-based, no dense text rows, no ad clutter.

**UI — Practice Hub (`/practice`):**

- Page heading: "Practice"
- Stats strip for logged-in users: total challenges solved, current streak
- Category grid: 8 category cards (one per concept category), same visual pattern as Feature 20's Learn Index cards — icon + name + challenge count + completion percentage for logged-in users
- "Continue where you left off" card at top if the user has an in-progress attempt (omit if none)

**UI — Category List (`/practice/[category]`):**

- Breadcrumb: Practice → [Category]
- Filter bar: text search, difficulty filter (all/easy/medium/hard), solved status filter (all/solved/unsolved)
- Grid of challenge cards: title, difficulty badge, concept tag, completion state
- "Completed" green check overlay on completed challenges

---

### 29 Challenge Editor Page

**Built. Scope expanded significantly beyond this original spec, via explicit mid-build user request** — see `progress-tracker.md`'s Feature 29 entry for the full decision trail. What follows is the spec as originally written, with a note on what actually shipped on top of it.

**UI:**

- Left panel, tabbed: Description (Markdown) | Hints (progressive reveal) | Test Cases spec — tabbed rather than all-visible-at-once, keeps the panel calm instead of BFE's cluttered always-on row of icon buttons
- Right: Monaco editor + Run Tests button + output panel
- Header: challenge title, difficulty badge, back to practice link
- **Future, out of scope for this feature:** a single reserved slot for one tastefully-positioned sponsor/premium banner (not a scattered ad-network style) — deferred until real traffic justifies it; do not build placeholder ad UI now — **still deferred, not built**
- **Shipped beyond this spec:** two more tabs — **Solution** (official reference solution, pass-or-3-attempts gated) and **Discussion** (community comments and shared solutions, open to every viewer, flat one-level replies, no voting/edit/delete in v1) — a **Share row** in the header (X/Facebook real share intents + a dynamic per-challenge OG image; Instagram best-effort copy-caption-and-download, since no third-party site can pre-fill an Instagram post), and, from two same-session follow-up rounds against the running page: a sticky 50/50 editor layout with a JS/TS language badge, a video-walkthrough link (admin-curated `challenges.video_url`) placed above the editor rather than in the Solution tab, category-scoped Prev/Next question navigation, platform-wide syntax-highlighted description code blocks, and a per-page SEO/GEO pass (JSON-LD, canonical/OG metadata). See `ui-registry.md` → "Challenge Editor Page (Feature 29)" (plus its "Layout, SEO, and content-rendering redesign" follow-up) for the full component/route breakdown, including the internal-linking "More Questions" section that was built for the SEO pass and then removed the same session on user request. **Done, separate branch:** rewriting the Practice challenge descriptions to greater depth — explicitly requested by the user, scoped and executed as a separate multi-session content-authoring effort (not part of this feature's build/branch). Covered all 363 Practice-category challenges (not ~620 — that figure conflated total challenges platform-wide with Practice-category ones specifically) across three passes: prose depth, BFE-style code examples + SEO/GEO polish, and a clarity review. See `progress-tracker.md` → "Content Initiative — Practice Challenge Description Rewrite" for the full build, and branch `content/practice-challenge-descriptions` off `develop`.

**Logic — two grading paths, chosen by category:**

- **JS / React / CSS / System Design:** code execution in the iframe sandbox (`allow-scripts` only), test runner compares output to expected values against the `SandboxTest[]` entries in `src/features/practice/sandbox/testSpecs.ts`.
- **TypeScript:** no runtime to execute — instead, `POST /api/practice/grade-type-challenge` runs the real TypeScript Compiler API server-side (`src/lib/typeChecker/gradeTypeChallenge.ts`) against the `TypeChallengeTest[]` entries in `src/features/practice/sandbox/typeChallengeSpecs.ts`, and returns pass/fail per assertion based on real compiler diagnostics. See `context/security.md` → "Server-Side Compiler Execution" for the risk model this path introduces (distinct from the iframe sandbox's). **Requires login** (that route is auth-gated); the Editor page disables Run Tests for logged-out users on TypeScript challenges rather than surfacing a raw "Unauthorized" as a fake test failure.
- The Editor page picks the grading path via a unifying `useChallengeGrading(category, slug)` hook, not an inline branch per call site.
- **On every Run Tests attempt, pass or fail:** write a row to `user_challenge_submissions` (`POST /api/practice/submit`) — the table has no unique constraint, by design, so every attempt is logged. XP (`CHALLENGE_SOLVED_XP` = 10, not the originally-planned 20 — see `architecture.md` → XP System) and the daily streak bump fire only on a user's first-ever pass for that challenge.

---

## Phase 6 — Interview Prep

### 30 Interview Prep Hub

**UI:**

- 4 collection cards: FF 75, FF JavaScript, FF React, FF System Design
- Each card: title, question count, completion percentage, premium badge if applicable
- "Your Review Queue" section: questions due for spaced repetition review

---

### 31 Collection Pages (FF 75, FF JS, FF React)

**UI:**

- Question list with difficulty, topic tags, completion state
- Filter by difficulty, topic, status (completed/due/not started)
- Click question → expands in place or opens drawer

---

### 32 Spaced Repetition Review Session

**UI:**

- One question at a time (full screen focus)
- "Show Answer" button
- After reveal: "Easy" / "Okay" / "Hard" / "Forgot" quality rating buttons (maps to SM-2 quality 5/4/3/1)
- Progress: "X questions remaining"
- Session summary at end

**Logic:**

- SM-2 algorithm in `features/interview-prep/spaced-repetition/`
- After each rating: update `user_interview_reviews` with new `ease_factor`, `interval_days`, `next_review_at`
- XP event on each answered question

---

## Phase 7 — Explore + Roadmaps

### 33 Explore Page

**UI:**

- 3 sections: "Featured by FF", "Trending This Week", "Recently Added"
- Each section: horizontal scroll row of concept cards (desktop) / vertical list (mobile)
- Concept card: cover image/icon, title, category, difficulty, completion state (for logged-in users)

---

### 34 Roadmaps List Page

**UI:**

- Grid of roadmap cards: title, concept count, estimated time, difficulty, premium badge if applicable
- Brief description per roadmap

---

### 35 Roadmap Detail Page

**UI:**

- Roadmap title + description
- Ordered list of concepts (steps) with connecting line
- Each step: concept title, difficulty, completion state, "Start" or "Continue" CTA
- Progress bar: X of Y concepts completed
- Estimated time remaining

---

## Phase 8 — Leaderboard + Gamification

### 36 Leaderboard Page

**UI:**

- Top 3 users: podium-style display with avatars
- Full ranking table: rank, avatar, name, total XP, streak, concepts completed
- "Your Rank" card at top if user is logged in
- Filter tabs: All Time | This Week | This Month

---

### 37 Streak System Polish

**UI:**

- Streak calendar view on profile/settings: last 30 days heat map
- Streak milestone celebrations: Framer Motion confetti at 7, 30, 100 days
- "You're on a 12 day streak! Keep it up." banner on learn page

---

## Phase 9 — Premium + Stripe

### 38 Premium Content Gating

> **Note (added during Feature 41, before this feature started):** the user proposed a platform-wide rule while authoring Feature 41's content — beginner concepts fully free across all 5 tabs, intermediate/advanced concepts fully locked across all 5 tabs, for every category — and it was deliberately deferred here rather than built ahead of schedule (see `progress-tracker.md` → Decisions Made, Feature 41 entry, for the full reasoning). Today only the Build tab has real premium lock/unlock UI (`BuildPremiumLocked`); Understand, Simulate, Challenge, and Interview have no concept-level gate at all. This feature should add that gating to the remaining 4 tabs and apply the beginner-free/intermediate+-locked rule platform-wide, across all 8 categories — not just per-item `isPremium` flags on individual Challenges/Project briefs the way Phase 10's content features have used so far.

**UI:**

- Premium content shows a blur overlay + "Unlock with Premium" CTA
- Upgrade modal: features list, pricing, CTA
- "Upgrade to Premium" pill in logged-in navbar routes to upgrade modal/page

**Logic:**

- Check `profiles.is_premium` and `profiles.premium_expires_at`
- Gate: FF System Design questions, Build tab, Study Plans, Company Collections

---

### 39 Stripe Integration

**Logic:**

- Stripe Checkout session creation
- Webhook handler: `stripe.checkout.session.completed` → set `is_premium = true`, `premium_expires_at`
- Webhook handler: `stripe.customer.subscription.deleted` → set `is_premium = false`
- Customer portal for subscription management

---

## Phase 10 — Concept Curriculum Expansion

**Decided after Feature 25** (see `progress-tracker.md` → Decisions Made). Every category has exactly 1 built concept today — this phase expands each to a full easy → hard curriculum. Numbered at the end (40+) so existing feature numbers/branches never renumber, but **scheduled to run right after Features 26 and 27 finish Phase 4** (Build Tab, then Progress API + XP System — every tab completion across every concept routes through `/api/progress`, so its XP/streak logic needs to be complete before Phase 10 floods the catalog with new concepts that would otherwise complete without earning anything), before Phase 5 (Practice) resumes — a thin catalog also undermines Practice/Interview Prep/Roadmaps, which all lean on it.

**This phase is content authoring, not system building.** Understand, Challenge, Interview, and Build are all generic, content-driven systems already proven on the first concept in most categories (Features 22, 24, 25, 26) — adding a concept to them means writing a guide/challenge/questions/project brief, not writing new code. **Simulate is the one exception**: every simulator is a bespoke, hand-built Framer Motion feature (Features 09–12), so it is *not* part of this phase's per-category features — see the Simulator Backlog note at the end of this phase.

The concept list below was drafted collaboratively, then revised twice: a senior-engineer pass that fixed two teaching-order bugs (Event Loop before Promises, not after; Cascade & Inheritance before Specificity, not after) and added missing fundamentals (Equality & Coercion, TypeScript's Basic Types on-ramp, React Forms, CORS/Web Security, and others); then a direct catch that Callbacks & Higher-Order Functions was missing entirely from JS Runtime, which also reordered Array & Object Methods to come after it (map/filter/reduce *are* the callback pattern).

### 40 Curriculum Definition

Seed every concept below — data only, no tab content yet.

**Logic:**

- Add all 68 new concepts (title/slug/description/category/difficulty/`orderIndex`) to `CONCEPTS` in `scripts/seed.ts`, following the existing `conceptSlug`-link pattern from Features 24/25
- No schema change — `concepts` already supports this; only a **new category** would need a migration, and none is being added here
- Every new concept appears immediately on the Learn index and gets a working `[category]/[slug]` page with graceful "coming soon" states on every tab (existing empty-state pattern from Features 22–25) — this alone fixes the "JS only has 1 concept" perception before any content is written

---

### 41 JavaScript Runtime Concepts

Existing: **Event Loop** (intermediate). Expand to 14 concepts, easy → hard:

1. Hoisting & the Temporal Dead Zone — beginner
2. Equality & Type Coercion — beginner
3. Closures — beginner
4. Callbacks & Higher-Order Functions — beginner
5. Array & Object Methods, Immutability — beginner
6. `this` Binding & Execution Context — intermediate
7. Prototypal Inheritance — intermediate
8. Modules: ESM vs. CommonJS — intermediate
9. Event Loop — intermediate *(existing)*
10. Promises & Async/Await — intermediate
11. Debouncing & Throttling — intermediate *(pairs with the existing `implement-debounce` Practice challenge)*
12. Function Composition & Currying — advanced
13. Memory Management & Leaks — advanced
14. Generators & Iterators — advanced

---

### 42 Browser Internals Concepts

Existing: **Browser Rendering Pipeline** (intermediate). Expand to 9 concepts, easy → hard:

1. DOM vs. BOM — beginner
2. Event Delegation, Bubbling & Capturing — beginner
3. Storage APIs — intermediate
4. Browser Rendering Pipeline — intermediate *(existing)*
5. CORS & the Same-Origin Policy — intermediate
6. Web Security Fundamentals (XSS, CSRF, CSP) — advanced
7. The Network Stack (DNS → TCP → TLS → HTTP) — advanced
8. Service Workers & Caching Strategies — advanced
9. Web Workers & Concurrency — advanced

---

### 43 React Concepts

Existing: **React Rendering & Reconciliation** (intermediate). Expand to 12 concepts, easy → hard:

1. JSX & the Virtual DOM — beginner
2. useState & useEffect Fundamentals — beginner
3. Forms: Controlled vs. Uncontrolled — beginner
4. useRef & Imperative Handles — intermediate
5. Context API & Prop Drilling — intermediate
6. React Rendering & Reconciliation — intermediate *(existing)*
7. Component Composition Patterns (render props, children, compound components) — intermediate
8. Custom Hooks & Composition — intermediate
9. Error Boundaries — advanced
10. Render Performance: memo, useMemo, useCallback — advanced
11. Concurrent React & Suspense — advanced
12. State Management Tradeoffs — advanced

---

### 44 CSS Concepts

Existing: **CSS Specificity** (beginner). Expand to 10 concepts, easy → hard:

1. The Box Model — beginner
2. Units & Sizing — beginner
3. The Cascade & Inheritance — beginner
4. CSS Specificity — beginner *(existing)*
5. Flexbox vs. Grid — beginner
6. Positioning & Stacking Contexts — intermediate
7. Responsive Design & Container Queries — intermediate
8. Custom Properties & Theming — intermediate
9. Selectors: Pseudo-classes, Pseudo-elements & `:has()` — advanced
10. Animation Performance — advanced

---

### 45 TypeScript Concepts

Existing: **Type Narrowing** (intermediate). Expand to 8 concepts, easy → hard:

1. Basic Types, Inference & `any`/`unknown`/`never` — beginner
2. Interfaces vs. Type Aliases — beginner
3. Generics — intermediate
4. Utility Types (Partial, Pick, Omit, Record) — intermediate
5. Type Narrowing — intermediate *(existing)*
6. Discriminated Unions in Practice — advanced
7. Conditional & Mapped Types — advanced
8. Template Literal & Branded Types — advanced

---

### 46 Accessibility Concepts

Existing: **Semantic HTML & ARIA Roles** (beginner). Expand to 8 concepts, easy → hard:

1. Semantic HTML & ARIA Roles — beginner *(existing)*
2. Accessible Images & Media — beginner
3. Color Contrast & Visual Accessibility — beginner
4. Keyboard Navigation & Focus Management — intermediate
5. Accessible Forms — intermediate
6. ARIA Live Regions — advanced
7. Accessible Component Patterns (modals, menus, comboboxes) — advanced
8. Automated a11y Testing (axe-core, Lighthouse) — advanced

---

### 47 Performance Concepts

Existing: **Core Web Vitals** (intermediate). Expand to 8 concepts, easy → hard:

1. Image & Asset Optimization — beginner
2. Bundle Size & Code Splitting — intermediate
3. Resource Loading & Render-Blocking (preload/prefetch/preconnect, async/defer) — intermediate
4. Core Web Vitals — intermediate *(existing)*
5. List Virtualization — intermediate *(pairs with the existing `virtual-list` Practice challenge)*
6. Profiling with DevTools — advanced
7. Streaming SSR & Hydration — advanced
8. Performance Budgets — advanced

---

### 48 System Design Concepts

Existing: **Frontend Architecture Patterns** (advanced). Expand to 7 concepts, intermediate → advanced (this category has little genuinely "beginner" content):

1. Component-Driven Architecture — intermediate
2. API Design & Data-Fetching Strategy — advanced
3. Designing Real-Time Updates (WebSockets, SSE, polling) — advanced
4. Designing an Infinite-Scroll Feed — advanced *(deepens the existing seeded interview question)*
5. Designing a Real-Time Collaborative Editor — advanced *(deepens the existing seeded interview question)*
6. Frontend Architecture Patterns — advanced *(existing)*
7. State Management at Scale — advanced

---

### Scope per feature (41–48)

Each category feature follows the same per-concept checklist, mirroring the pattern already proven once per category:

- **Understand:** MDX guide, following Feature 22's frontmatter contract (`whatsHappening`/`keyInsight`/`memoryHook`/`inRealLife`)
- **Challenge:** a Practice challenge with executable tests where the concept supports one, linked via `conceptSlug` (Feature 24's pattern) — not mandatory for every concept, but most should get one. **Two-part, not one:** a `CHALLENGES` row in `scripts/seed.ts` (title/description/starter/solution/display test_cases) *and* a matching `SandboxTest[]` entry in `src/features/practice/sandbox/testSpecs.ts`, keyed by slug — the seed row's `test_cases` are display labels only; the real `assert`/`assertEqual`/`delay` assertions Run Tests actually checks live in that separate code file (missed during Feature 41's planning — every new Challenge silently showed "coming soon" until this was caught and fixed after the fact).
- **Interview:** 5–8 seeded questions linked via `conceptSlug` (Feature 25's pattern)
- **Build:** a project brief once Feature 26's system exists (it ships before this phase starts, so this is available from Feature 41 onward). **Same two-part pattern as Challenge:** a `PROJECT_BRIEFS` row in `scripts/seed.ts` *and* a matching `SandboxTest[]` entry in `src/features/build/data/testSpecs.ts`, keyed by slug.
- **Simulate:** out of scope — see below

### Simulator Backlog (ongoing, not feature-numbered)

Every concept eventually gets a hand-built Simulate experience, but each one is a multi-day bespoke build (Features 09–12 set the precedent) — this doesn't get a fixed feature count or a fixed order here. Pull from it whenever, prioritizing so **every category reaches 2 simulators before any category reaches 3** — i.e. build each category's first new concept's simulator before going deeper into any one category.

---

## Phase 11 — Simulator Reimagining (Long-Term Vision)

**Not scheduled. No numbered features yet — this is a direction to pick up later, not a build queue.** Added 2026-07-09 after a product-direction discussion (see `progress-tracker.md` → Decisions Made for the full context). Explicitly long-term, not a redirect of current work — Phase 10 (Features 40–48) and the Simulator Backlog continue as planned in the meantime.

**The gap:** the platform's founding idea was for every concept to be *seen* working — playful, game-like, interactive — not just read about or drilled interview-style. Today only 4 of 76 concepts have any Simulate tab (Features 09–12), and even those 4 are scripted walkthroughs — Play/Step/Restart/Speed controls over one fixed scenario — not something the learner can actually manipulate. Confirmed directly against `designs/hero-section-1-react-rendering.png`: it's a clean SaaS-dashboard diagram (thin-border cards, small line icons, dotted connector arrows), the "Real DOM" panel is a static text mockup, not an actual rendered browser canvas, and there's no code editor anywhere in the simulator.

**The vision** (prompted by comparing to paperdraw.dev, a system-design tool where users build their own architecture and watch it react live rather than pressing play on someone else's): reimagine each concept's Simulate tab as three layers working together, in an illustrated/cartoonish "white paper canvas" visual style, not the current SaaS-panel look:

1. **A real code editor as the input** — the learner writes or edits actual code, not a fixed example.
2. **The internal pipeline animated like a process happening, interactively** — game/video-like motion and pacing; pause it, poke at it, change a value and watch it react — not steps highlighting in sequence on a static diagram.
3. **A genuine rendered-output canvas** — an actual mini browser preview painting the real page live, not an abstract node diagram or a static mockup card standing in for "the DOM."

**When this gets picked up:** likely means revisiting the original 4 simulators' design too, not just applying a new standard to future ones. No features are numbered here yet — defining those is the first step whenever this phase actually starts.

---

## Feature Count

| Phase                                        | Features |
| --------------------------------------------- | -------- |
| Phase 0 — Foundation                          | 2        |
| Phase 1 — Homepage                            | 11       |
| Phase 2 — Auth                                | 4        |
| Phase 3 — Database                            | 2        |
| Phase 4 — Learn                               | 8        |
| Phase 5 — Practice                            | 2        |
| Phase 6 — Interview Prep                      | 3        |
| Phase 7 — Explore + Roadmaps                  | 3        |
| Phase 8 — Leaderboard                         | 2        |
| Phase 9 — Premium                             | 2        |
| Phase 10 — Concept Curriculum                 | 9        |
| Phase 11 — Simulator Reimagining (long-term)  | TBD — unscheduled, not counted below |
| **Total**                                     | **48**   |

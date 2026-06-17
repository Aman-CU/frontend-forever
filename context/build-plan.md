# Build Plan

## Core Principle

Full page UI built with realistic placeholder content first — verified visually before any logic is written. Then functionality is wired step by step. Every feature must be visible and correct before moving to the next. No invisible backend phases.

Build order: **Homepage first → Auth → Database → Learn → Practice → Interview Prep → Roadmaps → Leaderboard → Premium**

---

## Phase 0 — Foundation

### 00 Project Setup

Initialize the Next.js project with full stack configuration.

**Steps:**

- `npx create-next-app@latest frontend-forever --typescript --tailwind --app --src-dir`
- Install dependencies: `framer-motion`, `@supabase/ssr`, `@supabase/supabase-js`, `@upstash/ratelimit`, `@upstash/redis`, `lucide-react`, `next-mdx-remote`, `gray-matter`, `@monaco-editor/react`
- Install shadcn/ui: `npx shadcn@latest init`
- Install base shadcn components: `button`, `dialog`, `tabs`, `dropdown-menu`, `tooltip`, `badge`, `avatar`, `switch`, `input`, `textarea`, `separator`
- Configure `tsconfig.json` with strict mode and `@/*` alias to `./src/*`
- Configure `.env.local` with all required environment variables (template only — no real keys)

**ENV Variables required:**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

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

### 14 Supabase Setup

**Logic:**

- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client factory
- `middleware.ts` — session validation on protected routes
- Protected routes list in middleware: `/learn/**`, `/practice/**`, `/interview-prep/**`, `/leaderboard`, `/settings`

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

- `supabase.auth.signInWithOAuth({ provider: 'google' })`
- `supabase.auth.signInWithOAuth({ provider: 'github' })`

---

### 16 Auth Callback Handler

**Logic:**

- `/auth/callback/page.tsx`
- Exchange code for session: `supabase.auth.exchangeCodeForSession(code)`
- On success → redirect to `/learn`
- On error → redirect to `/login?error=auth_failed`
- Create profile row on first sign-in (if not exists): `upsert` into `profiles`

---

### 17 Logged-In Navbar Variant

Update `Navbar.tsx` to handle the authenticated state.

**UI:**

- Search bar: `"Search labs, topics, questions..."` + `⌘K` chip (opens search modal)
- Streak: 🔥 icon + `streak_current` number
- Notification bell icon (badge if unread — static for now)
- "Upgrade to Premium" pill — only if `!user.is_premium`
- Avatar with dropdown: Profile, Settings, Theme, Sign Out

---

## Phase 3 — Database

### 18 Supabase Tables + RLS

Create all tables from `architecture.md` schema:

**Tables to create:**

1. `profiles` — with trigger on `auth.users` insert for auto-creation
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

**RLS:** Enable on all tables, `user_id = auth.uid()` policy on every user-owned table

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

### 28 Practice List Page

**UI:**

- Search/filter bar: text search, difficulty filter (all/easy/medium/hard), category filter
- Grid of challenge cards: title, difficulty badge, concept tag, completion state
- "Completed" green check overlay on completed challenges

---

### 29 Challenge Editor Page

**UI:**

- Left: problem description (Markdown), hints panel, test cases spec
- Right: Monaco editor + Run Tests button + output panel
- Header: challenge title, difficulty badge, back to practice link

**Logic:**

- Code execution in iframe sandbox
- Test runner compares output to expected values
- On all pass: write to `user_challenge_submissions` + XP event

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

## Feature Count

| Phase                        | Features |
| ---------------------------- | -------- |
| Phase 0 — Foundation         | 2        |
| Phase 1 — Homepage           | 11       |
| Phase 2 — Auth               | 4        |
| Phase 3 — Database           | 2        |
| Phase 4 — Learn              | 8        |
| Phase 5 — Practice           | 2        |
| Phase 6 — Interview Prep     | 3        |
| Phase 7 — Explore + Roadmaps | 3        |
| Phase 8 — Leaderboard        | 2        |
| Phase 9 — Premium            | 2        |
| **Total**                    | **39**   |

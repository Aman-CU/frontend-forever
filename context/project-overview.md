# Project Overview

## What Frontend Forever Is

Frontend Forever is an interactive frontend engineering learning platform where frontend concepts become visible, interactive, and understandable.

The core belief: people struggle with frontend because most concepts are invisible. Frontend Forever makes invisible concepts visible.

The product feels closer to Brilliant, neal.fun, and Figma than to Udemy or Coursera.

---

## The Problem It Solves

Most learning platforms explain concepts with text and static diagrams. Frontend Forever visualizes them.

The Event Loop, React's reconciliation algorithm, the browser rendering pipeline — these are invisible processes. Frontend Forever makes them visible, interactive, and instantly understandable through live simulators.

---

## Core Product Philosophy

Frontend Forever is concept-centric. The central entity is the **Concept** — not a course, module, or lesson.

Everything revolves around concepts:
- Event Loop
- React Rendering
- Browser Pipeline
- CSS Specificity
- Closures
- Promises
- Hoisting
- Reconciliation
- Rendering Performance

Every concept provides a complete, self-contained learning journey.

---

## Core Learning Model

Every concept follows the same 5-step journey:

```
Understand → Simulate → Challenge → Interview → Build
```

- **Understand** — Learn the mental model, theory, and "why it works this way"
- **Simulate** — Watch and interact with a live concept visualizer
- **Challenge** — Solve concept-specific coding challenges
- **Interview** — Answer common interview questions about the concept
- **Build** — Implement something real using the concept (Monaco editor)

All 5 tabs are required before a concept is published. No partial concepts ship.

---

## The Simulator

The simulator is the product's core differentiator. It is not a decorative animation — it is the teaching mechanism.

Every animation must explain something:
- Queue movement (Event Loop)
- Component tree re-renders (React Rendering)
- Rendering stages (Browser Pipeline)
- Selector weight calculation (CSS Specificity)

The simulator should feel like: "The concept is happening in front of me."

---

## Pages

```
/                              → Homepage (public)
/login                         → Auth page (public)
/explore                       → Explore: featured, trending, new concepts
/learn                         → Learn index: all concept categories
/learn/[category]/[slug]       → Concept page (5-tab learning experience)
/practice                      → Practice: coding challenges list
/practice/[slug]               → Individual challenge with Monaco editor
/roadmaps                      → Roadmaps list (public)
/roadmaps/[slug]               → Individual roadmap (curated learning path)
/interview-prep                → Interview Prep hub
/interview-prep/[collection]   → Question collection page
/leaderboard                   → Global XP leaderboard
/settings                      → User settings
```

---

## Navigation

### Logged-Out Navbar
```
Logo | Explore | Learn | Roadmaps | Practice | Interview Prep | Leaderboard | Follow on X | Theme Toggle | Log In
```

### Logged-In Navbar
```
Logo | Explore | Learn | Roadmaps | Practice | Interview Prep | Leaderboard | Search (⌘K) | 🔥 Streak | 🔔 | [Upgrade to Premium] | Avatar
```
"Upgrade to Premium" pill is only shown to free users.

### Learn Sidebar (inside /learn/*)
Left sidebar with collapsible concept categories. Each concept shows completion state (not started / in progress / completed). Overall progress percentage at bottom.

---

## Homepage Sections (top to bottom)

1. **Navbar** — logged-out state
2. **Hero** — announcement pill + headline + subheadline + two CTAs + concept switcher tabs (Event Loop / React Rendering / Browser Pipeline / CSS Specificity) with live interactive simulator
3. **Social proof** — "Practice concepts discussed in interviews at" + company logos (Google, Meta, Amazon, Microsoft, Stripe, Airbnb)
4. **How it works** — Visual Understand → Simulate → Challenge → Interview → Build flow
5. **Feature highlights** — 4 cards: "Concepts you can see", "Real engineering challenges", "Interview-ready questions", "Build real things"
6. **Testimonials** — 4–6 quotes from developers who landed jobs or understood a key concept
7. **CTA section** — "Start learning for free" single focused call-to-action
8. **Footer** — Logo, grouped nav links, social links, newsletter signup, legal

Homepage feel: alive, motion-driven, Notion-level polish. Every section has purposeful animation.

---

## Concept Categories

Categories evolve as the platform grows. Current set:
- JavaScript Runtime
- Browser Internals
- React
- CSS
- TypeScript
- Accessibility
- Performance
- System Design

---

## User System

| Feature | Details |
|---|---|
| Auth | Google OAuth + GitHub OAuth via Better-Auth |
| Progress | Tracked per concept, per tab (5 tabs × N concepts) |
| XP | Earned per activity — concept tabs, challenges, interview answers, streak bonuses |
| Streaks | Daily learning streak (current + longest) |
| Leaderboard | Global ranking by total XP |
| Bookmarks | Save concepts, challenges, and interview questions |

---

## Monetization

**Free (70% of content):**
- All concept Understand + Simulate tabs
- Basic challenges per concept
- FF 75, FF JavaScript, FF React (most questions)
- Roadmaps (browse and follow)

**Premium (30% of content):**
- FF System Design (all questions)
- Advanced challenges
- Most Build tab projects (Monaco editor projects) — one free flagship project per category demonstrates the tab before the paywall (Feature 26), same pattern as Challenge/Interview's free flagship content
- Study Plans
- Company Collections (Google, Meta, Amazon, Microsoft, Stripe)
- Priority spaced repetition scheduling

No aggressive paywalls. Users discover value before hitting a gate.

---

## Practice Section

- Monaco Editor in the browser
- Code execution via iframe sandbox (no backend needed)
- Frontend engineering problems only: debounce, throttle, deep clone, custom React hooks, event emitters, state managers
- Not LeetCode-style algorithms — frontend engineering understanding
- Test cases + progressive hints + reference solutions

---

## Interview Prep

Collections:
- **FF 75** — 75 essential frontend questions every developer should know
- **FF JavaScript** — Deep JavaScript runtime and language questions
- **FF React** — React-specific architecture and implementation questions
- **FF System Design** — Frontend system design (mostly premium)

Features:
- Spaced repetition review system (SM-2 algorithm)
- Bookmark individual questions
- Study Plans: guided question sequences (premium)
- Company Collections: questions by company (premium)

---

## Explore Page

Content surfaced in three modes:
- **Featured** — Editor's picks, curated by FF team
- **Trending** — Concepts with highest completion rate this week
- **New** — Recently added concepts

No infinite scroll. Curated, not algorithmic.

---

## Roadmaps

Curated learning paths with ordered concept sequences.

Examples:
- "JavaScript Runtime Mastery" — Scope → Closures → Hoisting → Event Loop → Promises → Async/Await
- "React Expert Path" — Rendering → Reconciliation → Hooks → Performance → State Management
- "Frontend Interview Ready" — Mixed concepts ordered by interview frequency

---

## Features In Scope

- Full homepage with all 8 sections and purposeful motion
- Better-Auth (Google + GitHub OAuth only)
- Light + dark theme with manual toggle and system preference detection
- Learn experience: all 5 tabs required per concept
- 4 hero simulators: Event Loop, React Rendering, Browser Pipeline, CSS Specificity
- Full-featured simulators: Play / Step / Step Back / Restart / Autoplay / Speed control
- Practice section with Monaco editor + browser iframe execution
- Interview prep with spaced repetition (SM-2)
- Roadmaps (curated learning paths)
- Explore page (featured, trending, new)
- XP system + daily streaks + leaderboard
- Global search (⌘K)
- User progress tracking (per tab, per concept)
- Rate limiting on all API routes (Upstash Redis)
- Premium content gating via `is_premium` flag

---

## Features Out of Scope (v1)

- Stripe payments (architecture supports it, implementation is Phase 9)
- Community features (comments, discussions, forums)
- User-generated content
- Mobile app
- Browser extension
- AI-powered explanations or hints
- Multi-language (English only)
- Team / organization accounts
- Email notifications or push notifications
- Social progress sharing
- Video content

---

## Success Criteria

- A developer can sign up and start learning the Event Loop in under 60 seconds
- The simulator teaches the concept without any text explanation being read first
- Users return daily — streak system and XP create intrinsic motivation
- Interview questions feel relevant to real interviews, not generic
- The platform performs at 1M+ monthly users without architectural changes

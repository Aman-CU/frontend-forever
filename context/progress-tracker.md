# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 0 — Foundation
**Last completed:** 01 Design System + Global Styles
**Currently building:** —
**Next:** Phase 0 — Navbar + Footer (Feature 02)

---

## Progress

### Phase 0 — Foundation

- [x] 00 Project Setup
- [x] 01 Design System + Global Styles
- [ ] 02 Navbar + Footer

### Phase 1 — Homepage

- [ ] 03 Hero Section (Static)
- [ ] 04 Company Logos Strip
- [ ] 05 How It Works Section
- [ ] 06 Feature Highlights Section
- [ ] 07 Testimonials Section
- [ ] 08 CTA Section
- [ ] 09 Event Loop Simulator (Hero Version)
- [ ] 10 React Rendering Simulator (Hero Version)
- [ ] 11 Browser Pipeline Simulator (Hero Version)
- [ ] 12 CSS Specificity Simulator (Hero Version)
- [ ] 13 Concept Switcher Wiring

### Phase 2 — Auth

- [ ] 14 Supabase Setup
- [ ] 15 Login Page
- [ ] 16 Auth Callback Handler
- [ ] 17 Logged-In Navbar Variant

### Phase 3 — Database

- [ ] 18 Supabase Tables + RLS
- [ ] 19 Upstash Redis Setup

### Phase 4 — Learn Experience

- [ ] 20 Learn Index Page
- [ ] 21 Concept Page Shell
- [ ] 22 Understand Tab
- [ ] 23 Simulate Tab — Full Simulators
- [ ] 24 Challenge Tab
- [ ] 25 Interview Tab
- [ ] 26 Build Tab
- [ ] 27 Progress API + XP System

### Phase 5 — Practice Section

- [ ] 28 Practice List Page
- [ ] 29 Challenge Editor Page

### Phase 6 — Interview Prep

- [ ] 30 Interview Prep Hub
- [ ] 31 Collection Pages (FF 75, FF JS, FF React)
- [ ] 32 Spaced Repetition Review Session

### Phase 7 — Explore + Roadmaps

- [ ] 33 Explore Page
- [ ] 34 Roadmaps List Page
- [ ] 35 Roadmap Detail Page

### Phase 8 — Leaderboard + Gamification

- [ ] 36 Leaderboard Page
- [ ] 37 Streak System Polish

### Phase 9 — Premium + Stripe

- [ ] 38 Premium Content Gating
- [ ] 39 Stripe Integration

---

## Decisions Made During Build

- **00 Project Setup:** `create-next-app@latest` installed **Next.js 16.2.9** (React 19.2), not Next 15 as named in `architecture.md`. Followed the build-plan's literal `@latest` instruction rather than pinning to 15. Stack decision in `architecture.md` should be read as "Next.js 16" going forward.
  - Breaking change to plan for in **Feature 14 (Supabase Setup)**: Next 16 renames `middleware.ts`/`middleware()` to `proxy.ts`/`proxy()`. The `edge` runtime is not supported in `proxy` (runtime is fixed to `nodejs`). `architecture.md` and `build-plan.md` still say `middleware.ts` — use `proxy.ts` instead when implementing session validation.
  - Breaking change to plan for across all dynamic routes: `params`/`searchParams` (and `cookies()`/`headers()`) are async-only in Next 16 — always `await` them, no synchronous fallback.
  - Turbopack is on by default in 16; `next.config.ts` sets `turbopack.root` explicitly because a stray `package-lock.json` exists at `C:\Users\DEEPSHIKHA\` (outside this repo) which Next's workspace-root inference was picking up.
- **00 Project Setup:** The project folder name `Frontend-Forever` has capital letters, which `create-next-app` rejects as an invalid npm package name for the target directory. Worked around by scaffolding into a throwaway temp directory (lowercase name), moving the generated files into this root, and deleting the temp directory. `package.json` name is set to `frontend-forever`. No separate folder was kept — final project lives directly in this root as intended.
- **01 Design System:** `globals.css` defines the full `ui-tokens.md` token set verbatim in `@theme`, plus a small block of shadcn/ui primitive aliases (`--color-primary`, `--color-card`, `--color-muted`, `--color-ring`, etc., and `--radius-4xl` for `badge.tsx`'s pill shape) that point at our semantic tokens instead of shadcn's default oklch palette. This keeps installed primitives on-brand without ever editing files in `components/ui/`. If a newly-added shadcn component references a semantic class not yet aliased, add the alias in `globals.css` rather than hardcoding a color in the component.
- **01 Design System:** Theme persistence uses `useSyncExternalStore` in `ThemeProvider`, not `useState` + `useEffect`. An effect that calls `setState` synchronously to "correct" SSR state trips the `react-hooks/set-state-in-effect` ESLint rule and is the wrong tool for syncing with an external mutable source (DOM class / localStorage) that can legitimately differ between server and client snapshots. `useSyncExternalStore`'s `getServerSnapshot` (`"light"`) vs `getSnapshot` (real DOM class) split avoids both the lint error and any hydration mismatch — the anti-FOUC script in `layout.tsx` (via `next/script`, not a raw `<script>` tag — raw tags inside a Server Component log a console error) sets the real class before hydration, and a `MutationObserver` notifies React of the change.
- **01 Design System:** Hit a stale Turbopack dev cache during verification — `globals.css` was fully rewritten but the served CSS still reflected the old shadcn token mapping (`.text-accent { color: var(--accent) }` instead of `var(--color-accent)`). Fixed by killing the dev server and deleting `.next` before restarting. Worth trying first if styles look wrong after an unusually large `globals.css` change and the file content looks correct on disk.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

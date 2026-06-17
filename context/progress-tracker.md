# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 0 — Foundation
**Last completed:** 02 Navbar + Footer — UI built and verified (typecheck + lint clean, pixel-checked against design reference in both light and dark mode across 5 rounds of fixes, see Notes below) on `feature/01-design-system`, uncommitted.
**Currently building:** Nothing in progress.
**Next:** Decide branch strategy for Feature 01 + 02 → develop (neither is merged yet) before starting 03 Hero Section (Static)

---

## Progress

### Phase 0 — Foundation

- [x] 00 Project Setup
- [x] 01 Design System + Global Styles
- [x] 02 Navbar + Footer

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

- **02 Navbar + Footer:** `lucide-react@1.20.0` (the version pinned in `package.json`) ships no brand/logo icons at all — no `Github`, `Twitter`, `Linkedin`, etc. Verified by listing the package's exports directly. Used the generic `XIcon` glyph for "Follow on X" in both Navbar and Footer since it's the only icon that visually doubles as the X (Twitter) mark. Check `Object.keys(require('lucide-react'))` before assuming a brand icon name exists.
- **02 Navbar + Footer:** Built on `feature/01-design-system` (not a fresh `feature/02-navbar-footer` branch) because `develop` doesn't have Feature 01 merged yet and the Navbar/Footer depend on its tokens/components. Branching and commit deferred per explicit user instruction — resolve the Feature 01 → develop merge before opening Feature 02's PR.
- **02 Navbar + Footer:** User flagged the Navbar didn't match `designs/hero-section-1-event-loop.png` and wasn't satisfied. Verified by pixel-sampling the reference PNG directly (Python/PIL, sampling darkest pixel per region) rather than eyeballing — confirmed nav link text/icons and the "Follow on X" text are near-black (`text-text-primary`), not the muted `text-text-secondary` gray the component originally used. Pill border-radius (`rounded-2xl`), icon choices, and button styles were already correct against the design. Fixed in `Navbar.tsx` (`NavbarPillLink`, `NavbarMobileLink`, "Follow on X" anchor) and corrected the same wrong claim in `ui-rules.md`/`ui-registry.md`. Verified visually via a Playwright screenshot of the running dev server cropped to the navbar, compared side-by-side against the design crop.
- **02 Navbar + Footer (round 2):** Same design, second pass — user pointed out the pill lacked Y padding, the wordmark was too big relative to `FF`, and the pill's shadow/border were too sharp/solid. Pixel-measured the design: `FF`'s cap-height is ~3x "Frontend Forever"'s. Changed logo to `text-3xl`/`text-sm` (was `text-2xl`/`text-lg`), pill container to `px-1.5 py-2.5` (was `p-1.5`) with `border-border-light` + `shadow-xl` (was `border-border` + `shadow-md`) for a softer, more diffused look. `border-border-light` (`#F3F4F6`) is an existing `ui-tokens.md` token, not a new one. Re-verified with the same Playwright-screenshot-vs-design-crop method. Setup note: no project skill for running this app yet — used `npx playwright@1.61.0` installed into a scratch dir outside the repo (`C:\tmp_pw`) since the project itself has no Playwright dependency; worth generating a `/run` skill if this recurs.
- **02 Navbar + Footer (round 3):** User pointed out the landing page background and navbar background read as the same color. Re-checked the design pixel-by-pixel along the header's bottom edge (away from the pill) and found no border line or color step anywhere — the design's header has no chrome of its own; only the floating pill has a visible surface/border/shadow. Removed `border-b border-border` and changed the header from `bg-surface` to `bg-background` to match, so the page and header are intentionally the same color, exactly like the reference. (The header also already had `sticky top-5`, not `top-0` — navbar floats with a gap from the viewport edge — which is what made the previously-identical-but-technically-different `bg-surface`/`bg-background` colors visible as a seam in the first place.)
- **02 Navbar + Footer (round 4):** Round 3's fix used `--color-background` (#FAFAF9, off-white) on the assumption that the page and header should match each other. Pixel-sampling the full reference PNG (PowerShell `System.Drawing`, not just the header edge this time) showed the *entire* canvas — page margins, gaps between sections, everywhere — samples as pure `#FFFFFF`, identical to the pill's `bg-surface`. So `--color-background` was never actually used in the delivered design; the whole light-mode page is `bg-surface`. Changed `Navbar.tsx`'s header and `page.tsx`'s outer container from `bg-background` to `bg-surface` (scoped to these two files only — `--color-background`/`ui-tokens.md` left untouched, since other future pages may still legitimately want the off-white token; user chose this scoped fix over a global token change). Verified via Playwright screenshot of the running dev server — navbar, header, and page now read as one continuous white, matching the design.
  - Follow-up bug from the same round: `header` uses `sticky top-5`, and `position: sticky` immediately offsets an element away from the viewport edge to satisfy its `top` value — even at scroll position 0, with no scrolling needed. That offset leaves an empty gap in the document flow above the header, which is painted by whatever is behind it: `<body>`'s own background, still `bg-background` at the time. Fixed by changing `body { @apply bg-background ...}` to `bg-surface` in `globals.css`'s `@layer base` block — `<body>` is shared root chrome like the navbar, not per-page content, so this is consistent with the round-4 scoping (not a `--color-background` token edit). Needed another dev-server restart + `.next` cache clear to see the change (same stale-Turbopack-cache issue as the note in Feature 01) — re-verified via pixel sampling the new screenshot: gap and header both read `255,255,255`.
- **02 Navbar + Footer (round 5):** User flagged dark mode as flat/low-contrast and asked for a true black backdrop that's still easy on the eyes, with the navbar/buttons reading more visibly. Root cause: round 4 made `body`/`Navbar` header/`page.tsx` use plain `bg-surface` to pixel-match the light-mode reference (where the whole canvas is one white) — but that same single-token treatment carries into dark mode, where `--color-surface` (`#1A1A1A`) was the *only* tone in play, so the page, header, pill, and card all rendered identically with zero hierarchy (the light-mode design relies on `shadow-xl` for separation, which barely registers on a dark background). Light mode has a real reference screenshot proving "everything is one white" is correct; dark mode has no such reference, and the user's direct feedback is that dark mode specifically needs the opposite — a darker backdrop than its elevated surfaces, which is standard dark-theme practice (e.g. Material's elevation system) since shadows don't carry the separation job in the dark.
  - Fix: kept `bg-surface` in light mode but added `dark:bg-background` on `body` (`globals.css`), `Navbar.tsx`'s header, and `page.tsx`'s outer container — these three now diverge from the pill/card's `bg-surface` only in dark mode. Darkened `--color-background` (dark) from `#111111` to `#0A0A0A` for a true near-black that's still a hair off pure `#000000` (avoids the harsher max-contrast halation against light text that reads as "hurts the eyes"). Lightened the dark border tokens for visibility against the new darker backdrop: `--color-border` `#2A2A2A → #333333`, `--color-border-light` `#222222 → #292929`, `--color-border-muted` `#333333 → #404040`. `--color-surface`/`secondary`/`tertiary`/`elevated` untouched — they didn't need to change since contrast comes from the backdrop getting darker, not from them getting lighter. Mirrored all dark-token changes in `ui-tokens.md` and corrected `ui-rules.md`'s navbar section (still described the old single-token light+dark `bg-background` header from before round 4). Verified via Playwright screenshot of the dev server with `localStorage.theme = 'dark'` + pixel-sampling: header/page sample `#0A0A0A`, pill/card/footer sample `#1A1A1A` — a clear, deliberate two-tone split instead of one flat color.
  - Follow-up: user wanted the footer specifically to match the body/header backdrop in dark mode instead of standing out as a `bg-surface` block — added `dark:bg-background` to `Footer.tsx` alongside its existing light-mode `bg-surface`, same pattern as the header/body/page-container fix above. The `border-t border-border` is now the only thing separating footer from page content in dark mode (as in light mode). Re-verified via pixel sampling: footer samples `#0A0A0A`, matching body/header exactly.

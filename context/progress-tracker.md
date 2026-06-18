# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Homepage, in progress
**Last completed:** 04 Company Logos Strip — UI built and verified (typecheck + lint clean, pixel-checked against `designs/hero-section-1-event-loop.png` in light, dark, and mobile; `/review` ran before merge and its findings were fixed, see Notes below). Merged into `develop` via PR #5.
**Currently building:** Nothing in progress.
**Next:** Start 05 How It Works Section, branching `feature/05-how-it-works` off `develop`

---

## Progress

### Phase 0 — Foundation

- [x] 00 Project Setup
- [x] 01 Design System + Global Styles
- [x] 02 Navbar + Footer

### Phase 1 — Homepage

- [x] 03 Hero Section (Static)
- [x] 04 Company Logos Strip
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
- **03 Hero Section (Static):** Ran the `architect` skill before building — aligned on "static" (full visual fidelity, zero interactive logic; entrance motion only) and resolved two scope decisions with the user: (1) the simulator panel placeholder is a full static replica of the design's Event Loop panel, not the build-plan's literal minimal "card with label + badge" wording, since design screenshots are the source of truth and Feature 09 will later swap in the real interactive engine on the same layout; (2) the 4 concept switcher tabs have no `onClick` in this feature — only Event Loop has any content, so making the other 3 "clickable" with nothing to switch to would be misleading. Real switching is Feature 13.
  - New component location: `src/components/homepage/` (sibling to `layout/`/`shared/`), not `src/features/` — homepage sections are page-level UI, not self-contained features like the simulators. `Hero.tsx`, `ConceptSwitcherTabs.tsx`, `HeroSimulatorPreview.tsx`. See `ui-registry.md` for full details.
  - Headline was first built at the build-plan's literal 56–72px and wrapped onto 2 lines — wrong against the design, which fits it on one line. Diagnosed by resizing the full-resolution design PNG (2731×4096) down to the screenshot's working width (1440) and comparing cropped regions directly, then iterating Tailwind size classes against fresh Playwright screenshots until it matched (down to `text-4xl sm:text-5xl lg:text-5xl` + `max-w-6xl`) — same iterative pixel-compare method as the Navbar fixes, not a one-shot calculation. `ui-rules.md` corrected.
  - Concept switcher tabs were first built as a pill-group with gaps (per the original `ui-rules.md` wording) — wrong against the design, which pixel-inspection at full resolution showed to be one continuous bordered bar split into 4 equal segments by vertical dividers, with the active segment getting a `text-accent` + bottom-border indicator and inactive segments in near-black `text-text-primary` (not muted gray) — same "inactive isn't actually muted" lesson as the Navbar's nav links in Feature 02. `ui-rules.md` corrected.
  - Simulator panel column colors (Call Stack/Web APIs/Microtask Queue/Task Queue = purple/green/blue/orange) were missed entirely on the first pass (everything was gray + teal-active). Caught by cropping the full-resolution design rather than relying on the downscaled thumbnail, which made the per-column color-coding and status icons (checkmark vs. dot) clearly visible. Since `ui-tokens.md` has no generic "purple"/"blue" token, reused the closest existing semantic tokens (`premium`, `success`, `info`, `streak`) outside their original gamification meaning, scoped to this one component — documented in `ui-registry.md` so it isn't mistaken for those tokens' usual semantics elsewhere.
  - Reused the scratch Playwright install at `C:\tmp_pw` from Feature 02 (still present) for screenshots — no project Playwright dependency exists yet. Also hit a stale dev-server-on-port-3000 from a previous session returning HTTP 500; killed it and started fresh (same category of issue as Feature 01's stale Turbopack cache — when a previously-started dev server misbehaves, kill and restart rather than debugging the stale instance).
  - **Follow-up:** after the pixel-accurate continuous-divided-bar tabs were built and verified, the user said they preferred the original pill-group concept instead. Reverted `ConceptSwitcherTabs.tsx` to the pill-group style and corrected `ui-rules.md`/`ui-registry.md` to document this as a deliberate user-requested deviation from `designs/hero-section-1-event-loop.png`, not a mistake — the design's actual tab bar is still the continuous divided style, on record in case a future pass wants to revisit it.
  - **Follow-up 2:** asked whether to revert `HeroSimulatorPreview.tsx`'s colored per-column theme back to the original flat single-accent version too (same pattern as the tabs) — user chose to keep the colored version. That is the confirmed-current state of this component, not a pending revert.
  - **Follow-up 3:** added a fake browser-window chrome bar (`BrowserChromeBar`) above the "LIVE CONCEPT ENGINE" header row, per explicit user request — not present in the design screenshot. 3 traffic-light dots (`bg-error`/`bg-warning`/`bg-success`, since no project token is literally named red/yellow/green) + a centered `frontendforever.dev` address-bar pill with a `Lock` icon. Documented in `ui-registry.md`.
- **02 Navbar + Footer (round 5):** User flagged dark mode as flat/low-contrast and asked for a true black backdrop that's still easy on the eyes, with the navbar/buttons reading more visibly. Root cause: round 4 made `body`/`Navbar` header/`page.tsx` use plain `bg-surface` to pixel-match the light-mode reference (where the whole canvas is one white) — but that same single-token treatment carries into dark mode, where `--color-surface` (`#1A1A1A`) was the *only* tone in play, so the page, header, pill, and card all rendered identically with zero hierarchy (the light-mode design relies on `shadow-xl` for separation, which barely registers on a dark background). Light mode has a real reference screenshot proving "everything is one white" is correct; dark mode has no such reference, and the user's direct feedback is that dark mode specifically needs the opposite — a darker backdrop than its elevated surfaces, which is standard dark-theme practice (e.g. Material's elevation system) since shadows don't carry the separation job in the dark.
  - Fix: kept `bg-surface` in light mode but added `dark:bg-background` on `body` (`globals.css`), `Navbar.tsx`'s header, and `page.tsx`'s outer container — these three now diverge from the pill/card's `bg-surface` only in dark mode. Darkened `--color-background` (dark) from `#111111` to `#0A0A0A` for a true near-black that's still a hair off pure `#000000` (avoids the harsher max-contrast halation against light text that reads as "hurts the eyes"). Lightened the dark border tokens for visibility against the new darker backdrop: `--color-border` `#2A2A2A → #333333`, `--color-border-light` `#222222 → #292929`, `--color-border-muted` `#333333 → #404040`. `--color-surface`/`secondary`/`tertiary`/`elevated` untouched — they didn't need to change since contrast comes from the backdrop getting darker, not from them getting lighter. Mirrored all dark-token changes in `ui-tokens.md` and corrected `ui-rules.md`'s navbar section (still described the old single-token light+dark `bg-background` header from before round 4). Verified via Playwright screenshot of the dev server with `localStorage.theme = 'dark'` + pixel-sampling: header/page sample `#0A0A0A`, pill/card/footer sample `#1A1A1A` — a clear, deliberate two-tone split instead of one flat color.
  - Follow-up: user wanted the footer specifically to match the body/header backdrop in dark mode instead of standing out as a `bg-surface` block — added `dark:bg-background` to `Footer.tsx` alongside its existing light-mode `bg-surface`, same pattern as the header/body/page-container fix above. The `border-t border-border` is now the only thing separating footer from page content in dark mode (as in light mode). Re-verified via pixel sampling: footer samples `#0A0A0A`, matching body/header exactly.
- **04 Company Logos Strip:** Ran the `architect` skill before building. Two decisions resolved with the user up front: (1) pixel-inspecting `designs/hero-section-1-event-loop.png` showed the logo strip actually sits *inside* the hero flow, between the CTAs and the concept switcher tabs — not as a separate page-level section below the whole hero block, which is what the build-plan's feature-by-feature numbering implies. Built it that way (editing `Hero.tsx` from Feature 03 to insert `<CompanyLogosStrip />` and shifting the existing motion stagger for tabs/simulator/scroll-indicator back by ~0.4s to make room), matching the design over the literal build-plan structure — same precedent as Feature 03's own headline-size and tab-style corrections. (2) Feature 03 isn't merged to `develop` yet (no PR opened), so `feature/04-company-logos-strip` branches off `feature/03-hero-section` instead of `develop`, since `Hero.tsx` only exists there.
  - The 6 logos (build-plan listed Google, Meta, Amazon, Microsoft, Stripe, Airbnb) are pixel-sampled as **monochrome** in the design (near-black, `text-text-primary`), not the companies' real brand colors — built as simplified inline-SVG/text components in `src/components/shared/CompanyLogos.tsx` using `currentColor`, not static files in `public/logos/` as build-plan literally says, so they correctly invert in dark mode. Same reasoning as `XLogo` from Feature 02.
  - Caught during visual verification (not by typecheck/lint, which both passed clean before this fix): on mobile the logo row silently overflowed the *page* instead of scrolling internally. Root cause — `Hero.tsx`'s section is `flex flex-col items-center`, and the wrapping `<div>` around `CompanyLogosStrip` (and the component's own root `<div>`) lacked `w-full`; without it, a flex item's cross-axis size shrinks to its content's intrinsic width instead of the viewport's, so the scrollable row never actually became wider than its own box and nothing scrolled. Fixed by adding `w-full` at both levels, matching the pattern `HeroSimulatorPreview`'s wrapper already used. Verified via Playwright screenshots (desktop light/dark, mobile 390px) — confirmed via direct DOM measurement (`scrollWidth` 671 vs `clientWidth` 342 on mobile) before and after the fix, not just visually. Any new full-bleed child added to `Hero.tsx` needs the same `w-full` treatment or it will hit this same silent-overflow bug.
  - **Follow-up:** user supplied real brand SVGs one at a time post-build and asked for each placeholder logo to be swapped in (recolored to `currentColor` to stay monochrome): Google, Meta's icon, Amazon, Stripe all replaced with real path data. One supplied "Meta wordmark" SVG was caught as garbled/mismatched before integration — rendering it standalone first showed it actually spelled "heton" with an unrelated two-circle icon, not "Meta" — so it was rejected rather than wired in; render any future supplied SVG standalone before trusting it. Airbnb was then removed entirely and replaced with Anthropic (real SVG, `fillRule="evenodd"`) per explicit user request, and Cursor was added as a 7th logo (icon + wordmark, two real SVGs) on top of the build-plan's original 6 — the row is now Google, Meta, Amazon, Microsoft, Stripe, Anthropic, Cursor, diverging significantly from build-plan's original 6-company list. All 7 still fit on one line on desktop and the mobile scroll/mask treatment still holds — re-verified visually after each addition.
  - **Follow-up (sizing bug):** user asked if there was an alignment issue. Measured via `getBoundingClientRect()` in the live DOM rather than eyeballing — all 7 logos were already correctly vertically centered (`items-center` working as intended, centers within 2px of each other), but rendered heights ranged from 16px (Anthropic, Cursor, both `h-4`) to 20px (Google, Amazon, Stripe, already `h-5`) to 28px (Meta, Microsoft — driven by Tailwind's `text-xl` default 28px line-height on their text labels, not their icon size). The 28px outliers were fixed by adding `leading-none` to Meta's and Microsoft's text spans, collapsing them back to ~20px to match the rest of the row. Anthropic and Cursor were left at 16px in the final pass — smaller than the other 5 by deliberate choice during cleanup, not an unresolved bug. See `ui-registry.md` for current per-logo sizing and how to bump those two to match if a future pass wants full uniformity.
  - **Follow-up (`/review`):** ran the review skill before PR. Found 3 issues, all fixed:
    1. `CompanyLogos.tsx` bundled 7 unrelated components in one file, against `code-standards.md`'s "one component per file" rule and the project's own `XLogo.tsx` precedent. Split into `src/components/shared/logos/` — one file per logo (`GoogleLogo.tsx`, `MetaLogo.tsx`, `AmazonLogo.tsx`, `MicrosoftLogo.tsx`, `StripeLogo.tsx`, `AnthropicLogo.tsx`, `CursorLogo.tsx`).
    2. `AmazonLogo`'s hardcoded `id="amazon-logo-a"` was a latent DOM-id-collision risk if the shared component were ever rendered twice on one page. Replaced with React's `useId()` so each render gets a guaranteed-unique id.
    3. The logo row was almost entirely invisible to screen readers — verified by reading the live accessibility tree, not just visually: 5 of 7 logos had zero accessible name (pure decorative SVGs with no fallback), and the other 2 leaked their visible text inconsistently. Fixed by making every logo's own markup fully `aria-hidden` and adding one `<span className="sr-only">{name}</span>` per logo in `CompanyLogosStrip.tsx`, so every brand name is announced exactly once regardless of how that logo is built internally. Re-verified via DOM inspection (each wrapper has exactly one un-hidden `sr-only` name + one `aria-hidden` logo root) and confirmed zero visual regression via screenshot diff.

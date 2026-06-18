# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any new component:

1. Check if a similar component already exists in this registry
2. If yes — import and use it. Match its exact class structure if extending
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — add it to this file with:

- Component name
- File path
- What it does
- Key classes or patterns used

This prevents duplicate components and keeps the UI consistent as the codebase grows.

---

## Base UI Primitives (shadcn/ui)

Installed via `npx shadcn@latest add` in Feature 00. Located in `src/components/ui/`. These are unmodified shadcn primitives — compose them in feature/shared components rather than editing directly.

- `button.tsx`
- `dialog.tsx`
- `tabs.tsx`
- `dropdown-menu.tsx`
- `tooltip.tsx` — app must be wrapped in `TooltipProvider` (not yet wired; do this in Feature 01/02 root layout work)
- `badge.tsx`
- `avatar.tsx`
- `switch.tsx`
- `input.tsx`
- `textarea.tsx`
- `separator.tsx`

`src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge), added by shadcn init.

## Providers

- **`ThemeProvider`** — `src/components/providers/ThemeProvider.tsx`. Client component wrapping the app in root layout. Reads/writes the `dark` class on `<html>` and the `theme` localStorage key. Built on `useSyncExternalStore` (not `useState` + `useEffect`) so the client snapshot can differ from the server snapshot (always `"light"`) without a hydration mismatch — the anti-FOUC inline script in `layout.tsx` (via `next/script`, `strategy="beforeInteractive"`) applies the real class before hydration, and a `MutationObserver` in the provider's `subscribe` picks up both that and system-preference changes. Exposes `{ theme, setTheme, toggleTheme }` via context.
- Public hook: `src/hooks/useTheme.ts` — re-exports the provider's context hook as `useTheme()`. Use this from components; don't import `ThemeProvider`'s internals directly.

## Layout Components

### Navbar

File: `src/components/layout/Navbar.tsx`
Last updated: 2026-06-17

| Property         | Class                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Background       | Header: `bg-surface dark:bg-background`. Pill: always `bg-surface` (both themes) |
| Border            | Pill only: `border-border-light` — header itself has no border          |
| Border radius     | Pill container: `rounded-xl`. Active/inactive nav link: `rounded-xl`. Follow-on-X pill, Log In, hamburger: `rounded-lg` |
| Text — primary    | `text-text-primary` — logo, nav link text/icons, "Follow on" text       |
| Text — secondary  | `text-text-secondary` — hamburger icon default state                   |
| Spacing           | Pill: `px-1.5 py-3.5`. Nav link: `px-3.5 py-1.5 gap-1.5`. Follow-on-X: `px-3.5 py-2 gap-1.5`. Logo: `gap-2` |
| Hover state       | `hover:bg-surface-secondary` — inactive nav links, Follow-on-X, hamburger |
| Shadow            | `shadow-xl` — pill only; header carries no shadow                       |
| Accent usage      | `bg-accent-muted text-accent` — active nav link fill only               |

**Pattern notes:**
The header itself has zero chrome (no background distinct from the page, no border, no shadow) — only the floating pill underneath has its own surface/border/shadow. This matches `designs/hero-section-1-event-loop.png`, where pixel-sampling showed the entire light-mode canvas is pure white (`bg-surface`), not the off-white `--color-background` token. In dark mode the header (and `body`, and `Footer`) deliberately switch to `dark:bg-background` instead, diverging from the pill's `bg-surface` — dark themes need a darker backdrop than their elevated surfaces for the pill to read as distinct, since `shadow-xl` barely registers against a dark background. Active nav state uses a pale accent fill (`bg-accent-muted text-accent`), never an underline — a white/transparent active segment would be invisible against the white pill. Any new "floating pill on a flat backdrop" component should reuse this exact `bg-surface`/`dark:bg-background` split, not invent a new one.

### Footer

File: `src/components/layout/Footer.tsx`
Last updated: 2026-06-17

| Property         | Class                                                  |
| ---------------- | --------------------------------------------------------- |
| Background       | `bg-surface dark:bg-background` — same split as Navbar header |
| Border            | `border-t border-border` — top edge only                 |
| Border radius     | None — full-bleed section, no rounded corners            |
| Text — primary    | `text-text-primary` — logo, group headings               |
| Text — secondary  | `text-text-secondary` — link list items (hover → `text-text-primary`) |
| Text — muted      | `text-text-muted` — copyright line                        |
| Spacing           | Container: `px-6 py-12 md:px-8 md:py-16`. Group gap: `gap-10`. Link list gap: `gap-3` |
| Hover state       | `hover:text-text-primary` (links), `hover:bg-surface-secondary hover:text-text-primary` (social icon) |
| Shadow            | None                                                       |
| Accent usage      | None — Subscribe button is `buttonVariants({ variant: "outline", size: "lg" })`, not the filled `default` |

**Pattern notes:**
Uses the identical `bg-surface dark:bg-background` split as the Navbar header (see above) — `border-t border-border` is the only separation from page content in either theme, never a shadow. Subscribe is intentionally outlined/neutral rather than filled-accent, matching the Navbar's Log In button — the filled `default` button variant is reserved for primary CTAs only (e.g. the hero's "Start Learning"). Social row uses the shared `XLogo` glyph, not a `lucide-react` brand icon — see `XLogo` below.

## Shared UI Components

- **`ThemeToggle`** — `src/components/shared/ThemeToggle.tsx`. Icon-only button (`Sun`/`Moon` from `lucide-react`) calling `useTheme().toggleTheme()`. Styled with `bg-surface border-border` + hover `bg-surface-secondary`, 36px (`size-9`) square, `rounded-lg`. Has `aria-label` describing the action it performs (not the current state).
- **`XLogo`** — `src/components/shared/XLogo.tsx`. Inline SVG of the X (formerly Twitter) brand glyph — lucide-react ships no brand icons in this project's pinned version, so the official logo path is inlined. `fill="currentColor"` + `aria-hidden`, defaults to `size-4`, accepts a `className` override. Use this anywhere the X brand mark is needed (Navbar "Follow on X", Footer social row) instead of lucide's `X`/`XIcon` (which is a generic close ✕, not the brand mark).

## Homepage Components

### Hero

File: `src/components/homepage/Hero.tsx`
Last updated: 2026-06-18

Client component (Framer Motion entrance animations). Renders the full static hero: announcement pill, two-line headline, subheadline, two CTAs, `ConceptSwitcherTabs`, `HeroSimulatorPreview`, and a bouncing "Scroll to explore" indicator. No interactive simulator logic yet — that's Features 09–13. Mounted directly from `src/app/page.tsx` (`export default function Home() { return <Hero />; }`).

| Property | Class / detail |
| --- | --- |
| Section | `mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-16 pb-12 text-center md:px-8 md:pt-24` |
| Announcement pill | `bg-accent-muted text-accent rounded-full px-4 py-1.5 text-xs md:text-sm` — "Interactive Learning • Real Challenges • Interview Ready" |
| Headline | One `<h1>`, two `motion.span` lines (stagger), `text-4xl sm:text-5xl lg:text-5xl leading-[1.1] font-bold`, `max-w-6xl` — see `ui-rules.md` note on why this is smaller than the originally-planned 56–72px |
| Headline line 2 | `text-accent` — "You Can Play With." |
| CTAs | `buttonVariants()` / `buttonVariants({ variant: "outline" })` overridden with `h-auto px-6 py-3 text-base font-semibold`, same override pattern as Navbar's Log In link |
| Motion stagger | Pill (0s) → headline line 1 (0.15s) → line 2 (0.25s) → subheadline (0.35s) → CTAs (0.45s) → tabs (0.55s) → simulator panel floats up (0.65s) → scroll indicator fades in + bounces (1s), all `ease: [0.25, 0.46, 0.45, 0.94]` per `ui-rules.md` |

**Pattern notes:**
Headline size was originally implemented at the planned 56–72px and wrapped "Frontend Interview-Ready Concepts" onto 2 lines — wrong against the design, which renders it on one line. Fixed by pixel-measuring the design (resizing the full-res PNG to the screenshot's 1440px viewport width and comparing crops) and iterating candidate Tailwind sizes directly against Playwright screenshots until the wrap disappeared and proportions matched — same iterative screenshot-compare method as the Navbar fixes in Feature 02, not a one-shot pixel-to-font-size formula.

### ConceptSwitcherTabs

File: `src/components/homepage/ConceptSwitcherTabs.tsx`
Last updated: 2026-06-18

Non-interactive (no `onClick`). Renders all 4 tabs with `Event Loop` hardcoded active via a local `ACTIVE_TAB` constant. Real tab switching + cross-fade to the other 3 simulators is Feature 13, once Features 09–12 give the other 3 tabs actual content — making them clickable before that would imply content that doesn't exist yet.

Pill-group style (`inline-flex` container, `bg-surface-secondary` backdrop, each tab its own rounded pill, active = `bg-surface shadow-md`) — by user request, not the design screenshot's actual style. Pixel-inspecting `designs/hero-section-1-event-loop.png` at full resolution shows one continuous divided bar instead; an initial pass matched that exactly, but the user explicitly preferred this pill-group look, so it was kept despite the design mismatch. See `ui-rules.md` for the full note.

### HeroSimulatorPreview

File: `src/components/homepage/HeroSimulatorPreview.tsx`
Last updated: 2026-06-18

Static (non-interactive) full replica of the Event Loop simulator panel from `designs/hero-section-1-event-loop.png` — hardcoded snapshot of the scenario described in `build-plan.md` Feature 09, not a real state machine. Feature 09 will build the actual interactive `features/simulators/event-loop/` engine; this component is expected to be replaced or refactored at that point, not extended.

| Property | Detail |
| --- | --- |
| Outer card | `rounded-2xl border border-border bg-surface shadow-xl`, `BrowserChromeBar` → `PanelHeader` (live-dot + "LIVE CONCEPT ENGINE" + "Running" badge) above a `p-5` body |
| Browser chrome bar | User-requested addition, not in the design — a fake browser window title bar above the panel header: `border-b border-border-light bg-surface-secondary px-4 py-2.5`, 3 traffic-light dots on the left (`bg-error`/`bg-warning`/`bg-success` — no project token is literally "red"/"yellow"/"green", so this reuses the closest semantic tokens rather than hardcoding hex), centered `frontendforever.dev` address-bar pill (`Lock` icon + text, `bg-surface` pill on the `bg-surface-secondary` bar) |
| Column color theme | Each of the 4 panels (Call Stack / Web APIs / Microtask Queue / Task Queue) has its own color, matching the design pixel-for-pixel: purple / green / blue / orange. No project token is named generically "purple" or "blue", so this reuses the existing semantic tokens for that hue — `premium` (Call Stack), `success` (Web APIs), `info` (Microtask Queue), `streak` (Task Queue) — via their `-light` background variant + base text color. This is a deliberate reuse outside those tokens' original gamification/difficulty meaning, scoped to this component only; don't assume `text-info`/`text-streak` elsewhere implies info/streak semantics. The user tried the flat single-theme version (one accent color, no per-column coloring) and went back to this colored version — this is the confirmed-current state, not a pending revert. |
| Item card status icon | `Check` icon (lucide) for completed/resolved states, a small solid dot (`size-1.5 rounded-full bg-{theme}`) for in-progress/waiting states — matches the design's two icon types |
| Code panel | Hand-colored spans (not a syntax highlighter library) using the `Code Syntax Colors` token table in `ui-tokens.md`: `text-accent` for function/method calls, `text-success` for strings, `text-warning` for numbers, `text-text-primary` for punctuation/braces |
| Execution Order bar | Each step's code text is colored by its origin column's theme (`premium`/`info`/`streak`), connected by `MoveRight` icons |
| Insight callout | `Lightbulb` icon + text, with `Promise`/`setTimeout` colored `text-info`/`text-streak` to match their queue's theme |

## Simulator Components

_Will be populated as components are built._

## Learn Components

_Will be populated as components are built._

## Practice Components

_Will be populated as components are built._

## Interview Prep Components

_Will be populated as components are built._

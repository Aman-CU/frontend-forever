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

- **`Navbar`** — `src/components/layout/Navbar.tsx`. Client component (`usePathname` for active-link state). Logged-out variant only. Styled to match `designs/hero-section-1-event-loop.png`. Logo is a plain bold black wordmark — `FF` in `text-5xl font-extrabold tracking-tight text-text-primary` + "Frontend Forever" in `text-sm font-semibold tracking-tight`, `gap-2`, no colored box (an earlier teal-box version was wrong against the design). 6 nav links grouped inside an **elevated white pill** (`rounded-xl border border-border-light bg-surface px-1.5 py-3.5 shadow-xl` — a softer rounded-rectangle, NOT `rounded-full`; the lighter border, larger-blur shadow, and generous container `py` are deliberate, matched against the design's soft/diffused pill — an earlier `border-border`/`shadow-md`/`p-1.5` pairing was too tight and solid-edged), each with a lucide icon matched to the design (Explore=`Compass`, Learn=`LucideGraduationCap`, Roadmaps=`Map`, Practice=`Code2`, Interview Prep=`Users`, Leaderboard=`Trophy`). Right side: "Follow on" + `XLogo` brand glyph pill (`rounded-lg border border-border px-3.5 py-2`), `ThemeToggle`, "Log In" button (`buttonVariants({ variant: "outline" })` + `px-5 py-4` override, applied to a `next/link` `Link`, not the shadcn `Button` itself — avoids fighting base-ui's `render` prop for link semantics). The teal/filled `default` button variant is reserved for primary CTAs; the navbar Log In is intentionally outlined/neutral. `sticky top-5 z-50 bg-surface dark:bg-background`, `h-16`, `max-w-7xl` content — the header has no border of its own (confirmed by pixel-scanning the design for a border line along its bottom edge and finding none). In light mode the header is `bg-surface`, matching the page and the pill exactly — pixel-sampling the full reference PNG showed the *entire* canvas is pure white, not the off-white `--color-background` token. In dark mode the header switches to `dark:bg-background`, deliberately diverging from the pill's `bg-surface` — dark themes need a darker backdrop than their elevated surfaces for the pill to read as distinct, since `shadow-xl` barely registers against a dark background (see `progress-tracker.md` round 4/5 notes). The `top-5` offset (not flush `top-0`) is deliberate — the navbar floats with a gap from the viewport edge; because `position: sticky` enforces its `top` offset immediately (even at scroll 0), that gap is empty flow space painted by `<body>`'s background, which is why `<body>` also carries the same `bg-surface dark:bg-background` treatment (`globals.css`'s `@layer base`). Active nav item: `bg-accent-muted text-accent rounded-xl` subtle fill (a white floating segment would be invisible on the white pill, so a pale-teal fill is used instead); inactive: `text-text-primary hover:bg-surface-secondary` — pixel-sampled the source design PNG to confirm nav link/icon text renders near-black, not the muted `text-text-secondary` gray an earlier pass had used here and in `Follow on X`. Collapses to a hamburger (`Menu`/`X` from lucide) below `lg:` (1024px) rather than the `md:` (768px) most other responsive sections use — the icon-pill nav needs more horizontal room than a plain text-link row. Logged-in variant (search, streak, notifications, avatar dropdown) is Feature 17 — not yet built. lucide-react's brand/logo icons are missing in this project's pinned version (see Footer note below) but its generic concept icons (Compass, GraduationCap, Map, Code2, Users, Trophy, etc.) are all present — check before assuming either way.
- **`Footer`** — `src/components/layout/Footer.tsx`. Server component. `border-t border-border bg-surface dark:bg-background` — same light/dark divergence pattern as the Navbar header (white in light mode, matches the page's near-black `--color-background` in dark mode; the border is the only separation from page content in either theme). Logo is a plain bold wordmark, no colored box — `FF` in `text-3xl font-bold text-text-primary` (a `size-8` flex container, not a filled badge) + "Frontend Forever" in `text-base font-semibold`. Tagline + newsletter form (placeholder `<form>`, no submit handler yet; Subscribe button is `buttonVariants({ variant: "outline", size: "lg" })`, not the filled `default` — kept neutral like the navbar's Log In), 3 link groups (Product — real routes; Company, Legal — `#` placeholders, no pages exist yet), bottom bar with copyright and a social icon row (uses the shared `XLogo` brand glyph). `lucide-react` (this project's pinned version, `1.20.0`) ships no brand/logo icons (no `Github`, `Twitter`, `Linkedin`, etc.) — for the X mark use the shared `XLogo` component (see Shared UI Components); don't import a brand icon name from `lucide-react` without checking it exists first.

## Shared UI Components

- **`ThemeToggle`** — `src/components/shared/ThemeToggle.tsx`. Icon-only button (`Sun`/`Moon` from `lucide-react`) calling `useTheme().toggleTheme()`. Styled with `bg-surface border-border` + hover `bg-surface-secondary`, 36px (`size-9`) square, `rounded-lg`. Has `aria-label` describing the action it performs (not the current state).
- **`XLogo`** — `src/components/shared/XLogo.tsx`. Inline SVG of the X (formerly Twitter) brand glyph — lucide-react ships no brand icons in this project's pinned version, so the official logo path is inlined. `fill="currentColor"` + `aria-hidden`, defaults to `size-4`, accepts a `className` override. Use this anywhere the X brand mark is needed (Navbar "Follow on X", Footer social row) instead of lucide's `X`/`XIcon` (which is a generic close ✕, not the brand mark).

## Homepage Components

_Will be populated as components are built._

## Simulator Components

_Will be populated as components are built._

## Learn Components

_Will be populated as components are built._

## Practice Components

_Will be populated as components are built._

## Interview Prep Components

_Will be populated as components are built._

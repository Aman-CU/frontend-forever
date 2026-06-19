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

Client component (Framer Motion entrance animations). Renders the full static hero: announcement pill, two-line headline, subheadline, two CTAs, `CompanyLogosStrip`, `ConceptSwitcherTabs`, `HeroSimulatorPreview`, and a bouncing "Scroll to explore" indicator. No interactive simulator logic yet — that's Features 09–13. Mounted directly from `src/app/page.tsx` (`export default function Home() { return <Hero />; }`).

| Property | Class / detail |
| --- | --- |
| Section | `mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-16 pb-12 text-center md:px-8 md:pt-24` |
| Announcement pill | `bg-accent-muted text-accent rounded-full px-4 py-1.5 text-xs md:text-sm` — "Interactive Learning • Real Challenges • Interview Ready" |
| Headline | One `<h1>`, two `motion.span` lines (stagger), `text-4xl sm:text-5xl lg:text-5xl leading-[1.1] font-bold`, `max-w-6xl` — see `ui-rules.md` note on why this is smaller than the originally-planned 56–72px |
| Headline line 2 | `text-accent` — "You Can Play With." |
| CTAs | `buttonVariants()` / `buttonVariants({ variant: "outline" })` overridden with `h-auto px-6 py-3 text-base font-semibold`, same override pattern as Navbar's Log In link |
| Motion stagger | Pill (0s) → headline line 1 (0.15s) → line 2 (0.25s) → subheadline (0.35s) → CTAs (0.45s) → company logos strip label + 6 logos staggered (0.5s–0.85s, owned internally by `CompanyLogosStrip`) → tabs (0.95s) → simulator panel floats up (1.05s) → scroll indicator fades in + bounces (1.4s), all `ease: [0.25, 0.46, 0.45, 0.94]` per `ui-rules.md` |

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

### CompanyLogosStrip

File: `src/components/homepage/CompanyLogosStrip.tsx`
Last updated: 2026-06-18

Renders inside `Hero.tsx` between the CTAs and `ConceptSwitcherTabs` — not as a separate page-level section below the whole hero — matching the actual layout in `designs/hero-section-1-event-loop.png` (pixel-inspection showed the strip sits above the simulator panel, not below it, despite build-plan listing it as a separate numbered feature). "Practice concepts commonly discussed in interviews at" label (`text-text-muted`) above a row of 7 logo components from `shared/logos/`: Google, Meta, Amazon, Microsoft, Stripe, Anthropic, Cursor — 6 from the build-plan (Airbnb swapped for Anthropic) plus Cursor added on top, by user request. Client component — each logo fades in with a left-to-right stagger (`delay: 0.55 + index * 0.06`), label fades first at `delay: 0.5`, per build-plan's "Logos fade in staggered left-to-right" note.

| Property | Detail |
| --- | --- |
| Desktop (`sm:` and up) | Row is `justify-center`, `overflow-visible`, no mask — all 7 logos fit on one line within the hero's container width |
| Mobile (below `sm:`) | Row is `overflow-x-auto` with `scrollbarWidth: none` and a `mask-image` linear-gradient edge fade (transparent → black 5%/95% → transparent), since 7 logos don't fit a narrow viewport — matches build-plan's "Subtle horizontal scroll fade on edges (CSS mask)" |
| Color | Label `text-text-muted`, logos `text-text-primary` (parent sets this once; logos use `currentColor`) — both pixel-sampled from the design as monochrome, not the companies' real brand colors |
| Accessibility | Every logo's visual markup is fully `aria-hidden` (the pure-SVG ones directly, the icon+text combos via `aria-hidden` on their wrapping `<span>`); each `motion.div` in the row also renders a `<span className="sr-only">{name}</span>` immediately before `<Logo />`, so every brand name has exactly one accessible name regardless of how that logo is built internally. Verified by checking each wrapper's DOM structure (`sr-only` span present + not hidden, logo root `aria-hidden="true"`) in the live page, not just visually. |

**Pattern notes:**
The wrapping `<div>` in `Hero.tsx` around this component, and this component's own root `<div>`, both need explicit `w-full` — Hero's section is `flex flex-col items-center`, and without `w-full` a flex item's cross-axis size shrinks to its content's intrinsic width (here, the logo row's full unscrolled width) instead of the viewport, which silently breaks the mobile scroll/mask (the element never actually overflows its own box, so nothing scrolls — the *page* overflows instead). Any new full-width child added to `Hero.tsx` must follow the same `w-full` pattern already used by `HeroSimulatorPreview`'s wrapper.

### HowItWorksSection

File: `src/components/homepage/HowItWorksSection.tsx` (STEPS data + section wrapper) + `src/components/homepage/how-it-works/{StepSection,AnimatedHeading,Understand,Simulate,Challenge,Interview,Build}Preview.tsx`
Last updated: 2026-06-19

Feature 05, v3 (third full rebuild this session — see `progress-tracker.md` Decisions Made for why v1 and v2 were each fully replaced rather than kept). "The Learning Model" is now **5 separate full-width sections, one per step**, alternating left/right per step (text-left/visual-right, then visual-left/text-right, repeating), with per-letter kinetic heading animation — built after the user described wanting something closer to notion.com's actual marketing landing page (alternating illustrated feature sections, animated colorful, "texts moving doing something") rather than v2's single switcher card. Mounted as a top-level sibling section after `<Hero />` in `src/app/page.tsx`, same as v1/v2. No design screenshot exists for this section — built from a mix of `build-plan.md`'s text spec and direct back-and-forth with the user describing the motion they wanted.

`StepSection` (`how-it-works/StepSection.tsx`, not in the main file) was originally a local helper inside `HowItWorksSection.tsx`, but that pushed the file to 229 lines against `code-standards.md`'s 200-line file-size rule — moved out after a `/review` pass flagged it. `HowItWorksSection.tsx` now only holds the `STEPS` data array and the outer section wrapper (heading/subtext + the `.map` over `StepSection`); `StepSection.tsx` owns the per-step layout, the icon/glow, and the theme-color lookup. Same `/review` pass also flagged `StepSection`'s and `AnimatedHeading`'s props as inline object types in the function signature (against `code-standards.md:89` and against this codebase's own precedent — `HeroSimulatorPreview.tsx`'s `SimulatorColumnProps` etc., `shared/logos/*.tsx`'s `Props`) — both now use a named `XxxProps` type alias.

| Property | Detail |
| --- | --- |
| `StepSection` (`how-it-works/StepSection.tsx`) | `flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-20`, `lg:flex-row-reverse` applied on every odd index — this is what alternates the layout per step. Text side `lg:w-1/2 text-left`; visual side `lg:w-1/2` centers its `*Preview`. Mobile (`flex-col`, no `lg:` prefix) always stacks text-above-visual regardless of `reversed`, since DOM order never changes — only the `lg:` flex-direction reverses. **`lg:items-start` is load-bearing** — see Pattern notes below, this replaced an earlier `items-center` that made sections look inconsistently aligned against each other |
| Icon | No boxed badge — a soft `absolute size-28 rounded-full opacity-40 blur-2xl` glow (theme-colored, same treatment as the visual panel's background blob) sits behind a large bare icon (`h-20 md:h-24`, custom hand-drawn-style SVG via `next/image unoptimized` — see below), not inside a `rounded-2xl` card. Pops in with a `scale`+`rotate` `whileInView` entrance; the icon itself has a nested continuous `scale`+`rotate` loop (2s, `repeat: Infinity`) so it stays gently "alive" after the entrance finishes. Replaced an earlier `size-16 rounded-2xl` colored-card badge per explicit user request ("remove the icon background card instead a glowing color") and bumped icon size up significantly per the same request ("icons are very small") |
| Heading | `<AnimatedHeading text={step.title} swapColorClassName={...} />` inside an `<h3>` — see below |
| Description | Plain `whileInView` fade/slide paragraph, same pattern as every other homepage section |
| Background blob | An `absolute size-64 rounded-full opacity-20 blur-3xl` div in the step's theme color, sitting behind the visual panel — pure decoration (`aria-hidden`), adds depth/atmosphere without any new assets |
| Floating decorations | Two small `aria-hidden` theme-colored circles (a `Sparkles` icon top-right, a `Plus` icon bottom-left of the visual panel), each looping a gentle `y`/`rotate` float forever (`duration: 2, repeat: Infinity`) — added per explicit user request for more "illustration," not just motion on the existing card |

**Per-step color theme** (added after the user said the first colorless pass looked "ugly" — see Decisions Made in `progress-tracker.md`): each step is assigned one of 5 existing semantic tokens, reused purely for hue the same way `HeroSimulatorPreview` already reuses `premium`/`success`/`info`/`streak` outside their literal gamification meaning — **Understand**=`accent` (teal), **Simulate**=`info` (blue), **Challenge**=`premium` (purple), **Interview**=`success` (green), **Build**=`streak` (orange). One `THEME_CLASSES: Record<ThemeColor, { badge, text, blob }>` lookup map in `StepSection.tsx` drives the icon glow/badge color, the swap-letter highlight color, and the blob color (originally three separate same-shaped maps — consolidated into one during the `/review` pass since they were keyed identically) — add a 6th step by adding one more entry to this single map, not by inventing a new color system.

**Pattern notes — alignment:** the original `items-center` on `StepSection`'s root flex container vertically centered the text column against the visual column. Because each step's preview card has a different natural height (`SimulatePreview` is taller than the others — status row + 2×2 grid + controls row), centering made the icon badge/heading start at a different height in every section, reading as "randomly" misaligned even though the structure was identical. Switched to `lg:items-start` so every section's text block and visual block share the same top edge regardless of either side's content height — the fix is purely about the *alignment reference point* (top vs. center), not spacing or sizing.

**Pattern notes — continuous motion:** every other homepage section (including this one's entrance animations) uses one-shot `whileInView` triggers. The floating decorations and the small per-card "alive" touches (lightbulb pulse, the Simulate dot's back-and-forth, the Challenge code block's blinking cursor, the Interview thumbs-up wiggle, the Build wrench wiggle + button pulse) are the first **continuous, infinite** Framer Motion loops in this codebase, added per explicit user request ("animate every 2 second so it could be more attractive and interactive"). All use plain `animate` (not `whileInView`, since they should run indefinitely, not just once) with `transition: { duration: 2, repeat: Infinity }`, and all only animate `transform`/`opacity`-safe properties (`scale`, `rotate`, `y`, `left` on an absolutely-positioned span, `opacity`) — kept deliberately small in count (1–3 looping elements per section) and cheap so 5 sections' worth of perpetual loops stays lightweight, consistent with the project's explicit "shouldn't hang" requirement from the v2→v3 redesign.

**`AnimatedHeading`** (`how-it-works/AnimatedHeading.tsx`) — per-letter kinetic typography, by explicit user request (their example: "Understand"'s two `d`s should fly past each other in a parabolic arc and swap positions; other letters flip/rotate in"). Generic algorithm, not 5 hand-picked choreographies: `findSwapPair(text)` finds the repeated letter whose two occurrences are farthest apart (tie-broken by whichever starts later in the word) and assigns that pair the arc-swap treatment; every other letter gets a flip-rotate-in. This mechanically reproduces the user's own "Understand" example (the two `d`s) with no manual override. Words with no repeated letter (**Simulate**, **Build**) just get the flip-rotate-in on every letter. Worked out per word: **Understand** → swap the two `d`s; **Challenge** → swap the two `e`s; **Interview** → swap the two `i`s; **Simulate**/**Build** → no swap.

**Critical implementation detail — why this uses Framer Motion variants + `staggerChildren`, not per-letter `whileInView`:** the first version gave each letter its own independent `whileInView`/`viewport` trigger. This shipped a real bug, caught only through direct DOM inspection (not visually obvious in every screenshot): a letter's *pre-trigger* resting transform was `rotateX(-90deg)`, which collapses that letter's rendered bounding box to **zero height** (no `perspective` is set, so the 3D rotation fully foreshortens). A zero-area element can fail to ever register as "intersecting" with Framer Motion's IntersectionObserver-based `whileInView`, so some letters (observed: the first 3 letters of "Simulate" on mobile) got permanently stuck invisible at `opacity: 0`, while sibling letters on the exact same line happened to trigger fine — a non-deterministic, hard-to-spot failure mode. Fixed by moving the single `whileInView`/`viewport` trigger to the **parent container only** (which always has a healthy, non-degenerate bounding box) and propagating the reveal to children via Framer Motion's `variants` + `transition: { staggerChildren }` — the idiomatic Framer Motion pattern for "stagger a group of children," and one that never asks a tiny/transformable element to self-report its own visibility. Also softened the flip angle from `-90deg` to `-60deg` as a second safety margin against any future zero-area edge case. **If anything in this codebase ever needs a per-letter or per-item entrance animation again, observe the parent, not each tiny child — this is the reason why.**

For the swap-pair letters specifically: `dx` (how far a letter must travel) is computed via `useLayoutEffect` measuring each letter span's real `getBoundingClientRect().left` once mounted (re-measured on window resize, debounced via the resize listener itself, since the same word renders at different font sizes per breakpoint) — not a hardcoded pixel value, so it self-adjusts to whatever font size/weight/breakpoint is in play.

**Icon assets** (`public/icons/how-it-works/`): `bulb-icon.svg`, `sync-arrow-icon.svg`, `trophy-icon.svg`, `chat-bubble-icon.svg`, `wrench-icon.svg` — user-supplied hand-drawn/doodle-style icons (thick uneven outline, flat color fill), generated externally per explicit user request after the lucide-icon badges were judged not "illustrated" enough. Referenced from `STEPS` in `HowItWorksSection.tsx` via `iconSrc`/`iconWidth`/`iconHeight` and rendered with `next/image`'s `unoptimized` prop (Next's built-in image optimizer blocks SVG input by default for security — `dangerouslyAllowSVG` would be a `next.config.ts` change with XSS tradeoffs; `unoptimized` avoids that entirely while keeping the component as `next/image`, satisfying `eslint-config-next`'s `no-img-element` rule). Sized via `className="h-20 w-auto md:h-24"` rather than a fixed `size-*`, since these are tall (~2:3) portrait SVGs, not square — squashing them into a square box would distort them the way lucide's 1:1 icons never needed to worry about.

The 4 non-bulb icons lean toward their step's theme hue (sync-arrow blue, trophy purple, chat-bubble green, wrench orange) but aren't flat single-color — each has hundreds to over a thousand unique fill values, an artifact of however the source images were vectorized/traced, not a deliberate gradient design. `bulb-icon.svg` came out pure grayscale with no teal at all; kept as-is per explicit user decision (reads fine as a monochrome icon against the teal badge background) rather than round-tripping a regeneration.

**Real bug — negative `viewport` margin can permanently strand a small element's `whileInView` on short (mobile) viewports.** The icon's entrance (`motion.div` wrapping the glow + icon) used this codebase's universal `viewport={{ once: true, margin: "-80px" }}` convention, copied from every other `whileInView` in the project. On mobile (390×844) specifically, this element got permanently stuck at its `initial` state (`opacity: 0`) — confirmed via direct inline-style inspection, not just a screenshot guess, the same diagnostic method used for the AnimatedHeading zero-height bug earlier in this feature. Isolated by elimination: the sibling `<motion.p>` description two lines below, using the identical `whileInView`/`margin: "-80px"` pattern, triggered correctly every time — so the failure was specific to this one element, not a general viewport-trigger breakdown. Ruled out the nested continuously-animating icon (`motion.span` with `animate`+`repeat: Infinity`) as the cause by temporarily stripping it — still stuck. Fixed by removing the `margin: "-80px"` from this element's `viewport` prop (now just `{ once: true }`) — confirmed via the same inline-style check across all 5 steps on mobile, all now resolve to `opacity: 1`. **Root cause is unconfirmed** (most likely an edge case in how this specific small/short element's geometry interacts with a -80px-inset root margin on a short viewport, possibly a Framer Motion/browser IntersectionObserver quirk rather than anything specific to this component's JSX) — if another small, short, low-on-the-page element ever silently fails to animate in on mobile only, try dropping its `margin` value before assuming the bug is elsewhere.

**Performance note:** the 5 source files were 104–196 KB each (~780 KB total) — large for simple icons, caused by excessive path-coordinate precision from the tracing process, not real visual complexity. Ran `npx svgo --precision 2` on all 5 in place (lossless for this purpose — verified via before/after screenshots that nothing visibly changed at display size), bringing the total down to ~108 KB (86–92% reduction per file). If more icons are added to this set later, run them through the same `svgo` pass before committing — don't assume an exported "SVG" from an image-generation tool is already lean.

**Per-step preview components** (`how-it-works/` subfolder, one file each, kept and upgraded from v2 rather than thrown away — the actual visual content was already approved at small scale): `UnderstandPreview` (Key Insight callout), `SimulatePreview` (mini Call Stack/Web APIs panels + a token animating between them once on scroll-in), `ChallengePreview` (code snippet + staggered pass/fail badges), `InterviewPreview` (Q&A card + knew-it/review buttons), `BuildPreview` (code snippet + `buttonVariants()` "Mark Build Complete"). Enlarged from v2's `max-w-sm p-5` to `max-w-md p-8`, each wrapped in its own `whileInView` scale/opacity entrance plus one small internal motion touch. All animations are one-shot (`viewport={{ once: true }}`) and transform/opacity-only — no continuous loops, no GSAP (this project is Framer-Motion-only per `architecture.md`; the user's own "shouldn't hang, should be lightweight" requirement was the explicit reason for staying one-shot rather than continuous scroll-linked, same lesson already learned the hard way in v1).

Each card's outer shell is now `rounded-3xl bg-{step's theme}-{light|muted} p-8 shadow-sm` — no `border`, no flat `bg-surface-secondary` — replacing the original "gray bordered settings-panel" look with a soft theme-tinted "illustrated panel" feel. Inner elements that need to read as a distinct surface on top of that tint (the mini Call Stack/Web APIs boxes, code `<pre>` blocks, the Q&A knew-it/review pills) switched from `border border-border bg-surface` to a borderless `bg-surface` + `shadow-sm`, so contrast comes from elevation/shadow against the tinted card rather than a hard border — consistent with dropping borders as the general direction of this redesign. Status colors inside a card (pass/fail green/red, "Marked as understood" green check) intentionally stay semantic (`success`/`error`) regardless of the card's own theme color — only the card shell, icon badge, and one or two accent touches per card take on the step's theme.

### FeatureHighlightsSection

File: `src/components/homepage/FeatureHighlightsSection.tsx` (FEATURES data + section wrapper) + `src/components/homepage/feature-highlights/{FeatureCard,SimulatorMiniVisual,CodeSnippetMiniVisual,QAMiniVisual,EditorMiniVisual}.tsx`
Last updated: 2026-06-19

Feature 06. "What Makes Frontend Forever Different" — a deliberate departure from the build-plan's literal flat 2×2 grid spec, built after asking the user for creative direction: a **bento layout**, one larger full-width "hero" card for "Concepts You Can See" (the platform's actual differentiator, per `AGENTS.md`) on top, with the other 3 cards ("Real Engineering Challenges", "Interview-Ready Questions", "Build Real Things") in an equal-width 3-column row below — single column, hero-first, on mobile. Mounted as a top-level sibling section after `<HowItWorksSection />` in `src/app/page.tsx`.

| Property | Detail |
| --- | --- |
| `FeatureCard` (`feature-highlights/FeatureCard.tsx`) | Shared themed card shell. `hero` boolean prop switches layout: hero = `lg:flex-row` (icon/title/description ~40% left, visual ~60% right, larger type), supporting = `flex-col` (icon/title/description stacked above a smaller visual). One `THEME_CLASSES: Record<FeatureThemeColor, { card, glow, icon }>` lookup drives card background tint, icon glow color, and icon color per card — same one-map-not-several-parallel-maps pattern as `StepSection`'s `THEME_CLASSES`. Icon convention matches `ui-rules.md`'s homepage "hero icon" rule: no boxed badge, a soft `absolute size-20 rounded-full opacity-30 blur-xl` glow behind a bare `lucide-react` icon (no custom SVGs sourced for this feature) |
| Color theme | **Independent of Feature 05's mapping** — explicit user decision, not an attempt to mirror Simulate/Challenge/Interview/Build's blue/purple/green/orange. Concepts You Can See=`accent` (teal), Real Engineering Challenges=`info` (blue), Interview-Ready Questions=`premium` (purple), Build Real Things=`success` (green). Cards use the `-light` background variant + base text/icon color throughout (e.g. `bg-accent-light` + `text-accent`), matching the `bg-{color}-light` + `text-{color}` pairing already established in `ui-tokens.md`'s own Color Usage Guide table |
| Icons | `lucide-react`: `Eye` (Concepts You Can See), `Code2` (Real Engineering Challenges), `MessageCircleQuestion` (Interview-Ready Questions), `Hammer` (Build Real Things) |
| Motion | Plain one-shot `whileInView` fade+slide stagger per card (`delay: 0.1 * index` for the 3 supporting cards) — **no continuous/infinite loops**, by explicit user choice, unlike Feature 05's ambient-motion treatment. Section heading/subtext use the same `whileInView` pattern as every other homepage section |
| Mini-visuals (`feature-highlights/{Simulator,CodeSnippet,QA,Editor}MiniVisual.tsx`) | Brand-new, smaller, **static** (no own motion, no `'use client'` — plain presentational functions, per `code-standards.md`'s "no `'use client'` preemptively") components, one per card — built fresh rather than reusing/shrinking Feature 05's `*Preview` components, to avoid coupling this feature to Feature 05's internals. `SimulatorMiniVisual` (mini Call Stack/Web APIs/Queue panel grid + a local unexported `MiniPanel` sub-component), `CodeSnippetMiniVisual` (code snippet + pass/fail counts), `QAMiniVisual` (question/answer + "X of Y answered" pill), `EditorMiniVisual` (code snippet + a `buttonVariants({ size: "sm" })` "Run in Sandbox" pill) |

**Pattern notes — layout decision:** the build-plan's literal spec for this feature is a flat, uniform 2×2 grid. Asked the user directly for creative input on a better way to "showcase the platform" rather than building the literal spec or escalating it into a second full Feature-05-style alternating-sections layout (explicitly rejected as an option, to avoid two back-to-back homepage sections with near-identical shape) — landed on the asymmetric bento (1 big + 3 small) specifically because it lets "Concepts You Can See" (the simulator-first differentiator the whole product is built around) visually outrank the other 3 supporting features, rather than all 4 reading as equally weighted.

**Pattern notes — avoided a real dark-mode bug before it shipped:** `EditorMiniVisual` was first drafted with a true Monaco-style fixed-dark code block (`bg-[#1E1E1E]`, the documented exception in `ui-rules.md` for Monaco chrome) paired with `text-text-inverse`. Caught before committing that `--color-text-inverse` is "inverse of the current theme" (white in light mode, near-black in dark mode per `ui-tokens.md`'s dark overrides) — not "fixed light" — so it would have gone invisible against the fixed-dark background the moment dark mode was toggled. Dropped the special-cased dark mockup in favor of the same light `bg-surface-secondary` + `text-text-secondary` code-block treatment the other 3 mini-visuals already use, which also keeps all 4 cards visually consistent. **If a future component ever wants a genuinely fixed-dark (theme-independent) surface outside the actual Monaco editor, don't pair it with `text-inverse` — that token tracks the page theme, not a fixed polarity.**

### Company logo components

Folder: `src/components/shared/logos/` — one file per component (`GoogleLogo.tsx`, `MetaLogo.tsx`, `AmazonLogo.tsx`, `MicrosoftLogo.tsx`, `StripeLogo.tsx`, `AnthropicLogo.tsx`, `CursorLogo.tsx`), each a single named export.
Last updated: 2026-06-18

Originally built as one `CompanyLogos.tsx` file with all 7 exports — split into this folder during `/review` because `code-standards.md` reserves multi-export files for "small sub-components used only by the parent," not 7 independent siblings, and the project's own `XLogo.tsx` precedent already puts one shared icon per file. Each file defines its own local `type Props = { className?: string }` (matching `XLogo.tsx`'s pattern — not worth a shared type module for something this small).

`fill`/`stroke="currentColor"` throughout so each logo inherits `text-text-primary` like a lucide icon does — same rationale as `XLogo` above. Plain inline-SVG/text components, not static files in `public/logos/` (deviates from build-plan's literal "SVG logos in `public/logos/`" wording, intentionally, so they can inherit theme color in both light/dark mode rather than being locked to one static color).

`GoogleLogo` (`viewBox 0 0 272 92`), `MetaLogo`'s icon glyph (`viewBox 0 0 24 24`), `AmazonLogo` (`viewBox 0 0 603 182`), `StripeLogo` (`viewBox 0 0 512 214`), `AnthropicLogo` (`viewBox 0 0 182 24`, `fillRule="evenodd"` — required for the letterforms' counters to render correctly), and `CursorLogo` (icon `viewBox 0 0 466.73 532.09` + wordmark `viewBox 0 0 1655.29 278.83`, two separate `<svg>`s in a flex row) use the real brand path data — user-supplied SVGs, recolored from their actual fills (Google's `#EA4335`/`#FBBC05`/`#4285F4`/`#34A853`, Meta's solid black, Amazon's `#221f1f` wordmark + `#f90` swoosh, Stripe's `#635BFF`, Anthropic's `#000`) to a single `currentColor` to match this strip's monochrome treatment. `AnthropicLogo` replaces the build-plan's original `AirbnbLogo` (removed entirely, by user request — not present anywhere in the codebase anymore). `CursorLogo` is a 7th logo added on top of the build-plan's original list, also by user request. `MicrosoftLogo` remains a simplified monochrome icon recreation, not sourced from the real brand assets — swap it for real path data the same way if/when supplied, and render any newly-supplied SVG standalone first to confirm it actually depicts the intended brand before wiring it in (caught a mismatched/garbled SVG passed off as Meta's wordmark this way — it actually rendered as unrelated text "heton" with a generic two-circle icon).

`AmazonLogo`'s repeated "a" reuses `<use href={"#" + aGlyphId}>` where `aGlyphId` comes from React's `useId()`, rather than a literal hardcoded `id="amazon-logo-a"` (the source SVG's original approach). `useId()` guarantees a unique id per render, so if `AmazonLogo` is ever mounted more than once on the same page, the two instances won't collide on DOM id — a literal string id would silently break the second instance's `<use>` reference (resolves to the first instance's path) with no error. `useId()` works in this component without `"use client"`, since it's deterministic and doesn't require browser APIs.

`MetaLogo`, `MicrosoftLogo`, and `CursorLogo` wrap their icon+text combo in a `<span aria-hidden="true">` (previously only the inner `<svg>` was `aria-hidden`, leaving the visible text leak into the accessibility tree inconsistently) — now every logo's own markup is fully decorative, and the accessible name comes solely from the `sr-only` span added in `CompanyLogosStrip.tsx`. An earlier version of this caused `getBoundingClientRect()`-measured heights to diverge (16px–28px) across the row before sizing was normalized — see `progress-tracker.md` Feature 04 notes for that history.

**Sizing** (verified via `getBoundingClientRect()` in the live DOM, not just by eye): `GoogleLogo`, `AmazonLogo`, `StripeLogo` use `h-5` (20px). `MetaLogo` and `MicrosoftLogo` are icon+text combos — both text `<span>`s have `leading-none` added (Tailwind's default `text-xl` line-height is 28px, which made these two render visibly larger/chunkier than the rest of the row before this was added; `leading-none` collapses the line box down to ~20px, which is what now sets each wrapper's overall height even where the icon itself is smaller, e.g. `MicrosoftLogo`'s `size-4` icon centers inside its taller 20px text box). `AnthropicLogo` (`h-4`) and `CursorLogo` (icon `h-4`, wordmark `h-3`) render at 16px, visibly smaller than the other 5 — a deliberate final-pass choice, not an oversight; if a future pass wants every logo at a uniform height, bump these two to `h-5`/`h-3.75` (preserving `CursorLogo`'s 4:3 icon:wordmark ratio) and re-verify with `getBoundingClientRect()`, the same way this was checked here.

## Simulator Components

_Will be populated as components are built._

## Learn Components

_Will be populated as components are built._

## Practice Components

_Will be populated as components are built._

## Interview Prep Components

_Will be populated as components are built._

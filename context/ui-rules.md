# UI Rules

Rules for building Frontend Forever UI. The design references are the source of truth for visual decisions. These rules cover the most critical patterns to keep the UI consistent, polished, and on-brand.

---

## Design Philosophy

Frontend Forever should feel like:
- **Notion** — clean, spacious, alive with subtle motion
- **Linear** — precise, minimal, professional
- **Stripe** — premium, trustworthy, high craft

Avoid, **for app UI** (navbar, Learn experience, simulators, dashboards, anything the user works inside):
- Dark hacker aesthetics
- Purple gradients or neon effects
- Gaming / crypto visuals
- Heavy marketing copy patterns
- Anything that feels like a typical SaaS dashboard

**Exception — homepage marketing sections** (Hero and below: How It Works, Feature Highlights, Testimonials, CTA, etc.): these are allowed to be more vivid than the rule above — colorful per-section glow/blur accents, continuous ambient motion, hand-drawn illustration — closer to notion.com's actual landing page than Notion-the-*app*'s restraint. This was an explicit, repeated user direction during Feature 05 (How It Works), confirmed as the standing default for upcoming homepage sections, not a one-off. See `Motion → Continuous/Ambient Motion` and `Color → Multi-Item Hue Theming` below, and `HowItWorksSection` in `ui-registry.md` for the reference implementation. The "avoid neon/gradients" rule still fully applies once a user is *inside* the product (Learn, Practice, dashboards) — this exception is homepage-only.

---

## Font

Always import Inter via `next/font/google` in the root layout:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
```

Apply the font variable to the `<html>` tag. The `--font-sans` variable is declared in `@theme` in globals.css. Never use system fonts as the primary typeface.

---

## Layout

- **Page max-width:** 1280px, centered with `mx-auto`
- **Page horizontal padding:** `px-6` (24px) on mobile, `px-8` (32px) on desktop
- **Navbar height:** 64px, full viewport width, `bg-surface` background
- **Learn sidebar width:** 260px fixed, full height
- **Main content max-width in Learn:** 900px centered in the remaining space
- **Homepage hero:** full width, no max-width constraint
- **Section vertical spacing:** `py-16` (64px) to `py-24` (96px) between homepage sections

---

## Navbar

### Logged-Out
- Logo left (plain bold black wordmark, no colored box): `FF` is much larger than the wordmark next to it — `text-3xl font-extrabold tracking-tight text-text-primary` for `FF`, `text-sm font-semibold tracking-tight text-text-primary` for "Frontend Forever", `gap-2` between them. Confirmed by pixel-measuring the design PNG: `FF`'s cap-height is roughly 3x the wordmark's — a flat `text-2xl`/`text-lg` pairing reads far too close in size.
- Nav links live inside an **elevated white pill**: `rounded-2xl border border-border-light bg-surface px-1.5 py-2.5 shadow-xl` (a softer rounded-rectangle, NOT a full `rounded-full` stadium). Generous vertical padding (`py-2.5` on the container, not just on each link) and the lighter/softer `border-border-light` + larger-blur `shadow-xl` are both deliberate — the design's pill has visible Y breathing room and a diffused, low-contrast shadow/border, not a tight `border-border`/`shadow-md` pairing.
- Each nav link has an icon (14px) + label, `gap-1.5`, `px-3.5 py-1.5`, `rounded-xl`
- Active nav item: subtle filled segment inside the pill — `bg-accent-muted text-accent` (the white pill means a white floating segment wouldn't read; a pale-teal fill does)
- Inactive nav items: transparent, `text-text-primary font-medium hover:bg-surface-secondary` — verified by pixel-sampling the source design PNG (darkest text pixel is pure black, not `text-text-secondary`'s `#6B7280`); an earlier version of this doc claimed muted gray, which was wrong
- The header bar itself has **no border of its own** — no `border-b`. Confirmed by scanning the design pixel-by-pixel along the header's bottom edge: no detectable border line or color step anywhere outside the pill. In light mode the header (and `body`, and the page's own root container) is `bg-surface` (pure white) — pixel-sampling the full reference PNG showed the *entire* canvas is `#FFFFFF`, identical to the pill, not the off-white `--color-background` token. In dark mode, header/body/page use `dark:bg-background` instead, deliberately diverging from the pill's `bg-surface` — dark themes need a darker backdrop than their elevated surfaces for the pill/cards/buttons to read as distinct, since box-shadow (which carries that job in light mode) barely renders on a dark background.
- Sticky, offset from the very top of the viewport: `sticky top-5 z-50` (not flush `top-0`) — the navbar floats with a gap above it, page background visible around it
- Right side: "Follow on X" text pill (`rounded-lg border border-border`, text/icon `text-text-primary` — also near-black in the design, not muted), theme toggle, "Log In" button (`variant="outline"`, `rounded-lg`). The teal/filled `default` button variant is reserved for primary CTAs (e.g. the hero's "Start Learning") — the navbar Log In stays neutral/outlined so it doesn't compete.
- Collapses to hamburger below `lg:` (1024px) — the icon-pill nav needs more room than a plain text-link row would

### Logged-In (additional elements)
- Search bar in center: placeholder "Search labs, topics, questions..." with ⌘K shortcut chip
- Streak: 🔥 icon + number, `text-streak font-semibold`
- Notification bell: icon button
- "Upgrade to Premium" pill: `bg-premium-light text-premium text-xs font-medium rounded-full px-3 py-1` — only shown to free users
- Avatar: circular, 36px, with dropdown on click

---

## Motion

Motion is a first-class citizen in Frontend Forever. Use it to teach, not decorate.

### Rules
- Every motion must communicate something (state change, data flow, process)
- Use `framer-motion`'s `AnimatePresence` for mounting/unmounting elements
- Default easing: `ease: [0.25, 0.46, 0.45, 0.94]` (smooth deceleration)
- Default duration: `0.2s` for micro-interactions, `0.35s` for layout shifts, `0.5s` for page transitions

### Homepage Sections
Each homepage section should use scroll-triggered entrance animations:
```typescript
// Standard section entrance
initial={{ opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-80px' }}
transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
```

### Simulator Animations
- Items moving between panels: `layout` prop on Framer Motion elements for smooth FLIP animations
- New items appearing: `initial={{ opacity: 0, scale: 0.9 }}` → `animate={{ opacity: 1, scale: 1 }}`
- Items being removed: `exit={{ opacity: 0, x: 20 }}`
- Execution highlight: pulse animation using `keyframes`
- Step connector arrows: `pathLength` animation with SVG `motion.path`

### Micro-interactions
- Button hover: `whileHover={{ scale: 1.02 }}` (subtle only)
- Card hover: `translateY(-2px)` + shadow increase via CSS transition
- Tab switching: sliding underline indicator with `layoutId` for shared layout animation
- Concept switcher: cross-fade between simulators with `AnimatePresence mode="wait"`

### Continuous / Ambient Motion (homepage marketing sections only)

Added for Feature 05 (How It Works) per explicit user request — confirmed as the standing pattern for homepage sections going forward, not a one-off. Distinct from every other motion rule on this page, which is one-shot (`whileInView`, fires once and stops): this is `animate` with `repeat: Infinity`, runs forever once mounted, used to make a section feel "alive" rather than just revealed.

```typescript
// Continuous ambient loop — small accent elements only
animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 0] }}
transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
```

Rules:
- Keep it to 1–3 small looping elements per section (an icon, a couple of floating decorative shapes, one signature touch inside a card) — transform/opacity only, never layout-affecting properties. This is what keeps "ambient motion everywhere" from becoming "the page never settles down" or hurting performance — these loops never pause once started, including after the user scrolls away, so the count must stay small.
- Don't put a continuous loop and a `whileInView` entrance on the *same* element if that element is small/short — see the gotcha below.
- **Confirmed exception — `PlatformGraph` (Feature 06, `homepage/feature-highlights/`).** Runs ~12 concurrent loops (one traveling dot per topic-to-collection line — 8 total, each a different color and independently timed — plus a 2-layer border-glow chasing the center card's perimeter, a pulse behind it, and one floating icon), well past the 1–3 guidance above. This was explicit, repeated user direction (not an oversight) for this one hero visual specifically — the rest of the section's cards still follow the 1–3 rule normally. Don't treat this as license to add more loops elsewhere by default; treat each new continuous-motion request on its own terms the way this one was. Every continuous element here respects `prefers-reduced-motion` (via Framer Motion's `useReducedMotion()`) by collapsing to a static frame instead of looping — do the same for any future continuous-loop addition, on this section or others.

**Gotcha — `viewport={{ margin: "-80px" }}` can permanently strand a small/short element's `whileInView` on mobile.** This codebase's standard one-shot entrance uses `margin: "-80px"`. One element in `HowItWorksSection` (a small icon, not the nested continuous loop inside it) got permanently stuck invisible on mobile viewports only with that margin — fixed by dropping the margin for that element (`viewport={{ once: true }}`, no `margin`). Root cause inside Framer Motion/the browser's IntersectionObserver wasn't confirmed, but the fix was verified across all instances. If a small or short element's entrance animation silently never plays on mobile, try removing its `margin` before assuming the bug is elsewhere. Full diagnostic writeup: `ui-registry.md` → `HowItWorksSection` → "Real bug."

### Kinetic Typography (homepage marketing sections only)

Per-letter animated headings, built for Feature 05's `AnimatedHeading` component (`src/components/homepage/how-it-works/AnimatedHeading.tsx`) — reusable for other homepage sections that want a heading to feel hand-crafted rather than just fading in as a block.

- Split the heading text into one `motion.span` per letter, animate the group via Framer Motion `variants` + `transition: { staggerChildren }` on the **parent** — never give each individual letter its own independent `whileInView`/`viewport` trigger. A tiny letter-sized element can collapse to a zero-area bounding box mid-animation (e.g. `rotateX(-90deg)` with no `perspective` set fully foreshortens it) and a zero-area element can permanently fail to register as "intersecting," silently stranding that one letter while its siblings animate fine. Observe the parent only, propagate down via variants.
- A nice default flourish: if the word has a repeated letter, the two occurrences can swap positions via a measured `x`/`y` arc (see `findSwapPair` in `AnimatedHeading.tsx`) while the rest of the letters do a simple flip/rotate-in. Not required for every heading — use judgment per word.

---

## Icons & Illustration

**Default everywhere: `lucide-react`.** This remains the standard icon source for nav, buttons, tabs, badges, simulators, app UI — everything outside homepage marketing sections.

**Homepage marketing sections may use custom hand-drawn/doodle-style icon SVGs instead** — thick uneven outline, flat single-color fill, no gradients/shading (see `public/icons/how-it-works/`, built for Feature 05). This is not something to generate automatically — there's no image-generation tool available in this environment, so these come from either the user supplying files directly or a licensed icon pack (IconScout/Flaticon "hand drawn doodle" collections were the source used for Feature 05). Don't block a feature on sourcing these — fall back to lucide icons with the same wrapper treatment (below) and swap in custom icons later if/when supplied.

Whichever icon source is used, the wrapper convention for a "hero icon" in a homepage section is: **no boxed badge** — a soft theme-colored blurred glow (`absolute size-28 rounded-full opacity-40 blur-2xl bg-{color}`) behind a bare, fairly large icon (`h-20`+, not a 16–24px utility-icon size), not inside a `rounded-2xl` card. See `StepSection` in `ui-registry.md` for the reference implementation. If a custom SVG icon arrives oversized (hand-drawn/traced SVGs can come back 100KB+ from excessive path precision), run it through `npx svgo --precision 2` before committing — verify nothing visibly changed at display size first.

---

## Color

### Multi-Item Hue Theming (homepage marketing sections)

When a homepage section needs N visually distinct colors for N different items (steps, feature cards, pricing tiers, etc.) and there's no literal semantic mapping, reuse these 5 existing tokens purely for hue rather than inventing new color tokens — same pattern used in `HeroSimulatorPreview` (Feature 03) and `HowItWorksSection` (Feature 05):

| Order | Token | Hue |
| --- | --- | --- |
| 1 | `accent` | teal |
| 2 | `info` | blue |
| 3 | `premium` | purple |
| 4 | `success` | green |
| 5 | `streak` | orange |

This is a deliberate reuse **outside** these tokens' literal meaning (premium ≠ "this is a premium feature," streak ≠ "this is a streak counter") — scope it to the one component doing the theming, and don't let it leak into assuming `text-premium` always means "premium" elsewhere in the codebase. If a 6th color is ever needed, don't reach for a 6th semantic token by default — ask whether the section actually needs 6 distinct hues or should be redesigned around 5.

Build one `Record<ThemeColor, {...}>` lookup (not several parallel same-shaped maps) for whatever combination of classes each themed instance needs (badge background, text color, blob/glow color, etc.) — see `THEME_CLASSES` in `StepSection.tsx` for the reference shape.

---

## Cards

Every content section lives in a card. Cards are always white (`bg-surface`) — color goes inside via badges and text, never on the card surface.

**Exception — homepage marketing sections:** a card's own surface may use a soft theme-tinted background (`bg-{color}-light` / `bg-{color}-muted`, no border) instead of flat white, per the same homepage exception as Design Philosophy above. App-UI cards (Learn, Practice, dashboards) keep the white-surface rule unchanged. See the 5 `*Preview` cards in `ui-registry.md` → `HowItWorksSection` for the reference implementation — note that *semantic* status colors inside a themed card (pass/fail green/red, success checkmarks) stay semantic regardless of the card's own theme color; only the card shell and a couple of accent touches take the theme.

```
Standard card:
  background:    bg-surface
  border:        1px solid border-border
  border-radius: rounded-xl (12px)
  padding:       p-6 (24px)
  shadow:        shadow-md
  hover:         translateY(-2px) + shadow-lg (200ms ease)
```

```
Featured / elevated card:
  background:    bg-surface
  border:        1px solid border-border
  border-radius: rounded-2xl (20px)
  padding:       p-8 (32px)
  shadow:        shadow-xl
```

Never stack more than 2 levels of `border-radius` inside each other.

---

## Homepage Hero

The hero section is the product's first impression. Rules:

- The concept switcher tabs and simulator are the focal point — not the headline
- Headline font: `text-4xl sm:text-5xl lg:text-5xl` (36px–48px, not the originally planned 56–72px — pixel-measuring `designs/hero-section-1-event-loop.png` against the navbar/CTA proportions showed 56px+ wraps "Frontend Interview-Ready Concepts" onto 2 lines, which the design does not do; confirmed by rendering candidate sizes and comparing screenshots), weight 700, tight line-height (1.1), container `max-w-6xl` to give the full string room on one line
- The accent line ("You Can Play With.") uses `text-accent` to create visual split
- Both CTAs visible: primary filled ("Start Learning →"), secondary outlined ("Explore Roadmaps")
- The simulator panel has a card-style container with `rounded-2xl` and `shadow-xl`
- The "LIVE CONCEPT ENGINE" indicator: green dot + uppercase label, positioned top-left of simulator panel
- "Running" badge: `bg-success-muted text-success text-xs font-medium rounded-full`
- Company logos strip (Feature 04) renders *inside* the hero, between the CTAs and the concept switcher tabs — pixel-inspecting `designs/hero-section-1-event-loop.png` shows it there, not as a separate section below the whole hero block, despite build-plan listing "04 Company Logos Strip" as its own numbered feature. Monochrome logos (`text-text-primary`), label in `text-text-muted`. Any full-width child added inside `Hero.tsx`'s `flex flex-col items-center` section needs an explicit `w-full` wrapper, or its cross-axis size shrinks to content instead of the viewport (hit this exact bug with the mobile horizontal-scroll-with-mask treatment on this component — see `ui-registry.md`/`progress-tracker.md`).

---

## Concept Switcher Tabs (Hero)

4 tabs: Event Loop | React Rendering | Browser Pipeline | CSS Specificity

Deliberate deviation from `designs/hero-section-1-event-loop.png`: pixel-inspecting the design at full resolution shows the tabs as one continuous bordered bar split into 4 equal segments by vertical dividers (active = `text-accent` + bottom-border indicator, inactive = near-black `text-text-primary`, no pill fill). Feature 03 first implemented that literal match, but the user explicitly preferred the original pill-group concept over the design-accurate bar — kept the pill-group below per that direction. If a future design pass revisits this section, re-check against the source PNG rather than assuming this doc is pixel-accurate to it.

- Tabs sit above the simulator panel in a pill-group container: `inline-flex items-center gap-1 rounded-xl border border-border-light bg-surface-secondary p-1.5`
- Active tab: `border border-border bg-surface text-text-primary shadow-md rounded-lg px-4 py-2 font-medium`
- Inactive tab: `border border-transparent text-text-secondary hover:bg-surface rounded-lg px-4 py-2`
- Each tab has an icon: loop icon (`RotateCw`), React atom (`Atom`), globe (`Globe`), braces (`Braces`)
- Transition between simulators: AnimatePresence with cross-fade (wired in Feature 13 — Feature 03 renders all 4 tabs statically with Event Loop active and no `onClick`, since only Event Loop has simulator content until Features 09–12 build the rest)

---

## Learn Sidebar

```
width:         260px fixed
background:    bg-surface
border-right:  1px solid border-border
overflow:      overflow-y-auto

Category label:
  font-size:   12px
  font-weight: 600
  color:       text-text-muted
  uppercase:   true
  padding:     px-4 pt-6 pb-2

Concept link (not started):
  padding:     px-4 py-2
  font-size:   14px
  color:       text-text-secondary
  hover:       bg-surface-secondary

Concept link (active):
  background:  bg-accent-muted
  color:       text-accent font-medium
  border-left: 2px solid accent

Concept link (completed):
  color:       text-text-secondary
  icon:        checkmark (text-success) on right side

Overall Progress bar:
  position:    bottom of sidebar, fixed
  background:  bg-surface border-t border-border p-4
  bar:         bg-accent rounded-full, track bg-border
```

---

## Concept Page Tabs

5 tabs: Understand | Simulate | Challenge | Interview | Build

```
Tab list:
  border-bottom: 1px solid border-border
  gap: gap-0 (tabs are flush)

Tab item:
  padding:       px-4 py-3
  font-size:     14px
  font-weight:   500
  color:         text-text-secondary

Tab item (active):
  color:         text-text-primary
  border-bottom: 2px solid accent (flush with container border)
  font-weight:   600

Tab icons:
  Each tab has an icon: lightbulb, code arrows, trophy, chat, tools
  icon size: 16px
  icon color: matches text color
```

---

## Simulator Controls

```
Container:
  background:  bg-surface-secondary
  border-top:  1px solid border-border
  padding:     px-6 py-4
  flex:        row, items-center, gap-3

Play/Pause button:
  background:  bg-accent
  text:        text-text-inverse
  border-radius: rounded-lg
  padding:     px-5 py-2.5
  font-weight: semibold

Step button:
  background:  bg-surface
  border:      1px solid border-border
  border-radius: rounded-lg
  padding:     px-4 py-2.5

Step Back button:
  Same as Step button

Restart button:
  Same as Step button, icon-only is acceptable

Autoplay toggle:
  Switch component: off = bg-border, on = bg-accent
  Label: "Auto play" text-sm text-text-secondary

Speed selector:
  Dropdown: 0.5x | 1x | 1.5x | 2x
  Current: text-sm font-medium
```

---

## Practice Editor (Monaco)

```
Editor container:
  background:  #1E1E1E (Monaco's native dark theme — do not override)
  border:      1px solid border-border
  border-radius: rounded-xl (top corners only if test panel below)
  height:      400px minimum

Editor font:   'JetBrains Mono', 'Fira Code', monospace — set in Monaco options

Test panel below editor:
  background:  bg-surface-secondary
  border-top:  1px solid border-border
  border-radius: rounded-xl (bottom corners only)
  padding:     p-4

Test case:
  passed: text-success with checkmark
  failed: text-error with x mark
```

---

## Empty States

Every section that can be empty must have one:

```
Container: centered flex-col gap-3
Icon:      48px, text-text-muted (optional but preferred)
Heading:   text-base font-medium text-text-secondary
Body:      text-sm text-text-muted
CTA:       optional — only if there's a clear next action
```

Never show raw empty arrays or null states to users.

---

## Loading States

- Skeleton loaders for cards and content (not spinners)
- Skeleton bg: `bg-surface-secondary animate-pulse rounded-lg`
- Simulator loading: show the panel structure with skeleton items inside
- Page-level loading: skeleton of the full page layout, never blank white

---

## Responsive Design

- Mobile-first utility classes
- Navbar collapses to hamburger below `lg: 1024px`. Tablet landscape (1024px+) shows the **same full nav as desktop, compacted to fit** — not a separate hamburger tier. The full nav (pill links, "Follow on X", Log In) is sized down by default at `lg:` and restored to roomier desktop sizing at `xl:` (1280px): pill links `px-2 py-1.5 text-xs gap-1` (icon `size-3`), "Follow on X" icon-only with `aria-label` (text in `hidden xl:inline`), Log In `px-3 py-2 text-sm`, logo `text-4xl`, wordmark hidden only in the 1024–1099px band via two arbitrary breakpoints (`min-[1024px]:hidden min-[1100px]:inline` — mixing a named breakpoint here breaks the cascade, see Navbar.tsx comment). Verified via screenshots at 1024/1100/1279/1280px: full nav fits with zero overflow at every width.
- Learn sidebar hides on mobile, accessible via sheet/drawer
- Hero simulator controls are simplified (no interactive controls) on mobile **by default** — **Confirmed exception:** the Event Loop simulator (Feature 09) shows full, functional controls on mobile too, per explicit user request (a CodeRabbit PR review flagged the hidden controls; the user asked to apply that suggestion, overriding this rule for that one feature). Default to hiding controls on mobile for new simulators (10–12) unless asked otherwise.
- Homepage sections stack vertically on mobile
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- **Standing rule from Feature 09's responsive audit: every feature must be checked at every standard screen size before being considered done** — not just one desktop width and one mobile width. At minimum: a laptop viewport (e.g. 1366×768 — note the *height*, not just width, matters for tall interactive content), tablet portrait (768×1024) and landscape (1024×768), and mobile (390×844). When checking for horizontal overflow, measure `document.documentElement.scrollWidth` vs `clientWidth` directly — don't assume a similar-looking number is the same "known baseline" as last time without re-confirming which element is actually responsible (a real instance of this was misattributed for several past features)

---

## Dark Mode

- Theme is controlled by `class` on `<html>`: `<html class="dark">`
- The theme provider in root layout reads `localStorage` + system preference
- Theme toggle in navbar: sun/moon icon, switches class on `<html>`
- Never use `dark:bg-[#hex]` hardcoded — all dark colors come from `.dark {}` token overrides in globals.css
- Framer Motion animations work in both themes automatically (they animate numeric/token values)
- Monaco editor always uses its own dark theme (#1E1E1E) regardless of site theme — this is intentional
- Full-bleed "always dark" marketing bands (e.g. `CTASection`) that should look identical in both themes use `bg-cta-dark` (`#0A0A0A`, a theme-invariant token — not redefined in `.dark {}`) rather than `bg-background`/`bg-surface`. Any text on top of a theme-invariant background must also use a theme-invariant foreground (`text-accent-foreground`), never `text-inverse`/`bg-surface` — those track the page theme and can go invisible against a background that doesn't. See `ui-tokens.md` → "Theme-Invariant Surfaces" and `ui-registry.md` → `CTASection`.

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-teal-600`, `text-gray-500`) — use project tokens only
- Never add decorative gradients to card backgrounds
- Never use `position: fixed` for UI elements other than the navbar and modals
- Never show raw error messages — always show human-readable text
- Never use more than 2 font weights in a single UI component
- Never add animations that don't teach or communicate something on simulator screens
- Never skip empty states — every list, grid, or feed must have one
- Never hardcode pixel values in JSX `style` props — use Tailwind tokens
- Never import colors from a config file — always from CSS variables in globals.css
- Never add `overflow: hidden` to the page root — it breaks sticky positioning

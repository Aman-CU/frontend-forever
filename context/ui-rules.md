# UI Rules

Rules for building Frontend Forever UI. The design references are the source of truth for visual decisions. These rules cover the most critical patterns to keep the UI consistent, polished, and on-brand.

---

## Design Philosophy

Frontend Forever should feel like:
- **Notion** — clean, spacious, alive with subtle motion
- **Linear** — precise, minimal, professional
- **Stripe** — premium, trustworthy, high craft

Avoid:
- Dark hacker aesthetics
- Purple gradients or neon effects
- Gaming / crypto visuals
- Heavy marketing copy patterns
- Anything that feels like a typical SaaS dashboard

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

---

## Cards

Every content section lives in a card. Cards are always white (`bg-surface`) — color goes inside via badges and text, never on the card surface.

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
- Headline font: 56px–72px (responsive), weight 700, tight line-height (1.1)
- The accent line ("You Can Play With.") uses `text-accent` to create visual split
- Both CTAs visible: primary filled ("Start Learning →"), secondary outlined ("Explore Roadmaps")
- The simulator panel has a card-style container with `rounded-2xl` and `shadow-xl`
- The "LIVE CONCEPT ENGINE" indicator: green dot + uppercase label, positioned top-left of simulator panel
- "Running" badge: `bg-success-muted text-success text-xs font-medium rounded-full`

---

## Concept Switcher Tabs (Hero)

4 tabs: Event Loop | React Rendering | Browser Pipeline | CSS Specificity

- Tabs sit above the simulator panel in a pill-group container
- Active tab: `bg-surface border border-border shadow-md rounded-lg px-4 py-2 font-medium text-text-primary`
- Inactive tab: `transparent text-text-secondary hover:bg-surface-secondary rounded-lg px-4 py-2`
- Each tab has an icon: loop icon, React atom, globe, braces
- Transition between simulators: AnimatePresence with cross-fade

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
- Navbar collapses to hamburger on mobile (`< 768px`)
- Learn sidebar hides on mobile, accessible via sheet/drawer
- Hero simulator is simplified (no interactive controls) on mobile
- Homepage sections stack vertically on mobile
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

---

## Dark Mode

- Theme is controlled by `class` on `<html>`: `<html class="dark">`
- The theme provider in root layout reads `localStorage` + system preference
- Theme toggle in navbar: sun/moon icon, switches class on `<html>`
- Never use `dark:bg-[#hex]` hardcoded — all dark colors come from `.dark {}` token overrides in globals.css
- Framer Motion animations work in both themes automatically (they animate numeric/token values)
- Monaco editor always uses its own dark theme (#1E1E1E) regardless of site theme — this is intentional

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

# UI Tokens

Design tokens for Frontend Forever. All colors, typography, spacing, and component values derived from the delivered design. Use these exact values throughout the codebase — never hardcode colors or raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `src/app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:
- `--color-accent` → `bg-accent`, `text-accent`, `border-accent`
- `--color-surface` → `bg-surface`, `text-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#0D9488] text-[#111827]"

// Never — raw Tailwind palette classes
className="bg-teal-600 text-gray-900"
```

Both light and dark theme tokens are defined. The `.dark` class on `<html>` triggers dark mode. The theme provider in root layout handles this.

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* ─── Page & Surface ─── */
  --color-background: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-surface-secondary: #F9FAFB;
  --color-surface-tertiary: #F3F4F6;
  --color-surface-elevated: #FFFFFF;

  /* ─── Borders ─── */
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;
  --color-border-muted: #D1D5DB;

  /* ─── Text ─── */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-text-subtle: #D1D5DB;
  --color-text-inverse: #FFFFFF;

  /* ─── Primary Accent — Teal ─── */
  --color-accent: #0D9488;
  --color-accent-dark: #0F766E;
  --color-accent-darker: #115E59;
  --color-accent-light: #CCFBF1;
  --color-accent-muted: #F0FDFA;
  --color-accent-foreground: #FFFFFF;

  /* ─── Success — Green ─── */
  --color-success: #16A34A;
  --color-success-dark: #15803D;
  --color-success-light: #DCFCE7;
  --color-success-muted: #F0FDF4;
  --color-success-foreground: #FFFFFF;

  /* ─── Warning — Amber ─── */
  --color-warning: #D97706;
  --color-warning-light: #FEF3C7;
  --color-warning-muted: #FFFBEB;
  --color-warning-foreground: #FFFFFF;

  /* ─── Error — Red ─── */
  --color-error: #DC2626;
  --color-error-light: #FEE2E2;
  --color-error-muted: #FFF5F5;
  --color-error-foreground: #FFFFFF;

  /* ─── Info — Blue ─── */
  --color-info: #2563EB;
  --color-info-light: #DBEAFE;
  --color-info-muted: #EFF6FF;
  --color-info-foreground: #FFFFFF;

  /* ─── XP / Gamification ─── */
  --color-xp: #F59E0B;
  --color-xp-light: #FEF3C7;
  --color-streak: #F97316;
  --color-streak-light: #FFEDD5;

  /* ─── Premium ─── */
  --color-premium: #7C3AED;
  --color-premium-light: #EDE9FE;
  --color-premium-foreground: #FFFFFF;

  /* ─── Concept difficulty colors ─── */
  --color-beginner: #16A34A;
  --color-beginner-bg: #DCFCE7;
  --color-intermediate: #D97706;
  --color-intermediate-bg: #FEF3C7;
  --color-advanced: #DC2626;
  --color-advanced-bg: #FEE2E2;

  /* ─── Theme-Invariant Surfaces ─── */
  --color-cta-dark: #0A0A0A;

  /* ─── Code Editor Palette (theme-invariant — mirrors Monaco vs-dark) ─── */
  --color-editor-surface: #1E1E1E;
  --color-editor-foreground: #D4D4D4;

  /* ─── Border Radius ─── */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* ─── Shadows ─── */
  --shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* ─── Dark Mode Overrides ─── */
.dark {
  --color-background: #0A0A0A;
  --color-surface: #1A1A1A;
  --color-surface-secondary: #222222;
  --color-surface-tertiary: #2A2A2A;
  --color-surface-elevated: #242424;

  --color-border: #333333;
  --color-border-light: #292929;
  --color-border-muted: #404040;

  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-muted: #6B7280;
  --color-text-subtle: #374151;
  --color-text-inverse: #111827;

  /* Accent stays the same in dark mode — teal reads well on dark */
  --color-accent: #14B8A6;
  --color-accent-dark: #0D9488;
  --color-accent-darker: #0F766E;
  --color-accent-light: #0F3D39;
  --color-accent-muted: #0A2825;

  --color-success-light: #052E16;
  --color-success-muted: #031A0D;

  --color-warning-light: #3B1F00;
  --color-warning-muted: #2A1600;

  --color-error-light: #3B0A0A;
  --color-error-muted: #2A0707;

  --color-info-light: #0D1F4E;
  --color-info-muted: #081433;

  --color-xp-light: #3B2800;
  --color-streak-light: #3B1400;

  --color-premium-light: #1E0A47;

  --color-beginner-bg: #052E16;
  --color-intermediate-bg: #3B1F00;
  --color-advanced-bg: #3B0A0A;

  --shadow-sm: 0px 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0px 1px 3px rgba(0, 0, 0, 0.4), 0px 1px 2px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0px 4px 6px -1px rgba(0, 0, 0, 0.4), 0px 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0px 10px 15px -3px rgba(0, 0, 0, 0.4), 0px 4px 6px -4px rgba(0, 0, 0, 0.4);
}
```

---

## Color Usage Guide

### Page Layout

| Element | Light Token | Dark Token |
|---|---|---|
| Page background | `bg-background` (#FAFAF9) | `bg-background` (#111111) |
| Card / panel | `bg-surface` (#FFFFFF) | `bg-surface` (#1A1A1A) |
| Secondary surface | `bg-surface-secondary` | `bg-surface-secondary` |
| Default border | `border-border` | `border-border` |
| Elevated card | `bg-surface-elevated` | `bg-surface-elevated` |

### Typography

| Element | Token |
|---|---|
| Headings, body text | `text-text-primary` |
| Secondary, labels | `text-text-secondary` |
| Placeholders, timestamps | `text-text-muted` |
| Disabled, ghost | `text-text-subtle` |
| On dark/accent backgrounds | `text-text-inverse` |

### Primary Accent (Teal)

Used for: active nav items, CTAs, tab underlines, concept highlights, progress indicators, the "You Can Play With." headline.

| Element | Token |
|---|---|
| Primary button background | `bg-accent-dark` |
| Primary button hover | `bg-accent-darker` |
| Headline accent text | `text-accent` |
| Badge background | `bg-accent-light` |
| Subtle section background | `bg-accent-muted` |
| Active tab indicator | `bg-accent` |
| Active nav item text | `text-accent` |

### Concept Difficulty Badges

| Difficulty | Background | Text |
|---|---|---|
| Beginner | `bg-beginner-bg` | `text-beginner` |
| Intermediate | `bg-intermediate-bg` | `text-intermediate` |
| Advanced | `bg-advanced-bg` | `text-advanced` |

### XP and Gamification

| Element | Token |
|---|---|
| XP number / badge | `text-xp` |
| XP badge background | `bg-xp-light` |
| Streak counter | `text-streak` |
| Streak badge background | `bg-streak-light` |

### Premium

| Element | Token |
|---|---|
| Premium badge background | `bg-premium-light` |
| Premium badge text | `text-premium` |
| Premium CTA button | `bg-premium` |

### Concept Tab Completion States

| State | Treatment |
|---|---|
| Not started | `text-text-muted`, no fill |
| In progress | `text-accent`, `bg-accent-muted` |
| Completed | `text-success`, `bg-success-muted` with checkmark |

---

## Typography

| Element | Size | Weight | Line Height | Color Token |
|---|---|---|---|---|
| Hero headline | 56px–72px | 700 | 1.1 | `text-text-primary` |
| Hero accent line ("You Can Play With.") | 56px–72px | 700 | 1.1 | `text-accent` |
| Page title (H1) | 36px | 700 | 40px | `text-text-primary` |
| Section heading (H2) | 24px | 600 | 32px | `text-text-primary` |
| Card heading (H3) | 18px | 600 | 28px | `text-text-primary` |
| Body / primary content | 16px | 400 | 24px | `text-text-primary` |
| Secondary label | 14px | 500 | 20px | `text-text-secondary` |
| Small label / caption | 12px | 500 | 16px | `text-text-muted` |
| Nav item (active) | 14px | 500 | 20px | `text-accent` |
| Nav item (inactive) | 14px | 500 | 20px | `text-text-secondary` |
| Concept card title | 16px | 600 | 24px | `text-text-primary` |
| Badge text | 12px | 500 | 16px | varies |
| Simulator labels | 12px | 500 | 16px | `text-text-secondary` |
| Code in simulators | 13px | 400 | 20px | Syntax highlighted |
| XP number | 24px | 700 | 28px | `text-xp` |
| Streak number | 20px | 700 | 24px | `text-streak` |

Font family: **Inter** — loaded via `next/font/google` in root layout.

---

## Spacing

| Token | Value | Usage |
|---|---|---|
| `gap-1` | 4px | Tight inline gaps |
| `gap-2` | 8px | Badge and icon gaps |
| `gap-3` | 12px | Form field inner gaps |
| `gap-4` | 16px | Component internal gaps |
| `gap-6` | 24px | Between card sections |
| `gap-8` | 32px | Between page sections |
| `gap-12` | 48px | Between major homepage sections |
| `gap-16` | 64px | Large homepage section gaps |
| `p-4` | 16px | Compact card padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Large card / section padding |
| `px-4 py-2` | 16/8px | Button padding (standard) |
| `px-3 py-1` | 12/4px | Badge padding |
| `px-2 py-0.5` | 8/2px | Small badge padding |

---

## Component Tokens

### Cards (standard)

```
background:    bg-surface
border:        1px solid border-border
border-radius: rounded-xl (12px)
padding:       p-6 (24px)
box-shadow:    var(--shadow-md)
```

### Cards (elevated / modal-like)

```
background:    bg-surface-elevated
border:        1px solid border-border
border-radius: rounded-2xl (20px)
padding:       p-8 (32px)
box-shadow:    var(--shadow-xl)
```

### Buttons

**Primary (teal — main CTA):**
```
background:    bg-accent-dark
text:          text-text-inverse
border-radius: rounded-lg (8px)
padding:       px-6 py-3
font-weight:   font-semibold
font-size:     text-base (16px)
hover:         bg-accent-darker
transition:    150ms ease
```

**Secondary (outlined):**
```
background:    bg-surface
border:        1px solid border-border
text:          text-text-primary
border-radius: rounded-lg (8px)
padding:       px-6 py-3
hover:         bg-surface-secondary
```

**Ghost:**
```
background:    transparent
text:          text-text-secondary
hover:         bg-surface-secondary text-text-primary
border-radius: rounded-lg (8px)
```

**Premium CTA:**
```
background:    bg-premium
text:          text-premium-foreground
border-radius: rounded-lg (8px)
padding:       px-6 py-3
```

### Form Inputs

```
background:    bg-surface
border:        1px solid border-border
border-radius: rounded-lg (8px)
padding:       px-4 py-3
font-size:     text-sm (14px)
text:          text-text-primary
placeholder:   text-text-muted
focus:         border-accent ring-1 ring-accent ring-opacity-30
```

### Badges (pills)

```
border-radius: rounded-full
padding:       px-3 py-1
font-size:     text-xs (12px)
font-weight:   font-medium
```

### Concept Progress States

| Tab State | Classes |
|---|---|
| Completed | `bg-success-muted text-success` with checkmark icon |
| In Progress | `bg-accent-muted text-accent` |
| Not Started | `bg-surface-secondary text-text-muted` |

### Simulator Controls Bar

```
background:    bg-surface-secondary
border:        1px solid border-border (top only)
border-radius: 0 0 rounded-xl rounded-xl
padding:       px-4 py-3
gap:           gap-2 between controls
```

### Simulator Panels (Call Stack, Queue panels)

```
background:    bg-surface
border:        1px solid border-border
border-radius: rounded-lg (8px)
padding:       p-4
min-height:    180px
header text:   text-sm font-semibold text-text-secondary uppercase tracking-wide
```

### Code Syntax Colors (inside simulators)

| Token type | Color (light) | Color (dark) |
|---|---|---|
| String | `#16A34A` (green) | `#4ADE80` |
| Function call | `#0D9488` (teal) | `#2DD4BF` |
| Keyword | `#7C3AED` (purple) | `#A78BFA` |
| Number | `#D97706` (amber) | `#FCD34D` |
| Comment | `#9CA3AF` (muted) | `#6B7280` |
| Default | `#111827` | `#F9FAFB` |

### Navigation Active Tab Indicator

```
height:        2px
background:    bg-accent
border-radius: rounded-full
transition:    200ms ease (sliding underline)
```

### Streak Badge (navbar)

```
icon:          🔥 emoji
text:          text-streak font-semibold
background:    none (inline in navbar)
```

### Concept Switcher Tabs (homepage hero)

```
active tab:
  background:  bg-surface
  border:      1px solid border-border
  text:        text-text-primary font-medium
  shadow:      var(--shadow-md)
  border-radius: rounded-lg (8px)

inactive tab:
  background:  transparent
  text:        text-text-secondary
  hover:       bg-surface-secondary
```

---

## Theme-Invariant Surfaces

A small set of tokens are deliberately **not** redefined inside `.dark {}` — they stay the same value regardless of which site theme is active, rather than flipping polarity the way `--color-background`/`--color-surface`/`--color-text-inverse` do.

| Token | Value | Used for |
|---|---|---|
| `--color-accent-foreground` | `#FFFFFF` | Text/icons on top of an accent-colored or fixed-dark surface — stays white in both themes since it's "foreground on a colored background," not "foreground on the page" |
| `--color-cta-dark` | `#0A0A0A` | Full-bleed "always dark" marketing bands (e.g. `CTASection`) that should look identical in light and dark mode, not lighten/darken with the page |
| `--color-editor-surface` | `#1E1E1E` | Code-surface background that must match Monaco's always-`vs-dark` editor regardless of site theme — the `ChallengeEditor` loading skeleton and `SolutionPanel` code block (Feature 24) |
| `--color-editor-foreground` | `#D4D4D4` | Code text/skeleton bars on `--color-editor-surface`, matching Monaco's vs-dark foreground |

**Never pair a *theme-following* token (`text-inverse`, `bg-surface`, `bg-background`) with a fixed/theme-invariant background** — `text-inverse` flips white→near-black to track the page theme, so on a background that *doesn't* flip (like `bg-cta-dark` or `bg-accent-darker`) it can go invisible in one theme. Caught this exact mistake once already in Feature 06 (`ProjectEditorMiniVisual`) and again in Feature 08 (`CTASection`'s first draft) — see `ui-registry.md` for both. If a component's background is meant to stay constant across themes, every text/foreground color on top of it must come from this theme-invariant set, not the page-tracking one.

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Font is Inter — always import via `next/font/google`, never system fonts
- Never use raw Tailwind color classes like `bg-teal-600` or `text-gray-700` — use project tokens only
- `--color-accent` (#0D9488) is the only teal/green used for interactive elements — never use Tailwind's built-in teal or green scale
- Dark mode styles are handled by CSS variable overrides in `.dark {}` — never use `dark:bg-[#hex]` with hardcoded values
- All shadows use `var(--shadow-*)` tokens — never write raw box-shadow values in components
- Simulator panel backgrounds are always `bg-surface` — never colored backgrounds inside simulator panels

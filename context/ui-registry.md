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

_Will be populated as components are built._

## Shared UI Components

- **`ThemeToggle`** — `src/components/shared/ThemeToggle.tsx`. Icon-only button (`Sun`/`Moon` from `lucide-react`) calling `useTheme().toggleTheme()`. Styled with `bg-surface border-border` + hover `bg-surface-secondary`, 36px (`size-9`) square, `rounded-lg`. Has `aria-label` describing the action it performs (not the current state).

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

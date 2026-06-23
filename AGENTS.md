# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Instructions for AI agents working on Frontend Forever. Read this file first before reading any other file or writing any code.

---

## What This Project Is

Frontend Forever is an interactive frontend engineering learning platform. Concepts are taught through live simulators, not static text. The simulator is the product's core differentiator.

Read `context/project-overview.md` for the full product context before implementing anything.

---

## Design References

Visual design screenshots live in `designs/` at the project root. Always consult the relevant screenshot before building any UI — these are the source of truth for layout, spacing, and visual decisions.

| File | What it shows |
|---|---|
| `designs/landing-hero.png` | Homepage hero section — concept switcher, simulator panel, headline, CTAs |
| `designs/learn-page.png` | Learn page — sidebar, concept tabs, simulator area, right panel |

---

## Context Files — Read Order

Before implementing any feature, read these files in this order:

1. `context/project-overview.md` — What the product is, all pages, all sections
2. `context/architecture.md` — Stack, folder structure, DB schema, data flow, invariants
3. `context/build-plan.md` — What to build in what order
4. `context/progress-tracker.md` — What's done, what's in progress, what's next
5. `context/ui-tokens.md` — All design tokens, colors, spacing (read before touching any CSS)
6. `context/ui-rules.md` — UI patterns, motion rules, component rules
7. `context/ui-registry.md` — All existing components (check before building new ones)
8. `context/code-standards.md` — TypeScript rules, naming, structure, API patterns
9. `context/library-docs.md` — Supabase, Framer Motion, Monaco, MDX, Upstash patterns
10. `context/security.md` — Auth, RLS, input validation, sandbox, XSS, headers
11. `context/error-handling.md` — API errors, client errors, toasts, loading states, logging

---

## The Most Important Rules

1. **UI first, always.** Build the complete visual UI with placeholder data before adding any logic. The user verifies visually before wiring up functionality.

2. **No hardcoded colors.** Every color comes from CSS variables defined in `globals.css`. Never write `bg-teal-600`, `text-gray-700`, or `bg-[#hex]` in components.

3. **Feature-first structure.** New feature code goes in `src/features/[feature-name]/`. Never add feature logic to `src/components/` or `src/app/`.

4. **Simulators are self-contained.** Each simulator in `features/simulators/` owns its own everything. Never share state or components between simulators.

5. **Always rate limit writes.** Every API route that writes data runs the Upstash rate limiter before any business logic. Never skip it.

6. **Always scope DB queries.** Every Supabase query on a user-owned table must include `.eq('user_id', user.id)`. Never query without a user filter.

7. **Check ui-registry.md before building.** If a similar component exists, use it. If building new, add it to the registry after.

8. **Update progress-tracker.md AND ui-registry.md** after completing each feature. Mark the checkbox, update "Last completed" and "Next" in progress-tracker, and add any new components to ui-registry.

9. **Before any third-party library** — load its installed skill first, then read `context/library-docs.md` for project-specific rules. Never rely on general training knowledge alone for library APIs.

10. **If the same problem persists after one corrective prompt** — stop immediately and run `/recover`. Do not attempt a third fix on your own.

---

## Git Workflow

Every feature follows this exact branching strategy. Never commit directly to `main` or `develop`.

### Branch Structure

```
main          ← production, always deployable
  └── develop ← integration, receives all feature PRs
        └── feature/[number]-[kebab-name]  ← one branch per feature
```

### Branch Naming

Feature branches must match the feature number from `build-plan.md`:

```
feature/00-project-setup
feature/01-design-system
feature/02-navbar-footer
feature/03-hero-section
feature/09-event-loop-simulator
```

### PR Flow Per Feature

```
1. Branch off develop
   git checkout develop && git pull origin develop
   git checkout -b feature/[number]-[name]

2. Build the feature

3. Open PR: feature/[number] → develop
   Title: feat([number]): [Feature Name]
   Example: feat(03): Hero Section

4. CodeRabbit reviews the PR automatically

5. Address CodeRabbit findings

6. Merge into develop

7. Update context/progress-tracker.md
```

### Phase Merges

At the end of each phase (or when ready to deploy):
```
develop → main  (via PR)
```

### PR Title Format

```
feat(00): Project Setup
feat(01): Design System + Global Styles
feat(09): Event Loop Simulator — Hero Version
fix(03): Hero CTA alignment on mobile
chore: update dependencies
```

### Rules

- Never commit directly to `main` or `develop`
- Every feature = one branch = one PR
- CodeRabbit review must be addressed before merge
- `context/progress-tracker.md` updated after every merge to develop

---

## Current Focus

Check `context/progress-tracker.md` → "Currently building" for the active feature.

---

## Available Skills

| Skill | When to use |
|---|---|
| `/architect` | Before any complex feature — think through the approach before building |
| `/imprint` | After any new UI component — capture patterns into ui-registry.md |
| `/review` | Before a demo or when something feels off — catch issues early |
| `/recover` | When something breaks after one failed correction — stops looping |
| `/remember save` | When a feature spans multiple sessions — save context before stopping |
| `/remember restore` | When returning after a multi-session feature — restore context before continuing |

## Installed Skills

_Additional installed skills will be listed here as they are added via the Claude Code CLI._

---

## MCP Servers

_MCP servers will be listed here when configured._

---

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`DATABASE_URL` points at the Supabase-hosted Postgres instance — Supabase is database + storage only now, not the auth/client layer. See `context/architecture.md` → Auth + DB Client Patterns. None of the above are server-only except where noted; `BETTER_AUTH_URL` is the only one safe to expose as `NEXT_PUBLIC_` if the auth client needs it client-side.

Required server-side only (no `NEXT_PUBLIC_` prefix):

```
STRIPE_SECRET_KEY=          (Phase 9 only)
STRIPE_WEBHOOK_SECRET=      (Phase 9 only)
```

---

## Key Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | SSR for SEO, RSC for performance, edge-ready |
| Styling | Tailwind CSS v4 + shadcn/ui | Fast to build, accessible primitives |
| Animation | Framer Motion | Best React animation library for complex state-driven motion |
| Database | Supabase (Postgres) | Hosted DB + Storage — accessed via a direct Postgres connection, not the supabase-js/PostgREST client |
| Auth | Better-Auth | Self-hosted, full control over session/JWT, no vendor lock-in for auth specifically (changed from Supabase Auth before Phase 2 started — Supabase remains the DB) |
| Content | MDX in repo | Static generation, no CMS dependency |
| Code execution | Browser iframe sandbox | No backend cost, perfect for frontend challenges |
| Simulator architecture | Self-contained per concept | Maximum flexibility, zero coupling |
| Auth methods | Google + GitHub OAuth only | Simplest, no password complexity |
| Rate limiting | Upstash Redis (day one) | Protects at 1M users |
| Hosting | Vercel | Native Next.js, edge network, preview deploys |

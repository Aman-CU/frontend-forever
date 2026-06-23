# Code Standards

Coding conventions for Frontend Forever. These rules apply to all code in the project. Read this before writing any feature code.

---

## TypeScript

- **Strict mode is on** — no `any`, no implicit `any`, no `ts-ignore` without a comment explaining why
- Always define return types on functions that return non-trivial values
- Use `type` for object shapes, `interface` for extensible contracts (prefer `type` in this project)
- Use `satisfies` operator when you need both inference and type checking
- Avoid type assertions (`as SomeType`) — if you need one, something is wrong with the types
- All environment variables are accessed via typed wrappers, never raw `process.env.VAR`

```typescript
// Good
type ConceptProgress = {
  conceptId: string
  understand: boolean
  simulate: boolean
  challenge: boolean
  interview: boolean
  build: boolean
}

// Bad
const progress: any = {}
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `EventLoopSimulator` |
| Hooks | camelCase with `use` prefix | `useEventLoopSimulator` |
| Utility functions | camelCase | `formatXP`, `cn` |
| TypeScript types | PascalCase | `SimulatorStep`, `ConceptTab` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_SIMULATOR_STEPS` |
| CSS variables | kebab-case | `--color-accent` |
| File names (components) | PascalCase | `EventLoopSimulator.tsx` |
| File names (hooks/utils) | camelCase | `useSimulator.ts`, `utils.ts` |
| File names (data/types) | camelCase | `scenarios.ts`, `types.ts` |
| Route files | lowercase | `page.tsx`, `route.ts`, `layout.tsx` |
| MDX files | kebab-case | `event-loop.mdx` |

---

## Component Rules

### Structure

Every component file follows this order:
1. Imports (external libs first, then internal — see import order below)
2. Types (component-local types only)
3. Constants (component-local constants only)
4. Component function
5. Export

```typescript
// 1. External imports
import { motion } from 'framer-motion'

// 2. Internal imports
import { cn } from '@/lib/utils'
import type { SimulatorStep } from './types'

// 3. Local types (if not in types.ts)
type Props = {
  step: SimulatorStep
  isActive: boolean
}

// 4. Component
export function CallStackItem({ step, isActive }: Props) {
  return (
    <motion.div className={cn('...', isActive && '...')}>
      {step.item}
    </motion.div>
  )
}
```

### Component Rules

- One component per file — no multiple exports from one file except for small sub-components used only by the parent
- Props types are always explicitly defined — never `React.FC<{}>` or inline object types in the function signature
- No default exports from component files — always named exports
- Client components (`'use client'`) only when the component actually needs browser APIs, event handlers, or state — never add `'use client'` preemptively
- Server Components are the default in App Router — lean into this

### Props

- Boolean props: don't write `isVisible={true}` — write `isVisible` (shorthand)
- Boolean props: don't write `disabled={false}` — omit the prop
- Optional props get `?` and a sensible default via destructuring
- Children typed as `React.ReactNode` when the component accepts arbitrary children

---

## Import Order

Always in this order, separated by blank lines:

```typescript
// 1. React (only when needed — RSC don't need this)
import { useState, useEffect } from 'react'

// 2. External packages
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

// 3. Internal absolute imports (@/ alias)
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Concept } from '@/types'

// 4. Relative imports
import { CallStack } from './CallStack'
import type { SimulatorStep } from './types'
```

Never mix relative and absolute imports in the same group.

---

## File Size Rule

- If a component file exceeds 200 lines — split it into sub-components
- If a hooks file exceeds 150 lines — split into multiple focused hooks
- If a types file exceeds 100 lines — it's doing too much, reorganize

---

## State Management

- **Local state** (`useState`) — UI state that doesn't need to be shared (accordion open, tab active)
- **Feature hook** (`useX`) — state shared across components within a feature (simulator state, challenge state)
- **Global state** (Zustand) — only for truly global state (user auth, search query, theme)
- **Server state** (direct Postgres/Drizzle queries in RSC) — user progress, concept data
- No prop drilling beyond 2 levels — extract a hook or use context

---

## Error Handling

- API routes always return structured JSON errors: `{ error: string, code?: string }`
- Client components show user-friendly messages — never raw error strings from the server
- Use try/catch in all async functions that call external services
- Rate limit errors (429) get a specific user message: "You're doing that too fast. Please wait a moment."
- Auth errors redirect to `/login` — never show them as UI errors

```typescript
// Good — structured, user-friendly
try {
  await updateProgress(conceptId, tab)
} catch (error) {
  setError('Could not save your progress. Please try again.')
}

// Bad — raw error exposed
setError(error.message)
```

---

## API Routes

All API routes follow this structure:

```typescript
export async function POST(req: Request) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Rate limit check
  const { success } = await ratelimit.limit(session.user.id)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  // 3. Parse and validate body
  const body = await req.json()
  // validate body fields...

  // 4. Business logic
  // ...

  // 5. Return result
  return Response.json({ success: true })
}
```

This order is mandatory. Never skip auth or rate limiting.

---

## Async / Server Actions

```typescript
'use server'

export async function updateProgress(conceptId: string, tab: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Not authenticated')

  const completedField = `${tab}Completed` as const // e.g. understandCompleted, simulateCompleted

  await db
    .insert(userConceptProgress)
    .values({ userId: session.user.id, conceptId, [completedField]: true })
    .onConflictDoUpdate({
      target: [userConceptProgress.userId, userConceptProgress.conceptId],
      set: { [completedField]: true },
    }) // throws on failure — no { error } tuple to check
}
```

Server Actions are for form submissions and simple UI-triggered mutations. Complex agent-style operations go in API routes.

---

## CSS / Tailwind Rules

- Use `cn()` from `lib/utils.ts` for conditional class merging — never string interpolation
- Never write `style={{ color: '#0D9488' }}` — use `className="text-accent"`
- Responsive prefix order: base → `sm:` → `md:` → `lg:` → `xl:`
- Never use `!important` — if you need it, the specificity is wrong
- Never add inline `style` props for values that can be expressed as Tailwind tokens

```typescript
// Good
className={cn(
  'rounded-xl border border-border bg-surface p-6',
  isActive && 'border-accent bg-accent-muted',
  className
)}

// Bad
className={`rounded-xl border ${isActive ? 'border-teal-500' : 'border-gray-200'}`}
```

---

## Simulator Code Standards

Simulator step scripts are data — not logic. Keep them clean:

```typescript
// Good — declarative, readable
{ step: 3, action: 'move', from: 'callStack', to: 'webAPIs', item: 'setTimeout(...)' }

// Bad — imperative logic inside step data
{ step: 3, action: () => { stack.pop(); webAPIs.push('setTimeout') } }
```

Simulator hooks manage state transitions. Never put DOM manipulation in simulator hooks — only state updates.

---

## Comments Policy

Write no comments unless the WHY is non-obvious. A good variable name is better than a comment.

Write a comment for:
- A workaround for a specific browser/library bug
- A non-obvious algorithmic invariant (e.g. SM-2 spaced repetition edge case)
- A constraint that isn't visible from the code (e.g. "no RLS on this connection — user_id filter is the only boundary")

Never write:
- Comments that restate what the code does
- "// TODO: fix later" without a ticket reference
- Block comments on obvious functions

---

## Environment Variables

```typescript
// lib/env.ts — typed env accessor
export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
  betterAuthUrl: process.env.BETTER_AUTH_URL!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
} as const
```

Never access `process.env` directly in feature code — always import from `lib/env.ts`.

---

## XP Event Types

These are the only valid `event_type` values in the `xp_events` table. Never use any other string:

```typescript
export const XP_EVENT_TYPES = [
  'concept_understand',
  'concept_simulate',
  'concept_challenge',
  'concept_interview',
  'concept_build',
  'challenge_solved',
  'interview_answered',
  'streak_bonus',
] as const

export type XPEventType = typeof XP_EVENT_TYPES[number]
```

---

## Concept Tab Identifiers

These are the only valid tab identifiers. Used in DB columns, URLs, and components:

```typescript
export const CONCEPT_TABS = ['understand', 'simulate', 'challenge', 'interview', 'build'] as const
export type ConceptTab = typeof CONCEPT_TABS[number]
```

---

## Interview Collections

These are the only valid `collection` values in `interview_questions`:

```typescript
export const INTERVIEW_COLLECTIONS = ['ff-75', 'ff-javascript', 'ff-react', 'ff-system-design'] as const
export type InterviewCollection = typeof INTERVIEW_COLLECTIONS[number]
```

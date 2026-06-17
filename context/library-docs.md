# Library Docs

Project-specific usage patterns for every third-party library in Frontend Forever. This file covers how we use each library in this specific project — rules, patterns, and constraints. Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. Check `AGENTS.md` at the project root — it lists installed skills and how to use them
2. Check if an MCP server is configured for that library
3. Read this file for project-specific patterns

Order of authority:
```
MCP server (real-time docs) → Skills via AGENTS.md → This file → General knowledge
```

Never rely on general training knowledge alone for library APIs — they change.

---

## Supabase (`@supabase/ssr`)

### Client vs Server — Never Mix

```typescript
// lib/supabase/client.ts — browser context ONLY
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// lib/supabase/server.ts — server context ONLY
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createSupabaseServer = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Auth

```typescript
// Get current user in server context
const supabase = await createSupabaseServer()
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) redirect('/login')

// OAuth sign in (client component)
await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'github'
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Sign out
await supabase.auth.signOut()
```

### DB Queries

```typescript
// Read — always scope to user_id
const { data, error } = await supabase
  .from('user_concept_progress')
  .select('*')
  .eq('user_id', user.id)
  .eq('concept_id', conceptId)
  .single()

// Upsert (progress tracking)
const { error } = await supabase
  .from('user_concept_progress')
  .upsert({
    user_id: user.id,
    concept_id: conceptId,
    understand_completed: true,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,concept_id' })

// Insert
const { data, error } = await supabase
  .from('xp_events')
  .insert({
    user_id: user.id,
    event_type: 'concept_understand',
    xp_amount: 10,
    concept_id: conceptId
  })
  .select()
  .single()

// Increment (XP on profile)
const { error } = await supabase.rpc('increment_xp', {
  p_user_id: user.id,
  p_amount: 10
})
```

**Rules:**
- Always scope queries to `user_id` — never query user-owned tables without a user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row
- Never use `.select('*')` in production — select only the columns you need
- Use `upsert` with `onConflict` for progress tracking — not insert + update

---

## Framer Motion

### Standard Entrance Animation (page sections)

```typescript
import { motion } from 'framer-motion'

// Scroll-triggered section entrance
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
>
```

### Simulator Item Animations

```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Item appearing in a queue/stack
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout                                    // FLIP animation for position changes
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {item.label}
    </motion.div>
  ))}
</AnimatePresence>
```

### Concept Switcher Tab Transition

```typescript
// Shared layout animation — tabs sliding between active states
<motion.div
  layoutId="activeTabIndicator"  // Same layoutId across all tabs
  className="absolute bottom-0 h-0.5 w-full bg-accent"
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
/>
```

### Simulator Panel Swap

```typescript
// Cross-fade when switching between simulators
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}              // Key change triggers AnimatePresence
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {renderSimulator(activeTab)}
  </motion.div>
</AnimatePresence>
```

### Staggered List Animation

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {concepts.map(concept => (
    <motion.li key={concept.id} variants={itemVariants}>
      <ConceptCard concept={concept} />
    </motion.li>
  ))}
</motion.ul>
```

### Arrow / Flow Animations (simulator connectors)

```typescript
// Animating SVG path to show data flowing between panels
<motion.path
  d="M 100 50 L 200 50"
  stroke="currentColor"
  strokeWidth={2}
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
/>
```

**Rules:**
- Always use `layout` prop on items inside simulator panels — enables smooth FLIP animations when items move
- Always use `AnimatePresence` when conditionally rendering elements that should animate out
- `mode="wait"` on AnimatePresence for tab/view switches — exits before entering
- `once: true` on `whileInView` — sections don't re-animate on scroll back up
- Never animate `width`, `height`, or `top/left` directly — use `layout` and let Framer Motion handle it

---

## Monaco Editor

### Setup (Practice + Build Tab)

```typescript
import Editor from '@monaco-editor/react'

<Editor
  height="400px"
  language="javascript"
  theme="vs-dark"           // Always dark — intentional contrast with light site
  value={starterCode}
  onChange={(value) => setCode(value ?? '')}
  options={{
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    tabSize: 2,
    wordWrap: 'on',
    padding: { top: 16, bottom: 16 },
    renderLineHighlight: 'line',
  }}
/>
```

**Rules:**
- Always `'use client'` in files that use Monaco — it's a browser-only component
- Always `theme="vs-dark"` — Monaco is always dark regardless of site theme (intentional)
- Always disable minimap — unnecessary for short challenge code
- Default `language` is `'javascript'` — change to `'typescript'` only when the challenge is TS-specific
- Never allow the editor height to be 100% of viewport — set an explicit pixel height
- Wrap in a `Suspense` boundary with a code-skeleton fallback — Monaco is a heavy import

---

## MDX (`next-mdx-remote` or `@next/mdx`)

### Reading Concept MDX Files

```typescript
// lib/mdx.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export function getConceptContent(category: string, slug: string) {
  const filePath = path.join(process.cwd(), 'content/concepts', category, `${slug}.mdx`)
  const source = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(source)
  return { frontmatter, content }
}

export function getAllConceptSlugs() {
  const baseDir = path.join(process.cwd(), 'content/concepts')
  // Walk all category subdirectories and return { category, slug } pairs
}
```

### MDX Frontmatter Shape

Every concept MDX file must have this frontmatter:

```mdx
---
title: "Event Loop"
description: "Understand how JavaScript schedules and executes asynchronous code."
category: "javascript-runtime"
difficulty: "intermediate"
order: 5
---

# Event Loop

Content starts here...
```

### Static Generation

```typescript
// app/learn/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = getAllConceptSlugs()
  return slugs.map(({ category, slug }) => ({ category, slug }))
}
```

**Rules:**
- MDX files are read at build time only — never at runtime
- `generateStaticParams` must enumerate all concept slugs — zero dynamic MDX fetching
- Frontmatter must match the `concepts` DB table — `slug`, `category`, `difficulty` must be identical
- Never write to MDX files from application code — they are source-controlled content

---

## Upstash Redis (Rate Limiting)

### Setup

```typescript
// lib/upstash.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),           // Reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
  prefix: 'frontend-forever',
})
```

### Apply in Every Write Route

```typescript
// Every API route that writes data
const { success, limit, remaining, reset } = await ratelimit.limit(user.id)

if (!success) {
  return Response.json(
    { error: "You're doing that too fast. Please wait a moment." },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    }
  )
}
```

**Rate Limit Tiers:**

| Route | Limit |
|---|---|
| `/api/progress` | 20 requests / 10 seconds |
| `/api/auth/*` | 5 requests / 60 seconds |
| All other writes | 20 requests / 10 seconds |

**Rules:**
- Rate limiting runs BEFORE any business logic in every write API route
- Always use `user.id` as the identifier (not IP address) — more accurate for authenticated routes
- Always return rate limit headers on 429 responses
- Never skip rate limiting in development — test with real limits

---

## shadcn/ui

shadcn/ui components live in `src/components/ui/`. They are installed via the CLI and then owned by the project — we modify them freely.

### Installation Pattern

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add tabs
```

### Customization Rule

After installing, update the component's default variant colors to match our token system:

```typescript
// components/ui/button.tsx — after installation
// Replace hardcoded colors with our tokens:
// bg-primary → bg-accent-dark
// hover:bg-primary/90 → hover:bg-accent-darker
// text-primary-foreground → text-text-inverse
```

**Rules:**
- Never import from `shadcn/ui` as a package — always from `@/components/ui/`
- Always update installed components to use project tokens instead of shadcn defaults
- Never modify the file structure shadcn creates — it expects its own layout
- New shadcn components must be listed in `ui-registry.md` after installation

---

## next/font

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

// Apply to <html>:
<html lang="en" className={inter.variable}>
```

**Rules:**
- Inter is the only font — never add a second font family
- Always use `variable` mode — lets CSS variables control font application
- `display: 'swap'` prevents invisible text during load
- For the Monaco editor, use `fontFamily` in Monaco options (not next/font)

---

## Lucide React (Icons)

```typescript
import { CheckCircle, Code2, Zap, BookOpen } from 'lucide-react'

// Standard icon size in components
<CheckCircle className="size-4 text-success" />   // 16px
<Code2 className="size-5 text-accent" />           // 20px
<Zap className="size-6 text-xp" />                // 24px
```

**Rules:**
- Always use `size-*` Tailwind class (Tailwind v4 equivalent: `w-4 h-4`) — never hardcode `width` and `height` props
- Always set a color via `text-*` token class — never use `color` prop
- Import only the icons used — no wildcard imports from lucide-react
- Icon-only buttons must have `aria-label` for accessibility

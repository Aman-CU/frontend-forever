# Error Handling

Error handling conventions for Frontend Forever. Every layer of the stack has a defined error handling strategy. Read this before implementing any API route, async operation, or user-facing component.

---

## Core Philosophy

- **Expected errors** — things that will happen in normal usage (user not authenticated, rate limited, invalid input, premium required). Handle gracefully with clear user messaging.
- **Unexpected errors** — crashes, unhandled promise rejections, third-party failures. Catch at boundaries, log for debugging, show a safe fallback to the user.
- **Never show raw errors to users** — no stack traces, no database messages, no internal IDs.
- **Never swallow errors silently** — if you catch an error and do nothing, you create invisible bugs.

---

## API Route Error Responses

All API routes return structured JSON errors in a consistent shape:

```typescript
// Error response shape — always this structure
type ApiError = {
  error: string      // Human-readable message (safe to show users)
  code?: string      // Optional machine-readable code for client logic
}

// Success response shape
type ApiSuccess<T> = {
  data: T
}
```

### Standard HTTP Status Codes

| Status | When to use |
|---|---|
| `400` | Invalid input, missing fields, failed validation |
| `401` | Not authenticated (no session) |
| `403` | Authenticated but not authorized (e.g. premium required) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate submission) |
| `429` | Rate limited |
| `500` | Unexpected server error |

```typescript
// 400 — Bad request
return Response.json({ error: 'Invalid tab. Must be one of: understand, simulate, challenge, interview, build' }, { status: 400 })

// 401 — Not authenticated
return Response.json({ error: 'Please sign in to continue' }, { status: 401 })

// 403 — Not authorized
return Response.json({ error: 'This content requires a premium subscription' }, { status: 403 })

// 429 — Rate limited
return Response.json({ error: "You're doing that too fast. Please wait a moment." }, { status: 429 })

// 500 — Unexpected error (never expose internal details)
return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
```

### Full API Route Error Pattern

```typescript
export async function POST(req: Request) {
  try {
    // 1. Auth
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return Response.json({ error: 'Please sign in to continue' }, { status: 401 })
    }

    // 2. Rate limit
    const { success } = await ratelimit.limit(session.user.id)
    if (!success) {
      return Response.json({ error: "You're doing that too fast. Please wait a moment." }, { status: 429 })
    }

    // 3. Parse + validate
    const body = await req.json().catch(() => null)
    if (!body) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // 4. Business logic — Drizzle throws rather than returning { error }, so failures land in the catch block below
    await db.insert(userConceptProgress).values({ ... }).onConflictDoUpdate({ ... })

    return Response.json({ data: { success: true } })

  } catch (error) {
    // Catch-all for both DB failures and truly unexpected errors
    console.error('[progress] Unexpected error:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
```

---

## Client-Side Error Handling

### Calling API Routes from the Client

```typescript
async function updateProgress(conceptId: string, tab: ConceptTab) {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId, tab }),
    })

    if (!res.ok) {
      const { error } = await res.json()

      // Handle specific status codes
      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.status === 429) {
        toast.error(error) // "You're doing that too fast..."
        return
      }

      // Generic fallback for 400, 500, etc.
      toast.error(error ?? 'Something went wrong. Please try again.')
      return
    }

    // Success
    const { data } = await res.json()
    return data

  } catch (error) {
    // Network error — fetch itself failed (offline, timeout, etc.)
    toast.error('Connection error. Please check your internet and try again.')
  }
}
```

### Network Error Detection

Always distinguish between API errors (server responded with error) and network errors (no response):

```typescript
try {
  const res = await fetch('/api/progress', { ... })
  // Server responded — even 4xx/5xx are not thrown by fetch
  if (!res.ok) { /* handle API error */ }
} catch (error) {
  // fetch threw — this is a network error (offline, DNS failure, timeout)
  toast.error('Connection error. Please check your internet and try again.')
}
```

---

## Toast Notification System

Use a single toast utility throughout the app. All user-facing error messages go through toasts — never inline error text except for form validation.

```typescript
// lib/toast.ts — wraps whatever toast library is installed (e.g. sonner)
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  loading: (message: string) => sonnerToast.loading(message),
}
```

### Toast Message Standards

| Situation | Message |
|---|---|
| Progress saved | "Progress saved" |
| Rate limited | "You're doing that too fast. Please wait a moment." |
| Network error | "Connection error. Please check your internet and try again." |
| Not authenticated | _Redirect to /login — no toast_ |
| Premium required | "This content requires a premium subscription." + Upgrade CTA |
| Generic server error | "Something went wrong. Please try again." |
| Challenge passed | "All tests passed! 🎉" |
| Challenge failed | "Some tests failed. Check your output and try again." |

---

## Next.js Error Files

### `app/error.tsx` — Route-Level Error Boundary

```typescript
'use client'

import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // Log to error monitoring service when added
    console.error('[page-error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
      <p className="text-text-muted text-sm">We encountered an unexpected error.</p>
      <button
        onClick={reset}
        className="bg-accent-dark text-text-inverse px-4 py-2 rounded-lg text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
```

### `app/not-found.tsx` — 404 Page

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-text-primary">404</h1>
      <p className="text-text-secondary">This page doesn't exist.</p>
      <Link
        href="/"
        className="bg-accent-dark text-text-inverse px-4 py-2 rounded-lg text-sm font-medium"
      >
        Go home
      </Link>
    </div>
  )
}
```

### `app/learn/[category]/[slug]/not-found.tsx` — Concept Not Found

```typescript
export default function ConceptNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-semibold text-text-primary">Concept not found</h2>
      <p className="text-text-muted text-sm">This concept doesn't exist or has been moved.</p>
      <Link href="/learn" className="text-accent text-sm font-medium hover:underline">
        Browse all concepts
      </Link>
    </div>
  )
}
```

---

## Database Error Handling (Drizzle ORM / `pg`)

Drizzle throws rather than returning a `{ data, error }` tuple — wrap calls in `try/catch`, and use `db.query.*.findFirst()` (resolves `undefined` for no match, doesn't throw) when "no rows" is an expected, normal state rather than a failure:

```typescript
// "No rows" is expected here — findFirst() resolves undefined, not a thrown error
const row = await db.query.userConceptProgress.findFirst({
  where: and(
    eq(userConceptProgress.userId, session.user.id),
    eq(userConceptProgress.conceptId, conceptId),
  ),
})

if (!row) {
  return null  // Concept not started yet — normal state, not an error
}

try {
  await db.insert(xpEvents).values({ ... })
} catch (error) {
  // Postgres error codes still apply — they come from the database itself, not from a client library
  const code = (error as { code?: string }).code
  if (code === '23505') {
    // Unique constraint violation — user message: already exists
  }
  console.error('[progress] DB error:', code, error)
  throw new Error('Failed to save progress')
}
```

### Common Postgres Error Codes

| Code | Meaning | How to handle |
|---|---|---|
| `23505` | Unique constraint violation | User message: already exists |
| `23503` | Foreign key violation | Usually a bug (referencing a deleted/non-existent row) — log and investigate |
| _(no rows)_ | `db.query.*.findFirst()` resolves `undefined`, doesn't throw | Return null / default value — not an error |

Session-expiry handling moved to Better-Auth: `auth.api.getSession()` returning `null` (not a Postgres error) means the session is invalid or expired — redirect to `/login`, the same outcome the old `PGRST301`/JWT-expired case produced.

---

## Simulator Error Handling

Simulators run entirely client-side with pre-scripted steps. They should never throw — but protect against edge cases:

```typescript
function useEventLoopSimulator(scenario: SimulatorStep[]) {
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const step = useCallback(() => {
    try {
      if (currentStep >= scenario.length - 1) return  // Already at end — no error
      setCurrentStep(prev => prev + 1)
    } catch (err) {
      // Should never happen with pre-scripted steps, but protect anyway
      console.error('[simulator] Step failed:', err)
      setError('Simulator encountered an error. Click Restart to try again.')
    }
  }, [currentStep, scenario])

  return { currentStep, error, step }
}
```

If a simulator error state is set, show an inline error with a Restart button — never a toast for simulator errors.

---

## Code Sandbox Error Handling

The practice section runs user code in an iframe. Always handle:

```typescript
// 1. Syntax errors in user code
// 2. Runtime errors in user code
// 3. Timeout (infinite loops)
// 4. postMessage communication failures

window.addEventListener('message', (event) => {
  if (event.data?.type === 'ERROR') {
    setTestOutput({
      status: 'error',
      message: event.data.error ?? 'An error occurred while running your code.',
    })
  }

  if (event.data?.type === 'TIMEOUT') {
    setTestOutput({
      status: 'error',
      message: 'Your code took too long to run (5s limit). Check for infinite loops.',
    })
  }
})
```

---

## Logging Strategy

### What to Log (Server-Side)

```typescript
// DB errors — include route context and error code, never user data
console.error('[progress] DB write failed:', error.code, error.message)

// Unexpected errors — include route and error
console.error('[auth/callback] Unexpected error:', error)

// Rate limit hits — useful for monitoring abuse
console.warn('[rate-limit] User hit limit:', userId)
```

### What to Never Log

```typescript
// Never log user-identifiable content
console.error('User email:', user.email)  // ✗
console.error('User code:', body.code)     // ✗ (submitted code)
console.error('Auth token:', token)        // ✗

// Never log in client components in production
// Use a proper error monitoring service when needed
```

### Log Format

Always prefix logs with the route or module in brackets: `[module-name]`. Makes filtering easier.

---

## Loading States

Every async operation needs a loading state. Never leave the UI unresponsive.

```typescript
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function handleSubmit() {
  setIsLoading(true)
  setError(null)  // Clear previous error before new attempt

  try {
    await updateProgress(conceptId, tab)
  } catch (err) {
    setError('Could not save progress. Please try again.')
  } finally {
    setIsLoading(false)  // Always reset loading — success or failure
  }
}
```

`finally` is mandatory — never rely on try/catch branches to reset loading state.

---

## Error Handling Invariants

Rules that must never be violated:

- Every `async` function that calls an external service is wrapped in `try/catch`
- Every Drizzle write is wrapped in `try/catch` — Drizzle throws on failure, it has no `{ data, error }` tuple to check
- `finally` is always used to reset loading state — never leave a component stuck in loading
- Raw error messages, stack traces, and internal codes are never shown to users
- Errors are never silently swallowed — either handle and show a message, or re-throw
- Network errors (fetch throws) are always distinguished from API errors (bad status code)
- A missing row from `db.query.*.findFirst()` is always treated as a normal empty state, not an error
- Simulator errors show inline with a Restart button — never a toast
- All client-facing error messages use the standard wording from the toast table above
- `console.error` is used for unexpected errors in server routes — never `console.log`

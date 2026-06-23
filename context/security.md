# Security

Security rules for Frontend Forever. These apply to every layer of the stack. Read this before implementing any API route, auth flow, user input, or content gating feature.

---

## Authentication Security

### Session Validation

Always validate the session server-side before trusting any request:

```typescript
// Every protected API route and Server Action
import { auth } from '@/lib/auth/server'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })

if (!session?.user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

`auth.api.getSession()` is a real server-side call — it validates the session against the database, the same trust boundary `getUser()` provided under Supabase Auth. Never trust a session object that only came from a client-reported cookie value; always call `auth.api.getSession()` server-side in security-sensitive paths.

### Proxy (Middleware) Protection

`proxy.ts` (Next 16's renamed `middleware.ts`) guards all protected routes — but it only does an **optimistic** cookie-presence check via Better-Auth's `getSessionCookie()` helper, not full verification (no DB call there, by design — it's a fast UX redirect, not the security boundary). Never duplicate that redirect logic inside page components. But every protected API route and Server Component must still call `auth.api.getSession()` independently — the proxy check alone is not sufficient, the same way Supabase's `middleware.ts` never was.

### OAuth Only

No email/password auth. This eliminates:
- Password brute force attacks
- Credential stuffing
- Insecure password storage
- Password reset flows being exploited

Never add email/password auth without explicit product decision.

---

## Database Security

### No RLS — Authorization Is Enforced in Application Code

**This is a deliberate change from the original Supabase-Auth design.** App data is now queried via a direct Postgres connection (`lib/db.ts`, Drizzle ORM over `pg`), not Supabase's PostgREST client — there is no per-request Supabase JWT for an `auth.uid()`-based RLS policy to read, and a direct connection bypasses RLS regardless of whether policies exist on the table. This means the `user_id` filter below is the **only** boundary, not a second layer on top of RLS — get it wrong and there is nothing else stopping a cross-user read or write.

```typescript
// Mandatory — every query against a user-owned table filters by the session's user id
import { and, eq } from 'drizzle-orm'

const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

const progress = await db
  .select()
  .from(userConceptProgress)
  .where(and(
    eq(userConceptProgress.userId, session.user.id),   // mandatory — the only authorization boundary
    eq(userConceptProgress.conceptId, slug),
  ))

// Never — no user_id filter means this returns/touches every user's row
const progress = await db
  .select()
  .from(userConceptProgress)
  .where(eq(userConceptProgress.conceptId, slug))
```

### `DATABASE_URL` Is the New Service-Role-Key-Equivalent

`DATABASE_URL` has full, unpoliced table access — equivalent in sensitivity to the old `SUPABASE_SERVICE_ROLE_KEY`. Rules:
- Never use it in client-side code, never import `lib/db.ts` into a Client Component
- Never prefix it with `NEXT_PUBLIC_`
- Never log it or include it in an error message
- If a query ever needs to run without a `user_id` filter (admin tooling, seed scripts), that code path must never be reachable from a user-facing API route

### Input Validation Before Any DB Write

Validate all user-supplied input before it touches the database:

```typescript
// Validate concept tab before writing progress
const VALID_TABS = ['understand', 'simulate', 'challenge', 'interview', 'build'] as const
if (!VALID_TABS.includes(body.tab)) {
  return Response.json({ error: 'Invalid tab' }, { status: 400 })
}

// Validate XP event types before writing
const VALID_XP_EVENTS = ['concept_understand', 'concept_simulate', ...] as const
if (!VALID_XP_EVENTS.includes(body.eventType)) {
  return Response.json({ error: 'Invalid event type' }, { status: 400 })
}
```

Never trust `body.tab` or `body.eventType` from the client. Always validate against an allowlist.

---

## API Route Security

### Mandatory Order in Every Write Route

```typescript
export async function POST(req: Request) {
  // 1. Auth — always first
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Rate limit — always second
  const { success } = await ratelimit.limit(session.user.id)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  // 3. Parse body
  const body = await req.json()

  // 4. Validate input — always before DB write
  if (!body.conceptId || typeof body.conceptId !== 'string') {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  // 5. Business logic
  // ...
}
```

Never reorder these steps. Auth and rate limiting must run before any logic.

### HTTP Method Validation

Only handle the methods your route expects:

```typescript
export async function GET(req: Request) { /* ... */ }
// POST to a GET-only route returns 405 automatically in Next.js App Router
// But for routes that handle multiple methods — be explicit
```

### Never Trust Client-Sent IDs for Ownership

Always verify the resource belongs to the authenticated user:

```typescript
// Bad — trusts client that conceptId belongs to user
const data = await db
  .select()
  .from(userConceptProgress)
  .where(eq(userConceptProgress.conceptId, body.conceptId))

// Good — scopes to user_id, so even a wrong conceptId only returns their own data
const data = await db
  .select()
  .from(userConceptProgress)
  .where(and(
    eq(userConceptProgress.userId, session.user.id),
    eq(userConceptProgress.conceptId, body.conceptId),
  ))
```

---

## Premium Content Security

### Server-Side Gating — Never Trust the Client

Premium checks must always happen server-side. The client UI shows a blur/lock — but the actual data must never reach the client for non-premium users.

```typescript
// In a Server Component or API route
const profile = await db.query.profiles.findFirst({
  columns: { isPremium: true, premiumExpiresAt: true },
  where: eq(profiles.id, session.user.id),
})

const isPremium = profile?.isPremium &&
  (!profile.premiumExpiresAt || new Date(profile.premiumExpiresAt) > new Date())

if (!isPremium) {
  return Response.json({ error: 'Premium required' }, { status: 403 })
}
```

Never gate premium content with only a client-side `if (user.is_premium)` check. The API must enforce it.

### Premium Data Must Not Leak in API Responses

When returning question or challenge data, strip solution/answer fields for non-premium users:

```typescript
// Never return solution_code to non-premium users
const challenge = isPremium
  ? { ...challengeData }
  : { ...challengeData, solution_code: null }
```

---

## Code Execution Security (Practice + Build Tab)

The practice section runs user-submitted JavaScript in the browser. This must be fully sandboxed.

### iframe Sandbox Configuration

```html
<!-- Always include all of these sandbox restrictions -->
<iframe
  sandbox="allow-scripts"
  srcDoc={userCode}
  title="Code execution sandbox"
  style={{ display: 'none' }}
/>
```

`allow-scripts` only — never add:
- `allow-same-origin` — would allow the iframe to access parent window storage and cookies
- `allow-forms` — unnecessary for code execution
- `allow-popups` — unnecessary, prevents phishing
- `allow-top-navigation` — prevents iframe from redirecting the parent page

### Communication via postMessage Only

```typescript
// Parent → iframe: send code to execute
iframe.contentWindow?.postMessage({ type: 'RUN', code: userCode }, '*')

// iframe → parent: receive results
window.addEventListener('message', (event) => {
  // Always validate the message type before acting
  if (event.data?.type === 'RESULT') {
    setOutput(event.data.output)
  }
})
```

### Never eval() User Code Outside the Sandbox

Never use `eval()`, `new Function()`, or dynamic `<script>` injection in the main page context. All user code execution goes through the sandboxed iframe only.

### Limit Execution Time

Protect against infinite loops in user code:

```javascript
// Inside the sandbox iframe — wrap execution with a timeout
const timeoutId = setTimeout(() => {
  parent.postMessage({ type: 'ERROR', error: 'Execution timed out (5s limit)' }, '*')
}, 5000)

try {
  // Run user code
  eval(code)
  clearTimeout(timeoutId)
} catch (err) {
  clearTimeout(timeoutId)
  parent.postMessage({ type: 'ERROR', error: err.message }, '*')
}
```

---

## Environment Variables

### Public vs Private

| Prefix | Exposed to | Use for |
|---|---|---|
| `NEXT_PUBLIC_` | Browser + Server | `BETTER_AUTH_URL` only (the base URL the auth client redirects against) — nothing else in this project needs to be public |
| _(no prefix)_ | Server only | `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth client secrets, Upstash tokens, Stripe secret key |

Never put secret keys in `NEXT_PUBLIC_` variables. Unlike the old Supabase anon key (safe by design because RLS protected the data behind it), `DATABASE_URL` has **no** policy layer behind it — it must never be public under any circumstance.

### Never Log Environment Variables

```typescript
// Never
console.log(process.env.UPSTASH_REDIS_REST_TOKEN)

// Never in error messages
return Response.json({ error: `Config error: ${process.env.DATABASE_URL}` })
```

### `.env.local` in `.gitignore`

`.env.local` must always be in `.gitignore`. Never commit real keys. The repo contains only `.env.example` with empty values.

---

## HTTP Security Headers

Configure in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',  // Prevents clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',     // Prevents MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",  // unsafe-eval needed for Monaco Editor
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.upstash.io", // add Supabase Storage's origin here if/when Storage is actually used
      "frame-src 'none'",                 // Except for our sandbox iframe — handle separately
    ].join('; '),
  },
]
```

---

## XSS Prevention

### Never Use dangerouslySetInnerHTML

Never use `dangerouslySetInnerHTML` with user-supplied content. The only acceptable uses are:
- Pre-sanitized HTML from a trusted MDX renderer
- The code execution sandbox iframe's `srcDoc` (which is sandboxed)

### MDX Content is Safe — User Content is Not

MDX files are source-controlled content authored by the FF team — they are safe. User-supplied content (bios, usernames) must never be rendered as HTML. Always render as plain text.

```typescript
// Safe — MDX content from source-controlled files
<MDXContent source={concept.content} />

// Safe — user content as plain text
<p>{user.bio}</p>

// Never — user content as HTML
<div dangerouslySetInnerHTML={{ __html: user.bio }} />
```

### URL Validation for External Links

When rendering any user-supplied or external URL (e.g., portfolio URLs on profiles):

```typescript
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

// Never render javascript: URLs
<a href={isSafeUrl(user.portfolioUrl) ? user.portfolioUrl : '#'}>
  Portfolio
</a>
```

---

## Rate Limiting Reference

| Endpoint | Limit | Window |
|---|---|---|
| `/api/progress` | 20 requests | 10 seconds |
| `/api/auth/*` | 5 requests | 60 seconds |
| All other write routes | 20 requests | 10 seconds |

Rate limit key is always `user.id` — never IP address for authenticated routes.

---

## Security Invariants

Rules that must never be violated:

- `auth.api.getSession()` (server-verified) is the only valid authorization check — never trust a client-reported session
- There is no RLS safety net — every query on a user-owned table must filter `WHERE user_id = session.user.id` in application code, with no exceptions
- `DATABASE_URL` never appears in client code, never gets logged, never appears in an error message
- All user input is validated against an allowlist before DB writes
- Premium content is gated server-side — client UI is cosmetic only
- User code execution is always inside a sandboxed iframe with `allow-scripts` only
- `dangerouslySetInnerHTML` is never used with user-supplied content
- No secrets in `NEXT_PUBLIC_` variables
- `.env.local` is never committed to git

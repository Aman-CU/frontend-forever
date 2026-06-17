# Security

Security rules for Frontend Forever. These apply to every layer of the stack. Read this before implementing any API route, auth flow, user input, or content gating feature.

---

## Authentication Security

### Session Validation

Always validate the session server-side before trusting any request:

```typescript
// Every protected API route and Server Action
const supabase = await createSupabaseServer()
const { data: { user }, error } = await supabase.auth.getUser()

// Never use getSession() for security checks — it reads from cookie without server verification
// Always use getUser() — it verifies the token with Supabase servers
if (!user || error) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

`getSession()` reads from the local cookie and can be spoofed. `getUser()` makes a server-side verification call. Always use `getUser()` in security-sensitive paths.

### Middleware Protection

`middleware.ts` guards all protected routes. Never duplicate auth checks inside page components — the middleware handles it. But API routes must still check auth independently — middleware does not run for API routes in all deployment configurations.

### OAuth Only

No email/password auth. This eliminates:
- Password brute force attacks
- Credential stuffing
- Insecure password storage
- Password reset flows being exploited

Never add email/password auth without explicit product decision.

---

## Database Security

### Row Level Security (RLS)

RLS is enabled on every table with a `user_id` column. Never disable it. Never bypass it with a service role key in client-facing code.

```sql
-- Every user-owned table has this policy
CREATE POLICY "Users access own data only"
  ON user_concept_progress
  FOR ALL
  USING (user_id = auth.uid());
```

### Always Scope Queries to User

Even with RLS active, always include the user filter explicitly in application code. Defense in depth — two layers of protection:

```typescript
// Good — explicit user scope + RLS
const { data } = await supabase
  .from('user_concept_progress')
  .select('*')
  .eq('user_id', user.id)   // explicit filter
  .eq('concept_id', slug)

// Bad — relies on RLS alone, and leaks intent
const { data } = await supabase
  .from('user_concept_progress')
  .select('*')
  .eq('concept_id', slug)
```

### Never Expose the Service Role Key

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Rules:
- Never use it in client-side code
- Never prefix it with `NEXT_PUBLIC_`
- Only use it in trusted server-side scripts (migrations, seed scripts) — never in API routes
- If it's ever needed in an API route, that's a red flag — redesign the approach

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
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Rate limit — always second
  const { success } = await ratelimit.limit(user.id)
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
const { data } = await supabase
  .from('user_concept_progress')
  .select('*')
  .eq('concept_id', body.conceptId)

// Good — scopes to user_id, so even a wrong conceptId only returns their own data
const { data } = await supabase
  .from('user_concept_progress')
  .select('*')
  .eq('user_id', user.id)
  .eq('concept_id', body.conceptId)
```

---

## Premium Content Security

### Server-Side Gating — Never Trust the Client

Premium checks must always happen server-side. The client UI shows a blur/lock — but the actual data must never reach the client for non-premium users.

```typescript
// In a Server Component or API route
const { data: profile } = await supabase
  .from('profiles')
  .select('is_premium, premium_expires_at')
  .eq('id', user.id)
  .single()

const isPremium = profile?.is_premium &&
  (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date())

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
| `NEXT_PUBLIC_` | Browser + Server | Supabase URL, Supabase Anon Key only |
| _(no prefix)_ | Server only | Upstash tokens, Stripe secret key |

Never put secret keys in `NEXT_PUBLIC_` variables. The anon key is safe because RLS protects the data — the anon key alone cannot bypass RLS.

### Never Log Environment Variables

```typescript
// Never
console.log(process.env.UPSTASH_REDIS_REST_TOKEN)

// Never in error messages
return Response.json({ error: `Config error: ${process.env.SUPABASE_URL}` })
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
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io",
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

- `getUser()` not `getSession()` for auth verification in API routes
- RLS is always on — never disable for any table
- Service role key never appears in any route handler or client code
- All user input is validated against an allowlist before DB writes
- Premium content is gated server-side — client UI is cosmetic only
- User code execution is always inside a sandboxed iframe with `allow-scripts` only
- `dangerouslySetInnerHTML` is never used with user-supplied content
- No secrets in `NEXT_PUBLIC_` variables
- `.env.local` is never committed to git

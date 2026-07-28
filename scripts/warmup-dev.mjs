/**
 * Run after `npm run dev` is ready: `npm run warmup` (or `node scripts/warmup-dev.mjs`).
 *
 * Turbopack's dev server compiles each route lazily on its first request —
 * until that happens, the route 404s instead of queueing/waiting (see
 * AGENTS.md -> "Known Dev-Server Quirks"). This hits one real URL per route
 * *file* (not every param value — compiling a dynamic route file once makes
 * every param under it work) so the whole app is warm before you start
 * clicking around, instead of discovering 404s (including on /api/auth,
 * which breaks login) one at a time.
 *
 * A few routes (see STUBBORN_ROUTE_FILES) don't get discovered by an HTTP
 * request at all — confirmed by checking the dev server log, which never
 * even shows a "Compiling ..." line for them. Those need an actual file save
 * to register, so this script does that automatically for the ones already
 * known to need it, then re-requests to confirm.
 *
 * Update ROUTES when a new top-level route or dynamic segment is added. If a
 * route still fails after a few runs, check the dev server log for whether
 * it ever printed "Compiling <that route>" — if not, add its page.tsx/
 * route.ts path to STUBBORN_ROUTE_FILES instead of assuming it's a real bug.
 */
import fs from "node:fs/promises";

const BASE_URL = process.env.WARMUP_BASE_URL || "http://localhost:3000";
// A handful of routes have taken close to 2 minutes on a fully cold cache in
// this environment (see AGENTS.md's TLS-interception + Turbopack notes) —
// generous on purpose, this only runs once per dev-server restart.
const TIMEOUT_MS = 180_000;

const ROUTES = [
  "/",
  "/login",
  "/learn",
  "/learn/accessibility/accessible-forms",
  "/practice",
  "/practice/css",
  "/practice/css/box-sizing-content-vs-border",
  "/interview-prep",
  "/interview-prep/ff-75",
  "/interview-prep/ff-javascript",
  "/interview-prep/ff-javascript/var-let-const-differences",
  "/interview-prep/ff-react",
  "/interview-prep/ff-nextjs",
  "/interview-prep/ff-system-design",
  "/interview-prep/ff-system-design/accessible-dropdown-menu",
  "/interview-prep/playbook/frontend-interview-playbook",
  "/interview-prep/playbook/frontend-interview-playbook/how-frontend-interviews-are-structured",
  "/interview-prep/study-plans",
  "/interview-prep/study-plans/1-week",
  "/interview-prep/company-guides",
  "/interview-prep/company-guides/openai",
  "/interview-prep/review",
  "/playground",
  "/playground/battles",
  // Login-gated (Feature 53) — an unauthenticated request redirects to
  // /login, which fetch follows by default, so this still compiles both
  // routes rather than needing a real session.
  "/playground/battles/login-card-recreate",
  "/playground/experiments",
  "/playground/experiments/particle-cursor-trail",
  "/roadmaps",
  "/roadmaps/frontend-developer",
  // Login-gated (Feature 36, proxy.ts's matcher) — same as the Battles editor
  // above, an unauthenticated request redirects to /login and fetch follows
  // it by default, so this still compiles the route.
  "/leaderboard",
  // Login-gated (Feature 37, proxy.ts's matcher) — same redirect-follows
  // behavior as /leaderboard above. /settings itself redirects to
  // /settings/profile; both are warmed since they're separate route files
  // (bare /settings, and the dynamic /settings/[section]).
  "/settings",
  "/settings/profile",
  "/dashboard",
  "/api/auth/get-session",
  // Unauthenticated on purpose — this only needs to trigger compilation, not
  // a real toggle, so a 401 (auth check runs before any DB write) counts as
  // warmed rather than a 2xx.
  {
    path: "/api/collection-questions/toggle-complete",
    method: "POST",
    body: { slug: "warmup", completed: true },
    expectStatus: 401,
  },
];

// Route path -> its page.tsx/route.ts, for routes that need an actual file
// save (not just a request) to register with Turbopack. See the header note.
const STUBBORN_ROUTE_FILES = {
  "/interview-prep/playbook/frontend-interview-playbook/how-frontend-interviews-are-structured":
    "src/app/(app)/interview-prep/playbook/[playbookSlug]/[chapterSlug]/page.tsx",
};

async function touchFile(relPath) {
  const original = await fs.readFile(relPath, "utf-8");
  await fs.writeFile(relPath, original + "\n");
  await new Promise((r) => setTimeout(r, 500));
  await fs.writeFile(relPath, original);
}

// A 404/500 must never count as "warm" — fetch follows redirects by default
// (e.g. an auth-gated route sending a logged-out request to /login), so a
// 2xx here also covers "compiled fine, just redirected somewhere that also
// compiled fine," not just a literal 200 on the exact requested path.
// expectStatus overrides this for routes where a non-2xx is the actually
// correct unauthenticated response (e.g. a write route's own auth check).
function isOk(status, expectStatus) {
  if (expectStatus) return status === expectStatus;
  return typeof status === "number" && status >= 200 && status < 300;
}

// ROUTES entries are either a path string (GET, expects 2xx) or
// { path, method, body, expectStatus } for anything else.
function normalizeRoute(route) {
  return typeof route === "string" ? { path: route, method: "GET" } : route;
}

async function hit(route) {
  const { path, method = "GET", body, expectStatus } = normalizeRoute(route);
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const ms = Date.now() - start;
    return { path, status: res.status, ms, ok: isOk(res.status, expectStatus) };
  } catch (err) {
    const ms = Date.now() - start;
    return { path, status: null, ms, ok: false, error: err.message };
  }
}

async function main() {
  console.log(`Warming up ${ROUTES.length} routes against ${BASE_URL}...\n`);
  const results = [];
  for (const route of ROUTES) {
    const result = await hit(route);
    results.push(result);
    const label = result.status ?? "ERR";
    console.log(`${String(label).padStart(3)}  ${(result.ms / 1000).toFixed(1)}s  ${result.path}`);
  }

  let failed = results.filter((r) => !r.ok);
  const stillUnhandled = [];
  for (const f of failed) {
    const file = STUBBORN_ROUTE_FILES[f.path];
    if (!file) {
      stillUnhandled.push(f);
      continue;
    }
    console.log(`\n${f.path} needs a file save to register — touching ${file}...`);
    await touchFile(file);
    const retry = await hit(f.path);
    console.log(`  retry: ${retry.status ?? "ERR"}  ${(retry.ms / 1000).toFixed(1)}s`);
    if (!retry.ok) stillUnhandled.push(retry);
    else results[results.indexOf(f)] = retry;
  }
  failed = stillUnhandled;

  console.log(`\n${results.length - failed.length}/${results.length} routes warm.`);
  if (failed.length > 0) {
    console.log("Still failing (re-run this script once more, or check the dev server log):");
    for (const f of failed) console.log(`  ${f.path} -> ${f.status ?? f.error}`);
    process.exitCode = 1;
  }
}

main();

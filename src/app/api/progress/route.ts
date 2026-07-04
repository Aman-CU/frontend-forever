import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { getPostgresErrorCode } from "@/lib/dbErrors";
import { CONCEPT_TABS, type ConceptTab } from "@/lib/constants";
import { applyProgressUpdate } from "@/lib/progress/applyProgressUpdate";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isConceptTab(value: unknown): value is ConceptTab {
  return typeof value === "string" && (CONCEPT_TABS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  const { success } = await ratelimit.limit(session.user.id);
  if (!success) {
    return Response.json(
      { error: "You're doing that too fast. Please wait a moment." },
      { status: 429 },
    );
  }

  // 3. Parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { conceptId, tab } = (body ?? {}) as { conceptId?: unknown; tab?: unknown };
  // Validate the UUID shape up front so a malformed id is a clean 400 rather than
  // a foreign-key violation surfacing as a 500 from the catch below.
  if (typeof conceptId !== "string" || !UUID_RE.test(conceptId) || !isConceptTab(tab)) {
    return Response.json({ error: "Invalid conceptId or tab" }, { status: 400 });
  }

  // 4. Progress write + XP + streak, all-or-nothing.
  try {
    await db.transaction((tx) => applyProgressUpdate(tx, session.user.id, conceptId, tab));
  } catch (error) {
    console.error("[progress] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save progress" }, { status: 500 });
  }

  return Response.json({ success: true });
}

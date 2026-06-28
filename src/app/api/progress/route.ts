import type { InferInsertModel } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { userConceptProgress } from "@/lib/schema";
import { CONCEPT_TABS, type ConceptTab } from "@/lib/constants";

type ProgressInsert = InferInsertModel<typeof userConceptProgress>;

// Per-tab completion flag. Feature 22 only wires "understand"; the rest are ready
// for Feature 27, which adds XP events, streaks, and the fully-completed bonus.
const COMPLETED_SET: Record<ConceptTab, Partial<ProgressInsert>> = {
  understand: { understandCompleted: true },
  simulate: { simulateCompleted: true },
  challenge: { challengeCompleted: true },
  interview: { interviewCompleted: true },
  build: { buildCompleted: true },
};

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
  if (typeof conceptId !== "string" || !conceptId || !isConceptTab(tab)) {
    return Response.json({ error: "Invalid conceptId or tab" }, { status: 400 });
  }

  // 4. Upsert the tab's completion flag, scoped to the session user
  const flag = COMPLETED_SET[tab];
  try {
    await db
      .insert(userConceptProgress)
      .values({ userId: session.user.id, conceptId, ...flag })
      .onConflictDoUpdate({
        target: [userConceptProgress.userId, userConceptProgress.conceptId],
        set: { ...flag, updatedAt: new Date() },
      });
  } catch {
    return Response.json({ error: "Could not save progress" }, { status: 500 });
  }

  return Response.json({ success: true });
}

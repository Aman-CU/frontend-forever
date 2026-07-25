import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";
import { db } from "@/lib/db";
import { roadmapNodes, roadmapNodeLinks, userRoadmapNodeProgress } from "@/lib/schema";
import { getPostgresErrorCode } from "@/lib/dbErrors";

export async function POST(req: Request) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit (AGENTS.md rule 5 — every write route runs the limiter),
  // own namespaced bucket separate from every other write route.
  const { success } = await ratelimit.limit(`roadmap-progress:${session.user.id}`);
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
  const { nodeId, completed } = (body ?? {}) as { nodeId?: unknown; completed?: unknown };
  if (typeof nodeId !== "string" || typeof completed !== "boolean") {
    return Response.json({ error: "Invalid nodeId or completed value" }, { status: 400 });
  }

  const [node] = await db
    .select({ id: roadmapNodes.id })
    .from(roadmapNodes)
    .where(eq(roadmapNodes.id, nodeId));
  if (!node) {
    return Response.json({ error: "Roadmap node not found" }, { status: 404 });
  }

  // This toggle is only meant for nodes with no learn-concept link — those
  // derive their completed state from real user_concept_progress instead
  // (see user_roadmap_node_progress's schema comment). Reject writes on a
  // concept-linked node rather than silently accepting a signal the UI
  // never reads back.
  const [conceptLink] = await db
    .select({ id: roadmapNodeLinks.id })
    .from(roadmapNodeLinks)
    .where(and(eq(roadmapNodeLinks.nodeId, nodeId), eq(roadmapNodeLinks.linkType, "learn-concept")));
  if (conceptLink) {
    return Response.json(
      { error: "This node's progress is tracked automatically through Learn." },
      { status: 400 },
    );
  }

  // 4. Write, scoped to the session user. Row presence is the completion
  // signal (not a boolean column) — tick inserts, untick deletes, both are
  // no-ops if already in that state. No XP — self-reported, unverifiable
  // completion never earns a reward in this codebase (same precedent as
  // user_collection_question_progress).
  try {
    if (completed) {
      await db
        .insert(userRoadmapNodeProgress)
        .values({ userId: session.user.id, nodeId: node.id })
        .onConflictDoNothing({
          target: [userRoadmapNodeProgress.userId, userRoadmapNodeProgress.nodeId],
        });
    } else {
      await db
        .delete(userRoadmapNodeProgress)
        .where(
          and(
            eq(userRoadmapNodeProgress.userId, session.user.id),
            eq(userRoadmapNodeProgress.nodeId, node.id),
          ),
        );
    }
  } catch (error) {
    console.error("[roadmap-progress] DB write failed:", getPostgresErrorCode(error));
    return Response.json({ error: "Could not save your progress" }, { status: 500 });
  }

  return Response.json({ success: true, completed });
}

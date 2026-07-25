import type { Metadata } from "next";

import { getCachedSession } from "@/lib/auth/server";
import { getRoadmapSummaries } from "@/features/roadmaps/lib/queries";
import { RoadmapCard } from "@/features/roadmaps/components/RoadmapCard";

export const metadata: Metadata = {
  title: "Roadmaps | Frontend Forever",
  description:
    "Step-by-step roadmaps for frontend engineering — a full role-based path plus focused skill roadmaps for JavaScript, CSS, React, and TypeScript.",
};

export default async function RoadmapsPage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const roadmaps = await getRoadmapSummaries(userId);
  const roleRoadmaps = roadmaps.filter((r) => r.roadmapType === "role");
  const skillRoadmaps = roadmaps.filter((r) => r.roadmapType === "skill");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Roadmaps</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Structured paths through frontend engineering — pick a full role path or go deep on one
          skill.
        </p>
      </div>

      {roleRoadmaps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Role-based
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roleRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      )}

      {skillRoadmaps.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Skill-based
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skillRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

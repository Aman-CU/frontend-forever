import Link from "next/link";

import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Flat, static, blurred/transparent card — icon left of title, real
// devicon.dev marks (see roadmapMeta.ts) rather than a generic lucide icon
// or a per-category colored badge square. The devicon SVGs already carry
// their own real brand color (className has no effect on their fill), so
// the icon's backing chip stays neutral (bg-surface-secondary) instead of a
// per-roadmap colorKey tint. text-accent on the icon itself only matters
// for the one non-devicon case (Code2, the role roadmap's generic "</>"
// mark) — it's a stroke icon with no color of its own.
export function RoadmapCard({ roadmap }: Props) {
  const { icon: Icon } = getRoadmapMeta(roadmap.slug);

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-5 py-5 backdrop-blur-sm transition-colors hover:border-accent hover:bg-surface/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
        <Icon className="h-5 w-5 text-accent" />
      </div>

      <span className="text-sm font-medium text-text-primary">{roadmap.title}</span>
    </Link>
  );
}

import Link from "next/link";

import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Flat, static, blurred/transparent card — icon left of title, real
// devicon.dev marks (see roadmapMeta.ts) rather than a generic lucide icon
// or a per-category colored badge square. The devicon SVG already carries
// its own real brand color, so the icon's backing chip stays neutral
// (bg-surface-secondary) instead of a per-roadmap colorKey tint — the icon
// itself is what makes each card recognizable now, not the chip color.
export function RoadmapCard({ roadmap }: Props) {
  const { icon: Icon } = getRoadmapMeta(roadmap.slug);

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-5 py-5 backdrop-blur-sm transition-colors hover:border-accent hover:bg-surface/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-sm font-medium text-text-primary">{roadmap.title}</span>
    </Link>
  );
}

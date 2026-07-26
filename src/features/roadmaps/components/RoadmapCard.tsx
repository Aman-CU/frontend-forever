import Link from "next/link";

import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import { isRoadmapComingSoon } from "@/features/roadmaps/lib/comingSoonRoadmaps";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Flat, static, blurred/transparent card — icon left of title, real
// devicon.dev marks (see roadmapMeta.ts) rather than a generic lucide icon
// or a per-category colored badge square. The devicon SVGs already carry
// their own real brand color (className has no effect on their fill), so
// the icon's backing chip stays neutral (bg-surface-secondary) instead of a
// per-roadmap colorKey tint. `iconClassName` (from roadmapMeta.ts) only
// matters for the 2 non-devicon cases (Code2, FFLogoIcon) — stroke/text
// icons with no color of their own.
export function RoadmapCard({ roadmap }: Props) {
  const { icon: Icon, iconClassName } = getRoadmapMeta(roadmap.slug);
  const comingSoon = isRoadmapComingSoon(roadmap.slug);

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-5 py-5 backdrop-blur-sm transition-colors hover:border-accent hover:bg-surface/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
        <Icon className={iconClassName} />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
        {roadmap.title}
      </span>

      {comingSoon && (
        <span className="shrink-0 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-text-secondary">
          Coming soon
        </span>
      )}
    </Link>
  );
}

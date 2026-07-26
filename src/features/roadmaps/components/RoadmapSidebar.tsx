import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  relatedRoadmaps: RoadmapSummary[];
};

// The reference product's left-column widgets, adapted to real FF data
// rather than copied verbatim — a completion legend that actually matches
// this page's own checkmark treatment (not roadmap.sh's "personal
// recommendation / alternative option" legend, which has no equivalent in
// this schema — there's no authored recommended-vs-alternative distinction
// between sibling branch nodes here), and a Related Roadmaps list built
// from the real other 4 roadmaps instead of a static list.
export function RoadmapSidebar({ relatedRoadmaps }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Legend</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            Completed
          </li>
          <li className="flex items-center gap-2">
            <Circle className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            Not started
          </li>
        </ul>
      </div>

      {relatedRoadmaps.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Related Roadmaps
          </h2>
          <ul className="space-y-1">
            {relatedRoadmaps.map((roadmap) => {
              const { icon: Icon } = getRoadmapMeta(roadmap.slug);
              return (
                <li key={roadmap.id}>
                  <Link
                    href={`/roadmaps/${roadmap.slug}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{roadmap.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Minimal by design, per direct user request/reference — title only, no
// icon, no description, no topic count/progress. bg-surface/60 +
// backdrop-blur-sm (same translucent-overlay pattern as
// ExperimentShareButton's floating toolbar button) gives the "blurred,
// transparent card" look while staying on real design-token colors rather
// than a hardcoded dark navy, so it still adapts to light/dark theme.
export function RoadmapCard({ roadmap }: Props) {
  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="flex items-center rounded-xl border border-border bg-surface/60 px-5 py-5 backdrop-blur-sm transition-colors hover:border-accent hover:bg-surface/80"
    >
      <span className="text-sm font-medium text-text-primary">{roadmap.title}</span>
    </Link>
  );
}

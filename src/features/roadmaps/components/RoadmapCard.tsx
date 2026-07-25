import Link from "next/link";

import { cn } from "@/lib/utils";
import { COLOR_CLASSES } from "@/features/learn/lib/categoryMeta";
import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Reverted back to the flat, blurred/transparent card (no motion/glow —
// tried and rejected), title-only content-wise except for one thing added
// back per direct request: a small icon to the left of the title, always
// topic-relevant, never decorative — reuses getRoadmapMeta's per-roadmap
// icon/badge/color (the same mapping onto each skill roadmap's matching
// Learn category, e.g. the JS/TS letter badges) rather than a generic icon.
// bg-surface/60 + backdrop-blur-sm on real design tokens (not a hardcoded
// dark navy) for the "blurred, transparent" look, adapts to light/dark.
export function RoadmapCard({ roadmap }: Props) {
  const { icon: Icon, colorKey, badge, badgeStyle } = getRoadmapMeta(roadmap.slug);
  const { iconBg, iconText } = COLOR_CLASSES[colorKey];

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-5 py-5 backdrop-blur-sm transition-colors hover:border-accent hover:bg-surface/80"
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          badgeStyle ? badgeStyle.bg : iconBg,
        )}
      >
        {badge ? (
          <span
            className={cn("text-xs font-bold leading-none", badgeStyle ? badgeStyle.text : iconText)}
          >
            {badge}
          </span>
        ) : (
          <Icon className={cn("h-4 w-4", iconText)} aria-hidden />
        )}
      </div>

      <span className="text-sm font-medium text-text-primary">{roadmap.title}</span>
    </Link>
  );
}

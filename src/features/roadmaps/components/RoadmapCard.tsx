import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { COLOR_CLASSES } from "@/features/learn/lib/categoryMeta";
import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
  isLoggedIn: boolean;
};

// Same card shell as ChallengeCategoryCard/CategoryCard (icon square,
// hover-lift, hover-border-by-color) so Roadmaps reads as one system with
// Learn/Practice rather than a bolted-on section — kept as its own sibling
// component since roadmaps have no shared data shape with those two.
export function RoadmapCard({ roadmap, isLoggedIn }: Props) {
  const { icon: Icon, colorKey, badge, badgeStyle } = getRoadmapMeta(roadmap.slug);
  const { iconBg, iconText, cardBorder } = COLOR_CLASSES[colorKey];
  const isAllDone =
    isLoggedIn && roadmap.completedCount > 0 && roadmap.completedCount === roadmap.topicCount;

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        cardBorder,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            badgeStyle ? badgeStyle.bg : iconBg,
          )}
        >
          {badge ? (
            <span
              className={cn(
                "text-sm font-bold leading-none",
                badgeStyle ? badgeStyle.text : iconText,
              )}
            >
              {badge}
            </span>
          ) : (
            <Icon className={cn("h-5 w-5", iconText)} aria-hidden />
          )}
        </div>
        {roadmap.isPremium && (
          <span className="shrink-0 rounded-full bg-premium-light px-2.5 py-1 text-xs font-semibold text-premium">
            Premium
          </span>
        )}
      </div>

      <h3 className="mt-3.5 text-sm font-semibold text-text-primary">{roadmap.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
        {roadmap.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {roadmap.topicCount} {roadmap.topicCount === 1 ? "topic" : "topics"}
        </span>

        {isLoggedIn ? (
          isAllDone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Complete
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              {roadmap.completedCount}/{roadmap.topicCount} done
            </span>
          )
        ) : (
          <span className={cn("text-xs font-medium", iconText)}>Start →</span>
        )}
      </div>
    </Link>
  );
}

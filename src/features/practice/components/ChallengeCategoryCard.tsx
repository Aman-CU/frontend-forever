import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { COLOR_CLASSES, type CategoryMeta } from "@/features/learn/lib/categoryMeta";

type Props = {
  category: string;
  meta: CategoryMeta;
  challengeCount: number;
  completedCount: number;
  isLoggedIn: boolean;
};

// Mirrors features/learn/components/CategoryCard.tsx's visual pattern (same
// card shell, icon treatment, hover border) so Practice and Learn read as
// one system — kept as a sibling component rather than a shared/generalized
// one since the two cards' stats (challenges vs. concepts) come from
// different data sources. See progress-tracker.md Pre-Feature-28 decision.
export function ChallengeCategoryCard({
  category,
  meta,
  challengeCount,
  completedCount,
  isLoggedIn,
}: Props) {
  const { icon: Icon, label, description, colorKey, badge, badgeStyle } = meta;
  const { iconBg, iconText, cardBorder } = COLOR_CLASSES[colorKey];
  const isAllDone = isLoggedIn && completedCount > 0 && completedCount === challengeCount;

  return (
    <Link
      href={`/practice/${category}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        cardBorder,
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
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

      <h3 className="mt-3.5 text-sm font-semibold text-text-primary">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {challengeCount} {challengeCount === 1 ? "challenge" : "challenges"}
        </span>

        {isLoggedIn ? (
          isAllDone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Complete
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              {completedCount}/{challengeCount} solved
            </span>
          )
        ) : (
          <span className={cn("text-xs font-medium", iconText)}>Start →</span>
        )}
      </div>
    </Link>
  );
}

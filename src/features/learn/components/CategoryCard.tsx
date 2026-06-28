import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryMeta, ColorKey } from "@/features/learn/lib/categoryMeta";
import type { CategorySummary } from "@/features/learn/lib/queries";

type Props = {
  category: CategorySummary;
  meta: CategoryMeta;
  isLoggedIn: boolean;
};

const ICON_BG: Record<ColorKey, string> = {
  accent: "bg-accent-muted",
  info: "bg-info-muted",
  premium: "bg-premium-light",
  success: "bg-success-muted",
  streak: "bg-streak-light",
  xp: "bg-xp-light",
};

const ICON_TEXT: Record<ColorKey, string> = {
  accent: "text-accent",
  info: "text-info",
  premium: "text-premium",
  success: "text-success",
  streak: "text-streak",
  xp: "text-xp",
};

const HOVER_BORDER: Record<ColorKey, string> = {
  accent: "hover:border-accent",
  info: "hover:border-info",
  premium: "hover:border-premium",
  success: "hover:border-success",
  streak: "hover:border-streak",
  xp: "hover:border-xp",
};

export function CategoryCard({ category, meta, isLoggedIn }: Props) {
  const { icon: Icon, label, description, colorKey, badge, badgeStyle } = meta;
  const firstSlug = category.concepts[0]?.slug;
  const href = firstSlug ? `/learn/${category.category}/${firstSlug}` : `/learn`;

  const isAllDone =
    isLoggedIn && category.completedCount > 0 && category.completedCount === category.conceptCount;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        HOVER_BORDER[colorKey],
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          badgeStyle ? badgeStyle.bg : ICON_BG[colorKey],
        )}
      >
        {badge ? (
          <span
            className={cn(
              "text-sm font-bold leading-none",
              badgeStyle ? badgeStyle.text : ICON_TEXT[colorKey],
            )}
          >
            {badge}
          </span>
        ) : (
          <Icon className={cn("h-5 w-5", ICON_TEXT[colorKey])} aria-hidden />
        )}
      </div>

      {/* Name + description */}
      <h3 className="mt-3.5 text-sm font-semibold text-text-primary">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {category.conceptCount} {category.conceptCount === 1 ? "concept" : "concepts"}
        </span>

        {isLoggedIn ? (
          isAllDone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Complete
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              {category.completedCount}/{category.conceptCount} done
            </span>
          )
        ) : (
          <span className={cn("text-xs font-medium", ICON_TEXT[colorKey])}>Start →</span>
        )}
      </div>
    </Link>
  );
}

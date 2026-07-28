"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, FileText, MessageSquare, Moon, Settings, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import type { CategorySummary } from "@/features/learn/lib/queries";
import { CategoryAccordionItem } from "./CategoryAccordionItem";

type Props = {
  categories: CategorySummary[];
  isPremiumUser: boolean;
};

export function LearnSidebar({ categories, isPremiumUser }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const totalConcepts = categories.reduce((sum, cat) => sum + cat.conceptCount, 0);
  const completedConcepts = categories.reduce((sum, cat) => sum + cat.completedCount, 0);
  const progressPercent = totalConcepts > 0 ? (completedConcepts / totalConcepts) * 100 : 0;

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-65 shrink-0 flex-col border-r border-border bg-surface md:flex">
      {/* Header */}
      <div className="px-4 pb-2 pt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Learn</h2>
      </div>

      {/* Scrollable category list */}
      <nav className="flex-1 overflow-y-auto py-1" aria-label="Learn categories">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.category];
          return (
            <CategoryAccordionItem
              key={category.category}
              category={category}
              meta={meta}
              pathname={pathname}
              isPremiumUser={isPremiumUser}
            />
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border">
        <nav className="px-2 py-1" aria-label="Sidebar settings">
          <Link
            href="/settings/profile"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            Settings
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Moon className="h-4 w-4 shrink-0" aria-hidden />
            )}
            Theme
          </button>

          <Link
            href="/feedback"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
            Feedback
          </Link>

          <Link
            href="/changelog"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            Changelog
          </Link>
        </nav>

        {/* Overall Progress */}
        <div className="border-t border-border px-4 pb-6 pt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">Overall Progress</span>
            <span className="text-xs font-semibold text-text-primary">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={completedConcepts}
              aria-valuemin={0}
              aria-valuemax={totalConcepts}
              aria-label={`${completedConcepts} of ${totalConcepts} concepts completed`}
            />
          </div>
          <Link
            href="/learn/stats"
            className="mt-2 flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            View learning stats
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}

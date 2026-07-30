import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Flame, Trophy, Zap } from "lucide-react";

import { getCachedSession } from "@/lib/auth/server";
import { getCategorySummaries } from "@/features/learn/lib/queries";
import { getDashboardProfileStats } from "@/features/dashboard/lib/queries";
import { CATEGORY_META, type ColorKey } from "@/features/learn/lib/categoryMeta";

export const metadata: Metadata = {
  title: "Your Progress | Frontend Forever",
  description: "Your learning progress across every concept category.",
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

export default async function LearnStatsPage() {
  const session = await getCachedSession();
  if (!session?.user) {
    redirect("/login?callbackURL=/learn/stats");
  }

  const userId = session.user.id;
  const [categories, profileStats] = await Promise.all([
    getCategorySummaries(userId),
    getDashboardProfileStats(userId),
  ]);

  const totalConcepts = categories.reduce((sum, cat) => sum + cat.conceptCount, 0);
  const completedConcepts = categories.reduce((sum, cat) => sum + cat.completedCount, 0);
  const overallPercent = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Your Progress</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        {completedConcepts} of {totalConcepts} concepts completed ({overallPercent}%).
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-xp-light">
            <Zap className="size-4 fill-xp stroke-none" />
          </div>
          <p className="text-lg font-bold text-text-primary">{profileStats.xp}</p>
          <p className="text-xs text-text-muted">Total XP</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-streak-light">
            <Flame className="size-4 text-streak" />
          </div>
          <p className="text-lg font-bold text-text-primary">{profileStats.streakCurrent}</p>
          <p className="text-xs text-text-muted">Current streak</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-accent-muted">
            <Trophy className="size-4 text-accent" />
          </div>
          <p className="text-lg font-bold text-text-primary">{profileStats.streakLongest}</p>
          <p className="text-xs text-text-muted">Longest streak</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="mb-4 text-sm font-bold text-text-primary">By category</p>
        <div className="space-y-4">
          {categories.map((category) => {
            const meta = CATEGORY_META[category.category];
            const Icon = meta.icon;
            const percent =
              category.conceptCount > 0
                ? Math.round((category.completedCount / category.conceptCount) * 100)
                : 0;

            return (
              <div key={category.category} className="flex items-center gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${ICON_BG[meta.colorKey]}`}
                >
                  <Icon className={`size-4 ${ICON_TEXT[meta.colorKey]}`} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">{meta.label}</p>
                    <p className="shrink-0 text-xs text-text-muted">
                      {category.completedCount}/{category.conceptCount}
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-label={`${meta.label} progress`}
                      aria-valuenow={category.completedCount}
                      aria-valuemin={0}
                      aria-valuemax={category.conceptCount}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

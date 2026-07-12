import { CheckCircle2, Flame } from "lucide-react";

import { getCachedSession } from "@/lib/auth/server";
import { getProfileSummary } from "@/lib/profile";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import { ChallengeCategoryCard } from "@/features/practice/components/ChallengeCategoryCard";
import { PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import { getPracticeCategorySummaries, getPracticeTotalSolved } from "@/features/practice/lib/queries";

export default async function PracticePage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;
  const isLoggedIn = userId !== null;

  const [categorySummaries, totalSolved, profile] = await Promise.all([
    getPracticeCategorySummaries(userId),
    getPracticeTotalSolved(userId),
    userId ? getProfileSummary(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Practice</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Real coding challenges, run in a real editor — organized by the same topics you learn.
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
              {totalSolved} solved
            </span>
            <span className="flex items-center gap-1.5 font-medium text-text-secondary">
              <Flame className="h-4 w-4 text-streak" aria-hidden />
              {profile?.streakCurrent ?? 0} day streak
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categorySummaries.map(({ category, challengeCount, completedCount }) => (
          <ChallengeCategoryCard
            key={category}
            category={category}
            meta={CATEGORY_META[category]}
            label={PRACTICE_CATEGORY_LABELS[category]}
            challengeCount={challengeCount}
            completedCount={completedCount}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </div>
  );
}

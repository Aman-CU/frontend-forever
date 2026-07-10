import { CheckCircle2, Flame } from "lucide-react";

import { getCachedSession } from "@/lib/auth/server";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import { ChallengeCategoryCard } from "@/features/practice/components/ChallengeCategoryCard";
import { ContinueChallengeCard } from "@/features/practice/components/ContinueChallengeCard";
import { PRACTICE_CATEGORIES, PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import {
  MOCK_CHALLENGES,
  MOCK_CONTINUE_CHALLENGE,
  getCategoryStats,
} from "@/features/practice/lib/mockPracticeData";

// UI-first pass (Rule 1) — category counts, solved totals, and the "continue"
// entry are all mock data from features/practice/lib/mockPracticeData.ts.
// A follow-up logic pass wires real challenges/user_challenge_submissions
// queries in, mirroring how Learn's getCategorySummaries works.
export default async function PracticePage() {
  const session = await getCachedSession();
  const isLoggedIn = session?.user != null;
  const totalSolved = MOCK_CHALLENGES.filter((c) => c.completed).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
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
              <Flame className="h-4 w-4 text-streak" aria-hidden />3 day streak
            </span>
          </div>
        )}
      </div>

      {isLoggedIn && <ContinueChallengeCard challenge={MOCK_CONTINUE_CHALLENGE} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_CATEGORIES.map((category) => {
          const { challengeCount, completedCount } = getCategoryStats(category);
          return (
            <ChallengeCategoryCard
              key={category}
              category={category}
              meta={CATEGORY_META[category]}
              label={PRACTICE_CATEGORY_LABELS[category]}
              challengeCount={challengeCount}
              completedCount={completedCount}
              isLoggedIn={isLoggedIn}
            />
          );
        })}
      </div>
    </div>
  );
}

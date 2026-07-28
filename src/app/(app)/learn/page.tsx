import { getCachedSession } from "@/lib/auth/server";
import { getCategorySummaries } from "@/features/learn/lib/queries";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import { CategoryCard } from "@/features/learn/components/CategoryCard";
import { getStreakSummary } from "@/features/streak/lib/queries";
import { StreakBannerSection } from "@/features/streak/components/StreakBannerSection";

export default async function LearnPage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  // Reuses the same cache hit as learn/layout.tsx — no second DB round-trip
  const [categories, streak] = await Promise.all([
    getCategorySummaries(userId),
    userId ? getStreakSummary(userId) : null,
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {userId && streak && (
        <StreakBannerSection
          userId={userId}
          streakCurrent={streak.streakCurrent}
          streakLastActivity={streak.streakLastActivity}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">What do you want to learn?</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Pick a topic. Each concept is taught through live simulators, challenges, and real
          interview questions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.category}
            category={category}
            meta={CATEGORY_META[category.category]}
            isLoggedIn={userId !== null}
          />
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import { PracticeBreadcrumb } from "@/features/practice/components/PracticeBreadcrumb";
import { ChallengeListClient } from "@/features/practice/components/ChallengeListClient";
import {
  PRACTICE_CATEGORIES,
  PRACTICE_CATEGORY_LABELS,
  type PracticeCategory,
} from "@/features/practice/lib/practiceCategories";
import { getPracticeChallengesByCategory } from "@/features/practice/lib/queries";

type Params = { category: string };

function isPracticeCategory(value: string): value is PracticeCategory {
  return (PRACTICE_CATEGORIES as readonly string[]).includes(value);
}

export default async function PracticeCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;

  if (!isPracticeCategory(category)) {
    notFound();
  }

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const meta = CATEGORY_META[category];
  const label = PRACTICE_CATEGORY_LABELS[category];
  const challenges = await getPracticeChallengesByCategory(category, userId);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <PracticeBreadcrumb currentLabel={label} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{label}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{meta.description}</p>
      </div>

      <ChallengeListClient challenges={challenges} />
    </div>
  );
}

import { notFound } from "next/navigation";

import { CONCEPT_CATEGORIES, type ConceptCategory } from "@/lib/constants";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import { PracticeBreadcrumb } from "@/features/practice/components/PracticeBreadcrumb";
import { ChallengeListClient } from "@/features/practice/components/ChallengeListClient";
import { getChallengesByCategory } from "@/features/practice/lib/mockPracticeData";

type Params = { category: string };

function isConceptCategory(value: string): value is ConceptCategory {
  return (CONCEPT_CATEGORIES as readonly string[]).includes(value);
}

export default async function PracticeCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;

  if (!isConceptCategory(category)) {
    notFound();
  }

  const meta = CATEGORY_META[category];
  const challenges = getChallengesByCategory(category);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PracticeBreadcrumb currentLabel={meta.label} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{meta.label} Challenges</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{meta.description}</p>
      </div>

      <ChallengeListClient challenges={challenges} />
    </div>
  );
}

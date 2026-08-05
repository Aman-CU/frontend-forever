import type { Metadata } from "next";

import { getCachedSession } from "@/lib/auth/server";
import { COLLECTION_META, type InterviewPrepCollectionKey } from "@/features/interview-prep/lib/collectionMeta";
import {
  getCollectionSummaries,
  getCompanyGuideSummaries,
  getIsPremiumUser,
  getReviewQueuePreview,
} from "@/features/interview-prep/lib/queries";
import { getPlaybookProgress } from "@/features/interview-prep/lib/playbookQueries";
import { getStudyPlans } from "@/features/interview-prep/lib/studyPlanQueries";
import { CollectionRow } from "@/features/interview-prep/components/CollectionRow";
import { ReviewQueueSection } from "@/features/interview-prep/components/ReviewQueueSection";
import { PlaybookPreview } from "@/features/interview-prep/components/PlaybookPreview";
import { StudyPlansPreview } from "@/features/interview-prep/components/StudyPlansPreview";
import { CompanyGuidesPreview } from "@/features/interview-prep/components/CompanyGuidesPreview";

export const metadata: Metadata = {
  title: "Interview Prep | Frontend Forever",
  description:
    "Prepare for frontend interviews with curated question collections, guided playbooks, study plans, and company-specific guides.",
};

// FF System Design has no row in collection_questions (Feature 49's separate
// MDX guides) — getCollectionSummaries derives its count from the filesystem
// instead, only falling back to a null summary (CollectionRow's "Coming
// soon" state) while zero guides are authored.
const COLLECTION_ROW_ORDER: InterviewPrepCollectionKey[] = [
  "ff-75",
  "ff-javascript",
  "ff-react",
  "ff-nextjs",
  "ff-system-design",
];

export default async function InterviewPrepGetStartedPage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const [collectionSummaries, reviewItems, playbookProgress, studyPlans, companySummaries, isPremiumUser] =
    await Promise.all([
      getCollectionSummaries(userId),
      getReviewQueuePreview(userId),
      getPlaybookProgress(userId),
      getStudyPlans(),
      getCompanyGuideSummaries(),
      userId ? getIsPremiumUser(userId) : Promise.resolve(false),
    ]);

  const summaryByCollection = new Map(collectionSummaries.map((s) => [s.collection, s]));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Interview Prep</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Curated questions, guided playbooks, and company-specific prep — everything you need
          before the real thing.
        </p>
      </div>

      {reviewItems.length > 0 && <ReviewQueueSection items={reviewItems} />}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          FF Collections
        </h2>
        <div className="flex flex-col gap-2">
          {COLLECTION_ROW_ORDER.map((key) => (
            <CollectionRow
              key={key}
              collectionKey={key}
              meta={COLLECTION_META[key]}
              summary={summaryByCollection.get(key) ?? null}
              isPremiumUser={isPremiumUser}
            />
          ))}
        </div>
      </section>

      <PlaybookPreview progress={playbookProgress} isPremiumUser={isPremiumUser} />

      <StudyPlansPreview plans={studyPlans} isPremiumUser={isPremiumUser} />

      <CompanyGuidesPreview companies={companySummaries} isPremiumUser={isPremiumUser} />
    </div>
  );
}

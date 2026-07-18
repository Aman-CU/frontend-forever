import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { CollectionMeta, InterviewPrepCollectionKey } from "@/features/interview-prep/lib/collectionMeta";
import type { CollectionSummary } from "@/features/interview-prep/lib/queries";

type Props = {
  collectionKey: InterviewPrepCollectionKey;
  meta: CollectionMeta;
  // null renders "Coming soon" instead of a progress bar — true for FF
  // System Design only until its first MDX guide (Feature 49) is authored;
  // it has no row in collection_questions itself either way.
  summary: CollectionSummary | null;
};

// Row pattern reused for every list in Phase 6 (build-plan.md, Feature 30):
// icon square → title → description → count + progress bar → chevron.
export function CollectionRow({ collectionKey, meta, summary }: Props) {
  const { icon: Icon, label, description } = meta;
  const isComingSoon = summary === null;
  const questionCount = summary?.questionCount ?? 0;
  const completedCount = summary?.completedCount ?? 0;
  const progressPercent = questionCount > 0 ? (completedCount / questionCount) * 100 : 0;

  return (
    <Link
      href={`/interview-prep/${collectionKey}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
        <p className="mt-0.5 truncate text-xs text-text-muted">{description}</p>

        {!isComingSoon && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={questionCount}
                aria-label={`${completedCount} of ${questionCount} questions completed`}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-text-muted">
              {questionCount} questions
            </span>
          </div>
        )}
      </div>

      {isComingSoon ? (
        <span className="shrink-0 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-text-secondary">
          Coming soon
        </span>
      ) : (
        <ChevronRight
          className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      )}
    </Link>
  );
}

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import { PracticeBreadcrumb } from "@/features/practice/components/PracticeBreadcrumb";
import { ShareButtons } from "@/features/practice/components/editor/ShareButtons";
import { PrevNextNav } from "@/features/practice/components/editor/PrevNextNav";
import { PRACTICE_CATEGORY_LABELS, type PracticeCategory } from "@/features/practice/lib/practiceCategories";
import type { ChallengeNavItem } from "@/features/practice/lib/queries";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  category: PracticeCategory;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  questionNumber: number;
  prev: ChallengeNavItem | null;
  next: ChallengeNavItem | null;
};

export function ChallengeEditorHeader({
  category,
  slug,
  title,
  difficulty,
  questionNumber,
  prev,
  next,
}: Props) {
  const categoryLabel = PRACTICE_CATEGORY_LABELS[category];
  const isTypeScript = category === "typescript";

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {/* min-w-0 lets the breadcrumb actually shrink/truncate instead of
            pushing PrevNextNav's fixed-width buttons off the right edge of
            the viewport — same flex min-width lesson as ChallengeListRow. */}
        <div className="min-w-0 flex-1">
          <PracticeBreadcrumb
            backHref={`/practice/${category}`}
            crumbs={[
              { label: "Practice", href: "/practice" },
              { label: categoryLabel, href: `/practice/${category}` },
              { label: title },
            ]}
          />
        </div>
        <PrevNextNav category={category} prev={prev} next={next} />
      </div>

      {/* Same lg:grid-cols-2 lg:gap-8 as the workspace grid below, so the
          right cell's left edge lands exactly on the code editor's left
          edge — the badge sits flush above the thing it's labeling, and
          Share stays pinned to the far right, above the editor's right
          edge. */}
      <div className="flex flex-wrap items-center justify-between gap-3 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-text-muted">
            Question #{questionNumber}
          </span>
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              DIFFICULTY_STYLES[difficulty],
            )}
          >
            {difficulty}
          </span>
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {categoryLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-bold",
              isTypeScript ? "bg-ts-badge-bg text-ts-badge-text" : "bg-js-badge-bg text-js-badge-text",
            )}
          >
            {isTypeScript ? "TypeScript" : "JavaScript"}
          </span>
          <ShareButtons category={category} slug={slug} title={title} questionNumber={questionNumber} />
        </div>
      </div>
    </div>
  );
}

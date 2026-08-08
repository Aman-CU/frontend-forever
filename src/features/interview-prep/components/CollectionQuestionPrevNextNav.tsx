import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { InterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";
import { BLURRED_QUESTION_PLACEHOLDER, type CollectionQuestionNavItem } from "@/features/interview-prep/lib/queries";

type Props = {
  routeCollection: InterviewPrepRouteCollection;
  prev: CollectionQuestionNavItem | null;
  next: CollectionQuestionNavItem | null;
  isPremiumUser: boolean;
};

// Same shape as Practice's PrevNextNav (Feature 29) — a disabled, non-hidden
// state at either end of the list so the pair's layout never jumps.
export function CollectionQuestionPrevNextNav({ routeCollection, prev, next, isPremiumUser }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton routeCollection={routeCollection} item={prev} direction="prev" isPremiumUser={isPremiumUser} />
      <NavButton routeCollection={routeCollection} item={next} direction="next" isPremiumUser={isPremiumUser} />
    </div>
  );
}

function NavButton({
  routeCollection,
  item,
  direction,
  isPremiumUser,
}: {
  routeCollection: InterviewPrepRouteCollection;
  item: CollectionQuestionNavItem | null;
  direction: "prev" | "next";
  isPremiumUser: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Previous question" : "Next question";

  if (!item) {
    return (
      <span
        aria-disabled="true"
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-subtle"
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span className="sr-only">{label} — none</span>
      </span>
    );
  }

  // A locked neighbor's real title never reaches the client — the tooltip/
  // aria-label would otherwise leak it via view-source regardless of what
  // the target page itself renders (same class of bug as the list page's
  // BLURRED_QUESTION_PLACEHOLDER and generateMetadata's noindex handling).
  const isItemLocked = item.isPremium && !isPremiumUser;
  const questionText = isItemLocked ? BLURRED_QUESTION_PLACEHOLDER : item.question;

  return (
    <Link
      href={`/interview-prep/${routeCollection}/${item.slug}`}
      title={`${label}: ${questionText}`}
      aria-label={`${label}: ${questionText}`}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

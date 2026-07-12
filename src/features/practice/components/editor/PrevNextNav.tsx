import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PracticeCategory } from "@/features/practice/lib/practiceCategories";
import type { ChallengeNavItem } from "@/features/practice/lib/queries";

type Props = {
  category: PracticeCategory;
  prev: ChallengeNavItem | null;
  next: ChallengeNavItem | null;
};

// Prev/Next within the category's own question order — same ordering as
// questionNumber and the Category List page. A disabled state (no border,
// no hover, aria-disabled) at either end of the list, not a hidden button —
// keeps the pair's layout stable rather than jumping around near the edges.
export function PrevNextNav({ category, prev, next }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton category={category} item={prev} direction="prev" />
      <NavButton category={category} item={next} direction="next" />
    </div>
  );
}

function NavButton({
  category,
  item,
  direction,
}: {
  category: PracticeCategory;
  item: ChallengeNavItem | null;
  direction: "prev" | "next";
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

  return (
    <Link
      href={`/practice/${category}/${item.slug}`}
      title={`${label}: ${item.title}`}
      aria-label={`${label}: ${item.title}`}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

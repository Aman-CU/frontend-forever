import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { SystemDesignGuideNavItem } from "@/lib/systemDesignGuides";

type Props = {
  prev: SystemDesignGuideNavItem | null;
  next: SystemDesignGuideNavItem | null;
};

// Same shape as CollectionQuestionPrevNextNav (Feature 31) — a disabled,
// non-hidden state at either end so the pair's layout never jumps. Kept as
// its own copy since the nav item shape differs (guide slug/title, not a
// route-collection-scoped question) rather than a cross-feature import.
export function SystemDesignGuidePrevNextNav({ prev, next }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton item={prev} direction="prev" />
      <NavButton item={next} direction="next" />
    </div>
  );
}

function NavButton({
  item,
  direction,
}: {
  item: SystemDesignGuideNavItem | null;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Previous guide" : "Next guide";

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
      href={`/interview-prep/ff-system-design/${item.slug}`}
      title={`${label}: ${item.title}`}
      aria-label={`${label}: ${item.title}`}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PlaybookChapterNavItem } from "@/lib/playbookGuides";
import type { PlaybookSlug } from "@/lib/constants";

type Props = {
  playbookSlug: PlaybookSlug;
  prev: PlaybookChapterNavItem | null;
  next: PlaybookChapterNavItem | null;
};

// Same shape/precedent as SystemDesignGuidePrevNextNav (Feature 49) — kept
// as its own copy since the route needs playbookSlug, not just a chapter slug.
export function PlaybookChapterPrevNextNav({ playbookSlug, prev, next }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton playbookSlug={playbookSlug} item={prev} direction="prev" />
      <NavButton playbookSlug={playbookSlug} item={next} direction="next" />
    </div>
  );
}

function NavButton({
  playbookSlug,
  item,
  direction,
}: {
  playbookSlug: PlaybookSlug;
  item: PlaybookChapterNavItem | null;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Previous chapter" : "Next chapter";

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
      href={`/interview-prep/playbook/${playbookSlug}/${item.slug}`}
      title={`${label}: ${item.title}`}
      aria-label={`${label}: ${item.title}`}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

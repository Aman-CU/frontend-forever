import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PlaybookChapterNavItem } from "@/lib/playbookGuides";
import type { PlaybookSlug } from "@/lib/constants";

// Not the real title — same fake-placeholder rule as FF Collections'
// BLURRED_QUESTION_PLACEHOLDER (security.md). Used whenever this whole
// playbook is locked for the current viewer: unlike FF Collections' mixed
// free/premium rows, "Build in Public" is a single all-or-nothing bundle,
// so a locked view's prev/next neighbors are always locked too — one flag
// covers both, no per-item isPremium needed.
const LOCKED_CHAPTER_TITLE_PLACEHOLDER = "This is a premium chapter in this playbook.";

type Props = {
  playbookSlug: PlaybookSlug;
  prev: PlaybookChapterNavItem | null;
  next: PlaybookChapterNavItem | null;
  hideTitles?: boolean;
};

// Same shape/precedent as SystemDesignGuidePrevNextNav (Feature 49) — kept
// as its own copy since the route needs playbookSlug, not just a chapter slug.
export function PlaybookChapterPrevNextNav({ playbookSlug, prev, next, hideTitles = false }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton playbookSlug={playbookSlug} item={prev} direction="prev" hideTitles={hideTitles} />
      <NavButton playbookSlug={playbookSlug} item={next} direction="next" hideTitles={hideTitles} />
    </div>
  );
}

function NavButton({
  playbookSlug,
  item,
  direction,
  hideTitles,
}: {
  playbookSlug: PlaybookSlug;
  item: PlaybookChapterNavItem | null;
  direction: "prev" | "next";
  hideTitles: boolean;
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

  // A locked neighbor's real title never reaches the client — the tooltip/
  // aria-label would otherwise leak it via view-source regardless of the
  // wall this same page renders (same bug class as FF Collections' Stage 5
  // fix). generateMetadata already treats this playbook's chapter titles as
  // bespoke, sensitive content, not an evergreen prompt name — this must
  // match that same treatment.
  const titleText = hideTitles ? LOCKED_CHAPTER_TITLE_PLACEHOLDER : item.title;

  return (
    <Link
      href={`/interview-prep/playbook/${playbookSlug}/${item.slug}`}
      title={`${label}: ${titleText}`}
      aria-label={`${label}: ${titleText}`}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

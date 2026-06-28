import Link from "next/link";
import { Bookmark, BookOpen, ChevronRight, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/features/learn/lib/categoryMeta";
import type { ConceptDetail } from "@/features/learn/lib/queries";

type Props = {
  concept: ConceptDetail;
};

export function ConceptHeader({ concept }: Props) {
  const categoryLabel = CATEGORY_META[concept.category].label;

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm">
        <Link href="/learn" className="text-text-muted transition-colors hover:text-text-primary">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
        <span className="text-text-muted">{categoryLabel}</span>
        <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
        <span className="font-medium text-text-primary">{concept.title}</span>
      </nav>

      {/* Title row + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-text-primary">{concept.title}</h1>
            <button
              type="button"
              aria-label="Bookmark this concept"
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
            >
              <Bookmark className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">{concept.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="lg">
            <BookOpen aria-hidden />
            Guide
          </Button>
          <Button variant="outline" size="lg">
            <Bookmark aria-hidden />
            Save
          </Button>
          <Button variant="outline" size="lg">
            <Share2 aria-hidden />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

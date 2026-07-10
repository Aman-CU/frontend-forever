import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

type Props = {
  currentLabel: string;
};

// No shared Breadcrumb primitive existed yet (checked ui-registry.md) — kept
// small and Practice-local rather than promoting to components/shared/ for
// a single consumer. Promote if a second feature needs the same pattern.
export function PracticeBreadcrumb({ currentLabel }: Props) {
  return (
    <div className="mb-4 flex items-center gap-5">
      <Link
        href="/practice"
        aria-label="Back to Practice categories"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Link>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link href="/practice" className="text-text-muted transition-colors hover:text-text-primary">
          Practice
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
        <span className="font-medium text-text-primary">{currentLabel}</span>
      </nav>
    </div>
  );
}

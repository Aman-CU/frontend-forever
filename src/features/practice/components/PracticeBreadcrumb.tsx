import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  currentLabel: string;
};

// No shared Breadcrumb primitive existed yet (checked ui-registry.md) — kept
// small and Practice-local rather than promoting to components/shared/ for
// a single consumer. Promote if a second feature needs the same pattern.
export function PracticeBreadcrumb({ currentLabel }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm">
      <Link href="/practice" className="text-text-muted transition-colors hover:text-text-primary">
        Practice
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
      <span className="font-medium text-text-primary">{currentLabel}</span>
    </nav>
  );
}

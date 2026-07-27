import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  description: string;
};

// Shared between /roadmaps/[slug]'s "coming soon" early return and its real
// roadmap render — same back-link/icon/title/description block either way,
// so it's not duplicated between the two return statements.
export function RoadmapPageHeader({ icon: Icon, iconClassName, title, description }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 lg:px-8">
      <Link
        href="/roadmaps"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Roadmaps
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-muted">
          <Icon className={iconClassName} aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}

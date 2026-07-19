import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PLAYBOOK_SLUGS } from "@/lib/constants";
import { PLAYBOOK_META } from "@/features/interview-prep/lib/playbookMeta";
import type { PlaybookProgress } from "@/features/interview-prep/lib/playbookQueries";

type Props = {
  progress: PlaybookProgress[];
};

// Real chapter counts + real per-user read progress (Feature 50) — same
// "honest, not mocked" precedent as CollectionRow's bars. Was a static
// teaser with no progress data until this feature shipped real content.
export function PlaybookPreview({ progress }: Props) {
  const progressBySlug = new Map(progress.map((p) => [p.playbookSlug, p]));

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Playbook
      </h2>
      <div className="flex flex-col gap-2">
        {PLAYBOOK_SLUGS.map((slug) => {
          const meta = PLAYBOOK_META[slug];
          const Icon = meta.icon;
          const p = progressBySlug.get(slug);
          const chapterCount = p?.chapterCount ?? 0;
          const readCount = p?.readCount ?? 0;
          const progressPercent = chapterCount > 0 ? (readCount / chapterCount) * 100 : 0;

          return (
            <Link
              key={slug}
              href={`/interview-prep/playbook/${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">{meta.label}</h3>
                <p className="mt-0.5 truncate text-xs text-text-muted">{meta.description}</p>

                {chapterCount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={readCount}
                        aria-valuemin={0}
                        aria-valuemax={chapterCount}
                        aria-label={`${readCount} of ${chapterCount} articles read`}
                      />
                    </div>
                    <span className="whitespace-nowrap text-xs text-text-muted">
                      {chapterCount} articles
                    </span>
                  </div>
                )}
              </div>

              <ChevronRight
                className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

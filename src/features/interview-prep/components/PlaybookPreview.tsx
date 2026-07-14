import Link from "next/link";
import { Atom, ChevronRight, ClipboardList, FileText, MessageCircle, Network } from "lucide-react";

// Lightweight static teaser (added 2026-07-14, same treatment as Study Plans
// and Company Guides below) — hardcoded, no schema or live query. Real
// Playbook content/read-tracking ships in Feature 50; these 5 rows link to
// routes that 404 until then. Monochrome icons, matching FF Collections.
const PLAYBOOK_PREVIEWS = [
  {
    slug: "frontend-interview-playbook",
    label: "Frontend Interview Playbook",
    description: "How interviews are structured, what interviewers score, and how to prepare.",
    icon: ClipboardList,
  },
  {
    slug: "react-interview-playbook",
    label: "React Interview Playbook",
    description: "The question taxonomy React interviews test and live-coding gotchas explained.",
    icon: Atom,
  },
  {
    slug: "behavioural-interview-playbook",
    label: "Behavioural Interview Playbook",
    description: "The STAR method done properly, and building your own personal story bank.",
    icon: MessageCircle,
  },
  {
    slug: "frontend-system-design-playbook",
    label: "Frontend System Design Playbook",
    description: "A repeatable framework for frontend system design — requirements to tradeoffs.",
    icon: Network,
  },
  {
    slug: "frontend-resume-playbook",
    label: "Frontend Resume Playbook",
    description: "What recruiters scan for in 8 seconds, and turning projects into resume material.",
    icon: FileText,
  },
] as const;

export function PlaybookPreview() {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Playbook
      </h2>
      <div className="flex flex-col gap-2">
        {PLAYBOOK_PREVIEWS.map((playbook) => {
          const Icon = playbook.icon;
          return (
            <Link
              key={playbook.slug}
              href={`/interview-prep/playbook/${playbook.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">{playbook.label}</h3>
                <p className="mt-0.5 truncate text-xs text-text-muted">{playbook.description}</p>
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

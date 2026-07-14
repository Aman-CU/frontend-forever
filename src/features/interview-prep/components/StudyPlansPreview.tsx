import Link from "next/link";
import { ArrowRight, Clock, Flame, Star, Zap } from "lucide-react";

// Lightweight static teaser (Feature 30 sign-off) — hardcoded, no schema or
// live query. Real Study Plans data/pages ship in Feature 51; these 3 cards
// link to routes that 404 until then. Descriptions and pacing mirror the
// draft plan structure already agreed for Feature 51 (build-plan.md) —
// timeCommitment describes each plan's design/cadence, not content stats;
// unlike a question count, it isn't dependent on real seeded content, so it
// isn't a fabricated number the way a fake "51 questions" would be. Icons
// stay monochrome (no per-plan color) to match GreatFrontEnd's own Dashboard.
const STUDY_PLAN_PREVIEWS = [
  {
    slug: "1-week",
    label: "1 Week",
    description:
      "Cramming for an interview coming up fast — rapid FF 75 review, a deep dive into your target role's collection, then the System Design and Behavioural playbooks before a final company-guide run-through.",
    timeCommitment: "~2 hrs/day",
    icon: Zap,
  },
  {
    slug: "1-month",
    label: "1 Month",
    description:
      "A balanced pass across your weakest Learn category, Practice reps, a full FF Collections review, and every Playbook — built for steady progress without cramming.",
    timeCommitment: "~6 hrs/week",
    icon: Flame,
  },
  {
    slug: "3-months",
    label: "3 Months",
    description:
      "A systematic, category-by-category pass through the full Learn curriculum with real weekly Practice reps, shifting into full interview mode — FF Collections, all 5 Playbooks, and a Company Guide — in the final month.",
    timeCommitment: "~4 hrs/week",
    icon: Star,
  },
];

export function StudyPlansPreview() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Study Plans
        </h2>
        <Link
          href="/interview-prep/study-plans"
          className="flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {STUDY_PLAN_PREVIEWS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Link
              key={plan.slug}
              href={`/interview-prep/study-plans/${plan.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">{plan.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{plan.description}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {plan.timeCommitment}
                </div>
              </div>

              <ArrowRight
                className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

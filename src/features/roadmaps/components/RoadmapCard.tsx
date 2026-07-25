import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { RoadmapSummary } from "@/features/roadmaps/lib/queries";

type Props = {
  roadmap: RoadmapSummary;
};

// Title-only, per direct user request — no icon, description, count, or
// progress badge in the resting state. The polish comes from motion instead
// of extra content: a soft accent glow anchored in one corner (invisible at
// rest, fades in on hover) and an arrow affordance that slides in from the
// title's baseline, giving the card somewhere to go visually without adding
// clutter. bg-surface/50 + backdrop-blur-md on real design tokens (not a
// hardcoded dark navy) for the "blurred, transparent" look, so it still
// reads correctly in both light and dark theme.
export function RoadmapCard({ roadmap }: Props) {
  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-border/70 bg-surface/50 px-6 py-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface/70 hover:shadow-lg hover:shadow-accent/5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-15"
      />

      <span className="relative text-base font-semibold tracking-tight text-text-primary">
        {roadmap.title}
      </span>

      <ArrowUpRight
        className="relative h-4 w-4 shrink-0 -translate-x-1 text-text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

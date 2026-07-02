import Link from "next/link";

import { ArrowRight, GraduationCap } from "lucide-react";

// Forward-link from a concept's Interview tab to the full Interview Prep hub
// (Feature 30). The hub route is not built yet — this matches the Navbar/Footer,
// which already link to `/interview-prep` ahead of Phase 6, so it lights up
// automatically once that page ships.
export function MoreInterviewPrepCta() {
  return (
    <Link
      href="/interview-prep"
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface-secondary/40 px-5 py-4 transition-colors hover:border-accent hover:bg-accent-muted/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">
          Want more interview questions?
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">
          Explore the full FF 75, JavaScript, React, and System Design collections in
          Interview Prep.
        </p>
      </div>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { INTERVIEW_PREP_NAV, type InterviewPrepNavSection } from "@/features/interview-prep/lib/navConfig";

function sectionMatchesRoute(section: InterviewPrepNavSection, pathname: string): boolean {
  return section.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

// Own component, not a reuse of LearnSidebar — different nav shape (3 grouped
// sections vs. a flat category list). Auto-expands whenever the current route
// matches one of a section's children (build-plan.md, Feature 30), *and* is
// independently click-to-toggle (user-reported: clicking a section header did
// nothing) — expandedLabels starts from the route match, a click flips a
// label's membership from there, and navigating into a new section's route
// auto-adds it without clobbering any section the user expanded by hand.
//
// The route-driven auto-expand is done as a render-time state adjustment
// (comparing pathname against a stored prevPathname, per React's "you might
// not need an effect" pattern), not a useEffect — this project's
// react-hooks/set-state-in-effect lint rule forbids calling setState from
// inside an effect body (same constraint already noted on ConceptInterview).
export function InterviewPrepSidebar() {
  const pathname = usePathname();
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(
    () => new Set(INTERVIEW_PREP_NAV.filter((s) => sectionMatchesRoute(s, pathname)).map((s) => s.label)),
  );
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const activeLabel = INTERVIEW_PREP_NAV.find((s) => sectionMatchesRoute(s, pathname))?.label;
    if (activeLabel) {
      setExpandedLabels((prev) => (prev.has(activeLabel) ? prev : new Set(prev).add(activeLabel)));
    }
  }

  function toggleSection(label: string) {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-65 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="px-4 pb-2 pt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Interview Prep
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-1" aria-label="Interview Prep sections">
        <div className="px-2 py-0.5">
          <Link
            href="/interview-prep"
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/interview-prep"
                ? "rounded-l-none border-l-2 border-accent bg-accent-muted text-accent"
                : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
            )}
          >
            Get Started
          </Link>
        </div>

        {INTERVIEW_PREP_NAV.map((section) => (
          <InterviewPrepSidebarSection
            key={section.label}
            section={section}
            pathname={pathname}
            isExpanded={expandedLabels.has(section.label)}
            onToggle={() => toggleSection(section.label)}
          />
        ))}
      </nav>
    </aside>
  );
}

function InterviewPrepSidebarSection({
  section,
  pathname,
  isExpanded,
  onToggle,
}: {
  section: InterviewPrepNavSection;
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-2 py-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-secondary"
      >
        <span className="flex-1 truncate text-sm font-medium text-text-primary">
          {section.label}
        </span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200",
            isExpanded && "rotate-90",
          )}
          aria-hidden
        />
      </button>

      {isExpanded && (
        <div className="pb-1 pt-0.5 pl-1">
          {section.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "rounded-l-none border-l-2 border-accent bg-accent-muted font-medium text-accent"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                )}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

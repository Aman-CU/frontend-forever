"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { INTERVIEW_PREP_NAV, type InterviewPrepNavSection } from "@/features/interview-prep/lib/navConfig";

// Own component, not a reuse of LearnSidebar — different nav shape (3 grouped
// sections vs. a flat category list) and, deliberately, auto-expand instead
// of LearnSidebar's manual toggle: a section expands whenever the current
// route matches one of its children, so the sidebar always reflects where
// you are rather than requiring a click to reveal it (build-plan.md, Feature 30).
export function InterviewPrepSidebar() {
  const pathname = usePathname();

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
          <InterviewPrepSidebarSection key={section.label} section={section} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}

function InterviewPrepSidebarSection({
  section,
  pathname,
}: {
  section: InterviewPrepNavSection;
  pathname: string;
}) {
  const isExpanded = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="px-2 py-0.5">
      <div className="flex items-center gap-2.5 px-3 py-2 text-left">
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
      </div>

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

import { Atom, Braces, Globe, RotateCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ConceptTab = {
  label: string;
  icon: LucideIcon;
};

const CONCEPT_TABS: ConceptTab[] = [
  { label: "Event Loop", icon: RotateCw },
  { label: "React Rendering", icon: Atom },
  { label: "Browser Pipeline", icon: Globe },
  { label: "CSS Specificity", icon: Braces },
];

// Real switching is wired in Feature 13, once Features 09-12 build the
// other 3 simulators — until then Event Loop is the only tab with content.
const ACTIVE_TAB = "Event Loop";

export function ConceptSwitcherTabs() {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border-light bg-surface-secondary p-1.5">
      {CONCEPT_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.label === ACTIVE_TAB;

        return (
          <div
            key={tab.label}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border border-border bg-surface text-text-primary shadow-md"
                : "border border-transparent text-text-secondary hover:bg-surface",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}

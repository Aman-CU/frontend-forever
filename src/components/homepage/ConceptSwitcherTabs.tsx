import { Atom, Braces, Globe, RotateCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ConceptSimulatorId =
  | "event-loop"
  | "react-rendering"
  | "browser-pipeline"
  | "css-specificity";

type ConceptTab = {
  id: ConceptSimulatorId;
  label: string;
  icon: LucideIcon;
  hasContent: boolean;
};

// hasContent flips to true as each simulator is built (Features 09-12) —
// browser-pipeline and css-specificity stay disabled until then.
const CONCEPT_TABS: ConceptTab[] = [
  { id: "event-loop", label: "Event Loop", icon: RotateCw, hasContent: true },
  { id: "react-rendering", label: "React Rendering", icon: Atom, hasContent: true },
  { id: "browser-pipeline", label: "Browser Pipeline", icon: Globe, hasContent: false },
  { id: "css-specificity", label: "CSS Specificity", icon: Braces, hasContent: false },
];

type ConceptSwitcherTabsProps = {
  activeTab: ConceptSimulatorId;
  onTabChange: (id: ConceptSimulatorId) => void;
};

export function ConceptSwitcherTabs({ activeTab, onTabChange }: ConceptSwitcherTabsProps) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border border-border-light bg-surface-secondary p-1.5">
      {CONCEPT_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            disabled={!tab.hasContent}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm",
              isActive
                ? "border border-border bg-surface text-text-primary shadow-md"
                : "border border-transparent text-text-secondary hover:bg-surface",
              !tab.hasContent && "cursor-not-allowed opacity-50 hover:bg-transparent",
            )}
          >
            <Icon className="size-3.5 sm:size-4" />
            {tab.label}
            {!tab.hasContent && (
              <span className="text-[10px] text-text-muted">Soon</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

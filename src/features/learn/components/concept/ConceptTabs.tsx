"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { Code2, Lightbulb, Trophy, Users, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONCEPT_TABS, type ConceptTab } from "@/lib/constants";

const TAB_META: Record<ConceptTab, { label: string; icon: LucideIcon }> = {
  understand: { label: "Understand", icon: Lightbulb },
  simulate: { label: "Simulate", icon: Code2 },
  challenge: { label: "Challenge", icon: Trophy },
  interview: { label: "Interview", icon: Users },
  build: { label: "Build", icon: Wrench },
};

type Props = {
  activeTab: ConceptTab;
  onTabChange: (tab: ConceptTab) => void;
};

export function ConceptTabs({ activeTab, onTabChange }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving-focus keyboard nav for the WAI-ARIA tabs pattern (automatic activation).
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % CONCEPT_TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + CONCEPT_TABS.length) % CONCEPT_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = CONCEPT_TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    onTabChange(CONCEPT_TABS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="border-b border-border" role="tablist" aria-label="Concept sections">
      <div className="flex gap-1 overflow-x-auto">
        {CONCEPT_TABS.map((tab, index) => {
          const { label, icon: Icon } = TAB_META[tab];
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`concept-tab-${tab}`}
              aria-selected={isActive}
              aria-controls={`concept-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

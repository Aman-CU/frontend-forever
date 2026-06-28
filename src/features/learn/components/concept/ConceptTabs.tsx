"use client";

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
  return (
    <div className="border-b border-border" role="tablist" aria-label="Concept sections">
      <div className="flex gap-1 overflow-x-auto">
        {CONCEPT_TABS.map((tab) => {
          const { label, icon: Icon } = TAB_META[tab];
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab)}
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

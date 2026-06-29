"use client";

import { cn } from "@/lib/utils";
import type { ScenarioOption } from "./types";

type Props = {
  scenarios: ScenarioOption[];
  activeId: string;
  onChange: (id: string) => void;
};

// Pill-group scenario selector shown above a full simulator (Simulate tab only).
// Same visual language as the homepage ConceptSwitcherTabs: a surface-secondary
// backdrop with each scenario its own rounded pill, the active one lifted with
// bg-surface + shadow. Renders nothing when there's only one scenario, so a
// single-scenario simulator never shows a pointless one-item switcher.
export function ScenarioSwitcher({ scenarios, activeId, onChange }: Props) {
  if (scenarios.length < 2) return null;

  return (
    <div
      role="tablist"
      aria-label="Scenario"
      className="flex max-w-full flex-wrap items-center gap-1 rounded-xl bg-surface-secondary p-1"
    >
      {scenarios.map((scenario) => {
        const isActive = scenario.id === activeId;
        return (
          <button
            key={scenario.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(scenario.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              isActive
                ? "bg-surface text-text-primary shadow-md"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {scenario.label}
          </button>
        );
      })}
    </div>
  );
}

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { STAGE_THEME } from "./StageCard";
import type { StageColor } from "./StageCard";

type FlowItem = {
  label: string;
  color: StageColor;
};

// One entry per step (1-6) — order must match the real-world stage sequence
// these labels describe, since `currentStep` indexes into this array by
// position. The first label is the user action, which differs per scenario
// (Click Increment vs Click Like), so it comes in via props.
const FLOW_ITEMS: FlowItem[] = [
  { label: "Click Increment", color: "premium" },
  { label: "State Update", color: "info" },
  { label: "Render Phase", color: "success" },
  { label: "Virtual DOM", color: "accent" },
  { label: "Diffing", color: "streak" },
  { label: "DOM Update", color: "accent" },
];

type ExecutionFlowBarProps = {
  currentStep: number;
  actionLabel?: string;
};

export function ExecutionFlowBar({ currentStep, actionLabel }: ExecutionFlowBarProps) {
  const items = actionLabel
    ? FLOW_ITEMS.map((item, i) => (i === 0 ? { ...item, label: actionLabel } : item))
    : FLOW_ITEMS;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-light bg-surface-secondary p-3">
      <span className="text-xs font-semibold text-text-primary">Execution Flow</span>
      <div className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const step = index + 1;
          const theme = STAGE_THEME[item.color];
          const isCurrent = step === currentStep;

          return (
            <div key={item.label} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition-all duration-300",
                  theme.bg,
                  isCurrent && cn("ring-2 scale-105", theme.ring),
                )}
              >
                <span className={cn("font-bold", theme.text)}>{step}</span>
                <span className={theme.text}>{item.label}</span>
              </div>
              {index < FLOW_ITEMS.length - 1 && (
                <ChevronRight className="size-3 shrink-0 text-text-muted" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

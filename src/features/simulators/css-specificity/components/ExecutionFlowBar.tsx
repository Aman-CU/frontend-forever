import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { SPECIFICITY_THEME } from "./SpecificityCard";
import type { SpecificityColor } from "./SpecificityCard";

type FlowItem = {
  label: string;
  color: SpecificityColor;
};

// One entry per step (1-5) — order must match SPECIFICITY_FRAMES, since
// currentStep indexes into this array by position. Matches the design's own
// "Execution Flow" bar labels exactly.
const FLOW_ITEMS: FlowItem[] = [
  { label: "Element", color: "accent" },
  { label: "Matching Selectors", color: "info" },
  { label: "Specificity Calculation", color: "premium" },
  { label: "Winner Selection", color: "streak" },
  { label: "Final Style Applied", color: "success" },
];

type ExecutionFlowBarProps = {
  currentStep: number;
};

export function ExecutionFlowBar({ currentStep }: ExecutionFlowBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-light bg-surface-secondary p-3">
      <span className="text-xs font-semibold text-text-primary">Execution Flow</span>
      <div className="flex flex-wrap items-center gap-1">
        {FLOW_ITEMS.map((item, index) => {
          const step = index + 1;
          const theme = SPECIFICITY_THEME[item.color];
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

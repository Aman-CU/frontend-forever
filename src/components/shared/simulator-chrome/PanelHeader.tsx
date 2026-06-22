"use client";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

type PanelHeaderProps = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
};

export function PanelHeader({ currentStep, totalSteps, isPlaying }: PanelHeaderProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <div className="flex items-center justify-between border-b border-border-light px-5 py-3.5">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2" aria-hidden="true">
          {!prefersReducedMotion && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          )}
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Live Concept Engine
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-text-secondary">
          Step {currentStep} of {totalSteps}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            isPlaying ? "bg-success-muted text-success" : "bg-surface-secondary text-text-secondary",
          )}
        >
          <span className={cn("size-1.5 rounded-full", isPlaying ? "bg-success" : "bg-text-muted")} />
          {isPlaying ? "Running" : "Paused"}
        </span>
      </div>
    </div>
  );
}

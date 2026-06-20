type PanelHeaderProps = {
  currentStep: number;
  totalSteps: number;
};

export function PanelHeader({ currentStep, totalSteps }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border-light px-5 py-3.5">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-3 py-1 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Running
        </span>
      </div>
    </div>
  );
}

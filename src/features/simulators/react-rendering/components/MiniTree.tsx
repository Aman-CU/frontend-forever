import { cn } from "@/lib/utils";

import { STAGE_THEME } from "./StageCard";
import type { StageColor } from "./StageCard";

type MiniTreeProps = {
  h2Value: number;
  highlight?: StageColor;
  label?: string;
};

export function MiniTree({ h2Value, highlight, label }: MiniTreeProps) {
  const theme = highlight ? STAGE_THEME[highlight] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-xs font-medium text-text-muted">{label}</span>}
      <div className="rounded-md border border-border-light bg-surface-secondary px-3 py-1.5 font-mono text-xs text-text-secondary">
        div
      </div>
      <div className="h-3 w-px bg-border" aria-hidden="true" />
      <div className="flex gap-3">
        <div
          className={cn(
            "flex flex-col items-center gap-1 rounded-md border px-3 py-2",
            theme ? cn(theme.bg, theme.ring) : "border-border-light bg-surface-secondary",
          )}
        >
          <span className="font-mono text-[11px] text-text-muted">h2</span>
          <span className={cn("text-xl font-bold", theme ? theme.text : "text-text-secondary")}>
            {h2Value}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-md border border-border-light bg-surface-secondary px-3 py-2">
          <span className="font-mono text-[11px] text-text-muted">button</span>
          <span className="text-xs text-text-secondary">Increment</span>
        </div>
      </div>
    </div>
  );
}

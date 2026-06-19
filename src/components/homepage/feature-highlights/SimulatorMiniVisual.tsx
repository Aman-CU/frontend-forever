import { CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";

type MiniPanelProps = {
  label: string;
  item: string;
  active?: boolean;
};

function MiniPanel({ label, item, active }: MiniPanelProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-surface-secondary p-3 text-center">
      <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
        {label}
      </span>
      <span className={cn("text-sm font-medium", active ? "text-accent" : "text-text-secondary")}>
        {item}
      </span>
    </div>
  );
}

export function SimulatorMiniVisual() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-medium tracking-wide uppercase">Event Loop</span>
        <span className="flex items-center gap-1 text-success">
          <CircleDot className="size-3" aria-hidden="true" />
          Running
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MiniPanel label="Call Stack" item="main()" active />
        <MiniPanel label="Web APIs" item="setTimeout" />
        <MiniPanel label="Queue" item="—" />
      </div>
    </div>
  );
}

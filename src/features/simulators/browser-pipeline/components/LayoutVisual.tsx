import { LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";

import type { LayoutBox, StageStatus } from "../types";
import { PendingPlaceholder } from "./PendingPlaceholder";

type LayoutVisualProps = {
  status: StageStatus;
  layoutBoxes: LayoutBox[];
};

// Empty measured boxes only — no color/text yet. That absence is the
// point: Layout only computes geometry, Paint is what fills it in. A hidden
// box (visibility: hidden) still reserves its space here — shown faded with a
// "hidden" tag so the reserved-but-invisible space is legible.
export function LayoutVisual({ status, layoutBoxes }: LayoutVisualProps) {
  if (status === "pending") return <PendingPlaceholder icon={LayoutGrid} />;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-1">
      {layoutBoxes.map((box) => (
        <div
          key={box.id}
          className={cn(
            "flex items-center justify-center rounded-sm border border-dashed border-streak/50 bg-streak-light",
            box.hidden && "opacity-40",
          )}
          style={{ width: `${box.widthPercent}%`, height: box.height }}
        >
          <span className="font-mono text-[8px] text-streak">
            {box.label}
            {box.hidden && " (hidden)"}
          </span>
        </div>
      ))}
    </div>
  );
}

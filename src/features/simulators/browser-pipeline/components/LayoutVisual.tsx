import { LayoutGrid } from "lucide-react";

import { LAYOUT_BOXES } from "../data/scenarios";
import type { StageStatus } from "../types";
import { PendingPlaceholder } from "./PendingPlaceholder";

// Empty measured boxes only — no color/text yet. That absence is the
// point: Layout only computes geometry, Paint is what fills it in.
export function LayoutVisual({ status }: { status: StageStatus }) {
  if (status === "pending") return <PendingPlaceholder icon={LayoutGrid} />;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-1">
      {LAYOUT_BOXES.map((box) => (
        <div
          key={box.id}
          className="flex items-center justify-center rounded-sm border border-dashed border-streak/50 bg-streak-light"
          style={{ width: `${box.widthPercent}%`, height: box.height }}
        >
          <span className="font-mono text-[8px] text-streak">{box.label}</span>
        </div>
      ))}
    </div>
  );
}

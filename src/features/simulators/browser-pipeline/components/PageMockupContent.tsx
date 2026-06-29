import { cn } from "@/lib/utils";

import type { PageBox, PageBoxVariant } from "../types";

type PageMockupContentProps = {
  pageBoxes: PageBox[];
  /** Paint shows separate offset/shadowed layers; Composite flattens them. */
  layered?: boolean;
};

// Per-box text styling. The progressive offset (layered) is applied by index so
// Paint reads as stacked layers and Composite as one flat page.
const VARIANT_CLASS: Record<PageBoxVariant, string> = {
  title: "text-[9px] font-bold text-text-primary",
  heading: "text-[9px] font-semibold text-text-primary",
  accent: "text-[9px] text-accent",
  muted: "text-[8px] text-text-muted",
};

const LAYER_OFFSET = [
  "translate-x-0.5 -translate-y-0.5",
  "translate-x-1 -translate-y-1",
  "translate-x-[6px] -translate-y-[6px]",
  "translate-x-2 -translate-y-2",
  "translate-x-[10px] -translate-y-[10px]",
];

// The page's visible boxes rendered with their real styles. A hidden box
// (visibility: hidden) still occupies its row but its content is invisible —
// shown as a faded dashed placeholder so the reserved-but-blank space reads
// clearly, the exact contrast with display:none (which omits the box entirely).
export function PageMockupContent({ pageBoxes, layered }: PageMockupContentProps) {
  return (
    <div className="flex w-full flex-col gap-1 p-1.5">
      {pageBoxes.map((box, index) =>
        box.hidden ? (
          <div
            key={box.id}
            className={cn(
              "rounded-sm border border-dashed border-border-light bg-transparent px-2 py-1 text-center text-[8px] text-text-muted/60",
              layered && LAYER_OFFSET[index % LAYER_OFFSET.length],
            )}
          >
            (hidden)
          </div>
        ) : (
          <div
            key={box.id}
            className={cn(
              "rounded-sm bg-surface px-2 py-1 text-center shadow-sm",
              VARIANT_CLASS[box.variant],
              layered && LAYER_OFFSET[index % LAYER_OFFSET.length],
            )}
          >
            {box.label}
          </div>
        ),
      )}
    </div>
  );
}

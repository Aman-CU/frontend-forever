import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";
import {
  SECTION_NODE_HEIGHT,
  SECTION_NODE_WIDTH,
  TOPIC_NODE_HEIGHT,
  TOPIC_NODE_WIDTH,
} from "@/features/roadmaps/lib/canvasLayout";

type Props = {
  node: RoadmapNodeView;
  onSelect: (node: RoadmapNodeView) => void;
};

// A "section" node is a non-interactive group label, not a clickable box —
// it carries no links of its own (see roadmap_nodes' schema comment).
export function RoadmapNode({ node, onSelect }: Props) {
  const style = { left: node.positionX, top: node.positionY };

  if (node.nodeType === "section") {
    return (
      <div
        className="absolute flex items-center rounded-lg border border-border bg-surface-secondary px-3 text-xs font-semibold uppercase tracking-wide text-text-muted"
        style={{ ...style, width: SECTION_NODE_WIDTH, height: SECTION_NODE_HEIGHT }}
      >
        {node.title}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-roadmap-node-interactive
      onClick={() => onSelect(node)}
      className={cn(
        "absolute flex flex-col justify-center gap-0.5 rounded-xl border bg-surface px-4 py-2 text-left shadow-sm",
        "transition-all duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
        node.isCompleted ? "border-success/50 bg-success-muted/40" : "border-border",
        node.isOptional && "border-dashed",
      )}
      style={{ ...style, width: TOPIC_NODE_WIDTH, height: TOPIC_NODE_HEIGHT }}
    >
      <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
        {node.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />}
        <span className="truncate">{node.title}</span>
      </span>
      {node.isOptional && <span className="text-[11px] text-text-muted">Optional</span>}
    </button>
  );
}

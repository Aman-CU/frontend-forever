import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  node: RoadmapNodeView;
  onSelect: (node: RoadmapNodeView) => void;
  ref?: React.Ref<HTMLButtonElement>;
};

// The smaller, lighter box a dotted line branches out to from its parent
// spine node — every real piece of content in a sectioned roadmap lives
// here (a section header carries no links of its own).
export function RoadmapBranchPill({ node, onSelect, ref }: Props) {
  return (
    <button
      ref={ref}
      type="button"
      data-roadmap-node-interactive
      onClick={() => onSelect(node)}
      className={cn(
        "flex w-full max-w-55 items-center gap-1.5 rounded-lg border bg-surface px-3.5 py-2 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
        node.isCompleted ? "border-success/50 bg-success-muted/40" : "border-border",
        node.isOptional && "border-dashed",
      )}
    >
      {node.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />}
      <span className="truncate text-sm font-medium text-text-primary">{node.title}</span>
    </button>
  );
}

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  node: RoadmapNodeView;
  onSelect: (node: RoadmapNodeView) => void;
  // RefCallback<HTMLElement>, not Ref<HTMLDivElement> — a "section" node
  // renders as a <div>, a "topic" node as a <button>, and the caller
  // (RoadmapFlowDiagram, into a Map<string, HTMLElement>) only ever passes
  // a callback ref, never a RefObject. RefCallback's parameter position is
  // contravariant, so a callback accepting the shared HTMLElement base type
  // safely satisfies both the <div ref> and <button ref> JSX slots below
  // with no unsafe cast — plain Ref<HTMLElement> doesn't work here because
  // RefObject<T>'s `current` field isn't contravariant the same way.
  ref?: React.RefCallback<HTMLElement>;
};

// The bold, high-contrast box every reading row centers on — a "section"
// node is a non-interactive group label (roadmap_nodes' schema comment: it
// carries no links of its own), rendered as plain text in a chip. A "topic"
// node reaching the spine directly (the 4 section-less skill roadmaps, where
// every node IS the main path, not a branch off one) is the real clickable
// content box instead.
export function RoadmapSpineNode({ node, onSelect, ref }: Props) {
  if (node.nodeType === "section") {
    return (
      <div
        ref={ref}
        className="flex min-w-45 items-center justify-center rounded-xl border-2 border-accent/40 bg-accent-muted px-5 py-2.5 text-center text-sm font-semibold tracking-wide text-accent-dark dark:text-accent"
      >
        {node.title}
      </div>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        "flex min-w-50 items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-center text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
        node.isCompleted
          ? "border-success/50 bg-success-muted/40 text-success"
          : "border-accent/40 bg-accent-muted text-accent-dark hover:border-accent dark:text-accent",
      )}
    >
      {node.isCompleted && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="truncate">{node.title}</span>
    </button>
  );
}

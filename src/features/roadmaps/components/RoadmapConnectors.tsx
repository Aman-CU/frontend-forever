import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";
import { buildEdges, canvasBounds, nodeCenter } from "@/features/roadmaps/lib/canvasLayout";

type Props = { nodes: RoadmapNodeView[] };

// Plain straight-line SVG connectors between edge centers — no arrowheads,
// no orthogonal routing. Deliberately simple for v1; see canvasLayout.ts's
// buildEdges for the section-spoke + root-chain rule that decides which
// nodes connect to which.
export function RoadmapConnectors({ nodes }: Props) {
  const edges = buildEdges(nodes);
  const { width, height } = canvasBounds(nodes);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={width}
      height={height}
      aria-hidden
    >
      {edges.map((edge) => {
        const from = nodeCenter(edge.from);
        const to = nodeCenter(edge.to);
        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-border"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

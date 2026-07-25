"use client";

import { useRef } from "react";

import { RoadmapNode } from "@/features/roadmaps/components/RoadmapNode";
import { RoadmapConnectors } from "@/features/roadmaps/components/RoadmapConnectors";
import { RoadmapCanvasControls } from "@/features/roadmaps/components/RoadmapCanvasControls";
import { useCanvasPanZoom } from "@/features/roadmaps/hooks/useCanvasPanZoom";
import { canvasBounds } from "@/features/roadmaps/lib/canvasLayout";
import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  nodes: RoadmapNodeView[];
  onSelectNode: (node: RoadmapNodeView) => void;
};

// Purely the pan/zoom canvas surface — controlled by its parent
// (RoadmapDetailView), which owns node/selection/completion state so the
// same state can also drive RoadmapMobileList without duplicating it.
export function RoadmapCanvas({ nodes, onSelectNode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, reset } =
    useCanvasPanZoom(containerRef);

  const bounds = canvasBounds(nodes);

  return (
    <div className="relative h-[70vh] min-h-[520px] w-full overflow-hidden rounded-2xl border border-border bg-background">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="relative origin-top-left"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            width: bounds.width,
            height: bounds.height,
          }}
        >
          <RoadmapConnectors nodes={nodes} />
          {nodes.map((node) => (
            <RoadmapNode key={node.id} node={node} onSelect={onSelectNode} />
          ))}
        </div>
      </div>

      <RoadmapCanvasControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
    </div>
  );
}

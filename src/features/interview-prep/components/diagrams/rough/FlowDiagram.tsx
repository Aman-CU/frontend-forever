"use client";

import type { RoughSVG } from "roughjs/bin/svg";

import { RoughDiagram, type RoughThemeColors } from "./RoughDiagram";
import { drawArrow, drawBox } from "./roughPrimitives";

// A generic, data-driven diagram for Feature 49's guides that don't warrant a
// fully hand-tuned bespoke component (see InfiniteScrollArchitectureDiagram
// for that treatment) — auto-lays-out each guide's own Component Architecture
// nodes into a simple grid and draws arrows per the given edges. Still real
// rough.js output (same primitives/theme-color handling as the bespoke
// diagram), just generated from data instead of pixel-positioned by hand —
// a deliberate scope tradeoff given this feature's 27-guide content run.
export type FlowNode = { id: string; label: string[] };
export type FlowEdge = [string, string];

type Props = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  ariaLabel: string;
  columns?: number;
};

const BOX_W = 190;
const BOX_H = 64;
const GAP_X = 50;
const GAP_Y = 46;
const PADDING = 20;

function layoutPositions(nodeCount: number, columns: number) {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    positions.push({
      x: PADDING + col * (BOX_W + GAP_X),
      y: PADDING + row * (BOX_H + GAP_Y),
    });
  }
  return positions;
}

export function FlowDiagram({ nodes, edges, ariaLabel, columns = 3 }: Props) {
  const cols = Math.min(columns, nodes.length) || 1;
  const positions = layoutPositions(nodes.length, cols);
  const positionById = new Map(nodes.map((n, i) => [n.id, positions[i]]));
  const rows = Math.ceil(nodes.length / cols);
  const width = PADDING * 2 + cols * BOX_W + (cols - 1) * GAP_X;
  const height = PADDING * 2 + rows * BOX_H + (rows - 1) * GAP_Y;

  function draw(rc: RoughSVG, colors: RoughThemeColors): SVGElement[] {
    const els: SVGElement[] = [];

    for (const [fromId, toId] of edges) {
      const from = positionById.get(fromId);
      const to = positionById.get(toId);
      if (!from || !to) continue;

      const x1 = from.x + BOX_W / 2;
      const y1 = from.y + BOX_H / 2;
      const x2 = to.x + BOX_W / 2;
      const y2 = to.y + BOX_H / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;
      // Distance from center to the box's actual edge along this ray (not a
      // fixed per-axis offset) — the edge hit is whichever axis's half-extent
      // the ray reaches first, so diagonal connections land on the real
      // rectangle boundary instead of overshooting/undershooting it.
      const edgeDist = (ex: number, ey: number) =>
        Math.min(ex !== 0 ? BOX_W / 2 / Math.abs(ex) : Infinity, ey !== 0 ? BOX_H / 2 / Math.abs(ey) : Infinity) *
        0.95;
      const startT = edgeDist(ux, uy);
      const endT = edgeDist(-ux, -uy);
      const startX = x1 + ux * startT;
      const startY = y1 + uy * startT;
      const endX = x2 - ux * endT;
      const endY = y2 - uy * endT;

      els.push(drawArrow(rc, startX, startY, endX, endY, { stroke: colors.accent, roughness: 1.4 }));
    }

    for (const node of nodes) {
      const p = positionById.get(node.id)!;
      els.push(drawBox(rc, p.x, p.y, BOX_W, BOX_H, { stroke: colors.ink, roughness: 1.6 }));
    }

    return els;
  }

  return (
    <RoughDiagram
      viewBox={`0 0 ${width} ${height}`}
      ariaLabel={ariaLabel}
      draw={draw}
      overlay={
        <g fontSize={11} fontWeight={600} textAnchor="middle">
          {nodes.map((node) => {
            const p = positionById.get(node.id)!;
            return (
              <g key={node.id} transform={`translate(${p.x + BOX_W / 2}, ${p.y + BOX_H / 2})`}>
                {node.label.map((line, i) => (
                  <text
                    key={i}
                    x={0}
                    y={(i - (node.label.length - 1) / 2) * 14 + 4}
                    fill="var(--color-text-primary)"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      }
    />
  );
}

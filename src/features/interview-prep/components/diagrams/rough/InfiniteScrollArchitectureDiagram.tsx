"use client";

import type { RoughSVG } from "roughjs/bin/svg";

import { RoughDiagram, type RoughThemeColors } from "./RoughDiagram";
import { drawArrow, drawBox, drawLine } from "./roughPrimitives";

type Box = { key: string; x: number; y: number; w: number; h: number; lines: string[] };

const BOXES: Box[] = [
  { key: "viewport", x: 20, y: 130, w: 170, h: 60, lines: ["Viewport", "(scroll container)"] },
  { key: "list", x: 20, y: 235, w: 170, h: 70, lines: ["Virtualized List", "(windowed FeedItem rows)"] },
  { key: "sentinel", x: 235, y: 130, w: 180, h: 60, lines: ["IntersectionObserver", "sentinel"] },
  { key: "query", x: 460, y: 35, w: 215, h: 60, lines: ["useInfiniteQuery", "(fetch trigger)"] },
  { key: "cache", x: 460, y: 130, w: 215, h: 60, lines: ["Cache", "pages[] + nextCursor"] },
  { key: "api", x: 460, y: 235, w: 215, h: 70, lines: ["API", "GET /feed?cursor=..."] },
];

// The component-architecture loop for an infinite-scroll feed (build-plan.md,
// Feature 49 spec, section 4 "High-Level Component Architecture"): scrolling
// toward the sentinel triggers the next page fetch, the response lands in
// cache, and only the visible window of rows ever mounts.
function draw(rc: RoughSVG, colors: RoughThemeColors): SVGElement[] {
  const nodes: SVGElement[] = [];
  const boxStyle = { stroke: colors.ink, roughness: 1.6 };
  const arrowStyle = { stroke: colors.accent, roughness: 1.4 };

  for (const box of BOXES) {
    nodes.push(drawBox(rc, box.x, box.y, box.w, box.h, boxStyle));
  }

  // viewport -> sentinel: scroll approaches the bottom of the loaded rows
  nodes.push(drawArrow(rc, 190, 160, 235, 160, arrowStyle));
  // sentinel -> fetch trigger: sentinel intersects, next page requested
  nodes.push(drawArrow(rc, 405, 145, 460, 68, arrowStyle));
  // fetch trigger -> API: the actual network request — routed right of the
  // Cache box (which sits directly between query and API in the same
  // column) so the connector doesn't visually cut through Cache or overlap
  // the reverse API -> cache arrow below.
  nodes.push(drawLine(rc, 620, 95, 700, 95, arrowStyle));
  nodes.push(drawLine(rc, 700, 95, 700, 235, arrowStyle));
  nodes.push(drawArrow(rc, 700, 235, 620, 235, arrowStyle));
  // API -> cache: response lands as a new page + next cursor
  nodes.push(drawArrow(rc, 567, 235, 567, 190, arrowStyle));
  // cache -> virtualized list: new rows appended, only visible ones render
  nodes.push(drawArrow(rc, 460, 175, 190, 260, arrowStyle));
  // virtualized list -> viewport: rendered rows paint into the scroll container
  nodes.push(drawArrow(rc, 105, 235, 105, 190, arrowStyle));

  return nodes;
}

export function InfiniteScrollArchitectureDiagram() {
  return (
    <RoughDiagram
      viewBox="0 0 700 340"
      ariaLabel="Component architecture for an infinite-scroll feed: the viewport scrolls toward an IntersectionObserver sentinel, which triggers useInfiniteQuery to request the next page from the API. The response (a page of items plus a next cursor) is stored in cache, which appends to the virtualized list — only the currently visible rows ever mount, and those rows render back into the viewport, closing the loop."
      draw={draw}
      overlay={
        <g fontSize={11} fill="var(--color-text-primary)" fontWeight={600} textAnchor="middle">
          {BOXES.map((box) => (
            <g key={box.key} transform={`translate(${box.x + box.w / 2}, ${box.y + box.h / 2})`}>
              {box.lines.map((line, i) => (
                <text
                  key={i}
                  x={0}
                  y={(i - (box.lines.length - 1) / 2) * 14 + 4}
                  fontFamily={i === box.lines.length - 1 && box.lines.length > 1 ? "monospace" : undefined}
                  fontWeight={i === 0 ? 700 : 500}
                  fill={i === 0 ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
                >
                  {line}
                </text>
              ))}
            </g>
          ))}
        </g>
      }
    />
  );
}

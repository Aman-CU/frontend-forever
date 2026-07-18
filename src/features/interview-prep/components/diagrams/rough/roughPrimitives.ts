import type { RoughSVG } from "roughjs/bin/svg";

// Small, fixed drawing primitives for Feature 49's hand-sketched diagram
// style — box/arrow/labelled-flow-step, per build-plan.md's spec. Not a
// freeform canvas tool: each guide's diagram is author-defined and static,
// same "hand-built simulator" precedent as Features 09-12, just a sketchy
// rough.js skin instead of the clean SaaS-dashboard look those 4 use.
export type RoughStyle = {
  stroke: string;
  fill?: string;
  fillStyle?: "hachure" | "solid" | "cross-hatch";
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
};

const SVG_NS = "http://www.w3.org/2000/svg";

export function drawBox(
  rc: RoughSVG,
  x: number,
  y: number,
  w: number,
  h: number,
  style: RoughStyle,
): SVGGElement {
  return rc.rectangle(x, y, w, h, {
    stroke: style.stroke,
    fill: style.fill,
    fillStyle: style.fillStyle ?? "hachure",
    strokeWidth: style.strokeWidth ?? 1.5,
    roughness: style.roughness ?? 1.6,
    seed: style.seed,
  });
}

// A plain sketched line, no arrowhead — used for sequence-diagram lifelines
// and anywhere a connector shouldn't imply direction.
export function drawLine(
  rc: RoughSVG,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: RoughStyle,
): SVGGElement {
  return rc.line(x1, y1, x2, y2, {
    stroke: style.stroke,
    strokeWidth: style.strokeWidth ?? 1.5,
    roughness: style.roughness ?? 1.6,
    seed: style.seed,
  });
}

// A straight sketched line plus a small solid-filled triangular arrowhead at
// the end point — roughjs itself has no arrowhead primitive.
export function drawArrow(
  rc: RoughSVG,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: RoughStyle,
): SVGGElement {
  const group = document.createElementNS(SVG_NS, "g") as SVGGElement;

  const line = rc.line(x1, y1, x2, y2, {
    stroke: style.stroke,
    strokeWidth: style.strokeWidth ?? 1.5,
    roughness: style.roughness ?? 1.6,
    seed: style.seed,
  });
  group.appendChild(line);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  const spread = 0.45;
  const tip: [number, number] = [x2, y2];
  const left: [number, number] = [
    x2 - headLen * Math.cos(angle - spread),
    y2 - headLen * Math.sin(angle - spread),
  ];
  const right: [number, number] = [
    x2 - headLen * Math.cos(angle + spread),
    y2 - headLen * Math.sin(angle + spread),
  ];
  const head = rc.polygon([tip, left, right], {
    stroke: style.stroke,
    fill: style.stroke,
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: style.roughness ?? 1.6,
    seed: style.seed,
  });
  group.appendChild(head);

  return group;
}

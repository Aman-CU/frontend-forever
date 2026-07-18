export const COLLECTIONS = ["FF 75", "FF JavaScript", "FF React", "FF Frontend System Design"];
export const LEFT_TOPICS = ["JavaScript Runtime", "Browser Internals", "CSS", "TypeScript"];
export const RIGHT_TOPICS = ["React", "Accessibility", "Performance", "System Design"];

export const Y_SLOTS = [12, 38, 64, 90];

// One color per row, reused purely for hue (ui-rules.md's Multi-Item Hue Theming) —
// gives each traveling dot a distinct, deliberately out-of-sync identity.
export const DOT_FILL_CLASSES = ["fill-xp", "fill-accent", "fill-info", "fill-premium"];

// The graph container is forced to aspect-video (16/9) via CSS. The SVG viewBox
// must share that exact ratio too — a square viewBox stretched non-uniformly onto
// a 16:9 box scales x and y by different factors, which visibly distorts stroke
// width, curve shape, and circle radius (circles render as ellipses).
export const VIEWBOX_WIDTH = 100;
export const VIEWBOX_HEIGHT = (VIEWBOX_WIDTH * 9) / 16;

export function toSvgY(percentY: number) {
  return (percentY / 100) * VIEWBOX_HEIGHT;
}

export const FALLBACK_LEFT = LEFT_TOPICS.map((_, index) => ({ x: 24, y: Y_SLOTS[index] }));
export const FALLBACK_RIGHT = RIGHT_TOPICS.map((_, index) => ({ x: 76, y: Y_SLOTS[index] }));
export const FALLBACK_CARD = { left: 36, right: 64, top: 30, bottom: 70 };

export type GraphPoint = { x: number; y: number };
export type GraphCard = typeof FALLBACK_CARD;

function bezierValue(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

export function linkPath(startX: number, startY: number, endX: number, endY: number) {
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

export function sampleLink(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps = 10,
) {
  const midX = (startX + endX) / 2;
  const cx: number[] = [];
  const cy: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    cx.push(bezierValue(t, startX, midX, midX, endX));
    cy.push(bezierValue(t, startY, startY, endY, endY));
  }
  return { cx, cy };
}

export function cardEntryY(card: GraphCard, index: number) {
  const t = index / (Y_SLOTS.length - 1);
  return card.top + t * (card.bottom - card.top);
}

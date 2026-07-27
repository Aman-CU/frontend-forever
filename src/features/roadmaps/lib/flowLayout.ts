import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

// A single reading-order row down the spine. "section" rows are a
// non-interactive group label (roadmap_nodes' schema — a section carries no
// links of its own) with its topic children rendered as branch pills off to
// one side; "topic" rows are a standalone, directly clickable spine node —
// what every node in a section-less skill roadmap (JavaScript/CSS/React/
// TypeScript, no section nodes at all) renders as.
export type FlowRow =
  | { kind: "topic"; node: RoadmapNodeView }
  | { kind: "section"; node: RoadmapNodeView; branches: RoadmapNodeView[]; side: "left" | "right" };

// nodes arrives already sorted column-major (positionX, positionY — see
// getRoadmapDetail's query comment), which for a multi-column authored
// roadmap already reads as "every section in column 0 top-to-bottom, then
// column 1, then column 2" — exactly the single-file spine order this flow
// diagram wants, with no extra sorting needed here.
export function buildFlowRows(nodes: RoadmapNodeView[]): FlowRow[] {
  const topicsByParent = new Map<string, RoadmapNodeView[]>();
  for (const n of nodes) {
    if (n.nodeType === "topic" && n.parentId) {
      const list = topicsByParent.get(n.parentId) ?? [];
      list.push(n);
      topicsByParent.set(n.parentId, list);
    }
  }

  const rows: FlowRow[] = [];
  let branchGroupIndex = 0;
  for (const n of nodes) {
    if (n.nodeType === "section") {
      const branches = topicsByParent.get(n.id) ?? [];
      const side = branchGroupIndex % 2 === 0 ? "right" : "left";
      if (branches.length > 0) branchGroupIndex++;
      rows.push({ kind: "section", node: n, branches, side });
    } else if (n.nodeType === "topic" && !n.parentId) {
      rows.push({ kind: "topic", node: n });
    }
  }
  return rows;
}

// Same cubic-bezier "S-curve between two x-offset points" construction as
// components/homepage/feature-highlights/graphData.ts's linkPath — not
// imported from there since features never import other features in this
// codebase, so this is a small local re-derivation of standard bezier math,
// not a second copy of any roadmap-specific logic.
export function flowConnectorPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

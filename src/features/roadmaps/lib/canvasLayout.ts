import type { RoadmapNodeView } from "@/features/roadmaps/lib/queries";

// Fixed node dimensions — every node's authored positionX/positionY (see
// scripts/seed/roadmaps.ts) assumes these. Section headers are a smaller
// label pill; topic nodes are the real clickable boxes.
export const TOPIC_NODE_WIDTH = 220;
export const TOPIC_NODE_HEIGHT = 64;
export const SECTION_NODE_WIDTH = 200;
export const SECTION_NODE_HEIGHT = 40;

export function nodeDimensions(nodeType: RoadmapNodeView["nodeType"]) {
  return nodeType === "section"
    ? { width: SECTION_NODE_WIDTH, height: SECTION_NODE_HEIGHT }
    : { width: TOPIC_NODE_WIDTH, height: TOPIC_NODE_HEIGHT };
}

export function nodeCenter(node: RoadmapNodeView) {
  const { width, height } = nodeDimensions(node.nodeType);
  return { x: node.positionX + width / 2, y: node.positionY + height / 2 };
}

export type CanvasEdge = { id: string; from: RoadmapNodeView; to: RoadmapNodeView };

// Every node with a parent connects to it (section → its topics). Every
// root-level node (no parent) chains to the previous root *in the same
// column* — this is what gives a parent-less linear roadmap (the 4
// skill-based roadmaps, which have no section nodes at all, one column)
// its connecting line, while a sectioned, multi-column roadmap (Frontend
// Developer) gets a tree of spokes off each section header plus a chain
// between sections within a column, without a stray diagonal jumping
// across columns.
export function buildEdges(nodes: RoadmapNodeView[]): CanvasEdge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: CanvasEdge[] = [];

  // No explicit "column"/"canvas order" field — grouping by positionX (every
  // node in the same column is authored at the same x) and reading top-to-
  // bottom within that group off positionY is a reasonable proxy.
  const roots = nodes.filter((n) => !n.parentId);
  const rootsByColumn = new Map<number, RoadmapNodeView[]>();
  for (const root of roots) {
    const column = rootsByColumn.get(root.positionX) ?? [];
    column.push(root);
    rootsByColumn.set(root.positionX, column);
  }
  for (const column of rootsByColumn.values()) {
    column.sort((a, b) => a.positionY - b.positionY);
    for (let i = 1; i < column.length; i++) {
      edges.push({ id: `root-${column[i - 1].id}-${column[i].id}`, from: column[i - 1], to: column[i] });
    }
  }

  for (const node of nodes) {
    if (!node.parentId) continue;
    const parent = byId.get(node.parentId);
    if (parent) edges.push({ id: `edge-${node.id}`, from: parent, to: node });
  }

  return edges;
}

export function canvasBounds(nodes: RoadmapNodeView[]) {
  if (nodes.length === 0) return { width: 800, height: 600 };
  let maxX = 0;
  let maxY = 0;
  for (const node of nodes) {
    const { width, height } = nodeDimensions(node.nodeType);
    maxX = Math.max(maxX, node.positionX + width);
    maxY = Math.max(maxY, node.positionY + height);
  }
  return { width: maxX + 120, height: maxY + 120 };
}

export const STAGE_IDS = [
  "component-state",
  "render-phase",
  "virtual-dom",
  "diffing",
  "real-dom",
] as const;
export type StageId = (typeof STAGE_IDS)[number];

// pending = this stage hasn't happened yet, card shows a placeholder, not its
// final answer. active = happening right now. done = settled, content stays
// visible but no longer animating.
export type CardStatus = "pending" | "active" | "done";

// Keyed by StageId rather than a positional tuple — looking up
// cardStatuses["virtual-dom"] can't silently desync from STAGE_META the way
// indexing a 5-tuple by position could if either array were ever reordered.
export type CardStatuses = Record<StageId, CardStatus>;

export type RenderFrame = {
  step: number;
  cardStatuses: CardStatuses;
  /** What the Component State card's count box shows. */
  componentStateCount: number;
  /** What the Real DOM card's Count shows — stays stale until the dom-update stage. */
  realDomCount: number;
  description: string;
};

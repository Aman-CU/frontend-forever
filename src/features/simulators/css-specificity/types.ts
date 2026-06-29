export const STAGE_IDS = ["element", "matching", "calculator", "winner", "final"] as const;
export type StageId = (typeof STAGE_IDS)[number];

// pending = this stage hasn't happened yet, card shows a placeholder, not its
// final answer. active = happening right now. done = settled, content stays
// visible but no longer animating. Same 3-state shape as the other
// simulators' stage status, kept as its own type per the "simulators don't
// share types/components" invariant.
export type StageStatus = "pending" | "active" | "done";

// Keyed by StageId rather than a positional tuple — looking up
// stageStatuses["winner"] can't desync from STAGE_META the way indexing a
// positional array could if either were ever reordered.
export type StageStatuses = Record<StageId, StageStatus>;

export type SelectorKind = "type" | "class" | "id";

/** [id count, class count, type count] — the a-b-c specificity score. */
export type SpecificityScore = readonly [id: number, cls: number, type: number];

export type SelectorInfo = {
  selector: string;
  kind: SelectorKind;
  kindLabel: string;
  score: SpecificityScore;
  /** True when the rule is marked !important — it then wins regardless of score. */
  important?: boolean;
};

export type SpecificityFrame = {
  step: number;
  stageStatuses: StageStatuses;
  description: string;
};

// A selectable scenario. The competing selectors, the winning selector, the
// element markup, and the caption subtexts all differ per scenario; the 5-stage
// shape is shared so every visual is reused unchanged.
export type SpecificityScenario = {
  id: string;
  label: string;
  frames: SpecificityFrame[];
  elementHtml: string;
  selectors: SelectorInfo[];
  winner: string;
  captionSubtexts: Record<StageId, string>;
};

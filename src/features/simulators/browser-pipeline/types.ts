export const STAGE_IDS = [
  "html",
  "dom",
  "css",
  "cssom",
  "render-tree",
  "layout",
  "paint",
  "composite",
] as const;
export type StageId = (typeof STAGE_IDS)[number];

// pending = not reached yet (placeholder shown). active = building right
// now. done = settled, content stays visible but stops animating. Same
// 3-state shape as react-rendering's CardStatus, kept as its own type here
// per the "simulators don't share types/components" invariant.
export type StageStatus = "pending" | "active" | "done";

// Keyed by StageId rather than a positional array — looking up
// stageStatuses["render-tree"] can't desync from the wrong stage the way
// indexing a positional tuple could.
export type StageStatuses = Record<StageId, StageStatus>;

export type TreeNode = {
  id: string;
  label: string;
  /** True only for nodes the Render Tree drops (display: none). */
  excluded?: boolean;
  children?: TreeNode[];
};

export type PipelineFrame = {
  step: number;
  stageStatuses: StageStatuses;
  description: string;
};

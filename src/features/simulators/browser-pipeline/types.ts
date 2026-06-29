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
  /** True for nodes kept in the tree but painted blank (visibility: hidden). */
  hidden?: boolean;
  children?: TreeNode[];
};

export type PipelineFrame = {
  step: number;
  stageStatuses: StageStatuses;
  description: string;
};

export type LayoutBox = {
  id: string;
  label: string;
  widthPercent: number;
  height: number;
  /** A box that still reserves space but renders invisibly (visibility: hidden). */
  hidden?: boolean;
};

export type PageBoxVariant = "title" | "heading" | "accent" | "muted";

export type PageBox = {
  id: string;
  label: string;
  variant: PageBoxVariant;
  /** visibility: hidden — the box reserves space but its content is invisible. */
  hidden?: boolean;
};

// A selectable scenario. The source, the three trees, the layout boxes, the
// final page boxes, and the Render-Tree caption all differ per scenario; the
// 8-stage pipeline shape is shared.
export type PipelineScenario = {
  id: string;
  label: string;
  frames: PipelineFrame[];
  htmlSource: string;
  cssSource: string;
  domTree: TreeNode;
  cssomTree: TreeNode;
  renderTree: TreeNode;
  layoutBoxes: LayoutBox[];
  pageBoxes: PageBox[];
  renderTreeCaption: string;
  insight: { title: string; body: string };
};

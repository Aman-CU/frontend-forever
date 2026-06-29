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

// "dom-update" walks the counter example (a state change patches one DOM node).
// "wasted-render" tells a different story with a Parent→Child component tree
// (the child re-renders but its DOM is never touched), so its Render/VirtualDOM/
// Diffing/RealDOM cards render a ComponentTreeView instead of the counter trees.
export type RenderScenarioKind = "dom-update" | "wasted-render";

// A selectable scenario. The visuals, caption subtexts, the value the update
// lands on, the component/state labels, and the insight all differ per scenario;
// captionSubtexts override the per-card caption line under each stage card.
export type RenderScenario = {
  id: string;
  label: string;
  kind: RenderScenarioKind;
  frames: RenderFrame[];
  /** The value the update settles on, shown in the trees. */
  targetCount: number;
  /** Component State card: the component name, the state field label, the button label. */
  componentLabel: string;
  stateLabel: string;
  clickLabel: string;
  /** wasted-render only: the child component's name in the tree. */
  childLabel: string;
  captionSubtexts: Record<StageId, string>;
  insight: { title: string; body: string };
};

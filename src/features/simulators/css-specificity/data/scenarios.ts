import type {
  SelectorInfo,
  SpecificityFrame,
  SpecificityScenario,
  StageStatuses,
} from "../types";

// One fixed Hero-version scenario, same "single hardcoded example" rule as
// event-loop/react-rendering/browser-pipeline — taken directly from
// designs/hero-section-1-css-specificity.png rather than invented.
export const ELEMENT_HTML = `<button id="cta" class="btn primary">
  Start Learning
</button>`;

// #cta wins outright on ID alone (1-0-0 beats every 0-x-x score), so this
// scenario never needs source-order tie-breaking logic — .btn and .primary
// tie at 0-1-0 but neither is the winner anyway.
export const SELECTORS: SelectorInfo[] = [
  { selector: "button", kind: "type", kindLabel: "Type selector", score: [0, 0, 1] },
  { selector: ".btn", kind: "class", kindLabel: "Class selector", score: [0, 1, 0] },
  { selector: ".primary", kind: "class", kindLabel: "Class selector", score: [0, 1, 0] },
  { selector: "#cta", kind: "id", kindLabel: "ID selector", score: [1, 0, 0] },
];

export const WINNER_SELECTOR = "#cta";

function statuses(overrides: Partial<StageStatuses>): StageStatuses {
  const base: StageStatuses = {
    element: "pending",
    matching: "pending",
    calculator: "pending",
    winner: "pending",
    final: "pending",
  };
  return { ...base, ...overrides };
}

// Each frame is the complete resultant state for that step — the hook just
// indexes into this array, same "step scripts are the source of truth"
// invariant as every other simulator in this project. 5 frames, matching the
// design's own "Execution Flow" bar numbering 1-5 exactly.
export const SPECIFICITY_FRAMES: SpecificityFrame[] = [
  {
    step: 1,
    stageStatuses: statuses({ element: "active" }),
    description: "The browser needs to paint this button element to the screen.",
  },
  {
    step: 2,
    stageStatuses: statuses({ element: "done", matching: "active" }),
    description: "4 selectors in the stylesheet match this element: button, .btn, .primary, and #cta.",
  },
  {
    step: 3,
    stageStatuses: statuses({ element: "done", matching: "done", calculator: "active" }),
    description: "Each matching selector gets a specificity score in [ID, Class, Type] format.",
  },
  {
    step: 4,
    stageStatuses: statuses({ element: "done", matching: "done", calculator: "done", winner: "active" }),
    description: "#cta scores 1-0-0 — an ID selector always outranks class and type selectors.",
  },
  {
    step: 5,
    stageStatuses: statuses({
      element: "done",
      matching: "done",
      calculator: "done",
      winner: "done",
      final: "active",
    }),
    description: "The browser applies #cta's styles. The button turns teal.",
  },
];

// Scenario 2 — !important. A class selector (.primary, 0-1-0) carries
// !important, so it beats the ID selector (#cta, 1-0-0) even though the ID has
// the higher raw score. The lesson: !important short-circuits specificity.
const IMPORTANT_HTML = `<button id="cta" class="btn primary">
  Start Learning
</button>`;

const IMPORTANT_SELECTORS: SelectorInfo[] = [
  { selector: "button", kind: "type", kindLabel: "Type selector", score: [0, 0, 1] },
  { selector: ".btn", kind: "class", kindLabel: "Class selector", score: [0, 1, 0] },
  {
    selector: ".primary",
    kind: "class",
    kindLabel: "Class · !important",
    score: [0, 1, 0],
    important: true,
  },
  { selector: "#cta", kind: "id", kindLabel: "ID selector", score: [1, 0, 0] },
];

const IMPORTANT_FRAMES: SpecificityFrame[] = [
  {
    step: 1,
    stageStatuses: statuses({ element: "active" }),
    description: "The browser needs to paint this button element to the screen.",
  },
  {
    step: 2,
    stageStatuses: statuses({ element: "done", matching: "active" }),
    description:
      "4 selectors match this element: button, .btn, .primary, and #cta. One of them uses !important.",
  },
  {
    step: 3,
    stageStatuses: statuses({ element: "done", matching: "done", calculator: "active" }),
    description:
      "Each selector gets a specificity score — but .primary's rule is flagged !important.",
  },
  {
    step: 4,
    stageStatuses: statuses({ element: "done", matching: "done", calculator: "done", winner: "active" }),
    description:
      "!important overrides specificity: .primary (0-1-0) wins even though #cta scores higher at 1-0-0.",
  },
  {
    step: 5,
    stageStatuses: statuses({
      element: "done",
      matching: "done",
      calculator: "done",
      winner: "done",
      final: "active",
    }),
    description: "The browser applies .primary's !important rule. The button turns teal.",
  },
];

export const SPECIFICITY_SCENARIOS: SpecificityScenario[] = [
  {
    id: "id-wins",
    label: "ID vs class",
    frames: SPECIFICITY_FRAMES,
    elementHtml: ELEMENT_HTML,
    selectors: SELECTORS,
    winner: WINNER_SELECTOR,
    captionSubtexts: {
      element: "The element to style",
      matching: "4 selectors match",
      calculator: "[ID, Class, Type] score",
      winner: "Highest score wins",
      final: "Winning rule applied",
    },
  },
  {
    id: "important",
    label: "!important",
    frames: IMPORTANT_FRAMES,
    elementHtml: IMPORTANT_HTML,
    selectors: IMPORTANT_SELECTORS,
    winner: ".primary",
    captionSubtexts: {
      element: "The element to style",
      matching: "4 selectors match",
      calculator: "[ID, Class, Type] score",
      winner: "!important overrides",
      final: "Winning rule applied",
    },
  },
];

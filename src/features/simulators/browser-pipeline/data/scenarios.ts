import type { PipelineFrame, StageStatuses, TreeNode } from "../types";

// One fixed Hero-version scenario, same "single hardcoded example" rule as
// event-loop/react-rendering. The .ad rule is the deliberate teaching hook:
// it gives the Render Tree frame something concrete to exclude.
export const HTML_SOURCE = `<body>
  <header>Frontend Forever</header>
  <main>
    <h1>Learn by Doing</h1>
    <p class="intro">Simulators teach concepts.</p>
    <aside class="ad">Ad banner</aside>
  </main>
  <footer>© 2026 Frontend Forever</footer>
</body>`;

export const CSS_SOURCE = `body { font-family: sans-serif; }
header { font-weight: bold; }
.intro { color: teal; }
.ad { display: none; }
footer { font-size: 12px; color: gray; }`;

export const DOM_TREE: TreeNode = {
  id: "body",
  label: "body",
  children: [
    { id: "header", label: "header" },
    {
      id: "main",
      label: "main",
      children: [
        { id: "h1", label: "h1" },
        { id: "intro", label: "p.intro" },
        { id: "ad", label: "aside.ad" },
      ],
    },
    { id: "footer", label: "footer" },
  ],
};

export const CSSOM_TREE: TreeNode = {
  id: "stylesheet",
  label: "stylesheet",
  children: [
    { id: "rule-body", label: "body" },
    { id: "rule-header", label: "header" },
    { id: "rule-intro", label: ".intro" },
    { id: "rule-ad", label: ".ad" },
    { id: "rule-footer", label: "footer" },
  ],
};

// Same shape as DOM_TREE, but aside.ad is flagged excluded — the merge step
// (Render Tree) is what actually drops it from the page, not the parser.
export const RENDER_TREE: TreeNode = {
  id: "body",
  label: "body",
  children: [
    { id: "header", label: "header" },
    {
      id: "main",
      label: "main",
      children: [
        { id: "h1", label: "h1" },
        { id: "intro", label: "p.intro" },
        { id: "ad", label: "aside.ad", excluded: true },
      ],
    },
    { id: "footer", label: "footer" },
  ],
};

export type LayoutBox = {
  id: string;
  label: string;
  widthPercent: number;
  height: number;
};

// The 4 boxes that actually survive the Render Tree (aside.ad excluded,
// body/main treated as non-content wrappers) — same "simplify for the Hero
// version" precedent as react-rendering's generic div/h2/button mockup.
export const LAYOUT_BOXES: LayoutBox[] = [
  { id: "header", label: "header", widthPercent: 100, height: 22 },
  { id: "h1", label: "h1", widthPercent: 55, height: 20 },
  { id: "intro", label: "p.intro", widthPercent: 78, height: 16 },
  { id: "footer", label: "footer", widthPercent: 100, height: 14 },
];

function statuses(overrides: Partial<StageStatuses>): StageStatuses {
  const base: StageStatuses = {
    html: "pending",
    dom: "pending",
    css: "pending",
    cssom: "pending",
    "render-tree": "pending",
    layout: "pending",
    paint: "pending",
    composite: "pending",
  };
  return { ...base, ...overrides };
}

// Each frame is the complete resultant state for that step — the hook just
// indexes into this array, same "step scripts are the source of truth"
// invariant as event-loop/react-rendering. HTML/CSS parsing share frames
// 2-3 (both tracks "active"/"done" together) to represent that they run in
// parallel, not as separate sequential steps.
export const PIPELINE_FRAMES: PipelineFrame[] = [
  {
    step: 1,
    stageStatuses: statuses({ html: "active", css: "active" }),
    description:
      "The browser receives the raw HTML and CSS source over the network — nothing has been parsed yet.",
  },
  {
    step: 2,
    stageStatuses: statuses({ html: "done", dom: "active", css: "done", cssom: "active" }),
    description:
      "The HTML parser builds the DOM tree while the CSS parser builds the CSSOM, at the same time, on two independent tracks.",
  },
  {
    step: 3,
    stageStatuses: statuses({ html: "done", dom: "done", css: "done", cssom: "done" }),
    description:
      "Both trees are complete. The DOM has a node for every HTML element; the CSSOM has a rule for every selector, including the one that hides .ad.",
  },
  {
    step: 4,
    stageStatuses: statuses({
      html: "done",
      dom: "done",
      css: "done",
      cssom: "done",
      "render-tree": "active",
    }),
    description:
      "DOM and CSSOM merge into the Render Tree. Only elements that will actually be painted make it through — aside.ad is excluded because of display: none.",
  },
  {
    step: 5,
    stageStatuses: statuses({
      html: "done",
      dom: "done",
      css: "done",
      cssom: "done",
      "render-tree": "done",
      layout: "active",
    }),
    description:
      "Layout (Reflow) calculates the exact size and position of every box that survived the Render Tree.",
  },
  {
    step: 6,
    stageStatuses: statuses({
      html: "done",
      dom: "done",
      css: "done",
      cssom: "done",
      "render-tree": "done",
      layout: "done",
      paint: "active",
    }),
    description: "Paint fills in the pixels for each box — text, color, borders — onto separate layers.",
  },
  {
    step: 7,
    stageStatuses: statuses({
      html: "done",
      dom: "done",
      css: "done",
      cssom: "done",
      "render-tree": "done",
      layout: "done",
      paint: "done",
      composite: "active",
    }),
    description:
      "Composite flattens every painted layer into the final image — this is what actually shows up on screen.",
  },
];

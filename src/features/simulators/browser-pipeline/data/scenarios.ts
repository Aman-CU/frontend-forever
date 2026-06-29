import type {
  LayoutBox,
  PageBox,
  PipelineFrame,
  PipelineScenario,
  StageStatuses,
  TreeNode,
} from "../types";

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

// The 4 boxes that actually survive the Render Tree (aside.ad excluded,
// body/main treated as non-content wrappers) — same "simplify for the Hero
// version" precedent as react-rendering's generic div/h2/button mockup.
export const LAYOUT_BOXES: LayoutBox[] = [
  { id: "header", label: "header", widthPercent: 100, height: 22 },
  { id: "h1", label: "h1", widthPercent: 55, height: 20 },
  { id: "intro", label: "p.intro", widthPercent: 78, height: 16 },
  { id: "footer", label: "footer", widthPercent: 100, height: 14 },
];

// The final painted page for scenario 1 — aside.ad never appears (display:none
// removed it before Layout).
const PAGE_BOXES: PageBox[] = [
  { id: "header", label: "Frontend Forever", variant: "title" },
  { id: "h1", label: "Learn by Doing", variant: "heading" },
  { id: "intro", label: "Simulators teach concepts.", variant: "accent" },
  { id: "footer", label: "© 2026 Frontend Forever", variant: "muted" },
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

// ── Scenario 2 — visibility: hidden ────────────────────────────────────────
// Same page as scenario 1, but the .ad rule uses visibility: hidden instead of
// display: none. The contrast is the whole lesson: visibility: hidden keeps the
// element in the Render Tree and gives it a layout box (it reserves space) —
// it's just painted blank. display: none drops it before Layout entirely.
const CSS_SOURCE_VISIBILITY = `body { font-family: sans-serif; }
header { font-weight: bold; }
.intro { color: teal; }
.ad { visibility: hidden; }
footer { font-size: 12px; color: gray; }`;

// Same shape as DOM_TREE, but aside.ad is flagged hidden (kept, painted blank)
// rather than excluded (dropped).
const RENDER_TREE_VISIBILITY: TreeNode = {
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
        { id: "ad", label: "aside.ad", hidden: true },
      ],
    },
    { id: "footer", label: "footer" },
  ],
};

// The hidden box still reserves space, so it appears in Layout — unlike
// scenario 1, where aside.ad never made it this far.
const LAYOUT_BOXES_VISIBILITY: LayoutBox[] = [
  { id: "header", label: "header", widthPercent: 100, height: 22 },
  { id: "h1", label: "h1", widthPercent: 55, height: 20 },
  { id: "intro", label: "p.intro", widthPercent: 78, height: 16 },
  { id: "ad", label: "aside.ad", widthPercent: 90, height: 16, hidden: true },
  { id: "footer", label: "footer", widthPercent: 100, height: 14 },
];

const PAGE_BOXES_VISIBILITY: PageBox[] = [
  { id: "header", label: "Frontend Forever", variant: "title" },
  { id: "h1", label: "Learn by Doing", variant: "heading" },
  { id: "intro", label: "Simulators teach concepts.", variant: "accent" },
  { id: "ad", label: "Ad banner", variant: "muted", hidden: true },
  { id: "footer", label: "© 2026 Frontend Forever", variant: "muted" },
];

const VISIBILITY_FRAMES: PipelineFrame[] = [
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
      "Both trees are complete. This time the .ad rule sets visibility: hidden, not display: none.",
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
      "DOM and CSSOM merge. aside.ad is kept this time — visibility: hidden still produces a box, it's just painted blank.",
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
      "Layout sizes and positions every box, including the hidden one — visibility: hidden still reserves its space.",
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
    description:
      "Paint fills in the pixels for each box, but the hidden box's content is skipped — its space stays blank.",
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
      "Composite flattens the layers. The ad's space is reserved but invisible — unlike display: none, which removes it entirely.",
  },
];

export const PIPELINE_SCENARIOS: PipelineScenario[] = [
  {
    id: "display-none",
    label: "display: none",
    frames: PIPELINE_FRAMES,
    htmlSource: HTML_SOURCE,
    cssSource: CSS_SOURCE,
    domTree: DOM_TREE,
    cssomTree: CSSOM_TREE,
    renderTree: RENDER_TREE,
    layoutBoxes: LAYOUT_BOXES,
    pageBoxes: PAGE_BOXES,
    renderTreeCaption: "DOM + CSSOM merge, display:none excluded",
    insight: {
      title: "The Render Tree is not the DOM.",
      body: "Elements with display: none never get a box — they're excluded entirely, before Layout ever runs.",
    },
  },
  {
    id: "visibility-hidden",
    label: "visibility: hidden",
    frames: VISIBILITY_FRAMES,
    htmlSource: HTML_SOURCE,
    cssSource: CSS_SOURCE_VISIBILITY,
    domTree: DOM_TREE,
    cssomTree: CSSOM_TREE,
    renderTree: RENDER_TREE_VISIBILITY,
    layoutBoxes: LAYOUT_BOXES_VISIBILITY,
    pageBoxes: PAGE_BOXES_VISIBILITY,
    renderTreeCaption: "DOM + CSSOM merge, visibility:hidden kept",
    insight: {
      title: "visibility: hidden still takes up space.",
      body: "Unlike display: none, a hidden element stays in the Render Tree and gets a layout box — it's just painted blank.",
    },
  },
];

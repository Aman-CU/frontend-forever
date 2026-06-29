import type { RenderFrame, RenderScenario } from "../types";

// Each frame is the complete resultant state for that step — the hook just
// indexes into this array, never derives a frame from the previous one.
// Same "step scripts are the source of truth" invariant as event-loop's
// EVENT_LOOP_FRAMES. cardStatuses drives which of the 5 stage cards has
// already revealed its real content ("done"/"active") vs is still a
// placeholder ("pending") — this is what makes stepping through actually
// build something up, rather than just moving a highlight over a finished
// diagram.
export const RENDER_FRAMES: RenderFrame[] = [
  {
    step: 1,
    cardStatuses: {
      "component-state": "active",
      "render-phase": "pending",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 0,
    realDomCount: 0,
    description: "The user clicks Increment.",
  },
  {
    step: 2,
    cardStatuses: {
      "component-state": "active",
      "render-phase": "pending",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description:
      "Counter's state updates to 1 internally. React schedules a re-render — the screen hasn't repainted yet.",
  },
  {
    step: 3,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "active",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description:
      "React re-renders the component to figure out what the new UI should look like.",
  },
  {
    step: 4,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "active",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description: "React builds a new Virtual DOM tree from the render output.",
  },
  {
    step: 5,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "done",
      diffing: "active",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description:
      "React compares the new Virtual DOM tree to the previous one and finds exactly one changed node.",
  },
  {
    step: 6,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "done",
      diffing: "done",
      "real-dom": "active",
    },
    componentStateCount: 1,
    realDomCount: 1,
    description: "React updates only that one changed node in the real DOM.",
  },
];

// Scenario 2 — wasted child re-render. A Parent's state changes, so React re-runs
// the Parent AND its Child render function (default behaviour, no memo). But the
// Child's output is identical, so diffing skips it and only Parent's DOM node is
// patched. The lesson: re-rendering (running the render function) is not the same
// as updating the DOM. Same 6-stage shape, but its visuals are a Parent→Child
// component tree (ComponentTreeView), not the counter trees.
const WASTED_RENDER_FRAMES: RenderFrame[] = [
  {
    step: 1,
    cardStatuses: {
      "component-state": "active",
      "render-phase": "pending",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 0,
    realDomCount: 0,
    description: "The user clicks Like on the Parent component.",
  },
  {
    step: 2,
    cardStatuses: {
      "component-state": "active",
      "render-phase": "pending",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description: "Parent's state updates to 1. React schedules a re-render — the screen hasn't repainted yet.",
  },
  {
    step: 3,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "active",
      "virtual-dom": "pending",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description:
      "React re-renders Parent — and re-runs Child too, even though Child's data never changed.",
  },
  {
    step: 4,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "active",
      diffing: "pending",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description: "A new Virtual DOM is built for both Parent and Child.",
  },
  {
    step: 5,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "done",
      diffing: "active",
      "real-dom": "pending",
    },
    componentStateCount: 1,
    realDomCount: 0,
    description:
      "Diffing finds only Parent's number changed. Child's output is identical, so it's skipped.",
  },
  {
    step: 6,
    cardStatuses: {
      "component-state": "done",
      "render-phase": "done",
      "virtual-dom": "done",
      diffing: "done",
      "real-dom": "active",
    },
    componentStateCount: 1,
    realDomCount: 1,
    description:
      "Only Parent's DOM node is patched. Child re-rendered, but its DOM was never touched.",
  },
];

export const RENDER_SCENARIOS: RenderScenario[] = [
  {
    id: "single-update",
    label: "Single update",
    kind: "dom-update",
    frames: RENDER_FRAMES,
    targetCount: 1,
    componentLabel: "Counter Component",
    stateLabel: "count",
    clickLabel: "Increment",
    childLabel: "",
    captionSubtexts: {
      "component-state": "Click Increment",
      "render-phase": "count becomes 1",
      "virtual-dom": "Virtual DOM created",
      diffing: "Only changed node detected",
      "real-dom": "Only the changed node updated",
    },
    insight: {
      title: "React does not update the entire page.",
      body: "React compares changes first, then updates only what changed.",
    },
  },
  {
    id: "wasted-render",
    label: "Wasted child re-render",
    kind: "wasted-render",
    frames: WASTED_RENDER_FRAMES,
    targetCount: 1,
    componentLabel: "Parent Component",
    stateLabel: "likes",
    clickLabel: "Like",
    childLabel: "Avatar",
    captionSubtexts: {
      "component-state": "Click Like",
      "render-phase": "Parent + Child both re-run",
      "virtual-dom": "New Virtual DOM created",
      diffing: "Child skipped — no change",
      "real-dom": "Only Parent's DOM patched",
    },
    insight: {
      title: "Re-rendering is not the same as updating the DOM.",
      body: "The Child re-ran, but because its output didn't change, React left its DOM untouched.",
    },
  },
];

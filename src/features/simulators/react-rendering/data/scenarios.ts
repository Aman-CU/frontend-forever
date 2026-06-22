import type { RenderFrame } from "../types";

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

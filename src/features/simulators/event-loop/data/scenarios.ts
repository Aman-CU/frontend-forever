import type { ExecutionOrderEntry, SimulatorFrame } from "../types";

// Pre-scripted, not real JS execution — see architecture.md "Simulator
// Architecture". Each frame is the full resultant panel state after that
// step, authored directly as data so the engine never has to derive a step's
// display from runtime logic.
//
// Real event-loop semantics this scenario follows (confirmed with the user
// before implementing — see progress-tracker.md Feature 09 follow-ups):
// - Code only ever executes on the Call Stack. A queue is a waiting room —
//   nothing is ever shown "Executing..." while still inside a queue array.
// - setTimeout's callback is queued into the Task Queue as soon as its timer
//   fires (here, instantly for a 0ms delay) — independent of whether the
//   main script is still running. It only waits in the Task Queue until the
//   Call Stack is free.
// - Promise.resolve().then(...) here stands in for a real async Web API
//   call (e.g. fetch) rather than a literal synchronous-resolving Promise,
//   so it also makes a Web APIs stop before its callback reaches the
//   Microtask Queue — same shape as setTimeout's path, just a different
//   queue at the end.
// - Once the Call Stack empties, the event loop always drains the entire
//   Microtask Queue before it looks at the Task Queue at all.
export const EVENT_LOOP_FRAMES: SimulatorFrame[] = [
  {
    step: 1,
    callStack: [{ code: "console.log('start')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: [],
    activeCodeLines: [1],
  },
  {
    step: 2,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [1],
  },
  {
    step: 3,
    callStack: [],
    webAPIs: [{ code: "setTimeout(() => {...}, 0)", status: "Timer started" }],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [3, 5],
  },
  {
    // The 0ms timer fires instantly — the callback moves into the Task
    // Queue right away, well before the synchronous script even finishes.
    step: 4,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [3, 5],
  },
  {
    // Promise.resolve().then(...) stands in for an async Web API call
    // (e.g. fetch) — it registers with Web APIs first, same shape as
    // setTimeout, rather than resolving straight into the Microtask Queue.
    step: 5,
    callStack: [],
    webAPIs: [{ code: "Promise.resolve().then(...)", status: "Pending..." }],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [7, 9],
  },
  {
    step: 6,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [7, 9],
  },
  {
    step: 7,
    callStack: [{ code: "console.log('end')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [11],
  },
  {
    step: 8,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end"],
    activeCodeLines: [11],
  },
  {
    // The Call Stack is empty — the event loop drains the entire Microtask
    // Queue before it ever looks at the Task Queue.
    step: 9,
    callStack: [{ code: "console.log('promise')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end"],
    activeCodeLines: [8],
  },
  {
    step: 10,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end", "promise"],
    activeCodeLines: [8],
  },
  {
    // Microtask Queue is empty now — only then does the event loop check
    // the Task Queue.
    step: 11,
    callStack: [{ code: "console.log('timeout')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end", "promise"],
    activeCodeLines: [4],
  },
  {
    step: 12,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end", "promise", "timeout"],
    activeCodeLines: [4],
  },
];

export const EXECUTION_ORDER_BY_OUTPUT: Record<string, ExecutionOrderEntry> = {
  start: { code: "console.log('start')", theme: "premium" },
  end: { code: "console.log('end')", theme: "premium" },
  promise: { code: "Promise.then(...)", theme: "info" },
  timeout: { code: "setTimeout(...)", theme: "streak" },
};

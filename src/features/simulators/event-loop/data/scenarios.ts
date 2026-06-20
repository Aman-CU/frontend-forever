import type { ExecutionOrderEntry, SimulatorFrame } from "../types";

// Pre-scripted, not real JS execution — see architecture.md "Simulator
// Architecture". Each frame is the full resultant panel state after that
// step, authored directly as data so the engine never has to derive a step's
// display from runtime logic.
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
    step: 4,
    callStack: [],
    webAPIs: [
      { code: "setTimeout(() => {...}, 0)", status: "Timer started" },
      { code: "Promise.resolve().then(...)", status: "Promise resolved" },
    ],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [7, 9],
  },
  {
    step: 5,
    callStack: [{ code: "console.log('end')", status: "Executing..." }],
    webAPIs: [
      { code: "setTimeout(() => {...}, 0)", status: "Timer started" },
      { code: "Promise.resolve().then(...)", status: "Promise resolved" },
    ],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [11],
  },
  {
    step: 6,
    callStack: [],
    webAPIs: [
      { code: "setTimeout(() => {...}, 0)", status: "Timer started" },
      { code: "Promise.resolve().then(...)", status: "Promise resolved" },
    ],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end"],
    activeCodeLines: [11],
  },
  {
    // The microtask queue only ever holds the callback while it waits — the
    // event loop dequeues it onto the Call Stack before it actually runs,
    // same as every other "Executing..." frame in this scenario.
    step: 7,
    callStack: [{ code: "console.log('promise')", status: "Executing..." }],
    webAPIs: [{ code: "setTimeout(() => {...}, 0)", status: "Timer started" }],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end", "promise"],
    activeCodeLines: [8],
  },
  {
    step: 8,
    callStack: [{ code: "console.log('timeout')", status: "Executing..." }],
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

import type { CodeLine, CodeToken, EventLoopScenario, SimulatorFrame } from "../types";

// Pre-scripted, not real JS execution — see architecture.md "Simulator
// Architecture". Each frame is the full resultant panel state after that step,
// authored directly as data so the engine never derives a step's display from
// runtime logic.
//
// Real event-loop semantics every scenario here follows (confirmed with the
// user — see progress-tracker.md Feature 09 follow-ups):
// - Code only ever executes on the Call Stack. A queue is a waiting room.
// - A callback enters its queue the moment it's ready, independent of whether
//   the main script is still running; it only waits there until the stack frees.
// - Once the Call Stack empties, the entire Microtask Queue drains before the
//   Task Queue is checked at all.

// Token helpers — keep the code arrays readable. Each colour maps to one design
// token class in CodePanel.
const fn = (text: string): CodeToken => ({ text, color: "fn" });
const str = (text: string): CodeToken => ({ text, color: "str" });
const num = (text: string): CodeToken => ({ text, color: "num" });
const p = (text: string): CodeToken => ({ text, color: "plain" });
const BLANK: CodeLine = { tokens: [] };

// ── Scenario 1 — setTimeout vs Promise.then ────────────────────────────────
const PROMISE_TIMEOUT_CODE: CodeLine[] = [
  { tokens: [fn("console.log"), p("("), str("'start'"), p(");")] },
  BLANK,
  { tokens: [fn("setTimeout"), p("(() => {")] },
  { tokens: [fn("console.log"), p("("), str("'timeout'"), p(");")], indent: 1 },
  { tokens: [p("}, "), num("0"), p(");")] },
  BLANK,
  { tokens: [fn("Promise.resolve"), p("()."), fn("then"), p("(() => {")] },
  { tokens: [fn("console.log"), p("("), str("'promise'"), p(");")], indent: 1 },
  { tokens: [p("});")] },
  BLANK,
  { tokens: [fn("console.log"), p("("), str("'end'"), p(");")] },
];

const PROMISE_TIMEOUT_FRAMES: SimulatorFrame[] = [
  {
    step: 1,
    callStack: [{ code: "console.log('start')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: [],
    activeCodeLines: [1],
    description: "console.log('start') is executing on the call stack.",
  },
  {
    step: 2,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [1],
    description: "'start' was printed to the console. The call stack is now empty.",
  },
  {
    step: 3,
    callStack: [],
    webAPIs: [{ code: "setTimeout(() => {...}, 0)", status: "Timer started" }],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start"],
    activeCodeLines: [3, 5],
    description: "setTimeout registers its timer with the Web APIs.",
  },
  {
    step: 4,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [3, 5],
    description:
      "The timer fires immediately. The timeout callback moves into the task queue and waits.",
  },
  {
    step: 5,
    callStack: [],
    webAPIs: [{ code: "Promise.resolve().then(...)", status: "Pending..." }],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [7, 9],
    description:
      "The promise call registers with the Web APIs, standing in for an async request like fetch.",
  },
  {
    step: 6,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [7, 9],
    description: "The promise resolves. Its callback moves into the microtask queue and waits.",
  },
  {
    step: 7,
    callStack: [{ code: "console.log('end')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start"],
    activeCodeLines: [11],
    description: "console.log('end') is executing on the call stack.",
  },
  {
    step: 8,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "Promise.resolve().then(...)", status: "Waiting..." }],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end"],
    activeCodeLines: [11],
    description:
      "'end' was printed to the console. The call stack is empty, but both queues are still waiting.",
  },
  {
    step: 9,
    callStack: [{ code: "console.log('promise')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end"],
    activeCodeLines: [8],
    description:
      "The event loop drains the microtask queue first. The promise callback moves to the call stack and executes.",
  },
  {
    step: 10,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [{ code: "setTimeout(() => {...}, 0)", status: "Waiting..." }],
    consoleOutput: ["start", "end", "promise"],
    activeCodeLines: [8],
    description: "'promise' was printed to the console. The microtask queue is now empty.",
  },
  {
    step: 11,
    callStack: [{ code: "console.log('timeout')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end", "promise"],
    activeCodeLines: [4],
    description:
      "With the microtask queue empty, the event loop checks the task queue. The timeout callback moves to the call stack and executes.",
  },
  {
    step: 12,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["start", "end", "promise", "timeout"],
    activeCodeLines: [4],
    description:
      "'timeout' was printed to the console. The task queue is empty and this run is complete.",
  },
];

// ── Scenario 2 — async / await ─────────────────────────────────────────────
// Everything up to the first await runs synchronously; the remainder of the
// async function resumes as a microtask. Output order: A, B, D, C. No
// setTimeout here, so the Task Queue stays empty throughout — the whole point
// is that await is microtask-based.
const ASYNC_AWAIT_CODE: CodeLine[] = [
  { tokens: [fn("console.log"), p("("), str("'A'"), p(");")] },
  { tokens: [fn("load"), p("();")] },
  { tokens: [fn("console.log"), p("("), str("'D'"), p(");")] },
  BLANK,
  { tokens: [p("async function "), fn("load"), p("() {")] },
  { tokens: [fn("console.log"), p("("), str("'B'"), p(");")], indent: 1 },
  { tokens: [p("await "), fn("Promise.resolve"), p("();")], indent: 1 },
  { tokens: [fn("console.log"), p("("), str("'C'"), p(");")], indent: 1 },
  { tokens: [p("}")] },
];

const ASYNC_AWAIT_FRAMES: SimulatorFrame[] = [
  {
    step: 1,
    callStack: [{ code: "console.log('A')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: [],
    activeCodeLines: [1],
    description: "console.log('A') runs first, synchronously.",
  },
  {
    step: 2,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A"],
    activeCodeLines: [1],
    description: "'A' is printed. The call stack is clear for the next statement.",
  },
  {
    step: 3,
    callStack: [{ code: "load()", status: "Running" }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A"],
    activeCodeLines: [2, 5],
    description: "load() is called and starts running synchronously.",
  },
  {
    step: 4,
    callStack: [
      { code: "load()", status: "Running" },
      { code: "console.log('B')", status: "Executing..." },
    ],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A"],
    activeCodeLines: [6],
    description: "Everything up to the first await runs synchronously — console.log('B') executes.",
  },
  {
    step: 5,
    callStack: [{ code: "load()", status: "Running" }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A", "B"],
    activeCodeLines: [6],
    description: "'B' is printed. load() continues to the await.",
  },
  {
    step: 6,
    callStack: [],
    webAPIs: [{ code: "await Promise.resolve()", status: "Pending..." }],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A", "B"],
    activeCodeLines: [7],
    description: "await suspends load() and pops it off the call stack. Its promise is pending.",
  },
  {
    step: 7,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "resume load() → 'C'", status: "Waiting..." }],
    taskQueue: [],
    consoleOutput: ["A", "B"],
    activeCodeLines: [7],
    description:
      "The awaited promise resolves. Resuming load() is queued as a microtask — it does not run yet.",
  },
  {
    step: 8,
    callStack: [{ code: "console.log('D')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [{ code: "resume load() → 'C'", status: "Waiting..." }],
    taskQueue: [],
    consoleOutput: ["A", "B"],
    activeCodeLines: [3],
    description:
      "Synchronous code keeps running first: console.log('D') executes while the microtask waits.",
  },
  {
    step: 9,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [{ code: "resume load() → 'C'", status: "Waiting..." }],
    taskQueue: [],
    consoleOutput: ["A", "B", "D"],
    activeCodeLines: [3],
    description: "'D' is printed. The call stack is finally empty.",
  },
  {
    step: 10,
    callStack: [{ code: "console.log('C')", status: "Executing..." }],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A", "B", "D"],
    activeCodeLines: [8],
    description:
      "Now the stack is empty, the microtask resumes load() and runs console.log('C').",
  },
  {
    step: 11,
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    taskQueue: [],
    consoleOutput: ["A", "B", "D", "C"],
    activeCodeLines: [8],
    description: "'C' is printed last. Everything after await ran as a microtask.",
  },
];

export const EVENT_LOOP_SCENARIOS: EventLoopScenario[] = [
  {
    id: "promise-vs-timeout",
    label: "Promise vs setTimeout",
    code: PROMISE_TIMEOUT_CODE,
    frames: PROMISE_TIMEOUT_FRAMES,
    executionOrderByOutput: {
      start: { code: "console.log('start')", theme: "premium" },
      end: { code: "console.log('end')", theme: "premium" },
      promise: { code: "console.log('promise')", theme: "info" },
      timeout: { code: "console.log('timeout')", theme: "streak" },
    },
    insight: {
      title: "Microtasks run before tasks.",
      body: "That's why the Promise.then callback runs before the setTimeout callback, even though the timer fired first.",
    },
  },
  {
    id: "async-await",
    label: "async / await",
    code: ASYNC_AWAIT_CODE,
    frames: ASYNC_AWAIT_FRAMES,
    executionOrderByOutput: {
      A: { code: "console.log('A')", theme: "premium" },
      B: { code: "console.log('B')", theme: "premium" },
      D: { code: "console.log('D')", theme: "premium" },
      C: { code: "console.log('C')", theme: "info" },
    },
    insight: {
      title: "Code after await runs as a microtask.",
      body: "Everything up to the first await runs synchronously. The rest of the function resumes only once the call stack is empty.",
    },
  },
];

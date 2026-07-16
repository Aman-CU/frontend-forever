import type { CollectionQuestionSeed } from "../types";

// 2 of the 6 approved pilot answers (interview-prep-content-guide.md, approved
// 2026-07-14) — the remaining ~99 FF JavaScript questions are a separate
// content-authoring pass, tracked in that same file's Status section.
//
// `what-is-the-event-loop`'s orderIndex is kept at 4 (not the pilot's
// original 2) to stay consistent with the full JS collection's already-
// seeded DB state from content/ff-javascript-questions, since the Supabase
// database is shared across local branches (not branch-scoped) — this
// avoids a `(collection, order_index)` unique-constraint collision on seed.
// Same fix already applied on content/ff-react-questions for the same
// reason.
export const FF_JAVASCRIPT_COLLECTION_QUESTIONS: CollectionQuestionSeed[] = [
  {
    collection: "ff-javascript",
    slug: "var-let-const-differences",
    question: "What is the difference between `var`, `let`, and `const`?",
    answer: `\`var\` is function-scoped and hoisted with an initial value of \`undefined\`; \`let\` and \`const\` are block-scoped and stay uninitialized in the "temporal dead zone" until their declaration line runs. \`const\` additionally forbids reassigning the binding (though it doesn't make the value itself immutable).

### Scope

\`\`\`js
function example() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  console.log(a); // 1 — var leaked out of the if block
  console.log(b); // ReferenceError — let is block-scoped
}
\`\`\`

\`var\` only respects function boundaries, not block boundaries (\`if\`, \`for\`, \`{}\`). \`let\`/\`const\` respect both.

### Hoisting and the Temporal Dead Zone

All three are hoisted to the top of their scope, but differently:

| | Hoisted as | Accessible before declaration? |
|---|---|---|
| \`var\` | \`undefined\` | Yes — reads as \`undefined\`, no error |
| \`let\` | uninitialized | No — throws \`ReferenceError\` (temporal dead zone) |
| \`const\` | uninitialized | No — throws \`ReferenceError\` (temporal dead zone) |

### Reassignment vs. mutation

\`const\` blocks reassigning the *binding*, not mutating the *value*:

\`\`\`js
const arr = [1, 2, 3];
arr.push(4);       // fine — mutating the array
arr = [5, 6];       // TypeError — reassigning the binding
\`\`\`

### The practical rule

Default to \`const\`. Use \`let\` only when a variable genuinely needs reassignment (loop counters, accumulators). Avoid \`var\` in new code — its function-scoping and silent hoisting are the source of a whole class of classic JS bugs (loop-variable-capture in closures being the most common interview follow-up to this exact question).

**Related:** [Hoisting & the Temporal Dead Zone](/learn/javascript-runtime/hoisting-temporal-dead-zone) (Learn concept) · [What are closures and how do they work?](/learn/javascript-runtime/closures) · What is the Temporal Dead Zone (TDZ)?`,
    difficulty: "easy",
    companies: ["Google", "Meta", "Amazon"],
    orderIndex: 1,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-the-event-loop",
    question: "What is the event loop in JavaScript?",
    answer: `JavaScript runs on a single thread, so the event loop is the mechanism that lets it handle asynchronous work — timers, network requests, user input — without blocking. It continuously checks whether the call stack is empty; whenever it is, it fully drains the microtask queue, then takes exactly one task from the macrotask queue, runs it to completion, and repeats.

### The three moving parts

- **Call stack** — synchronous code executes here, one frame at a time
- **Microtask queue** — Promise \`.then\`/\`.catch\`/\`.finally\` callbacks, \`queueMicrotask\`
- **Macrotask queue** — \`setTimeout\`, \`setInterval\`, I/O callbacks, UI events

### The rule that trips people up in interviews

The microtask queue is drained **completely** — every microtask, including ones a running microtask itself adds — before the loop even looks at the macrotask queue again. This is why \`Promise.resolve().then()\` always runs before \`setTimeout(fn, 0)\`, no matter the order they were called in.

\`\`\`js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
\`\`\`

### Common follow-up: why does this matter?

Blocking the call stack for even a few hundred milliseconds freezes the entire page — no scrolling, no clicks, no repaints. Understanding the event loop is really understanding *why* long synchronous work (a huge \`for\` loop, a heavy \`JSON.parse\`) is a real performance bug, not just a style issue.

**Related:** [Promises & Async/Await](/learn/javascript-runtime/promises-async-await) · What is microtask queue vs macrotask queue? · [Event Loop](/learn/javascript-runtime/event-loop) (Learn concept + full simulator) · [Debouncing & Throttling](/learn/javascript-runtime/debouncing-throttling)`,
    difficulty: "hard",
    companies: ["Google", "Amazon", "Netflix"],
    orderIndex: 4,
  },
];

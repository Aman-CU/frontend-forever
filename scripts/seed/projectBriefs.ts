import type { ProjectBriefSeed } from "./types";

export const PROJECT_BRIEFS: ProjectBriefSeed[] = [
  {
    slug: "kanban-board",
    conceptSlug: "react-rendering",
    title: "Build a Kanban Board",
    description: `Build the reordering engine behind a **Kanban board** — drag a card between columns and it has to land in exactly the right spot, without ever mutating state directly.

## The problem

A Kanban board's core interaction is deceptively fiddly: drag a card from "In Progress" to "Done," or reorder cards within the same column, and the board's state has to update immutably — React re-renders correctly only when it gets a **new** object, not a mutated one.

## The idea

Every drag-and-drop library (\`@dnd-kit\`, \`react-beautiful-dnd\`) eventually calls something like this underneath: given the current columns, where a card came from, where it's going, and what index it should land at — compute the **next** state.

## Your task

Write \`moveCard(columns, fromColumn, toColumn, cardId, toIndex)\` that returns a **new** \`columns\` object with \`cardId\` removed from \`fromColumn\` and inserted into \`toColumn\` at \`toIndex\`:

- never mutate the input \`columns\` object or its arrays
- moving within the same column (\`fromColumn === toColumn\`) reorders it
- clamp \`toIndex\` to \`[0, destination.length]\` so an out-of-range drop still lands somewhere sane

\`\`\`js
moveCard({ todo: ['a', 'b'], doing: [] }, 'todo', 'doing', 'a', 0)
// { todo: ['b'], doing: ['a'] }
\`\`\`

> **Why immutability matters here:** React's reconciliation compares by reference. If \`moveCard\` mutated the original \`columns\` object instead of returning a new one, every column would look "unchanged" to React and the board would silently fail to re-render.

Wire this into a real board with 3 columns and drag-and-drop once it passes — that's the project.`,
    starterCode: `function moveCard(columns, fromColumn, toColumn, cardId, toIndex) {
  // return a NEW columns object — don't mutate \`columns\` or its arrays
}`,
    solutionCode: `function moveCard(columns, fromColumn, toColumn, cardId, toIndex) {
  const source = columns[fromColumn].filter((id) => id !== cardId);
  const destinationBase = fromColumn === toColumn ? source : columns[toColumn];
  const clampedIndex = Math.max(0, Math.min(toIndex, destinationBase.length));
  const destination = [
    ...destinationBase.slice(0, clampedIndex),
    cardId,
    ...destinationBase.slice(clampedIndex),
  ];
  if (fromColumn === toColumn) {
    return { ...columns, [fromColumn]: destination };
  }
  return { ...columns, [fromColumn]: source, [toColumn]: destination };
}`,
    testCases: [
      {
        input: "moveCard({ todo: ['a','b'], doing: [] }, 'todo', 'doing', 'a', 0)",
        expected: "{ todo: ['b'], doing: ['a'] }",
        label: "Moves a card to a different column",
      },
      {
        input: "moveCard({ todo: ['a','b','c'] }, 'todo', 'todo', 'c', 0)",
        expected: "{ todo: ['c','a','b'] }",
        label: "Reorders within the same column",
      },
      {
        input: "the original columns object, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input",
      },
      {
        input: "toIndex: 99 on a 2-card destination column",
        expected: "clamped to the end",
        label: "Clamps an out-of-range index to the end",
      },
    ],
    isPremium: false,
    orderIndex: 1,
  },

  {
    slug: "async-task-runner",
    conceptSlug: "event-loop",
    title: "Build an Async Task Runner",
    description: `Build a small **concurrency-limited task runner** — the pattern behind every "upload these 200 files, but only 4 at a time" feature.

## The problem

Fire off 200 \`fetch()\` calls at once and you'll flood the network (and often hit the browser's own per-host connection limit). Run them one at a time with a \`for\` loop and \`await\` and you'll be waiting far longer than necessary. Real apps need something in between.

## The idea

A concurrency-limited runner keeps exactly \`limit\` tasks in flight at any moment. The moment one finishes, the next queued task starts — no more, no less. This leans directly on how the event loop schedules microtasks: each "worker" is really just a loop that keeps \`await\`-ing the next task from a shared queue.

## Your task

Write \`async runWithConcurrency(tasks, limit)\` where \`tasks\` is an array of functions, each returning a Promise:

- run at most \`limit\` tasks at the same time
- return an array of results in the **same order as \`tasks\`** — not the order they finished in
- resolve only once every task has settled

\`\`\`js
const tasks = [() => fetch('/a'), () => fetch('/b'), () => fetch('/c')];
await runWithConcurrency(tasks, 2); // only 2 requests in flight at once
\`\`\`

> **Why order matters:** two tasks started at the same time can resolve in either order depending on network timing. The caller shouldn't have to guess — \`runWithConcurrency\` must always hand back results indexed the same way \`tasks\` was.

Once this passes, use it to build a small "upload queue" UI showing live progress per file.`,
    starterCode: `async function runWithConcurrency(tasks, limit) {
  // run at most \`limit\` tasks concurrently; return results in the same
  // order as \`tasks\`, once every task has settled
}`,
    solutionCode: `async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const current = nextIndex++;
      results[current] = await tasks[current]();
    }
  }

  const workerCount = Math.min(limit, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}`,
    testCases: [
      {
        input: "3 tasks with different delays, limit 3",
        expected: "results in original order",
        label: "Returns results in original order",
      },
      {
        input: "6 tasks, limit 2",
        expected: "never more than 2 running at once",
        label: "Never runs more than `limit` tasks concurrently",
      },
      {
        input: "5 tasks, limit 2",
        expected: "all 5 tasks eventually run",
        label: "Runs all tasks, not just the first `limit`",
      },
      {
        input: "one task with a much longer delay",
        expected: "awaited before the runner resolves",
        label: "Resolves once every task settles",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "render-blocking-analyzer",
    conceptSlug: "browser-rendering-pipeline",
    title: "Build a Render-Blocking Resource Analyzer",
    description: `Build the logic behind a Lighthouse-style audit: given a page's resources, which ones are actually **blocking the first paint**?

## The problem

Every stylesheet and script a page loads can silently delay the first pixel on screen. Knowing *which* resources are the real offenders — rather than "just add \`defer\` to everything and hope" — is the first step to fixing a slow page.

## The idea

Two resource types can block rendering, each with its own escape hatch:

- **Stylesheets** block by default — unless a \`media\` attribute (like \`print\`) means the current context doesn't need them right away
- **Scripts** block by default — unless they carry \`async\` or \`defer\`, which let HTML parsing continue without waiting for them

## Your task

Write \`getRenderBlockingResources(resources)\` — given an array of \`{ type: 'script' | 'style', src, async?, defer?, media? }\` objects, return only the ones that actually block the initial render:

- a \`style\` resource blocks unless \`media\` is set and isn't \`'screen'\`/\`'all'\`
- a \`script\` resource blocks unless \`async\` or \`defer\` is \`true\`

\`\`\`js
getRenderBlockingResources([
  { type: 'style', src: 'print.css', media: 'print' },
  { type: 'script', src: 'analytics.js', async: true },
  { type: 'script', src: 'app.js' },
])
// → [{ type: 'script', src: 'app.js' }]
\`\`\`

> **Why this matters in real audits:** this exact classification is what tools like Lighthouse use to flag "eliminate render-blocking resources" — the fix is almost always adding \`defer\`/\`async\`, or scoping a stylesheet's \`media\` so it isn't render-blocking for the common case.

Once this passes, feed it a real page's resource list (from the Network tab) and render the blocking ones as a warning list.`,
    starterCode: `function getRenderBlockingResources(resources) {
  // return only the resources that block the initial render
}`,
    solutionCode: `function getRenderBlockingResources(resources) {
  return resources.filter((resource) => {
    if (resource.type === "style") {
      const nonBlockingMedia = resource.media && resource.media !== "screen" && resource.media !== "all";
      return !nonBlockingMedia;
    }
    if (resource.type === "script") {
      return !resource.async && !resource.defer;
    }
    return false;
  });
}`,
    testCases: [
      {
        input: "a plain style resource with no media",
        expected: "blocks rendering",
        label: "A plain stylesheet blocks rendering",
      },
      {
        input: "media: 'print'",
        expected: "does not block rendering",
        label: "A print-only stylesheet does not block rendering",
      },
      {
        input: "a script with no async/defer",
        expected: "blocks rendering",
        label: "A synchronous script blocks rendering",
      },
      {
        input: "async: true or defer: true",
        expected: "does not block rendering",
        label: "async/defer scripts do not block rendering",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "specificity-conflict-finder",
    conceptSlug: "css-specificity",
    title: "Build a Specificity Conflict Finder",
    description: `Build a small linter that catches CSS's most common silent bug: a rule that can **never win**, no matter where you put it in the file.

## The problem

You add a rule, refresh the page, and nothing changes. Nine times out of ten, an earlier (or later, tie-broken) rule with equal-or-higher specificity is already winning that property — and nothing tells you that except trial and error in DevTools.

## The idea

Walk a stylesheet's rules in source order, tracking the current specificity "winner" for each CSS property. A rule is dead on arrival if an existing winner for that property already beats — or ties — it (ties go to the later rule in the real cascade, so a tie replaces the winner rather than losing to it).

## Your task

Write \`specificity(selector)\` (same \`[id, class, element]\` scoring as the CSS Specificity concept) and \`findOverriddenRules(rules)\` — given \`rules: { selector, property }[]\` in source order, return the **indices** of rules that can never apply:

\`\`\`js
findOverriddenRules([
  { selector: '.btn', property: 'color' },
  { selector: '#cta', property: 'color' },
])
// → [0] — the #cta rule always beats .btn for color
\`\`\`

- only rules targeting the **same property** compete with each other
- on a specificity tie, the later rule wins (matches the real cascade) — so the *earlier* one becomes overridden

> **Why this is worth building:** this is a real, shippable idea — a "specificity linter" that flags dead CSS rules before they ship, instead of after someone spends twenty minutes in DevTools wondering why a color won't change.

Once this passes, feed it a real stylesheet's parsed rules and render the dead ones as warnings.`,
    starterCode: `function specificity(selector) {
  // returns [idCount, classCount, elementCount]
}

function findOverriddenRules(rules) {
  // return the indices of rules that can never apply — an earlier-or-tied
  // higher-specificity rule for the same property already wins
}`,
    solutionCode: `function specificity(selector) {
  let id = 0, cls = 0, el = 0;
  const s = selector.replace(/\\[[^\\]]*\\]/g, () => { cls++; return ''; });
  for (const part of s.split(/[ >+~]/)) {
    id  += (part.match(/#[a-zA-Z]/g) || []).length;
    cls += (part.match(/\\.[a-zA-Z]|:[^:]/g) || []).length;
    el  += (part.match(/^[a-zA-Z]|::[a-zA-Z]/g) || []).length;
  }
  return [id, cls, el];
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function findOverriddenRules(rules) {
  const winnerByProperty = {};
  const overridden = [];

  rules.forEach((rule, index) => {
    const score = specificity(rule.selector);
    const current = winnerByProperty[rule.property];
    // A tie goes to the later rule (matches the real cascade), so >= 0 means
    // this rule becomes the new winner and the previous one is overridden.
    if (!current || compareSpecificity(score, current.score) >= 0) {
      if (current) overridden.push(current.index);
      winnerByProperty[rule.property] = { index, score };
    } else {
      overridden.push(index);
    }
  });

  return overridden.sort((a, b) => a - b);
}`,
    testCases: [
      {
        input: "['.btn', '#cta'] both set color",
        expected: "[0] — #cta overrides .btn",
        label: "A later rule with higher specificity overrides an earlier one",
      },
      {
        input: "['#cta', '.btn'] both set color",
        expected: "[1] — .btn can never win",
        label: "An earlier rule with higher specificity is not overridden by a later weaker one",
      },
      {
        input: "['.btn', '.primary'] both set color, equal specificity",
        expected: "[0] — the later rule wins the tie",
        label: "Equal specificity — the later rule wins (source order tiebreak)",
      },
      {
        input: "'.btn' sets color, '.btn' sets background",
        expected: "[] — different properties never conflict",
        label: "Different properties never conflict",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "lazy-config-loader",
    conceptSlug: "hoisting-temporal-dead-zone",
    title: "Build a Lazy Config Loader",
    description: `Build a config accessor that fails loudly if a value is read before it's actually set — turning \`var\`'s silent \`undefined\` bug into an error you'd actually notice.

## The problem

A hoisted \`var\` that's read before its assignment line quietly returns \`undefined\` instead of failing where the real mistake is — the bug surfaces somewhere else entirely, far from its cause. Application config often has this exact shape: a value gets read before whatever sets it up has actually run.

## The idea

Instead of a plain object (which returns \`undefined\` for any missing key, hiding the same class of bug \`var\` does), build a config store that explicitly distinguishes "not set yet" from "set to undefined" — and throws a clear error for the former.

## Your task

Write \`createLazyConfig()\` returning \`{ set(key, value), get(key) }\`:

- \`get(key)\` on a key that hasn't been \`set()\` yet throws a descriptive \`Error\`
- \`set(key, value)\` then \`get(key)\` returns the value that was set
- keys are independent — reading one unset key throws even if a different key has already been set

\`\`\`js
const config = createLazyConfig();
config.get("apiUrl"); // throws — never set
config.set("apiUrl", "https://api.example.com");
config.get("apiUrl"); // "https://api.example.com"
\`\`\`

> **Why this is worth building deliberately:** it's the opposite failure mode of \`var\`'s hoisting — instead of a config bug silently returning \`undefined\` and failing downstream, this store fails immediately and specifically, right where the real mistake is.

Once this passes, wire it into a small settings panel where each field reads its default through \`get()\` before a "Load Config" button calls \`set()\` for each key.`,
    starterCode: `function createLazyConfig() {
  // return { set(key, value), get(key) }
  // get(key) on a key that hasn't been set() yet must throw, not return undefined
}`,
    solutionCode: `function createLazyConfig() {
  const store = new Map();
  return {
    set(key, value) {
      store.set(key, value);
    },
    get(key) {
      if (!store.has(key)) {
        throw new Error('Config key "' + key + '" was read before it was set.');
      }
      return store.get(key);
    },
  };
}`,
    testCases: [
      { input: "get('apiUrl') before any set() call", expected: "throws an Error", label: "Reading an unset key throws" },
      { input: "set('apiUrl', '...') then get('apiUrl')", expected: "returns the set value", label: "Reading a set key returns its value" },
      {
        input: "one key set, a different key read",
        expected: "the unset key still throws",
        label: "Keys are tracked independently",
      },
    ],
    isPremium: false,
    orderIndex: 2,
  },

  {
    slug: "strict-query-param-parser",
    conceptSlug: "equality-type-coercion",
    title: "Build a Strict Query Param Parser",
    description: `Build a query-string-to-object parser that converts values to their real types explicitly — without leaning on any of \`==\`'s implicit coercion.

## The problem

URL query params arrive as strings — \`?page=2&active=false\` — but application code usually wants a real number and a real boolean, not the literal strings \`"2"\` and \`"false"\` (which, notably, is a *truthy* string despite reading like it should be falsy — a classic coercion trap).

## The idea

Explicit, deliberate type conversion beats implicit coercion every time. Check each string's shape directly — does it look like a number? Is it exactly \`"true"\` or \`"false"\`? — and convert accordingly, rather than trusting truthiness or \`==\` to sort it out.

## Your task

Write \`parseParams(params)\` — given a flat object of string values, return a new object where:

- a string that parses fully as a number becomes a \`number\`
- the exact strings \`"true"\`/\`"false"\` become the boolean \`true\`/\`false\`
- anything else stays a string, unchanged

\`\`\`js
parseParams({ page: "2", active: "false", name: "Ada" });
// { page: 2, active: false, name: "Ada" }
\`\`\`

> **The trap this avoids:** \`Boolean("false")\` is \`true\` — a non-empty string is always truthy, regardless of what it says. Converting the string \`"false"\` to a real boolean requires an explicit string comparison, not a truthiness check.

Once this passes, wire it into a page that reads \`window.location.search\` and renders the parsed, correctly-typed params.`,
    starterCode: `function parseParams(params) {
  // return a new object with numeric strings converted to numbers,
  // "true"/"false" converted to real booleans, everything else left as a string
}`,
    solutionCode: `function parseParams(params) {
  const result = {};
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === "true" || value === "false") {
      result[key] = value === "true";
    } else if (value.trim() !== "" && !Number.isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}`,
    testCases: [
      { input: "parseParams({ page: '2' })", expected: "{ page: 2 }", label: "Numeric strings convert to numbers" },
      {
        input: "parseParams({ active: 'false' })",
        expected: "{ active: false }",
        label: "'false' converts to the real boolean false, not a truthy string",
      },
      {
        input: "parseParams({ name: 'Ada' })",
        expected: "{ name: 'Ada' }",
        label: "Non-numeric, non-boolean strings stay strings",
      },
    ],
    isPremium: false,
    orderIndex: 3,
  },

  {
    slug: "undo-redo-history",
    conceptSlug: "closures",
    title: "Build an Undo/Redo History Stack",
    description: `Build the state-tracking engine behind every editor's Undo/Redo buttons — using a closure to keep the history private instead of scattering it across component state.

## The problem

Undo/Redo needs to remember every previous state (to go back) and every undone state (to go forward again, until a new change discards that "future"). Managing this correctly — especially clearing the redo stack the moment a *new* change happens after an undo — is easy to get subtly wrong.

## The idea

A closure over two private stacks — past and future — is a clean fit: nothing outside the returned object can reach into those stacks directly, so accidental external mutation of history isn't possible, and each returned method has clear access to exactly the shared state it needs.

## Your task

Write \`createHistory(initialState)\` returning \`{ set(newState), undo(), redo(), current() }\`:

- \`set(newState)\` records the current state into the past stack and makes \`newState\` current, **clearing any redo history**
- \`undo()\` moves the current state into the future stack and restores the most recent past state (no-op if there's no past)
- \`redo()\` moves the current state back into the past stack and restores the most recent future state (no-op if there's no future)
- \`current()\` returns whatever state is active right now

\`\`\`js
const h = createHistory(0);
h.set(1); h.set(2);
h.undo(); h.current(); // 1
h.undo(); h.current(); // 0
h.redo(); h.current(); // 1
h.set(5); // discards the "2" redo entry entirely
h.redo(); h.current(); // still 5 — nothing left to redo
\`\`\`

> **Why \`set\` has to clear the future stack:** once you make a genuinely new change after undoing, the old "future" (the states you'd undone away from) is no longer a valid path forward — keeping it around would let redo jump to a state that doesn't follow from what's now current.

Once this passes, wire it into a tiny text editor with visible Undo/Redo buttons that disable themselves when there's nothing left to undo/redo.`,
    starterCode: `function createHistory(initialState) {
  // return { set(newState), undo(), redo(), current() }
  // set() must clear any redo (future) history
}`,
    solutionCode: `function createHistory(initialState) {
  let current = initialState;
  const past = [];
  const future = [];

  return {
    set(newState) {
      past.push(current);
      current = newState;
      future.length = 0;
    },
    undo() {
      if (past.length === 0) return;
      future.push(current);
      current = past.pop();
    },
    redo() {
      if (future.length === 0) return;
      past.push(current);
      current = future.pop();
    },
    current() {
      return current;
    },
  };
}`,
    testCases: [
      { input: "set(1), set(2), then undo() twice", expected: "current() is the initial state", label: "Undo walks back through history in order" },
      { input: "undo() then redo()", expected: "current() returns to the undone state", label: "Redo restores what undo just removed" },
      {
        input: "undo(), then set(a new value)",
        expected: "redo() is now a no-op",
        label: "A new set() after undo clears the redo stack",
      },
    ],
    isPremium: false,
    orderIndex: 4,
  },

  {
    slug: "middleware-pipeline",
    conceptSlug: "callbacks-higher-order-functions",
    title: "Build a Middleware Pipeline",
    description: `Build the same "chain of small functions" engine behind Express middleware and Redux middleware — a callback-driven pipeline where each step can act, then hand off to the next.

## The problem

Real request/action handling is rarely one big function — logging, auth checks, validation, and the actual handler are usually separate concerns that all need to run, in order, on the same input, with any one of them able to short-circuit the rest.

## The idea

Each middleware is a callback of the shape \`(input, next) => void\` — it does its work, then calls \`next()\` to continue to the following middleware, or doesn't call it at all to stop the chain there. The pipeline itself doesn't know what any middleware does; it just wires each one's \`next\` to the following middleware.

## Your task

Write \`createPipeline()\` returning \`{ use(fn), run(input) }\`:

- \`use(fn)\` registers a middleware, in the order added
- \`run(input)\` invokes the first middleware with \`(input, next)\`, where calling \`next()\` invokes the next registered middleware the same way
- if a middleware never calls \`next()\`, the chain stops there — later middleware never runs

\`\`\`js
const pipeline = createPipeline();
pipeline.use((input, next) => { console.log("logging:", input); next(); });
pipeline.use((input, next) => { if (!input.authed) return; next(); });
pipeline.use((input) => console.log("handled:", input));
pipeline.run({ authed: true }); // logs "logging:" then "handled:"
pipeline.run({ authed: false }); // logs only "logging:" — chain stops at the auth check
\`\`\`

> **This is the exact same shape as Express's \`app.use((req, res, next) => ...)\`** — a middleware pipeline is nothing more than callbacks and higher-order functions applied to one specific domain (requests), generalized here to any input.

Once this passes, add a real logging + validation + handler chain and confirm a failed validation step correctly stops the handler from running.`,
    starterCode: `function createPipeline() {
  // return { use(fn), run(input) }
  // run() should invoke middleware in order, each one deciding whether to call next()
}`,
    solutionCode: `function createPipeline() {
  const middlewares = [];
  return {
    use(fn) {
      middlewares.push(fn);
    },
    run(input) {
      let index = 0;
      function next() {
        const middleware = middlewares[index++];
        if (middleware) middleware(input, next);
      }
      next();
    },
  };
}`,
    testCases: [
      { input: "3 middlewares, each calling next()", expected: "all 3 run in registration order", label: "Runs every middleware in order when each calls next" },
      {
        input: "a middleware that never calls next()",
        expected: "later middlewares never run",
        label: "Not calling next() stops the chain",
      },
      {
        input: "run() called twice on the same pipeline",
        expected: "each run executes the full chain independently",
        label: "Each run() call is independent",
      },
    ],
    isPremium: false,
    orderIndex: 5,
  },

  {
    slug: "shopping-cart-reducer",
    conceptSlug: "array-object-methods-immutability",
    title: "Build a Shopping Cart Reducer",
    description: `Build the reducer behind a shopping cart — the pattern used everywhere state updates need to be predictable and undo-able: add, remove, and update quantity, all without ever mutating the previous state.

## The problem

A cart has three basic operations — add an item, remove one, change a quantity — and every one of them has to produce a **new** cart state, never mutate the old one directly. Get this wrong and anything comparing old vs. new state (undo history, a UI framework's re-render check) breaks silently.

## The idea

A reducer is just a function: given the current state and an action describing what happened, return the next state. Each action type needs its own immutable-update logic — array methods that return new arrays (\`map\`, \`filter\`, spread) do all the real work here.

## Your task

Write \`cartReducer(state, action)\` where \`state\` is \`{ items: { id, qty }[] }\` and \`action\` is one of:

- \`{ type: 'ADD_ITEM', id }\` — adds a new item with \`qty: 1\`, or increments \`qty\` if \`id\` already exists
- \`{ type: 'REMOVE_ITEM', id }\` — removes the item entirely
- \`{ type: 'UPDATE_QTY', id, qty }\` — sets that item's quantity directly

Every branch must return a **new** \`state\` object, never mutate the input.

\`\`\`js
cartReducer({ items: [] }, { type: "ADD_ITEM", id: "sku-1" });
// { items: [{ id: "sku-1", qty: 1 }] }
\`\`\`

> **Why this shape scales:** this is exactly the reducer pattern Redux (and \`useReducer\`) are built around — one pure function, one action at a time, always returning new state — which is what makes time-travel debugging and undo history possible for free.

Once this passes, wire it to a small cart UI with add/remove/quantity controls and confirm the displayed total updates correctly after each action.`,
    starterCode: `function cartReducer(state, action) {
  // handle ADD_ITEM, REMOVE_ITEM, UPDATE_QTY — always return a new state object
}`,
    solutionCode: `function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.id === action.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }
      return { items: [...state.items, { id: action.id, qty: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.id) };
    case "UPDATE_QTY":
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, qty: action.qty } : item
        ),
      };
    default:
      return state;
  }
}`,
    testCases: [
      { input: "ADD_ITEM for a new sku", expected: "adds it with qty: 1", label: "Adding a new item" },
      { input: "ADD_ITEM for an sku already in the cart", expected: "increments its qty instead of duplicating", label: "Adding an existing item increments quantity" },
      { input: "REMOVE_ITEM for an sku", expected: "the item is gone from items", label: "Removing an item" },
      {
        input: "the original state object, checked after any action",
        expected: "unchanged",
        label: "Never mutates the input state",
      },
    ],
    isPremium: false,
    orderIndex: 6,
  },

  {
    slug: "auto-bound-event-emitter",
    conceptSlug: "this-binding-execution-context",
    title: "Build an Auto-Bound Event Emitter",
    description: `Build a small event emitter — the pattern behind most pub/sub and custom-event systems — that guarantees a handler's \`this\` is always correct, no matter how the event later fires.

## The problem

Event handlers are exactly the kind of function that gets detached from its original object and called back later, elsewhere — the classic setup for a lost \`this\`. Registering a class method directly (\`emitter.on('login', instance.handleLogin)\`) hands the emitter a bare function reference — by the time \`emit\` calls it, there's no object to the left of a dot anymore, so \`this\` inside \`handleLogin\` isn't \`instance\`.

## The idea

Rather than relying on every *caller* to remember \`.bind(this)\` before registering a method, the emitter itself can guarantee correct \`this\`: accept an optional \`context\` alongside each handler, and always invoke that handler with \`.call(context, payload)\` — never as a bare call — regardless of how \`.emit()\` itself gets called.

## Your task

Write \`createEmitter()\` returning \`{ on(event, handler, context), emit(event, payload) }\`:

- \`on(event, handler, context)\` registers \`handler\` for that event name, remembering \`context\` alongside it (\`context\` is optional)
- \`emit(event, payload)\` calls every handler registered for that event with \`payload\`, invoking each one with \`this\` set to whatever \`context\` was passed at registration time
- multiple handlers can be registered for the same event, each with its own independent \`context\`, and all of them run on \`emit\`

\`\`\`js
class Dashboard {
  constructor(name) { this.name = name; }
  handleLogin(user) { console.log(this.name, "saw", user.name, "log in"); }
}

const emitter = createEmitter();
const dash = new Dashboard("Admin Panel");
emitter.on("login", dash.handleLogin, dash); // bare method reference — no manual .bind() needed
emitter.emit("login", { name: "Ada" }); // logs "Admin Panel saw Ada log in"
\`\`\`

> **Why this actually solves the problem, not just avoids it:** \`dash.handleLogin\` is passed as a bare reference above — exactly the detachment that normally loses \`this\`. It works here because the emitter, not the caller, is responsible for calling it correctly every time, via \`handler.call(context, payload)\` internally.

Once this passes, register two different class instances' methods on the same event and confirm each one's \`this\` still refers to its own instance, not the other's, when both fire from a single \`emit\`.`,
    starterCode: `function createEmitter() {
  // return { on(event, handler, context), emit(event, payload) }
  // emit() must invoke each handler with this set to its own registered context
}`,
    solutionCode: `function createEmitter() {
  const handlers = {};
  return {
    on(event, handler, context) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push({ handler, context });
    },
    emit(event, payload) {
      (handlers[event] || []).forEach(({ handler, context }) => handler.call(context, payload));
    },
  };
}`,
    testCases: [
      {
        input: "on('login', instance.handleLogin, instance), then emit('login', payload)",
        expected: "this inside handleLogin refers to instance",
        label: "A bare method reference still gets the right this, with no manual .bind() by the caller",
      },
      {
        input: "two instances' methods registered on the same event, each with its own context",
        expected: "each handler's this refers to its own instance, not the other's",
        label: "Independent context per handler, even for the same event",
      },
      {
        input: "on('login', handler) with no context passed",
        expected: "handler still runs, this is undefined inside it",
        label: "context is optional — omitting it behaves like a plain function call",
      },
      {
        input: "emit() for an event with no registered handlers",
        expected: "does nothing, does not throw",
        label: "Emitting an unregistered event is a safe no-op",
      },
    ],
    isPremium: true,
    orderIndex: 7,
  },

  {
    slug: "shape-hierarchy-without-class",
    conceptSlug: "prototypal-inheritance",
    title: "Build a Shape Hierarchy Without class",
    description: `Build a small hierarchy of shapes — the "hello world" of inheritance — using the raw prototype mechanism directly, with no \`class\`/\`extends\` sugar anywhere.

## The problem

\`class\` and \`extends\` make inheritance easy to write, but easy to write without ever understanding what's actually happening underneath — the linked \`[[Prototype]]\` chain that makes shared methods and \`instanceof\` work at all.

## The idea

Build \`Shape\`, then \`Circle\` and \`Rectangle\` that inherit from it, wiring the prototype chain by hand with \`Object.create\` — exactly what \`extends\` compiles down to — so each subclass's instances can call \`Shape\`'s shared methods while still overriding \`area()\` with their own shape-specific formula.

## Your task

Write constructor functions \`Shape(name)\`, \`Circle(radius)\`, and \`Rectangle(width, height)\`, wiring \`Circle\`/\`Rectangle\` to inherit from \`Shape\` via the prototype chain (no \`class\` keyword):

- \`Shape.prototype.describe()\` returns a string using \`this.name\` and \`this.area()\`
- \`Circle\`/\`Rectangle\` each implement their own \`area()\`, overriding nothing on \`Shape\` itself
- both \`new Circle(2) instanceof Shape\` and \`new Rectangle(2, 3) instanceof Shape\` are \`true\`

\`\`\`js
const c = new Circle(2);
c.describe(); // "circle has area 12.57"
c instanceof Shape; // true
\`\`\`

> **Why build this without \`class\` at all:** \`class\`/\`extends\` are syntax over exactly this mechanism — building it by hand once is what makes every later use of \`class\` feel like a shorthand for something you understand, not a separate feature to memorize.

Once this passes, render a few shapes on a canvas or as SVG, each computing its own area through the shared \`describe()\` method.`,
    starterCode: `function Shape(name) {
  this.name = name;
}
Shape.prototype.describe = function () {
  // return a string using this.name and this.area()
};

function Circle(radius) {
  // call Shape's constructor with the right name
  this.radius = radius;
}
// wire Circle to inherit from Shape, then implement Circle.prototype.area

function Rectangle(width, height) {
  // call Shape's constructor with the right name
  this.width = width;
  this.height = height;
}
// wire Rectangle to inherit from Shape, then implement Rectangle.prototype.area`,
    solutionCode: `function Shape(name) {
  this.name = name;
}
Shape.prototype.describe = function () {
  return this.name + " has area " + this.area().toFixed(2);
};

function Circle(radius) {
  Shape.call(this, "circle");
  this.radius = radius;
}
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;
Circle.prototype.area = function () {
  return Math.PI * this.radius * this.radius;
};

function Rectangle(width, height) {
  Shape.call(this, "rectangle");
  this.width = width;
  this.height = height;
}
Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.area = function () {
  return this.width * this.height;
};`,
    testCases: [
      { input: "new Circle(2).describe()", expected: "\"circle has area 12.57\"", label: "Circle computes its own area formula" },
      { input: "new Rectangle(2, 3).describe()", expected: "\"rectangle has area 6.00\"", label: "Rectangle computes its own area formula" },
      { input: "new Circle(2) instanceof Shape", expected: "true", label: "Both subclasses are recognized as Shape instances" },
    ],
    isPremium: true,
    orderIndex: 8,
  },

  {
    slug: "minimal-module-resolver",
    conceptSlug: "esm-vs-commonjs",
    title: "Build a Minimal Module Resolver",
    description: `Build a tiny in-memory version of CommonJS's \`require()\` — the same caching and evaluation model Node itself uses underneath, simplified down to its essentials.

## The problem

\`require()\` looks simple from the outside, but it's doing real work: running a module's code exactly once, caching its \`exports\`, and handing back that same cached object every time the same module is required again — even from many different files.

## The idea

Keep a registry of module definitions (functions that build a module's exports) and a cache of already-evaluated results. The first \`require()\` for a given id runs its definition function and caches the result; every subsequent \`require()\` for that same id returns the cached exports without re-running anything.

## Your task

Write \`createModuleSystem()\` returning \`{ define(id, factory), require(id) }\`:

- \`define(id, factory)\` registers a module, where \`factory\` is \`(require, module) => void\` and sets \`module.exports\` to whatever the module wants to expose
- \`require(id)\` runs \`id\`'s factory **the first time only**, passing it \`require\` (so modules can require each other) and a fresh \`{ exports: {} }\` object, then returns \`module.exports\`
- every later \`require(id)\` for the same id returns the **cached** exports object without re-running the factory

\`\`\`js
const mod = createModuleSystem();
mod.define("math", (require, module) => { module.exports = { double: (n) => n * 2 }; });
mod.require("math").double(5); // 10
mod.require("math") === mod.require("math"); // true — same cached object
\`\`\`

> **This is a simplified model of exactly what Node does** — real \`require()\` also resolves file paths and handles circular requires by returning a partially-built \`exports\` object, but the core "run once, cache forever" behavior is the same mechanism you just built.

Once this passes, define two modules where one requires the other, and confirm both see the same cached instance of any shared state.`,
    starterCode: `function createModuleSystem() {
  // return { define(id, factory), require(id) }
  // require(id) must run factory only once per id, caching module.exports after
}`,
    solutionCode: `function createModuleSystem() {
  const factories = {};
  const cache = {};

  function require(id) {
    if (cache[id]) return cache[id].exports;
    const module = { exports: {} };
    cache[id] = module;
    factories[id](require, module);
    return module.exports;
  }

  return {
    define(id, factory) {
      factories[id] = factory;
    },
    require,
  };
}`,
    testCases: [
      { input: "define + require a module exporting a function", expected: "the function works as defined", label: "A defined module's exports are usable" },
      {
        input: "require() the same module id twice",
        expected: "returns the exact same cached exports object both times",
        label: "A module's factory runs only once, ever",
      },
      {
        input: "module A's factory calls require('B') internally",
        expected: "B's exports are available inside A's factory",
        label: "Modules can require each other",
      },
    ],
    isPremium: true,
    orderIndex: 9,
  },

  {
    slug: "retry-with-backoff",
    conceptSlug: "promises-async-await",
    title: "Build a Retry-With-Backoff Utility",
    description: `Build the retry logic behind almost every resilient API client — retrying a failing async call with increasing delays between attempts, instead of hammering a struggling server immediately.

## The problem

A flaky network call that fails once might succeed on a second try — but retrying it instantly, over and over, can make things worse (overloading a server that's already struggling). Waiting a bit longer after each failure gives the failing dependency room to recover.

## The idea

Wrap any async function in a loop that catches a rejection, waits an increasing delay (doubling each time — "exponential backoff"), and tries again, up to a maximum number of attempts — finally rejecting for real once every attempt is exhausted.

## Your task

Write \`async retryWithBackoff(fn, { maxAttempts, baseDelay })\`:

- calls \`fn()\` (an async function) and returns its result if it succeeds
- on rejection, waits \`baseDelay * 2^attemptNumber\` ms, then retries, up to \`maxAttempts\` total attempts
- if every attempt fails, rejects with the **last** attempt's error

\`\`\`js
await retryWithBackoff(flakyFetch, { maxAttempts: 3, baseDelay: 100 });
// tries immediately, then after ~100ms, then after ~200ms, before giving up
\`\`\`

> **Why the delay grows instead of staying fixed:** a fixed short delay retries too aggressively against a genuinely struggling dependency; a growing delay backs off progressively, giving the dependency real room to recover before the next attempt.

Once this passes, wire it around a real \`fetch\` call and simulate a flaky endpoint that fails the first two times to confirm the third attempt succeeds.`,
    starterCode: `async function retryWithBackoff(fn, { maxAttempts, baseDelay }) {
  // call fn(); on rejection, wait baseDelay * 2^attemptNumber ms and retry,
  // up to maxAttempts total attempts; reject with the last error if all fail
}`,
    solutionCode: `async function retryWithBackoff(fn, { maxAttempts, baseDelay }) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}`,
    testCases: [
      { input: "fn succeeds on the first call", expected: "resolves immediately with no delay", label: "Succeeds immediately when fn doesn't fail" },
      {
        input: "fn fails twice then succeeds, maxAttempts: 3",
        expected: "resolves with the third attempt's result",
        label: "Retries through failures up to the attempt limit",
      },
      {
        input: "fn always rejects, maxAttempts: 3",
        expected: "rejects with the last attempt's error after 3 tries",
        label: "Rejects with the final error once every attempt fails",
      },
    ],
    isPremium: true,
    orderIndex: 10,
  },

  {
    slug: "live-search-autocomplete",
    conceptSlug: "debouncing-throttling",
    title: "Build a Live Search Autocomplete",
    description: `Build the controller behind a real autocomplete search box — debounced input, plus the one bug a plain debounce alone doesn't fix: a slow earlier response landing *after* a newer one and overwriting it.

## The problem

Debouncing the search input cuts down request volume, but it doesn't protect against a different race condition: request A (for "ind") and request B (for "india") can still resolve out of order over the network, so a slow response to an earlier, now-stale query can land after — and overwrite — the correct latest result.

## The idea

Alongside debouncing the calls themselves, tag every request with a sequence number when it's sent. When a response comes back, only apply it if its sequence number is still the most recent one issued — any older, now-stale response gets silently discarded instead of overwriting fresher results.

## Your task

Write \`createSearchController(fetchResults)\` returning \`{ search(query), onResults(callback) }\`:

- \`search(query)\` debounces calls to \`fetchResults(query)\` by 300ms, same as the standard debounce pattern
- when a \`fetchResults\` call resolves, its results are only passed to \`callback\` if no *newer* \`search()\` call has been made since it was sent
- \`onResults(callback)\` registers the function that receives valid, non-stale results

\`\`\`js
const controller = createSearchController(fetchResults);
controller.onResults((results) => renderResults(results));
controller.search("ind");   // request A sent (after debounce)
controller.search("india"); // request B sent (after debounce) — A's eventual response is now stale
// if A resolves after B, its results are discarded; only B's are ever rendered
\`\`\`

> **This combines two separate concepts on purpose:** debounce (from this concept) cuts down *how many* requests fire; the sequence-number check (a general async-ordering technique) makes sure that even the requests that do fire can never overwrite a newer result — each solves a different half of the "search box" problem.

Once this passes, wire it to a real input and a fake \`fetchResults\` with randomized delay, and confirm results never flicker back to an older, wrong query's results.`,
    starterCode: `function createSearchController(fetchResults) {
  // return { search(query), onResults(callback) }
  // debounce fetchResults by 300ms, and discard stale (out-of-order) responses
}`,
    solutionCode: `function createSearchController(fetchResults) {
  let timer;
  let latestSequence = 0;
  let onResultsCallback = () => {};

  return {
    search(query) {
      clearTimeout(timer);
      const sequence = ++latestSequence;
      timer = setTimeout(async () => {
        const results = await fetchResults(query);
        if (sequence === latestSequence) {
          onResultsCallback(results);
        }
      }, 300);
    },
    onResults(callback) {
      onResultsCallback = callback;
    },
  };
}`,
    testCases: [
      { input: "several search() calls within 300ms", expected: "only one fetchResults call fires, for the last query", label: "Debounces rapid search() calls" },
      {
        input: "an earlier request resolves after a newer one",
        expected: "the earlier (stale) results are discarded, never passed to the callback",
        label: "Out-of-order responses don't overwrite newer results",
      },
      {
        input: "a single search() call with no further calls",
        expected: "its results reach the callback normally",
        label: "A single, non-stale search still resolves normally",
      },
    ],
    isPremium: true,
    orderIndex: 11,
  },

  {
    slug: "data-transformation-pipeline",
    conceptSlug: "function-composition-currying",
    title: "Build a Data Transformation Pipeline",
    description: `Build a small pipeline that cleans up raw API records through a series of composed, single-purpose steps — instead of one large function doing everything at once.

## The problem

Raw API data is rarely ready to use directly — dates come as strings, fields are inconsistently cased, some records are missing required data entirely. Handling all of that in one function works, but makes it hard to test, reuse, or change any single step independently.

## The idea

Break the cleanup into small, single-purpose functions — parse a date field, normalize field casing, drop invalid records — and compose them into one pipeline. Each step only knows how to do its own job; the pipeline itself just describes the order.

## Your task

Write \`compose(...fns)\` (right-to-left, matching \`f(g(x))\`) and use it to build \`cleanRecords(records)\`, which:

- parses each record's \`createdAt\` string into a real \`Date\`
- lowercases each record's \`status\` field
- filters out any record missing an \`id\`

\`\`\`js
cleanRecords([
  { id: "1", status: "ACTIVE", createdAt: "2024-01-01" },
  { status: "DONE", createdAt: "2024-01-02" }, // no id — dropped
]);
// [{ id: "1", status: "active", createdAt: Date(2024-01-01) }]
\`\`\`

> **Why build this as composed steps instead of one function:** each step (parse dates, normalize casing, filter invalid) is independently testable and reusable — a different pipeline elsewhere in the app could reuse the date-parsing or casing step alone, without duplicating logic.

Once this passes, feed it a real API response shape and render the cleaned records in a table.`,
    starterCode: `function compose(...fns) {
  // return a function that applies fns right-to-left: compose(f, g)(x) === f(g(x))
}

function cleanRecords(records) {
  // use compose() to chain: parse createdAt, lowercase status, filter records without an id
}`,
    solutionCode: `function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

function parseDates(records) {
  return records.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}

function normalizeStatus(records) {
  return records.map((r) => ({ ...r, status: r.status ? r.status.toLowerCase() : r.status }));
}

function dropInvalid(records) {
  return records.filter((r) => Boolean(r.id));
}

function cleanRecords(records) {
  return compose(parseDates, normalizeStatus, dropInvalid)(records);
}`,
    testCases: [
      { input: "a record with createdAt: '2024-01-01'", expected: "createdAt becomes a real Date object", label: "Parses date strings into Date objects" },
      { input: "a record with status: 'ACTIVE'", expected: "status becomes 'active'", label: "Normalizes status casing" },
      { input: "a record with no id field", expected: "removed from the result entirely", label: "Filters out records missing an id" },
    ],
    isPremium: true,
    orderIndex: 12,
  },

  {
    slug: "leak-safe-subscription-manager",
    conceptSlug: "memory-management-leaks",
    title: "Build a Leak-Safe Subscription Manager",
    description: `Build a small utility that tracks every subscription a feature creates — listeners, intervals, timeouts — so all of them can be released with a single call, instead of leaking one at a time from a forgotten cleanup.

## The problem

A feature that sets up several things — an event listener, a polling interval, a timeout — needs to release every single one when it's done, or each forgotten one keeps its closure (and whatever it references) reachable forever. Remembering to individually clean up N different subscriptions, in N different ways, is exactly where leaks slip in.

## The idea

Instead of manually tracking each subscription's own cleanup function separately, register every cleanup function with one manager as it's created. The manager doesn't need to know *what* kind of subscription it is — only that it has a \`()  => void\` function that undoes it — and can release everything at once, in one place.

## Your task

Write \`createSubscriptionManager()\` returning \`{ add(cleanupFn), cleanupAll() }\`:

- \`add(cleanupFn)\` registers a cleanup function (e.g. one that calls \`removeEventListener\` or \`clearInterval\`)
- \`cleanupAll()\` calls **every** registered cleanup function, in the order they were added, then clears the registry so calling \`cleanupAll()\` again does nothing

\`\`\`js
const manager = createSubscriptionManager();
const id = setInterval(poll, 1000);
manager.add(() => clearInterval(id));
manager.add(() => window.removeEventListener("resize", onResize));
// later, e.g. in a useEffect cleanup:
manager.cleanupAll(); // both the interval and the listener are released
\`\`\`

> **This is exactly the shape of a \`useEffect\` cleanup function, generalized** — instead of one effect with one inline cleanup, this lets a feature register an arbitrary number of cleanups from anywhere in its code and release them all through a single call.

Once this passes, wire it into a small component-like feature that opens a WebSocket, a polling interval, and a resize listener, and confirm one \`cleanupAll()\` call releases all three.`,
    starterCode: `function createSubscriptionManager() {
  // return { add(cleanupFn), cleanupAll() }
  // cleanupAll() must run every registered cleanup once, then clear the registry
}`,
    solutionCode: `function createSubscriptionManager() {
  let cleanups = [];
  return {
    add(cleanupFn) {
      cleanups.push(cleanupFn);
    },
    cleanupAll() {
      cleanups.forEach((cleanupFn) => cleanupFn());
      cleanups = [];
    },
  };
}`,
    testCases: [
      { input: "3 cleanup functions added, then cleanupAll()", expected: "all 3 are called, in the order added", label: "Runs every registered cleanup" },
      {
        input: "cleanupAll() called twice in a row",
        expected: "the second call runs nothing — the registry is already empty",
        label: "cleanupAll() clears the registry so it can't double-run",
      },
      {
        input: "add() called again after a cleanupAll()",
        expected: "the new cleanup is tracked normally for the next cleanupAll()",
        label: "The manager is reusable after clearing",
      },
    ],
    isPremium: true,
    orderIndex: 13,
  },

  {
    slug: "paginated-data-loader",
    conceptSlug: "generators-iterators",
    title: "Build a Paginated Data Loader",
    description: `Build a lazy, page-by-page data loader using an async generator — pulling one page at a time, on demand, instead of eagerly loading everything upfront.

## The problem

An API that paginates results (\`?page=1\`, \`?page=2\`, ...) shouldn't require the caller to fetch every page upfront just to start showing the first few items — especially when the caller might stop after a handful of items and never need the rest.

## The idea

An async generator can \`yield\` each page's items as soon as that page arrives, pausing in between — the caller consumes it with \`for await...of\`, pulling exactly as many pages as it actually needs, and never more.

## Your task

Write \`async function* paginate(fetchPage)\`, where \`fetchPage(pageNumber)\` returns a Promise resolving to an array of items for that page (an empty array signals no more pages):

- starts at page \`1\` and calls \`fetchPage\` for increasing page numbers
- \`yield\`s each item individually (not each page as a whole array)
- stops entirely once \`fetchPage\` resolves with an empty array

\`\`\`js
for await (const item of paginate(fetchPage)) {
  console.log(item);
  if (haveEnough()) break; // stops fetching further pages immediately
}
\`\`\`

> **Why yield individual items, not whole pages:** it lets the consumer \`break\` out mid-page without needing to know anything about pages at all — from the caller's perspective, it's just one continuous, lazy stream of items.

Once this passes, wire it to a real paginated endpoint and render items into an infinite-scroll list as they're lazily loaded.`,
    starterCode: `async function* paginate(fetchPage) {
  // yield individual items across increasing page numbers, starting at page 1
  // stop once fetchPage resolves with an empty array
}`,
    solutionCode: `async function* paginate(fetchPage) {
  let page = 1;
  while (true) {
    const items = await fetchPage(page);
    if (items.length === 0) return;
    for (const item of items) {
      yield item;
    }
    page += 1;
  }
}`,
    testCases: [
      { input: "fetchPage returns 2 pages of items, then an empty array", expected: "yields every item across both pages, then stops", label: "Lazily yields items across multiple pages" },
      {
        input: "consuming with for await...of and breaking after the first item",
        expected: "later pages are never fetched",
        label: "Stops fetching further pages once the consumer stops iterating",
      },
      {
        input: "fetchPage returns an empty array on the very first call",
        expected: "the generator yields nothing and completes immediately",
        label: "Handles a fully empty result set",
      },
    ],
    isPremium: true,
    orderIndex: 14,
  },


  // ── Phase 10 (Feature 42) — Browser Internals ─────────────────────────────
  {
    slug: "environment-report-generator",
    conceptSlug: "dom-vs-bom",
    title: "Build an Environment Report Generator",
    description: `Build the logic behind a "what does this page know about its environment" debug panel — the kind that groups every browser reference by what it actually represents.

## The problem

A real debug panel collects raw \`{ name, value }\` pairs from all over the codebase — some from the DOM, some from the BOM — and needs to present them grouped correctly, not as one flat undifferentiated list.

## The idea

Reuse the same classification rule as the DOM vs. BOM Challenge — strip a leading \`window.\` first, then anything rooted at \`document\` is DOM, everything else is BOM — and bucket each entry under the right group instead of just classifying one reference at a time.

## Your task

Write \`buildEnvironmentReport(entries)\` — given an array of \`{ name, value }\` objects where \`name\` is a reference string like \`"document.title"\` or \`"window.location.href"\`, return \`{ dom: {...}, bom: {...} }\` with each entry placed under the correct bucket, keyed by its original \`name\`.

Once this passes, imagine wiring it to real values collected via \`document.title\`, \`navigator.userAgent\`, etc., and rendering the two groups as separate panel sections.`,
    starterCode: `function buildEnvironmentReport(entries) {
  // entries: { name: string, value: unknown }[]
  // return { dom: Record<string, unknown>, bom: Record<string, unknown> }
}`,
    solutionCode: `function buildEnvironmentReport(entries) {
  const report = { dom: {}, bom: {} };
  for (const { name, value } of entries) {
    const stripped = name.startsWith("window.") ? name.slice("window.".length) : name;
    const root = stripped.split(".")[0];
    const bucket = root === "document" ? "dom" : "bom";
    report[bucket][name] = value;
  }
  return report;
}`,
    testCases: [
      {
        input: "a document.title entry and a navigator.userAgent entry",
        expected: "each placed under its correct bucket",
        label: "Groups a DOM and a BOM entry correctly",
      },
      { input: "an empty entries array", expected: "{ dom: {}, bom: {} }", label: "Handles an empty entry list" },
      {
        input: "window.document.body",
        expected: "placed under dom despite the window. prefix",
        label: "A window.document reference is still DOM",
      },
      {
        input: "window.location.href and history.length",
        expected: "both placed under bom",
        label: "Multiple BOM entries are grouped together",
      },
    ],
    isPremium: false,
    orderIndex: 15,
  },

  {
    slug: "delegated-click-router",
    conceptSlug: "event-delegation-bubbling-capturing",
    title: "Build a Delegated Click Router",
    description: `Build the routing logic behind a single delegated click listener on a list container — the pattern that lets one listener handle clicks for every row, including rows added later.

## The problem

A real delegated handler walks from the clicked element up toward the container, checking each ancestor's class list against a table of registered routes, and invokes the *nearest* match — exactly like \`element.closest()\` does, but data-driven.

## The idea

Walk the path from the target outward toward the root, one level at a time, and invoke the first registered route found along the way — the target's own classes are checked before any ancestor's, so a closer match always wins over a farther one.

## Your task

Write \`createDelegatedClickHandler(routes)\` — \`routes\` maps a class name to a handler function. It returns a \`dispatch(path)\` function, where \`path\` is an array of class-name arrays ordered from the clicked target outward to the root. \`dispatch\` should invoke the handler for the *first* matching class name found (starting from the target and working outward) and return that class name, or return \`null\` if nothing matched.

Once this passes, imagine feeding it a real \`path\` built by walking \`element.classList\` up through \`element.parentElement\` on an actual click event.`,
    starterCode: `function createDelegatedClickHandler(routes) {
  // return dispatch(path) — path: string[][], target-first
}`,
    solutionCode: `function createDelegatedClickHandler(routes) {
  return function dispatch(path) {
    for (const classNames of path) {
      for (const className of classNames) {
        if (routes[className]) {
          routes[className]();
          return className;
        }
      }
    }
    return null;
  };
}`,
    testCases: [
      {
        input: "the target itself matches a registered route",
        expected: "that route's handler runs, its name is returned",
        label: "A direct target match invokes its own handler",
      },
      {
        input: "the target doesn't match, but an ancestor does",
        expected: "the ancestor's handler runs (delegation)",
        label: "Falls back to a matching ancestor",
      },
      {
        input: "no level in the path matches any registered route",
        expected: "null, no handler invoked",
        label: "Returns null when nothing matches",
      },
      {
        input: "both the target and an ancestor match different routes",
        expected: "only the nearest (target) match runs",
        label: "The nearest match wins over a farther one",
      },
    ],
    isPremium: false,
    orderIndex: 16,
  },

  {
    slug: "ttl-aware-storage-wrapper",
    conceptSlug: "storage-apis",
    title: "Build a TTL-Aware Storage Wrapper",
    description: `Build a small wrapper that adds automatic expiration on top of a plain key/value store — the kind of utility that sits in front of \`localStorage\` to stop stale cached values from being trusted forever.

## The problem

Plain storage APIs have no concept of "this value is only good for 5 minutes" — that has to be layered on top, by storing an expiration timestamp alongside the value and checking it on every read.

## The idea

Store each value together with an expiration timestamp computed from an injectable clock. On every read, compare the current time against that timestamp — past it, the value is treated as gone, exactly as if it were never set.

## Your task

Write \`createTTLStore(now)\` — \`now\` is an injectable clock function (so tests don't need real timers). It returns a store with:

- \`set(key, value, ttlMs)\` — stores the value along with an expiration computed from \`now() + ttlMs\`
- \`get(key)\` — returns the value if it hasn't expired yet, or \`undefined\` if it's missing or expired (and should stop returning it from then on)

Once this passes, imagine swapping the injected clock for \`Date.now\` and the internal map for real \`localStorage\` calls.`,
    starterCode: `function createTTLStore(now) {
  // return { set(key, value, ttlMs), get(key) }
}`,
    solutionCode: `function createTTLStore(now) {
  const store = new Map();
  return {
    set(key, value, ttlMs) {
      store.set(key, { value, expiresAt: now() + ttlMs });
    },
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
  };
}`,
    testCases: [
      { input: "a value read before its TTL elapses", expected: "the stored value", label: "Returns a value before it expires" },
      { input: "a value read after its TTL elapses", expected: "undefined", label: "Returns undefined once the value has expired" },
      {
        input: "two keys with different TTLs",
        expected: "each expires independently",
        label: "Keys expire independently of one another",
      },
      {
        input: "a key set again before its previous TTL elapses",
        expected: "the new value, with a freshly reset expiration",
        label: "Re-setting a key refreshes its expiration",
      },
    ],
    isPremium: true,
    orderIndex: 17,
  },

  {
    slug: "same-origin-request-guard",
    conceptSlug: "cors-same-origin-policy",
    title: "Build a Same-Origin Request Guard",
    description: `Build a small client-side guard that refuses to even attempt a request to a non-allowed origin — a defensive layer in front of \`fetch\`, not a replacement for real CORS enforcement (which only the server can do).

## The problem

CORS itself is enforced by the browser reading the server's response headers — by the time that happens, the request has already gone out. A client-side allowlist can't replace that, but it *can* stop your own app's code from ever attempting a call to an origin it wasn't meant to talk to, failing fast with a clear error instead of a confusing network-level CORS rejection.

## The idea

Check the origin against an allowlist *before* the request function ever runs — if the origin isn't on the list, refuse immediately and never invoke the caller's request logic at all.

## Your task

Write \`createOriginGuard(allowedOrigins)\` — returns an object with:

- \`isAllowed(origin)\` — \`true\`/\`false\`
- \`guardedFetch(origin, requestFn)\` — an async function; if \`origin\` isn't allowed, it throws *without ever calling* \`requestFn\`; otherwise it calls and returns \`requestFn()\`'s result

Once this passes, imagine wiring \`requestFn\` to a real \`fetch\` call, so a typo'd or malicious origin never even reaches the network.`,
    starterCode: `function createOriginGuard(allowedOrigins) {
  // return { isAllowed(origin), guardedFetch(origin, requestFn) }
}`,
    solutionCode: `function createOriginGuard(allowedOrigins) {
  return {
    isAllowed(origin) {
      return allowedOrigins.includes(origin);
    },
    async guardedFetch(origin, requestFn) {
      if (!allowedOrigins.includes(origin)) {
        throw new Error("Origin not allowed: " + origin);
      }
      return requestFn();
    },
  };
}`,
    testCases: [
      { input: "a listed origin", expected: "true", label: "isAllowed is true for a listed origin" },
      { input: "an unlisted origin", expected: "false", label: "isAllowed is false for an unlisted origin" },
      {
        input: "guardedFetch with an allowed origin",
        expected: "requestFn runs and its result is returned",
        label: "guardedFetch runs requestFn when the origin is allowed",
      },
      {
        input: "guardedFetch with a disallowed origin",
        expected: "throws, requestFn never runs",
        label: "guardedFetch never calls requestFn for a disallowed origin",
      },
    ],
    isPremium: true,
    orderIndex: 18,
  },

  {
    slug: "csp-header-builder",
    conceptSlug: "web-security-fundamentals",
    title: "Build a CSP Header Builder",
    description: `Build the logic that turns a structured policy definition into the actual \`Content-Security-Policy\` header string a server sends.

## The problem

Hand-writing a CSP header string is error-prone at scale — a real app assembles it from a config object (often merged from multiple sources) and needs the exact directive syntax the browser expects, every time.

## The idea

Format each directive as its name followed by its space-separated values, then join every directive with \`"; "\` — the exact syntax the \`Content-Security-Policy\` header expects, preserving whatever order the directives were defined in.

## Your task

Write \`buildCspHeader(directives)\` — given an object like \`{ "script-src": ["'self'", "https://cdn.com"], "object-src": ["'none'"] }\`, return the formatted header string: each directive as \`"name value1 value2"\`, joined with \`"; "\`, preserving the object's key order.

Once this passes, imagine setting the result directly as the \`Content-Security-Policy\` response header in a real server.`,
    starterCode: `function buildCspHeader(directives) {
  // directives: Record<string, string[]>
}`,
    solutionCode: `function buildCspHeader(directives) {
  return Object.entries(directives)
    .map(([name, values]) => name + " " + values.join(" "))
    .join("; ");
}`,
    testCases: [
      {
        input: `{ "script-src": ["'self'", "https://cdn.com"] }`,
        expected: `"script-src 'self' https://cdn.com"`,
        label: "Formats a single directive with multiple values",
      },
      {
        input: `{ "script-src": ["'self'"], "object-src": ["'none'"] }`,
        expected: `"script-src 'self'; object-src 'none'"`,
        label: "Joins multiple directives with '; ', preserving order",
      },
      { input: "{}", expected: `""`, label: "An empty directives object produces an empty string" },
      {
        input: `{ "frame-ancestors": ["'none'"] }`,
        expected: `"frame-ancestors 'none'"`,
        label: "Formats a single-value directive",
      },
    ],
    isPremium: true,
    orderIndex: 19,
  },

  {
    slug: "connection-cost-estimator",
    conceptSlug: "the-network-stack",
    title: "Build a Connection Cost Estimator",
    description: `Build the logic behind a "why is this request slow" estimator — given the steps a connection actually performs, compute the total round-trip cost.

## The problem

Not every step in the network stack costs the same number of round trips — a TLS handshake alone typically costs twice what a plain TCP handshake does. A cost estimator needs a per-step weight table, not a flat "steps × one round trip" assumption.

## The idea

Look up each step's weight in round trips, multiply by the measured round-trip time, and sum across every step that actually ran — steps that were skipped (cached DNS, a reused connection) simply aren't in the list, so they contribute nothing.

## Your task

Write \`estimateLatency(steps, roundTripMs)\` — given an ordered array of step names (the same ones \`getConnectionSteps\` from the Challenge produces: \`"dns-lookup"\`, \`"tcp-handshake"\`, \`"tls-handshake"\`, \`"http-request"\`) and a single round-trip time in ms, return the total estimated latency using this per-step weight table:

- \`dns-lookup\`: 1 round trip
- \`tcp-handshake\`: 1 round trip
- \`tls-handshake\`: 2 round trips
- \`http-request\`: 1 round trip

Once this passes, imagine feeding it the real steps produced by \`getConnectionSteps\` plus a measured round-trip time, to estimate a page's actual connection overhead before a single byte of content arrives.`,
    starterCode: `function estimateLatency(steps, roundTripMs) {
  // steps: string[] of connection step names
}`,
    solutionCode: `function estimateLatency(steps, roundTripMs) {
  const COST = { "dns-lookup": 1, "tcp-handshake": 1, "tls-handshake": 2, "http-request": 1 };
  return steps.reduce((total, step) => total + (COST[step] || 0) * roundTripMs, 0);
}`,
    testCases: [
      {
        input: `["dns-lookup","tcp-handshake","tls-handshake","http-request"], 50`,
        expected: "250",
        label: "A full fresh HTTPS connection costs 5 round trips total",
      },
      { input: `["http-request"], 50`, expected: "50", label: "A single reused connection costs one round trip" },
      {
        input: `["tcp-handshake","http-request"], 100`,
        expected: "200",
        label: "A plain HTTP fresh connection costs 2 round trips",
      },
      { input: "[], 50", expected: "0", label: "No steps means zero estimated latency" },
    ],
    isPremium: true,
    orderIndex: 20,
  },

  {
    slug: "caching-strategy-picker",
    conceptSlug: "service-workers-caching-strategies",
    title: "Build a Caching Strategy Picker",
    description: `Build the routing logic a real service worker's \`fetch\` handler needs: given an incoming request, decide *which* caching strategy should handle it.

## The problem

A service worker intercepts every request the page makes — static assets, API calls, and page navigations all pass through the same \`fetch\` handler, but each needs a different strategy. Hardcoding one strategy for everything is exactly the mistake that causes either stale API data or unnecessarily slow static assets.

## The idea

Route on the shape of the URL: a recognizable static asset extension means cache-first is safe, an \`/api/\` path means the data is live enough to need network-first, and everything else falls back to stale-while-revalidate as the reasonable default.

## Your task

Write \`pickCachingStrategy(request)\` — given \`{ url }\`, return which strategy name should handle it:

- a URL ending in a static asset extension (\`.js\`, \`.css\`, \`.png\`, \`.jpg\`, \`.jpeg\`, \`.svg\`, \`.woff\`, \`.woff2\`) → \`"cache-first"\`
- a URL starting with \`/api/\` → \`"network-first"\`
- anything else → \`"stale-while-revalidate"\`

Once this passes, imagine wiring the result directly into the \`cacheFirst\`/\`networkFirst\`/\`staleWhileRevalidate\` functions from the Understand guide's examples, inside a real \`fetch\` event handler.`,
    starterCode: `function pickCachingStrategy(request) {
  // request: { url: string }
}`,
    solutionCode: `function pickCachingStrategy(request) {
  const url = request.url;
  if (/\\.(js|css|png|jpe?g|svg|woff2?)$/i.test(url)) return "cache-first";
  if (url.startsWith("/api/")) return "network-first";
  return "stale-while-revalidate";
}`,
    testCases: [
      { input: `{ url: "/assets/app.js" }`, expected: `"cache-first"`, label: "A static JS asset uses cache-first" },
      { input: `{ url: "/api/users" }`, expected: `"network-first"`, label: "An API route uses network-first" },
      {
        input: `{ url: "/dashboard" }`,
        expected: `"stale-while-revalidate"`,
        label: "A regular page navigation uses stale-while-revalidate",
      },
      { input: `{ url: "/images/logo.svg" }`, expected: `"cache-first"`, label: "A static image asset uses cache-first" },
    ],
    isPremium: true,
    orderIndex: 21,
  },

  {
    slug: "worker-task-dispatcher",
    conceptSlug: "web-workers-concurrency",
    title: "Build a Worker Task Dispatcher",
    description: `Build the load-balancing logic behind a real Web Worker pool — the part that decides which of N workers gets the next task.

## The problem

Spinning up one worker per task defeats the purpose (thread creation itself isn't free); spinning up a single worker serializes everything. A worker *pool* needs a dispatcher that spreads incoming tasks evenly across a fixed number of workers.

## The idea

Cycle through worker indices round-robin — each call to \`dispatch()\` hands out the next index in sequence, wrapping back to \`0\` after the last worker, while a running count per worker tracks exactly how much load it's been given.

## Your task

Write \`createWorkerPool(workerCount)\` — returns an object with:

- \`dispatch()\` — returns the index (0 to \`workerCount - 1\`) of the worker assigned to handle the next task, cycling round-robin
- \`getLoads()\` — returns an array of length \`workerCount\`, each entry the number of tasks assigned to that worker index so far

Once this passes, imagine calling \`dispatch()\` to pick an index, then actually posting the task to \`workers[index].postMessage(task)\` in a real pool.`,
    starterCode: `function createWorkerPool(workerCount) {
  // return { dispatch(), getLoads() }
}`,
    solutionCode: `function createWorkerPool(workerCount) {
  let next = 0;
  const loads = new Array(workerCount).fill(0);
  return {
    dispatch() {
      const worker = next % workerCount;
      loads[worker] += 1;
      next += 1;
      return worker;
    },
    getLoads() {
      return loads.slice();
    },
  };
}`,
    testCases: [
      {
        input: "5 dispatches on a 3-worker pool",
        expected: "[0, 1, 2, 0, 1]",
        label: "Assigns workers round-robin",
      },
      {
        input: "getLoads() after 5 dispatches on a 3-worker pool",
        expected: "[2, 2, 1]",
        label: "Tracks each worker's task count correctly",
      },
      { input: "a 1-worker pool, 3 dispatches", expected: "[0, 0, 0]", label: "A single-worker pool always assigns index 0" },
      { input: "4 dispatches on a 2-worker pool", expected: "loads: [2, 2]", label: "Splits evenly across an even number of dispatches" },
    ],
    isPremium: true,
    orderIndex: 22,
  },

  {
    slug: "mini-jsx-renderer",
    conceptSlug: "jsx-virtual-dom",
    title: "Build a Mini JSX Renderer",
    description: `Build the function that turns a Virtual DOM tree into real HTML — the missing half of what a JSX compiler sets up, completing the loop from \`<button>Save</button>\` to actual markup.

## The problem

\`createElement\`-style calls produce plain \`{ type, props }\` objects, not HTML — something still has to walk that tree and turn it into markup a browser can render. Real React does this with the DOM API directly; a static renderer (like this project) does it by building an HTML string instead.

## The idea

Recursively walk the vnode tree: a string/number child is text, rendered as-is; an object vnode renders as \`<type attrs>...children...</type>\`; a \`false\`/\`null\`/\`undefined\` child (from conditional rendering) renders as nothing at all.

## Your task

Write \`render(vnode)\` returning an HTML string for a vnode shaped like \`{ type, props }\`, where \`props.children\` may be a string, a single vnode, an array of any mix of strings/vnodes/\`false\`/\`null\`, and any other key in \`props\` is a plain attribute.

Wire this into a real page once it passes — take a vnode tree and actually mount its rendered HTML string into a container element.`,
    starterCode: `function render(vnode) {
  // recursively turn a { type, props } vnode tree into an HTML string
}`,
    solutionCode: `function render(vnode) {
  if (vnode === null || vnode === undefined || vnode === false) return "";
  if (typeof vnode === "string" || typeof vnode === "number") return String(vnode);

  const { type, props } = vnode;
  const { children, ...attrs } = props || {};
  const attrString = Object.keys(attrs)
    .map((key) => " " + key + '="' + attrs[key] + '"')
    .join("");
  const childList = Array.isArray(children) ? children : [children];
  const innerHTML = childList.map(render).join("");
  return "<" + type + attrString + ">" + innerHTML + "</" + type + ">";
}`,
    testCases: [
      { input: `render({ type: "div", props: { children: [] } })`, expected: `"<div></div>"`, label: "An empty children array renders as an empty tag" },
      {
        input: `render({ type: "button", props: { className: "primary", children: "Save" } })`,
        expected: `'<button className="primary">Save</button>'`,
        label: "Attributes and a single text child both render correctly",
      },
      {
        input: `render({ type: "div", props: { children: [false, "a", null] } })`,
        expected: `"<div>a</div>"`,
        label: "false/null children from conditional rendering are skipped entirely",
      },
      {
        input: `render({ type: "div", props: { children: { type: "span", props: { children: "hi" } } } })`,
        expected: `"<div><span>hi</span></div>"`,
        label: "Nested vnodes render recursively",
      },
    ],
    isPremium: false,
    orderIndex: 23,
  },

  {
    slug: "autosave-dirty-fields",
    conceptSlug: "usestate-useeffect-fundamentals",
    title: "Build an Auto-Saving Form",
    description: `Build the piece that decides *when* an auto-save effect should actually fire — the same kind of comparison useEffect's dependency array runs internally, applied to a form's fields.

## The problem

An auto-saving form shouldn't fire a save request on every render — only when a field actually changed since the last save. Saving unconditionally on every render wastes requests; comparing the wrong things means missing real edits or re-saving unchanged data.

## The idea

Compare each field in the current values against the last-saved snapshot with \`Object.is\` — the same comparison React itself uses for dependency arrays. Any field where the two differ (including a brand-new field that wasn't in the last snapshot at all) is "dirty" and belongs in the next save.

## Your task

Write \`getDirtyFields(initial, current)\` returning an array of the field names in \`current\` whose value differs from \`initial\`'s value for that same key.

Wire this into a real form: call it inside a debounced \`useEffect\` and only POST the fields it returns.`,
    starterCode: `function getDirtyFields(initial, current) {
  // return the keys of \`current\` whose value differs from \`initial\`
}`,
    solutionCode: `function getDirtyFields(initial, current) {
  return Object.keys(current).filter((key) => !Object.is(initial[key], current[key]));
}`,
    testCases: [
      {
        input: `getDirtyFields({ name: "Ana", email: "a@x.com" }, { name: "Ana", email: "b@x.com" })`,
        expected: `["email"]`,
        label: "Only the field that actually changed is flagged dirty",
      },
      {
        input: `getDirtyFields({ name: "Ana" }, { name: "Ana" })`,
        expected: "[]",
        label: "Identical values produce no dirty fields",
      },
      {
        input: `getDirtyFields({ name: "Ana" }, { name: "Ana", phone: "555" })`,
        expected: `["phone"]`,
        label: "A brand-new field not present in the initial snapshot counts as dirty",
      },
      {
        input: `getDirtyFields({ age: NaN }, { age: NaN })`,
        expected: "[]",
        label: "Object.is treats NaN as equal to itself, so it is not flagged dirty",
      },
    ],
    isPremium: false,
    orderIndex: 24,
  },

  {
    slug: "multi-step-form-validator",
    conceptSlug: "controlled-vs-uncontrolled-forms",
    title: "Build a Multi-Step Form Wizard",
    description: `Build the validator that decides whether a controlled multi-step form can advance to the next step — the gatekeeper every "Next" button in a wizard actually calls.

## The problem

A multi-step form (signup, checkout) shouldn't let the user advance past a step with missing required fields or invalid formats — but each step usually only cares about a handful of its own fields, not the whole form's schema.

## The idea

Each step has a schema describing its own fields: whether each is required, and an optional pattern it must match if a value is present. A field only fails validation if it's required and empty, or if it has a value that doesn't match its pattern — an empty, non-required field is always fine.

## Your task

Write \`validateStep(schema, values)\`, where \`schema\` is \`{ [field]: { required: boolean, pattern?: RegExp } }\` and \`values\` is \`{ [field]: string }\`. Return an array of the field names that fail validation.

Wire this into a real 3-step wizard: block the "Next" button while \`validateStep\` returns any errors for the current step.`,
    starterCode: `function validateStep(schema, values) {
  // return the field names in \`schema\` that fail validation against \`values\`
}`,
    solutionCode: `function validateStep(schema, values) {
  const errors = [];
  for (const field of Object.keys(schema)) {
    const rule = schema[field];
    const value = values[field];
    const isEmpty = value === undefined || value === null || value === "";
    if (rule.required && isEmpty) {
      errors.push(field);
      continue;
    }
    if (!isEmpty && rule.pattern && !rule.pattern.test(value)) {
      errors.push(field);
    }
  }
  return errors;
}`,
    testCases: [
      {
        input: `validateStep({ email: { required: true } }, { email: "" })`,
        expected: `["email"]`,
        label: "A missing required field fails validation",
      },
      {
        input: `validateStep({ nickname: { required: false } }, {})`,
        expected: "[]",
        label: "A missing optional field never fails validation",
      },
      {
        input: `validateStep({ zip: { required: true, pattern: /^\\d{5}$/ } }, { zip: "abc" })`,
        expected: `["zip"]`,
        label: "A present value that fails its pattern is flagged",
      },
      {
        input: `validateStep({ email: { required: true }, zip: { required: true, pattern: /^\\d{5}$/ } }, { email: "a@x.com", zip: "94107" })`,
        expected: "[]",
        label: "A fully valid step returns no errors",
      },
    ],
    isPremium: false,
    orderIndex: 25,
  },

  {
    slug: "focus-trap-elements",
    conceptSlug: "useref-imperative-handles",
    title: "Build a Focus-Trap Modal",
    description: `Build the lookup that powers a modal's focus trap — the piece that decides which elements Tab should even be allowed to land on while the modal is open.

## The problem

An accessible modal must trap keyboard focus inside itself — Tab should cycle only through the modal's own focusable elements, never escaping to the page underneath. That starts with correctly identifying which elements in the modal actually are focusable in the first place.

## The idea

An element is focusable if it isn't hidden or disabled, its \`tabIndex\` isn't explicitly \`-1\` (removed from the tab order), and it's either a naturally-focusable tag (\`button\`, \`input\`, \`select\`, \`textarea\`, \`a\`) or has an explicit non-negative \`tabIndex\` (like a \`div\` with \`tabIndex={0}\`).

## Your task

Write \`getFocusableElements(nodes)\`, where each node is \`{ id, tag, disabled, hidden, tabIndex }\`. Return the \`id\`s of every focusable node, in their original order.

Wire this into a real modal: use \`useRef\` on the container, call this over its actual children on mount, and cycle \`Tab\`/\`Shift+Tab\` between only those elements.`,
    starterCode: `function getFocusableElements(nodes) {
  // return the ids of focusable nodes, in order
}`,
    solutionCode: `function getFocusableElements(nodes) {
  const FOCUSABLE_TAGS = ["button", "input", "select", "textarea", "a"];
  return nodes
    .filter((node) => {
      if (node.hidden || node.disabled) return false;
      if (node.tabIndex === -1) return false;
      return FOCUSABLE_TAGS.includes(node.tag) || node.tabIndex >= 0;
    })
    .map((node) => node.id);
}`,
    testCases: [
      {
        input: `getFocusableElements([{ id: "btn", tag: "button", disabled: false }, { id: "input", tag: "input", disabled: true }])`,
        expected: `["btn"]`,
        label: "A disabled element is excluded even though its tag is naturally focusable",
      },
      {
        input: `getFocusableElements([{ id: "custom", tag: "div", tabIndex: 0 }])`,
        expected: `["custom"]`,
        label: "A div with an explicit non-negative tabIndex is focusable",
      },
      {
        input: `getFocusableElements([{ id: "removed", tag: "button", tabIndex: -1 }])`,
        expected: "[]",
        label: "tabIndex -1 removes an otherwise-focusable element from the tab order",
      },
      {
        input: `getFocusableElements([{ id: "a", tag: "input" }, { id: "b", tag: "div" }, { id: "c", tag: "a" }])`,
        expected: `["a", "c"]`,
        label: "Order is preserved, and non-focusable plain tags are dropped",
      },
    ],
    isPremium: true,
    orderIndex: 26,
  },

  {
    slug: "resolve-theme-value",
    conceptSlug: "context-api-prop-drilling",
    title: "Build a Theme Switcher",
    description: `Build the resolution logic behind nested Context providers — given a stack of nested theme values, figure out which one a consumer actually sees for a given key.

## The problem

A component reads whatever value the *nearest* ancestor Provider set — a \`<ThemeContext.Provider value={{ accent: 'blue' }}>\` nested inside another one with \`value={{ accent: 'red', bg: 'white' }}\` means a consumer inside both sees \`accent: 'blue'\` (the nearer one wins) but still falls back to \`bg: 'white'\` from the outer one, since the inner provider never set \`bg\` at all.

## The idea

Walk the provider stack from nearest to farthest, and return the first value found that actually defines the requested key — not just the nearest provider overall, since a nearer provider might not set every key.

## Your task

Write \`resolveThemeValue(providerStack, key)\`, where \`providerStack\` is an array of value objects ordered nearest-first. Return the first defined value for \`key\`, or \`undefined\` if no provider in the stack sets it.

Wire this into a real nested theme switcher: a \`<ThemeProvider>\` per section of the page, each overriding only the keys it cares about.`,
    starterCode: `function resolveThemeValue(providerStack, key) {
  // walk nearest-to-farthest, return the first value that defines key
}`,
    solutionCode: `function resolveThemeValue(providerStack, key) {
  for (const values of providerStack) {
    if (values && Object.prototype.hasOwnProperty.call(values, key)) {
      return values[key];
    }
  }
  return undefined;
}`,
    testCases: [
      {
        input: `resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "accent")`,
        expected: `"blue"`,
        label: "The nearest provider's value wins when both define the key",
      },
      {
        input: `resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "bg")`,
        expected: `"white"`,
        label: "Falls through to a farther provider for a key the nearer one never set",
      },
      {
        input: `resolveThemeValue([{ accent: "blue" }], "font")`,
        expected: "undefined",
        label: "Returns undefined when no provider in the stack defines the key",
      },
      {
        input: `resolveThemeValue([{}, { accent: "red" }], "accent")`,
        expected: `"red"`,
        label: "Skips a nearer provider that doesn't define the key at all",
      },
    ],
    isPremium: true,
    orderIndex: 27,
  },

  {
    slug: "accordion-toggle-state",
    conceptSlug: "component-composition-patterns",
    title: "Build an Accordion",
    description: `Build the state transition behind an accordion's open/close behavior — the logic a compound \`<Accordion>\`/\`<Accordion.Item>\` API shares internally through Context.

## The problem

An accordion can allow multiple sections open at once, or restrict it to exactly one at a time — and clicking an already-open section should close it either way. Getting this transition right (and doing it immutably, since it drives a re-render) is the actual state-management core of the component; the compound-component wiring around it is just plumbing.

## The idea

In multiple-open mode, clicking a section simply toggles its own membership in the open set. In single-open mode, clicking the currently-open section closes everything, and clicking any other section replaces the open set with just that one item.

## Your task

Write \`toggleAccordionItem(openIds, itemId, allowMultiple)\` returning the **new** array of open item ids — never mutate \`openIds\`.

Wire this into a real accordion with 4 sections, toggling between single-open and multiple-open modes via a prop.`,
    starterCode: `function toggleAccordionItem(openIds, itemId, allowMultiple) {
  // return a NEW array — don't mutate openIds
}`,
    solutionCode: `function toggleAccordionItem(openIds, itemId, allowMultiple) {
  const isOpen = openIds.includes(itemId);
  if (allowMultiple) {
    return isOpen ? openIds.filter((id) => id !== itemId) : [...openIds, itemId];
  }
  return isOpen ? [] : [itemId];
}`,
    testCases: [
      {
        input: `toggleAccordionItem(["a"], "b", true)`,
        expected: `["a", "b"]`,
        label: "Multiple-open mode adds a newly clicked section",
      },
      {
        input: `toggleAccordionItem(["a", "b"], "a", true)`,
        expected: `["b"]`,
        label: "Multiple-open mode removes an already-open section when clicked again",
      },
      {
        input: `toggleAccordionItem(["a"], "b", false)`,
        expected: `["b"]`,
        label: "Single-open mode replaces the open section with the newly clicked one",
      },
      {
        input: `toggleAccordionItem(["a"], "a", false)`,
        expected: "[]",
        label: "Single-open mode closes everything when the already-open section is clicked again",
      },
    ],
    isPremium: true,
    orderIndex: 28,
  },

  {
    slug: "use-undo-reducer",
    conceptSlug: "custom-hooks-composition",
    title: "Build a useUndo Custom Hook",
    description: `Build the reducer behind a reusable \`useUndo\` custom hook — the classic past/present/future history pattern shared by every undo-able editor.

## The problem

Undo/redo needs more than just the current value — it needs a history of past values to step back into, and a "redo" stack to step forward into again after an undo, which gets cleared the moment a genuinely new change is made.

## The idea

State is \`{ past: [], present, future: [] }\`. Setting a new value pushes the current \`present\` onto \`past\` and clears \`future\` entirely (a new branch of history invalidates any "redo" path). Undo pops the last \`past\` entry into \`present\` and pushes the old \`present\` onto the front of \`future\`. Redo does the mirror image.

## Your task

Write \`undoReducer(state, action)\`, where \`action\` is \`{ type: 'SET' | 'UNDO' | 'REDO', payload }\`. \`UNDO\` with an empty \`past\` (or \`REDO\` with an empty \`future\`) must return the state unchanged.

Wire this into a real \`useUndo(initialValue)\` hook (\`useReducer(undoReducer, ...)\`) and use it in a small text editor with Undo/Redo buttons.`,
    starterCode: `function undoReducer(state, action) {
  // state: { past: [], present, future: [] }
}`,
    solutionCode: `function undoReducer(state, action) {
  switch (action.type) {
    case "SET": {
      if (Object.is(action.payload, state.present)) return state;
      return { past: [...state.past, state.present], present: action.payload, future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}`,
    testCases: [
      {
        input: `undoReducer({ past: [], present: "a", future: [] }, { type: "SET", payload: "b" })`,
        expected: `{ past: ["a"], present: "b", future: [] }`,
        label: "SET pushes the current present into past and clears future",
      },
      {
        input: `undoReducer({ past: ["a"], present: "b", future: [] }, { type: "UNDO" })`,
        expected: `{ past: [], present: "a", future: ["b"] }`,
        label: "UNDO restores the previous value and moves the current one into future",
      },
      {
        input: `undoReducer({ past: [], present: "a", future: ["b"] }, { type: "REDO" })`,
        expected: `{ past: ["a"], present: "b", future: [] }`,
        label: "REDO restores the next future value and pushes the current one back into past",
      },
      {
        input: `undoReducer({ past: [], present: "a", future: [] }, { type: "UNDO" })`,
        expected: `{ past: [], present: "a", future: [] }`,
        label: "UNDO with no history is a no-op",
      },
    ],
    isPremium: true,
    orderIndex: 29,
  },

  {
    slug: "resolve-error-fallback",
    conceptSlug: "error-boundaries",
    title: "Build an Error-Resilient Dashboard",
    description: `Build the routing logic behind a dashboard where different widgets show different, purpose-built fallback UIs instead of one generic "Something went wrong" for every crash.

## The problem

A single generic fallback treats a network-timeout error in a chart widget the same as a corrupt-data error in a table widget — but a real dashboard usually wants a distinct fallback per error type (a "retry" UI for a network error, a "report a bug" UI for anything unexpected).

## The idea

Each widget's Error Boundary is configured with a map from error name to a fallback key. Looking up the thrown error's \`name\` in that map gives the right fallback; anything not explicitly mapped falls back to a \`default\` entry instead of crashing the lookup itself.

## Your task

Write \`getFallbackForError(error, fallbackMap)\`, where \`error\` is \`{ name: string }\` and \`fallbackMap\` is \`{ [errorName]: fallbackKey, default: fallbackKey }\`. Return the matching fallback key, or \`fallbackMap.default\` if \`error.name\` isn't a key in the map.

Wire this into a real dashboard: give each widget its own Error Boundary, and render the fallback key this function returns as the actual fallback component.`,
    starterCode: `function getFallbackForError(error, fallbackMap) {
  // look up error.name in fallbackMap, falling back to fallbackMap.default
}`,
    solutionCode: `function getFallbackForError(error, fallbackMap) {
  return Object.prototype.hasOwnProperty.call(fallbackMap, error.name)
    ? fallbackMap[error.name]
    : fallbackMap.default;
}`,
    testCases: [
      {
        input: `getFallbackForError({ name: "NetworkError" }, { NetworkError: "retry-banner", default: "generic-error" })`,
        expected: `"retry-banner"`,
        label: "A mapped error name resolves to its specific fallback",
      },
      {
        input: `getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner", default: "generic-error" })`,
        expected: `"generic-error"`,
        label: "An unmapped error name falls back to the default entry",
      },
      {
        input: `getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner" })`,
        expected: "undefined",
        label: "With no default entry, an unmapped error resolves to undefined",
      },
      {
        input: `getFallbackForError({ name: "AuthError" }, { NetworkError: "retry-banner", AuthError: "login-prompt", default: "generic-error" })`,
        expected: `"login-prompt"`,
        label: "Different widgets' maps can route the same kind of error to different fallbacks",
      },
    ],
    isPremium: true,
    orderIndex: 30,
  },

  {
    slug: "diff-changed-rows",
    conceptSlug: "render-performance-memoization",
    title: "Build a Memoized Data Table",
    description: `Build the comparison a memoized data table actually needs — given the previous and next set of rows, figure out which rows genuinely changed, so only those rows' components have to re-render.

## The problem

Re-rendering every row of a large table whenever any single row's data updates wastes work identical to what \`React.memo\` is meant to prevent — but \`memo\` only helps if something first identifies *which* rows actually changed, so the rest can be left alone with stable props.

## The idea

Match rows between the two snapshots by \`id\`. A row with no match in the previous snapshot is new (changed by definition). A row that does have a match is changed only if any of its fields differ from the matching previous row, compared shallowly.

## Your task

Write \`getChangedRows(prevRows, nextRows)\`, where each row is \`{ id, ...fields }\`. Return the \`id\`s (from \`nextRows\`) of every row that is new or has at least one changed field.

Wire this into a real table: wrap each row component in \`React.memo\`, and only pass a changed \`key\`/prop reference for the ids this function returns.`,
    starterCode: `function getChangedRows(prevRows, nextRows) {
  // return the ids of rows in nextRows that are new or have a changed field
}`,
    solutionCode: `function rowsShallowEqual(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

function getChangedRows(prevRows, nextRows) {
  const prevById = new Map(prevRows.map((row) => [row.id, row]));
  return nextRows
    .filter((row) => {
      const prev = prevById.get(row.id);
      if (!prev) return true;
      return !rowsShallowEqual(prev, row);
    })
    .map((row) => row.id);
}`,
    testCases: [
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }])`,
        expected: "[]",
        label: "An unchanged row is not reported as changed",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 12 }])`,
        expected: `["1"]`,
        label: "A row with a changed field is reported",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }, { id: "2", price: 5 }])`,
        expected: `["2"]`,
        label: "A brand-new row (no match in prevRows) is always reported",
      },
      {
        input: `getChangedRows([{ id: "1", price: 10 }, { id: "2", price: 5 }], [{ id: "1", price: 11 }, { id: "2", price: 5 }])`,
        expected: `["1"]`,
        label: "Only the actually-changed row is reported, not every row",
      },
    ],
    isPremium: true,
    orderIndex: 31,
  },

  {
    slug: "merge-transition-results",
    conceptSlug: "concurrent-react-suspense",
    title: "Build a Search-as-You-Type UI with Transitions",
    description: `Build the decision a search-as-you-type UI has to make on every keystroke while a transition-wrapped search is still pending: keep showing the last real results, or show the newly-arrived ones?

## The problem

Wrapping a search update in \`startTransition\` keeps the input responsive, but the UI still needs to decide what to render *while* that transition is pending — showing nothing looks broken, and showing half-computed results is worse than showing the previous, complete results with a "stale" indicator.

## The idea

While a transition is still pending, keep rendering the previous results (marked stale, so the UI can dim them or show a spinner alongside). The moment the transition resolves, switch fully to the new results and clear the stale flag.

## Your task

Write \`mergeTransitionResults(previousResults, incomingResults, isPending)\` returning \`{ results, stale }\`.

Wire this into a real search box: call this inside the component using \`useTransition\`'s \`isPending\` flag, and dim the results list whenever \`stale\` is true.`,
    starterCode: `function mergeTransitionResults(previousResults, incomingResults, isPending) {
  // return { results, stale }
}`,
    solutionCode: `function mergeTransitionResults(previousResults, incomingResults, isPending) {
  if (isPending) {
    return { results: previousResults, stale: true };
  }
  return { results: incomingResults, stale: false };
}`,
    testCases: [
      {
        input: `mergeTransitionResults(["a", "b"], ["c"], true)`,
        expected: `{ results: ["a", "b"], stale: true }`,
        label: "While pending, the previous results are kept and marked stale",
      },
      {
        input: `mergeTransitionResults(["a", "b"], ["c"], false)`,
        expected: `{ results: ["c"], stale: false }`,
        label: "Once resolved, the incoming results replace the previous ones",
      },
      {
        input: `mergeTransitionResults([], ["c"], true)`,
        expected: `{ results: [], stale: true }`,
        label: "An empty previous result set stays empty while pending, rather than showing incoming results early",
      },
      {
        input: `mergeTransitionResults(["a"], ["a"], false)`,
        expected: `{ results: ["a"], stale: false }`,
        label: "Resolving to identical results still clears the stale flag",
      },
    ],
    isPremium: true,
    orderIndex: 32,
  },

  {
    slug: "memoized-selector",
    conceptSlug: "state-management-tradeoffs",
    title: "Build a Shopping Cart with Selector-Based State",
    description: `Build the memoization wrapper behind selector-based state libraries (Redux + Reselect, Zustand selectors) — the piece that lets a component subscribe to a derived value without recomputing it on every single state change.

## The problem

Deriving a cart total from a list of items is cheap once, but recomputing it on every render — even when the cart hasn't changed — adds up in a large app, and a derived value recomputed with a new object/array reference every time also defeats any \`memo\`-wrapped consumer downstream.

## The idea

Cache the last arguments a selector was called with alongside its result. If the next call's arguments are the same (shallow, in order, via \`Object.is\`), return the cached result without invoking the selector function again; otherwise recompute and cache the new result.

## Your task

Write \`createSelector(selectorFn)\` returning a memoized version of \`selectorFn\` — calling it with the same arguments as last time must not invoke \`selectorFn\` again.

Wire this into a real cart: create a \`selectCartTotal = createSelector((items) => items.reduce(...))\` and confirm (e.g. with a call counter) it isn't recomputed on unrelated re-renders.`,
    starterCode: `function createSelector(selectorFn) {
  // return a memoized version of selectorFn
}`,
    solutionCode: `function createSelector(selectorFn) {
  let lastArgs = null;
  let lastResult;
  return function (...args) {
    const sameArgs =
      lastArgs !== null &&
      lastArgs.length === args.length &&
      lastArgs.every((arg, i) => Object.is(arg, args[i]));
    if (sameArgs) return lastResult;
    lastArgs = args;
    lastResult = selectorFn(...args);
    return lastResult;
  };
}`,
    testCases: [
      {
        input: "a selector counting its own calls, invoked twice with the identical array reference",
        expected: "the selector function itself is only actually invoked once",
        label: "Calling with the same arguments returns the cached result without recomputing",
      },
      {
        input: "the same selector invoked with two different array references",
        expected: "the selector function is invoked again and returns the new, correct result",
        label: "Calling with different arguments recomputes and returns the new result",
      },
      {
        input: `createSelector((items) => items.reduce((sum, i) => sum + i.price, 0))([{ price: 10 }, { price: 5 }])`,
        expected: "15",
        label: "The memoized selector still returns the selector function's real result",
      },
      {
        input: "the selector called with (1, 2) then with (2, 1)",
        expected: "recomputed, since argument order is part of what defines 'the same arguments'",
        label: "A different argument order counts as different arguments",
      },
    ],
    isPremium: true,
    orderIndex: 33,
  },

  // ── Phase 10 (Feature 44) — CSS Concepts ──────────────────────────────────
  {
    slug: "box-model-inspector",
    conceptSlug: "the-box-model",
    title: "Build a Box Model Inspector",
    description: `Build the calculation behind a browser DevTools-style box model panel — given a declared size and box-sizing mode, report every layer's actual dimensions.

## The problem

DevTools' box model overlay shows content, padding, border, and margin as separate numbers, worked out from whatever mix of \`width\`, padding, and border was actually declared — the exact math depends on \`box-sizing\`.

## The idea

Under \`content-box\`, the declared width IS the content width, and padding/border are added on top to get the rendered width. Under \`border-box\`, the declared width IS the rendered width, and the content width is what's left over after subtracting padding and border.

## Your task

Write \`computeBoxDimensions({ width, height, padding, border, boxSizing })\`. Return \`{ contentWidth, contentHeight, renderedWidth, renderedHeight }\` (padding/border apply to both sides of each axis).

\`\`\`js
computeBoxDimensions({ width: 200, height: 100, padding: 20, border: 2, boxSizing: "border-box" })
// → { contentWidth: 156, contentHeight: 56, renderedWidth: 200, renderedHeight: 100 }
\`\`\`

Once this passes, imagine wiring it up to a live overlay that redraws the four nested boxes to scale as a user edits the inputs — exactly what a DevTools box model panel does.`,
    starterCode: `function computeBoxDimensions({ width, height, padding, border, boxSizing }) {
  // return { contentWidth, contentHeight, renderedWidth, renderedHeight }
}`,
    solutionCode: `function computeBoxDimensions({ width, height, padding, border, boxSizing }) {
  const extra = (padding + border) * 2;
  if (boxSizing === "border-box") {
    return {
      contentWidth: width - extra,
      contentHeight: height - extra,
      renderedWidth: width,
      renderedHeight: height,
    };
  }
  return {
    contentWidth: width,
    contentHeight: height,
    renderedWidth: width + extra,
    renderedHeight: height + extra,
  };
}`,
    testCases: [
      {
        input: "{ width:200, height:100, padding:20, border:2, boxSizing:'border-box' }",
        expected: "{ contentWidth:156, contentHeight:56, renderedWidth:200, renderedHeight:100 }",
        label: "border-box: rendered size matches the declared width/height exactly",
      },
      {
        input: "{ width:200, height:100, padding:20, border:2, boxSizing:'content-box' }",
        expected: "{ contentWidth:200, contentHeight:100, renderedWidth:244, renderedHeight:144 }",
        label: "content-box: rendered size grows beyond the declared width/height",
      },
      {
        input: "{ width:100, height:100, padding:0, border:0, boxSizing:'content-box' }",
        expected: "{ contentWidth:100, contentHeight:100, renderedWidth:100, renderedHeight:100 }",
        label: "Zero padding/border renders identically under either mode",
      },
    ],
    isPremium: false,
    orderIndex: 34,
  },

  {
    slug: "responsive-style-resolver",
    conceptSlug: "units-sizing",
    title: "Build a Responsive Style Resolver",
    description: `Build the resolver behind a "computed styles" panel — given a component's declared styles in mixed units, resolve every value to a final pixel number for a given context.

## The problem

A component's styles might mix \`rem\` (root-relative), \`em\` (parent-relative), and \`vw\` (viewport-relative) — each resolves differently depending on where the component actually renders, which is exactly why "it works standalone but breaks nested" bugs happen.

## The idea

Parse each declared value into a number and a unit, then resolve it against the right piece of context: \`rootFontSize\` for \`rem\`, \`parentFontSize\` for \`em\`, \`viewportWidth\`/\`viewportHeight\` for \`vw\`/\`vh\`, and pass \`px\` straight through.

## Your task

Write \`resolveStyles(styleMap, context)\`, where \`styleMap\` is \`{ [property]: "<number><unit>" }\` (e.g. \`"1.5rem"\`) and \`context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }\`. Return an object with the same keys, each resolved to a plain pixel number.

\`\`\`js
resolveStyles({ padding: "1rem", fontSize: "1.2em", width: "50vw" }, { rootFontSize: 16, parentFontSize: 20, viewportWidth: 1000 })
// → { padding: 16, fontSize: 24, width: 500 }
\`\`\`

Once this passes, imagine feeding it a component's real declared styles plus its live rendering context, to power a "computed styles" panel that always shows accurate pixel values regardless of how deeply the component is nested.`,
    starterCode: `function resolveStyles(styleMap, context) {
  // styleMap: { [property]: "<number><unit>" }
}`,
    solutionCode: `function resolveLength(value, unit, context) {
  switch (unit) {
    case "px": return value;
    case "rem": return value * context.rootFontSize;
    case "em": return value * context.parentFontSize;
    case "vw": return (value / 100) * context.viewportWidth;
    case "vh": return (value / 100) * context.viewportHeight;
    default: throw new Error(\`Unknown unit: \${unit}\`);
  }
}

function resolveStyles(styleMap, context) {
  const result = {};
  for (const [prop, declared] of Object.entries(styleMap)) {
    const match = declared.match(/^(-?[\\d.]+)([a-z%]+)$/);
    const [, num, unit] = match;
    result[prop] = resolveLength(parseFloat(num), unit, context);
  }
  return result;
}`,
    testCases: [
      {
        input: "{ padding:'1rem', fontSize:'1.2em', width:'50vw' }, { rootFontSize:16, parentFontSize:20, viewportWidth:1000 }",
        expected: "{ padding:16, fontSize:24, width:500 }",
        label: "Resolves a mixed rem/em/vw style object against the given context",
      },
      {
        input: "{ margin:'8px' }, {}",
        expected: "{ margin:8 }",
        label: "px values pass through unchanged, independent of context",
      },
      {
        input: "{ height:'2rem' }, { rootFontSize:10 }",
        expected: "{ height:20 }",
        label: "Multiple rem values all resolve against the same root font-size",
      },
    ],
    isPremium: false,
    orderIndex: 35,
  },

  {
    slug: "computed-style-engine",
    conceptSlug: "the-cascade-inheritance",
    title: "Build a Computed Style Engine",
    description: `Build the two-step lookup a browser actually performs to answer "what's this element's computed value for this property?" — cascade first, inheritance second.

## The problem

If no rule at all targets an element for a given property, the browser doesn't just give up — inheritable properties fall back to the parent's own computed value, walking up until either a rule wins or the root's initial value is reached.

## The idea

First, resolve the cascade among any rules that directly target this element (importance → specificity → source order, same as the CSS Specificity concept). If nothing targets it and the property is inheritable, recurse upward to the parent. If nothing targets it anywhere in the chain, fall back to the property's initial value.

## Your task

Write \`computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue)\`, where \`tree\` is \`{ id, parentId }[]\` and \`declarationsByElement[elementId][property]\` is an array of \`{ value, important, specificity, order }\`.

\`\`\`js
computedValue("child", "color", tree, { root: { color: [{ value: "navy", important: false, specificity: [0,0,1], order: 0 }] } }, true, "black")
// → "navy" — no rule targets "child" directly, so it inherits from "root"
\`\`\``,
    starterCode: `function computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue) {
  // tree: { id, parentId }[]
}`,
    solutionCode: `function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function resolveCascade(declarations) {
  return declarations.reduce((winner, d) => {
    if (!winner) return d;
    if (d.important !== winner.important) return d.important ? d : winner;
    const cmp = compareSpecificity(d.specificity, winner.specificity);
    if (cmp !== 0) return cmp > 0 ? d : winner;
    return d.order >= winner.order ? d : winner;
  }, null).value;
}

function computedValue(elementId, property, tree, declarationsByElement, inheritable, initialValue) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  const own = declarationsByElement[elementId]?.[property];
  if (own && own.length > 0) return resolveCascade(own);

  const parentId = byId[elementId]?.parentId;
  if (inheritable && parentId != null) {
    return computedValue(parentId, property, tree, declarationsByElement, inheritable, initialValue);
  }
  return initialValue;
}`,
    testCases: [
      {
        input: "'child' has no color rule, its parent 'root' does, color is inheritable",
        expected: "root's resolved color",
        label: "Falls back to the nearest ancestor's computed value when inheritable",
      },
      {
        input: "'child' has its own color rule",
        expected: "child's own resolved value",
        label: "An element's own cascade-won rule always wins before inheritance is considered",
      },
      {
        input: "no element in the chain has a margin rule, margin is not inheritable",
        expected: "the initial value",
        label: "A non-inheritable property with no matching rule falls back to its initial value, not the parent's",
      },
    ],
    isPremium: false,
    orderIndex: 36,
  },

  {
    slug: "flex-line-layout-engine",
    conceptSlug: "flexbox-vs-grid",
    title: "Build a Flex Line Layout Engine",
    description: `Extend a flex distribution calculator to handle \`flex-wrap: wrap\` — splitting items across multiple lines and distributing space independently per line.

## The problem

Without wrapping, items simply shrink to fit one line. With \`flex-wrap: wrap\`, items that don't fit spill onto a new line instead — and each line then distributes its own leftover space independently, with no awareness of the other lines.

## The idea

Walk the items in order, accumulating basis widths onto the current line. Once adding the next item's basis would overflow the container (and the line isn't empty), start a new line. Once every line is built, distribute each line's own leftover space across its own items by \`flex-grow\`, exactly like a non-wrapping flex container would.

## Your task

Write \`layoutFlexLines(items, containerWidth)\`, where each item is \`{ basis, grow }\`. Return an array of lines, each an array of that line's items' final widths.

\`\`\`js
layoutFlexLines([{ basis: 150, grow: 1 }, { basis: 150, grow: 1 }, { basis: 150, grow: 1 }], 300)
// → [[150, 150], [300]] — the first two fill line one exactly, the third wraps alone and grows to fill its own line
\`\`\`

Once this passes, imagine feeding it a real card grid's item widths and container size to preview exactly how many cards fit per row before a single pixel is rendered.`,
    starterCode: `function layoutFlexLines(items, containerWidth) {
  // items: [{ basis, grow }]
}`,
    solutionCode: `function layoutFlexLines(items, containerWidth) {
  const lines = [];
  let currentLine = [];
  let currentBasisTotal = 0;

  for (const item of items) {
    if (currentLine.length > 0 && currentBasisTotal + item.basis > containerWidth) {
      lines.push(currentLine);
      currentLine = [];
      currentBasisTotal = 0;
    }
    currentLine.push(item);
    currentBasisTotal += item.basis;
  }
  if (currentLine.length > 0) lines.push(currentLine);

  return lines.map((line) => {
    const totalBasis = line.reduce((sum, i) => sum + i.basis, 0);
    const totalGrow = line.reduce((sum, i) => sum + i.grow, 0);
    const extra = containerWidth - totalBasis;
    if (totalGrow === 0 || extra <= 0) return line.map((i) => i.basis);
    return line.map((i) => i.basis + (i.grow / totalGrow) * extra);
  });
}`,
    testCases: [
      {
        input: "[{150,1},{150,1},{150,1}], 300",
        expected: "[[150, 150], [300]]",
        label: "Items that don't fit wrap onto a new line, which grows independently",
      },
      {
        input: "[{100,1},{100,1}], 300",
        expected: "[[150, 150]]",
        label: "Items that all fit on one line never wrap, and share leftover space together",
      },
      {
        input: "[{200,0},{200,0},{200,0}], 400",
        expected: "[[200, 200], [200]]",
        label: "grow: 0 items still wrap correctly, they just never expand past their basis",
      },
    ],
    isPremium: false,
    orderIndex: 37,
  },

  {
    slug: "full-paint-order-resolver",
    conceptSlug: "positioning-stacking-contexts",
    title: "Build a Full Paint-Order Resolver",
    description: `Extend a "topmost element" check into a full paint-order resolver — the same tool a DevTools "3D view" of stacking contexts is built on.

## The problem

Knowing which single element is on top isn't enough to debug a real layering bug — you need the *entire* back-to-front order, so you can see exactly where an unexpected element sits relative to everything else.

## The idea

Every element's position in the final paint order is decided by its full z-index path from the root down to itself, compared level by level — exactly like specificity tuples. Sorting all elements by that path (with array position breaking any exact tie) produces the complete bottom-to-top order in one pass.

## Your task

Write \`paintOrder(elements)\`, where each element is \`{ id, zIndex, parentId }\`. Return an array of every \`id\`, sorted from bottom (painted first) to top (painted last).

\`\`\`js
paintOrder([
  { id: "a", zIndex: 1, parentId: null },
  { id: "a-inner", zIndex: 9999, parentId: "a" },
  { id: "b", zIndex: 2, parentId: null },
])
// → ["a", "a-inner", "b"] — a-inner paints above a (its own context), but the whole "a" branch stays below "b"
\`\`\`

Once this passes, imagine rendering each id as a labeled layer in a 3D stack view, exactly matching what a real stacking-context DevTools panel visualizes.`,
    starterCode: `function paintOrder(elements) {
  // elements: [{ id, zIndex, parentId }]
}`,
    solutionCode: `function paintOrder(elements) {
  const byId = Object.fromEntries(elements.map((el, index) => [el.id, { ...el, index }]));

  function pathOf(id) {
    const el = byId[id];
    const parentPath = el.parentId != null ? pathOf(el.parentId) : [];
    return [...parentPath, el.zIndex];
  }

  function comparePaths(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }

  return elements
    .map((el) => ({ id: el.id, path: pathOf(el.id), index: byId[el.id].index }))
    .sort((a, b) => comparePaths(a.path, b.path) || a.index - b.index)
    .map((el) => el.id);
}`,
    testCases: [
      {
        input: "a(z:1) > a-inner(z:9999), sibling b(z:2)",
        expected: "['a', 'a-inner', 'b']",
        label: "A trapped high z-index still paints above its own ancestor, but the whole branch stays below the sibling context",
      },
      {
        input: "three top-level siblings with zIndex 3, 1, 2",
        expected: "the one with zIndex 1 first, then 2, then 3",
        label: "Top-level siblings sort purely by their own zIndex",
      },
      {
        input: "two top-level siblings with equal zIndex",
        expected: "the earlier one in the input array first",
        label: "Equal zIndex at the same level preserves source order",
      },
    ],
    isPremium: true,
    orderIndex: 38,
  },

  {
    slug: "multi-container-style-resolver",
    conceptSlug: "responsive-design-container-queries",
    title: "Build a Multi-Container Style Resolver",
    description: `Extend a single-container breakpoint matcher to a whole page's worth of independently-sized containers at once — the same lookup a container-query-aware style engine performs on every render.

## The problem

A real page has multiple named containers — a sidebar, a main column, a card grid — each with its own independent width, and each one's components need their own breakpoint resolved independently of the others.

## The idea

Given a map of container widths and a matching map of each container's breakpoint queries, resolve each container's matching value separately using the same "largest minWidth ≤ containerWidth" rule as a single container query.

## Your task

Write \`resolveComponentStyles(containerWidths, queriesByContainer)\`, where \`containerWidths = { [name]: width }\` and \`queriesByContainer = { [name]: { minWidth, value }[] }\`. Return \`{ [name]: resolvedValue }\`.

\`\`\`js
resolveComponentStyles(
  { sidebar: 280, main: 900 },
  {
    sidebar: [{ minWidth: 0, value: "compact" }, { minWidth: 300, value: "wide" }],
    main: [{ minWidth: 0, value: "compact" }, { minWidth: 700, value: "wide" }],
  },
)
// → { sidebar: "compact", main: "wide" } — same query set, different result per container's own width
\`\`\``,
    starterCode: `function resolveComponentStyles(containerWidths, queriesByContainer) {
  // containerWidths: { [name]: width }, queriesByContainer: { [name]: { minWidth, value }[] }
}`,
    solutionCode: `function resolveContainerValue(containerWidth, queries) {
  const sorted = [...queries].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const q of sorted) {
    if (q.minWidth <= containerWidth) match = q;
    else break;
  }
  return match.value;
}

function resolveComponentStyles(containerWidths, queriesByContainer) {
  const result = {};
  for (const [name, width] of Object.entries(containerWidths)) {
    result[name] = resolveContainerValue(width, queriesByContainer[name]);
  }
  return result;
}`,
    testCases: [
      {
        input: "{sidebar:280, main:900}, matching per-container query sets",
        expected: "{ sidebar: 'compact', main: 'wide' }",
        label: "The same query shape resolves differently per container, based on each one's own width",
      },
      {
        input: "a single container below every breakpoint's minWidth",
        expected: "the minWidth: 0 fallback value",
        label: "Falls back to the smallest breakpoint when a container is narrower than every other one",
      },
      {
        input: "three independent containers with three different widths",
        expected: "three independently correct resolved values",
        label: "Each container in the map is resolved independently of the others",
      },
    ],
    isPremium: true,
    orderIndex: 39,
  },

  {
    slug: "multi-property-theme-resolver",
    conceptSlug: "custom-properties-theming",
    title: "Build a Multi-Property Theme Resolver",
    description: `Extend a single custom-property lookup into a full theme resolver — computing every themed value a component actually needs in one call.

## The problem

A real themed component doesn't read just one custom property — it reads several (\`--accent-color\`, \`--surface-bg\`, \`--text-color\`), each independently walking up the same cascade to find its nearest declaration.

## The idea

Resolving a whole theme for a component is just resolving each property name independently, using the same "check this element, then walk up ancestors" lookup — bundled into a single call that returns every requested property's resolved value at once.

## Your task

Write \`resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks)\`, where \`tree\` is \`{ id, parentId }[]\`, \`declarationsByElement[elementId]\` is \`{ [propName]: value }\`, and \`fallbacks\` is \`{ [propName]: value }\`. Return \`{ [propName]: resolvedValue }\` for every name in \`propNames\`.

\`\`\`js
resolveTheme("card", ["--accent", "--surface-bg"], tree, declarations, { "--accent": "black", "--surface-bg": "white" })
// → { "--accent": "cyan", "--surface-bg": "white" } — one resolved, one falls back
\`\`\``,
    starterCode: `function resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks) {
  // tree: { id, parentId }[]
}`,
    solutionCode: `function resolveVar(elementId, propName, tree, declarationsByElement, fallback) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  let current = elementId;
  while (current != null) {
    const decl = declarationsByElement[current];
    if (decl && propName in decl) return decl[propName];
    current = byId[current]?.parentId ?? null;
  }
  return fallback;
}

function resolveTheme(elementId, propNames, tree, declarationsByElement, fallbacks) {
  const result = {};
  for (const propName of propNames) {
    result[propName] = resolveVar(elementId, propName, tree, declarationsByElement, fallbacks[propName]);
  }
  return result;
}`,
    testCases: [
      {
        input: "'card' asking for --accent (declared on an ancestor) and --surface-bg (declared nowhere)",
        expected: "{ '--accent': ancestor's value, '--surface-bg': the fallback }",
        label: "Resolves each requested property independently, mixing found and fallback results",
      },
      {
        input: "'card' declares --accent itself, an ancestor also declares it",
        expected: "card's own value wins for --accent",
        label: "The element's own declaration takes priority over any ancestor's, per property",
      },
      {
        input: "no propNames requested",
        expected: "{}",
        label: "Requesting zero properties returns an empty result object",
      },
    ],
    isPremium: true,
    orderIndex: 40,
  },

  {
    slug: "form-validity-watcher",
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    title: "Build a Form Validity Watcher",
    description: `Extend a \`:has()\`-style descendant check into a real utility — scanning every form on a page and flagging the ones that need attention.

## The problem

\`form:has(:invalid)\` is a single-form check — a real page-level validity watcher needs to scan every form at once and report which ones currently have an invalid field somewhere inside them.

## The idea

Run the same "any descendant matching a predicate" check across a whole list of forms, collecting only the ids of the ones that match — exactly what a page-wide validation summary needs to highlight.

## Your task

Write \`formsNeedingAttention(forms)\`, where each form is \`{ id, tag: "form", children: [] }\` (children may nest arbitrarily deep, e.g. through fieldsets). Return the \`id\`s of every form containing at least one descendant with \`valid: false\`.

\`\`\`js
formsNeedingAttention([
  { id: "signup", tag: "form", children: [{ id: "email", valid: false }] },
  { id: "search", tag: "form", children: [{ id: "query", valid: true }] },
])
// → ["signup"]
\`\`\`

Once this passes, imagine wiring it to re-run on every input's blur event, highlighting exactly which forms on the page currently need the user's attention.`,
    starterCode: `function formsNeedingAttention(forms) {
  // forms: [{ id, tag: "form", children: [] }]
}`,
    solutionCode: `function hasDescendantMatching(node, predicate) {
  for (const child of node.children || []) {
    if (predicate(child)) return true;
    if (hasDescendantMatching(child, predicate)) return true;
  }
  return false;
}

function formsNeedingAttention(forms) {
  return forms
    .filter((form) => hasDescendantMatching(form, (n) => n.valid === false))
    .map((form) => form.id);
}`,
    testCases: [
      {
        input: "one form with an invalid field, one form fully valid",
        expected: "['signup']",
        label: "Only forms with at least one invalid descendant are returned",
      },
      {
        input: "a form with an invalid field nested inside two levels of fieldsets",
        expected: "that form's id is included",
        label: "Detects an invalid field regardless of nesting depth",
      },
      {
        input: "no forms have any invalid descendants",
        expected: "[]",
        label: "Returns an empty array when every form is fully valid",
      },
    ],
    isPremium: true,
    orderIndex: 41,
  },

  {
    slug: "animation-cost-linter",
    conceptSlug: "animation-performance",
    title: "Build an Animation Cost Linter",
    description: `Extend a single animation-cost classifier into a linter that scans a whole stylesheet's transition rules and flags the expensive ones before they ship.

## The problem

A single \`transition: top 300ms, transform 300ms\` rule looks harmless at a glance, but the \`top\` alone is enough to force Layout on every frame — exactly the kind of rule a linter should catch automatically, before it causes jank on a lower-end device.

## The idea

Classify every rule's animated properties using the same worst-tier logic as the single-property classifier, then report only the rules whose worst tier is \`"layout"\` — the ones actually worth flagging.

## Your task

Write \`lintAnimatedRules(rules)\`, where each rule is \`{ selector, properties: string[] }\`. Return the \`selector\`s of every rule classified as \`"layout"\`.

\`\`\`js
lintAnimatedRules([
  { selector: ".modal", properties: ["transform", "opacity"] },
  { selector: ".drawer", properties: ["left", "opacity"] },
])
// → [".drawer"] — .modal is Composite-only, .drawer's "left" forces Layout
\`\`\`

Once this passes, imagine running it as a build-time check across a real stylesheet's \`transition\` declarations, failing CI on any rule that would force Layout on every animated frame.`,
    starterCode: `function lintAnimatedRules(rules) {
  // rules: [{ selector, properties: string[] }]
}`,
    solutionCode: `const TIERS = {
  transform: "compositor",
  opacity: "compositor",
  color: "paint",
  "background-color": "paint",
  "box-shadow": "paint",
  "border-color": "paint",
  width: "layout",
  height: "layout",
  top: "layout",
  left: "layout",
  margin: "layout",
  "font-size": "layout",
};
const RANK = { compositor: 0, paint: 1, layout: 2 };

function classifyAnimationCost(properties) {
  let worst = "compositor";
  for (const prop of properties) {
    const tier = TIERS[prop] ?? "layout";
    if (RANK[tier] > RANK[worst]) worst = tier;
  }
  return worst;
}

function lintAnimatedRules(rules) {
  return rules
    .filter((rule) => classifyAnimationCost(rule.properties) === "layout")
    .map((rule) => rule.selector);
}`,
    testCases: [
      {
        input: "[{'.modal',['transform','opacity']}, {'.drawer',['left','opacity']}]",
        expected: "['.drawer']",
        label: "Only the rule with a layout-triggering property is flagged",
      },
      {
        input: "every rule only animates transform/opacity",
        expected: "[]",
        label: "Returns an empty array when nothing in the stylesheet forces Layout",
      },
      {
        input: "a rule animating color and box-shadow only",
        expected: "not included in the result",
        label: "Paint-only rules are not flagged — only 'layout'-tier rules are",
      },
    ],
    isPremium: true,
    orderIndex: 42,
  },

  // ── Phase 10 (Feature 45) — TypeScript Concepts ───────────────────────────
  {
    slug: "runtime-shape-validator",
    conceptSlug: "basic-types-inference",
    title: "Build a Runtime Shape Validator",
    description: `Extend the "prove it before you use it" idea behind \`unknown\` into validating a whole object shape — exactly what's needed before trusting a JSON API response.

## The problem

A JSON response is typed \`unknown\` (or worse, silently trusted as \`any\`) the moment it arrives — using any of its fields without checking first is exactly the class of bug \`unknown\` exists to prevent.

## The idea

Given a simple schema describing each field's expected \`typeof\`, check every field on the incoming value before returning it — if anything is missing or has the wrong type, the whole value is rejected rather than partially trusted.

## Your task

Write \`validateShape(value, schema)\`, where \`schema\` is \`{ fieldName: "string" | "number" | "boolean" }\`. Return \`value\` unchanged if every field matches, otherwise \`null\`.

\`\`\`js
validateShape({ name: "Ada", age: 36 }, { name: "string", age: "number" })
// → { name: "Ada", age: 36 }
validateShape({ name: "Ada" }, { name: "string", age: "number" })
// → null — missing "age"
\`\`\`

Once this passes, imagine wiring it into a real \`fetch\` wrapper that rejects malformed API responses before they ever reach application code.`,
    starterCode: `function validateShape(value, schema) {
  // return value unchanged if every schema field matches, else null
}`,
    solutionCode: `function validateShape(value, schema) {
  if (typeof value !== "object" || value === null) return null;
  for (const key of Object.keys(schema)) {
    if (typeof value[key] !== schema[key]) return null;
  }
  return value;
}`,
    testCases: [
      {
        input: "{ name: 'Ada', age: 36 }, { name: 'string', age: 'number' }",
        expected: "{ name: 'Ada', age: 36 }",
        label: "A value matching every field's type passes through narrowed",
      },
      {
        input: "{ name: 'Ada' }, { name: 'string', age: 'number' }",
        expected: "null",
        label: "A missing field fails validation",
      },
      {
        input: "{ name: 'Ada', age: '36' }, { name: 'string', age: 'number' }",
        expected: "null",
        label: "A field with the wrong runtime type fails validation",
      },
      {
        input: "null, { name: 'string' }",
        expected: "null",
        label: "null never satisfies any schema",
      },
    ],
    isPremium: false,
    orderIndex: 43,
  },

  {
    slug: "config-source-merger",
    conceptSlug: "interfaces-vs-type-aliases",
    title: "Build a Layered Config Merger",
    description: `Extend declaration merging's "combine, don't silently overwrite" idea into a realistic layered config loader — defaults, then environment overrides, then CLI flags.

## The problem

Merging config from several sources (defaults → env → CLI) usually means later sources should win for a single value like \`timeout\`, but list-like settings like \`plugins\` should accumulate across sources instead of the last one wiping out the rest.

## The idea

Walk the sources in order. For a plain scalar value, the later source simply overwrites the earlier one. For an array value present in both the accumulated result and the new source, concatenate and de-duplicate instead of overwriting.

## Your task

Write \`mergeConfigSources(sources)\`, where \`sources\` is an array of plain config objects applied in order:

\`\`\`js
mergeConfigSources([{ timeout: 1000 }, { timeout: 5000 }])
// → { timeout: 5000 }
mergeConfigSources([{ plugins: ["a"] }, { plugins: ["b"] }])
// → { plugins: ["a", "b"] }
\`\`\`

Once this passes, imagine loading \`defaults.json\`, \`.env\`-derived overrides, and CLI flags through the same function, in that order, to produce one final config.`,
    starterCode: `function mergeConfigSources(sources) {
  // scalars: later source wins. arrays: concatenate + de-duplicate.
}`,
    solutionCode: `function mergeConfigSources(sources) {
  const result = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (Array.isArray(value) && Array.isArray(result[key])) {
        result[key] = [...new Set([...result[key], ...value])];
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}`,
    testCases: [
      {
        input: "[{ timeout: 1000 }, { timeout: 5000 }]",
        expected: "{ timeout: 5000 }",
        label: "A scalar value is overwritten by the later source",
      },
      {
        input: "[{ plugins: ['a'] }, { plugins: ['b'] }]",
        expected: "{ plugins: ['a', 'b'] }",
        label: "Array values accumulate across sources instead of overwriting",
      },
      {
        input: "[{ plugins: ['a', 'b'] }, { plugins: ['b', 'c'] }]",
        expected: "{ plugins: ['a', 'b', 'c'] }",
        label: "Accumulated array values are de-duplicated",
      },
      {
        input: "[{ debug: false }, { debug: true }]",
        expected: "{ debug: true }",
        label: "A boolean scalar follows the same later-wins rule as any other scalar",
      },
    ],
    isPremium: false,
    orderIndex: 44,
  },

  {
    slug: "pluck-with-key-constraint",
    conceptSlug: "generics",
    title: "Build a Constrained Property Plucker",
    description: `Extend the generic-constraint idea (\`K extends keyof T\`) into a runtime plucker that rejects a key the object doesn't actually have, instead of silently returning \`undefined\`.

## The problem

\`obj[key]\` never fails in JavaScript, even when \`key\` isn't a real property — it just quietly returns \`undefined\`, hiding what would be a compile error in TypeScript (\`K extends keyof T\` catching a typo'd key at the call site).

## The idea

Before reading anything, check that every requested key genuinely exists on the object — if any don't, throw and name them, rather than let a typo pass through as a silent \`undefined\`.

## Your task

Write \`pluck(obj, keys)\`. A single string \`keys\` returns that one value; an array of keys returns an object of just those keys. Any key not present on \`obj\` should throw.

\`\`\`js
pluck({ name: "Ada", age: 36 }, "name")            // "Ada"
pluck({ name: "Ada", age: 36 }, ["name", "age"])   // { name: "Ada", age: 36 }
pluck({ name: "Ada" }, ["name", "email"])          // throws — "email" isn't a real key
\`\`\``,
    starterCode: `function pluck(obj, keys) {
  // single key -> that value. array of keys -> an object of just those keys.
  // throw if any requested key isn't a real property of obj.
}`,
    solutionCode: `function pluck(obj, keys) {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const missing = keyList.filter((k) => !Object.prototype.hasOwnProperty.call(obj, k));
  if (missing.length > 0) {
    throw new Error(\`Not a key of the given object: \${missing.join(", ")}\`);
  }
  if (!Array.isArray(keys)) return obj[keys];
  const result = {};
  for (const k of keyList) result[k] = obj[k];
  return result;
}`,
    testCases: [
      {
        input: "{ name: 'Ada', age: 36 }, 'name'",
        expected: "'Ada'",
        label: "A single valid key returns that key's value directly",
      },
      {
        input: "{ name: 'Ada', age: 36 }, ['name', 'age']",
        expected: "{ name: 'Ada', age: 36 }",
        label: "An array of valid keys returns an object of just those keys",
      },
      {
        input: "{ name: 'Ada' }, ['name', 'email']",
        expected: "throws an Error naming 'email'",
        label: "A nonexistent key in the array throws instead of returning undefined",
      },
      {
        input: "{ name: 'Ada' }, 'email'",
        expected: "throws an Error naming 'email'",
        label: "A single nonexistent key also throws",
      },
    ],
    isPremium: true,
    orderIndex: 45,
  },

  {
    slug: "record-defaults-builder",
    conceptSlug: "utility-types",
    title: "Build a Record-Style Defaults Generator",
    description: `\`Record<K, V>\` builds an object type from a list of keys and one value type — this builds the same shape of object from an actual list of keys, at runtime.

## The problem

Initializing a config or state object with the same default for every one of a known set of keys (\`{ admin: [], editor: [], viewer: [] }\`) usually means writing each key out by hand, one line at a time.

## The idea

Given a list of keys and a factory function, generate one entry per key by calling the factory — mirroring how \`Record<K, V>\` maps every key in \`K\` to the same value type \`V\`, except here each value can be freshly computed rather than shared by reference.

## Your task

Write \`createRecordDefaults(keys, factory)\`:

\`\`\`js
createRecordDefaults(["admin", "editor", "viewer"], () => [])
// → { admin: [], editor: [], viewer: [] }
createRecordDefaults(["a", "b"], (key) => key.toUpperCase())
// → { a: "A", b: "B" }
\`\`\`

Once this passes, imagine using it to build per-role permission lists or per-route default state from a single source list of keys.`,
    starterCode: `function createRecordDefaults(keys, factory) {
  // return an object with one entry per key, value = factory(key)
}`,
    solutionCode: `function createRecordDefaults(keys, factory) {
  const result = {};
  for (const key of keys) {
    result[key] = factory(key);
  }
  return result;
}`,
    testCases: [
      {
        input: "['admin', 'editor', 'viewer'], () => []",
        expected: "{ admin: [], editor: [], viewer: [] }",
        label: "Every key gets its own freshly-generated default value",
      },
      {
        input: "['a', 'b'], (key) => key.toUpperCase()",
        expected: "{ a: 'A', b: 'B' }",
        label: "The factory receives each key and can compute a value from it",
      },
      {
        input: "[], () => 0",
        expected: "{}",
        label: "An empty key list produces an empty object",
      },
    ],
    isPremium: true,
    orderIndex: 46,
  },

  {
    slug: "format-value-safely",
    conceptSlug: "type-narrowing",
    title: "Build a Narrowing-Based Value Formatter",
    description: `Extend a chain of narrowing checks into a small, safe "pretty-print anything" utility — the kind of thing a real logger reaches for constantly.

## The problem

A generic logging utility receives values of every shape — strings, numbers, \`null\`, arrays, plain objects — and formatting them all the same way (\`String(value)\`) produces useless output like \`[object Object]\`.

## The idea

Narrow the value through each case in turn — \`null\`/\`undefined\` first (since \`typeof null\` lies and says \`"object"\`), then string, number/boolean, array, then plain object — formatting each shape appropriately, recursing into arrays and objects.

## Your task

Write \`formatValue(value)\`, returning a readable string:

\`\`\`js
formatValue("hi")             // '"hi"'
formatValue(42)                // "42"
formatValue(null)              // "null"
formatValue([1, "a", null])    // '[1, "a", null]'
formatValue({ a: 1, b: "x" })  // '{ a: 1, b: "x" }'
\`\`\``,
    starterCode: `function formatValue(value) {
  // narrow through null/undefined, string, number/boolean, array, object
}`,
    solutionCode: `function formatValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return \`"\${value}"\`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return \`[\${value.map(formatValue).join(", ")}]\`;
  if (typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => \`\${k}: \${formatValue(v)}\`);
    return \`{ \${entries.join(", ")} }\`;
  }
  return String(value);
}`,
    testCases: [
      { input: "'hi'", expected: '\'"hi"\'', label: "A string is wrapped in quotes to distinguish it from other output" },
      { input: "42", expected: "'42'", label: "A number is formatted as-is" },
      { input: "null", expected: "'null'", label: "null is narrowed correctly, not confused with an object" },
      { input: "[1, 'a', null]", expected: "'[1, \"a\", null]'", label: "An array recursively formats each of its own elements" },
      { input: "{ a: 1, b: 'x' }", expected: "'{ a: 1, b: \"x\" }'", label: "A plain object recursively formats each of its values" },
    ],
    isPremium: true,
    orderIndex: 47,
  },

  {
    slug: "mini-redux-store",
    conceptSlug: "discriminated-unions",
    title: "Build a Mini Redux-Style Store",
    description: `Wire a discriminated-union reducer into a real, minimal store — \`getState\`, \`dispatch\`, and \`subscribe\`, the same three-method core every Redux-style store is built from.

## The problem

A reducer alone only computes the *next* state from the current one — it doesn't hold onto that state between calls, or notify anything when it changes.

## The idea

Keep the current state in a closure. \`dispatch\` runs the reducer against it, stores the result, and notifies every subscribed listener with the new state. \`subscribe\` registers a listener and returns an unsubscribe function.

## Your task

Write \`createStore(reducer, initialState)\`, returning \`{ getState(), dispatch(action), subscribe(listener) }\`:

\`\`\`js
const store = createStore((state, action) =>
  action.type === "increment" ? state + 1 : state, 0);
store.subscribe((state) => console.log("now:", state));
store.dispatch({ type: "increment" }); // logs "now: 1"
store.getState(); // 1
\`\`\``,
    starterCode: `function createStore(reducer, initialState) {
  // return { getState(), dispatch(action), subscribe(listener) }
  // subscribe(listener) should return an unsubscribe function
}`,
    solutionCode: `function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener(state));
      return state;
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },
  };
}`,
    testCases: [
      {
        input: "createStore(reducer, 0).getState()",
        expected: "0",
        label: "getState() reflects the initial state before any dispatch",
      },
      {
        input: "dispatch({ type: 'increment' }) against state 0",
        expected: "1",
        label: "dispatch runs the reducer and updates the stored state",
      },
      {
        input: "a subscribed listener, after one dispatch",
        expected: "called once with the new state",
        label: "subscribe registers a listener that's notified on dispatch",
      },
      {
        input: "subscribe(...)() then dispatch again",
        expected: "the unsubscribed listener is not called again",
        label: "The function returned by subscribe unsubscribes that listener",
      },
    ],
    isPremium: true,
    orderIndex: 48,
  },

  {
    slug: "deep-map-values",
    conceptSlug: "conditional-mapped-types",
    title: "Build a Deep Mapped-Value Transformer",
    description: `Extend a single-level mapped-type-style transformer into a recursive one — the runtime equivalent of a recursive conditional/mapped type like a hand-rolled \`DeepPartial\`.

## The problem

A flat \`mapValues\` only transforms an object's top-level values — a nested object's inner values pass through completely untouched, exactly the gap a recursive mapped type is needed to close.

## The idea

For each key, if the value is itself a plain object, recurse into it with the same transform; otherwise apply \`transform\` directly, exactly like a mapped type conditionally recursing into a nested object type instead of transforming it directly.

## Your task

Write \`deepMapValues(obj, transform)\`:

\`\`\`js
deepMapValues({ a: 1, b: { c: 2, d: 3 } }, (v) => v * 2)
// → { a: 2, b: { c: 4, d: 6 } }
\`\`\`

Once this passes, imagine using it to deep-freeze or deep-validate an arbitrarily nested config object with one function instead of one per nesting level.`,
    starterCode: `function deepMapValues(obj, transform) {
  // recurse into nested plain objects; apply transform to every leaf value
}`,
    solutionCode: `function deepMapValues(obj, transform) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = deepMapValues(value, transform);
    } else {
      result[key] = transform(value, key);
    }
  }
  return result;
}`,
    testCases: [
      {
        input: "{ a: 1, b: { c: 2, d: 3 } }, (v) => v * 2",
        expected: "{ a: 2, b: { c: 4, d: 6 } }",
        label: "Nested object values are transformed recursively, not skipped",
      },
      {
        input: "{ a: 1 }, (v) => v * 2",
        expected: "{ a: 2 }",
        label: "A flat object with no nesting still transforms correctly",
      },
      {
        input: "{}, (v) => v",
        expected: "{}",
        label: "An empty object maps to an empty object",
      },
      {
        input: "{ a: { b: { c: 1 } } }, (v) => v + 1",
        expected: "{ a: { b: { c: 2 } } }",
        label: "Recursion goes as deep as the nesting actually goes, not just one level",
      },
    ],
    isPremium: true,
    orderIndex: 49,
  },

  {
    slug: "brand-and-verify",
    conceptSlug: "template-literal-branded-types",
    title: "Build a Runtime Brand Checker",
    description: `TypeScript's brand is erased at compile time — this rebuilds the same nominal-typing idea as a real runtime tag, so a mismatched brand fails loudly instead of silently.

## The problem

Two values that are structurally identical (both just a string, or both just a wrapped primitive) can be passed to the wrong place with no error, if nothing distinguishes what they're actually *for*.

## The idea

Wrap a raw value together with a brand name tag. A value can only be unwrapped by code that names the exact matching brand — unwrapping with the wrong brand name fails, the same way TypeScript's compile-time brand would refuse an incompatible assignment.

## Your task

Write \`brand(value, brandName)\`, \`isBranded(branded, brandName)\`, and \`unwrapBrand(branded, brandName)\` (throws if the brand doesn't match):

\`\`\`js
const userId = brand("u_1", "UserId");
isBranded(userId, "UserId")   // true
isBranded(userId, "OrderId")  // false
unwrapBrand(userId, "UserId") // "u_1"
unwrapBrand(userId, "OrderId") // throws
\`\`\``,
    starterCode: `function brand(value, brandName) {
  // wrap value with a brand tag
}
function isBranded(branded, brandName) {
  // true only if branded carries exactly this brandName
}
function unwrapBrand(branded, brandName) {
  // return the raw value if the brand matches, else throw
}`,
    solutionCode: `function brand(value, brandName) {
  return { value, __brand: brandName };
}
function isBranded(branded, brandName) {
  return !!branded && typeof branded === "object" && branded.__brand === brandName;
}
function unwrapBrand(branded, brandName) {
  if (!isBranded(branded, brandName)) {
    throw new Error(\`Expected a value branded "\${brandName}"\`);
  }
  return branded.value;
}`,
    testCases: [
      {
        input: "isBranded(brand('u_1', 'UserId'), 'UserId')",
        expected: "true",
        label: "A value checked against its own brand name matches",
      },
      {
        input: "isBranded(brand('u_1', 'UserId'), 'OrderId')",
        expected: "false",
        label: "A value checked against a different brand name doesn't match",
      },
      {
        input: "unwrapBrand(brand('u_1', 'UserId'), 'UserId')",
        expected: "'u_1'",
        label: "Unwrapping with the matching brand returns the raw value",
      },
      {
        input: "unwrapBrand(brand('u_1', 'UserId'), 'OrderId')",
        expected: "throws an Error",
        label: "Unwrapping with the wrong brand throws instead of returning the value anyway",
      },
    ],
    isPremium: true,
    orderIndex: 50,
  },

  {
    slug: "semantic-landmark-outliner",
    conceptSlug: "aria-roles-and-semantic-html",
    title: "Build a Page Landmark & Heading Outliner",
    description: `Extends the tag-chooser into a full page auditor — the same lookup that picks a section's semantic tag, plus a check that its heading levels don't skip a step.

## The problem

A page's landmark structure and its heading hierarchy are both things screen reader users navigate by directly — a skipped heading level (jumping from an h2 straight to an h4) breaks that navigation just as much as a missing landmark does.

## The idea

Map every section's purpose to its correct tag with the same table from the core lookup, then walk the sections in order tracking the last heading level seen — any section whose heading level jumps by more than one from the previous heading is a violation.

## Your task

Write \`buildLandmarkOutline(sections)\`, where each section is \`{ purpose, headingLevel }\`, returning \`{ outline, violations }\`:

\`\`\`js
buildLandmarkOutline([
  { purpose: "page banner/header", headingLevel: 1 },
  { purpose: "main content region", headingLevel: 2 },
  { purpose: "sidebar/complementary content", headingLevel: 4 },
])
// → { outline: [...], violations: ["Section 2 skips a heading level (from h2 to h4)"] }
\`\`\``,
    starterCode: `function chooseSemanticTag(purpose) {
  // same lookup as the Challenge — return the correct tag, or "div"
}
function buildLandmarkOutline(sections) {
  // map each section to { tag, headingLevel }, then flag any skipped heading level
}`,
    solutionCode: `function chooseSemanticTag(purpose) {
  const map = {
    "primary navigation": "nav",
    "page banner/header": "header",
    "page footer": "footer",
    "main content region": "main",
    "sidebar/complementary content": "aside",
    "self-contained article": "article",
    "navigates to another page/URL": "a",
    "performs an action on the current page": "button",
  };
  return map[purpose] ?? "div";
}
function buildLandmarkOutline(sections) {
  const outline = sections.map((s) => ({
    tag: chooseSemanticTag(s.purpose),
    headingLevel: s.headingLevel ?? null,
  }));
  const violations = [];
  let lastLevel = 0;
  outline.forEach((entry, i) => {
    if (entry.headingLevel != null) {
      if (entry.headingLevel > lastLevel + 1) {
        violations.push(\`Section \${i} skips a heading level (from h\${lastLevel} to h\${entry.headingLevel})\`);
      }
      lastLevel = entry.headingLevel;
    }
  });
  return { outline, violations };
}`,
    testCases: [
      {
        input: '[{purpose:"page banner/header",headingLevel:1},{purpose:"main content region",headingLevel:2},{purpose:"sidebar/complementary content",headingLevel:4}]',
        expected: '{outline:[{tag:"header",headingLevel:1},{tag:"main",headingLevel:2},{tag:"aside",headingLevel:4}],violations:["Section 2 skips a heading level (from h2 to h4)"]}',
        label: "A heading jump from h2 to h4 is flagged as a skipped level",
      },
      {
        input: '[{purpose:"page banner/header",headingLevel:1},{purpose:"main content region",headingLevel:2},{purpose:"self-contained article",headingLevel:3}]',
        expected: '{outline:[{tag:"header",headingLevel:1},{tag:"main",headingLevel:2},{tag:"article",headingLevel:3}],violations:[]}',
        label: "Sequential heading levels with no gaps produce no violations",
      },
    ],
    isPremium: false,
    orderIndex: 51,
  },

  {
    slug: "media-accessibility-auditor",
    conceptSlug: "accessible-images-media",
    title: "Build a Media Accessibility Auditor",
    description: `Extends the alt-text decision into a full auditor over a whole page's media — one that reports every problem instead of crashing on the first one.

## The problem

A real page has many images, videos, and audio clips at once — auditing them means checking every item against its own rule (alt text for images, captions for video, a transcript for audio) and collecting every failure, not stopping at the first.

## The idea

Reuse the alt-text decision for images, but catch its thrown error and convert it into a violation message instead of letting it crash the whole audit. Apply a parallel rule for video (needs captions) and audio (needs a transcript).

## Your task

Write \`auditMedia(items)\`, where each item is \`{ type, isDecorative, description, hasCaptions, hasTranscript }\`, returning an array of violation strings:

\`\`\`js
auditMedia([
  { type: "image", isDecorative: false, description: "Team photo" },
  { type: "image", isDecorative: false },
  { type: "video", hasCaptions: false },
])
// → ["Item 1: Meaningful images must have alt text", "Item 2: video is missing captions"]
\`\`\``,
    starterCode: `function getAltText(image) {
  // same as the Challenge
}
function auditMedia(items) {
  // check every item against its type's rule, collecting violation strings by index
}`,
    solutionCode: `function getAltText(image) {
  if (image.isDecorative) return "";
  if (!image.description || !image.description.trim()) {
    throw new Error("Meaningful images must have alt text");
  }
  return image.description.trim();
}
function auditMedia(items) {
  const violations = [];
  items.forEach((item, i) => {
    if (item.type === "image") {
      try {
        getAltText(item);
      } catch (e) {
        violations.push(\`Item \${i}: \${e.message}\`);
      }
    } else if (item.type === "video" && !item.hasCaptions) {
      violations.push(\`Item \${i}: video is missing captions\`);
    } else if (item.type === "audio" && !item.hasTranscript) {
      violations.push(\`Item \${i}: audio is missing a transcript\`);
    }
  });
  return violations;
}`,
    testCases: [
      {
        input: '[{type:"image",isDecorative:false,description:"Team photo"},{type:"image",isDecorative:false},{type:"video",hasCaptions:false},{type:"audio",hasTranscript:true}]',
        expected: '["Item 1: Meaningful images must have alt text","Item 2: video is missing captions"]',
        label: "Only the items that actually fail their rule are reported, by index",
      },
      {
        input: '[{type:"image",isDecorative:true},{type:"video",hasCaptions:true},{type:"audio",hasTranscript:true}]',
        expected: "[]",
        label: "A fully compliant media list produces no violations",
      },
    ],
    isPremium: false,
    orderIndex: 52,
  },

  {
    slug: "theme-contrast-auditor",
    conceptSlug: "color-contrast-visual-accessibility",
    title: "Build a Theme Contrast Auditor",
    description: `Extends the single contrast-ratio calculation into a full theme auditor — checking every foreground/background pair a design system defines against WCAG AA at once.

## The problem

A design system might define a dozen text/background color pairs — checking each individually is tedious and easy to fall behind on as the palette evolves.

## The idea

Reuse the same relative-luminance-based contrast ratio calculation, run it across a whole list of named pairs, and report each pair's ratio and pass/fail against its own required threshold (3:1 for large text, 4.5:1 otherwise).

## Your task

Write \`auditThemeContrast(pairs)\`, where each pair is \`{ name, foreground, background, isLargeText }\`, returning an array of \`{ name, ratio, passes }\`:

\`\`\`js
auditThemeContrast([
  { name: "body-text", foreground: "#000000", background: "#FFFFFF", isLargeText: false },
])
// → [{ name: "body-text", ratio: 21, passes: true }]
\`\`\``,
    starterCode: `function getContrastRatio(hex1, hex2) {
  // same as the Challenge
}
function auditThemeContrast(pairs) {
  // compute ratio + pass/fail for every named pair
}`,
    solutionCode: `function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}
function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
function auditThemeContrast(pairs) {
  return pairs.map((p) => {
    const ratio = getContrastRatio(p.foreground, p.background);
    const required = p.isLargeText ? 3 : 4.5;
    return { name: p.name, ratio, passes: ratio >= required };
  });
}`,
    testCases: [
      {
        input: '[{name:"body-text",foreground:"#000000",background:"#FFFFFF",isLargeText:false},{name:"muted-text",foreground:"#777777",background:"#FFFFFF",isLargeText:false},{name:"muted-text-safe",foreground:"#767676",background:"#FFFFFF",isLargeText:false}]',
        expected: '[{name:"body-text",ratio:21,passes:true},{name:"muted-text",ratio:4.48,passes:false},{name:"muted-text-safe",ratio:4.54,passes:true}]',
        label: "A near-miss gray (#777777) fails AA by a hair while a slightly darker one (#767676) passes",
      },
    ],
    isPremium: false,
    orderIndex: 53,
  },

  {
    slug: "keyboard-focus-trap-navigator",
    conceptSlug: "keyboard-navigation-focus-management",
    title: "Build a Modal Focus-Trap Navigator",
    description: `Extends tab-order computation into a full focus trap — the object a real modal dialog would use to cycle Tab/Shift+Tab within itself.

## The problem

Computing the correct tab order is only half of a focus trap — the other half is cycling through it with wraparound, so Tab past the last element loops to the first instead of escaping the modal.

## The idea

Compute the real tab order once (reusing the same logic as the Challenge), then expose \`next\`/\`prev\` methods that move through that order and wrap around at both ends.

## Your task

Write \`createFocusTrap(elements)\`, returning \`{ getOrder(), next(currentId), prev(currentId) }\`:

\`\`\`js
const trap = createFocusTrap([
  { id: "a", domOrder: 0 },
  { id: "b", domOrder: 1 },
  { id: "c", domOrder: 2 },
]);
trap.next("c") // → "a" (wraps)
trap.prev("a") // → "c" (wraps)
\`\`\``,
    starterCode: `function computeTabOrder(elements) {
  // same as the Challenge
}
function createFocusTrap(elements) {
  // return { getOrder(), next(currentId), prev(currentId) } cycling with wraparound
}`,
    solutionCode: `function computeTabOrder(elements) {
  const positive = elements.filter((el) => el.tabIndex > 0);
  const zero = elements.filter((el) => !el.tabIndex || el.tabIndex === 0);
  positive.sort((a, b) => a.tabIndex - b.tabIndex || a.domOrder - b.domOrder);
  zero.sort((a, b) => a.domOrder - b.domOrder);
  return [...positive, ...zero].map((el) => el.id);
}
function createFocusTrap(elements) {
  const order = computeTabOrder(elements);
  return {
    getOrder() {
      return order;
    },
    next(currentId) {
      const idx = order.indexOf(currentId);
      if (idx === -1) return order[0] ?? null;
      return order[(idx + 1) % order.length];
    },
    prev(currentId) {
      const idx = order.indexOf(currentId);
      if (idx === -1) return order[order.length - 1] ?? null;
      return order[(idx - 1 + order.length) % order.length];
    },
  };
}`,
    testCases: [
      {
        input: 'createFocusTrap([{id:"a",domOrder:0},{id:"b",domOrder:1},{id:"c",domOrder:2}]).getOrder()',
        expected: '["a","b","c"]',
        label: "getOrder reuses the same tab-order computation as the Challenge",
      },
      {
        input: '...trap.next("c")',
        expected: '"a"',
        label: "next() at the last element wraps around to the first",
      },
      {
        input: '...trap.prev("a")',
        expected: '"c"',
        label: "prev() at the first element wraps around to the last",
      },
    ],
    isPremium: true,
    orderIndex: 54,
  },

  {
    slug: "form-error-summary-builder",
    conceptSlug: "accessible-forms",
    title: "Build a Form Error Summary",
    description: `Extends the single field-aria helper into a whole form's error summary — the accessible pattern of listing every error together and directing focus to the first one.

## The problem

Announcing each field's own error individually is necessary but not sufficient — on submit, a screen reader user benefits from one summary of everything wrong at once, with a clear place for focus to land first.

## The idea

Annotate every field with its own aria attributes (reusing the single-field logic), collect only the fields with errors into a summary list, and identify the first errored field as the target for focus after submission.

## Your task

Write \`buildFormErrorSummary(fields)\`, where each field is \`{ id, hasError, errorMessage }\`, returning \`{ fields, summary, focusFirstErrorId }\`:

\`\`\`js
buildFormErrorSummary([
  { id: "name", hasError: false },
  { id: "email", hasError: true, errorMessage: "Enter a valid email" },
])
// → { fields: [...], summary: [{ id: "email", message: "Enter a valid email" }], focusFirstErrorId: "email" }
\`\`\``,
    starterCode: `function buildFieldAria(field) {
  // same as the Challenge
}
function buildFormErrorSummary(fields) {
  // annotate every field, collect only errored ones into a summary, find the first error's id
}`,
    solutionCode: `function buildFieldAria(field) {
  if (field.hasError) {
    return { "aria-invalid": true, "aria-describedby": \`\${field.id}-error\` };
  }
  return { "aria-invalid": false, "aria-describedby": undefined };
}
function buildFormErrorSummary(fields) {
  const annotated = fields.map((f) => ({ ...f, aria: buildFieldAria(f) }));
  const summary = fields.filter((f) => f.hasError).map((f) => ({ id: f.id, message: f.errorMessage }));
  const focusFirstErrorId = summary.length ? summary[0].id : null;
  return { fields: annotated, summary, focusFirstErrorId };
}`,
    testCases: [
      {
        input: '[{id:"name",hasError:false},{id:"email",hasError:true,errorMessage:"Enter a valid email"},{id:"password",hasError:true,errorMessage:"Password too short"}]',
        expected: '{summary:[{id:"email",message:"Enter a valid email"},{id:"password",message:"Password too short"}],focusFirstErrorId:"email"}',
        label: "Summary lists only errored fields in order, and focus targets the first one",
      },
      {
        input: '[{id:"name",hasError:false}]',
        expected: '{summary:[],focusFirstErrorId:null}',
        label: "A form with no errors has an empty summary and a null focus target",
      },
    ],
    isPremium: true,
    orderIndex: 55,
  },

  {
    slug: "toast-announcer-service",
    conceptSlug: "aria-live-regions",
    title: "Build a Toast Announcer Service",
    description: `Extends the announcer queue into a real toast-notification service — with deduplication and a bounded visible list, the two concerns a raw queue alone doesn't handle.

## The problem

A raw announcer queue doesn't guard against the same message being pushed twice in a row, and a real toast UI can't display an unbounded number of toasts at once.

## The idea

Wrap the core announcer: skip pushing a message that's identical to the immediately preceding one, and on each "tick," pull the next announcement off the queue and keep only the most recent N in the visible list.

## Your task

Write \`createToastAnnouncerService(maxVisible)\`, returning \`{ push(message, politeness), tick() }\`:

\`\`\`js
const svc = createToastAnnouncerService(2);
svc.push("Saved");
svc.push("Saved"); // deduped, ignored
svc.push("Error occurred", "assertive");
svc.tick() // → [{ message: "Error occurred", politeness: "assertive" }]
\`\`\``,
    starterCode: `function createAnnouncer() {
  // same as the Challenge
}
function createToastAnnouncerService(maxVisible = 3) {
  // wrap createAnnouncer with consecutive-message dedupe and a bounded visible list
}`,
    solutionCode: `function createAnnouncer() {
  let assertiveQueue = [];
  let politeQueue = [];
  return {
    announce(message, politeness) {
      if (politeness === "assertive") assertiveQueue.push(message);
      else politeQueue.push(message);
    },
    flush() {
      if (assertiveQueue.length) return { message: assertiveQueue.shift(), politeness: "assertive" };
      if (politeQueue.length) return { message: politeQueue.shift(), politeness: "polite" };
      return null;
    },
  };
}
function createToastAnnouncerService(maxVisible = 3) {
  const announcer = createAnnouncer();
  let lastMessage = null;
  let visible = [];
  return {
    push(message, politeness = "polite") {
      if (message === lastMessage) return;
      lastMessage = message;
      announcer.announce(message, politeness);
    },
    tick() {
      const next = announcer.flush();
      if (!next) return visible;
      visible = [...visible, next].slice(-maxVisible);
      return visible;
    },
  };
}`,
    testCases: [
      {
        input: 'push("Saved"); push("Saved"); push("Error occurred","assertive"); tick()',
        expected: '[{message:"Error occurred",politeness:"assertive"}]',
        label: "A duplicate consecutive push is ignored, and assertive is announced first",
      },
      {
        input: "tick() again after the above",
        expected: '[{message:"Error occurred",politeness:"assertive"},{message:"Saved",politeness:"polite"}]',
        label: "The deduped polite message still gets delivered on the next tick",
      },
      {
        input: "a service created with maxVisible: 1, after 2 ticks",
        expected: '[{message:"B",politeness:"polite"}]',
        label: "The visible list is trimmed to the most recent maxVisible entries",
      },
    ],
    isPremium: true,
    orderIndex: 56,
  },

  {
    slug: "accessible-combobox-controller",
    conceptSlug: "accessible-component-patterns",
    title: "Build an Accessible Combobox Controller",
    description: `Extends the keyboard state machine into a full combobox controller — adding typeahead filtering and the aria-activedescendant id a real widget would render.

## The problem

A combobox's keyboard handling alone isn't the whole widget — filtering by what's typed, and computing which option id should be marked active for assistive tech, both have to stay in sync with the same state.

## The idea

Wrap the keyboard state machine with a filter step: typing narrows the option list and resets the highlighted option to the first match (or none, if nothing matches), while arrow-key navigation continues to operate over whatever the currently filtered list is.

## Your task

Write \`createComboboxController(options)\`, returning \`{ getState(), handleKey(key), setFilter(text), getActiveDescendantId() }\`:

\`\`\`js
const c = createComboboxController(["Apple", "Apricot", "Banana"]);
c.setFilter("ap");
c.getActiveDescendantId() // → "option-0"
\`\`\``,
    starterCode: `function handleComboboxKey(state, key) {
  // same as the Challenge
}
function createComboboxController(options) {
  // wrap handleComboboxKey with typeahead filtering + an active-descendant id
}`,
    solutionCode: `function handleComboboxKey(state, key) {
  const { options, activeIndex, isOpen } = state;
  if (!isOpen) {
    if (key === "ArrowDown") return { options, activeIndex: 0, isOpen: true };
    if (key === "ArrowUp") return { options, activeIndex: options.length - 1, isOpen: true };
    return { ...state };
  }
  switch (key) {
    case "ArrowDown":
      return { options, activeIndex: (activeIndex + 1) % options.length, isOpen: true };
    case "ArrowUp":
      return { options, activeIndex: (activeIndex - 1 + options.length) % options.length, isOpen: true };
    case "Home":
      return { options, activeIndex: 0, isOpen: true };
    case "End":
      return { options, activeIndex: options.length - 1, isOpen: true };
    case "Escape":
      return { options, activeIndex: -1, isOpen: false };
    case "Enter":
      return { options, activeIndex, isOpen: false };
    default:
      return { ...state };
  }
}
function createComboboxController(options) {
  let state = { options, activeIndex: -1, isOpen: false, filter: "" };
  return {
    getState() {
      return state;
    },
    handleKey(key) {
      state = handleComboboxKey(state, key);
      return state;
    },
    setFilter(text) {
      const filtered = options.filter((o) => o.toLowerCase().startsWith(text.toLowerCase()));
      state = { options: filtered, activeIndex: filtered.length ? 0 : -1, isOpen: filtered.length > 0, filter: text };
      return state;
    },
    getActiveDescendantId() {
      return state.activeIndex === -1 ? null : \`option-\${state.activeIndex}\`;
    },
  };
}`,
    testCases: [
      {
        input: 'setFilter("ap") on ["Apple","Apricot","Banana"]',
        expected: '{options:["Apple","Apricot"],activeIndex:0,isOpen:true}',
        label: "Filtering narrows the option list and activates the first match",
      },
      {
        input: "getActiveDescendantId() after the filter above",
        expected: '"option-0"',
        label: "The active-descendant id reflects the currently highlighted filtered option",
      },
      {
        input: 'handleKey("ArrowDown") twice on a 2-item filtered list',
        expected: '"option-0"',
        label: "Arrow navigation wraps within the filtered set, not the original full option list",
      },
      {
        input: 'setFilter("xyz") with no matches',
        expected: "isOpen: false, getActiveDescendantId(): null",
        label: "A filter with zero matches closes the list and clears the active descendant",
      },
    ],
    isPremium: true,
    orderIndex: 57,
  },

  {
    slug: "a11y-rule-report-generator",
    conceptSlug: "automated-a11y-testing",
    title: "Build a Multi-Rule Accessibility Report Generator",
    description: `Extends the single-node linter into a full tree-walking report generator — the same kind of pass a real tool like axe-core runs over an entire page.

## The problem

A real page is a tree, not one isolated element — a useful report needs to walk every node, run every applicable rule (including one this Challenge didn't cover: color contrast), and say *where* each violation was found.

## The idea

Reuse the single-node rule check for every node visited, add a contrast-ratio rule for any node carrying inline color/background-color style values, and recurse into children while building a readable path string as you go.

## Your task

Write \`lintTree(node, path)\`, where a node is \`{ tag, attrs, style, children }\`, returning an array of \`{ path, message }\`:

\`\`\`js
lintTree({ tag: "div", attrs: {}, children: [{ tag: "img", attrs: {} }] })
// → [{ path: "div>img[0]", message: "img missing alt text" }]
\`\`\``,
    starterCode: `function lintNode(node) {
  // same as the Challenge
}
function lintTree(node, path) {
  // walk the tree, reusing lintNode + a contrast check, building a path per violation
}`,
    solutionCode: `function lintNode(node) {
  const violations = [];
  const attrs = node.attrs || {};
  if (node.tag === "img") {
    const isDecorative = attrs.role === "presentation" || attrs["aria-hidden"] === true;
    if (!isDecorative && !("alt" in attrs)) violations.push("img missing alt text");
  }
  if (node.tag === "input") {
    const hasName = Boolean(attrs["aria-label"] || attrs["aria-labelledby"]);
    if (!hasName) violations.push("input missing an accessible name");
  }
  return violations;
}
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}
function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
function lintTree(node, path) {
  path = path || node.tag;
  const violations = lintNode(node).map((message) => ({ path, message }));
  if (node.style && node.style.color && node.style.backgroundColor) {
    const ratio = getContrastRatio(node.style.color, node.style.backgroundColor);
    if (ratio < 4.5) violations.push({ path, message: \`low contrast ratio \${ratio}:1 (needs 4.5:1)\` });
  }
  (node.children || []).forEach((child, i) => {
    violations.push(...lintTree(child, \`\${path}>\${child.tag}[\${i}]\`));
  });
  return violations;
}`,
    testCases: [
      {
        input: 'a tree with an <img> missing alt, an <input> with aria-label, and a low-contrast <p>',
        expected: '[{path:"div>img[0]",message:"img missing alt text"},{path:"div>p[2]",message:"low contrast ratio 1:1 (needs 4.5:1)"}]',
        label: "Violations are collected from every level of the tree, each with its own path",
      },
      {
        input: "a tree where every node passes every rule",
        expected: "[]",
        label: "A fully compliant tree produces no violations",
      },
    ],
    isPremium: true,
    orderIndex: 58,
  },

  {
    slug: "responsive-image-config-builder",
    conceptSlug: "image-asset-optimization",
    title: "Build a Responsive Image Config Builder",
    description: `Extends the format/width picker into the full config a real \`<img>\` component needs — a single source, plus a complete \`srcset\` string.

## The problem

Picking a format and a single width is only half of a real responsive image — a production \`<img>\` needs a whole \`srcset\` listing every candidate width, so the browser can choose differently per device.

## The idea

Reuse the format and width pickers to build one recommended image config, then generate the full \`srcset\` attribute string across every available width in the same format.

## Your task

Write \`buildImageConfig(options)\`, reusing \`pickImageFormat\`/\`pickSrcsetWidth\`, returning \`{ format, width, src }\`. Then write \`buildSrcSet(baseUrl, format, availableWidths)\`, returning the full \`srcset\` string:

\`\`\`js
buildSrcSet("/img/hero", "avif", [320, 640, 960])
// → "/img/hero?w=320&fmt=avif 320w, /img/hero?w=640&fmt=avif 640w, /img/hero?w=960&fmt=avif 960w"
\`\`\``,
    starterCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  // same as the Challenge
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  // same as the Challenge
}
function buildImageConfig({ hasTransparency, isPhoto, needsAnimation, containerWidth, dpr, availableWidths, baseUrl }) {
  // return { format, width, src }
}
function buildSrcSet(baseUrl, format, availableWidths) {
  // return the full srcset attribute string
}`,
    solutionCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  if (needsAnimation) return "webp";
  if (hasTransparency) return "webp";
  if (isPhoto) return "avif";
  return "webp";
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  const target = containerWidth * dpr;
  const sorted = [...availableWidths].sort((a, b) => a - b);
  const fit = sorted.find((w) => w >= target);
  return fit !== undefined ? fit : sorted[sorted.length - 1];
}
function buildImageConfig({ hasTransparency, isPhoto, needsAnimation, containerWidth, dpr, availableWidths, baseUrl }) {
  const format = pickImageFormat({ hasTransparency, isPhoto, needsAnimation });
  const width = pickSrcsetWidth(containerWidth, dpr, availableWidths);
  return { format, width, src: \`\${baseUrl}?w=\${width}&fmt=\${format}\` };
}
function buildSrcSet(baseUrl, format, availableWidths) {
  return availableWidths.map((w) => \`\${baseUrl}?w=\${w}&fmt=\${format} \${w}w\`).join(", ");
}`,
    testCases: [
      {
        input: 'buildImageConfig({ hasTransparency: false, isPhoto: true, needsAnimation: false, containerWidth: 400, dpr: 2, availableWidths: [320,640,960,1280], baseUrl: "/img/hero" })',
        expected: '{ format: "avif", width: 960, src: "/img/hero?w=960&fmt=avif" }',
        label: "buildImageConfig combines format and width into one config",
      },
      {
        input: 'buildSrcSet("/img/hero", "avif", [320,640,960])',
        expected: '"/img/hero?w=320&fmt=avif 320w, /img/hero?w=640&fmt=avif 640w, /img/hero?w=960&fmt=avif 960w"',
        label: "buildSrcSet produces the full srcset string across every width",
      },
    ],
    orderIndex: 1,
  },

  {
    slug: "chunk-size-report-builder",
    conceptSlug: "bundle-size-code-splitting",
    title: "Build a Chunk Size Report",
    description: `Extends the shared/route chunk splitter with real byte sizes — the report a bundle analyzer actually shows.

## The problem

Knowing *which* modules are shared is only useful once it's tied to actual byte weight — a shared chunk with three tiny modules matters far less than a route chunk with one enormous one.

## The idea

Reuse the chunk-splitting logic, then look up each module's size and sum it per chunk, producing a byte total for the shared chunk and for every route's own chunk.

## Your task

Write \`computeChunkSizes(routeModules, moduleSizes)\`, reusing \`splitChunks\`, returning \`{ shared: { modules, totalBytes }, routes: { [route]: { modules, totalBytes } } }\`:

\`\`\`js
computeChunkSizes(
  { "/home": ["react", "home-page"], "/about": ["react", "about-page"] },
  { react: 100, "home-page": 20, "about-page": 15 }
)
// → { shared: { modules: ["react"], totalBytes: 100 }, routes: { "/home": { modules: ["home-page"], totalBytes: 20 }, "/about": { modules: ["about-page"], totalBytes: 15 } } }
\`\`\``,
    starterCode: `function splitChunks(routeModules) {
  // same as the Challenge
}
function computeChunkSizes(routeModules, moduleSizes) {
  // reuse splitChunks, then attach a totalBytes sum to the shared chunk and each route chunk
}`,
    solutionCode: `function splitChunks(routeModules) {
  const counts = new Map();
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      counts.set(mod, (counts.get(mod) || 0) + 1);
    }
  }
  const shared = [];
  for (const route in routeModules) {
    for (const mod of routeModules[route]) {
      if (counts.get(mod) > 1 && !shared.includes(mod)) shared.push(mod);
    }
  }
  const routes = {};
  for (const route in routeModules) {
    routes[route] = routeModules[route].filter((m) => !shared.includes(m));
  }
  return { shared, routes };
}
function computeChunkSizes(routeModules, moduleSizes) {
  const { shared, routes } = splitChunks(routeModules);
  const sizeOf = (mods) => mods.reduce((sum, m) => sum + (moduleSizes[m] || 0), 0);
  const result = { shared: { modules: shared, totalBytes: sizeOf(shared) }, routes: {} };
  for (const route in routes) {
    result.routes[route] = { modules: routes[route], totalBytes: sizeOf(routes[route]) };
  }
  return result;
}`,
    testCases: [
      {
        input: 'computeChunkSizes({ "/home": ["react","home-page"], "/about": ["react","about-page"] }, { react: 100, "home-page": 20, "about-page": 15 })',
        expected: '{ shared: { modules: ["react"], totalBytes: 100 }, routes: { "/home": { modules: ["home-page"], totalBytes: 20 }, "/about": { modules: ["about-page"], totalBytes: 15 } } }',
        label: "computeChunkSizes attaches byte totals to the shared chunk and each route chunk",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "resource-load-strategy-planner",
    conceptSlug: "resource-loading-render-blocking",
    title: "Build a Resource Load Strategy Planner",
    description: `Extends single-resource classification into a full loading plan — the report a build tool would use to flag what's on the critical path.

## The problem

Classifying one resource at a time doesn't answer the actual question a team asks before optimizing a page: across everything this page loads, what's actually blocking, what's deferred, and what's just a background hint?

## The idea

Reuse the classifier across a whole resource list, grouping every resource's id into the bucket matching its strategy.

## Your task

Write \`groupResourcesByLoadStrategy(resources)\`, reusing \`classifyResource\`, returning \`{ blocking, async, deferred, background }\` — each an array of resource ids:

\`\`\`js
groupResourcesByLoadStrategy([
  { id: "a", tag: "script", duration: 100 },
  { id: "b", tag: "script", async: true, duration: 50 },
  { id: "c", tag: "link", rel: "stylesheet", duration: 30 },
  { id: "d", tag: "link", rel: "preload" },
])
// → { blocking: ["a","c"], async: ["b"], deferred: [], background: ["d"] }
\`\`\``,
    starterCode: `function classifyResource(resource) {
  // same as the Challenge
}
function groupResourcesByLoadStrategy(resources) {
  // return { blocking, async, deferred, background }, each an array of ids
}`,
    solutionCode: `function classifyResource(resource) {
  if (resource.tag === "link") {
    if (resource.rel === "stylesheet") return "render-blocking";
    return resource.rel;
  }
  if (resource.async) return "async";
  if (resource.defer) return "defer";
  return "render-blocking";
}
function groupResourcesByLoadStrategy(resources) {
  const groups = { blocking: [], async: [], deferred: [], background: [] };
  for (const r of resources) {
    const cls = classifyResource(r);
    if (cls === "render-blocking") groups.blocking.push(r.id);
    else if (cls === "async") groups.async.push(r.id);
    else if (cls === "defer") groups.deferred.push(r.id);
    else groups.background.push(r.id);
  }
  return groups;
}`,
    testCases: [
      {
        input: 'groupResourcesByLoadStrategy([{id:"a",tag:"script",duration:100},{id:"b",tag:"script",async:true,duration:50},{id:"c",tag:"link",rel:"stylesheet",duration:30},{id:"d",tag:"link",rel:"preload"}])',
        expected: '{ blocking: ["a","c"], async: ["b"], deferred: [], background: ["d"] }',
        label: "groupResourcesByLoadStrategy buckets every resource id by its classification",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "core-web-vitals-page-auditor",
    conceptSlug: "core-web-vitals",
    title: "Build a Core Web Vitals Page Auditor",
    description: `Extends single-snapshot classification into the real methodology: rating a page off the 75th percentile across many real visits, not one sample.

## The problem

A single LCP/INP/CLS reading only describes one visit. Google's actual Core Web Vitals score is the 75th percentile across many real user sessions — a page has to clear the bar for at least three out of every four real visits, not just its best one.

## The idea

Compute the 75th percentile of each metric across a set of samples, then classify and rate the page off those percentile values, reusing the classifier from the Challenge.

## Your task

Write \`percentile(values, p)\` (nearest-rank: sort ascending, index \`Math.ceil((p/100)*length)-1\`), then \`auditPage(samples)\`, where \`samples\` is an array of \`{ LCP, INP, CLS }\` readings:

\`\`\`js
auditPage([
  { LCP: 2000, INP: 100, CLS: 0.02 },
  { LCP: 2400, INP: 150, CLS: 0.05 },
  { LCP: 4800, INP: 600, CLS: 0.3 },
  { LCP: 2600, INP: 180, CLS: 0.08 },
])
// → { LCP: { value: 2600, rating: "needs-improvement" }, INP: { value: 180, rating: "good" }, CLS: { value: 0.08, rating: "good" }, overall: "needs-improvement" }
\`\`\``,
    starterCode: `function classifyMetric(metric, value) {
  // same as the Challenge
}
function overallPageRating(metrics) {
  // same as the Challenge
}
function percentile(values, p) {
  // nearest-rank percentile: sort ascending, index = ceil((p/100) * length) - 1
}
function auditPage(samples) {
  // compute the p75 of LCP/INP/CLS across samples, classify each, and rate the page overall
}`,
    solutionCode: `function classifyMetric(metric, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
  };
  const t = thresholds[metric];
  if (value <= t.good) return "good";
  if (value > t.poor) return "poor";
  return "needs-improvement";
}
function overallPageRating(metrics) {
  const ratings = Object.keys(metrics).map((m) => classifyMetric(m, metrics[m]));
  if (ratings.includes("poor")) return "poor";
  if (ratings.includes("needs-improvement")) return "needs-improvement";
  return "good";
}
function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
function auditPage(samples) {
  const metrics = ["LCP", "INP", "CLS"];
  const result = {};
  for (const m of metrics) {
    const value = percentile(samples.map((s) => s[m]), 75);
    result[m] = { value, rating: classifyMetric(m, value) };
  }
  result.overall = overallPageRating({ LCP: result.LCP.value, INP: result.INP.value, CLS: result.CLS.value });
  return result;
}`,
    testCases: [
      { input: "percentile([4000,1000,3000,2000], 75)", expected: "3000", label: "percentile computes the p75 value via nearest-rank" },
      {
        input: 'auditPage([{LCP:2000,INP:100,CLS:0.02},{LCP:2400,INP:150,CLS:0.05},{LCP:4800,INP:600,CLS:0.3},{LCP:2600,INP:180,CLS:0.08}])',
        expected: '{ LCP: { value: 2600, rating: "needs-improvement" }, INP: { value: 180, rating: "good" }, CLS: { value: 0.08, rating: "good" }, overall: "needs-improvement" }',
        label: "auditPage rates the page off the p75 of each metric, matching real CWV methodology",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "virtual-list-controller",
    conceptSlug: "list-virtualization",
    title: "Build a Virtual List Controller",
    description: `Extends the windowing math into a stateful controller with scroll-to-index support — the shape a real virtualized list component wraps.

## The problem

The raw windowing formula answers "what's visible right now," but a real component also needs the reverse question: to jump programmatically to a given row (a "scroll to item 500" button, for instance), what scroll position gets it there?

## The idea

Wrap the same windowing math in a small object configured once with the list's fixed dimensions, exposing both directions: current scroll position → visible range, and target row index → required scroll position.

## Your task

Write \`createVirtualList({ rowHeight, containerHeight, totalRows, overscan })\`, returning \`{ getVisibleRange(scrollTop), scrollTopForIndex(index) }\`:

\`\`\`js
const vl = createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 });
vl.getVisibleRange(0) // { start: 0, end: 13 }
vl.scrollTopForIndex(50) // 2000
\`\`\``,
    starterCode: `function createVirtualList({ rowHeight, containerHeight, totalRows, overscan }) {
  // return { getVisibleRange(scrollTop), scrollTopForIndex(index) }
}`,
    solutionCode: `function createVirtualList({ rowHeight, containerHeight, totalRows, overscan }) {
  return {
    getVisibleRange(scrollTop) {
      const first = Math.floor(scrollTop / rowHeight);
      const last = Math.floor((scrollTop + containerHeight) / rowHeight);
      const start = Math.max(0, first - overscan);
      const end = Math.min(totalRows - 1, last + overscan);
      return { start, end };
    },
    scrollTopForIndex(index) {
      return index * rowHeight;
    },
  };
}`,
    testCases: [
      {
        input: 'createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 }).getVisibleRange(0)',
        expected: "{ start: 0, end: 13 }",
        label: "getVisibleRange reuses the same windowing math as the Challenge",
      },
      {
        input: 'createVirtualList({ rowHeight: 40, containerHeight: 400, totalRows: 10000, overscan: 3 }).scrollTopForIndex(50)',
        expected: "2000",
        label: "scrollTopForIndex computes the scroll position needed to bring a given row to the top",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "aggregate-bottleneck-finder",
    conceptSlug: "profiling-with-devtools",
    title: "Build an Aggregate Bottleneck Finder",
    description: `Extends single-trace bottleneck-finding into DevTools' real "Bottom-Up" view: aggregating self time for a function across many recorded traces, not just one.

## The problem

A function that costs 20ms here and 25ms there across a dozen different call stacks might never be the single widest bar in any one flame chart — but its total cost across the whole session could dwarf anything that is.

## The idea

Walk every trace, summing self time per function name (not per tree position), then find whichever name has the highest aggregate — the real target the Bottom-Up view is built to surface.

## Your task

Write \`aggregateSelfTime(traces)\`, returning a map of function name to total self time across all traces, and \`findTopAggregateBottleneck(traces)\`, returning the name with the highest aggregate:

\`\`\`js
const traces = [
  { name: "a", selfTime: 5, children: [{ name: "format", selfTime: 20, children: [] }] },
  { name: "b", selfTime: 5, children: [{ name: "format", selfTime: 25, children: [] }, { name: "render", selfTime: 10, children: [] }] },
];
aggregateSelfTime(traces) // { a: 5, format: 45, b: 5, render: 10 }
findTopAggregateBottleneck(traces) // "format"
\`\`\``,
    starterCode: `function aggregateSelfTime(traces) {
  // sum selfTime per function name, walking every trace's whole tree
}
function findTopAggregateBottleneck(traces) {
  // the name with the highest total in aggregateSelfTime(traces)
}`,
    solutionCode: `function aggregateSelfTime(traces) {
  const totals = {};
  function walk(n) {
    totals[n.name] = (totals[n.name] || 0) + n.selfTime;
    (n.children || []).forEach(walk);
  }
  traces.forEach(walk);
  return totals;
}
function findTopAggregateBottleneck(traces) {
  const totals = aggregateSelfTime(traces);
  let bestName = null;
  let bestValue = -Infinity;
  for (const name in totals) {
    if (totals[name] > bestValue) {
      bestValue = totals[name];
      bestName = name;
    }
  }
  return bestName;
}`,
    testCases: [
      {
        input: '[{name:"a",selfTime:5,children:[{name:"format",selfTime:20,children:[]}]},{name:"b",selfTime:5,children:[{name:"format",selfTime:25,children:[]},{name:"render",selfTime:10,children:[]}]}]',
        expected: '{ a: 5, format: 45, b: 5, render: 10 }',
        label: "aggregateSelfTime sums selfTime for a repeated function name across separate traces",
      },
      {
        input: "the same traces",
        expected: '"format"',
        label: "findTopAggregateBottleneck picks the highest aggregate, not the highest single-node selfTime",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "streaming-hydration-timeline-simulator",
    conceptSlug: "streaming-ssr-hydration",
    title: "Build a Streaming Hydration Timeline Simulator",
    description: `Extends shell-position rendering into a full timeline: progressive snapshots as chunks arrive, plus a hydration mismatch check against what the client expects.

## The problem

Understanding one snapshot in time is a start, but a real streaming page changes over the course of several arrivals — and once everything has streamed in, the client still has to successfully hydrate it, which can fail if server and client disagree on what was rendered.

## The idea

Replay the arrival sequence one chunk at a time, recording a snapshot after each arrival, then separately check the final server-rendered order against what the client expects to hydrate.

## Your task

Write \`runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds)\`, reusing \`renderedContentAt\` and a mismatch-finder, returning \`{ snapshots, finalOrder, hydrationMismatchIndex }\`:

\`\`\`js
runStreamingTimeline(
  ["header", "sidebar", "main", "footer"],
  ["footer", "header", "main", "sidebar"],
  ["header", "sidebar", "main", "footer"]
)
// → { snapshots: [...4 progressive snapshots], finalOrder: ["header","sidebar","main","footer"], hydrationMismatchIndex: -1 }
\`\`\``,
    starterCode: `function renderedContentAt(shellOrder, arrivedIds) {
  // same as the Challenge
}
function findHydrationMismatch(serverIds, clientIds) {
  // return the first index where serverIds and clientIds differ, or -1 if none
}
function runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds) {
  // return { snapshots, finalOrder, hydrationMismatchIndex }
}`,
    solutionCode: `function renderedContentAt(shellOrder, arrivedIds) {
  return shellOrder.map((id) => (arrivedIds.includes(id) ? id : "skeleton"));
}
function findHydrationMismatch(serverIds, clientIds) {
  const len = Math.max(serverIds.length, clientIds.length);
  for (let i = 0; i < len; i++) {
    if (serverIds[i] !== clientIds[i]) return i;
  }
  return -1;
}
function runStreamingTimeline(shellOrder, arrivalSequence, clientHydrationIds) {
  const snapshots = arrivalSequence.map((_, i) => renderedContentAt(shellOrder, arrivalSequence.slice(0, i + 1)));
  return {
    snapshots,
    finalOrder: shellOrder,
    hydrationMismatchIndex: findHydrationMismatch(shellOrder, clientHydrationIds),
  };
}`,
    testCases: [
      {
        input: 'runStreamingTimeline(["header","sidebar","main","footer"], ["footer","header","main","sidebar"], ["header","sidebar","main","footer"]).snapshots',
        expected: '[["skeleton","skeleton","skeleton","footer"],["header","skeleton","skeleton","footer"],["header","skeleton","main","footer"],["header","sidebar","main","footer"]]',
        label: "snapshots show progressively more content filled in as each chunk arrives",
      },
      {
        input: "the same call's hydrationMismatchIndex",
        expected: "-1",
        label: "No hydration mismatch when the client's ids match the shell order exactly",
      },
      {
        input: 'runStreamingTimeline(["header","sidebar","main","footer"], ["footer","header","main","sidebar"], ["header","wrong","main","footer"]).hydrationMismatchIndex',
        expected: "1",
        label: "A client id that actually diverges from the shell order is caught at its exact index",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "budget-regression-reporter",
    conceptSlug: "performance-budgets",
    title: "Build a Budget Regression Reporter",
    description: `Extends the pass/fail budget check into a CI-bot-style report: how much did each metric change versus the last build, and did any of that change cause a new failure?

## The problem

A flat pass/fail check doesn't tell a reviewer *why* something failed — a bundle that grew 15% since the last build and now exceeds budget is a much more actionable message than just "failed."

## The idea

Reuse the budget check for both the current and baseline builds, then compute the percentage change per metric and flag a **regression** specifically when the current build fails a budget that the baseline build had been passing.

## Your task

Write \`compareToBaseline(current, baseline, budgets)\`, reusing \`checkBudget\`, returning an array of \`{ metric, current, baseline, deltaPercent, passed, regressed }\` (deltaPercent rounded to 1 decimal):

\`\`\`js
compareToBaseline({ bundleSizeKb: 190 }, { bundleSizeKb: 150 }, { bundleSizeKb: 170 })
// → [{ metric: "bundleSizeKb", current: 190, baseline: 150, deltaPercent: 26.7, passed: false, regressed: true }]
\`\`\``,
    starterCode: `function checkBudget(metrics, budgets) {
  // same as the Challenge
}
function compareToBaseline(current, baseline, budgets) {
  // return [{ metric, current, baseline, deltaPercent, passed, regressed }]
}`,
    solutionCode: `function checkBudget(metrics, budgets) {
  return Object.keys(budgets).map((metric) => ({
    metric,
    actual: metrics[metric],
    budget: budgets[metric],
    passed: metrics[metric] <= budgets[metric],
  }));
}
function compareToBaseline(current, baseline, budgets) {
  const results = checkBudget(current, budgets);
  const baselineResults = checkBudget(baseline, budgets);
  return results.map((r, i) => {
    const baselineVal = baselineResults[i].actual;
    const deltaPercent = baselineVal === 0 ? 0 : Math.round(((r.actual - baselineVal) / baselineVal) * 1000) / 10;
    return {
      metric: r.metric,
      current: r.actual,
      baseline: baselineVal,
      deltaPercent,
      passed: r.passed,
      regressed: !r.passed && baselineResults[i].passed,
    };
  });
}`,
    testCases: [
      {
        input: 'compareToBaseline({ bundleSizeKb: 190 }, { bundleSizeKb: 150 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", current: 190, baseline: 150, deltaPercent: 26.7, passed: false, regressed: true }]',
        label: "A build that grew past budget after a passing baseline is flagged as a regression",
      },
      {
        input: 'compareToBaseline({ bundleSizeKb: 160 }, { bundleSizeKb: 180 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", current: 160, baseline: 180, deltaPercent: -11.1, passed: true, regressed: false }]',
        label: "An improvement shows a negative deltaPercent and is never a regression",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  // ── system-design (Feature 48) ────────────────────────────────────────────
  {
    slug: "resolve-build-order",
    conceptSlug: "component-driven-architecture",
    title: "Resolve a safe build order from a component dependency graph",
    description: `Extends the cycle detector into the tool a real build system needs: not just "is there a cycle," but "what order should things build in."

## The problem

Once a component import graph is known to be cycle-free, a build system (or a bundler resolving module order) still needs an actual order to build in — every dependency has to build before whatever depends on it.

## The idea

A topological sort produces exactly that order: visit each node's dependencies first (depth-first), then add the node itself once all its dependencies are already in the result. If a node is revisited while it's still being visited (not yet finished), that's a cycle.

## Your task

Write \`resolveBuildOrder(graph)\`, the same adjacency-list shape as the Challenge's \`findCycle\`. Return a valid build order (dependencies before dependents), or \`null\` if the graph has a cycle:

\`\`\`js
resolveBuildOrder({ A: ["B"], B: ["C"], C: [] })
// → ["C", "B", "A"]
resolveBuildOrder({ A: ["B"], B: ["A"] })
// → null
\`\`\``,
    starterCode: `function resolveBuildOrder(graph) {
  // DFS post-order: a node is added to the result only after all its deps are
}`,
    solutionCode: `function resolveBuildOrder(graph) {
  const visited = new Set();
  const visiting = new Set();
  const order = [];
  function dfs(node) {
    if (visited.has(node)) return true;
    if (visiting.has(node)) return false;
    visiting.add(node);
    for (const dep of graph[node] || []) {
      if (!dfs(dep)) return false;
    }
    visiting.delete(node);
    visited.add(node);
    order.push(node);
    return true;
  }
  for (const node of Object.keys(graph)) {
    if (!dfs(node)) return null;
  }
  return order;
}`,
    testCases: [
      {
        input: 'resolveBuildOrder({ A: ["B"], B: ["C"], C: [] })',
        expected: '["C", "B", "A"]',
        label: "Dependencies always appear before whatever depends on them",
      },
      {
        input: 'resolveBuildOrder({ A: ["B"], B: ["A"] })',
        expected: "null",
        label: "A cycle makes a valid build order impossible",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "dedupe-and-cache-fetcher",
    conceptSlug: "api-design-data-fetching-strategy",
    title: "Build a request-deduplicating, caching fetcher",
    description: `The single mechanism that fixes the most common real-world data-fetching bug: two components independently requesting the same resource at the same time.

## The problem

Without deduplication, two components mounting at once and both asking for the same resource fire two separate network requests for identical data — wasted work, and a real risk of the two responses arriving in a different order than they were sent.

## The idea

A fetcher keyed by request key tracks in-flight promises: a second \`get(key)\` call while the first is still pending returns the *same* promise instead of starting a new fetch. Once resolved, the value is cached so later calls skip the network entirely — until explicitly invalidated.

## Your task

Write \`createFetcher(fetchFn)\`, returning \`{ get(key), invalidate(key) }\`. Concurrent \`get\` calls for the same key must only invoke \`fetchFn\` once; a resolved value must be served from cache on subsequent calls; \`invalidate(key)\` clears the cache so the next \`get\` re-fetches.`,
    starterCode: `function createFetcher(fetchFn) {
  // track in-flight promises per key, plus a resolved-value cache
}`,
    solutionCode: `function createFetcher(fetchFn) {
  const cache = new Map();
  const inflight = new Map();
  return {
    async get(key) {
      if (cache.has(key)) return cache.get(key);
      if (inflight.has(key)) return inflight.get(key);
      const promise = fetchFn(key)
        .then((value) => {
          cache.set(key, value);
          return value;
        })
        .finally(() => {
          inflight.delete(key);
        });
      inflight.set(key, promise);
      return promise;
    },
    invalidate(key) {
      cache.delete(key);
    },
  };
}`,
    testCases: [
      {
        input: "two concurrent get(\\\"x\\\") calls against a counting fetchFn",
        expected: "fetchFn called exactly once",
        label: "Concurrent gets for the same key dedupe to a single underlying call",
      },
      {
        input: "get(key) called again after invalidate(key)",
        expected: "fetchFn called again",
        label: "invalidate() forces the next get() to re-fetch",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "reconnect-scheduler",
    conceptSlug: "designing-real-time-updates",
    title: "Build a capped exponential-backoff reconnect scheduler",
    description: `The reconnection logic every persistent-connection client (WebSocket or SSE) needs, since a dropped connection is a certainty, not an edge case.

## The problem

Reconnecting immediately after every drop hammers the server the moment it's struggling (which is often exactly when connections are dropping in the first place). Reconnecting on a fixed delay wastes time once the server has recovered.

## The idea

Exponential backoff increases the delay after each failed attempt, capped at a maximum so it never grows unbounded — and gives up entirely after too many attempts rather than retrying forever.

## Your task

Write \`nextRetryDelay(attempt, { baseMs, maxMs })\`, doubling the delay for each attempt starting at \`baseMs\`, capped at \`maxMs\`. Write \`shouldGiveUp(attempt, maxAttempts)\`, returning whether the attempt count has reached the cap:

\`\`\`js
nextRetryDelay(1, { baseMs: 100, maxMs: 5000 }) // → 100
nextRetryDelay(3, { baseMs: 100, maxMs: 5000 }) // → 400
nextRetryDelay(10, { baseMs: 100, maxMs: 5000 }) // → 5000 (capped)
\`\`\``,
    starterCode: `function nextRetryDelay(attempt, { baseMs, maxMs }) {
  // baseMs * 2^(attempt - 1), capped at maxMs
}
function shouldGiveUp(attempt, maxAttempts) {
  // true once attempt has reached maxAttempts
}`,
    solutionCode: `function nextRetryDelay(attempt, { baseMs, maxMs }) {
  const delay = baseMs * Math.pow(2, attempt - 1);
  return Math.min(delay, maxMs);
}
function shouldGiveUp(attempt, maxAttempts) {
  return attempt >= maxAttempts;
}`,
    testCases: [
      {
        input: "nextRetryDelay(3, { baseMs: 100, maxMs: 5000 })",
        expected: "400",
        label: "Delay doubles with each attempt",
      },
      {
        input: "nextRetryDelay(10, { baseMs: 100, maxMs: 5000 })",
        expected: "5000",
        label: "Delay never exceeds maxMs",
      },
      {
        input: "shouldGiveUp(5, 5)",
        expected: "true",
        label: "Giving up triggers once the attempt count reaches the cap",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "infinite-scroll-controller",
    conceptSlug: "designing-infinite-scroll-feed",
    title: "Build a stateful infinite-scroll feed controller",
    description: `Extends the page-merge Challenge into the full controller a real infinite-scroll feed needs: accumulated state, plus the scroll-threshold check that decides when to fetch the next page.

## The problem

Merging one page into the next is only half the feature — something also has to decide *when* to trigger the next fetch based on how close the user has scrolled to the bottom, and hold the running feed state across however many pages have loaded.

## The idea

A small stateful controller wraps the page-merge logic, tracking the accumulated items and current cursor, plus a pure scroll-threshold check that's easy to test independent of any real DOM scroll event.

## Your task

Write \`createFeedController()\`, returning \`{ loadPage(newPage), getState(), shouldFetchNext(scrollTop, scrollHeight, clientHeight, thresholdPx = 200) }\`. \`loadPage\` merges a new page into the running state (same dedup-by-id rule as the Challenge) and returns the updated state; \`shouldFetchNext\` returns whether the remaining scroll distance is at or under the threshold:

\`\`\`js
const feed = createFeedController();
feed.loadPage({ items: [{ id: 1 }, { id: 2 }], nextCursor: "c1" });
feed.loadPage({ items: [{ id: 2 }, { id: 3 }], nextCursor: "c2" });
feed.getState() // → { items: [{id:1},{id:2},{id:3}], cursor: "c2" }
\`\`\``,
    starterCode: `function createFeedController() {
  // wrap mergeFeedPage-style logic in running state, plus shouldFetchNext
}`,
    solutionCode: `function mergeFeedPage(existingItems, newPage) {
  const seen = new Set(existingItems.map((i) => i.id));
  const merged = [...existingItems];
  for (const item of newPage.items) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return { items: merged, nextCursor: newPage.nextCursor };
}
function shouldFetchNext(scrollTop, scrollHeight, clientHeight, thresholdPx = 200) {
  return scrollHeight - scrollTop - clientHeight <= thresholdPx;
}
function createFeedController() {
  let items = [];
  let cursor = null;
  return {
    loadPage(newPage) {
      const merged = mergeFeedPage(items, newPage);
      items = merged.items;
      cursor = merged.nextCursor;
      return { items, cursor };
    },
    getState() {
      return { items, cursor };
    },
    shouldFetchNext,
  };
}`,
    testCases: [
      {
        input: "two loadPage() calls with an overlapping id",
        expected: "state.items has no duplicate ids, cursor is the latest nextCursor",
        label: "The controller accumulates pages without duplicating items",
      },
      {
        input: "shouldFetchNext(100, 1000, 800, 200)",
        expected: "true",
        label: "Scrolling within the threshold of the bottom triggers a fetch",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "apply-collab-ops",
    conceptSlug: "designing-realtime-collaborative-editor",
    title: "Apply a log of concurrent insert operations to converge on one document",
    description: `Extends the single-pair transform Challenge into the real OT loop: a whole log of concurrent operations, applied so every one lands correctly relative to everything already applied.

## The problem

A single \`transform(opA, opB)\` call only handles two operations. A real document has to apply an arbitrary-length stream of operations, each one authored against the document as it looked *before* any of the concurrent ones were applied.

## The idea

Apply operations one at a time. Before applying each one, transform it against every operation already applied so far, in the order they were applied — folding the transform across the growing "already applied" list.

## Your task

Write \`applyOps(initialText, ops)\`, where \`ops\` is a list of \`{ pos, text }\` insert operations, all authored against \`initialText\`. Return the final text after applying all of them, each correctly transformed against every operation applied before it:

\`\`\`js
applyOps("Hello", [{ pos: 5, text: " World" }, { pos: 5, text: "!" }])
// → "Hello World!"
\`\`\``,
    starterCode: `function transform(opA, opB) {
  // same as the Challenge
}
function applyOps(initialText, ops) {
  // apply each op after folding transform() across all previously applied ops
}`,
    solutionCode: `function transform(opA, opB) {
  if (opB.pos >= opA.pos) {
    return { ...opB, pos: opB.pos + opA.text.length };
  }
  return { ...opB };
}
function applyOps(initialText, ops) {
  let text = initialText;
  const applied = [];
  for (const rawOp of ops) {
    let op = rawOp;
    for (const prev of applied) {
      op = transform(prev, op);
    }
    text = text.slice(0, op.pos) + op.text + text.slice(op.pos);
    applied.push(op);
  }
  return text;
}`,
    testCases: [
      {
        input: 'applyOps("Hello", [{ pos: 5, text: " World" }, { pos: 5, text: "!" }])',
        expected: '"Hello World!"',
        label: "Concurrent inserts at the same position converge without corrupting the text",
      },
      {
        input: 'applyOps("ab", [{ pos: 1, text: "X" }, { pos: 0, text: "Y" }])',
        expected: '"YaXb"',
        label: "An earlier-position insert is unaffected by a later concurrent one",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "find-shared-dependency-conflicts",
    conceptSlug: "frontend-architecture-patterns",
    title: "Find mismatched shared dependency versions across micro-frontends",
    description: `The concrete cost micro-frontends pay for their deployment independence: nothing forces every app to agree on a shared dependency's version.

## The problem

Once separate teams own separate deploys, one app upgrading React while another hasn't creates two different React instances loaded at once — a real, common source of "why are hooks broken" bugs in production micro-frontend setups.

## The idea

Collect every app's declared dependency versions, grouped by dependency name. Any dependency with more than one distinct version across apps is a conflict that needs a resolution strategy (a shared singleton version, or accepting the duplication).

## Your task

Write \`findSharedDependencyConflicts(apps)\`, where \`apps\` is \`{ name, dependencies: Record<string, string> }[]\`. Return an array of \`{ dependency, versions }\` (versions keyed by app name) for every dependency where apps disagree:

\`\`\`js
findSharedDependencyConflicts([
  { name: "checkout", dependencies: { react: "18.2.0" } },
  { name: "catalog", dependencies: { react: "17.0.0" } },
])
// → [{ dependency: "react", versions: { checkout: "18.2.0", catalog: "17.0.0" } }]
\`\`\``,
    starterCode: `function findSharedDependencyConflicts(apps) {
  // group versions by dependency name, flag any with more than one distinct value
}`,
    solutionCode: `function findSharedDependencyConflicts(apps) {
  const depVersions = {};
  for (const app of apps) {
    for (const [dep, version] of Object.entries(app.dependencies)) {
      if (!depVersions[dep]) depVersions[dep] = {};
      depVersions[dep][app.name] = version;
    }
  }
  const conflicts = [];
  for (const [dep, versions] of Object.entries(depVersions)) {
    const uniqueVersions = new Set(Object.values(versions));
    if (uniqueVersions.size > 1) conflicts.push({ dependency: dep, versions });
  }
  return conflicts;
}`,
    testCases: [
      {
        input:
          'findSharedDependencyConflicts([{ name: "checkout", dependencies: { react: "18.2.0" } }, { name: "catalog", dependencies: { react: "17.0.0" } }])',
        expected:
          '[{ dependency: "react", versions: { checkout: "18.2.0", catalog: "17.0.0" } }]',
        label: "A mismatched shared dependency version is flagged",
      },
      {
        input:
          'findSharedDependencyConflicts([{ name: "checkout", dependencies: { react: "18.2.0" } }, { name: "catalog", dependencies: { react: "18.2.0" } }])',
        expected: "[]",
        label: "Matching versions across every app produce no conflicts",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  },

  {
    slug: "memoized-store-selector",
    conceptSlug: "state-management-at-scale",
    title: "Build a tiny store with a memoized selector",
    description: `The mechanism behind why a well-layered global store doesn't cause unrelated re-renders: selectors that only "change" when the slice they read actually changes.

## The problem

A naive global store re-renders every subscriber whenever *any* part of the state changes — a component reading only \`user\` shouldn't recompute or re-render when an unrelated \`theme\` field changes.

## The idea

A selector wraps a plain function over the store's state, but only counts as having "changed" when the value it extracts is different from last time — an unrelated state change still calls the selector function, but its result is recognized as unchanged.

## Your task

Write \`createStore(initialState)\`, returning \`{ getState(), setState(partial), subscribe(listener) }\` (a shallow-merging store). Write \`createSelector(store, selectorFn)\`, returning a \`select()\` function whose \`.getComputeCount()\` only increments when \`selectorFn\`'s result actually differs from the previous call:

\`\`\`js
const store = createStore({ user: "Alice", theme: "dark" });
const selectUser = createSelector(store, (s) => s.user);
selectUser(); // "Alice", computeCount → 1
store.setState({ theme: "light" }); // unrelated change
selectUser(); // "Alice", computeCount still 1
store.setState({ user: "Bob" });
selectUser(); // "Bob", computeCount → 2
\`\`\``,
    starterCode: `function createStore(initialState) {
  // getState/setState (shallow merge)/subscribe
}
function createSelector(store, selectorFn) {
  // select() recomputes selectorFn every call, but only bumps computeCount
  // when the result actually differs from the previous one
}`,
    solutionCode: `function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState() {
      return state;
    },
    setState(partial) {
      state = { ...state, ...partial };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
function createSelector(store, selectorFn) {
  let lastResult;
  let hasRun = false;
  let computeCount = 0;
  function select() {
    const result = selectorFn(store.getState());
    if (!hasRun || result !== lastResult) {
      computeCount++;
      lastResult = result;
      hasRun = true;
    }
    return lastResult;
  }
  select.getComputeCount = () => computeCount;
  return select;
}`,
    testCases: [
      {
        input: "an unrelated setState() call after selecting once",
        expected: "getComputeCount() stays the same",
        label: "A change to a different field never bumps the selector's compute count",
      },
      {
        input: "a setState() call that changes the selected field",
        expected: "getComputeCount() increments",
        label: "A change to the selected field itself bumps the compute count",
      },
    ],
    isPremium: true,
    orderIndex: 1,
  }
];

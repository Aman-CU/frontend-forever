import type { ChallengeSeed } from "../types";

export const CONCEPT_LINKED_CHALLENGES: ChallengeSeed[] = [
  {
    slug: "implement-debounce",
    companies: ["Google", "Uber"],
    conceptSlug: "debouncing-throttling",
    title: "Implement debounce",
    description: `**Debounce** delays running a function until the user *stops* triggering it. It's the standard fix for "this is firing way too often."

## The problem

Picture a search box that calls an API on every keystroke. Type **india** and you fire five requests — for \`i\`, \`in\`, \`ind\`, \`indi\`, \`india\` — but only the last one matters. The other four are wasted bandwidth and server load, and a slow earlier response can even land *after* the final one and overwrite it.

## The idea

A debounced function waits for quiet. Every new call **resets a timer**; the real work only runs once \`delay\` milliseconds pass with no new calls. Type fast, pause, and a single request fires.

## Your task

Write \`debounce(fn, delay)\` that returns a new function which:

- delays calling \`fn\` until \`delay\` ms have passed since the **last** call
- forwards the latest arguments and \`this\` to \`fn\`
- exposes a \`.cancel()\` method that throws away any pending call

\`\`\`js
const search = debounce((q) => fetch("/api?q=" + q), 300);
search("i"); search("in"); search("ind");
// only "ind" runs, 300ms after the last call
search.cancel(); // ...unless you cancel first
\`\`\`

> **Debounce vs throttle:** debounce waits for a pause (great for search, resize, autosave). Throttle runs at a steady maximum rate (great for scroll handlers). Different tools for different jobs.

Try it live in the playground below — type into the search box, then make your \`debounce\` cut the request count.`,
    difficulty: "easy",
    starterCode: `function debounce(fn, delay) {
  // your implementation here
}`,
    solutionCode: `function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}`,
    testCases: [
      { input: "called 3 times within delay", expected: "fn invoked once", label: "Coalesces rapid calls" },
      { input: "cancel() before delay expires", expected: "fn never invoked", label: "Cancel prevents invocation" },
      { input: "called after delay elapses", expected: "fn invoked", label: "Fires after full delay" },
    ],
    hints: [
      "Use setTimeout and clearTimeout to manage the timer.",
      "Store the timer ID in a closure variable so it's accessible on every call.",
      "The .cancel() method simply clears the stored timer ID.",
    ],
    orderIndex: 1,
  },

  {
    slug: "virtual-list",
    conceptSlug: "list-virtualization",
    title: "Virtualized list windowing",
    description: `**Virtualization** (or "windowing") renders a huge list at 60fps by only mounting the rows you can actually see — a few dozen, not thousands.

## The problem

Render 10,000 rows the naive way and the browser creates 10,000 DOM nodes. Every scroll, re-render, and layout has to walk all of them, so the page stutters and memory balloons — all to show about a dozen rows at a time.

## The idea

The screen only fits a handful of rows, so mount *only those* and swap them as the user scrolls. The trick is the **windowing math**: given the scroll position, which row indices are on screen right now? You keep one tall spacer the full height of the list (so the scrollbar stays honest) and absolutely-position the visible rows inside it.

## Your task

Write \`visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan)\` returning \`{ start, end }\` — the **inclusive** index range of rows to mount:

- the first visible row is \`Math.floor(scrollTop / rowHeight)\`
- the last is \`Math.floor((scrollTop + containerHeight) / rowHeight)\`
- pad the range by \`overscan\` rows on each side so fast scrolls don't flash blank
- clamp to \`[0, totalRows - 1]\` — never index past the list

\`\`\`js
visibleRange(0, 40, 400, 10000, 3)      // { start: 0, end: 13 }
visibleRange(4000, 40, 400, 10000, 3)   // { start: 97, end: 113 }
\`\`\`

> **Why overscan?** Rendering exactly the visible rows means a quick scroll can outrun React and flash empty space. A few buffer rows above and below hide the seam.

Scroll the list in the playground below — your window keeps the DOM-node count tiny no matter how far down you go.`,
    difficulty: "medium",
    starterCode: `function visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan) {
  // return { start, end } — inclusive row indices to render
  // clamp to [0, totalRows - 1] and include the overscan buffer
}`,
    solutionCode: `function visibleRange(scrollTop, rowHeight, containerHeight, totalRows, overscan) {
  const first = Math.floor(scrollTop / rowHeight);
  const last = Math.floor((scrollTop + containerHeight) / rowHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(totalRows - 1, last + overscan);
  return { start, end };
}`,
    testCases: [
      {
        input: "visibleRange(0, 40, 400, 10000, 3)",
        expected: "{ start: 0, end: 13 }",
        label: "Initial window from the top",
      },
      {
        input: "visibleRange(4000, 40, 400, 10000, 3)",
        expected: "{ start: 97, end: 113 }",
        label: "Windowed mid-scroll with overscan",
      },
      {
        input: "visibleRange(399600, 40, 400, 10000, 3)",
        expected: "{ start: 9987, end: 9999 }",
        label: "Clamps at the end of the list",
      },
      {
        input: "end - start for any scrollTop",
        expected: "< 20 rows rendered",
        label: "Window stays tiny for 10,000 rows",
      },
    ],
    hints: [
      "The first visible row index is Math.floor(scrollTop / rowHeight).",
      "The last visible row is Math.floor((scrollTop + containerHeight) / rowHeight).",
      "Subtract overscan from start and add it to end to render a small buffer beyond the viewport.",
      "Clamp start with Math.max(0, ...) and end with Math.min(totalRows - 1, ...) so you never index past the list.",
    ],
    isPremium: true,
    orderIndex: 2,
  },

  {
    slug: "specificity-calculator",
    companies: ["Apple"],
    conceptSlug: "css-specificity",
    title: "CSS specificity calculator",
    description: `**Specificity** is how the browser breaks ties when several CSS rules target the same element. It's the answer to "why isn't my style applying?"

## The problem

Two rules set the same button's color — which wins? Not "the last one written" and not "the most code". The browser scores each selector and the higher score wins. Guess wrong and you reach for \`!important\`, which just moves the fight somewhere worse.

## The idea

Every selector gets a three-part score — **[id, class, element]** — counted most-powerful first:

- **id**: \`#cta\` → IDs
- **class**: \`.btn\`, \`[type="text"]\`, \`:hover\` → classes, attributes, and pseudo-classes
- **element**: \`button\`, \`::before\` → type selectors and pseudo-elements

Compare the tuples left to right: \`[1,0,0]\` (one ID) beats \`[0,2,0]\` (two classes), which beats \`[0,0,5]\` (five elements). The universal selector \`*\` and combinators (\`>\`, \`+\`, \`~\`) score nothing.

## Your task

Write \`specificity(selector)\` returning a \`[id, class, element]\` tuple:

\`\`\`js
specificity("#cta")             // [1, 0, 0]
specificity(".btn.primary")     // [0, 2, 0]
specificity("button#cta.btn")   // [1, 1, 1]
specificity("[type='text']")    // [0, 1, 0]
\`\`\`

> **One ID beats a hundred classes.** Specificity is compared column by column, never summed — \`[1,0,0]\` always wins over \`[0,99,0]\`. That's exactly why an ID selector is so hard to override.

Watch four selectors fight over one button in the playground below — your scoring crowns the winner.`,
    difficulty: "easy",
    starterCode: `function specificity(selector) {
  // returns [idCount, classCount, elementCount]
}`,
    solutionCode: `function specificity(selector) {
  let id = 0, cls = 0, el = 0;
  // remove attribute selectors before counting
  const s = selector.replace(/\\[[^\\]]*\\]/g, () => { cls++; return ''; });
  for (const part of s.split(/[ >+~]/)) {
    id  += (part.match(/#[a-zA-Z]/g) || []).length;
    cls += (part.match(/\\.[a-zA-Z]|:[^:]/g) || []).length;
    el  += (part.match(/^[a-zA-Z]|::[a-zA-Z]/g) || []).length;
  }
  return [id, cls, el];
}`,
    testCases: [
      { input: "#cta", expected: "[1,0,0]", label: "ID selector" },
      { input: ".btn.primary", expected: "[0,2,0]", label: "Two class selectors" },
      { input: "button#cta.btn", expected: "[1,1,1]", label: "Mixed selector" },
      { input: "[type='text']", expected: "[0,1,0]", label: "Attribute selector" },
    ],
    hints: [
      "Count `#word` for IDs, `.word` and `:pseudo-class` for classes, element names and `::pseudo-element` for elements.",
      "Attribute selectors `[...]` count as a class-level specificity — strip them first to avoid false matches.",
      "The universal selector `*` contributes 0 to all three counts.",
    ],
    orderIndex: 1,
  },

  {
    slug: "classify-hoisting-access",
    companies: ["Google"],
    conceptSlug: "hoisting-temporal-dead-zone",
    title: "Classify a hoisting access",
    description: `**Hoisting** determines whether code "sees" a declaration before its line runs — but *how* it sees it differs by declaration kind. This challenge tests that difference directly.

## The problem

\`var\`, \`let\`, and \`const\` are all hoisted, but reading them before their declaration line behaves completely differently — one quietly returns \`undefined\`, the other throws. Knowing which is which, from the actual runtime behavior rather than a rule you memorized, is the real skill.

## The idea

A function that reads a variable before its declaration line either throws a \`ReferenceError\` (a \`let\`/\`const\` still inside its temporal dead zone) or returns \`undefined\` (a \`var\`, hoisted and pre-initialized). Catching that difference at runtime is exactly how you'd classify it.

## Your task

Write \`classifyAccess(fn)\` that calls \`fn\` and classifies what happened:

- returns \`"tdz"\` if calling \`fn\` throws a \`ReferenceError\`
- returns \`"hoisted-undefined"\` if calling \`fn\` returns \`undefined\`
- returns \`"value"\` if calling \`fn\` returns anything else

\`\`\`js
classifyAccess(() => { const result = x; var x = 1; return result; });
// "hoisted-undefined" — var x is hoisted, but unassigned until its line runs

classifyAccess(() => { const result = y; let y = 1; return result; });
// throws before returning — classifyAccess catches it, returns "tdz"
\`\`\`

> **Why var and let disagree here:** both are hoisted to the top of their scope, but var is initialized to undefined immediately, while let stays uninitialized until its declaration line executes — reading it before that throws instead of quietly returning undefined.

Try it in the playground below — pass in functions that access variables before their declaration line, and watch which ones throw.`,
    difficulty: "easy",
    starterCode: `function classifyAccess(fn) {
  // call fn() and classify what happens:
  // "tdz" if it throws a ReferenceError
  // "hoisted-undefined" if it returns undefined
  // "value" if it returns anything else
}`,
    solutionCode: `function classifyAccess(fn) {
  try {
    const result = fn();
    return result === undefined ? "hoisted-undefined" : "value";
  } catch (e) {
    if (e instanceof ReferenceError) return "tdz";
    throw e;
  }
}`,
    testCases: [
      {
        input: "fn reads a `let` variable before its declaration line",
        expected: "\"tdz\"",
        label: "let/const before declaration throws inside the TDZ",
      },
      {
        input: "fn reads a `var` variable before its declaration line",
        expected: "\"hoisted-undefined\"",
        label: "var is hoisted and pre-initialized to undefined",
      },
      {
        input: "fn reads a variable after it's been assigned a value",
        expected: "\"value\"",
        label: "A normal read after assignment returns the real value",
      },
    ],
    hints: [
      "Wrap the call to fn() in a try/catch — a TDZ violation throws a real ReferenceError you can catch.",
      "Check `e instanceof ReferenceError` rather than matching on the error message, which can vary between engines.",
      "A hoisted-but-unassigned var reads as undefined, not an error — that's the case a plain try/catch alone won't distinguish without checking the return value.",
    ],
    orderIndex: 4,
  },

  {
    slug: "implement-loose-equals",
    companies: ["Amazon"],
    conceptSlug: "equality-type-coercion",
    title: "Implement loose equals",
    description: `JavaScript's \`==\` operator has a bad reputation, but its actual coercion rules are learnable — and implementing them yourself is the fastest way to stop being surprised by them.

## The problem

\`0 == false\`, \`'' == 0\`, and \`null == undefined\` all return \`true\`, for three different reasons. Most developers can recite "avoid ==" without being able to say *why* it behaves the way it does — which makes it hard to spot the one case (\`null\`/\`undefined\`) where it's actually useful.

## The idea

Loose equality coerces operands to a common type before comparing. For the primitive types you'll actually encounter, the rules boil down to: booleans convert to numbers first, then compare as numbers/strings; \`null\` and \`undefined\` are loosely equal only to each other; everything else falls back to strict comparison.

## Your task

Write \`looseEquals(a, b)\` that reproduces \`==\`'s behavior for \`number\`, \`string\`, \`boolean\`, \`null\`, and \`undefined\` — without using \`==\` anywhere in your implementation:

\`\`\`js
looseEquals(0, false);        // true
looseEquals('', false);       // true
looseEquals(null, undefined); // true
looseEquals(null, 0);         // false
looseEquals(1, '1');          // true
\`\`\`

> **The one legitimate use of \`==\`:** \`value == null\` is true for both \`null\` and \`undefined\` and false for everything else — including \`0\`, \`''\`, and \`false\`. That's the one loose-equality check worth writing on purpose.

Try it in the playground below against the same tricky pairs that trip up \`==\` in real code.`,
    difficulty: "easy",
    starterCode: `function looseEquals(a, b) {
  // reproduce == for number, string, boolean, null, and undefined —
  // without using == anywhere in your implementation
}`,
    solutionCode: `function looseEquals(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return (a === null || a === undefined) && (b === null || b === undefined);
  }
  if (typeof a === "boolean") return looseEquals(Number(a), b);
  if (typeof b === "boolean") return looseEquals(a, Number(b));
  if (typeof a === "number" && typeof b === "string") return a === Number(b);
  if (typeof a === "string" && typeof b === "number") return Number(a) === b;
  return a === b;
}`,
    testCases: [
      { input: "looseEquals(0, false)", expected: "true", label: "false coerces to 0" },
      { input: "looseEquals('', false)", expected: "true", label: "'' and false both coerce to 0" },
      {
        input: "looseEquals(null, undefined)",
        expected: "true",
        label: "null and undefined are loosely equal to each other",
      },
      {
        input: "looseEquals(null, 0)",
        expected: "false",
        label: "null is not loosely equal to anything except undefined",
      },
      { input: "looseEquals(1, '1')", expected: "true", label: "Numeric string coerces to a number" },
    ],
    hints: [
      "Handle null/undefined first, as a special pair-only case, before touching the other types.",
      "Coerce booleans to numbers (Number(true) === 1) and recurse — that reduces the boolean case to a number comparison you already handle.",
      "For the remaining number/string mismatch, convert the string side with Number(...) and compare as numbers.",
    ],
    orderIndex: 5,
  },

  {
    slug: "implement-once",
    companies: ["Meta"],
    conceptSlug: "closures",
    title: "Implement once",
    description: `Some functions should only ever do their real work the first time they're called — a closure is exactly the tool that makes that possible.

## The problem

Expensive setup code — initializing a connection, running a one-time migration, showing a "welcome" modal — should run exactly once, no matter how many times the wrapping function gets called. Re-running it on every call wastes work or, worse, causes visible bugs.

## The idea

Wrap the function in a closure that remembers two things across calls: whether it has already run, and what it returned. The first call does the real work and caches the result; every call after that skips straight to the cached value.

## Your task

Write \`once(fn)\` that returns a new function which:

- calls \`fn\` and returns its result on the **first** call
- returns that **same cached result** on every call after, without calling \`fn\` again
- forwards the arguments and \`this\` from the first call only

\`\`\`js
let calls = 0;
const init = once(() => { calls++; return "ready"; });
init(); // "ready", calls === 1
init(); // "ready", calls still === 1
\`\`\`

> **This is the same pattern as memoization**, just without needing to key the cache by arguments — once assumes the first call's result is valid forever, which is exactly right for one-time setup work.

Try it in the playground below and confirm the wrapped function's side effect only ever fires once.`,
    difficulty: "medium",
    starterCode: `function once(fn) {
  // return a function that calls fn on the first call only,
  // returning the cached result on every call after that
}`,
    solutionCode: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      result = fn.apply(this, args);
      called = true;
    }
    return result;
  };
}`,
    testCases: [
      {
        input: "called 3 times in a row",
        expected: "fn's body runs only once",
        label: "Only the first call runs the real function",
      },
      {
        input: "second and third calls",
        expected: "return the first call's cached result",
        label: "Later calls return the cached value, not a fresh one",
      },
      {
        input: "first call with arguments and a `this` context",
        expected: "forwarded correctly to fn",
        label: "Arguments and this are forwarded on the first call",
      },
    ],
    hints: [
      "Use two closure variables: a boolean flag and the cached result.",
      "Check the flag before calling fn — if it's already true, skip straight to returning the cached result.",
      "Use fn.apply(this, args) so the wrapped function still forwards its caller's `this`, not just the arguments.",
    ],
    orderIndex: 6,
  },

  {
    slug: "implement-my-map",
    companies: ["Airbnb"],
    conceptSlug: "callbacks-higher-order-functions",
    title: "Implement your own map",
    description: `\`Array.prototype.map\` looks like magic until you've built it yourself — underneath, it's just a loop and a callback.

## The problem

Every array method that takes a callback — \`map\`, \`filter\`, \`reduce\` — follows the same shape: loop over the array, call the callback with each item, and do something with what it returns. Understanding that shape is what turns "memorize the API" into "derive the API."

## The idea

\`map\` needs to call the callback once per item, in order, passing not just the value but also its index and the whole array (matching the real \`Array.prototype.map\` signature) — and collect the return values into a new array, without touching the original.

## Your task

Write \`myMap(array, callback)\` that behaves like \`Array.prototype.map\`:

- calls \`callback(value, index, array)\` for every item, in order
- collects each return value into a new array
- never mutates the original \`array\`

\`\`\`js
myMap([1, 2, 3], (n) => n * 2);              // [2, 4, 6]
myMap(["a", "b"], (v, i) => i + ":" + v);     // ["0:a", "1:b"]
\`\`\`

> **Why the index and array arguments matter:** real code leans on them more often than you'd expect — deduplicating by position, or referencing a sibling element in the same array from inside the callback.

Try it in the playground below — your implementation should be indistinguishable from the real \`.map()\`.`,
    difficulty: "easy",
    starterCode: `function myMap(array, callback) {
  // return a new array — call callback(value, index, array) for each item
}`,
    solutionCode: `function myMap(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i, array));
  }
  return result;
}`,
    testCases: [
      { input: "myMap([1, 2, 3], n => n * 2)", expected: "[2, 4, 6]", label: "Transforms every item" },
      {
        input: "myMap(['a','b'], (v, i) => i + ':' + v)",
        expected: "['0:a', '1:b']",
        label: "Passes index as the callback's second argument",
      },
      {
        input: "the original array, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input array",
      },
    ],
    hints: [
      "Loop with a plain for loop so you have easy access to the index.",
      "Call callback with three arguments — value, index, and the original array — matching the real Array.prototype.map signature.",
      "Push each callback result into a brand-new array; never assign back into the input array.",
    ],
    orderIndex: 7,
  },

  {
    slug: "implement-update-item",
    companies: ["Stripe"],
    conceptSlug: "array-object-methods-immutability",
    title: "Immutably update one item in a list",
    description: `Updating one item in a list without mutating the list — or the item — is the single most common immutability exercise, because it's the pattern behind almost every "edit" feature.

## The problem

You have a list of objects (todos, users, cart items) and need to change one field on one of them. Mutating the item directly (\`items[i].done = true\`) works, but it also silently mutates whatever else was holding a reference to that same array or object — a real bug in any code that expects unchanged data to stay unchanged.

## The idea

Find the matching item by id, build a **new** object for it by spreading the old one and overriding the changed fields, and return a **new** array with that new object swapped in — every other item stays exactly the same reference it was before.

## Your task

Write \`updateItem(items, id, changes)\` that:

- finds the item whose \`id\` matches
- returns a **new array** with that item shallow-merged with \`changes\`
- leaves every other item as the exact same reference as before
- never mutates \`items\` or any item inside it

\`\`\`js
const items = [{ id: 1, done: false }, { id: 2, done: false }];
updateItem(items, 1, { done: true });
// [{ id: 1, done: true }, { id: 2, done: false }]
\`\`\`

> **"Every other item stays the same reference" is the real test here** — it's easy to write a version that produces the right *values* but rebuilds every object, which defeats optimizations (like React's \`memo\`) that rely on unchanged references meaning unchanged data.

Try it in the playground below on a small todo list and confirm untouched items keep their identity.`,
    difficulty: "medium",
    starterCode: `function updateItem(items, id, changes) {
  // return a new array; the matching item is shallow-merged with changes;
  // every other item must be the exact same reference as before
}`,
    solutionCode: `function updateItem(items, id, changes) {
  return items.map((item) => (item.id === id ? { ...item, ...changes } : item));
}`,
    testCases: [
      {
        input: "updateItem([{id:1,done:false},{id:2,done:false}], 1, {done:true})",
        expected: "[{id:1,done:true},{id:2,done:false}]",
        label: "Merges changes into the matching item",
      },
      {
        input: "the non-matching item in the result",
        expected: "same object reference as the input",
        label: "Untouched items keep the exact same reference",
      },
      {
        input: "the original items array and its objects, checked after the call",
        expected: "unchanged",
        label: "Does not mutate the input array or any item",
      },
    ],
    hints: [
      "Array.prototype.map is the right tool — it already returns a new array without mutating the original.",
      "Only build a new object (via spread) for the item whose id matches; return every other item exactly as-is.",
      "Spread changes after the original item's properties so changes' values win on conflicting keys.",
    ],
    orderIndex: 8,
  },

  {
    slug: "implement-my-bind",
    companies: ["Uber"],
    conceptSlug: "this-binding-execution-context",
    title: "Implement your own bind",
    description: `\`.bind()\` looks like a built-in convenience method until you realize it's really just a closure holding onto a fixed \`this\` and a set of preset arguments.

## The problem

Passing a method as a bare callback (\`element.addEventListener('click', obj.method)\`) detaches it from \`obj\` — by the time it's called, there's no object to the left of a dot anymore, so \`this\` isn't what you expect. \`.bind()\` is the standard fix, but understanding *how* it fixes it requires understanding what it actually returns.

## The idea

\`.bind(context, ...presetArgs)\` doesn't call the function — it returns a **new function** that, whenever it's eventually called, calls the original function with \`this\` locked to \`context\`, ignoring however the new function itself was invoked.

## Your task

Write \`myBind(fn, context, ...presetArgs)\` that returns a new function which, when called:

- always calls \`fn\` with \`this\` set to \`context\`, regardless of how the returned function is invoked
- prepends \`presetArgs\` before any arguments passed at call time

\`\`\`js
function greet(greeting, punctuation) {
  return greeting + ", " + this.name + punctuation;
}
const bound = myBind(greet, { name: "Ada" }, "Hello");
bound("!"); // "Hello, Ada!"
\`\`\`

> **Why this matters beyond the polyfill:** the exact same idea — a closure capturing a fixed \`this\` — is what an arrow function does automatically for you, without needing an explicit \`.bind()\` call at all.

Try it in the playground below — detach a method from its object, bind it back, and confirm \`this\` stays correct.`,
    difficulty: "medium",
    starterCode: `function myBind(fn, context, ...presetArgs) {
  // return a new function that always calls fn with this = context,
  // prepending presetArgs before any arguments passed at call time
}`,
    solutionCode: `function myBind(fn, context, ...presetArgs) {
  return function (...callArgs) {
    return fn.apply(context, [...presetArgs, ...callArgs]);
  };
}`,
    testCases: [
      {
        input: "a bound method called as a bare function reference",
        expected: "this is still the original context",
        label: "this stays locked to context no matter how the bound function is called",
      },
      {
        input: "myBind(greet, {name:'Ada'}, 'Hello')('!')",
        expected: "'Hello, Ada!'",
        label: "Preset arguments are prepended before call-time arguments",
      },
      {
        input: "calling the bound function as a method of a different object",
        expected: "this is still the original context, not the new object",
        label: "Bound this cannot be overridden by a later method-style call",
      },
    ],
    hints: [
      "Return a regular function (not an arrow function) so you can use fn.apply inside it — the returned function's own this doesn't matter, only context does.",
      "Combine presetArgs and the call-time arguments into one array before calling apply.",
      "fn.apply(context, argsArray) is the one line doing all the real work here.",
    ],
    orderIndex: 9,
  },

  {
    slug: "implement-inherit",
    companies: ["Microsoft"],
    conceptSlug: "prototypal-inheritance",
    title: "Wire up prototypal inheritance",
    description: `Before \`class extends\` existed, setting up inheritance meant wiring the prototype chain by hand — and that's still exactly what \`extends\` compiles down to.

## The problem

Two constructor functions, \`Dog\` and \`Animal\`, need \`Dog\` instances to inherit \`Animal\`'s methods — without copying those methods onto every single instance, which would waste memory and break shared-method updates.

## The idea

Instead of copying methods, link the prototypes themselves: set \`Dog.prototype\`'s internal \`[[Prototype]]\` to \`Animal.prototype\`. Now any method lookup that misses on \`Dog.prototype\` automatically continues up the chain to \`Animal.prototype\`.

## Your task

Write \`inherit(Child, Parent)\` that wires up prototypal inheritance between two constructor functions:

- every instance of \`Child\` can call methods defined on \`Parent.prototype\`
- \`Child\`'s own prototype methods still take priority over \`Parent\`'s
- \`new Child() instanceof Parent\` is \`true\` afterward

\`\`\`js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound."; };

function Dog(name) { Animal.call(this, name); }
inherit(Dog, Animal);
Dog.prototype.speak = function () { return this.name + " barks."; };

new Dog("Rex").speak();          // "Rex barks."
new Dog("Rex") instanceof Animal; // true
\`\`\`

> **Why not just copy \`Parent.prototype\`'s methods onto \`Child.prototype\`?** Copying breaks the live link — a method added to \`Animal.prototype\` *after* \`inherit\` runs would never reach \`Dog\` instances. Linking the prototypes keeps that connection live.

Try it in the playground below — confirm \`Dog\`'s own methods win, and inherited methods still work.`,
    difficulty: "medium",
    starterCode: `function inherit(Child, Parent) {
  // wire Child.prototype's [[Prototype]] to Parent.prototype
}`,
    solutionCode: `function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}`,
    testCases: [
      {
        input: "a Dog instance calling an inherited Animal method",
        expected: "the inherited method runs correctly",
        label: "Inherited methods are reachable through the prototype chain",
      },
      {
        input: "a Dog instance calling a method defined on Dog.prototype after inherit() ran",
        expected: "Dog's own method wins over Animal's",
        label: "Child's own prototype methods take priority",
      },
      {
        input: "new Dog() instanceof Animal",
        expected: "true",
        label: "instanceof recognizes the prototype chain",
      },
    ],
    hints: [
      "Object.create(Parent.prototype) creates a new object whose [[Prototype]] is exactly Parent.prototype — that's the link you need.",
      "Assign the result to Child.prototype directly — don't just add properties to the existing Child.prototype.",
      "Reset Child.prototype.constructor back to Child afterward — Object.create's result doesn't have one pointing the right way.",
    ],
    orderIndex: 10,
  },

  {
    slug: "predict-execution-order",
    companies: ["Google", "TikTok"],
    conceptSlug: "event-loop",
    title: "Predict execution order",
    description: `Reasoning about execution order — sync code, then microtasks, then macrotasks — is the single most-tested event loop skill. This challenge turns that reasoning into a function instead of a guessing game.

## The problem

Given a pile of scheduled work — some synchronous, some microtasks (promise callbacks), some macrotasks (\`setTimeout\` callbacks) — predicting the actual console output order is exactly what event loop interview questions ask for. Getting it right means applying the event loop's rules mechanically, not guessing.

## The idea

The event loop's rule, simplified to one pass: **all synchronous work runs first, in order. Then the entire microtask queue drains, in order. Then macrotasks run one at a time, in order.** No task ever runs before the microtask queue is empty.

## Your task

Write \`predictOrder(actions)\` — given an array of \`{ id, type }\` where \`type\` is \`"sync"\`, \`"microtask"\`, or \`"macrotask"\`, return the array of \`id\`s in the order they'd actually execute:

- every \`"sync"\` action first, in their original relative order
- then every \`"microtask"\` action, in their original relative order
- then every \`"macrotask"\` action, in their original relative order

\`\`\`js
predictOrder([
  { id: "a", type: "macrotask" },
  { id: "b", type: "sync" },
  { id: "c", type: "microtask" },
  { id: "d", type: "sync" },
]);
// ["b", "d", "c", "a"]
\`\`\`

> **This is the classic \`console.log\` / \`setTimeout\` / \`Promise.then\` puzzle, generalized.** The Event Loop guide's worked example is exactly this pattern with 4 fixed actions — this challenge asks you to handle any list.

Try it in the playground below with a scrambled list and confirm your function reorders it correctly.`,
    difficulty: "medium",
    starterCode: `function predictOrder(actions) {
  // return the ids in actual execution order:
  // all "sync" first, then all "microtask", then all "macrotask" —
  // each group keeping its own original relative order
}`,
    solutionCode: `function predictOrder(actions) {
  const order = ["sync", "microtask", "macrotask"];
  return order.flatMap((type) =>
    actions.filter((action) => action.type === type).map((action) => action.id)
  );
}`,
    testCases: [
      {
        input: "a scrambled list with all 3 types mixed together",
        expected: "all sync ids first, then microtask ids, then macrotask ids — each in original order",
        label: "Reorders by type while preserving relative order within each type",
      },
      {
        input: "a list with no sync actions",
        expected: "microtask ids followed by macrotask ids",
        label: "Handles a missing category gracefully",
      },
      {
        input: "a list where every action is the same type",
        expected: "the original order, unchanged",
        label: "A single-type list is returned in its original order",
      },
    ],
    hints: [
      "Filter the array three times — once per type — rather than trying to sort it in one pass.",
      "The order to filter in is exactly the event loop's rule: sync, then microtask, then macrotask.",
      "Array.prototype.flatMap (or three separate filters concatenated) combines the three filtered groups back into one array.",
    ],
    orderIndex: 11,
  },

  {
    slug: "implement-promise-all",
    companies: ["Meta", "Amazon"],
    conceptSlug: "promises-async-await",
    title: "Implement your own Promise.all",
    description: `\`Promise.all\` looks like a black box until you build it — underneath, it's just counting settled promises and failing fast on the first rejection.

## The problem

You need to run several async operations concurrently and wait for all of them, but only if every single one succeeds — a single failure should reject immediately, not wait for the slower ones to finish first.

## The idea

Start every promise immediately (they're already running by the time you receive them — a promise represents work already in progress). Track how many have resolved and store each result at its original index; resolve the moment every one has resolved, or reject immediately the moment any one rejects.

## Your task

Write \`myPromiseAll(promises)\` that mimics \`Promise.all\`:

- resolves with an array of results, in the **same order** as the input, once every promise resolves
- rejects immediately with the first rejection reason encountered, without waiting for the others
- resolves with \`[]\` immediately if \`promises\` is empty

\`\`\`js
myPromiseAll([Promise.resolve(1), Promise.resolve(2)]); // resolves [1, 2]
myPromiseAll([Promise.resolve(1), Promise.reject("no")]); // rejects "no"
\`\`\`

> **Why order matters here too:** promises can settle in any order depending on timing, but the result array must always match the *input* order — the same requirement the event-loop category's async task runner project has, for the same underlying reason.

Try it in the playground below with a mix of fast and slow promises, and one that rejects.`,
    difficulty: "hard",
    starterCode: `function myPromiseAll(promises) {
  // return a Promise that resolves with results in input order once all
  // resolve, or rejects immediately with the first rejection reason
}`,
    solutionCode: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((value) => {
          results[i] = value;
          remaining -= 1;
          if (remaining === 0) resolve(results);
        })
        .catch(reject);
    });
  });
}`,
    testCases: [
      {
        input: "myPromiseAll([Promise.resolve(1), Promise.resolve(2)])",
        expected: "resolves with [1, 2]",
        label: "Resolves with all results in input order",
      },
      {
        input: "one promise resolves slower than another",
        expected: "result order still matches input order, not resolution order",
        label: "Result order matches input order regardless of timing",
      },
      {
        input: "myPromiseAll([Promise.resolve(1), Promise.reject('no')])",
        expected: "rejects with 'no'",
        label: "Rejects immediately with the first rejection reason",
      },
      {
        input: "myPromiseAll([])",
        expected: "resolves with []",
        label: "An empty input resolves immediately with an empty array",
      },
    ],
    hints: [
      "Wrap everything in `new Promise((resolve, reject) => { ... })` — you're building a Promise, not just chaining one.",
      "Store each result at its own index (results[i] = value) inside the .then callback, so order is preserved regardless of which promise settles first.",
      "Call reject as soon as any promise rejects — don't wait to check the others.",
    ],
    orderIndex: 12,
  },

  {
    slug: "implement-curry",
    companies: ["Stripe"],
    conceptSlug: "function-composition-currying",
    title: "Implement a generic curry",
    description: `A generic \`curry\` function is one of the more genuinely hard interview challenges — it has to work for *any* function, of *any* arity, without knowing in advance how many arguments it needs.

## The problem

Manually curried functions (\`a => b => c => ...\`) work, but writing that by hand for every function is tedious, and it hardcodes the arity. A generic \`curry(fn)\` should take any function and make it callable either all at once, or one (or several) arguments at a time.

## The idea

\`curry(fn)\` needs to know how many arguments \`fn\` expects — \`fn.length\` gives you that. Each returned function collects arguments until it has at least that many; once it does, it calls the original function with all of them. Until then, it returns another function that keeps collecting.

## Your task

Write \`curry(fn)\` that returns a curried version of \`fn\`, callable with any grouping of arguments:

- calling it with all of \`fn\`'s arguments at once calls \`fn\` immediately
- calling it with fewer arguments returns a new function that collects the rest
- arguments can be supplied in any grouping — one at a time, a few at a time, or all at once

\`\`\`js
function add(a, b, c) { return a + b + c; }
const curried = curry(add);

curried(1)(2)(3);   // 6
curried(1, 2)(3);   // 6
curried(1)(2, 3);   // 6
curried(1, 2, 3);   // 6
\`\`\`

> **\`fn.length\` is the key trick here** — it reports a function's declared parameter count, which is exactly how \`curry\` knows when enough arguments have been collected to actually call \`fn\`, without you having to specify the arity separately.

Try it in the playground below — curry a 3-argument function and call it with every grouping shown above.`,
    difficulty: "hard",
    starterCode: `function curry(fn) {
  // return a curried version of fn, callable with arguments in any grouping
  // until fn.length arguments have been collected in total
}`,
    solutionCode: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
}`,
    testCases: [
      { input: "curried(1)(2)(3) for a 3-arg function", expected: "6", label: "One argument at a time" },
      { input: "curried(1, 2)(3) for a 3-arg function", expected: "6", label: "A partial group, then the rest" },
      { input: "curried(1, 2, 3) for a 3-arg function", expected: "6", label: "All arguments at once still works" },
      {
        input: "curried(1)(2, 3) for a 3-arg function",
        expected: "6",
        label: "Any grouping of arguments produces the same result",
      },
    ],
    hints: [
      "fn.length tells you how many parameters fn declares — that's the total argument count you're collecting toward.",
      "Each intermediate function needs to return a new function that remembers the arguments collected so far, via closure.",
      "Compare the accumulated argument count to fn.length on every call — once it's enough, call fn; otherwise, keep collecting.",
    ],
    isPremium: true,
    orderIndex: 13,
  },

  {
    slug: "implement-take",
    companies: ["Netflix"],
    conceptSlug: "generators-iterators",
    title: "Implement take for lazy iterables",
    description: `Generators are lazy by nature, which makes them the only reasonable way to work with a sequence that might be infinite — as long as whatever consumes them knows to stop asking.

## The problem

An infinite generator (an endless sequence of natural numbers, an endless stream of retry attempts) is only safe to use if you only ever pull a bounded number of values from it. Doing that safely — for any iterable, not just a specific generator — needs one small, reusable utility.

## The idea

\`take\` doesn't know or care whether the iterable it's given is finite or infinite. It just keeps pulling values until it's collected the requested count, or the iterable itself runs out first — whichever comes first.

## Your task

Write \`take(iterable, count)\` that lazily takes the first \`count\` values from any iterable and returns them as an array:

- works correctly on both finite and infinite generators
- stops after collecting \`count\` values, without over-consuming the iterable
- returns fewer than \`count\` values if the iterable runs out first

\`\`\`js
function* naturalNumbers() {
  let n = 1;
  while (true) yield n++;
}

take(naturalNumbers(), 5); // [1, 2, 3, 4, 5]
take([10, 20], 5);         // [10, 20] — the array runs out first
\`\`\`

> **Why this has to use the iterator protocol directly (or \`for...of\`'s break), not \`[...iterable]\`:** spreading an infinite generator into an array would never finish — you must pull values one at a time and stop yourself once you have enough.

Try it in the playground below against an infinite generator — confirm it returns instantly instead of hanging.`,
    difficulty: "hard",
    starterCode: `function take(iterable, count) {
  // return an array of the first \`count\` values from iterable —
  // must work on infinite generators without hanging
}`,
    solutionCode: `function take(iterable, count) {
  const result = [];
  for (const value of iterable) {
    if (result.length >= count) break;
    result.push(value);
  }
  return result;
}`,
    testCases: [
      {
        input: "take(naturalNumbers(), 5) against an infinite generator",
        expected: "[1, 2, 3, 4, 5]",
        label: "Takes exactly `count` values from an infinite sequence without hanging",
      },
      {
        input: "take([10, 20], 5) against a finite iterable shorter than count",
        expected: "[10, 20]",
        label: "Returns fewer than count if the iterable runs out first",
      },
      {
        input: "take(naturalNumbers(), 0)",
        expected: "[]",
        label: "count of 0 returns an empty array immediately",
      },
    ],
    hints: [
      "for...of works on any iterable, generators included — and break stops pulling further values immediately.",
      "Never spread an infinite iterable directly ([...iterable]) — that will hang forever trying to exhaust it.",
      "Check result.length against count inside the loop, before pushing the next value, then break as soon as you have enough.",
    ],
    isPremium: true,
    orderIndex: 14,
  },

  {
    slug: "find-leaked-listeners",
    companies: ["Adobe"],
    conceptSlug: "memory-management-leaks",
    title: "Detect leaked event listeners",
    description: `Not every memory leak needs a heap snapshot to catch — the most common one (a forgotten \`removeEventListener\`) is really just a bookkeeping problem, and bookkeeping problems are exactly what code can check for you automatically.

## The problem

Every \`addEventListener\` call needs a matching \`removeEventListener\` once the listener is no longer needed — miss one, and that listener (and everything its closure references) stays reachable forever. In a codebase with hundreds of \`addEventListener\` calls, spotting the one missing its cleanup by reading code alone is exactly the kind of thing that's easy to miss and expensive to debug later.

## The idea

Treat every add/remove call as an event in a log, in the order it happened. An id is "leaked" if, by the end of the log, it's been added more times than it's been removed — the same id can legitimately be added and removed multiple times (a component that mounts and unmounts repeatedly), so a leak is about the final imbalance, not just "was remove ever called at all."

## Your task

Write \`findLeakedListeners(events)\` — given an array of \`{ type: 'add' | 'remove', id }\` in chronological order, return the \`id\`s that are still leaked (added more times than removed), in the order each was first added:

\`\`\`js
findLeakedListeners([
  { type: "add", id: "resize" },
  { type: "add", id: "scroll" },
  { type: "remove", id: "resize" },
]);
// ["scroll"] — resize was cleanly removed, scroll never was
\`\`\`

- an id added and removed the same number of times is **not** leaked
- an id added more times than it's been removed **is** leaked, even if it's been removed at least once
- ids appear in the result in the order they were first added, not the order they leaked

> **Why count instead of just checking "was remove ever called":** a component that mounts twice without unmounting in between calls \`addEventListener\` twice — if it only ever calls \`removeEventListener\` once, one listener is still leaked, even though \`remove\` technically ran. Counting is what catches that; a boolean "was it ever removed" check would miss it entirely.

Once this passes, imagine wiring it up to a real app's dev-mode logger that records every add/remove call and warns about any id still leaked when the page unloads.`,
    difficulty: "medium",
    starterCode: `function findLeakedListeners(events) {
  // return the ids with more "add" events than "remove" events,
  // in the order each id was first added
}`,
    solutionCode: `function findLeakedListeners(events) {
  const counts = new Map();
  const order = [];
  for (const { type, id } of events) {
    if (!counts.has(id)) {
      counts.set(id, 0);
      order.push(id);
    }
    counts.set(id, counts.get(id) + (type === "add" ? 1 : -1));
  }
  return order.filter((id) => counts.get(id) > 0);
}`,
    testCases: [
      {
        input: "'resize' added then removed, 'scroll' added but never removed",
        expected: "['scroll']",
        label: "An id removed the same number of times it was added is not leaked",
      },
      {
        input: "an id added twice and removed twice",
        expected: "not included in the result",
        label: "Balanced add/remove counts are never leaked, no matter how many times",
      },
      {
        input: "an id added twice but removed only once",
        expected: "included in the result",
        label: "A net imbalance is leaked, even if remove was called at least once",
      },
      {
        input: "an empty events array",
        expected: "[]",
        label: "No events means nothing is leaked",
      },
    ],
    hints: [
      "Track a running count per id — increment on 'add', decrement on 'remove' — rather than just a boolean 'was it removed'.",
      "Record each id's first-seen order separately from its count, so the result can be sorted by that even after counts change.",
      "An id is leaked if its final count is greater than 0 — zero (or negative) means it's been fully, or over-, cleaned up.",
    ],
    isPremium: true,
    orderIndex: 15,
  },


  // ── Phase 10 (Feature 42) — Browser Internals ─────────────────────────────
  {
    slug: "classify-dom-vs-bom",
    conceptSlug: "dom-vs-bom",
    title: "Classify DOM vs. BOM References",
    description: `Build the classifier behind a "what am I actually touching" linter rule — given a JavaScript API reference as a string, decide whether it's DOM or BOM.

## The problem

\`document\` and \`window\` get used interchangeably in casual code (\`window.document.title\` vs. \`document.title\`), which hides a real distinction: one reference touches page *content*, the other touches the *browser environment* around it. A linter or debug tool that wants to flag "you're reaching into browser state here, not page content" needs a reliable way to tell the two apart from the reference string alone.

## The idea

- Anything reached through \`document\` — with or without a leading \`window.\` — is the **DOM**.
- Anything reached through \`window\`'s other properties — \`location\`, \`navigator\`, \`history\`, \`screen\` — with or without the \`window.\` prefix, is the **BOM**.

## Your task

Write \`classifyApi(reference)\` that returns \`'dom'\` or \`'bom'\` for a reference like \`"document.querySelector"\` or \`"window.location"\`.`,
    difficulty: "easy",
    starterCode: `function classifyApi(reference) {
  // strip a leading "window." if present, then classify the root object
}`,
    solutionCode: `function classifyApi(reference) {
  const stripped = reference.startsWith("window.") ? reference.slice("window.".length) : reference;
  const root = stripped.split(".")[0];
  return root === "document" ? "dom" : "bom";
}`,
    testCases: [
      { input: `"document.querySelector"`, expected: `"dom"`, label: "A direct document reference is DOM" },
      { input: `"window.document.body"`, expected: `"dom"`, label: "window.document is still DOM, not BOM" },
      { input: `"window.location"`, expected: `"bom"`, label: "window.location is BOM" },
      { input: `"navigator.userAgent"`, expected: `"bom"`, label: "A direct navigator reference is BOM" },
      { input: `"history.pushState"`, expected: `"bom"`, label: "A direct history reference is BOM" },
    ],
    hints: [
      "Strip a leading \"window.\" first, since document/location/navigator/history are equally valid with or without it.",
      "Only the root object before the first \".\" matters for classification.",
    ],
    isPremium: false,
    orderIndex: 16,
  },

  {
    slug: "event-propagation-order",
    conceptSlug: "event-delegation-bubbling-capturing",
    title: "Compute Event Propagation Order",
    description: `Build the logic behind a browser DevTools-style "event listener trace" — given a DOM path and a set of registered listeners, compute the exact order they actually fire in.

## The problem

"Why did my outside-click handler run before the button's own onClick?" is a question every frontend engineer eventually has to debug by hand — and the answer always comes down to which phase each listener was registered for, not just where it sits in the tree.

## The idea

An event travels in three phases:

1. **Capture** — root to target's parent, only nodes with a \`"capture"\` listener fire, in root-to-parent order
2. **Target** — the target's own listener fires, if it has one
3. **Bubble** — target's parent back to root, only nodes with a \`"bubble"\` listener fire, in parent-to-root order

## Your task

Write \`getEventOrder(path, listeners)\` — \`path\` is an array of ids from root to target (target last); \`listeners\` is an object mapping id → \`"capture"\` or \`"bubble"\`. Return the array of ids in the order their listener actually fires.`,
    difficulty: "easy",
    starterCode: `function getEventOrder(path, listeners) {
  // path: [root, ..., target]. listeners: { [id]: "capture" | "bubble" }
}`,
    solutionCode: `function getEventOrder(path, listeners) {
  const target = path[path.length - 1];
  const ancestors = path.slice(0, -1);
  const order = [];

  for (const id of ancestors) {
    if (listeners[id] === "capture") order.push(id);
  }
  if (listeners[target]) order.push(target);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (listeners[ancestors[i]] === "bubble") order.push(ancestors[i]);
  }
  return order;
}`,
    testCases: [
      {
        input: `["document","list","item"], { document: "bubble", list: "bubble", item: "bubble" }`,
        expected: `["item","list","document"]`,
        label: "All-bubble listeners fire target-first, then bottom-up",
      },
      {
        input: `["document","list","item"], { document: "capture", item: "bubble" }`,
        expected: `["document","item"]`,
        label: "A capture listener on an ancestor fires before the target",
      },
      {
        input: `["document","section","list","item"], { section: "bubble", list: "bubble", item: "bubble" }`,
        expected: `["item","list","section"]`,
        label: "Among bubble ancestors, the deepest fires before the shallower one",
      },
      {
        input: `["document","app","button"], { app: "capture", document: "bubble" }`,
        expected: `["app","document"]`,
        label: "A target with no listener of its own contributes nothing, but ancestors still fire correctly",
      },
    ],
    hints: [
      "Split the path into the target (last element) and its ancestors (everything before it).",
      "Capture-phase ancestors fire root-to-parent order; bubble-phase ancestors fire parent-to-root — the reverse.",
      "The target's own listener always fires between the capture and bubble phases, regardless of which phase key it's stored under.",
    ],
    isPremium: false,
    orderIndex: 17,
  },

  {
    slug: "pick-storage-mechanism",
    conceptSlug: "storage-apis",
    title: "Build a Storage Mechanism Chooser",
    description: `Build the decision logic behind a "which storage API should I use" helper — the kind of function a team lints for instead of relying on every developer remembering the tradeoffs.

## The problem

Four different client-side storage mechanisms exist, and picking the wrong one is rarely a crash — it's a silent correctness or performance bug (a synchronous \`localStorage\` write janking the page, or a cookie leaking a large token onto every image request).

## The idea

Given a set of requirements, decide which mechanism actually fits, in priority order:

1. If the data must be sent with every request automatically → **cookie**
2. Else if it shouldn't outlive the current tab → **sessionStorage**
3. Else if it's small enough for simple key/value storage → **localStorage**
4. Otherwise (large or needs structured storage) → **indexedDB**

## Your task

Write \`pickStorage(requirements)\` — given \`{ persistAcrossSessions, capacityKB, sendWithEveryRequest }\`, return the mechanism name as a string.`,
    difficulty: "medium",
    starterCode: `function pickStorage(requirements) {
  // { persistAcrossSessions: boolean, capacityKB: number, sendWithEveryRequest: boolean }
}`,
    solutionCode: `function pickStorage(requirements) {
  const { persistAcrossSessions, capacityKB, sendWithEveryRequest } = requirements;
  if (sendWithEveryRequest) return "cookie";
  if (!persistAcrossSessions) return "sessionStorage";
  if (capacityKB > 5000) return "indexedDB";
  return "localStorage";
}`,
    testCases: [
      {
        input: `{ persistAcrossSessions: true, capacityKB: 1, sendWithEveryRequest: true }`,
        expected: `"cookie"`,
        label: "Anything the server needs on every request is a cookie, regardless of other fields",
      },
      {
        input: `{ persistAcrossSessions: false, capacityKB: 10, sendWithEveryRequest: false }`,
        expected: `"sessionStorage"`,
        label: "Data that shouldn't outlive the tab is sessionStorage",
      },
      {
        input: `{ persistAcrossSessions: true, capacityKB: 100, sendWithEveryRequest: false }`,
        expected: `"localStorage"`,
        label: "Small persistent data is localStorage",
      },
      {
        input: `{ persistAcrossSessions: true, capacityKB: 20000, sendWithEveryRequest: false }`,
        expected: `"indexedDB"`,
        label: "Large persistent data is indexedDB",
      },
    ],
    hints: [
      "Check sendWithEveryRequest first — it overrides every other consideration.",
      "5000KB (~5MB) is a reasonable cutoff for what localStorage should hold before indexedDB is the right call.",
    ],
    isPremium: true,
    orderIndex: 18,
  },

  {
    slug: "classify-style-change",
    conceptSlug: "browser-rendering-pipeline",
    title: "Classify a CSS Property's Pipeline Cost",
    description: `Build the classifier behind a "why is my animation janky" audit tool — given a CSS property name, determine which rendering pipeline stage changing it actually triggers.

## The problem

Not every CSS property costs the same to animate. Animating \`top\` and animating \`transform\` look similar in code but have wildly different performance profiles — one re-triggers layout on every frame, the other doesn't. Telling them apart programmatically is the first step to catching a janky animation before it ships.

## The idea

- **Layout** properties change geometry — \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`, \`font-size\`, \`display\`
- **Paint** properties change appearance without moving anything — \`color\`, \`background\`, \`box-shadow\`, \`visibility\`
- **Composite** properties are handled entirely by the GPU — \`transform\`, \`opacity\`

## Your task

Write \`classifyStyleChange(property)\` returning the cheapest accurate classification: \`'layout'\`, \`'paint'\`, or \`'composite'\`.`,
    difficulty: "medium",
    starterCode: `function classifyStyleChange(property) {
  // return 'layout' | 'paint' | 'composite'
}`,
    solutionCode: `function classifyStyleChange(property) {
  const LAYOUT = ["width", "height", "top", "left", "right", "bottom", "margin", "font-size", "display"];
  const COMPOSITE = ["transform", "opacity"];
  if (COMPOSITE.includes(property)) return "composite";
  if (LAYOUT.includes(property)) return "layout";
  return "paint";
}`,
    testCases: [
      { input: `"width"`, expected: `"layout"`, label: "width triggers layout" },
      { input: `"display"`, expected: `"layout"`, label: "display triggers layout" },
      { input: `"color"`, expected: `"paint"`, label: "color is paint-only" },
      { input: `"visibility"`, expected: `"paint"`, label: "visibility is paint-only, unlike display" },
      { input: `"transform"`, expected: `"composite"`, label: "transform is composite-only" },
      { input: `"opacity"`, expected: `"composite"`, label: "opacity is composite-only" },
    ],
    hints: [
      "Check the composite-only list first — transform and opacity are the cheapest, so they should never fall through to layout/paint.",
      "Anything not explicitly layout or composite is safely classified as paint.",
    ],
    isPremium: false,
    orderIndex: 19,
  },

  {
    slug: "evaluate-cors-request",
    conceptSlug: "cors-same-origin-policy",
    title: "Build a CORS Request Evaluator",
    description: `Build the logic a browser DevTools "why did my request fail CORS" panel would need — given a request and a server's CORS configuration, work out whether a preflight happens and whether the request ultimately succeeds.

## The problem

"CORS error" in the console rarely explains *why* — was it a missing header on the server's allow-list, a method that needed a preflight, or the origin itself never being allowed? Reproducing the browser's actual decision logic is the only way to answer that with certainty instead of guessing.

## The idea

- A request needs a **preflight** if its method isn't \`GET\`/\`HEAD\`/\`POST\`, or it carries any header outside the simple set (\`accept\`, \`accept-language\`, \`content-language\`, \`content-type\`).
- The request is **allowed** only if the origin matches the server's \`allowOrigin\` (or it's \`'*'\`) — and, when a preflight is required, only if the method and every header are also on the server's allow-lists.

## Your task

Write \`evaluateCorsRequest(request, serverConfig)\` returning \`{ preflightRequired, allowed }\`.`,
    difficulty: "medium",
    starterCode: `function evaluateCorsRequest(request, serverConfig) {
  // request: { method, headers: string[], origin }
  // serverConfig: { allowOrigin, allowMethods: string[], allowHeaders: string[] }
}`,
    solutionCode: `function evaluateCorsRequest(request, serverConfig) {
  const SIMPLE_METHODS = ["GET", "HEAD", "POST"];
  const SIMPLE_HEADERS = ["accept", "accept-language", "content-language", "content-type"];

  const preflightRequired =
    !SIMPLE_METHODS.includes(request.method) ||
    request.headers.some((h) => !SIMPLE_HEADERS.includes(h.toLowerCase()));

  const originAllowed = serverConfig.allowOrigin === "*" || serverConfig.allowOrigin === request.origin;
  if (!originAllowed) return { preflightRequired, allowed: false };

  if (preflightRequired) {
    const methodAllowed = serverConfig.allowMethods.includes(request.method);
    const headersAllowed = request.headers.every((h) =>
      serverConfig.allowHeaders.some((a) => a.toLowerCase() === h.toLowerCase()),
    );
    return { preflightRequired: true, allowed: methodAllowed && headersAllowed };
  }

  return { preflightRequired: false, allowed: true };
}`,
    testCases: [
      {
        input: `{method:"GET",headers:[],origin:"https://app.com"}, {allowOrigin:"*",allowMethods:[],allowHeaders:[]}`,
        expected: `{ preflightRequired: false, allowed: true }`,
        label: "A simple GET with a wildcard origin needs no preflight and is allowed",
      },
      {
        input: `{method:"PUT",headers:[],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["PUT"],allowHeaders:[]}`,
        expected: `{ preflightRequired: true, allowed: true }`,
        label: "A PUT request needs a preflight, and is allowed when the method is on the allow-list",
      },
      {
        input: `{method:"PUT",headers:[],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["GET"],allowHeaders:[]}`,
        expected: `{ preflightRequired: true, allowed: false }`,
        label: "Needing a preflight isn't enough — the method must actually be on the allow-list",
      },
      {
        input: `{method:"GET",headers:[],origin:"https://evil.com"}, {allowOrigin:"https://app.com",allowMethods:[],allowHeaders:[]}`,
        expected: `{ preflightRequired: false, allowed: false }`,
        label: "A mismatched origin is blocked even for a simple request",
      },
      {
        input: `{method:"GET",headers:["Authorization"],origin:"https://app.com"}, {allowOrigin:"https://app.com",allowMethods:["GET"],allowHeaders:["Authorization"]}`,
        expected: `{ preflightRequired: true, allowed: true }`,
        label: "A custom header forces a preflight even on a GET request",
      },
    ],
    hints: [
      "Check the origin match first — an origin mismatch blocks the request regardless of method or headers.",
      "The simple-method and simple-header sets are what determine whether a preflight is needed at all.",
      "Header comparisons should be case-insensitive, matching real HTTP header semantics.",
    ],
    isPremium: true,
    orderIndex: 20,
  },

  {
    slug: "sanitize-html-input",
    conceptSlug: "web-security-fundamentals",
    title: "Build an HTML Sanitizer",
    description: `Build the sanitizer that sits between untrusted user input and \`innerHTML\` — the last line of defense before a comment, bio, or markdown field becomes an XSS vector.

## The problem

Any feature that renders user-submitted content as HTML (rich-text comments, profile bios) is one \`innerHTML\` call away from executing whatever an attacker typed — a \`<script>\` tag, an \`onerror\` attribute, a \`javascript:\` link. Stripping just one of these isn't enough; all three are common, real injection vectors on their own.

## The idea

Strip the three most common XSS vectors from an HTML string, before it's ever rendered:

1. \`<script>...</script>\` blocks entirely
2. Any \`on*\` event handler attribute (\`onerror\`, \`onclick\`, ...)
3. \`javascript:\` URLs in \`href\`/\`src\` attributes — replace with \`"#"\`

## Your task

Write \`sanitizeHtml(input)\` returning the cleaned string, leaving already-safe markup untouched.

> **This is a teaching exercise, not a production sanitizer.** Regex can't reliably parse HTML — malformed tags, unusual nesting, and encoding tricks can all slip past a hand-rolled pattern like this one. A real app should sanitize untrusted HTML with a battle-tested library (e.g. DOMPurify), never a regex like the one you're about to write.`,
    difficulty: "hard",
    starterCode: `function sanitizeHtml(input) {
  // strip <script> blocks, on* attributes, and javascript: URLs
}`,
    solutionCode: `function sanitizeHtml(input) {
  let out = input.replace(/<script[\\s\\S]*?<\\/script>/gi, "");
  out = out.replace(/\\son\\w+="[^"]*"/gi, "");
  out = out.replace(/\\son\\w+='[^']*'/gi, "");
  out = out.replace(/(href|src)\\s*=\\s*"javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\\s*=\\s*'javascript:[^']*'/gi, "$1='#'");
  return out;
}`,
    testCases: [
      {
        input: `"<p>Hello</p><script>alert(1)</script>"`,
        expected: `"<p>Hello</p>"`,
        label: "Strips a <script> block entirely",
      },
      {
        input: `'<img src="x" onerror="alert(1)">'`,
        expected: `'<img src="x">'`,
        label: "Strips an on* event handler attribute",
      },
      {
        input: `'<a href="javascript:alert(1)">click</a>'`,
        expected: `'<a href="#">click</a>'`,
        label: "Neutralizes a javascript: URL",
      },
      {
        input: `"<p>Safe text</p>"`,
        expected: `"<p>Safe text</p>"`,
        label: "Leaves already-safe markup completely unchanged",
      },
    ],
    hints: [
      "A non-greedy [\\s\\S]*? inside the <script> regex is needed so it doesn't swallow everything between the first and last <script> tag on the page.",
      "Match the leading space before on* attributes so removing one doesn't leave a stray double space.",
      "Handle both single- and double-quoted attribute values — real markup uses both.",
    ],
    isPremium: true,
    orderIndex: 21,
  },

  {
    slug: "trace-connection-steps",
    conceptSlug: "the-network-stack",
    title: "Trace the Steps of a Network Connection",
    description: `Build the logic behind a "why is this request slow" waterfall explainer — given the state of a connection attempt, trace exactly which setup steps the browser performs before it can send the actual HTTP request.

## The problem

Two requests to the same domain can have wildly different latency for reasons that never show up in the request itself — one pays for a fresh DNS lookup and TLS handshake, the other reuses an already-open connection. Explaining *why* a request was slow means reconstructing which of these steps actually ran.

## The idea

1. \`"dns-lookup"\` — skipped if DNS is already cached
2. \`"tcp-handshake"\` — skipped if an existing connection is being reused (keep-alive)
3. \`"tls-handshake"\` — only for HTTPS, and only alongside a fresh TCP handshake
4. \`"http-request"\` — always happens last

## Your task

Write \`getConnectionSteps(options)\` — given \`{ isHttps, dnsCached, connectionReused }\`, return the ordered array of steps actually performed.`,
    difficulty: "hard",
    starterCode: `function getConnectionSteps(options) {
  // { isHttps: boolean, dnsCached: boolean, connectionReused: boolean }
}`,
    solutionCode: `function getConnectionSteps(options) {
  const steps = [];
  if (!options.dnsCached) steps.push("dns-lookup");
  if (!options.connectionReused) {
    steps.push("tcp-handshake");
    if (options.isHttps) steps.push("tls-handshake");
  }
  steps.push("http-request");
  return steps;
}`,
    testCases: [
      {
        input: `{ isHttps: true, dnsCached: false, connectionReused: false }`,
        expected: `["dns-lookup","tcp-handshake","tls-handshake","http-request"]`,
        label: "A brand-new HTTPS connection performs all four steps",
      },
      {
        input: `{ isHttps: false, dnsCached: true, connectionReused: false }`,
        expected: `["tcp-handshake","http-request"]`,
        label: "Cached DNS and plain HTTP skip both the lookup and the TLS handshake",
      },
      {
        input: `{ isHttps: true, dnsCached: true, connectionReused: true }`,
        expected: `["http-request"]`,
        label: "A fully reused keep-alive connection skips straight to the request",
      },
      {
        input: `{ isHttps: true, dnsCached: true, connectionReused: false }`,
        expected: `["tcp-handshake","tls-handshake","http-request"]`,
        label: "A fresh TCP connection over HTTPS still needs its own TLS handshake, even with DNS cached",
      },
    ],
    hints: [
      "Each step is independently skippable — don't assume DNS caching implies the connection is also reused.",
      "TLS only ever happens alongside a fresh TCP handshake — a reused connection never needs a new one.",
    ],
    isPremium: true,
    orderIndex: 22,
  },

  {
    slug: "stale-while-revalidate",
    conceptSlug: "service-workers-caching-strategies",
    title: "Implement Stale-While-Revalidate",
    description: `Build one of the three real caching strategies a service worker's \`fetch\` handler chooses between — the one that trades a little staleness for instant responses.

## The problem

Cache-first can go stale forever; network-first blocks every response on a round trip even when a perfectly good cached value already exists. Neither is right for content that changes occasionally but shouldn't make the user wait — a middle ground is needed that responds instantly *and* stays fresh over time.

## The idea

1. If the cache has a value, return it **immediately** — do not wait on the network.
2. Regardless of a cache hit or miss, kick off a network fetch that updates the cache once it resolves.
3. If the cache was empty, the function resolves with the network's value instead.
4. A background network failure must never reject the returned promise if a cached value was already returned.

## Your task

Write \`staleWhileRevalidate(key, cache, network)\` — \`cache\` exposes async \`get(key)\`/\`set(key, value)\`; \`network(key)\` is an async function returning a fresh value.`,
    difficulty: "hard",
    starterCode: `async function staleWhileRevalidate(key, cache, network) {
  // return the cached value immediately if present, but always refresh the cache in the background
}`,
    solutionCode: `async function staleWhileRevalidate(key, cache, network) {
  const cached = await cache.get(key);
  const refresh = network(key)
    .then((fresh) => {
      cache.set(key, fresh);
      return fresh;
    })
    .catch(() => {});

  if (cached !== undefined) {
    return cached;
  }
  return refresh;
}`,
    testCases: [
      {
        input: "cache already has a value for the key",
        expected: "the cached value, returned without waiting on the network",
        label: "Returns a cache hit immediately",
      },
      {
        input: "cache is empty for the key",
        expected: "the network's value",
        label: "Falls back to the network value on a cache miss",
      },
      {
        input: "a cache hit, checked again after the background refresh completes",
        expected: "the cache now holds the fresh network value",
        label: "Updates the cache with the fresh value in the background",
      },
      {
        input: "a cache hit whose background network call rejects",
        expected: "the original cached value, no unhandled rejection",
        label: "A background network failure doesn't affect an already-returned cache hit",
      },
    ],
    hints: [
      "Don't await the network call before checking the cache — the whole point is returning the cached value without waiting.",
      "Start the network refresh unconditionally, whether or not there was a cache hit.",
      "Catch a network rejection on the background refresh so it can't surface as an unhandled promise rejection.",
    ],
    isPremium: true,
    orderIndex: 23,
  },

  {
    slug: "clone-worker-message",
    conceptSlug: "web-workers-concurrency",
    title: "Simulate postMessage's Structured Clone",
    description: `Build the piece of the worker messaging contract that trips people up the first time they hit it: not everything can cross the boundary between a worker and the main thread.

## The problem

Web Workers can't share memory with the main thread — every value passed via \`postMessage\` is deep-cloned, not referenced. That's usually invisible until someone tries to pass a value containing a function (a callback, a class instance with methods) and gets a cryptic \`DataCloneError\` instead of the message they expected.

## The idea

- Primitives pass through unchanged.
- Arrays and plain objects are cloned **deeply** — nested structures must not share references with the original.
- A function anywhere in the value cannot be cloned and must throw, mirroring \`postMessage\`'s real \`DataCloneError\`.

## Your task

Write \`cloneMessage(value)\` implementing this behavior.`,
    difficulty: "hard",
    starterCode: `function cloneMessage(value) {
  // deep-clone value; throw if it contains a function anywhere
}`,
    solutionCode: `function cloneMessage(value) {
  if (typeof value === "function") {
    throw new Error("could not be cloned");
  }
  if (Array.isArray(value)) {
    return value.map(cloneMessage);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = cloneMessage(value[key]);
    }
    return out;
  }
  return value;
}`,
    testCases: [
      {
        input: `{ a: 1, b: [1, 2, 3] }`,
        expected: "a deep copy with no shared references to the original's nested array",
        label: "Deep-clones a nested array without sharing a reference",
      },
      { input: "42", expected: "42", label: "A primitive passes through unchanged" },
      {
        input: `{ fn: () => {} }`,
        expected: "throws",
        label: "A function anywhere in the value throws instead of cloning",
      },
      {
        input: `{ nested: { deep: [1, { x: 2 }] } }`,
        expected: "mutating the clone never affects the original",
        label: "Nested objects are cloned independently at every level",
      },
    ],
    hints: [
      "Recurse into both arrays and plain objects — a shallow copy (spread) at the top level still shares references one level down.",
      "Check for a function before checking for an object, since the recursion needs to throw the moment one is found anywhere in the structure.",
    ],
    isPremium: true,
    orderIndex: 24,
  },

  {
    slug: "build-create-element",
    companies: ["Meta"],
    conceptSlug: "jsx-virtual-dom",
    title: "Build a Mini createElement",
    description: `Build the function every JSX tag actually compiles down to — the one that turns a description like \`<button className="primary">Save</button>\` into a plain Virtual DOM object.

## The problem

JSX never runs in the browser as-is — a compiler rewrites every tag into a \`createElement(type, props, ...children)\` call before your code executes. Understanding what that call actually returns is the first step to understanding everything React does afterward (diffing, reconciliation) to that returned object.

## The idea

- \`type\` is the tag name (or component), stored as-is.
- \`props\` becomes the returned object's \`props\`, with \`children\` folded in: zero children omits nothing (an empty array), one child is stored directly (not wrapped in an array), more than one is stored as an array.

## Your task

Write \`createElement(type, props, ...children)\` returning \`{ type, props }\`, where \`props.children\` follows the folding rule above (merge in any \`props\` passed in, even if \`props\` is \`null\`).`,
    difficulty: "easy",
    starterCode: `function createElement(type, props, ...children) {
  // return { type, props } where props.children follows the folding rule
}`,
    solutionCode: `function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: children.length === 1 ? children[0] : children,
    },
  };
}`,
    testCases: [
      {
        input: `createElement("div", null)`,
        expected: `{ type: "div", props: { children: [] } }`,
        label: "No children folds to an empty array",
      },
      {
        input: `createElement("button", { className: "primary" }, "Save")`,
        expected: `{ type: "button", props: { className: "primary", children: "Save" } }`,
        label: "A single child is stored directly, not wrapped in an array",
      },
      {
        input: `createElement("ul", null, "a", "b")`,
        expected: `{ type: "ul", props: { children: ["a", "b"] } }`,
        label: "Multiple children are stored as an array",
      },
      {
        input: `createElement("div", null, createElement("span", null, "hi"))`,
        expected: `a div vnode whose single child is the span vnode object`,
        label: "Children can themselves be vnode objects, nested arbitrarily deep",
      },
    ],
    hints: [
      "Spread props first, then overwrite/add children last so it always ends up on the returned object even when props is null.",
      "The folding rule only cares about children.length — 0, 1, or more than 1 — not what the children actually are.",
    ],
    isPremium: false,
    orderIndex: 25,
  },

  {
    slug: "should-run-effect",
    companies: ["Airbnb"],
    conceptSlug: "usestate-useeffect-fundamentals",
    title: "Implement useEffect's Dependency Comparison",
    description: `Build the comparison React itself runs on every render to decide whether an effect fires again — the actual logic behind the dependency array.

## The problem

An effect doesn't re-run just because a component re-rendered — React compares the new dependency array to the previous one first, and only re-runs the effect if something in it actually changed.

## The idea

- No dependency array at all (\`undefined\`) means "always run."
- The very first render has no previous dependencies to compare against, so it always runs (mount).
- Otherwise, compare each entry pairwise with \`Object.is\` (not \`===\`) — this matters for values like \`NaN\`, which \`Object.is\` correctly treats as equal to itself.

## Your task

Write \`shouldRunEffect(prevDeps, nextDeps)\` returning \`true\` if the effect should run this render, \`false\` if it should be skipped.`,
    difficulty: "easy",
    starterCode: `function shouldRunEffect(prevDeps, nextDeps) {
  // prevDeps is null/undefined on the very first render (mount)
}`,
    solutionCode: `function shouldRunEffect(prevDeps, nextDeps) {
  if (nextDeps === undefined) return true;
  if (prevDeps === undefined || prevDeps === null) return true;
  if (prevDeps.length !== nextDeps.length) return true;
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) return true;
  }
  return false;
}`,
    testCases: [
      { input: "shouldRunEffect(null, [1])", expected: "true", label: "First render (mount) always runs" },
      { input: "shouldRunEffect([1], [1])", expected: "false", label: "Unchanged dependency skips the effect" },
      { input: "shouldRunEffect([1], [2])", expected: "true", label: "A changed dependency re-runs the effect" },
      {
        input: "shouldRunEffect([NaN], [NaN])",
        expected: "false",
        label: "Object.is treats NaN as equal to itself, unlike ===",
      },
      { input: "shouldRunEffect([1, 2], undefined)", expected: "true", label: "No dependency array always runs" },
    ],
    hints: [
      "Check the undefined/no-array case before anything else — it short-circuits the comparison entirely.",
      "Use Object.is, not ===, for each pairwise comparison — that's the detail that makes the NaN case behave correctly.",
    ],
    isPremium: false,
    orderIndex: 26,
  },

  {
    slug: "detect-controlled-switch",
    companies: ["Google"],
    conceptSlug: "controlled-vs-uncontrolled-forms",
    title: "Detect a Controlled/Uncontrolled Switch",
    description: `Build the check behind React's real "a component is changing from uncontrolled to controlled" warning — given an input's value across two renders, decide whether its controlled-ness just flipped.

## The problem

An input is uncontrolled when its \`value\` prop is \`undefined\`/\`null\`, and controlled once it's a real value. Flipping between the two mid-lifetime is a common source of the warning — usually caused by state initialized to \`undefined\` instead of an empty string.

## The idea

Controlled-ness is just: was \`value\` defined (not \`undefined\`/\`null\`) last render, and is it defined this render? A flip is when those two booleans disagree.

## Your task

Write \`isSwitchingControlled(prevValue, nextValue)\` returning \`true\` if the input's controlled/uncontrolled status changed between the two renders.`,
    difficulty: "easy",
    starterCode: `function isSwitchingControlled(prevValue, nextValue) {
  // true if defined-ness of prevValue vs nextValue differs
}`,
    solutionCode: `function isSwitchingControlled(prevValue, nextValue) {
  const wasControlled = prevValue !== undefined && prevValue !== null;
  const isControlled = nextValue !== undefined && nextValue !== null;
  return wasControlled !== isControlled;
}`,
    testCases: [
      {
        input: `isSwitchingControlled(undefined, "abc")`,
        expected: "true",
        label: "Uncontrolled to controlled is a switch",
      },
      { input: `isSwitchingControlled("abc", "")`, expected: "false", label: "Empty string is still controlled" },
      {
        input: `isSwitchingControlled("abc", undefined)`,
        expected: "true",
        label: "Controlled to uncontrolled is also a switch",
      },
      { input: "isSwitchingControlled(undefined, undefined)", expected: "false", label: "Uncontrolled the whole time is not a switch" },
      { input: `isSwitchingControlled(null, "x")`, expected: "true", label: "null counts as uncontrolled, same as undefined" },
    ],
    hints: [
      "Treat null the same as undefined — both mean 'uncontrolled,' not just undefined specifically.",
      "An empty string is still a real, defined value — it's controlled, not uncontrolled.",
    ],
    isPremium: false,
    orderIndex: 27,
  },

  {
    slug: "implement-merge-refs",
    companies: ["Microsoft"],
    conceptSlug: "useref-imperative-handles",
    title: "Implement mergeRefs",
    description: `Build a small utility that comes up constantly once a component needs to attach more than one ref to the same DOM node — a real gap in React's API, not a toy problem.

## The problem

A component sometimes needs to forward a ref from its parent \`and\` keep its own internal ref to the same node (e.g. a parent's \`ref\` prop plus the component's own \`useRef\` for internal focus management). React only lets a JSX element take one \`ref\` prop, so both refs need to be driven by a single callback.

## The idea

Refs come in two shapes: a function (\`(node) => {...}\`) or an object (\`{ current: null }\`). Setting either "form" of ref just means calling the function, or assigning \`.current\`, for every ref in the list — skipping any that are \`null\`/\`undefined\`.

## Your task

Write \`mergeRefs(...refs)\` returning a single callback ref that, when called with a node, updates every ref in \`refs\` to point at that node.`,
    difficulty: "medium",
    starterCode: `function mergeRefs(...refs) {
  // return a function(node) that updates every ref in refs
}`,
    solutionCode: `function mergeRefs(...refs) {
  return function (node) {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    });
  };
}`,
    testCases: [
      {
        input: "a function ref and an object ref merged, then called with a node",
        expected: "the function ref is invoked with the node, and the object ref's .current is set to the node",
        label: "Updates both a function ref and an object ref",
      },
      {
        input: "mergeRefs(null, objectRef) called with a node",
        expected: "objectRef.current is set to the node, the null entry is skipped without throwing",
        label: "Skips null/undefined refs safely",
      },
      {
        input: "the merged ref called again with null",
        expected: "every ref is updated to null",
        label: "Clears all refs when called with null (on unmount)",
      },
      {
        input: "three object refs merged and called once",
        expected: "all three .current values point at the same node",
        label: "Supports more than two refs",
      },
    ],
    hints: [
      "A ref is either a function or an object with a .current property — check typeof to tell them apart.",
      "Skip falsy refs (null/undefined) up front so the caller can pass an optional ref without extra guards.",
    ],
    isPremium: true,
    orderIndex: 28,
  },

  {
    slug: "implement-context-store",
    companies: ["Stripe"],
    conceptSlug: "context-api-prop-drilling",
    title: "Implement a Minimal Context Store",
    description: `Build the subscribe/notify mechanism that Context uses under the hood to propagate a value to every consumer without any component in between passing it along.

## The problem

Context's whole point is that a value published at the top of a subtree reaches any descendant that asks for it, without every intermediate component forwarding it as a prop. That only works because of a publish/subscribe mechanism — the same shape used by \`useSyncExternalStore\` and every external store library.

## The idea

A store needs three things: a way to read the current value, a way to update it (which must notify everyone currently listening), and a way to subscribe (which must return an unsubscribe function, so a consumer can stop listening when it unmounts).

## Your task

Write \`createStore(initialValue)\` returning \`{ getValue, setValue, subscribe }\`, where \`setValue(next)\` calls every currently-subscribed listener with the new value, and \`subscribe(listener)\` returns a function that removes that listener.`,
    difficulty: "medium",
    starterCode: `function createStore(initialValue) {
  // return { getValue, setValue, subscribe }
}`,
    solutionCode: `function createStore(initialValue) {
  let value = initialValue;
  let subscribers = [];
  return {
    getValue: () => value,
    setValue: (next) => {
      value = next;
      subscribers.forEach((listener) => listener(value));
    },
    subscribe: (listener) => {
      subscribers.push(listener);
      return () => {
        subscribers = subscribers.filter((s) => s !== listener);
      };
    },
  };
}`,
    testCases: [
      { input: `createStore("dark").getValue()`, expected: `"dark"`, label: "getValue returns the initial value" },
      {
        input: "subscribe a listener, then call setValue",
        expected: "the listener is called once with the new value",
        label: "setValue notifies subscribed listeners",
      },
      {
        input: "subscribe, unsubscribe, then setValue",
        expected: "the listener is not called",
        label: "The function returned by subscribe removes that listener",
      },
      {
        input: "two listeners subscribed, then setValue",
        expected: "both listeners are called with the new value",
        label: "Supports multiple simultaneous subscribers",
      },
    ],
    hints: [
      "subscribe must return a new function each time that removes only that specific listener, not all of them.",
      "setValue should update the stored value before notifying, so a listener calling getValue() inside its callback sees the new value.",
    ],
    isPremium: true,
    orderIndex: 29,
  },

  {
    slug: "implement-map-children",
    companies: ["LinkedIn"],
    conceptSlug: "component-composition-patterns",
    title: "Implement a Children-Mapping Utility",
    description: `Build the normalization logic behind \`React.Children.map\` — the utility that lets a component safely transform \`props.children\` no matter what shape it arrives in.

## The problem

\`props.children\` isn't always an array — it can be \`null\`, a single child, or an array containing \`null\`s from conditional rendering (\`{condition && <Item />}\`). Mapping over it safely means normalizing all of these into one consistent shape first.

## The idea

- \`null\`/\`undefined\` children means there's nothing to map — return an empty array.
- A single child (not an array) should be treated as a one-item list.
- An array's direct \`null\`/\`undefined\`/\`false\` entries (from conditional rendering) must be dropped before mapping, and the index passed to the mapping function must reflect position among only the *surviving* children, not the original array.

## Your task

Write \`mapChildren(children, mapFn)\` returning the normalized, filtered array with \`mapFn(child, index)\` applied to each entry.`,
    difficulty: "medium",
    starterCode: `function mapChildren(children, mapFn) {
  // normalize, filter out null/undefined/false, then map
}`,
    solutionCode: `function mapChildren(children, mapFn) {
  if (children === null || children === undefined) return [];
  const list = Array.isArray(children) ? children : [children];
  const kept = list.filter((child) => child !== null && child !== undefined && child !== false);
  return kept.map((child, index) => mapFn(child, index));
}`,
    testCases: [
      { input: "mapChildren(null, fn)", expected: "[]", label: "null children maps to an empty array" },
      {
        input: `mapChildren("only child", fn)`,
        expected: "an array with fn applied once, at index 0",
        label: "A single non-array child is treated as a one-item list",
      },
      {
        input: `mapChildren(["a", null, "b", false], fn)`,
        expected: "fn called with (\"a\", 0) and (\"b\", 1)",
        label: "Falsy conditional-rendering entries are dropped, and indices reflect only surviving children",
      },
      {
        input: `mapChildren(["a", "b", "c"], fn)`,
        expected: "fn called with (\"a\",0), (\"b\",1), (\"c\",2)",
        label: "A plain array of children maps in order",
      },
    ],
    hints: [
      "Filter before mapping, not after — the index argument must be based on the already-filtered list.",
      "false needs the same treatment as null/undefined — it's the value {condition && <X/>} produces when condition is falsy.",
    ],
    isPremium: true,
    orderIndex: 30,
  },

  {
    slug: "detect-conditional-hook-call",
    companies: ["Meta", "TikTok"],
    conceptSlug: "custom-hooks-composition",
    title: "Detect a Rules-of-Hooks Violation",
    description: `Build a simplified version of what eslint-plugin-react-hooks checks at runtime-equivalent logic — given the sequence of hooks called on each render, detect the render where that sequence first diverges from the baseline.

## The problem

React matches hook state to calls purely by the *order* they're called in during render, not by name. Calling a hook conditionally means some renders call a different number (or order) of hooks than others, silently shifting every hook state after the divergence into the wrong slot.

## The idea

The very first render establishes the baseline call sequence. Every later render must match that exact sequence — same hooks, same order, same count. The first render that doesn't match is where the violation happened.

## Your task

Write \`findHookOrderViolation(renders)\`, where \`renders\` is an array of arrays of hook names (one array per render, in call order). Return the index of the first render whose sequence differs from \`renders[0]\`, or \`-1\` if every render matches.`,
    difficulty: "medium",
    starterCode: `function findHookOrderViolation(renders) {
  // compare every render's hook sequence against renders[0]
}`,
    solutionCode: `function findHookOrderViolation(renders) {
  if (renders.length === 0) return -1;
  const baseline = renders[0];
  for (let i = 1; i < renders.length; i++) {
    const current = renders[i];
    if (current.length !== baseline.length) return i;
    for (let j = 0; j < baseline.length; j++) {
      if (current[j] !== baseline[j]) return i;
    }
  }
  return -1;
}`,
    testCases: [
      {
        input: `findHookOrderViolation([["useState","useEffect"], ["useState","useEffect"]])`,
        expected: "-1",
        label: "Matching sequences every render means no violation",
      },
      {
        input: `findHookOrderViolation([["useState","useEffect"], ["useState"]])`,
        expected: "1",
        label: "A render that skips a hook is flagged at its own index",
      },
      {
        input: `findHookOrderViolation([["useState"], ["useState"], ["useEffect","useState"]])`,
        expected: "2",
        label: "A render with hooks in a different order is a violation, even with the same count",
      },
      { input: "findHookOrderViolation([])", expected: "-1", label: "No renders at all means nothing to violate" },
    ],
    hints: [
      "Only the first render sets the baseline — every later render is compared against renders[0], not the previous render.",
      "Check the length first; a shorter or longer sequence is always a violation regardless of what matches.",
    ],
    isPremium: true,
    orderIndex: 31,
  },

  {
    slug: "find-error-boundary",
    companies: ["Amazon"],
    conceptSlug: "error-boundaries",
    title: "Find the Catching Error Boundary",
    description: `Build the lookup behind "which Error Boundary actually catches this crash" — given a component tree and where an error is thrown, find the nearest ancestor boundary.

## The problem

A component never catches its own thrown error — only an ancestor marked as an Error Boundary can. When boundaries are nested (a page-level boundary wrapping several widget-level boundaries), the *nearest* one above the failure is the one that actually renders a fallback, not the outermost one.

## The idea

Walk the path from the tree's root down to the throwing component, then scan that path upward (starting from its parent, since a node never catches its own error) for the first node flagged as a boundary.

## Your task

Write \`findErrorBoundary(tree, throwingId)\`, where each tree node is \`{ id, isBoundary, children: [] }\`. Return the \`id\` of the nearest ancestor boundary, or \`null\` if none exists.`,
    difficulty: "hard",
    starterCode: `function findErrorBoundary(tree, throwingId) {
  // find the path to throwingId, then scan upward (excluding throwingId itself)
}`,
    solutionCode: `function findErrorBoundary(tree, throwingId) {
  function findPath(node, targetId, path) {
    const nextPath = [...path, node];
    if (node.id === targetId) return nextPath;
    for (const child of node.children || []) {
      const result = findPath(child, targetId, nextPath);
      if (result) return result;
    }
    return null;
  }
  const path = findPath(tree, throwingId, []);
  if (!path) return null;
  for (let i = path.length - 2; i >= 0; i--) {
    if (path[i].isBoundary) return path[i].id;
  }
  return null;
}`,
    testCases: [
      {
        input: "a boundary at the root, error thrown deep in a non-boundary subtree",
        expected: "the root's id",
        label: "Finds a distant ancestor boundary when nothing closer exists",
      },
      {
        input: "nested boundaries at two levels, error thrown below both",
        expected: "the id of the nearer (deeper) boundary, not the outer one",
        label: "The nearest boundary wins over an outer one",
      },
      {
        input: "no node in the tree is a boundary",
        expected: "null",
        label: "Returns null when no ancestor boundary exists",
      },
      {
        input: "the throwing node itself is flagged isBoundary: true",
        expected: "its ancestor's id (or null), never its own id",
        label: "A node never catches its own thrown error",
      },
    ],
    hints: [
      "Build the full root-to-target path first, then walk it backwards — don't try to search top-down and bottom-up at the same time.",
      "Start the upward scan at index length - 2, one above the throwing node, so it can never return the throwing node's own id.",
    ],
    isPremium: true,
    orderIndex: 32,
  },

  {
    slug: "implement-shallow-equal",
    companies: ["Meta"],
    conceptSlug: "render-performance-memoization",
    title: "Implement shallowEqual",
    description: `Build the comparison \`React.memo\` runs by default on every prop object — the actual algorithm behind "did this component's props really change?"

## The problem

\`React.memo\` skips re-rendering a component when its new props are shallow-equal to the previous ones. Knowing exactly what "shallow-equal" checks (and doesn't check) explains both why memo works and why it silently fails to help once a prop is a freshly-created object or array every render.

## The idea

Two values are shallow-equal if they're the exact same reference (checked with \`Object.is\`, which handles \`NaN\` correctly), or if both are non-null objects with the same set of own keys, each holding \`Object.is\`-equal values one level deep — nested objects are compared by reference, not recursively.

## Your task

Write \`shallowEqual(objA, objB)\` implementing this comparison.`,
    difficulty: "hard",
    starterCode: `function shallowEqual(objA, objB) {
  // Object.is reference check, then one level of own-key comparison
}`,
    solutionCode: `function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}`,
    testCases: [
      { input: `shallowEqual({ a: 1 }, { a: 1 })`, expected: "true", label: "Same own keys and values are shallow-equal" },
      { input: `shallowEqual({ a: 1 }, { a: 2 })`, expected: "false", label: "A different value for the same key is not equal" },
      {
        input: `shallowEqual({ a: { x: 1 } }, { a: { x: 1 } })`,
        expected: "false",
        label: "Nested objects are compared by reference, not recursively — two different inner objects are unequal",
      },
      { input: "shallowEqual(sameObjectRef, sameObjectRef)", expected: "true", label: "The identical reference is always equal" },
      {
        input: `shallowEqual({ a: 1 }, { a: 1, b: 2 })`,
        expected: "false",
        label: "A different number of keys is never shallow-equal",
      },
    ],
    hints: [
      "Check Object.is(objA, objB) first — the identical-reference case should short-circuit before any key comparison.",
      "Comparing key counts up front catches an extra key on either side without needing a second full loop.",
    ],
    isPremium: true,
    orderIndex: 33,
  },

  {
    slug: "schedule-updates-by-priority",
    companies: ["Meta", "Netflix"],
    conceptSlug: "concurrent-react-suspense",
    title: "Schedule Updates by Priority",
    description: `Build the ordering logic behind Concurrent React's priority model — given a batch of pending updates, decide which run first.

## The problem

Not every state update is equally urgent. A keystroke needs to feel instant; a transition-wrapped update (like re-filtering a large results list) can wait. A scheduler needs to reorder a batch of updates so urgent ones always run before transition ones, without scrambling the relative order within each group.

## The idea

Split the updates into two groups by priority, preserving each group's original relative order, then concatenate urgent before transition — a stable partition, not a full re-sort.

## Your task

Write \`scheduleUpdates(updates)\`, where each update is \`{ id, priority: 'urgent' | 'transition' }\`. Return an array of \`id\`s with all urgent updates first, then all transition updates, each group keeping its original order.`,
    difficulty: "hard",
    starterCode: `function scheduleUpdates(updates) {
  // partition by priority, urgent first, preserving relative order within each group
}`,
    solutionCode: `function scheduleUpdates(updates) {
  const urgent = updates.filter((u) => u.priority === "urgent").map((u) => u.id);
  const transition = updates.filter((u) => u.priority === "transition").map((u) => u.id);
  return [...urgent, ...transition];
}`,
    testCases: [
      {
        input: `scheduleUpdates([{id:"a",priority:"transition"},{id:"b",priority:"urgent"},{id:"c",priority:"transition"},{id:"d",priority:"urgent"}])`,
        expected: `["b", "d", "a", "c"]`,
        label: "Urgent updates move first while relative order within each group is preserved",
      },
      {
        input: `scheduleUpdates([{id:"a",priority:"urgent"},{id:"b",priority:"urgent"}])`,
        expected: `["a", "b"]`,
        label: "All-urgent input is returned unchanged",
      },
      {
        input: `scheduleUpdates([{id:"a",priority:"transition"},{id:"b",priority:"transition"}])`,
        expected: `["a", "b"]`,
        label: "All-transition input is returned unchanged",
      },
      { input: "scheduleUpdates([])", expected: "[]", label: "An empty batch schedules to an empty array" },
    ],
    hints: [
      "Filter twice (once per priority) rather than trying to sort in place — a stable partition is simpler than a custom comparator.",
      "Array.prototype.filter preserves relative order on its own, so each group never needs a separate sort step.",
    ],
    isPremium: true,
    orderIndex: 34,
  },

  {
    slug: "find-shared-state-ancestor",
    companies: ["Airbnb"],
    conceptSlug: "state-management-tradeoffs",
    title: "Find Where Shared State Should Live",
    description: `Build the lookup behind "lift state up" — given a component tree and two components that need to share a value, find the lowest common ancestor state should move to.

## The problem

When two components need the same piece of state, it has to live in a component that's an ancestor of both — but picking one too far up the tree causes unrelated components to re-render unnecessarily. The *lowest* common ancestor is the smallest subtree that still covers both consumers.

## The idea

This is the classic lowest-common-ancestor tree problem: find the root-to-node path for each of the two components, then walk both paths together from the root until they diverge — the last node where they still agreed is the answer.

## Your task

Write \`findLowestCommonAncestor(tree, idA, idB)\`, where each tree node is \`{ id, children: [] }\`. Return the \`id\` of the lowest common ancestor of \`idA\` and \`idB\`.`,
    difficulty: "hard",
    starterCode: `function findLowestCommonAncestor(tree, idA, idB) {
  // find both root-to-node paths, then walk them together until they diverge
}`,
    solutionCode: `function findLowestCommonAncestor(tree, idA, idB) {
  function findPath(node, target, path) {
    const next = [...path, node.id];
    if (node.id === target) return next;
    for (const child of node.children || []) {
      const result = findPath(child, target, next);
      if (result) return result;
    }
    return null;
  }
  const pathA = findPath(tree, idA, []);
  const pathB = findPath(tree, idB, []);
  if (!pathA || !pathB) return null;
  let lca = null;
  for (let i = 0; i < Math.min(pathA.length, pathB.length); i++) {
    if (pathA[i] === pathB[i]) lca = pathA[i];
    else break;
  }
  return lca;
}`,
    testCases: [
      {
        input: "two sibling leaf components under the same parent",
        expected: "the shared parent's id",
        label: "Siblings' lowest common ancestor is their direct parent",
      },
      {
        input: "idA is a direct ancestor of idB",
        expected: "idA itself",
        label: "When one node is an ancestor of the other, it is its own answer",
      },
      {
        input: "two components in different, deeply nested branches of a larger tree",
        expected: "the branching node where the two paths diverge",
        label: "Finds the correct ancestor in a deeper, unbalanced tree",
      },
      { input: "idB does not exist anywhere in the tree", expected: "null", label: "Returns null if either id isn't found" },
    ],
    hints: [
      "Solve it as two separate root-to-node path searches first — don't try to find the answer in a single combined traversal.",
      "Walk both paths in lockstep from index 0; the last index where they still match is the LCA, not the first index where they differ.",
    ],
    isPremium: true,
    orderIndex: 35,
  },

  // ── Phase 10 (Feature 44) — CSS Concepts ──────────────────────────────────
  {
    slug: "rendered-box-width",
    companies: ["Google"],
    conceptSlug: "the-box-model",
    title: "Compute a rendered box's width",
    description: `**box-sizing** decides what \`width\` actually measures — and getting it wrong is why elements mysteriously grow past their declared size.

## The problem

A 200px-wide box with 20px padding and a 2px border renders at 244px under the CSS default (\`content-box\`) — but exactly 200px under \`border-box\`. Same declared width, two different rendered sizes, depending entirely on one property most developers set once in a reset and forget about.

## The idea

Under \`content-box\`, \`width\` describes the content only — padding and border are added on top. Under \`border-box\`, \`width\` already includes padding and border, so the rendered size never changes no matter how much padding is added.

## Your task

Write \`renderedWidth(box, boxSizing)\`, where \`box = { width, padding, border }\` (single-sided values, applied to both left and right):

\`\`\`js
renderedWidth({ width: 200, padding: 20, border: 2 }, "content-box") // 244
renderedWidth({ width: 200, padding: 20, border: 2 }, "border-box")  // 200
\`\`\`

> **One line, system-wide effect.** This is exactly why \`* { box-sizing: border-box; }\` is in almost every CSS reset — it makes every element's declared width the actual rendered width, regardless of how much padding or border gets added later.`,
    difficulty: "easy",
    starterCode: `function renderedWidth(box, boxSizing) {
  // box = { width, padding, border } — padding/border apply to both sides
}`,
    solutionCode: `function renderedWidth(box, boxSizing) {
  const { width, padding, border } = box;
  if (boxSizing === "border-box") return width;
  return width + padding * 2 + border * 2;
}`,
    testCases: [
      { input: "{ width: 200, padding: 20, border: 2 }, content-box", expected: "244", label: "content-box adds padding and border on top of width" },
      { input: "{ width: 200, padding: 20, border: 2 }, border-box", expected: "200", label: "border-box keeps the declared width regardless of padding/border" },
      { input: "{ width: 100, padding: 0, border: 0 }, content-box", expected: "100", label: "zero padding/border renders at the declared width either way" },
    ],
    hints: [
      "content-box: width is content-only, so padding and border get added on top of it.",
      "border-box: width already includes padding and border, so it never changes.",
      "Padding and border are applied to both sides of the box — double each before adding.",
    ],
    isPremium: false,
    orderIndex: 36,
  },

  {
    slug: "resolve-css-length",
    companies: ["Adobe"],
    conceptSlug: "units-sizing",
    title: "Resolve a CSS length to pixels",
    description: `Every relative CSS unit ultimately resolves to a pixel value — the only question is *what it's relative to*.

## The problem

\`rem\`, \`em\`, and \`vw\` all look similar on the page, but each resolves against a completely different reference: the root font-size, the parent's font-size, or the viewport width. Mixing them up is why a component that looks right standalone breaks the moment it's nested somewhere else.

## The idea

- \`rem\` → value × the root (\`<html>\`) font-size, always — no compounding, no matter how deeply nested.
- \`em\` → value × the parent element's font-size — compounds through nested elements.
- \`vw\`/\`vh\` → value% of the viewport's width/height.
- \`px\` → the value itself, unchanged.

## Your task

Write \`resolveLength(value, unit, context)\`, where \`context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }\`:

\`\`\`js
resolveLength(1.5, "rem", { rootFontSize: 16 })          // 24
resolveLength(2, "em", { parentFontSize: 20 })            // 40
resolveLength(50, "vw", { viewportWidth: 1000 })          // 500
resolveLength(10, "px", {})                                // 10
\`\`\`

> **Why \`rem\` wins for design systems:** because it's always relative to one flat reference (the root), rescaling an entire type/spacing scale is a single line — \`html { font-size: 112.5%; }\`. \`em\`'s compounding makes that same rescale unpredictable.`,
    difficulty: "easy",
    starterCode: `function resolveLength(value, unit, context) {
  // context = { rootFontSize, parentFontSize, viewportWidth, viewportHeight }
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
}`,
    testCases: [
      { input: "1.5, rem, { rootFontSize: 16 }", expected: "24", label: "rem resolves against the root font-size" },
      { input: "2, em, { parentFontSize: 20 }", expected: "40", label: "em resolves against the parent's font-size" },
      { input: "50, vw, { viewportWidth: 1000 }", expected: "500", label: "vw resolves against 1% of viewport width" },
      { input: "10, px, {}", expected: "10", label: "px passes through unchanged" },
    ],
    hints: [
      "rem always multiplies against rootFontSize, regardless of nesting depth.",
      "em multiplies against the parent's font-size, not the root's — that's the compounding difference.",
      "vw/vh are percentages of the viewport, so divide by 100 before multiplying.",
    ],
    isPremium: false,
    orderIndex: 37,
  },

  {
    slug: "resolve-cascade-winner",
    companies: ["Airbnb"],
    conceptSlug: "the-cascade-inheritance",
    title: "Resolve which declaration wins the cascade",
    description: `When multiple rules target the same element and property, the cascade picks exactly one winner — through a fixed, ordered set of tiebreaks.

## The problem

"Which rule wins?" isn't answered by specificity alone — \`!important\` overrides specificity entirely, and if specificity ties too, source order decides. Getting the order of these tiebreaks wrong is why \`!important\` fights so often escalate.

## The idea

Compare declarations in this order, stopping at the first difference:

1. **Importance** — an \`!important\` declaration always beats a normal one, regardless of specificity.
2. **Specificity** — among declarations of equal importance, the higher \`[id, class, element]\` score wins.
3. **Source order** — if specificity also ties, the later declaration wins.

## Your task

Write \`resolveCascade(declarations)\`, where each declaration is \`{ value, important, specificity: [id, class, element], order }\`. Return the winning \`value\`.

\`\`\`js
resolveCascade([
  { value: "blue", important: false, specificity: [0, 2, 0], order: 0 },
  { value: "red", important: true, specificity: [0, 0, 1], order: 1 },
])
// → "red" — !important wins even with lower specificity
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveCascade(declarations) {
  // each declaration: { value, important, specificity: [id, class, element], order }
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
}`,
    testCases: [
      {
        input: "[{color, spec:[0,2,0]}, {red, spec:[0,0,1], important:true}]",
        expected: "red",
        label: "!important wins even against higher specificity",
      },
      {
        input: "[{blue, spec:[0,1,0]}, {green, spec:[1,0,0]}]",
        expected: "green",
        label: "Without !important, higher specificity wins",
      },
      {
        input: "[{blue, spec:[0,1,0], order:0}, {green, spec:[0,1,0], order:1}]",
        expected: "green",
        label: "Equal specificity — the later declaration (source order) wins",
      },
    ],
    hints: [
      "Compare importance first — it overrides specificity entirely, not just adds to it.",
      "Only fall through to specificity comparison when importance ties.",
      "Only fall through to source order when specificity also ties exactly.",
    ],
    isPremium: false,
    orderIndex: 38,
  },

  {
    slug: "distribute-flex-space",
    companies: ["Microsoft"],
    conceptSlug: "flexbox-vs-grid",
    title: "Distribute space across flex items",
    description: `Flexbox's \`flex-grow\`/\`flex-shrink\`/\`flex-basis\` decide each item's final size — the same three numbers the browser itself computes on every layout pass.

## The problem

"Why did this item grow more than that one" almost always comes down to their relative \`flex-grow\` values, not their absolute size — a common source of confusion since the numbers look like fixed sizes but actually work as ratios.

## The idea

Each item starts at its \`flex-basis\`. If there's leftover space in the container, it's distributed proportionally to each item's \`flex-grow\` (relative to the total grow across all items). If items overflow the container instead, each item shrinks proportionally to \`flex-shrink × flex-basis\`.

## Your task

Write \`distributeFlexSpace(items, containerWidth)\`, where each item is \`{ basis, grow, shrink }\`. Return an array of final widths.

\`\`\`js
distributeFlexSpace([
  { basis: 100, grow: 1, shrink: 1 },
  { basis: 100, grow: 1, shrink: 1 },
], 300)
// → [150, 150] — 100 extra px split evenly (equal grow)
\`\`\``,
    difficulty: "medium",
    starterCode: `function distributeFlexSpace(items, containerWidth) {
  // items: [{ basis, grow, shrink }]
}`,
    solutionCode: `function distributeFlexSpace(items, containerWidth) {
  const totalBasis = items.reduce((sum, i) => sum + i.basis, 0);
  const extra = containerWidth - totalBasis;

  if (extra >= 0) {
    const totalGrow = items.reduce((sum, i) => sum + i.grow, 0);
    if (totalGrow === 0) return items.map((i) => i.basis);
    return items.map((i) => i.basis + (i.grow / totalGrow) * extra);
  }

  const totalShrinkFactor = items.reduce((sum, i) => sum + i.shrink * i.basis, 0);
  if (totalShrinkFactor === 0) return items.map((i) => i.basis);
  return items.map((i) => i.basis - (i.shrink * i.basis / totalShrinkFactor) * -extra);
}`,
    testCases: [
      { input: "[{100,1,1},{100,1,1}], 300", expected: "[150, 150]", label: "Equal grow splits extra space evenly" },
      { input: "[{100,1,1},{100,0,1}], 300", expected: "[200, 100]", label: "grow: 0 gets no extra space at all" },
      { input: "[{100,1,1},{100,1,1}], 150", expected: "[75, 75]", label: "Overflow shrinks items proportionally to basis × shrink" },
      { input: "[{100,1,1},{100,1,1}], 200", expected: "[100, 100]", label: "Container exactly matching total basis distributes nothing" },
    ],
    hints: [
      "Compute total basis first — the sign of containerWidth minus that decides growing vs. shrinking.",
      "Growing distributes extra space by each item's share of the total grow factor.",
      "Shrinking weights each item's shrink factor by its own basis, not just the raw shrink number.",
    ],
    isPremium: false,
    orderIndex: 39,
  },

  {
    slug: "resolve-stacking-order",
    companies: ["Adobe"],
    conceptSlug: "positioning-stacking-contexts",
    title: "Find the topmost element across nested stacking contexts",
    description: `\`z-index: 9999\` can still lose to a sibling's \`z-index: 2\` — if that 9999 is trapped inside its own ancestor's stacking context.

## The problem

z-index doesn't compare globally across the page. It only compares within the same stacking context — so a descendant's z-index, no matter how high, can never let it escape past whatever beats its own containing context.

## The idea

Think of each element's z-index path from the root down to itself as a tuple — much like CSS specificity's \`[id, class, element]\`. Compare two elements' paths level by level: the first level where they differ decides the winner, and a much higher number several levels deep can never make up for losing at an earlier, shared level.

## Your task

Write \`resolveTopmost(elements)\`, where each element is \`{ id, zIndex, parentId }\` (\`parentId: null\` means top-level). Return the \`id\` of the element that renders on top.

\`\`\`js
resolveTopmost([
  { id: "a", zIndex: 1, parentId: null },
  { id: "a-inner", zIndex: 9999, parentId: "a" },
  { id: "b", zIndex: 2, parentId: null },
])
// → "b" — a-inner's 9999 is trapped inside "a" (zIndex 1), which already loses to "b" (zIndex 2)
\`\`\``,
    difficulty: "hard",
    starterCode: `function resolveTopmost(elements) {
  // elements: [{ id, zIndex, parentId }]
}`,
    solutionCode: `function resolveTopmost(elements) {
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

  const withPaths = elements.map((el) => ({ id: el.id, path: pathOf(el.id), index: byId[el.id].index }));
  return withPaths.reduce((winner, el) => {
    const cmp = comparePaths(el.path, winner.path);
    if (cmp > 0) return el;
    if (cmp === 0 && el.index > winner.index) return el;
    return winner;
  }).id;
}`,
    testCases: [
      {
        input: "a(z:1) > a-inner(z:9999), sibling b(z:2)",
        expected: "b",
        label: "A high z-index trapped in a lower-context ancestor cannot beat a sibling context",
      },
      { input: "two top-level siblings, zIndex 1 and 5", expected: "the one with zIndex 5", label: "Among top-level siblings, the higher zIndex wins directly" },
      { input: "two top-level siblings, equal zIndex", expected: "the later one in the array", label: "Equal zIndex at the same level falls back to source order" },
      {
        input: "x(z:5) > x-inner(z:1), sibling y(z:3) > y-inner(z:100)",
        expected: "y-inner",
        label: "A descendant under the higher-ranked ancestor wins, even with a lower zIndex than the other branch's descendant",
      },
    ],
    hints: [
      "Build each element's full zIndex path from the root down to itself, like a specificity tuple.",
      "Compare paths level by level — the first level that differs decides the winner outright.",
      "Only fall back to array order (source order) when two paths are identical at every shared level.",
    ],
    isPremium: true,
    orderIndex: 40,
  },

  {
    slug: "resolve-container-query",
    companies: ["Shopify"],
    conceptSlug: "responsive-design-container-queries",
    title: "Resolve the matching container query",
    description: `A container query asks "how wide is *this component's own container*?" — not the viewport. Matching one is just finding the right breakpoint for a given width.

## The problem

Media queries only ever see the full viewport width, so a component styled with one breaks the moment it's reused somewhere narrower than the whole page. Container queries fix this by resolving against the component's actual container.

## The idea

Given a set of \`min-width\` breakpoints, the matching one is always the **largest breakpoint that's still ≤ the container's current width** — mirroring how \`min-width\` container/media queries stack in real CSS.

## Your task

Write \`resolveContainerValue(containerWidth, queries)\`, where each query is \`{ minWidth, value }\` (in any order). Return the \`value\` of the matching breakpoint.

\`\`\`js
const queries = [
  { minWidth: 0, value: "compact" },
  { minWidth: 400, value: "comfortable" },
  { minWidth: 700, value: "wide" },
];
resolveContainerValue(500, queries) // "comfortable"
resolveContainerValue(300, queries) // "compact"
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveContainerValue(containerWidth, queries) {
  // queries: [{ minWidth, value }], in any order
}`,
    solutionCode: `function resolveContainerValue(containerWidth, queries) {
  const sorted = [...queries].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const q of sorted) {
    if (q.minWidth <= containerWidth) match = q;
    else break;
  }
  return match.value;
}`,
    testCases: [
      { input: "500, [{0,compact},{400,comfortable},{700,wide}]", expected: "comfortable", label: "Matches the largest minWidth that's still ≤ the container width" },
      { input: "300, [{0,compact},{400,comfortable},{700,wide}]", expected: "compact", label: "Falls back to the smallest breakpoint below the container width" },
      { input: "1000, [{0,compact},{400,comfortable},{700,wide}]", expected: "wide", label: "Matches the largest breakpoint when the container is wide enough" },
      { input: "500, [{700,wide},{0,compact},{400,comfortable}]", expected: "comfortable", label: "Works regardless of the input queries' order" },
    ],
    hints: [
      "Sort by minWidth first — the input order isn't guaranteed to be ascending.",
      "The correct match is the largest minWidth that doesn't exceed the container width.",
      "Every query set should include a minWidth: 0 fallback, matching real CSS's mobile-first convention.",
    ],
    isPremium: true,
    orderIndex: 41,
  },

  {
    slug: "resolve-custom-property",
    companies: ["Airbnb"],
    conceptSlug: "custom-properties-theming",
    title: "Resolve a custom property through the cascade",
    description: `A custom property resolves by walking up from wherever \`var()\` is used — not from wherever \`--name\` was declared. That's what makes runtime theming possible.

## The problem

Unlike a Sass variable (a compile-time text substitution), a CSS custom property is resolved live, by checking the element itself, then its ancestors, until a matching declaration is found.

## The idea

Given an element and a property name, walk from that element up through its ancestor chain. The first ancestor (including the element itself) that declares the property wins — closer always beats farther, regardless of where in the file it was declared.

## Your task

Write \`resolveVar(elementId, propName, tree, declarations, fallback)\`, where \`tree\` is \`{ id, parentId }[]\` and \`declarations\` is \`{ [elementId]: { [propName]: value } }\`. Return the resolved value, or \`fallback\` if no ancestor declares it.

\`\`\`js
resolveVar("card", "--accent", tree, {
  root: { "--accent": "teal" },
  "theme-dark": { "--accent": "cyan" },
}, "black")
// → "cyan" if "theme-dark" is an ancestor of "card" closer than "root"
\`\`\``,
    difficulty: "medium",
    starterCode: `function resolveVar(elementId, propName, tree, declarations, fallback) {
  // tree: { id, parentId }[], declarations: { [elementId]: { [propName]: value } }
}`,
    solutionCode: `function resolveVar(elementId, propName, tree, declarations, fallback) {
  const byId = Object.fromEntries(tree.map((n) => [n.id, n]));
  let current = elementId;
  while (current != null) {
    const decl = declarations[current];
    if (decl && propName in decl) return decl[propName];
    current = byId[current]?.parentId ?? null;
  }
  return fallback;
}`,
    testCases: [
      {
        input: "card declares --accent itself",
        expected: "card's own value",
        label: "A declaration on the element itself wins immediately",
      },
      {
        input: "card has no declaration, its parent theme-dark does",
        expected: "theme-dark's value",
        label: "Falls back to the nearest ancestor that declares the property",
      },
      {
        input: "both theme-dark (closer) and root (farther) declare --accent",
        expected: "theme-dark's value",
        label: "The closer ancestor wins over a farther one, regardless of declaration order",
      },
      { input: "no element in the chain declares the property", expected: "the fallback value", label: "Returns the fallback when nothing in the chain declares it" },
    ],
    hints: [
      "Start the walk at the element itself — a declaration there wins before checking any ancestor.",
      "Walk strictly upward via parentId until you hit a declaration or run out of ancestors.",
      "Only return the fallback once the walk reaches the root with nothing found.",
    ],
    isPremium: true,
    orderIndex: 42,
  },

  {
    slug: "implement-has-matcher",
    companies: ["Google"],
    conceptSlug: "pseudo-classes-pseudo-elements-has",
    title: "Implement a simplified :has() matcher",
    description: `Every CSS combinator before \`:has()\` only reached downward or sideways. \`:has()\` is the first one that lets a selector match a parent based on its children.

## The problem

\`form:has(:invalid)\` selects the \`<form>\` itself, driven entirely by whether some descendant input is currently invalid — something no earlier selector could express, since they could never look "inward" to decide an outward match.

## The idea

Checking whether an element ":has" a matching descendant means recursively searching every node beneath it (not the element itself) for one that satisfies a given condition.

## Your task

Write \`hasDescendantMatching(node, predicate)\`, where \`node = { id, tag, children: [] }\`. Return \`true\` if **any descendant** (not the node itself) satisfies \`predicate(descendant)\`.

\`\`\`js
const form = {
  id: "f1", tag: "form",
  children: [{ id: "i1", tag: "input", valid: true }, { id: "i2", tag: "input", valid: false }],
};
hasDescendantMatching(form, (n) => n.valid === false) // true — i2 is invalid
\`\`\``,
    difficulty: "hard",
    starterCode: `function hasDescendantMatching(node, predicate) {
  // node: { id, tag, children: [] } — check descendants only, not node itself
}`,
    solutionCode: `function hasDescendantMatching(node, predicate) {
  for (const child of node.children || []) {
    if (predicate(child)) return true;
    if (hasDescendantMatching(child, predicate)) return true;
  }
  return false;
}`,
    testCases: [
      { input: "form with one invalid input among its children", expected: "true", label: "Matches when a direct child satisfies the predicate" },
      { input: "form with only valid inputs", expected: "false", label: "Returns false when no descendant matches" },
      { input: "invalid input nested three levels deep inside fieldsets", expected: "true", label: "Matches a deeply nested descendant, not just direct children" },
      { input: "the node itself satisfies the predicate, but it has no children", expected: "false", label: "The node itself is never checked — only its descendants" },
    ],
    hints: [
      "The element being checked itself must never satisfy its own :has() — only descendants count.",
      "Recurse into every child, not just the direct children — :has() looks arbitrarily deep.",
      "Short-circuit and return true as soon as any descendant matches — no need to keep searching.",
    ],
    isPremium: true,
    orderIndex: 43,
  },

  {
    slug: "classify-animation-cost",
    companies: ["Apple"],
    conceptSlug: "animation-performance",
    title: "Classify the cost of an animated property list",
    description: `Not every animated CSS property costs the same — and animating just one expensive property drags the whole frame down, even if every other property is cheap.

## The problem

\`transform\`/\`opacity\` skip Layout and Paint entirely (Composite-only), \`color\`/\`box-shadow\` skip Layout but still repaint, and \`width\`/\`top\`/\`margin\` force the full pipeline. Animating a mix of these only ever costs as much as the *most expensive* one in the list.

## The idea

Look up each property's tier, then return the worst (most expensive) tier found across the whole list — one Layout-triggering property makes the entire animation as expensive as if every property were Layout-triggering.

## Your task

Write \`classifyAnimationCost(properties)\`, returning \`"compositor"\`, \`"paint"\`, or \`"layout"\` — whichever is worst among the given properties.

\`\`\`js
classifyAnimationCost(["transform", "opacity"])  // "compositor"
classifyAnimationCost(["transform", "top"])       // "layout" — top drags the whole thing down
classifyAnimationCost(["color", "box-shadow"])    // "paint"
\`\`\``,
    difficulty: "hard",
    starterCode: `function classifyAnimationCost(properties) {
  // return the worst ("layout" > "paint" > "compositor") tier among the properties
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
}`,
    testCases: [
      { input: "['transform', 'opacity']", expected: "compositor", label: "Both properties are Composite-only — the cheapest possible tier" },
      { input: "['transform', 'top']", expected: "layout", label: "A single layout-triggering property drags the whole list down to 'layout'" },
      { input: "['color', 'box-shadow']", expected: "paint", label: "Paint-only properties skip Layout but still cost more than Composite-only" },
      { input: "['width']", expected: "layout", label: "A lone layout-triggering property is classified as 'layout'" },
    ],
    hints: [
      "Look up each property's own tier, then track the worst one seen so far across the whole list.",
      "Rank the tiers numerically (compositor < paint < layout) so 'worse' is just a bigger number.",
      "Default unknown properties to 'layout' — the safe, conservative assumption.",
    ],
    isPremium: true,
    orderIndex: 44,
  },

  // ── Phase 10 (Feature 45) — TypeScript Concepts ───────────────────────────
  // The sandbox only runs JS, not tsc — every Challenge here is a deterministic
  // JS function that simulates the TypeScript concept's logic at runtime,
  // matching the JS-simulation pattern Feature 44 established for CSS.
  {
    slug: "narrow-unknown-to-number",
    companies: ["Microsoft"],
    conceptSlug: "basic-types-inference",
    title: "Narrow unknown to a safe number",
    description: `\`unknown\` forces you to prove what a value actually is before you can use it — this is that proof, written as a function.

## The problem

A value from \`JSON.parse\`, a form field, or \`localStorage\` arrives with no guarantee it's actually a usable number — it might be a real number, a numeric string, \`NaN\`, or something else entirely.

## The idea

Narrow the \`unknown\` value step by step: a real, finite \`number\` passes straight through; a non-empty string that resolves to a finite number gets parsed; everything else — including \`NaN\` itself — is rejected.

## Your task

Write \`safeParseNumber(value)\`, returning a finite number or \`null\`:

\`\`\`js
safeParseNumber(42)              // 42
safeParseNumber("3.14")          // 3.14
safeParseNumber("not a number")  // null
safeParseNumber(NaN)             // null
\`\`\``,
    difficulty: "easy",
    starterCode: `function safeParseNumber(value) {
  // value is "unknown" — prove it's a usable number before returning it
}`,
    solutionCode: `function safeParseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}`,
    testCases: [
      { input: "42", expected: "42", label: "A finite number passes through unchanged" },
      { input: "\"3.14\"", expected: "3.14", label: "A numeric string is parsed to a number" },
      { input: "\"not a number\"", expected: "null", label: "A non-numeric string returns null instead of NaN" },
      { input: "NaN", expected: "null", label: "NaN itself is rejected, not returned as a valid number" },
    ],
    hints: [
      "typeof value === 'number' doesn't guarantee it's usable — NaN is typeof 'number' too.",
      "For strings, trim first and reject anything that resolves to Number.isFinite(...) === false.",
      "Every other input type (null, undefined, object, boolean) should fall through to null.",
    ],
    isPremium: false,
    orderIndex: 45,
  },

  {
    slug: "merge-declarations",
    companies: ["Stripe"],
    conceptSlug: "interfaces-vs-type-aliases",
    title: "Simulate declaration merging",
    description: `Two separate \`interface Config { ... }\` blocks with the same name silently combine into one — this models what that merge actually does to the resulting shape.

## The problem

\`interface\`'s declaration merging means the *same* key declared twice with the *same* type should just collapse into one, but the *same* key declared twice with *different* types is a real conflict that shouldn't be silently resolved by whichever declaration happened to run last.

## The idea

Fold a list of partial shapes into one result: a key seen for the first time is copied over; a key seen again with the exact same value stays a single value; a key seen again with a genuinely different value becomes an array of the distinct values — surfacing the conflict instead of one silently overwriting the other.

## Your task

Write \`mergeDeclarations(declarations)\`, where each declaration is a plain object:

\`\`\`js
mergeDeclarations([{ timeout: "number" }, { retries: "number" }])
// → { timeout: "number", retries: "number" }

mergeDeclarations([{ id: "string" }, { id: "number" }])
// → { id: ["string", "number"] } — a genuine conflict, both kept
\`\`\``,
    difficulty: "easy",
    starterCode: `function mergeDeclarations(declarations) {
  // declarations: array of plain objects to fold into one merged shape
}`,
    solutionCode: `function mergeDeclarations(declarations) {
  const result = {};
  for (const decl of declarations) {
    for (const [key, value] of Object.entries(decl)) {
      if (!(key in result)) {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        if (!result[key].includes(value)) result[key].push(value);
      } else if (result[key] !== value) {
        result[key] = [result[key], value];
      }
    }
  }
  return result;
}`,
    testCases: [
      { input: "[{ timeout: 'number' }, { retries: 'number' }]", expected: "{ timeout: 'number', retries: 'number' }", label: "Distinct keys across declarations simply combine" },
      { input: "[{ id: 'string' }, { id: 'string' }]", expected: "{ id: 'string' }", label: "The same key with the same value merges to a single value, not an array" },
      { input: "[{ id: 'string' }, { id: 'number' }]", expected: "{ id: ['string', 'number'] }", label: "The same key with a different value surfaces as a conflict array" },
      { input: "[{ a: 1 }, { b: 2 }, { a: 1 }]", expected: "{ a: 1, b: 2 }", label: "A key repeated later with the same value doesn't change the result" },
    ],
    hints: [
      "Walk the declarations in order, building up one result object as you go.",
      "A key seen for the first time just gets copied over untouched.",
      "Only turn a value into an array once you've confirmed a genuine conflict — not on every repeat.",
    ],
    isPremium: false,
    orderIndex: 46,
  },

  {
    slug: "create-typed-stack",
    companies: ["Microsoft"],
    conceptSlug: "generics",
    title: "Build a self-typing stack",
    description: `A generic collection doesn't know its element type until the first value goes in — after that, it holds every later value to the same type.

## The problem

An untyped stack will happily accept a number, then a string, then an object, with nothing stopping a later bug from mixing incompatible values into what was meant to be a single-type collection.

## The idea

The stack's type isn't fixed at creation — it's inferred from the *first* pushed item, exactly like a generic type parameter gets inferred from the first argument at a call site. Every push after that is checked against the locked-in type.

## Your task

Write \`createTypedStack()\`, returning \`{ push(item), pop(), toArray() }\`. The first \`push\` locks the stack's type; a later \`push\` of a different type should \`throw\`.

\`\`\`js
const s = createTypedStack();
s.push(1);
s.push(2);
s.toArray(); // [1, 2]
s.push("oops"); // throws
\`\`\``,
    difficulty: "medium",
    starterCode: `function createTypedStack() {
  // return { push(item), pop(), toArray() } — type locks in on the first push
}`,
    solutionCode: `function createTypedStack() {
  const items = [];
  let lockedType = null;

  function classify(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  return {
    push(item) {
      const type = classify(item);
      if (lockedType === null) {
        lockedType = type;
      } else if (type !== lockedType) {
        throw new Error(\`Expected \${lockedType}, got \${type}\`);
      }
      items.push(item);
    },
    pop() {
      return items.pop();
    },
    toArray() {
      return [...items];
    },
  };
}`,
    testCases: [
      { input: "push(1), push(2), push(3)", expected: "[1, 2, 3]", label: "Same-type pushes are all accepted, in order" },
      { input: "push('a') then push(1)", expected: "throws an Error", label: "A mismatched type after the first push throws" },
      { input: "push(1), pop(), toArray()", expected: "[]", label: "pop() removes the most recently pushed item" },
      { input: "toArray() on a stack with nothing pushed", expected: "[]", label: "A stack with no pushes starts out empty" },
    ],
    hints: [
      "The stack's type isn't fixed until the first push — that's what 'inferred once' means here.",
      "Compare every later push's classified type against the locked type, and throw on a mismatch.",
      "null and arrays both report typeof 'object' in JS — classify them separately so a stack of numbers still rejects an array.",
    ],
    isPremium: true,
    orderIndex: 47,
  },

  {
    slug: "pick-keys",
    companies: ["Amazon"],
    conceptSlug: "utility-types",
    title: "Implement Pick at runtime",
    description: `\`Pick<T, K>\` keeps only a chosen subset of an object's keys — this is that same idea, applied to an actual object instead of a type.

## The problem

A large object often needs a narrower view for a specific use — a list row that only needs 2 of an object's 10 fields shouldn't have to carry (or expose) the rest.

## The idea

Copy over only the requested keys, and skip any requested key the object doesn't actually have — a missing key shouldn't appear in the result as \`undefined\`.

## Your task

Write \`pick(obj, keys)\`:

\`\`\`js
pick({ id: 1, name: "Ada", email: "a@x.com" }, ["id", "name"])
// → { id: 1, name: "Ada" }
\`\`\``,
    difficulty: "easy",
    starterCode: `function pick(obj, keys) {
  // return a new object containing only the requested keys
}`,
    solutionCode: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}`,
    testCases: [
      { input: "{ id: 1, name: 'Ada', email: 'a@x.com' }, ['id', 'name']", expected: "{ id: 1, name: 'Ada' }", label: "Only the requested keys are kept, in the object they belong to" },
      { input: "{ id: 1, name: 'Ada' }, ['email']", expected: "{}", label: "A requested key the object doesn't have is skipped, not set to undefined" },
      { input: "{ id: 1, name: 'Ada' }, []", expected: "{}", label: "An empty key list returns an empty object" },
    ],
    hints: [
      "Build a fresh result object — don't mutate the input.",
      "Check hasOwnProperty before copying, so a missing key doesn't sneak in as undefined.",
    ],
    isPremium: true,
    orderIndex: 48,
  },

  {
    slug: "narrow-value-length",
    companies: ["Stripe"],
    conceptSlug: "type-narrowing",
    title: "Narrow a union to compute its length",
    description: `A chain of narrowing checks is how real code safely handles a value that could be several different shapes.

## The problem

A "length" concept applies to strings and arrays directly, to some objects (via a \`length\` property), and to nothing else — treating them all the same way crashes on at least one of them.

## The idea

Narrow the value step by step, exactly like TypeScript's control-flow analysis would: check \`typeof\` for a string, \`Array.isArray\` for an array, then an \`in\` check for an object with a \`length\` field, falling back to \`0\` for everything else.

## Your task

Write \`getLength(value)\`:

\`\`\`js
getLength("hello")            // 5
getLength([1, 2, 3])          // 3
getLength({ length: 10 })     // 10
getLength(42)                 // 0
\`\`\``,
    difficulty: "medium",
    starterCode: `function getLength(value) {
  // narrow value through string, array, { length }, then fall back to 0
}`,
    solutionCode: `function getLength(value) {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object" && "length" in value) return value.length;
  return 0;
}`,
    testCases: [
      { input: "'hello'", expected: "5", label: "A string narrows to its own .length" },
      { input: "[1, 2, 3]", expected: "3", label: "An array narrows to its own .length, checked before the plain-object case" },
      { input: "{ length: 10 }", expected: "10", label: "A plain object with a length field narrows via the in check" },
      { input: "42", expected: "0", label: "A value with no length concept at all falls back to 0" },
    ],
    hints: [
      "Check typeof for string first, then Array.isArray — order matters since arrays are also typeof 'object'.",
      "The in operator narrows an object by checking whether a specific property exists on it.",
      "Guard against null before the object branch — typeof null is 'object' too.",
    ],
    isPremium: true,
    orderIndex: 49,
  },

  {
    slug: "discriminated-union-reducer",
    companies: ["Amazon"],
    conceptSlug: "discriminated-unions",
    title: "Write a discriminated-union reducer",
    description: `A shared \`type\` field is what lets a single \`switch\` safely branch across several differently-shaped actions — the exact pattern behind every Redux-style reducer.

## The problem

Each action variant carries different data (\`"set"\` needs a \`value\`, \`"increment"\`/\`"decrement"\` need nothing extra) — reading a field that doesn't exist on the current variant should never happen.

## The idea

Switch on the shared \`type\` field. Each \`case\` only reads the fields that variant actually has — the discriminant is what makes each branch unambiguous.

## Your task

Write \`reducer(state, action)\`, where \`state\` is a number and \`action\` is one of \`{ type: "increment" }\`, \`{ type: "decrement" }\`, or \`{ type: "set", value }\`:

\`\`\`js
reducer(0, { type: "increment" })       // 1
reducer(5, { type: "decrement" })       // 4
reducer(5, { type: "set", value: 100 }) // 100
\`\`\``,
    difficulty: "hard",
    starterCode: `function reducer(state, action) {
  // switch on action.type: "increment", "decrement", "set"
}`,
    solutionCode: `function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "set":
      return action.value;
    default:
      throw new Error(\`Unhandled action type: \${action.type}\`);
  }
}`,
    testCases: [
      { input: "reducer(0, { type: 'increment' })", expected: "1", label: "increment adds one to the current state" },
      { input: "reducer(5, { type: 'decrement' })", expected: "4", label: "decrement subtracts one from the current state" },
      { input: "reducer(5, { type: 'set', value: 100 })", expected: "100", label: "set replaces the state entirely with action.value" },
      { input: "reducer(0, { type: 'nope' })", expected: "throws an Error", label: "An unrecognized action type throws instead of silently returning the old state" },
    ],
    hints: [
      "switch (action.type) is the whole pattern — each case only reads the fields that variant actually carries.",
      "Only the 'set' case needs action.value; increment/decrement ignore the rest of the action entirely.",
      "A default case that throws catches an unhandled variant instead of silently doing nothing.",
    ],
    isPremium: true,
    orderIndex: 50,
  },

  {
    slug: "map-values",
    companies: ["Microsoft"],
    conceptSlug: "conditional-mapped-types",
    title: "Implement a mapped-type-style value transformer",
    description: `A mapped type applies the same transformation to every property of a type — this is that same idea, applied to an actual object's values at runtime.

## The problem

Transforming every value in an object the same way (doubling every number, uppercasing every string) usually ends up hand-written per shape, one line per key.

## The idea

Iterate every key once, the same way \`{ [K in keyof T]: transform(T[K]) }\` iterates every key of a type — apply \`transform\` to each value and collect the results under the same keys.

## Your task

Write \`mapValues(obj, transform)\`:

\`\`\`js
mapValues({ a: 1, b: 2 }, (v) => v * 2)
// → { a: 2, b: 4 }
\`\`\``,
    difficulty: "hard",
    starterCode: `function mapValues(obj, transform) {
  // return a new object with every value passed through transform, same keys
}`,
    solutionCode: `function mapValues(obj, transform) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = transform(obj[key], key);
  }
  return result;
}`,
    testCases: [
      { input: "{ a: 1, b: 2 }, (v) => v * 2", expected: "{ a: 2, b: 4 }", label: "Every value is transformed, keys stay the same" },
      { input: "{ name: 'ada' }, (v) => v.toUpperCase()", expected: "{ name: 'ADA' }", label: "Works for any transform function, not just numbers" },
      { input: "{}, (v) => v * 2", expected: "{}", label: "An empty object maps to an empty object" },
    ],
    hints: [
      "Object.keys(obj) gives you every key to iterate, exactly once each.",
      "Build a fresh result object — don't mutate the input object's values in place.",
    ],
    isPremium: true,
    orderIndex: 51,
  },

  {
    slug: "match-event-name-pattern",
    companies: ["Stripe"],
    conceptSlug: "template-literal-branded-types",
    title: "Validate a template-literal string pattern",
    description: `A template literal type like \`\`on\${Capitalize<string>}\`\` describes every string matching a pattern, checked at compile time — this validates the same pattern at runtime.

## The problem

Not every string is a valid event-handler-style name — \`"click"\`, \`"onclick"\`, and \`"on2Fast"\` all fail the pattern that a real one like \`"onClick"\` satisfies.

## The idea

A valid name starts with the literal \`"on"\`, immediately followed by a capitalized word (uppercase first letter, then only letters) — anything else fails.

## Your task

Write \`isEventName(value)\`:

\`\`\`js
isEventName("onClick")   // true
isEventName("onSubmit")  // true
isEventName("click")     // false
isEventName("onclick")   // false — not capitalized after "on"
\`\`\``,
    difficulty: "hard",
    starterCode: `function isEventName(value) {
  // true only if value is "on" followed by a Capitalized word
}`,
    solutionCode: `function isEventName(value) {
  return typeof value === "string" && /^on[A-Z][a-zA-Z]*$/.test(value);
}`,
    testCases: [
      { input: "'onClick'", expected: "true", label: "\"on\" plus a capitalized word matches the pattern" },
      { input: "'onSubmit'", expected: "true", label: "Any capitalized word after \"on\" matches" },
      { input: "'click'", expected: "false", label: "Missing the \"on\" prefix entirely fails" },
      { input: "'onclick'", expected: "false", label: "\"on\" followed by a lowercase word fails — not Capitalized" },
    ],
    hints: [
      "A regular expression is the natural runtime equivalent of a compile-time string pattern.",
      "Anchor the pattern with ^ and $ so a longer string containing a valid substring doesn't false-positive.",
      "[A-Z][a-zA-Z]* means exactly one uppercase letter, then any number of letters of either case.",
    ],
    isPremium: true,
    orderIndex: 52,
  },

  {
    slug: "choose-semantic-tag",
    conceptSlug: "aria-roles-and-semantic-html",
    title: "Choose the correct semantic tag for a purpose",
    description: `The right HTML element already carries the correct accessibility role — this is the lookup that picks it.

## The problem

Given a plain-English description of what a page section or control is *for*, picking a \`div\` and bolting on a role is tempting — but a real semantic element already exists for almost every common purpose.

## The idea

Map each recognized purpose to its correct native tag. Anything not on the recognized list falls back to a plain \`"div"\` — a generic container is the honest answer when nothing more specific fits.

## Your task

Write \`chooseSemanticTag(purpose)\`:

\`\`\`js
chooseSemanticTag("primary navigation") // "nav"
chooseSemanticTag("performs an action on the current page") // "button"
chooseSemanticTag("navigates to another page/URL") // "a"
chooseSemanticTag("something totally unrelated") // "div"
\`\`\``,
    difficulty: "easy",
    starterCode: `function chooseSemanticTag(purpose) {
  // return the correct native tag name for this purpose, or "div" if none matches
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
}`,
    testCases: [
      { input: '"primary navigation"', expected: '"nav"', label: "A recognized navigation purpose maps to <nav>" },
      { input: '"performs an action on the current page"', expected: '"button"', label: "An action purpose maps to <button>, not <a>" },
      { input: '"navigates to another page/URL"', expected: '"a"', label: "A navigation purpose maps to <a>, not <button>" },
      { input: '"something totally unrelated"', expected: '"div"', label: "An unrecognized purpose falls back to a plain div" },
    ],
    hints: [
      "A plain lookup table is the whole solution — no need for pattern matching or fuzzy string comparison.",
      "The nullish coalescing operator (??) is a clean way to express \"fall back to div if the key isn't found\".",
      "Resist the urge to special-case 'unrelated' strings — any key missing from the table should hit the same fallback.",
    ],
    isPremium: false,
    orderIndex: 53,
  },

  {
    slug: "decide-alt-text",
    conceptSlug: "accessible-images-media",
    title: "Decide the correct alt text for an image",
    description: `Not every image needs the same kind of alt text — some need none at all, on purpose.

## The problem

An image is either meaningful (it needs real alt text) or purely decorative (it needs an empty alt so screen readers skip it) — treating every image the same way gets one of those two cases wrong.

## The idea

Decorative images always get an empty string, regardless of whatever description was supplied. Meaningful images need a real, non-empty description — and a meaningful image with no description at all is a genuine content bug, not something to silently paper over.

## Your task

Write \`getAltText(image)\`, where \`image\` is \`{ isDecorative, description }\`:

\`\`\`js
getAltText({ isDecorative: true, description: "swirl graphic" }) // ""
getAltText({ isDecorative: false, description: "Company logo" }) // "Company logo"
getAltText({ isDecorative: false }) // throws
\`\`\``,
    difficulty: "easy",
    starterCode: `function getAltText(image) {
  // "" if decorative, the trimmed description if meaningful, throw if meaningful with no description
}`,
    solutionCode: `function getAltText(image) {
  if (image.isDecorative) return "";
  if (!image.description || !image.description.trim()) {
    throw new Error("Meaningful images must have alt text");
  }
  return image.description.trim();
}`,
    testCases: [
      { input: '{ isDecorative: true, description: "swirl" }', expected: '""', label: "A decorative image always gets an empty alt, even if a description was supplied" },
      { input: '{ isDecorative: false, description: "Company logo" }', expected: '"Company logo"', label: "A meaningful image returns its real description" },
      { input: '{ isDecorative: false, description: "  Team photo  " }', expected: '"Team photo"', label: "The description is trimmed of surrounding whitespace" },
      { input: '{ isDecorative: false }', expected: "throws an Error", label: "A meaningful image with no description throws instead of returning something misleading" },
    ],
    hints: [
      "Check isDecorative first — it should short-circuit before the description is even looked at.",
      "An empty or whitespace-only description should be treated the same as a missing one.",
    ],
    isPremium: false,
    orderIndex: 54,
  },

  {
    slug: "contrast-ratio-checker",
    conceptSlug: "color-contrast-visual-accessibility",
    title: "Implement the WCAG contrast ratio formula",
    description: `The number behind every "does this pass AA?" question — computed the same way a browser DevTools contrast checker does.

## The problem

"Does this text color pass against this background?" isn't a matter of opinion — WCAG defines an exact formula, based on each color's relative luminance.

## The idea

Convert each hex color to its relative luminance (a 0–1 measure of how much light it reflects), then compare the lighter one to the darker one using WCAG's ratio formula: \`(lighter + 0.05) / (darker + 0.05)\`.

## Your task

Write \`getContrastRatio(hex1, hex2)\` (rounded to 2 decimals) and \`meetsWcagAA(hex1, hex2, isLargeText)\`:

\`\`\`js
getContrastRatio("#000000", "#FFFFFF") // 21
meetsWcagAA("#000000", "#FFFFFF", false) // true
\`\`\``,
    difficulty: "easy",
    starterCode: `function getContrastRatio(hex1, hex2) {
  // return the WCAG contrast ratio between the two colors, rounded to 2 decimals
}
function meetsWcagAA(hex1, hex2, isLargeText) {
  // true if getContrastRatio passes the AA threshold for the given text size
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
function meetsWcagAA(hex1, hex2, isLargeText) {
  const ratio = getContrastRatio(hex1, hex2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}`,
    testCases: [
      { input: '"#000000", "#FFFFFF"', expected: "21", label: "Black on white is the maximum possible ratio, 21:1" },
      { input: '"#FFFFFF", "#FFFFFF"', expected: "1", label: "Identical colors give the minimum possible ratio, 1:1" },
      { input: 'meetsWcagAA("#000000", "#FFFFFF", false)', expected: "true", label: "21:1 passes AA for normal text (needs 4.5:1)" },
      { input: 'meetsWcagAA("#FFFFFF", "#FFFFFF", false)', expected: "false", label: "1:1 fails AA for normal text" },
    ],
    hints: [
      "Relative luminance is computed per channel first, then combined with the weights 0.2126 (red), 0.7152 (green), 0.0722 (blue).",
      "Which color is 'lighter' isn't about which argument comes first — always divide the larger luminance by the smaller.",
      "Large text's AA threshold (3:1) is lower than normal text's (4.5:1), not higher.",
    ],
    isPremium: false,
    orderIndex: 55,
  },

  {
    slug: "compute-tab-order",
    conceptSlug: "keyboard-navigation-focus-management",
    title: "Compute the real browser tab order",
    description: `Tab order isn't just "top to bottom" once tabindex enters the picture — this reproduces the actual browser algorithm.

## The problem

A page's real Tab order depends on more than DOM position: elements with a positive tabindex jump the queue entirely, and elements with tabindex="-1" are skipped by Tab altogether even though they're still in the DOM.

## The idea

Split elements into two groups — positive tabindex (sorted by tabindex value, ties broken by DOM order) and everything else with tabindex 0 or unset (sorted by DOM order) — then positive-tabindex elements always come first. Elements with tabindex="-1" are excluded entirely.

## Your task

Write \`computeTabOrder(elements)\`, where each element is \`{ id, tabIndex, domOrder }\`, returning an array of ids in real Tab order:

\`\`\`js
computeTabOrder([
  { id: "a", domOrder: 0 },
  { id: "b", tabIndex: 2, domOrder: 1 },
  { id: "c", tabIndex: 1, domOrder: 2 },
  { id: "d", tabIndex: -1, domOrder: 3 },
])
// → ["c", "b", "a"]
\`\`\``,
    difficulty: "medium",
    starterCode: `function computeTabOrder(elements) {
  // positive tabIndex first (sorted by tabIndex, then domOrder), then tabIndex 0/unset (sorted by domOrder), -1 excluded
}`,
    solutionCode: `function computeTabOrder(elements) {
  const positive = elements.filter((el) => el.tabIndex > 0);
  const zero = elements.filter((el) => !el.tabIndex || el.tabIndex === 0);
  positive.sort((a, b) => a.tabIndex - b.tabIndex || a.domOrder - b.domOrder);
  zero.sort((a, b) => a.domOrder - b.domOrder);
  return [...positive, ...zero].map((el) => el.id);
}`,
    testCases: [
      {
        input: '[{id:"a",domOrder:0},{id:"b",tabIndex:2,domOrder:1},{id:"c",tabIndex:1,domOrder:2},{id:"d",tabIndex:-1,domOrder:3},{id:"e",domOrder:4}]',
        expected: '["c","b","a","e"]',
        label: "Positive tabIndex elements come first in ascending order; tabIndex -1 is excluded",
      },
      {
        input: '[{id:"x",domOrder:2},{id:"y",domOrder:0},{id:"z",domOrder:1}]',
        expected: '["y","z","x"]',
        label: "With no tabIndex set on anything, order falls back to plain DOM order",
      },
      {
        input: '[{id:"p",tabIndex:1,domOrder:5},{id:"q",tabIndex:1,domOrder:2}]',
        expected: '["q","p"]',
        label: "A tie in tabIndex is broken by DOM order",
      },
    ],
    hints: [
      "tabIndex 0 and 'no tabIndex at all' (undefined) both belong in the same group as each other, not the positive group.",
      "!el.tabIndex is true for both 0 and undefined in JavaScript, which is exactly the group you want — just make sure -1 isn't falsy too (it isn't).",
      "Positive-tabIndex elements are sorted among themselves by tabIndex value, then by domOrder as the tiebreaker.",
    ],
    isPremium: true,
    orderIndex: 56,
  },

  {
    slug: "link-field-error",
    conceptSlug: "accessible-forms",
    title: "Wire up a field's error ARIA attributes",
    description: `The attributes that connect a form field to its own error message — computed correctly for both the error and no-error case.

## The problem

A field showing an error visually (a red border) means nothing to a screen reader unless \`aria-invalid\` and \`aria-describedby\` are actually set to point at that specific error text.

## The idea

When a field has an error, it needs \`aria-invalid: true\` and an \`aria-describedby\` pointing at a predictable id (\`\${id}-error\`). When it doesn't, both should reflect the field being valid — no dangling reference to an error element that isn't there.

## Your task

Write \`buildFieldAria(field)\`, where \`field\` is \`{ id, hasError }\`:

\`\`\`js
buildFieldAria({ id: "email", hasError: true })
// → { "aria-invalid": true, "aria-describedby": "email-error" }
buildFieldAria({ id: "email", hasError: false })
// → { "aria-invalid": false, "aria-describedby": undefined }
\`\`\``,
    difficulty: "medium",
    starterCode: `function buildFieldAria(field) {
  // return the correct { "aria-invalid", "aria-describedby" } pair for this field's error state
}`,
    solutionCode: `function buildFieldAria(field) {
  if (field.hasError) {
    return { "aria-invalid": true, "aria-describedby": \`\${field.id}-error\` };
  }
  return { "aria-invalid": false, "aria-describedby": undefined };
}`,
    testCases: [
      { input: '{ id: "email", hasError: true }', expected: '{ "aria-invalid": true, "aria-describedby": "email-error" }', label: "An errored field points aria-describedby at its predictable error id" },
      { input: '{ id: "email", hasError: false }', expected: '{ "aria-invalid": false, "aria-describedby": undefined }', label: "A valid field has no dangling aria-describedby reference" },
    ],
    hints: [
      "The error element's id follows a predictable convention: the field's own id, plus \"-error\".",
      "A valid field's aria-describedby should be undefined, not an empty string or a reference to a nonexistent element.",
    ],
    isPremium: true,
    orderIndex: 57,
  },

  {
    slug: "live-region-announcer-queue",
    conceptSlug: "aria-live-regions",
    title: "Implement an assertive-interrupts-polite announcer queue",
    description: `The scheduling rule behind aria-live's two politeness levels — modeled as a queue, not the DOM.

## The problem

"assertive" and "polite" aren't just labels — assertive announcements are meant to interrupt, and polite ones are meant to wait their turn, but a naive single FIFO queue treats every message identically regardless of politeness.

## The idea

Keep two separate queues. Flushing always drains the assertive queue first — even messages that arrived after older polite ones still jump ahead — and only falls back to the polite queue once no assertive messages remain.

## Your task

Write \`createAnnouncer()\`, returning \`{ announce(message, politeness), flush() }\` — \`flush()\` removes and returns the next message to announce (or \`null\` if both queues are empty):

\`\`\`js
const a = createAnnouncer();
a.announce("Saved", "polite");
a.announce("Error: network failed", "assertive");
a.flush() // → { message: "Error: network failed", politeness: "assertive" }
a.flush() // → { message: "Saved", politeness: "polite" }
\`\`\``,
    difficulty: "hard",
    starterCode: `function createAnnouncer() {
  // return { announce(message, politeness), flush() } — assertive always flushes before polite
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
}`,
    testCases: [
      {
        input: 'announce("Saved","polite"); announce("Error: network failed","assertive"); flush()',
        expected: '{ message: "Error: network failed", politeness: "assertive" }',
        label: "An assertive message jumps ahead of an already-queued polite one",
      },
      {
        input: "flush() again after the assertive message above",
        expected: '{ message: "Saved", politeness: "polite" }',
        label: "The polite message is still delivered once the assertive queue is empty",
      },
      {
        input: "flush() with both queues empty",
        expected: "null",
        label: "Flushing an empty announcer returns null instead of throwing",
      },
      {
        input: 'a second assertive message announced after a flush',
        expected: "it still interrupts",
        label: "Assertive priority applies every time flush is called, not just once",
      },
    ],
    hints: [
      "Two separate arrays, not one — politeness determines which queue a message goes into, not its position in a single queue.",
      "flush() should always check the assertive queue's length before even looking at the polite queue.",
      "Array.prototype.shift() both removes and returns the first element — exactly the FIFO behavior each queue needs.",
    ],
    isPremium: true,
    orderIndex: 58,
  },

  {
    slug: "combobox-keyboard-handler",
    conceptSlug: "accessible-component-patterns",
    title: "Implement a combobox's keyboard state machine",
    description: `The state transitions behind arrow-key navigation in an accessible combobox — as a pure state machine, no DOM involved.

## The problem

A combobox's keyboard behavior depends on more than the key pressed — the same ArrowDown key opens a closed list at its first option, but advances (and wraps) the highlighted option in an already-open one.

## The idea

Model the combobox as \`{ options, activeIndex, isOpen }\`. Handle each key as a pure transition: an unopened list responds only to the arrow that opens it; an open list responds to Home/End/Escape/Enter plus wrapping arrow-key movement.

## Your task

Write \`handleComboboxKey(state, key)\`, returning the new state:

\`\`\`js
handleComboboxKey({ options: ["Apple","Banana"], activeIndex: -1, isOpen: false }, "ArrowDown")
// → { options: ["Apple","Banana"], activeIndex: 0, isOpen: true }
\`\`\``,
    difficulty: "hard",
    starterCode: `function handleComboboxKey(state, key) {
  // pure state transition for ArrowDown/ArrowUp/Home/End/Escape/Enter, closed vs. open
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
}`,
    testCases: [
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:-1,isOpen:false}, "ArrowDown"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:0,isOpen:true}',
        label: "ArrowDown on a closed list opens it at the first option",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:2,isOpen:true}, "ArrowDown"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:0,isOpen:true}',
        label: "ArrowDown at the last option wraps back to the first",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:true}, "Escape"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:-1,isOpen:false}',
        label: "Escape closes the list and clears the active option entirely",
      },
      {
        input: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:true}, "Enter"',
        expected: '{options:["Apple","Banana","Cherry"],activeIndex:1,isOpen:false}',
        label: "Enter closes the list but keeps the selected option's index",
      },
    ],
    hints: [
      "Check isOpen first — a closed list only cares about the two arrow keys, everything else is a no-op.",
      "Wrapping math: (activeIndex + 1) % options.length handles the forward wrap; add options.length before the modulo for the backward wrap to avoid a negative result.",
      "Escape and Enter both close the list, but only Escape resets activeIndex to -1 — Enter is a selection, not a cancellation.",
    ],
    isPremium: true,
    orderIndex: 59,
  },

  {
    slug: "mini-a11y-linter",
    conceptSlug: "automated-a11y-testing",
    title: "Write a mini automated a11y rule checker",
    description: `A tiny version of what axe-core actually does — check a node against a fixed rule set and report what fails.

## The problem

Automated a11y tools work by mechanically checking a fixed set of rules against markup — this is two of the simplest, most common ones: images need alt text (unless decorative), and inputs need an accessible name.

## The idea

Given a simplified node \`{ tag, attrs }\`, apply only the rules relevant to that tag: an \`img\` needs \`alt\` unless it's marked decorative (\`role="presentation"\` or \`aria-hidden: true\`); an \`input\` needs an \`aria-label\` or \`aria-labelledby\`. Any other tag has no violations from this rule set.

## Your task

Write \`lintNode(node)\`, returning an array of violation message strings (empty if none):

\`\`\`js
lintNode({ tag: "img", attrs: {} }) // ["img missing alt text"]
lintNode({ tag: "img", attrs: { alt: "A dog" } }) // []
lintNode({ tag: "img", attrs: { role: "presentation" } }) // []
\`\`\``,
    difficulty: "hard",
    starterCode: `function lintNode(node) {
  // return an array of violation strings for this single node
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
}`,
    testCases: [
      { input: '{ tag: "img", attrs: {} }', expected: '["img missing alt text"]', label: "An img with no alt attribute at all is flagged" },
      { input: '{ tag: "img", attrs: { alt: "A dog" } }', expected: "[]", label: "An img with any alt attribute passes, even if empty" },
      { input: '{ tag: "img", attrs: { role: "presentation" } }', expected: "[]", label: "A decorative img needs no alt attribute at all" },
      { input: '{ tag: "input", attrs: {} }', expected: '["input missing an accessible name"]', label: "An input with no accessible name is flagged" },
      { input: '{ tag: "div", attrs: {} }', expected: "[]", label: "Tags with no applicable rule always pass" },
    ],
    hints: [
      "\"alt\" in attrs checks that the attribute exists at all — even alt=\"\" should count as present.",
      "A decorative image is exempt from the alt-text rule entirely, checked before the alt-presence check runs.",
      "Only img and input have rules in this mini rule set — every other tag should return an empty array unconditionally.",
    ],
    isPremium: true,
    orderIndex: 60,
  },

  {
    slug: "pick-image-format-and-size",
    conceptSlug: "image-asset-optimization",
    title: "Pick the right image format and srcset width",
    description: `The two independent levers behind every "optimize this image" task — which format to serve, and which pixel width to serve it at.

## The problem

"Just compress the image" hides two separate decisions: which modern format actually fits this image's needs, and which of the available pre-generated widths is the smallest one that still covers the container at the current pixel density.

## The idea

Format depends on what the image needs to support (animation, transparency) more than on taste. Width depends purely on arithmetic: the target pixel width is \`containerWidth * dpr\`, and the right candidate is the smallest available width that's still \`>=\` that target — falling back to the largest available width if none is big enough.

## Your task

Write \`pickImageFormat({ hasTransparency, isPhoto, needsAnimation })\` returning \`"avif"\` or \`"webp"\`, and \`pickSrcsetWidth(containerWidth, dpr, availableWidths)\`:

\`\`\`js
pickImageFormat({ hasTransparency: false, isPhoto: true, needsAnimation: false }) // "avif"
pickSrcsetWidth(400, 2, [320, 640, 960, 1280]) // 960
\`\`\``,
    difficulty: "easy",
    starterCode: `function pickImageFormat({ hasTransparency, isPhoto, needsAnimation }) {
  // "avif" for opaque, non-animated photos — "webp" otherwise
}
function pickSrcsetWidth(containerWidth, dpr, availableWidths) {
  // smallest available width >= containerWidth * dpr, or the largest if none fit
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
}`,
    testCases: [
      { input: '{ hasTransparency: false, isPhoto: true, needsAnimation: false }', expected: '"avif"', label: "An opaque photo picks AVIF for the best compression" },
      { input: '{ hasTransparency: true, isPhoto: false, needsAnimation: false }', expected: '"webp"', label: "A transparent graphic picks WebP" },
      { input: "pickSrcsetWidth(400, 2, [320, 640, 960, 1280])", expected: "960", label: "800px target (400 x 2 dpr) picks the smallest width that still covers it, 960" },
      { input: "pickSrcsetWidth(1000, 3, [320, 640, 960])", expected: "960", label: "When no candidate is big enough, fall back to the largest available" },
    ],
    hints: [
      "needsAnimation should override every other check — an animated image needs WebP regardless of transparency or photo content.",
      "The target pixel width is containerWidth multiplied by the device pixel ratio, not containerWidth alone.",
      "Sort the available widths first so 'smallest that still fits' and 'largest overall' are both simple array operations.",
    ],
    orderIndex: 61,
  },

  {
    slug: "split-shared-chunks",
    conceptSlug: "bundle-size-code-splitting",
    title: "Split a bundle into shared and per-route chunks",
    description: `The core signal a bundler starts from when deciding what goes in the shared chunk versus each route's own chunk.

## The problem

Given which modules each route imports, a naive bundle would duplicate every shared dependency (React, a UI library) into every single route's file. The fix is knowing exactly which modules qualify as "shared."

## The idea

A module used by exactly one route always stays in that route's own chunk. A module used by more than one route is at least a *candidate* for the shared chunk — real bundlers add size/request-count thresholds on top of this before actually splitting it out, but usage count is the starting signal this exercise models.

## Your task

Write \`splitChunks(routeModules)\`, where \`routeModules\` maps a route path to the array of module names it imports, returning \`{ shared, routes }\`:

\`\`\`js
splitChunks({
  "/home": ["react", "home-page", "utils"],
  "/about": ["react", "about-page", "utils"],
})
// → { shared: ["react", "utils"], routes: { "/home": ["home-page"], "/about": ["about-page"] } }
\`\`\``,
    difficulty: "medium",
    starterCode: `function splitChunks(routeModules) {
  // return { shared: [...], routes: { [route]: [...] } }
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
}`,
    testCases: [
      {
        input: '{ "/a": ["react","a1"], "/b": ["react","b1"], "/c": ["react","utils","c1"] }',
        expected: '{ shared: ["react"], routes: { "/a": ["a1"], "/b": ["b1"], "/c": ["utils","c1"] } }',
        label: "A module used by three routes is shared; one used by a single route is not",
      },
      {
        input: '{ "/home": ["react","home-page","utils"], "/about": ["react","about-page","utils"] }',
        expected: '{ shared: ["react","utils"], routes: { "/home": ["home-page"], "/about": ["about-page"] } }',
        label: "Two modules shared across two routes both end up in the shared chunk",
      },
    ],
    hints: [
      "Count how many routes import each module first, before deciding anything.",
      "A module qualifies as shared purely by usage count (> 1) — it has nothing to do with which route it appears in first.",
      "Each route's own chunk is just its original module list with the shared ones filtered out.",
    ],
    isPremium: true,
    orderIndex: 62,
  },

  {
    slug: "classify-resource-loading-strategy",
    conceptSlug: "resource-loading-render-blocking",
    title: "Classify a resource's loading strategy",
    description: `Beyond "does this block rendering" — which of the six real loading strategies does a given resource actually use?

## The problem

Scripts and stylesheets can block the parser, but resource hints (\`preload\`, \`prefetch\`, \`preconnect\`) don't block anything at all — they only change when the browser starts a network step. Lumping every non-blocking resource into one bucket hides that distinction.

## The idea

A \`<link>\`'s \`rel\` decides its strategy directly (\`stylesheet\` still blocks; \`preload\`/\`prefetch\`/\`preconnect\` are hints, not blockers). A \`<script>\`'s \`async\`/\`defer\` flags decide its strategy; with neither, it blocks by default.

## Your task

Write \`classifyResource(resource)\`, where \`resource\` is \`{ tag: "script" | "link", rel?, async?, defer? }\`, returning one of \`"render-blocking" | "async" | "defer" | "preload" | "prefetch" | "preconnect"\`. Then write \`totalParseBlockingTime(resources)\`, summing the \`duration\` of only the resources that classify as \`"render-blocking"\`:

\`\`\`js
classifyResource({ tag: "link", rel: "stylesheet" }) // "render-blocking"
classifyResource({ tag: "script", async: true }) // "async"
\`\`\``,
    difficulty: "medium",
    starterCode: `function classifyResource(resource) {
  // return one of: "render-blocking" | "async" | "defer" | "preload" | "prefetch" | "preconnect"
}
function totalParseBlockingTime(resources) {
  // sum the duration of only the render-blocking resources
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
function totalParseBlockingTime(resources) {
  return resources
    .filter((r) => classifyResource(r) === "render-blocking")
    .reduce((sum, r) => sum + (r.duration || 0), 0);
}`,
    testCases: [
      { input: '{ tag: "script" }', expected: '"render-blocking"', label: "A plain script with no async/defer blocks rendering" },
      { input: '{ tag: "script", defer: true }', expected: '"defer"', label: "A deferred script does not block rendering" },
      { input: '{ tag: "link", rel: "preconnect" }', expected: '"preconnect"', label: "A preconnect hint is its own strategy, not a blocker" },
      {
        input: '[{tag:"script",duration:100},{tag:"script",async:true,duration:50},{tag:"link",rel:"stylesheet",duration:30}]',
        expected: "130",
        label: "totalParseBlockingTime sums only the render-blocking resources' durations",
      },
    ],
    hints: [
      "A link's rel value that isn't 'stylesheet' is itself the strategy name — no extra mapping needed for preload/prefetch/preconnect.",
      "Check async before defer on a script — a script could theoretically carry both attributes, and async takes precedence in real browsers.",
      "totalParseBlockingTime should reuse classifyResource rather than re-implementing the blocking rule a second time.",
    ],
    isPremium: true,
    orderIndex: 63,
  },

  {
    slug: "rate-core-web-vitals",
    conceptSlug: "core-web-vitals",
    title: "Rate LCP, INP, and CLS against their real thresholds",
    description: `The exact published thresholds behind every "good/needs improvement/poor" badge in a real Core Web Vitals report.

## The problem

"Is this LCP good?" isn't a judgment call — Google publishes exact numeric thresholds per metric, and a page's overall rating is only as good as its worst individual metric.

## The idea

Each metric has its own good/poor cutoff (LCP and INP are lower-is-better durations; CLS is a lower-is-better unitless score). A value at or under the "good" cutoff is good; strictly over the "poor" cutoff is poor; anything between is "needs-improvement." The page's overall rating takes the worst rating among all three metrics.

## Your task

Write \`classifyMetric(metric, value)\` for \`"LCP"\` (ms, good ≤ 2500, poor > 4000), \`"INP"\` (ms, good ≤ 200, poor > 500), and \`"CLS"\` (good ≤ 0.1, poor > 0.25). Then write \`overallPageRating(metrics)\`, where \`metrics\` is \`{ LCP, INP, CLS }\`:

\`\`\`js
classifyMetric("LCP", 2000) // "good"
overallPageRating({ LCP: 4500, INP: 150, CLS: 0.05 }) // "poor"
\`\`\``,
    difficulty: "medium",
    starterCode: `function classifyMetric(metric, value) {
  // return "good" | "needs-improvement" | "poor" using the real published thresholds
}
function overallPageRating(metrics) {
  // the worst individual rating among LCP/INP/CLS wins
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
}`,
    testCases: [
      { input: 'classifyMetric("LCP", 3000)', expected: '"needs-improvement"', label: "LCP between 2500 and 4000ms is needs-improvement" },
      { input: 'classifyMetric("CLS", 0.3)', expected: '"poor"', label: "CLS over 0.25 is poor" },
      { input: 'overallPageRating({ LCP: 2000, INP: 150, CLS: 0.05 })', expected: '"good"', label: "All three good metrics rate the page good" },
      { input: 'overallPageRating({ LCP: 4500, INP: 150, CLS: 0.05 })', expected: '"poor"', label: "A single poor metric makes the whole page poor" },
    ],
    hints: [
      "LCP and INP use millisecond thresholds; CLS uses a unitless score — don't mix them up in the threshold table.",
      "'Good' is inclusive (<=) at its cutoff; 'poor' is exclusive (> ) at its cutoff — the middle band handles everything else.",
      "overallPageRating should reuse classifyMetric for each metric rather than re-deriving the thresholds.",
    ],
    isPremium: true,
    orderIndex: 64,
  },

  {
    slug: "find-flame-chart-bottleneck",
    conceptSlug: "profiling-with-devtools",
    title: "Find the real bottleneck in a flame chart trace",
    description: `Self time versus total time — the distinction that separates the real bottleneck from a slow-looking wrapper function.

## The problem

The widest bar in a flame chart isn't necessarily the slow function — it might just be a thin wrapper around something slower underneath it. The function actually worth fixing is the one with the highest **self time**: time spent in that function alone, excluding its children.

## The idea

Walk the call tree recursively. A node's total time is its own \`selfTime\` plus every child's total time. The real bottleneck is whichever single node — anywhere in the tree — has the highest \`selfTime\` on its own.

## Your task

Write \`totalTime(node)\` and \`findBottleneck(node)\`, where each node is \`{ name, selfTime, children: [...] }\`:

\`\`\`js
const trace = {
  name: "render", selfTime: 10,
  children: [
    { name: "computeList", selfTime: 200, children: [] },
    { name: "paint", selfTime: 5, children: [{ name: "reflow", selfTime: 15, children: [] }] },
  ],
};
totalTime(trace) // 230
findBottleneck(trace) // "computeList"
\`\`\``,
    difficulty: "hard",
    starterCode: `function totalTime(node) {
  // node.selfTime + the totalTime of every child, recursively
}
function findBottleneck(node) {
  // the name of whichever node anywhere in the tree has the highest selfTime
}`,
    solutionCode: `function totalTime(node) {
  return node.selfTime + (node.children || []).reduce((sum, c) => sum + totalTime(c), 0);
}
function findBottleneck(node) {
  let best = { name: node.name, selfTime: node.selfTime };
  function walk(n) {
    if (n.selfTime > best.selfTime) best = { name: n.name, selfTime: n.selfTime };
    (n.children || []).forEach(walk);
  }
  walk(node);
  return best.name;
}`,
    testCases: [
      {
        input: '{ name:"render", selfTime:10, children:[{name:"computeList",selfTime:200,children:[]},{name:"paint",selfTime:5,children:[{name:"reflow",selfTime:15,children:[]}]}] }',
        expected: "230",
        label: "totalTime sums selfTime across the whole tree",
      },
      {
        input: "the same trace",
        expected: '"computeList"',
        label: "findBottleneck finds the highest selfTime anywhere in the tree, not just at the top level",
      },
    ],
    hints: [
      "totalTime is naturally recursive: a node's own selfTime plus the totalTime of each child.",
      "findBottleneck needs to walk every node in the tree, not just compare top-level children against each other.",
      "The root node itself is a candidate for the bottleneck too — don't start the comparison only from its children.",
    ],
    isPremium: true,
    orderIndex: 65,
  },

  {
    slug: "render-streamed-content-order",
    conceptSlug: "streaming-ssr-hydration",
    title: "Render streamed content in shell order, not arrival order",
    description: `The core insight behind streaming SSR: a chunk's arrival order has nothing to do with where it ends up on the page.

## The problem

Streamed sections resolve on the server in whatever order their data happens to finish — not necessarily the order they appear on the page. If the footer's data resolves before the main content's, does the footer render out of place?

## The idea

Each streamed chunk carries the id of the placeholder it belongs to, fixed by the original shell layout. However chunks arrive, each one just fills its own reserved slot — content not yet arrived stays as a skeleton placeholder.

## Your task

Write \`renderedContentAt(shellOrder, arrivedIds)\`, where \`shellOrder\` is the page's fixed layout order and \`arrivedIds\` is however many chunks have arrived so far (in arrival order) — return the shell positions, filling in arrived ids and \`"skeleton"\` for anything not yet arrived:

\`\`\`js
renderedContentAt(
  ["header", "sidebar", "main", "footer"],
  ["footer", "header"]
)
// → ["header", "skeleton", "skeleton", "footer"]
\`\`\``,
    difficulty: "hard",
    starterCode: `function renderedContentAt(shellOrder, arrivedIds) {
  // map shellOrder to itself where arrived, "skeleton" where not yet arrived
}`,
    solutionCode: `function renderedContentAt(shellOrder, arrivedIds) {
  return shellOrder.map((id) => (arrivedIds.includes(id) ? id : "skeleton"));
}`,
    testCases: [
      {
        input: 'renderedContentAt(["header","sidebar","main","footer"], ["footer","header"])',
        expected: '["header","skeleton","skeleton","footer"]',
        label: "Content keeps its shell position regardless of arrival order",
      },
      {
        input: 'renderedContentAt(["a","b","c"], [])',
        expected: '["skeleton","skeleton","skeleton"]',
        label: "Nothing arrived yet means every slot is still a skeleton",
      },
      {
        input: 'renderedContentAt(["a","b","c"], ["a","b","c"])',
        expected: '["a","b","c"]',
        label: "Once everything has arrived, the result matches the shell order exactly",
      },
    ],
    hints: [
      "The output array's length and position always match shellOrder — arrivedIds only decides which positions are filled in.",
      "Whether an id has 'arrived' is just an array membership check against arrivedIds.",
      "The order chunks arrived in never appears in the output — only which ones have arrived so far matters.",
    ],
    isPremium: true,
    orderIndex: 66,
  },

  {
    slug: "check-performance-budget",
    conceptSlug: "performance-budgets",
    title: "Check metrics against a performance budget",
    description: `The core mechanism behind every CI performance gate: measure, compare to the budget, and say pass or fail.

## The problem

A performance budget only works if it's actually enforced automatically — someone has to compute, for every metric that matters, whether the current build stayed under its limit.

## The idea

For each budgeted metric, a build passes if its actual value is at or under the budget's limit. The overall build only passes if every single budgeted metric passes — one failing metric fails the whole check.

## Your task

Write \`checkBudget(metrics, budgets)\`, where both are objects keyed by metric name, returning an array of \`{ metric, actual, budget, passed }\`. Then write \`overallBudgetStatus(results)\`, returning \`"pass"\` or \`"fail"\`:

\`\`\`js
checkBudget({ bundleSizeKb: 180, lcpMs: 3000 }, { bundleSizeKb: 170, lcpMs: 2500 })
// → [{ metric: "bundleSizeKb", actual: 180, budget: 170, passed: false }, { metric: "lcpMs", actual: 3000, budget: 2500, passed: false }]
\`\`\``,
    difficulty: "hard",
    starterCode: `function checkBudget(metrics, budgets) {
  // return [{ metric, actual, budget, passed }] for every key in budgets
}
function overallBudgetStatus(results) {
  // "pass" only if every result passed, otherwise "fail"
}`,
    solutionCode: `function checkBudget(metrics, budgets) {
  return Object.keys(budgets).map((metric) => ({
    metric,
    actual: metrics[metric],
    budget: budgets[metric],
    passed: metrics[metric] <= budgets[metric],
  }));
}
function overallBudgetStatus(results) {
  return results.every((r) => r.passed) ? "pass" : "fail";
}`,
    testCases: [
      {
        input: 'checkBudget({ bundleSizeKb: 150 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", actual: 150, budget: 170, passed: true }]',
        label: "A metric under its budget passes",
      },
      {
        input: 'checkBudget({ bundleSizeKb: 180 }, { bundleSizeKb: 170 })',
        expected: '[{ metric: "bundleSizeKb", actual: 180, budget: 170, passed: false }]',
        label: "A metric over its budget fails",
      },
      {
        input: 'overallBudgetStatus(checkBudget({ bundleSizeKb: 180, lcpMs: 2000 }, { bundleSizeKb: 170, lcpMs: 2500 }))',
        expected: '"fail"',
        label: "One failing metric fails the whole build, even if others pass",
      },
    ],
    hints: [
      "Iterate over budgets' keys, not metrics' keys — the budget defines which metrics are actually being gated.",
      "passed is a plain <= comparison; nothing about it needs to be more clever than that.",
      "overallBudgetStatus should reuse the passed field checkBudget already computed, not re-run any comparisons.",
    ],
    isPremium: true,
    orderIndex: 67,
  },

  // ── system-design (Feature 48) ────────────────────────────────────────────
  {
    slug: "find-circular-component-imports",
    companies: ["LinkedIn"],
    conceptSlug: "component-driven-architecture",
    title: "Find a circular dependency in a component import graph",
    description: `The bug that turns a clean component tree into a tangled one: a cycle in the import graph.

## The problem

Component-driven architecture only stays reusable if the dependency direction is one-way — small components never import anything above them. When that breaks down (a shared \`Card\` accidentally imports a page-level component for "just one thing"), the import graph gets a cycle, and cycles cause real bundler/runtime problems (circular \`require\`s resolving to partially-initialized modules).

## The idea

Walk the graph with a depth-first search, tracking which nodes are on the *current* path (not just visited ever) — a node reappearing on the current path is exactly a cycle.

## Your task

Write \`findCycle(graph)\`, where \`graph\` is an adjacency list (\`{ [component]: string[] }\` of what it imports). Return the cycle as an array of component names, starting and ending on the repeated node, or \`null\` if the graph has none:

\`\`\`js
findCycle({ A: ["B"], B: ["C"], C: ["A"] })
// → ["A", "B", "C", "A"]
findCycle({ A: ["B"], B: ["C"], C: [] })
// → null
\`\`\``,
    difficulty: "medium",
    starterCode: `function findCycle(graph) {
  // DFS, tracking the current path — a repeated node on the path is a cycle
}`,
    solutionCode: `function findCycle(graph) {
  const visited = new Set();
  const stack = new Set();
  const path = [];
  function dfs(node) {
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const neighbor of graph[node] || []) {
      if (stack.has(neighbor)) {
        return [...path.slice(path.indexOf(neighbor)), neighbor];
      }
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor);
        if (result) return result;
      }
    }
    stack.delete(node);
    path.pop();
    return null;
  }
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const result = dfs(node);
      if (result) return result;
    }
  }
  return null;
}`,
    testCases: [
      {
        input: 'findCycle({ A: ["B"], B: ["C"], C: ["A"] })',
        expected: '["A", "B", "C", "A"]',
        label: "Detects a 3-node cycle",
      },
      {
        input: 'findCycle({ A: ["B"], B: ["C"], C: [] })',
        expected: "null",
        label: "Returns null for a simple chain",
      },
      {
        input: 'findCycle({ A: [], B: [] })',
        expected: "null",
        label: "Returns null with no edges at all",
      },
    ],
    hints: [
      "Track two sets: every node visited ever, and only the nodes currently on the path from the DFS root.",
      "A neighbor already visited but not on the current path is fine — it just means two components share a dependency, not a cycle.",
      "The cycle path is the slice of the current path starting from where the repeated node first appeared, plus that node again at the end.",
    ],
    isPremium: true,
    orderIndex: 68,
  },

  {
    slug: "plan-fetch-waterfall",
    companies: ["Uber", "Amazon"],
    conceptSlug: "api-design-data-fetching-strategy",
    title: "Group dependent data requests into parallel fetch waves",
    description: `The core planning step behind avoiding a request waterfall: figure out which requests can actually run at the same time.

## The problem

Fetching \`user\`, then \`posts\` (which needs \`user\`), then \`comments\` (which needs \`posts\`) one after another is a waterfall — but two independent requests with no dependency on each other shouldn't be forced to wait in line just because they were fetched at the same layer.

## The idea

Requests that have no unresolved dependencies can fire in the same wave. Once a wave resolves, some requests that depended only on that wave become fetchable in the next one.

## Your task

Write \`planFetchWaterfall(requests)\`, where \`requests\` is \`{ name, dependsOn: string[] }[]\`. Return an array of waves — each wave an array of names that can fetch in parallel — sorting names alphabetically within a wave for a deterministic result:

\`\`\`js
planFetchWaterfall([
  { name: "user", dependsOn: [] },
  { name: "settings", dependsOn: [] },
  { name: "posts", dependsOn: ["user"] },
])
// → [["settings", "user"], ["posts"]]
\`\`\``,
    difficulty: "hard",
    starterCode: `function planFetchWaterfall(requests) {
  // Repeatedly pull out every request whose dependsOn are all already resolved
}`,
    solutionCode: `function planFetchWaterfall(requests) {
  const byName = Object.fromEntries(requests.map((r) => [r.name, r]));
  const resolved = new Set();
  const waves = [];
  const remaining = new Set(requests.map((r) => r.name));
  while (remaining.size) {
    const wave = [...remaining].filter((name) => byName[name].dependsOn.every((d) => resolved.has(d)));
    if (wave.length === 0) throw new Error("circular dependency");
    wave.sort();
    for (const name of wave) { remaining.delete(name); resolved.add(name); }
    waves.push(wave);
  }
  return waves;
}`,
    testCases: [
      {
        input:
          'planFetchWaterfall([{ name: "user", dependsOn: [] }, { name: "posts", dependsOn: ["user"] }, { name: "comments", dependsOn: ["posts"] }])',
        expected: '[["user"], ["posts"], ["comments"]]',
        label: "A linear chain produces one request per wave",
      },
      {
        input:
          'planFetchWaterfall([{ name: "user", dependsOn: [] }, { name: "settings", dependsOn: [] }, { name: "posts", dependsOn: ["user"] }])',
        expected: '[["settings", "user"], ["posts"]]',
        label: "Independent requests share the first wave",
      },
    ],
    hints: [
      "A request belongs in the current wave if every name in its dependsOn has already been resolved in an earlier wave.",
      "Move every eligible request into the wave at once, not one at a time — that's what makes them parallel rather than sequential.",
      "Sort each wave's names before pushing it, so the result is deterministic regardless of the input array's order.",
    ],
    isPremium: true,
    orderIndex: 69,
  },

  {
    slug: "pick-realtime-transport",
    companies: ["Uber"],
    conceptSlug: "designing-real-time-updates",
    title: "Choose the right real-time transport for the constraints",
    description: `The decision behind every "polling vs. SSE vs. WebSocket" system design question, made concrete.

## The problem

Reaching for WebSockets "to be safe" adds bidirectional complexity a one-way feed never uses. The right transport depends on the actual constraints, not a default.

## The idea

Direction is the first fork: if the client ever needs to send data back over the same live channel, only a WebSocket does that. Otherwise, frequency and browser support decide between SSE and plain polling.

## Your task

Write \`chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired })\`, returning \`"websocket"\`, \`"sse"\`, or \`"polling"\`:

- \`needsBidirectional: true\` → \`"websocket"\`, always
- otherwise, \`browserSupportRequired: "legacy"\` → \`"polling"\` (no SSE/WebSocket support assumed)
- otherwise, \`updateFrequencySec <= 10\` → \`"sse"\`
- otherwise → \`"polling"\``,
    difficulty: "hard",
    starterCode: `function chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired }) {
  // bidirectional first, then legacy support, then frequency
}`,
    solutionCode: `function chooseTransport({ needsBidirectional, updateFrequencySec, browserSupportRequired }) {
  if (needsBidirectional) return "websocket";
  if (browserSupportRequired === "legacy") return "polling";
  if (updateFrequencySec <= 10) return "sse";
  return "polling";
}`,
    testCases: [
      {
        input:
          'chooseTransport({ needsBidirectional: true, updateFrequencySec: 1, browserSupportRequired: "modern" })',
        expected: '"websocket"',
        label: "Bidirectional always wins, regardless of frequency",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "modern" })',
        expected: '"sse"',
        label: "Frequent one-way updates pick SSE",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 60, browserSupportRequired: "modern" })',
        expected: '"polling"',
        label: "Infrequent updates fall back to polling",
      },
      {
        input:
          'chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "legacy" })',
        expected: '"polling"',
        label: "Legacy browser support forces polling even at high frequency",
      },
    ],
    hints: [
      "Check needsBidirectional first — nothing else matters if the client has to send data back over the same channel.",
      "browserSupportRequired === 'legacy' should short-circuit to polling before frequency is even considered.",
      "The frequency threshold only decides between SSE and polling, never between either of those and WebSocket.",
    ],
    isPremium: true,
    orderIndex: 70,
  },

  {
    slug: "merge-feed-page",
    companies: ["Meta", "TikTok"],
    conceptSlug: "designing-infinite-scroll-feed",
    title: "Merge a newly fetched feed page without duplicates",
    description: `The core operation behind a stable infinite-scroll feed: merging in a new page without corrupting what's already loaded.

## The problem

A feed re-fetching or re-rendering shouldn't duplicate an item that was already loaded — and it needs to remember the new cursor for the next fetch.

## The idea

Track which ids are already present. Append only the new page's items whose id hasn't been seen yet, preserving the existing order, then carry forward the new cursor.

## Your task

Write \`mergeFeedPage(existingItems, newPage)\`, where \`newPage\` is \`{ items: {id}[], nextCursor }\`. Return \`{ items, nextCursor }\`:

\`\`\`js
mergeFeedPage(
  [{ id: 1 }, { id: 2 }],
  { items: [{ id: 2 }, { id: 3 }], nextCursor: "c3" }
)
// → { items: [{ id: 1 }, { id: 2 }, { id: 3 }], nextCursor: "c3" }
\`\`\``,
    difficulty: "hard",
    starterCode: `function mergeFeedPage(existingItems, newPage) {
  // Append only items whose id isn't already present; carry forward nextCursor
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
}`,
    testCases: [
      {
        input:
          'mergeFeedPage([{ id: 1 }, { id: 2 }], { items: [{ id: 2 }, { id: 3 }], nextCursor: "c3" })',
        expected: '{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], nextCursor: "c3" }',
        label: "Duplicate ids across the boundary aren't repeated",
      },
      {
        input: 'mergeFeedPage([], { items: [{ id: 1 }], nextCursor: "c1" })',
        expected: '{ items: [{ id: 1 }], nextCursor: "c1" }',
        label: "An empty starting feed just takes the new page",
      },
    ],
    hints: [
      "Build the seen-id set from existingItems before looking at newPage's items.",
      "Existing items keep their original order; only new, unseen items get appended at the end.",
      "The returned nextCursor always comes from newPage, never from the existing state.",
    ],
    isPremium: true,
    orderIndex: 71,
  },

  {
    slug: "transform-insert-operations",
    companies: ["Dropbox"],
    conceptSlug: "designing-realtime-collaborative-editor",
    title: "Transform a concurrent insert operation (Operational Transformation)",
    description: `The core mechanism behind Operational Transformation, reduced to its simplest case: two concurrent plain-text inserts.

## The problem

Two inserts computed against the same original text, both targeting position 5, can't both be applied at position 5 literally — one has to shift to account for the other already being there.

## The idea

Given an operation \`opA\` that's already been applied, adjust a concurrently-authored \`opB\` so that applying it next lands in the right place: if \`opB\`'s position is at or after \`opA\`'s, shift it forward by \`opA\`'s inserted text length; otherwise it's unaffected.

## Your task

Write \`transform(opA, opB)\`, where each op is \`{ pos, text }\`, returning the adjusted \`opB\`:

\`\`\`js
transform({ pos: 5, text: "X" }, { pos: 5, text: "Y" })
// → { pos: 6, text: "Y" } — Y now lands after X, not on top of it
transform({ pos: 5, text: "X" }, { pos: 2, text: "Y" })
// → { pos: 2, text: "Y" } — unaffected, Y was before X's position
\`\`\``,
    difficulty: "hard",
    starterCode: `function transform(opA, opB) {
  // Shift opB's position forward by opA's text length if opB.pos >= opA.pos
}`,
    solutionCode: `function transform(opA, opB) {
  if (opB.pos >= opA.pos) {
    return { ...opB, pos: opB.pos + opA.text.length };
  }
  return { ...opB };
}`,
    testCases: [
      {
        input: 'transform({ pos: 5, text: "X" }, { pos: 5, text: "Y" })',
        expected: '{ pos: 6, text: "Y" }',
        label: "A same-position concurrent insert shifts after the applied one",
      },
      {
        input: 'transform({ pos: 5, text: "X" }, { pos: 2, text: "Y" })',
        expected: '{ pos: 2, text: "Y" }',
        label: "An insert before the applied position is left untouched",
      },
      {
        input: 'transform({ pos: 2, text: "Hi" }, { pos: 5, text: "Y" })',
        expected: '{ pos: 7, text: "Y" }',
        label: "The shift amount always equals the applied op's text length",
      },
    ],
    hints: [
      "The comparison is opB.pos >= opA.pos, not just > — a tie means opB is treated as landing after opA.",
      "The shift amount is opA.text.length, not a fixed amount — a longer inserted string shifts everything after it further.",
      "An op whose position is strictly before opA's position is returned unchanged.",
    ],
    isPremium: true,
    orderIndex: 72,
  },

  {
    slug: "classify-architecture-fit",
    companies: ["Airbnb"],
    conceptSlug: "frontend-architecture-patterns",
    title: "Pick the right architecture for a team's actual constraints",
    description: `The decision tree behind "should this be a monolith, a monorepo, or micro-frontends?"

## The problem

Reaching for micro-frontends because a codebase feels big — rather than because separate teams are genuinely blocked by a shared deploy pipeline — trades a solvable code-organization problem for a harder distributed-systems one.

## The idea

Team count and the need for independent deploys are the two facts that actually decide this, not codebase size.

## Your task

Write \`classifyArchitectureFit({ teamCount, independentDeployNeeded })\`, returning \`"monolith"\`, \`"monorepo"\`, or \`"micro-frontend"\`:

- \`teamCount <= 1\` → \`"monolith"\`
- more than one team, no independent-deploy requirement → \`"monorepo"\`
- more than one team, independent deploys required → \`"micro-frontend"\``,
    difficulty: "hard",
    starterCode: `function classifyArchitectureFit({ teamCount, independentDeployNeeded }) {
  // teamCount decides monolith vs. multi-team; independentDeployNeeded decides the rest
}`,
    solutionCode: `function classifyArchitectureFit({ teamCount, independentDeployNeeded }) {
  if (teamCount <= 1) return "monolith";
  if (independentDeployNeeded) return "micro-frontend";
  return "monorepo";
}`,
    testCases: [
      {
        input: 'classifyArchitectureFit({ teamCount: 1, independentDeployNeeded: false })',
        expected: '"monolith"',
        label: "A single team never needs more than a monolith",
      },
      {
        input: 'classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: false })',
        expected: '"monorepo"',
        label: "Multiple teams sharing a release cadence fit a monorepo",
      },
      {
        input: 'classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: true })',
        expected: '"micro-frontend"',
        label: "Independent deploy requirements push toward micro-frontends",
      },
    ],
    hints: [
      "teamCount <= 1 short-circuits to monolith before independentDeployNeeded is even checked.",
      "The remaining split is entirely about independentDeployNeeded, not team count.",
      "There's no path back to monolith once teamCount > 1 — the choice is only monorepo vs. micro-frontend from there.",
    ],
    isPremium: true,
    orderIndex: 73,
  },

  {
    slug: "classify-state-layer",
    companies: ["Airbnb"],
    conceptSlug: "state-management-at-scale",
    title: "Classify a piece of state into its correct layer",
    description: `The decision every "where should this state live?" question ultimately reduces to.

## The problem

Putting server state in a generic global store — or hoisting local UI state into one — is the most common state-management mistake at scale.

## The idea

Whether data's source of truth is the server is checked first; then whether it's genuinely shared across the app; everything else is local.

## Your task

Write \`classifyStateLayer({ isServerData, isSharedAcrossRoutes })\`, returning \`"server"\`, \`"global"\`, or \`"local"\`:

- \`isServerData: true\` → \`"server"\`, regardless of the other flag
- otherwise, \`isSharedAcrossRoutes: true\` → \`"global"\`
- otherwise → \`"local"\``,
    difficulty: "hard",
    starterCode: `function classifyStateLayer({ isServerData, isSharedAcrossRoutes }) {
  // isServerData wins first; isSharedAcrossRoutes decides the rest
}`,
    solutionCode: `function classifyStateLayer({ isServerData, isSharedAcrossRoutes }) {
  if (isServerData) return "server";
  if (isSharedAcrossRoutes) return "global";
  return "local";
}`,
    testCases: [
      {
        input: 'classifyStateLayer({ isServerData: true, isSharedAcrossRoutes: false })',
        expected: '"server"',
        label: "Server-owned data is always server state",
      },
      {
        input: 'classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: true })',
        expected: '"global"',
        label: "Non-server state shared across routes is global",
      },
      {
        input: 'classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: false })',
        expected: '"local"',
        label: "Everything else defaults to local",
      },
    ],
    hints: [
      "isServerData is checked first and short-circuits everything else — a server-backed value is never global or local state.",
      "isSharedAcrossRoutes only matters once isServerData is false.",
      "The default case (neither flag set) is local, not global.",
    ],
    isPremium: true,
    orderIndex: 74,
  }
];

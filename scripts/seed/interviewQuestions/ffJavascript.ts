import type { InterviewQuestionSeed } from "../types";

export const FF_JAVASCRIPT_QUESTIONS: InterviewQuestionSeed[] = [

  // ff-javascript
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "Explain how prototypal inheritance works in JavaScript.",
    answer:
      "Every JavaScript object has an internal `[[Prototype]]` link to another object (or `null`). When you access a property, the engine first checks the object itself, then walks the prototype chain until it finds the property or reaches `null`.\n\nYou set up inheritance by linking prototypes: `Object.create(parentProto)` creates an object whose `[[Prototype]]` is `parentProto`. The `class` syntax is syntactic sugar over this mechanism — `extends` sets up the prototype chain and `super()` calls the parent constructor. Understanding the underlying chain explains why `instanceof` works, why methods can be shared across instances, and what `hasOwnProperty` guards against.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 1,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "What is a closure and when would you use one?",
    answer:
      "A closure is a function that retains access to the variables from its defining scope, even after that scope has returned. Every function in JavaScript closes over its surrounding scope.\n\nCommon uses:\n- **Private state** — module pattern, encapsulating variables that shouldn't be directly accessible\n- **Partial application / currying** — baking some arguments into a function\n- **Event handlers** — the handler closes over the relevant state at setup time\n- **Memoization** — a closure holds the cache object\n\nThe gotcha: all closures from the same scope share the same variable binding, so closures created in a `for` loop with `var` all see the final value of the loop variable unless you use `let` or an IIFE.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe", "Airbnb"],
    orderIndex: 2,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.any`, and `Promise.race`?",
    answer:
      "All four accept an iterable of promises:\n\n- **`Promise.all`** — resolves when all resolve, rejects immediately if any rejects (short-circuits). Use when you need every result and a single failure should abort.\n- **`Promise.allSettled`** — waits for every promise regardless of outcome, resolves with an array of `{ status, value/reason }` objects. Use when you need all outcomes.\n- **`Promise.any`** — resolves with the first successful result, rejects only if all reject (with an `AggregateError`). Use for fallback/racing to first success.\n- **`Promise.race`** — settles with the first promise to settle (resolve or reject). Use for timeouts.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 3,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "Explain the `this` keyword and how it's determined.",
    answer:
      "`this` is determined at call time, not definition time (except for arrow functions):\n\n1. **Regular function call** — `this` is `globalThis` (or `undefined` in strict mode)\n2. **Method call** — `obj.method()` → `this` is `obj`\n3. **Constructor call** — `new Fn()` → `this` is the new instance\n4. **Explicit binding** — `.call(ctx)`, `.apply(ctx)`, `.bind(ctx)` → `this` is `ctx`\n5. **Arrow function** — no own `this`; inherits from the enclosing lexical scope at definition time\n\nThe last rule is why arrow functions are preferred for callbacks: they don't rebind `this`, so a method using `setTimeout(() => this.update(), 100)` keeps the intended receiver.",
    difficulty: "medium",
    companies: ["Google", "Meta", "Amazon", "Microsoft"],
    orderIndex: 4,
  },

  {
    collection: "ff-javascript",
    question: "What is event delegation and why is it useful?",
    answer:
      "Event delegation attaches a single event listener to a parent element instead of one listener per child, exploiting the fact that events bubble up the DOM tree.\n\n```js\ndocument.querySelector('#list').addEventListener('click', (e) => {\n  if (e.target.matches('li')) handleItem(e.target);\n});\n```\n\nWhy it matters:\n- **Performance** — one listener vs. potentially thousands\n- **Dynamic children** — works for elements added to the DOM after the listener is attached (the classic problem with directly-bound handlers)\n- **Memory** — fewer listeners means less memory retained\n\nThe tradeoff: the handler must check `e.target` to identify which child fired the event, adding a little logic overhead.",
    difficulty: "easy",
    companies: ["Airbnb", "Stripe"],
    orderIndex: 5,
  },

  // event-loop concept top-ups (queried by concept_id on the Interview tab)
  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "What is the difference between the microtask queue and the task (macrotask) queue?",
    answer:
      "Both hold callbacks waiting to run, but they're drained differently:\n\n- **Microtask queue** — `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`. After each task, the event loop drains the **entire** microtask queue before doing anything else.\n- **Task (macrotask) queue** — `setTimeout`, `setInterval`, I/O, UI events. The loop takes **one** task per iteration.\n\nThe order each loop iteration: run one task → drain all microtasks → render (if needed) → repeat. This is why a promise callback always runs before a `setTimeout(…, 0)` queued at the same time — microtasks jump ahead of the next task.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 6,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question:
      "What does this log, and why? `console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4);`",
    answer:
      "It logs `1`, `4`, `3`, `2`.\n\n1. `console.log(1)` — synchronous, runs now\n2. `setTimeout(…)` — its callback goes to the **task queue**\n3. `Promise.resolve().then(…)` — its callback goes to the **microtask queue**\n4. `console.log(4)` — synchronous, runs now\n\nThe synchronous code finishes first (`1`, `4`). The call stack is now empty, so the loop drains all microtasks before touching tasks — `3` prints. Only then does the next task run — `2`. Microtasks always beat tasks queued in the same tick.",
    difficulty: "medium",
    companies: ["Meta", "Amazon", "Stripe"],
    orderIndex: 7,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "Does `setTimeout(fn, 0)` run `fn` immediately? Why or why not?",
    answer:
      "No. `setTimeout(fn, 0)` schedules `fn` as a **task** to run *as soon as possible*, but not before the current synchronous code finishes and the microtask queue is drained.\n\nThe `0` is a *minimum* delay, not a guarantee — the browser also clamps nested timeouts to ~4ms and won't run the callback while the call stack is busy. So `setTimeout(fn, 0)` really means \"run `fn` after the current execution and all pending microtasks complete,\" which is a common trick to defer work until after the current call stack unwinds.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 8,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "event-loop",
    question: "How does `async`/`await` interact with the event loop?",
    answer:
      "`async`/`await` is syntax over promises, so it runs on the **microtask** queue. When execution hits `await`, the async function pauses and returns control to the caller; everything *after* the `await` is scheduled as a microtask that resumes once the awaited value settles.\n\n```js\nasync function f() {\n  console.log('a');\n  await null;        // suspend here\n  console.log('b');  // resumes as a microtask\n}\nf();\nconsole.log('c');\n// logs: a, c, b\n```\n\nSo code after `await` never runs synchronously — it always yields to the microtask queue first, even when awaiting an already-resolved value.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 9,
  },


  // hoisting-temporal-dead-zone concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Are function declarations and function expressions hoisted the same way?",
    answer:
      "No. A **function declaration** (`function foo() {}`) is hoisted completely — both its name and its body are available from the top of the scope, so you can call it before its line in the file.\n\nA **function expression** (`const foo = function () {}` or `const foo = () => {}`) is not — only the variable declaration hoists, following that declaration's own rules. With `var`, the variable exists but is `undefined` until the assignment runs, so calling it early throws `TypeError: foo is not a function`. With `let`/`const`, it's in the TDZ, so calling it early throws a `ReferenceError` instead.",
    difficulty: "easy",
    companies: ["Amazon", "Meta"],
    orderIndex: 10,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "What does this log? `console.log(typeof x); var x = 5;`",
    answer:
      "It logs `\"undefined\"`. `var x` is hoisted to the top of its scope and pre-initialized to `undefined` before any code runs, so `typeof x` at that point sees a real (if unassigned) variable — not a missing one. `typeof` on a truly undeclared identifier would also return `\"undefined\"`, which is exactly why this particular check can't distinguish 'hoisted but not yet assigned' from 'never declared at all.'",
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 11,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Why does accessing a `let` variable inside its temporal dead zone throw instead of quietly returning `undefined` like `var` would?",
    answer:
      "It's a deliberate design choice made when `let`/`const` were introduced. `var`'s silent `undefined` hides a real class of bugs — a use-before-declare mistake fails quietly and the actual bug surfaces somewhere downstream, far from its real cause.\n\nThrowing immediately inside the TDZ turns that same mistake into a loud, immediate error at the exact point it happened, matching `const`'s existing requirement that a binding be initialized before use. This consistency is part of why modern style guides default to `let`/`const` and treat `var` as legacy.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 12,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "Is `const` hoisted?",
    answer:
      "Yes — exactly like `let`. Both are hoisted to the top of their scope but left uninitialized until their declaration line actually executes, so accessing either one earlier throws a `ReferenceError` inside the temporal dead zone.\n\nWhat's different about `const` is only what happens *after* initialization: its binding can never be reassigned. The hoisting behavior itself is identical to `let`.",
    difficulty: "easy",
    companies: ["Microsoft"],
    orderIndex: 13,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "hoisting-temporal-dead-zone",
    question: "What's a real bug that hoisting explains, beyond a predict-the-output puzzle?",
    answer:
      "A `var` declared inside an `if` block or nested function doesn't create a new binding scoped to that block — `var` hoists to the nearest enclosing **function** scope, not the block. Reusing a variable name inside a conditional can silently overwrite an outer variable of the same name, because there's only ever one `var` binding for the whole function, no matter how many nested blocks re-declare it.\n\n`let`/`const` don't have this problem — they're genuinely block-scoped, so a re-declaration inside an `if` creates a real, separate binding that doesn't touch the outer one.",
    difficulty: "medium",
    companies: ["Amazon", "Airbnb"],
    orderIndex: 14,
  },


  // equality-type-coercion concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "What does the abstract equality algorithm do differently when comparing an object to a primitive?",
    answer:
      "The object is converted to a primitive first — via its `valueOf()`, then `toString()` if needed — and *that* result is compared using the usual primitive coercion rules.\n\n```js\n[1] == 1; // true — [1] converts to \"1\" via toString, then to the number 1\n```\n\nThis is why array/object comparisons via `==` can look bizarre — the object is never compared 'as itself,' only whatever primitive it happens to convert to.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 15,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "Why is `Object.is` sometimes preferred over `===` for certain comparisons?",
    answer:
      "`Object.is` behaves like `===` for almost everything, but handles two edge cases differently: it treats `NaN` as equal to itself (`NaN === NaN` is `false`, but `Object.is(NaN, NaN)` is `true`), and it distinguishes `+0` from `-0` (`+0 === -0` is `true`, but `Object.is(+0, -0)` is `false`).\n\nThese edge cases matter in specific algorithms (checking for `NaN` without `Number.isNaN`, or code that cares about the sign of zero) and are exactly why React's internal `Object.is`-based comparison for `useState` bailouts can differ subtly from a naive `===` check.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 16,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "What does `[] == ![]` evaluate to, and why?",
    answer:
      "`true` — a classic coercion trick question.\n\n1. `![]` — `[]` is truthy, so negating it gives `false`.\n2. `[] == false` — the array coerces to a primitive: `[].toString()` is `\"\"`, and `\"\"` coerces to the number `0`. `false` also coerces to `0`.\n3. `0 == 0` — `true`.\n\nEach step is individually explainable, but chaining them together produces a result that looks nonsensical unless you trace every coercion step by step.",
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 17,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "equality-type-coercion",
    question: "How would you safely compare two values without any of `==`'s coercion surprises, including `NaN`?",
    answer:
      "Default to `===` for everyday comparisons — it never coerces, so `1 === '1'` is simply `false`, no surprises. For the rarer case where `NaN` or the sign of zero specifically matters, use `Object.is(a, b)` instead, since `===` alone can't distinguish `NaN` from itself or `+0` from `-0`.\n\nThe one place `==` earns its keep is an intentional `value == null` check, which is `true` for both `null` and `undefined` and `false` for everything else, including falsy values like `0` and `''`.",
    difficulty: "easy",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 18,
  },


  // closures concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "How would you implement a private counter using closures, without any class syntax?",
    answer:
      "```js\nfunction makeCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    get: () => count,\n  };\n}\n\nconst counter = makeCounter();\ncounter.increment();\ncounter.get(); // 1\ncounter.count; // undefined — count is not accessible directly\n```\n\n`count` only exists inside `makeCounter`'s scope — the only way to read or change it is through the functions returned alongside it, which is exactly what makes it 'private': there's no property on the returned object exposing the raw variable.",
    difficulty: "medium",
    companies: ["Amazon", "Stripe"],
    orderIndex: 19,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "What's the difference between a closure and simply passing a value as a function argument?",
    answer:
      "A closure keeps a **live reference** to the actual variable binding — if the outer scope's variable changes later, the closure sees the updated value. An argument, by contrast, is a copy of whatever value it was at call time (for primitives) — later changes to the original variable in the caller's scope have no effect on an already-passed argument.\n\nThis is exactly why two closures sharing the same outer scope can observe each other's updates to a shared variable, while two functions that each received a copied argument cannot.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 20,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question: "Can closures cause memory leaks? How?",
    answer:
      "Yes. If something keeps a closure alive longer than intended — a forgotten event listener, an uncleared `setInterval` — and that closure references a large object, the object stays reachable (and therefore un-collectable) for as long as the closure exists, even if nothing actually needs it anymore.\n\nThis is the same underlying mechanism the Memory Management & Leaks concept covers in depth: garbage collection only frees *unreachable* memory, and a live closure referencing something is enough to keep it reachable.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 21,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "closures",
    question:
      "What does this log, and why? `function outer() { let x = 1; function inner() { console.log(x); } x = 2; return inner; } outer()();`",
    answer:
      "It logs `2`, not `1`.\n\nClosures capture the **live binding** of a variable, not a snapshot of its value at the moment the inner function was created. By the time `inner` actually runs (after `outer` has already returned it), `x` has already been reassigned to `2` inside `outer`'s body — and `inner`'s closure sees that updated value, because it was always reading the same `x`, not a copy of it.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 22,
  },


  // callbacks-higher-order-functions concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What is 'callback hell,' and what patterns fixed it?",
    answer:
      "Callback hell is the deeply nested, hard-to-read code that results from chaining several async operations, each depending on the previous one's result, using nested callbacks — the classic 'pyramid of doom' shape.\n\nPromises fixed the nesting by letting `.then()` calls chain flatly instead of nesting. `async`/`await` went further, letting the same async logic read almost exactly like synchronous code, with `try/catch` handling errors the same way it would for sync code.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 23,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "How would you implement your own version of `Array.prototype.filter` using a plain loop?",
    answer:
      "```js\nfunction myFilter(array, predicate) {\n  const result = [];\n  for (let i = 0; i < array.length; i++) {\n    if (predicate(array[i], i, array)) {\n      result.push(array[i]);\n    }\n  }\n  return result;\n}\n```\n\nSame shape as `map` underneath — loop over the array, call the callback for each item — the only difference is `filter` uses the callback's return value as a keep/discard decision instead of a transformation.",
    difficulty: "easy",
    companies: ["Google", "Meta"],
    orderIndex: 24,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "What's the difference between `forEach` and `map`?",
    answer:
      "`forEach` calls the callback once per item purely for its side effects and always returns `undefined` — there's no way to get a transformed array back out of it. `map` calls the callback once per item and collects every return value into a **new array**.\n\nReaching for `forEach` when you actually want a transformed array is a common mistake — it forces you to manually push into an external array instead of just using `map`'s return value directly.",
    difficulty: "easy",
    companies: ["Meta", "Airbnb"],
    orderIndex: 25,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "Why are array methods like map/filter/reduce called 'higher-order functions' if map itself isn't the callback?",
    answer:
      "`map` is higher-order because it **accepts** a function as an argument — the callback you pass in is just a regular function, not itself higher-order. It's `map`'s acceptance (and, for some patterns, return) of a function that qualifies it as higher-order, not anything special about the callback itself.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 26,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "callbacks-higher-order-functions",
    question: "How does `reduce` differ fundamentally from `map` and `filter`?",
    answer:
      "`map` and `filter` always return arrays (the same length, or shorter). `reduce` can return **any single value** — a number, a string, an object, even a brand-new array — by folding the whole input array through an accumulator, one item at a time.\n\nThat generality is also why `reduce` is often the least readable of the three in practice — it can technically reimplement `map` or `filter` itself, but doing so usually trades away clarity for a flexibility the simpler method already provided.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 27,
  },


  // array-object-methods-immutability concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question:
      "What's wrong with `state.items.push(newItem)` in a React-like state update, even though `push` technically works?",
    answer:
      "`push` mutates the existing array in place and returns the new length — not a new array. React (and similar frameworks) detect updates by comparing the old state reference to a new one; since `push` never produces a new reference, the comparison sees 'no change' and skips the re-render entirely, even though the array's contents did change.\n\nThe fix is a non-mutating equivalent: `[...state.items, newItem]` or `state.items.concat(newItem)`, both of which return a genuinely new array.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 28,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "How would you remove an item from an array immutably, by index?",
    answer:
      "```js\nconst withoutIndex = (arr, i) => arr.filter((_, index) => index !== i);\n// or, equivalently:\nconst withoutIndex2 = (arr, i) => [...arr.slice(0, i), ...arr.slice(i + 1)];\n```\n\nBoth return a brand-new array with the target index excluded, leaving the original array (and every other item's reference) untouched — unlike `arr.splice(i, 1)`, which mutates the original array in place.",
    difficulty: "easy",
    companies: ["Amazon", "Google"],
    orderIndex: 29,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "Is spreading an object (`{ ...obj }`) a deep or shallow copy?",
    answer:
      "Shallow. Spread copies an object's own top-level properties into a new object, but any nested object or array inside it is still the **same reference** as in the original. Mutating a nested value through the 'copy' also mutates the original's nested value, since both point at the identical inner object.\n\nA true deep copy needs `structuredClone(obj)` or a recursive copy — spread alone only protects the top level.",
    difficulty: "medium",
    companies: ["Meta", "Microsoft"],
    orderIndex: 30,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "Which common array methods mutate their array, and which don't?",
    answer:
      "**Mutating** (change the array in place): `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`.\n\n**Non-mutating** (return a new array, original untouched): `map`, `filter`, `concat`, `slice`, `flat`, spread (`[...arr]`), and the newer `toSorted`/`toReversed`/`toSpliced` variants added specifically to give non-mutating equivalents of the mutating originals.\n\n`sort` and `reverse` are the two that catch people most often — they look like they should return a new array, but they mutate in place and return a reference to that same, now-mutated array.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 31,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "array-object-methods-immutability",
    question: "How would you sort an array without mutating the original?",
    answer:
      "`[...arr].sort(compareFn)` — spread first to create a shallow copy, then sort that copy, leaving the original array's order untouched. Newer engines also support `arr.toSorted(compareFn)` directly, a non-mutating equivalent added specifically to avoid needing the spread step.\n\nCalling `arr.sort(compareFn)` directly mutates `arr` in place and returns the same (now-reordered) array reference — easy to miss if you expected it to behave like `map`/`filter`.",
    difficulty: "easy",
    companies: ["Amazon"],
    orderIndex: 32,
  },


  // this-binding-execution-context concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "What does `this` refer to inside an arrow function defined at the top level of a module?",
    answer:
      "`undefined`. Arrow functions never have their own `this` — they always look outward to the enclosing scope for it. At a module's top level there's no enclosing function to inherit from, and ES modules always run in strict mode, so there's no `globalThis` fallback either — the result is `undefined`.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 33,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question:
      "How does `this` behave differently inside a regular function versus an arrow function passed as an event listener callback?",
    answer:
      "A **regular function** used as a listener has `this` set to the element the listener is attached to — the browser invokes it in a method-call-like way. An **arrow function** has no `this` of its own, so it inherits `this` from whatever scope it was lexically defined in — often not the element at all, and frequently `undefined` if defined at a module's top level.\n\nThis is why regular functions are still sometimes preferred for listeners that specifically need `this` to be the element (e.g. `this.classList.toggle(...)`), while arrow functions are preferred when you want to keep the surrounding `this`.",
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 34,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question: "What does `Function.prototype.call` do differently from `.apply`?",
    answer:
      "Both invoke the function immediately with a given `this` — the only difference is how the remaining arguments are passed. `fn.call(ctx, a, b)` takes them individually; `fn.apply(ctx, [a, b])` takes them as a single array.\n\nThey're otherwise functionally identical, and the spread operator (`fn.call(ctx, ...argsArray)`) has made `apply`'s array-based calling convention largely redundant in modern code, though it still shows up in older codebases and some `bind` polyfills.",
    difficulty: "easy",
    companies: ["Amazon", "Stripe"],
    orderIndex: 35,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "this-binding-execution-context",
    question:
      "Why do class methods sometimes lose their `this` when passed as a callback (e.g. as an event handler), and how do you fix it?",
    answer:
      "A class method is just a function sitting on the class's prototype — passing it as a bare reference (`element.addEventListener('click', instance.method)`) detaches it from `instance` exactly the same way any plain object method would be detached. By the time it's called, there's no object to the left of a dot, so `this` isn't `instance` anymore.\n\nThree common fixes: bind it in the constructor (`this.method = this.method.bind(this)`), declare it as an arrow-function class field (`method = () => { ... }`), or wrap the call site (`() => instance.method()`).",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 36,
  },


  // prototypal-inheritance concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What does `Object.create(null)` do, and why would you use it?",
    answer:
      "It creates an object with **no prototype at all** — not even `Object.prototype`. That means it has none of the usual inherited methods (`toString`, `hasOwnProperty`, `valueOf`, etc.).\n\nThis is useful for a plain dictionary/map-like object, where you never want an inherited key (like `toString`) to accidentally collide with a real data key you're storing — a genuinely 'empty' object rather than one that merely looks empty until you check its inherited surface.",
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 37,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What's the difference between an object's own property and an inherited property?",
    answer:
      "An **own** property is defined directly on the object itself. An **inherited** property is found only by walking up the object's prototype chain — it isn't actually stored on the object.\n\n`obj.hasOwnProperty('key')` (or the newer `Object.hasOwn(obj, 'key')`) distinguishes the two. `for...in` iterates both own and inherited enumerable properties, which is exactly why it's usually paired with a `hasOwnProperty` check (or replaced with `Object.keys`, which only returns own properties) in real code.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 38,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "How does a longer prototype chain affect property lookup performance?",
    answer:
      "Every extra link in the chain is an extra step the engine has to check before a lookup for a missing property finally resolves at `null`. For any single lookup this cost is tiny, but it's a real, non-zero cost that grows with chain depth — one of the practical reasons deeply nested class hierarchies are generally discouraged in favor of flatter composition, alongside the more commonly cited readability and flexibility concerns.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 39,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "prototypal-inheritance",
    question: "What's the difference between `Object.getPrototypeOf(obj)` and `obj.constructor.prototype`?",
    answer:
      "They're usually the same object, but `constructor` is just an ordinary, overridable property that happens to live on the prototype — if it's reassigned, or the object was built via `Object.create(proto)` without explicitly resetting `constructor`, `obj.constructor.prototype` can point somewhere unexpected.\n\n`Object.getPrototypeOf(obj)` always reflects the object's real internal `[[Prototype]]` link directly, regardless of whether `constructor` was set up correctly — it's the more reliable of the two.",
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 40,
  },


  // esm-vs-commonjs concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why can't you use top-level `await` in a CommonJS module, but you can in an ES module?",
    answer:
      "ESM's loading model is inherently asynchronous and graph-aware, so a top-level `await` can suspend that module's own evaluation without blocking anything unrelated to it. CommonJS's `require()` is synchronous by design — there's no equivalent async suspension point available at a CommonJS module's top level, since the whole system assumes loading completes instantly and in order.",
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 41,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "What does `\"type\": \"module\"` in `package.json` actually change?",
    answer:
      "It tells Node to treat `.js` files in that package as ES Modules (`import`/`export`) by default, instead of CommonJS (`require`/`module.exports`). Without it, Node assumes CommonJS for `.js` files, and you'd need the `.mjs` extension on a specific file to opt that one file into ESM instead.",
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 42,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why can importing a CommonJS package from an ESM file sometimes produce a 'no default export' surprise?",
    answer:
      "CommonJS only ever exports one thing — the `module.exports` object — so ESM's interop layer treats that whole object as the package's default export. Named exports you might expect (`import { thing } from 'cjs-package'`) are Node's best-effort static analysis of the CJS module's shape, which doesn't always succeed, especially when `module.exports` is built up dynamically rather than as a static object literal.",
    difficulty: "hard",
    companies: ["Meta", "Google"],
    orderIndex: 43,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "What is a circular dependency, and how do CJS and ESM handle it differently?",
    answer:
      "A circular dependency is two (or more) modules that import each other, directly or through a chain. CommonJS resolves it by handing back whatever's on the `exports` object **at the moment** the circular `require()` runs — some exports may still be `undefined` if they're assigned later in the file.\n\nESM's `import` bindings are **live references**, not copied values — a circularly-imported binding that hasn't been assigned yet is still accessible as a reference, and correctly reflects its real value once the module finishes evaluating, rather than staying frozen at whatever it was at import time.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 44,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "esm-vs-commonjs",
    question: "Why do bundlers care so much about the difference between ESM and CommonJS?",
    answer:
      "Because it directly determines how well they can optimize the output. ESM's static `import`/`export` let a bundler analyze the full dependency graph ahead of time and prove that a given export is never used anywhere, then delete it — tree-shaking. CommonJS's dynamic `require()` calls (which can be conditional, or have a computed path) can't be analyzed with the same certainty, so CommonJS code included in a bundle is much harder to shake, and tends to ship larger than an equivalent ESM module would.",
    difficulty: "medium",
    companies: ["Stripe", "Airbnb"],
    orderIndex: 45,
  },


  // promises-async-await concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "What happens if a Promise executor function throws synchronously?",
    answer:
      "The Promise automatically rejects with the thrown error — you don't need to manually catch it and call `reject()` yourself. `new Promise((resolve, reject) => { throw new Error('boom'); })` produces a rejected Promise with that error as the rejection reason, exactly as if `reject(new Error('boom'))` had been called directly.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 46,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "How would you implement a timeout wrapper around a Promise that might never settle?",
    answer:
      "```js\nfunction withTimeout(promise, ms) {\n  const timeout = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error('timed out')), ms)\n  );\n  return Promise.race([promise, timeout]);\n}\n```\n\n`Promise.race` settles as soon as the **first** of its inputs settles — pairing the real promise against a timer-based rejection gives you a bounded wait even for a promise that would otherwise hang forever.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 47,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question:
      "Why is an `async function` different from a plain function that manually returns a Promise, when they can look similar?",
    answer:
      "The key difference is error handling. An `async function` automatically wraps a synchronously-thrown error into a **rejected Promise** — `try/catch` inside it works uniformly whether the error came from a synchronous throw or an awaited rejection.\n\nA plain function that just returns `new Promise(...)` doesn't get this for free: if it throws synchronously *before* even constructing the Promise, that error propagates immediately to the caller as a regular thrown exception, not as a rejection — a subtle but real difference in how callers need to handle failures.",
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 48,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "promises-async-await",
    question: "Why does an unhandled Promise rejection matter, and how would you make sure one never slips through?",
    answer:
      "A rejected Promise with no `.catch()` (or no surrounding `try/catch` around its `await`) anywhere in its chain surfaces as an 'unhandled promise rejection' — most runtimes log it loudly, and in Node it can even crash the process depending on configuration, since it usually signals a real, un-recovered failure.\n\nThe fix is discipline, not a special API: every `await`ed call should sit inside a `try/catch` (or its Promise chain should end in `.catch()`), and every 'fire and forget' async call should still have an explicit `.catch()` attached, even if it just logs the error.",
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 49,
  },


  // debouncing-throttling concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Would you use debounce or throttle for an autosave feature, and why?",
    answer:
      "Debounce. Autosave only cares about the **final** state once the user stops typing — firing a save on every keystroke would be wasteful and could even save an in-progress, incomplete edit. A short debounce delay after the last keystroke is exactly the 'wait for a pause' behavior autosave needs.",
    difficulty: "easy",
    companies: ["Google", "Notion"],
    orderIndex: 50,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "What's a 'leading edge' versus 'trailing edge' debounce?",
    answer:
      "**Trailing** (the default, and the version most simple implementations build) runs *after* the pause — once calls stop arriving, the delayed call fires. **Leading** runs immediately on the very first call in a burst, then ignores subsequent calls until a pause occurs.\n\nLeading-edge debounce is useful for things like preventing a double-submit on a fast double-click — you want the very first click to register immediately, not delayed until the user stops clicking.",
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 51,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "How would you implement throttle so it guarantees the very last call in a burst still eventually runs?",
    answer:
      "A basic throttle just drops calls that arrive before the interval elapses, which can silently lose the final, most up-to-date call in a burst. A 'trailing' throttle fixes this by tracking a pending flag alongside the last-run timestamp — if a call arrives before the interval elapses, it schedules (rather than drops) one trailing call for exactly when the interval does elapse, so the burst's final value is never lost, just delayed slightly.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 52,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Why does debounce's `.cancel()` method matter in a real component?",
    answer:
      "Without it, a debounced function scheduled right before a component unmounts (or a search input clears) still fires later — against a component that's gone, or state that's now stale. `.cancel()` gives cleanup code (like a `useEffect` cleanup function) a way to discard the pending call explicitly, instead of letting it fire into a context that no longer expects it.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 53,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "debouncing-throttling",
    question: "Give a real example where throttle is clearly the better choice over debounce.",
    answer:
      "An infinite-scroll 'am I near the bottom yet' check on the `scroll` event. You want this evaluated at a steady rate **throughout** the scroll, not just once after the user stops scrolling — which is exactly what debounce would give you, missing the continuous progress checks the feature actually needs to trigger loading more content while still scrolling.",
    difficulty: "easy",
    companies: ["Twitter", "LinkedIn"],
    orderIndex: 54,
  },


  // function-composition-currying concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What is point-free style, and how does composition enable it?",
    answer:
      "Point-free style writes a function's transformation without ever naming the data ('the point') it operates on. `const cleanSlug = compose(slugify, lower, trim);` never mentions the string being transformed at all — it only describes the pipeline.\n\nComposition is what makes this possible: instead of writing `(s) => slugify(lower(trim(s)))`, which does name the argument, `compose` lets you describe the same pipeline as data — a list of functions to run in sequence — with no argument name needed anywhere.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 55,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "Why is composition typically written right-to-left, matching `f(g(x))`, rather than left-to-right?",
    answer:
      "It mirrors how nested function calls already read, both mathematically and in code — `compose(f, g)(x)` behaves exactly like writing `f(g(x))` by hand. Some libraries (lodash's `flow`, for example) offer a left-to-right 'pipe' variant instead, purely as a readability preference for people who find reading top-to-bottom/left-to-right more natural for a pipeline. The underlying mechanism — chaining outputs into inputs — is identical either way.",
    difficulty: "easy",
    companies: ["Google"],
    orderIndex: 56,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What's the practical benefit of currying a function like `add(a, b, c)` over just calling it normally?",
    answer:
      "Currying enables **partial application** — fixing some arguments early to produce a smaller, more specific, reusable function. `const addTax = curriedAdd(0.08)` bakes the tax rate in via closure, and the resulting function can be reused across many different prices without re-specifying the rate each time — something a normal multi-argument function can't do without writing a separate wrapper by hand.",
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 57,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "How would you compose two functions where one is async and returns a Promise?",
    answer:
      "A standard synchronous `compose` breaks here — it would try to call the next function with a Promise instead of the resolved value. An async-aware composition helper needs to `await` each step's result before calling the next function, chaining them sequentially (via `async`/`await` or `.then()`) rather than calling every function synchronously in one pass.",
    difficulty: "hard",
    companies: ["Google", "Amazon"],
    orderIndex: 58,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "function-composition-currying",
    question: "What's a real downside of overusing composition and currying in application code?",
    answer:
      "Heavily curried and composed code can be genuinely harder to debug — a stack trace shows a chain of many small, often anonymous functions instead of one clear call site, and stepping through in DevTools means jumping between many tiny functions instead of reading through one readable block of logic. It's a real tradeoff, not a free win — reserve it for genuinely reusable transformation pipelines, not every function in the codebase.",
    difficulty: "medium",
    companies: ["Airbnb"],
    orderIndex: 59,
  },


  // memory-management-leaks concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's the difference between a memory leak and just using a lot of memory?",
    answer:
      "Using a lot of memory for something the app genuinely still needs is expected and fine. A **leak** is memory that stays reachable — and therefore never freed — even though the code no longer has any real use for it. The distinguishing test is behavioral: repeat the same action over and over (open/close a modal, navigate to a page and back) and watch whether memory keeps climbing indefinitely, or whether it settles back down after each cycle.",
    difficulty: "medium",
    companies: ["Google"],
    orderIndex: 60,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "Why do detached DOM nodes show up as a distinct category in Chrome DevTools' Memory panel?",
    answer:
      "A detached node — removed from the visible page but still referenced by a lingering JS variable — is a very common and easily fixed leak pattern, so DevTools calls it out specifically rather than making you infer it from generic object counts. Seeing 'Detached HTMLDivElement (12)' growing across repeated actions is an immediate, specific signal pointing at exactly what to go fix.",
    difficulty: "medium",
    companies: ["Meta", "Google"],
    orderIndex: 61,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "How can an accidental global variable cause a memory leak?",
    answer:
      "Anything attached to the global object (`window`/`globalThis`) stays reachable for the entire lifetime of the page, since the global object itself is always reachable from the engine's roots. An accidentally-global variable — forgetting a declaration keyword in non-strict code, for instance — that ends up referencing a large object keeps that object alive indefinitely, with no scope ever going out of existence to release it.",
    difficulty: "medium",
    companies: ["Amazon"],
    orderIndex: 62,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's the specific benefit of `WeakMap`/`WeakSet` for avoiding leaks?",
    answer:
      "A `WeakMap` holds its keys **weakly** — if nothing else in the program still references a key object, that object can be garbage collected even while it's technically still 'in' the `WeakMap`. A regular `Map` holds a strong reference to every key, keeping each one (and its associated value) alive for as long as the `Map` itself exists, even after nothing else needs it — exactly the kind of accidental retention that causes leaks in long-lived caches.",
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 63,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "memory-management-leaks",
    question: "What's a practical first step when you suspect a leak, before diving into heap snapshots?",
    answer:
      "Reproduce the suspected action repeatedly — open and close the same modal ten times, navigate to a page and back ten times — and watch the Performance/Memory panel's overall usage trend. A real leak shows a persistent upward climb that never comes back down even after a forced garbage collection; normal fluctuation rises and falls with each cycle. Confirming the trend first tells you whether a deeper heap-snapshot comparison is even worth doing.",
    difficulty: "medium",
    companies: ["Microsoft"],
    orderIndex: 64,
  },


  // generators-iterators concept top-ups
  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "How do you pass a value back into a generator via `.next(value)`?",
    answer:
      "Whatever you pass to `.next(value)` becomes the result of the `yield` expression that was paused, waiting to resume.\n\n```js\nfunction* g() {\n  const x = yield 1;\n  console.log(x);\n}\nconst it = g();\nit.next();    // { value: 1, done: false } — pauses at `yield 1`\nit.next(5);   // resumes with x = 5, logs 5\n```\n\nThe first `.next()` call's argument is always discarded, since there's no `yield` expression yet waiting to receive it — it only starts the generator running up to its first `yield`.",
    difficulty: "hard",
    companies: ["Google"],
    orderIndex: 65,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "What does `yield*` do?",
    answer:
      "It delegates iteration to another iterable or generator. `yield* otherGenerator()` yields every value `otherGenerator` produces, one at a time, as if each had been `yield`ed directly in the outer generator — rather than yielding the inner generator object itself as a single value. It's the generator equivalent of spreading one array into another.",
    difficulty: "medium",
    companies: ["Meta"],
    orderIndex: 66,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "What is `Symbol.iterator`, and how does it relate to generators?",
    answer:
      "`Symbol.iterator` is the well-known symbol every iterable must implement — an object with a `[Symbol.iterator]` method that returns an iterator (something with a `.next()` method). This is exactly what `for...of`, spread, and destructuring rely on under the hood.\n\nA generator function's returned object already satisfies this protocol automatically, which is why generators are the easiest way to make a custom data structure work with `for...of` — you don't have to hand-implement `.next()`/`{ value, done }` yourself.",
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 67,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "Can a generator's `.return()` method matter for cleanup?",
    answer:
      "Yes. Calling `it.return(value)` — or breaking out of a `for...of` loop early, which does this implicitly — causes any `try/finally` block currently paused inside the generator to run its `finally` clause immediately, as if a `return` had been hit right there. This matters for a generator that opened a resource (a file handle, a subscription) and needs to close it even when its consumer stops iterating early instead of exhausting it fully.",
    difficulty: "hard",
    companies: ["Amazon"],
    orderIndex: 68,
  },

  {
    collection: "ff-javascript",
    conceptSlug: "generators-iterators",
    question: "How does an async generator (`async function*`) differ from a regular generator?",
    answer:
      "Each yielded value can itself come from an awaited async operation, and it's consumed with `for await...of` instead of plain `for...of`. This is useful for lazily streaming paginated API results — awaiting each page's fetch, then yielding its items one at a time — without needing to load every page into memory upfront the way a plain array-returning function would have to.",
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 69,
  }
];

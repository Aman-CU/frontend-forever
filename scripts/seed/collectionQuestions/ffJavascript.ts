import type { CollectionQuestionSeed } from "../types";

// The 2 approved pilot answers (interview-prep-content-guide.md, approved
// 2026-07-14) plus Batch 1 (#2, #3, #5–20), Batch 2 (#21–40), Batch 3
// (#41–60), Batch 4 (#61–80), and Batch 5 (#81–101, the final batch) —
// completing the full 101-question JavaScript run (source: the user's
// "Javascript questions.pdf"). orderIndex matches the source PDF's own
// question numbering throughout, so the list page's natural order tracks
// the source document; event-loop's orderIndex corrected from 2 → 4 to
// match. Batch 2 onward includes a "classic interview gotcha" section per
// question — a standing format rule added after Batch 1 (see
// interview-prep-content-guide.md's checklist item 7 and Status section).
// #82 and #92 are near-duplicates of #19 and #29 in the source PDF itself
// (memoization and tagged templates each asked twice) — both were given a
// genuinely distinct, deeper angle and cross-linked back to the original,
// rather than repeating the same content under a new slug.
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
    isPremium: true,
    companies: ["Google", "Meta", "Amazon"],
    isFf75: true,
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
    isPremium: true,
    companies: ["Google", "Amazon", "Netflix"],
    isFf75: true,
    orderIndex: 4,
  },
  {
    collection: "ff-javascript",
    slug: "hoisting-in-javascript",
    question: "Explain hoisting in JavaScript.",
    answer: `Hoisting is JavaScript's behavior of processing all variable and function *declarations* during a compile step before any code actually runs — but only the declaration moves to the top of its scope, never the assignment or initialization.

### How it differs by declaration type

\`\`\`js
console.log(a); // undefined — declaration hoisted, assignment isn't
var a = 1;

console.log(b); // ReferenceError — in the temporal dead zone
let b = 2;

console.log(sayHi()); // works — function declarations hoist fully, body included
function sayHi() {
  return "hi";
}

console.log(sayBye()); // TypeError — sayBye is undefined at this point
var sayBye = function () {
  return "bye";
};
\`\`\`

### The four cases, side by side

| | Hoisted? | Usable before the line runs? |
|---|---|---|
| \`var\` | Yes, as \`undefined\` | Reads as \`undefined\`, no error |
| \`let\` / \`const\` | Yes, but uninitialized | No — throws in the temporal dead zone |
| \`function\` declaration | Yes, fully (with its body) | Yes — can call it before its line |
| \`function\` expression (\`var f = function(){}\`) | Only the \`var\` part hoists | No — \`f\` is \`undefined\` until the assignment runs |

### Why the engine does this at all

JavaScript compiles each scope in a pass before executing it, registering every declaration up front. This is what lets mutually-recursive function declarations call each other regardless of the order they're written in — a real, intentional benefit, not just a historical quirk. \`let\`/\`const\`'s temporal dead zone was added specifically to turn "used before hoisted-but-uninitialized" from a silent \`undefined\` bug into a loud \`ReferenceError\`.

**Related:** [Hoisting & the Temporal Dead Zone](/learn/javascript-runtime/hoisting-temporal-dead-zone) (Learn concept) · [What is the difference between \`var\`, \`let\`, and \`const\`?](/interview-prep/ff-javascript/var-let-const-differences)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Microsoft"],
    isFf75: true,
    orderIndex: 2,
  },
  {
    collection: "ff-javascript",
    slug: "what-are-closures",
    question: "What are closures and how do they work?",
    answer: `A closure is a function bundled together with references to the variables from its surrounding (lexical) scope — it keeps access to those variables even after the outer function that created them has already returned.

### A minimal example

\`\`\`js
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2 — count survived between calls, private to this counter
\`\`\`

\`count\` isn't a global and isn't re-created on each call — the returned function closes over the exact \`count\` variable from its one \`makeCounter()\` invocation. A second call to \`makeCounter()\` would create a completely separate \`count\`.

### What closures are actually used for

- **Private state** — the module pattern, encapsulating a value nothing outside can reach directly (like \`count\` above)
- **Partial application / currying** — pre-filling some arguments into a function that returns another function
- **Event handlers and callbacks** — the handler closes over whatever state was relevant when it was set up
- **Memoization** — a closure holds the cache object between calls (see the memoization question below)

### The classic interview gotcha

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // logs 3, 3, 3
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0); // logs 0, 1, 2
}
\`\`\`

\`var\` is function-scoped, so every closure in the loop shares the exact same \`i\` — by the time the callbacks run, the loop has finished and \`i\` is \`3\`. \`let\` creates a fresh binding *per iteration*, so each closure captures its own \`j\`.

**Related:** [Closures](/learn/javascript-runtime/closures) (Learn concept) · [What is memoization? Implement a simple memoize function.](/interview-prep/ff-javascript/what-is-memoization)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Amazon", "Stripe", "Airbnb"],
    isFf75: true,
    orderIndex: 3,
  },
  {
    collection: "ff-javascript",
    slug: "prototypal-inheritance-explained",
    question: "Explain the concept of prototypal inheritance.",
    answer: `Every JavaScript object has an internal \`[[Prototype]]\` link to another object (or \`null\`) — when you read a property, the engine checks the object itself first, then walks up that prototype chain until it finds the property or reaches \`null\`.

### Setting up the chain directly

\`\`\`js
const animal = {
  speak() {
    return \`\${this.name} makes a sound.\`;
  },
};

const dog = Object.create(animal); // dog.[[Prototype]] === animal
dog.name = "Rex";
dog.speak(); // "Rex makes a sound." — speak() isn't on dog, found via the chain
\`\`\`

\`dog\` doesn't have its own \`speak\` method — the lookup falls through to \`animal\`. \`Object.getPrototypeOf(dog) === animal\`.

### What \`class\`/\`extends\` really compile down to

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {}

const rex = new Dog("Rex");
rex.speak(); // still works — Dog.prototype's [[Prototype]] is Animal.prototype
\`\`\`

\`class\` is syntactic sugar over exactly the same mechanism above: \`extends\` links \`Dog.prototype\` to \`Animal.prototype\`, and \`super()\` calls the parent constructor. There's no separate "class" concept at runtime — it's prototype links all the way down.

### Diagram

The prototype chain visualized: an object instance points to its constructor's \`.prototype\`, which points to its own \`[[Prototype]]\`, and so on up to \`Object.prototype\` and finally \`null\`.

### Why this matters in practice

It explains why methods defined on a prototype are shared by every instance (one copy in memory, not one per object), why \`instanceof\` works (it checks whether a constructor's \`.prototype\` appears anywhere in the chain), and what \`hasOwnProperty\` is actually guarding against — a property found on the object itself versus one merely inherited from up the chain.

**Related:** [Prototypal Inheritance](/learn/javascript-runtime/prototypal-inheritance) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta"],
    isFf75: true,
    orderIndex: 5,
  },
  {
    collection: "ff-javascript",
    slug: "double-equals-vs-triple-equals",
    question: "What is the difference between `==` and `===`?",
    answer: `\`===\` (strict equality) compares both value and type with no conversion; \`==\` (loose equality) first coerces the two operands to a common type if they differ, then compares — which is what makes it a common source of surprising results.

### Coercion examples that trip people up

| Expression | \`==\` result | \`===\` result | Why |
|---|---|---|---|
| \`1 == "1"\` | \`true\` | \`false\` | string coerced to number |
| \`0 == false\` | \`true\` | \`false\` | boolean coerced to number |
| \`null == undefined\` | \`true\` | \`false\` | special-cased to equal only each other |
| \`"" == 0\` | \`true\` | \`false\` | empty string coerces to \`0\` |
| \`NaN == NaN\` | \`false\` | \`false\` | \`NaN\` never equals anything, itself included |

### The practical rule

Default to \`===\` everywhere — it's predictable and doesn't require memorizing JavaScript's coercion table. The one broadly-accepted exception is \`value == null\`, which deliberately catches both \`null\` and \`undefined\` in a single check (see the coercion rule above) instead of writing \`value === null || value === undefined\`.

**Related:** [Equality & Type Coercion](/learn/javascript-runtime/equality-type-coercion) (Learn concept)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Google", "Amazon"],
    isFf75: true,
    orderIndex: 6,
  },
  {
    collection: "ff-javascript",
    slug: "what-are-promises",
    question: "What are Promises and how do they work?",
    answer: `A Promise is an object representing the eventual result of an asynchronous operation — it starts \`pending\`, and settles exactly once into either \`fulfilled\` (with a value) or \`rejected\` (with a reason), never both and never more than once.

### The three states

\`\`\`js
const promise = new Promise((resolve, reject) => {
  fetchUser(id)
    .then((user) => resolve(user))
    .catch((err) => reject(err));
});
\`\`\`

Once a Promise settles, its state and value are locked in forever — calling \`resolve\` again after the fact does nothing. Any \`.then()\` attached later still receives the already-settled value immediately (asynchronously, via the microtask queue).

### Chaining

\`\`\`js
fetchUser(id)
  .then((user) => fetchPosts(user.id)) // returning a promise here chains it
  .then((posts) => console.log(posts))
  .catch((err) => console.error("failed at any step:", err));
\`\`\`

Each \`.then()\` returns a *new* Promise, which is what makes chaining work — returning a value passes it to the next \`.then()\`; returning another Promise waits for it to settle first; throwing (or returning a rejected Promise) skips straight to the next \`.catch()\`.

### Why Promises over plain callbacks

A single \`.catch()\` handles errors from anywhere earlier in the chain (no need to check an error argument at every step), and chained \`.then()\`s read top-to-bottom instead of nesting — the core problem Promises were designed to solve, often called "callback hell."

**Related:** [Promises & Async/Await](/learn/javascript-runtime/promises-async-await) (Learn concept) · [Explain async/await and how it relates to Promises.](/interview-prep/ff-javascript/async-await-explained)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 7,
  },
  {
    collection: "ff-javascript",
    slug: "async-await-explained",
    question: "Explain async/await and how it relates to Promises.",
    answer: `\`async\`/\`await\` is syntax built directly on top of Promises — it doesn't replace them, it lets you write Promise-based code that *reads* like synchronous code, without changing what's actually happening underneath (an \`async\` function always returns a Promise, and \`await\` just pauses that function until the awaited Promise settles).

### The same logic, two ways

\`\`\`js
// Promise chain
function loadUser(id) {
  return fetchUser(id)
    .then((user) => fetchPosts(user.id))
    .then((posts) => posts.length);
}

// async/await — same behavior, reads top-to-bottom
async function loadUser(id) {
  const user = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  return posts.length;
}
\`\`\`

### Error handling

\`await\`ing a rejected Promise throws, so ordinary \`try/catch\` handles it — no separate \`.catch()\` chain:

\`\`\`js
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    return await fetchPosts(user.id);
  } catch (err) {
    console.error("failed:", err);
    throw err; // re-throw if the caller also needs to know
  }
}
\`\`\`

### The sequential-await gotcha

\`\`\`js
// Slow — each await blocks the next, even though they don't depend on each other
const a = await fetchA();
const b = await fetchB();

// Fast — both start immediately, only the waiting happens together
const [a, b] = await Promise.all([fetchA(), fetchB()]);
\`\`\`

Awaiting one call at a time inside a loop or in sequence needlessly serializes independent requests — a very common real-world performance bug. Reach for \`Promise.all\` (or \`Promise.allSettled\`) whenever the calls don't actually depend on each other.

**Related:** [Promises & Async/Await](/learn/javascript-runtime/promises-async-await) (Learn concept) · [What are Promises and how do they work?](/interview-prep/ff-javascript/what-are-promises)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Stripe"],
    isFf75: true,
    orderIndex: 8,
  },
  {
    collection: "ff-javascript",
    slug: "null-vs-undefined",
    question: "What is the difference between `null` and `undefined`?",
    answer: `\`undefined\` means a variable has been declared but never assigned a value — JavaScript sets it automatically; \`null\` means "no value" *on purpose* — it's a value a developer explicitly assigns to represent absence.

### Where each shows up

| | Typical source |
|---|---|
| \`undefined\` | An uninitialized variable, a missing function argument, a nonexistent object property, a function with no \`return\` |
| \`null\` | Explicitly assigned by a developer to mean "intentionally empty" |

\`\`\`js
let a;
console.log(a); // undefined — declared, never assigned

let b = null;
console.log(b); // null — explicitly emptied

function f() {}
console.log(f()); // undefined — no return statement

const obj = {};
console.log(obj.missing); // undefined — property doesn't exist
\`\`\`

### Type checks and equality

\`\`\`js
typeof undefined; // "undefined"
typeof null;      // "object" — a famous, decades-old JS bug that can't be fixed now

null == undefined;  // true — loose equality special-cases these two
null === undefined; // false — different types
\`\`\`

### The practical convention

Let \`undefined\` mean "not set" and reserve \`null\` for a value you're deliberately setting to represent emptiness (e.g., resetting a selected-user field to "nobody selected"). Checking for either at once is usually written as \`value == null\` (see the \`==\` vs \`===\` question) rather than two separate strict checks.

**Related:** [What is the difference between \`==\` and \`===\`?](/interview-prep/ff-javascript/double-equals-vs-triple-equals)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Meta", "Amazon"],
    isFf75: true,
    orderIndex: 9,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-a-higher-order-function",
    question: "What is a higher-order function? Give examples.",
    answer: `A higher-order function is a function that either accepts another function as an argument, returns a function, or both — a direct consequence of JavaScript treating functions as first-class values (they can be stored in variables, passed around, and returned like any other value).

### Accepting a function as an argument

\`\`\`js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map((n) => n * 2); // map is higher-order — it takes a function
const evens = numbers.filter((n) => n % 2 === 0);
\`\`\`

\`Array.map\`, \`.filter\`, \`.reduce\`, and \`.forEach\` are the most common higher-order functions in everyday code — each takes a callback and applies it per element.

### Returning a function

\`\`\`js
function multiplyBy(factor) {
  return function (n) {
    return n * factor;
  };
}

const double = multiplyBy(2);
double(5); // 10
\`\`\`

\`multiplyBy\` is higher-order because it *returns* a function — this is also the basis of currying and partial application.

### Why this matters

Higher-order functions are what make composition possible — building complex behavior out of small, reusable, single-purpose functions instead of one large procedural block. Every debounce/throttle utility, every middleware system (Express, Redux), and every array-transformation pipeline in JavaScript leans on this pattern.

**Related:** [Callbacks & Higher-Order Functions](/learn/javascript-runtime/callbacks-higher-order-functions) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 10,
  },
  {
    collection: "ff-javascript",
    slug: "call-apply-bind-differences",
    question: "Explain the difference between `call`, `apply`, and `bind`.",
    answer: `All three let you explicitly set what \`this\` refers to inside a function — \`call\` and \`apply\` invoke the function immediately with that \`this\` (differing only in how they pass arguments), while \`bind\` doesn't call the function at all — it returns a *new* function permanently bound to that \`this\`.

### Side by side

| | Invokes immediately? | Arguments |
|---|---|---|
| \`fn.call(thisArg, a, b)\` | Yes | Passed individually |
| \`fn.apply(thisArg, [a, b])\` | Yes | Passed as an array |
| \`fn.bind(thisArg, a, b)\` | No — returns a new function | Individually; can be called again later with more |

\`\`\`js
function greet(greeting) {
  return \`\${greeting}, \${this.name}\`;
}
const user = { name: "Rex" };

greet.call(user, "Hi");    // "Hi, Rex" — calls now, args listed
greet.apply(user, ["Hi"]); // "Hi, Rex" — calls now, args as an array

const boundGreet = greet.bind(user);
boundGreet("Hi"); // "Hi, Rex" — callable any time later, this is locked to user
\`\`\`

### When each one is the right tool

- **\`call\`** — you have the arguments as separate values and want to invoke right now (e.g., borrowing a method: \`Array.prototype.slice.call(arguments)\`)
- **\`apply\`** — same as \`call\`, but the arguments already exist as an array (classic use: \`Math.max.apply(null, numbersArray)\`, though the spread operator \`Math.max(...numbersArray)\` has mostly replaced this today)
- **\`bind\`** — you need a version of the function permanently tied to a specific \`this\`, to be called later — most commonly, passing an object method as a callback (\`element.addEventListener('click', this.handleClick.bind(this))\`) without losing its \`this\`

**Related:** [\`this\` Binding & Execution Context](/learn/javascript-runtime/this-binding-execution-context) (Learn concept) · [What is the \`this\` keyword and how does it behave?](/interview-prep/ff-javascript/how-does-this-behave)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Bloomberg"],
    isFf75: true,
    orderIndex: 11,
  },
  {
    collection: "ff-javascript",
    slug: "how-does-this-behave",
    question: "What is the `this` keyword and how does it behave?",
    answer: `\`this\` is determined by *how a function is called*, not where it's defined — the same function can have a completely different \`this\` depending on the call site, except for arrow functions, which ignore all of that and inherit \`this\` lexically from their surrounding scope.

### The 4 call-site rules, in priority order

| Call pattern | \`this\` inside the function |
|---|---|
| \`new Fn()\` | The newly created object |
| \`fn.call(obj)\` / \`fn.apply(obj)\` / a function created with \`fn.bind(obj)\` | \`obj\`, explicitly |
| \`obj.method()\` | \`obj\` — whatever object the method was called *on* |
| \`fn()\` (plain call) | \`undefined\` in strict mode (or the global object in non-strict, sloppy mode) |

\`\`\`js
const obj = {
  name: "Rex",
  greet() {
    return this.name; // implicit binding — this is obj here
  },
};

const detached = obj.greet;
detached(); // TypeError-ish — this is undefined, not obj, once detached from obj.greet()
\`\`\`

This "losing \`this\`" bug — passing \`obj.method\` around as a plain callback — is the single most common real-world \`this\` mistake, and exactly what \`.bind()\` exists to prevent.

### Arrow functions are the exception

\`\`\`js
const obj = {
  name: "Rex",
  greetLater() {
    setTimeout(() => {
      console.log(this.name); // "Rex" — arrow function's this is obj's, not setTimeout's
    }, 0);
  },
};
\`\`\`

Arrow functions have no \`this\` of their own — they capture \`this\` from the enclosing scope at the point they're defined, the same way a closure captures a variable. That's exactly why they've become the default choice for callbacks inside methods.

**Related:** [\`this\` Binding & Execution Context](/learn/javascript-runtime/this-binding-execution-context) (Learn concept) · [Explain the difference between \`call\`, \`apply\`, and \`bind\`.](/interview-prep/ff-javascript/call-apply-bind-differences)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta", "Amazon"],
    isFf75: true,
    orderIndex: 12,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-event-delegation",
    question: "What is event delegation and why is it useful?",
    answer: `Event delegation means attaching a single event listener to a parent element instead of one listener per child — because events bubble up the DOM, the parent's listener can inspect \`event.target\` to figure out which child was actually interacted with.

### The pattern

\`\`\`js
// Instead of one listener per <li> (expensive, and misses items added later)
const list = document.querySelector("ul");
list.addEventListener("click", (event) => {
  const item = event.target.closest("li"); // walks up in case the click landed on nested markup
  if (item && list.contains(item)) {
    console.log("Clicked:", item.textContent);
  }
});
\`\`\`

One listener on the \`<ul>\` handles clicks on every \`<li>\` inside it — including ones added to the list *after* the listener was attached, since the listener isn't tied to any individual item.

### Why it's useful

- **Fewer listeners** — one on the container instead of hundreds on individual rows, which matters for memory and setup cost on large lists
- **Works on dynamically added elements automatically** — no need to re-attach a listener every time a new child is inserted
- **Simpler cleanup** — removing the container removes the one listener with it; no risk of leaking listeners on individually-removed children

### The tradeoff

Delegation relies on bubbling, so it doesn't work for events that don't bubble (like \`focus\`/\`blur\` in their plain form — though \`focusin\`/\`focusout\` do bubble and work fine with this pattern). It also adds a small per-click branching cost (checking \`event.target\`) versus a listener that already knows exactly what it's attached to — negligible in practice, but the actual tradeoff being made.

**Related:** [Event Delegation, Bubbling & Capturing](/learn/browser-internals/event-delegation-bubbling-capturing) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Uber"],
    isFf75: true,
    orderIndex: 13,
  },
  {
    collection: "ff-javascript",
    slug: "arrow-functions-vs-regular-functions",
    question: "What are arrow functions and how are they different from regular functions?",
    answer: `Arrow functions (\`(x) => x * 2\`) are a more compact function syntax that also behaves differently from regular functions in a few deliberate ways — most importantly, they don't have their own \`this\`, \`arguments\`, or prototype.

### The differences that actually matter

| | Regular function | Arrow function |
|---|---|---|
| \`this\` | Determined by how it's called (see the \`this\` question) | Inherited lexically from the enclosing scope |
| \`arguments\` object | Has its own | None of its own — inherits the enclosing function's lexically, or use rest params (\`...args\`) |
| Usable with \`new\`? | Yes | No — throws \`TypeError\` |
| Has a \`.prototype\`? | Yes | No |
| Hoisting (as a declaration) | Function declarations hoist fully | N/A — arrow functions are always expressions, only the binding hoists (if \`var\`/\`let\`/\`const\`) |

\`\`\`js
function regular() {
  console.log(arguments); // works — regular functions have their own arguments object
}

function outer() {
  const arrow = () => {
    console.log(arguments); // logs outer's arguments — arrow functions inherit it lexically, same as this
  };
  arrow();
}
outer(1, 2, 3); // Arguments(3) [1, 2, 3] — outer's own arguments, borrowed by the nested arrow

const arrowWithRest = (...args) => {
  console.log(args); // how a standalone arrow function (no enclosing function to inherit from) receives its arguments
};
\`\`\`

### When to reach for which

Arrow functions are the natural default for short callbacks and anything that should inherit the surrounding \`this\` (event handlers inside class methods, array callbacks, promise chains). Regular functions (or methods) are still the right call when you need your own \`this\` (object methods meant to be called as \`obj.method()\`), need \`arguments\`, or need the function to be usable as a constructor.

**Related:** [\`this\` Binding & Execution Context](/learn/javascript-runtime/this-binding-execution-context) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 14,
  },
  {
    collection: "ff-javascript",
    slug: "javascript-scope-explained",
    question: "Explain the concept of scope (global, function, block).",
    answer: `Scope determines where a variable is visible and accessible in your code. JavaScript has three levels: global scope (visible everywhere), function scope (visible only inside the function that declared it), and block scope (visible only inside the nearest \`{}\`).

### The three levels

\`\`\`js
const globalVar = "I'm everywhere"; // global scope

function outer() {
  const functionVar = "only inside outer()"; // function scope
  if (true) {
    const blockVar = "only inside this if-block"; // block scope
    console.log(globalVar, functionVar, blockVar); // all 3 visible here
  }
  console.log(blockVar); // ReferenceError — blockVar doesn't exist out here
}
\`\`\`

\`var\` only respects function scope (it would leak out of the \`if\` block above); \`let\`/\`const\` respect block scope, which is why they're the modern default.

### The scope chain

When JavaScript can't find a variable in the current scope, it looks in the next scope out, then the next, all the way to global — this nested lookup path is the "scope chain," and it's exactly the mechanism a closure relies on to reach variables from an enclosing function after that function has returned.

\`\`\`js
const a = "outer";
function outer() {
  const b = "middle";
  function inner() {
    console.log(a, b); // finds both by walking up the scope chain
  }
  inner();
}
\`\`\`

### Why it matters

Tight scoping (preferring block scope, keeping variables as local as possible) reduces naming collisions and makes it much easier to reason about where a variable's value could have come from — a core reason \`let\`/\`const\` largely replaced \`var\` in modern code.

**Related:** [What are closures and how do they work?](/interview-prep/ff-javascript/what-are-closures)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Adobe"],
    isFf75: true,
    orderIndex: 15,
  },
  {
    collection: "ff-javascript",
    slug: "temporal-dead-zone-explained",
    question: "What is the Temporal Dead Zone (TDZ)?",
    answer: `The Temporal Dead Zone is the span of code between the start of a scope and the line where a \`let\`/\`const\` variable is actually declared — the variable exists (it's hoisted), but accessing it anywhere in that span throws a \`ReferenceError\` instead of silently returning \`undefined\`.

### Seeing it directly

\`\`\`js
{
  // TDZ for x starts here — x exists but can't be touched yet
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 5;      // TDZ for x ends here
  console.log(x); // 5 — fine now
}
\`\`\`

Contrast with \`var\`, which has no TDZ — it's hoisted *and* initialized to \`undefined\` immediately, so reading it early just silently gives \`undefined\` instead of throwing.

### Why the TDZ exists at all

It's a deliberate design choice, not an accident: before \`let\`/\`const\`, \`var\`'s "reads as \`undefined\` before its declaration" behavior silently masked real bugs — code that *looks* like it should fail would just run with an unexpected \`undefined\`. The TDZ turns that same mistake into a loud, immediate \`ReferenceError\` at the exact line the mistake happens, instead of a confusing \`undefined\` propagating somewhere downstream.

### A subtler case worth knowing

\`\`\`js
function example(a = b, b = 2) {
  // ReferenceError — b is still in its own TDZ when used as a's default
  return [a, b];
}
\`\`\`

The TDZ applies to function parameter defaults too, evaluated left to right — a default value can't reference a later parameter that hasn't been initialized yet.

**Related:** [Hoisting & the Temporal Dead Zone](/learn/javascript-runtime/hoisting-temporal-dead-zone) (Learn concept) · [Explain hoisting in JavaScript.](/interview-prep/ff-javascript/hoisting-in-javascript)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Stripe"],
    isFf75: true,
    orderIndex: 16,
  },
  {
    collection: "ff-javascript",
    slug: "generators-and-iterators",
    question: "What are generators and iterators?",
    answer: `An iterator is any object with a \`.next()\` method that returns \`{ value, done }\`, letting you step through a sequence one value at a time; a generator (\`function*\`) is a special function that automatically builds an iterator for you, using \`yield\` to pause execution and hand back a value each time \`.next()\` is called.

### The iterator protocol, done by hand

\`\`\`js
function makeRangeIterator(start, end) {
  let current = start;
  return {
    next() {
      if (current < end) return { value: current++, done: false };
      return { value: undefined, done: true };
    },
  };
}
\`\`\`

Writing this manually — tracking state, returning the right shape every call — is exactly the boilerplate generators exist to remove.

### The same thing as a generator

\`\`\`js
function* rangeGenerator(start, end) {
  for (let i = start; i < end; i++) {
    yield i; // pauses here, hands back { value: i, done: false }
  }
}

const gen = rangeGenerator(0, 3);
gen.next(); // { value: 0, done: false }
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: undefined, done: true }

for (const n of rangeGenerator(0, 3)) {
  console.log(n); // 0, 1, 2 — generators are directly for-of-able
}
\`\`\`

Each call to \`.next()\` resumes the function body right where the last \`yield\` paused it — the local state (\`i\` here) is preserved between calls, the same closure-like persistence a generator gets for free.

### Why they're useful

Generators make lazy, on-demand sequences straightforward — values are computed only as they're requested, which matters for infinite sequences, large datasets you don't want to materialize all at once, and building custom iterables (implementing \`Symbol.iterator\`) without hand-writing the \`{ value, done }\` bookkeeping yourself.

**Related:** [Generators & Iterators](/learn/javascript-runtime/generators-iterators) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 17,
  },
  {
    collection: "ff-javascript",
    slug: "weakmap-and-weakset",
    question: "What is a `WeakMap` and `WeakSet`? When would you use them?",
    answer: `\`WeakMap\` and \`WeakSet\` are collections whose keys (WeakMap) or values (WeakSet) must be objects or non-registered symbols (as of ES2023), held with a *weak* reference — meaning if nothing else in the program still references that object, the garbage collector is free to reclaim it, and the entry silently disappears along with it.

### How they differ from \`Map\`/\`Set\`

| | \`Map\` / \`Set\` | \`WeakMap\` / \`WeakSet\` |
|---|---|---|
| Key/value types | Any value | Objects or non-registered symbols only (not primitives, not \`Symbol.for()\` symbols) |
| Prevents garbage collection of keys? | Yes — a strong reference | No — a weak reference |
| Iterable (\`.forEach\`, \`for...of\`, \`.size\`)? | Yes | No — intentionally, for GC reasons below |

\`\`\`js
const cache = new WeakMap();

function attachMetadata(el) {
  cache.set(el, { clicks: 0 });
}

// once "el" has no other references anywhere and is removed from the DOM,
// its entry in "cache" becomes eligible for garbage collection automatically —
// nothing needs to explicitly delete it from the WeakMap
\`\`\`

### Why no iteration or \`.size\`

If you could list a \`WeakMap\`'s entries, the *act of iterating* would itself require exposing a live reference to every key — which would defeat the entire point of holding them weakly. This restriction is deliberate, not a missing feature.

### When to reach for them

- Attaching metadata/cache data to DOM nodes or objects you don't own, without risking a memory leak if that node is later removed and you forget to clean up
- Tracking "has this object been processed" state without holding those objects alive forever
- Private data associated with object instances (a pattern some libraries use before native private class fields existed)

**Related:** [Memory Management & Leaks](/learn/javascript-runtime/memory-management-leaks) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Google"],
    isFf75: true,
    orderIndex: 18,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-memoization",
    question: "What is memoization? Implement a simple memoize function.",
    answer: `Memoization is a caching technique where a function remembers the output it already computed for a given set of inputs, so a repeated call with the same inputs returns the cached result instantly instead of redoing the work.

### A simple, generic implementation

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  for (let i = 0; i < 1e8; i++); // pretend this is expensive
  return n * n;
};

const fastSquare = memoize(slowSquare);
fastSquare(5); // slow the first time
fastSquare(5); // instant — served from the cache
\`\`\`

The returned function is a closure over \`cache\` — exactly the "closures for private state" use case from the closures question above, applied concretely.

### The real tradeoffs

- **Only correct for pure functions** — if \`fn\`'s output depends on anything besides its arguments (external state, randomness, the current time), a memoized version returns stale results
- **Memory vs. speed** — the cache grows forever with every unique input unless you add eviction (an LRU cache, a max size, or a TTL)
- **Key serialization matters** — \`JSON.stringify(args)\` breaks down for arguments that aren't cleanly serializable (functions, \`undefined\` inside objects, circular references); real-world memoizers often key on a single primitive argument instead, or use a more careful hashing strategy

**Related:** [What are closures and how do they work?](/interview-prep/ff-javascript/what-are-closures)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Amazon", "Uber"],
    isFf75: true,
    orderIndex: 19,
  },
  {
    collection: "ff-javascript",
    slug: "what-are-symbol-types",
    question: "What are `Symbol` types used for?",
    answer: `\`Symbol\` is a primitive type that creates a guaranteed-unique value every time it's called — even two symbols created with the identical description are never equal — most commonly used as an object property key that can't collide with any string key, including ones added later by other code.

### Guaranteed uniqueness

\`\`\`js
const sym1 = Symbol("id");
const sym2 = Symbol("id");
sym1 === sym2; // false — description is just a debugging label, not an identity

const user = {
  name: "Rex",
  [sym1]: "internal-id-123", // a property no string key can accidentally overwrite
};
\`\`\`

Because \`sym1\` is guaranteed unique, no other code — including a future library update adding its own metadata to the same object — can accidentally clash with this key the way two plain string keys could.

### Well-known symbols

JavaScript itself uses built-in symbols to let objects opt into language-level behavior without a reserved string name. \`Symbol.iterator\` is the most common one in practice — it's exactly what makes an object work with \`for...of\` and the spread operator:

\`\`\`js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last ? { value: current++, done: false } : { value: undefined, done: true };
      },
    };
  },
};

[...range]; // [1, 2, 3] — works because Symbol.iterator is implemented
\`\`\`

### What symbols are not for

They're not meant for "hiding" data as a security measure — \`Object.getOwnPropertySymbols()\` can still list an object's symbol keys. Their real purpose is collision-proof keying and hooking into well-known language protocols, not privacy.

**Related:** [Generators & Iterators](/learn/javascript-runtime/generators-iterators) (Learn concept)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Bloomberg"],
    isFf75: true,
    orderIndex: 20,
  },
  {
    collection: "ff-javascript",
    slug: "debouncing-and-throttling",
    question: "Explain debouncing and throttling with examples.",
    answer: `Debouncing delays running a function until a burst of calls has *stopped* for a set period — only the last call in the burst actually fires; throttling guarantees a function runs at most once per fixed interval no matter how many times it's called, spacing executions out evenly instead of waiting for silence.

### Debounce

\`\`\`js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onSearch = debounce((query) => fetchResults(query), 300);
input.addEventListener("input", (e) => onSearch(e.target.value));
\`\`\`

Every keystroke resets the timer — the request only fires 300ms after the user *stops* typing, not on some fixed schedule while they're still typing.

### Throttle

\`\`\`js
function throttle(fn, interval) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

const onScroll = throttle(() => updateScrollProgress(), 200);
window.addEventListener("scroll", onScroll);
\`\`\`

Scroll fires continuously, but the handler only actually runs at most every 200ms — steady, predictable updates instead of one massive burst.

### Classic interview gotcha

A rapid, *unending* stream of calls (someone typing continuously for 10 seconds) never fires a debounced function at all until the stream pauses — candidates often assume debounce fires "periodically" like throttle, but it fires exactly once, only after the calls stop. This is the single most common mix-up between the two, and interviewers ask for it specifically.

**Related:** [Debouncing & Throttling](/learn/javascript-runtime/debouncing-throttling) (Learn concept) · [What is the difference between \`setTimeout\` and \`setInterval\`?](/interview-prep/ff-javascript/settimeout-vs-setinterval)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Uber", "Airbnb"],
    isFf75: true,
    orderIndex: 21,
  },
  {
    collection: "ff-javascript",
    slug: "deep-copy-vs-shallow-copy",
    question: "What is the difference between deep copy and shallow copy?",
    answer: `A shallow copy duplicates only the top level of an object or array — any nested objects inside are still shared by reference with the original; a deep copy recursively duplicates everything, so the copy and the original share no references at all, at any depth.

### Shallow copy

\`\`\`js
const original = { name: "Rex", address: { city: "NYC" } };
const shallow = { ...original }; // or Object.assign({}, original)

shallow.name = "Max";            // fine — doesn't affect original
shallow.address.city = "LA";     // affects original too! address is shared
console.log(original.address.city); // "LA"
\`\`\`

\`{...obj}\`, \`Object.assign\`, and \`Array.prototype.slice\`/\`.concat\` are all shallow — they copy top-level keys, but nested objects/arrays are copied *by reference*, not by value.

### Deep copy

\`\`\`js
const deep = structuredClone(original); // native, handles most real-world cases
deep.address.city = "SF";
console.log(original.address.city); // "LA" — untouched, fully independent

// Older pattern (has real limitations — see below)
const deepViaJson = JSON.parse(JSON.stringify(original));
\`\`\`

\`structuredClone\` (available in modern browsers and Node) is the current standard way to deep clone. The older \`JSON.parse(JSON.stringify(...))\` trick works for plain data but silently drops \`undefined\`, functions, and \`Symbol\` keys, and breaks on \`Date\`, \`Map\`, \`Set\`, and circular references.

### Classic interview gotcha

The most common real-world bug: reaching for \`{...state}\` in a React reducer or Redux store expecting a full deep copy, then mutating a nested field directly on the "copy" — and silently mutating the original state object too, since only the top level was actually duplicated. This is the exact bug immutable-update helpers (Immer, \`structuredClone\`, hand-written recursive spreads) exist to prevent.

**Related:** [Array & Object Methods, Immutability](/learn/javascript-runtime/array-object-methods-immutability) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Amazon"],
    isFf75: true,
    orderIndex: 22,
  },
  {
    collection: "ff-javascript",
    slug: "how-javascript-handles-async",
    question: "How does JavaScript handle asynchronous operations?",
    answer: `JavaScript itself is single-threaded — it can only run one line of code at a time — so asynchronous operations (network requests, timers, file I/O) are handed off to the browser or Node's C++ APIs to run in the background, and JavaScript is only notified via a callback, Promise, or \`async\`/\`await\` once the result is ready.

### The three layers, in the order they appeared historically

\`\`\`js
// 1. Callbacks — the original mechanism
fetchUser(id, (user) => console.log(user));

// 2. Promises — object-based, chainable, avoids nested "callback hell"
fetchUser(id).then((user) => console.log(user));

// 3. async/await — Promises, written to read like synchronous code
async function load() {
  const user = await fetchUser(id);
  console.log(user);
}
\`\`\`

All three are ultimately the same underlying mechanism — \`async\`/\`await\` is sugar over Promises, and Promises are typically built on top of callback-based Web APIs underneath.

### Who actually does the "waiting"

The JavaScript engine itself never blocks waiting for a timer or a network response — the browser's Web APIs (or Node's libuv) run those operations outside the main JS thread, and only place a callback/task back onto the event loop's queue once the result is ready. The event loop is what decides when that queued callback finally gets to run on the main thread (see the event loop question for the full mechanics).

### Classic interview gotcha

A very common misconception: that calling an \`async\` function or constructing \`new Promise(...)\` is itself asynchronous. It isn't — the executor function passed to \`new Promise()\` runs **synchronously, immediately**, and the code in an \`async\` function runs synchronously too, right up until the first \`await\`. Only the *awaited* part is deferred.

\`\`\`js
console.log("1");
new Promise((resolve) => {
  console.log("2"); // runs synchronously, right now
  resolve();
});
console.log("3");
// Output: 1, 2, 3 — nothing here was actually async yet
\`\`\`

**Related:** [Promises & Async/Await](/learn/javascript-runtime/promises-async-await) (Learn concept) · [What is the event loop in JavaScript?](/interview-prep/ff-javascript/what-is-the-event-loop)`,
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 23,
  },
  {
    collection: "ff-javascript",
    slug: "settimeout-vs-setinterval",
    question: "What is the difference between `setTimeout` and `setInterval`?",
    answer: `\`setTimeout\` schedules a function to run once, after at least the given delay; \`setInterval\` schedules a function to run repeatedly, roughly every given interval, until explicitly stopped.

\`\`\`js
const timeoutId = setTimeout(() => console.log("once, later"), 1000);
clearTimeout(timeoutId); // cancels it before it fires

const intervalId = setInterval(() => console.log("every second"), 1000);
clearInterval(intervalId); // stops the repetition
\`\`\`

### Why "at least" the delay, not exactly

Both are macrotasks (see the event loop question) — the timer firing only *queues* the callback, it doesn't run it immediately. If the call stack is busy or the microtask queue hasn't drained, the callback waits, so the actual delay is always "at least" what you specified, never guaranteed to be exact.

### Classic interview gotcha

\`setInterval\` doesn't account for how long its own callback takes to run — if the callback itself takes longer than the interval, calls can queue up and fire back-to-back with no real gap once the thread frees up, rather than skipping the overdue ticks. This is exactly why a **recursive \`setTimeout\`** (scheduling the next call only after the current one finishes) is the safer pattern for polling, instead of \`setInterval\`:

\`\`\`js
function poll() {
  doWork();
  setTimeout(poll, 1000); // always waits a full 1000ms *after* doWork finishes
}
setTimeout(poll, 1000);
\`\`\`

**Related:** [What is the event loop in JavaScript?](/interview-prep/ff-javascript/what-is-the-event-loop) · [Explain debouncing and throttling with examples.](/interview-prep/ff-javascript/debouncing-and-throttling)`,
    difficulty: "easy",
    isPremium: true,
    companies: ["Amazon", "Microsoft"],
    isFf75: true,
    orderIndex: 24,
  },
  {
    collection: "ff-javascript",
    slug: "how-the-prototype-chain-works",
    question: "Explain how the prototype chain works.",
    answer: `When you read a property on an object, the engine checks the object's own properties first; if it's not there, it follows the object's internal \`[[Prototype]]\` link to the next object up and checks again, repeating until the property is found or the chain ends at \`null\`.

### Walking the chain step by step

\`\`\`js
const arr = [1, 2, 3];
arr.hasOwnProperty("push"); // false — push isn't arr's own property...
typeof arr.push;            // "function" — ...but the lookup still finds it

// arr -> Array.prototype -> Object.prototype -> null
Object.getPrototypeOf(arr) === Array.prototype;               // true
Object.getPrototypeOf(Array.prototype) === Object.prototype;  // true
Object.getPrototypeOf(Object.prototype);                      // null — chain ends
\`\`\`

Every array shares the exact same \`Array.prototype\` object — \`.push\`, \`.map\`, \`.filter\` all live there once, not duplicated per array instance, which is why the prototype chain matters for memory, not just for organizing code.

### Classic interview gotcha

Mutating a built-in prototype directly (\`Array.prototype.last = function () { return this[this.length - 1]; }\`) makes that method appear on **every array in the entire program**, including ones from third-party libraries — a real, historically-common source of hard-to-debug conflicts known as "prototype pollution." It's why extending built-ins is now considered an anti-pattern outside of controlled polyfills.

A related trap: \`for...in\` iterates *inherited* enumerable properties too, not just an object's own ones — which is exactly why array/object iteration code almost always needs a \`.hasOwnProperty()\` guard or should reach for \`for...of\`/\`Object.keys()\` instead.

**Related:** [Prototypal Inheritance](/learn/javascript-runtime/prototypal-inheritance) (Learn concept) · [Explain the concept of prototypal inheritance.](/interview-prep/ff-javascript/prototypal-inheritance-explained)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta"],
    isFf75: true,
    orderIndex: 25,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-currying",
    question: "What is currying in JavaScript?",
    answer: `Currying transforms a function that takes multiple arguments into a sequence of functions that each take one argument — instead of \`add(1, 2, 3)\`, you call \`add(1)(2)(3)\`, with each call returning a new function until all arguments have been supplied.

### A hand-written curry

\`\`\`js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
curriedAdd(1)(2)(3);   // 6
curriedAdd(1, 2)(3);   // 6 — partial groups of args work too
curriedAdd(1)(2, 3);   // 6
\`\`\`

### Why it's actually useful

Currying's real value is partial application — pre-filling some arguments to create a specialized, reusable function:

\`\`\`js
const multiply = curry((a, b) => a * b);
const double = multiply(2); // a specialized function, "a" locked in at 2
[1, 2, 3].map(double); // [2, 4, 6]
\`\`\`

This is the same underlying idea as \`Function.prototype.bind\` used for partial application, just generalized to any function and any number of arguments.

### Classic interview gotcha

A curried function's arity comes from \`fn.length\` — but \`fn.length\` doesn't count default parameters or rest parameters, so currying a function like \`(a, b = 1) => a + b\` sees an arity of 1, not 2, and returns the final result after just one argument instead of waiting for both. Candidates who implement curry from scratch almost always hit this the first time they test it against a function with defaults.

**Related:** [Function Composition & Currying](/learn/javascript-runtime/function-composition-currying) (Learn concept)`,
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 26,
  },
  {
    collection: "ff-javascript",
    slug: "pure-functions-and-side-effects",
    question: "What are pure functions and side effects?",
    answer: `A pure function always returns the same output for the same input and doesn't affect anything outside itself — no mutating arguments, no touching external state, no I/O. A side effect is any of those "touches the outside world" behaviors: mutating a variable outside the function, logging, making a network call, or modifying an argument passed by reference.

### Pure vs. impure, side by side

\`\`\`js
// Pure — same input always gives same output, touches nothing external
function add(a, b) {
  return a + b;
}

// Impure — depends on external state (Date.now()), a side effect (implicit)
function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : "Good afternoon";
}

// Impure — mutates the argument, a side effect on the caller's data
function addItem(cart, item) {
  cart.push(item); // mutates the array passed in
  return cart;
}

// Pure version of the same operation
function addItemPure(cart, item) {
  return [...cart, item]; // returns a new array, original untouched
}
\`\`\`

### Why purity matters in practice

Pure functions are trivially testable (no setup/mocking needed, just call it with inputs and check the output), safely memoizable (see the memoization question — memoizing an impure function returns wrong, stale results), and safe to run in any order or in parallel, since they can't interfere with anything else. This is exactly why React and Redux lean so heavily on pure functions (components as a function of props/state, reducers as \`(state, action) => newState\`).

### Classic interview gotcha

\`Array.prototype.sort()\` and \`.reverse()\` **mutate the array in place** and also return it — so \`const sorted = arr.sort()\` looks like a pure "give me a new sorted array" call but actually silently mutates \`arr\` too. \`.map\`, \`.filter\`, and \`.slice\` are the pure, non-mutating equivalents (\`[...arr].sort()\` is the standard workaround when you need a sorted copy).

**Related:** [Array & Object Methods, Immutability](/learn/javascript-runtime/array-object-methods-immutability) (Learn concept)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 27,
  },
  {
    collection: "ff-javascript",
    slug: "destructuring-assignment-es6",
    question: "Explain destructuring assignment in ES6.",
    answer: `Destructuring lets you unpack values from arrays or properties from objects directly into individual variables in a single expression, instead of accessing each one separately by index or key.

### Array destructuring

\`\`\`js
const [first, second, , fourth] = ["a", "b", "c", "d"]; // skip with an empty slot
first;  // "a"
fourth; // "d"

const [head, ...rest] = [1, 2, 3, 4];
rest; // [2, 3, 4] — rest pattern collects the remainder
\`\`\`

### Object destructuring

\`\`\`js
const { name, age = 18 } = { name: "Rex" }; // age falls back to the default
name; // "Rex"
age;  // 18 — "age" wasn't in the object, so the default applied

const { name: userName } = { name: "Rex" }; // rename while destructuring
userName; // "Rex"

function greet({ name, greeting = "Hi" }) {
  return \`\${greeting}, \${name}\`;
}
greet({ name: "Rex" }); // "Hi, Rex" — destructuring works directly in parameters
\`\`\`

### Classic interview gotcha

Destructuring an object requires the value to actually *be* an object first — destructuring \`null\` or \`undefined\` throws a \`TypeError\` immediately, before any default values even get a chance to apply:

\`\`\`js
function greet({ name = "stranger" } = {}) {
  return \`Hi, \${name}\`;
}
greet();          // "Hi, stranger" — the "= {}" default catches a missing argument
greet(undefined); // "Hi, stranger" — same reason
greet(null);       // TypeError! null isn't undefined, so "= {}" never kicks in
\`\`\`

Default values only apply when a value is literally \`undefined\` — never for \`null\` — which is exactly why \`greet(null)\` above still throws even with a default parameter in place.

**Related:** [What is the difference between \`null\` and \`undefined\`?](/interview-prep/ff-javascript/null-vs-undefined)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 28,
  },
  {
    collection: "ff-javascript",
    slug: "template-literals-and-tagged-templates",
    question: "What are template literals and tagged templates?",
    answer: `Template literals (backtick strings) support embedded expressions via \`\${...}\` interpolation and real multi-line strings without escape characters; a tagged template goes further, letting a function intercept and process the literal's pieces before producing the final string.

### Plain template literals

\`\`\`js
const name = "Rex";
const greeting = \`Hello, \${name}!
This spans multiple lines
with no \\n needed.\`;
\`\`\`

### Tagged templates

\`\`\`js
function highlight(strings, ...values) {
  return strings.reduce(
    (result, str, i) => \`\${result}\${str}\${values[i] ? \`<mark>\${values[i]}</mark>\` : ""}\`,
    "",
  );
}

const name = "Rex";
highlight\`Hello, \${name}!\`; // "Hello, <mark>Rex</mark>!"
\`\`\`

The tag function (\`highlight\` here) receives the literal's static string parts as its first argument (an array) and every interpolated value as the remaining arguments — it has full control over how they're combined, which is exactly how libraries like styled-components (CSS-in-JS) and \`gql\` (GraphQL query parsing) are built.

### Classic interview gotcha

The \`strings\` array a tag function receives always has exactly one more element than the \`values\` — there's a static string segment *before* the first interpolation and *after* the last one, even if those segments are empty strings. Candidates writing a tag function for the first time often assume \`strings\` and \`values\` are the same length and get an off-by-one error zipping them together.

\`\`\`js
function tag(strings, ...values) {
  console.log(strings.length, values.length); // e.g. 3 and 2, not 2 and 2
}
tag\`a\${1}b\${2}c\`;
\`\`\`

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    companies: ["Stripe", "Shopify"],
    orderIndex: 29,
  },
  {
    collection: "ff-javascript",
    slug: "spread-and-rest-operator",
    question: "What is the spread and rest operator?",
    answer: `Both use the same \`...\` syntax but mean opposite things depending on where they appear: spread *expands* an iterable or object into individual elements/properties; rest *collects* multiple individual elements/arguments back into a single array.

### Spread — expanding

\`\`\`js
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4] — expands arr1's elements in place

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 } — expands obj1's properties

function sum(a, b, c) {
  return a + b + c;
}
sum(...[1, 2, 3]); // 6 — array elements spread as individual arguments
\`\`\`

### Rest — collecting

\`\`\`js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0); // numbers is a real array
}
sum(1, 2, 3, 4); // 10 — any number of arguments collected into one array

const [first, ...others] = [1, 2, 3];
others; // [2, 3]

const { id, ...rest } = { id: 1, name: "Rex", age: 3 };
rest; // { name: "Rex", age: 3 } — everything except id
\`\`\`

### Classic interview gotcha

A rest parameter must be the **last** parameter in a function signature — \`function f(...rest, last) {}\` is a \`SyntaxError\`, not just bad style, because there'd be no unambiguous way to know where the collected portion ends. The same restriction applies to a rest element in destructuring: \`const [...init, last] = arr\` is also invalid.

**Related:** [Array & Object Methods, Immutability](/learn/javascript-runtime/array-object-methods-immutability) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 30,
  },
  {
    collection: "ff-javascript",
    slug: "optional-chaining-and-nullish-coalescing",
    question: "What is optional chaining (`?.`) and nullish coalescing (`??`)?",
    answer: `Optional chaining (\`?.\`) short-circuits to \`undefined\` instead of throwing when you access a property on \`null\`/\`undefined\`; nullish coalescing (\`??\`) provides a fallback value, but only when the left side is specifically \`null\` or \`undefined\` — not for other falsy values like \`0\`, \`""\`, or \`false\`.

### Optional chaining

\`\`\`js
const user = { profile: null };
user.profile.bio;   // TypeError — profile is null, can't read .bio off it
user.profile?.bio;  // undefined — short-circuits safely instead of throwing

user.getAvatar?.();       // calls it only if getAvatar exists, else undefined
user.tags?.[0];            // safe array-index access too
\`\`\`

### Nullish coalescing

\`\`\`js
const count = 0;
count || 10;  // 10 — WRONG if 0 is a legitimate value, || treats 0 as falsy
count ?? 10;  // 0 — RIGHT, ?? only falls back on null/undefined, not on 0
\`\`\`

### Classic interview gotcha

This is the single most common real bug the pair fixes: \`config.retries || 3\` silently replaces a deliberately-set \`0\` (meaning "no retries") with \`3\`, because \`0\` is falsy. \`config.retries ?? 3\` gets it right — \`0\` is a valid, present value and is left alone; only an actually-missing (\`null\`/\`undefined\`) \`retries\` falls back to \`3\`. The same trap applies to \`""\` and \`false\` as legitimate values with \`||\`.

\`\`\`js
function greet(name) {
  return \`Hi, \${name ?? "stranger"}\`;
}
greet("");  // "Hi, " — an empty string is a real, deliberate value here
greet();    // "Hi, stranger" — actually missing
\`\`\`

**Related:** [Equality & Type Coercion](/learn/javascript-runtime/equality-type-coercion) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Stripe"],
    isFf75: true,
    orderIndex: 31,
  },
  {
    collection: "ff-javascript",
    slug: "map-vs-object",
    question: "Explain `Map` vs `Object` in JavaScript.",
    answer: `Both store key-value pairs, but \`Map\` allows *any* value as a key (objects, functions, even \`NaN\`) and preserves insertion order reliably, while a plain \`Object\`'s keys are always coerced to strings (or symbols) and its ordering guarantees are more subtle, especially for numeric-looking keys.

### The practical differences

| | \`Object\` | \`Map\` |
|---|---|---|
| Key types | Strings and symbols only (others coerced to strings) | Any value, including objects and functions |
| Key order | Integer-like keys first (numeric order), then strings in insertion order | Always insertion order, no exceptions |
| Size | Manual (\`Object.keys(obj).length\`) | Built-in \`.size\` |
| Iteration | \`Object.keys\`/\`values\`/\`entries\`, not directly iterable | Directly iterable with \`for...of\` |
| Performance for frequent add/remove | Slower at scale | Optimized for this |
| Has "accidental" prototype keys? | Yes — \`"toString"\` as a key can collide with inherited \`Object.prototype\` methods | No — a \`Map\` has no such collision risk |

\`\`\`js
const map = new Map();
const objKey = { id: 1 };
map.set(objKey, "metadata"); // an object as a key — impossible with a plain Object
map.get(objKey); // "metadata"

const obj = { 2: "b", 1: "a", "x": "c" };
Object.keys(obj); // ["1", "2", "x"] — numeric keys reordered first, "2" as a string key
\`\`\`

### Classic interview gotcha

Because \`Object\` keys are coerced to strings, \`obj[1]\` and \`obj["1"]\` are the exact same key — a common source of subtle bugs when mixing numeric and string keys on the same object. \`Map\` has no such coercion: \`map.get(1)\` and \`map.get("1")\` are genuinely different entries.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    companies: ["Amazon", "Bloomberg"],
    orderIndex: 32,
  },
  {
    collection: "ff-javascript",
    slug: "set-vs-array",
    question: "What is `Set` and how is it different from `Array`?",
    answer: `A \`Set\` is a collection that stores only unique values — adding a duplicate is silently a no-op — while an \`Array\` allows duplicates and preserves every element regardless of repetition.

\`\`\`js
const set = new Set([1, 2, 2, 3, 3, 3]);
set.size; // 3 — duplicates collapsed automatically
[...set]; // [1, 2, 3] — spread converts it back to an array

const arr = [1, 2, 2, 3, 3, 3];
arr.length; // 6 — every element kept
\`\`\`

### Why reach for a \`Set\`

Deduplicating an array is the most common use: \`[...new Set(arr)]\` is the standard one-line idiom. \`Set\` also has \`O(1)\` \`.has()\` lookups (versus \`Array.includes\`'s \`O(n)\` scan), which matters for repeatedly checking membership in a large collection.

### Classic interview gotcha

\`Set\` deduplicates using **SameValueZero** equality — essentially \`===\`, with the one exception that \`NaN\` is treated as equal to itself. That means two structurally-identical *objects* are never considered duplicates, only reference-identical ones:

\`\`\`js
const s = new Set([{ id: 1 }, { id: 1 }]);
s.size; // 2 — two different object references, even though they look identical

const nanSet = new Set([NaN, NaN]);
nanSet.size; // 1 — NaN is the one special case where Set treats it as equal to itself
\`\`\`

Deduplicating an array of objects by *value* (e.g. by \`id\`) needs a \`Map\` keyed on that value, not a plain \`Set\`.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "easy",
    companies: ["Google", "Amazon"],
    orderIndex: 33,
  },
  {
    collection: "ff-javascript",
    slug: "proxy-object-in-javascript",
    question: "What is the `Proxy` object in JavaScript?",
    answer: `A \`Proxy\` wraps a target object and lets you intercept fundamental operations on it — getting a property, setting one, checking \`in\`, deleting a key — by supplying "trap" functions that run instead of (or alongside) the default behavior.

### A basic example

\`\`\`js
const user = { name: "Rex" };

const logged = new Proxy(user, {
  get(target, prop) {
    console.log(\`reading "\${prop}"\`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(\`setting "\${prop}" to\`, value);
    target[prop] = value;
    return true; // must return true, or the assignment fails silently (non-strict) / throws a TypeError (strict mode)
  },
});

logged.name;          // logs "reading \\"name\\"", returns "Rex"
logged.age = 3;        // logs "setting \\"age\\" to 3"
\`\`\`

### Real use cases

- **Validation** — a \`set\` trap that rejects invalid values before they're written
- **Reactive state** — Vue 3's reactivity system is built on \`Proxy\` (intercepting property reads to track dependencies, and writes to trigger re-renders)
- **Default values / negative array indexing** — a \`get\` trap that computes a fallback instead of returning \`undefined\`
- **Logging/debugging** — transparently tracing every read/write without touching the original object's code

### Classic interview gotcha

A \`set\` trap that doesn't return \`true\` doesn't throw immediately in non-strict mode — the assignment silently appears to succeed while the trap actually rejected it, which can hide real bugs. In strict mode (the default in ES modules and classes), a falsy return from \`set\` throws a \`TypeError\` right away — worth calling out that the behavior differs by mode.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Vercel"],
    isFf75: true,
    orderIndex: 34,
  },
  {
    collection: "ff-javascript",
    slug: "how-garbage-collection-works",
    question: "How does JavaScript's garbage collection work?",
    answer: `JavaScript automatically reclaims memory for objects that are no longer *reachable* from anywhere the program can still access — you never manually free memory; the engine's garbage collector periodically finds and removes objects nothing references anymore.

### Reachability, the core idea

\`\`\`js
let user = { name: "Rex" }; // reachable — "user" points to it
user = null;                 // the object is now unreachable — eligible for GC
\`\`\`

Modern engines (V8, used by Chrome and Node) mainly use a **mark-and-sweep** algorithm: starting from "roots" (global variables, currently-executing functions' local variables), the collector marks every object it can reach, then sweeps away everything left unmarked. Reference counting (the older, simpler model) isn't what modern JS engines actually use, because it can't handle circular references — two objects referencing each other but unreachable from anywhere else would never get collected under pure reference counting; mark-and-sweep handles this correctly since neither is reachable from a root.

### What actually causes leaks in practice

JavaScript can't leak memory from truly unreachable objects — leaks happen when something *keeps a reference alive* longer than intended:

- **Forgotten event listeners** — a removed DOM node whose listener reference is still held elsewhere
- **Stray closures** — a closure capturing a large object it doesn't actually need, keeping it alive for the closure's whole lifetime
- **Growing caches with no eviction** — a \`Map\` or plain object used as a cache that never removes old entries
- **Detached DOM nodes** — a node removed from the document but still referenced by a JS variable, keeping the whole subtree alive

### Classic interview gotcha

\`setInterval\` callbacks (and their closures) stay alive for as long as the interval keeps running — a very common leak pattern is a component that starts an interval capturing \`this\`/component state in its closure, then unmounts without ever calling \`clearInterval\`. The interval (and everything its closure references) lives on indefinitely, invisible until memory profiling reveals it.

**Related:** [Memory Management & Leaks](/learn/javascript-runtime/memory-management-leaks) (Learn concept) · [What is a \`WeakMap\` and \`WeakSet\`? When would you use them?](/interview-prep/ff-javascript/weakmap-and-weakset)`,
    difficulty: "hard",
    companies: ["Google", "Meta", "Netflix"],
    orderIndex: 35,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-an-iife",
    question: "What is an IIFE and when would you use it?",
    answer: `An IIFE (Immediately Invoked Function Expression) is a function that's defined and called in the same statement — it runs exactly once, immediately, and creates its own scope that nothing outside can reach.

\`\`\`js
(function () {
  const secret = "hidden from outside";
  console.log("runs immediately");
})();

// Also common: arrow function form
(() => {
  console.log("runs immediately too");
})();
\`\`\`

### What it's for

Before \`let\`/\`const\` and ES modules existed, every top-level \`var\` polluted the global scope and any script on the page could collide with it. Wrapping a whole script in an IIFE gave it a private, one-time scope — the original way to avoid global namespace pollution, and still occasionally used today for a self-contained script or a one-off setup block that shouldn't leak variables into its surroundings.

\`\`\`js
const counter = (function () {
  let count = 0; // private — completely inaccessible from outside
  return {
    increment: () => ++count,
    get: () => count,
  };
})();

counter.increment();
counter.get(); // 1 — "count" itself was never exposed, only these two methods
\`\`\`

This "module pattern" — an IIFE returning an object of methods that close over private state — was the standard way to fake modules and private variables before ES modules and closures-as-classes existed, and it's a direct, practical application of closures (see the closures question).

### Classic interview gotcha

\`function () {}()\` on its own is a \`SyntaxError\` — the parser sees \`function\` at the start of a statement and expects a function *declaration*, which requires a name. Wrapping it in parens (\`(function () {})()\`) tells the parser to treat it as an expression instead. A related, classic ASI (automatic semicolon insertion) trap: if the *previous* statement has no trailing semicolon, an IIFE on the next line can get parsed as a function *call* on the previous line's result instead of its own independent statement — a real, hard-to-spot bug in un-semicolon'd code.

**Related:** [What are closures and how do they work?](/interview-prep/ff-javascript/what-are-closures) · [Explain the concept of scope (global, function, block).](/interview-prep/ff-javascript/javascript-scope-explained)`,
    difficulty: "medium",
    companies: ["Amazon", "Adobe"],
    orderIndex: 36,
  },
  {
    collection: "ff-javascript",
    slug: "synchronous-vs-asynchronous-code",
    question: "What is the difference between synchronous and asynchronous code?",
    answer: `Synchronous code runs top to bottom, one line at a time, and each line blocks — it must finish before the next one starts; asynchronous code lets a slow operation (a network call, a timer) run in the background without blocking the rest of the program, resuming via a callback, Promise, or \`await\` once it's done.

\`\`\`js
// Synchronous — each line waits for the previous one
console.log("1");
console.log("2"); // only runs after "1" has fully finished logging
console.log("3");

// Asynchronous — the program doesn't wait for the timer
console.log("1");
setTimeout(() => console.log("2"), 1000); // scheduled, doesn't block
console.log("3");
// Output: 1, 3, 2 — "3" runs before the delayed "2"
\`\`\`

### Why asynchronous code exists at all

JavaScript is single-threaded — if a slow operation blocked the thread synchronously, the entire page (or server) would freeze until it finished: no scrolling, no clicks, no other requests handled. Asynchronous APIs let slow work happen without freezing everything else, which is essential for anything that touches the network, disk, or a timer.

### Classic interview gotcha

Beginners often assume code "runs in the order it's written" applies universally — but any asynchronous call reorders when its *continuation* actually executes, even though the call itself is written earlier in the file. The \`setTimeout\` example above is the simplest possible version of this: \`console.log("3")\` is written *after* the \`setTimeout\` call, but it logs *before* "2" does, because "3" is synchronous and "2" had to wait for both the timer and the event loop.

**Related:** [How does JavaScript handle asynchronous operations?](/interview-prep/ff-javascript/how-javascript-handles-async) · [What is the event loop in JavaScript?](/interview-prep/ff-javascript/what-is-the-event-loop)`,
    difficulty: "easy",
    companies: ["Meta", "Amazon"],
    orderIndex: 37,
  },
  {
    collection: "ff-javascript",
    slug: "coercion-in-javascript",
    question: "Explain the concept of coercion in JavaScript.",
    answer: `Coercion is JavaScript automatically converting a value from one type to another when an operator or context expects a different type — it happens implicitly (the engine does it for you, often surprisingly) or explicitly (you convert on purpose, e.g. \`Number("42")\`).

### Implicit coercion, where it bites

\`\`\`js
"5" + 3;   // "53" — + sees a string, coerces 3 to a string, concatenates
"5" - 3;   // 2 — - only makes sense for numbers, coerces "5" to a number
"5" * "2"; // 10 — * and / always coerce both sides to numbers

true + true; // 2 — booleans coerce to 1/0 in numeric context

[] + [];   // "" — arrays coerce to strings ("" for empty arrays) for +
[] + {};   // "[object Object]" — same mechanism, less intuitive result
\`\`\`

\`+\` is the one operator that's genuinely ambiguous — it means addition *or* string concatenation depending on the operand types, which is exactly why it produces the most surprising coercion results.

### The two coercion paths objects go through

When an object needs to become a primitive (for \`+\`, \`==\`, template literals, etc.), the engine calls \`valueOf()\` first, then falls back to \`toString()\` if \`valueOf()\` doesn't return a primitive. This is why \`[] + []\` becomes \`""\` — arrays have no meaningful \`valueOf\`, so \`toString()\` runs, and an empty array's \`toString()\` is \`""\`.

### Classic interview gotcha

\`==\` performs exactly this kind of coercion before comparing (see the \`==\` vs \`===\` question), which is the root cause of results like \`[] == false\` being \`true\` (\`[]\` coerces to \`""\`, then to \`0\`; \`false\` coerces to \`0\`; \`0 == 0\`). Interviewers use this specific chain to test whether a candidate actually understands coercion mechanics or just knows to avoid \`==\` without knowing why.

**Related:** [Equality & Type Coercion](/learn/javascript-runtime/equality-type-coercion) (Learn concept) · [What is the difference between \`==\` and \`===\`?](/interview-prep/ff-javascript/double-equals-vs-triple-equals)`,
    difficulty: "medium",
    companies: ["Google", "Bloomberg"],
    orderIndex: 38,
  },
  {
    collection: "ff-javascript",
    slug: "commonjs-vs-es-modules",
    question: "What is the module system in JavaScript (CommonJS vs ES Modules)?",
    answer: `CommonJS (\`require\`/\`module.exports\`) is Node.js's original, synchronous module system; ES Modules (\`import\`/\`export\`) is the language-standard system built into JavaScript itself, statically analyzed and usable in both browsers and modern Node.

### Side by side

\`\`\`js
// CommonJS
const { readFile } = require("fs");
module.exports = { greet };
function greet() { return "hi"; }

// ES Modules
import { readFile } from "fs";
export function greet() { return "hi"; }
export default greet;
\`\`\`

| | CommonJS | ES Modules |
|---|---|---|
| Loading | Synchronous, runs at the \`require()\` call site | Static, resolved before any code runs |
| Can be conditional? | Yes — \`require()\` can be called inside an \`if\` | No — \`import\` must be top-level (dynamic \`import()\` exists for the conditional case) |
| Tree-shakeable? | No — exports aren't statically analyzable | Yes — a bundler can see exactly what's imported |
| Native browser support | No | Yes, via \`<script type="module">\` |
| \`this\` at module top level | \`module.exports\` object | \`undefined\` |

### Why ESM's static structure matters

Because \`import\`/\`export\` statements must be at the top level and use fixed names (not computed dynamically), a bundler can determine the entire dependency graph *before running any code* — which is exactly what makes tree shaking possible (see the tree shaking question). CommonJS's \`require()\` being a plain function call, callable anywhere with a dynamic string, makes that same static analysis impossible.

### Classic interview gotcha

Interop between the two systems is a real, common pain point: a CommonJS module's \`module.exports = fn\` becomes that CommonJS module's *default* export when imported from ESM (\`import fn from "./commonjs-file.js"\`), not a named export — mixing the two in the same project (very common in real Node codebases mid-migration) causes genuinely confusing "not a function" or "undefined" errors when someone imports it the wrong way.

**Related:** [Modules: ESM vs. CommonJS](/learn/javascript-runtime/esm-vs-commonjs) (Learn concept) · [What is tree shaking?](/interview-prep/ff-javascript/what-is-tree-shaking)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Vercel"],
    isFf75: true,
    orderIndex: 39,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-tree-shaking",
    question: "What is tree shaking?",
    answer: `Tree shaking is a build-time optimization where a bundler removes exported code that nothing in the project actually imports — the final bundle only contains the code that's genuinely reachable from your entry point, not the entire library you installed.

### Why it depends on ES Modules

\`\`\`js
// utils.js
export function used() { return "kept"; }
export function unused() { return "removed by tree shaking"; }

// app.js
import { used } from "./utils.js"; // only "used" is imported
used();
\`\`\`

A bundler (Webpack, Rollup, the one built into Next.js) can see \`unused\` is never imported anywhere and drops it from the final bundle entirely. This relies on ESM's *static* \`import\`/\`export\` structure (see the CommonJS vs ESM question) — the bundler needs to determine, without running any code, exactly what's used and what isn't.

### What defeats it

\`\`\`js
// Re-exporting everything defeats analysis in many bundler configs
export * from "./utils.js";

// A module with side effects at the top level can't be safely dropped
console.log("this runs on import"); // the bundler can't know this is safe to skip
export function used() {}
\`\`\`

A library's \`package.json\` can mark itself \`"sideEffects": false\` to tell bundlers it's safe to drop unused exports even without perfectly analyzing every line — without that flag, a bundler has to be conservative and may keep more than necessary.

### Classic interview gotcha

Importing an entire library as a namespace (\`import * as _ from "lodash"\`) or a CommonJS-style default (\`import _ from "lodash"\`) then using only \`_.debounce\` often pulls in the **entire library**, because the bundler can't statically prove which parts are unused through that pattern — the fix is importing the specific function directly (\`import debounce from "lodash/debounce"\` or, better, \`lodash-es\`'s named exports), which is exactly why "import only what you use, by name" is standard advice for bundle-size-conscious codebases.

**Related:** [Modules: ESM vs. CommonJS](/learn/javascript-runtime/esm-vs-commonjs) (Learn concept) · [What is the module system in JavaScript (CommonJS vs ES Modules)?](/interview-prep/ff-javascript/commonjs-vs-es-modules)`,
    difficulty: "medium",
    companies: ["Vercel", "Shopify"],
    orderIndex: 40,
  },
  {
    collection: "ff-javascript",
    slug: "array-map-filter-reduce-differences",
    question: "Explain the difference between `Array.map`, `Array.filter`, and `Array.reduce`.",
    answer: `\`.map()\` transforms every element into a new array of the same length; \`.filter()\` keeps only the elements that pass a test, producing a shorter (or equal-length) array; \`.reduce()\` folds the whole array down into a single accumulated value — related operations, but structurally different in what they return.

### Side by side

\`\`\`js
const numbers = [1, 2, 3, 4, 5];

numbers.map((n) => n * 2);              // [2, 4, 6, 8, 10] — same length, transformed
numbers.filter((n) => n % 2 === 0);     // [2, 4] — shorter, only matches kept
numbers.reduce((sum, n) => sum + n, 0); // 15 — collapsed to one value
\`\`\`

| | Returns | Length of result |
|---|---|---|
| \`.map()\` | A new array | Always the same as the original |
| \`.filter()\` | A new array | 0 to the original length |
| \`.reduce()\` | Any single value (number, object, array, ...) | N/A — one value |

### \`.reduce()\` can build anything, not just a sum

\`\`\`js
const words = ["a", "bb", "ccc"];
const byLength = words.reduce((acc, word) => {
  acc[word.length] = word;
  return acc;
}, {});
// { 1: "a", 2: "bb", 3: "ccc" } — reduce can build an object, array, Map, anything
\`\`\`

Since \`.map()\` and \`.filter()\` are really just special cases of "fold," any \`.map()\`/\`.filter()\` chain can be rewritten as a single \`.reduce()\` — usually not clearer, but it's why \`.reduce()\` is the most general of the three.

### Classic interview gotcha

\`.reduce()\` called on an empty array **without** an initial value throws a \`TypeError\` — with no initial value, it uses the array's first element as the starting accumulator and starts iterating from index 1, so an empty array leaves nothing to use as a seed:

\`\`\`js
[].reduce((sum, n) => sum + n);        // TypeError: Reduce of empty array with no initial value
[].reduce((sum, n) => sum + n, 0);     // 0 — fine, the initial value covers the empty case
\`\`\`

Always pass an explicit initial value unless you're certain the array can never be empty.

**Related:** [Array & Object Methods, Immutability](/learn/javascript-runtime/array-object-methods-immutability) (Learn concept) · [What is \`Array.flat()\` and \`Array.flatMap()\`?](/interview-prep/ff-javascript/array-flat-and-flatmap)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Amazon"],
    isFf75: true,
    orderIndex: 41,
  },
  {
    collection: "ff-javascript",
    slug: "array-flat-and-flatmap",
    question: "What is `Array.flat()` and `Array.flatMap()`?",
    answer: `\`.flat(depth)\` flattens nested arrays up to \`depth\` levels deep (default \`1\`) into a single array; \`.flatMap()\` runs \`.map()\` and then flattens the result by exactly one level, in a single, slightly more efficient pass.

### \`.flat()\`

\`\`\`js
const nested = [1, [2, 3], [4, [5, 6]]];
nested.flat();          // [1, 2, 3, 4, [5, 6]] — only one level deep by default
nested.flat(2);         // [1, 2, 3, 4, 5, 6] — two levels deep
nested.flat(Infinity);  // [1, 2, 3, 4, 5, 6] — fully flattened, any depth
\`\`\`

### \`.flatMap()\`

\`\`\`js
const sentences = ["hello world", "how are you"];
sentences.map((s) => s.split(" "));
// [["hello", "world"], ["how", "are", "you"]] — nested, probably not what you wanted

sentences.flatMap((s) => s.split(" "));
// ["hello", "world", "how", "are", "you"] — flattened one level automatically
\`\`\`

\`.flatMap()\` is especially useful when a callback needs to expand one input element into zero, one, or many output elements — return \`[]\` to drop an element, return \`[x]\` to keep one, or return \`[x, y]\` to expand it, all within a single \`.map()\`-shaped call instead of a separate \`.filter()\`+\`.map()\` pass.

### Classic interview gotcha

\`.flat()\` with no argument only flattens **one level**, not fully — a common assumption is that \`.flat()\` recursively flattens everything, but \`[1, [2, [3, [4]]]].flat()\` is still \`[1, 2, [3, [4]]]\`, with nesting left untouched two levels down. \`.flatMap()\` has the exact same one-level-only limit — it never recursively flattens no matter how deeply the mapped result is nested.

**Related:** [What is the difference between \`Array.map\`, \`Array.filter\`, and \`Array.reduce\`?](/interview-prep/ff-javascript/array-map-filter-reduce-differences) · [Array & Object Methods, Immutability](/learn/javascript-runtime/array-object-methods-immutability) (Learn concept)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 42,
  },
  {
    collection: "ff-javascript",
    slug: "object-freeze-vs-const",
    question: "How does `Object.freeze()` differ from `const`?",
    answer: `\`const\` only prevents reassigning the *binding* — the variable name can never be pointed at a different value — while \`Object.freeze()\` prevents mutating the *object itself*, at its top level, regardless of what variable (or how many variables) point to it.

### They solve completely different problems

\`\`\`js
const user = { name: "Rex" };
user.name = "Max";   // fine — const doesn't stop this, only the object itself would need to
user = {};            // TypeError — const blocks reassigning the binding

const frozen = Object.freeze({ name: "Rex" });
frozen.name = "Max";  // silently does nothing (throws in strict mode)
frozen = {};           // still a TypeError — freeze does nothing to the const binding itself
\`\`\`

Using \`const\` for an object gives you zero protection against mutation — \`Object.freeze()\` is the actual tool for that, and the two are frequently combined (\`const frozen = Object.freeze({...})\`) because they protect two different things.

| | Protects the binding from reassignment | Protects the object from mutation |
|---|---|---|
| \`const\` | Yes | No |
| \`Object.freeze()\` | No | Yes (shallow only) |
| Both together | Yes | Yes (shallow only) |

### Classic interview gotcha

\`Object.freeze()\` is **shallow** — freezing an object only locks its own top-level properties; any nested object inside it is completely unaffected and remains fully mutable:

\`\`\`js
const frozen = Object.freeze({ name: "Rex", address: { city: "NYC" } });
frozen.name = "Max";           // blocked, as expected
frozen.address.city = "LA";    // succeeds! address itself was never frozen
console.log(frozen.address.city); // "LA"
\`\`\`

A true deep freeze needs a recursive helper that calls \`Object.freeze()\` on every nested object — plain \`Object.freeze()\` alone doesn't provide it.

**Related:** [What is the difference between \`var\`, \`let\`, and \`const\`?](/interview-prep/ff-javascript/var-let-const-differences)`,
    difficulty: "medium",
    companies: ["Google", "Stripe"],
    orderIndex: 43,
  },
  {
    collection: "ff-javascript",
    slug: "object-keys-values-entries",
    question: "What is the difference between `Object.keys`, `Object.values`, and `Object.entries`?",
    answer: `\`Object.keys()\` returns an array of an object's own enumerable property names; \`Object.values()\` returns the corresponding values in the same order; \`Object.entries()\` returns \`[key, value]\` pairs — all three look at *own* enumerable properties only, ignoring anything inherited from the prototype chain.

\`\`\`js
const user = { name: "Rex", age: 3 };

Object.keys(user);    // ["name", "age"]
Object.values(user);  // ["Rex", 3]
Object.entries(user); // [["name", "Rex"], ["age", 3]]

for (const [key, value] of Object.entries(user)) {
  console.log(\`\${key}: \${value}\`);
}
\`\`\`

\`Object.entries()\` combined with \`for...of\` destructuring is the standard modern way to loop over an object's key-value pairs directly, without a separate lookup step for each key.

### Classic interview gotcha

All three only include an object's **own enumerable** properties — non-enumerable properties (most built-in methods, or anything defined via \`Object.defineProperty\` with \`enumerable: false\`) are silently skipped, and so are inherited properties from the prototype chain. This surprises people who expect \`Object.keys()\` to behave like \`for...in\`, which *does* walk up and include inherited enumerable properties too (see the \`for...in\` vs \`for...of\` question) — \`Object.keys()\` was actually designed specifically to avoid that inheritance leakage.

**Related:** [What is the difference between \`for...in\` and \`for...of\`?](/interview-prep/ff-javascript/for-in-vs-for-of) · [Explain \`Map\` vs \`Object\` in JavaScript.](/interview-prep/ff-javascript/map-vs-object)`,
    difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 44,
  },
  {
    collection: "ff-javascript",
    slug: "proxy-and-reflect",
    question: "What is `Proxy` and `Reflect` in JavaScript?",
    answer: `\`Proxy\` wraps an object to intercept fundamental operations (reading a property, setting one, deleting one) via trap handler functions; \`Reflect\` is a built-in object whose methods mirror those exact same fundamental operations as plain functions — the two are designed to be used together, since a trap's *default* behavior is precisely what the matching \`Reflect\` method does.

### Why traps call the matching \`Reflect\` method

\`\`\`js
const user = { name: "Rex" };

const logged = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(\`reading "\${prop}"\`);
    return Reflect.get(target, prop, receiver); // same as target[prop], but preserves "receiver"
  },
});

logged.name; // logs "reading \\"name\\"", returns "Rex"
\`\`\`

You *could* write \`return target[prop]\` instead of \`Reflect.get(...)\` for a simple case like this — they behave the same here. \`Reflect\` becomes necessary once inheritance or getters are involved, because it's the only way to correctly forward the original \`receiver\` (see the gotcha below).

### Before \`Reflect\` existed

Prior to \`Reflect\`, code had to use awkward equivalents like \`prop in target\` for a \`has\` trap or \`delete target[prop]\` for a \`deleteProperty\` trap — \`Reflect\` gives every one of these a consistent, function-call form (\`Reflect.has()\`, \`Reflect.deleteProperty()\`) that always returns a value instead of relying on operators with inconsistent behaviors.

### Classic interview gotcha

Forgetting to pass \`receiver\` through to \`Reflect.get\`/\`Reflect.set\` breaks correctness the moment inheritance is involved — if a getter on the proxied object uses \`this\`, that \`this\` needs to be the *proxy* (the receiver), not the raw target, or accessing an inherited property through a subclass of the proxied object silently uses the wrong \`this\` and can return stale or incorrect values. Always forward \`receiver\` explicitly rather than dropping it.

**Related:** [What is the \`Proxy\` object in JavaScript?](/interview-prep/ff-javascript/proxy-object-in-javascript)`,
    difficulty: "hard",
    companies: ["Meta", "Vercel"],
    orderIndex: 45,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-function-composition",
    question: "What is function composition?",
    answer: `Function composition means combining several small, single-purpose functions into one, where each function's output feeds directly into the next function's input — mathematically, \`compose(f, g)(x)\` is the same as \`f(g(x))\`.

### A generic \`compose\` and \`pipe\`

\`\`\`js
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const double = (n) => n * 2;
const addOne = (n) => n + 1;

compose(double, addOne)(5); // double(addOne(5)) = double(6) = 12 — right to left
pipe(double, addOne)(5);    // addOne(double(5)) = addOne(10) = 11 — left to right
\`\`\`

Both \`compose\` and \`pipe\` do the exact same mechanical thing — chain function calls — they just process the function list in opposite order.

### Why this matters beyond a syntax trick

Composition is how small, independently testable functions (each doing one thing) get combined into a larger pipeline without any intermediate variables cluttering the code — it's the same idea behind Redux middleware chains, Express/Koa middleware, and RxJS operator pipelines, just applied at the level of plain functions.

### Classic interview gotcha

\`compose\` (right-to-left, matching mathematical function notation) and \`pipe\` (left-to-right, reading like a pipeline top-to-bottom) are the *same* mechanism with the argument order simply reversed — mixing the two up doesn't throw an error, it silently reverses the execution order of your functions, which can produce a working-looking but logically wrong result that's easy to miss in review.

**Related:** [Function Composition & Currying](/learn/javascript-runtime/function-composition-currying) (Learn concept) · [What is currying in JavaScript?](/interview-prep/ff-javascript/what-is-currying)`,
    difficulty: "hard",
    companies: ["Meta", "Stripe"],
    orderIndex: 46,
  },
  {
    collection: "ff-javascript",
    slug: "event-bubbling-and-capturing",
    question: "What is event bubbling and capturing?",
    answer: `Event bubbling means an event fires on the target element first, then propagates *upward* through each ancestor in turn; capturing is the opposite phase, where the event travels *downward* from the document root to the target before bubbling even starts. By default, listeners run during the bubbling phase unless you explicitly opt into the capture phase.

### The three phases, in order

\`\`\`js
document.querySelector(".outer").addEventListener("click", () => console.log("outer capture"), { capture: true });
document.querySelector(".inner").addEventListener("click", () => console.log("inner target"));
document.querySelector(".outer").addEventListener("click", () => console.log("outer bubble"));

// Clicking .inner logs, in this exact order:
// "outer capture" -> "inner target" -> "outer bubble"
\`\`\`

| Phase | Direction | Default for \`addEventListener\`? |
|---|---|---|
| Capture | Document root down to the target | No — must opt in with \`{ capture: true }\` |
| Target | The element that was actually interacted with | N/A |
| Bubble | Target back up to the document root | Yes — the default |

### Classic interview gotcha

Passing \`true\` as \`addEventListener\`'s third argument (instead of an options object) is easy to introduce by accident, especially when adapting older code — \`addEventListener('click', fn, true)\` predates the \`{ capture: true }\` object form and means the exact same thing, silently making that listener run during the capture phase instead of bubbling. This quietly changes execution order relative to any other listeners on the page, without any error or warning to flag it.

**Related:** [Event Delegation, Bubbling & Capturing](/learn/browser-internals/event-delegation-bubbling-capturing) (Learn concept) · [What is event delegation and why is it useful?](/interview-prep/ff-javascript/what-is-event-delegation)`,
    difficulty: "medium",
    companies: ["Amazon", "Uber"],
    orderIndex: 47,
  },
  {
    collection: "ff-javascript",
    slug: "stoppropagation-vs-preventdefault",
    question: "What is `stopPropagation` vs `preventDefault`?",
    answer: `\`event.preventDefault()\` cancels the browser's default action for that event (a link navigating, a form submitting, a checkbox toggling) but the event still keeps bubbling to ancestor elements; \`event.stopPropagation()\` stops the event from bubbling any further but has no effect on the browser's default behavior — they solve two entirely separate problems and are frequently confused for each other.

\`\`\`js
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stops the page from navigating/reloading
  submitViaFetch(form);   // event still bubbles to any parent listeners
});

link.addEventListener("click", (event) => {
  event.stopPropagation(); // parent listeners never see this click
  // but the browser will still navigate — preventDefault wasn't called
});
\`\`\`

Using one when you meant the other is a real, common bug: calling only \`stopPropagation()\` on a form submit still lets the page reload; calling only \`preventDefault()\` on a delegated click handler still lets the click bubble up and potentially trigger an unrelated parent handler.

### Classic interview gotcha

\`stopPropagation()\` does **not** stop other listeners attached to the *same* element from running — it only prevents the event from reaching listeners on ancestor elements. \`stopImmediatePropagation()\` is the one that additionally prevents any remaining listeners on that same element from firing too — a distinction most people only learn about after hitting a bug where a second listener on the same element unexpectedly still ran.

**Related:** [What is event bubbling and capturing?](/interview-prep/ff-javascript/event-bubbling-and-capturing)`,
    difficulty: "medium",
    companies: ["Google", "Adobe"],
    orderIndex: 48,
  },
  {
    collection: "ff-javascript",
    slug: "what-are-web-workers",
    question: "What are Web Workers?",
    answer: `A Web Worker runs JavaScript on a separate background thread, off the main UI thread — it can do CPU-heavy work (parsing, image processing, complex calculations) without blocking scrolling, clicks, or rendering, but it has no access to the DOM and can only communicate with the main thread via message passing.

\`\`\`js
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ numbers: [1, 2, 3, 4, 5] });
worker.onmessage = (event) => console.log("result:", event.data);

// worker.js
self.onmessage = (event) => {
  const sum = event.data.numbers.reduce((a, b) => a + b, 0);
  self.postMessage(sum); // sent back to the main thread
};
\`\`\`

### What a worker can't do

No \`document\`, no \`window\`, no direct DOM access — a worker's entire job is running JavaScript logic in isolation and reporting results back. It does have access to things like \`fetch\`, timers, and its own scoped globals, just nothing UI-related.

### Classic interview gotcha

Data passed to and from a worker via \`postMessage\` is **cloned** (via the structured clone algorithm), not shared by reference — mutating an object on the main thread after posting it has zero effect on what the worker receives, since the worker already got its own independent copy. Functions, DOM nodes, and anything else that isn't structured-clone-able simply can't be sent at all, and attempting to do so throws. This trips up anyone who assumes \`postMessage\` gives shared-memory access the way a thread in most other languages would.

**Related:** [Web Workers & Concurrency](/learn/browser-internals/web-workers-concurrency) (Learn concept) · [What is Service Worker and how does it differ from Web Worker?](/interview-prep/ff-javascript/service-worker-vs-web-worker)`,
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 49,
  },
  {
    collection: "ff-javascript",
    slug: "service-worker-vs-web-worker",
    question: "What is Service Worker and how does it differ from Web Worker?",
    answer: `Both run JavaScript off the main thread, but their purposes are different: a Service Worker sits between your app and the network, intercepting fetch requests to enable offline support and caching, and it persists independently of any specific open tab; a Web Worker exists purely to offload computation for one page and is terminated when that page closes.

### Side by side

| | Web Worker | Service Worker |
|---|---|---|
| Purpose | Offload CPU-heavy computation | Intercept network requests, enable offline/caching |
| Lifetime | Tied to the page that created it | Persists independently, survives tab closure |
| Can intercept \`fetch\`? | No | Yes — this is its core feature |
| DOM access | No | No |
| Number per page | One worker per \`new Worker()\` call | One registration can control multiple tabs/pages |

\`\`\`js
// Registering a Service Worker
navigator.serviceWorker.register("/sw.js");

// Inside sw.js — intercepting network requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
\`\`\`

### Classic interview gotcha

A Service Worker does **not** take control of the page that registered it on the very first load — it installs and activates in the background, but the already-loaded page keeps using the network normally until the *next* navigation (a reload, or a fresh page load), unless the worker explicitly calls \`clients.claim()\` in its activate event. This is the single most common "why isn't my service worker doing anything" confusion when testing an install for the first time.

**Related:** [Service Workers & Caching Strategies](/learn/browser-internals/service-workers-caching-strategies) (Learn concept) · [What are Web Workers?](/interview-prep/ff-javascript/what-are-web-workers)`,
    difficulty: "hard",
    companies: ["Google", "Shopify"],
    orderIndex: 50,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-indexeddb",
    question: "What is IndexedDB?",
    answer: `IndexedDB is a browser-native, transactional, object-oriented database for storing significantly larger amounts of structured data client-side than \`localStorage\` allows, with asynchronous, non-blocking access and support for indexes to query records by fields other than a single key.

\`\`\`js
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("users", { keyPath: "id" });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").put({ id: 1, name: "Rex" });
};
\`\`\`

### Why reach for it over \`localStorage\`

\`localStorage\` is synchronous (blocks the main thread on every access), string-only, and typically capped around 5-10MB; IndexedDB is asynchronous, stores structured data (objects, arrays, \`Blob\`s) natively without manual serialization, supports indexes for efficient querying, and scales to a much larger storage quota — the standard choice for offline-first apps caching real datasets (product catalogs, message history) rather than a handful of key-value settings.

### Classic interview gotcha

IndexedDB's raw API is callback/event-based and notoriously verbose — real-world code almost always wraps it with a Promise-based library (like \`idb\`) rather than using the native API directly. Also, unlike \`localStorage\`, an IndexedDB transaction can genuinely fail or block if another tab has an open connection to the same database during a version upgrade — something synchronous \`localStorage\` code never has to account for, since it has no concept of transactions or versioning at all.

**Related:** [Storage APIs](/learn/browser-internals/storage-apis) (Learn concept) · [Explain \`localStorage\` vs \`sessionStorage\` vs cookies.](/interview-prep/ff-javascript/localstorage-vs-sessionstorage-vs-cookies)`,
    difficulty: "medium",
    companies: ["Amazon", "Uber"],
    orderIndex: 51,
  },
  {
    collection: "ff-javascript",
    slug: "localstorage-vs-sessionstorage-vs-cookies",
    question: "Explain `localStorage` vs `sessionStorage` vs cookies.",
    answer: `All three store small amounts of data client-side, but differ in lifetime and whether the server ever sees them: \`localStorage\` persists indefinitely until explicitly cleared and stays purely local to the browser; \`sessionStorage\` persists only for that one tab's lifetime, cleared when the tab closes; cookies persist per whatever expiry you set and are automatically attached to every matching HTTP request.

### Side by side

| | \`localStorage\` | \`sessionStorage\` | Cookies |
|---|---|---|---|
| Lifetime | Until explicitly cleared | Until the tab closes | Until expiry (or session, if unset) |
| Sent to the server automatically? | No | No | Yes — with every matching request |
| Typical capacity | ~5-10MB | ~5-10MB | ~4KB |
| Accessible to JavaScript? | Yes | Yes | Yes, unless marked \`HttpOnly\` |
| Shared across tabs? | Yes, same origin | No — isolated per tab | Yes, same origin |

\`\`\`js
localStorage.setItem("theme", "dark");     // survives closing the browser entirely
sessionStorage.setItem("draftId", "123");  // gone once this tab closes
document.cookie = "sessionId=abc; max-age=3600; Secure; SameSite=Strict";
\`\`\`

### Classic interview gotcha

Cookies are the only one of the three sent **automatically** with every HTTP request to a matching domain — this is exactly why an oversized cookie silently bloats every single request and response, and why auth tokens are often deliberately stored in a cookie (for that automatic inclusion, especially with \`HttpOnly\`) rather than \`localStorage\`, despite \`localStorage\`'s larger size limit and simpler API. It's also the reason XSS payloads specifically try to read \`localStorage\` (fully accessible to any JavaScript running on the page) — an \`HttpOnly\` cookie can't be read by JavaScript at all, which is a real, meaningful defense against token theft that \`localStorage\` simply doesn't have.

**Related:** [Storage APIs](/learn/browser-internals/storage-apis) (Learn concept) · [What is IndexedDB?](/interview-prep/ff-javascript/what-is-indexeddb) · [Explain XSS and CSRF attacks and prevention.](/interview-prep/ff-javascript/xss-and-csrf-explained)`,
    difficulty: "medium",
    companies: ["Meta", "Amazon"],
    orderIndex: 52,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-cors",
    question: "What is CORS and how do you handle it?",
    answer: `CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks a web page's JavaScript from reading responses from a different origin than the one the page was served from, unless the server explicitly opts in with response headers like \`Access-Control-Allow-Origin\`.

\`\`\`js
// Called from https://myapp.com, targeting https://api.example.com
fetch("https://api.example.com/data"); // blocked by the browser unless the server allows it
\`\`\`

\`\`\`js
// The server (a different origin) opts in with response headers, e.g. in Express:
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://myapp.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  next();
});
\`\`\`

### Simple requests vs. preflighted requests

A "simple" request (a plain \`GET\`, or a \`POST\` with a standard content type) goes straight to the server. Anything more complex — a custom header, \`PUT\`/\`DELETE\`, a JSON content type on some setups — triggers a **preflight**: the browser first sends an \`OPTIONS\` request asking the server what's allowed, and only sends the real request if the server's preflight response permits it.

### Classic interview gotcha

CORS is enforced by the **browser**, not the server — for a non-preflighted request, the request can still reach the server and even execute its side effects (writing to a database, sending an email) *before* the browser blocks the JavaScript from reading the response. "CORS blocked it, so nothing happened" is a common but incorrect assumption for non-GET requests — the side effect may already have occurred even though the calling code never sees a successful response.

**Related:** [CORS & the Same-Origin Policy](/learn/browser-internals/cors-same-origin-policy) (Learn concept)`,
    difficulty: "medium",
    companies: ["Google", "Microsoft"],
    orderIndex: 53,
  },
  {
    collection: "ff-javascript",
    slug: "xss-and-csrf-explained",
    question: "Explain XSS and CSRF attacks and prevention.",
    answer: `XSS (Cross-Site Scripting) injects and runs an attacker's JavaScript inside your page, usually via unsanitized user input rendered as raw HTML; CSRF (Cross-Site Request Forgery) tricks a logged-in user's browser into making an unwanted authenticated request to your site from a completely different, malicious site, exploiting the fact that cookies are attached to requests automatically regardless of which page triggered them.

### XSS — injecting script through unsanitized input

\`\`\`js
// Dangerous — if userComment contains "<script>...</script>" or an <img onerror=...>, it runs
element.innerHTML = userComment;

// Safe — treated as plain text, never parsed as HTML
element.textContent = userComment;
\`\`\`

Prevention: escape/sanitize any user-generated content before rendering it as HTML, set a Content-Security-Policy header restricting what scripts can run, and mark sensitive cookies \`HttpOnly\` so even a successful XSS injection can't read them.

### CSRF — an authenticated request from somewhere else

A malicious site auto-submits a form to \`https://bank.com/transfer\` — the browser still attaches the user's \`bank.com\` session cookie automatically, since cookies aren't scoped to which page initiated the request. Prevention: a CSRF token embedded in the legitimate form (unavailable to the attacker's page) that the server verifies, plus the \`SameSite=Strict\`/\`Lax\` cookie attribute, which stops the browser from sending that cookie on cross-site requests in the first place.

### Classic interview gotcha

React's JSX escapes text content by default, so most React apps are naturally resistant to the most common XSS vector — until someone reaches for \`dangerouslySetInnerHTML\`, which is exactly what it sounds like and bypasses that protection entirely. A very common real-world XSS source in React apps is rendering unsanitized Markdown or user-submitted rich text through that specific escape hatch without running it through a sanitizer first.

**Related:** [Web Security Fundamentals (XSS, CSRF, CSP)](/learn/browser-internals/web-security-fundamentals) (Learn concept) · [Explain \`localStorage\` vs \`sessionStorage\` vs cookies.](/interview-prep/ff-javascript/localstorage-vs-sessionstorage-vs-cookies)`,
    difficulty: "hard",
    companies: ["Google", "Meta", "Stripe"],
    orderIndex: 54,
  },
  {
    collection: "ff-javascript",
    slug: "json-stringify-and-parse-gotchas",
    question: "What is `JSON.stringify` and `JSON.parse`? Gotchas?",
    answer: `\`JSON.stringify()\` converts a JavaScript value into a JSON-formatted string; \`JSON.parse()\` converts a JSON string back into a JavaScript value — together they're the standard way to serialize data for storage, network transfer, or a quick deep clone of plain data, but several JavaScript values don't round-trip through them cleanly.

\`\`\`js
const data = {
  name: "Rex",
  age: undefined,        // dropped entirely
  greet: function () {}, // dropped entirely
  score: NaN,             // becomes null
  createdAt: new Date(),  // becomes a plain ISO string, not a Date
};

JSON.stringify(data);
// '{"name":"Rex","score":null,"createdAt":"2026-...Z"}' — age and greet are gone, score is null
\`\`\`

### Reviving values that don't survive the round trip

\`\`\`js
const revived = JSON.parse(json, (key, value) => {
  if (key === "createdAt") return new Date(value); // manually re-hydrate
  return value;
});
\`\`\`

\`JSON.parse\`'s second argument (a "reviver" function) is how you manually restore values like \`Date\`s that JSON has no native representation for.

### Classic interview gotcha

\`JSON.stringify\` silently **drops** any object property whose value is \`undefined\` or a function, and silently converts \`NaN\`/\`Infinity\`/\`-Infinity\` to \`null\` — none of this produces a warning or an error, so data can quietly disappear or change meaning through a stringify/parse round trip unless you specifically know to check for it. It also throws a \`TypeError\` on a circular reference (an object that references itself, directly or indirectly), rather than silently truncating it.

**Related:** [What is the difference between deep copy and shallow copy?](/interview-prep/ff-javascript/deep-copy-vs-shallow-copy)`,
    difficulty: "medium",
    companies: ["Amazon", "Bloomberg"],
    orderIndex: 55,
  },
  {
    collection: "ff-javascript",
    slug: "for-in-vs-for-of",
    question: "What is the difference between `for...in` and `for...of`?",
    answer: `\`for...in\` iterates over an object's enumerable property **keys**, including any inherited from the prototype chain; \`for...of\` iterates over the **values** produced by any iterable (arrays, strings, \`Map\`s, \`Set\`s, generators) — they operate on entirely different things, despite the near-identical syntax.

\`\`\`js
const arr = ["a", "b", "c"];

for (const key in arr) {
  console.log(key); // "0", "1", "2" — string indices, not the values
}

for (const value of arr) {
  console.log(value); // "a", "b", "c" — the actual values
}

const obj = { name: "Rex", age: 3 };
for (const key in obj) {
  console.log(key); // "name", "age" — works fine, objects aren't iterable
}
for (const value of obj) {
  console.log(value); // TypeError — plain objects have no Symbol.iterator
}
\`\`\`

\`for...of\` requires the thing being looped over to implement the iterable protocol (\`Symbol.iterator\`, see the next question) — a plain object doesn't, which is exactly why the last example throws.

### Classic interview gotcha

\`for...in\` on an array iterates **string** indices (\`"0"\`, \`"1"\`, ...), not numbers, and — much more surprisingly — it also picks up any inherited *enumerable* properties, including ones accidentally added by mutating a built-in prototype (see the prototype chain question's gotcha about prototype pollution). This combination of surprising key types and inherited-property leakage is exactly why \`for...in\` is broadly discouraged for arrays in favor of \`for...of\`, \`.forEach()\`, or \`.map()\`.

**Related:** [Explain how the prototype chain works.](/interview-prep/ff-javascript/how-the-prototype-chain-works) · [Generators & Iterators](/learn/javascript-runtime/generators-iterators) (Learn concept)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 56,
  },
  {
    collection: "ff-javascript",
    slug: "symbol-iterator-and-custom-iterables",
    question: "What are `Symbol.iterator` and custom iterables?",
    answer: `\`Symbol.iterator\` is the well-known symbol that makes an object *iterable* — any object with a method at that key returning an iterator (an object with a \`.next()\` method) automatically works with \`for...of\`, the spread operator, and destructuring, even though it's not a built-in array, \`Map\`, or \`Set\`.

### A custom iterable, written by hand

\`\`\`js
const fibonacciUpTo = {
  max: 50,
  [Symbol.iterator]() {
    let [prev, curr] = [1, 1];
    return {
      next: () => {
        if (prev > this.max) return { value: undefined, done: true };
        const value = prev;
        [prev, curr] = [curr, prev + curr];
        return { value, done: false };
      },
    };
  },
};

[...fibonacciUpTo]; // [1, 1, 2, 3, 5, 8, 13, 21, 34] — works with spread automatically
for (const n of fibonacciUpTo) console.log(n); // also works directly
\`\`\`

### The same thing, far simpler with a generator

\`\`\`js
const fibonacciGen = {
  max: 50,
  *[Symbol.iterator]() {
    let [prev, curr] = [1, 1];
    while (prev <= this.max) {
      yield prev;
      [prev, curr] = [curr, prev + curr];
    }
  },
};
\`\`\`

A generator function assigned directly to \`[Symbol.iterator]\` automatically satisfies the whole iterator protocol correctly — no manual \`{ value, done }\` object bookkeeping required.

### Classic interview gotcha

Implementing \`Symbol.iterator\` by hand (returning a plain object with \`next()\`) is easy to get subtly wrong: forgetting to return \`{ value: undefined, done: true }\` on the final call leaves the loop running forever, and forgetting that an *iterator itself* is often expected to also be iterable (\`[Symbol.iterator]() { return this; }\`) breaks code that tries to \`for...of\` over the iterator object directly rather than the original iterable. This is exactly why reaching for a generator (\`function*\`) instead of hand-rolling \`next()\` is the standard, safer approach today.

**Related:** [What are generators and iterators?](/interview-prep/ff-javascript/generators-and-iterators) · [Generators & Iterators](/learn/javascript-runtime/generators-iterators) (Learn concept)`,
    difficulty: "hard",
    companies: ["Google", "Airbnb"],
    orderIndex: 57,
  },
  {
    collection: "ff-javascript",
    slug: "promise-all-vs-race-vs-allsettled-vs-any",
    question: "What is `Promise.all` vs `Promise.race` vs `Promise.allSettled` vs `Promise.any`?",
    answer: `All four take an array (or any iterable) of Promises and return a single Promise, but differ in when that Promise settles and what it resolves with: \`.all\` waits for every Promise to fulfill and rejects immediately on the first rejection; \`.race\` settles the instant the *first* Promise settles, whether fulfilled or rejected; \`.allSettled\` always waits for every Promise and never rejects, giving you the outcome of each one; \`.any\` resolves as soon as the first Promise fulfills, only rejecting if *every* Promise rejects.

| | Settles when | Rejects if |
|---|---|---|
| \`Promise.all\` | Every Promise fulfills | Any single Promise rejects |
| \`Promise.race\` | The first Promise settles (either way) | The first Promise to settle rejected |
| \`Promise.allSettled\` | Every Promise settles | Never — always fulfills |
| \`Promise.any\` | The first Promise fulfills | Only if *all* Promises reject |

\`\`\`js
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
// [
//   { status: "fulfilled", value: ... },
//   { status: "rejected", reason: ... },
//   { status: "fulfilled", value: ... },
// ] — every outcome preserved, nothing lost to one failure
\`\`\`

### Classic interview gotcha

\`Promise.all\` rejects the instant **any single** Promise rejects — the results of the other, still-pending, ultimately-successful Promises are simply discarded and never exposed anywhere. This is exactly the case \`Promise.allSettled\` exists to handle: getting every outcome regardless of individual failures. A very common real bug is reaching for \`.all\` when the actual requirement was "run these in parallel but don't let one failure lose the results of the others" — that requirement calls for \`.allSettled\`, not \`.all\`.

**Related:** [What are Promises and how do they work?](/interview-prep/ff-javascript/what-are-promises) · [What is microtask queue vs macrotask queue?](/interview-prep/ff-javascript/microtask-vs-macrotask-queue)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Meta", "Netflix"],
    isFf75: true,
    orderIndex: 58,
  },
  {
    collection: "ff-javascript",
    slug: "microtask-vs-macrotask-queue",
    question: "What is microtask queue vs macrotask queue?",
    answer: `The microtask queue holds Promise callbacks (\`.then\`/\`.catch\`/\`.finally\`) and \`queueMicrotask\` callbacks; the macrotask queue holds \`setTimeout\`, \`setInterval\`, and UI/I/O event callbacks — the event loop always drains the **entire** microtask queue before running even a single macrotask, which is why Promise callbacks consistently run before a \`setTimeout(fn, 0)\` scheduled earlier.

### A trickier ordering example than the basic one

\`\`\`js
console.log("1: sync");

setTimeout(() => console.log("2: macrotask"), 0);

Promise.resolve().then(() => {
  console.log("3: microtask");
  Promise.resolve().then(() => console.log("4: nested microtask"));
});

queueMicrotask(() => console.log("5: microtask"));

console.log("6: sync");

// Output: 1, 6, 3, 5, 4, 2
// Both top-level microtasks (3, 5) run before the macrotask (2) —
// AND the microtask that "3" itself queues (4) also runs before "2",
// because the queue keeps draining until nothing is left in it.
\`\`\`

### Classic interview gotcha

A microtask that queues *another* microtask doesn't wait for some "next cycle" — it runs within the **same** drain, before the event loop is ever allowed to look at the macrotask queue at all (see step 4 above, which runs before step 2 even though it was queued by step 3, itself already a microtask). This means a long chain of \`.then()\` calls, or a runaway recursive microtask, can starve macrotasks indefinitely — timers and even rendering can appear to "freeze" even though the call stack is technically empty between each individual microtask. This is a real, documented class of production performance bug, not just a theoretical curiosity.

**Related:** [What is the event loop in JavaScript?](/interview-prep/ff-javascript/what-is-the-event-loop) · [What is \`Promise.all\` vs \`Promise.race\` vs \`Promise.allSettled\` vs \`Promise.any\`?](/interview-prep/ff-javascript/promise-all-vs-race-vs-allsettled-vs-any)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Uber"],
    isFf75: true,
    orderIndex: 59,
  },
  {
    collection: "ff-javascript",
    slug: "function-overloading-in-javascript",
    question: "Explain the concept of function overloading in JS.",
    answer: `JavaScript has no native function overloading — unlike Java or C++, defining the same function name twice doesn't create two callable variants; the second definition simply **replaces** the first entirely, last one wins. The common JavaScript pattern for overload-like behavior is a single function that branches internally on \`arguments.length\`, argument types, or default/rest parameters.

\`\`\`js
function greet(name) {
  return \`Hi, \${name}\`;
}
function greet(name, greeting) {
  return \`\${greeting}, \${name}\`;
}
greet("Rex"); // "undefined, Rex" — the first greet() no longer exists at all
\`\`\`

\`\`\`js
// The real JS pattern: one function, branching on what was actually passed
function greet(name, greeting = "Hi") {
  return \`\${greeting}, \${name}\`;
}
greet("Rex");          // "Hi, Rex"
greet("Rex", "Hello");  // "Hello, Rex"

function process(input) {
  if (typeof input === "string") return input.toUpperCase();
  if (Array.isArray(input)) return input.map((s) => s.toUpperCase());
  throw new TypeError("Expected a string or array of strings");
}
\`\`\`

### Classic interview gotcha

TypeScript **does** support overload signatures — multiple type signatures declared for a single implementation — but that's purely a compile-time type-checking convenience, not real runtime overloading. It still compiles down to one plain JavaScript function underneath, with the exact same "last definition wins, no real dispatch" behavior described above. Anyone answering this for a TypeScript-heavy role should mention that distinction explicitly rather than implying JavaScript itself somehow gained overloading.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    companies: ["Microsoft", "Adobe"],
    orderIndex: 60,
  },
  {
    collection: "ff-javascript",
    slug: "getters-and-setters",
    question: "What are getters and setters in JavaScript?",
    answer: `Getters and setters let an object property look like a plain value from the outside while actually running a function on read (\`get\`) or write (\`set\`) — useful for computed properties, validation on write, or making a property transparently intercept access without changing the calling syntax.

\`\`\`js
const user = {
  firstName: "Rex",
  lastName: "Max",
  get fullName() {
    return \`\${this.firstName} \${this.lastName}\`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
};

user.fullName;              // "Rex Max" — reads like a plain property, runs the getter
user.fullName = "Fido Rex"; // runs the setter, splits and reassigns firstName/lastName
\`\`\`

### Validation via a setter

\`\`\`js
class Temperature {
  #celsius = 0;
  get fahrenheit() {
    return (this.#celsius * 9) / 5 + 32;
  }
  set fahrenheit(value) {
    this.#celsius = ((value - 32) * 5) / 9;
  }
}
\`\`\`

A getter/setter pair can enforce invariants (clamping a value, rejecting an invalid one) at the exact point of assignment, without the caller ever knowing anything beyond "I set a property."

### Classic interview gotcha

A getter with no matching setter makes that property silently read-only in non-strict mode — assigning to it doesn't throw, it just does nothing, which can hide a real bug where code assumes an assignment actually took effect. In strict mode (the default in classes and ES modules), the same assignment throws a \`TypeError\` instead — worth mentioning both behaviors, since which one you hit depends entirely on whether the surrounding code runs in strict mode.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Google", "Airbnb"],
    isFf75: true,
    orderIndex: 61,
  },
  {
    collection: "ff-javascript",
    slug: "class-vs-function-constructors",
    question: "What is the difference between class and function-based constructors?",
    answer: `ES6 \`class\` syntax is largely syntactic sugar over the same prototype-based mechanism function constructors have always used — both produce an object linked to a \`.prototype\` — but \`class\` adds real language-level guarantees (must be called with \`new\`, methods are non-enumerable by default, the class body isn't hoisted) that a plain function constructor never had.

\`\`\`js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return \`\${this.name} makes a sound.\`;
};

class AnimalClass {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

typeof AnimalClass; // "function" — still a function under the hood
\`\`\`

### What actually changed

| | Function constructor | \`class\` |
|---|---|---|
| Callable without \`new\`? | Yes — silently wrong \`this\`, no error | No — throws \`TypeError\` |
| Prototype methods enumerable? | Yes, by default | No, non-enumerable by default |
| Hoisted? | Function declarations hoist fully | No — stays in the temporal dead zone |
| Strict mode inside the body? | Optional | Always strict mode automatically |

### Classic interview gotcha

Calling a function constructor without \`new\` doesn't throw — it just runs with \`this\` bound to the global object (or \`undefined\` in strict mode), silently producing a broken, half-initialized object instead of a real instance. Calling a \`class\` without \`new\` always throws a \`TypeError\` immediately. This is a concrete safety improvement \`class\` provides, not just prettier syntax over the exact same behavior.

**Related:** [What is the \`this\` keyword and how does it behave?](/interview-prep/ff-javascript/how-does-this-behave) · [Explain the concept of prototypal inheritance.](/interview-prep/ff-javascript/prototypal-inheritance-explained)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Amazon"],
    isFf75: true,
    orderIndex: 62,
  },
  {
    collection: "ff-javascript",
    slug: "static-methods-in-a-class",
    question: "What are static methods in a class?",
    answer: `A \`static\` method belongs to the class itself, not to instances — it's called directly on the class (\`ClassName.method()\`) rather than on an object built from it, making it the natural place for utility or factory functions related to the class but not tied to any one instance.

\`\`\`js
class User {
  constructor(name) {
    this.name = name;
  }
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name); // a factory — doesn't need an existing instance to run
  }
}

const user = User.fromJSON('{"name": "Rex"}');
user instanceof User; // true

User.fromJSON; // a function that exists on User itself
user.fromJSON;  // undefined — instances never inherit static methods
\`\`\`

### Static properties too

\`\`\`js
class Counter {
  static instanceCount = 0; // one shared value on the class, not per-instance
  constructor() {
    Counter.instanceCount += 1;
  }
}
\`\`\`

\`static\` fields work the same way — one shared value that lives on the class, useful for tracking state across every instance rather than duplicating it per object.

### Classic interview gotcha

\`this\` inside a static method refers to the class itself (or, in a subclass, whichever class actually made the call), not any instance — trying to read \`this.name\` inside a static method doesn't throw, it just silently returns \`undefined\` (or whatever static property happens to share that name), which reads like working code while actually referencing something completely different from what was intended.

**Related:** [What is the difference between class and function-based constructors?](/interview-prep/ff-javascript/class-vs-function-constructors)`,
    difficulty: "medium",
    companies: ["Amazon", "Adobe"],
    orderIndex: 63,
  },
  {
    collection: "ff-javascript",
    slug: "instanceof-operator-explained",
    question: "What is the instanceof operator?",
    answer: `\`instanceof\` checks whether an object's prototype chain contains a given constructor's \`.prototype\` — \`obj instanceof Ctor\` walks up \`obj\`'s chain looking for \`Ctor.prototype\`, returning \`true\` the moment it's found, or \`false\` if the chain ends at \`null\` first.

\`\`\`js
class Animal {}
class Dog extends Animal {}
const rex = new Dog();

rex instanceof Dog;    // true — Dog.prototype is rex's direct prototype
rex instanceof Animal; // true — Animal.prototype is further up the chain
rex instanceof Object; // true — every object's chain ends at Object.prototype
rex instanceof Array;  // false — Array.prototype never appears in rex's chain
\`\`\`

### Classic interview gotcha

\`instanceof\` fails silently across different realms — an array created inside one \`<iframe>\` and checked with \`instanceof Array\` from a *different* iframe's JavaScript context returns \`false\`, because each realm has its own distinct \`Array.prototype\` object, even though the value is genuinely an array in every practical sense. \`Array.isArray()\` exists specifically because it doesn't rely on prototype-chain identity and gets this exact cross-realm case right where \`instanceof\` gets it wrong.

**Related:** [Explain how the prototype chain works.](/interview-prep/ff-javascript/how-the-prototype-chain-works) · [Explain the concept of prototypal inheritance.](/interview-prep/ff-javascript/prototypal-inheritance-explained)`,
    difficulty: "easy",
    companies: ["Google", "Microsoft"],
    orderIndex: 64,
  },
  {
    collection: "ff-javascript",
    slug: "typeof-operator-and-quirks",
    question: "What is typeof and what are its quirks?",
    answer: `\`typeof\` returns a string naming a value's type, but several of its results are famous, long-standing quirks rather than what a newcomer would predict — most notoriously, \`typeof null\` returns \`"object"\`.

| Value | \`typeof\` result |
|---|---|
| \`42\` | \`"number"\` |
| \`"text"\` | \`"string"\` |
| \`true\` | \`"boolean"\` |
| \`undefined\` | \`"undefined"\` |
| \`null\` | \`"object"\` — the famous quirk |
| \`{}\` / \`[]\` | \`"object"\` |
| \`function(){}\` | \`"function"\` |
| \`Symbol()\` | \`"symbol"\` |
| \`10n\` | \`"bigint"\` |

### Classic interview gotcha

\`typeof null === "object"\` is a bug baked into JavaScript's very first version (a type-tagging mistake in the original engine), and it can never be fixed now without breaking a huge amount of existing code that implicitly depends on the current behavior. The reliable way to check specifically for \`null\` is \`value === null\`, not \`typeof value === "object"\` (which also matches arrays, dates, and every other object). Separately, \`typeof\` on an **undeclared** variable doesn't throw a \`ReferenceError\` the way actually reading it would — it safely returns \`"undefined"\`, making \`typeof\` the one context where referencing a non-existent identifier is completely safe.

**Related:** [What is the difference between \`null\` and \`undefined\`?](/interview-prep/ff-javascript/null-vs-undefined)`,
    difficulty: "medium",
    companies: ["Amazon", "Bloomberg"],
    orderIndex: 65,
  },
  {
    collection: "ff-javascript",
    slug: "how-array-sort-works-internally",
    question: "How does Array.sort work internally?",
    answer: `\`.sort()\` mutates the array in place, and — without a comparator — converts every element to a string and sorts lexicographically, which is why sorting numbers with no comparator looks broken by default; passing a comparator function \`(a, b) => ...\` controls the real order directly, and modern engines guarantee the sort is stable (elements considered equal keep their original relative order).

\`\`\`js
[10, 1, 2].sort();               // [1, 10, 2] — sorted as strings: "1" < "10" < "2"
[10, 1, 2].sort((a, b) => a - b); // [1, 2, 10] — a numeric comparator, correct order
\`\`\`

### The comparator's return-value contract

| Return value | Meaning |
|---|---|
| Negative | \`a\` should come before \`b\` |
| Positive | \`a\` should come after \`b\` |
| Zero | Keep \`a\` and \`b\`'s relative order (this is what "stable" guarantees) |

### Classic interview gotcha

The default (no comparator) string-conversion sort is one of the most common real bugs in JavaScript — \`[10, 1, 2].sort()\` silently returns \`[1, 10, 2]\`, with no error or warning, because every element became a string first. Always pass an explicit comparator when sorting anything other than plain strings. It's also worth knowing that stability was only formally *guaranteed* by the spec as of ES2019 — before that, sort stability was implementation-defined, so code relying on stable order in a very old engine wasn't actually guaranteed to get it.

**Related:** [Explain the difference between \`Array.map\`, \`Array.filter\`, and \`Array.reduce\`.](/interview-prep/ff-javascript/array-map-filter-reduce-differences) · [What are pure functions and side effects?](/interview-prep/ff-javascript/pure-functions-and-side-effects)`,
    difficulty: "hard",
    companies: ["Google", "Uber"],
    orderIndex: 66,
  },
  {
    collection: "ff-javascript",
    slug: "slice-vs-splice",
    question: "What is the difference between slice and splice?",
    answer: `\`.slice()\` returns a new array containing a shallow copy of a portion of the original, without modifying it; \`.splice()\` mutates the original array in place — removing, replacing, or inserting elements — and returns only the elements it removed (if any).

\`\`\`js
const arr = ["a", "b", "c", "d"];

arr.slice(1, 3); // ["b", "c"] — new array, arr itself is untouched
arr;              // ["a", "b", "c", "d"] — still the original

arr.splice(1, 2); // ["b", "c"] — the removed elements
arr;              // ["a", "d"] — arr itself was mutated

const arr2 = ["a", "b", "c"];
arr2.splice(1, 0, "x", "y"); // insert without removing anything
arr2; // ["a", "x", "y", "b", "c"]
\`\`\`

| | Mutates the original? | Returns |
|---|---|---|
| \`.slice(start, end)\` | No | A new array (the extracted portion) |
| \`.splice(start, count, ...items)\` | Yes | The removed elements (empty array if none) |

### Classic interview gotcha

\`.slice()\`'s non-mutation and \`.splice()\`'s in-place mutation are easy to mix up purely because the names look so similar — reaching for \`.splice()\` when a non-destructive copy was actually intended (or vice versa) is a common source of real bugs. It's made worse by the fact that \`.splice()\` *does* return something (the removed elements), which can mislead someone into treating that return value as "the result," when the actual modified array is the original one, mutated in place.

**Related:** [What is \`Array.flat()\` and \`Array.flatMap()\`?](/interview-prep/ff-javascript/array-flat-and-flatmap) · [What are pure functions and side effects?](/interview-prep/ff-javascript/pure-functions-and-side-effects)`,
    difficulty: "easy",
    companies: ["Meta", "Netflix"],
    orderIndex: 67,
  },
  {
    collection: "ff-javascript",
    slug: "truthy-and-falsy-values",
    question: "What are truthy and falsy values in JavaScript?",
    answer: `Every value in JavaScript is either truthy or falsy when evaluated in a boolean context (an \`if\`, \`&&\`, \`||\`, a ternary) — there are exactly 8 falsy values among ordinary values, and literally everything else, including every ordinary object and every array, is truthy. (The one documented, deliberate exception is the browser-only \`document.all\`: spec'd as falsy — and as \`typeof document.all === "undefined"\` — purely for backward compatibility with old sites that used it to detect non-IE browsers.)

### The 8 falsy values, in full

\`\`\`js
Boolean(false);     // false
Boolean(0);          // false
Boolean(-0);         // false
Boolean("");         // false
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
Boolean(0n);         // false — BigInt zero

// literally everything else is truthy
Boolean([]);   // true
Boolean({});   // true
Boolean("0");  // true — a non-empty string, even one that "looks" falsy
\`\`\`

### Classic interview gotcha

An empty array \`[]\` and an empty object \`{}\` are both truthy, despite "feeling empty" — \`if ([])\` runs the \`if\` branch, which surprises anyone who expects emptiness to mean falsy. This is exactly why checking "is this array empty" requires \`arr.length === 0\`, never \`if (!arr)\` or \`if (arr)\` — and it's a genuinely common real bug, especially with API responses that return \`[]\` instead of \`null\` for "no results," silently passing a truthiness check that was meant to catch the empty case.

**Related:** [Explain the concept of coercion in JavaScript.](/interview-prep/ff-javascript/coercion-in-javascript) · [What is optional chaining (\`?.\`) and nullish coalescing (\`??\`)?](/interview-prep/ff-javascript/optional-chaining-and-nullish-coalescing)`,
    difficulty: "easy",
    companies: ["Amazon", "Shopify"],
    orderIndex: 68,
  },
  {
    collection: "ff-javascript",
    slug: "short-circuit-evaluation",
    question: "What is short-circuit evaluation?",
    answer: `\`&&\` and \`||\` stop evaluating ("short-circuit") the moment the result is already determined by the left operand — \`&&\` returns immediately if the left side is falsy, and \`||\` returns immediately if the left side is truthy, without ever evaluating the right side. This is why they're used for conditional execution and default values, not only for boolean logic.

\`\`\`js
user && user.logout();          // logout() only runs if user is truthy — avoids a TypeError on null

const name = input || "Guest"; // "Guest" is only used if input is falsy

function log(message) {
  console.log(message);
  return true;
}
false && log("never runs"); // log() is never called — short-circuited before the right side runs
\`\`\`

### Classic interview gotcha

Because \`&&\`/\`||\` short-circuit based on *any* falsy or truthy value — not specifically \`null\`/\`undefined\` — \`input || "Guest"\` silently replaces a deliberate \`0\`, \`""\`, or \`false\` with the fallback value, the same trap already covered by the nullish-coalescing question, restated here because it's really a direct consequence of how short-circuiting itself works, not something specific to \`??\`. \`??\` was added precisely to short-circuit on nullish values only, sidestepping this exact issue for the common "give me a default only if this is truly missing" case.

**Related:** [What is optional chaining (\`?.\`) and nullish coalescing (\`??\`)?](/interview-prep/ff-javascript/optional-chaining-and-nullish-coalescing) · [What are truthy and falsy values in JavaScript?](/interview-prep/ff-javascript/truthy-and-falsy-values)`,
    difficulty: "easy",
    companies: ["Google", "Airbnb"],
    orderIndex: 69,
  },
  {
    collection: "ff-javascript",
    slug: "tail-call-optimization",
    question: "What is tail call optimization?",
    answer: `Tail call optimization (TCO) lets an engine reuse the *current* function's stack frame for a recursive call that is the very last operation in that function ("in tail position"), instead of pushing a brand-new frame on top — turning what looks like recursion into something that runs with constant stack space, avoiding a stack overflow on deep recursion.

### Not in tail position vs. in tail position

\`\`\`js
// NOT in tail position — the multiplication still has to happen *after* the call returns
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// IN tail position — the recursive call is the literal last thing that happens
function factorialTCO(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTCO(n - 1, n * acc); // nothing left to do after this call returns
}
\`\`\`

The accumulator pattern (\`acc\`) is what makes the second version tail-recursive — it carries the running result forward as an argument instead of relying on the call stack to hold pending multiplications.

### Diagram

Without TCO, each call to \`factorial\` adds a new stack frame — the multiplication is still pending, so the frame has to stay alive until the recursive call beneath it returns. With TCO, \`factorialTCO\`'s recursive call is the literal last operation, so an engine that implements TCO can reuse the same frame for every call instead of growing the stack.

### Classic interview gotcha

TCO has been part of the ECMAScript spec since ES2015 — but **only Safari (JavaScriptCore) actually implements it**. V8 (Chrome, Node, Edge) and SpiderMonkey (Firefox) never shipped it, despite it being a decade-old standard. This means \`factorialTCO(100_000)\` still throws \`RangeError: Maximum call stack size exceeded\` in Node and Chrome today, even though the code is written in genuinely correct tail position — a real, surprising gap between the spec and actual implementations that trips up anyone who assumes tail-recursive code is a portable performance guarantee across engines.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "hard",
    companies: ["Google", "Stripe"],
    orderIndex: 70,
  },
  {
    collection: "ff-javascript",
    slug: "object-assign-vs-spread-operator",
    question: "Explain Object.assign vs spread operator for objects.",
    answer: `Both merge multiple objects' own enumerable properties into a result with the same last-source-wins semantics, but \`Object.assign(target, ...sources)\` mutates and returns its first argument, while \`{...obj}\` always creates a brand-new object literal and never mutates any of the objects it spreads.

\`\`\`js
const target = { a: 1 };
const merged1 = Object.assign(target, { b: 2 }); // mutates target!
merged1 === target; // true — the same object, mutated
target;               // { a: 1, b: 2 } — target itself changed

const original = { a: 1 };
const merged2 = { ...original, b: 2 }; // original is left completely untouched
merged2 === original; // false — a genuinely new object
original;               // { a: 1 } — never touched
\`\`\`

### Classic interview gotcha

\`Object.assign(target, source)\` triggers any **setter** defined on \`target\` for a matching key, because it performs a real property assignment (\`target[key] = source[key]\`) under the hood — while \`{...obj}\` creates entirely new own properties directly on the resulting object literal, bypassing any getter/setter on the target entirely, since there's no pre-existing "target" object involved at all. If \`target\` has a custom setter, \`Object.assign\` and spread can produce genuinely different results for the same input — a distinction that only surfaces once getters/setters are in play, which is exactly why it catches people off guard.

**Related:** [What is the difference between deep copy and shallow copy?](/interview-prep/ff-javascript/deep-copy-vs-shallow-copy) · [What is the spread and rest operator?](/interview-prep/ff-javascript/spread-and-rest-operator) · [What are getters and setters in JavaScript?](/interview-prep/ff-javascript/getters-and-setters)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 71,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-chaining-in-javascript",
    question: "What is chaining in JavaScript?",
    answer: `Method chaining means calling a sequence of methods on the same value one after another in a single expression, made possible because each method returns something — often \`this\`, or a new instance of the same type — that the next method in the chain can be called on directly. Array methods, Promises, and jQuery-style fluent APIs are the most common places it shows up.

\`\`\`js
[1, 2, 3, 4, 5]
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reduce((sum, n) => sum + n, 0); // 60 — each step returns something chainable

class QueryBuilder {
  #parts = [];
  where(condition) {
    this.#parts.push(\`WHERE \${condition}\`);
    return this; // returning "this" is what enables the next .method() call
  }
  orderBy(column) {
    this.#parts.push(\`ORDER BY \${column}\`);
    return this;
  }
  build() {
    return this.#parts.join(" ");
  }
}

new QueryBuilder().where("age > 18").orderBy("name").build();
\`\`\`

### Classic interview gotcha

Chaining only works as long as *every* method in the chain actually returns something chainable — forgetting a single \`return this;\` in one method of a fluent-style class silently breaks every call after it (the next call runs on \`undefined\` and throws a \`TypeError\`). The error's location — the *next* method call in the chain — is often nowhere near the actual missing \`return\` that caused it, making this a genuinely annoying class of bug to track down, especially in a long chain.

**Related:** [Explain the difference between \`Array.map\`, \`Array.filter\`, and \`Array.reduce\`.](/interview-prep/ff-javascript/array-map-filter-reduce-differences) · [What are Promises and how do they work?](/interview-prep/ff-javascript/what-are-promises)`,
    difficulty: "medium",
    companies: ["Amazon", "Adobe"],
    orderIndex: 72,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-lazy-evaluation",
    question: "What is lazy evaluation?",
    answer: `Lazy evaluation means delaying a computation until its result is actually needed, rather than computing it eagerly up front — generators, getters, and short-circuit evaluation are all forms of laziness already built into JavaScript, letting a program skip work that turns out to never be required.

\`\`\`js
// Eager — computes every value up front, even ones that may never be used
function eagerRange(n) {
  const result = [];
  for (let i = 0; i < n; i++) result.push(i * 2);
  return result;
}

// Lazy — nothing is computed until .next() is actually called
function* lazyRange(n) {
  for (let i = 0; i < n; i++) yield i * 2;
}

const gen = lazyRange(1_000_000);
gen.next(); // only computes the first value — the other 999,999 are never touched
\`\`\`

### Classic interview gotcha

A lazy generator can safely represent an **infinite** sequence:

\`\`\`js
function* naturals() {
  let n = 0;
  while (true) yield n++;
}
\`\`\`

This works precisely because nothing is computed until it's asked for — the equivalent eager version (building a full array up front) would hang or crash immediately trying to materialize an infinite list. This distinction — does the whole thing actually run to completion before returning, or only as much as was requested — is exactly why lazy sequences and generators are the standard way to model infinite or extremely large data sources in JavaScript, not just a performance micro-optimization.

**Related:** [What are generators and iterators?](/interview-prep/ff-javascript/generators-and-iterators) · [What are \`Symbol.iterator\` and custom iterables?](/interview-prep/ff-javascript/symbol-iterator-and-custom-iterables)`,
    difficulty: "hard",
    companies: ["Google", "Netflix"],
    orderIndex: 73,
  },
  {
    collection: "ff-javascript",
    slug: "what-are-design-patterns",
    question: "What are design patterns? Name 3 common ones in JS.",
    answer: `A design pattern is a reusable, named solution to a recurring software design problem — not a specific piece of code, but a general template that's been proven to work across many different codebases. Three of the most common in JavaScript are the **Module pattern** (private state via closures), the **Singleton pattern** (guaranteeing exactly one shared instance), and the **Observer pattern** (one-to-many change notification).

### The 3, briefly

- **Module pattern** — bundles private state and functions together behind a deliberately small public API, classically via an IIFE closure (see the dedicated question for the full example).
- **Singleton pattern** — guarantees a class has exactly one instance across the app, with a single well-known way to access it (see the dedicated question for the tradeoffs).
- **Observer pattern** — lets one "subject" notify a list of subscribed "observers" whenever its state changes, without knowing anything about what each observer does with the notification (see the dedicated question for the fan-out mechanics).

### Classic interview gotcha

Design patterns are frequently *over-applied* — reaching for a Singleton or an Observer purely because it's a recognizable, nameable pattern, in a case a plain function or a single piece of local state would solve more simply, adds indirection without adding real value. A pattern exists to name a solution to a problem you've actually run into, not to be applied from a checklist before you've hit that problem — the strongest use of pattern knowledge is recognizing "oh, this is the Observer pattern" in code you already wrote, not designing around one from scratch on a small problem.

**Related:** [What is the Observer pattern?](/interview-prep/ff-javascript/observer-pattern-explained) · [What is the Singleton pattern?](/interview-prep/ff-javascript/singleton-pattern-explained) · [What is the Module pattern?](/interview-prep/ff-javascript/module-pattern-explained)`,
    difficulty: "hard",
    companies: ["Meta", "Bloomberg"],
    orderIndex: 74,
  },
  {
    collection: "ff-javascript",
    slug: "observer-pattern-explained",
    question: "What is the Observer pattern?",
    answer: `The Observer pattern lets one object (the "subject") maintain a list of dependents ("observers") and automatically notify all of them whenever its state changes, without the subject needing to know anything specific about who's listening or what they do with the notification.

\`\`\`js
class Subject {
  #observers = [];
  subscribe(fn) {
    this.#observers.push(fn);
  }
  unsubscribe(fn) {
    this.#observers = this.#observers.filter((f) => f !== fn);
  }
  notify(data) {
    this.#observers.forEach((fn) => fn(data));
  }
}

const subject = new Subject();
subject.subscribe((data) => console.log("Observer A:", data));
subject.subscribe((data) => console.log("Observer B:", data));
subject.notify("state changed"); // both observers run, in subscription order
\`\`\`

### Diagram

A single \`notify(data)\` call fans out to every subscribed observer — the Subject only ever knows its own list of subscriber functions, never anything about what each observer actually does with the data it receives.

### Where this shows up in real code

\`addEventListener\`, the DOM's \`MutationObserver\`, and RxJS subscriptions are all real-world instances of exactly this pattern — a subject-like source of change, and a list of subscribers notified whenever that change happens.

### Classic interview gotcha

Forgetting to \`unsubscribe\` an observer that's no longer needed (a removed component, a closed connection) is a very common real-world memory leak — the subject keeps a reference to the observer function forever, keeping alive everything that function's closure captures, exactly the same class of leak already covered in the garbage collection question's "forgotten event listeners" example. Every one of the three real-world examples above — \`addEventListener\`, \`MutationObserver\`, RxJS — shares this exact same forgotten-unsubscribe leak risk.

**Related:** [How does JavaScript's garbage collection work?](/interview-prep/ff-javascript/how-garbage-collection-works) · [What are design patterns? Name 3 common ones in JS.](/interview-prep/ff-javascript/what-are-design-patterns)`,
    difficulty: "hard",
    companies: ["Google", "Meta"],
    orderIndex: 75,
  },
  {
    collection: "ff-javascript",
    slug: "singleton-pattern-explained",
    question: "What is the Singleton pattern?",
    answer: `The Singleton pattern guarantees a class has exactly one instance across the entire application, and provides a single, well-known way to access that instance — useful for things that are genuinely global and wrong to duplicate, like a database connection pool or an app-wide configuration object.

\`\`\`js
class Database {
  static #instance;
  constructor() {
    if (Database.#instance) return Database.#instance; // return the existing one instead
    this.connection = "connected";
    Database.#instance = this;
  }
}

const db1 = new Database();
const db2 = new Database();
db1 === db2; // true — the second "new" actually returned the first instance
\`\`\`

### The far more common JS idiom

A plain ES module already behaves like a singleton without any special class — a module's top-level state is only ever created once, and every file that imports it shares that exact same instance:

\`\`\`js
// config.js
export const config = { theme: "dark" }; // created once, shared by every importer
\`\`\`

### Classic interview gotcha

Singletons are widely considered an anti-pattern in modern JavaScript for one big reason: they're global mutable state, which makes unit testing genuinely painful — tests can leak state into each other through the shared instance, since resetting a singleton between tests requires extra deliberate effort most test suites forget to do. In most real frontend code today, the same "exactly one, shared" outcome is achieved more testably via dependency injection (passing the instance in explicitly) or simply relying on an ES module's natural singleton-like behavior, rather than reaching for an explicit Singleton class.

**Related:** [What are design patterns? Name 3 common ones in JS.](/interview-prep/ff-javascript/what-are-design-patterns) · [What is the module system in JavaScript (CommonJS vs ES Modules)?](/interview-prep/ff-javascript/commonjs-vs-es-modules)`,
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 76,
  },
  {
    collection: "ff-javascript",
    slug: "module-pattern-explained",
    question: "What is the Module pattern?",
    answer: `The Module pattern uses a closure — classically an IIFE — to bundle related private state and functions together, exposing only a deliberately chosen public API. Everything else stays completely inaccessible from outside, the same private-state mechanism closures provide generally, applied specifically to organizing a chunk of related code.

\`\`\`js
const counterModule = (function () {
  let count = 0; // private — no way to reach this directly from outside

  function increment() {
    count += 1;
    return count;
  }

  function reset() {
    count = 0;
  }

  return { increment, reset }; // only these two are exposed publicly
})();

counterModule.increment(); // 1
counterModule.count;        // undefined — genuinely private, not just a naming convention
\`\`\`

### Classic interview gotcha

Before ES modules existed, the IIFE-based Module pattern was the *only* real way to get genuine privacy in JavaScript — today, ES modules provide the exact same "only exported names are visible" guarantee natively, with no IIFE wrapper needed at all (anything not \`export\`ed from a module file is already private to that file by default). Reaching for the classic IIFE Module pattern in code that's already written as ES modules is usually unnecessary — it's solving a problem the module system itself already solves for free.

**Related:** [What is an IIFE and when would you use it?](/interview-prep/ff-javascript/what-is-an-iife) · [What are closures and how do they work?](/interview-prep/ff-javascript/what-are-closures) · [What is the module system in JavaScript (CommonJS vs ES Modules)?](/interview-prep/ff-javascript/commonjs-vs-es-modules)`,
    difficulty: "medium",
    companies: ["Meta", "Stripe"],
    orderIndex: 77,
  },
  {
    collection: "ff-javascript",
    slug: "error-handling-in-async-await",
    question: "How do you handle errors in async/await?",
    answer: `Wrapping \`await\` in a plain \`try/catch\` handles errors the same way it would for synchronous code — an awaited Promise that rejects throws inside the \`async\` function, and \`catch\` picks it up exactly like it would a thrown error, with no separate \`.catch()\` chain required.

\`\`\`js
async function loadUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`); // manually thrown, caught the same way
    return await res.json();
  } catch (error) {
    console.error("failed to load user:", error);
    return null; // handle it here, or re-throw if the caller needs to know
  }
}
\`\`\`

### Handling multiple awaits, plus cleanup

\`\`\`js
async function loadDashboard() {
  try {
    const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
    return { user, posts };
  } catch (error) {
    // if EITHER fetchUser() or fetchPosts() rejects, this single catch handles both
    console.error(error);
    return null;
  } finally {
    hideLoadingSpinner(); // always runs, whether the try succeeded or the catch ran
  }
}
\`\`\`

### Classic interview gotcha

An \`async\` function that returns a Promise directly, without \`await\`ing it inside the \`try\` block, won't have that Promise's *eventual* rejection caught by the surrounding \`try/catch\` — \`try/catch\` only catches what happens synchronously during the function's own execution, including anything actually \`await\`ed, not a rejection that happens later on a Promise merely returned without awaiting:

\`\`\`js
async function bad() {
  try {
    return somePromise(); // if this rejects later, this try/catch never sees it
  } catch (error) {
    // never runs for somePromise's rejection
  }
}
\`\`\`

Forgetting the \`await\` in \`return await somePromise()\` inside a \`try\` block is a subtle, real bug — \`return somePromise()\` looks almost identical but silently skips the \`try/catch\`'s ability to catch that specific rejection.

**Related:** [Explain async/await and how it relates to Promises.](/interview-prep/ff-javascript/async-await-explained) · [What is try/catch/finally?](/interview-prep/ff-javascript/try-catch-finally-explained) · [What is \`Promise.all\` vs \`Promise.race\` vs \`Promise.allSettled\` vs \`Promise.any\`?](/interview-prep/ff-javascript/promise-all-vs-race-vs-allsettled-vs-any)`,
    difficulty: "medium",
    companies: ["Google", "Airbnb"],
    orderIndex: 78,
  },
  {
    collection: "ff-javascript",
    slug: "try-catch-finally-explained",
    question: "What is try/catch/finally?",
    answer: `\`try\` runs a block of code and lets you handle any thrown error without crashing the whole program; \`catch\` runs only if something inside \`try\` threw, receiving the thrown value; \`finally\` always runs afterward — whether \`try\` succeeded, \`catch\` ran, or either block contained a \`return\` — making it the reliable place for cleanup code.

\`\`\`js
function readConfig() {
  try {
    return JSON.parse(rawConfig); // if this throws, execution jumps straight to catch
  } catch (error) {
    console.error("invalid config:", error.message);
    return {};
  } finally {
    console.log("readConfig finished"); // always logs, regardless of which path was taken
  }
}
\`\`\`

### Classic interview gotcha

A \`return\` inside \`finally\` silently **overrides** any \`return\` (or thrown error) from \`try\`/\`catch\` — \`finally\`'s own return value always wins, discarding whatever the rest of the function was about to produce, with no warning at runtime:

\`\`\`js
function example() {
  try {
    return "from try";
  } finally {
    return "from finally"; // this wins — "from try" is silently discarded
  }
}
example(); // "from finally"
\`\`\`

This is such a common footgun that most linters (ESLint's \`no-unsafe-finally\` rule) flag a \`return\`/\`throw\` inside \`finally\` by default.

**Related:** [How do you handle errors in async/await?](/interview-prep/ff-javascript/error-handling-in-async-await) · [What are custom errors in JavaScript?](/interview-prep/ff-javascript/custom-errors-in-javascript)`,
    difficulty: "easy",
    companies: ["Amazon", "Meta"],
    orderIndex: 79,
  },
  {
    collection: "ff-javascript",
    slug: "custom-errors-in-javascript",
    question: "What are custom errors in JavaScript?",
    answer: `A custom error is a class that extends the built-in \`Error\`, letting you attach domain-specific information (an error code, a status, extra context) and distinguish different failure types via \`instanceof\`, instead of parsing a generic error's message string to figure out what actually went wrong.

\`\`\`js
class ValidationError extends Error {
  constructor(message, field) {
    super(message); // sets this.message, wires up the stack trace
    this.name = "ValidationError"; // shows up correctly in stack traces/logs
    this.field = field;
  }
}

function validateAge(age) {
  if (age < 0) throw new ValidationError("Age cannot be negative", "age");
}

try {
  validateAge(-5);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(\`Invalid field: \${error.field}\`); // extra structured data, not just a message
  } else {
    throw error; // re-throw anything that isn't the specific type this catch expects
  }
}
\`\`\`

### Classic interview gotcha

Forgetting to set \`this.name\` explicitly leaves a custom error's \`name\` as the inherited \`"Error"\` in stack traces and logs, even though \`error instanceof ValidationError\` still correctly returns \`true\` at runtime — the code works, but debugging output looks misleadingly generic. A subtler, real historical gotcha: extending built-ins like \`Error\` had broken \`instanceof\` behavior in some setups transpiling to ES5 (older Babel configurations targeting old browsers), where \`error instanceof ValidationError\` could incorrectly return \`false\` even though \`extends Error\` was used correctly — a target-environment-specific pitfall worth knowing if a project still transpiles this far down.

**Related:** [What is try/catch/finally?](/interview-prep/ff-javascript/try-catch-finally-explained) · [How do you handle errors in async/await?](/interview-prep/ff-javascript/error-handling-in-async-await)`,
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 80,
  },
  {
    collection: "ff-javascript",
    slug: "throw-vs-reject",
    question: "What is the difference between throw and reject?",
    answer: `\`throw\` immediately raises a synchronous exception that unwinds the current call stack looking for a \`catch\`; \`reject\` (calling a Promise's \`reject\` function, or an \`async\` function throwing) puts a Promise into its \`rejected\` state without unwinding anything synchronously — the rejection only becomes visible once something actually handles it via \`.catch()\` or \`await\` + \`try/catch\`.

\`\`\`js
function syncExample() {
  throw new Error("boom"); // stops execution right here, unwinds the stack immediately
}

function asyncExample() {
  return new Promise((resolve, reject) => {
    reject(new Error("boom")); // doesn't stop anything — just marks the Promise rejected
  });
}

try {
  syncExample();
} catch (e) {
  console.log("caught:", e.message); // catches synchronously, right away
}

asyncExample().catch((e) => console.log("caught:", e.message)); // caught later, asynchronously
\`\`\`

### Inside an async function, they converge

\`\`\`js
async function example() {
  throw new Error("boom"); // an async function's "throw" actually rejects its returned Promise
}
example().catch((e) => console.log(e.message)); // same effect as calling reject() directly
\`\`\`

### Classic interview gotcha

Throwing synchronously *inside* a Promise executor or inside a \`.then()\` callback is automatically converted into a rejection — you don't need to call \`reject()\` explicitly there. But throwing outside any Promise-aware context (a plain synchronous function, a \`setTimeout\` callback) is a genuinely uncaught exception that no \`.catch()\` anywhere can intercept, since nothing wrapped it into a Promise in the first place. A very common real bug: \`throw\` inside a \`setTimeout\` callback crashes with an unhandled exception, not a rejected Promise, no matter how many \`.catch()\`s surround the \`setTimeout\` call itself.

**Related:** [What are Promises and how do they work?](/interview-prep/ff-javascript/what-are-promises) · [How do you handle errors in async/await?](/interview-prep/ff-javascript/error-handling-in-async-await) · [What is try/catch/finally?](/interview-prep/ff-javascript/try-catch-finally-explained)`,
    difficulty: "medium",
    companies: ["Google", "Meta"],
    orderIndex: 81,
  },
  {
    collection: "ff-javascript",
    slug: "function-memoization-implementation",
    question: "What is function memoization and implement it.",
    answer: `This expands on the [basic memoization question](/interview-prep/ff-javascript/what-is-memoization) with the trickier real case: memoizing a **recursive** function correctly, where naive caching often fails to actually speed anything up.

### The trap: memoizing after the fact doesn't help recursion

\`\`\`js
function fib(n) {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}
const memoizedFib = memoize(fib); // wrapping fib from outside changes nothing internally
memoizedFib(40); // still painfully slow — fib's own recursive calls never go through the cache
\`\`\`

Wrapping an existing recursive function from the outside doesn't help, because the function's *own* internal calls to itself still call the original, un-memoized \`fib\`, not the wrapped version.

### The fix: the recursive calls have to go through the memoized version

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return function (n) {
    if (cache.has(n)) return cache.get(n);
    const result = fn(n);
    cache.set(n, result);
    return result;
  };
}

let fib;
fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2))); // "fib" inside now refers to the memoized wrapper

fib(40); // fast — a naive, un-memoized recursive fib(40) makes over a billion calls
\`\`\`

### Multi-argument memoization

A single \`Map\` keyed by one argument doesn't work for functions taking several — a nested \`Map\`-per-argument avoids the cost of serializing every call's arguments into a string key:

\`\`\`js
function memoizeMultiArg(fn) {
  const cache = new Map();
  return function (a, b) {
    if (!cache.has(a)) cache.set(a, new Map());
    const inner = cache.get(a);
    if (inner.has(b)) return inner.get(b);
    const result = fn(a, b);
    inner.set(b, result);
    return result;
  };
}
\`\`\`

### Classic interview gotcha

Memoizing a recursive function only helps if the function's *own* recursive calls actually go through the memoized wrapper — the \`let fib; fib = memoize((n) => ... fib(n - 1) ...)\` pattern above works specifically because the inner arrow function looks up \`fib\` at *call time*, not at the time the function was defined. Simply doing \`fib = memoize(fib)\` after \`fib\` is already fully defined doesn't retroactively fix its internal self-references — this is a very common source of "I added memoization but it's not actually any faster" bugs.

**Related:** [What is memoization? Implement a simple memoize function.](/interview-prep/ff-javascript/what-is-memoization) · [What are closures and how do they work?](/interview-prep/ff-javascript/what-are-closures)`,
    difficulty: "hard",
    companies: ["Amazon", "Google", "Uber"],
    orderIndex: 82,
  },
  {
    collection: "ff-javascript",
    slug: "composition-vs-inheritance",
    question: "What is the difference between composition and inheritance?",
    answer: `Inheritance models an "is-a" relationship — a subclass extends a parent class and receives its behavior automatically, tightly coupling the two; composition models a "has-a" relationship — an object is built by combining smaller, independent pieces of behavior, each of which can be swapped or reused without touching a class hierarchy at all.

\`\`\`js
// Inheritance — Dog IS-A Animal, tightly coupled to Animal's implementation
class Animal {
  move() {
    return "moving";
  }
}
class Dog extends Animal {
  bark() {
    return "woof";
  }
}

// Composition — a dog HAS a "mover" behavior and a "barker" behavior, mixed in independently
const canMove = { move: () => "moving" };
const canBark = { bark: () => "woof" };
const dog = { ...canMove, ...canBark };
\`\`\`

| | Inheritance | Composition |
|---|---|---|
| Relationship | "is-a" | "has-a" |
| Coupling | Tight — subclass depends on parent's internals | Loose — pieces don't know about each other |
| Reuse across unrelated types | Hard — forces a shared ancestor | Easy — mix any behaviors into anything |
| Changing shared behavior | Affects every descendant, even distant ones | Affects only what explicitly composed that piece |

### Classic interview gotcha

Deep inheritance chains create the "fragile base class problem" — changing a method on a distant ancestor can silently break every descendant relying on the old behavior, including ones the person making the change has never heard of or tested against. This is exactly why "favor composition over inheritance" became a widely repeated principle (popularized by the Gang of Four's design patterns book) — composition confines the blast radius of a change to the specific pieces actually being combined, rather than an entire inheritance tree several levels deep.

**Related:** [Explain the concept of prototypal inheritance.](/interview-prep/ff-javascript/prototypal-inheritance-explained) · [What are design patterns? Name 3 common ones in JS.](/interview-prep/ff-javascript/what-are-design-patterns)`,
    difficulty: "hard",
    companies: ["Meta", "Airbnb"],
    orderIndex: 83,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-array-from",
    question: "What is Array.from() used for?",
    answer: `\`Array.from()\` creates a real array from an array-like object (something with a \`.length\` and indexed properties, like \`arguments\` or a DOM \`NodeList\`) or from any iterable (a \`Set\`, \`Map\`, generator, string) — turning something that only superficially resembles a collection into an object with the full, real \`Array.prototype\` method set.

\`\`\`js
Array.from("abc");                    // ["a", "b", "c"] — a string is iterable
Array.from(new Set([1, 2, 2, 3]));   // [1, 2, 3] — any iterable works

function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0); // arguments isn't a real array
}

// A NodeList is array-like, but has no .map/.filter of its own
Array.from(document.querySelectorAll("li")).map((li) => li.textContent);

// The optional second argument acts like a built-in .map(), in one pass
Array.from({ length: 5 }, (_, i) => i * 2); // [0, 2, 4, 6, 8]
\`\`\`

### Classic interview gotcha

\`Array.from({ length: 5 })\` works even though a plain \`{ length: 5 }\` object is neither a real array nor an iterable — \`Array.from\` accepts *array-like* objects (anything with a numeric \`.length\`) in addition to iterables, a distinctly wider acceptance than most other array methods, which expect a genuine iterable. This is exactly why \`Array.from({ length: N }, mapFn)\` has become a common idiom for generating a sequence of N computed values, without needing a real array or an explicit \`for\` loop to build one first.

**Related:** [Explain the difference between \`Array.map\`, \`Array.filter\`, and \`Array.reduce\`.](/interview-prep/ff-javascript/array-map-filter-reduce-differences) · [What is the difference between \`arguments\` object and rest params?](/interview-prep/ff-javascript/arguments-object-vs-rest-parameters)`,
    difficulty: "medium",
    companies: ["Google", "Bloomberg"],
    orderIndex: 84,
  },
  {
    collection: "ff-javascript",
    slug: "lazy-loading-explained",
    question: "Explain the concept of lazy loading.",
    answer: `Lazy loading defers fetching or rendering a resource — an image, a component, a route's code — until it's actually needed, typically when it scrolls into view or a route is navigated to, instead of loading everything up front. This cuts the initial page weight and speeds up first render.

\`\`\`html
<img src="photo.jpg" loading="lazy" alt="…" /> <!-- native browser lazy loading -->
\`\`\`

\`\`\`js
// Manual lazy loading via IntersectionObserver, before the "loading" attribute existed
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src; // swap in the real src only once visible
      observer.unobserve(entry.target);
    }
  });
});
document.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img));
\`\`\`

\`\`\`jsx
// Lazy loading a component (code-splitting) in React
const HeavyChart = React.lazy(() => import("./HeavyChart"));
\`\`\`

### Classic interview gotcha

The native \`loading="lazy"\` attribute doesn't defer images that are already within (or very close to) the initial viewport on page load — the browser is deliberately conservative about what counts as "far enough away to defer," so images near the fold may still load immediately regardless of the attribute. It's also worth knowing that lazy-loading the *largest* above-the-fold image (a common hero image) is actively harmful for Core Web Vitals — it delays your Largest Contentful Paint, which is exactly the metric that image usually determines. Lazy loading should be reserved for genuinely below-the-fold content.

**Related:** [What is the Intersection Observer API?](/interview-prep/ff-javascript/intersection-observer-api)`,
    difficulty: "medium",
    companies: ["Amazon", "Shopify"],
    orderIndex: 85,
  },
  {
    collection: "ff-javascript",
    slug: "bitwise-operators-in-javascript",
    question: "What are bitwise operators in JavaScript?",
    answer: `Bitwise operators (\`&\`, \`|\`, \`^\`, \`~\`, \`<<\`, \`>>\`, \`>>>\`) operate on the 32-bit integer representation of a number, manipulating individual bits directly — rarely needed in typical frontend code, but they show up in flag/permission systems, low-level performance tricks, and certain numeric shortcuts.

| Operator | Name | Example | Result |
|---|---|---|---|
| \`&\` | AND | \`5 & 3\` | \`1\` |
| \`\\|\` | OR | \`5 \\| 3\` | \`7\` |
| \`^\` | XOR | \`5 ^ 3\` | \`6\` |
| \`~\` | NOT | \`~5\` | \`-6\` |
| \`<<\` | left shift | \`5 << 1\` | \`10\` |
| \`>>\` | sign-propagating right shift | \`-5 >> 1\` | \`-3\` |
| \`>>>\` | zero-fill right shift | \`-5 >>> 1\` | a large positive number |

### A real use: bit flags

\`\`\`js
const READ = 1;  // 0001
const WRITE = 2; // 0010
const EXEC = 4;   // 0100

const permissions = READ | WRITE;    // 0011 — combine flags with OR
(permissions & WRITE) !== 0;          // true — check for a flag with AND
\`\`\`

### Classic interview gotcha

JavaScript numbers are IEEE-754 doubles, but bitwise operators convert their operand to a **32-bit signed integer** first, perform the operation, then convert back — any number outside the 32-bit signed integer range (±2,147,483,648) silently gets truncated or wrapped in a way that produces a genuinely surprising result, not an error. \`~5\` evaluating to \`-6\` (rather than some large positive number) is itself a direct consequence of this signed-32-bit conversion, and it's a common source of confusion for anyone expecting bitwise NOT to behave like boolean \`!\`.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "hard",
    companies: ["Google", "Bloomberg"],
    orderIndex: 86,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-nan-and-how-to-check",
    question: "What is NaN and how to check for it?",
    answer: `\`NaN\` ("Not a Number") is a special numeric value representing the result of an invalid or undefined mathematical operation — and, famously, it's the only value in JavaScript that is never equal to itself, which is exactly why \`Number.isNaN()\`, not \`===\`, is the correct way to check for it.

\`\`\`js
0 / 0;           // NaN
"abc" * 2;       // NaN
Math.sqrt(-1);   // NaN

NaN === NaN;        // false — NaN is never equal to anything, including itself
Number.isNaN(NaN);   // true — the reliable check
isNaN("abc");         // true — but coerces its argument first, see the gotcha below
Number.isNaN("abc");  // false — doesn't coerce; "abc" simply isn't the NaN value
\`\`\`

### Classic interview gotcha

The global \`isNaN()\` function coerces its argument to a number *before* checking, so \`isNaN("abc")\` returns \`true\` even though \`"abc"\` obviously isn't \`NaN\` itself — it's \`true\` only because \`Number("abc")\` produces \`NaN\`, and that coerced result is what actually gets checked. \`Number.isNaN()\` (added in ES2015 specifically to fix this) performs no coercion at all, only returning \`true\` for the actual \`NaN\` value. Always prefer \`Number.isNaN()\` unless the coercing behavior is genuinely what's wanted.

**Related:** [Explain the concept of coercion in JavaScript.](/interview-prep/ff-javascript/coercion-in-javascript) · [What is typeof and what are its quirks?](/interview-prep/ff-javascript/typeof-operator-and-quirks)`,
    difficulty: "medium",
    companies: ["Meta", "Netflix"],
    orderIndex: 87,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-infinity-in-javascript",
    question: "What is Infinity in JavaScript?",
    answer: `\`Infinity\` is a special numeric value representing a mathematical value larger than any finite number — produced by dividing a positive number by zero, or by a calculation that overflows the largest representable number — with a corresponding \`-Infinity\` for the negative case.

\`\`\`js
1 / 0;    // Infinity
-1 / 0;   // -Infinity
Infinity > Number.MAX_VALUE; // true — genuinely larger than the largest finite double
Infinity + 1;                  // Infinity — arithmetic with Infinity stays Infinity
Infinity - Infinity;            // NaN — an indeterminate result, not a number

Number.isFinite(1 / 0); // false
Number.isFinite(42);      // true
\`\`\`

### Classic interview gotcha

\`Infinity\` is a genuinely usable value in real comparisons, not just an edge case to guard against — a common, intentional idiom is initializing a "running minimum" accumulator to \`Infinity\`, since any real number will be smaller than it on the very first comparison, exactly mirroring how \`-Infinity\` is the natural starting point for a "running maximum":

\`\`\`js
function min(numbers) {
  let smallest = Infinity;
  for (const n of numbers) if (n < smallest) smallest = n;
  return smallest;
}
\`\`\`

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "easy",
    companies: ["Amazon", "Adobe"],
    orderIndex: 88,
  },
  {
    collection: "ff-javascript",
    slug: "property-descriptors-explained",
    question: "What are property descriptors in JavaScript?",
    answer: `Every object property has an underlying descriptor — not just a value — controlling whether it can be reassigned (\`writable\`), enumerated in loops and \`Object.keys\` (\`enumerable\`), or reconfigured/deleted (\`configurable\`), plus an alternative \`get\`/\`set\` pair instead of a plain \`value\`. Properties created with normal assignment get all three flags set to \`true\` by default, but \`Object.defineProperty()\` lets you set them explicitly.

\`\`\`js
const obj = { name: "Rex" };
Object.getOwnPropertyDescriptor(obj, "name");
// { value: "Rex", writable: true, enumerable: true, configurable: true }

Object.defineProperty(obj, "id", {
  value: 123,
  writable: false,     // reassigning obj.id silently fails (throws in strict mode)
  enumerable: false,    // won't show up in Object.keys(obj) or for...in
  configurable: false,  // can't be deleted or redefined again
});

Object.keys(obj); // ["name"] — "id" is hidden from enumeration
obj.id = 456;        // silently does nothing (or throws, in strict mode)
obj.id;                // still 123
\`\`\`

### Classic interview gotcha

This is exactly the underlying mechanism \`Object.freeze()\` and \`Object.seal()\` are built on — \`Object.freeze()\` is essentially "set \`writable: false\` and \`configurable: false\` on every own property, and prevent adding new ones." Understanding descriptors directly explains *why* freeze and seal behave the way they do, rather than treating them as unrelated built-in magic. It's also why most built-in prototype methods (like \`Array.prototype.map\`) are non-enumerable by default — so \`for...in\` on an array doesn't accidentally pick them up.

**Related:** [How does \`Object.freeze()\` differ from \`const\`?](/interview-prep/ff-javascript/object-freeze-vs-const) · [What is the difference between \`Object.seal()\` and \`Object.freeze()\`?](/interview-prep/ff-javascript/object-seal-vs-object-freeze) · [What is the difference between \`for...in\` and \`for...of\`?](/interview-prep/ff-javascript/for-in-vs-for-of)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta"],
    isFf75: true,
    orderIndex: 89,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-object-create",
    question: "What is Object.create()?",
    answer: `\`Object.create(proto, propertiesObject)\` creates a new object with its \`[[Prototype]]\` set directly to whatever object is passed as \`proto\` — the most explicit, direct way to set up prototypal inheritance — and its optional second argument lets you define the new object's own properties with full property-descriptor control in the same call.

\`\`\`js
const animal = {
  speak() {
    return \`\${this.name} makes a sound.\`;
  },
};

const dog = Object.create(animal, {
  name: { value: "Rex", writable: true, enumerable: true, configurable: true },
});

dog.speak(); // "Rex makes a sound." — found via the [[Prototype]] link to animal
Object.getPrototypeOf(dog) === animal; // true

const dictionary = Object.create(null); // no prototype at all — not even Object.prototype
dictionary.toString; // undefined — genuinely has none of Object.prototype's methods
\`\`\`

### Classic interview gotcha

\`Object.create(null)\` produces an object with **no prototype whatsoever** — not even \`Object.prototype\` — meaning it has none of the usual inherited methods (\`.toString()\`, \`.hasOwnProperty()\`, \`.valueOf()\`) and can't be coerced to a string the normal way. This makes it a genuinely useful choice for a plain "dictionary" object meant purely as a key-value map, since there's zero risk of a key like \`"toString"\` or \`"constructor"\` accidentally colliding with an inherited method. But it also means calling \`dictionary.hasOwnProperty(key)\` directly throws a \`TypeError\`, since \`hasOwnProperty\` itself doesn't exist on it — the safe pattern is \`Object.hasOwn(dictionary, key)\` instead.

**Related:** [Explain the concept of prototypal inheritance.](/interview-prep/ff-javascript/prototypal-inheritance-explained) · [Explain how the prototype chain works.](/interview-prep/ff-javascript/how-the-prototype-chain-works) · [What are property descriptors in JavaScript?](/interview-prep/ff-javascript/property-descriptors-explained)`,
    difficulty: "hard",
    companies: ["Meta", "Vercel"],
    orderIndex: 90,
  },
  {
    collection: "ff-javascript",
    slug: "arguments-object-vs-rest-parameters",
    question: "What is the difference between arguments object and rest params?",
    answer: `\`arguments\` is an array-*like* object automatically available inside any regular (non-arrow) function, containing every argument actually passed in call order; rest parameters (\`...args\`) are a real \`Array\` declared explicitly in the function signature, giving full array methods directly and, unlike \`arguments\`, working inside arrow functions too.

\`\`\`js
function oldStyle() {
  console.log(arguments);       // Arguments(3) [1, 2, 3] — array-like, not a real array
  console.log(arguments.map);    // undefined — no array methods available directly
  return Array.from(arguments).reduce((a, b) => a + b, 0); // has to be converted first
}

function modern(...args) {
  console.log(args);              // [1, 2, 3] — a real array
  return args.reduce((a, b) => a + b, 0); // array methods work directly
}

const arrow = () => {
  console.log(arguments); // ReferenceError — arrow functions have no arguments object at all
};
\`\`\`

| | \`arguments\` | Rest parameters |
|---|---|---|
| Real array? | No — array-like | Yes |
| Works in arrow functions? | No | Yes |
| Captures | Every argument, regardless of named params | Only what's left after named params |

### Classic interview gotcha

\`arguments\` always contains *every* argument passed, completely independent of how many named parameters the function declares — calling \`function f(a, b) {}\` with 5 arguments still leaves all 5 accessible via \`arguments\`, even though only \`a\` and \`b\` are named. Rest parameters, by contrast, only capture whatever's left over *after* the named parameters — \`function f(a, b, ...rest)\` called with 5 arguments puts exactly 3 into \`rest\`. Conflating these two behaviors — "sees everything" versus "sees only the leftover" — is a common source of confusion when converting old \`arguments\`-based code to rest parameters.

**Related:** [What is Array.from() used for?](/interview-prep/ff-javascript/what-is-array-from) · [What are arrow functions and how are they different from regular functions?](/interview-prep/ff-javascript/arrow-functions-vs-regular-functions) · [What is the spread and rest operator?](/interview-prep/ff-javascript/spread-and-rest-operator)`,
    difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    orderIndex: 91,
  },
  {
    collection: "ff-javascript",
    slug: "tagged-template-literals-deep-dive",
    question: "What are tagged template literals?",
    answer: `A tagged template is a function call in disguise — writing a function name directly in front of a template literal, with no parentheses, desugars to calling that function with the literal's static text segments as the first argument and every interpolated value as the rest. That first argument, conventionally named \`strings\`, is an array with a special \`.raw\` property giving the *unescaped* source text alongside it. This mechanism is what production libraries like styled-components, \`gql\`, and SQL-escaping tag functions are actually built on — not just a syntax curiosity. (See [the basics of template literals and tagged templates](/interview-prep/ff-javascript/template-literals-and-tagged-templates) for the fundamentals; this expands into \`.raw\` and real-world use.)

\`\`\`js
function sql(strings, ...values) {
  // naive escaping — real libraries do this far more carefully
  return strings.reduce((query, str, i) => {
    const value = values[i] !== undefined ? \`'\${String(values[i]).replace(/'/g, "''")}'\` : "";
    return query + str + value;
  }, "");
}

const userId = "1'; DROP TABLE users; --";
sql\`SELECT * FROM users WHERE id = \${userId}\`;
// the injected value is safely escaped as a literal string, not executed as SQL
\`\`\`

### \`String.raw\` and the unescaped source

\`\`\`js
String.raw\`Line 1\\nLine 2\`; // keeps the backslash and "n" as two literal characters, no newline
\`Line 1\\nLine 2\`;             // a plain template literal interprets \\n as an actual newline character
\`\`\`

### Classic interview gotcha

The \`strings.raw\` array gives access to the literal's **unescaped source text**, exactly as typed, before JavaScript processes any escape sequences (\`\\n\`, \`\\t\`, unicode escapes) — this is specifically why \`String.raw\` exists, and why it's the standard choice for anything meant to preserve literal backslashes verbatim (Windows file paths, regex source text). A tag function that only reads \`strings\` (not \`strings.raw\`) still gets the *processed* text with escapes already interpreted — reaching for \`.raw\` is a deliberate, separate choice, not the default behavior.

**Related:** [What are template literals and tagged templates?](/interview-prep/ff-javascript/template-literals-and-tagged-templates) · [Explain XSS and CSRF attacks and prevention.](/interview-prep/ff-javascript/xss-and-csrf-explained)`,
    difficulty: "hard",
    companies: ["Stripe", "Shopify"],
    orderIndex: 92,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-globalthis",
    question: "What is the globalThis object?",
    answer: `\`globalThis\` is a standardized way to access the global object regardless of which JavaScript environment code is running in — \`window\` in a browser, \`self\` in a Web Worker, \`global\` in Node — letting the same code reference "the global object" portably without environment-specific branching.

\`\`\`js
// Before globalThis existed, code had to guess its environment
const globalRef = typeof window !== "undefined" ? window
  : typeof self !== "undefined" ? self
  : typeof global !== "undefined" ? global
  : this;

// With globalThis, the same reference works everywhere
globalThis.myGlobalFlag = true;

console.log(typeof globalThis); // "object" in every environment
\`\`\`

### Classic interview gotcha

\`globalThis\` doesn't create a *new* global object — it's just a standardized reference to whichever one already exists in the current environment, so mutating a property on \`globalThis\` in a browser really is mutating \`window\`, with all the same risks (naming collisions, unintentionally leaking a variable globally) that directly assigning to \`window\` always had. Writing portable cross-environment code is the entire reason \`globalThis\` exists, not a safer way to use global state — the underlying risks of relying on global mutable state are completely unchanged.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    companies: ["Google", "Netflix"],
    orderIndex: 93,
  },
  {
    collection: "ff-javascript",
    slug: "abortcontroller-api-explained",
    question: "What is the AbortController API?",
    answer: `\`AbortController\` provides a standard way to cancel an in-progress asynchronous operation — most commonly a \`fetch()\` request — by creating a controller, passing its \`.signal\` to the operation, and calling \`.abort()\` later to cancel it. The operation itself has to explicitly support and check the signal for this to actually do anything.

\`\`\`js
const controller = new AbortController();

fetch("/api/slow-endpoint", { signal: controller.signal })
  .then((res) => res.json())
  .catch((error) => {
    if (error.name === "AbortError") {
      console.log("request was cancelled");
    }
  });

setTimeout(() => controller.abort(), 3000); // cancel it if it takes longer than 3 seconds
\`\`\`

### A very common real use: cancelling a stale request

\`\`\`js
let currentController;
function search(query) {
  currentController?.abort(); // cancel any previous, now-stale request
  currentController = new AbortController();
  return fetch(\`/api/search?q=\${query}\`, { signal: currentController.signal });
}
\`\`\`

### Classic interview gotcha

Calling \`.abort()\` doesn't retroactively "undo" work a server has already started doing — the browser stops waiting for and processing the response, but if the request had already reached the server and triggered a side effect (writing to a database), that side effect still happened, exactly the same class of gotcha already covered in the CORS question about non-GET requests. \`AbortController\` cancels the *client's* wait for a result, not necessarily the server-side work behind it.

**Related:** [What are Promises and how do they work?](/interview-prep/ff-javascript/what-are-promises) · [What is CORS and how do you handle it?](/interview-prep/ff-javascript/what-is-cors)`,
    difficulty: "hard",
    companies: ["Google", "Uber"],
    orderIndex: 94,
  },
  {
    collection: "ff-javascript",
    slug: "intersection-observer-api",
    question: "What is the Intersection Observer API?",
    answer: `\`IntersectionObserver\` lets you efficiently detect when an element enters or exits the browser's viewport (or another specified container), without manually calculating element positions on every scroll event — the browser tracks intersection changes itself and only calls your callback when something actually changes, dramatically cheaper than a scroll-event listener recalculating positions on every frame.

\`\`\`js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(\`\${entry.target.id} is now visible\`);
      }
    });
  },
  { threshold: 0.5 }, // fire when at least 50% of the element is visible
);

document.querySelectorAll(".card").forEach((card) => observer.observe(card));
\`\`\`

Real use cases: lazy-loading images (see the dedicated question), infinite scroll (loading more content as a sentinel element comes into view), triggering entrance animations, and tracking ad/content viewability.

### Classic interview gotcha

Before \`IntersectionObserver\` existed, detecting visibility required listening to \`scroll\` events and manually calling \`getBoundingClientRect()\` on every single scroll tick — an expensive combination that forces a synchronous layout recalculation ("layout thrash") on every scroll frame, directly hurting scroll performance. \`IntersectionObserver\` runs asynchronously, off the main scroll-handling path entirely — that's the actual performance reason it replaced manual scroll-position calculation, not just a nicer-looking API.

**Related:** [Explain the concept of lazy loading.](/interview-prep/ff-javascript/lazy-loading-explained)`,
    difficulty: "medium",
    companies: ["Meta", "Airbnb"],
    orderIndex: 95,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-resizeobserver",
    question: "What is ResizeObserver?",
    answer: `\`ResizeObserver\` lets you efficiently detect when an element's size changes — for any reason (content changing, a media query, a flex/grid layout shift, a manual resize) — calling your callback with the new dimensions, without needing to poll or listen to the imprecise, viewport-only \`window.resize\` event.

\`\`\`js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(\`\${entry.target.id} is now \${width}x\${height}\`);
  }
});

observer.observe(document.querySelector(".sidebar"));
\`\`\`

### Classic interview gotcha

\`window.resize\` only fires when the *browser window itself* changes size — it tells you nothing about an individual element resizing for any other reason (its content changed, a parent's flexbox layout shifted, a sibling appeared or disappeared). This is exactly the gap \`ResizeObserver\` fills, and it's the mechanism CSS Container Queries are effectively built on — \`ResizeObserver\` is what makes "a component that responds to its own container's size, not the viewport's" possible at all in JavaScript-driven layouts that predate native container query support.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    companies: ["Google", "Adobe"],
    orderIndex: 96,
  },
  {
    collection: "ff-javascript",
    slug: "how-to-implement-a-polyfill",
    question: "How do you implement a polyfill?",
    answer: `A polyfill is code that detects whether a modern feature is missing in the current environment and, if so, implements equivalent behavior manually — letting code written against a newer API run correctly in an older environment that never shipped that feature natively.

\`\`\`js
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement, fromIndex = 0) {
    // A negative fromIndex counts back from the end, clamped at 0 — easy to miss
    const start = fromIndex < 0 ? Math.max(this.length + fromIndex, 0) : fromIndex;
    for (let i = start; i < this.length; i++) {
      if (this[i] === searchElement || (Number.isNaN(this[i]) && Number.isNaN(searchElement))) {
        return true;
      }
    }
    return false;
  };
}
\`\`\`

The \`if (!Array.prototype.includes)\` feature-detection guard is essential — it lets the polyfill safely coexist in environments that already have the real, native implementation, only stepping in where the feature is genuinely missing.

### Classic interview gotcha

A polyfill can only ever *approximate* real spec behavior — the hand-rolled \`.includes()\` above, for instance, has to remember the exact \`NaN\`-equals-\`NaN\` special case (the same SameValueZero comparison rule already covered in the \`Set\` question) that the native version handles automatically. Missing an edge case like this produces a polyfill that *looks* correct in casual testing but diverges from the real spec in exactly the situations most likely to go unnoticed until production — which is why teams generally prefer a well-tested, actively maintained polyfill library (like \`core-js\`) over hand-writing one, except for the simplest cases.

**Related:** [What is \`Set\` and how is it different from \`Array\`?](/interview-prep/ff-javascript/set-vs-array) · [What is NaN and how to check for it?](/interview-prep/ff-javascript/what-is-nan-and-how-to-check)`,
    difficulty: "hard",
    companies: ["Meta", "Amazon"],
    orderIndex: 97,
  },
  {
    collection: "ff-javascript",
    slug: "function-declaration-vs-expression",
    question: "What is the difference between declaration and expression functions?",
    answer: `A function declaration (\`function name() {}\`) is hoisted in full, body included, so it can be called before the line it's written on; a function expression (\`const name = function () {}\`, or an arrow function) is just a value assigned to a variable, so it follows that variable's own hoisting rules and can't be called until the assignment line has actually run.

\`\`\`js
sayHi(); // "hi" — works, function declarations hoist completely

function sayHi() {
  return "hi";
}

sayBye(); // ReferenceError — sayBye is in its own TDZ (const), not just undefined
const sayBye = function () {
  return "bye";
};
\`\`\`

### Named function expressions

\`\`\`js
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // "fact" is usable *inside* the expression itself
};
factorial(5); // 120
fact;          // ReferenceError — "fact" isn't visible outside the expression at all
\`\`\`

### Classic interview gotcha

A **named** function expression's name is only visible *inside* the function's own body (useful for self-recursion, as in the \`factorial\`/\`fact\` example above) — it isn't the same as the outer variable it's assigned to, and it's not accessible anywhere outside that function, which surprises people who expect naming a function expression to work exactly like a declaration. This distinct, narrow scoping rule exists specifically so an otherwise-anonymous function expression can still recurse by name without polluting any outer scope with that name.

**Related:** [Explain hoisting in JavaScript.](/interview-prep/ff-javascript/hoisting-in-javascript) · [What are arrow functions and how are they different from regular functions?](/interview-prep/ff-javascript/arrow-functions-vs-regular-functions)`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Amazon", "Bloomberg"],
    orderIndex: 98,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-an-async-generator",
    question: "What is an async generator?",
    answer: `An async generator (\`async function*\`) combines both mechanisms at once — like a regular generator, it can \`yield\` multiple values over time, consumed via \`for await...of\`; like an \`async\` function, it can \`await\` inside its body — making it the natural way to lazily produce a sequence of values that each require an asynchronous step to compute, like paginated API results or a stream of chunks.

\`\`\`js
async function* fetchAllPages(url) {
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl); // await works directly inside an async generator
    const page = await res.json();
    yield page.items;                  // yield works too — both together
    nextUrl = page.nextUrl;
  }
}

for await (const items of fetchAllPages("/api/items")) {
  console.log(items); // each page's items, processed as soon as that page arrives
}
\`\`\`

### Classic interview gotcha

Consuming an async generator requires \`for await...of\`, not a plain \`for...of\` — using the ordinary \`for...of\` on an async generator throws a \`TypeError\`, since a plain \`for...of\` expects each \`.next()\` call to return a value synchronously, while an async generator's \`.next()\` returns a *Promise* of \`{ value, done }\` that needs to be awaited before it's usable. This distinction — plain iterables versus async iterables, each requiring their own matching loop syntax — is exactly why the two loop forms exist as separate syntax, rather than one form handling both.

**Related:** [What are generators and iterators?](/interview-prep/ff-javascript/generators-and-iterators) · [What are \`Symbol.iterator\` and custom iterables?](/interview-prep/ff-javascript/symbol-iterator-and-custom-iterables) · [Explain async/await and how it relates to Promises.](/interview-prep/ff-javascript/async-await-explained)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Netflix"],
    orderIndex: 99,
  },
  {
    collection: "ff-javascript",
    slug: "what-is-bigint",
    question: "What is BigInt in JavaScript?",
    answer: `\`BigInt\` is a numeric primitive that can represent integers of arbitrary size, exactly — regular JavaScript numbers are IEEE-754 doubles and lose precision above \`Number.MAX_SAFE_INTEGER\` (2^53 − 1), while \`BigInt\` values (written with an \`n\` suffix, or via \`BigInt(value)\`) stay exact no matter how large.

\`\`\`js
Number.MAX_SAFE_INTEGER;      // 9007199254740991
Number.MAX_SAFE_INTEGER + 1;  // 9007199254740992 — coincidentally still looks right
Number.MAX_SAFE_INTEGER + 2;  // 9007199254740992 — clearly wrong now, precision was lost

9007199254740991n + 2n; // 9007199254740993n — BigInt stays exact

typeof 10n; // "bigint"
\`\`\`

### Classic interview gotcha

\`BigInt\` and regular \`Number\` **cannot be mixed** in arithmetic — \`1n + 1\` throws a \`TypeError\` ("Cannot mix BigInt and other types"), not a silent coercion in either direction, forcing an explicit conversion (\`Number(1n) + 1\` or \`1n + BigInt(1)\`) every time the two need to interact. This is a deliberate design choice — silently converting between them could quietly lose the exact precision \`BigInt\` exists to guarantee — but it means introducing \`BigInt\` into an existing codebase touches every arithmetic expression it comes into contact with, not just the one declaration site.

**Related:** none yet — no Learn concept currently covers this topic.`,
    difficulty: "medium",
    isPremium: true,
    companies: ["Meta", "Stripe"],
    orderIndex: 100,
  },
  {
    collection: "ff-javascript",
    slug: "object-seal-vs-object-freeze",
    question: "What is the difference between Object.seal() and Object.freeze()?",
    answer: `\`Object.seal()\` prevents adding or removing properties from an object but still allows modifying the *values* of existing writable properties; \`Object.freeze()\` goes further, additionally locking every existing property's value too — seal keeps the object's shape fixed, freeze locks the shape **and** the values.

\`\`\`js
const sealed = Object.seal({ name: "Rex" });
sealed.name = "Max"; // works — existing properties are still writable
sealed.age = 3;        // silently fails — can't add a new property
delete sealed.name;     // silently fails — can't remove one either
sealed;                    // { name: "Max" }

const frozen = Object.freeze({ name: "Rex" });
frozen.name = "Max"; // silently fails — values are locked too
frozen;                 // { name: "Rex" } — completely unchanged
\`\`\`

| | Add new properties | Remove properties | Modify existing values |
|---|---|---|---|
| \`Object.seal()\` | No | No | Yes |
| \`Object.freeze()\` | No | No | No |

### Classic interview gotcha

Both \`Object.seal()\` and \`Object.freeze()\` are **shallow**, exactly like the freeze-only gotcha already covered — sealing or freezing an object does nothing to any nested object inside it, so \`sealed.nested.value = "x"\` or \`frozen.nested.value = "x"\` both still succeed freely, since the *nested* object was never itself sealed or frozen. A genuinely deep seal or freeze requires a manual recursive walk, the same way a true deep freeze does.

**Related:** [How does \`Object.freeze()\` differ from \`const\`?](/interview-prep/ff-javascript/object-freeze-vs-const) · [What are property descriptors in JavaScript?](/interview-prep/ff-javascript/property-descriptors-explained)`,
    difficulty: "hard",
    isPremium: true,
    companies: ["Google", "Meta"],
    orderIndex: 101,
  },
];

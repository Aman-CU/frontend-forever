import type { ChallengeSeed } from "../types";

export const JAVASCRIPT_RUNTIME_CHALLENGES: ChallengeSeed[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // Practice — standalone JavaScript Interview Roadmap (Feature 28 follow-up).
  // These have no conceptSlug: they exist only for Practice's own catalog,
  // never for a Learn Challenge tab. orderIndex follows the roadmap's stage
  // sequence (Stage 1 = 1..13, Stage 2 = 14..22, ...) so Practice's per-
  // category list renders in the roadmap's intended learning order.
  // ─────────────────────────────────────────────────────────────────────────

  // Stage 1 — Core Mechanics of JavaScript
  {
    slug: "improve-full-name-formatter",
    category: "javascript-runtime",
    title: "Improve a Function: Safe Full Name",
    description: `A warm-up in cleaning up a naive function so it handles the inputs real data actually throws at it.

## The problem

\`getFullName(user)\` needs to join whichever name parts a user actually has — some users have no middle name, some have an empty string instead of \`undefined\`, some are missing a first name entirely.

## Your task

Write \`getFullName(user)\`, where \`user\` may have \`first\`, \`middle\`, and \`last\` string fields, any of which can be missing or falsy. Join the parts that exist with single spaces, in order.

\`\`\`js
getFullName({ first: "Ada", last: "Lovelace" }) // "Ada Lovelace"
getFullName({ last: "Turing" }) // "Turing"
\`\`\``,
    difficulty: "easy",
    starterCode: `function getFullName(user) {
  // user: { first, middle, last } — any of these may be missing or falsy
}`,
    solutionCode: `function getFullName(user) {
  return [user.first, user.middle, user.last].filter(Boolean).join(" ");
}`,
    testCases: [
      { input: '{ first: "Ada", last: "Lovelace" }', expected: '"Ada Lovelace"', label: "Joins first and last" },
      { input: '{ first: "Ada", middle: "", last: "Lovelace" }', expected: '"Ada Lovelace"', label: "Skips an empty middle name" },
      { input: '{ first: "Grace", middle: "Brewster", last: "Hopper" }', expected: '"Grace Brewster Hopper"', label: "Joins all three parts" },
      { input: '{ last: "Turing" }', expected: '"Turing"', label: "A single available part with no extra spaces" },
    ],
    hints: [
      "Build an array of the three fields, filter out the falsy ones, then join.",
      "Boolean is a handy filter predicate for dropping undefined, null, and empty strings in one pass.",
    ],
    orderIndex: 1001,
  },

  {
    slug: "classify-nullish-value",
    companies: ["Amazon", "Bloomberg"],
    category: "javascript-runtime",
    title: "undefined vs null: Classify a Value",
    description: `\`typeof null === "object"\` is JavaScript's most infamous gotcha, and it's exactly why \`typeof\` alone can't tell you whether a value is nullish. **Nullish** means "is exactly \`null\` or \`undefined\`" — a narrower category than **falsy**, which also includes \`0\`, \`""\`, and \`NaN\`. That distinction is what optional chaining (\`?.\`) and the nullish coalescing operator (\`??\`) are built around, so it's worth making second nature.

## Your task

Write \`classifyNullish(value)\` that returns:

- \`"undefined"\` if the value is exactly \`undefined\`
- \`"null"\` if the value is exactly \`null\`
- \`"value"\` for anything else (including \`0\`, \`""\`, and \`NaN\`, which are falsy but **not** nullish)

\`\`\`js
classifyNullish(undefined) // "undefined"
classifyNullish(null) // "null"
classifyNullish(0) // "value" — falsy, but not nullish
\`\`\``,
    difficulty: "easy",
    starterCode: `function classifyNullish(value) {
  // return "undefined", "null", or "value"
}`,
    solutionCode: `function classifyNullish(value) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  return "value";
}`,
    testCases: [
      { input: "undefined", expected: '"undefined"', label: "undefined is classified as undefined" },
      { input: "null", expected: '"null"', label: "null is classified as null" },
      { input: "0", expected: '"value"', label: "0 is falsy but not nullish" },
      { input: "NaN", expected: '"value"', label: "NaN is not nullish either" },
    ],
    hints: [
      "Use strict equality (===) — typeof won't distinguish null from an object.",
      "Falsy is not the same thing as nullish: 0, '', and NaN are all falsy but real values.",
    ],
    orderIndex: 1002,
  },

  {
    slug: "custom-object-is",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Implement Object.is()",
    description: `\`Object.is()\` looks like strict equality, but patches its two weird edge cases: \`NaN === NaN\` is \`false\` under \`===\`, and \`+0 === -0\` is \`true\` even though the two are distinguishable (\`1 / -0\` gives \`-Infinity\`, not \`Infinity\`). React's dependency comparisons and other equality-sensitive internals use exactly this semantics instead of raw \`===\`.

## Your task

Write \`myObjectIs(a, b)\` that replicates \`Object.is\`:

- \`NaN\` is equal to itself (unlike \`===\`)
- \`+0\` and \`-0\` are **not** equal to each other (unlike \`===\`)
- everything else behaves exactly like \`===\`

\`\`\`js
myObjectIs(NaN, NaN) // true — unlike NaN === NaN
myObjectIs(0, -0) // false — unlike 0 === -0
myObjectIs(1, 1) // true
\`\`\``,
    difficulty: "easy",
    starterCode: `function myObjectIs(a, b) {
}`,
    solutionCode: `function myObjectIs(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}`,
    testCases: [
      { input: "NaN, NaN", expected: "true", label: "NaN is equal to itself" },
      { input: "0, -0", expected: "false", label: "+0 and -0 are not equal" },
      { input: "1, 1", expected: "true", label: "Identical primitives are equal" },
      { input: "{}, {}", expected: "false", label: "Two different object references are never equal" },
    ],
    hints: [
      "1 / 0 is Infinity, but 1 / -0 is -Infinity — that's how you can tell them apart when === says they're equal.",
      "a !== a is only true when a is NaN.",
    ],
    orderIndex: 1003,
  },

  {
    slug: "custom-object-create",
    companies: ["Google", "Microsoft"],
    category: "javascript-runtime",
    title: "Implement your own Object.create()",
    description: `\`Object.create(proto)\` builds a new object whose prototype is exactly the object you pass in — no constructor runs, no properties are copied, it's a pure prototype-chain link. Passing \`null\` is the special case worth calling out: it produces a genuinely prototype-less object, one that doesn't even inherit \`toString\` or \`hasOwnProperty\` from \`Object.prototype\`.

## Your task

Write \`myObjectCreate(proto)\` without using the real \`Object.create\`. It must support \`proto\` being \`null\`.

\`\`\`js
const proto = { greet() { return "hi"; } };
myObjectCreate(proto).greet() // "hi" — inherited through the prototype chain
myObjectCreate(null) // an object with no prototype at all
\`\`\``,
    difficulty: "easy",
    starterCode: `function myObjectCreate(proto) {
}`,
    solutionCode: `function myObjectCreate(proto) {
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  return obj;
}`,
    testCases: [
      { input: "proto = { greet() { return 'hi'; } }", expected: "Object.getPrototypeOf(result) === proto", label: "The prototype is set to the given object" },
      { input: "same proto", expected: "'hi'", label: "Inherited methods are callable through the prototype" },
      { input: "null", expected: "null", label: "A null prototype is preserved, not silently upgraded" },
      { input: "proto = { a: 1 }", expected: "0", label: "The new object has no own enumerable properties of its own" },
    ],
    hints: [
      "Object.setPrototypeOf lets you set a prototype after creation, including null.",
      "A naive `function F(){}; F.prototype = proto; new F()` trick actually fails for proto = null — the engine silently falls back to Object.prototype.",
    ],
    orderIndex: 1004,
  },

  {
    slug: "custom-new-operator",
    companies: ["Google", "Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Create your own new operator",
    description: `Every \`new Ctor(args)\` call quietly runs four steps behind the scenes: allocate an object linked to \`Ctor.prototype\`, run the constructor with \`this\` bound to it, and then decide whether to return that new object or an explicit object the constructor returned instead. This exercise makes each of those steps explicit instead of leaving them to engine magic.

## Your task

Write \`myNew(Ctor, ...args)\` that:

1. creates a new object linked to \`Ctor.prototype\`
2. calls \`Ctor\` with \`this\` bound to that object and \`args\` forwarded
3. returns the constructor's own return value **only if it's an object**
4. otherwise returns the newly created object

\`\`\`js
function Person(name) { this.name = name; }
myNew(Person, "Ada") // Person { name: "Ada" }, instanceof Person

function ReturnsObject() { return { custom: true }; }
myNew(ReturnsObject) // { custom: true } — an object return value overrides the new instance

function ReturnsPrimitive() { this.x = 1; return "ignored"; }
myNew(ReturnsPrimitive) // { x: 1 } — a primitive return value is ignored
\`\`\``,
    difficulty: "easy",
    starterCode: `function myNew(Ctor, ...args) {
}`,
    solutionCode: `function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  return typeof result === "object" && result !== null ? result : obj;
}`,
    testCases: [
      { input: "function Person(name){this.name=name;}", expected: "instanceof Person, name = 'Ada'", label: "Constructs a linked instance with fields set" },
      { input: "constructor returns an object", expected: "the returned object, not the new instance", label: "An object return value overrides the new instance" },
      { input: "constructor returns a primitive", expected: "the new instance, primitive ignored", label: "A primitive return value is ignored" },
    ],
    hints: [
      "Object.create(Ctor.prototype) gives you the linked object without calling the constructor.",
      "Ctor.apply(obj, args) runs the constructor body with `this` set to obj.",
      "Only object return values (not primitives, not null) override the new instance — this is a real spec rule.",
    ],
    orderIndex: 1005,
  },

  {
    slug: "custom-spy-on",
    companies: ["Amazon", "Stripe"],
    category: "javascript-runtime",
    title: "Implement jest.spyOn()",
    description: `Testing libraries like Jest let you wrap a real method with **spyOn** to observe how it's called — arguments, call count — without losing its real behavior, since the original implementation still runs underneath. This exercise builds that wrapper by hand.

## Your task

Write \`mySpyOn(obj, methodName)\`, which replaces \`obj[methodName]\` with a wrapper that:

- still calls through to the original implementation and returns its result
- records every call's arguments on a \`.calls\` array
- exposes \`.restore()\` to put the original method back

\`\`\`js
const obj = { add: (a, b) => a + b };
const spy = mySpyOn(obj, "add");
obj.add(2, 3) // 5 — real behavior still runs
spy.calls // [[2, 3]] — arguments recorded
spy.restore(); // obj.add is now the original, unwrapped function again
\`\`\``,
    difficulty: "easy",
    starterCode: `function mySpyOn(obj, methodName) {
}`,
    solutionCode: `function mySpyOn(obj, methodName) {
  const original = obj[methodName];
  const calls = [];
  const spy = function (...args) {
    calls.push(args);
    return original.apply(this, args);
  };
  spy.calls = calls;
  spy.restore = function () {
    obj[methodName] = original;
  };
  obj[methodName] = spy;
  return spy;
}`,
    testCases: [
      { input: "obj.add(2, 3)", expected: "5", label: "The real behavior still runs" },
      { input: "spy.calls after one call", expected: "[[2, 3]]", label: "Call arguments are recorded" },
      { input: "spy.restore(); obj.add", expected: "the original function", label: "restore() puts the original method back" },
    ],
    hints: [
      "The wrapper needs to call the saved original with the same `this` and arguments, then return its result.",
      "restore() just needs to reassign obj[methodName] back to the closed-over original.",
    ],
    orderIndex: 1006,
  },

  {
    slug: "detect-data-type",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Detect data type in JavaScript",
    description: `\`typeof\` alone can't tell an array from a plain object, a \`Date\` from a \`RegExp\`, or \`null\` from anything else — it just reports \`"object"\` for all of them. \`Object.prototype.toString.call(value)\` exposes an internal type tag that's precise enough to build a real detector on top of, which is exactly what this problem does.

## Your task

Write \`getType(value)\`, returning a precise lowercase type string: \`"array"\`, \`"null"\`, \`"date"\`, \`"regexp"\`, \`"object"\`, \`"function"\`, \`"number"\`, \`"string"\`, \`"boolean"\`, or \`"undefined"\`.

\`\`\`js
getType([]) // "array"
getType(null) // "null"
getType(new Date()) // "date"
getType(/abc/) // "regexp"
\`\`\``,
    difficulty: "medium",
    starterCode: `function getType(value) {
}`,
    solutionCode: `function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}`,
    testCases: [
      { input: "[]", expected: '"array"', label: "An array is array, not object" },
      { input: "null", expected: '"null"', label: "null is its own category, not object" },
      { input: "new Date()", expected: '"date"', label: "A Date instance is date" },
      { input: "/abc/", expected: '"regexp"', label: "A regex literal is regexp" },
      { input: "function(){}", expected: '"function"', label: "A function is function" },
      { input: "42", expected: '"number"', label: "A primitive number is number" },
    ],
    hints: [
      "Object.prototype.toString.call(value) returns a string like \"[object Array]\" for every value, including primitives.",
      "Slice out the middle word between \"[object \" and \"]\" and lowercase it.",
    ],
    orderIndex: 1007,
  },

  {
    slug: "custom-function-call",
    companies: ["Google", "Meta", "Uber"],
    category: "javascript-runtime",
    title: "Create your own Function.prototype.call",
    description: `\`Function.prototype.call\` runs a function with an explicit \`this\` and a flat list of arguments — the classic way to borrow a method from one object and run it against another. Under the hood there's no special engine trick: you can get the same effect by temporarily attaching the function to the target object and invoking it as a method, which is exactly what this rebuild does.

## Your task

Add \`myCall(context, ...args)\` to \`Function.prototype\`, invoking the function it's called on with \`this\` set to \`context\` and \`args\` forwarded, returning its result.

\`\`\`js
function getName(greeting) { return greeting + ", " + this.name; }
getName.myCall({ name: "Ada" }, "Hello") // "Hello, Ada"
\`\`\``,
    difficulty: "medium",
    starterCode: `Function.prototype.myCall = function (context, ...args) {
};`,
    solutionCode: `Function.prototype.myCall = function (context, ...args) {
  const ctx = context && typeof context === "object" ? context : {};
  const key = Symbol("fn");
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};`,
    testCases: [
      { input: "getName.myCall({ name: 'Ada' }, 'Hello')", expected: '"Hello, Ada"', label: "this and the argument are forwarded correctly" },
      { input: "the context object after the call", expected: "no leaked temporary key", label: "The context object isn't left with a leftover property" },
      { input: "sum3.myCall(null, 1, 2, 3)", expected: "6", label: "Multiple arguments are forwarded in order" },
    ],
    hints: [
      "Temporarily attach the function to the context object under a unique key, call it as a method, then delete the key.",
      "A Symbol makes an excellent temporary key — it can't collide with a real property name.",
    ],
    orderIndex: 1008,
  },

  {
    slug: "custom-function-apply",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Implement your own Function.prototype.apply",
    description: `\`Function.prototype.apply\` is \`call\`'s sibling — same idea of forcing a specific \`this\`, but arguments arrive bundled as a single array instead of listed individually. That's handy any time you already have an arguments array on hand (from \`arguments\`, a spread, or another function's output) instead of separate values to type out.

## Your task

Add \`myApply(context, argsArray)\` to \`Function.prototype\`. \`argsArray\` may be omitted, in which case the function is called with no arguments.

\`\`\`js
function getName(greeting) { return greeting + ", " + this.name; }
getName.myApply({ name: "Ada" }, ["Hello"]) // "Hello, Ada"

function noArgs() { return arguments.length; }
noArgs.myApply({}) // 0 — a missing args array calls the function with no arguments
\`\`\``,
    difficulty: "medium",
    starterCode: `Function.prototype.myApply = function (context, argsArray) {
};`,
    solutionCode: `Function.prototype.myApply = function (context, argsArray) {
  const ctx = context && typeof context === "object" ? context : {};
  const args = argsArray || [];
  const key = Symbol("fn");
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};`,
    testCases: [
      { input: "getName.myApply({ name: 'Ada' }, ['Hello'])", expected: '"Hello, Ada"', label: "Array arguments are spread onto the call" },
      { input: "noArgs.myApply({})", expected: "0", label: "A missing args array calls the function with no arguments" },
      { input: "the context object after the call", expected: "no leaked temporary key", label: "The context object isn't left with a leftover property" },
    ],
    hints: [
      "Default argsArray to an empty array before spreading it into the call.",
      "The rest of the implementation is identical to myCall.",
    ],
    orderIndex: 1009,
  },

  {
    slug: "custom-function-bind",
    companies: ["Meta", "Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Create your own Function.prototype.bind",
    description: `\`bind\` returns a brand-new function permanently locked to a given \`this\` and a set of preset leading arguments — and it still has to work correctly when called with \`new\`.

## Your task

Add \`myBind(context, ...boundArgs)\` to \`Function.prototype\`, returning a new function that:

- always calls the original with \`this\` set to \`context\`
- prepends \`boundArgs\` before any arguments passed at call time
- when invoked with \`new\`, ignores the bound \`context\` and behaves like a normal constructor call instead

\`\`\`js
function greet(greeting, punct) { return greeting + ", " + this.name + punct; }
greet.myBind({ name: "Ada" }, "Hello")("!") // "Hello, Ada!"

function Point(x, y) { this.x = x; this.y = y; }
const BoundPoint = Point.myBind({}, 10);
new BoundPoint(20) // Point { x: 10, y: 20 } — called with new, the bound context is ignored
\`\`\``,
    difficulty: "medium",
    starterCode: `Function.prototype.myBind = function (context, ...boundArgs) {
};`,
    solutionCode: `Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  function bound(...callArgs) {
    const isNew = this instanceof bound;
    return fn.apply(isNew ? this : context, [...boundArgs, ...callArgs]);
  }
  bound.prototype = Object.create(fn.prototype || Object.prototype);
  return bound;
};`,
    testCases: [
      { input: "getThis.myBind(ctx)()", expected: "ctx", label: "this stays locked to the bound context" },
      { input: "greet.myBind({ name: 'Ada' }, 'Hello')('!')", expected: '"Hello, Ada!"', label: "Preset arguments come before call-time arguments" },
      { input: "new (Point.myBind({}, 10))(20)", expected: "{ x: 10, y: 20 }, instanceof Point", label: "Called with new, the bound context is ignored" },
    ],
    hints: [
      "Check `this instanceof bound` inside the returned function to detect a `new` call.",
      "Set bound.prototype to a new object linked to the original function's prototype, so instanceof still works after binding.",
    ],
    orderIndex: 1010,
  },

  {
    slug: "custom-instanceof",
    companies: ["Google", "ByteDance"],
    category: "javascript-runtime",
    title: "Write your own instanceof",
    description: `\`a instanceof B\` isn't magic — it walks up \`a\`'s prototype chain via \`Object.getPrototypeOf\`, checking at each link whether it's \`B.prototype\`, and gives up once the chain bottoms out at \`null\`. This exercise rebuilds that walk by hand, including the primitive edge case the real operator handles too.

## Your task

Write \`myInstanceof(obj, Ctor)\`, replicating \`obj instanceof Ctor\` by walking \`Object.getPrototypeOf\`.

\`\`\`js
myInstanceof([], Array) // true
myInstanceof([], Object) // true — further up the prototype chain
myInstanceof(5, Number) // false — primitives are never instances
\`\`\``,
    difficulty: "medium",
    starterCode: `function myInstanceof(obj, Ctor) {
}`,
    solutionCode: `function myInstanceof(obj, Ctor) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return false;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Ctor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}`,
    testCases: [
      { input: "myInstanceof([], Array)", expected: "true", label: "An array is an instance of Array" },
      { input: "myInstanceof([], Object)", expected: "true", label: "An array is also an instance of Object, further up the chain" },
      { input: "myInstanceof({}, Array)", expected: "false", label: "A plain object is not an instance of Array" },
      { input: "myInstanceof(5, Number)", expected: "false", label: "A primitive is never an instance of anything" },
    ],
    hints: [
      "Primitives (non-objects) always return false, even for their apparent wrapper type.",
      "Walk up via Object.getPrototypeOf until you either match Ctor.prototype or hit null.",
    ],
    orderIndex: 1011,
  },

  {
    slug: "es5-class-extends",
    companies: ["Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Write your own extends in ES5",
    description: `Before \`class\`/\`extends\` existed, inheritance was wired up by hand with prototype chains. Understanding that wiring makes the \`class\` sugar much less mysterious.

## Your task

Write \`es5Extend(Child, Parent)\` that makes \`Child\` inherit from \`Parent\`:

- instances of \`Child\` can call methods defined on \`Parent.prototype\`
- \`Child.prototype\` methods still take priority over inherited ones
- \`Child.prototype.constructor\` correctly points back to \`Child\`, not \`Parent\`
- \`instanceof\` correctly recognizes \`Child\` instances as \`Parent\` instances too

\`\`\`js
function Animal() {}
Animal.prototype.speak = function () { return this.name + " makes a sound."; };
function Dog(name) { this.name = name; }
es5Extend(Dog, Animal);
new Dog("Rex").speak() // "Rex makes a sound." — inherited from Animal.prototype
\`\`\``,
    difficulty: "medium",
    starterCode: `function es5Extend(Child, Parent) {
}`,
    solutionCode: `function es5Extend(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}`,
    testCases: [
      { input: "es5Extend(Dog, Animal); new Dog('Rex').speak()", expected: '"Rex makes a sound."', label: "Inherited methods are reachable" },
      { input: "Dog.prototype.speak overridden", expected: '"Rex barks."', label: "Child's own method takes priority" },
      { input: "new Dog('Rex').constructor", expected: "Dog", label: "constructor points back to Child" },
      { input: "new Dog('Rex') instanceof Animal", expected: "true", label: "instanceof recognizes the prototype chain" },
    ],
    hints: [
      "Object.create(Parent.prototype) gives Child.prototype the right chain without invoking Parent's constructor.",
      "Reassigning Child.prototype wipes out its constructor property — set it back explicitly afterward.",
    ],
    orderIndex: 1012,
  },

  {
    slug: "mini-expect-matcher",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "toBe() or not.toBe()",
    description: `Every test you've ever written with Jest or Vitest bottoms out in something like this: \`expect(x).toBe(y)\`. Building a **minimal matcher** from scratch is a quick way to see there's no magic behind it — just an object whose methods throw when a comparison fails.

## Your task

Write \`expect(actual)\`, returning an object with:

- \`toBe(expected)\` — throws if \`actual\` and \`expected\` aren't \`Object.is\`-equal
- \`not.toBe(expected)\` — throws if they **are** equal

\`\`\`js
expect(1).toBe(1) // passes silently
expect(1).toBe(2) // throws
expect(NaN).toBe(NaN) // passes — uses Object.is, not ===
expect(1).not.toBe(2) // passes silently — the values differ
\`\`\``,
    difficulty: "medium",
    starterCode: `function expect(actual) {
}`,
    solutionCode: `function expect(actual) {
  function check(expected, negate) {
    const pass = Object.is(actual, expected);
    if (negate ? pass : !pass) {
      throw new Error(negate ? "expected values to differ" : "expected values to match");
    }
  }
  return {
    toBe: (expected) => check(expected, false),
    not: { toBe: (expected) => check(expected, true) },
  };
}`,
    testCases: [
      { input: "expect(1).toBe(1)", expected: "does not throw", label: "Matching values pass" },
      { input: "expect(1).toBe(2)", expected: "throws", label: "Mismatched values throw" },
      { input: "expect(NaN).toBe(NaN)", expected: "does not throw", label: "Uses Object.is semantics, so NaN matches itself" },
      { input: "expect(1).not.toBe(2)", expected: "does not throw", label: "not.toBe passes when values differ" },
      { input: "expect(1).not.toBe(1)", expected: "throws", label: "not.toBe throws when values match" },
    ],
    hints: [
      "Use Object.is for the comparison, not ===, so NaN matches itself and +0/-0 stay distinct.",
      "not.toBe is just the same check with the pass/fail condition inverted.",
    ],
    orderIndex: 1013,
  },


  // Stage 2 — Functional Programming Basics
  {
    slug: "build-counter-object",
    category: "javascript-runtime",
    title: "Create a counter object",
    description: `A closure-backed object that tracks its own private count — the private state exists only in a variable captured by the returned methods.

## Your task

Write \`createCounter(start = 0)\`, returning an object with:

- \`increment(step = 1)\` — adds \`step\`, returns the object (chainable)
- \`decrement(step = 1)\` — subtracts \`step\`, returns the object (chainable)
- \`reset()\` — resets back to \`start\`, returns the object (chainable)
- \`get()\` — returns the current count

\`\`\`js
const counter = createCounter();
counter.increment().increment().get() // 2
createCounter(10).increment(3).reset().get() // 10 — reset() returns to the starting value, not 0
\`\`\``,
    difficulty: "easy",
    starterCode: `function createCounter(start = 0) {
}`,
    solutionCode: `function createCounter(start = 0) {
  let count = start;
  const counter = {
    increment(step = 1) { count += step; return counter; },
    decrement(step = 1) { count -= step; return counter; },
    reset() { count = start; return counter; },
    get() { return count; },
  };
  return counter;
}`,
    testCases: [
      { input: "createCounter().increment().increment().get()", expected: "2", label: "Default step increments by 1" },
      { input: "createCounter().decrement(5).get()", expected: "-5", label: "A custom step is respected" },
      { input: "createCounter(10).increment(3).reset().get()", expected: "10", label: "reset() returns to the starting value" },
      { input: "createCounter().increment().increment().get()", expected: "counter().get() chains", label: "Every method returns the counter itself for chaining" },
    ],
    hints: [
      "The count only needs to live in a closure variable — no need to store it on the returned object itself.",
      "Returning the counter object from every mutator method is what makes .increment().increment() chainable.",
    ],
    orderIndex: 1014,
  },

  {
    slug: "build-count-function",
    category: "javascript-runtime",
    title: "Create a count function",
    description: `Not every counter needs to be an object — sometimes a single callable function that increments on every call is exactly the right shape.

## Your task

Write \`createCountFunction()\`, returning a **function** that returns \`1\` on its first call, \`2\` on its second, and so on. The returned function also has a \`.reset()\` method that starts it back at \`1\`. Each call to \`createCountFunction()\` must produce an independent counter.

\`\`\`js
const count = createCountFunction();
count(); count(); count() // 1, 2, 3
count.reset();
count() // 1 — reset() starts the sequence over
\`\`\``,
    difficulty: "easy",
    starterCode: `function createCountFunction() {
}`,
    solutionCode: `function createCountFunction() {
  let n = 0;
  function count() {
    n += 1;
    return n;
  }
  count.reset = () => { n = 0; };
  return count;
}`,
    testCases: [
      { input: "count(); count(); count()", expected: "1, 2, 3", label: "Each call returns the next integer" },
      { input: "count.reset(); count()", expected: "1", label: "reset() starts the sequence over" },
      { input: "two separate createCountFunction() calls", expected: "independent counts", label: "Separate instances don't share state" },
    ],
    hints: [
      "A function is just another value — it can have its own properties, like .reset.",
      "Each call to createCountFunction() should create a brand-new closure variable.",
    ],
    orderIndex: 1015,
  },

  {
    slug: "implement-pipe-composition",
    companies: ["Airbnb", "Uber", "Stripe"],
    category: "javascript-runtime",
    title: "Composition: create a pipe()",
    description: `\`pipe\` is function composition read left to right: each function's output feeds the next one's input, in the order they were listed.

## Your task

Write \`pipe(...fns)\`, returning a single function that runs \`fns\` left to right, passing each result to the next. With no functions, it should act as the identity function.

\`\`\`js
const addOne = (x) => x + 1;
const double = (x) => x * 2;
pipe(addOne, double)(3) // (3 + 1) * 2 = 8
pipe()(5) // 5 — no functions acts as the identity
\`\`\``,
    difficulty: "easy",
    starterCode: `function pipe(...fns) {
}`,
    solutionCode: `function pipe(...fns) {
  return function (input) {
    return fns.reduce((value, fn) => fn(value), input);
  };
}`,
    testCases: [
      { input: "pipe(x => x + 1, x => x * 2)(3)", expected: "8", label: "Runs functions left to right" },
      { input: "pipe()(5)", expected: "5", label: "No functions acts as the identity" },
      { input: "pipe(x => x.toUpperCase())('hi')", expected: '"HI"', label: "Works for a single function too" },
    ],
    hints: [
      "Array.prototype.reduce is a natural fit: the accumulator is the running value, each function transforms it further.",
      "pipe (left-to-right) and compose (right-to-left) are the same reduce, just in a different starting order of fns.",
    ],
    orderIndex: 1016,
  },

  {
    slug: "lodash-once-polyfill",
    companies: ["Amazon", "Uber"],
    category: "javascript-runtime",
    title: "Implement _.once()",
    description: `Some logic should genuinely only ever run once — a one-time setup routine, an analytics event that must not double-fire, a submit handler that shouldn't process a duplicate click. **\`_.once\`** wraps a function so its real body executes on the very first call, and every call after that just hands back that same cached result, arguments or not.

## Your task

Write \`once(fn)\`, returning a wrapped function that invokes \`fn\` only on its first call and returns that same cached result on every subsequent call, **even if called with different arguments**. \`this\` should be forwarded correctly on the call that actually runs \`fn\`.

\`\`\`js
let calls = 0;
const initialize = once(() => { calls++; return "done"; });
initialize(); // "done" — runs the real logic, calls is now 1
initialize(); // "done" — cached result, calls is still 1
\`\`\``,
    difficulty: "easy",
    starterCode: `function once(fn) {
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
      { input: "called 5 times total", expected: "fn's real logic runs exactly once", label: "The wrapped function only runs once" },
      { input: "second call with different arguments", expected: "the first call's cached result", label: "Later calls return the cached result regardless of new arguments" },
      { input: "this binding on the first call", expected: "forwarded correctly", label: "this is forwarded on the call that actually runs" },
    ],
    hints: [
      "A boolean flag in the closure is enough to know whether the real function has already run.",
      "Once called is true, ignore whatever arguments come in — always return the stored result.",
    ],
    orderIndex: 1017,
  },

  {
    slug: "curry-classic",
    companies: ["Airbnb", "Uber", "TikTok"],
    category: "javascript-runtime",
    title: "Implement curry()",
    description: `Currying turns a function of several arguments into a chain of one-argument functions — call it partially, and you get back another function waiting for the rest. The trick is knowing when enough arguments have arrived without hardcoding a count: \`fn.length\` reports the function's declared arity, and that's exactly the signal to use.

## Your task

Write \`curry(fn)\`, returning a curried version of \`fn\` that collects one argument per call until it has \`fn.length\` arguments, then invokes \`fn\` with all of them.

\`\`\`js
function multiply(a, b) { return a * b; }
curry(multiply)(2)(3) // 6
curry(multiply)(2, 3) // 6 — all arguments at once also works
\`\`\``,
    difficulty: "easy",
    starterCode: `function curry(fn) {
}`,
    solutionCode: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried(...args, ...next);
  };
}`,
    testCases: [
      { input: "function multiply(a,b){return a*b;} curry(multiply)(2)(3)", expected: "6", label: "One argument at a time" },
      { input: "curry(multiply)(2, 3)", expected: "6", label: "All arguments at once also works" },
      { input: "function add4(a,b,c,d){return a+b+c+d;} curry(add4)(1)(2)(3)(4)", expected: "10", label: "Works for any arity, driven by fn.length" },
    ],
    hints: [
      "fn.length gives you the declared parameter count — that's how curry knows when it has enough arguments without you hardcoding a number.",
      "Each call that isn't yet complete should return a new function that concatenates its own arguments onto what's already collected.",
    ],
    orderIndex: 1018,
  },

  {
    slug: "curry-with-placeholder",
    companies: ["Airbnb", "TikTok"],
    category: "javascript-runtime",
    title: "curry() with placeholder support",
    description: `Real-world curry implementations (like Lodash's) support a placeholder value that reserves a slot to be filled in on a later call — letting you skip over an argument now and supply it afterward.

## Your task

Write \`curryWithPlaceholder(fn)\`, exposing its placeholder marker as \`curryWithPlaceholder.PLACEHOLDER\`. Any argument slot filled with the placeholder gets resolved from the **next** call's arguments, in order, before falling back to appending leftover arguments at the end.

\`\`\`js
const _ = curryWithPlaceholder.PLACEHOLDER;
const curried = curryWithPlaceholder((a, b, c) => a * 100 + b * 10 + c);
curried(1, _, 3)(2) // 123 — the placeholder is filled by 2
curried(_, 2)(1, 3) // 123 — a leading placeholder is filled first, extra args are appended after
\`\`\``,
    difficulty: "medium",
    starterCode: `function curryWithPlaceholder(fn) {
}
curryWithPlaceholder.PLACEHOLDER = Symbol("placeholder");`,
    solutionCode: `function curryWithPlaceholder(fn) {
  const PLACEHOLDER = curryWithPlaceholder.PLACEHOLDER;
  function curried(...args) {
    const hasPlaceholder = args.slice(0, fn.length).includes(PLACEHOLDER);
    if (args.length >= fn.length && !hasPlaceholder) {
      return fn.apply(this, args);
    }
    return (...next) => {
      const nextQueue = [...next];
      const merged = args.map((a) => (a === PLACEHOLDER && nextQueue.length ? nextQueue.shift() : a));
      return curried(...merged, ...nextQueue);
    };
  }
  return curried;
}
curryWithPlaceholder.PLACEHOLDER = Symbol("placeholder");`,
    testCases: [
      { input: "combine(1)(2)(3) for a*100+b*10+c", expected: "123", label: "Works exactly like plain curry with no placeholders" },
      { input: "combine(1, _, 3)(2)", expected: "123", label: "A placeholder in the middle is filled by the next call" },
      { input: "combine(_, 2)(1, 3)", expected: "123", label: "A leading placeholder is filled first, extra args are appended after" },
    ],
    hints: [
      "Check for the placeholder only within the first fn.length arguments — a call is only 'complete' once every required slot has a real value.",
      "When resolving placeholders, walk the existing args in order and pull from the front of the new arguments to fill each one; anything left over gets appended at the end.",
    ],
    orderIndex: 1019,
  },

  {
    slug: "chainable-curried-sum",
    companies: ["Amazon", "ByteDance"],
    category: "javascript-runtime",
    title: "Create sum()",
    description: `A curried \`sum\` that keeps accepting more numbers through repeated calls, and produces its total either through a final empty call or through implicit numeric coercion.

## Your task

Write \`sum(a)\`, returning a function that:

- when called again with a number, adds it and returns itself (chainable)
- when called with no arguments, returns the running total
- also converts to its running total via \`valueOf\`, so \`Number(sum(1)(2))\` works too

\`\`\`js
sum(1)(2)(3)() // 6 — a trailing empty call returns the total
Number(sum(1)(2)(3)) // 6 — valueOf lets it coerce directly
\`\`\``,
    difficulty: "medium",
    starterCode: `function sum(a) {
}`,
    solutionCode: `function sum(a) {
  let total = a;
  function inner(b) {
    if (b === undefined) return total;
    total += b;
    return inner;
  }
  inner.valueOf = () => total;
  return inner;
}`,
    testCases: [
      { input: "sum(1)(2)(3)()", expected: "6", label: "A trailing empty call returns the total" },
      { input: "Number(sum(1)(2)(3))", expected: "6", label: "valueOf lets it coerce to a number directly" },
      { input: "sum(5)()", expected: "5", label: "A single argument with no chaining still works" },
    ],
    hints: [
      "Calling with undefined (no argument) is your signal to stop accumulating and return the total.",
      "valueOf is what JavaScript calls automatically during numeric coercion (Number(), +, etc.) — it doesn't need to be called explicitly.",
    ],
    orderIndex: 1020,
  },

  {
    slug: "general-memoization",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Implement a general memoization function memo()",
    description: `**Memoization** trades memory for speed: cache a pure function's result by its arguments, so an expensive computation — a slow recursive call, a heavy parse, any deterministic calculation — never runs twice for the same input. A general-purpose \`memo()\` needs to work for *any* function, no matter how many arguments it takes.

## Your task

Write \`memo(fn)\`, returning a wrapped function that caches results keyed by all of its arguments (any number of them), returning the cached value on a repeat call instead of invoking \`fn\` again. The cached value must match exactly what the original call would have produced.

\`\`\`js
let calls = 0;
const slowSquare = memo((n) => { calls++; return n * n; });
slowSquare(4); // 16, calls is 1
slowSquare(4); // 16, calls is still 1 — cached
slowSquare(5); // 25, calls is 2 — a new argument recomputes
\`\`\``,
    difficulty: "medium",
    starterCode: `function memo(fn) {
}`,
    solutionCode: `function memo(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}`,
    testCases: [
      { input: "memoized(4) called twice", expected: "the underlying function runs only once", label: "Repeated identical calls hit the cache" },
      { input: "memoized(4) then memoized(5)", expected: "computed independently", label: "Different arguments are cached separately" },
      { input: "cached call's return value", expected: "matches the original computation exactly", label: "The cached value is correct, not just present" },
    ],
    hints: [
      "JSON.stringify(args) is a simple, effective cache key for any number of primitive/plain-object arguments.",
      "A Map (rather than a plain object) avoids prototype-pollution edge cases with string keys like \"__proto__\".",
    ],
    orderIndex: 1021,
  },

  {
    slug: "memoize-one",
    companies: ["Meta", "Airbnb"],
    category: "javascript-runtime",
    title: "Implement memoizeOne()",
    description: `Unlike a general memoizer that remembers every call it's ever seen, \`memoizeOne\` only remembers the single most recent call — a lighter-weight cache that's ideal for a function re-run every render with the same last-seen arguments.

## Your task

Write \`memoizeOne(fn)\`. It should skip recomputation only when the new call's arguments shallow-equal the **immediately preceding** call's arguments — a call sandwiched between two different ones always recomputes, even if its arguments repeat an older call.

\`\`\`js
let calls = 0;
const add = memoizeOne((a, b) => { calls++; return a + b; });
add(1, 2); add(1, 2); // calls is 1 — same as the immediately preceding call
add(3, 4); add(1, 2); // calls is 3 — args repeat an older call, but not the last one
\`\`\``,
    difficulty: "medium",
    starterCode: `function memoizeOne(fn) {
}`,
    solutionCode: `function memoizeOne(fn) {
  let lastArgs = null;
  let lastResult;
  let called = false;
  return function (...args) {
    const sameAsLast =
      called &&
      lastArgs.length === args.length &&
      lastArgs.every((a, i) => a === args[i]);
    if (sameAsLast) return lastResult;
    lastResult = fn.apply(this, args);
    lastArgs = args;
    called = true;
    return lastResult;
  };
}`,
    testCases: [
      { input: "memoized(1,2) called twice in a row", expected: "underlying fn runs once", label: "Consecutive identical calls reuse the cache" },
      { input: "memoized(1,2), memoized(3,4), memoized(1,2)", expected: "underlying fn runs three times", label: "A different call in between forces recomputation, even for previously-seen args" },
      { input: "memoized('a') twice in a row", expected: "underlying fn runs once", label: "Works correctly for primitive arguments, not just numbers" },
    ],
    hints: [
      "Only the arguments from the single most recent call matter — there's no history beyond that.",
      "Shallow-compare with === element by element; a deep-equality check would be a different (and heavier) design choice.",
    ],
    orderIndex: 1022,
  },


  // Stage 3 — Array & Object Utilities (Lodash-style polyfills)
  {
    slug: "shuffle-array-fisher-yates",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "shuffle() an array (Fisher–Yates)",
    description: `The naive \`arr.sort(() => Math.random() - 0.5)\` shuffle is famously **not** uniformly random — some permutations end up far more likely than others. **Fisher–Yates** is the correct, well-known algorithm for shuffling an array with a truly even distribution over all possible orderings.

## Your task

Write \`shuffle(arr)\`, returning a new array containing the same elements as \`arr\` in a randomized order. \`arr\` itself must not be mutated.

\`\`\`js
shuffle([1, 2, 3, 4, 5])
// e.g. [3, 1, 5, 2, 4] — same elements, random order, original array untouched
\`\`\``,
    difficulty: "easy",
    starterCode: `function shuffle(arr) {
}`,
    solutionCode: `function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}`,
    testCases: [
      { input: "shuffle([1,2,3,4,5]).length", expected: "5", label: "The result has the same length as the input" },
      { input: "shuffle([1,2,3,4,5]) sorted", expected: "[1,2,3,4,5]", label: "The result contains exactly the same elements, just reordered" },
      { input: "arr after shuffle(arr)", expected: "unchanged", label: "The original array is never mutated" },
    ],
    hints: [
      "Walk the array backward, and for each index swap it with a random earlier-or-equal index — that's the whole algorithm.",
      "Work on a copy of the array so the original is left untouched.",
    ],
    orderIndex: 1023,
  },

  {
    slug: "array-prototype-filter-polyfill",
    companies: ["Google", "Amazon"],
    category: "javascript-runtime",
    title: "Implement Array.prototype.filter()",
    description: `\`Array.prototype.filter\` builds a new array containing only the elements that pass a predicate — one of the most common **implement it yourself** interview questions. The detail most naive polyfills miss: real \`filter\` skips holes in a sparse array entirely, rather than calling the callback with \`undefined\` for them.

## Your task

Add \`myFilter(callback)\` to \`Array.prototype\`, keeping only the elements for which \`callback(element, index, array)\` is truthy.

\`\`\`js
[1, 2, 3, 4].myFilter((x) => x % 2 === 0) // [2, 4]
[1, , 3].myFilter(() => true) // [1, 3] — a hole is skipped, not treated as undefined
\`\`\``,
    difficulty: "easy",
    starterCode: `Array.prototype.myFilter = function (callback) {
};`,
    solutionCode: `Array.prototype.myFilter = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback(this[i], i, this)) result.push(this[i]);
  }
  return result;
};`,
    testCases: [
      { input: "[1,2,3,4].myFilter(x => x % 2 === 0)", expected: "[2, 4]", label: "Keeps only elements matching the predicate" },
      { input: "[10,20].myFilter((v,i) => i === 0)", expected: "[10]", label: "The index is forwarded as the callback's second argument" },
      { input: "[1, , 3].myFilter(() => true).length", expected: "2", label: "A hole in a sparse array is skipped, not treated as undefined" },
    ],
    hints: [
      "`i in this` is true only for indices that actually exist — a hole in a sparse array fails that check.",
      "Push the original element (this[i]), not the callback's return value.",
    ],
    orderIndex: 1024,
  },

  {
    slug: "array-prototype-map-polyfill",
    companies: ["Google", "Amazon", "Meta"],
    category: "javascript-runtime",
    title: "Implement Array.prototype.map()",
    description: `\`Array.prototype.map\` shares \`filter\`'s spirit of transforming without mutating the original, but it preserves the array's exact shape — same length, same holes — rather than removing anything. This polyfill also needs to support the optional \`thisArg\`, exactly like the real method.

## Your task

Add \`myMap(callback, thisArg)\` to \`Array.prototype\`. \`thisArg\`, if given, becomes \`this\` inside \`callback\`. A hole in the input array should stay a hole in the output, not become \`undefined\`.

\`\`\`js
[1, 2, 3].myMap((x) => x * 2) // [2, 4, 6]
[1, , 3].myMap((x) => x) // length 3, index 1 stays a hole
\`\`\``,
    difficulty: "medium",
    starterCode: `Array.prototype.myMap = function (callback, thisArg) {
};`,
    solutionCode: `Array.prototype.myMap = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this);
  }
  return result;
};`,
    testCases: [
      { input: "[1,2,3].myMap(x => x * 2)", expected: "[2, 4, 6]", label: "Transforms every element" },
      { input: "[1].myMap(function(){ return this.mult; }, { mult: 5 })", expected: "[5]", label: "thisArg becomes this inside the callback" },
      { input: "[1, , 3].myMap(x => x)", expected: "length 3, index 1 is a hole", label: "Holes in the input stay holes in the output" },
    ],
    hints: [
      "result[i] = ... only when i in this — never assign into a hole's index, or you'll fill it with undefined and defeat the point.",
      "callback.call(thisArg, ...) is how you forward an optional this without an extra branch.",
    ],
    orderIndex: 1025,
  },

  {
    slug: "array-prototype-reduce-polyfill",
    companies: ["Google", "Meta", "Microsoft"],
    category: "javascript-runtime",
    title: "Implement Array.prototype.reduce()",
    description: `\`reduce\`'s trickiest detail isn't the accumulation loop — it's correctly handling a missing initial value, which changes both the starting accumulator and what happens on an empty array.

## Your task

Add \`myReduce(callback, initialValue)\` to \`Array.prototype\`:

- with an initial value, start there and iterate every element
- without one, use the first element as the initial accumulator and start from the second
- calling on an empty array with no initial value must throw a \`TypeError\`

\`\`\`js
[1, 2, 3, 4].myReduce((a, b) => a + b, 0) // 10
[1, 2, 3, 4].myReduce((a, b) => a + b) // 10 — first element used as the initial value
[].myReduce((a, b) => a + b) // throws TypeError — empty array, no initial value
\`\`\``,
    difficulty: "medium",
    starterCode: `Array.prototype.myReduce = function (callback, initialValue) {
};`,
    solutionCode: `Array.prototype.myReduce = function (callback, initialValue) {
  let acc = initialValue;
  let startIndex = 0;
  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    acc = this[0];
    startIndex = 1;
  }
  for (let i = startIndex; i < this.length; i++) {
    acc = callback(acc, this[i], i, this);
  }
  return acc;
};`,
    testCases: [
      { input: "[1,2,3,4].myReduce((a,b) => a + b, 0)", expected: "10", label: "Sums with an explicit initial value" },
      { input: "[1,2,3,4].myReduce((a,b) => a + b)", expected: "10", label: "Uses the first element as the initial value when omitted" },
      { input: "[].myReduce((a,b) => a + b, 5)", expected: "5", label: "An empty array with an initial value just returns it" },
      { input: "[].myReduce((a,b) => a + b)", expected: "throws TypeError", label: "An empty array with no initial value throws" },
    ],
    hints: [
      "arguments.length lets you distinguish 'initialValue omitted' from 'initialValue is 0 or undefined on purpose'.",
      "When there's no initial value, the loop must start at index 1, not 0 — the first element is already the seed.",
    ],
    orderIndex: 1026,
  },

  {
    slug: "array-prototype-flat-polyfill",
    companies: ["Meta", "Amazon", "TikTok"],
    category: "javascript-runtime",
    title: "Implement Array.prototype.flat()",
    description: `\`Array.prototype.flat\` collapses nested arrays into a single level — or several, up to a configurable \`depth\`. The recursive case is straightforward; the edge cases (\`depth = 0\` doing nothing at all, \`Infinity\` flattening all the way down) are what separate a real implementation from a half-finished one.

## Your task

Add \`myFlat(depth = 1)\` to \`Array.prototype\`, flattening nested arrays up to \`depth\` levels deep. Support \`Infinity\` for a fully flat result.

\`\`\`js
[1, [2, 3], [4, [5, 6]]].myFlat() // [1, 2, 3, 4, [5, 6]] — default depth of 1
[1, [2, [3, [4]]]].myFlat(Infinity) // [1, 2, 3, 4]
\`\`\``,
    difficulty: "medium",
    starterCode: `Array.prototype.myFlat = function (depth = 1) {
};`,
    solutionCode: `Array.prototype.myFlat = function (depth = 1) {
  if (depth < 1) return this.slice();
  return this.reduce((acc, item) => {
    if (Array.isArray(item)) acc.push(...item.myFlat(depth - 1));
    else acc.push(item);
    return acc;
  }, []);
};`,
    testCases: [
      { input: "[1, [2, 3], [4, [5, 6]]].myFlat()", expected: "[1, 2, 3, 4, [5, 6]]", label: "Default depth of 1 flattens only the top level" },
      { input: "[1, [2, [3, [4]]]].myFlat(Infinity)", expected: "[1, 2, 3, 4]", label: "Infinity flattens every level" },
      { input: "[1, [2]].myFlat(0)", expected: "[1, [2]]", label: "A depth of 0 does nothing" },
    ],
    hints: [
      "Recursion is the natural fit: flatten each nested array one level shallower, then concatenate.",
      "Depth 0 is the base case — just return a shallow copy, unflattened.",
    ],
    orderIndex: 1027,
  },

  {
    slug: "array-prototype-flatmap-polyfill",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement Array.prototype.flatMap()",
    description: `\`flatMap\` is \`map\` immediately followed by a flatten — but always exactly one level deep, regardless of what depth you'd pass to \`flat\` elsewhere. It's the standard way to map each element to zero, one, or several output elements in a single pass, without a separate \`.map().flat()\` chain.

## Your task

Add \`myFlatMap(callback, thisArg)\` to \`Array.prototype\`: map every element, then flatten exactly one level.

\`\`\`js
[1, 2, 3].myFlatMap((x) => [x, x * 2]) // [1, 2, 2, 4, 3, 6]
[1, 2].myFlatMap((x) => [[x]]) // [[1], [2]] — only one level is flattened
\`\`\``,
    difficulty: "medium",
    starterCode: `Array.prototype.myFlatMap = function (callback, thisArg) {
};`,
    solutionCode: `Array.prototype.myFlatMap = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    const mapped = callback.call(thisArg, this[i], i, this);
    if (Array.isArray(mapped)) result.push(...mapped);
    else result.push(mapped);
  }
  return result;
};`,
    testCases: [
      { input: "[1,2,3].myFlatMap(x => [x, x * 2])", expected: "[1, 2, 2, 4, 3, 6]", label: "Maps and flattens in one pass" },
      { input: "[1,2].myFlatMap(x => [[x]])", expected: "[[1], [2]]", label: "Only flattens one level, however deep the mapped result is" },
      { input: "[1,2].myFlatMap(x => x * 10)", expected: "[10, 20]", label: "Non-array return values pass through unchanged" },
    ],
    hints: [
      "There's no recursive flatten needed here — just push the mapped array's items directly, or the single value if it isn't an array.",
      "The one-level-only rule is what distinguishes flatMap from map(...).flat(Infinity).",
    ],
    orderIndex: 1028,
  },

  {
    slug: "object-assign-polyfill",
    companies: ["Microsoft", "Google"],
    category: "javascript-runtime",
    title: "Implement Object.assign()",
    description: `\`Object.assign\` is the classic way to shallow-merge objects: it copies own enumerable properties from one or more **source** objects onto a **target**, with later sources winning over earlier ones on key collisions — and it mutates the target in place rather than building a new object.

## Your task

Write \`myObjectAssign(target, ...sources)\`, matching the real \`Object.assign\`:

- copies each source's own enumerable properties onto \`target\`, left to right
- a later source's value for a key overwrites an earlier one's
- mutates \`target\` in place and also returns that same reference
- \`null\`/\`undefined\` sources are silently skipped, not thrown on

\`\`\`js
myObjectAssign({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
myObjectAssign({}, { a: 1 }, { a: 2 }) // { a: 2 } — later sources win
\`\`\``,
    difficulty: "medium",
    starterCode: `function myObjectAssign(target, ...sources) {
}`,
    solutionCode: `function myObjectAssign(target, ...sources) {
  sources.forEach((source) => {
    if (source == null) return;
    Object.keys(source).forEach((key) => {
      target[key] = source[key];
    });
  });
  return target;
}`,
    testCases: [
      { input: "myObjectAssign({a:1}, {b:2}, {c:3})", expected: "{a:1, b:2, c:3}", label: "Merges every source onto the target" },
      { input: "myObjectAssign({}, {a:1}, {a:2})", expected: "{a:2}", label: "A later source overwrites an earlier one" },
      { input: "const t = {}; myObjectAssign(t, {x:1}) === t", expected: "true", label: "Mutates and returns the exact same target reference" },
      { input: "myObjectAssign({a:1}, null, undefined)", expected: "{a:1}", label: "null/undefined sources are skipped harmlessly" },
    ],
    hints: [
      "The target is mutated in place and also returned — both matter.",
      "== null (loose) catches both null and undefined in a single check.",
    ],
    orderIndex: 1029,
  },

  {
    slug: "complete-assign-descriptors",
    companies: ["Microsoft"],
    category: "javascript-runtime",
    title: "Implement completeAssign()",
    description: `\`Object.assign\` copies property *values*, which silently invokes any getter on the source and always produces a plain data property on the target. \`completeAssign\` copies the full property *descriptor* instead, preserving getters/setters as getters/setters.

## Your task

Write \`completeAssign(target, ...sources)\` using \`Object.getOwnPropertyDescriptor\` and \`Object.defineProperties\` so accessor properties stay accessors on the target. Only a source's own **enumerable** properties should be copied.

\`\`\`js
const source = { get double() { return 4; } };
const result = completeAssign({}, source);
result.double // 4 — the getter still runs
typeof Object.getOwnPropertyDescriptor(result, "double").get // "function" — still a real getter
\`\`\``,
    difficulty: "medium",
    starterCode: `function completeAssign(target, ...sources) {
}`,
    solutionCode: `function completeAssign(target, ...sources) {
  sources.forEach((source) => {
    const descriptors = Object.keys(source).reduce((acc, key) => {
      acc[key] = Object.getOwnPropertyDescriptor(source, key);
      return acc;
    }, {});
    Object.defineProperties(target, descriptors);
  });
  return target;
}`,
    testCases: [
      { input: "completeAssign({}, { get double() { return 4; } }).double", expected: "4", label: "A copied getter still produces the right value" },
      { input: "typeof Object.getOwnPropertyDescriptor(result, 'double').get", expected: '"function"', label: "The property stays a real getter, not a plain value" },
      { input: "source with a non-enumerable property", expected: "not copied", label: "Only enumerable own properties are copied" },
    ],
    hints: [
      "Object.keys(source) already only lists enumerable own properties — a non-enumerable one is never in that list.",
      "Object.defineProperties (not plain assignment) is what preserves a get/set pair as an accessor instead of collapsing it to a value.",
    ],
    orderIndex: 1030,
  },

  {
    slug: "object-group-by-polyfill",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Implement Object.groupBy()",
    description: `\`Object.groupBy\` buckets an iterable's items by whatever a callback returns for each one — turning "group these orders by status" or "group these users by role" from a hand-rolled loop into a one-liner. It's the kind of utility that shows up constantly in data-shaping code.

## Your task

Write \`myGroupBy(items, keyFn)\`, returning a plain object whose keys are the distinct results of \`keyFn(item)\`, and whose values are arrays of the matching items, preserving each item's original relative order within its group.

\`\`\`js
myGroupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd"))
// { odd: [1, 3], even: [2, 4] }
\`\`\``,
    difficulty: "medium",
    starterCode: `function myGroupBy(items, keyFn) {
}`,
    solutionCode: `function myGroupBy(items, keyFn) {
  const result = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}`,
    testCases: [
      { input: "myGroupBy([1,2,3,4], n => n % 2 === 0 ? 'even' : 'odd')", expected: "{ odd: [1,3], even: [2,4] }", label: "Groups items by the callback's key" },
      { input: "myGroupBy(['aa','b','cc'], s => s.length)", expected: "{ 2: ['aa','cc'], 1: ['b'] }", label: "Preserves each item's original relative order within its group" },
      { input: "myGroupBy([], () => 'x')", expected: "{}", label: "An empty input produces an empty result" },
    ],
    hints: [
      "A plain object with array values, built up as you iterate once, is all this needs.",
      "Push into an existing bucket if one exists for that key, otherwise create it first.",
    ],
    orderIndex: 1031,
  },

  {
    slug: "lodash-get-polyfill",
    companies: ["Airbnb", "LinkedIn"],
    category: "javascript-runtime",
    title: "Implement _.get()",
    description: `Reaching into a deeply nested object safely usually means a wall of \`obj && obj.a && obj.a.b && ...\` guards. **\`_.get\`** replaces all of that with a single path string like \`"a.b[0].c"\` (or an equivalent array of keys), returning a fallback instead of throwing when any part of the path doesn't exist.

## Your task

Write \`myGet(obj, path, defaultValue)\`. \`path\` may be a dot/bracket-notation string (e.g. \`"a[0].b"\`) or an array of keys. Walk the path one key at a time; the moment you hit \`null\`/\`undefined\` mid-path, or the final resolved value is \`undefined\`, return \`defaultValue\` instead of throwing.

\`\`\`js
myGet({ a: { b: { c: 42 } } }, "a.b.c") // 42
myGet({ a: [{ b: 1 }] }, "a[0].b") // 1
myGet({ a: 1 }, "x.y.z", "fallback") // "fallback" — missing path returns the default
\`\`\``,
    difficulty: "medium",
    starterCode: `function myGet(obj, path, defaultValue) {
}`,
    solutionCode: `function myGet(obj, path, defaultValue) {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\\[(\\d+)\\]/g, ".$1").split(".").filter(Boolean);
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
}`,
    testCases: [
      { input: "myGet({a:{b:{c:42}}}, 'a.b.c')", expected: "42", label: "Reads a deeply nested value with a dot path" },
      { input: "myGet({a:[{b:1}]}, 'a[0].b')", expected: "1", label: "Bracket notation reaches into an array" },
      { input: "myGet({a:1}, 'x.y.z', 'fallback')", expected: '"fallback"', label: "A missing path returns the default instead of throwing" },
      { input: "myGet({a:{b:2}}, ['a','b'])", expected: "2", label: "An array path works the same as a string path" },
    ],
    hints: [
      "Normalize a string path into an array of keys first — converting [0] into .0 makes bracket and dot notation the same problem.",
      "Bail out to the default the moment you hit null/undefined mid-path, before trying to index into it.",
    ],
    orderIndex: 1032,
  },

  {
    slug: "lodash-set-polyfill",
    companies: ["Airbnb", "LinkedIn"],
    category: "javascript-runtime",
    title: "Implement _.set()",
    description: `The write counterpart to **\`_.get()\`**: instead of manually checking and creating every intermediate object before assigning deep inside a structure, \`_.set\` builds the missing scaffolding for you as it walks the path — objects for named segments, arrays for numeric ones.

## Your task

Write \`mySet(obj, path, value)\`, mutating and returning \`obj\` with \`value\` written at the given dot/bracket path (e.g. \`"a[0].b"\`, or an equivalent array of keys). Any missing intermediate container along the way should be created — an array if the *next* path segment is numeric, an object otherwise. Existing values at the final key are overwritten.

\`\`\`js
mySet({}, "a.b.c", 42) // { a: { b: { c: 42 } } } — missing objects are created
mySet({}, "a[0].b", 1) // { a: [ { b: 1 } ] } — a numeric segment creates an array
\`\`\``,
    difficulty: "medium",
    starterCode: `function mySet(obj, path, value) {
}`,
    solutionCode: `function mySet(obj, path, value) {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\\[(\\d+)\\]/g, ".$1").split(".").filter(Boolean);
  let curr = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      curr[key] = value;
    } else {
      if (curr[key] == null) curr[key] = /^\\d+$/.test(keys[i + 1]) ? [] : {};
      curr = curr[key];
    }
  });
  return obj;
}`,
    testCases: [
      { input: "mySet({}, 'a.b.c', 42)", expected: "{ a: { b: { c: 42 } } }", label: "Creates every missing intermediate object" },
      { input: "mySet({}, 'a[0].b', 1)", expected: "{ a: [ { b: 1 } ] }", label: "A numeric segment creates an array, not an object" },
      { input: "mySet({a:{b:1}}, 'a.b', 2)", expected: "{ a: { b: 2 } }", label: "Overwrites an existing value at the path" },
    ],
    hints: [
      "Walk the path one key at a time, creating the right kind of container (array vs object) based on whether the *next* key looks numeric.",
      "The final key in the path is a plain assignment — no container creation needed there.",
    ],
    orderIndex: 1033,
  },

  {
    slug: "lodash-partial-polyfill",
    companies: ["Uber"],
    category: "javascript-runtime",
    title: "Implement _.partial()",
    description: `**Partial application** locks in some of a function's leading arguments ahead of time, returning a smaller function that only needs the rest — handy for turning a generic function into a specialized one, like pinning the \`greeting\` argument of a \`greet(greeting, name)\` helper to always say \`"Hello"\`. Unlike \`curry\`, it doesn't care about the function's arity and never waits for "enough" arguments — it just calls through immediately with whatever it's given.

## Your task

Write \`myPartial(fn, ...presetArgs)\`, returning a function that calls \`fn\` with \`presetArgs\` followed by whatever arguments it's called with at invocation time, forwarding \`this\` from the eventual call site.

\`\`\`js
function greet(greeting, name) { return greeting + ", " + name + "!"; }
myPartial(greet, "Hello")("Ada") // "Hello, Ada!"
\`\`\``,
    difficulty: "medium",
    starterCode: `function myPartial(fn, ...presetArgs) {
}`,
    solutionCode: `function myPartial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn.apply(this, [...presetArgs, ...laterArgs]);
  };
}`,
    testCases: [
      { input: "function greet(greeting,name){return greeting+', '+name+'!';} myPartial(greet,'Hello')('Ada')", expected: '"Hello, Ada!"', label: "Preset arguments come before the call-time ones" },
      { input: "function add3(a,b,c){return a+b+c;} myPartial(add3,1,2)(3)", expected: "6", label: "Multiple preset arguments work" },
      { input: "obj.method = myPartial(function(x){return this.base+x;}, 5); obj.method()", expected: "obj.base + 5", label: "this is forwarded from the eventual call site" },
    ],
    hints: [
      "Unlike curry, partial doesn't care about the function's arity — it just always calls through with whatever it's got.",
      "fn.apply(this, ...) inside the returned function is what preserves the caller's this.",
    ],
    orderIndex: 1034,
  },

  {
    slug: "lodash-chunk-polyfill",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement _.chunk()",
    description: `**\`_.chunk\`** splits an array into consecutive groups of a fixed size — useful for batching API requests, laying out a grid, or paginating a list client-side. The final group just holds whatever's left over when the array doesn't divide evenly.

## Your task

Write \`myChunk(arr, size)\`, returning an array of arrays where each inner array has at most \`size\` elements, in original order. If \`size\` is less than 1, return an empty array.

\`\`\`js
myChunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]] — the last chunk holds the remainder
myChunk([1, 2, 3], 0) // [] — a size under 1 produces no chunks
\`\`\``,
    difficulty: "medium",
    starterCode: `function myChunk(arr, size) {
}`,
    solutionCode: `function myChunk(arr, size) {
  if (size < 1) return [];
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}`,
    testCases: [
      { input: "myChunk([1,2,3,4,5], 2)", expected: "[[1,2],[3,4],[5]]", label: "The last chunk holds the remainder" },
      { input: "myChunk([1,2,3,4], 2)", expected: "[[1,2],[3,4]]", label: "Divides evenly when the length is a multiple of size" },
      { input: "myChunk([1,2], 5)", expected: "[[1,2]]", label: "A size larger than the array produces a single chunk" },
      { input: "myChunk([1,2,3], 0)", expected: "[]", label: "A size under 1 produces no chunks" },
    ],
    hints: [
      "Array.prototype.slice(i, i + size) naturally clamps at the array's end — no special-casing the last chunk is needed.",
      "Step the loop by size, not by 1.",
    ],
    orderIndex: 1035,
  },

  {
    slug: "lodash-is-equal-polyfill",
    companies: ["Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Implement deep equal _.isEqual()",
    description: `\`===\` only tells you whether two values are the *same reference* — two objects built from identical data still compare unequal. **Structural (deep) equality** instead asks whether two values have the same shape and the same values all the way down, which is what you actually want when comparing, say, two API responses or two pieces of app state.

## Your task

Write \`myIsEqual(a, b)\`, recursively comparing plain objects, arrays, and primitives. Objects/arrays are equal only if they have the same number of keys and every key's value is deeply equal. Use \`Object.is\` semantics at the primitive level, so \`myIsEqual(NaN, NaN)\` is \`true\`.

\`\`\`js
myIsEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }) // true — same shape and values, different references
myIsEqual(NaN, NaN) // true — uses Object.is semantics
\`\`\``,
    difficulty: "medium",
    starterCode: `function myIsEqual(a, b) {
}`,
    solutionCode: `function myIsEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => myIsEqual(a[key], b[key]));
}`,
    testCases: [
      { input: "myIsEqual({a:1,b:{c:2}}, {a:1,b:{c:2}})", expected: "true", label: "Deeply equal nested objects match" },
      { input: "myIsEqual({a:1}, {a:2})", expected: "false", label: "A differing value at any depth breaks equality" },
      { input: "myIsEqual([1,2,3], [1,2,3])", expected: "true", label: "Arrays are compared element by element" },
      { input: "myIsEqual(NaN, NaN)", expected: "true", label: "Uses Object.is semantics, so NaN equals itself" },
    ],
    hints: [
      "Object.is handles the primitive base case correctly, including the NaN and signed-zero edge cases === gets wrong.",
      "Comparing key counts before recursing is a cheap way to reject objects with extra/missing keys early.",
    ],
    orderIndex: 1036,
  },

  {
    slug: "lodash-clone-deep-polyfill",
    companies: ["Meta", "Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Create _.cloneDeep()",
    description: `A shallow copy (\`{ ...obj }\`, \`Object.assign\`) only copies the top level — nested objects are still shared by reference, so mutating the "copy" can silently corrupt the original. A **deep clone** produces a completely independent copy: mutating any part of it, at any depth, never touches the original.

## Your task

Write \`myCloneDeep(value)\`, recursively cloning plain objects, arrays, and \`Date\` instances (cloned as a new \`Date\` with the same time, not a plain object copy). Primitives, including \`null\`, pass through unchanged.

\`\`\`js
const original = { nested: { x: 1 } };
const clone = myCloneDeep(original);
clone.nested.x = 999;
original.nested.x // 1 — untouched, even though the mutation happened deep inside the clone
\`\`\``,
    difficulty: "medium",
    starterCode: `function myCloneDeep(value) {
}`,
    solutionCode: `function myCloneDeep(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(myCloneDeep);
  if (value instanceof Date) return new Date(value.getTime());
  const result = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = myCloneDeep(value[key]);
    }
  }
  return result;
}`,
    testCases: [
      { input: "clone.nested.x = 999 after cloning {nested:{x:1}}", expected: "original.nested.x is still 1", label: "Mutating the clone never affects the original, at any depth" },
      { input: "myCloneDeep([1,[2,3]])[1] === original[1]", expected: "false", label: "Nested arrays are cloned too, not shared by reference" },
      { input: "myCloneDeep(new Date(2020, 0, 1)).getTime()", expected: "same as the original Date's getTime()", label: "A Date instance is cloned as a real new Date with the same time" },
      { input: "myCloneDeep(42)", expected: "42", label: "Primitives pass through unchanged" },
    ],
    hints: [
      "Recurse into arrays and plain objects; primitives (including null) are already immutable, so just return them as-is.",
      "A Date needs special handling — cloning it as a plain object would lose its Date-ness.",
    ],
    orderIndex: 1037,
  },

  {
    slug: "immutability-update-helper",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement an Immutability helper",
    description: `A small subset of React's classic \`update()\` immutability helper — a declarative way to produce a changed copy of a nested structure without hand-writing spreads at every level.

## Your task

Write \`update(value, spec)\` supporting three commands:

- \`{ $set: x }\` — replace \`value\` with \`x\`
- \`{ $push: [...] }\` — return a new array with those items appended
- \`{ $merge: {...} }\` — shallow-merge those keys into \`value\`

Any other key in \`spec\` is treated as a path to recurse into.

\`\`\`js
update({ a: { b: 1 } }, { a: { b: { $set: 2 } } }) // { a: { b: 2 } }
update([1, 2, 3], { $push: [4] }) // [1, 2, 3, 4]
update({ a: 1, b: 2 }, { $merge: { b: 3, c: 4 } }) // { a: 1, b: 3, c: 4 }
\`\`\``,
    difficulty: "medium",
    starterCode: `function update(value, spec) {
}`,
    solutionCode: `function update(value, spec) {
  if (spec.$set !== undefined) return spec.$set;
  if (spec.$push) return [...value, ...spec.$push];
  if (spec.$merge) return { ...value, ...spec.$merge };
  const result = Array.isArray(value) ? [...value] : { ...value };
  for (const key in spec) {
    result[key] = update(value[key], spec[key]);
  }
  return result;
}`,
    testCases: [
      { input: "update({a:1}, {a:{$set:2}})", expected: "{a:2}", label: "$set replaces a nested value" },
      { input: "update([1,2,3], {$push:[4]})", expected: "[1,2,3,4]", label: "$push appends without mutating the original array" },
      { input: "update({a:{b:1}}, {a:{b:{$set:2}}})", expected: "{a:{b:2}}", label: "Commands recurse correctly through nested paths" },
      { input: "update({a:1,b:2}, {$merge:{b:3,c:4}})", expected: "{a:1,b:3,c:4}", label: "$merge shallow-merges new keys" },
      { input: "original object after update()", expected: "completely unchanged", label: "The source value is never mutated" },
    ],
    hints: [
      "Check for $set, $push, and $merge first — only fall through to recursion if none of them are present at this level.",
      "The recursive branch needs to shallow-copy value before writing into it, or you'll mutate the original.",
    ],
    orderIndex: 1038,
  },

  {
    slug: "mini-immer-produce",
    companies: ["Meta", "Airbnb"],
    category: "javascript-runtime",
    title: "Implement a mini Immer produce()",
    description: `**Immer** lets you write mutation-style code against a "draft" and get an immutable update back — instead of hand-writing spread operators like \`{ ...state, count: state.count + 1 }\` to update nested state immutably, you just mutate a draft directly and Immer produces the new object for you. The real library does this efficiently with Proxies and structural sharing; a simplified clone-then-mutate version demonstrates the same core idea.

## Your task

Write \`produce(base, recipe)\`, where \`recipe(draft)\` is called with a deep clone of \`base\` and may mutate that draft freely, including nested objects and arrays. \`produce\` returns the mutated draft, leaving \`base\` completely untouched at every level of nesting.

\`\`\`js
produce({ count: 1 }, (draft) => { draft.count++; })
// { count: 2 } — base.count is still 1

produce({ items: [1, 2] }, (draft) => { draft.items.push(3); })
// { items: [1, 2, 3] } — base.items is still length 2
\`\`\``,
    difficulty: "medium",
    starterCode: `function produce(base, recipe) {
}`,
    solutionCode: `function produce(base, recipe) {
  function clone(value) {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(clone);
    const result = {};
    for (const key in value) result[key] = clone(value[key]);
    return result;
  }
  const draft = clone(base);
  recipe(draft);
  return draft;
}`,
    testCases: [
      { input: "produce({count:1}, draft => { draft.count++; })", expected: "{count:2}", label: "Mutating the draft produces the updated value" },
      { input: "base.count after that call", expected: "still 1", label: "The base object is never mutated" },
      { input: "produce({a:{b:1}}, draft => { draft.a.b = 99; })", expected: "{a:{b:99}}, original a.b still 1", label: "Nested mutations are also isolated from the base" },
      { input: "produce({items:[1,2]}, draft => { draft.items.push(3); })", expected: "{items:[1,2,3]}, original items still length 2", label: "Array mutations inside the recipe work too" },
    ],
    hints: [
      "This simplified version clones eagerly rather than using Proxies for lazy structural sharing — it produces the same observable result for these tests, just without real Immer's performance characteristics.",
      "The recipe function's return value is ignored on purpose — mutating the draft in place is the whole point.",
    ],
    orderIndex: 1039,
  },


  // Stage 4 — String & Number Algorithms
  {
    slug: "count-binary-ones",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Count \"1\"s in binary form",
    description: `Counting **set bits** (population count, or "popcount") means counting how many \`1\`s appear in a number's binary representation — a classic bit-manipulation warm-up that shows up in interview prep for things like Hamming weight and bitmask problems.

## Your task

Write \`countBinaryOnes(n)\` for a non-negative integer \`n\`, returning the number of \`1\` bits in its binary form.

\`\`\`js
countBinaryOnes(7)   // 3 — 7 is 111 in binary
countBinaryOnes(8)   // 1 — 8 is 1000 in binary
countBinaryOnes(255) // 8 — 255 is 11111111 in binary
\`\`\``,
    difficulty: "easy",
    starterCode: `function countBinaryOnes(n) {
}`,
    solutionCode: `function countBinaryOnes(n) {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}`,
    testCases: [
      { input: "7", expected: "3", label: "7 is 111 in binary" },
      { input: "8", expected: "1", label: "8 is 1000 in binary" },
      { input: "0", expected: "0", label: "0 has no set bits" },
      { input: "255", expected: "8", label: "255 is eight 1s in binary" },
    ],
    hints: [
      "n & 1 checks the lowest bit; n >>>= 1 shifts everything one place to the right.",
      "Use the unsigned right shift (>>>) so the loop terminates cleanly for any non-negative integer.",
    ],
    orderIndex: 1040,
  },

  {
    slug: "compress-string-rle",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Compress a string",
    description: `**Run-length encoding (RLE)** is a simple compression technique that collapses consecutive repeated characters into a character followed by its run length — it's the same core idea behind compressing repetitive data before more advanced schemes take over, and a common string-manipulation interview question.

## Your task

Write \`compressString(str)\`. A run of length 1 doesn't get a number written after it. If the compressed form isn't actually shorter than the original, return the original string unchanged.

\`\`\`js
compressString("aaabbbccd") // "a3b3c2d"
compressString("aabbcc")    // "aabbcc" — compression doesn't help here, so the original is returned
\`\`\``,
    difficulty: "easy",
    starterCode: `function compressString(str) {
}`,
    solutionCode: `function compressString(str) {
  let result = "";
  let i = 0;
  while (i < str.length) {
    let j = i;
    while (j < str.length && str[j] === str[i]) j++;
    result += str[i] + (j - i > 1 ? j - i : "");
    i = j;
  }
  return result.length < str.length ? result : str;
}`,
    testCases: [
      { input: '"aaabbbccd"', expected: '"a3b3c2d"', label: "Runs of 2+ get their count appended" },
      { input: '"aaaa"', expected: '"a4"', label: "A single long run compresses well" },
      { input: '"aabbcc"', expected: '"aabbcc"', label: "Returns the original when compression doesn't shrink it" },
    ],
    hints: [
      "Walk the string tracking runs of identical consecutive characters, similar to a two-pointer scan.",
      "Compare lengths at the end — the fallback to the original is part of the spec, not just a nice-to-have.",
    ],
    orderIndex: 1041,
  },

  {
    slug: "first-duplicate-character",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Find the first duplicate character in a string",
    description: `Finding the **first duplicate character** in a string means scanning left to right and returning the character whose *second* occurrence comes earliest — not necessarily the character that repeats most, just the first repeat you'd hit while reading the string.

## Your task

Write \`firstDuplicateChar(str)\`, returning that character, or \`null\` if every character in \`str\` is unique.

\`\`\`js
firstDuplicateChar("abcba")  // "b" — b's second occurrence (index 3) comes before a's (index 4)
firstDuplicateChar("aabbcc") // "a" — a repeats immediately
firstDuplicateChar("abcdef") // null — no character repeats
\`\`\``,
    difficulty: "easy",
    starterCode: `function firstDuplicateChar(str) {
}`,
    solutionCode: `function firstDuplicateChar(str) {
  const seen = new Set();
  for (const ch of str) {
    if (seen.has(ch)) return ch;
    seen.add(ch);
  }
  return null;
}`,
    testCases: [
      { input: '"abcba"', expected: '"b"', label: "b's second occurrence comes before a's" },
      { input: '"abcdef"', expected: "null", label: "No repeats returns null" },
      { input: '"aabbcc"', expected: '"a"', label: "a repeats immediately" },
    ],
    hints: [
      "A Set tracking characters seen so far makes each lookup O(1).",
      "Return as soon as you find a repeat — the first one encountered while scanning left to right is the answer.",
    ],
    orderIndex: 1042,
  },

  {
    slug: "roman-to-integer",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Roman numerals to integer",
    description: `**Roman numerals** are mostly additive — \`VI\` is 5 + 1 = 6 — with one twist: a smaller symbol placed immediately before a larger one is *subtracted* instead of added, so \`IV\` is 4 (not 6) and \`IX\` is 9 (not 11). Converting Roman numerals to integers is a frequent "parse the string, respect the edge case" interview question.

## Your task

Write \`romanToInt(s)\`, converting a valid Roman numeral string to its integer value.

\`\`\`js
romanToInt("III")     // 3 — purely additive
romanToInt("IV")      // 4 — I before V subtracts
romanToInt("MCMXCIV") // 1994 — M + (CM=900) + (XC=90) + IV=4
\`\`\``,
    difficulty: "easy",
    starterCode: `function romanToInt(s) {
}`,
    solutionCode: `function romanToInt(s) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = values[s[i]];
    const next = values[s[i + 1]];
    if (next && curr < next) total -= curr;
    else total += curr;
  }
  return total;
}`,
    testCases: [
      { input: '"III"', expected: "3", label: "A purely additive case" },
      { input: '"IV"', expected: "4", label: "A smaller symbol before a larger one subtracts" },
      { input: '"LVIII"', expected: "58", label: "Mixed additive symbols: L + V + III" },
      { input: '"MCMXCIV"', expected: "1994", label: "Multiple subtractive pairs in one numeral" },
    ],
    hints: [
      "Compare each symbol to the one right after it — if the current value is smaller, it's being subtracted.",
      "A lookup table from symbol to value keeps the comparison logic simple.",
    ],
    orderIndex: 1043,
  },

  {
    slug: "integer-to-roman",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Integer to roman numerals",
    description: `Converting an integer to a **Roman numeral** is the reverse of Roman-to-integer parsing: greedily subtract the largest Roman value that still fits — including the six subtractive pairs like \`CM\` (900) and \`IV\` (4) — and append its symbol, repeating until nothing's left.

## Your task

Write \`intToRoman(num)\` for \`1 <= num <= 3999\`.

\`\`\`js
intToRoman(3)    // "III"
intToRoman(58)   // "LVIII"    — L + V + III
intToRoman(1994) // "MCMXCIV"  — M + CM + XC + IV
\`\`\``,
    difficulty: "easy",
    starterCode: `function intToRoman(num) {
}`,
    solutionCode: `function intToRoman(num) {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}`,
    testCases: [
      { input: "3", expected: '"III"', label: "A purely additive case" },
      { input: "58", expected: '"LVIII"', label: "Mixed additive symbols" },
      { input: "1994", expected: '"MCMXCIV"', label: "Multiple subtractive pairs" },
    ],
    hints: [
      "Include the subtractive pairs (CM, CD, XC, XL, IX, IV) directly in your value/symbol table — it avoids special-casing them separately.",
      "Greedily take the biggest value that still fits, repeatedly, before moving to the next smaller one.",
    ],
    orderIndex: 1044,
  },

  {
    slug: "semver-compare",
    category: "javascript-runtime",
    title: "semver compare",
    description: `Comparing two **semantic version** strings (\`major.minor.patch\`, as used in \`package.json\`) correctly means comparing each segment *numerically*, not as strings — \`"1.10.0"\` is a newer version than \`"1.9.0"\`, even though \`"9" > "1"\` when compared character by character. Naively using \`a > b\` on the raw strings gets this wrong.

## Your task

Write \`compareSemver(a, b)\` for two \`"major.minor.patch"\` strings, returning \`-1\` if \`a < b\`, \`1\` if \`a > b\`, or \`0\` if they're equal.

\`\`\`js
compareSemver("1.2.3", "1.2.4")   // -1 — smaller patch version
compareSemver("2.0.0", "1.9.9")   // 1  — higher major version wins regardless of the rest
compareSemver("1.10.0", "1.9.0")  // 1  — 10 > 9 numerically, not string-wise
\`\`\``,
    difficulty: "easy",
    starterCode: `function compareSemver(a, b) {
}`,
    solutionCode: `function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}`,
    testCases: [
      { input: '"1.2.3", "1.2.4"', expected: "-1", label: "A smaller patch version is less than" },
      { input: '"2.0.0", "1.9.9"', expected: "1", label: "A higher major version wins regardless of the rest" },
      { input: '"1.0.0", "1.0.0"', expected: "0", label: "Identical versions are equal" },
      { input: '"1.10.0", "1.9.0"', expected: "1", label: "Minor versions compare numerically, not as strings" },
    ],
    hints: [
      "Split on '.' and convert each segment with Number() before comparing — comparing the raw strings would break on double-digit segments.",
      "Compare major, then minor, then patch, returning as soon as one segment differs.",
    ],
    orderIndex: 1045,
  },

  {
    slug: "reorder-array-with-indexes",
    companies: ["Uber"],
    category: "javascript-runtime",
    title: "Reorder array with new indexes",
    description: `Given an array and a parallel array of **target indexes**, rearrange the original array so each element lands exactly where it was told to go — a pattern that shows up when reordering list items (e.g. after a drag-and-drop) using a separate "new position" mapping instead of directly swapping elements.

## Your task

Write \`reorder(arr, indices)\`, where \`indices[i]\` is the position \`arr[i]\` should occupy in the result array.

\`\`\`js
reorder(["a", "b", "c"], [2, 0, 1])
// ["b", "c", "a"] — "a" moves to index 2, "b" to index 0, "c" to index 1

reorder(["x", "y"], [1, 0])
// ["y", "x"] — a simple swap
\`\`\``,
    difficulty: "easy",
    starterCode: `function reorder(arr, indices) {
}`,
    solutionCode: `function reorder(arr, indices) {
  const result = new Array(arr.length);
  arr.forEach((value, i) => {
    result[indices[i]] = value;
  });
  return result;
}`,
    testCases: [
      { input: '["a","b","c"], [2,0,1]', expected: '["b","c","a"]', label: "Each element moves to its target index" },
      { input: "[1,2,3], [0,1,2]", expected: "[1,2,3]", label: "Identity indices leave the array unchanged" },
      { input: '["x","y"], [1,0]', expected: '["y","x"]', label: "A simple two-element swap" },
    ],
    hints: [
      "Pre-allocate a result array of the right length, then write each element directly to its target index — no sorting needed.",
    ],
    orderIndex: 1046,
  },

  {
    slug: "most-frequent-character",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Most frequently occurring character",
    description: `Finding the **most frequently occurring character** in a string means counting occurrences of each character and picking the highest count — with a common tie-breaking rule: if two characters are tied for the top count, whichever one *appears first in the string* wins.

## Your task

Write \`mostFrequentChar(str)\`. Return \`null\` for an empty string.

\`\`\`js
mostFrequentChar("aabbbcc") // "b" — b appears 3 times, more than any other character
mostFrequentChar("abcabc")  // "a" — a, b, and c are tied at 2 each, so the first in the string wins
mostFrequentChar("")        // null
\`\`\``,
    difficulty: "easy",
    starterCode: `function mostFrequentChar(str) {
}`,
    solutionCode: `function mostFrequentChar(str) {
  const counts = {};
  for (const ch of str) counts[ch] = (counts[ch] || 0) + 1;
  let best = null;
  let bestCount = 0;
  for (const ch of str) {
    if (counts[ch] > bestCount) {
      best = ch;
      bestCount = counts[ch];
    }
  }
  return best;
}`,
    testCases: [
      { input: '"aabbbcc"', expected: '"b"', label: "The character with the clear highest count wins" },
      { input: '"abcabc"', expected: '"a"', label: "On a tie, the character appearing first in the string wins" },
      { input: '""', expected: "null", label: "An empty string returns null" },
    ],
    hints: [
      "Two passes make this simple: first count every character, then scan again to find the first one hitting the max count.",
      "Scanning the original string (not Object.keys of the counts) for the second pass is what guarantees the tie-break is 'first in the string'.",
    ],
    orderIndex: 1047,
  },

  {
    slug: "add-commas-to-number",
    companies: ["Amazon", "Stripe"],
    category: "javascript-runtime",
    title: "Add comma to number",
    description: `Adding **thousands separators** (commas) to a number is how you'd format a price, a large count, or any number for display — \`1234567\` reads much faster as \`1,234,567\`. The formatting needs to handle negative numbers and decimals without misplacing the sign or corrupting the fractional part.

## Your task

Write \`addCommas(num)\`, inserting a comma every three digits from the right in the integer part, leaving the sign and any decimal part untouched.

\`\`\`js
addCommas(1234567) // "1,234,567"
addCommas(-1234)   // "-1,234"   — the minus sign stays outside the grouping
addCommas(1234.56) // "1,234.56" — the decimal part is untouched
\`\`\``,
    difficulty: "medium",
    starterCode: `function addCommas(num) {
}`,
    solutionCode: `function addCommas(num) {
  const [intPart, decPart] = String(num).split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const digits = sign ? intPart.slice(1) : intPart;
  const withCommas = digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  return sign + withCommas + (decPart ? "." + decPart : "");
}`,
    testCases: [
      { input: "1234567", expected: '"1,234,567"', label: "Groups digits in threes from the right" },
      { input: "-1234", expected: '"-1,234"', label: "The negative sign stays outside the grouping" },
      { input: "999", expected: '"999"', label: "Fewer than four digits needs no comma" },
      { input: "1234.56", expected: '"1,234.56"', label: "The decimal part is untouched by grouping" },
    ],
    hints: [
      "The regex \\\\B(?=(\\\\d{3})+(?!\\\\d)) finds every position that has a multiple-of-3 digits to its right, without being at the very start.",
      "Strip the sign and decimal part off before running the comma regex, then reattach them afterward.",
    ],
    orderIndex: 1048,
  },

  {
    slug: "hex-to-rgba",
    companies: ["Meta", "Adobe"],
    category: "javascript-runtime",
    title: "Convert HEX color to RGBA",
    description: `Converting a **HEX color** to **RGBA** is a routine task when a design system hands you hex values but your CSS-in-JS or canvas code needs \`rgba(r, g, b, a)\` for opacity control. It has to handle both the shorthand 3-digit form (\`#RGB\`) and the full 6-digit form (\`#RRGGBB\`).

## Your task

Write \`hexToRgba(hex, alpha = 1)\`, converting either hex format into an \`rgba(...)\` string.

\`\`\`js
hexToRgba("#FF0000")      // "rgba(255, 0, 0, 1)"
hexToRgba("#00FF00", 0.5) // "rgba(0, 255, 0, 0.5)"
hexToRgba("#03F")         // "rgba(0, 51, 255, 1)" — shorthand #03F expands to #0033FF first
\`\`\``,
    difficulty: "medium",
    starterCode: `function hexToRgba(hex, alpha = 1) {
}`,
    solutionCode: `function hexToRgba(hex, alpha = 1) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}`,
    testCases: [
      { input: '"#FF0000"', expected: '"rgba(255, 0, 0, 1)"', label: "Full-length hex with default alpha" },
      { input: '"#00FF00", 0.5', expected: '"rgba(0, 255, 0, 0.5)"', label: "A custom alpha is used as-is" },
      { input: '"#03F"', expected: '"rgba(0, 51, 255, 1)"', label: "Shorthand 3-digit hex expands each digit" },
    ],
    hints: [
      "Shorthand hex doubles each digit: #03F becomes #0033FF before parsing.",
      "parseInt(pair, 16) converts each two-character hex pair to its decimal value.",
    ],
    orderIndex: 1049,
  },

  {
    slug: "snake-to-camel-case",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Convert snake_case to camelCase",
    description: `Converting **snake_case to camelCase** is a common data-shaping task when a backend API returns \`snake_case\` keys (typical in Python/Ruby conventions) but your JavaScript/TypeScript codebase expects \`camelCase\`.

## Your task

Write \`snakeToCamel(str)\`, removing each underscore and capitalizing the letter that followed it.

\`\`\`js
snakeToCamel("hello_world")      // "helloWorld"
snakeToCamel("user_first_name")  // "userFirstName"
snakeToCamel("already")          // "already" — no underscores, no change
\`\`\``,
    difficulty: "medium",
    starterCode: `function snakeToCamel(str) {
}`,
    solutionCode: `function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}`,
    testCases: [
      { input: '"hello_world"', expected: '"helloWorld"', label: "A single underscore boundary" },
      { input: '"user_first_name"', expected: '"userFirstName"', label: "Multiple underscore boundaries" },
      { input: '"already"', expected: '"already"', label: "A string with no underscores is unchanged" },
    ],
    hints: [
      "A regex replace with a capture group lets you uppercase just the letter right after each underscore.",
    ],
    orderIndex: 1050,
  },

  {
    slug: "negative-array-index-get",
    companies: ["Airbnb"],
    category: "javascript-runtime",
    title: "Support negative array index in JavaScript",
    description: `JavaScript arrays don't natively support **Python-style negative indexing**, where \`-1\` means "the last element," \`-2\` means "second-to-last," and so on. Implementing this yourself is a common warm-up for understanding how array indexing and bounds-checking work under the hood.

## Your task

Write \`getAt(arr, index)\`, treating a negative \`index\` as counting from the end of \`arr\`. Return \`undefined\` if the resulting index is still out of range.

\`\`\`js
getAt([1, 2, 3], -1)  // 3   — the last element
getAt([1, 2, 3], -3)  // 1   — counts all the way back to the first element
getAt([1, 2, 3], -10) // undefined — still out of range after adjustment
\`\`\``,
    difficulty: "medium",
    starterCode: `function getAt(arr, index) {
}`,
    solutionCode: `function getAt(arr, index) {
  return index < 0 ? arr[arr.length + index] : arr[index];
}`,
    testCases: [
      { input: "[1,2,3], -1", expected: "3", label: "-1 is the last element" },
      { input: "[1,2,3], 0", expected: "1", label: "A non-negative index behaves normally" },
      { input: "[1,2,3], -3", expected: "1", label: "-3 reaches all the way to the first element" },
      { input: "[1,2,3], -10", expected: "undefined", label: "An index still out of range returns undefined" },
    ],
    hints: [
      "arr.length + index converts a negative index into the equivalent positive one.",
    ],
    orderIndex: 1051,
  },

  {
    slug: "string-trim-polyfill",
    companies: ["Microsoft"],
    category: "javascript-runtime",
    title: "Implement String.prototype.trim()",
    description: `\`String.prototype.trim()\` strips leading and trailing **whitespace** — spaces, tabs, newlines — without touching whitespace in the middle of the string. Reimplementing it is a good way to practice anchored regular expressions.

## Your task

Add \`myTrim()\` to \`String.prototype\`, stripping whitespace from both ends of \`this\`.

\`\`\`js
"  hi  ".myTrim()        // "hi"
"\\t\\nhello\\n".myTrim() // "hello" — tabs and newlines count as whitespace too
"noSpaces".myTrim()      // "noSpaces" — nothing to strip
\`\`\``,
    difficulty: "medium",
    starterCode: `String.prototype.myTrim = function () {
};`,
    solutionCode: `String.prototype.myTrim = function () {
  return this.replace(/^\\s+|\\s+$/g, "");
};`,
    testCases: [
      { input: '"  hi  "', expected: '"hi"', label: "Strips leading and trailing spaces" },
      { input: '"\\t\\nhello\\n"', expected: '"hello"', label: "Strips tabs and newlines too" },
      { input: '"noSpaces"', expected: '"noSpaces"', label: "A string with no surrounding whitespace is unchanged" },
    ],
    hints: [
      "\\\\s matches any whitespace character, including tabs and newlines, not just the space character.",
      "Two anchored alternatives (^\\\\s+ and \\\\s+$) let a single replace handle both ends in one pass.",
    ],
    orderIndex: 1052,
  },

  {
    slug: "validate-ip-address",
    companies: ["Amazon", "Microsoft", "Cisco"],
    category: "javascript-runtime",
    title: "Validate an IP address",
    description: `A valid **IPv4 address** has exactly four dot-separated octets, each a decimal number from 0 to 255, with no leading zeros (other than the literal \`"0"\` itself — so \`"01"\` is invalid but \`"0"\` is fine). Validating this correctly is a common form-input and networking-adjacent interview question.

## Your task

Write \`isValidIp(str)\`, returning \`true\` only if \`str\` is a well-formed IPv4 address.

\`\`\`js
isValidIp("192.168.1.1") // true
isValidIp("256.1.1.1")   // false — 256 is out of the 0–255 range
isValidIp("01.1.1.1")    // false — leading zero on a multi-digit octet
isValidIp("1.1.1")       // false — only three octets
\`\`\``,
    difficulty: "medium",
    starterCode: `function isValidIp(str) {
}`,
    solutionCode: `function isValidIp(str) {
  const parts = str.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\\d+$/.test(part)) return false;
    if (part.length > 1 && part[0] === "0") return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}`,
    testCases: [
      { input: '"192.168.1.1"', expected: "true", label: "A well-formed address is valid" },
      { input: '"256.1.1.1"', expected: "false", label: "An octet over 255 is invalid" },
      { input: '"01.1.1.1"', expected: "false", label: "A leading zero on a multi-digit octet is invalid" },
      { input: '"1.1.1"', expected: "false", label: "Fewer than four octets is invalid" },
    ],
    hints: [
      "Split on '.' first and reject anything that isn't exactly four parts.",
      "A leading zero is only a problem when the octet has more than one digit — '0' by itself is fine.",
    ],
    orderIndex: 1053,
  },

  {
    slug: "remove-duplicate-characters",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Remove duplicate characters in a string",
    description: `Removing **duplicate characters** from a string means keeping only each character's first occurrence and dropping every later repeat, while preserving the original left-to-right order of what remains.

## Your task

Write \`removeDuplicateChars(str)\`.

\`\`\`js
removeDuplicateChars("mississippi") // "misp" — only the first m, i, s, p survive
removeDuplicateChars("aabbcc")      // "abc"
removeDuplicateChars("")            // ""
\`\`\``,
    difficulty: "medium",
    starterCode: `function removeDuplicateChars(str) {
}`,
    solutionCode: `function removeDuplicateChars(str) {
  return [...new Set(str)].join("");
}`,
    testCases: [
      { input: '"mississippi"', expected: '"misp"', label: "Only the first occurrence of each letter survives" },
      { input: '"aabbcc"', expected: '"abc"', label: "Adjacent duplicates collapse too" },
      { input: '""', expected: '""', label: "An empty string stays empty" },
    ],
    hints: [
      "A Set built from the string's characters already discards duplicates while preserving first-seen order.",
    ],
    orderIndex: 1054,
  },

  {
    slug: "validate-number-string",
    companies: ["Stripe", "Amazon"],
    category: "javascript-runtime",
    title: "Validate number string",
    description: `Validating a **number string** means checking whether a string looks like a valid decimal number: an optional leading \`+\`/\`-\` sign, digits, and an optional decimal point that must have at least one digit on either side of it (so \`"12."\` and \`"."\` are invalid, but \`".5"\` and \`"12.5"\` are fine).

## Your task

Write \`isValidNumberString(str)\`.

\`\`\`js
isValidNumberString("123")   // true
isValidNumberString("-12.5") // true  — a signed decimal
isValidNumberString(".5")    // true  — leading decimal point with digits after it
isValidNumberString("12.")   // false — trailing decimal point with no digits after it
isValidNumberString("abc")   // false
\`\`\``,
    difficulty: "medium",
    starterCode: `function isValidNumberString(str) {
}`,
    solutionCode: `function isValidNumberString(str) {
  return /^[+-]?(\\d+(\\.\\d+)?|\\.\\d+)$/.test(str);
}`,
    testCases: [
      { input: '"123"', expected: "true", label: "A plain integer is valid" },
      { input: '"-12.5"', expected: "true", label: "A signed decimal is valid" },
      { input: '"12."', expected: "false", label: "A trailing decimal point with no digits after it is invalid" },
      { input: '"abc"', expected: "false", label: "Non-numeric text is invalid" },
      { input: '".5"', expected: "true", label: "A leading decimal point with digits after it is valid" },
    ],
    hints: [
      "The alternation between \\\\d+(\\\\.\\\\d+)? and \\\\.\\\\d+ is what allows both '12.5' and '.5', while rejecting a bare '.' or a trailing '.'.",
    ],
    orderIndex: 1055,
  },

  {
    slug: "remove-characters",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Remove characters",
    description: `Removing a set of unwanted **characters** from a string — every character that appears anywhere in a given "characters to remove" list gets stripped out, wherever it occurs in the source string.

## Your task

Write \`removeChars(str, charsToRemove)\`.

\`\`\`js
removeChars("hello world", "lo") // "he wrd" — every "l" and "o" is stripped
removeChars("abcdef", "")        // "abcdef" — nothing to remove
removeChars("aaa", "a")          // ""       — removing every character leaves an empty string
\`\`\``,
    difficulty: "medium",
    starterCode: `function removeChars(str, charsToRemove) {
}`,
    solutionCode: `function removeChars(str, charsToRemove) {
  const removeSet = new Set(charsToRemove);
  return [...str].filter((ch) => !removeSet.has(ch)).join("");
}`,
    testCases: [
      { input: '"hello world", "lo"', expected: '"he wrd"', label: "Removes every occurrence of each character in the set" },
      { input: '"abcdef", ""', expected: '"abcdef"', label: "An empty removal set leaves the string unchanged" },
      { input: '"aaa", "a"', expected: '""', label: "Removing every character leaves an empty string" },
    ],
    hints: [
      "A Set of the characters to remove makes the per-character check O(1).",
    ],
    orderIndex: 1056,
  },

  {
    slug: "uncompress-string-rle",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Uncompress a string",
    description: `**Uncompressing** a run-length-encoded string reverses the RLE process: expand each character followed by an optional count back into that many repetitions. A character with no number after it appears exactly once, and counts can be multiple digits long.

## Your task

Write \`uncompressString(str)\`, handling multi-digit counts (like \`"a10"\` meaning ten \`a\`s).

\`\`\`js
uncompressString("a3b2c") // "aaabbc" — a counted run, plus an uncounted trailing character
uncompressString("a10")   // "aaaaaaaaaa" — a multi-digit count
uncompressString("abc")   // "abc" — no counts at all, every character appears once
\`\`\``,
    difficulty: "medium",
    starterCode: `function uncompressString(str) {
}`,
    solutionCode: `function uncompressString(str) {
  let result = "";
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    i++;
    let numStr = "";
    while (i < str.length && /\\d/.test(str[i])) {
      numStr += str[i];
      i++;
    }
    const count = numStr ? Number(numStr) : 1;
    result += ch.repeat(count);
  }
  return result;
}`,
    testCases: [
      { input: '"a3b2c"', expected: '"aaabbc"', label: "Expands counted runs, and an uncounted trailing character" },
      { input: '"a10"', expected: '"aaaaaaaaaa"', label: "Handles a multi-digit count correctly" },
      { input: '"abc"', expected: '"abc"', label: "No counts at all means every character appears once" },
    ],
    hints: [
      "After reading a character, keep consuming digits for as long as they appear — that's what makes multi-digit counts like '10' work, not just single digits.",
      "String.prototype.repeat(count) is the cleanest way to expand each run.",
    ],
    orderIndex: 1057,
  },


  // Stage 5 — Timing & Rate-Limiting Functions
  {
    slug: "clear-all-timeout-registry",
    companies: ["Uber"],
    category: "javascript-runtime",
    title: "Implement clearAllTimeout()",
    description: `A small registry layered on top of \`setTimeout\` so every pending timeout scheduled through it can be **cancelled in one shot** — a pattern used to clean up all pending timers on component unmount or page navigation, instead of tracking and clearing each timeout id individually.

## Your task

Write \`trackedSetTimeout(fn, delay)\` (works like \`setTimeout\`, but records the returned id) and \`clearAllTimeout()\` (cancels every timeout \`trackedSetTimeout\` has scheduled so far). Timeouts scheduled *after* \`clearAllTimeout()\` runs must be unaffected.

\`\`\`js
trackedSetTimeout(() => console.log("a"), 100);
trackedSetTimeout(() => console.log("b"), 200);
clearAllTimeout();
// neither "a" nor "b" ever logs

trackedSetTimeout(() => console.log("c"), 100);
// "c" still logs normally — it was scheduled after clearAllTimeout()
\`\`\``,
    difficulty: "easy",
    starterCode: `const timeoutIds = [];
function trackedSetTimeout(fn, delay) {
}
function clearAllTimeout() {
}`,
    solutionCode: `const timeoutIds = [];
function trackedSetTimeout(fn, delay) {
  const id = setTimeout(fn, delay);
  timeoutIds.push(id);
  return id;
}
function clearAllTimeout() {
  timeoutIds.forEach((id) => clearTimeout(id));
  timeoutIds.length = 0;
}`,
    testCases: [
      { input: "3 timeouts scheduled, then clearAllTimeout()", expected: "none of them fire", label: "Cancels every previously scheduled timeout" },
      { input: "a timeout scheduled after clearAllTimeout()", expected: "still fires normally", label: "Doesn't affect timeouts scheduled afterward" },
      { input: "a timeout left uncancelled", expected: "fires as normal", label: "A normal, un-cleared timeout still fires" },
    ],
    hints: [
      "Keep a module-level array of every id returned by the real setTimeout.",
      "clearAllTimeout should also empty the tracked list afterward, so old (already-cleared) ids don't linger.",
    ],
    orderIndex: 1058,
  },

  {
    slug: "basic-debounce-warmup",
    category: "javascript-runtime",
    title: "Implement basic debounce()",
    description: `The most commonly asked question in front-end interviews, in its simplest form: **debounce** coalesces a burst of rapid calls into a single call, using only the most recent call's arguments — useful for things like a search-box input handler that shouldn't fire an API request on every keystroke.

## Your task

Write \`debounce(fn, delay)\`. Each new call resets the wait; \`fn\` only runs once \`delay\` ms pass with no further calls, using that last call's arguments and \`this\`.

\`\`\`js
const log = debounce((msg) => console.log(msg), 300);
log("a"); log("b"); log("c");
// only "c" logs, 300ms after the last call — "a" and "b" are discarded
\`\`\``,
    difficulty: "easy",
    starterCode: `function debounce(fn, delay) {
}`,
    solutionCode: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    testCases: [
      { input: "3 rapid calls within the delay window", expected: "fn runs once, with the last call's arguments", label: "Coalesces a burst into a single call" },
      { input: "two bursts separated by more than the delay", expected: "fn runs once per burst", label: "Separate bursts each produce their own call" },
      { input: "this binding", expected: "forwarded from the triggering call", label: "this is forwarded correctly" },
    ],
    hints: [
      "clearTimeout + setTimeout on every call is the entire mechanism — no cancel() or leading/trailing options needed for this version.",
    ],
    orderIndex: 1059,
  },

  {
    slug: "basic-throttle-warmup",
    category: "javascript-runtime",
    title: "Implement basic throttle()",
    description: `Where **debounce** waits for a pause before firing, **throttle** guarantees a steady maximum rate — perfect for scroll or resize handlers that shouldn't run on every single event, but still need to fire regularly while the events keep coming.

## Your task

Write \`throttle(fn, interval)\` using a simple leading-edge strategy: the first call runs immediately, and any call within \`interval\` ms of the last one that actually ran is dropped.

\`\`\`js
const onScroll = throttle(() => console.log("scrolled"), 100);
onScroll(); // runs immediately
onScroll(); // dropped — called within 100ms of the last run
// ...100ms later
onScroll(); // runs — the interval has fully elapsed
\`\`\``,
    difficulty: "medium",
    starterCode: `function throttle(fn, interval) {
}`,
    solutionCode: `function throttle(fn, interval) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}`,
    testCases: [
      { input: "the very first call", expected: "runs immediately", label: "The first call is never delayed" },
      { input: "a second call right after the first", expected: "dropped", label: "Calls within the interval are dropped" },
      { input: "a call after the interval has fully elapsed", expected: "runs", label: "Throttling resets once the interval passes" },
    ],
    hints: [
      "Track the timestamp of the last call that actually ran fn, and compare against it on every new call.",
    ],
    orderIndex: 1060,
  },

  {
    slug: "debounce-leading-trailing",
    companies: ["Uber", "TikTok", "Airbnb"],
    category: "javascript-runtime",
    title: "debounce() with leading & trailing option",
    description: `A production-grade **debounce** supports firing on the **leading** edge of a burst (immediately, on the first call), the **trailing** edge (once the burst goes quiet), or both — Lodash's \`_.debounce\` exposes exactly these two options.

## The idea

With both \`leading\` and \`trailing\` enabled, a burst of calls fires twice: once immediately, and once again after things go quiet — *unless* the burst was only a single call, in which case the leading fire already covered it and there's no separate trailing fire.

## Your task

Write \`debounce(fn, delay, options)\`, where \`options\` is \`{ leading = false, trailing = true }\`:

- \`leading: true\` — fire immediately on the first call of a burst
- \`trailing: true\` — fire again after the burst goes quiet, **unless** it was the burst's only call and \`leading\` already handled it

\`\`\`js
const fn = debounce(save, 300, { leading: true, trailing: true });
fn(); fn(); fn();
// fires immediately (leading), then once more 300ms after the last call (trailing)

const onlyLeading = debounce(save, 300, { leading: true, trailing: false });
onlyLeading(); onlyLeading(); onlyLeading();
// fires exactly once, immediately — no trailing call at all
\`\`\``,
    difficulty: "medium",
    starterCode: `function debounce(fn, delay, options = {}) {
  const { leading = false, trailing = true } = options;
}`,
    solutionCode: `function debounce(fn, delay, options = {}) {
  const { leading = false, trailing = true } = options;
  let timer = null;
  let callCount = 0;
  return function (...args) {
    callCount++;
    if (callCount === 1 && leading) fn.apply(this, args);
    clearTimeout(timer);
    const self = this;
    timer = setTimeout(() => {
      if (trailing && !(leading && callCount === 1)) fn.apply(self, args);
      timer = null;
      callCount = 0;
    }, delay);
  };
}`,
    testCases: [
      { input: "{ leading: true, trailing: false }, 3 rapid calls", expected: "fires exactly once, immediately", label: "leading-only fires once at the start of the burst" },
      { input: "{ trailing: true } (default), 3 rapid calls", expected: "fires exactly once, after the burst goes quiet", label: "trailing-only behaves like classic debounce" },
      { input: "{ leading: true, trailing: true }, 3 rapid calls", expected: "fires twice — once immediately, once after the burst", label: "Both edges fire for a multi-call burst" },
    ],
    hints: [
      "Track how many calls happened in the current (not-yet-settled) burst — that count is what decides whether the trailing fire is redundant.",
      "A single isolated call with both leading and trailing enabled should still only fire once — there's no 'second' invocation to speak of.",
    ],
    orderIndex: 1061,
  },

  {
    slug: "throttle-leading-trailing",
    companies: ["Uber", "TikTok", "Airbnb"],
    category: "javascript-runtime",
    title: "throttle() with leading & trailing option",
    description: `The **throttle** equivalent of the leading/trailing idea: control whether the very first call in a window fires immediately, and whether one more call fires at the end of the window using the most recent arguments — this is the same shape as Underscore.js's \`_.throttle\`.

## Your task

Write \`throttle(fn, interval, options)\`, where \`options\` is \`{ leading = true, trailing = true }\`.

\`\`\`js
const fn = throttle(log, 100, { leading: true, trailing: true });
fn("a"); // fires immediately with "a"
fn("b"); // within the window — scheduled for the trailing edge
// ~100ms later: fires with "b" (the most recent arguments)

const onlyLeading = throttle(log, 100, { leading: true, trailing: false });
onlyLeading("x"); onlyLeading("y"); onlyLeading("z");
// fires exactly once, immediately, with "x"

const onlyTrailing = throttle(log, 100, { leading: false, trailing: true });
onlyTrailing("x"); onlyTrailing("y"); onlyTrailing("z");
// nothing fires immediately — fires once, ~100ms later, with "z" (the most recent arguments)
\`\`\``,
    difficulty: "medium",
    starterCode: `function throttle(fn, interval, options = {}) {
  const { leading = true, trailing = true } = options;
}`,
    solutionCode: `function throttle(fn, interval, options = {}) {
  const { leading = true, trailing = true } = options;
  let lastCallTime = 0;
  let timer = null;
  let lastArgs = null;
  return function (...args) {
    const now = Date.now();
    lastArgs = args;
    const self = this;
    if (!lastCallTime && !leading) lastCallTime = now;
    const remaining = interval - (now - lastCallTime);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      lastCallTime = now;
      fn.apply(self, args);
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timer = null;
        fn.apply(self, lastArgs);
      }, remaining);
    }
  };
}`,
    testCases: [
      { input: "{ leading: true, trailing: false }, 3 rapid calls", expected: "fires exactly once, immediately", label: "leading-only fires once at the start of the window" },
      { input: "{ leading: false, trailing: true }, 3 rapid calls", expected: "fires once, after the window, with the last call's arguments", label: "trailing-only defers to the end of the window" },
      { input: "{ leading: true, trailing: true }, a call, then another shortly after", expected: "fires twice — leading immediately, trailing at window's end", label: "Both edges fire when there's a call within the window after the leading one" },
    ],
    hints: [
      "This is the classic Underscore.js throttle shape: track the last time fn actually ran, and schedule a trailing call only when time remains in the window.",
      "leading: false needs a small trick — treat the first call's timestamp as the window start instead of firing immediately, so remaining is never ≤ 0 on that first call.",
    ],
    orderIndex: 1062,
  },

  {
    slug: "fake-settimeout-clock",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Create a fake timer (setTimeout)",
    description: `The kind of tool that powers Jest's fake timers: a **virtual clock** you advance manually, useful for testing time-dependent code (debounce, throttle, retry-with-backoff) without actually waiting in real time during your test suite.

## Your task

Write \`createFakeTimers()\`, returning \`{ setTimeout, clearTimeout, tick }\`:

- \`setTimeout(fn, delay)\` schedules \`fn\` against the virtual clock and returns an id
- \`clearTimeout(id)\` cancels a pending callback
- \`tick(ms)\` advances the virtual clock by \`ms\` and synchronously runs every callback now due, in chronological order

\`\`\`js
const timers = createFakeTimers();
timers.setTimeout(() => console.log("fired"), 100);
timers.tick(50);  // nothing happens yet — only 50ms have passed
timers.tick(50);  // "fired" — the full 100ms delay has now elapsed
\`\`\``,
    difficulty: "medium",
    starterCode: `function createFakeTimers() {
}`,
    solutionCode: `function createFakeTimers() {
  let now = 0;
  let idCounter = 0;
  const scheduled = [];
  function fakeSetTimeout(fn, delay) {
    const id = ++idCounter;
    scheduled.push({ id, time: now + delay, fn });
    return id;
  }
  function fakeClearTimeout(id) {
    const idx = scheduled.findIndex((t) => t.id === id);
    if (idx !== -1) scheduled.splice(idx, 1);
  }
  function tick(ms) {
    now += ms;
    const due = scheduled.filter((t) => t.time <= now).sort((a, b) => a.time - b.time);
    due.forEach((t) => {
      const idx = scheduled.indexOf(t);
      if (idx !== -1) scheduled.splice(idx, 1);
      t.fn();
    });
  }
  return { setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout, tick };
}`,
    testCases: [
      { input: "scheduled for 100ms, tick(50) then tick(50)", expected: "fires only after the second tick", label: "A callback only fires once its full delay has elapsed" },
      { input: "clearTimeout(id) before the matching tick", expected: "the callback never fires", label: "Cancelling a scheduled callback works" },
      { input: "callbacks scheduled for 30ms and 10ms, in that order, then tick(30)", expected: "the 10ms one fires first", label: "Due callbacks fire in chronological (not scheduling) order" },
    ],
    hints: [
      "There's no real setTimeout involved at all — 'time' is just a number you increment yourself.",
      "On tick, find everything due, sort by scheduled time, then run each in order — a callback that schedules another callback during tick() is out of scope here.",
    ],
    orderIndex: 1063,
  },

  {
    slug: "build-set-interval-polyfill",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Create an interval",
    description: `A hand-rolled \`setInterval\` built from repeated \`setTimeout\` calls, with a clean way to stop it — the same self-scheduling pattern real interval implementations often use internally, since it avoids the callback pile-up you can get from a busy native \`setInterval\`.

## Your task

Write \`createInterval(fn, delay)\`, which starts calling \`fn\` every \`delay\` ms and returns a function that stops it. \`fn\` should not run before the first \`delay\` has elapsed.

\`\`\`js
const stop = createInterval(() => console.log("tick"), 1000);
// "tick" logs roughly every 1000ms, starting after the first 1000ms — not immediately
stop(); // no further "tick" logs after this
\`\`\``,
    difficulty: "medium",
    starterCode: `function createInterval(fn, delay) {
}`,
    solutionCode: `function createInterval(fn, delay) {
  let stopped = false;
  function loop() {
    if (stopped) return;
    setTimeout(() => {
      if (stopped) return;
      fn();
      loop();
    }, delay);
  }
  loop();
  return () => { stopped = true; };
}`,
    testCases: [
      { input: "right after createInterval(fn, 30)", expected: "fn has not run yet", label: "Doesn't fire before the first interval elapses" },
      { input: "after waiting for a few intervals", expected: "fn has run multiple times", label: "Fires repeatedly at roughly the given interval" },
      { input: "calling the returned stop function", expected: "no further calls happen", label: "The returned function stops future firings" },
    ],
    hints: [
      "Each fire schedules the next one via setTimeout — there's no need for the native setInterval at all.",
      "Check the stopped flag both before scheduling and right before actually calling fn, so a stop() mid-flight is respected.",
    ],
    orderIndex: 1064,
  },

  {
    slug: "fake-setinterval-clock",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Create a fake timer (setInterval)",
    description: `The \`setInterval\` counterpart to the fake \`setTimeout\` clock — a manually-advanced **virtual clock** that fires a callback repeatedly at a fixed cadence, so interval-driven code can be tested deterministically without real wall-clock waiting.

## Your task

Write \`createFakeIntervalTimers()\`, returning \`{ setInterval, clearInterval, tick }\`. \`tick(ms)\` should fire a given interval as many times as fit within the advanced time, catching it up correctly even across a single large tick.

\`\`\`js
const timers = createFakeIntervalTimers();
timers.setInterval(() => console.log("tick"), 10);
timers.tick(35);
// logs "tick" 3 times — one large tick catches up on every firing that's now due
\`\`\``,
    difficulty: "medium",
    starterCode: `function createFakeIntervalTimers() {
}`,
    solutionCode: `function createFakeIntervalTimers() {
  let now = 0;
  let idCounter = 0;
  const intervals = new Map();
  function fakeSetInterval(fn, delay) {
    const id = ++idCounter;
    intervals.set(id, { nextTime: now + delay, delay, fn });
    return id;
  }
  function fakeClearInterval(id) {
    intervals.delete(id);
  }
  function tick(ms) {
    now += ms;
    for (const [id, interval] of intervals) {
      while (intervals.has(id) && interval.nextTime <= now) {
        interval.fn();
        interval.nextTime += interval.delay;
      }
    }
  }
  return { setInterval: fakeSetInterval, clearInterval: fakeClearInterval, tick };
}`,
    testCases: [
      { input: "a 10ms interval, tick(35) once", expected: "fires 3 times", label: "A single large tick catches up on every due firing" },
      { input: "clearInterval(id) then tick(50)", expected: "no further firings", label: "clearInterval stops future firings" },
      { input: "two intervals with different delays running together", expected: "each fires at its own cadence, independently", label: "Multiple intervals don't interfere with each other" },
    ],
    hints: [
      "Advance each interval's next-due time by its own delay every time it fires, rather than recomputing from scratch — that's what lets it self-correct across ticks.",
      "A single tick(ms) call might need to fire the same interval more than once if ms is larger than its delay.",
    ],
    orderIndex: 1065,
  },


  // Stage 6 — Asynchronous JavaScript & Promises
  {
    slug: "async-task-queue",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement AsyncTaskQueue",
    description: `An **async task queue** guarantees that async tasks run strictly one at a time, in the order they were added — even if a new task is enqueued while an earlier one is still in flight. This is the pattern behind things like a UI that must never send two save requests concurrently.

## Your task

Write an \`AsyncTaskQueue\` class with an \`add(taskFn)\` method. \`taskFn\` returns a promise; \`add\` returns a promise that resolves with that specific task's result once it's actually run. A rejected task must not block the tasks queued after it.

\`\`\`js
const queue = new AsyncTaskQueue();
queue.add(() => delay(300).then(() => "first"));  // starts running immediately
queue.add(() => delay(50).then(() => "second"));  // waits for "first" to finish first
// resolves in order: "first" (after ~300ms), then "second" (~50ms later) —
// never both in flight at once, even though "second" has the shorter delay
\`\`\``,
    difficulty: "easy",
    starterCode: `class AsyncTaskQueue {
  add(taskFn) {
  }
}`,
    solutionCode: `class AsyncTaskQueue {
  constructor() {
    this.queue = Promise.resolve();
  }
  add(taskFn) {
    const resultPromise = this.queue.then(() => taskFn());
    this.queue = resultPromise.catch(() => {});
    return resultPromise;
  }
}`,
    testCases: [
      { input: "tasks with different delays added in order", expected: "run strictly one at a time, in the order added", label: "Tasks never overlap, regardless of their individual delays" },
      { input: "queue.add(taskFn)", expected: "resolves with that specific task's own result", label: "Each add() call resolves with the right value" },
      { input: "a rejected task followed by another task", expected: "the later task still runs", label: "A rejection doesn't block the rest of the queue" },
    ],
    hints: [
      "Chain onto a single running 'tail' promise — each add() replaces the tail with a new promise that runs after the previous one settles.",
      "Swallow the tail's rejection internally (with .catch) so a failed task doesn't poison every task after it, while still letting add()'s own returned promise reflect that task's real outcome.",
    ],
    orderIndex: 1066,
  },

  {
    slug: "node-style-promisify",
    companies: ["Amazon", "Netflix"],
    category: "javascript-runtime",
    title: "Implement promisify()",
    description: `**Node's callback convention** — \`fn(...args, (err, result) => {})\`, where the callback's first argument is an error (or \`null\`) and the second is the result — predates Promises. \`promisify\` converts a function built on that convention into one that returns a Promise instead, the same utility Node's own \`util.promisify\` provides.

## Your task

Write \`promisify(fn)\`, wrapping an error-first callback-style function into one that returns a promise: it resolves with the callback's result when \`err\` is falsy, or rejects with \`err\` otherwise.

\`\`\`js
function readFileCb(path, cb) {
  // ...eventually calls cb(null, "file contents") or cb(new Error("not found"))
}
const readFile = promisify(readFileCb);
readFile("a.txt").then((contents) => console.log(contents));
// resolves with "file contents" if the callback succeeds,
// or rejects with the Error if the callback passes one
\`\`\``,
    difficulty: "easy",
    starterCode: `function promisify(fn) {
}`,
    solutionCode: `function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}`,
    testCases: [
      { input: "a callback-style function that succeeds", expected: "the returned promise resolves with the result", label: "Resolves with the callback's success value" },
      { input: "a callback-style function that errors", expected: "the returned promise rejects with the error", label: "Rejects with the callback's error" },
      { input: "a function taking multiple arguments before the callback", expected: "all forwarded correctly", label: "Forwards every argument ahead of the injected callback" },
    ],
    hints: [
      "The wrapped function's own callback just needs to call resolve or reject based on the (err, result) convention.",
      "Spread the caller's arguments, then append your own callback as the final argument.",
    ],
    orderIndex: 1067,
  },

  {
    slug: "promise-race-polyfill",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Implement Promise.race()",
    description: `\`Promise.race()\` settles as soon as the **first** input settles — whether that's a fulfillment or a rejection — and ignores every input that settles afterward. It's the building block behind patterns like "resolve with whichever of these finishes first."

## Your task

Write \`myPromiseRace(promises)\`, mirroring the native \`Promise.race\`. A plain (non-promise) value in the array counts as already settled, so it can win the race immediately.

\`\`\`js
const fast = new Promise((res) => setTimeout(() => res("fast"), 50));
const slow = new Promise((res) => setTimeout(() => res("slow"), 500));
myPromiseRace([slow, fast]).then(console.log);
// "fast" — resolves with whichever settles first, regardless of array order

myPromiseRace([slow, Promise.reject("early error")]).catch(console.log);
// "early error" — a fast rejection wins the race too

myPromiseRace([slow, "instant"]).then(console.log);
// "instant" — a plain value is already settled, so it beats any pending promise
\`\`\``,
    difficulty: "easy",
    starterCode: `function myPromiseRace(promises) {
}`,
    solutionCode: `function myPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => Promise.resolve(p).then(resolve, reject));
  });
}`,
    testCases: [
      { input: "a fast-resolving promise among slower ones", expected: "resolves with the fastest one's value", label: "Resolves with whichever settles first" },
      { input: "a fast-rejecting promise among slower resolving ones", expected: "rejects with that reason", label: "A fast rejection wins the race too" },
      { input: "a plain (non-promise) value mixed in", expected: "settles immediately with that value", label: "Non-promise values settle instantly, beating any pending promise" },
    ],
    hints: [
      "Promise.resolve(p) normalizes a plain value into a promise that's already settled, so it can be treated uniformly.",
      "Whichever input calls resolve/reject on the outer promise first wins — later calls are simply ignored, since a promise can only settle once.",
    ],
    orderIndex: 1068,
  },

  {
    slug: "race-with-timeout",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Async helper: race a promise against a timeout",
    description: `A practical, everyday use of racing promises: give a promise a **deadline**, and fail fast with a timeout error instead of hanging forever if it doesn't settle in time — the pattern behind "cancel this fetch if it takes longer than 5 seconds."

## Your task

Write \`raceWithTimeout(promise, ms)\`, which resolves or rejects exactly like \`promise\` if it settles before \`ms\` milliseconds pass, or rejects with a timeout error if \`ms\` elapses first.

\`\`\`js
raceWithTimeout(fetch("/slow-api"), 3000)
  .then((res) => console.log("got it in time"))
  .catch((err) => console.log(err.message));
// "timeout" — if the fetch takes longer than 3000ms
// otherwise resolves normally with the fetch's own result
\`\`\``,
    difficulty: "easy",
    starterCode: `function raceWithTimeout(promise, ms) {
}`,
    solutionCode: `function raceWithTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]);
}`,
    testCases: [
      { input: "a promise that resolves before the timeout", expected: "resolves normally with its value", label: "A fast promise wins normally" },
      { input: "a promise that takes longer than ms", expected: "rejects with a timeout error", label: "A slow promise is preempted by the timeout" },
      { input: "a promise that rejects before the timeout", expected: "rejects with the original reason, not a timeout error", label: "An early rejection is not masked by the timeout" },
    ],
    hints: [
      "Promise.race between the real promise and a promise that rejects after ms milliseconds is the entire trick.",
    ],
    orderIndex: 1069,
  },

  {
    slug: "build-custom-promise",
    companies: ["Google", "Meta", "Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Create your own Promise",
    description: `Implementing your own \`Promise\` class — states, chaining, error propagation — is one of the most common "hard round" front-end interview questions, meant to prove you understand how \`.then()\` chaining and async error handling actually work under the hood, not just how to use them.

## The idea

A promise has exactly three states — **pending**, **fulfilled**, **rejected** — and once it settles into fulfilled or rejected, it can never change again. \`.then()\` always returns a *new* promise, which is what makes chaining (\`p.then(a).then(b)\`) and error propagation through a chain possible.

## Your task

Write a \`MyPromise\` class with \`then\`, \`catch\`, and \`finally\`:

- three states: pending, fulfilled, rejected, each settled exactly once
- \`.then(onFulfilled, onRejected)\` returns a **new** promise for chaining
- an error thrown inside the executor rejects the promise
- resolving with a thenable adopts that thenable's eventual state

\`\`\`js
new MyPromise((resolve) => resolve(1))
  .then((v) => v + 1)
  .then((v) => console.log(v));
// 2 — each .then() passes its return value to the next

new MyPromise(() => { throw new Error("boom"); })
  .catch((err) => console.log(err.message));
// "boom" — a synchronous throw in the executor rejects the promise
\`\`\``,
    difficulty: "medium",
    starterCode: `class MyPromise {
  constructor(executor) {
  }
  then(onFulfilled, onRejected) {
  }
  catch(onRejected) {
  }
  finally(onFinally) {
  }
}`,
    solutionCode: `class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.callbacks = [];
    const resolve = (value) => {
      if (this.state !== "pending") return;
      if (value && typeof value.then === "function") {
        value.then(resolve, reject);
        return;
      }
      this.state = "fulfilled";
      this.value = value;
      this.callbacks.forEach((cb) => cb.onFulfilled(value));
    };
    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      this.callbacks.forEach((cb) => cb.onRejected(reason));
    };
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        queueMicrotask(() => {
          if (typeof onFulfilled !== "function") { resolve(value); return; }
          try { resolve(onFulfilled(value)); } catch (err) { reject(err); }
        });
      };
      const handleRejected = (reason) => {
        queueMicrotask(() => {
          if (typeof onRejected !== "function") { reject(reason); return; }
          try { resolve(onRejected(reason)); } catch (err) { reject(err); }
        });
      };
      if (this.state === "fulfilled") handleFulfilled(this.value);
      else if (this.state === "rejected") handleRejected(this.value);
      else this.callbacks.push({ onFulfilled: handleFulfilled, onRejected: handleRejected });
    });
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => { onFinally(); return value; },
      (reason) => { onFinally(); throw reason; }
    );
  }
}`,
    testCases: [
      { input: "new MyPromise(resolve => resolve(1)).then(v => v + 1)", expected: "resolves with 2", label: "Basic resolution and chaining" },
      { input: "an executor that throws synchronously", expected: "the promise rejects with that error", label: "A thrown error in the executor rejects the promise" },
      { input: "then(a).then(b)", expected: "b receives a's return value", label: "Chained handlers pass values forward" },
      { input: ".catch() on a rejected promise", expected: "receives the rejection reason", label: "catch() handles a rejection" },
      { input: "resolve(anotherPromise)", expected: "adopts that promise's eventual state", label: "Resolving with a thenable adopts its state instead of wrapping it" },
    ],
    hints: [
      "then() must always return a brand-new MyPromise, so chains keep working — even a call with no handlers just forwards the value/reason.",
      "queueMicrotask (or setTimeout as a simpler stand-in) keeps .then callbacks asynchronous, matching real Promise semantics.",
      "Guard against a value that has its own .then — that's what makes 'resolving with a promise' behave correctly instead of nesting promises.",
    ],
    orderIndex: 1070,
  },

  {
    slug: "promise-all-polyfill",
    companies: ["Google", "Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Implement Promise.all()",
    description: `\`Promise.all()\` waits for **every** input to fulfill, preserving input order in the results regardless of which one finishes first — but rejects immediately the moment any single input rejects, without waiting for the rest.

## Your task

Write \`myPromiseAll(promises)\`, supporting a mix of promises and plain (non-promise) values.

\`\`\`js
const p1 = new Promise((res) => setTimeout(() => res("one"), 200));
const p2 = new Promise((res) => setTimeout(() => res("two"), 50));
myPromiseAll([p1, p2, "three"]).then(console.log);
// ["one", "two", "three"] — order matches the input array, even though p2 resolved first

myPromiseAll([p1, Promise.reject("fail")]).catch(console.log);
// "fail" — rejects as soon as any single input rejects, without waiting for p1
\`\`\``,
    difficulty: "medium",
    starterCode: `function myPromiseAll(promises) {
}`,
    solutionCode: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) { resolve([]); return; }
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        remaining--;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}`,
    testCases: [
      { input: "a mix of promises resolving at different speeds, plus a plain value", expected: "resolves with all values in original input order", label: "Result order matches input order regardless of resolution timing" },
      { input: "one input rejects while others are still pending", expected: "rejects immediately with that reason", label: "Rejects as soon as any single input rejects" },
      { input: "[]", expected: "resolves immediately with []", label: "An empty input resolves right away" },
    ],
    hints: [
      "Track a remaining counter and write each result into its own index — never push, or timing differences will scramble the order.",
    ],
    orderIndex: 1071,
  },

  {
    slug: "promise-all-settled-polyfill",
    companies: ["Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Implement Promise.allSettled()",
    description: `Unlike \`Promise.all\`, \`Promise.allSettled()\` never short-circuits on a rejection — it waits for **every** input to settle, one way or another, and reports each outcome individually instead of failing the whole batch.

## Your task

Write \`myPromiseAllSettled(promises)\`, resolving with an array of \`{ status: "fulfilled", value }\` or \`{ status: "rejected", reason }\` objects, one per input, in the same order as the input array.

\`\`\`js
myPromiseAllSettled([
  Promise.resolve("ok"),
  Promise.reject("oops"),
]).then(console.log);
// [
//   { status: "fulfilled", value: "ok" },
//   { status: "rejected", reason: "oops" }
// ] — both outcomes are reported, nothing short-circuits
\`\`\``,
    difficulty: "medium",
    starterCode: `function myPromiseAllSettled(promises) {
}`,
    solutionCode: `function myPromiseAllSettled(promises) {
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value) => ({ status: "fulfilled", value }),
        (reason) => ({ status: "rejected", reason })
      )
    )
  );
}`,
    testCases: [
      { input: "a mix of resolving and rejecting promises", expected: "waits for all of them, reporting each outcome individually", label: "Never short-circuits on a rejection" },
      { input: "a fulfilled input", expected: "{ status: 'fulfilled', value }", label: "A resolved input produces the fulfilled shape" },
      { input: "a rejected input", expected: "{ status: 'rejected', reason }", label: "A rejected input produces the rejected shape" },
    ],
    hints: [
      "Map every input through its own .then that always resolves — turning a rejection into a normal fulfilled value with status: 'rejected' — then Promise.all the mapped array.",
    ],
    orderIndex: 1072,
  },

  {
    slug: "promise-any-polyfill",
    companies: ["Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Implement Promise.any()",
    description: `\`Promise.any()\` is the mirror image of \`Promise.all\`: it resolves as soon as **any** input fulfills — ignoring rejections along the way — and only rejects once **every single** input has rejected.

## Your task

Write \`myPromiseAny(promises)\`.

\`\`\`js
const fails = Promise.reject("nope");
const succeeds = new Promise((res) => setTimeout(() => res("yes"), 100));
myPromiseAny([fails, succeeds]).then(console.log);
// "yes" — resolves as soon as any input fulfills, even though "fails" rejected first

myPromiseAny([Promise.reject("a"), Promise.reject("b")]).catch((err) => {
  console.log(err.message); // "All promises were rejected" — only once every input has rejected
});
\`\`\``,
    difficulty: "medium",
    starterCode: `function myPromiseAny(promises) {
}`,
    solutionCode: `function myPromiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let remaining = promises.length;
    if (remaining === 0) { reject(new Error("All promises were rejected")); return; }
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        remaining--;
        if (remaining === 0) reject(new Error("All promises were rejected"));
      });
    });
  });
}`,
    testCases: [
      { input: "one fulfillment among several rejections", expected: "resolves with that fulfilled value", label: "Resolves as soon as any input fulfills" },
      { input: "every input rejects", expected: "rejects only once all of them have", label: "Only rejects when every single input has rejected" },
      { input: "a rejection arrives before a slower fulfillment", expected: "still eventually resolves with the fulfillment", label: "A fulfillment wins even if a rejection came in earlier" },
    ],
    hints: [
      "Resolve the outer promise the moment any input fulfills — no need to wait for the rest.",
      "Only reject once every single input has rejected — track a remaining count of rejections, mirroring how Promise.all tracks fulfillments.",
    ],
    orderIndex: 1073,
  },

  {
    slug: "promise-finally-polyfill",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement Promise.prototype.finally()",
    description: `\`Promise.prototype.finally()\` runs a callback once a promise **settles** — regardless of whether it fulfilled or rejected — without changing the eventual outcome. It's the promise equivalent of a \`try/finally\` block, handy for things like hiding a loading spinner no matter how a request ends.

## Your task

Add \`myFinally(onFinally)\` to \`Promise.prototype\`. \`onFinally\` receives no arguments, and its return value is ignored — the original value or rejection reason passes through unchanged.

\`\`\`js
Promise.resolve(42)
  .myFinally(() => console.log("done"))
  .then((v) => console.log(v));
// logs "done", then 42 — the resolved value passes through untouched

Promise.reject("error")
  .myFinally(() => console.log("done"))
  .catch((err) => console.log(err));
// logs "done", then "error" — the rejection still propagates
\`\`\``,
    difficulty: "medium",
    starterCode: `Promise.prototype.myFinally = function (onFinally) {
};`,
    solutionCode: `Promise.prototype.myFinally = function (onFinally) {
  return this.then(
    (value) => { onFinally(); return value; },
    (reason) => { onFinally(); throw reason; }
  );
};`,
    testCases: [
      { input: "a resolved promise", expected: "the callback runs, and the resolved value passes through unchanged", label: "Runs on fulfillment without altering the value" },
      { input: "a rejected promise", expected: "the callback runs, and the rejection still propagates", label: "Runs on rejection without swallowing the error" },
      { input: "the value chained after myFinally on a resolved promise", expected: "the original value, not onFinally's return value", label: "onFinally's own return value is ignored" },
    ],
    hints: [
      "The callback runs with no arguments — it doesn't get the value or the reason, and its return value is discarded.",
      "On the rejection branch, re-throw the original reason after running the callback, so the rejection keeps propagating.",
    ],
    orderIndex: 1074,
  },

  {
    slug: "async-sequence-helper",
    companies: ["Amazon", "Uber"],
    category: "javascript-runtime",
    title: "Async helper: sequence()",
    description: `A \`sequence()\` helper runs a list of async tasks **one after another** — each task only starts once the previous one has fully finished — useful when later steps depend on earlier ones, or when you need to strictly rate-limit how many requests are in flight at once (one).

## Your task

Write \`sequence(tasks)\`, where \`tasks\` is an array of zero-argument functions each returning a promise (or plain value). Return a promise resolving with all results, in the same order as \`tasks\`. If a task rejects, \`sequence()\` rejects with that reason and later tasks never run.

\`\`\`js
const tasks = [
  () => delay(100).then(() => "a"),
  () => delay(50).then(() => "b"),
];
sequence(tasks).then(console.log);
// ["a", "b"] — task 2 doesn't even start until task 1 resolves, ~150ms total
\`\`\``,
    difficulty: "medium",
    starterCode: `async function sequence(tasks) {
}`,
    solutionCode: `async function sequence(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}`,
    testCases: [
      { input: "tasks with different delays", expected: "each one starts only after the previous finishes", label: "Tasks run strictly one at a time, never overlapping" },
      { input: "results from all tasks", expected: "in the same order as the input tasks", label: "Results preserve input order" },
      { input: "a task that rejects partway through", expected: "sequence() rejects with that reason, later tasks never run", label: "A rejection stops the sequence" },
    ],
    hints: [
      "A plain for...of loop with await inside it is the entire implementation — no need for reduce or recursion.",
      "Because each task() call is only made after awaiting the previous one, a later task is never even started until then.",
    ],
    orderIndex: 1075,
  },

  {
    slug: "async-parallel-helper",
    companies: ["Amazon", "Uber"],
    category: "javascript-runtime",
    title: "Async helper: parallel()",
    description: `A \`parallel()\` helper is the concurrent counterpart to \`sequence()\`: it starts **every task immediately**, and collects all the results once they're all done — so the total time is roughly the slowest task's delay, not the sum of every task's delay.

## Your task

Write \`parallel(tasks)\`, where \`tasks\` is an array of zero-argument functions each returning a promise (or plain value). Results come back in the same order as \`tasks\`, regardless of which one finishes first. If any task rejects, \`parallel()\` rejects with that reason.

\`\`\`js
const tasks = [
  () => delay(100).then(() => "a"),
  () => delay(50).then(() => "b"),
];
parallel(tasks).then(console.log);
// ["a", "b"] — both tasks start at once, so this resolves in ~100ms (the slower one), not 150ms
\`\`\``,
    difficulty: "medium",
    starterCode: `function parallel(tasks) {
}`,
    solutionCode: `function parallel(tasks) {
  return Promise.all(tasks.map((task) => task()));
}`,
    testCases: [
      { input: "tasks with different delays", expected: "total time is roughly the slowest task's delay, not the sum of all of them", label: "Tasks run concurrently, not one after another" },
      { input: "results from tasks finishing in a different order than they were started", expected: "still returned in the original input order", label: "Result order matches input order, not completion order" },
      { input: "any task rejecting", expected: "parallel() rejects with that reason", label: "A single rejection fails the whole batch" },
    ],
    hints: [
      "Calling every task() up front (via map) is what makes them run concurrently — sequence() awaits inside the loop, this doesn't.",
      "Promise.all already gives you both the ordering guarantee and the fail-fast rejection behavior for free.",
    ],
    orderIndex: 1076,
  },

  {
    slug: "flatten-thunk",
    companies: ["Airbnb"],
    category: "javascript-runtime",
    title: "Flatten a Thunk",
    description: `A **thunk**, in the callback-style sense, is a function that takes a single \`(err, result) => {}\` callback and eventually invokes it. Compose enough thunk-returning helpers together and you can end up with a thunk whose "result" is itself another thunk, several levels deep — flattening walks that chain down to the actual final value before ever calling your callback.

## Your task

Write \`flattenThunk(thunk)\`, returning a new thunk that, when called with a callback, recursively unwraps nested thunks until it reaches a non-thunk value, then invokes the callback with that value. An error at any level should propagate immediately, short-circuiting the unwrapping.

\`\`\`js
const inner = (cb) => cb(null, 42);
const outer = (cb) => cb(null, inner); // resolves to another thunk, not a value
flattenThunk(outer)((err, result) => {
  console.log(result); // 42 — nested thunks are unwrapped down to the final value
});
\`\`\``,
    difficulty: "easy",
    starterCode: `function flattenThunk(thunk) {
}`,
    solutionCode: `function flattenThunk(thunk) {
  return function (callback) {
    thunk((err, result) => {
      if (err) { callback(err); return; }
      if (typeof result === "function") {
        flattenThunk(result)(callback);
      } else {
        callback(null, result);
      }
    });
  };
}`,
    testCases: [
      { input: "a thunk resolving directly to a value", expected: "the callback receives that value", label: "A single-level thunk resolves normally" },
      { input: "a thunk resolving to another thunk, several levels deep", expected: "the callback receives the final unwrapped value", label: "Nested thunks are recursively flattened" },
      { input: "an error at any level of nesting", expected: "propagates immediately to the callback", label: "An error short-circuits the unwrapping" },
    ],
    hints: [
      "Check whether the result of calling a thunk is itself a function — if so, recurse by flattening that one too.",
    ],
    orderIndex: 1077,
  },

  {
    slug: "retry-promise-on-rejection",
    companies: ["Amazon", "Uber", "Netflix"],
    category: "javascript-runtime",
    title: "Auto-retry a Promise on rejection",
    description: `Flaky network calls are a fact of life — **retrying** a failed request a bounded number of times before finally giving up is a common resilience pattern, whether it's a transient server error or a dropped connection.

## Your task

Write \`retry(fn, retries)\`, where \`fn\` returns a promise. On rejection, call \`fn\` again, up to \`retries\` additional times, resolving as soon as any attempt succeeds. If every attempt fails, reject with the last error once \`retries\` is exhausted.

\`\`\`js
let attempts = 0;
const flaky = () => {
  attempts++;
  return attempts < 3 ? Promise.reject("network error") : Promise.resolve("ok");
};
retry(flaky, 3).then((result) => {
  console.log(result); // "ok" — resolved on the 3rd attempt after two failures
});
\`\`\``,
    difficulty: "medium",
    starterCode: `function retry(fn, retries) {
}`,
    solutionCode: `function retry(fn, retries) {
  return fn().catch((err) => {
    if (retries <= 0) throw err;
    return retry(fn, retries - 1);
  });
}`,
    testCases: [
      { input: "fn resolves on the first attempt", expected: "resolves immediately, fn called only once", label: "A successful first attempt needs no retries" },
      { input: "fn always rejects, retries: 2", expected: "fn is called 3 times total, then rejects", label: "Exhausts all retries before giving up" },
      { input: "fn fails twice then succeeds, retries: 3", expected: "resolves with the successful attempt's value", label: "Resolves as soon as any attempt succeeds" },
    ],
    hints: [
      "Recursion is a natural fit: .catch() on the current attempt, and if retries remain, return retry(fn, retries - 1) from inside it.",
      "retries counts down to 0 as the stopping condition — the base case is 'no retries left, rethrow the last error'.",
    ],
    orderIndex: 1078,
  },

  {
    slug: "concurrency-limited-promises",
    companies: ["Uber", "Airbnb", "Bloomberg"],
    category: "javascript-runtime",
    title: "Throttle Promises (concurrency limiter)",
    description: `Running hundreds of requests all at once can overwhelm a server (or hit a rate limit) — a concurrency limiter caps how many run at the same time, while still running everything eventually.

## Your task

Write \`runWithConcurrency(tasks, limit)\`, where \`tasks\` is an array of zero-argument functions returning promises. At most \`limit\` tasks should be in flight at any moment. Resolve with all results in original input order.

\`\`\`js
const delay = (ms, value) => () => new Promise((res) => setTimeout(() => res(value), ms));
const tasks = [delay(30, "a"), delay(10, "b"), delay(20, "c")];
runWithConcurrency(tasks, 2).then((results) => {
  console.log(results); // ["a", "b", "c"] — input order, even though "b" finishes first
});
\`\`\``,
    difficulty: "medium",
    starterCode: `function runWithConcurrency(tasks, limit) {
}`,
    solutionCode: `function runWithConcurrency(tasks, limit) {
  return new Promise((resolve, reject) => {
    const results = new Array(tasks.length);
    let nextIndex = 0;
    let completed = 0;
    if (tasks.length === 0) { resolve([]); return; }
    function startNext() {
      if (nextIndex >= tasks.length) return;
      const i = nextIndex++;
      tasks[i]().then((value) => {
        results[i] = value;
        completed++;
        if (completed === tasks.length) resolve(results);
        else startNext();
      }, reject);
    }
    for (let i = 0; i < Math.min(limit, tasks.length); i++) startNext();
  });
}`,
    testCases: [
      { input: "10 tasks, limit: 3", expected: "never more than 3 running at the same instant", label: "Never exceeds the concurrency limit" },
      { input: "tasks finishing in a different order than started", expected: "results still returned in original input order", label: "Result order matches input order, not completion order" },
      { input: "more tasks than the limit", expected: "every task eventually runs and completes", label: "All tasks eventually run, not just the first batch" },
    ],
    hints: [
      "Start exactly `limit` tasks up front, and every time one finishes, immediately start the next queued one — that's the whole scheduling loop.",
      "Write each result into results[i] by its original index, not by push order, to keep the output correctly ordered.",
    ],
    orderIndex: 1079,
  },

  {
    slug: "dedupe-concurrent-api-calls",
    companies: ["Airbnb", "LinkedIn"],
    category: "javascript-runtime",
    title: "Merge identical/duplicate API calls",
    description: `If the same request fires twice before the first one comes back, there's no reason to hit the network twice — share the one in-flight promise between both callers instead.

## Your task

Write \`dedupeAsync(fn)\`, wrapping an async function keyed by its single argument. Concurrent calls with the same key share one underlying call; once that call settles, a later call with the same key triggers a fresh one.

\`\`\`js
let calls = 0;
const fetchUser = dedupeAsync(async (id) => {
  calls++;
  return { id };
});
Promise.all([fetchUser(1), fetchUser(1)]).then(() => {
  console.log(calls); // 1 — both concurrent calls for id 1 shared one underlying request
});
\`\`\``,
    difficulty: "medium",
    starterCode: `function dedupeAsync(fn) {
}`,
    solutionCode: `function dedupeAsync(fn) {
  const inFlight = new Map();
  return function (key) {
    if (inFlight.has(key)) return inFlight.get(key);
    const promise = fn(key).finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };
}`,
    testCases: [
      { input: "two concurrent calls with the same key", expected: "the underlying fn is called only once", label: "Concurrent calls with the same key are merged" },
      { input: "two concurrent calls with different keys", expected: "each triggers its own call to fn", label: "Different keys are never merged together" },
      { input: "a call after the first one has already settled", expected: "triggers a brand-new call to fn", label: "Deduplication doesn't turn into permanent caching" },
    ],
    hints: [
      "A Map from key to in-flight promise is the whole cache — populate it on the first call for a key, and return the existing entry for any concurrent call with the same key.",
      "Clean up the map entry once the promise settles (.finally works well here), so the next call with that key starts fresh instead of reusing a stale result.",
    ],
    orderIndex: 1080,
  },

  {
    slug: "fetch-all-paginated-pages",
    companies: ["Amazon", "Airbnb"],
    category: "javascript-runtime",
    title: "Call APIs with pagination",
    description: `Real-world list endpoints rarely return everything in one response — a **cursor-paginated** API hands back one page of items plus a cursor pointing at the next page (or \`null\`/falsy once there isn't one). Fetching "all" of something usually means driving that pagination loop yourself: keep requesting pages, following each cursor, until the API tells you to stop.

## Your task

Write \`fetchAllPages(fetchPage)\`, where \`fetchPage(cursor)\` returns a promise resolving to \`{ items, nextCursor }\`. Start with \`cursor = null\`, concatenate each page's \`items\` in order, and keep requesting subsequent pages — passing each page's \`nextCursor\` into the next call — until \`nextCursor\` is falsy. Return the combined array of every page's items.

\`\`\`js
let calls = 0;
function fetchPage(cursor) {
  calls++;
  if (calls === 1) return Promise.resolve({ items: [1, 2], nextCursor: "p2" });
  return Promise.resolve({ items: [3, 4], nextCursor: null });
}
fetchAllPages(fetchPage).then((items) => {
  console.log(items); // [1, 2, 3, 4] — both pages concatenated in order
});
\`\`\``,
    difficulty: "medium",
    starterCode: `async function fetchAllPages(fetchPage) {
}`,
    solutionCode: `async function fetchAllPages(fetchPage) {
  let cursor = null;
  let allItems = [];
  while (true) {
    const { items, nextCursor } = await fetchPage(cursor);
    allItems = allItems.concat(items);
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return allItems;
}`,
    testCases: [
      { input: "three pages of items", expected: "one flat array with every page's items, in order", label: "Collects and concatenates every page" },
      { input: "a page whose nextCursor is null", expected: "fetchAllPages stops there", label: "Stops once there's no next cursor" },
      { input: "the cursor argument passed to each fetchPage call", expected: "matches the previous page's nextCursor", label: "Each call is chained correctly using the prior page's cursor" },
    ],
    hints: [
      "This is naturally a loop, not recursion (though recursion works too) — keep calling fetchPage with the latest cursor until nextCursor is falsy.",
      "The very first call should use cursor = null, matching how a fresh pagination request typically starts.",
    ],
    orderIndex: 1081,
  },

  {
    slug: "message-channel-task-scheduler",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Create a callback on message channel",
    description: `\`MessageChannel\` is a lesser-known trick for scheduling a callback that runs asynchronously, after the current microtask queue drains — historically used by libraries like React's Scheduler for finer-grained task timing than \`setTimeout\`.

## Your task

Write \`scheduleTask(callback)\` using \`MessageChannel\`, running \`callback\` asynchronously (never synchronously, and after any already-queued microtasks).

\`\`\`js
console.log("1: sync");
scheduleTask(() => console.log("3: scheduled task"));
Promise.resolve().then(() => console.log("2: microtask"));
// logs "1: sync", then "2: microtask", then "3: scheduled task"
\`\`\``,
    difficulty: "medium",
    starterCode: `function scheduleTask(callback) {
}`,
    solutionCode: `function scheduleTask(callback) {
  const channel = new MessageChannel();
  channel.port2.onmessage = () => callback();
  channel.port1.postMessage(null);
}`,
    testCases: [
      { input: "scheduleTask(fn) followed immediately by more synchronous code", expected: "fn has not run yet", label: "Never runs synchronously" },
      { input: "a microtask (Promise.then) queued alongside scheduleTask", expected: "the microtask runs first", label: "Runs after already-queued microtasks" },
      { input: "two separate scheduleTask calls", expected: "each callback runs exactly once, independently", label: "Multiple scheduled tasks don't interfere with each other" },
    ],
    hints: [
      "Posting a message on one port and listening on the other port of the same channel is the entire scheduling mechanism — the message handler fires as a real async task.",
      "A Promise.resolve().then(...) queued at the same time will always run before the message handler, since microtasks fully drain before the next task runs.",
    ],
    orderIndex: 1082,
  },


  // Stage 7 — Data Structures
  {
    slug: "reverse-linked-list",
    companies: ["Amazon", "Microsoft", "Google"],
    category: "javascript-runtime",
    title: "Reverse a linked list",
    description: `A classic **pointer-manipulation** warm-up: reverse a singly linked list in place by flipping every node's \`next\` pointer to point backward, without building a new list or copying any values.

## Your task

Write \`reverseLinkedList(head)\`, where each node is \`{ value, next }\`. Return the new head — the node that was previously the tail.

\`\`\`js
const head = { value: 1, next: { value: 2, next: { value: 3, next: null } } };
reverseLinkedList(head);
// 3 -> 2 -> 1 -> null (the returned head is the node that used to be the tail)
\`\`\``,
    difficulty: "easy",
    starterCode: `function reverseLinkedList(head) {
}`,
    solutionCode: `function reverseLinkedList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    testCases: [
      { input: "1 -> 2 -> 3 -> null", expected: "3 -> 2 -> 1 -> null", label: "Reverses a multi-node list" },
      { input: "1 -> null", expected: "1 -> null", label: "A single-node list reverses to itself" },
      { input: "null", expected: "null", label: "An empty list stays empty" },
    ],
    hints: [
      "Three pointers — previous, current, and a saved next — are all you need, walked one step at a time.",
      "Save curr.next before overwriting it, or you'll lose the rest of the list.",
    ],
    orderIndex: 1083,
  },

  {
    slug: "detect-linked-list-cycle",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Detect a cycle in a linked list",
    description: `Floyd's classic **tortoise and hare** algorithm: two pointers moving at different speeds are guaranteed to meet if — and only if — the list loops back on itself. It solves cycle detection in O(1) space, without tracking every visited node in a Set.

## Your task

Write \`hasCycle(head)\`, using two pointers rather than a visited-nodes Set.

\`\`\`js
const a = { value: 1 };
const b = { value: 2 };
a.next = b;
b.next = a; // the tail loops back into the list
hasCycle(a);
// true

hasCycle({ value: 1, next: { value: 2, next: null } });
// false — a normal, non-circular list
\`\`\``,
    difficulty: "easy",
    starterCode: `function hasCycle(head) {
}`,
    solutionCode: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    testCases: [
      { input: "a list whose tail points back into itself", expected: "true", label: "Detects a real cycle" },
      { input: "a normal, non-circular list", expected: "false", label: "No false positive on an acyclic list" },
      { input: "null", expected: "false", label: "An empty list has no cycle" },
    ],
    hints: [
      "If a fast pointer (2 steps) and a slow pointer (1 step) ever point to the exact same node, there must be a cycle.",
      "If the fast pointer reaches the end (null) first, there's no cycle — that's your other exit condition.",
    ],
    orderIndex: 1084,
  },

  {
    slug: "invert-binary-tree",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Invert a binary tree",
    description: `Made famous by an offhand tweet about not being able to invert a binary tree on a whiteboard — it's actually one of the simplest tree problems once the recursion clicks. **Inverting** a binary tree means mirroring it: every node's left and right children swap places, all the way down to the leaves.

## Your task

Write \`invertBinaryTree(root)\`, where each node is \`{ value, left, right }\`. Recursively swap every node's \`left\` and \`right\` and return the (mutated) root. An empty tree (\`null\`) stays \`null\`.

\`\`\`js
const root = {
  value: 1,
  left: { value: 2, left: null, right: null },
  right: { value: 3, left: null, right: null },
};
invertBinaryTree(root);
// root.left.value === 3, root.right.value === 2 — children swapped
\`\`\``,
    difficulty: "easy",
    starterCode: `function invertBinaryTree(root) {
}`,
    solutionCode: `function invertBinaryTree(root) {
  if (!root) return null;
  const left = invertBinaryTree(root.left);
  const right = invertBinaryTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}`,
    testCases: [
      { input: "a 3-node tree with a left and right child", expected: "left and right children swapped", label: "Swaps children at the top level" },
      { input: "a multi-level tree", expected: "every level swapped, not just the root", label: "Recursively swaps children at every depth" },
      { input: "null", expected: "null", label: "An empty tree stays empty" },
    ],
    hints: [
      "Recurse first, then swap — invert both subtrees, then swap the two already-inverted results onto the current node.",
    ],
    orderIndex: 1085,
  },

  {
    slug: "queue-using-two-stacks",
    companies: ["Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Implement a Queue using Stacks",
    description: `A **queue** (FIFO — first in, first out) built entirely out of two **stacks** (LIFO — last in, first out) — a classic demonstration that the "wrong" data structure can simulate the right one with a clever amortized trick.

## Your task

Write a \`QueueViaStacks\` class with \`enqueue(value)\` and \`dequeue()\`, using two array-backed stacks internally (only \`.push()\`/\`.pop()\`, never array \`.shift()\`/\`.unshift()\`). \`dequeue()\` must return values in the same order they were enqueued, and return \`undefined\` on an empty queue.

\`\`\`js
const q = new QueueViaStacks();
q.enqueue(1);
q.enqueue(2);
q.enqueue(3);
q.dequeue(); // 1 — FIFO order, even though it's built from two LIFO stacks
q.dequeue(); // 2
\`\`\``,
    difficulty: "medium",
    starterCode: `class QueueViaStacks {
  enqueue(value) {
  }
  dequeue() {
  }
}`,
    solutionCode: `class QueueViaStacks {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  enqueue(value) {
    this.inStack.push(value);
  }
  dequeue() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop());
    }
    return this.outStack.pop();
  }
}`,
    testCases: [
      { input: "enqueue(1,2,3) then dequeue() three times", expected: "1, then 2, then 3", label: "FIFO order is preserved" },
      { input: "dequeue() on an empty queue", expected: "undefined", label: "Dequeuing an empty queue doesn't throw" },
      { input: "enqueue, dequeue, enqueue, dequeue interleaved", expected: "still correct FIFO order", label: "Interleaved operations stay correct" },
    ],
    hints: [
      "One stack absorbs new items; when the output stack is empty, dump the whole input stack into it (reversing order), then pop from there.",
      "You only need to do that dump when the output stack is actually empty — not on every dequeue.",
    ],
    orderIndex: 1086,
  },

  {
    slug: "stack-using-two-queues",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement a Stack using Queues",
    description: `The mirror-image exercise to Queue-via-Stacks: build a **stack** (LIFO) purely out of **queue**-style operations, rotating elements instead of stacking them.

## Your task

Write a \`StackViaQueues\` class with \`push(value)\` and \`pop()\`, using a single array as a queue (only \`.push()\` and \`.shift()\`, never index-based LIFO access). \`pop()\` must return values in last-in-first-out order, and return \`undefined\` on an empty stack.

\`\`\`js
const s = new StackViaQueues();
s.push(1);
s.push(2);
s.push(3);
s.pop(); // 3 — LIFO order, even though it's built from queue rotations
s.pop(); // 2
\`\`\``,
    difficulty: "medium",
    starterCode: `class StackViaQueues {
  push(value) {
  }
  pop() {
  }
}`,
    solutionCode: `class StackViaQueues {
  constructor() {
    this.queue = [];
  }
  push(value) {
    this.queue.push(value);
    for (let i = 0; i < this.queue.length - 1; i++) {
      this.queue.push(this.queue.shift());
    }
  }
  pop() {
    return this.queue.shift();
  }
}`,
    testCases: [
      { input: "push(1,2,3) then pop() three times", expected: "3, then 2, then 1", label: "LIFO order is preserved" },
      { input: "pop() on an empty stack", expected: "undefined", label: "Popping an empty stack doesn't throw" },
      { input: "push, pop, push, pop interleaved", expected: "still correct LIFO order", label: "Interleaved operations stay correct" },
    ],
    hints: [
      "The trick is on push, not pop: after pushing the new value to the back, rotate the queue so that new value ends up at the front.",
      "Rotating means shifting every older element off the front and pushing it back onto the end, one at a time.",
    ],
    orderIndex: 1087,
  },

  {
    slug: "build-priority-queue",
    companies: ["Amazon", "Google"],
    category: "javascript-runtime",
    title: "Create a Priority Queue",
    description: `A **priority queue** dequeues by priority instead of insertion order — the structure behind task schedulers, Dijkstra's algorithm, and any "always process the most urgent thing next" system. Here a lower priority number comes out sooner, and equal priorities fall back to plain FIFO order.

## Your task

Write a \`PriorityQueue\` class with \`enqueue(value, priority)\` and \`dequeue()\`.

\`\`\`js
const pq = new PriorityQueue();
pq.enqueue("low", 5);
pq.enqueue("high", 1);
pq.dequeue(); // "high" — priority 1 comes out before priority 5
\`\`\``,
    difficulty: "medium",
    starterCode: `class PriorityQueue {
  enqueue(value, priority) {
  }
  dequeue() {
  }
}`,
    solutionCode: `class PriorityQueue {
  constructor() {
    this.items = [];
  }
  enqueue(value, priority) {
    const node = { value, priority };
    let i = 0;
    while (i < this.items.length && this.items[i].priority <= priority) i++;
    this.items.splice(i, 0, node);
  }
  dequeue() {
    const node = this.items.shift();
    return node ? node.value : undefined;
  }
}`,
    testCases: [
      { input: "items enqueued with mixed priorities, out of order", expected: "dequeued lowest-priority-number first", label: "Dequeues in ascending priority order" },
      { input: "two items enqueued with the same priority", expected: "dequeued in the order they were enqueued", label: "Equal priorities break ties by insertion order" },
      { input: "dequeue() on an empty queue", expected: "undefined", label: "Dequeuing an empty queue doesn't throw" },
    ],
    hints: [
      "A simple sorted-insert into an array (via splice) is more than fast enough for interview scope — no need for a binary heap.",
      "Insert after every existing item with a priority ≤ the new one, so equal priorities naturally stay in insertion order.",
    ],
    orderIndex: 1088,
  },

  {
    slug: "find-top-k-elements",
    companies: ["Amazon", "Google", "ByteDance"],
    category: "javascript-runtime",
    title: "Find Top-K Elements",
    description: `"Top-K" problems show up everywhere — leaderboard scores, trending posts, the highest bids in an auction. This is the simplest version: find the \`k\` largest values in an array and return them largest-first.

## Your task

Write \`findTopK(nums, k)\`, returning an array of the \`k\` largest values from \`nums\`, sorted in descending order. If \`k\` is larger than \`nums.length\`, return the whole array sorted descending; if \`k\` is \`0\`, return an empty array.

\`\`\`js
findTopK([3, 1, 4, 1, 5, 9, 2, 6], 3)
// [9, 6, 5]

findTopK([1, 2], 5)
// [2, 1] — k larger than the array just returns everything, sorted descending

findTopK([1, 2, 3], 0)
// [] — k = 0 returns an empty array
\`\`\``,
    difficulty: "medium",
    starterCode: `function findTopK(nums, k) {
}`,
    solutionCode: `function findTopK(nums, k) {
  return [...nums].sort((a, b) => b - a).slice(0, k);
}`,
    testCases: [
      { input: "[3,1,4,1,5,9,2,6], 3", expected: "[9, 6, 5]", label: "Returns the k largest values, descending" },
      { input: "[1,2], 5", expected: "[2, 1]", label: "k larger than the array just returns everything, sorted" },
      { input: "[1,2,3], 0", expected: "[]", label: "k = 0 returns an empty array" },
    ],
    hints: [
      "Sorting descending and slicing the first k is the simplest correct approach — a heap-based O(n log k) solution is a nice follow-up but not required here.",
    ],
    orderIndex: 1089,
  },

  {
    slug: "build-trie-prefix-tree",
    companies: ["Google", "Amazon"],
    category: "javascript-runtime",
    title: "Implement a Trie (prefix tree)",
    description: `A **trie** (prefix tree) is the data structure behind autocomplete and spell-check: each path from the root spells out a prefix, so both "is this an exact word?" and "does anything start with this?" resolve in time proportional to the string's length, not the size of the whole dictionary.

## Your task

Write a \`Trie\` class with \`insert(word)\`, \`search(word)\` (exact match), and \`startsWith(prefix)\` (any inserted word begins with this).

\`\`\`js
const trie = new Trie();
trie.insert("cat");
trie.search("cat"); // true
trie.search("ca"); // false — "ca" was never inserted as a complete word
trie.startsWith("ca"); // true — "cat" starts with "ca"
\`\`\``,
    difficulty: "medium",
    starterCode: `class Trie {
  insert(word) {
  }
  search(word) {
  }
  startsWith(prefix) {
  }
}`,
    solutionCode: `class Trie {
  constructor() {
    this.root = {};
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      node[ch] = node[ch] || {};
      node = node[ch];
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node[ch]) return false;
      node = node[ch];
    }
    return !!node.isEnd;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node[ch]) return false;
      node = node[ch];
    }
    return true;
  }
}`,
    testCases: [
      { input: "insert('cat'); search('cat')", expected: "true", label: "search() finds an exact inserted word" },
      { input: "insert('cat'); startsWith('ca')", expected: "true", label: "startsWith() matches a prefix even if it wasn't inserted as its own word" },
      { input: "insert('cat'); search('ca')", expected: "false", label: "search() rejects a prefix that isn't itself a complete inserted word" },
    ],
    hints: [
      "Each node is just a plain object keyed by character, plus an isEnd flag marking 'a complete word ends here'.",
      "search() and startsWith() share almost identical walking logic — the only difference is checking isEnd at the end.",
    ],
    orderIndex: 1090,
  },

  {
    slug: "serialize-deserialize-binary-tree",
    companies: ["Google", "Amazon"],
    category: "javascript-runtime",
    title: "Serialize and deserialize a binary tree",
    description: `A tree only exists as connected node objects in memory — to save it to disk or send it over the network, you need to flatten it into a string, then be able to rebuild an equivalent tree from that string later.

## Your task

Write \`serialize(root)\` and \`deserialize(data)\`, where each node is \`{ value, left, right }\`. Any encoding is fine as long as \`deserialize(serialize(tree))\` reconstructs an equivalent tree, including correctly round-tripping \`null\` for an empty tree.

\`\`\`js
const tree = { value: 1, left: { value: 2, left: null, right: null }, right: null };
const data = serialize(tree);
// data: "1,2,null,null,null"
deserialize(data);
// an equivalent tree: { value: 1, left: { value: 2, left: null, right: null }, right: null }
\`\`\``,
    difficulty: "medium",
    starterCode: `function serialize(root) {
}
function deserialize(data) {
}`,
    solutionCode: `function serialize(root) {
  if (!root) return "null";
  return root.value + "," + serialize(root.left) + "," + serialize(root.right);
}
function deserialize(data) {
  const values = data.split(",");
  let i = 0;
  function build() {
    const val = values[i++];
    if (val === "null") return null;
    return { value: Number(val), left: build(), right: build() };
  }
  return build();
}`,
    testCases: [
      { input: "a small multi-level tree, round-tripped", expected: "an equivalent tree structure", label: "Round-trips a small tree correctly" },
      { input: "a single-node tree, round-tripped", expected: "an equivalent single-node tree", label: "Round-trips a single node" },
      { input: "null, round-tripped", expected: "null", label: "Round-trips an empty tree" },
    ],
    hints: [
      "A preorder traversal (value, then left, then right) with an explicit marker for 'no node here' is enough to make the encoding unambiguous.",
      "deserialize can consume the flat list of tokens with a shared index/cursor, rebuilding the same shape it was serialized in.",
    ],
    orderIndex: 1091,
  },

  {
    slug: "binary-tree-vertical-traversal",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Binary tree vertical traversal",
    description: `**Vertical order traversal** groups every node into a column based on its horizontal distance from the root — root is column 0, a left child is one column left, a right child is one column right — then reads the columns left to right, top to bottom within each. It's a well-known interview staple precisely because the tie-breaking rule (same row *and* column) is easy to get subtly wrong.

## Your task

Write \`verticalTraversal(root)\`, returning an array of columns (left to right), each an array of values top-to-bottom. Nodes landing at the exact same row and column break ties by ascending value.

\`\`\`js
const root = {
  value: 1,
  left: { value: 2, left: null, right: null },
  right: { value: 3, left: null, right: null },
};
verticalTraversal(root)
// [[2], [1], [3]] — left child's column, then root's column, then right child's column

const withTie = {
  value: 1,
  left: { value: 2, left: null, right: { value: 4, left: null, right: null } },
  right: { value: 3, left: { value: 5, left: null, right: null }, right: null },
};
verticalTraversal(withTie)
// [[2], [1, 4, 5], [3]] — 4 and 5 land at the same row AND column, so ascending value (4 before 5) breaks the tie
\`\`\``,
    difficulty: "hard",
    starterCode: `function verticalTraversal(root) {
}`,
    solutionCode: `function verticalTraversal(root) {
  if (!root) return [];
  const nodes = [];
  function walk(node, row, col) {
    if (!node) return;
    nodes.push({ value: node.value, row, col });
    walk(node.left, row + 1, col - 1);
    walk(node.right, row + 1, col + 1);
  }
  walk(root, 0, 0);
  nodes.sort((a, b) => a.col - b.col || a.row - b.row || a.value - b.value);
  const result = [];
  let currentCol = null;
  for (const n of nodes) {
    if (n.col !== currentCol) {
      result.push([]);
      currentCol = n.col;
    }
    result[result.length - 1].push(n.value);
  }
  return result;
}`,
    testCases: [
      { input: "a 3-node tree: root with a left and right child", expected: "[[left], [root], [right]]", label: "Groups nodes into columns by horizontal distance from the root" },
      { input: "two nodes landing in the same column at different rows, plus a same-position tie", expected: "top-to-bottom order, ties broken by ascending value", label: "Correctly orders same-column entries and breaks position ties" },
      { input: "null", expected: "[]", label: "An empty tree produces an empty result" },
    ],
    hints: [
      "Track each node's (row, column) via a simple DFS: left decrements the column, right increments it, either direction increments the row.",
      "Sort all visited nodes by column, then row, then value — that single sort key ordering handles column grouping, top-to-bottom order, and tie-breaking all at once.",
    ],
    orderIndex: 1092,
  },


  // Stage 8 — Algorithms: Sorting
  {
    slug: "sort-bubble",
    category: "javascript-runtime",
    title: "Bubble Sort",
    description: `**Bubble sort**: repeatedly walk the array, swapping adjacent out-of-order pairs, until nothing is left to swap. The simplest sort to reason about, if not the fastest — each full pass "bubbles" the largest remaining value to the end.

## Your task

Write \`bubbleSort(arr)\`, returning a new sorted array (ascending) without mutating the input.

\`\`\`js
bubbleSort([5, 3, 8, 1, 2])
// [1, 2, 3, 5, 8]
\`\`\``,
    difficulty: "easy",
    starterCode: `function bubbleSort(arr) {
}`,
    solutionCode: `function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }
  return a;
}`,
    testCases: [
      { input: "[5,3,8,1,2]", expected: "[1,2,3,5,8]", label: "Sorts an unordered array" },
      { input: "[]", expected: "[]", label: "An empty array stays empty" },
      { input: "[1,1,2,2]", expected: "[1,1,2,2]", label: "Handles duplicates correctly" },
    ],
    hints: [
      "Each full pass bubbles the largest remaining unsorted value to its correct position at the end.",
      "Work on a copy of the array so the caller's original array isn't mutated.",
    ],
    orderIndex: 1093,
  },

  {
    slug: "sort-insertion",
    category: "javascript-runtime",
    title: "Insertion Sort",
    description: `**Insertion sort**: build up a sorted prefix one element at a time, sliding each new element backward into its correct position — the way most people sort a hand of playing cards.

## Your task

Write \`insertionSort(arr)\`, returning a new sorted array (ascending) without mutating the input.

\`\`\`js
insertionSort([5, 3, 8, 1, 2])
// [1, 2, 3, 5, 8]
\`\`\``,
    difficulty: "easy",
    starterCode: `function insertionSort(arr) {
}`,
    solutionCode: `function insertionSort(arr) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
    testCases: [
      { input: "[5,3,8,1,2]", expected: "[1,2,3,5,8]", label: "Sorts an unordered array" },
      { input: "[]", expected: "[]", label: "An empty array stays empty" },
      { input: "[3,1,2]", expected: "[1,2,3]", label: "Sorts a small array correctly" },
    ],
    hints: [
      "Everything to the left of index i is already sorted at the start of each outer iteration — you're just finding where the current element fits into it.",
    ],
    orderIndex: 1094,
  },

  {
    slug: "sort-selection",
    category: "javascript-runtime",
    title: "Selection Sort",
    description: `**Selection sort**: repeatedly find the minimum of the remaining unsorted portion and swap it into place at the front — unlike bubble sort, only one swap happens per pass.

## Your task

Write \`selectionSort(arr)\`, returning a new sorted array (ascending) without mutating the input.

\`\`\`js
selectionSort([5, 3, 8, 1, 2])
// [1, 2, 3, 5, 8]
\`\`\``,
    difficulty: "easy",
    starterCode: `function selectionSort(arr) {
}`,
    solutionCode: `function selectionSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a;
}`,
    testCases: [
      { input: "[5,3,8,1,2]", expected: "[1,2,3,5,8]", label: "Sorts an unordered array" },
      { input: "[]", expected: "[]", label: "An empty array stays empty" },
      { input: "[2,2,1]", expected: "[1,2,2]", label: "Handles duplicates correctly" },
    ],
    hints: [
      "Only one swap happens per outer iteration — that's what makes selection sort distinct from bubble sort's many small swaps.",
    ],
    orderIndex: 1095,
  },

  {
    slug: "sort-merge",
    category: "javascript-runtime",
    title: "Merge Sort",
    description: `**Merge sort**: split the array in half recursively down to single elements, then merge sorted halves back together — the canonical divide-and-conquer sort, with guaranteed O(n log n) performance.

## Your task

Write \`mergeSort(arr)\`, returning a new sorted array (ascending).

\`\`\`js
mergeSort([5, 3, 8, 1, 2])
// [1, 2, 3, 5, 8]
\`\`\``,
    difficulty: "medium",
    starterCode: `function mergeSort(arr) {
}`,
    solutionCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    testCases: [
      { input: "[5,3,8,1,2]", expected: "[1,2,3,5,8]", label: "Sorts an unordered array" },
      { input: "[]", expected: "[]", label: "An empty array stays empty" },
      { input: "a large shuffled array", expected: "fully sorted", label: "Handles a bigger input correctly" },
    ],
    hints: [
      "The base case is an array of length 0 or 1 — it's already 'sorted'.",
      "The merge step (combining two already-sorted halves) is the only part that does real work.",
    ],
    orderIndex: 1096,
  },

  {
    slug: "sort-quick",
    category: "javascript-runtime",
    title: "Quick Sort",
    description: `**Quick sort**: pick a pivot, partition everything into less-than and greater-or-equal buckets, and recursively sort each bucket — fast in practice, thanks to good average-case cache locality.

## Your task

Write \`quickSort(arr)\`, returning a new sorted array (ascending).

\`\`\`js
quickSort([5, 3, 8, 1, 2])
// [1, 2, 3, 5, 8]
quickSort([])
// [] — an empty array is already sorted
quickSort([1, 1, 1])
// [1, 1, 1] — duplicate values are kept, not deduplicated
\`\`\``,
    difficulty: "medium",
    starterCode: `function quickSort(arr) {
}`,
    solutionCode: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const [pivot, ...rest] = arr;
  const left = rest.filter((x) => x < pivot);
  const right = rest.filter((x) => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
    testCases: [
      { input: "[5,3,8,1,2]", expected: "[1,2,3,5,8]", label: "Sorts an unordered array" },
      { input: "[]", expected: "[]", label: "An empty array stays empty" },
      { input: "[1,1,1]", expected: "[1,1,1]", label: "Handles an array of identical values" },
    ],
    hints: [
      "This partition-based version (picking the first element as pivot and using filter) isn't in-place, but it's a clean, correct way to demonstrate the algorithm's core idea.",
    ],
    orderIndex: 1097,
  },


  // Stage 8 — Algorithms: Binary Search
  {
    slug: "binary-search-basic",
    category: "javascript-runtime",
    title: "Binary Search (unique values)",
    description: `The foundational template every other binary search variant builds on: repeatedly halve the search space by comparing against the middle element, so you find a value (or prove it's absent) in O(log n) steps instead of scanning the whole array.

## Your task

Write \`binarySearch(arr, target)\` for a sorted array of unique values, returning the index of \`target\`, or \`-1\` if it's not present.

\`\`\`js
binarySearch([1, 3, 5, 7, 9], 7)
// 3
binarySearch([1, 3, 5, 7, 9], 4)
// -1 — not present in the array
binarySearch([], 4)
// -1 — an empty array has nothing to find
\`\`\``,
    difficulty: "easy",
    starterCode: `function binarySearch(arr, target) {
}`,
    solutionCode: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    testCases: [
      { input: "[1,3,5,7,9], 7", expected: "3", label: "Finds a present value" },
      { input: "[1,3,5,7,9], 4", expected: "-1", label: "Returns -1 for a missing value" },
      { input: "[], 1", expected: "-1", label: "An empty array has nothing to find" },
    ],
    hints: [
      "lo <= hi (not <) as the loop condition is what correctly handles a search space of exactly one element.",
    ],
    orderIndex: 1098,
  },

  {
    slug: "binary-search-first-index",
    category: "javascript-runtime",
    title: "Search first index (possible duplicates)",
    description: `Plain binary search stops the moment it hits any match, but with duplicates allowed, "found it" isn't enough — you need the leftmost occurrence specifically. The fix is small: on a match, don't stop, keep narrowing toward the left half in case there's an even earlier one.

## Your task

Write \`searchFirstIndex(arr, target)\`, returning the index of the first (leftmost) occurrence of \`target\`, or \`-1\`.

\`\`\`js
searchFirstIndex([1, 2, 2, 2, 3], 2)
// 1 — the leftmost of the three 2s
searchFirstIndex([1, 2, 3], 5)
// -1 — not present in the array
\`\`\``,
    difficulty: "easy",
    starterCode: `function searchFirstIndex(arr, target) {
}`,
    solutionCode: `function searchFirstIndex(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) {
      result = mid;
      hi = mid - 1;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}`,
    testCases: [
      { input: "[1,2,2,2,3], 2", expected: "1", label: "Finds the leftmost occurrence among duplicates" },
      { input: "[1,2,3], 5", expected: "-1", label: "Returns -1 for a missing value" },
      { input: "[2,2,2], 2", expected: "0", label: "An array of all duplicates finds index 0" },
    ],
    hints: [
      "On a match, record it but keep searching the left half — there might be an even earlier occurrence.",
    ],
    orderIndex: 1099,
  },

  {
    slug: "binary-search-last-index",
    category: "javascript-runtime",
    title: "Search last index (possible duplicates)",
    description: `The mirror image of finding the first index: with duplicates allowed, keep narrowing toward the right half on a match instead of the left, so you land on the rightmost occurrence of the target.

## Your task

Write \`searchLastIndex(arr, target)\`.

\`\`\`js
searchLastIndex([1, 2, 2, 2, 3], 2)
// 3 — the rightmost of the three 2s
searchLastIndex([1, 2, 3], 5)
// -1 — not present in the array
\`\`\``,
    difficulty: "easy",
    starterCode: `function searchLastIndex(arr, target) {
}`,
    solutionCode: `function searchLastIndex(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) {
      result = mid;
      lo = mid + 1;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}`,
    testCases: [
      { input: "[1,2,2,2,3], 2", expected: "3", label: "Finds the rightmost occurrence among duplicates" },
      { input: "[1,2,3], 5", expected: "-1", label: "Returns -1 for a missing value" },
      { input: "[2,2,2], 2", expected: "2", label: "An array of all duplicates finds the last index" },
    ],
    hints: [
      "On a match, record it but keep searching the right half — there might be an even later occurrence.",
    ],
    orderIndex: 1100,
  },

  {
    slug: "binary-search-element-before",
    category: "javascript-runtime",
    title: "Element right before target",
    description: `Find the **predecessor**: the largest value in a sorted array that's strictly less than a given target — useful for things like locating where an item would be inserted, or the closest earlier entry in a sorted log. The target itself doesn't need to actually be present in the array.

## Your task

Write \`findElementBefore(arr, target)\`, returning that value, or \`undefined\` if none exists.

\`\`\`js
findElementBefore([1, 3, 5, 7, 9], 6)
// 5 — the largest value strictly less than 6
findElementBefore([1, 3, 5, 7, 9], 1)
// undefined — nothing in the array is smaller than the smallest value
\`\`\``,
    difficulty: "easy",
    starterCode: `function findElementBefore(arr, target) {
}`,
    solutionCode: `function findElementBefore(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  let result;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) {
      result = arr[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}`,
    testCases: [
      { input: "[1,3,5,7,9], 6", expected: "5", label: "Finds the predecessor of a missing target" },
      { input: "[1,3,5,7,9], 1", expected: "undefined", label: "No predecessor exists for the smallest value" },
      { input: "[1,3,5,7,9], 5", expected: "3", label: "Works correctly even when the target itself is present" },
    ],
    hints: [
      "Whenever an element is strictly less than the target, it's a candidate answer — keep it and search further right for an even closer one.",
    ],
    orderIndex: 1101,
  },

  {
    slug: "binary-search-element-after",
    category: "javascript-runtime",
    title: "Element right after target",
    description: `Find the **successor**: the smallest value in a sorted array that's strictly greater than a given target — the mirror image of finding the element right before it, narrowing toward candidates on the left instead of the right.

## Your task

Write \`findElementAfter(arr, target)\`, returning that value, or \`undefined\` if none exists.

\`\`\`js
findElementAfter([1, 3, 5, 7, 9], 6)
// 7 — the smallest value strictly greater than 6
findElementAfter([1, 3, 5, 7, 9], 9)
// undefined — nothing in the array is larger than the largest value
\`\`\``,
    difficulty: "easy",
    starterCode: `function findElementAfter(arr, target) {
}`,
    solutionCode: `function findElementAfter(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  let result;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] > target) {
      result = arr[mid];
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return result;
}`,
    testCases: [
      { input: "[1,3,5,7,9], 6", expected: "7", label: "Finds the successor of a missing target" },
      { input: "[1,3,5,7,9], 9", expected: "undefined", label: "No successor exists for the largest value" },
      { input: "[1,3,5,7,9], 5", expected: "7", label: "Works correctly even when the target itself is present" },
    ],
    hints: [
      "Whenever an element is strictly greater than the target, it's a candidate answer — keep it and search further left for an even closer one.",
    ],
    orderIndex: 1102,
  },

  {
    slug: "first-bad-version",
    category: "javascript-runtime",
    title: "First bad version",
    description: `A classic version-control scenario: you ship versions \`1\` through \`n\`, something broke at some point, and every version after that first bad one is broken too (once bad, always bad). Calling \`isBad(version)\` is expensive — like running a full test suite — so checking every version one at a time isn't good enough; you want to zero in on the exact breaking point in as few calls as possible.

## Your task

Write \`firstBadVersion(n, isBad)\`, returning the first version number in \`1..n\` for which \`isBad(version)\` is \`true\`, using binary search rather than a linear scan.

\`\`\`js
const isBad = (version) => version >= 5;
firstBadVersion(10, isBad)
// 5 — the first version where isBad(version) becomes true
\`\`\``,
    difficulty: "medium",
    starterCode: `function firstBadVersion(n, isBad) {
}`,
    solutionCode: `function firstBadVersion(n, isBad) {
  let lo = 1;
  let hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isBad(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
    testCases: [
      { input: "n = 10, bad starting at version 5", expected: "5", label: "Finds the first bad version among many good ones" },
      { input: "n = 1, version 1 is bad", expected: "1", label: "Works when the only version is bad" },
      { input: "n = 5, bad starting at version 5 (the last one)", expected: "5", label: "Finds it even when it's the very last version" },
    ],
    hints: [
      "This is binary search over the answer itself, not over an array — narrow lo/hi based on isBad(mid) until they converge.",
      "lo + Math.floor((hi - lo) / 2) avoids the same integer-overflow concern the classic (lo + hi) / 2 has in other languages — good habit even though JS numbers don't actually overflow here.",
    ],
    orderIndex: 1103,
  },

  {
    slug: "median-of-two-sorted-arrays",
    category: "javascript-runtime",
    title: "Median of two sorted arrays",
    description: `One of the best-known "hard" interview problems, though the version asked here is more approachable than its reputation suggests: given two already-sorted arrays, find the **median** of their combined values.

## Your task

Write \`findMedianSortedArrays(nums1, nums2)\`, returning the median of all values from both arrays combined — the middle value for an odd total count, or the average of the two middle values for an even count. A straightforward merge-based approach is completely valid here; the classic optimization down to O(log(min(m, n))) via a binary-search partition is a great follow-up once this works.

\`\`\`js
findMedianSortedArrays([1, 3], [2])
// 2 — the middle value of the merged [1, 2, 3]
findMedianSortedArrays([1, 2], [3, 4])
// 2.5 — the average of the two middle values in [1, 2, 3, 4]
findMedianSortedArrays([], [1])
// 1 — one input array may be empty; the median comes entirely from the other
\`\`\``,
    difficulty: "medium",
    starterCode: `function findMedianSortedArrays(nums1, nums2) {
}`,
    solutionCode: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < nums1.length && j < nums2.length) {
    merged.push(nums1[i] <= nums2[j] ? nums1[i++] : nums2[j++]);
  }
  while (i < nums1.length) merged.push(nums1[i++]);
  while (j < nums2.length) merged.push(nums2[j++]);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 === 0 ? (merged[mid - 1] + merged[mid]) / 2 : merged[mid];
}`,
    testCases: [
      { input: "[1,3], [2]", expected: "2", label: "An odd total length has a single middle value" },
      { input: "[1,2], [3,4]", expected: "2.5", label: "An even total length averages the two middle values" },
      { input: "[], [1]", expected: "1", label: "One empty array is handled correctly" },
    ],
    hints: [
      "Merging the two sorted arrays (like the merge step of merge sort) and then indexing into the result is the simplest correct route to the answer.",
    ],
    orderIndex: 1104,
  },


  // Stage 8 — Mixed classic algorithm problems
  {
    slug: "is-prime-number",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "isPrime()",
    description: `A **prime number** has exactly two divisors: 1 and itself. The naive check — testing every number up to \`n\` — works but wastes time; you only ever need to check divisors up to \`√n\`, since any factor larger than that would pair with one smaller than it.

## Your task

Write \`isPrime(n)\`, returning \`true\` if \`n\` is prime and \`false\` otherwise. Numbers less than 2 (including 0, 1, and negatives) are not prime.

\`\`\`js
isPrime(7)
// true
isPrime(8)
// false — 8 = 2 x 4
\`\`\``,
    difficulty: "easy",
    starterCode: `function isPrime(n) {
}`,
    solutionCode: `function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}`,
    testCases: [
      { input: "7", expected: "true", label: "A prime number" },
      { input: "8", expected: "false", label: "A non-prime, even number" },
      { input: "1", expected: "false", label: "1 is not prime, by definition" },
      { input: "2", expected: "true", label: "2 is the smallest prime" },
    ],
    hints: [
      "You only need to check divisors up to √n — if n has a factor larger than its square root, it must also have a corresponding factor smaller than it.",
    ],
    orderIndex: 1105,
  },

  {
    slug: "look-and-say-sequence",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "A number sequence",
    description: `The "look-and-say" sequence is a fun string-building exercise: each term describes the *previous* term by reading off its consecutive digit runs. Starting from \`"1"\`: read it aloud as "one 1", giving \`"11"\`; read that as "two 1s", giving \`"21"\`; read that as "one 2, one 1", giving \`"1211"\` — and so on.

## Your task

Write \`lookAndSay(n)\`, returning the \`n\`th term (1-indexed) as a string, built by run-length-encoding the \`(n-1)\`th term.

\`\`\`js
lookAndSay(4)
// "1211" — the 3rd term "21" read aloud as "one 2, one 1"
\`\`\``,
    difficulty: "easy",
    starterCode: `function lookAndSay(n) {
}`,
    solutionCode: `function lookAndSay(n) {
  let result = "1";
  for (let i = 1; i < n; i++) {
    let next = "";
    let count = 1;
    for (let j = 1; j <= result.length; j++) {
      if (result[j] === result[j - 1]) {
        count++;
      } else {
        next += count + result[j - 1];
        count = 1;
      }
    }
    result = next;
  }
  return result;
}`,
    testCases: [
      { input: "1", expected: '"1"', label: "The first term is just \"1\"" },
      { input: "2", expected: '"11"', label: "\"one 1\" describes the first term" },
      { input: "4", expected: '"1211"', label: "The fourth term in the sequence" },
      { input: "5", expected: '"111221"', label: "The fifth term in the sequence" },
    ],
    hints: [
      "Walk each term's digits, counting consecutive runs, and describe each run as count + digit to build the next term.",
      "A sentinel one past the end of the string (comparing result[j] to result[j-1] up through j === result.length) lets the last run flush without special-casing it.",
    ],
    orderIndex: 1106,
  },

  {
    slug: "fibonacci-recursive",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Fibonacci (recursion)",
    description: `The canonical recursion exercise: each **Fibonacci** number is the sum of the two before it (\`0, 1, 1, 2, 3, 5, 8, ...\`). Solved recursively, it's also the textbook example of exponential blowup from repeated work — the same sub-calls get recomputed over and over — which is exactly why memoization exists.

## Your task

Write \`fibRecursive(n)\` using plain recursion (no memoization), returning the \`n\`th Fibonacci number (0-indexed: \`fibRecursive(0) === 0\`, \`fibRecursive(1) === 1\`). This version is intentionally about recursion mechanics, not performance.

\`\`\`js
fibRecursive(10)
// 55
\`\`\``,
    difficulty: "easy",
    starterCode: `function fibRecursive(n) {
}`,
    solutionCode: `function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}`,
    testCases: [
      { input: "0", expected: "0", label: "The base case for n = 0" },
      { input: "1", expected: "1", label: "The base case for n = 1" },
      { input: "10", expected: "55", label: "The 10th Fibonacci number" },
    ],
    hints: [
      "Two base cases (n = 0 and n = 1) and one recursive case is the entire function.",
    ],
    orderIndex: 1107,
  },

  {
    slug: "generate-fibonacci-sequence",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Generate Fibonacci Number",
    description: `The practical counterpart to the recursive version, where exponential blowup actually matters: generate the first several Fibonacci numbers **iteratively**, in O(n) time, by tracking just the last two values instead of recomputing the whole tree of calls.

## Your task

Write \`generateFibonacci(count)\`, returning an array of the first \`count\` Fibonacci numbers, starting from \`0\` (i.e. \`[0, 1, 1, 2, 3, ...]\`).

\`\`\`js
generateFibonacci(5)
// [0, 1, 1, 2, 3]
\`\`\``,
    difficulty: "medium",
    starterCode: `function generateFibonacci(count) {
}`,
    solutionCode: `function generateFibonacci(count) {
  const result = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < count; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}`,
    testCases: [
      { input: "5", expected: "[0,1,1,2,3]", label: "The first five Fibonacci numbers" },
      { input: "0", expected: "[]", label: "count = 0 returns an empty array" },
      { input: "1", expected: "[0]", label: "count = 1 returns just the first term" },
    ],
    hints: [
      "Track only the last two values in variables and shift them forward each iteration — no need to keep the whole array while computing.",
    ],
    orderIndex: 1108,
  },

  {
    slug: "two-numbers-sum-to-zero",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Two numbers that sum to 0",
    description: `Find any pair of numbers in an array that are exact opposites of each other — a warm-up variant of the classic two-sum problem, solved the same way: track what you've seen, and check for the complement you need.

## Your task

Write \`findZeroSumPair(nums)\`, returning the first such pair found while scanning left to right (as \`[earlierValue, laterValue]\`), or \`null\` if none exists.

\`\`\`js
findZeroSumPair([4, -4, 2])
// [4, -4]
\`\`\``,
    difficulty: "easy",
    starterCode: `function findZeroSumPair(nums) {
}`,
    solutionCode: `function findZeroSumPair(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(-n)) return [-n, n];
    seen.add(n);
  }
  return null;
}`,
    testCases: [
      { input: "[4,-4,2]", expected: "[4,-4]", label: "Finds an opposite pair" },
      { input: "[1,2,3]", expected: "null", label: "No pair sums to zero" },
      { input: "[-5,5,10]", expected: "[-5,5]", label: "The earlier-seen value comes first in the result" },
    ],
    hints: [
      "A Set of numbers seen so far lets you check for a value's negation in O(1) as you scan.",
    ],
    orderIndex: 1109,
  },

  {
    slug: "largest-difference",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "The largest difference",
    description: `Structurally the same problem as the classic "best time to buy and sell a stock": given a sequence of numbers, find the largest possible \`nums[j] - nums[i]\` for any \`j > i\` — buy at the lowest point *before* selling at the highest point after it, not just the overall max minus the overall min.

## Your task

Write \`largestDifference(nums)\` in a single O(n) pass, tracking the minimum value seen so far and the best difference found using it. An array with fewer than 2 elements has no valid pair — return \`undefined\`. If the array is strictly decreasing, there's no profitable pair, but the function still returns the best (least negative) difference it can find rather than 0.

\`\`\`js
largestDifference([7, 1, 5, 3, 6, 4])
// 5 — buy at 1, sell at 6
largestDifference([7, 6, 4, 3, 1])
// -1 — a strictly decreasing array has no profitable pair, so the least-bad difference wins
\`\`\``,
    difficulty: "easy",
    starterCode: `function largestDifference(nums) {
}`,
    solutionCode: `function largestDifference(nums) {
  if (nums.length < 2) return undefined;
  let minSoFar = nums[0];
  let maxDiff = nums[1] - nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxDiff = Math.max(maxDiff, nums[i] - minSoFar);
    minSoFar = Math.min(minSoFar, nums[i]);
  }
  return maxDiff;
}`,
    testCases: [
      { input: "[7,1,5,3,6,4]", expected: "5", label: "The best 'buy low, sell high' difference" },
      { input: "[7,6,4,3,1]", expected: "-1", label: "A strictly decreasing array still has a best (least negative) answer" },
      { input: "[1]", expected: "undefined", label: "A single-element array has no valid pair" },
    ],
    hints: [
      "Track the minimum value seen so far as you scan; at each position, the best difference ending here is current - minSoFar.",
    ],
    orderIndex: 1110,
  },

  {
    slug: "merge-sorted-arrays",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Merge sorted arrays",
    description: `The **merge step** from merge sort, pulled out as its own standalone problem: combine two already-sorted arrays into a single sorted array, without re-sorting everything from scratch.

## Your task

Write \`mergeSortedArrays(a, b)\` in O(a.length + b.length) time, using two pointers that each walk one array and always advance whichever currently points at the smaller value.

\`\`\`js
mergeSortedArrays([1, 3, 5], [2, 4, 6])
// [1, 2, 3, 4, 5, 6]
\`\`\``,
    difficulty: "easy",
    starterCode: `function mergeSortedArrays(a, b) {
}`,
    solutionCode: `function mergeSortedArrays(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    result.push(a[i] <= b[j] ? a[i++] : b[j++]);
  }
  return result.concat(a.slice(i)).concat(b.slice(j));
}`,
    testCases: [
      { input: "[1,3,5], [2,4,6]", expected: "[1,2,3,4,5,6]", label: "Interleaves two sorted arrays" },
      { input: "[], [1,2]", expected: "[1,2]", label: "One empty array just returns the other" },
      { input: "[1,2], [1,2]", expected: "[1,1,2,2]", label: "Handles duplicate values across both arrays" },
    ],
    hints: [
      "Two pointers, one per array, always advancing whichever points at the smaller current value.",
    ],
    orderIndex: 1111,
  },

  {
    slug: "intersection-sorted-arrays",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Intersection of two sorted arrays",
    description: `Two-pointer classics don't get much cleaner than this: because both inputs are already sorted, you can walk them once, together, advancing whichever pointer is behind — no hashing needed, unlike the unsorted version of this same problem.

## Your task

Write \`intersectSorted(a, b)\`, returning the unique values common to both sorted arrays, in ascending order.

\`\`\`js
intersectSorted([1, 2, 2, 3], [2, 2, 4])
// [2] — common values are deduplicated
\`\`\``,
    difficulty: "easy",
    starterCode: `function intersectSorted(a, b) {
}`,
    solutionCode: `function intersectSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      if (result[result.length - 1] !== a[i]) result.push(a[i]);
      i++;
      j++;
    } else if (a[i] < b[j]) {
      i++;
    } else {
      j++;
    }
  }
  return result;
}`,
    testCases: [
      { input: "[1,2,2,3], [2,2,4]", expected: "[2]", label: "Common values are deduplicated" },
      { input: "[1,2,3], [4,5,6]", expected: "[]", label: "No overlap returns an empty array" },
      { input: "[1,2,3], [1,2,3]", expected: "[1,2,3]", label: "Identical arrays intersect completely" },
    ],
    hints: [
      "Advance whichever pointer is behind; on a match, advance both — that's the whole two-pointer walk.",
      "Only push a match if it's different from the last pushed value, to avoid duplicate entries in the result.",
    ],
    orderIndex: 1112,
  },

  {
    slug: "intersection-unsorted-arrays",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Intersection of unsorted arrays",
    description: `The same intersection problem, minus the sortedness guarantee that made the two-pointer trick possible — so the tool of choice becomes a **hash set** instead, trading the ordered walk for O(1) membership checks.

## Your task

Write \`intersectUnsorted(a, b)\`, returning the unique values common to both arrays; order in the result doesn't matter.

\`\`\`js
intersectUnsorted([3, 1, 2, 1], [2, 2, 4])
// [2] — the only value common to both, deduplicated
\`\`\``,
    difficulty: "easy",
    starterCode: `function intersectUnsorted(a, b) {
}`,
    solutionCode: `function intersectUnsorted(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
}`,
    testCases: [
      { input: "[3,1,2,1], [2,2,4]", expected: "[2]", label: "Common values are deduplicated" },
      { input: "[1,2], [3,4]", expected: "[]", label: "No overlap returns an empty array" },
      { input: "[5,6], [6,5]", expected: "[5,6]", label: "Works regardless of either array's order" },
    ],
    hints: [
      "Turning both arrays into Sets makes membership checks O(1), so the whole thing runs in O(a.length + b.length).",
    ],
    orderIndex: 1113,
  },

  {
    slug: "find-available-meeting-slots",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Find available meeting slots",
    description: `A miniature calendar-scheduling problem: given a list of busy \`[start, end]\` intervals scattered across a workday, find the free gaps where a new meeting could actually fit — the same core logic behind any "find available time" feature.

## Your task

Write \`findAvailableSlots(busy, workStart, workEnd)\`, returning an array of \`[start, end]\` free intervals, in chronological order. \`busy\` may be given in any order and may contain overlapping intervals — sort/merge as needed before computing the gaps.

\`\`\`js
findAvailableSlots([[10, 11], [13, 14]], 9, 17)
// [[9, 10], [11, 13], [14, 17]] — the gaps before, between, and after the meetings
\`\`\``,
    difficulty: "medium",
    starterCode: `function findAvailableSlots(busy, workStart, workEnd) {
}`,
    solutionCode: `function findAvailableSlots(busy, workStart, workEnd) {
  const sorted = [...busy].sort((a, b) => a[0] - b[0]);
  const slots = [];
  let cursor = workStart;
  for (const [start, end] of sorted) {
    if (start > cursor) slots.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < workEnd) slots.push([cursor, workEnd]);
  return slots;
}`,
    testCases: [
      { input: "[[10,11],[13,14]], workStart 9, workEnd 17", expected: "[[9,10],[11,13],[14,17]]", label: "Finds every gap between meetings and around the edges" },
      { input: "[], workStart 9, workEnd 17", expected: "[[9,17]]", label: "No meetings means the whole day is free" },
      { input: "[[9,17]], workStart 9, workEnd 17", expected: "[]", label: "A fully booked day has no free slots" },
    ],
    hints: [
      "Sort the busy intervals by start time first — the input order isn't guaranteed to be chronological.",
      "A 'cursor' tracking the end of the last busy interval processed so far is what lets you detect each gap in a single pass.",
    ],
    orderIndex: 1114,
  },

  {
    slug: "longest-unique-substring",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Longest substring with unique characters",
    description: `A **sliding window** classic for finding the longest run of non-repeating characters in a string — the pattern behind "longest substring without repeating characters" as commonly asked in JS interviews. Instead of restarting the scan on every repeat, you track each character's last-seen index and jump the window's start forward only as far as needed, keeping the whole scan O(n).

## Your task

Write \`lengthOfLongestUniqueSubstring(s)\` in O(n) time. It returns the length of the longest contiguous substring of \`s\` with no repeated characters.

\`\`\`js
lengthOfLongestUniqueSubstring("abcabcbb")
// 3 — the longest run is "abc"
\`\`\``,
    difficulty: "easy",
    starterCode: `function lengthOfLongestUniqueSubstring(s) {
}`,
    solutionCode: `function lengthOfLongestUniqueSubstring(s) {
  let start = 0;
  let maxLen = 0;
  const lastSeen = new Map();
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) {
      start = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}`,
    testCases: [
      { input: '"abcabcbb"', expected: "3", label: "The longest run is \"abc\"" },
      { input: '"bbbbb"', expected: "1", label: "All-repeated characters cap the answer at 1" },
      { input: '""', expected: "0", label: "An empty string has length 0" },
    ],
    hints: [
      "A map from character to its last-seen index lets you jump the window's start forward the moment a repeat is found, instead of shrinking one step at a time.",
      "Only jump start forward if the repeat's last position is inside the current window — an old repeat outside the window doesn't matter.",
    ],
    orderIndex: 1115,
  },

  {
    slug: "validate-parentheses-string",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Validate string of parentheses",
    description: `A **stack-based** check for whether every bracket in a string is properly opened, closed, and nested — the classic "valid parentheses" interview question, extended here to all three bracket types: \`()\`, \`[]\`, and \`{}\`.

## Your task

Write \`isValidParens(s)\`, returning \`true\` if every bracket is matched and correctly nested, \`false\` otherwise.

\`\`\`js
isValidParens("({[]})")
// true — every bracket closes in the right order
isValidParens("(]")
// false — mismatched bracket types
\`\`\``,
    difficulty: "easy",
    starterCode: `function isValidParens(s) {
}`,
    solutionCode: `function isValidParens(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      { input: '"({[]})"', expected: "true", label: "Properly nested mixed brackets" },
      { input: '"(]"', expected: "false", label: "Mismatched bracket types" },
      { input: '"((("', expected: "false", label: "Unclosed brackets are invalid" },
    ],
    hints: [
      "A stack of open brackets is the whole trick — each closing bracket must match the top of the stack.",
      "Don't forget the final check: leftover unclosed brackets on the stack also make the string invalid.",
    ],
    orderIndex: 1116,
  },

  {
    slug: "pick-up-stones-game",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Pick up stones",
    description: `A **Nim-style** combinatorial game: two players alternate taking 1, 2, or 3 stones from a pile, and whoever takes the last stone wins. Determining the winner ahead of time — without simulating every possible sequence of moves — comes down to a single modulo check once you see the pattern.

## The idea

Whatever the first player takes, the opponent can always take enough to make the pair of moves sum to 4. So any pile that's a multiple of 4 is a forced loss for whoever has to move into it next.

## Your task

Write \`canFirstPlayerWin(n)\` for a starting pile of \`n\` stones, assuming both players play optimally. Return \`true\` if the first player can force a win.

\`\`\`js
canFirstPlayerWin(4)
// false — a multiple of 4 is a forced loss for the first player
canFirstPlayerWin(5)
// true — the first player can force a win
\`\`\``,
    difficulty: "easy",
    starterCode: `function canFirstPlayerWin(n) {
}`,
    solutionCode: `function canFirstPlayerWin(n) {
  return n % 4 !== 0;
}`,
    testCases: [
      { input: "4", expected: "false", label: "A multiple of 4 is a loss for the first player" },
      { input: "5", expected: "true", label: "The first player can force a win" },
      { input: "1", expected: "true", label: "The first player takes the single stone and wins immediately" },
    ],
    hints: [
      "Whatever the first player takes (1, 2, or 3), the opponent can always take enough to make the two moves sum to 4 — so piles that are multiples of 4 are a forced loss for whoever moves first into them.",
    ],
    orderIndex: 1117,
  },

  {
    slug: "find-single-integer-xor",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Find the single integer",
    description: `A classic **bitwise XOR** trick: given an array where every number appears exactly twice except one, find that one unpaired number in O(n) time and O(1) space — no extra hash set required. It works because \`x ^ x === 0\` and XOR is associative and commutative, so XOR-ing the whole array cancels every paired number down to zero, leaving only the singleton.

## Your task

Write \`singleNumber(nums)\` using bitwise XOR.

\`\`\`js
singleNumber([4, 1, 2, 1, 2])
// 4 — every other number appears twice and cancels out
\`\`\``,
    difficulty: "easy",
    starterCode: `function singleNumber(nums) {
}`,
    solutionCode: `function singleNumber(nums) {
  return nums.reduce((acc, n) => acc ^ n, 0);
}`,
    testCases: [
      { input: "[4,1,2,1,2]", expected: "4", label: "Finds the one number without a pair" },
      { input: "[7]", expected: "7", label: "A single-element array is itself the answer" },
      { input: "[1,1,3,3,9]", expected: "9", label: "Works regardless of where the unpaired number sits" },
    ],
    hints: [
      "XOR-ing a number with itself always produces 0, and XOR is associative/commutative — so every paired number cancels out, leaving only the unpaired one.",
    ],
    orderIndex: 1118,
  },

  {
    slug: "move-zeroes-in-place",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Move zeros",
    description: `An in-place array rearrangement often asked as "move all zeroes to the end": push every \`0\` in an array to the back while preserving the relative order of the non-zero elements, without allocating a new array.

## Your task

Write \`moveZeroes(nums)\`, mutating \`nums\` in place and returning it. Non-zero elements keep their original relative order; every \`0\` ends up at the end.

\`\`\`js
moveZeroes([0, 1, 0, 3, 12])
// [1, 3, 12, 0, 0]
\`\`\``,
    difficulty: "medium",
    starterCode: `function moveZeroes(nums) {
}`,
    solutionCode: `function moveZeroes(nums) {
  let insertPos = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[insertPos] = nums[i];
      insertPos++;
    }
  }
  for (let i = insertPos; i < nums.length; i++) {
    nums[i] = 0;
  }
  return nums;
}`,
    testCases: [
      { input: "[0,1,0,3,12]", expected: "[1,3,12,0,0]", label: "Non-zero order is preserved, zeros pushed to the end" },
      { input: "[0,0,0]", expected: "[0,0,0]", label: "An all-zero array is unchanged" },
      { input: "[1,2,3]", expected: "[1,2,3]", label: "An array with no zeros needs no changes" },
    ],
    hints: [
      "Overwrite non-zero elements forward from an insert-position pointer first, then fill the remaining tail with zeros in a second pass.",
    ],
    orderIndex: 1119,
  },

  {
    slug: "count-palindromic-substrings",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Count palindromic substrings",
    description: `Counting every **palindromic substring** in a string — including single characters and overlapping matches — using the expand-around-center technique: every palindrome has a center (a character, for odd length, or a gap between two characters, for even length), so trying all 2n-1 centers and expanding outward while both sides match finds them all in O(n²).

## Your task

Write \`countPalindromicSubstrings(s)\`, returning the total count of palindromic substrings (including single characters, and counting overlapping ones separately).

\`\`\`js
countPalindromicSubstrings("aaa")
// 6 — a, a, a, aa, aa, aaa all count individually
\`\`\``,
    difficulty: "medium",
    starterCode: `function countPalindromicSubstrings(s) {
}`,
    solutionCode: `function countPalindromicSubstrings(s) {
  let count = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      count++;
      l--;
      r++;
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return count;
}`,
    testCases: [
      { input: '"abc"', expected: "3", label: "Only the single characters are palindromes" },
      { input: '"aaa"', expected: "6", label: "Overlapping palindromic substrings all count: a,a,a,aa,aa,aaa" },
      { input: '""', expected: "0", label: "An empty string has none" },
    ],
    hints: [
      "Every palindrome has a center — either a single character (odd length) or a gap between two characters (even length). Expanding outward from each of the 2n-1 possible centers finds them all.",
    ],
    orderIndex: 1120,
  },

  {
    slug: "angle-between-clock-hands",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "Angle between clock hands",
    description: `A classic **clock angle problem**: compute the smaller angle between an analog clock's hour and minute hands at a given time. The minute hand moves 6° per minute; the hour hand moves 30° per hour *plus* an extra 0.5° per minute, since it creeps forward between hour marks rather than jumping.

## Your task

Write \`angleBetweenHands(hours, minutes)\`, returning the angle in degrees, always the smaller of the two possible angles (0-180). \`hours\` may be given in either 12-hour (1-12) or 24-hour (0-23) form — either way, it's taken mod 12 to find the hour hand's position on the dial.

\`\`\`js
angleBetweenHands(3, 0)
// 90 — the hour hand at 3 and the minute hand at 12 are a quarter-turn apart
\`\`\``,
    difficulty: "medium",
    starterCode: `function angleBetweenHands(hours, minutes) {
}`,
    solutionCode: `function angleBetweenHands(hours, minutes) {
  const minuteAngle = minutes * 6;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const diff = Math.abs(hourAngle - minuteAngle);
  return Math.min(diff, 360 - diff);
}`,
    testCases: [
      { input: "12, 0", expected: "0", label: "Both hands point at 12" },
      { input: "3, 0", expected: "90", label: "A quarter past twelve, hour-wise" },
      { input: "6, 0", expected: "180", label: "Hands pointing in exactly opposite directions" },
    ],
    hints: [
      "The minute hand moves 6° per minute; the hour hand moves 30° per hour plus a further 0.5° per minute (it creeps forward between the hour marks).",
      "The two hands' angle difference can exceed 180° — always report the smaller of the angle and 360 minus it.",
    ],
    orderIndex: 1121,
  },

  {
    slug: "kth-largest-element",
    companies: ["Google", "Amazon", "Meta", "ByteDance"],
    category: "javascript-runtime",
    title: "K-th largest element in an unsorted array",
    description: `Finding the **k-th largest element** in an unsorted array — a staple "quickselect vs. sort" interview question. Note it's the k-th largest value *by position*, not the k-th distinct value: duplicates each count individually toward k.

## Your task

Write \`kthLargest(nums, k)\`.

\`\`\`js
kthLargest([3, 2, 1, 5, 6, 4], 2)
// 5 — the 2nd largest value in the array
\`\`\``,
    difficulty: "medium",
    starterCode: `function kthLargest(nums, k) {
}`,
    solutionCode: `function kthLargest(nums, k) {
  return [...nums].sort((a, b) => b - a)[k - 1];
}`,
    testCases: [
      { input: "[3,2,1,5,6,4], 2", expected: "5", label: "The 2nd largest value" },
      { input: "[3,2,3,1,2,4,5,5,6], 4", expected: "4", label: "Duplicates count individually, not just distinct values" },
      { input: "[1], 1", expected: "1", label: "A single-element array's 1st largest is itself" },
    ],
    hints: [
      "Sorting descending and indexing at k - 1 is the simplest correct approach — a heap-based O(n log k) solution is a nice follow-up but not required here.",
    ],
    orderIndex: 1122,
  },


  // Stage 9 — Big-Number Arithmetic
  {
    slug: "implement-math-pow",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement Math.pow()",
    description: `Implementing **\`Math.pow()\`** from scratch using fast exponentiation (divide-and-conquer / "exponentiation by squaring") instead of a naive loop that multiplies \`base\` by itself \`exponent\` times. Halving the exponent at each recursive step gets this down to O(log n) instead of O(n), and negative exponents just invert the positive-exponent result.

## Your task

Write \`myPow(base, exponent)\`, handling negative exponents.

\`\`\`js
myPow(2, 10)
// 1024
myPow(2, -2)
// 0.25 — a negative exponent inverts the result
\`\`\``,
    difficulty: "easy",
    starterCode: `function myPow(base, exponent) {
}`,
    solutionCode: `function myPow(base, exponent) {
  if (exponent < 0) return 1 / myPow(base, -exponent);
  if (exponent === 0) return 1;
  const half = myPow(base, Math.floor(exponent / 2));
  return exponent % 2 === 0 ? half * half : half * half * base;
}`,
    testCases: [
      { input: "2, 10", expected: "1024", label: "A positive exponent" },
      { input: "2, -2", expected: "0.25", label: "A negative exponent inverts the result" },
      { input: "5, 0", expected: "1", label: "Any base to the power of 0 is 1" },
    ],
    hints: [
      "base^n = (base^(n/2))^2 when n is even, with one extra factor of base when n is odd — that halving is what makes this O(log n) instead of O(n).",
      "A negative exponent is just 1 divided by the positive-exponent result.",
    ],
    orderIndex: 1123,
  },

  {
    slug: "implement-math-sqrt",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Implement Math.sqrt()",
    description: `Implementing **\`Math.sqrt()\`** from scratch with Newton's method: starting from a guess, repeatedly refine it with \`guess = (guess + x / guess) / 2\` until it converges on the true square root — no built-in \`Math.sqrt\` allowed.

## Your task

Write \`mySqrt(x)\`, converging to a precise floating-point result via Newton's method. Negative \`x\` has no real square root — return \`NaN\` in that case.

\`\`\`js
mySqrt(16)
// 4
mySqrt(-4)
// NaN — negative numbers have no real square root
\`\`\``,
    difficulty: "medium",
    starterCode: `function mySqrt(x) {
}`,
    solutionCode: `function mySqrt(x) {
  if (x < 0) return NaN;
  if (x === 0) return 0;
  let guess = x;
  for (let i = 0; i < 100; i++) {
    guess = (guess + x / guess) / 2;
  }
  return guess;
}`,
    testCases: [
      { input: "16", expected: "4", label: "A perfect square" },
      { input: "2", expected: "≈ 1.41421356 (within 1e-6 of Math.SQRT2)", label: "An irrational result converges closely" },
      { input: "0", expected: "0", label: "The square root of 0 is 0" },
    ],
    hints: [
      "Newton's method for √x: guess = (guess + x / guess) / 2, repeated until it stabilizes.",
      "A fixed number of iterations (like 100) is plenty for convergence within floating-point precision, without needing a formal convergence-tolerance check.",
    ],
    orderIndex: 1124,
  },

  {
    slug: "implement-math-clz32",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Implement Math.clz32()",
    description: `Implementing **\`Math.clz32()\`** — count leading zero bits ("count leading zeros") in a number's 32-bit unsigned binary representation, a low-level primitive V8 exposes for bit-twiddling code like hashing and fast integer math.

## Your task

Write \`myClz32(x)\`, scanning from the most significant bit (31) down to the first set bit.

\`\`\`js
myClz32(1000)
// 22 — 1000 needs 10 bits, leaving 22 leading zeros in a 32-bit word
myClz32(0)
// 32 — no bits are set at all
\`\`\``,
    difficulty: "medium",
    starterCode: `function myClz32(x) {
}`,
    solutionCode: `function myClz32(x) {
  if (x === 0) return 32;
  const n = x >>> 0;
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((n & (1 << i)) !== 0) break;
    count++;
  }
  return count;
}`,
    testCases: [
      { input: "1", expected: "31", label: "1 has 31 leading zero bits in 32-bit form" },
      { input: "0", expected: "32", label: "0 has no set bits at all, so all 32 count as leading zeros" },
      { input: "1000", expected: "22", label: "1000 needs 10 bits, leaving 22 leading zeros" },
    ],
    hints: [
      "Scan from bit 31 (the most significant) down to bit 0, counting until you hit the first set bit.",
      "The unsigned right-shift (x >>> 0) ensures the number is treated as a 32-bit unsigned value for the bit check.",
    ],
    orderIndex: 1125,
  },

  {
    slug: "bigint-string-addition",
    companies: ["Google", "ByteDance"],
    category: "javascript-runtime",
    title: "BigInt addition",
    description: `**BigInt addition without native BigInt**: add two arbitrarily large non-negative integers represented as strings, digit by digit from the right, exactly like grade-school column addition — necessary once numbers exceed what JS's \`Number\` type can represent exactly (beyond \`Number.MAX_SAFE_INTEGER\`).

## Your task

Write \`bigIntAdd(a, b)\`, doing column addition with a carry, without converting to \`Number\` or using the native \`BigInt\`.

\`\`\`js
bigIntAdd("999", "1")
// "1000" — the carry cascades all the way through
\`\`\``,
    difficulty: "easy",
    starterCode: `function bigIntAdd(a, b) {
}`,
    solutionCode: `function bigIntAdd(a, b) {
  let result = "";
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;
  while (i >= 0 || j >= 0 || carry) {
    const digitA = i >= 0 ? Number(a[i]) : 0;
    const digitB = j >= 0 ? Number(b[j]) : 0;
    const sum = digitA + digitB + carry;
    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
    i--;
    j--;
  }
  return result;
}`,
    testCases: [
      { input: '"123", "456"', expected: '"579"', label: "Adds two same-length numbers" },
      { input: '"999", "1"', expected: '"1000"', label: "A carry cascades all the way through" },
      { input: '"0", "0"', expected: '"0"', label: "Zero plus zero is zero" },
    ],
    hints: [
      "Walk both strings from the right end, tracking a carry — exactly how you'd add on paper.",
      "Keep going as long as either string has digits left, or there's still a carry to flush out.",
    ],
    orderIndex: 1126,
  },

  {
    slug: "bigint-string-subtraction",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "BigInt subtraction",
    description: `The subtraction counterpart to string-based BigInt addition: subtract one arbitrarily large non-negative integer string from another using column subtraction with borrowing, assuming the result is non-negative (\`a >= b\`).

## Your task

Write \`bigIntSubtract(a, b)\`, assuming \`a >= b\`.

\`\`\`js
bigIntSubtract("1000", "999")
// "1" — a borrow cascades through multiple digits
\`\`\``,
    difficulty: "easy",
    starterCode: `function bigIntSubtract(a, b) {
}`,
    solutionCode: `function bigIntSubtract(a, b) {
  let result = "";
  let borrow = 0;
  let i = a.length - 1;
  let j = b.length - 1;
  while (i >= 0) {
    let digitA = Number(a[i]) - borrow;
    const digitB = j >= 0 ? Number(b[j]) : 0;
    if (digitA < digitB) {
      digitA += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = (digitA - digitB) + result;
    i--;
    j--;
  }
  return result.replace(/^0+(?=\\d)/, "");
}`,
    testCases: [
      { input: '"456", "123"', expected: '"333"', label: "A simple digit-by-digit subtraction" },
      { input: '"1000", "999"', expected: '"1"', label: "A borrow cascades through multiple digits" },
      { input: '"100", "100"', expected: '"0"', label: "Subtracting a number from itself gives 0" },
    ],
    hints: [
      "When a digit in a is smaller than the corresponding digit in b, borrow 10 from the next column and carry the borrow forward.",
      "Strip any resulting leading zeros from the final result — a subtraction like 1000 - 999 naturally produces \"0001\" before that cleanup.",
    ],
    orderIndex: 1127,
  },

  {
    slug: "bigint-signed-addition",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "BigInt addition with sign",
    description: `Extending string-based BigInt addition to handle **negative numbers** (a leading \`-\`): same-sign operands add their magnitudes and keep that sign, while different-sign operands fall back to subtracting the smaller magnitude from the larger and taking the sign of whichever had the bigger magnitude.

## Your task

Write \`bigIntAddSigned(a, b)\`, where either argument may start with \`-\`.

\`\`\`js
bigIntAddSigned("-5", "3")
// "-2" — a negative plus a smaller positive stays negative
bigIntAddSigned("5", "-8")
// "-3" — a positive plus a larger-magnitude negative goes negative
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigIntAddSigned(a, b) {
}`,
    solutionCode: `function bigIntAddSigned(a, b) {
  const negA = a.startsWith("-");
  const negB = b.startsWith("-");
  const magA = negA ? a.slice(1) : a;
  const magB = negB ? b.slice(1) : b;
  function compareMag(x, y) {
    if (x.length !== y.length) return x.length - y.length;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function addMag(x, y) {
    let result = "";
    let carry = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0 || j >= 0 || carry) {
      const dx = i >= 0 ? Number(x[i]) : 0;
      const dy = j >= 0 ? Number(y[j]) : 0;
      const sum = dx + dy + carry;
      result = (sum % 10) + result;
      carry = Math.floor(sum / 10);
      i--;
      j--;
    }
    return result;
  }
  function subMag(x, y) {
    let result = "";
    let borrow = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0) {
      let dx = Number(x[i]) - borrow;
      const dy = j >= 0 ? Number(y[j]) : 0;
      if (dx < dy) {
        dx += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result = (dx - dy) + result;
      i--;
      j--;
    }
    return result.replace(/^0+(?=\\d)/, "");
  }
  if (negA === negB) {
    const sum = addMag(magA, magB);
    return negA && sum !== "0" ? "-" + sum : sum;
  }
  const cmp = compareMag(magA, magB);
  if (cmp === 0) return "0";
  if (cmp > 0) {
    const diff = subMag(magA, magB);
    return negA && diff !== "0" ? "-" + diff : diff;
  }
  const diff = subMag(magB, magA);
  return negB && diff !== "0" ? "-" + diff : diff;
}`,
    testCases: [
      { input: '"5", "3"', expected: '"8"', label: "Two positive numbers add normally" },
      { input: '"-5", "3"', expected: '"-2"', label: "A negative plus a smaller positive stays negative" },
      { input: '"5", "-8"', expected: '"-3"', label: "A positive plus a larger-magnitude negative goes negative" },
      { input: '"-5", "-3"', expected: '"-8"', label: "Two negatives add their magnitudes and stay negative" },
    ],
    hints: [
      "Same sign: add the magnitudes and keep that sign. Different signs: subtract the smaller magnitude from the larger, and take the sign of whichever had the larger magnitude.",
    ],
    orderIndex: 1128,
  },

  {
    slug: "bigint-signed-subtraction",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "BigInt subtraction with sign",
    description: `\`a - b\` is the same as \`a + (-b)\` — this extends that identity to arbitrarily large signed integer strings, reusing the same same-sign/different-sign logic as signed BigInt addition but with \`b\`'s effective sign flipped first.

## Your task

Write \`bigIntSubtractSigned(a, b)\`.

\`\`\`js
bigIntSubtractSigned("3", "5")
// "-2" — subtracting a larger number goes negative
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigIntSubtractSigned(a, b) {
}`,
    solutionCode: `function bigIntSubtractSigned(a, b) {
  const negA = a.startsWith("-");
  const negB = !b.startsWith("-");
  const magA = negA ? a.slice(1) : a;
  const magB = b.startsWith("-") ? b.slice(1) : b;
  function compareMag(x, y) {
    if (x.length !== y.length) return x.length - y.length;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function addMag(x, y) {
    let result = "";
    let carry = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0 || j >= 0 || carry) {
      const dx = i >= 0 ? Number(x[i]) : 0;
      const dy = j >= 0 ? Number(y[j]) : 0;
      const sum = dx + dy + carry;
      result = (sum % 10) + result;
      carry = Math.floor(sum / 10);
      i--;
      j--;
    }
    return result;
  }
  function subMag(x, y) {
    let result = "";
    let borrow = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0) {
      let dx = Number(x[i]) - borrow;
      const dy = j >= 0 ? Number(y[j]) : 0;
      if (dx < dy) {
        dx += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result = (dx - dy) + result;
      i--;
      j--;
    }
    return result.replace(/^0+(?=\\d)/, "");
  }
  if (negA === negB) {
    const sum = addMag(magA, magB);
    return negA && sum !== "0" ? "-" + sum : sum;
  }
  const cmp = compareMag(magA, magB);
  if (cmp === 0) return "0";
  if (cmp > 0) {
    const diff = subMag(magA, magB);
    return negA && diff !== "0" ? "-" + diff : diff;
  }
  const diff = subMag(magB, magA);
  return negB && diff !== "0" ? "-" + diff : diff;
}`,
    testCases: [
      { input: '"5", "3"', expected: '"2"', label: "A simple positive subtraction" },
      { input: '"3", "5"', expected: '"-2"', label: "Subtracting a larger number goes negative" },
      { input: '"-5", "3"', expected: '"-8"', label: "Subtracting a positive from a negative makes it more negative" },
      { input: '"5", "-3"', expected: '"8"', label: "Subtracting a negative is the same as adding its magnitude" },
    ],
    hints: [
      "Treat this as bigIntAddSigned(a, -b) — flip b's effective sign, then apply the exact same same-sign/different-sign logic.",
    ],
    orderIndex: 1129,
  },

  {
    slug: "bigint-string-multiplication",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "BigInt multiplication",
    description: `**BigInt multiplication without native BigInt**: multiply two arbitrarily large non-negative integer strings using the grade-school digit-by-digit method, where each pair of digits \`a[i] * b[j]\` contributes to positions \`i+j\` and \`i+j+1\` of a result array before it's converted back to a string.

## Your task

Write \`bigIntMultiply(a, b)\`.

\`\`\`js
bigIntMultiply("123", "456")
// "56088"
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigIntMultiply(a, b) {
}`,
    solutionCode: `function bigIntMultiply(a, b) {
  if (a === "0" || b === "0") return "0";
  const result = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      const mul = Number(a[i]) * Number(b[j]);
      const p1 = i + j;
      const p2 = i + j + 1;
      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);
    }
  }
  return result.join("").replace(/^0+(?=\\d)/, "");
}`,
    testCases: [
      { input: '"123", "456"', expected: '"56088"', label: "A standard multi-digit multiplication" },
      { input: '"0", "999"', expected: '"0"', label: "Anything times zero is zero" },
      { input: '"999999999999", "2"', expected: '"1999999999998"', label: "Handles a number far beyond safe integer precision" },
    ],
    hints: [
      "Every pair of digits a[i] * b[j] contributes to positions i+j and i+j+1 in the result array — accumulate there before converting to a final string.",
      "Because the array holds arbitrary integer values (not just 0-9) mid-computation, carries between positions can be resolved once at the end by the join/string conversion — or handled per-digit as shown, either works.",
    ],
    orderIndex: 1130,
  },

  {
    slug: "bigint-string-division",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "BigInt division",
    description: `**Long division on arbitrarily large integer strings**: process the dividend one digit at a time, building up a running remainder and repeatedly subtracting the divisor from it to count how many times it fits — exactly like long division on paper — producing the floored integer quotient.

## Your task

Write \`bigIntDivide(a, b)\`. Dividing by \`"0"\` should throw an error, just like dividing by zero is undefined for real integers.

\`\`\`js
bigIntDivide("7", "2")
// "3" — the result is floored, not fractional
bigIntDivide("7", "0")
// throws an error — division by zero
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigIntDivide(a, b) {
}`,
    solutionCode: `function bigIntDivide(a, b) {
  if (b === "0") throw new Error("Division by zero");
  function compare(x, y) {
    x = x.replace(/^0+(?=\\d)/, "");
    y = y.replace(/^0+(?=\\d)/, "");
    if (x.length !== y.length) return x.length - y.length;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function subtract(x, y) {
    let result = "";
    let borrow = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0) {
      let dx = Number(x[i]) - borrow;
      const dy = j >= 0 ? Number(y[j]) : 0;
      if (dx < dy) {
        dx += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result = (dx - dy) + result;
      i--;
      j--;
    }
    return result.replace(/^0+(?=\\d)/, "") || "0";
  }
  let quotient = "";
  let remainder = "0";
  for (const digit of a) {
    remainder = (remainder === "0" ? "" : remainder) + digit;
    let count = 0;
    while (compare(remainder, b) >= 0) {
      remainder = subtract(remainder, b);
      count++;
    }
    quotient += count;
  }
  return quotient.replace(/^0+(?=\\d)/, "") || "0";
}`,
    testCases: [
      { input: '"100", "5"', expected: '"20"', label: "An evenly divisible case" },
      { input: '"7", "2"', expected: '"3"', label: "The result is floored, not fractional" },
      { input: '"999999999999", "3"', expected: '"333333333333"', label: "Handles a number far beyond safe integer precision" },
    ],
    hints: [
      "Process the dividend one digit at a time, building up a running remainder, and repeatedly subtract the divisor from it to count how many times it fits — that's long division.",
    ],
    orderIndex: 1131,
  },

  {
    slug: "bigdecimal-addition",
    companies: ["Stripe"],
    category: "javascript-runtime",
    title: "BigDecimal addition",
    description: `Floating-point math famously gets \`0.1 + 0.2\` wrong (\`0.30000000000000004\`) because binary floats can't represent most decimal fractions exactly. **Fixed-point decimal-string arithmetic** avoids that entirely by never converting to a binary float — instead it pads the fractional parts to equal length and adds them as plain integer strings.

## Your task

Write \`bigDecimalAdd(a, b)\`, adding two non-negative decimal strings exactly.

\`\`\`js
bigDecimalAdd("0.1", "0.2")
// "0.3" — exact, unlike native floating-point 0.1 + 0.2
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigDecimalAdd(a, b) {
}`,
    solutionCode: `function bigDecimalAdd(a, b) {
  function addIntStrings(x, y) {
    let result = "";
    let carry = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0 || j >= 0 || carry) {
      const dx = i >= 0 ? Number(x[i]) : 0;
      const dy = j >= 0 ? Number(y[j]) : 0;
      const sum = dx + dy + carry;
      result = (sum % 10) + result;
      carry = Math.floor(sum / 10);
      i--;
      j--;
    }
    return result;
  }
  const [aInt, aDec = ""] = a.split(".");
  const [bInt, bDec = ""] = b.split(".");
  const decLen = Math.max(aDec.length, bDec.length);
  const aDecPadded = aDec.padEnd(decLen, "0");
  const bDecPadded = bDec.padEnd(decLen, "0");
  const decSum = addIntStrings(aDecPadded, bDecPadded);
  let carry = 0;
  let decResult = decSum;
  if (decSum.length > decLen) {
    carry = 1;
    decResult = decSum.slice(1);
  }
  const intSum = addIntStrings(aInt, carry ? "1" : "0");
  return decLen > 0 ? intSum + "." + decResult : intSum;
}`,
    testCases: [
      { input: '"12.34", "5.6"', expected: '"17.94"', label: "Different decimal-place counts align correctly" },
      { input: '"0.1", "0.2"', expected: '"0.3"', label: "Exact, unlike native floating-point 0.1 + 0.2" },
      { input: '"100", "0.5"', expected: '"100.5"', label: "A whole number plus a decimal" },
    ],
    hints: [
      "Split each input on the decimal point, pad the fractional parts to the same length with trailing zeros, then add fractional and integer parts separately — carrying from the fractional sum into the integer sum when it overflows.",
    ],
    orderIndex: 1132,
  },

  {
    slug: "bigdecimal-subtraction",
    companies: ["Stripe"],
    category: "javascript-runtime",
    title: "BigDecimal subtraction",
    description: `The subtraction counterpart to decimal-string addition, assuming \`a >= b\`: pad both fractional parts to equal length, then subtract — with a borrow that can cross from the fractional part all the way into the integer part.

## Your task

Write \`bigDecimalSubtract(a, b)\`.

\`\`\`js
bigDecimalSubtract("5.00", "1.25")
// "3.75" — a borrow crosses from the fractional part into the integer part
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigDecimalSubtract(a, b) {
}`,
    solutionCode: `function bigDecimalSubtract(a, b) {
  function subIntStrings(x, y) {
    let result = "";
    let borrow = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0) {
      let dx = Number(x[i]) - borrow;
      const dy = j >= 0 ? Number(y[j]) : 0;
      if (dx < dy) {
        dx += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result = (dx - dy) + result;
      i--;
      j--;
    }
    return result.replace(/^0+(?=\\d)/, "") || "0";
  }
  const [aInt, aDec = ""] = a.split(".");
  const [bInt, bDec = ""] = b.split(".");
  const decLen = Math.max(aDec.length, bDec.length);
  const aDecPadded = aDec.padEnd(decLen, "0");
  const bDecPadded = bDec.padEnd(decLen, "0");
  let intMinuend = aInt;
  let decMinuend = aDecPadded;
  if (decLen > 0 && aDecPadded < bDecPadded) {
    decMinuend = "1" + aDecPadded;
    intMinuend = subIntStrings(aInt, "1");
  }
  const decResult = decLen > 0 ? subIntStrings(decMinuend, bDecPadded).padStart(decLen, "0").slice(-decLen) : "";
  const intResult = subIntStrings(intMinuend, bInt);
  return decLen > 0 ? intResult + "." + decResult : intResult;
}`,
    testCases: [
      { input: '"5.00", "1.25"', expected: '"3.75"', label: "A borrow crosses from the fractional part into the integer part" },
      { input: '"10.5", "3.2"', expected: '"7.3"', label: "No borrow needed" },
      { input: '"1", "0.25"', expected: '"0.75"', label: "A whole number minus a decimal, borrowing all the way down to 0" },
    ],
    hints: [
      "Pad both fractional parts to the same length first, then compare them as strings (same length means lexicographic comparison works like numeric comparison) to decide whether the subtraction needs a borrow from the integer part.",
    ],
    orderIndex: 1133,
  },

  {
    slug: "bigdecimal-multiplication",
    companies: ["Stripe"],
    category: "javascript-runtime",
    title: "BigDecimal multiplication",
    description: `Multiplying two decimal strings **exactly** — no floating-point rounding — by stripping the decimal points, multiplying the digits as plain integers, and reinserting the decimal point based on the total number of fractional digits in both inputs combined.

## Your task

Write \`bigDecimalMultiply(a, b)\`.

\`\`\`js
bigDecimalMultiply("0.1", "0.2")
// "0.02" — stays exact, unlike native floating-point multiplication
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigDecimalMultiply(a, b) {
}`,
    solutionCode: `function bigDecimalMultiply(a, b) {
  function multiplyIntStrings(x, y) {
    if (x === "0" || y === "0") return "0";
    const result = new Array(x.length + y.length).fill(0);
    for (let i = x.length - 1; i >= 0; i--) {
      for (let j = y.length - 1; j >= 0; j--) {
        const mul = Number(x[i]) * Number(y[j]);
        const p1 = i + j;
        const p2 = i + j + 1;
        const sum = mul + result[p2];
        result[p2] = sum % 10;
        result[p1] += Math.floor(sum / 10);
      }
    }
    return result.join("").replace(/^0+(?=\\d)/, "");
  }
  const [aInt, aDec = ""] = a.split(".");
  const [bInt, bDec = ""] = b.split(".");
  const decimalPlaces = aDec.length + bDec.length;
  const rawProduct = multiplyIntStrings(aInt + aDec, bInt + bDec);
  if (decimalPlaces === 0) return rawProduct;
  const padded = rawProduct.padStart(decimalPlaces + 1, "0");
  const intPart = padded.slice(0, padded.length - decimalPlaces) || "0";
  const decPart = padded.slice(padded.length - decimalPlaces);
  return intPart + "." + decPart;
}`,
    testCases: [
      { input: '"2.5", "4"', expected: '"10.0"', label: "A decimal times a whole number" },
      { input: '"1.5", "1.5"', expected: '"2.25"', label: "Two decimals multiply exactly" },
      { input: '"0.1", "0.2"', expected: '"0.02"', label: "Small decimals stay exact, unlike native floating-point" },
    ],
    hints: [
      "Strip the decimal points, multiply as plain integers, then reinsert the decimal point exactly (total input decimal digits) places from the right of the raw product.",
    ],
    orderIndex: 1134,
  },

  {
    slug: "bigdecimal-division",
    companies: ["Stripe"],
    category: "javascript-runtime",
    title: "BigDecimal division",
    description: `Division can produce an infinitely repeating decimal (like \`1/3\`), so this version takes an explicit \`precision\` and **truncates** (not rounds) the quotient to that many fractional digits, by scaling the numerator up with extra zeros before running ordinary long division.

## Your task

Write \`bigDecimalDivide(a, b, precision)\`, returning the quotient as a string with exactly \`precision\` digits after the decimal point, truncated rather than rounded.

\`\`\`js
bigDecimalDivide("1", "3", 4)
// "0.3333" — a repeating decimal, truncated at the requested precision
\`\`\``,
    difficulty: "medium",
    starterCode: `function bigDecimalDivide(a, b, precision) {
}`,
    solutionCode: `function bigDecimalDivide(a, b, precision) {
  function compare(x, y) {
    x = x.replace(/^0+(?=\\d)/, "");
    y = y.replace(/^0+(?=\\d)/, "");
    if (x.length !== y.length) return x.length - y.length;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function subtract(x, y) {
    let result = "";
    let borrow = 0;
    let i = x.length - 1;
    let j = y.length - 1;
    while (i >= 0) {
      let dx = Number(x[i]) - borrow;
      const dy = j >= 0 ? Number(y[j]) : 0;
      if (dx < dy) {
        dx += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result = (dx - dy) + result;
      i--;
      j--;
    }
    return result.replace(/^0+(?=\\d)/, "") || "0";
  }
  function divideIntStrings(numerator, denominator) {
    let quotient = "";
    let remainder = "0";
    for (const digit of numerator) {
      remainder = (remainder === "0" ? "" : remainder) + digit;
      let count = 0;
      while (compare(remainder, denominator) >= 0) {
        remainder = subtract(remainder, denominator);
        count++;
      }
      quotient += count;
    }
    return quotient.replace(/^0+(?=\\d)/, "") || "0";
  }
  const [aInt, aDec = ""] = a.split(".");
  const [bInt, bDec = ""] = b.split(".");
  const numeratorInt = aInt + aDec;
  const denominatorInt = bInt + bDec;
  const shift = bDec.length - aDec.length + precision;
  const scaledNumerator = numeratorInt + "0".repeat(Math.max(shift, 0));
  const rawQuotient = divideIntStrings(scaledNumerator, denominatorInt);
  const padded = rawQuotient.padStart(precision + 1, "0");
  const intPart = padded.slice(0, padded.length - precision) || "0";
  const decPart = precision > 0 ? padded.slice(padded.length - precision) : "";
  return precision > 0 ? intPart + "." + decPart : intPart;
}`,
    testCases: [
      { input: '"10", "4", 2', expected: '"2.50"', label: "An exact division formatted to the requested precision" },
      { input: '"1", "3", 4', expected: '"0.3333"', label: "A repeating decimal, truncated at the requested precision" },
      { input: '"7.5", "2.5", 1', expected: '"3.0"', label: "Decimal inputs on both sides of the division" },
    ],
    hints: [
      "Scale the numerator up by enough factors of 10 to account for both the requested precision and the difference in the inputs' own decimal places, then run ordinary long division on the resulting integers.",
    ],
    orderIndex: 1135,
  },


  // Stage 10 — DOM & Browser APIs
  {
    slug: "next-right-sibling",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Next Right Sibling",
    description: `A **level-order (BFS) tree traversal** puzzle: given a tree and a target node inside it, find whichever node sits immediately to its right at the exact same depth — even if that neighbor belongs to a completely different parent. This is the same idea as "next right pointers" problems, applied to a plain nested-object tree instead of a binary tree.

## The idea

A BFS traversal visits every node at a given depth in left-to-right order, one queue snapshot at a time. Within that snapshot, the node right after the target is its next right sibling — parent boundaries don't matter.

## Your task

Write \`findNextRightSibling(root, targetId)\`, where each node is \`{ id, children }\`. Return the sibling's \`id\`, or \`null\` if the target is the rightmost node at its level.

\`\`\`js
// tree: a -> [b -> [d, e], c -> [f]]
// level 2 (left to right): d, e, f
findNextRightSibling(root, "e")
// "f" — e and f are on the same level even though they have different parents
\`\`\``,
    difficulty: "easy",
    starterCode: `function findNextRightSibling(root, targetId) {
}`,
    solutionCode: `function findNextRightSibling(root, targetId) {
  let queue = [root];
  while (queue.length) {
    const nextQueue = [];
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].id === targetId) {
        return i + 1 < queue.length ? queue[i + 1].id : null;
      }
      nextQueue.push(...queue[i].children);
    }
    queue = nextQueue;
  }
  return null;
}`,
    testCases: [
      { input: "a node with a sibling under the same parent", expected: "that sibling's id", label: "Finds a sibling under the same parent" },
      { input: "the rightmost node at its level", expected: "null", label: "The rightmost node at a level has no next sibling" },
      { input: "a node whose right neighbor belongs to a different parent", expected: "that neighbor's id", label: "Finds a level-neighbor across different parents" },
    ],
    hints: [
      "A level-order (BFS) traversal naturally visits every node at a given depth in left-to-right order, one queue at a time.",
      "Within a single BFS level (one queue snapshot), the node right after the target in that array is its next right sibling — parent boundaries don't matter.",
    ],
    orderIndex: 1136,
  },

  {
    slug: "traverse-dom-level-by-level",
    companies: ["Meta", "Google"],
    category: "javascript-runtime",
    title: "Traverse DOM level by level",
    description: `A **breadth-first (level-order) traversal** that groups every node by its depth in the tree, returning one array of ids per level — the same shape you'd want to render a tree visually row by row, or to compute per-level statistics.

## Your task

Write \`levelOrderTraversal(root)\`, where each node is \`{ id, children }\`. Return an array of arrays of ids, one inner array per level, top to bottom. A \`null\` root (an empty tree) has no levels at all — return \`[]\`.

\`\`\`js
// tree: a -> [b, c], b -> [d]
levelOrderTraversal(a)
// [["a"], ["b", "c"], ["d"]]
\`\`\``,
    difficulty: "easy",
    starterCode: `function levelOrderTraversal(root) {
}`,
    solutionCode: `function levelOrderTraversal(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  while (queue.length) {
    result.push(queue.map((n) => n.id));
    queue = queue.flatMap((n) => n.children);
  }
  return result;
}`,
    testCases: [
      { input: "a 3-level tree", expected: "one array of ids per level, top to bottom", label: "Groups nodes correctly by depth" },
      { input: "a single node with no children", expected: "[[thatId]]", label: "A single-node tree has exactly one level" },
      { input: "null", expected: "[]", label: "An empty tree produces an empty result" },
    ],
    hints: [
      "Track a 'current level' queue; after recording its ids, replace it with the flattened list of all their children for the next iteration.",
    ],
    orderIndex: 1137,
  },

  {
    slug: "jquery-style-dom-wrapper",
    companies: ["Meta", "Amazon"],
    category: "javascript-runtime",
    title: "A simple DOM wrapper for method chaining",
    description: `A miniature **jQuery-style DOM wrapper**: select a group of elements once, then chain multiple mutations onto all of them in a single fluent expression, the way \`$('.box').css(...).addClass(...).text(...)\` works in real jQuery.

## Your task

Write \`$(selector)\`, returning an object wrapping every element matching \`selector\` (via \`document.querySelectorAll\`), with chainable \`css(prop, value)\`, \`addClass(cls)\`, and \`text(str)\` methods — each applying to every matched element and returning the wrapper itself so calls can chain — plus a \`length\` property.

\`\`\`js
$(".box").addClass("active").text("hi")
// every element matching .box now has class "active" and text "hi"
\`\`\``,
    difficulty: "easy",
    starterCode: `function $(selector) {
}`,
    solutionCode: `function $(selector) {
  const elements = Array.from(document.querySelectorAll(selector));
  return {
    css(prop, value) {
      elements.forEach((el) => { el.style[prop] = value; });
      return this;
    },
    addClass(cls) {
      elements.forEach((el) => el.classList.add(cls));
      return this;
    },
    text(str) {
      elements.forEach((el) => { el.textContent = str; });
      return this;
    },
    get length() {
      return elements.length;
    },
  };
}`,
    testCases: [
      { input: "$('.box') matching two elements", expected: "length is 2", label: "Wraps every matching element" },
      { input: "$('.box').addClass('active')", expected: "every matched element gets the class", label: "addClass() applies to all matches and is chainable" },
      { input: "$('.box').text('hi')", expected: "every matched element's text is set", label: "text() applies to every matched element" },
    ],
    hints: [
      "Array.from(document.querySelectorAll(selector)) captures the matched elements once, up front.",
      "Every method needs to `return this` to keep the chain going.",
    ],
    orderIndex: 1138,
  },

  {
    slug: "create-dom-element-store",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Create a simple store for DOM elements",
    description: `Associating arbitrary data with DOM elements **without mutating the elements themselves** — no custom attributes, no expando properties — and without leaking memory once an element is removed from the page and garbage collected.

## Your task

Write \`createElementStore()\`, returning \`{ set(el, data), get(el), has(el), delete(el) }\`.

\`\`\`js
const store = createElementStore();
store.set(el, { count: 1 });
store.get(el)
// { count: 1 }
\`\`\``,
    difficulty: "easy",
    starterCode: `function createElementStore() {
}`,
    solutionCode: `function createElementStore() {
  const store = new WeakMap();
  return {
    set(el, data) {
      store.set(el, data);
    },
    get(el) {
      return store.get(el);
    },
    has(el) {
      return store.has(el);
    },
    delete(el) {
      return store.delete(el);
    },
  };
}`,
    testCases: [
      { input: "store.set(el, data); store.get(el)", expected: "the exact data stored", label: "Stores and retrieves data keyed by element" },
      { input: "two different elements", expected: "each has its own independent data", label: "Different elements never share data" },
      { input: "store.delete(el); store.has(el)", expected: "false", label: "delete() removes the association" },
    ],
    hints: [
      "A WeakMap keyed by the element itself is exactly the right tool — it also means an element removed from the DOM and garbage collected won't leak its stored data.",
    ],
    orderIndex: 1139,
  },

  {
    slug: "find-corresponding-dom-node",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Find corresponding node in two identical DOM trees",
    description: `Given **two structurally identical DOM trees** and a node inside the first one, find the node at the exact same structural position in the second tree — useful for diffing two renders of the same component, or syncing a preview pane with an editor pane.

## Your task

Write \`findCorrespondingNode(rootA, rootB, target)\`, where \`target\` is a descendant element of \`rootA\`, or \`rootA\` itself. Record the path of child indices from \`rootA\` down to \`target\` (an empty path when \`target === rootA\`), then replay that same path of indices starting from \`rootB\`.

\`\`\`js
// rootA and rootB are identical <ul><li>A</li><li>B</li></ul> trees
findCorrespondingNode(rootA, rootB, rootA.children[1])
// rootB.children[1] — the second <li> in the second tree
\`\`\``,
    difficulty: "easy",
    starterCode: `function findCorrespondingNode(rootA, rootB, target) {
}`,
    solutionCode: `function findCorrespondingNode(rootA, rootB, target) {
  function getPath(root, node) {
    const path = [];
    let curr = node;
    while (curr !== root) {
      const parent = curr.parentNode;
      const index = Array.from(parent.children).indexOf(curr);
      path.unshift(index);
      curr = parent;
    }
    return path;
  }
  const path = getPath(rootA, target);
  let curr = rootB;
  for (const index of path) {
    curr = curr.children[index];
  }
  return curr;
}`,
    testCases: [
      { input: "a nested target several levels deep", expected: "the structurally-matching element in the other tree", label: "Finds a deeply nested corresponding node" },
      { input: "target === rootA", expected: "rootB itself", label: "The root corresponds to the other root" },
      { input: "the corresponding node's tag name", expected: "matches the target's tag name", label: "The found node has the same tag as the target" },
    ],
    hints: [
      "First record the path of child-indices from rootA down to target, then replay that same path of indices starting from rootB.",
    ],
    orderIndex: 1140,
  },

  {
    slug: "two-way-input-binding",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Two-way binding",
    description: `The core mechanic behind frameworks' \`v-model\` / controlled-input **two-way data binding**: keep a real \`<input>\` element and an in-memory value in sync in both directions — calling a setter updates the input on screen, and the user typing into the input updates the value your code reads back.

## Your task

Write \`createTwoWayBinding(inputEl, initialValue)\`, returning \`{ getValue(), setValue(v) }\`. \`setValue\` must update the input's displayed value; the user typing into the input (an "input" event) must update what \`getValue()\` returns.

\`\`\`js
const binding = createTwoWayBinding(inputEl, "hello");
binding.setValue("new");
inputEl.value
// "new" — setValue() updates the actual DOM input too
\`\`\``,
    difficulty: "easy",
    starterCode: `function createTwoWayBinding(inputEl, initialValue) {
}`,
    solutionCode: `function createTwoWayBinding(inputEl, initialValue) {
  let value = initialValue;
  inputEl.value = value;
  inputEl.addEventListener("input", () => {
    value = inputEl.value;
  });
  return {
    getValue() {
      return value;
    },
    setValue(v) {
      value = v;
      inputEl.value = v;
    },
  };
}`,
    testCases: [
      { input: "createTwoWayBinding(input, 'hello')", expected: "input.value is 'hello' immediately", label: "The initial value is applied to the input" },
      { input: "binding.setValue('new')", expected: "both getValue() and input.value reflect 'new'", label: "setValue() updates both directions" },
      { input: "changing input.value and dispatching an 'input' event", expected: "getValue() reflects the new input value", label: "Typing into the input updates the bound value" },
    ],
    hints: [
      "Listening for the native 'input' event is what lets a real (or simulated, via dispatchEvent) keystroke flow back into your JS state.",
    ],
    orderIndex: 1141,
  },

  {
    slug: "get-dom-tree-height",
    companies: ["Meta", "Google"],
    category: "javascript-runtime",
    title: "Get DOM tree height",
    description: `Computing how many levels deep a tree goes — its **height** — where a single leaf node counts as height 1 and an empty tree counts as height 0, following the deepest branch rather than the shallowest.

## Your task

Write \`treeHeight(root)\`, where each node is \`{ id, children }\`. A single node with no children has height 1; an empty tree (\`null\`) has height 0.

\`\`\`js
// tree: a -> [b -> [c]]
treeHeight(a)
// 3 — three levels deep: a, b, c
\`\`\``,
    difficulty: "medium",
    starterCode: `function treeHeight(root) {
}`,
    solutionCode: `function treeHeight(root) {
  if (!root) return 0;
  if (!root.children || root.children.length === 0) return 1;
  return 1 + Math.max(...root.children.map(treeHeight));
}`,
    testCases: [
      { input: "null", expected: "0", label: "An empty tree has height 0" },
      { input: "a single node with no children", expected: "1", label: "A leaf-only tree has height 1" },
      { input: "a tree three levels deep", expected: "3", label: "Height follows the deepest branch, not the shallowest" },
    ],
    hints: [
      "The height of a node is 1 plus the maximum height among its children — a leaf's height is 1 by definition.",
    ],
    orderIndex: 1142,
  },

  {
    slug: "get-all-dom-tags",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Get DOM tags",
    description: `Flattening a tree into the **full list of every tag name it contains**, in preorder (a node, then each of its children in order), duplicates included — a preorder DFS is the whole trick.

## Your task

Write \`getAllTags(root)\`, where each node is \`{ tag, children }\`. Return the tags in preorder, including duplicates.

\`\`\`js
// tree: div -> [span, span]
getAllTags(root)
// ["div", "span", "span"]
\`\`\``,
    difficulty: "medium",
    starterCode: `function getAllTags(root) {
}`,
    solutionCode: `function getAllTags(root) {
  if (!root) return [];
  return [root.tag, ...root.children.flatMap(getAllTags)];
}`,
    testCases: [
      { input: "a tree with a div containing two spans", expected: "['div', 'span', 'span']", label: "Lists tags in preorder, including duplicates" },
      { input: "a single node with no children", expected: "an array with just that one tag", label: "A leaf node returns a single-item array" },
      { input: "null", expected: "[]", label: "An empty tree returns an empty array" },
    ],
    hints: [
      "This is a straightforward preorder DFS: visit the node, then recursively collect from each child in order.",
    ],
    orderIndex: 1143,
  },

  {
    slug: "highlight-keywords-in-html",
    companies: ["Meta", "Grammarly"],
    category: "javascript-runtime",
    title: "Highlight keywords in an HTML string",
    description: `Wrapping every occurrence of a set of keywords in \`<mark>\` tags, **case-insensitively**, while preserving each match's original casing — the same highlighting behavior search results and find-in-page features use.

## Your task

Write \`highlightKeywords(html, keywords)\`. Match case-insensitively, but keep the matched text's original casing in the output. (This simplified version works directly on the string — matching inside existing tag names/attributes is out of scope.)

\`\`\`js
highlightKeywords("Hello WORLD", ["world"])
// "Hello <mark>WORLD</mark>" — matched case-insensitively, casing preserved
\`\`\``,
    difficulty: "medium",
    starterCode: `function highlightKeywords(html, keywords) {
}`,
    solutionCode: `function highlightKeywords(html, keywords) {
  if (keywords.length === 0) return html;
  const escaped = keywords.map((k) => k.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&"));
  const pattern = new RegExp("(" + escaped.join("|") + ")", "gi");
  return html.replace(pattern, "<mark>$1</mark>");
}`,
    testCases: [
      { input: '"Hello world", ["world"]', expected: '"Hello <mark>world</mark>"', label: "Wraps a single matching keyword" },
      { input: '"The cat sat", ["cat","sat"]', expected: '"The <mark>cat</mark> <mark>sat</mark>"', label: "Wraps every distinct keyword given" },
      { input: '"Hello WORLD", ["world"]', expected: '"Hello <mark>WORLD</mark>"', label: "Matches case-insensitively but preserves the original casing" },
    ],
    hints: [
      "Build one combined regex alternation from all the keywords, with the case-insensitive flag, and a capture group so the replacement can reuse the exact matched text.",
    ],
    orderIndex: 1144,
  },

  {
    slug: "extract-anchor-elements",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Extract all anchor elements from an HTML string",
    description: `Parsing a raw HTML string and pulling out every \`<a>\` tag's link and visible text — using the browser's own \`DOMParser\` instead of a fragile regex, so nested markup and attribute quoting are handled correctly.

## Your task

Write \`extractAnchors(html)\`, using \`DOMParser\` to return an array of \`{ href, text }\` objects, one per anchor, in document order.

\`\`\`js
extractAnchors("<a href='/x'>X</a><p>text</p><a href='/y'>Y</a>")
// [{ href: "/x", text: "X" }, { href: "/y", text: "Y" }]
\`\`\``,
    difficulty: "medium",
    starterCode: `function extractAnchors(html) {
}`,
    solutionCode: `function extractAnchors(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("a")).map((a) => ({
    href: a.getAttribute("href"),
    text: a.textContent,
  }));
}`,
    testCases: [
      { input: '"<a href=\'/x\'>X</a><p>text</p><a href=\'/y\'>Y</a>"', expected: "[{href:'/x',text:'X'},{href:'/y',text:'Y'}]", label: "Extracts every anchor's href and text, ignoring other tags" },
      { input: '"<p>no links here</p>"', expected: "[]", label: "No anchors returns an empty array" },
      { input: '"<div><a href=\'/nested\'>Nested</a></div>"', expected: "[{href:'/nested',text:'Nested'}]", label: "Finds anchors nested inside other elements" },
    ],
    hints: [
      "DOMParser().parseFromString(html, 'text/html') gives you a real, queryable document from an arbitrary HTML string.",
    ],
    orderIndex: 1145,
  },

  {
    slug: "implement-event-delegation",
    companies: ["Meta", "Amazon", "Microsoft"],
    category: "javascript-runtime",
    title: "Event delegation",
    description: `**Event delegation**: attach a single listener on a parent container that only reacts when the actual click target matches a given selector — including elements added to the container *after* the listener was set up, since the listener lives on the stable container rather than on each individual child.

## Your task

Write \`createDelegatedListener(container, selector, eventType, handler)\`, returning an unsubscribe function. Use \`event.target.closest(selector)\` to find the matching ancestor-or-self, and call \`handler\` with \`this\` set to that matched element.

\`\`\`js
const off = createDelegatedListener(list, "li", "click", function () {
  console.log(this.textContent);
});
// clicking any <li>, even one added to \`list\` after this call, logs its text
off(); // removes the listener entirely
\`\`\``,
    difficulty: "medium",
    starterCode: `function createDelegatedListener(container, selector, eventType, handler) {
}`,
    solutionCode: `function createDelegatedListener(container, selector, eventType, handler) {
  function listener(event) {
    const match = event.target.closest(selector);
    if (match && container.contains(match)) {
      handler.call(match, event);
    }
  }
  container.addEventListener(eventType, listener);
  return () => container.removeEventListener(eventType, listener);
}`,
    testCases: [
      { input: "clicking a child added to the container after setup", expected: "the handler still fires", label: "Works for dynamically-added matching children" },
      { input: "clicking an element that doesn't match the selector", expected: "the handler does not fire", label: "Non-matching targets are correctly ignored" },
      { input: "calling the returned unsubscribe function, then clicking again", expected: "the handler no longer fires", label: "The returned function actually removes the listener" },
    ],
    hints: [
      "event.target.closest(selector) walks up from the actual click target looking for the nearest ancestor (or itself) matching the selector — exactly what delegation needs.",
      "Because the listener lives on the container (not the individual matching elements), it automatically covers children added later, with zero extra wiring.",
    ],
    orderIndex: 1146,
  },

  {
    slug: "previous-left-sibling",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Previous Left Sibling",
    description: `The mirror image of Next Right Sibling: given a tree and a target node, find whichever node sits immediately to its **left** at the exact same depth — regardless of which parent each one belongs to, via the same level-order (BFS) traversal.

## Your task

Write \`findPreviousLeftSibling(root, targetId)\`, where each node is \`{ id, children }\`. Return the neighbor's \`id\`, or \`null\` if the target is the leftmost node at its level.

\`\`\`js
// tree: a -> [b -> [d, e], c -> [f]]
// level 2 (left to right): d, e, f
findPreviousLeftSibling(root, "f")
// "e" — e and f are on the same level even though they have different parents
\`\`\``,
    difficulty: "medium",
    starterCode: `function findPreviousLeftSibling(root, targetId) {
}`,
    solutionCode: `function findPreviousLeftSibling(root, targetId) {
  let queue = [root];
  while (queue.length) {
    const nextQueue = [];
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].id === targetId) {
        return i - 1 >= 0 ? queue[i - 1].id : null;
      }
      nextQueue.push(...queue[i].children);
    }
    queue = nextQueue;
  }
  return null;
}`,
    testCases: [
      { input: "a node with a left neighbor under the same parent", expected: "that neighbor's id", label: "Finds a left sibling under the same parent" },
      { input: "the leftmost node at its level", expected: "null", label: "The leftmost node at a level has no previous sibling" },
      { input: "a node whose left neighbor belongs to a different parent", expected: "that neighbor's id", label: "Finds a level-neighbor across different parents" },
    ],
    hints: [
      "Same BFS-by-level approach as Next Right Sibling, just looking one position back in the level's array instead of one forward.",
    ],
    orderIndex: 1147,
  },

  {
    slug: "generate-css-selector",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Generate a CSS Selector for a target element",
    description: `Building a CSS selector string that **uniquely resolves back to a specific element** — the same thing browser DevTools does for its "Copy selector" feature: prefer a short \`#id\` selector when available, otherwise recursively build a \`tag:nth-child(n)\` path all the way up to \`document.body\`.

## Your task

Write \`generateSelector(el)\`. Prefer an \`#id\` selector when the element has one; otherwise, build a path of \`tag:nth-child(n)\` segments up to \`document.body\`.

\`\`\`js
// <div id="app"><ul><li>A</li><li>B</li></ul></div>
generateSelector(secondLi)
// "#app > ul:nth-child(1) > li:nth-child(2)" — no id on the <li> or <ul>, so a full path is built up to the #app anchor
\`\`\``,
    difficulty: "medium",
    starterCode: `function generateSelector(el) {
}`,
    solutionCode: `function generateSelector(el) {
  if (el.id) return "#" + el.id;
  if (el === document.body) return "body";
  const parent = el.parentNode;
  const siblings = Array.from(parent.children);
  const index = siblings.indexOf(el) + 1;
  return generateSelector(parent) + " > " + el.tagName.toLowerCase() + ":nth-child(" + index + ")";
}`,
    testCases: [
      { input: "an element with an id", expected: "'#that-id', directly", label: "An id short-circuits straight to an #id selector" },
      { input: "an element with no id, nested a few levels deep", expected: "a tag + nth-child path all the way up", label: "Builds a full ancestor path when there's no id to anchor on" },
      { input: "document.querySelector(generateSelector(el))", expected: "resolves back to the exact original element", label: "The generated selector is actually valid and correct" },
    ],
    hints: [
      "Recursion mirrors the DOM's own nesting: an element's selector is its parent's selector, plus its own tag and position among its siblings.",
      "nth-child is 1-indexed, not 0-indexed — don't forget the +1 when converting from an array index.",
    ],
    orderIndex: 1148,
  },

  {
    slug: "cookie-string-helper",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Create your own Cookie helper",
    description: `Cookies are just a semicolon-delimited string of \`key=value\` pairs — parsing that format into a usable object, and building a single cookie string back (with proper URL-encoding of values), is the entire exercise behind implementing your own lightweight cookie helper.

## Your task

Write \`parseCookies(cookieString)\`, returning a plain object of key/value pairs, and \`stringifyCookie(name, value, options)\`, building a single cookie's \`Set-Cookie\`-style string (supporting \`options.days\` for \`max-age\` and \`options.path\`).

\`\`\`js
parseCookies("a=1; b=2; c=3")
// { a: "1", b: "2", c: "3" }
stringifyCookie("name", "a b", {})
// "name=a%20b"
stringifyCookie("name", "v", { days: 1, path: "/" })
// "name=v; max-age=86400; path=/" — options.days converts to max-age in seconds, options.path is appended after
\`\`\``,
    difficulty: "medium",
    starterCode: `function parseCookies(cookieString) {
}
function stringifyCookie(name, value, options = {}) {
}`,
    solutionCode: `function parseCookies(cookieString) {
  const result = {};
  cookieString.split(";").forEach((pair) => {
    const trimmed = pair.trim();
    if (!trimmed) return;
    const [key, ...rest] = trimmed.split("=");
    result[key] = decodeURIComponent(rest.join("="));
  });
  return result;
}
function stringifyCookie(name, value, options = {}) {
  let str = name + "=" + encodeURIComponent(value);
  if (options.days) str += "; max-age=" + options.days * 86400;
  if (options.path) str += "; path=" + options.path;
  return str;
}`,
    testCases: [
      { input: '"a=1; b=2; c=3"', expected: "{ a: '1', b: '2', c: '3' }", label: "Parses multiple key=value pairs" },
      { input: "stringifyCookie('name', 'a b', {})", expected: '"name=a%20b"', label: "URL-encodes the value" },
      { input: "stringifyCookie('name', 'v', { days: 1, path: '/' })", expected: '"name=v; max-age=86400; path=/"', label: "Includes max-age and path when given" },
    ],
    hints: [
      "Cookie values need URL-encoding/decoding because raw values can contain characters (like spaces or semicolons) that would otherwise break the cookie-string format.",
      "This version works on cookie strings directly rather than the real document.cookie, so it's portable and easy to test — the parsing/building logic is identical either way.",
    ],
    orderIndex: 1149,
  },

  {
    slug: "expiring-storage-cache",
    companies: ["Amazon", "Airbnb"],
    category: "javascript-runtime",
    title: "localStorage with expiration",
    description: `Extending simple key-value storage with a **time-to-live (TTL)**: an entry silently disappears once it's expired, checked lazily on read rather than needing a background sweep or timer — the same idea behind storage wrappers that auto-expire cached API responses.

## Your task

Write \`createExpiringStorage()\`, returning \`{ set(key, value, ttlMs), get(key) }\`. Omitting \`ttlMs\` means the entry never expires; once \`ttlMs\` has elapsed since \`set()\`, \`get()\` returns \`null\`.

\`\`\`js
const cache = createExpiringStorage();
cache.set("token", "abc123", 1000);
cache.get("token")
// "abc123" — immediately after set(), still valid
// ...1000ms later:
cache.get("token")
// null — the ttl has elapsed
\`\`\``,
    difficulty: "medium",
    starterCode: `function createExpiringStorage() {
}`,
    solutionCode: `function createExpiringStorage() {
  const store = new Map();
  return {
    set(key, value, ttlMs) {
      const expiresAt = ttlMs != null ? Date.now() + ttlMs : null;
      store.set(key, { value, expiresAt });
    },
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
  };
}`,
    testCases: [
      { input: "get() right after set()", expected: "the stored value", label: "A freshly set value is immediately retrievable" },
      { input: "get() after the ttl has elapsed", expected: "null", label: "An expired entry returns null" },
      { input: "set() with no ttl, checked much later", expected: "still the stored value", label: "An entry with no ttl never expires" },
    ],
    hints: [
      "Store an expiry timestamp (Date.now() + ttlMs) alongside the value, and check it lazily on get() — no timer or background sweep needed.",
    ],
    orderIndex: 1150,
  },

  {
    slug: "lru-cache-storage-eviction",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "LRU-style automatic eviction cache",
    description: `A classic **LRU (least-recently-used) cache implementation in JavaScript**: a fixed-capacity cache that automatically evicts its least-recently-used entry once full — the same eviction policy browsers use for the HTTP cache. A JS \`Map\` preserves insertion order, and re-inserting a key (delete then set) moves it to the end, which is the entire mechanism — no manual doubly-linked list required.

## Your task

Write \`createLRUCache(capacity)\`, returning \`{ get(key), set(key, value) }\`. Both reading and writing an entry counts as "using" it, refreshing its recency.

\`\`\`js
const cache = createLRUCache(2);
cache.set("a", 1);
cache.set("b", 2);
cache.get("a");        // touches "a", making "b" the least recently used
cache.set("c", 3);     // capacity exceeded — evicts "b", not "a"
cache.get("b")
// undefined — "b" was evicted
\`\`\``,
    difficulty: "medium",
    starterCode: `function createLRUCache(capacity) {
}`,
    solutionCode: `function createLRUCache(capacity) {
  const map = new Map();
  return {
    get(key) {
      if (!map.has(key)) return undefined;
      const value = map.get(key);
      map.delete(key);
      map.set(key, value);
      return value;
    },
    set(key, value) {
      if (map.has(key)) map.delete(key);
      else if (map.size >= capacity) {
        map.delete(map.keys().next().value);
      }
      map.set(key, value);
    },
  };
}`,
    testCases: [
      { input: "a capacity-2 cache with a third key added", expected: "the least-recently-used key is evicted", label: "Evicts the least-recently-used entry once full" },
      { input: "get()-ing an entry, then adding enough new entries to trigger eviction", expected: "the recently get() entry survives instead", label: "Reading an entry protects it from eviction" },
      { input: "set() on an existing key", expected: "updates the value without evicting anything", label: "Overwriting an existing key doesn't count against capacity" },
    ],
    hints: [
      "A JS Map preserves insertion order, and re-inserting a key (delete + set) moves it to the end — that ordering is the entire LRU mechanism, no manual linked list needed.",
      "The oldest entry is always the first one a Map iterates — map.keys().next().value gives you that key directly.",
    ],
    orderIndex: 1151,
  },

  {
    slug: "infinite-scroll-loader",
    companies: ["Airbnb", "Pinterest", "TikTok"],
    category: "javascript-runtime",
    title: "Implement an infinite scroll / pagination loader",
    description: `The data layer behind **infinite scroll / pagination**: accumulate pages of results as the user scrolls, track whether more pages exist, and guard against firing a duplicate request while one is already in flight — the logic behind any "load more on scroll" hook, independent of any specific framework.

## Your task

Write \`createInfiniteScrollLoader(fetchPage)\`, where \`fetchPage(cursor)\` returns a promise resolving to \`{ items, nextCursor }\`. Return \`{ getItems(), hasMore(), loadNext() }\`.

\`\`\`js
const loader = createInfiniteScrollLoader(fetchPage);
await loader.loadNext();
loader.getItems()
// items from page 1
loader.hasMore()
// true, unless that page's nextCursor was null
\`\`\``,
    difficulty: "medium",
    starterCode: `function createInfiniteScrollLoader(fetchPage) {
}`,
    solutionCode: `function createInfiniteScrollLoader(fetchPage) {
  let items = [];
  let cursor = null;
  let hasMoreFlag = true;
  let isLoading = false;
  return {
    getItems() {
      return items;
    },
    hasMore() {
      return hasMoreFlag;
    },
    async loadNext() {
      if (isLoading || !hasMoreFlag) return;
      isLoading = true;
      const { items: newItems, nextCursor } = await fetchPage(cursor);
      items = items.concat(newItems);
      cursor = nextCursor;
      hasMoreFlag = !!nextCursor;
      isLoading = false;
    },
  };
}`,
    testCases: [
      { input: "loadNext() called twice in sequence", expected: "items from both pages, accumulated", label: "Accumulates items across multiple pages" },
      { input: "a page whose nextCursor is null", expected: "hasMore() becomes false", label: "Correctly detects the end of the data" },
      { input: "two concurrent loadNext() calls before the first resolves", expected: "fetchPage is only actually called once", label: "Guards against a duplicate fetch while one is in flight" },
    ],
    hints: [
      "An isLoading flag, checked and set at the very start of loadNext(), is what prevents a second call from starting a redundant fetch.",
    ],
    orderIndex: 1152,
  },

  {
    slug: "windowed-list-viewport",
    companies: ["Meta", "Airbnb", "TikTok"],
    category: "javascript-runtime",
    title: "Implement a virtualized (windowed) list",
    description: `Rendering thousands of rows the naive way creates thousands of DOM nodes. A **virtualized (windowed) list** — the technique behind libraries like \`react-window\` — only ever renders the handful of rows actually visible in the viewport, sliced directly from the full data array as the user scrolls.

## Your task

Write \`createVirtualList(items, itemHeight, containerHeight, overscan = 3)\`, returning \`{ getVisibleItems(scrollTop) }\` where the result is \`{ items, offsetY, startIndex }\` — the sliced visible items, the pixel offset to position them at, and their starting index. \`overscan\` is the number of extra rows to render just past each edge of the visible viewport, as a buffer so fast scrolling doesn't flash blank space before new rows render.

\`\`\`js
const list = createVirtualList(items /* 1,000 rows */, 50, 300, 3);
list.getVisibleItems(0);
// { items: items.slice(0, 12), offsetY: 0, startIndex: 0 } — only 12 of 1,000 rows are ever sliced out
\`\`\``,
    difficulty: "hard",
    starterCode: `function createVirtualList(items, itemHeight, containerHeight, overscan = 3) {
}`,
    solutionCode: `function createVirtualList(items, itemHeight, containerHeight, overscan = 3) {
  return {
    getVisibleItems(scrollTop) {
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
      const end = Math.min(items.length, start + visibleCount);
      return {
        items: items.slice(start, end),
        offsetY: start * itemHeight,
        startIndex: start,
      };
    },
  };
}`,
    testCases: [
      { input: "scrollTop = 0", expected: "a small window from the very start, offsetY 0", label: "Starts correctly at the top of the list" },
      { input: "a large scrollTop partway down", expected: "a window offset to the right position, with a non-zero offsetY", label: "Correctly windows a scrolled-down position" },
      { input: "10,000 items total", expected: "the returned window is always a small, bounded slice", label: "Never returns anywhere close to the full list, regardless of its size" },
    ],
    hints: [
      "The visible window's start index comes directly from scrollTop / itemHeight — everything else (overscan padding, item count) is just arithmetic around that.",
      "offsetY = startIndex * itemHeight is what lets the sliced-out rows still render at their correct visual position, instead of snapping back to the top.",
    ],
    orderIndex: 1153,
  },


  // Stage 11 — Event Systems & Design Patterns
  {
    slug: "build-event-emitter",
    companies: ["Meta", "Uber", "LinkedIn", "Amazon"],
    category: "javascript-runtime",
    title: "Create an Event Emitter",
    description: `One of the most common front-end interview questions across the industry — "implement a JavaScript event emitter": build the **pub-sub** primitive — on/off/emit — that lets decoupled parts of an app talk to each other without holding direct references. Node's own \`EventEmitter\` and the DOM's own event system both work this way under the hood.

## Your task

Write an \`EventEmitter\` class with \`on(event, handler)\`, \`off(event, handler)\`, \`emit(event, ...args)\`, and \`once(event, handler)\` (fires at most one time, then auto-removes itself).

\`\`\`js
const emitter = new EventEmitter();
emitter.on("data", (value) => console.log("got", value));
emitter.emit("data", 42);
// got 42

emitter.once("ready", () => console.log("ready fired"));
emitter.emit("ready"); // "ready fired"
emitter.emit("ready"); // nothing — once() already auto-removed the handler
\`\`\``,
    difficulty: "medium",
    starterCode: `class EventEmitter {
  on(event, handler) {
  }
  off(event, handler) {
  }
  emit(event, ...args) {
  }
  once(event, handler) {
  }
}`,
    solutionCode: `class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, handler) {
    (this.listeners[event] = this.listeners[event] || []).push(handler);
    return this;
  }
  off(event, handler) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
    return this;
  }
  emit(event, ...args) {
    (this.listeners[event] || []).slice().forEach((h) => h(...args));
    return this;
  }
  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
    return this;
  }
}`,
    testCases: [
      { input: "two handlers on the same event, then emit(args)", expected: "both called with those args", label: "Multiple listeners for the same event all fire" },
      { input: "off(event, handler) for one of two handlers", expected: "only the other handler still fires", label: "off() removes exactly the specified handler" },
      { input: "once(event, handler), emitted twice", expected: "handler runs exactly once", label: "once() auto-removes itself after firing" },
    ],
    hints: [
      "A plain object mapping event names to arrays of handler functions is the whole data structure.",
      "once() is just on() with a wrapper that calls off() on itself before invoking the real handler.",
    ],
    orderIndex: 1154,
  },

  {
    slug: "build-pubsub-module",
    companies: ["Uber"],
    category: "javascript-runtime",
    title: "Implement a Publish/Subscribe module",
    description: `A topic-based cousin of the Event Emitter, in the style of a message bus: subscribers register per-topic instead of per-event-name, and unsubscribing happens through the function \`subscribe\` itself returns — no separate \`off()\` call, and no risk of accidentally removing the wrong handler.

## Your task

Write \`createPubSub()\`, returning \`{ publish(topic, data), subscribe(topic, fn) }\`, where \`subscribe\` returns an unsubscribe function.

\`\`\`js
const bus = createPubSub();
const unsubscribe = bus.subscribe("order:created", (data) => console.log("new order", data));
bus.publish("order:created", { id: 42 });
// new order { id: 42 }
unsubscribe();
bus.publish("order:created", { id: 43 }); // nothing logged — this subscriber is gone
\`\`\``,
    difficulty: "medium",
    starterCode: `function createPubSub() {
}`,
    solutionCode: `function createPubSub() {
  const topics = {};
  return {
    publish(topic, data) {
      (topics[topic] || []).forEach((fn) => fn(data));
    },
    subscribe(topic, fn) {
      (topics[topic] = topics[topic] || []).push(fn);
      return () => {
        topics[topic] = topics[topic].filter((f) => f !== fn);
      };
    },
  };
}`,
    testCases: [
      { input: "subscribe then publish", expected: "the subscriber receives the published data", label: "Subscribers receive published data" },
      { input: "calling the function subscribe() returned", expected: "that subscriber stops receiving further publishes", label: "The returned unsubscribe function actually works" },
      { input: "two different topics", expected: "publishing one never notifies the other's subscribers", label: "Topics are completely independent" },
    ],
    hints: [
      "Unlike a raw EventEmitter's on/off pair, the unsubscribe logic here is captured in a closure returned directly from subscribe() — no need to keep a separate reference to the handler around to remove it later.",
    ],
    orderIndex: 1155,
  },

  {
    slug: "template-string-interpolation",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Interpolation (template-string engine)",
    description: `A minimal **templating engine**, the same basic mechanism behind Mustache or Handlebars: replace \`{{path}}\` placeholders in a string with values pulled from a data object, supporting dotted paths for reaching into nested objects.

## Your task

Write \`interpolate(template, data)\`, replacing every \`{{path}}\` placeholder with the value found by walking \`path\` (e.g. \`"user.name"\`) into \`data\`. A placeholder whose path can't be resolved should be replaced with an empty string, not left as-is or throw.

\`\`\`js
interpolate("Hi {{name}}, you work at {{user.company}}", { name: "Ada", user: { company: "Acme" } });
// "Hi Ada, you work at Acme"
interpolate("{{missing}}", {});
// "" — an unresolvable path becomes an empty string, not left as "{{missing}}"
\`\`\``,
    difficulty: "medium",
    starterCode: `function interpolate(template, data) {
}`,
    solutionCode: `function interpolate(template, data) {
  return template.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => (obj == null ? undefined : obj[key]), data);
    return value === undefined ? "" : value;
  });
}`,
    testCases: [
      { input: '"Hi {{name}}", { name: "Ada" }', expected: '"Hi Ada"', label: "Replaces a simple placeholder" },
      { input: '"{{user.name}}", { user: { name: "Grace" } }', expected: '"Grace"', label: "Supports nested dotted paths" },
      { input: '"{{missing}}", {}', expected: '""', label: "An unresolvable path becomes an empty string" },
    ],
    hints: [
      "A regex like /\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g captures the path inside each {{ }} placeholder, letting String.replace's callback resolve it.",
      "reduce() over the split path segments is a clean way to walk into nested objects one key at a time.",
    ],
    orderIndex: 1156,
  },

  {
    slug: "extract-twitter-mentions",
    companies: ["X", "Meta"],
    category: "javascript-runtime",
    title: "Twitter mentions (text parsing — entities)",
    description: `Parsing \`@mentions\` out of free text — the same feature behind Twitter/X, Slack, and GitHub comments — sounds like a simple regex until you hit an email address: \`user@example.com\` has an \`@\` too, and that one should **not** count as a mention.

## Your task

Write \`extractMentions(text)\`, returning an array of usernames (without the \`@\`), in the order they appear. An \`@\` immediately preceded by a word character (like the local part of an email address) must not be treated as the start of a mention.

\`\`\`js
extractMentions("cc @bob and @carol, email me at user@example.com");
// ['bob', 'carol'] — the @ in the email address is not treated as a mention
\`\`\``,
    difficulty: "medium",
    starterCode: `function extractMentions(text) {
}`,
    solutionCode: `function extractMentions(text) {
  const matches = text.match(/(?<![\\w@])@(\\w+)/g) || [];
  return matches.map((m) => m.slice(1));
}`,
    testCases: [
      { input: '"Hello @alice!"', expected: "['alice']", label: "Extracts a single mention" },
      { input: '"cc @bob and @carol"', expected: "['bob', 'carol']", label: "Extracts multiple mentions in order" },
      { input: '"email me at user@example.com"', expected: "[]", label: "An email address's @ is not treated as a mention" },
    ],
    hints: [
      "A negative lookbehind — (?<![\\w@]) — is what excludes an @ immediately preceded by a word character (like in an email address) from matching.",
    ],
    orderIndex: 1157,
  },

  {
    slug: "build-middleware-pipeline",
    companies: ["Meta", "Airbnb"],
    category: "javascript-runtime",
    title: "Create a middleware system (Express/Redux-style)",
    description: `The core mechanic behind Express and Redux middleware, sometimes called the **onion model**: a chain of functions wraps around the real work, and each layer explicitly decides whether to call \`next()\` and hand off to the layer inside it, or stop the chain right there.

## Your task

Write \`createMiddlewarePipeline()\`, returning \`{ use(fn), run(context) }\`. Each middleware receives \`(context, next)\`; the chain only continues if a middleware calls \`next()\`.

\`\`\`js
const pipeline = createMiddlewarePipeline();
pipeline.use((ctx, next) => { ctx.log.push("first"); next(); });
pipeline.use((ctx, next) => { ctx.log.push("second"); next(); });
const ctx = { log: [] };
pipeline.run(ctx);
// ctx.log === ["first", "second"] — each middleware ran in registration order, sharing the same context
\`\`\``,
    difficulty: "medium",
    starterCode: `function createMiddlewarePipeline() {
}`,
    solutionCode: `function createMiddlewarePipeline() {
  const middlewares = [];
  return {
    use(fn) {
      middlewares.push(fn);
      return this;
    },
    run(context) {
      let index = -1;
      function dispatch(i) {
        if (i <= index) throw new Error("next() called multiple times");
        index = i;
        const fn = middlewares[i];
        if (!fn) return;
        fn(context, () => dispatch(i + 1));
      }
      dispatch(0);
    },
  };
}`,
    testCases: [
      { input: "three middlewares, each calling next()", expected: "run in registration order", label: "Middlewares run in the order they were registered" },
      { input: "a middleware that never calls next()", expected: "later middlewares never run", label: "The chain stops if next() isn't called" },
      { input: "a context object mutated by an early middleware", expected: "later middlewares see the mutation", label: "Context is shared and mutable across the whole chain" },
    ],
    hints: [
      "Each middleware gets its own next() closure that, when called, dispatches to the following one — this is the same 'onion' pattern Express and Koa both use internally.",
    ],
    orderIndex: 1158,
  },

  {
    slug: "implement-lazy-man",
    companies: ["ByteDance"],
    category: "javascript-runtime",
    title: "Create LazyMan()",
    description: `A classic chainable-API puzzle, and a good workout for task queues: build a fluent interface where each chained call — \`.eat()\`, \`.sleep()\` — queues up rather than running immediately, so a \`.sleep()\` genuinely delays every call chained *after* it, without blocking (or being blocked by) the ones before it.

## Your task

Write \`LazyMan(name)\`. It immediately logs \`"Hi I am " + name\`. Chained \`.eat(food)\` logs \`"Eat " + food\`; chained \`.sleep(seconds)\` delays every subsequent chained call by that many seconds before it runs. Both \`.eat()\` and \`.sleep()\` must be chainable off the same returned object.

\`\`\`js
LazyMan("Hank").eat("dinner").sleep(1).eat("supper");
// "Hi I am Hank"
// "Eat dinner"
// ...waits 1 second...
// "Eat supper"
\`\`\``,
    difficulty: "medium",
    starterCode: `function LazyMan(name) {
}`,
    solutionCode: `function LazyMan(name) {
  const tasks = [];
  function next() {
    const task = tasks.shift();
    if (task) task();
  }
  tasks.push(() => {
    console.log("Hi I am " + name);
    next();
  });
  const api = {
    eat(food) {
      tasks.push(() => {
        console.log("Eat " + food);
        next();
      });
      return api;
    },
    sleep(seconds) {
      tasks.push(() => {
        setTimeout(() => next(), seconds * 1000);
      });
      return api;
    },
  };
  setTimeout(next, 0);
  return api;
}`,
    testCases: [
      { input: "LazyMan('Hank').eat('dinner')", expected: "logs 'Hi I am Hank' then 'Eat dinner'", label: "Greets immediately, then eats" },
      { input: "LazyMan('Hank').eat('dinner').sleep(0.05).eat('supper')", expected: "the second eat is logged only after the sleep delay", label: "sleep() delays everything chained after it" },
      { input: "LazyMan('A').eat('x').eat('y')", expected: "logs in the order chained, with no sleep involved", label: "Multiple chained calls run in FIFO order" },
    ],
    hints: [
      "Every chained call just pushes a task onto a queue instead of running immediately — a single self-driving next() function is what actually executes them one at a time.",
      "sleep() pushes a task that itself calls next() only after a setTimeout, which is exactly what delays everything queued after it without touching what came before.",
    ],
    orderIndex: 1159,
  },

  {
    slug: "browser-history-undo-redo",
    companies: ["Meta", "Google"],
    category: "javascript-runtime",
    title: "Create a browser history (undo/redo stack)",
    description: `The data structure behind undo/redo in any editor: a stack of states with a movable cursor. The subtle part is what happens after an undo — pushing a brand-new state at that point has to discard the abandoned "future" states, the same way a real browser history does when you navigate somewhere new after going back.

## Your task

Write \`createHistory(initialState)\`, returning \`{ current(), push(state), undo(), redo() }\`.

\`\`\`js
const history = createHistory("home");
history.push("about");
history.push("contact");
history.undo();
// history.current() === "about"
history.push("settings");
history.redo();
// still "settings" — pushing after undo() discarded the abandoned "contact" future
\`\`\``,
    difficulty: "medium",
    starterCode: `function createHistory(initialState) {
}`,
    solutionCode: `function createHistory(initialState) {
  let stack = [initialState];
  let index = 0;
  return {
    current() {
      return stack[index];
    },
    push(state) {
      stack = stack.slice(0, index + 1);
      stack.push(state);
      index++;
    },
    undo() {
      if (index > 0) index--;
      return stack[index];
    },
    redo() {
      if (index < stack.length - 1) index++;
      return stack[index];
    },
  };
}`,
    testCases: [
      { input: "push('b'), then undo()", expected: "back to the initial state", label: "undo() returns to the previous state" },
      { input: "undo() then redo()", expected: "the undone state is restored", label: "redo() restores an undone state" },
      { input: "undo(), then push('c')", expected: "redo() no longer reaches the discarded state", label: "Pushing after an undo discards the abandoned future" },
    ],
    hints: [
      "push() must truncate the stack at the current index first — that's what discards any 'future' states left over from a previous undo.",
    ],
    orderIndex: 1160,
  },

  {
    slug: "simple-client-side-router",
    companies: ["Meta", "Airbnb"],
    category: "javascript-runtime",
    title: "Implement a simple client-side router",
    description: `The core route-matching logic behind client-side routers like React Router: match a path against registered patterns, including dynamic \`:param\` segments.

## Your task

Write \`createRouter(routes)\`, returning \`{ navigate(path) }\`. \`routes\` maps path patterns (which may include \`:param\` segments) to handler functions, called with an object of extracted params. A \`"*"\` entry is the fallback for no match.

\`\`\`js
const router = createRouter({
  "/about": () => console.log("About page"),
  "/user/:id": (params) => console.log("User", params.id),
  "*": () => console.log("404"),
});
router.navigate("/user/42");
// "User 42" — the :id segment is extracted into params.id
router.navigate("/nowhere");
// "404" — falls back to the wildcard handler
\`\`\``,
    difficulty: "medium",
    starterCode: `function createRouter(routes) {
}`,
    solutionCode: `function createRouter(routes) {
  function navigate(path) {
    for (const pattern in routes) {
      if (pattern === "*") continue;
      const paramNames = [];
      const regexPattern = "^" + pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      }) + "$";
      const match = path.match(new RegExp(regexPattern));
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        routes[pattern](params);
        return;
      }
    }
    if (routes["*"]) routes["*"]();
  }
  return { navigate };
}`,
    testCases: [
      { input: "navigate('/about') with a '/about' route registered", expected: "that route's handler runs", label: "Matches a static route" },
      { input: "navigate('/user/42') with a '/user/:id' route registered", expected: "handler called with { id: '42' }", label: "Matches a dynamic route and extracts the param" },
      { input: "navigate('/nowhere') with only a '*' fallback registered", expected: "the fallback handler runs", label: "Falls back to the wildcard handler when nothing matches" },
    ],
    hints: [
      "Turn each route pattern into a real regex by replacing every :param segment with a capturing group, then test each pattern against the incoming path in turn.",
    ],
    orderIndex: 1161,
  },

  {
    slug: "build-observable-class",
    companies: ["Google", "Netflix"],
    category: "javascript-runtime",
    title: "Create an Observable",
    description: `The foundational primitive behind RxJS — this is what people mean by "implement an observable from scratch": a **lazy**, re-runnable producer of values over time. Unlike a Promise — which starts running the moment it's created and settles exactly once — an Observable does nothing until something subscribes, and a fresh execution starts on every single subscription.

## Your task

Write an \`Observable\` class: \`new Observable(subscribeFn)\`, where \`subscribeFn(observer)\` is called fresh on every \`.subscribe(observer)\` and may return a cleanup function. \`.subscribe()\` returns \`{ unsubscribe() }\`.

\`\`\`js
const observable = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  return () => console.log("cleanup");
});
const subscription = observable.subscribe({ next: (v) => console.log(v) });
// 1
// 2
subscription.unsubscribe();
// "cleanup" — runs the cleanup function the producer returned
\`\`\``,
    difficulty: "medium",
    starterCode: `class Observable {
  constructor(subscribeFn) {
  }
  subscribe(observer) {
  }
}`,
    solutionCode: `class Observable {
  constructor(subscribeFn) {
    this._subscribe = subscribeFn;
  }
  subscribe(observer) {
    const cleanup = this._subscribe(observer) || (() => {});
    return { unsubscribe: cleanup };
  }
}`,
    testCases: [
      { input: "subscribing and having the producer call observer.next(1)", expected: "the observer receives 1", label: "Emitted values reach the subscribing observer" },
      { input: "unsubscribe()", expected: "runs the cleanup function returned by the producer", label: "unsubscribe() runs the producer's cleanup" },
      { input: "subscribing to the same Observable twice", expected: "the producer function runs independently each time", label: "Each subscription re-runs the producer (cold behavior)" },
    ],
    hints: [
      "The constructor just stores the producer function — none of the real work happens until subscribe() is actually called.",
      "If the producer doesn't return a cleanup function, default to a no-op so unsubscribe() is always safe to call.",
    ],
    orderIndex: 1162,
  },

  {
    slug: "observable-interval",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Observable interval()",
    description: `RxJS's \`interval\` as a minimal **Observable**: emit an increasing integer (starting at 0) every \`ms\` milliseconds, forever, until whoever subscribed decides to stop.

## Your task

Write \`interval(ms)\`, returning an Observable that emits \`0, 1, 2, ...\` at that cadence (include a minimal \`Observable\` class in your solution). Calling \`unsubscribe()\` on the returned subscription must stop further emissions.

\`\`\`js
const subscription = interval(1000).subscribe({ next: (n) => console.log(n) });
// 0, then 1, then 2, ... once per second
subscription.unsubscribe();
// no further values are emitted
\`\`\``,
    difficulty: "easy",
    starterCode: `function interval(ms) {
}`,
    solutionCode: `class Observable {
  constructor(subscribeFn) {
    this._subscribe = subscribeFn;
  }
  subscribe(observer) {
    const cleanup = this._subscribe(observer) || (() => {});
    return { unsubscribe: cleanup };
  }
}
function interval(ms) {
  return new Observable((observer) => {
    let count = 0;
    const id = setInterval(() => observer.next(count++), ms);
    return () => clearInterval(id);
  });
}`,
    testCases: [
      { input: "subscribing and waiting a few intervals", expected: "receives 0, 1, 2, ... in order", label: "Emits increasing values over time" },
      { input: "unsubscribing after a couple of emissions", expected: "no further values are received", label: "unsubscribe() stops future emissions" },
    ],
    hints: [
      "setInterval is the whole engine here; the Observable's cleanup function just needs to clearInterval.",
    ],
    orderIndex: 1163,
  },

  {
    slug: "observable-from-event",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Observable fromEvent()",
    description: `RxJS's \`fromEvent\`: turn any DOM event into an **Observable** stream, so a click or keypress can be piped through the same \`map\`/\`filter\`-style operators as any other stream of values instead of being handled with a raw \`addEventListener\` callback.

## Your task

Write \`fromEvent(target, eventType)\`, returning an Observable that emits each event object as it fires (include a minimal \`Observable\` class in your solution). Unsubscribing must remove the underlying event listener from \`target\`.

\`\`\`js
const subscription = fromEvent(button, "click").subscribe({
  next: (e) => console.log("clicked", e.target),
});
// fires on every click, same as addEventListener
subscription.unsubscribe();
// removes the underlying "click" listener from button — no further emissions
\`\`\``,
    difficulty: "easy",
    starterCode: `function fromEvent(target, eventType) {
}`,
    solutionCode: `class Observable {
  constructor(subscribeFn) {
    this._subscribe = subscribeFn;
  }
  subscribe(observer) {
    const cleanup = this._subscribe(observer) || (() => {});
    return { unsubscribe: cleanup };
  }
}
function fromEvent(target, eventType) {
  return new Observable((observer) => {
    function handler(e) {
      observer.next(e);
    }
    target.addEventListener(eventType, handler);
    return () => target.removeEventListener(eventType, handler);
  });
}`,
    testCases: [
      { input: "subscribing, then dispatching a matching event", expected: "the observer receives the event", label: "Delivers real DOM events to the observer" },
      { input: "unsubscribing, then dispatching another event", expected: "the observer receives nothing further", label: "unsubscribe() removes the underlying event listener" },
    ],
    hints: [
      "addEventListener/removeEventListener are the producer and its cleanup, almost verbatim.",
    ],
    orderIndex: 1164,
  },

  {
    slug: "observable-transform-operators",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Observable Transformation Operators",
    description: `\`map\` and \`filter\`, reimagined for **Observables**: each wraps a source Observable and returns a new one that transforms or filters whatever flows through it, the same way they'd transform an array — except here the values arrive over time instead of all at once.

## Your task

Write \`mapOperator(source, project)\`, emitting \`project(value)\` for every value the source emits, and \`filterOperator(source, predicate)\`, emitting only the values for which \`predicate(value)\` is truthy (include a minimal \`Observable\` class in your solution). Both operators must compose correctly when chained together.

\`\`\`js
// source emits 1, 2, 3
mapOperator(source, (x) => x * 2);
// emits 2, 4, 6 — every value doubled
filterOperator(mapOperator(source, (x) => x + 1), (x) => x > 2);
// source -> mapOperator produces 2, 3, 4 -> filterOperator keeps only 3, 4
\`\`\``,
    difficulty: "easy",
    starterCode: `function mapOperator(source, project) {
}
function filterOperator(source, predicate) {
}`,
    solutionCode: `class Observable {
  constructor(subscribeFn) {
    this._subscribe = subscribeFn;
  }
  subscribe(observer) {
    const cleanup = this._subscribe(observer) || (() => {});
    return { unsubscribe: cleanup };
  }
}
function mapOperator(source, project) {
  return new Observable((observer) => {
    const sub = source.subscribe({ next: (v) => observer.next(project(v)) });
    return () => sub.unsubscribe();
  });
}
function filterOperator(source, predicate) {
  return new Observable((observer) => {
    const sub = source.subscribe({
      next: (v) => {
        if (predicate(v)) observer.next(v);
      },
    });
    return () => sub.unsubscribe();
  });
}`,
    testCases: [
      { input: "mapOperator(source, x => x * 2)", expected: "every emitted value doubled", label: "map transforms every emitted value" },
      { input: "filterOperator(source, x => x % 2 === 0)", expected: "only even values pass through", label: "filter only forwards values matching the predicate" },
      { input: "filterOperator(mapOperator(source, x => x + 1), x => x > 2)", expected: "operators compose correctly when chained", label: "Chaining map and filter together works" },
    ],
    hints: [
      "Each operator is itself just a new Observable whose producer subscribes to the source and forwards a transformed/filtered version of what it receives.",
    ],
    orderIndex: 1165,
  },

  {
    slug: "observable-from-iterable",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Observable from()",
    description: `RxJS's \`from\`: turn a plain array (or any iterable) into an **Observable** that synchronously emits every value in order, then signals completion — a bridge between "static, already-known data" and the Observable APIs built to consume streams.

## Your task

Write \`from(iterable)\` (include a minimal \`Observable\` class in your solution). Every value in \`iterable\` should be emitted via \`observer.next()\`, in order, and \`observer.complete()\` called once all of them have been emitted — even for an empty iterable.

\`\`\`js
from([1, 2, 3]).subscribe({
  next: (v) => console.log(v),
  complete: () => console.log("done"),
});
// 1
// 2
// 3
// done
\`\`\``,
    difficulty: "medium",
    starterCode: `function from(iterable) {
}`,
    solutionCode: `class Observable {
  constructor(subscribeFn) {
    this._subscribe = subscribeFn;
  }
  subscribe(observer) {
    const cleanup = this._subscribe(observer) || (() => {});
    return { unsubscribe: cleanup };
  }
}
function from(iterable) {
  return new Observable((observer) => {
    for (const value of iterable) observer.next(value);
    if (observer.complete) observer.complete();
  });
}`,
    testCases: [
      { input: "from([1,2,3])", expected: "emits 1, 2, 3 in order", label: "Emits every value from the iterable, in order" },
      { input: "from([1,2,3]) fully consumed", expected: "observer.complete() is called afterward", label: "Calls complete() after all values are emitted" },
      { input: "from([])", expected: "no next() calls, but complete() still runs", label: "An empty iterable still completes cleanly" },
    ],
    hints: [
      "This one is synchronous end-to-end: the whole for...of loop runs inside the producer function, during the subscribe() call itself.",
    ],
    orderIndex: 1166,
  },

  {
    slug: "observable-subject",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Observable Subject",
    description: `Unlike a plain (cold) Observable, a \`Subject\` is multicast: every current subscriber receives the exact same emitted value at the same time, and it's also an observer itself — you call \`.next()\` on it directly.

## Your task

Write a \`Subject\` class with \`subscribe(observer)\` (returning \`{ unsubscribe() }\`) and \`next(value)\`. Subscribers only receive values emitted *after* they subscribe — no replay of earlier ones.

\`\`\`js
const subject = new Subject();
subject.subscribe({ next: (v) => console.log("A:", v) });
subject.next(1); // A: 1
const subB = subject.subscribe({ next: (v) => console.log("B:", v) });
subject.next(2); // A: 2   B: 2 — both current subscribers get the same value
subB.unsubscribe();
subject.next(3); // A: 3 — B already unsubscribed
\`\`\``,
    difficulty: "medium",
    starterCode: `class Subject {
  subscribe(observer) {
  }
  next(value) {
  }
}`,
    solutionCode: `class Subject {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
    return {
      unsubscribe: () => {
        this.observers = this.observers.filter((o) => o !== observer);
      },
    };
  }
  next(value) {
    this.observers.forEach((o) => o.next(value));
  }
}`,
    testCases: [
      { input: "two subscribers, then next(value)", expected: "both receive the exact same value", label: "Multicasts a value to every current subscriber" },
      { input: "next(value) called before subscribing", expected: "a later subscriber never receives that earlier value", label: "No replay of values emitted before subscribing" },
      { input: "one of two subscribers unsubscribes, then next(value)", expected: "only the remaining subscriber receives it", label: "unsubscribe() only affects that specific subscriber" },
    ],
    hints: [
      "A Subject just keeps a live list of currently-subscribed observers and forwards every next() call to all of them — no producer function, no re-running anything per subscription.",
    ],
    orderIndex: 1167,
  },


  // Stage 12 — Serialization & Data Encoding
  {
    slug: "implement-btoa",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement btoa()",
    description: `**Base64** encodes arbitrary data as printable ASCII by repacking bits: every 3 raw bytes (24 bits) become 4 base64 characters (4 × 6 bits), with \`=\` padding when the input doesn't divide evenly into groups of three. \`btoa\` is the browser's built-in encoder — this rebuilds it by hand.

## Your task

Write \`myBtoa(str)\` for ASCII input, matching the real \`btoa\`'s output exactly, including \`=\` padding: one \`=\` for a 2-byte final group, two for a 1-byte final group.

\`\`\`js
myBtoa("hello");
// "aGVsbG8=" — matches the real btoa("hello")
myBtoa("a");
// "YQ==" — a 1-byte final group needs two '=' padding characters
\`\`\``,
    difficulty: "easy",
    starterCode: `function myBtoa(str) {
}`,
    solutionCode: `function myBtoa(str) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;
  while (i < str.length) {
    const b1 = str.charCodeAt(i++);
    const b2 = i < str.length ? str.charCodeAt(i++) : NaN;
    const b3 = i < str.length ? str.charCodeAt(i++) : NaN;
    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const enc4 = isNaN(b3) ? 64 : b3 & 63;
    result += chars[enc1] + chars[enc2] + (enc3 === 64 ? "=" : chars[enc3]) + (enc4 === 64 ? "=" : chars[enc4]);
  }
  return result;
}`,
    testCases: [
      { input: '"hello"', expected: "matches the real btoa(\"hello\")", label: "Encodes a 5-character string" },
      { input: '""', expected: "matches the real btoa(\"\")", label: "An empty string encodes to an empty string" },
      { input: '"a"', expected: "matches the real btoa(\"a\")", label: "A single character needs two = padding characters" },
    ],
    hints: [
      "Process the input three bytes (24 bits) at a time, splitting those bits into four 6-bit groups, each mapped to a base64 character.",
      "When the final group has fewer than 3 bytes, pad the output with '=' characters — one for a 2-byte remainder, two for a 1-byte remainder.",
    ],
    orderIndex: 1168,
  },

  {
    slug: "implement-atob",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Implement atob()",
    description: `The inverse of \`myBtoa\`: decode a base64 string back into its original text, by hand — reversing the bit-repacking, pulling 8-bit bytes back out of a stream of 6-bit base64 characters, and ignoring any trailing \`=\` padding along the way.

## Your task

Write \`myAtob(str)\`, decoding a base64-encoded string \`str\` (as produced by the real \`btoa\`) back into its original text.

\`\`\`js
myAtob("aGVsbG8=");
// "hello" — decodes the base64 string produced by btoa("hello")
myAtob("dGVzdDEyMw==");
// "test123" — round-trips a longer alphanumeric string
\`\`\``,
    difficulty: "medium",
    starterCode: `function myAtob(str) {
}`,
    solutionCode: `function myAtob(str) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = str.replace(/=+$/, "");
  let result = "";
  let bits = 0;
  let value = 0;
  for (const ch of clean) {
    value = (value << 6) | chars.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result += String.fromCharCode((value >> bits) & 0xff);
    }
  }
  return result;
}`,
    testCases: [
      { input: "myAtob(btoa('hello'))", expected: '"hello"', label: "Round-trips through the real btoa correctly" },
      { input: "myAtob(btoa(''))", expected: '""', label: "An empty encoded string decodes to empty" },
      { input: "myAtob(btoa('test123'))", expected: '"test123"', label: "Round-trips a longer alphanumeric string" },
    ],
    hints: [
      "Each base64 character contributes 6 bits; accumulate them and pull out a full byte (8 bits) whenever you have enough.",
      "Trailing '=' padding characters carry no data — strip them before decoding.",
    ],
    orderIndex: 1169,
  },

  {
    slug: "implement-json-parse",
    companies: ["Google", "Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Implement JSON.parse()",
    description: `Under the hood, \`JSON.parse\` is a **recursive-descent parser**: it looks at the next character to decide what kind of value is coming (object, array, string, number, or literal), and recurses to handle nested structures. Building a subset of it by hand is a good way to actually understand that process instead of treating it as a black box.

## Your task

Write \`myJSONParse(str)\`, parsing a JSON string into the equivalent JS value — objects, arrays, strings, numbers, booleans, and \`null\`, including nested combinations and surrounding/internal whitespace. (Escaped characters within strings, like \`\\"\`, are out of scope for this version — assume string values don't contain them.)

\`\`\`js
myJSONParse('{"a":1,"b":[1,2,3]}');
// { a: 1, b: [1, 2, 3] }
myJSONParse('  { "x" : 42 }  ');
// { x: 42 } — surrounding and internal whitespace is handled correctly
\`\`\``,
    difficulty: "medium",
    starterCode: `function myJSONParse(str) {
}`,
    solutionCode: `function myJSONParse(str) {
  let i = 0;
  function skipWhitespace() {
    while (str[i] === " " || str[i] === "\\n" || str[i] === "\\t") i++;
  }
  function parseValue() {
    skipWhitespace();
    const ch = str[i];
    if (ch === "{") return parseObject();
    if (ch === "[") return parseArray();
    if (ch === '"') return parseString();
    if (ch === "t") {
      i += 4;
      return true;
    }
    if (ch === "f") {
      i += 5;
      return false;
    }
    if (ch === "n") {
      i += 4;
      return null;
    }
    return parseNumber();
  }
  function parseObject() {
    i++;
    const obj = {};
    skipWhitespace();
    if (str[i] === "}") {
      i++;
      return obj;
    }
    while (true) {
      skipWhitespace();
      const key = parseString();
      skipWhitespace();
      i++;
      obj[key] = parseValue();
      skipWhitespace();
      if (str[i] === ",") {
        i++;
        continue;
      }
      break;
    }
    skipWhitespace();
    i++;
    return obj;
  }
  function parseArray() {
    i++;
    const arr = [];
    skipWhitespace();
    if (str[i] === "]") {
      i++;
      return arr;
    }
    while (true) {
      arr.push(parseValue());
      skipWhitespace();
      if (str[i] === ",") {
        i++;
        continue;
      }
      break;
    }
    skipWhitespace();
    i++;
    return arr;
  }
  function parseString() {
    i++;
    const start = i;
    while (str[i] !== '"') i++;
    const result = str.slice(start, i);
    i++;
    return result;
  }
  function parseNumber() {
    const start = i;
    while (str[i] !== undefined && "-+.0123456789eE".includes(str[i])) i++;
    return Number(str.slice(start, i));
  }
  return parseValue();
}`,
    testCases: [
      { input: '\'{"a":1,"b":[1,2,3]}\'', expected: "{ a: 1, b: [1, 2, 3] }", label: "Parses a nested object with an array value" },
      { input: "'true'", expected: "true", label: "Parses a bare boolean" },
      { input: "'null'", expected: "null", label: "Parses a bare null" },
      { input: '\'  { "x" : 42 }  \'', expected: "{ x: 42 }", label: "Handles surrounding and internal whitespace" },
    ],
    hints: [
      "Recursive descent: parseValue looks at the current character to decide which specific parser (object/array/string/number/literal) to delegate to.",
      "A shared cursor index (i) threaded through every helper function is what lets them consume the string cooperatively.",
    ],
    orderIndex: 1170,
  },

  {
    slug: "serialize-non-json-types",
    companies: ["Meta", "Amazon"],
    category: "javascript-runtime",
    title: "Serialize/deserialize data types not supported in JSON",
    description: `Plain \`JSON.stringify\`/\`parse\` can't represent a \`Date\` or a \`Map\` — they either lose information or throw. A replacer/reviver pair can tag these types on the way out and reconstruct them on the way back in.

## Your task

Write \`encode(value)\` and \`decode(str)\` using \`JSON.stringify\`'s replacer and \`JSON.parse\`'s reviver, correctly round-tripping \`Date\` and \`Map\` values anywhere in the structure.

\`\`\`js
const payload = { createdAt: new Date("2024-01-01"), tags: new Map([["a", 1]]) };
const restored = decode(encode(payload));
// restored.createdAt instanceof Date === true, same getTime() as the original
// restored.tags instanceof Map === true, with the same entries — Map(1) { 'a' => 1 }
\`\`\``,
    difficulty: "medium",
    starterCode: `function encode(value) {
}
function decode(str) {
}`,
    solutionCode: `function encode(value) {
  return JSON.stringify(value, (key, val) => {
    if (val instanceof Date) return { __type: "Date", value: val.toISOString() };
    if (val instanceof Map) return { __type: "Map", value: Array.from(val.entries()) };
    return val;
  });
}
function decode(str) {
  return JSON.parse(str, (key, val) => {
    if (val && val.__type === "Date") return new Date(val.value);
    if (val && val.__type === "Map") return new Map(val.value);
    return val;
  });
}`,
    testCases: [
      { input: "a Date, round-tripped through encode/decode", expected: "an equivalent Date (same getTime())", label: "Round-trips a Date instance" },
      { input: "a Map, round-tripped through encode/decode", expected: "an equivalent Map (same entries)", label: "Round-trips a Map instance" },
      { input: "an object containing a nested Date", expected: "the nested Date round-trips too", label: "Works for types nested inside a larger structure" },
    ],
    hints: [
      "The replacer function runs on every key/value pair during stringify — tag special types with a small marker object ({ __type, value }) instead of letting JSON silently mangle them.",
      "The reviver function runs during parse, in the same shape — check for that marker and reconstruct the real instance from it.",
    ],
    orderIndex: 1171,
  },

  {
    slug: "implement-json-stringify",
    companies: ["Google", "Meta"],
    category: "javascript-runtime",
    title: "Implement JSON.stringify()",
    description: `The serialization counterpart to your JSON parser, with one detail people often miss: \`undefined\` has no representation in JSON at all — it's silently **omitted** from object keys (not written as \`"key":null\`), turned into \`null\` inside an array, and if the top-level value itself is \`undefined\`, the whole result is \`undefined\`, not the string \`"undefined"\`.

## Your task

Write \`myJSONStringify(value)\`, supporting objects, arrays, strings, numbers, booleans, and \`null\`. Only a value's own enumerable properties (not inherited ones) should be included. (Escaping special characters within strings, like quotes, is out of scope for this version.)

\`\`\`js
myJSONStringify({ a: 1, b: "hi" });
// '{"a":1,"b":"hi"}'
myJSONStringify({ a: undefined, b: 1 });
// '{"b":1}' — undefined properties are omitted entirely, not written as "a":null
myJSONStringify(undefined);
// undefined — the actual value, not the string "undefined"
\`\`\``,
    difficulty: "hard",
    starterCode: `function myJSONStringify(value) {
}`,
    solutionCode: `function myJSONStringify(value) {
  if (value === null) return "null";
  if (value === undefined) return undefined;
  const type = typeof value;
  if (type === "number" || type === "boolean") return String(value);
  if (type === "string") return '"' + value + '"';
  if (Array.isArray(value)) {
    const items = value.map((item) => {
      const encoded = myJSONStringify(item);
      return encoded === undefined ? "null" : encoded;
    });
    return "[" + items.join(",") + "]";
  }
  if (type === "object") {
    const pairs = [];
    for (const key in value) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
      const encoded = myJSONStringify(value[key]);
      if (encoded === undefined) continue;
      pairs.push('"' + key + '":' + encoded);
    }
    return "{" + pairs.join(",") + "}";
  }
  return undefined;
}`,
    testCases: [
      { input: '{ a: 1, b: "hi" }', expected: '\'{"a":1,"b":"hi"}\'', label: "Stringifies a simple object" },
      { input: "[1, 2, 3]", expected: "'[1,2,3]'", label: "Stringifies an array" },
      { input: "{ a: undefined, b: 1 }", expected: '\'{"b":1}\'', label: "Omits undefined object properties entirely, rather than writing null" },
      { input: "undefined", expected: "undefined (not a string)", label: "Top-level undefined returns actual undefined, matching the real JSON.stringify" },
    ],
    hints: [
      "undefined is the one value that has no JSON representation — inside an object it's simply dropped; inside an array it becomes null; at the top level, the whole result is undefined.",
      "for...in plus hasOwnProperty is what keeps this from also stringifying inherited/prototype properties.",
    ],
    orderIndex: 1172,
  },

  {
    slug: "implement-url-search-params",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Implement your own URLSearchParams",
    description: `A working subset of the real \`URLSearchParams\`: parse a query string into structured key/value pairs, and support reading, writing, and re-serializing it — correctly percent-encoding/decoding values along the way, and supporting duplicate keys (like \`?tag=a&tag=b\`), which a plain object can't represent cleanly.

## Your task

Write a \`MyURLSearchParams\` class: constructed from a query string (with or without a leading \`?\`), supporting \`get(key)\` (first value or \`null\`), \`getAll(key)\` (every value for that key), \`has(key)\`, \`set(key, value)\` (replaces every existing value for that key with one), \`append(key, value)\` (adds another value without removing existing ones), \`delete(key)\`, and \`toString()\` (re-serializes, percent-encoding keys and values).

\`\`\`js
const params = new MyURLSearchParams("a=1&b=2");
params.append("tag", "a");
params.append("tag", "b");
params.getAll("tag");
// ['a', 'b']
params.set("a", "new");
params.get("a");
// "new" — set() replaces every prior value for a key with a single new one

const q = new MyURLSearchParams();
q.append("q", "hello world");
q.toString();
// "q=hello%20world" — toString() percent-encodes the value
\`\`\``,
    difficulty: "hard",
    starterCode: `class MyURLSearchParams {
  constructor(init = "") {
  }
  get(key) {
  }
  getAll(key) {
  }
  has(key) {
  }
  set(key, value) {
  }
  append(key, value) {
  }
  delete(key) {
  }
  toString() {
  }
}`,
    solutionCode: `class MyURLSearchParams {
  constructor(init = "") {
    this.params = [];
    const query = init.startsWith("?") ? init.slice(1) : init;
    if (query) {
      query.split("&").forEach((pair) => {
        const [key, value = ""] = pair.split("=");
        this.params.push([decodeURIComponent(key), decodeURIComponent(value)]);
      });
    }
  }
  get(key) {
    const found = this.params.find(([k]) => k === key);
    return found ? found[1] : null;
  }
  getAll(key) {
    return this.params.filter(([k]) => k === key).map(([, v]) => v);
  }
  has(key) {
    return this.params.some(([k]) => k === key);
  }
  set(key, value) {
    this.delete(key);
    this.params.push([key, value]);
  }
  append(key, value) {
    this.params.push([key, value]);
  }
  delete(key) {
    this.params = this.params.filter(([k]) => k !== key);
  }
  toString() {
    return this.params.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
  }
}`,
    testCases: [
      { input: "new MyURLSearchParams('a=1&b=2').get('a')", expected: '"1"', label: "Parses an initial query string" },
      { input: "append('tag','a'); append('tag','b'); getAll('tag')", expected: "['a','b']", label: "append() supports multiple values for the same key" },
      { input: "set('a','new')", expected: "replaces every prior value for 'a' with a single new one", label: "set() replaces rather than adds" },
      { input: "toString() with a space in a value", expected: "the space is percent-encoded", label: "toString() correctly URL-encodes the output" },
    ],
    hints: [
      "Storing entries as an array of [key, value] pairs (rather than a plain object) is what naturally supports duplicate keys for getAll()/append().",
      "set() is really just delete() followed by a single append() — reuse them.",
    ],
    orderIndex: 1173,
  },


  // Stage 13 — Virtual DOM, JSX & Rendering Internals
  {
    slug: "vdom-create-element-basics",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Virtual DOM II — createElement",
    description: `The foundational function every **virtual-DOM** library (React, Preact, Vue) builds on: turn a type, some props, and a list of children into a plain object description of an element — a **"vnode"** — that a renderer can later turn into real DOM.

## The problem

Directly creating and mutating real DOM nodes for every UI update is slow and verbose. Frameworks instead describe the desired UI as cheap, plain JavaScript objects first, and only touch the actual DOM once, after figuring out the minimal set of changes needed.

## The idea

\`createElement\` is the constructor for that plain object. This is exactly the shape JSX compiles down to under the hood — \`<button>Save</button>\` becomes \`createElement("button", null, "Save")\`. Its only real job is normalizing the trailing \`...children\` arguments into one consistent shape.

## Your task

Write \`createElement(type, props, ...children)\`, returning \`{ type, props: { ...props, children } }\`. No children should produce an empty array; exactly one child should be stored directly (not wrapped in an array); more than one should be stored as an array.

\`\`\`js
createElement("div", null);
// { type: 'div', props: { children: [] } }
createElement("button", { className: "a" }, "Save");
// { type: 'button', props: { className: 'a', children: 'Save' } } — a single child is stored directly, not wrapped
createElement("ul", null, "a", "b");
// { type: 'ul', props: { children: ['a', 'b'] } }
\`\`\``,
    difficulty: "easy",
    starterCode: `function createElement(type, props, ...children) {
}`,
    solutionCode: `function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.length === 0 ? [] : children.length === 1 ? children[0] : children,
    },
  };
}`,
    testCases: [
      { input: "createElement('div', null)", expected: "{ type: 'div', props: { children: [] } }", label: "No children folds to an empty array" },
      { input: "createElement('button', { className: 'a' }, 'Save')", expected: "children stored directly, not wrapped in an array", label: "A single child is stored directly" },
      { input: "createElement('ul', null, 'a', 'b')", expected: "{ children: ['a', 'b'] }", label: "Multiple children are stored as an array" },
    ],
    hints: [
      "This is exactly the shape JSX compiles down to under the hood — every JSX element you write becomes a call like this one.",
    ],
    orderIndex: 1174,
  },

  {
    slug: "lit-html-tagged-template",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "lit-html — tagged templates",
    description: `lit-html's core trick: a **tagged template literal** keeps the static HTML strings separate from the dynamic values, instead of naively concatenating everything into one unsafe string.

## Your task

Write \`html\`\` \`\` (a tag function returning \`{ strings, values }\`) and \`render(template)\`, which joins them back into a final string — HTML-escaping every interpolated value along the way, so a value can never inject unintended markup.

\`\`\`js
render(html\`<p>\${'Ada'}</p>\`);
// '<p>Ada</p>'
render(html\`<p>\${'<script>bad</script>'}</p>\`);
// '<p>&lt;script&gt;bad&lt;/script&gt;</p>' — interpolated values are HTML-escaped, never injected as raw markup
\`\`\``,
    difficulty: "easy",
    starterCode: `function html(strings, ...values) {
}
function render(template) {
}`,
    solutionCode: `function html(strings, ...values) {
  return { strings, values };
}
function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}
function render(template) {
  return template.strings.reduce(
    (acc, str, i) => acc + str + (i < template.values.length ? escapeHtml(template.values[i]) : ""),
    "",
  );
}`,
    testCases: [
      { input: "render(html`<p>${'Ada'}</p>`)", expected: "'<p>Ada</p>'", label: "Interpolates a plain value correctly" },
      { input: "render(html`<p>${'<script>bad</script>'}</p>`)", expected: "the value is HTML-escaped, not injected as markup", label: "Interpolated values are escaped for safety" },
      { input: "render(html`${'a'}-${'b'}`)", expected: "'a-b'", label: "Multiple interpolations all get inserted" },
    ],
    hints: [
      "html`` doesn't do any string work itself — it just captures the strings/values split that JS gives every tagged template call for free.",
      "escapeHtml is what stands between this and being a straightforward XSS vector — never skip it when interpolating untrusted values into HTML.",
    ],
    orderIndex: 1175,
  },

  {
    slug: "vdom-functional-component",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Virtual DOM III — Functional Component",
    description: `A **functional component** is just a function that returns a vnode. Rendering one means calling it and recursively resolving whatever it returns — which might itself be another functional component — down to plain host elements like \`"div"\`.

## The problem

A vnode tree built with \`createElement\` can have \`type\` be either a string (\`"div"\`, a real DOM tag) or a function (a component). Before that tree can actually become DOM, every component call has to be resolved down to plain elements — recursively, since a component can return another component.

## The idea

Check \`typeof vnode.type\`: if it's a function, call it with \`vnode.props\` to get its rendered output, then recurse on that output. If it's already a plain element, leave it as an element and just recurse into its children instead.

## Your task

Write \`renderComponent(vnode)\`, resolving \`vnode.type\` when it's a function (a component) down to a plain-element vnode, calling it with \`vnode.props\` and recursing on the result. Plain-element vnodes pass through as-is, with their children recursively processed the same way.

\`\`\`js
function Greeting(props) {
  return { type: "span", props: { children: "Hi " + props.name } };
}
renderComponent({ type: Greeting, props: { name: "Ada" } });
// { type: 'span', props: { children: 'Hi Ada' } } — the component function is resolved down to a plain element
\`\`\``,
    difficulty: "easy",
    starterCode: `function renderComponent(vnode) {
}`,
    solutionCode: `function renderComponent(vnode) {
  if (typeof vnode !== "object" || vnode === null) return vnode;
  if (typeof vnode.type === "function") {
    return renderComponent(vnode.type(vnode.props));
  }
  return {
    type: vnode.type,
    props: {
      ...vnode.props,
      children: Array.isArray(vnode.props.children)
        ? vnode.props.children.map(renderComponent)
        : renderComponent(vnode.props.children),
    },
  };
}`,
    testCases: [
      { input: "a vnode whose type is a component function", expected: "resolves to that component's rendered output", label: "Resolves a single functional component" },
      { input: "a component that itself returns another component's vnode", expected: "fully resolves all the way down to a plain element", label: "Recursively resolves nested functional components" },
      { input: "a plain element vnode with element children", expected: "passes through with children still recursively processed", label: "Plain elements are left as elements, children processed too" },
    ],
    hints: [
      "typeof vnode.type === 'function' is the entire test for 'is this a component' — everything else is a plain host element like 'div'.",
      "Calling vnode.type(vnode.props) is literally what invoking a functional component means.",
    ],
    orderIndex: 1176,
  },

  {
    slug: "implement-classnames-util",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement classNames()",
    description: `The ubiquitous \`classnames\`/\`clsx\` utility that shows up in nearly every React codebase: combine plain strings, conditional \`{ className: boolean }\` objects, and arrays of either — nested to any depth — into a single space-separated class string, silently dropping anything falsy along the way.

## Your task

Write \`classNames(...args)\`, accepting any mix of strings, objects (include a key only if its value is truthy), arrays (flattened recursively, following the same rules), and falsy values (skipped entirely — \`null\`, \`undefined\`, \`false\`, \`0\`, \`''\`). Return the combined class names joined by a single space.

\`\`\`js
classNames("btn", { active: true, disabled: false }, ["extra", null]);
// "btn active extra" — the truthy "active" key is included, "disabled" and the null entry are skipped
\`\`\``,
    difficulty: "medium",
    starterCode: `function classNames(...args) {
}`,
    solutionCode: `function classNames(...args) {
  const classes = [];
  args.forEach((arg) => {
    if (!arg) return;
    if (typeof arg === "string") {
      classes.push(arg);
      return;
    }
    if (Array.isArray(arg)) {
      classes.push(classNames(...arg));
      return;
    }
    if (typeof arg === "object") {
      Object.keys(arg).forEach((key) => {
        if (arg[key]) classes.push(key);
      });
    }
  });
  return classes.filter(Boolean).join(" ");
}`,
    testCases: [
      { input: "classNames('a', 'b')", expected: '"a b"', label: "Joins plain string arguments" },
      { input: "classNames('a', { b: true, c: false })", expected: '"a b"', label: "Only truthy keys from an object argument are included" },
      { input: "classNames('a', null, undefined, false, 'b')", expected: '"a b"', label: "Falsy arguments of any type are skipped" },
    ],
    hints: [
      "Handle each argument type (string, object, array, falsy) with its own branch — arrays can just recurse back into classNames itself.",
    ],
    orderIndex: 1177,
  },

  {
    slug: "uglify-css-class-names",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Uglify CSS class names",
    description: `The kind of minification **CSS Modules** does in production: replace long, readable class names like \`.card-header-title\` with short generated ones to shrink bundle size — consistently, so the same original name always maps to the same short one everywhere it's used.

## Your task

Write \`createClassNameUglifier()\`, returning a function that maps a class name to a short one: \`"a"\`, \`"b"\`, ..., \`"z"\`, \`"aa"\`, \`"ab"\`, ... in the order new names are first seen, reusing the same short name on every repeat call for a given original name.

\`\`\`js
const uglify = createClassNameUglifier();
uglify("card-header-title");
// "a" — the first distinct name seen gets the shortest code
uglify("card-body");
// "b"
uglify("card-header-title");
// "a" — a repeat call for the same original name returns the same short name
\`\`\``,
    difficulty: "medium",
    starterCode: `function createClassNameUglifier() {
}`,
    solutionCode: `function createClassNameUglifier() {
  const map = new Map();
  let counter = 0;
  function toShortName(n) {
    let name = "";
    n++;
    while (n > 0) {
      n--;
      name = String.fromCharCode(97 + (n % 26)) + name;
      n = Math.floor(n / 26);
    }
    return name;
  }
  return function uglify(className) {
    if (!map.has(className)) {
      map.set(className, toShortName(counter++));
    }
    return map.get(className);
  };
}`,
    testCases: [
      { input: "the first two distinct class names uglified", expected: '"a", then "b"', label: "Assigns short names in first-seen order, starting from 'a'" },
      { input: "the same class name uglified twice", expected: "the exact same short name both times", label: "Repeated calls with the same name are consistent" },
      { input: "the 27th distinct class name", expected: '"aa"', label: "Rolls over to two letters after exhausting a-z" },
    ],
    hints: [
      "This is bijective base-26 numbering (like spreadsheet column names A, B, ..., Z, AA, AB, ...) — not the same as plain base-26, which is why the n-- inside the loop matters.",
      "A Map from original name to assigned short name is what makes repeated lookups consistent.",
    ],
    orderIndex: 1178,
  },

  {
    slug: "vdom-diff-patch-basics",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Virtual DOM I (diff/patch basics)",
    description: `The heart of every virtual-DOM library — the algorithm people mean by "implement a virtual DOM diff/patch from scratch": compare an old vnode tree to a new one and describe the minimal change needed, rather than always tearing down and rebuilding everything.

## The problem

Re-rendering the whole real DOM subtree on every state change would be correct but painfully slow — real DOM nodes are expensive to create and expensive to touch. What's actually needed is the smallest possible instruction set: "just update this one prop" instead of "throw everything away and rebuild it."

## The idea

Diffing compares two vnodes level by level. Different element types (or a changed primitive) means nothing can be reused — the whole node has to be replaced. Same type just means walking the props to find which ones actually changed, producing a small, targeted patch instead.

## Your task

Write \`diff(oldVNode, newVNode)\`, returning one of: \`{ type: "REPLACE", vnode }\` (different element type or a changed primitive), \`{ type: "UPDATE", props }\` (same type, changed prop values), or \`{ type: "NONE" }\` (nothing changed).

\`\`\`js
diff("hello", "hello");
// { type: 'NONE' }
diff(
  { type: "div", props: { className: "a" } },
  { type: "div", props: { className: "b" } },
);
// { type: 'UPDATE', props: { className: 'b' } } — same type, only the changed prop is reported
diff({ type: "div", props: {} }, { type: "span", props: {} });
// { type: 'REPLACE', vnode: { type: 'span', props: {} } } — a different element type forces a full replace
\`\`\``,
    difficulty: "medium",
    starterCode: `function diff(oldVNode, newVNode) {
}`,
    solutionCode: `function diff(oldVNode, newVNode) {
  if (typeof oldVNode !== typeof newVNode || (typeof oldVNode !== "object" && oldVNode !== newVNode)) {
    return { type: "REPLACE", vnode: newVNode };
  }
  if (typeof oldVNode === "object" && typeof newVNode === "object") {
    if (oldVNode.type !== newVNode.type) return { type: "REPLACE", vnode: newVNode };
    const propPatches = {};
    const allKeys = new Set([...Object.keys(oldVNode.props || {}), ...Object.keys(newVNode.props || {})]);
    allKeys.forEach((key) => {
      if (key === "children") return;
      if (oldVNode.props[key] !== newVNode.props[key]) propPatches[key] = newVNode.props[key];
    });
    return { type: "UPDATE", props: propPatches };
  }
  return { type: "NONE" };
}`,
    testCases: [
      { input: "diff('hello', 'hello')", expected: "{ type: 'NONE' }", label: "Identical text nodes produce no patch" },
      { input: "two elements of the same type, one prop value changed", expected: "{ type: 'UPDATE', props: { that key: new value } }", label: "A changed prop produces a targeted UPDATE patch" },
      { input: "an old <div> vnode and a new <span> vnode", expected: "{ type: 'REPLACE', vnode: newVNode }", label: "A different element type forces a full REPLACE" },
    ],
    hints: [
      "Comparing element types first is what decides between a cheap prop-level UPDATE and a full REPLACE — real diffing algorithms never try to patch one element type into another.",
      "children are intentionally excluded from the prop-diff here — a real implementation would recursively diff them separately, which is out of scope for this basic version.",
    ],
    orderIndex: 1179,
  },

  {
    slug: "jsx-create-element-pragma",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Virtual DOM IV — JSX 1",
    description: `JSX transpilers call a \`createElement\`-style **pragma** function under the hood — \`<li key="a" className="x" />\` becomes a call like this one — and give \`key\`/\`ref\` special treatment: they're pulled out of props entirely rather than left as regular attributes.

## The problem

\`key\` and \`ref\` look like ordinary JSX attributes, but a component must never actually receive them as props — \`key\` is reserved for the renderer's own reconciliation bookkeeping, and \`ref\` is handled by a separate mechanism entirely. If either leaked into \`props\`, they'd risk colliding with real DOM attributes or confusing whatever renders the vnode.

## The idea

The pragma function walks the incoming config object and special-cases exactly two names: \`key\` gets pulled out onto the vnode itself (not into props), and \`ref\` is dropped outright. Every other key passes straight through into \`props\` untouched.

## Your task

Write \`jsxCreateElement(type, config, ...children)\`, returning \`{ type, key, props }\`. \`config.key\` becomes the returned \`key\` (not a prop); \`config.ref\` is dropped entirely (not a prop, not the key).

\`\`\`js
jsxCreateElement("li", { key: "a", className: "x" });
// { type: 'li', key: 'a', props: { className: 'x', children: [] } }
jsxCreateElement("input", { ref: someRef, value: "x" });
// { type: 'input', key: null, props: { value: 'x', children: [] } } — no ref key anywhere in the result
\`\`\``,
    difficulty: "medium",
    starterCode: `function jsxCreateElement(type, config, ...children) {
}`,
    solutionCode: `function jsxCreateElement(type, config, ...children) {
  const props = {};
  let key = null;
  if (config) {
    Object.keys(config).forEach((k) => {
      if (k === "key") key = config.key;
      else if (k !== "ref") props[k] = config[k];
    });
  }
  props.children = children.length === 1 ? children[0] : children;
  return { type, key, props };
}`,
    testCases: [
      { input: "jsxCreateElement('li', { key: 'a', className: 'x' })", expected: "key: 'a', props: { className: 'x', children: [] }", label: "key is pulled out of props onto the vnode itself" },
      { input: "jsxCreateElement('input', { ref: someRef, value: 'x' })", expected: "props has no ref key at all", label: "ref is dropped entirely, not even stored" },
      { input: "jsxCreateElement('p', { id: 'x' })", expected: "props.id === 'x'", label: "Regular props pass through unaffected" },
    ],
    hints: [
      "key and ref are the two prop names JSX transpilers always special-case — every other prop name passes straight through untouched.",
    ],
    orderIndex: 1180,
  },

  {
    slug: "jsx-fragment-and-flatten",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Virtual DOM V — JSX 2",
    description: `Two more real JSX behaviors: a special \`Fragment\` type for grouping children without an extra wrapper element, and automatic flattening of nested children arrays (which happens constantly with \`.map()\`-generated lists like \`<>{items.map(...)}</>\`).

## The problem

JSX sometimes needs to return multiple sibling elements without wrapping them in an extra \`<div>\` — that's what \`<>...</>\` (a Fragment) compiles to. Separately, mixing loose children with a \`.map()\`-generated list naturally produces a children array containing another array nested inside it, which downstream rendering code shouldn't have to know how to unwrap.

## The idea

\`Fragment\` doesn't need special logic in the pragma itself — it's just an ordinary marker value used as \`type\`, meaningful only to whatever renders the tree afterward. Flattening nested children is a small recursive helper: any array found among the children gets flattened one level further, until everything is one flat list.

## Your task

Write \`Fragment\` (any unique marker value) and \`jsxCreateElementV2(type, config, ...children)\`, where \`children\` is recursively flattened one structure deep into a single flat array.

\`\`\`js
jsxCreateElementV2(Fragment, null, "a", "b");
// { type: Fragment, props: { children: ['a', 'b'] } }
const rows = [1, 2].map((n) => "row" + n);
jsxCreateElementV2("ul", null, "header", rows);
// props.children === ['header', 'row1', 'row2'] — the nested array from .map() is flattened into one list
\`\`\``,
    difficulty: "medium",
    starterCode: `const Fragment = Symbol("Fragment");
function jsxCreateElementV2(type, config, ...children) {
}`,
    solutionCode: `const Fragment = Symbol("Fragment");
function flattenChildren(children) {
  return children.reduce(
    (acc, child) => acc.concat(Array.isArray(child) ? flattenChildren(child) : child),
    [],
  );
}
function jsxCreateElementV2(type, config, ...children) {
  const props = { ...config };
  delete props.key;
  props.children = flattenChildren(children);
  return { type, props };
}`,
    testCases: [
      { input: "jsxCreateElementV2(Fragment, null, 'a', 'b')", expected: "type === Fragment", label: "The Fragment marker is preserved on the vnode" },
      { input: "children built from two separate arrays (like two .map() calls)", expected: "one single flat children array", label: "Nested children arrays are flattened into one" },
      { input: "a single non-array child", expected: "still ends up inside a one-item array", label: "Children always end up in a consistent flat array shape" },
    ],
    hints: [
      "Fragment doesn't need any special logic in jsxCreateElementV2 itself — it's just an ordinary (if unusual) value for type, meaningful only to whatever renders the vnode tree afterward.",
      "flattenChildren recurses one level at a time into any array it finds among the children, concatenating everything into one flat list.",
    ],
    orderIndex: 1181,
  },

  {
    slug: "mini-react-hooks-runtime",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement a minimal useState/useEffect (React hooks internals)",
    description: `The famous "hooks are just an array" trick behind React's \`useState\`/\`useEffect\` internals: React associates each hook call with a slot based purely on **call order** within a render, which is exactly why hooks can never be called conditionally.

## The problem

A function component re-runs from top to bottom on every render, with no instance or class fields to hold onto values between renders. So how does \`useState\` "remember" its value across calls, and how does React know which \`useState\` call — if a component has several — a given piece of state belongs to?

## The idea

The runtime keeps one persistent array of hook state, and a counter that resets to 0 at the start of every render. Each hook call grabs \`hookStates[hookIndex++]\` — so as long as hooks are always called in the same order every render, "the 3rd hook call" reliably means "slot 3" every single time. \`setState\` writes into that slot and triggers a fresh render; \`useEffect\` compares this render's dependency array against the one stored from last render to decide whether to re-run.

## Your task

Write \`createHooksRuntime()\`, returning \`{ useState, useEffect, render(componentFn) }\`. State must persist across re-renders (not reset each render); calling \`setState\` must trigger an automatic re-render; \`useEffect\`'s callback should only run when its dependency array has actually changed since the last render.

\`\`\`js
const { useState, render } = createHooksRuntime();
let setCount;
function Counter() {
  const [count, setter] = useState(0);
  setCount = setter;
  console.log(count);
}
render(Counter);
// 0
setCount((c) => c + 1);
// automatically re-renders Counter, logging 1
\`\`\``,
    difficulty: "hard",
    starterCode: `function createHooksRuntime() {
}`,
    solutionCode: `function createHooksRuntime() {
  let hookStates = [];
  let hookIndex = 0;
  let currentRender = null;
  function useState(initial) {
    const i = hookIndex++;
    if (hookStates[i] === undefined) hookStates[i] = initial;
    function setState(value) {
      hookStates[i] = typeof value === "function" ? value(hookStates[i]) : value;
      runtime.render(currentRender);
    }
    return [hookStates[i], setState];
  }
  function useEffect(callback, deps) {
    const i = hookIndex++;
    const prevDeps = hookStates[i];
    const changed = !prevDeps || !deps || deps.some((d, idx) => d !== prevDeps[idx]);
    if (changed) callback();
    hookStates[i] = deps;
  }
  const runtime = {
    useState,
    useEffect,
    render(componentFn) {
      currentRender = componentFn;
      hookIndex = 0;
      return componentFn();
    },
  };
  return runtime;
}`,
    testCases: [
      { input: "state read across two separate render() calls", expected: "the same value, not reset", label: "State persists across re-renders" },
      { input: "calling setState inside a component", expected: "automatically triggers a re-render that sees the new value", label: "setState triggers a re-render with updated state" },
      { input: "useEffect with an unchanged dependency array across renders", expected: "the effect callback does not run again", label: "useEffect only re-runs when its dependencies actually change" },
    ],
    hints: [
      "hookIndex resets to 0 at the start of every render() call — that's what makes 'the Nth hook call' consistently map to 'the Nth slot in hookStates', as long as hooks are always called in the same order.",
      "Comparing the new deps array against the previous one element-by-element (not by reference) is what real React does too — that's why an inline array literal like [x, y] still works as a dependency array.",
    ],
    orderIndex: 1182,
  },

  {
    slug: "proxy-reactive-store",
    companies: ["Meta"],
    category: "javascript-runtime",
    title: "Implement a Proxy-based reactive store (Vue 3-style)",
    description: `Vue 3's reactivity system, in miniature — the mechanism behind "how does Vue know what to re-render without a virtual DOM diff": reading a reactive property inside a tracked "effect" remembers that dependency; writing to that property later automatically re-runs every effect that read it.

## The problem

Frameworks need to know exactly which parts of the UI depend on which piece of state, without the developer manually declaring a dependency list (the way a plain \`useEffect\` deps array requires). A \`Proxy\` makes this possible by intercepting every single property read and write on a reactive object.

## The idea

While an effect function is actively running, every property it *reads* gets recorded against it in a target → property → effects map (this is called **tracking**). Later, when that property is *written* to, every effect recorded against it gets re-run automatically (this is called **triggering**). A single "currently running effect" variable is what lets the \`Proxy\`'s \`get\` trap know which effect to credit a given read to.

## Your task

Write \`createReactiveSystem()\`, returning \`{ reactive(target), effect(fn) }\`. \`reactive\` wraps an object in a \`Proxy\`; \`effect\` runs \`fn\` immediately and re-runs it automatically whenever a property it read (during its own most recent run) is later written to.

\`\`\`js
const { reactive, effect } = createReactiveSystem();
const state = reactive({ count: 0 });
effect(() => console.log("count is", state.count));
// runs immediately: "count is 0"
state.count = 1;
// the effect automatically re-runs: "count is 1"
state.other = "ignored"; // never read by the effect, so it doesn't trigger a re-run
\`\`\``,
    difficulty: "hard",
    starterCode: `function createReactiveSystem() {
}`,
    solutionCode: `function createReactiveSystem() {
  let activeEffect = null;
  const targetMap = new WeakMap();
  function track(target, key) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) targetMap.set(target, (depsMap = new Map()));
    let dep = depsMap.get(key);
    if (!dep) depsMap.set(key, (dep = new Set()));
    dep.add(activeEffect);
  }
  function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key);
    if (dep) dep.forEach((fn) => fn());
  }
  function reactive(target) {
    return new Proxy(target, {
      get(obj, key) {
        track(obj, key);
        return obj[key];
      },
      set(obj, key, value) {
        obj[key] = value;
        trigger(obj, key);
        return true;
      },
    });
  }
  function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
  }
  return { reactive, effect };
}`,
    testCases: [
      { input: "an effect reading state.count, then state.count is mutated", expected: "the effect automatically re-runs", label: "Mutating a tracked property re-runs the effect that read it" },
      { input: "an effect that never reads state.other, then state.other is mutated", expected: "the effect does not re-run", label: "Mutating an untracked property doesn't trigger unrelated effects" },
      { input: "two separate effects both reading the same property", expected: "both re-run when that property changes", label: "Multiple effects can depend on and react to the same property" },
    ],
    hints: [
      "A single 'currently running effect' variable, set right before calling fn() and cleared right after, is what lets the Proxy's get trap know which effect to associate a property read with.",
      "Track dependencies as target → property → set of effect functions — that's the map trigger() walks to know exactly who to re-run on a write.",
    ],
    orderIndex: 1183,
  },


  // Stage 14 — Advanced / Capstone Problems
  {
    slug: "decode-message-ways",
    companies: ["Amazon"],
    category: "javascript-runtime",
    title: "Decode message",
    description: `A digit string was encoded by mapping \`'A'\` → \`"1"\`, \`'B'\` → \`"2"\`, ..., \`'Z'\` → \`"26"\`. Count how many distinct ways it could be decoded back into letters — a classic dynamic-programming problem, since each position can extend either a 1-digit or a 2-digit decoding from just before it, Fibonacci-style.

## Your task

Write \`countDecodeWays(s)\`. A leading \`"0"\` (or any digit group that doesn't form a valid 1-26 letter code) makes that path invalid.

\`\`\`js
countDecodeWays("12");
// 2 — "AB" (1, 2) or "L" (12)
countDecodeWays("226");
// 3 — "BZ", "VF", or "BBF"
countDecodeWays("06");
// 0 — a leading zero can never start a valid letter code
\`\`\``,
    difficulty: "medium",
    starterCode: `function countDecodeWays(s) {
}`,
    solutionCode: `function countDecodeWays(s) {
  if (s[0] === "0") return 0;
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    const oneDigit = Number(s.slice(i - 1, i));
    const twoDigit = Number(s.slice(i - 2, i));
    if (oneDigit >= 1) dp[i] += dp[i - 1];
    if (twoDigit >= 10 && twoDigit <= 26) dp[i] += dp[i - 2];
  }
  return dp[n];
}`,
    testCases: [
      { input: '"12"', expected: "2", label: "'AB' (1,2) or 'L' (12) — two valid decodings" },
      { input: '"226"', expected: "3", label: "'BZ', 'VF', or 'BBF' — three valid decodings" },
      { input: '"06"', expected: "0", label: "A leading zero can never start a valid letter code" },
    ],
    hints: [
      "This is a Fibonacci-shaped dynamic program: the number of ways to decode the first i characters depends on whether the last 1 or last 2 characters form a valid code.",
      "dp[i] += dp[i-1] when the single last digit is valid (1-9); dp[i] += dp[i-2] when the last two digits form a valid code (10-26) — both can apply at once.",
    ],
    orderIndex: 1184,
  },

  {
    slug: "build-expression-tokenizer",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "Create a tokenizer",
    description: `Before an expression can be parsed or evaluated, it first has to be broken into meaningful pieces — numbers, operators, and parentheses — ignoring whitespace entirely. This **lexing** stage is the first step of any real calculator or parser, turning a raw string into a clean list of tokens the next stage can consume without worrying about spacing or multi-digit numbers.

## Your task

Write \`tokenize(expr)\`, returning an array of string tokens.

\`\`\`js
tokenize("(1 + 2) * 3");
// ['(', '1', '+', '2', ')', '*', '3'] — whitespace is skipped, each symbol is its own token
tokenize("3.5-1");
// ['3.5', '-', '1'] — a multi-character decimal number stays a single token
\`\`\``,
    difficulty: "medium",
    starterCode: `function tokenize(expr) {
}`,
    solutionCode: `function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const start = i;
      while (i < expr.length && /[0-9.]/.test(expr[i])) i++;
      tokens.push(expr.slice(start, i));
      continue;
    }
    throw new Error("Unexpected character: " + ch);
  }
  return tokens;
}`,
    testCases: [
      { input: '"12+3"', expected: "['12', '+', '3']", label: "Splits numbers and an operator" },
      { input: '"(1 + 2) * 3"', expected: "['(', '1', '+', '2', ')', '*', '3']", label: "Handles parentheses and ignores whitespace" },
      { input: '"3.5-1"', expected: "['3.5', '-', '1']", label: "Keeps a decimal number as a single token" },
    ],
    hints: [
      "Multi-character numbers need their own inner loop that keeps consuming digits (and a decimal point) until it hits something that isn't part of the number.",
    ],
    orderIndex: 1185,
  },

  {
    slug: "evaluate-arithmetic-expression",
    companies: ["Google", "Amazon", "Bloomberg"],
    category: "javascript-runtime",
    title: "Calculate an arithmetic expression",
    description: `Building a real expression evaluator — like the engine behind a calculator app or a spreadsheet formula bar — comes down to respecting **operator precedence**: \`2 + 3 * 4\` must evaluate to \`14\`, not \`20\`, and parentheses should be able to override that precedence entirely. A small recursive-descent parser, structured as one function per precedence level, handles this naturally without an explicit precedence table.

## Your task

Write \`evaluateExpression(str)\`, evaluating a string expression made of non-negative numbers, \`+\`, \`-\`, \`*\`, \`/\`, and parentheses, and returning the numeric result with correct precedence (\`*\`/\`/\` bind tighter than \`+\`/\`-\`) and left-to-right evaluation within the same precedence level.

\`\`\`js
evaluateExpression("2+3*4");
// 14 — multiplication happens before addition
evaluateExpression("(2+3)*4");
// 20 — parentheses override normal precedence
\`\`\``,
    difficulty: "medium",
    starterCode: `function evaluateExpression(str) {
}`,
    solutionCode: `function evaluateExpression(str) {
  const tokens = str.match(/\\d+\\.?\\d*|[+\\-*/()]/g);
  let i = 0;
  function parseExpr() {
    let value = parseTerm();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }
  function parseTerm() {
    let value = parseFactor();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const rhs = parseFactor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }
  function parseFactor() {
    if (tokens[i] === "(") {
      i++;
      const value = parseExpr();
      i++;
      return value;
    }
    return Number(tokens[i++]);
  }
  return parseExpr();
}`,
    testCases: [
      { input: '"2+3*4"', expected: "14", label: "Multiplication happens before addition" },
      { input: '"(2+3)*4"', expected: "20", label: "Parentheses override normal precedence" },
      { input: '"10/2-1"', expected: "4", label: "Left-to-right evaluation within the same precedence level" },
    ],
    hints: [
      "Three mutually-recursive functions, one per precedence level (expression → term → factor), is the classic recursive-descent structure — parentheses just recurse back to the top level.",
      "parseTerm (handling * and /) is called from inside parseExpr, which is what naturally makes multiplication bind tighter than addition — no explicit precedence table needed.",
    ],
    orderIndex: 1186,
  },

  {
    slug: "css-grid-autoplace-dense",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "CSS Grid Layout auto-placement algorithm — dense",
    description: `Simulate CSS Grid's \`grid-auto-flow: row dense\` packing algorithm: place items left-to-right, top-to-bottom, but let a later, smaller item fill any gap left behind by an earlier item that couldn't fit — even if that gap is in an earlier row. It's what keeps a masonry-style grid free of empty holes, at the cost of visually reordering items away from their source order.

## Your task

Write \`placeItemsDense(items, columns)\`, where each item may have a \`span\` (default 1). Return each item with its assigned \`col\`/\`row\` (1-indexed).

\`\`\`js
placeItemsDense(
  [{ id: "a", span: 3 }, { id: "b", span: 2 }, { id: "c", span: 1 }],
  4,
);
// a → col 1, row 1 (spans columns 1-3)
// b → col 1, row 2 (the 1-column gap left in row 1 isn't wide enough for a span-2 item)
// c → col 4, row 1 — dense packing fills that leftover gap instead of only placing forward
\`\`\``,
    difficulty: "medium",
    starterCode: `function placeItemsDense(items, columns) {
}`,
    solutionCode: `function placeItemsDense(items, columns) {
  const occupied = new Set();
  function isFree(col, row, span) {
    for (let c = col; c < col + span; c++) {
      if (c > columns) return false;
      if (occupied.has(row + "," + c)) return false;
    }
    return true;
  }
  function occupy(col, row, span) {
    for (let c = col; c < col + span; c++) occupied.add(row + "," + c);
  }
  const placements = [];
  items.forEach((item) => {
    const span = item.span || 1;
    let row = 1;
    let placed = false;
    while (!placed) {
      for (let col = 1; col <= columns - span + 1; col++) {
        if (isFree(col, row, span)) {
          occupy(col, row, span);
          placements.push({ ...item, col, row });
          placed = true;
          break;
        }
      }
      if (!placed) row++;
    }
  });
  return placements;
}`,
    testCases: [
      { input: "4 single-column items, columns: 3", expected: "the 4th item wraps to row 2, col 1", label: "Wraps to a new row once the current one is full" },
      { input: "a span-3 item, a span-2 item, then a span-1 item, columns: 4", expected: "the span-1 item fills the 1-column gap left in row 1, at col 4", label: "Dense packing fills an earlier gap instead of only placing forward" },
      { input: "a span-3 item followed by a span-2 item, columns: 4", expected: "the span-2 item wraps entirely to row 2", label: "A spanning item that doesn't fit the remaining row wraps" },
    ],
    hints: [
      "For every item, scan from row 1, column 1 forward, looking for the first position with enough free consecutive columns for its span — that unconditional 'search from the start' behavior is exactly what makes it dense.",
    ],
    orderIndex: 1187,
  },

  {
    slug: "css-grid-autoplace-sparse",
    companies: ["Google"],
    category: "javascript-runtime",
    title: "CSS Grid Layout auto-placement algorithm — sparse",
    description: `The default (non-dense) CSS Grid behavior: an auto-placement cursor only ever moves forward — it never backtracks to fill a gap left behind in an earlier row, even if a later item would fit there perfectly.

## Your task

Write \`placeItemsSparse(items, columns)\`, with the same signature and return shape as the dense version, but using a forward-only cursor instead of a full re-scan for every item.

\`\`\`js
placeItemsSparse(
  [{ id: "a", span: 3 }, { id: "b", span: 2 }, { id: "c", span: 1 }],
  4,
);
// a → col 1, row 1 (spans columns 1-3)
// b → col 1, row 2 (doesn't fit the remaining 1 column in row 1, so it wraps)
// c → col 3, row 2 — the forward-only cursor continues from where b left off, never backtracking to row 1's leftover gap
\`\`\``,
    difficulty: "hard",
    starterCode: `function placeItemsSparse(items, columns) {
}`,
    solutionCode: `function placeItemsSparse(items, columns) {
  const occupied = new Set();
  let cursorCol = 1;
  let cursorRow = 1;
  function isFree(col, row, span) {
    for (let c = col; c < col + span; c++) {
      if (c > columns) return false;
      if (occupied.has(row + "," + c)) return false;
    }
    return true;
  }
  function occupy(col, row, span) {
    for (let c = col; c < col + span; c++) occupied.add(row + "," + c);
  }
  const placements = [];
  items.forEach((item) => {
    const span = item.span || 1;
    while (true) {
      if (cursorCol + span - 1 > columns) {
        cursorCol = 1;
        cursorRow++;
        continue;
      }
      if (isFree(cursorCol, cursorRow, span)) {
        occupy(cursorCol, cursorRow, span);
        placements.push({ ...item, col: cursorCol, row: cursorRow });
        cursorCol += span;
        break;
      }
      cursorCol++;
    }
  });
  return placements;
}`,
    testCases: [
      { input: "4 single-column items, columns: 3", expected: "the 4th item wraps to row 2, col 1", label: "Behaves the same as dense packing for the simple wrapping case" },
      { input: "a span-3 item, a span-2 item, then a span-1 item, columns: 4 (same input as the dense version)", expected: "the span-1 item continues forward to row 2, col 3 — never checking row 1's leftover gap", label: "Never backtracks to fill an earlier row's gap, unlike dense packing" },
      { input: "a span-3 item followed by a span-2 item, columns: 4", expected: "the span-2 item wraps entirely to row 2", label: "A spanning item that doesn't fit the remaining row still wraps" },
    ],
    hints: [
      "A single (col, row) cursor that only ever advances — never resets except when wrapping to the very next row — is the entire behavioral difference from the dense version's full re-scan.",
      "Run this against the exact same input as the dense algorithm's gap-filling test to see the two placement strategies genuinely diverge on the third item's position.",
    ],
    orderIndex: 1188,
  },

  {
    slug: "token-bucket-rate-limiter",
    companies: ["Uber", "Stripe", "Bloomberg"],
    category: "javascript-runtime",
    title: "Implement a rate limiter (token bucket algorithm)",
    description: `The **token bucket algorithm** — the same rate-limiting strategy used by APIs like Stripe's: a bucket holds up to \`capacity\` tokens, refilling continuously over time; each request consumes a token if one's available, and is rejected otherwise — allowing bursts up to capacity while capping the sustained rate.

## Your task

Write \`createRateLimiter(capacity, refillRatePerSecond)\`, returning \`{ tryConsume(cost = 1) }\`, which returns \`true\`/\`false\` for whether the request was allowed.

\`\`\`js
const limiter = createRateLimiter(2, 1); // capacity 2, refills 1 token/second
limiter.tryConsume(); // true
limiter.tryConsume(); // true
limiter.tryConsume(); // false — the bucket is empty
// ...after waiting roughly a second for a refill...
limiter.tryConsume(); // true again
\`\`\``,
    difficulty: "hard",
    starterCode: `function createRateLimiter(capacity, refillRatePerSecond) {
}`,
    solutionCode: `function createRateLimiter(capacity, refillRatePerSecond) {
  let tokens = capacity;
  let lastRefill = Date.now();
  function refill() {
    const now = Date.now();
    const elapsedSeconds = (now - lastRefill) / 1000;
    tokens = Math.min(capacity, tokens + elapsedSeconds * refillRatePerSecond);
    lastRefill = now;
  }
  return {
    tryConsume(cost = 1) {
      refill();
      if (tokens >= cost) {
        tokens -= cost;
        return true;
      }
      return false;
    },
  };
}`,
    testCases: [
      { input: "capacity 2, consumed twice then a third time", expected: "true, true, then false", label: "Rejects once the bucket is empty" },
      { input: "capacity 1, exhausted, then waited long enough to refill", expected: "a later request succeeds again", label: "Tokens refill continuously over real time" },
      { input: "a rejected request, checked again immediately with refillRate 0", expected: "still rejected — no partial or accidental token grant", label: "A rejected request never consumes (or otherwise disturbs) the token count" },
    ],
    hints: [
      "Lazily refill on every tryConsume call, based on elapsed real time since the last refill, rather than running a background timer — that's what keeps this simple and precise.",
      "A rejected request should return early without touching the token count at all — only a successful consumption decrements it.",
    ],
    orderIndex: 1189,
  }
];

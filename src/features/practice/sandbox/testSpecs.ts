import type { SandboxTest } from "@/lib/sandbox";

// Executable assertions per challenge slug. These are the *real* tests Run Tests
// checks against — the DB `test_cases` are display labels only. Each test's
// `label` matches the corresponding seeded `test_cases[].label` 1:1 so the
// results panel can pair the spec row with its outcome.
//
// Every test runs as an async function body inside the sandbox with the user's
// top-level declaration in global scope (e.g. `debounce`), plus the injected
// `assert` / `assertEqual` / `delay` helpers (see buildSandboxDoc.ts).

const DEBOUNCE_TESTS: SandboxTest[] = [
  {
    label: "Coalesces rapid calls",
    source: `
      assert(typeof debounce === "function", "debounce is not defined");
      let calls = 0;
      const fn = debounce(() => { calls++; }, 30);
      fn(); fn(); fn();
      await delay(70);
      assertEqual(calls, 1, "three rapid calls should invoke fn exactly once");
    `,
  },
  {
    label: "Cancel prevents invocation",
    source: `
      let calls = 0;
      const fn = debounce(() => { calls++; }, 30);
      fn();
      assert(typeof fn.cancel === "function", "the debounced function must expose .cancel()");
      fn.cancel();
      await delay(70);
      assertEqual(calls, 0, "cancel() before the delay should stop fn from running");
    `,
  },
  {
    label: "Fires after full delay",
    source: `
      let calls = 0;
      const fn = debounce(() => { calls++; }, 30);
      fn();
      await delay(15);
      assertEqual(calls, 0, "fn should not run before the delay elapses");
      await delay(45);
      assertEqual(calls, 1, "fn should run once the full delay has elapsed");
    `,
  },
];

const SPECIFICITY_TESTS: SandboxTest[] = [
  {
    label: "ID selector",
    source: `
      assert(typeof specificity === "function", "specificity is not defined");
      assertEqual(specificity("#cta"), [1, 0, 0]);
    `,
  },
  {
    label: "Two class selectors",
    source: `assertEqual(specificity(".btn.primary"), [0, 2, 0]);`,
  },
  {
    label: "Mixed selector",
    source: `assertEqual(specificity("button#cta.btn"), [1, 1, 1]);`,
  },
  {
    label: "Attribute selector",
    source: `assertEqual(specificity("[type='text']"), [0, 1, 0]);`,
  },
];

const VIRTUAL_LIST_TESTS: SandboxTest[] = [
  {
    label: "Initial window from the top",
    source: `
      assert(typeof visibleRange === "function", "visibleRange is not defined");
      assertEqual(visibleRange(0, 40, 400, 10000, 3), { start: 0, end: 13 });
    `,
  },
  {
    label: "Windowed mid-scroll with overscan",
    source: `assertEqual(visibleRange(4000, 40, 400, 10000, 3), { start: 97, end: 113 });`,
  },
  {
    label: "Clamps at the end of the list",
    source: `assertEqual(visibleRange(399600, 40, 400, 10000, 3), { start: 9987, end: 9999 });`,
  },
  {
    label: "Window stays tiny for 10,000 rows",
    source: `
      for (let s = 0; s <= 399600; s += 4000) {
        const range = visibleRange(s, 40, 400, 10000, 3);
        assert(
          range.end - range.start < 20,
          "window rendered " + (range.end - range.start + 1) + " rows at scrollTop " + s
        );
      }
    `,
  },
];

const CLASSIFY_HOISTING_ACCESS_TESTS: SandboxTest[] = [
  {
    label: "let/const before declaration throws inside the TDZ",
    source: `
      assert(typeof classifyAccess === "function", "classifyAccess is not defined");
      assertEqual(
        classifyAccess(function () { const r = y; let y = 1; return r; }),
        "tdz",
      );
    `,
  },
  {
    label: "var is hoisted and pre-initialized to undefined",
    source: `
      assertEqual(
        classifyAccess(function () { const r = x; var x = 1; return r; }),
        "hoisted-undefined",
      );
    `,
  },
  {
    label: "A normal read after assignment returns the real value",
    source: `
      assertEqual(
        classifyAccess(function () { let z = 5; return z; }),
        "value",
      );
    `,
  },
];

const IMPLEMENT_LOOSE_EQUALS_TESTS: SandboxTest[] = [
  {
    label: "false coerces to 0",
    source: `
      assert(typeof looseEquals === "function", "looseEquals is not defined");
      assertEqual(looseEquals(0, false), true);
    `,
  },
  {
    label: "'' and false both coerce to 0",
    source: `assertEqual(looseEquals("", false), true);`,
  },
  {
    label: "null and undefined are loosely equal to each other",
    source: `assertEqual(looseEquals(null, undefined), true);`,
  },
  {
    label: "null is not loosely equal to anything except undefined",
    source: `assertEqual(looseEquals(null, 0), false);`,
  },
  {
    label: "Numeric string coerces to a number",
    source: `assertEqual(looseEquals(1, "1"), true);`,
  },
];

const IMPLEMENT_ONCE_TESTS: SandboxTest[] = [
  {
    label: "Only the first call runs the real function",
    source: `
      assert(typeof once === "function", "once is not defined");
      let calls = 0;
      const fn = once(function () { calls++; return "ready"; });
      fn(); fn(); fn();
      assertEqual(calls, 1, "the wrapped function should only run once");
    `,
  },
  {
    label: "Later calls return the cached value, not a fresh one",
    source: `
      let n = 0;
      const fn = once(function () { n++; return n; });
      const first = fn();
      const second = fn();
      assertEqual(second, first, "later calls must return the first call's cached result");
    `,
  },
  {
    label: "Arguments and this are forwarded on the first call",
    source: `
      const obj = {};
      let capturedThis, capturedArg;
      obj.method = once(function (arg) { capturedThis = this; capturedArg = arg; return arg; });
      obj.method(7);
      assertEqual(capturedArg, 7);
      assert(capturedThis === obj, "this should be forwarded from the first call");
    `,
  },
];

const IMPLEMENT_MY_MAP_TESTS: SandboxTest[] = [
  {
    label: "Transforms every item",
    source: `
      assert(typeof myMap === "function", "myMap is not defined");
      assertEqual(myMap([1, 2, 3], function (n) { return n * 2; }), [2, 4, 6]);
    `,
  },
  {
    label: "Passes index as the callback's second argument",
    source: `
      assertEqual(myMap(["a", "b"], function (v, i) { return i + ":" + v; }), ["0:a", "1:b"]);
    `,
  },
  {
    label: "Does not mutate the input array",
    source: `
      const arr = [1, 2, 3];
      myMap(arr, function (n) { return n * 2; });
      assertEqual(arr, [1, 2, 3], "the original array must be unchanged");
    `,
  },
];

const IMPLEMENT_UPDATE_ITEM_TESTS: SandboxTest[] = [
  {
    label: "Merges changes into the matching item",
    source: `
      assert(typeof updateItem === "function", "updateItem is not defined");
      assertEqual(
        updateItem([{ id: 1, done: false }, { id: 2, done: false }], 1, { done: true }),
        [{ id: 1, done: true }, { id: 2, done: false }],
      );
    `,
  },
  {
    label: "Untouched items keep the exact same reference",
    source: `
      const items = [{ id: 1, done: false }, { id: 2, done: false }];
      const result = updateItem(items, 1, { done: true });
      assert(result[1] === items[1], "the untouched item must be the exact same reference");
    `,
  },
  {
    label: "Does not mutate the input array or any item",
    source: `
      const items = [{ id: 1, done: false }];
      const snapshot = JSON.parse(JSON.stringify(items));
      updateItem(items, 1, { done: true });
      assertEqual(items, snapshot, "the original items array and its objects must be unchanged");
    `,
  },
];

const IMPLEMENT_MY_BIND_TESTS: SandboxTest[] = [
  {
    label: "this stays locked to context no matter how the bound function is called",
    source: `
      assert(typeof myBind === "function", "myBind is not defined");
      function getThis() { return this; }
      const ctx = { id: 1 };
      const bound = myBind(getThis, ctx);
      const bare = bound;
      assert(bare() === ctx, "this should still be ctx even called as a bare reference");
    `,
  },
  {
    label: "Preset arguments are prepended before call-time arguments",
    source: `
      function greet(greeting, punctuation) { return greeting + ", " + this.name + punctuation; }
      const boundGreet = myBind(greet, { name: "Ada" }, "Hello");
      assertEqual(boundGreet("!"), "Hello, Ada!");
    `,
  },
  {
    label: "Bound this cannot be overridden by a later method-style call",
    source: `
      function getThis() { return this; }
      const ctx = { id: 2 };
      const boundFn = myBind(getThis, ctx);
      const wrapper = { method: boundFn };
      assert(wrapper.method() === ctx, "calling as wrapper.method() must not override the bound this");
    `,
  },
];

const IMPLEMENT_INHERIT_TESTS: SandboxTest[] = [
  {
    label: "Inherited methods are reachable through the prototype chain",
    source: `
      assert(typeof inherit === "function", "inherit is not defined");
      function Animal(name) { this.name = name; }
      Animal.prototype.speak = function () { return this.name + " makes a sound."; };
      function Dog(name) { Animal.call(this, name); }
      inherit(Dog, Animal);
      const d = new Dog("Rex");
      assertEqual(d.speak(), "Rex makes a sound.");
      globalThis.__Animal = Animal;
      globalThis.__Dog = Dog;
    `,
  },
  {
    label: "Child's own prototype methods take priority",
    source: `
      const Dog = globalThis.__Dog;
      Dog.prototype.speak = function () { return this.name + " barks."; };
      const d = new Dog("Rex");
      assertEqual(d.speak(), "Rex barks.");
    `,
  },
  {
    label: "instanceof recognizes the prototype chain",
    source: `
      const Dog = globalThis.__Dog;
      const Animal = globalThis.__Animal;
      assert(new Dog("Rex") instanceof Animal, "Dog instances must be recognized as Animal instances");
    `,
  },
];

const PREDICT_EXECUTION_ORDER_TESTS: SandboxTest[] = [
  {
    label: "Reorders by type while preserving relative order within each type",
    source: `
      assert(typeof predictOrder === "function", "predictOrder is not defined");
      assertEqual(
        predictOrder([
          { id: "a", type: "macrotask" },
          { id: "b", type: "sync" },
          { id: "c", type: "microtask" },
          { id: "d", type: "sync" },
        ]),
        ["b", "d", "c", "a"],
      );
    `,
  },
  {
    label: "Handles a missing category gracefully",
    source: `
      assertEqual(
        predictOrder([
          { id: "x", type: "microtask" },
          { id: "y", type: "macrotask" },
        ]),
        ["x", "y"],
      );
    `,
  },
  {
    label: "A single-type list is returned in its original order",
    source: `
      assertEqual(
        predictOrder([
          { id: "p", type: "sync" },
          { id: "q", type: "sync" },
        ]),
        ["p", "q"],
      );
    `,
  },
];

const IMPLEMENT_PROMISE_ALL_TESTS: SandboxTest[] = [
  {
    label: "Resolves with all results in input order",
    source: `
      assert(typeof myPromiseAll === "function", "myPromiseAll is not defined");
      const result = await myPromiseAll([Promise.resolve(1), Promise.resolve(2)]);
      assertEqual(result, [1, 2]);
    `,
  },
  {
    label: "Result order matches input order regardless of timing",
    source: `
      const result = await myPromiseAll([
        delay(30).then(function () { return "a"; }),
        delay(5).then(function () { return "b"; }),
      ]);
      assertEqual(result, ["a", "b"], "result order must match input order, not resolution order");
    `,
  },
  {
    label: "Rejects immediately with the first rejection reason",
    source: `
      let rejected = false;
      let reason;
      try {
        await myPromiseAll([Promise.resolve(1), Promise.reject("no")]);
      } catch (err) {
        rejected = true;
        reason = err;
      }
      assert(rejected, "myPromiseAll should reject when any input rejects");
      assertEqual(reason, "no");
    `,
  },
  {
    label: "An empty input resolves immediately with an empty array",
    source: `assertEqual(await myPromiseAll([]), []);`,
  },
];

const IMPLEMENT_CURRY_TESTS: SandboxTest[] = [
  {
    label: "One argument at a time",
    source: `
      assert(typeof curry === "function", "curry is not defined");
      function add(a, b, c) { return a + b + c; }
      const curried = curry(add);
      assertEqual(curried(1)(2)(3), 6);
    `,
  },
  {
    label: "A partial group, then the rest",
    source: `
      function add(a, b, c) { return a + b + c; }
      const curried = curry(add);
      assertEqual(curried(1, 2)(3), 6);
    `,
  },
  {
    label: "All arguments at once still works",
    source: `
      function add(a, b, c) { return a + b + c; }
      const curried = curry(add);
      assertEqual(curried(1, 2, 3), 6);
    `,
  },
  {
    label: "Any grouping of arguments produces the same result",
    source: `
      function add(a, b, c) { return a + b + c; }
      const curried = curry(add);
      assertEqual(curried(1)(2, 3), 6);
    `,
  },
];

const IMPLEMENT_TAKE_TESTS: SandboxTest[] = [
  {
    label: "Takes exactly `count` values from an infinite sequence without hanging",
    source: `
      assert(typeof take === "function", "take is not defined");
      function* naturalNumbers() { let n = 1; while (true) yield n++; }
      assertEqual(take(naturalNumbers(), 5), [1, 2, 3, 4, 5]);
    `,
  },
  {
    label: "Returns fewer than count if the iterable runs out first",
    source: `assertEqual(take([10, 20], 5), [10, 20]);`,
  },
  {
    label: "count of 0 returns an empty array immediately",
    source: `
      function* naturalNumbers() { let n = 1; while (true) yield n++; }
      assertEqual(take(naturalNumbers(), 0), []);
    `,
  },
];

const FIND_LEAKED_LISTENERS_TESTS: SandboxTest[] = [
  {
    label: "An id removed the same number of times it was added is not leaked",
    source: `
      assert(typeof findLeakedListeners === "function", "findLeakedListeners is not defined");
      assertEqual(
        findLeakedListeners([
          { type: "add", id: "resize" },
          { type: "add", id: "scroll" },
          { type: "remove", id: "resize" },
        ]),
        ["scroll"],
      );
    `,
  },
  {
    label: "Balanced add/remove counts are never leaked, no matter how many times",
    source: `
      assertEqual(
        findLeakedListeners([
          { type: "add", id: "x" },
          { type: "add", id: "x" },
          { type: "remove", id: "x" },
          { type: "remove", id: "x" },
        ]),
        [],
      );
    `,
  },
  {
    label: "A net imbalance is leaked, even if remove was called at least once",
    source: `
      assertEqual(
        findLeakedListeners([
          { type: "add", id: "x" },
          { type: "add", id: "x" },
          { type: "remove", id: "x" },
        ]),
        ["x"],
      );
    `,
  },
  {
    label: "No events means nothing is leaked",
    source: `assertEqual(findLeakedListeners([]), []);`,
  },
];

// Phase 10 (Feature 42) — Browser Internals

const CLASSIFY_DOM_VS_BOM_TESTS: SandboxTest[] = [
  {
    label: "A direct document reference is DOM",
    source: `
      assert(typeof classifyApi === "function", "classifyApi is not defined");
      assertEqual(classifyApi("document.querySelector"), "dom");
    `,
  },
  {
    label: "window.document is still DOM, not BOM",
    source: `assertEqual(classifyApi("window.document.body"), "dom");`,
  },
  {
    label: "window.location is BOM",
    source: `assertEqual(classifyApi("window.location"), "bom");`,
  },
  {
    label: "A direct navigator reference is BOM",
    source: `assertEqual(classifyApi("navigator.userAgent"), "bom");`,
  },
  {
    label: "A direct history reference is BOM",
    source: `assertEqual(classifyApi("history.pushState"), "bom");`,
  },
];

const EVENT_PROPAGATION_ORDER_TESTS: SandboxTest[] = [
  {
    label: "All-bubble listeners fire target-first, then bottom-up",
    source: `
      assert(typeof getEventOrder === "function", "getEventOrder is not defined");
      assertEqual(
        getEventOrder(["document", "list", "item"], { document: "bubble", list: "bubble", item: "bubble" }),
        ["item", "list", "document"],
      );
    `,
  },
  {
    label: "A capture listener on an ancestor fires before the target",
    source: `
      assertEqual(
        getEventOrder(["document", "list", "item"], { document: "capture", item: "bubble" }),
        ["document", "item"],
      );
    `,
  },
  {
    label: "Among bubble ancestors, the deepest fires before the shallower one",
    source: `
      assertEqual(
        getEventOrder(["document", "section", "list", "item"], { section: "bubble", list: "bubble", item: "bubble" }),
        ["item", "list", "section"],
      );
    `,
  },
  {
    label: "A target with no listener of its own contributes nothing, but ancestors still fire correctly",
    source: `
      assertEqual(
        getEventOrder(["document", "app", "button"], { app: "capture", document: "bubble" }),
        ["app", "document"],
      );
    `,
  },
];

const PICK_STORAGE_MECHANISM_TESTS: SandboxTest[] = [
  {
    label: "Anything the server needs on every request is a cookie, regardless of other fields",
    source: `
      assert(typeof pickStorage === "function", "pickStorage is not defined");
      assertEqual(
        pickStorage({ persistAcrossSessions: true, capacityKB: 1, sendWithEveryRequest: true }),
        "cookie",
      );
    `,
  },
  {
    label: "Data that shouldn't outlive the tab is sessionStorage",
    source: `
      assertEqual(
        pickStorage({ persistAcrossSessions: false, capacityKB: 10, sendWithEveryRequest: false }),
        "sessionStorage",
      );
    `,
  },
  {
    label: "Small persistent data is localStorage",
    source: `
      assertEqual(
        pickStorage({ persistAcrossSessions: true, capacityKB: 100, sendWithEveryRequest: false }),
        "localStorage",
      );
    `,
  },
  {
    label: "Large persistent data is indexedDB",
    source: `
      assertEqual(
        pickStorage({ persistAcrossSessions: true, capacityKB: 20000, sendWithEveryRequest: false }),
        "indexedDB",
      );
    `,
  },
];

const CLASSIFY_STYLE_CHANGE_TESTS: SandboxTest[] = [
  {
    label: "width triggers layout",
    source: `
      assert(typeof classifyStyleChange === "function", "classifyStyleChange is not defined");
      assertEqual(classifyStyleChange("width"), "layout");
    `,
  },
  { label: "display triggers layout", source: `assertEqual(classifyStyleChange("display"), "layout");` },
  { label: "color is paint-only", source: `assertEqual(classifyStyleChange("color"), "paint");` },
  {
    label: "visibility is paint-only, unlike display",
    source: `assertEqual(classifyStyleChange("visibility"), "paint");`,
  },
  { label: "transform is composite-only", source: `assertEqual(classifyStyleChange("transform"), "composite");` },
  { label: "opacity is composite-only", source: `assertEqual(classifyStyleChange("opacity"), "composite");` },
];

const EVALUATE_CORS_REQUEST_TESTS: SandboxTest[] = [
  {
    label: "A simple GET with a wildcard origin needs no preflight and is allowed",
    source: `
      assert(typeof evaluateCorsRequest === "function", "evaluateCorsRequest is not defined");
      assertEqual(
        evaluateCorsRequest(
          { method: "GET", headers: [], origin: "https://app.com" },
          { allowOrigin: "*", allowMethods: [], allowHeaders: [] },
        ),
        { preflightRequired: false, allowed: true },
      );
    `,
  },
  {
    label: "A PUT request needs a preflight, and is allowed when the method is on the allow-list",
    source: `
      assertEqual(
        evaluateCorsRequest(
          { method: "PUT", headers: [], origin: "https://app.com" },
          { allowOrigin: "https://app.com", allowMethods: ["PUT"], allowHeaders: [] },
        ),
        { preflightRequired: true, allowed: true },
      );
    `,
  },
  {
    label: "Needing a preflight isn't enough — the method must actually be on the allow-list",
    source: `
      assertEqual(
        evaluateCorsRequest(
          { method: "PUT", headers: [], origin: "https://app.com" },
          { allowOrigin: "https://app.com", allowMethods: ["GET"], allowHeaders: [] },
        ),
        { preflightRequired: true, allowed: false },
      );
    `,
  },
  {
    label: "A mismatched origin is blocked even for a simple request",
    source: `
      assertEqual(
        evaluateCorsRequest(
          { method: "GET", headers: [], origin: "https://evil.com" },
          { allowOrigin: "https://app.com", allowMethods: [], allowHeaders: [] },
        ),
        { preflightRequired: false, allowed: false },
      );
    `,
  },
  {
    label: "A custom header forces a preflight even on a GET request",
    source: `
      assertEqual(
        evaluateCorsRequest(
          { method: "GET", headers: ["Authorization"], origin: "https://app.com" },
          { allowOrigin: "https://app.com", allowMethods: ["GET"], allowHeaders: ["Authorization"] },
        ),
        { preflightRequired: true, allowed: true },
      );
    `,
  },
];

const SANITIZE_HTML_INPUT_TESTS: SandboxTest[] = [
  {
    // Built via concatenation so this file never contains the literal
    // contiguous text "</script>", which would otherwise prematurely close
    // the sandbox's own <script> tag when this source is embedded in the
    // generated iframe document (see buildSandboxDoc.ts).
    label: "Strips a <script> block entirely",
    source: `
      assert(typeof sanitizeHtml === "function", "sanitizeHtml is not defined");
      var CLOSE_SCRIPT = "</scr" + "ipt>";
      var dangerous = "<p>Hello</p><script>alert(1)" + CLOSE_SCRIPT;
      assertEqual(sanitizeHtml(dangerous), "<p>Hello</p>");
    `,
  },
  {
    label: "Strips an on* event handler attribute",
    source: `assertEqual(sanitizeHtml('<img src="x" onerror="alert(1)">'), '<img src="x">');`,
  },
  {
    label: "Neutralizes a javascript: URL",
    source: `
      assertEqual(
        sanitizeHtml('<a href="javascript:alert(1)">click</a>'),
        '<a href="#">click</a>',
      );
    `,
  },
  {
    label: "Leaves already-safe markup completely unchanged",
    source: `assertEqual(sanitizeHtml("<p>Safe text</p>"), "<p>Safe text</p>");`,
  },
];

const TRACE_CONNECTION_STEPS_TESTS: SandboxTest[] = [
  {
    label: "A brand-new HTTPS connection performs all four steps",
    source: `
      assert(typeof getConnectionSteps === "function", "getConnectionSteps is not defined");
      assertEqual(
        getConnectionSteps({ isHttps: true, dnsCached: false, connectionReused: false }),
        ["dns-lookup", "tcp-handshake", "tls-handshake", "http-request"],
      );
    `,
  },
  {
    label: "Cached DNS and plain HTTP skip both the lookup and the TLS handshake",
    source: `
      assertEqual(
        getConnectionSteps({ isHttps: false, dnsCached: true, connectionReused: false }),
        ["tcp-handshake", "http-request"],
      );
    `,
  },
  {
    label: "A fully reused keep-alive connection skips straight to the request",
    source: `
      assertEqual(
        getConnectionSteps({ isHttps: true, dnsCached: true, connectionReused: true }),
        ["http-request"],
      );
    `,
  },
  {
    label: "A fresh TCP connection over HTTPS still needs its own TLS handshake, even with DNS cached",
    source: `
      assertEqual(
        getConnectionSteps({ isHttps: true, dnsCached: true, connectionReused: false }),
        ["tcp-handshake", "tls-handshake", "http-request"],
      );
    `,
  },
];

const STALE_WHILE_REVALIDATE_TESTS: SandboxTest[] = [
  {
    label: "Returns a cache hit immediately",
    source: `
      assert(typeof staleWhileRevalidate === "function", "staleWhileRevalidate is not defined");
      var store = new Map([["user", "cached-value"]]);
      var cache = { get: async function (k) { return store.get(k); }, set: async function (k, v) { store.set(k, v); } };
      var network = async function () { await delay(50); return "fresh-value"; };
      var result = await staleWhileRevalidate("user", cache, network);
      assertEqual(result, "cached-value", "should return the cached value immediately when present");
    `,
  },
  {
    label: "Falls back to the network value on a cache miss",
    source: `
      var store = new Map();
      var cache = { get: async function (k) { return store.get(k); }, set: async function (k, v) { store.set(k, v); } };
      var network = async function () { return "fresh-value"; };
      var result = await staleWhileRevalidate("user", cache, network);
      assertEqual(result, "fresh-value", "should return the network value when nothing is cached");
    `,
  },
  {
    label: "Updates the cache with the fresh value in the background",
    source: `
      var store = new Map([["user", "cached-value"]]);
      var cache = { get: async function (k) { return store.get(k); }, set: async function (k, v) { store.set(k, v); } };
      var network = async function () { await delay(20); return "fresh-value"; };
      await staleWhileRevalidate("user", cache, network);
      await delay(60);
      assertEqual(store.get("user"), "fresh-value", "the cache should be updated with the fresh value in the background");
    `,
  },
  {
    label: "A background network failure doesn't affect an already-returned cache hit",
    source: `
      var store = new Map([["user", "cached-value"]]);
      var cache = { get: async function (k) { return store.get(k); }, set: async function (k, v) { store.set(k, v); } };
      var network = async function () { throw new Error("offline"); };
      var result = await staleWhileRevalidate("user", cache, network);
      assertEqual(result, "cached-value", "a background network failure should not affect the cached response");
      await delay(20);
    `,
  },
];

const CLONE_WORKER_MESSAGE_TESTS: SandboxTest[] = [
  {
    label: "Deep-clones a nested array without sharing a reference to the original's nested array",
    source: `
      assert(typeof cloneMessage === "function", "cloneMessage is not defined");
      var original = { a: 1, b: [1, 2, 3] };
      var clone = cloneMessage(original);
      assertEqual(clone, original);
      assert(clone.b !== original.b, "the nested array must be a genuine copy, not the same reference");
    `,
  },
  {
    label: "A primitive passes through unchanged",
    source: `assertEqual(cloneMessage(42), 42);`,
  },
  {
    label: "A function anywhere in the value throws instead of cloning",
    source: `
      var threw = false;
      try {
        cloneMessage({ fn: function () {} });
      } catch (e) {
        threw = true;
      }
      assert(threw, "cloneMessage should throw when the value contains a function");
    `,
  },
  {
    label: "Nested objects are cloned independently at every level",
    source: `
      var original = { nested: { deep: [1, { x: 2 }] } };
      var clone = cloneMessage(original);
      clone.nested.deep[1].x = 999;
      assertEqual(original.nested.deep[1].x, 2, "mutating the clone must never affect the original");
    `,
  },
];

const CREATE_ELEMENT_TESTS: SandboxTest[] = [
  {
    label: "No children folds to an empty array",
    source: `
      assert(typeof createElement === "function", "createElement is not defined");
      assertEqual(createElement("div", null), { type: "div", props: { children: [] } });
    `,
  },
  {
    label: "A single child is stored directly, not wrapped in an array",
    source: `
      assertEqual(
        createElement("button", { className: "primary" }, "Save"),
        { type: "button", props: { className: "primary", children: "Save" } },
      );
    `,
  },
  {
    label: "Multiple children are stored as an array",
    source: `assertEqual(createElement("ul", null, "a", "b"), { type: "ul", props: { children: ["a", "b"] } });`,
  },
  {
    label: "Children can themselves be vnode objects, nested arbitrarily deep",
    source: `
      const vnode = createElement("div", null, createElement("span", null, "hi"));
      assertEqual(vnode.props.children, { type: "span", props: { children: "hi" } });
    `,
  },
];

const SHOULD_RUN_EFFECT_TESTS: SandboxTest[] = [
  {
    label: "First render (mount) always runs",
    source: `
      assert(typeof shouldRunEffect === "function", "shouldRunEffect is not defined");
      assertEqual(shouldRunEffect(null, [1]), true);
    `,
  },
  { label: "Unchanged dependency skips the effect", source: `assertEqual(shouldRunEffect([1], [1]), false);` },
  { label: "A changed dependency re-runs the effect", source: `assertEqual(shouldRunEffect([1], [2]), true);` },
  {
    label: "Object.is treats NaN as equal to itself, unlike ===",
    source: `assertEqual(shouldRunEffect([NaN], [NaN]), false);`,
  },
  { label: "No dependency array always runs", source: `assertEqual(shouldRunEffect([1, 2], undefined), true);` },
];

const DETECT_CONTROLLED_SWITCH_TESTS: SandboxTest[] = [
  {
    label: "Uncontrolled to controlled is a switch",
    source: `
      assert(typeof isSwitchingControlled === "function", "isSwitchingControlled is not defined");
      assertEqual(isSwitchingControlled(undefined, "abc"), true);
    `,
  },
  { label: "Empty string is still controlled", source: `assertEqual(isSwitchingControlled("abc", ""), false);` },
  {
    label: "Controlled to uncontrolled is also a switch",
    source: `assertEqual(isSwitchingControlled("abc", undefined), true);`,
  },
  {
    label: "Uncontrolled the whole time is not a switch",
    source: `assertEqual(isSwitchingControlled(undefined, undefined), false);`,
  },
  {
    label: "null counts as uncontrolled, same as undefined",
    source: `assertEqual(isSwitchingControlled(null, "x"), true);`,
  },
];

const MERGE_REFS_TESTS: SandboxTest[] = [
  {
    label: "Updates both a function ref and an object ref",
    source: `
      assert(typeof mergeRefs === "function", "mergeRefs is not defined");
      let fnRefValue = null;
      const objRef = { current: null };
      const merged = mergeRefs((node) => { fnRefValue = node; }, objRef);
      merged("node-1");
      assertEqual(fnRefValue, "node-1");
      assertEqual(objRef.current, "node-1");
    `,
  },
  {
    label: "Skips null/undefined refs safely",
    source: `
      const objRef2 = { current: null };
      const merged2 = mergeRefs(null, objRef2, undefined);
      merged2("node-2");
      assertEqual(objRef2.current, "node-2");
    `,
  },
  {
    label: "Clears all refs when called with null (on unmount)",
    source: `
      const objRef3 = { current: "node-3" };
      const merged3 = mergeRefs(objRef3);
      merged3(null);
      assertEqual(objRef3.current, null);
    `,
  },
  {
    label: "Supports more than two refs",
    source: `
      const r1 = { current: null }, r2 = { current: null }, r3 = { current: null };
      const merged4 = mergeRefs(r1, r2, r3);
      merged4("shared-node");
      assert(r1.current === "shared-node" && r2.current === "shared-node" && r3.current === "shared-node", "all three refs should point at the same node");
    `,
  },
];

const CONTEXT_STORE_TESTS: SandboxTest[] = [
  {
    label: "getValue returns the initial value",
    source: `
      assert(typeof createStore === "function", "createStore is not defined");
      const store1 = createStore("dark");
      assertEqual(store1.getValue(), "dark");
    `,
  },
  {
    label: "setValue notifies subscribed listeners",
    source: `
      const store2 = createStore(0);
      let received = null;
      store2.subscribe((v) => { received = v; });
      store2.setValue(42);
      assertEqual(received, 42);
    `,
  },
  {
    label: "The function returned by subscribe removes that listener",
    source: `
      const store3 = createStore(0);
      let calls = 0;
      const unsubscribe = store3.subscribe(() => { calls++; });
      unsubscribe();
      store3.setValue(1);
      assertEqual(calls, 0);
    `,
  },
  {
    label: "Supports multiple simultaneous subscribers",
    source: `
      const store4 = createStore(0);
      let a = null, b = null;
      store4.subscribe((v) => { a = v; });
      store4.subscribe((v) => { b = v; });
      store4.setValue(7);
      assertEqual(a, 7);
      assertEqual(b, 7);
    `,
  },
];

const MAP_CHILDREN_TESTS: SandboxTest[] = [
  {
    label: "null children maps to an empty array",
    source: `
      assert(typeof mapChildren === "function", "mapChildren is not defined");
      assertEqual(mapChildren(null, (c, i) => [c, i]), []);
    `,
  },
  {
    label: "A single non-array child is treated as a one-item list",
    source: `assertEqual(mapChildren("only child", (c, i) => [c, i]), [["only child", 0]]);`,
  },
  {
    label: "Falsy conditional-rendering entries are dropped, and indices reflect only surviving children",
    source: `assertEqual(mapChildren(["a", null, "b", false], (c, i) => [c, i]), [["a", 0], ["b", 1]]);`,
  },
  {
    label: "A plain array of children maps in order",
    source: `assertEqual(mapChildren(["a", "b", "c"], (c, i) => [c, i]), [["a", 0], ["b", 1], ["c", 2]]);`,
  },
];

const CONDITIONAL_HOOK_CALL_TESTS: SandboxTest[] = [
  {
    label: "Matching sequences every render means no violation",
    source: `
      assert(typeof findHookOrderViolation === "function", "findHookOrderViolation is not defined");
      assertEqual(findHookOrderViolation([["useState","useEffect"], ["useState","useEffect"]]), -1);
    `,
  },
  {
    label: "A render that skips a hook is flagged at its own index",
    source: `assertEqual(findHookOrderViolation([["useState","useEffect"], ["useState"]]), 1);`,
  },
  {
    label: "A render with hooks in a different order is a violation, even with the same count",
    source: `assertEqual(findHookOrderViolation([["useState"], ["useState"], ["useEffect","useState"]]), 2);`,
  },
  {
    label: "No renders at all means nothing to violate",
    source: `assertEqual(findHookOrderViolation([]), -1);`,
  },
];

const FIND_ERROR_BOUNDARY_TESTS: SandboxTest[] = [
  {
    label: "Finds a distant ancestor boundary when nothing closer exists",
    source: `
      assert(typeof findErrorBoundary === "function", "findErrorBoundary is not defined");
      const tree1 = { id: "root", isBoundary: true, children: [{ id: "mid", isBoundary: false, children: [{ id: "leaf", isBoundary: false, children: [] }] }] };
      assertEqual(findErrorBoundary(tree1, "leaf"), "root");
    `,
  },
  {
    label: "The nearest boundary wins over an outer one",
    source: `
      const tree2 = { id: "root", isBoundary: true, children: [{ id: "section", isBoundary: true, children: [{ id: "leaf", isBoundary: false, children: [] }] }] };
      assertEqual(findErrorBoundary(tree2, "leaf"), "section");
    `,
  },
  {
    label: "Returns null when no ancestor boundary exists",
    source: `
      const tree3 = { id: "root", isBoundary: false, children: [{ id: "leaf", isBoundary: false, children: [] }] };
      assertEqual(findErrorBoundary(tree3, "leaf"), null);
    `,
  },
  {
    label: "A node never catches its own thrown error",
    source: `
      const tree4 = { id: "root", isBoundary: true, children: [{ id: "leaf", isBoundary: true, children: [] }] };
      assertEqual(findErrorBoundary(tree4, "leaf"), "root");
    `,
  },
];

const SHALLOW_EQUAL_TESTS: SandboxTest[] = [
  {
    label: "Same own keys and values are shallow-equal",
    source: `
      assert(typeof shallowEqual === "function", "shallowEqual is not defined");
      assertEqual(shallowEqual({ a: 1 }, { a: 1 }), true);
    `,
  },
  {
    label: "A different value for the same key is not equal",
    source: `assertEqual(shallowEqual({ a: 1 }, { a: 2 }), false);`,
  },
  {
    label:
      "Nested objects are compared by reference, not recursively — two different inner objects are unequal",
    source: `assertEqual(shallowEqual({ a: { x: 1 } }, { a: { x: 1 } }), false);`,
  },
  {
    label: "The identical reference is always equal",
    source: `
      const shared = { a: 1 };
      assertEqual(shallowEqual(shared, shared), true);
    `,
  },
  {
    label: "A different number of keys is never shallow-equal",
    source: `assertEqual(shallowEqual({ a: 1 }, { a: 1, b: 2 }), false);`,
  },
];

const SCHEDULE_UPDATES_TESTS: SandboxTest[] = [
  {
    label: "Urgent updates move first while relative order within each group is preserved",
    source: `
      assert(typeof scheduleUpdates === "function", "scheduleUpdates is not defined");
      assertEqual(
        scheduleUpdates([{ id: "a", priority: "transition" }, { id: "b", priority: "urgent" }, { id: "c", priority: "transition" }, { id: "d", priority: "urgent" }]),
        ["b", "d", "a", "c"],
      );
    `,
  },
  {
    label: "All-urgent input is returned unchanged",
    source: `assertEqual(scheduleUpdates([{ id: "a", priority: "urgent" }, { id: "b", priority: "urgent" }]), ["a", "b"]);`,
  },
  {
    label: "All-transition input is returned unchanged",
    source: `assertEqual(scheduleUpdates([{ id: "a", priority: "transition" }, { id: "b", priority: "transition" }]), ["a", "b"]);`,
  },
  {
    label: "An empty batch schedules to an empty array",
    source: `assertEqual(scheduleUpdates([]), []);`,
  },
];

const FIND_SHARED_STATE_ANCESTOR_TESTS: SandboxTest[] = [
  {
    label: "Siblings' lowest common ancestor is their direct parent",
    source: `
      assert(typeof findLowestCommonAncestor === "function", "findLowestCommonAncestor is not defined");
      const tree = {
        id: "app",
        children: [
          { id: "sidebar", children: [{ id: "nav-item-1", children: [] }, { id: "nav-item-2", children: [] }] },
          { id: "content", children: [{ id: "header", children: [] }, { id: "body", children: [{ id: "deep-leaf", children: [] }] }] },
        ],
      };
      assertEqual(findLowestCommonAncestor(tree, "nav-item-1", "nav-item-2"), "sidebar");
    `,
  },
  {
    label: "When one node is an ancestor of the other, it is its own answer",
    source: `
      const tree = {
        id: "app",
        children: [
          { id: "sidebar", children: [{ id: "nav-item-1", children: [] }, { id: "nav-item-2", children: [] }] },
          { id: "content", children: [{ id: "header", children: [] }, { id: "body", children: [{ id: "deep-leaf", children: [] }] }] },
        ],
      };
      assertEqual(findLowestCommonAncestor(tree, "content", "deep-leaf"), "content");
    `,
  },
  {
    label: "Finds the correct ancestor in a deeper, unbalanced tree",
    source: `
      const tree = {
        id: "app",
        children: [
          { id: "sidebar", children: [{ id: "nav-item-1", children: [] }, { id: "nav-item-2", children: [] }] },
          { id: "content", children: [{ id: "header", children: [] }, { id: "body", children: [{ id: "deep-leaf", children: [] }] }] },
        ],
      };
      assertEqual(findLowestCommonAncestor(tree, "nav-item-2", "deep-leaf"), "app");
    `,
  },
  {
    label: "Returns null if either id isn't found",
    source: `
      const tree = {
        id: "app",
        children: [
          { id: "sidebar", children: [{ id: "nav-item-1", children: [] }, { id: "nav-item-2", children: [] }] },
          { id: "content", children: [{ id: "header", children: [] }, { id: "body", children: [{ id: "deep-leaf", children: [] }] }] },
        ],
      };
      assertEqual(findLowestCommonAncestor(tree, "content", "ghost"), null);
    `,
  },
];

const RENDERED_BOX_WIDTH_TESTS: SandboxTest[] = [
  {
    label: "content-box adds padding and border on top of width",
    source: `
      assert(typeof renderedWidth === "function", "renderedWidth is not defined");
      assertEqual(renderedWidth({ width: 200, padding: 20, border: 2 }, "content-box"), 244);
    `,
  },
  {
    label: "border-box keeps the declared width regardless of padding/border",
    source: `assertEqual(renderedWidth({ width: 200, padding: 20, border: 2 }, "border-box"), 200);`,
  },
  {
    label: "zero padding/border renders at the declared width either way",
    source: `assertEqual(renderedWidth({ width: 100, padding: 0, border: 0 }, "content-box"), 100);`,
  },
];

const RESOLVE_CSS_LENGTH_TESTS: SandboxTest[] = [
  {
    label: "rem resolves against the root font-size",
    source: `
      assert(typeof resolveLength === "function", "resolveLength is not defined");
      assertEqual(resolveLength(1.5, "rem", { rootFontSize: 16 }), 24);
    `,
  },
  {
    label: "em resolves against the parent's font-size",
    source: `assertEqual(resolveLength(2, "em", { parentFontSize: 20 }), 40);`,
  },
  {
    label: "vw resolves against 1% of viewport width",
    source: `assertEqual(resolveLength(50, "vw", { viewportWidth: 1000 }), 500);`,
  },
  {
    label: "px passes through unchanged",
    source: `assertEqual(resolveLength(10, "px", {}), 10);`,
  },
];

const RESOLVE_CASCADE_WINNER_TESTS: SandboxTest[] = [
  {
    label: "!important wins even against higher specificity",
    source: `
      assert(typeof resolveCascade === "function", "resolveCascade is not defined");
      assertEqual(
        resolveCascade([
          { value: "blue", important: false, specificity: [0, 2, 0], order: 0 },
          { value: "red", important: true, specificity: [0, 0, 1], order: 1 },
        ]),
        "red",
      );
    `,
  },
  {
    label: "Without !important, higher specificity wins",
    source: `
      assertEqual(
        resolveCascade([
          { value: "blue", important: false, specificity: [0, 1, 0], order: 0 },
          { value: "green", important: false, specificity: [1, 0, 0], order: 1 },
        ]),
        "green",
      );
    `,
  },
  {
    label: "Equal specificity — the later declaration (source order) wins",
    source: `
      assertEqual(
        resolveCascade([
          { value: "blue", important: false, specificity: [0, 1, 0], order: 0 },
          { value: "green", important: false, specificity: [0, 1, 0], order: 1 },
        ]),
        "green",
      );
    `,
  },
];

const DISTRIBUTE_FLEX_SPACE_TESTS: SandboxTest[] = [
  {
    label: "Equal grow splits extra space evenly",
    source: `
      assert(typeof distributeFlexSpace === "function", "distributeFlexSpace is not defined");
      assertEqual(
        distributeFlexSpace([{ basis: 100, grow: 1, shrink: 1 }, { basis: 100, grow: 1, shrink: 1 }], 300),
        [150, 150],
      );
    `,
  },
  {
    label: "grow: 0 gets no extra space at all",
    source: `
      assertEqual(
        distributeFlexSpace([{ basis: 100, grow: 1, shrink: 1 }, { basis: 100, grow: 0, shrink: 1 }], 300),
        [200, 100],
      );
    `,
  },
  {
    label: "Overflow shrinks items proportionally to basis × shrink",
    source: `
      assertEqual(
        distributeFlexSpace([{ basis: 100, grow: 1, shrink: 1 }, { basis: 100, grow: 1, shrink: 1 }], 150),
        [75, 75],
      );
    `,
  },
  {
    label: "Container exactly matching total basis distributes nothing",
    source: `
      assertEqual(
        distributeFlexSpace([{ basis: 100, grow: 1, shrink: 1 }, { basis: 100, grow: 1, shrink: 1 }], 200),
        [100, 100],
      );
    `,
  },
];

const RESOLVE_STACKING_ORDER_TESTS: SandboxTest[] = [
  {
    label: "A high z-index trapped in a lower-context ancestor cannot beat a sibling context",
    source: `
      assert(typeof resolveTopmost === "function", "resolveTopmost is not defined");
      assertEqual(
        resolveTopmost([
          { id: "a", zIndex: 1, parentId: null },
          { id: "a-inner", zIndex: 9999, parentId: "a" },
          { id: "b", zIndex: 2, parentId: null },
        ]),
        "b",
      );
    `,
  },
  {
    label: "Among top-level siblings, the higher zIndex wins directly",
    source: `
      assertEqual(
        resolveTopmost([
          { id: "a", zIndex: 1, parentId: null },
          { id: "b", zIndex: 5, parentId: null },
        ]),
        "b",
      );
    `,
  },
  {
    label: "Equal zIndex at the same level falls back to source order",
    source: `
      assertEqual(
        resolveTopmost([
          { id: "a", zIndex: 3, parentId: null },
          { id: "b", zIndex: 3, parentId: null },
        ]),
        "b",
      );
    `,
  },
  {
    label: "A descendant under the higher-ranked ancestor wins, even with a lower zIndex than the other branch's descendant",
    source: `
      assertEqual(
        resolveTopmost([
          { id: "x", zIndex: 5, parentId: null },
          { id: "x-inner", zIndex: 1, parentId: "x" },
          { id: "y", zIndex: 3, parentId: null },
          { id: "y-inner", zIndex: 100, parentId: "y" },
        ]),
        "x-inner",
      );
    `,
  },
];

const RESOLVE_CONTAINER_QUERY_TESTS: SandboxTest[] = [
  {
    label: "Matches the largest minWidth that's still ≤ the container width",
    source: `
      assert(typeof resolveContainerValue === "function", "resolveContainerValue is not defined");
      const queries = [{ minWidth: 0, value: "compact" }, { minWidth: 400, value: "comfortable" }, { minWidth: 700, value: "wide" }];
      assertEqual(resolveContainerValue(500, queries), "comfortable");
    `,
  },
  {
    label: "Falls back to the smallest breakpoint below the container width",
    source: `
      const queries = [{ minWidth: 0, value: "compact" }, { minWidth: 400, value: "comfortable" }, { minWidth: 700, value: "wide" }];
      assertEqual(resolveContainerValue(300, queries), "compact");
    `,
  },
  {
    label: "Matches the largest breakpoint when the container is wide enough",
    source: `
      const queries = [{ minWidth: 0, value: "compact" }, { minWidth: 400, value: "comfortable" }, { minWidth: 700, value: "wide" }];
      assertEqual(resolveContainerValue(1000, queries), "wide");
    `,
  },
  {
    label: "Works regardless of the input queries' order",
    source: `
      const queries = [{ minWidth: 700, value: "wide" }, { minWidth: 0, value: "compact" }, { minWidth: 400, value: "comfortable" }];
      assertEqual(resolveContainerValue(500, queries), "comfortable");
    `,
  },
];

const RESOLVE_CUSTOM_PROPERTY_TESTS: SandboxTest[] = [
  {
    label: "A declaration on the element itself wins immediately",
    source: `
      assert(typeof resolveVar === "function", "resolveVar is not defined");
      const tree = [{ id: "root", parentId: null }, { id: "card", parentId: "root" }];
      const declarations = { root: { "--accent": "teal" }, card: { "--accent": "gold" } };
      assertEqual(resolveVar("card", "--accent", tree, declarations, "black"), "gold");
    `,
  },
  {
    label: "Falls back to the nearest ancestor that declares the property",
    source: `
      const tree = [{ id: "root", parentId: null }, { id: "card", parentId: "root" }];
      const declarations = { root: { "--accent": "teal" } };
      assertEqual(resolveVar("card", "--accent", tree, declarations, "black"), "teal");
    `,
  },
  {
    label: "The closer ancestor wins over a farther one, regardless of declaration order",
    source: `
      const tree = [
        { id: "root", parentId: null },
        { id: "theme-dark", parentId: "root" },
        { id: "card", parentId: "theme-dark" },
      ];
      const declarations = { root: { "--accent": "teal" }, "theme-dark": { "--accent": "cyan" } };
      assertEqual(resolveVar("card", "--accent", tree, declarations, "black"), "cyan");
    `,
  },
  {
    label: "Returns the fallback when nothing in the chain declares it",
    source: `
      const tree = [{ id: "root", parentId: null }, { id: "card", parentId: "root" }];
      assertEqual(resolveVar("card", "--accent", tree, {}, "black"), "black");
    `,
  },
];

const IMPLEMENT_HAS_MATCHER_TESTS: SandboxTest[] = [
  {
    label: "Matches when a direct child satisfies the predicate",
    source: `
      assert(typeof hasDescendantMatching === "function", "hasDescendantMatching is not defined");
      const form = { id: "f1", tag: "form", children: [{ id: "i1", tag: "input", valid: true }, { id: "i2", tag: "input", valid: false }] };
      assertEqual(hasDescendantMatching(form, (n) => n.valid === false), true);
    `,
  },
  {
    label: "Returns false when no descendant matches",
    source: `
      const form = { id: "f1", tag: "form", children: [{ id: "i1", tag: "input", valid: true }] };
      assertEqual(hasDescendantMatching(form, (n) => n.valid === false), false);
    `,
  },
  {
    label: "Matches a deeply nested descendant, not just direct children",
    source: `
      const form = {
        id: "f1", tag: "form",
        children: [{ id: "fs1", tag: "fieldset", children: [{ id: "fs2", tag: "fieldset", children: [{ id: "i1", tag: "input", valid: false }] }] }],
      };
      assertEqual(hasDescendantMatching(form, (n) => n.valid === false), true);
    `,
  },
  {
    label: "The node itself is never checked — only its descendants",
    source: `
      const leaf = { id: "i1", tag: "input", valid: false, children: [] };
      assertEqual(hasDescendantMatching(leaf, (n) => n.valid === false), false);
    `,
  },
];

const CLASSIFY_ANIMATION_COST_TESTS: SandboxTest[] = [
  {
    label: "Both properties are Composite-only — the cheapest possible tier",
    source: `
      assert(typeof classifyAnimationCost === "function", "classifyAnimationCost is not defined");
      assertEqual(classifyAnimationCost(["transform", "opacity"]), "compositor");
    `,
  },
  {
    label: "A single layout-triggering property drags the whole list down to 'layout'",
    source: `assertEqual(classifyAnimationCost(["transform", "top"]), "layout");`,
  },
  {
    label: "Paint-only properties skip Layout but still cost more than Composite-only",
    source: `assertEqual(classifyAnimationCost(["color", "box-shadow"]), "paint");`,
  },
  {
    label: "A lone layout-triggering property is classified as 'layout'",
    source: `assertEqual(classifyAnimationCost(["width"]), "layout");`,
  },
];

// ── Phase 10 (Feature 45) — TypeScript Concepts ─────────────────────────────

const SAFE_PARSE_NUMBER_TESTS: SandboxTest[] = [
  {
    label: "A finite number passes through unchanged",
    source: `
      assert(typeof safeParseNumber === "function", "safeParseNumber is not defined");
      assertEqual(safeParseNumber(42), 42);
    `,
  },
  {
    label: "A numeric string is parsed to a number",
    source: `assertEqual(safeParseNumber("3.14"), 3.14);`,
  },
  {
    label: "A non-numeric string returns null instead of NaN",
    source: `assertEqual(safeParseNumber("not a number"), null);`,
  },
  {
    label: "NaN itself is rejected, not returned as a valid number",
    source: `assertEqual(safeParseNumber(NaN), null);`,
  },
];

const MERGE_DECLARATIONS_TESTS: SandboxTest[] = [
  {
    label: "Distinct keys across declarations simply combine",
    source: `
      assert(typeof mergeDeclarations === "function", "mergeDeclarations is not defined");
      assertEqual(mergeDeclarations([{ timeout: "number" }, { retries: "number" }]), { timeout: "number", retries: "number" });
    `,
  },
  {
    label: "The same key with the same value merges to a single value, not an array",
    source: `assertEqual(mergeDeclarations([{ id: "string" }, { id: "string" }]), { id: "string" });`,
  },
  {
    label: "The same key with a different value surfaces as a conflict array",
    source: `assertEqual(mergeDeclarations([{ id: "string" }, { id: "number" }]), { id: ["string", "number"] });`,
  },
  {
    label: "A key repeated later with the same value doesn't change the result",
    source: `assertEqual(mergeDeclarations([{ a: 1 }, { b: 2 }, { a: 1 }]), { a: 1, b: 2 });`,
  },
];

const CREATE_TYPED_STACK_TESTS: SandboxTest[] = [
  {
    label: "Same-type pushes are all accepted, in order",
    source: `
      assert(typeof createTypedStack === "function", "createTypedStack is not defined");
      const s = createTypedStack();
      s.push(1);
      s.push(2);
      s.push(3);
      assertEqual(s.toArray(), [1, 2, 3]);
    `,
  },
  {
    label: "A mismatched type after the first push throws",
    source: `
      const s = createTypedStack();
      s.push("a");
      let threw = false;
      try {
        s.push(1);
      } catch (e) {
        threw = true;
      }
      assert(threw, "pushing a mismatched type should throw");
    `,
  },
  {
    label: "pop() removes the most recently pushed item",
    source: `
      const s = createTypedStack();
      s.push(1);
      s.pop();
      assertEqual(s.toArray(), []);
    `,
  },
  {
    label: "A stack with no pushes starts out empty",
    source: `
      const s = createTypedStack();
      assertEqual(s.toArray(), []);
    `,
  },
];

const PICK_KEYS_TESTS: SandboxTest[] = [
  {
    label: "Only the requested keys are kept, in the object they belong to",
    source: `
      assert(typeof pick === "function", "pick is not defined");
      assertEqual(pick({ id: 1, name: "Ada", email: "a@x.com" }, ["id", "name"]), { id: 1, name: "Ada" });
    `,
  },
  {
    label: "A requested key the object doesn't have is skipped, not set to undefined",
    source: `assertEqual(pick({ id: 1, name: "Ada" }, ["email"]), {});`,
  },
  {
    label: "An empty key list returns an empty object",
    source: `assertEqual(pick({ id: 1, name: "Ada" }, []), {});`,
  },
];

const NARROW_VALUE_LENGTH_TESTS: SandboxTest[] = [
  {
    label: "A string narrows to its own .length",
    source: `
      assert(typeof getLength === "function", "getLength is not defined");
      assertEqual(getLength("hello"), 5);
    `,
  },
  {
    label: "An array narrows to its own .length, checked before the plain-object case",
    source: `assertEqual(getLength([1, 2, 3]), 3);`,
  },
  {
    label: "A plain object with a length field narrows via the in check",
    source: `assertEqual(getLength({ length: 10 }), 10);`,
  },
  {
    label: "A value with no length concept at all falls back to 0",
    source: `assertEqual(getLength(42), 0);`,
  },
];

const DISCRIMINATED_UNION_REDUCER_TESTS: SandboxTest[] = [
  {
    label: "increment adds one to the current state",
    source: `
      assert(typeof reducer === "function", "reducer is not defined");
      assertEqual(reducer(0, { type: "increment" }), 1);
    `,
  },
  {
    label: "decrement subtracts one from the current state",
    source: `assertEqual(reducer(5, { type: "decrement" }), 4);`,
  },
  {
    label: "set replaces the state entirely with action.value",
    source: `assertEqual(reducer(5, { type: "set", value: 100 }), 100);`,
  },
  {
    label: "An unrecognized action type throws instead of silently returning the old state",
    source: `
      let threw = false;
      try {
        reducer(0, { type: "nope" });
      } catch (e) {
        threw = true;
      }
      assert(threw, "an unhandled action type should throw");
    `,
  },
];

const MAP_VALUES_TESTS: SandboxTest[] = [
  {
    label: "Every value is transformed, keys stay the same",
    source: `
      assert(typeof mapValues === "function", "mapValues is not defined");
      assertEqual(mapValues({ a: 1, b: 2 }, (v) => v * 2), { a: 2, b: 4 });
    `,
  },
  {
    label: "Works for any transform function, not just numbers",
    source: `assertEqual(mapValues({ name: "ada" }, (v) => v.toUpperCase()), { name: "ADA" });`,
  },
  {
    label: "An empty object maps to an empty object",
    source: `assertEqual(mapValues({}, (v) => v * 2), {});`,
  },
];

const MATCH_EVENT_NAME_PATTERN_TESTS: SandboxTest[] = [
  {
    label: '"on" plus a capitalized word matches the pattern',
    source: `
      assert(typeof isEventName === "function", "isEventName is not defined");
      assertEqual(isEventName("onClick"), true);
    `,
  },
  {
    label: "Any capitalized word after \"on\" matches",
    source: `assertEqual(isEventName("onSubmit"), true);`,
  },
  {
    label: 'Missing the "on" prefix entirely fails',
    source: `assertEqual(isEventName("click"), false);`,
  },
  {
    label: '"on" followed by a lowercase word fails — not Capitalized',
    source: `assertEqual(isEventName("onclick"), false);`,
  },
];

const CHOOSE_SEMANTIC_TAG_TESTS: SandboxTest[] = [
  {
    label: "A recognized navigation purpose maps to <nav>",
    source: `
      assert(typeof chooseSemanticTag === "function", "chooseSemanticTag is not defined");
      assertEqual(chooseSemanticTag("primary navigation"), "nav");
    `,
  },
  {
    label: "An action purpose maps to <button>, not <a>",
    source: `assertEqual(chooseSemanticTag("performs an action on the current page"), "button");`,
  },
  {
    label: "A navigation purpose maps to <a>, not <button>",
    source: `assertEqual(chooseSemanticTag("navigates to another page/URL"), "a");`,
  },
  {
    label: "An unrecognized purpose falls back to a plain div",
    source: `assertEqual(chooseSemanticTag("something totally unrelated"), "div");`,
  },
];

const DECIDE_ALT_TEXT_TESTS: SandboxTest[] = [
  {
    label: "A decorative image always gets an empty alt, even if a description was supplied",
    source: `
      assert(typeof getAltText === "function", "getAltText is not defined");
      assertEqual(getAltText({ isDecorative: true, description: "swirl" }), "");
    `,
  },
  {
    label: "A meaningful image returns its real description",
    source: `assertEqual(getAltText({ isDecorative: false, description: "Company logo" }), "Company logo");`,
  },
  {
    label: "The description is trimmed of surrounding whitespace",
    source: `assertEqual(getAltText({ isDecorative: false, description: "  Team photo  " }), "Team photo");`,
  },
  {
    label: "A meaningful image with no description throws instead of returning something misleading",
    source: `
      let threw = false;
      try {
        getAltText({ isDecorative: false });
      } catch (e) {
        threw = true;
      }
      assert(threw, "getAltText should throw when a meaningful image has no description");
    `,
  },
];

const CONTRAST_RATIO_CHECKER_TESTS: SandboxTest[] = [
  {
    label: "Black on white is the maximum possible ratio, 21:1",
    source: `
      assert(typeof getContrastRatio === "function", "getContrastRatio is not defined");
      assertEqual(getContrastRatio("#000000", "#FFFFFF"), 21);
    `,
  },
  {
    label: "Identical colors give the minimum possible ratio, 1:1",
    source: `assertEqual(getContrastRatio("#FFFFFF", "#FFFFFF"), 1);`,
  },
  {
    label: "21:1 passes AA for normal text (needs 4.5:1)",
    source: `
      assert(typeof meetsWcagAA === "function", "meetsWcagAA is not defined");
      assertEqual(meetsWcagAA("#000000", "#FFFFFF", false), true);
    `,
  },
  {
    label: "1:1 fails AA for normal text",
    source: `assertEqual(meetsWcagAA("#FFFFFF", "#FFFFFF", false), false);`,
  },
];

const COMPUTE_TAB_ORDER_TESTS: SandboxTest[] = [
  {
    label: "Positive tabIndex elements come first in ascending order; tabIndex -1 is excluded",
    source: `
      assert(typeof computeTabOrder === "function", "computeTabOrder is not defined");
      assertEqual(
        computeTabOrder([
          { id: "a", domOrder: 0 },
          { id: "b", tabIndex: 2, domOrder: 1 },
          { id: "c", tabIndex: 1, domOrder: 2 },
          { id: "d", tabIndex: -1, domOrder: 3 },
          { id: "e", domOrder: 4 },
        ]),
        ["c", "b", "a", "e"]
      );
    `,
  },
  {
    label: "With no tabIndex set on anything, order falls back to plain DOM order",
    source: `
      assertEqual(
        computeTabOrder([
          { id: "x", domOrder: 2 },
          { id: "y", domOrder: 0 },
          { id: "z", domOrder: 1 },
        ]),
        ["y", "z", "x"]
      );
    `,
  },
  {
    label: "A tie in tabIndex is broken by DOM order",
    source: `
      assertEqual(
        computeTabOrder([
          { id: "p", tabIndex: 1, domOrder: 5 },
          { id: "q", tabIndex: 1, domOrder: 2 },
        ]),
        ["q", "p"]
      );
    `,
  },
];

const LINK_FIELD_ERROR_TESTS: SandboxTest[] = [
  {
    label: "An errored field points aria-describedby at its predictable error id",
    source: `
      assert(typeof buildFieldAria === "function", "buildFieldAria is not defined");
      assertEqual(buildFieldAria({ id: "email", hasError: true }), {
        "aria-invalid": true,
        "aria-describedby": "email-error",
      });
    `,
  },
  {
    label: "A valid field has no dangling aria-describedby reference",
    source: `
      assertEqual(buildFieldAria({ id: "email", hasError: false }), {
        "aria-invalid": false,
        "aria-describedby": undefined,
      });
    `,
  },
];

const LIVE_REGION_ANNOUNCER_QUEUE_TESTS: SandboxTest[] = [
  {
    label: "An assertive message jumps ahead of an already-queued polite one",
    source: `
      assert(typeof createAnnouncer === "function", "createAnnouncer is not defined");
      const a = createAnnouncer();
      a.announce("Saved", "polite");
      a.announce("Error: network failed", "assertive");
      assertEqual(a.flush(), { message: "Error: network failed", politeness: "assertive" });
    `,
  },
  {
    label: "The polite message is still delivered once the assertive queue is empty",
    source: `
      const a = createAnnouncer();
      a.announce("Saved", "polite");
      a.announce("Error: network failed", "assertive");
      a.flush();
      assertEqual(a.flush(), { message: "Saved", politeness: "polite" });
    `,
  },
  {
    label: "Flushing an empty announcer returns null instead of throwing",
    source: `
      const a = createAnnouncer();
      assertEqual(a.flush(), null);
    `,
  },
  {
    label: "Assertive priority applies every time flush is called, not just once",
    source: `
      const b = createAnnouncer();
      b.announce("first", "polite");
      b.announce("second", "polite");
      assertEqual(b.flush(), { message: "first", politeness: "polite" });
      b.announce("urgent", "assertive");
      assertEqual(b.flush(), { message: "urgent", politeness: "assertive" });
      assertEqual(b.flush(), { message: "second", politeness: "polite" });
    `,
  },
];

const COMBOBOX_KEYBOARD_HANDLER_TESTS: SandboxTest[] = [
  {
    label: "ArrowDown on a closed list opens it at the first option",
    source: `
      assert(typeof handleComboboxKey === "function", "handleComboboxKey is not defined");
      const initial = { options: ["Apple", "Banana", "Cherry"], activeIndex: -1, isOpen: false };
      assertEqual(handleComboboxKey(initial, "ArrowDown"), { options: initial.options, activeIndex: 0, isOpen: true });
    `,
  },
  {
    label: "ArrowDown at the last option wraps back to the first",
    source: `
      const options = ["Apple", "Banana", "Cherry"];
      assertEqual(
        handleComboboxKey({ options, activeIndex: 2, isOpen: true }, "ArrowDown"),
        { options, activeIndex: 0, isOpen: true }
      );
    `,
  },
  {
    label: "Escape closes the list and clears the active option entirely",
    source: `
      const options = ["Apple", "Banana", "Cherry"];
      assertEqual(
        handleComboboxKey({ options, activeIndex: 1, isOpen: true }, "Escape"),
        { options, activeIndex: -1, isOpen: false }
      );
    `,
  },
  {
    label: "Enter closes the list but keeps the selected option's index",
    source: `
      const options = ["Apple", "Banana", "Cherry"];
      assertEqual(
        handleComboboxKey({ options, activeIndex: 1, isOpen: true }, "Enter"),
        { options, activeIndex: 1, isOpen: false }
      );
    `,
  },
];

const MINI_A11Y_LINTER_TESTS: SandboxTest[] = [
  {
    label: "An img with no alt attribute at all is flagged",
    source: `
      assert(typeof lintNode === "function", "lintNode is not defined");
      assertEqual(lintNode({ tag: "img", attrs: {} }), ["img missing alt text"]);
    `,
  },
  {
    label: "An img with any alt attribute passes, even if empty",
    source: `assertEqual(lintNode({ tag: "img", attrs: { alt: "A dog" } }), []);`,
  },
  {
    label: "A decorative img needs no alt attribute at all",
    source: `assertEqual(lintNode({ tag: "img", attrs: { role: "presentation" } }), []);`,
  },
  {
    label: "An input with no accessible name is flagged",
    source: `assertEqual(lintNode({ tag: "input", attrs: {} }), ["input missing an accessible name"]);`,
  },
  {
    label: "Tags with no applicable rule always pass",
    source: `assertEqual(lintNode({ tag: "div", attrs: {} }), []);`,
  },
];

const PICK_IMAGE_FORMAT_AND_SIZE_TESTS: SandboxTest[] = [
  {
    label: "An opaque photo picks AVIF for the best compression",
    source: `
      assert(typeof pickImageFormat === "function", "pickImageFormat is not defined");
      assertEqual(pickImageFormat({ hasTransparency: false, isPhoto: true, needsAnimation: false }), "avif");
    `,
  },
  {
    label: "A transparent graphic picks WebP",
    source: `assertEqual(pickImageFormat({ hasTransparency: true, isPhoto: false, needsAnimation: false }), "webp");`,
  },
  {
    label: "800px target (400 x 2 dpr) picks the smallest width that still covers it, 960",
    source: `
      assert(typeof pickSrcsetWidth === "function", "pickSrcsetWidth is not defined");
      assertEqual(pickSrcsetWidth(400, 2, [320, 640, 960, 1280]), 960);
    `,
  },
  {
    label: "When no candidate is big enough, fall back to the largest available",
    source: `assertEqual(pickSrcsetWidth(1000, 3, [320, 640, 960]), 960);`,
  },
];

const SPLIT_SHARED_CHUNKS_TESTS: SandboxTest[] = [
  {
    label: "A module used by three routes is shared; one used by a single route is not",
    source: `
      assert(typeof splitChunks === "function", "splitChunks is not defined");
      assertEqual(
        splitChunks({ "/a": ["react", "a1"], "/b": ["react", "b1"], "/c": ["react", "utils", "c1"] }),
        { shared: ["react"], routes: { "/a": ["a1"], "/b": ["b1"], "/c": ["utils", "c1"] } }
      );
    `,
  },
  {
    label: "Two modules shared across two routes both end up in the shared chunk",
    source: `
      assertEqual(
        splitChunks({ "/home": ["react", "home-page", "utils"], "/about": ["react", "about-page", "utils"] }),
        { shared: ["react", "utils"], routes: { "/home": ["home-page"], "/about": ["about-page"] } }
      );
    `,
  },
];

const CLASSIFY_RESOURCE_LOADING_STRATEGY_TESTS: SandboxTest[] = [
  {
    label: "A plain script with no async/defer blocks rendering",
    source: `
      assert(typeof classifyResource === "function", "classifyResource is not defined");
      assertEqual(classifyResource({ tag: "script" }), "render-blocking");
    `,
  },
  {
    label: "A deferred script does not block rendering",
    source: `assertEqual(classifyResource({ tag: "script", defer: true }), "defer");`,
  },
  {
    label: "A preconnect hint is its own strategy, not a blocker",
    source: `assertEqual(classifyResource({ tag: "link", rel: "preconnect" }), "preconnect");`,
  },
  {
    label: "totalParseBlockingTime sums only the render-blocking resources' durations",
    source: `
      assert(typeof totalParseBlockingTime === "function", "totalParseBlockingTime is not defined");
      assertEqual(
        totalParseBlockingTime([
          { tag: "script", duration: 100 },
          { tag: "script", async: true, duration: 50 },
          { tag: "link", rel: "stylesheet", duration: 30 },
        ]),
        130
      );
    `,
  },
];

const RATE_CORE_WEB_VITALS_TESTS: SandboxTest[] = [
  {
    label: "LCP between 2500 and 4000ms is needs-improvement",
    source: `
      assert(typeof classifyMetric === "function", "classifyMetric is not defined");
      assertEqual(classifyMetric("LCP", 3000), "needs-improvement");
    `,
  },
  {
    label: "CLS over 0.25 is poor",
    source: `assertEqual(classifyMetric("CLS", 0.3), "poor");`,
  },
  {
    label: "All three good metrics rate the page good",
    source: `
      assert(typeof overallPageRating === "function", "overallPageRating is not defined");
      assertEqual(overallPageRating({ LCP: 2000, INP: 150, CLS: 0.05 }), "good");
    `,
  },
  {
    label: "A single poor metric makes the whole page poor",
    source: `assertEqual(overallPageRating({ LCP: 4500, INP: 150, CLS: 0.05 }), "poor");`,
  },
];

const FIND_FLAME_CHART_BOTTLENECK_TESTS: SandboxTest[] = [
  {
    label: "totalTime sums selfTime across the whole tree",
    source: `
      assert(typeof totalTime === "function", "totalTime is not defined");
      const trace = {
        name: "render", selfTime: 10,
        children: [
          { name: "computeList", selfTime: 200, children: [] },
          { name: "paint", selfTime: 5, children: [{ name: "reflow", selfTime: 15, children: [] }] },
        ],
      };
      assertEqual(totalTime(trace), 230);
    `,
  },
  {
    label: "findBottleneck finds the highest selfTime anywhere in the tree, not just at the top level",
    source: `
      assert(typeof findBottleneck === "function", "findBottleneck is not defined");
      const trace = {
        name: "render", selfTime: 10,
        children: [
          { name: "computeList", selfTime: 200, children: [] },
          { name: "paint", selfTime: 5, children: [{ name: "reflow", selfTime: 15, children: [] }] },
        ],
      };
      assertEqual(findBottleneck(trace), "computeList");
    `,
  },
];

const RENDER_STREAMED_CONTENT_ORDER_TESTS: SandboxTest[] = [
  {
    label: "Content keeps its shell position regardless of arrival order",
    source: `
      assert(typeof renderedContentAt === "function", "renderedContentAt is not defined");
      assertEqual(
        renderedContentAt(["header", "sidebar", "main", "footer"], ["footer", "header"]),
        ["header", "skeleton", "skeleton", "footer"]
      );
    `,
  },
  {
    label: "Nothing arrived yet means every slot is still a skeleton",
    source: `assertEqual(renderedContentAt(["a", "b", "c"], []), ["skeleton", "skeleton", "skeleton"]);`,
  },
  {
    label: "Once everything has arrived, the result matches the shell order exactly",
    source: `assertEqual(renderedContentAt(["a", "b", "c"], ["a", "b", "c"]), ["a", "b", "c"]);`,
  },
];

const CHECK_PERFORMANCE_BUDGET_TESTS: SandboxTest[] = [
  {
    label: "A metric under its budget passes",
    source: `
      assert(typeof checkBudget === "function", "checkBudget is not defined");
      assertEqual(
        checkBudget({ bundleSizeKb: 150 }, { bundleSizeKb: 170 }),
        [{ metric: "bundleSizeKb", actual: 150, budget: 170, passed: true }]
      );
    `,
  },
  {
    label: "A metric over its budget fails",
    source: `
      assertEqual(
        checkBudget({ bundleSizeKb: 180 }, { bundleSizeKb: 170 }),
        [{ metric: "bundleSizeKb", actual: 180, budget: 170, passed: false }]
      );
    `,
  },
  {
    label: "One failing metric fails the whole build, even if others pass",
    source: `
      assert(typeof overallBudgetStatus === "function", "overallBudgetStatus is not defined");
      assertEqual(
        overallBudgetStatus(checkBudget({ bundleSizeKb: 180, lcpMs: 2000 }, { bundleSizeKb: 170, lcpMs: 2500 })),
        "fail"
      );
    `,
  },
];

const FIND_CIRCULAR_COMPONENT_IMPORTS_TESTS: SandboxTest[] = [
  {
    label: "Detects a 3-node cycle",
    source: `
      assert(typeof findCycle === "function", "findCycle is not defined");
      assertEqual(findCycle({ A: ["B"], B: ["C"], C: ["A"] }), ["A", "B", "C", "A"]);
    `,
  },
  {
    label: "Returns null for a simple chain",
    source: `assertEqual(findCycle({ A: ["B"], B: ["C"], C: [] }), null);`,
  },
  {
    label: "Returns null with no edges at all",
    source: `assertEqual(findCycle({ A: [], B: [] }), null);`,
  },
];

const PLAN_FETCH_WATERFALL_TESTS: SandboxTest[] = [
  {
    label: "A linear chain produces one request per wave",
    source: `
      assert(typeof planFetchWaterfall === "function", "planFetchWaterfall is not defined");
      assertEqual(
        planFetchWaterfall([
          { name: "user", dependsOn: [] },
          { name: "posts", dependsOn: ["user"] },
          { name: "comments", dependsOn: ["posts"] },
        ]),
        [["user"], ["posts"], ["comments"]]
      );
    `,
  },
  {
    label: "Independent requests share the first wave",
    source: `
      assertEqual(
        planFetchWaterfall([
          { name: "user", dependsOn: [] },
          { name: "settings", dependsOn: [] },
          { name: "posts", dependsOn: ["user"] },
        ]),
        [["settings", "user"], ["posts"]]
      );
    `,
  },
];

const PICK_REALTIME_TRANSPORT_TESTS: SandboxTest[] = [
  {
    label: "Bidirectional always wins, regardless of frequency",
    source: `
      assert(typeof chooseTransport === "function", "chooseTransport is not defined");
      assertEqual(
        chooseTransport({ needsBidirectional: true, updateFrequencySec: 1, browserSupportRequired: "modern" }),
        "websocket"
      );
    `,
  },
  {
    label: "Frequent one-way updates pick SSE",
    source: `
      assertEqual(
        chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "modern" }),
        "sse"
      );
    `,
  },
  {
    label: "Infrequent updates fall back to polling",
    source: `
      assertEqual(
        chooseTransport({ needsBidirectional: false, updateFrequencySec: 60, browserSupportRequired: "modern" }),
        "polling"
      );
    `,
  },
  {
    label: "Legacy browser support forces polling even at high frequency",
    source: `
      assertEqual(
        chooseTransport({ needsBidirectional: false, updateFrequencySec: 2, browserSupportRequired: "legacy" }),
        "polling"
      );
    `,
  },
];

const MERGE_FEED_PAGE_TESTS: SandboxTest[] = [
  {
    label: "Duplicate ids across the boundary aren't repeated",
    source: `
      assert(typeof mergeFeedPage === "function", "mergeFeedPage is not defined");
      assertEqual(
        mergeFeedPage([{ id: 1 }, { id: 2 }], { items: [{ id: 2 }, { id: 3 }], nextCursor: "c3" }),
        { items: [{ id: 1 }, { id: 2 }, { id: 3 }], nextCursor: "c3" }
      );
    `,
  },
  {
    label: "An empty starting feed just takes the new page",
    source: `
      assertEqual(
        mergeFeedPage([], { items: [{ id: 1 }], nextCursor: "c1" }),
        { items: [{ id: 1 }], nextCursor: "c1" }
      );
    `,
  },
];

const TRANSFORM_INSERT_OPERATIONS_TESTS: SandboxTest[] = [
  {
    label: "A same-position concurrent insert shifts after the applied one",
    source: `
      assert(typeof transform === "function", "transform is not defined");
      assertEqual(transform({ pos: 5, text: "X" }, { pos: 5, text: "Y" }), { pos: 6, text: "Y" });
    `,
  },
  {
    label: "An insert before the applied position is left untouched",
    source: `assertEqual(transform({ pos: 5, text: "X" }, { pos: 2, text: "Y" }), { pos: 2, text: "Y" });`,
  },
  {
    label: "The shift amount always equals the applied op's text length",
    source: `assertEqual(transform({ pos: 2, text: "Hi" }, { pos: 5, text: "Y" }), { pos: 7, text: "Y" });`,
  },
];

const CLASSIFY_ARCHITECTURE_FIT_TESTS: SandboxTest[] = [
  {
    label: "A single team never needs more than a monolith",
    source: `
      assert(typeof classifyArchitectureFit === "function", "classifyArchitectureFit is not defined");
      assertEqual(classifyArchitectureFit({ teamCount: 1, independentDeployNeeded: false }), "monolith");
    `,
  },
  {
    label: "Multiple teams sharing a release cadence fit a monorepo",
    source: `assertEqual(classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: false }), "monorepo");`,
  },
  {
    label: "Independent deploy requirements push toward micro-frontends",
    source: `assertEqual(classifyArchitectureFit({ teamCount: 3, independentDeployNeeded: true }), "micro-frontend");`,
  },
];

const CLASSIFY_STATE_LAYER_TESTS: SandboxTest[] = [
  {
    label: "Server-owned data is always server state",
    source: `
      assert(typeof classifyStateLayer === "function", "classifyStateLayer is not defined");
      assertEqual(classifyStateLayer({ isServerData: true, isSharedAcrossRoutes: false }), "server");
    `,
  },
  {
    label: "Non-server state shared across routes is global",
    source: `assertEqual(classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: true }), "global");`,
  },
  {
    label: "Everything else defaults to local",
    source: `assertEqual(classifyStateLayer({ isServerData: false, isSharedAcrossRoutes: false }), "local");`,
  },
];

// Practice — standalone JavaScript Interview Roadmap (Feature 28 follow-up), Stage 1

const IMPROVE_FULL_NAME_FORMATTER_TESTS: SandboxTest[] = [
  {
    label: "Joins first and last",
    source: `
      assert(typeof getFullName === "function", "getFullName is not defined");
      assertEqual(getFullName({ first: "Ada", last: "Lovelace" }), "Ada Lovelace");
    `,
  },
  {
    label: "Skips an empty middle name",
    source: `assertEqual(getFullName({ first: "Ada", middle: "", last: "Lovelace" }), "Ada Lovelace");`,
  },
  {
    label: "Joins all three parts",
    source: `assertEqual(getFullName({ first: "Grace", middle: "Brewster", last: "Hopper" }), "Grace Brewster Hopper");`,
  },
  {
    label: "A single available part with no extra spaces",
    source: `assertEqual(getFullName({ last: "Turing" }), "Turing");`,
  },
];

const CLASSIFY_NULLISH_VALUE_TESTS: SandboxTest[] = [
  {
    label: "undefined is classified as undefined",
    source: `
      assert(typeof classifyNullish === "function", "classifyNullish is not defined");
      assertEqual(classifyNullish(undefined), "undefined");
    `,
  },
  { label: "null is classified as null", source: `assertEqual(classifyNullish(null), "null");` },
  { label: "0 is falsy but not nullish", source: `assertEqual(classifyNullish(0), "value");` },
  { label: "NaN is not nullish either", source: `assertEqual(classifyNullish(NaN), "value");` },
];

const CUSTOM_OBJECT_IS_TESTS: SandboxTest[] = [
  {
    label: "NaN is equal to itself",
    source: `
      assert(typeof myObjectIs === "function", "myObjectIs is not defined");
      assertEqual(myObjectIs(NaN, NaN), true);
    `,
  },
  { label: "+0 and -0 are not equal", source: `assertEqual(myObjectIs(0, -0), false);` },
  { label: "Identical primitives are equal", source: `assertEqual(myObjectIs(1, 1), true);` },
  { label: "Two different object references are never equal", source: `assertEqual(myObjectIs({}, {}), false);` },
];

const CUSTOM_OBJECT_CREATE_TESTS: SandboxTest[] = [
  {
    label: "The prototype is set to the given object",
    source: `
      assert(typeof myObjectCreate === "function", "myObjectCreate is not defined");
      const proto = { greet() { return "hi"; } };
      const obj = myObjectCreate(proto);
      assert(Object.getPrototypeOf(obj) === proto, "the prototype should be the exact object passed in");
    `,
  },
  {
    label: "Inherited methods are callable through the prototype",
    source: `
      const proto = { greet() { return "hi"; } };
      const obj = myObjectCreate(proto);
      assertEqual(obj.greet(), "hi");
    `,
  },
  {
    label: "A null prototype is preserved, not silently upgraded",
    source: `assert(Object.getPrototypeOf(myObjectCreate(null)) === null, "proto should stay null");`,
  },
  {
    label: "The new object has no own enumerable properties of its own",
    source: `assertEqual(Object.keys(myObjectCreate({ a: 1 })).length, 0);`,
  },
];

const CUSTOM_NEW_OPERATOR_TESTS: SandboxTest[] = [
  {
    label: "Constructs a linked instance with fields set",
    source: `
      assert(typeof myNew === "function", "myNew is not defined");
      function Person(name) { this.name = name; }
      Person.prototype.greet = function () { return "Hi " + this.name; };
      const p = myNew(Person, "Ada");
      assert(p instanceof Person, "result should be an instance of Person");
      assertEqual(p.greet(), "Hi Ada");
    `,
  },
  {
    label: "An object return value overrides the new instance",
    source: `
      function Weird() { return { custom: true }; }
      assertEqual(myNew(Weird), { custom: true });
    `,
  },
  {
    label: "A primitive return value is ignored",
    source: `
      function Prim() { this.x = 1; return 42; }
      assertEqual(myNew(Prim).x, 1);
    `,
  },
];

const CUSTOM_SPY_ON_TESTS: SandboxTest[] = [
  {
    label: "The real behavior still runs",
    source: `
      assert(typeof mySpyOn === "function", "mySpyOn is not defined");
      const obj = { add: (a, b) => a + b };
      const spy = mySpyOn(obj, "add");
      assertEqual(obj.add(2, 3), 5);
    `,
  },
  {
    label: "Call arguments are recorded",
    source: `
      const obj2 = { add: (a, b) => a + b };
      const spy2 = mySpyOn(obj2, "add");
      obj2.add(2, 3);
      assertEqual(spy2.calls, [[2, 3]]);
    `,
  },
  {
    label: "restore() puts the original method back",
    source: `
      const original = (a, b) => a + b;
      const obj3 = { add: original };
      const spy3 = mySpyOn(obj3, "add");
      spy3.restore();
      assert(obj3.add === original, "obj.add should be the exact original function again");
    `,
  },
];

const DETECT_DATA_TYPE_TESTS: SandboxTest[] = [
  {
    label: "An array is array, not object",
    source: `
      assert(typeof getType === "function", "getType is not defined");
      assertEqual(getType([]), "array");
    `,
  },
  { label: "null is its own category, not object", source: `assertEqual(getType(null), "null");` },
  { label: "A Date instance is date", source: `assertEqual(getType(new Date()), "date");` },
  { label: "A regex literal is regexp", source: `assertEqual(getType(/abc/), "regexp");` },
  { label: "A function is function", source: `assertEqual(getType(function () {}), "function");` },
];

const CUSTOM_FUNCTION_CALL_TESTS: SandboxTest[] = [
  {
    label: "this and the argument are forwarded correctly",
    source: `
      assert(typeof Function.prototype.myCall === "function", "Function.prototype.myCall is not defined");
      function getName(greeting) { return greeting + ", " + this.name; }
      assertEqual(getName.myCall({ name: "Ada" }, "Hello"), "Hello, Ada");
    `,
  },
  {
    label: "The context object isn't left with a leftover property",
    source: `
      function getName2(greeting) { return greeting + ", " + this.name; }
      const ctx = { name: "Grace" };
      getName2.myCall(ctx, "Hi");
      assertEqual(Object.keys(ctx), ["name"]);
    `,
  },
  {
    label: "Multiple arguments are forwarded in order",
    source: `
      function sum3(a, b, c) { return a + b + c; }
      assertEqual(sum3.myCall(null, 1, 2, 3), 6);
    `,
  },
];

const CUSTOM_FUNCTION_APPLY_TESTS: SandboxTest[] = [
  {
    label: "Array arguments are spread onto the call",
    source: `
      assert(typeof Function.prototype.myApply === "function", "Function.prototype.myApply is not defined");
      function getName(greeting) { return greeting + ", " + this.name; }
      assertEqual(getName.myApply({ name: "Ada" }, ["Hello"]), "Hello, Ada");
    `,
  },
  {
    label: "A missing args array calls the function with no arguments",
    source: `
      function noArgs() { return arguments.length; }
      assertEqual(noArgs.myApply({}), 0);
    `,
  },
  {
    label: "The context object isn't left with a leftover property",
    source: `
      function getName2(greeting) { return greeting + ", " + this.name; }
      const ctx = { name: "Grace" };
      getName2.myApply(ctx, ["Hi"]);
      assertEqual(Object.keys(ctx), ["name"]);
    `,
  },
];

const CUSTOM_FUNCTION_BIND_TESTS: SandboxTest[] = [
  {
    label: "this stays locked to the bound context",
    source: `
      assert(typeof Function.prototype.myBind === "function", "Function.prototype.myBind is not defined");
      function getThis() { return this; }
      const ctx = { id: 1 };
      const bound = getThis.myBind(ctx);
      assert(bound() === ctx, "this should be the bound context");
    `,
  },
  {
    label: "Preset arguments come before call-time arguments",
    source: `
      function greet(a, b) { return a + ", " + this.name + b; }
      const bound2 = greet.myBind({ name: "Ada" }, "Hello");
      assertEqual(bound2("!"), "Hello, Ada!");
    `,
  },
  {
    label: "Called with new, the bound context is ignored",
    source: `
      function Point(x, y) { this.x = x; this.y = y; }
      const BoundPoint = Point.myBind({}, 10);
      const p = new BoundPoint(20);
      assertEqual(p.x, 10);
      assertEqual(p.y, 20);
      assert(p instanceof Point, "the new instance should still be an instance of Point");
    `,
  },
];

const CUSTOM_INSTANCEOF_TESTS: SandboxTest[] = [
  {
    label: "An array is an instance of Array",
    source: `
      assert(typeof myInstanceof === "function", "myInstanceof is not defined");
      assertEqual(myInstanceof([], Array), true);
    `,
  },
  {
    label: "An array is also an instance of Object, further up the chain",
    source: `assertEqual(myInstanceof([], Object), true);`,
  },
  {
    label: "A plain object is not an instance of Array",
    source: `assertEqual(myInstanceof({}, Array), false);`,
  },
  {
    label: "A primitive is never an instance of anything",
    source: `assertEqual(myInstanceof(5, Number), false);`,
  },
];

const ES5_CLASS_EXTENDS_TESTS: SandboxTest[] = [
  {
    label: "Inherited methods are reachable",
    source: `
      assert(typeof es5Extend === "function", "es5Extend is not defined");
      function Animal(name) { this.name = name; }
      Animal.prototype.speak = function () { return this.name + " makes a sound."; };
      function Dog(name) { Animal.call(this, name); }
      es5Extend(Dog, Animal);
      globalThis.__Animal2 = Animal;
      globalThis.__Dog2 = Dog;
      assertEqual(new Dog("Rex").speak(), "Rex makes a sound.");
    `,
  },
  {
    label: "Child's own method takes priority",
    source: `
      const Dog = globalThis.__Dog2;
      Dog.prototype.speak = function () { return this.name + " barks."; };
      assertEqual(new Dog("Rex").speak(), "Rex barks.");
    `,
  },
  {
    label: "constructor points back to Child",
    source: `
      const Dog = globalThis.__Dog2;
      assertEqual(new Dog("Rex").constructor, Dog);
    `,
  },
  {
    label: "instanceof recognizes the prototype chain",
    source: `
      const Dog = globalThis.__Dog2;
      const Animal = globalThis.__Animal2;
      assert(new Dog("Rex") instanceof Animal, "a Dog instance should be recognized as an Animal instance");
    `,
  },
];

const MINI_EXPECT_MATCHER_TESTS: SandboxTest[] = [
  {
    label: "Matching values pass",
    source: `
      assert(typeof expect === "function", "expect is not defined");
      let threw = false;
      try { expect(1).toBe(1); } catch (e) { threw = true; }
      assertEqual(threw, false);
    `,
  },
  {
    label: "Mismatched values throw",
    source: `
      let threw2 = false;
      try { expect(1).toBe(2); } catch (e) { threw2 = true; }
      assertEqual(threw2, true);
    `,
  },
  {
    label: "Uses Object.is semantics, so NaN matches itself",
    source: `
      let threw3 = false;
      try { expect(NaN).toBe(NaN); } catch (e) { threw3 = true; }
      assertEqual(threw3, false);
    `,
  },
  {
    label: "not.toBe passes when values differ",
    source: `
      let threw4 = false;
      try { expect(1).not.toBe(2); } catch (e) { threw4 = true; }
      assertEqual(threw4, false);
    `,
  },
  {
    label: "not.toBe throws when values match",
    source: `
      let threw5 = false;
      try { expect(1).not.toBe(1); } catch (e) { threw5 = true; }
      assertEqual(threw5, true);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 2

const BUILD_COUNTER_OBJECT_TESTS: SandboxTest[] = [
  {
    label: "Default step increments by 1",
    source: `
      assert(typeof createCounter === "function", "createCounter is not defined");
      assertEqual(createCounter().increment().increment().get(), 2);
    `,
  },
  {
    label: "A custom step is respected",
    source: `assertEqual(createCounter().decrement(5).get(), -5);`,
  },
  {
    label: "reset() returns to the starting value",
    source: `assertEqual(createCounter(10).increment(3).reset().get(), 10);`,
  },
  {
    label: "Every method returns the counter itself for chaining",
    source: `
      const c = createCounter();
      const result = c.increment();
      assert(result === c, "increment() should return the same counter object");
    `,
  },
];

const BUILD_COUNT_FUNCTION_TESTS: SandboxTest[] = [
  {
    label: "Each call returns the next integer",
    source: `
      assert(typeof createCountFunction === "function", "createCountFunction is not defined");
      const count = createCountFunction();
      assertEqual([count(), count(), count()], [1, 2, 3]);
    `,
  },
  {
    label: "reset() starts the sequence over",
    source: `
      const count2 = createCountFunction();
      count2(); count2();
      count2.reset();
      assertEqual(count2(), 1);
    `,
  },
  {
    label: "Separate instances don't share state",
    source: `
      const a = createCountFunction();
      const b = createCountFunction();
      a(); a();
      assertEqual(b(), 1);
    `,
  },
];

const IMPLEMENT_PIPE_COMPOSITION_TESTS: SandboxTest[] = [
  {
    label: "Runs functions left to right",
    source: `
      assert(typeof pipe === "function", "pipe is not defined");
      assertEqual(pipe((x) => x + 1, (x) => x * 2)(3), 8);
    `,
  },
  { label: "No functions acts as the identity", source: `assertEqual(pipe()(5), 5);` },
  { label: "Works for a single function too", source: `assertEqual(pipe((x) => x.toUpperCase())("hi"), "HI");` },
];

const LODASH_ONCE_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "The wrapped function only runs once",
    source: `
      assert(typeof once === "function", "once is not defined");
      let calls = 0;
      const fn = once(() => { calls++; return "ready"; });
      fn(); fn(); fn(); fn(); fn();
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Later calls return the cached result regardless of new arguments",
    source: `
      const fn2 = once((n) => n * 10);
      const first = fn2(1);
      const second = fn2(999);
      assertEqual(second, first);
    `,
  },
  {
    label: "this is forwarded on the call that actually runs",
    source: `
      const obj = {};
      let capturedThis;
      obj.method = once(function () { capturedThis = this; });
      obj.method();
      assert(capturedThis === obj, "this should be the object the wrapped method was called on");
    `,
  },
];

const CURRY_CLASSIC_TESTS: SandboxTest[] = [
  {
    label: "One argument at a time",
    source: `
      assert(typeof curry === "function", "curry is not defined");
      function multiply(a, b) { return a * b; }
      assertEqual(curry(multiply)(2)(3), 6);
    `,
  },
  {
    label: "All arguments at once also works",
    source: `
      function multiply2(a, b) { return a * b; }
      assertEqual(curry(multiply2)(2, 3), 6);
    `,
  },
  {
    label: "Works for any arity, driven by fn.length",
    source: `
      function add4(a, b, c, d) { return a + b + c + d; }
      assertEqual(curry(add4)(1)(2)(3)(4), 10);
    `,
  },
];

const CURRY_WITH_PLACEHOLDER_TESTS: SandboxTest[] = [
  {
    label: "Works exactly like plain curry with no placeholders",
    source: `
      assert(typeof curryWithPlaceholder === "function", "curryWithPlaceholder is not defined");
      const combine = curryWithPlaceholder((a, b, c) => a * 100 + b * 10 + c);
      assertEqual(combine(1)(2)(3), 123);
    `,
  },
  {
    label: "A placeholder in the middle is filled by the next call",
    source: `
      const _ = curryWithPlaceholder.PLACEHOLDER;
      const combine2 = curryWithPlaceholder((a, b, c) => a * 100 + b * 10 + c);
      assertEqual(combine2(1, _, 3)(2), 123);
    `,
  },
  {
    label: "A leading placeholder is filled first, extra args are appended after",
    source: `
      const _2 = curryWithPlaceholder.PLACEHOLDER;
      const combine3 = curryWithPlaceholder((a, b, c) => a * 100 + b * 10 + c);
      assertEqual(combine3(_2, 2)(1, 3), 123);
    `,
  },
];

const CHAINABLE_CURRIED_SUM_TESTS: SandboxTest[] = [
  {
    label: "A trailing empty call returns the total",
    source: `
      assert(typeof sum === "function", "sum is not defined");
      assertEqual(sum(1)(2)(3)(), 6);
    `,
  },
  {
    label: "valueOf lets it coerce to a number directly",
    source: `assertEqual(Number(sum(1)(2)(3)), 6);`,
  },
  {
    label: "A single argument with no chaining still works",
    source: `assertEqual(sum(5)(), 5);`,
  },
];

const GENERAL_MEMOIZATION_TESTS: SandboxTest[] = [
  {
    label: "Repeated identical calls hit the cache",
    source: `
      assert(typeof memo === "function", "memo is not defined");
      let calls = 0;
      const slowDouble = memo((n) => { calls++; return n * 2; });
      slowDouble(4);
      slowDouble(4);
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Different arguments are cached separately",
    source: `
      let calls2 = 0;
      const slowDouble2 = memo((n) => { calls2++; return n * 2; });
      slowDouble2(4);
      slowDouble2(5);
      assertEqual(calls2, 2);
    `,
  },
  {
    label: "The cached value is correct, not just present",
    source: `
      const slowDouble3 = memo((n) => n * 2);
      slowDouble3(4);
      assertEqual(slowDouble3(4), 8);
    `,
  },
];

const MEMOIZE_ONE_TESTS: SandboxTest[] = [
  {
    label: "Consecutive identical calls reuse the cache",
    source: `
      assert(typeof memoizeOne === "function", "memoizeOne is not defined");
      let calls = 0;
      const fn = memoizeOne((a, b) => { calls++; return a + b; });
      fn(1, 2);
      fn(1, 2);
      assertEqual(calls, 1);
    `,
  },
  {
    label: "A different call in between forces recomputation, even for previously-seen args",
    source: `
      let calls2 = 0;
      const fn2 = memoizeOne((a, b) => { calls2++; return a + b; });
      fn2(1, 2);
      fn2(3, 4);
      fn2(1, 2);
      assertEqual(calls2, 3);
    `,
  },
  {
    label: "Works correctly for primitive arguments, not just numbers",
    source: `
      let calls3 = 0;
      const fn3 = memoizeOne((s) => { calls3++; return s.toUpperCase(); });
      fn3("a");
      fn3("a");
      assertEqual(calls3, 1);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 3

const SHUFFLE_ARRAY_FISHER_YATES_TESTS: SandboxTest[] = [
  {
    label: "The result has the same length as the input",
    source: `
      assert(typeof shuffle === "function", "shuffle is not defined");
      assertEqual(shuffle([1, 2, 3, 4, 5]).length, 5);
    `,
  },
  {
    label: "The result contains exactly the same elements, just reordered",
    source: `
      const result = shuffle([1, 2, 3, 4, 5]);
      assertEqual([...result].sort(), [1, 2, 3, 4, 5]);
    `,
  },
  {
    label: "The original array is never mutated",
    source: `
      const arr = [1, 2, 3, 4, 5];
      shuffle(arr);
      assertEqual(arr, [1, 2, 3, 4, 5]);
    `,
  },
];

const ARRAY_PROTOTYPE_FILTER_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Keeps only elements matching the predicate",
    source: `
      assert(typeof Array.prototype.myFilter === "function", "Array.prototype.myFilter is not defined");
      assertEqual([1, 2, 3, 4].myFilter((x) => x % 2 === 0), [2, 4]);
    `,
  },
  {
    label: "The index is forwarded as the callback's second argument",
    source: `assertEqual([10, 20].myFilter((v, i) => i === 0), [10]);`,
  },
  {
    label: "A hole in a sparse array is skipped, not treated as undefined",
    source: `
      const sparse = [1, , 3];
      assertEqual(sparse.myFilter(() => true).length, 2);
    `,
  },
];

const ARRAY_PROTOTYPE_MAP_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Transforms every element",
    source: `
      assert(typeof Array.prototype.myMap === "function", "Array.prototype.myMap is not defined");
      assertEqual([1, 2, 3].myMap((x) => x * 2), [2, 4, 6]);
    `,
  },
  {
    label: "thisArg becomes this inside the callback",
    source: `assertEqual([1].myMap(function () { return this.mult; }, { mult: 5 }), [5]);`,
  },
  {
    label: "Holes in the input stay holes in the output",
    source: `
      const sparse = [1, , 3];
      const mapped = sparse.myMap((x) => x);
      assertEqual(mapped.length, 3);
      assert(!(1 in mapped), "index 1 should still be a hole in the output");
    `,
  },
];

const ARRAY_PROTOTYPE_REDUCE_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Sums with an explicit initial value",
    source: `
      assert(typeof Array.prototype.myReduce === "function", "Array.prototype.myReduce is not defined");
      assertEqual([1, 2, 3, 4].myReduce((a, b) => a + b, 0), 10);
    `,
  },
  {
    label: "Uses the first element as the initial value when omitted",
    source: `assertEqual([1, 2, 3, 4].myReduce((a, b) => a + b), 10);`,
  },
  {
    label: "An empty array with an initial value just returns it",
    source: `assertEqual([].myReduce((a, b) => a + b, 5), 5);`,
  },
  {
    label: "An empty array with no initial value throws",
    source: `
      let threw = false;
      try { [].myReduce((a, b) => a + b); } catch (e) { threw = true; }
      assert(threw, "myReduce on an empty array with no initial value should throw");
    `,
  },
];

const ARRAY_PROTOTYPE_FLAT_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Default depth of 1 flattens only the top level",
    source: `
      assert(typeof Array.prototype.myFlat === "function", "Array.prototype.myFlat is not defined");
      assertEqual([1, [2, 3], [4, [5, 6]]].myFlat(), [1, 2, 3, 4, [5, 6]]);
    `,
  },
  {
    label: "Infinity flattens every level",
    source: `assertEqual([1, [2, [3, [4]]]].myFlat(Infinity), [1, 2, 3, 4]);`,
  },
  {
    label: "A depth of 0 does nothing",
    source: `assertEqual([1, [2]].myFlat(0), [1, [2]]);`,
  },
];

const ARRAY_PROTOTYPE_FLATMAP_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Maps and flattens in one pass",
    source: `
      assert(typeof Array.prototype.myFlatMap === "function", "Array.prototype.myFlatMap is not defined");
      assertEqual([1, 2, 3].myFlatMap((x) => [x, x * 2]), [1, 2, 2, 4, 3, 6]);
    `,
  },
  {
    label: "Only flattens one level, however deep the mapped result is",
    source: `assertEqual([1, 2].myFlatMap((x) => [[x]]), [[1], [2]]);`,
  },
  {
    label: "Non-array return values pass through unchanged",
    source: `assertEqual([1, 2].myFlatMap((x) => x * 10), [10, 20]);`,
  },
];

const OBJECT_ASSIGN_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Merges every source onto the target",
    source: `
      assert(typeof myObjectAssign === "function", "myObjectAssign is not defined");
      assertEqual(myObjectAssign({ a: 1 }, { b: 2 }, { c: 3 }), { a: 1, b: 2, c: 3 });
    `,
  },
  {
    label: "A later source overwrites an earlier one",
    source: `assertEqual(myObjectAssign({}, { a: 1 }, { a: 2 }), { a: 2 });`,
  },
  {
    label: "Mutates and returns the exact same target reference",
    source: `
      const t = {};
      const returned = myObjectAssign(t, { x: 1 });
      assert(returned === t, "myObjectAssign should return the same target object");
    `,
  },
  {
    label: "null/undefined sources are skipped harmlessly",
    source: `assertEqual(myObjectAssign({ a: 1 }, null, undefined), { a: 1 });`,
  },
];

const COMPLETE_ASSIGN_DESCRIPTORS_TESTS: SandboxTest[] = [
  {
    label: "A copied getter still produces the right value",
    source: `
      assert(typeof completeAssign === "function", "completeAssign is not defined");
      const result = completeAssign({}, { get double() { return 4; } });
      assertEqual(result.double, 4);
    `,
  },
  {
    label: "The property stays a real getter, not a plain value",
    source: `
      const result2 = completeAssign({}, { get double() { return 4; } });
      const descriptor = Object.getOwnPropertyDescriptor(result2, "double");
      assertEqual(typeof descriptor.get, "function");
    `,
  },
  {
    label: "Only enumerable own properties are copied",
    source: `
      const source = Object.defineProperty({}, "hidden", { value: 1, enumerable: false });
      const result3 = completeAssign({}, source);
      assertEqual(result3.hidden, undefined);
    `,
  },
];

const OBJECT_GROUP_BY_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Groups items by the callback's key",
    source: `
      assert(typeof myGroupBy === "function", "myGroupBy is not defined");
      assertEqual(myGroupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd")), { odd: [1, 3], even: [2, 4] });
    `,
  },
  {
    label: "Preserves each item's original relative order within its group",
    source: `assertEqual(myGroupBy(["aa", "b", "cc"], (s) => s.length), { 2: ["aa", "cc"], 1: ["b"] });`,
  },
  {
    label: "An empty input produces an empty result",
    source: `assertEqual(myGroupBy([], () => "x"), {});`,
  },
];

const LODASH_GET_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Reads a deeply nested value with a dot path",
    source: `
      assert(typeof myGet === "function", "myGet is not defined");
      assertEqual(myGet({ a: { b: { c: 42 } } }, "a.b.c"), 42);
    `,
  },
  {
    label: "Bracket notation reaches into an array",
    source: `assertEqual(myGet({ a: [{ b: 1 }] }, "a[0].b"), 1);`,
  },
  {
    label: "A missing path returns the default instead of throwing",
    source: `assertEqual(myGet({ a: 1 }, "x.y.z", "fallback"), "fallback");`,
  },
  {
    label: "An array path works the same as a string path",
    source: `assertEqual(myGet({ a: { b: 2 } }, ["a", "b"]), 2);`,
  },
];

const LODASH_SET_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Creates every missing intermediate object",
    source: `
      assert(typeof mySet === "function", "mySet is not defined");
      assertEqual(mySet({}, "a.b.c", 42), { a: { b: { c: 42 } } });
    `,
  },
  {
    label: "A numeric segment creates an array, not an object",
    source: `assertEqual(mySet({}, "a[0].b", 1), { a: [{ b: 1 }] });`,
  },
  {
    label: "Overwrites an existing value at the path",
    source: `assertEqual(mySet({ a: { b: 1 } }, "a.b", 2), { a: { b: 2 } });`,
  },
];

const LODASH_PARTIAL_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Preset arguments come before the call-time ones",
    source: `
      assert(typeof myPartial === "function", "myPartial is not defined");
      function greet(greeting, name) { return greeting + ", " + name + "!"; }
      assertEqual(myPartial(greet, "Hello")("Ada"), "Hello, Ada!");
    `,
  },
  {
    label: "Multiple preset arguments work",
    source: `
      function add3(a, b, c) { return a + b + c; }
      assertEqual(myPartial(add3, 1, 2)(3), 6);
    `,
  },
  {
    label: "this is forwarded from the eventual call site",
    source: `
      const obj = { base: 10, method: null };
      obj.method = myPartial(function (x) { return this.base + x; }, 5);
      assertEqual(obj.method(), 15);
    `,
  },
];

const LODASH_CHUNK_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "The last chunk holds the remainder",
    source: `
      assert(typeof myChunk === "function", "myChunk is not defined");
      assertEqual(myChunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    `,
  },
  {
    label: "Divides evenly when the length is a multiple of size",
    source: `assertEqual(myChunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);`,
  },
  {
    label: "A size larger than the array produces a single chunk",
    source: `assertEqual(myChunk([1, 2], 5), [[1, 2]]);`,
  },
  {
    label: "A size under 1 produces no chunks",
    source: `assertEqual(myChunk([1, 2, 3], 0), []);`,
  },
];

const LODASH_IS_EQUAL_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Deeply equal nested objects match",
    source: `
      assert(typeof myIsEqual === "function", "myIsEqual is not defined");
      assertEqual(myIsEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }), true);
    `,
  },
  {
    label: "A differing value at any depth breaks equality",
    source: `assertEqual(myIsEqual({ a: 1 }, { a: 2 }), false);`,
  },
  {
    label: "Arrays are compared element by element",
    source: `assertEqual(myIsEqual([1, 2, 3], [1, 2, 3]), true);`,
  },
  {
    label: "Uses Object.is semantics, so NaN equals itself",
    source: `assertEqual(myIsEqual(NaN, NaN), true);`,
  },
];

const LODASH_CLONE_DEEP_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Mutating the clone never affects the original, at any depth",
    source: `
      assert(typeof myCloneDeep === "function", "myCloneDeep is not defined");
      const original = { nested: { x: 1 } };
      const clone = myCloneDeep(original);
      clone.nested.x = 999;
      assertEqual(original.nested.x, 1);
    `,
  },
  {
    label: "Nested arrays are cloned too, not shared by reference",
    source: `
      const original2 = [1, [2, 3]];
      const clone2 = myCloneDeep(original2);
      assert(clone2[1] !== original2[1], "the nested array should be a genuine copy");
    `,
  },
  {
    label: "A Date instance is cloned as a real new Date with the same time",
    source: `
      const date = new Date(2020, 0, 1);
      const clonedDate = myCloneDeep(date);
      assert(clonedDate instanceof Date, "the clone should still be a Date instance");
      assertEqual(clonedDate.getTime(), date.getTime());
    `,
  },
  {
    label: "Primitives pass through unchanged",
    source: `assertEqual(myCloneDeep(42), 42);`,
  },
];

const IMMUTABILITY_UPDATE_HELPER_TESTS: SandboxTest[] = [
  {
    label: "$set replaces a nested value",
    source: `
      assert(typeof update === "function", "update is not defined");
      assertEqual(update({ a: 1 }, { a: { $set: 2 } }), { a: 2 });
    `,
  },
  {
    label: "$push appends without mutating the original array",
    source: `
      const arr = [1, 2, 3];
      const result = update(arr, { $push: [4] });
      assertEqual(result, [1, 2, 3, 4]);
      assertEqual(arr, [1, 2, 3]);
    `,
  },
  {
    label: "Commands recurse correctly through nested paths",
    source: `assertEqual(update({ a: { b: 1 } }, { a: { b: { $set: 2 } } }), { a: { b: 2 } });`,
  },
  {
    label: "$merge shallow-merges new keys",
    source: `assertEqual(update({ a: 1, b: 2 }, { $merge: { b: 3, c: 4 } }), { a: 1, b: 3, c: 4 });`,
  },
  {
    label: "The source value is never mutated",
    source: `
      const original = { a: 1 };
      update(original, { a: { $set: 2 } });
      assertEqual(original, { a: 1 });
    `,
  },
];

const MINI_IMMER_PRODUCE_TESTS: SandboxTest[] = [
  {
    label: "Mutating the draft produces the updated value",
    source: `
      assert(typeof produce === "function", "produce is not defined");
      assertEqual(produce({ count: 1 }, (draft) => { draft.count++; }), { count: 2 });
    `,
  },
  {
    label: "The base object is never mutated",
    source: `
      const base = { count: 1 };
      produce(base, (draft) => { draft.count++; });
      assertEqual(base.count, 1);
    `,
  },
  {
    label: "Nested mutations are also isolated from the base",
    source: `
      const base2 = { a: { b: 1 } };
      const next = produce(base2, (draft) => { draft.a.b = 99; });
      assertEqual(next, { a: { b: 99 } });
      assertEqual(base2.a.b, 1);
    `,
  },
  {
    label: "Array mutations inside the recipe work too",
    source: `
      const base3 = { items: [1, 2] };
      const next3 = produce(base3, (draft) => { draft.items.push(3); });
      assertEqual(next3, { items: [1, 2, 3] });
      assertEqual(base3.items.length, 2);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 4

const COUNT_BINARY_ONES_TESTS: SandboxTest[] = [
  {
    label: "7 is 111 in binary",
    source: `
      assert(typeof countBinaryOnes === "function", "countBinaryOnes is not defined");
      assertEqual(countBinaryOnes(7), 3);
    `,
  },
  { label: "8 is 1000 in binary", source: `assertEqual(countBinaryOnes(8), 1);` },
  { label: "0 has no set bits", source: `assertEqual(countBinaryOnes(0), 0);` },
  { label: "255 is eight 1s in binary", source: `assertEqual(countBinaryOnes(255), 8);` },
];

const COMPRESS_STRING_RLE_TESTS: SandboxTest[] = [
  {
    label: "Runs of 2+ get their count appended",
    source: `
      assert(typeof compressString === "function", "compressString is not defined");
      assertEqual(compressString("aaabbbccd"), "a3b3c2d");
    `,
  },
  { label: "A single long run compresses well", source: `assertEqual(compressString("aaaa"), "a4");` },
  {
    label: "Returns the original when compression doesn't shrink it",
    source: `assertEqual(compressString("aabbcc"), "aabbcc");`,
  },
];

const FIRST_DUPLICATE_CHARACTER_TESTS: SandboxTest[] = [
  {
    label: "b's second occurrence comes before a's",
    source: `
      assert(typeof firstDuplicateChar === "function", "firstDuplicateChar is not defined");
      assertEqual(firstDuplicateChar("abcba"), "b");
    `,
  },
  { label: "No repeats returns null", source: `assertEqual(firstDuplicateChar("abcdef"), null);` },
  { label: "a repeats immediately", source: `assertEqual(firstDuplicateChar("aabbcc"), "a");` },
];

const ROMAN_TO_INTEGER_TESTS: SandboxTest[] = [
  {
    label: "A purely additive case",
    source: `
      assert(typeof romanToInt === "function", "romanToInt is not defined");
      assertEqual(romanToInt("III"), 3);
    `,
  },
  { label: "A smaller symbol before a larger one subtracts", source: `assertEqual(romanToInt("IV"), 4);` },
  { label: "Mixed additive symbols: L + V + III", source: `assertEqual(romanToInt("LVIII"), 58);` },
  { label: "Multiple subtractive pairs in one numeral", source: `assertEqual(romanToInt("MCMXCIV"), 1994);` },
];

const INTEGER_TO_ROMAN_TESTS: SandboxTest[] = [
  {
    label: "A purely additive case",
    source: `
      assert(typeof intToRoman === "function", "intToRoman is not defined");
      assertEqual(intToRoman(3), "III");
    `,
  },
  { label: "Mixed additive symbols", source: `assertEqual(intToRoman(58), "LVIII");` },
  { label: "Multiple subtractive pairs", source: `assertEqual(intToRoman(1994), "MCMXCIV");` },
];

const SEMVER_COMPARE_TESTS: SandboxTest[] = [
  {
    label: "A smaller patch version is less than",
    source: `
      assert(typeof compareSemver === "function", "compareSemver is not defined");
      assertEqual(compareSemver("1.2.3", "1.2.4"), -1);
    `,
  },
  {
    label: "A higher major version wins regardless of the rest",
    source: `assertEqual(compareSemver("2.0.0", "1.9.9"), 1);`,
  },
  { label: "Identical versions are equal", source: `assertEqual(compareSemver("1.0.0", "1.0.0"), 0);` },
  {
    label: "Minor versions compare numerically, not as strings",
    source: `assertEqual(compareSemver("1.10.0", "1.9.0"), 1);`,
  },
];

const REORDER_ARRAY_WITH_INDEXES_TESTS: SandboxTest[] = [
  {
    label: "Each element moves to its target index",
    source: `
      assert(typeof reorder === "function", "reorder is not defined");
      assertEqual(reorder(["a", "b", "c"], [2, 0, 1]), ["b", "c", "a"]);
    `,
  },
  { label: "Identity indices leave the array unchanged", source: `assertEqual(reorder([1, 2, 3], [0, 1, 2]), [1, 2, 3]);` },
  { label: "A simple two-element swap", source: `assertEqual(reorder(["x", "y"], [1, 0]), ["y", "x"]);` },
];

const MOST_FREQUENT_CHARACTER_TESTS: SandboxTest[] = [
  {
    label: "The character with the clear highest count wins",
    source: `
      assert(typeof mostFrequentChar === "function", "mostFrequentChar is not defined");
      assertEqual(mostFrequentChar("aabbbcc"), "b");
    `,
  },
  {
    label: "On a tie, the character appearing first in the string wins",
    source: `assertEqual(mostFrequentChar("abcabc"), "a");`,
  },
  { label: "An empty string returns null", source: `assertEqual(mostFrequentChar(""), null);` },
];

const ADD_COMMAS_TO_NUMBER_TESTS: SandboxTest[] = [
  {
    label: "Groups digits in threes from the right",
    source: `
      assert(typeof addCommas === "function", "addCommas is not defined");
      assertEqual(addCommas(1234567), "1,234,567");
    `,
  },
  { label: "The negative sign stays outside the grouping", source: `assertEqual(addCommas(-1234), "-1,234");` },
  { label: "Fewer than four digits needs no comma", source: `assertEqual(addCommas(999), "999");` },
  { label: "The decimal part is untouched by grouping", source: `assertEqual(addCommas(1234.56), "1,234.56");` },
];

const HEX_TO_RGBA_TESTS: SandboxTest[] = [
  {
    label: "Full-length hex with default alpha",
    source: `
      assert(typeof hexToRgba === "function", "hexToRgba is not defined");
      assertEqual(hexToRgba("#FF0000"), "rgba(255, 0, 0, 1)");
    `,
  },
  { label: "A custom alpha is used as-is", source: `assertEqual(hexToRgba("#00FF00", 0.5), "rgba(0, 255, 0, 0.5)");` },
  { label: "Shorthand 3-digit hex expands each digit", source: `assertEqual(hexToRgba("#03F"), "rgba(0, 51, 255, 1)");` },
];

const SNAKE_TO_CAMEL_CASE_TESTS: SandboxTest[] = [
  {
    label: "A single underscore boundary",
    source: `
      assert(typeof snakeToCamel === "function", "snakeToCamel is not defined");
      assertEqual(snakeToCamel("hello_world"), "helloWorld");
    `,
  },
  { label: "Multiple underscore boundaries", source: `assertEqual(snakeToCamel("user_first_name"), "userFirstName");` },
  { label: "A string with no underscores is unchanged", source: `assertEqual(snakeToCamel("already"), "already");` },
];

const NEGATIVE_ARRAY_INDEX_GET_TESTS: SandboxTest[] = [
  {
    label: "-1 is the last element",
    source: `
      assert(typeof getAt === "function", "getAt is not defined");
      assertEqual(getAt([1, 2, 3], -1), 3);
    `,
  },
  { label: "A non-negative index behaves normally", source: `assertEqual(getAt([1, 2, 3], 0), 1);` },
  { label: "-3 reaches all the way to the first element", source: `assertEqual(getAt([1, 2, 3], -3), 1);` },
  { label: "An index still out of range returns undefined", source: `assertEqual(getAt([1, 2, 3], -10), undefined);` },
];

const STRING_TRIM_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Strips leading and trailing spaces",
    source: `
      assert(typeof String.prototype.myTrim === "function", "String.prototype.myTrim is not defined");
      assertEqual("  hi  ".myTrim(), "hi");
    `,
  },
  {
    label: "Strips tabs and newlines too",
    source: `assertEqual("\\t\\nhello\\n".myTrim(), "hello");`,
  },
  {
    label: "A string with no surrounding whitespace is unchanged",
    source: `assertEqual("noSpaces".myTrim(), "noSpaces");`,
  },
];

const VALIDATE_IP_ADDRESS_TESTS: SandboxTest[] = [
  {
    label: "A well-formed address is valid",
    source: `
      assert(typeof isValidIp === "function", "isValidIp is not defined");
      assertEqual(isValidIp("192.168.1.1"), true);
    `,
  },
  { label: "An octet over 255 is invalid", source: `assertEqual(isValidIp("256.1.1.1"), false);` },
  { label: "A leading zero on a multi-digit octet is invalid", source: `assertEqual(isValidIp("01.1.1.1"), false);` },
  { label: "Fewer than four octets is invalid", source: `assertEqual(isValidIp("1.1.1"), false);` },
];

const REMOVE_DUPLICATE_CHARACTERS_TESTS: SandboxTest[] = [
  {
    label: "Only the first occurrence of each letter survives",
    source: `
      assert(typeof removeDuplicateChars === "function", "removeDuplicateChars is not defined");
      assertEqual(removeDuplicateChars("mississippi"), "misp");
    `,
  },
  { label: "Adjacent duplicates collapse too", source: `assertEqual(removeDuplicateChars("aabbcc"), "abc");` },
  { label: "An empty string stays empty", source: `assertEqual(removeDuplicateChars(""), "");` },
];

const VALIDATE_NUMBER_STRING_TESTS: SandboxTest[] = [
  {
    label: "A plain integer is valid",
    source: `
      assert(typeof isValidNumberString === "function", "isValidNumberString is not defined");
      assertEqual(isValidNumberString("123"), true);
    `,
  },
  { label: "A signed decimal is valid", source: `assertEqual(isValidNumberString("-12.5"), true);` },
  {
    label: "A trailing decimal point with no digits after it is invalid",
    source: `assertEqual(isValidNumberString("12."), false);`,
  },
  { label: "Non-numeric text is invalid", source: `assertEqual(isValidNumberString("abc"), false);` },
  { label: "A leading decimal point with digits after it is valid", source: `assertEqual(isValidNumberString(".5"), true);` },
];

const REMOVE_CHARACTERS_TESTS: SandboxTest[] = [
  {
    label: "Removes every occurrence of each character in the set",
    source: `
      assert(typeof removeChars === "function", "removeChars is not defined");
      assertEqual(removeChars("hello world", "lo"), "he wrd");
    `,
  },
  {
    label: "An empty removal set leaves the string unchanged",
    source: `assertEqual(removeChars("abcdef", ""), "abcdef");`,
  },
  { label: "Removing every character leaves an empty string", source: `assertEqual(removeChars("aaa", "a"), "");` },
];

const UNCOMPRESS_STRING_RLE_TESTS: SandboxTest[] = [
  {
    label: "Expands counted runs, and an uncounted trailing character",
    source: `
      assert(typeof uncompressString === "function", "uncompressString is not defined");
      assertEqual(uncompressString("a3b2c"), "aaabbc");
    `,
  },
  { label: "Handles a multi-digit count correctly", source: `assertEqual(uncompressString("a10"), "aaaaaaaaaa");` },
  { label: "No counts at all means every character appears once", source: `assertEqual(uncompressString("abc"), "abc");` },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 5

const CLEAR_ALL_TIMEOUT_REGISTRY_TESTS: SandboxTest[] = [
  {
    label: "Cancels every previously scheduled timeout",
    source: `
      assert(typeof trackedSetTimeout === "function", "trackedSetTimeout is not defined");
      assert(typeof clearAllTimeout === "function", "clearAllTimeout is not defined");
      clearAllTimeout();
      let calls = 0;
      trackedSetTimeout(() => calls++, 20);
      trackedSetTimeout(() => calls++, 20);
      trackedSetTimeout(() => calls++, 20);
      clearAllTimeout();
      await delay(50);
      assertEqual(calls, 0);
    `,
  },
  {
    label: "Doesn't affect timeouts scheduled afterward",
    source: `
      clearAllTimeout();
      let calls2 = 0;
      trackedSetTimeout(() => calls2++, 20);
      clearAllTimeout();
      trackedSetTimeout(() => calls2++, 20);
      await delay(50);
      assertEqual(calls2, 1);
    `,
  },
  {
    label: "A normal, un-cleared timeout still fires",
    source: `
      let calls3 = 0;
      trackedSetTimeout(() => calls3++, 20);
      await delay(50);
      assertEqual(calls3, 1);
    `,
  },
];

const BASIC_DEBOUNCE_WARMUP_TESTS: SandboxTest[] = [
  {
    label: "Coalesces a burst into a single call",
    source: `
      assert(typeof debounce === "function", "debounce is not defined");
      const calls = [];
      const fn = debounce((x) => calls.push(x), 30);
      fn(1); fn(2); fn(3);
      await delay(70);
      assertEqual(calls, [3]);
    `,
  },
  {
    label: "Separate bursts each produce their own call",
    source: `
      const calls2 = [];
      const fn2 = debounce((x) => calls2.push(x), 30);
      fn2("a");
      await delay(70);
      fn2("b");
      await delay(70);
      assertEqual(calls2, ["a", "b"]);
    `,
  },
  {
    label: "this is forwarded correctly",
    source: `
      const obj = {};
      let capturedThis;
      obj.method = debounce(function () { capturedThis = this; }, 20);
      obj.method();
      await delay(50);
      assert(capturedThis === obj, "this should be the object the debounced method was called on");
    `,
  },
];

const BASIC_THROTTLE_WARMUP_TESTS: SandboxTest[] = [
  {
    label: "The first call is never delayed",
    source: `
      assert(typeof throttle === "function", "throttle is not defined");
      const calls = [];
      const fn = throttle((x) => calls.push(x), 30);
      fn(1);
      assertEqual(calls, [1]);
    `,
  },
  {
    label: "Calls within the interval are dropped",
    source: `
      const calls2 = [];
      const fn2 = throttle((x) => calls2.push(x), 30);
      fn2(1);
      fn2(2);
      assertEqual(calls2, [1]);
    `,
  },
  {
    label: "Throttling resets once the interval passes",
    source: `
      const calls3 = [];
      const fn3 = throttle((x) => calls3.push(x), 30);
      fn3(1);
      await delay(40);
      fn3(2);
      assertEqual(calls3, [1, 2]);
    `,
  },
];

const DEBOUNCE_LEADING_TRAILING_TESTS: SandboxTest[] = [
  {
    label: "leading-only fires once at the start of the burst",
    source: `
      assert(typeof debounce === "function", "debounce is not defined");
      const calls = [];
      const fn = debounce((x) => calls.push(x), 30, { leading: true, trailing: false });
      fn(1); fn(2); fn(3);
      assertEqual(calls.length, 1);
      await delay(70);
      assertEqual(calls.length, 1);
    `,
  },
  {
    label: "trailing-only behaves like classic debounce",
    source: `
      const calls2 = [];
      const fn2 = debounce((x) => calls2.push(x), 30);
      fn2(1); fn2(2); fn2(3);
      assertEqual(calls2.length, 0);
      await delay(70);
      assertEqual(calls2, [3]);
    `,
  },
  {
    label: "Both edges fire for a multi-call burst",
    source: `
      const calls3 = [];
      const fn3 = debounce((x) => calls3.push(x), 30, { leading: true, trailing: true });
      fn3(1);
      assertEqual(calls3.length, 1);
      fn3(2); fn3(3);
      await delay(70);
      assertEqual(calls3.length, 2);
    `,
  },
];

const THROTTLE_LEADING_TRAILING_TESTS: SandboxTest[] = [
  {
    label: "leading-only fires once at the start of the window",
    source: `
      assert(typeof throttle === "function", "throttle is not defined");
      const calls = [];
      const fn = throttle((x) => calls.push(x), 30, { leading: true, trailing: false });
      fn(1);
      assertEqual(calls.length, 1);
      fn(2); fn(3);
      await delay(70);
      assertEqual(calls.length, 1);
    `,
  },
  {
    label: "trailing-only defers to the end of the window",
    source: `
      const calls2 = [];
      const fn2 = throttle((x) => calls2.push(x), 30, { leading: false, trailing: true });
      fn2(1);
      assertEqual(calls2.length, 0);
      fn2(2); fn2(3);
      await delay(70);
      assertEqual(calls2, [3]);
    `,
  },
  {
    label: "Both edges fire when there's a call within the window after the leading one",
    source: `
      const calls3 = [];
      const fn3 = throttle((x) => calls3.push(x), 30, { leading: true, trailing: true });
      fn3(1);
      assertEqual(calls3.length, 1);
      fn3(2);
      await delay(70);
      assertEqual(calls3, [1, 2]);
    `,
  },
];

const FAKE_SETTIMEOUT_CLOCK_TESTS: SandboxTest[] = [
  {
    label: "A callback only fires once its full delay has elapsed",
    source: `
      assert(typeof createFakeTimers === "function", "createFakeTimers is not defined");
      const timers = createFakeTimers();
      let fired = false;
      timers.setTimeout(() => { fired = true; }, 100);
      timers.tick(50);
      assertEqual(fired, false);
      timers.tick(50);
      assertEqual(fired, true);
    `,
  },
  {
    label: "Cancelling a scheduled callback works",
    source: `
      const timers2 = createFakeTimers();
      let fired2 = false;
      const id = timers2.setTimeout(() => { fired2 = true; }, 50);
      timers2.clearTimeout(id);
      timers2.tick(100);
      assertEqual(fired2, false);
    `,
  },
  {
    label: "Due callbacks fire in chronological (not scheduling) order",
    source: `
      const timers3 = createFakeTimers();
      const order = [];
      timers3.setTimeout(() => order.push("thirty"), 30);
      timers3.setTimeout(() => order.push("ten"), 10);
      timers3.tick(30);
      assertEqual(order, ["ten", "thirty"]);
    `,
  },
];

const BUILD_SET_INTERVAL_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Doesn't fire before the first interval elapses",
    source: `
      assert(typeof createInterval === "function", "createInterval is not defined");
      let calls = 0;
      const stop = createInterval(() => calls++, 30);
      assertEqual(calls, 0);
      stop();
    `,
  },
  {
    label: "Fires repeatedly at roughly the given interval",
    source: `
      let calls2 = 0;
      const stop2 = createInterval(() => calls2++, 30);
      await delay(110);
      assert(calls2 >= 2, "expected at least 2 firings within 110ms at a 30ms interval, got " + calls2);
      stop2();
    `,
  },
  {
    label: "The returned function stops future firings",
    source: `
      let calls3 = 0;
      const stop3 = createInterval(() => calls3++, 30);
      await delay(40);
      stop3();
      const countAtStop = calls3;
      await delay(60);
      assertEqual(calls3, countAtStop);
    `,
  },
];

const FAKE_SETINTERVAL_CLOCK_TESTS: SandboxTest[] = [
  {
    label: "A single large tick catches up on every due firing",
    source: `
      assert(typeof createFakeIntervalTimers === "function", "createFakeIntervalTimers is not defined");
      const timers = createFakeIntervalTimers();
      let calls = 0;
      timers.setInterval(() => calls++, 10);
      timers.tick(35);
      assertEqual(calls, 3);
    `,
  },
  {
    label: "clearInterval stops future firings",
    source: `
      const timers2 = createFakeIntervalTimers();
      let calls2 = 0;
      const id = timers2.setInterval(() => calls2++, 10);
      timers2.tick(15);
      timers2.clearInterval(id);
      timers2.tick(50);
      assertEqual(calls2, 1);
    `,
  },
  {
    label: "Multiple intervals don't interfere with each other",
    source: `
      const timers3 = createFakeIntervalTimers();
      let fastCalls = 0;
      let slowCalls = 0;
      timers3.setInterval(() => fastCalls++, 10);
      timers3.setInterval(() => slowCalls++, 25);
      timers3.tick(50);
      assertEqual(fastCalls, 5);
      assertEqual(slowCalls, 2);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 6

const ASYNC_TASK_QUEUE_TESTS: SandboxTest[] = [
  {
    label: "Tasks never overlap, regardless of their individual delays",
    source: `
      assert(typeof AsyncTaskQueue === "function", "AsyncTaskQueue is not defined");
      const queue = new AsyncTaskQueue();
      const order = [];
      let running = 0;
      let overlapped = false;
      function makeTask(id, ms) {
        return () => new Promise((resolve) => {
          running++;
          if (running > 1) overlapped = true;
          setTimeout(() => {
            order.push(id);
            running--;
            resolve(id);
          }, ms);
        });
      }
      queue.add(makeTask("a", 30));
      queue.add(makeTask("b", 10));
      queue.add(makeTask("c", 20));
      await delay(100);
      assertEqual(overlapped, false);
      assertEqual(order, ["a", "b", "c"]);
    `,
  },
  {
    label: "Each add() call resolves with the right value",
    source: `
      const queue2 = new AsyncTaskQueue();
      const resultA = await queue2.add(() => Promise.resolve("A"));
      const resultB = await queue2.add(() => Promise.resolve("B"));
      assertEqual(resultA, "A");
      assertEqual(resultB, "B");
    `,
  },
  {
    label: "A rejection doesn't block the rest of the queue",
    source: `
      const queue3 = new AsyncTaskQueue();
      queue3.add(() => Promise.reject(new Error("fail"))).catch(() => {});
      const after = await queue3.add(() => Promise.resolve("after"));
      assertEqual(after, "after");
    `,
  },
];

const NODE_STYLE_PROMISIFY_TESTS: SandboxTest[] = [
  {
    label: "Resolves with the callback's success value",
    source: `
      assert(typeof promisify === "function", "promisify is not defined");
      function nodeStyleFn(x, callback) { setTimeout(() => callback(null, x * 2), 10); }
      const promisified = promisify(nodeStyleFn);
      const result = await promisified(5);
      assertEqual(result, 10);
    `,
  },
  {
    label: "Rejects with the callback's error",
    source: `
      function nodeStyleFail(callback) { setTimeout(() => callback(new Error("boom")), 10); }
      const promisifiedFail = promisify(nodeStyleFail);
      let caught = null;
      try { await promisifiedFail(); } catch (e) { caught = e; }
      assert(caught && caught.message === "boom", "expected the promisified function to reject with the original error");
    `,
  },
  {
    label: "Forwards every argument ahead of the injected callback",
    source: `
      function addThree(a, b, c, callback) { callback(null, a + b + c); }
      const promisifiedAdd = promisify(addThree);
      assertEqual(await promisifiedAdd(1, 2, 3), 6);
    `,
  },
];

const PROMISE_RACE_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Resolves with whichever settles first",
    source: `
      assert(typeof myPromiseRace === "function", "myPromiseRace is not defined");
      const result = await myPromiseRace([
        delay(30).then(() => "slow"),
        delay(5).then(() => "fast"),
      ]);
      assertEqual(result, "fast");
    `,
  },
  {
    label: "A fast rejection wins the race too",
    source: `
      let rejected = false;
      let reason;
      try {
        await myPromiseRace([
          delay(5).then(() => Promise.reject("fast-fail")),
          delay(30).then(() => "slow-ok"),
        ]);
      } catch (e) { rejected = true; reason = e; }
      assert(rejected, "expected the race to reject");
      assertEqual(reason, "fast-fail");
    `,
  },
  {
    label: "Non-promise values settle instantly, beating any pending promise",
    source: `
      const result2 = await myPromiseRace([42, delay(30).then(() => "slow")]);
      assertEqual(result2, 42);
    `,
  },
];

const RACE_WITH_TIMEOUT_TESTS: SandboxTest[] = [
  {
    label: "A fast promise wins normally",
    source: `
      assert(typeof raceWithTimeout === "function", "raceWithTimeout is not defined");
      const result = await raceWithTimeout(delay(10).then(() => "ok"), 50);
      assertEqual(result, "ok");
    `,
  },
  {
    label: "A slow promise is preempted by the timeout",
    source: `
      let rejected = false;
      let message;
      try {
        await raceWithTimeout(delay(50).then(() => "too-slow"), 15);
      } catch (e) { rejected = true; message = e.message; }
      assert(rejected, "expected a timeout rejection");
      assertEqual(message, "timeout");
    `,
  },
  {
    label: "An early rejection is not masked by the timeout",
    source: `
      let rejected2 = false;
      let reason2;
      try {
        await raceWithTimeout(delay(5).then(() => { throw new Error("original"); }), 50);
      } catch (e) { rejected2 = true; reason2 = e.message; }
      assert(rejected2, "expected the original rejection to propagate");
      assertEqual(reason2, "original");
    `,
  },
];

const BUILD_CUSTOM_PROMISE_TESTS: SandboxTest[] = [
  {
    label: "Basic resolution and chaining",
    source: `
      assert(typeof MyPromise === "function", "MyPromise is not defined");
      const result = await new MyPromise((resolve) => resolve(1)).then((v) => v + 1);
      assertEqual(result, 2);
    `,
  },
  {
    label: "A thrown error in the executor rejects the promise",
    source: `
      let caught = null;
      try {
        await new MyPromise(() => { throw new Error("executor failed"); });
      } catch (e) { caught = e; }
      assert(caught && caught.message === "executor failed", "expected the promise to reject with the thrown error");
    `,
  },
  {
    label: "Chained handlers pass values forward",
    source: `
      const result2 = await new MyPromise((resolve) => resolve(1)).then((v) => v + 1).then((v) => v * 10);
      assertEqual(result2, 20);
    `,
  },
  {
    label: "catch() handles a rejection",
    source: `
      const result3 = await new MyPromise((_, reject) => reject("nope")).catch((reason) => "caught: " + reason);
      assertEqual(result3, "caught: nope");
    `,
  },
  {
    label: "Resolving with a thenable adopts its state instead of wrapping it",
    source: `
      const inner = new MyPromise((resolve) => resolve("inner-value"));
      const result4 = await new MyPromise((resolve) => resolve(inner));
      assertEqual(result4, "inner-value");
    `,
  },
];

const PROMISE_ALL_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Result order matches input order regardless of resolution timing",
    source: `
      assert(typeof myPromiseAll === "function", "myPromiseAll is not defined");
      const result = await myPromiseAll([
        delay(20).then(() => "a"),
        "plain-value",
        delay(5).then(() => "c"),
      ]);
      assertEqual(result, ["a", "plain-value", "c"]);
    `,
  },
  {
    label: "Rejects as soon as any single input rejects",
    source: `
      let rejected = false;
      let reason;
      try {
        await myPromiseAll([delay(30).then(() => "slow"), Promise.reject("fast-fail")]);
      } catch (e) { rejected = true; reason = e; }
      assert(rejected, "expected rejection");
      assertEqual(reason, "fast-fail");
    `,
  },
  {
    label: "An empty input resolves right away",
    source: `assertEqual(await myPromiseAll([]), []);`,
  },
];

const PROMISE_ALL_SETTLED_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Never short-circuits on a rejection",
    source: `
      assert(typeof myPromiseAllSettled === "function", "myPromiseAllSettled is not defined");
      const result = await myPromiseAllSettled([Promise.resolve(1), Promise.reject("err"), Promise.resolve(3)]);
      assertEqual(result.length, 3);
      assertEqual(result[0], { status: "fulfilled", value: 1 });
      assertEqual(result[2], { status: "fulfilled", value: 3 });
    `,
  },
  {
    label: "A resolved input produces the fulfilled shape",
    source: `
      const result2 = await myPromiseAllSettled([Promise.resolve("ok")]);
      assertEqual(result2, [{ status: "fulfilled", value: "ok" }]);
    `,
  },
  {
    label: "A rejected input produces the rejected shape",
    source: `
      const result3 = await myPromiseAllSettled([Promise.reject("bad")]);
      assertEqual(result3, [{ status: "rejected", reason: "bad" }]);
    `,
  },
];

const PROMISE_ANY_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Resolves as soon as any input fulfills",
    source: `
      assert(typeof myPromiseAny === "function", "myPromiseAny is not defined");
      const result = await myPromiseAny([Promise.reject("no1"), Promise.resolve("yes"), Promise.reject("no2")]);
      assertEqual(result, "yes");
    `,
  },
  {
    label: "Only rejects when every single input has rejected",
    source: `
      let rejected = false;
      try { await myPromiseAny([Promise.reject("a"), Promise.reject("b")]); } catch (e) { rejected = true; }
      assert(rejected, "expected rejection when every input rejects");
    `,
  },
  {
    label: "A fulfillment wins even if a rejection came in earlier",
    source: `
      const result2 = await myPromiseAny([delay(5).then(() => Promise.reject("fast-fail")), delay(20).then(() => "slow-ok")]);
      assertEqual(result2, "slow-ok");
    `,
  },
];

const PROMISE_FINALLY_POLYFILL_TESTS: SandboxTest[] = [
  {
    label: "Runs on fulfillment without altering the value",
    source: `
      assert(typeof Promise.prototype.myFinally === "function", "Promise.prototype.myFinally is not defined");
      let ranOnResolve = false;
      const value = await Promise.resolve(42).myFinally(() => { ranOnResolve = true; });
      assert(ranOnResolve, "the finally callback should have run");
      assertEqual(value, 42);
    `,
  },
  {
    label: "Runs on rejection without swallowing the error",
    source: `
      let ranOnReject = false;
      let caught = null;
      try {
        await Promise.reject("failed").myFinally(() => { ranOnReject = true; });
      } catch (e) { caught = e; }
      assert(ranOnReject, "the finally callback should have run on rejection too");
      assertEqual(caught, "failed");
    `,
  },
  {
    label: "onFinally's own return value is ignored",
    source: `
      const result = await Promise.resolve("original").myFinally(() => "ignored-return-value");
      assertEqual(result, "original");
    `,
  },
];

const ASYNC_SEQUENCE_HELPER_TESTS: SandboxTest[] = [
  {
    label: "Tasks run strictly one at a time, never overlapping",
    source: `
      assert(typeof sequence === "function", "sequence is not defined");
      let running = 0;
      let overlapped = false;
      function makeTask(id, ms) {
        return () => new Promise((resolve) => {
          running++;
          if (running > 1) overlapped = true;
          setTimeout(() => { running--; resolve(id); }, ms);
        });
      }
      await sequence([makeTask("a", 20), makeTask("b", 10), makeTask("c", 5)]);
      assertEqual(overlapped, false);
    `,
  },
  {
    label: "Results preserve input order",
    source: `
      const results = await sequence([() => 1, () => Promise.resolve(2), () => 3]);
      assertEqual(results, [1, 2, 3]);
    `,
  },
  {
    label: "A rejection stops the sequence",
    source: `
      let rejected = false;
      let ranThird = false;
      try {
        await sequence([() => 1, () => Promise.reject("fail"), () => { ranThird = true; return 3; }]);
      } catch (e) { rejected = true; }
      assert(rejected, "expected sequence to reject");
      assertEqual(ranThird, false);
    `,
  },
];

const ASYNC_PARALLEL_HELPER_TESTS: SandboxTest[] = [
  {
    label: "Tasks run concurrently, not one after another",
    source: `
      assert(typeof parallel === "function", "parallel is not defined");
      const start = Date.now();
      await parallel([
        () => delay(40).then(() => "a"),
        () => delay(40).then(() => "b"),
        () => delay(40).then(() => "c"),
      ]);
      const elapsed = Date.now() - start;
      assert(elapsed < 100, "tasks should run concurrently, took " + elapsed + "ms for three 40ms tasks");
    `,
  },
  {
    label: "Result order matches input order, not completion order",
    source: `
      const results = await parallel([
        () => delay(20).then(() => "slow"),
        () => delay(5).then(() => "fast"),
      ]);
      assertEqual(results, ["slow", "fast"]);
    `,
  },
  {
    label: "A single rejection fails the whole batch",
    source: `
      let rejected = false;
      try { await parallel([() => Promise.resolve(1), () => Promise.reject("bad")]); } catch (e) { rejected = true; }
      assert(rejected, "expected parallel to reject when any task rejects");
    `,
  },
];

const FLATTEN_THUNK_TESTS: SandboxTest[] = [
  {
    label: "A single-level thunk resolves normally",
    source: `
      assert(typeof flattenThunk === "function", "flattenThunk is not defined");
      function simpleThunk(callback) { callback(null, "value"); }
      flattenThunk(simpleThunk)((err, result) => {
        assertEqual(err, null);
        assertEqual(result, "value");
      });
    `,
  },
  {
    label: "Nested thunks are recursively flattened",
    source: `
      function level3(callback) { callback(null, "deep-value"); }
      function level2(callback) { callback(null, level3); }
      function level1(callback) { callback(null, level2); }
      let receivedResult;
      flattenThunk(level1)((err, result) => { receivedResult = result; });
      assertEqual(receivedResult, "deep-value");
    `,
  },
  {
    label: "An error short-circuits the unwrapping",
    source: `
      function errorThunk(callback) { callback(new Error("thunk failed")); }
      let receivedErr;
      flattenThunk(errorThunk)((err) => { receivedErr = err; });
      assert(receivedErr && receivedErr.message === "thunk failed", "expected the error to propagate");
    `,
  },
];

const RETRY_PROMISE_ON_REJECTION_TESTS: SandboxTest[] = [
  {
    label: "A successful first attempt needs no retries",
    source: `
      assert(typeof retry === "function", "retry is not defined");
      let calls = 0;
      const result = await retry(() => { calls++; return Promise.resolve("ok"); }, 3);
      assertEqual(result, "ok");
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Exhausts all retries before giving up",
    source: `
      let calls2 = 0;
      let rejected = false;
      try {
        await retry(() => { calls2++; return Promise.reject("always fails"); }, 2);
      } catch (e) { rejected = true; }
      assert(rejected, "expected retry to eventually reject");
      assertEqual(calls2, 3);
    `,
  },
  {
    label: "Resolves as soon as any attempt succeeds",
    source: `
      let calls3 = 0;
      const result3 = await retry(() => {
        calls3++;
        if (calls3 < 3) return Promise.reject("not yet");
        return Promise.resolve("finally");
      }, 5);
      assertEqual(result3, "finally");
    `,
  },
];

const CONCURRENCY_LIMITED_PROMISES_TESTS: SandboxTest[] = [
  {
    label: "Never exceeds the concurrency limit",
    source: `
      assert(typeof runWithConcurrency === "function", "runWithConcurrency is not defined");
      let active = 0;
      let peak = 0;
      const tasks = Array.from({ length: 10 }, (_, i) => () => new Promise((resolve) => {
        active++;
        peak = Math.max(peak, active);
        setTimeout(() => { active--; resolve(i); }, 20);
      }));
      await runWithConcurrency(tasks, 3);
      assert(peak <= 3, "expected at most 3 tasks running at once, saw " + peak);
    `,
  },
  {
    label: "Result order matches input order, not completion order",
    source: `
      const tasks2 = [
        () => delay(20).then(() => "slow"),
        () => delay(5).then(() => "fast"),
      ];
      const results = await runWithConcurrency(tasks2, 2);
      assertEqual(results, ["slow", "fast"]);
    `,
  },
  {
    label: "All tasks eventually run, not just the first batch",
    source: `
      const tasks3 = Array.from({ length: 5 }, (_, i) => () => Promise.resolve(i));
      const results3 = await runWithConcurrency(tasks3, 2);
      assertEqual(results3, [0, 1, 2, 3, 4]);
    `,
  },
];

const DEDUPE_CONCURRENT_API_CALLS_TESTS: SandboxTest[] = [
  {
    label: "Concurrent calls with the same key are merged",
    source: `
      assert(typeof dedupeAsync === "function", "dedupeAsync is not defined");
      let calls = 0;
      const fetchUser = dedupeAsync((id) => { calls++; return delay(20).then(() => "user-" + id); });
      const [a, b] = await Promise.all([fetchUser(1), fetchUser(1)]);
      assertEqual(a, "user-1");
      assertEqual(b, "user-1");
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Different keys are never merged together",
    source: `
      let calls2 = 0;
      const fetchUser2 = dedupeAsync((id) => { calls2++; return delay(10).then(() => "user-" + id); });
      await Promise.all([fetchUser2(1), fetchUser2(2)]);
      assertEqual(calls2, 2);
    `,
  },
  {
    label: "Deduplication doesn't turn into permanent caching",
    source: `
      let calls3 = 0;
      const fetchUser3 = dedupeAsync((id) => { calls3++; return delay(10).then(() => "user-" + id); });
      await fetchUser3(1);
      await fetchUser3(1);
      assertEqual(calls3, 2);
    `,
  },
];

const FETCH_ALL_PAGINATED_PAGES_TESTS: SandboxTest[] = [
  {
    label: "Collects and concatenates every page",
    source: `
      assert(typeof fetchAllPages === "function", "fetchAllPages is not defined");
      const pages = { null: { items: [1, 2], nextCursor: "p2" }, p2: { items: [3, 4], nextCursor: "p3" }, p3: { items: [5], nextCursor: null } };
      async function fetchPage(cursor) { return pages[cursor === null ? "null" : cursor]; }
      const items = await fetchAllPages(fetchPage);
      assertEqual(items, [1, 2, 3, 4, 5]);
    `,
  },
  {
    label: "Stops once there's no next cursor",
    source: `
      async function singlePage() { return { items: ["only"], nextCursor: null }; }
      assertEqual(await fetchAllPages(singlePage), ["only"]);
    `,
  },
  {
    label: "Each call is chained correctly using the prior page's cursor",
    source: `
      const receivedCursors = [];
      const responses = [{ items: ["a"], nextCursor: "c1" }, { items: ["b"], nextCursor: "c2" }, { items: ["c"], nextCursor: null }];
      let call = 0;
      async function trackedFetchPage(cursor) {
        receivedCursors.push(cursor);
        return responses[call++];
      }
      await fetchAllPages(trackedFetchPage);
      assertEqual(receivedCursors, [null, "c1", "c2"]);
    `,
  },
];

const MESSAGE_CHANNEL_TASK_SCHEDULER_TESTS: SandboxTest[] = [
  {
    label: "Never runs synchronously",
    source: `
      assert(typeof scheduleTask === "function", "scheduleTask is not defined");
      let ran = false;
      scheduleTask(() => { ran = true; });
      assertEqual(ran, false);
      await delay(20);
      assertEqual(ran, true);
    `,
  },
  {
    label: "Runs after already-queued microtasks",
    source: `
      const order = [];
      scheduleTask(() => order.push("scheduled"));
      Promise.resolve().then(() => order.push("microtask"));
      order.push("sync");
      await delay(20);
      assertEqual(order, ["sync", "microtask", "scheduled"]);
    `,
  },
  {
    label: "Multiple scheduled tasks don't interfere with each other",
    source: `
      const calls = [];
      scheduleTask(() => calls.push("a"));
      scheduleTask(() => calls.push("b"));
      await delay(20);
      assertEqual(calls, ["a", "b"]);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 7

const REVERSE_LINKED_LIST_TESTS: SandboxTest[] = [
  {
    label: "Reverses a multi-node list",
    source: `
      assert(typeof reverseLinkedList === "function", "reverseLinkedList is not defined");
      function fromArray(arr) {
        let head = null;
        for (let i = arr.length - 1; i >= 0; i--) head = { value: arr[i], next: head };
        return head;
      }
      function toArray(head) {
        const result = [];
        while (head) { result.push(head.value); head = head.next; }
        return result;
      }
      const reversed = reverseLinkedList(fromArray([1, 2, 3]));
      assertEqual(toArray(reversed), [3, 2, 1]);
    `,
  },
  {
    label: "A single-node list reverses to itself",
    source: `
      const single = { value: 1, next: null };
      const reversed = reverseLinkedList(single);
      assertEqual(reversed.value, 1);
      assertEqual(reversed.next, null);
    `,
  },
  {
    label: "An empty list stays empty",
    source: `assertEqual(reverseLinkedList(null), null);`,
  },
];

const DETECT_LINKED_LIST_CYCLE_TESTS: SandboxTest[] = [
  {
    label: "Detects a real cycle",
    source: `
      assert(typeof hasCycle === "function", "hasCycle is not defined");
      const c = { value: 3, next: null };
      const b = { value: 2, next: c };
      const a = { value: 1, next: b };
      c.next = a;
      assertEqual(hasCycle(a), true);
    `,
  },
  {
    label: "No false positive on an acyclic list",
    source: `
      const c2 = { value: 3, next: null };
      const b2 = { value: 2, next: c2 };
      const a2 = { value: 1, next: b2 };
      assertEqual(hasCycle(a2), false);
    `,
  },
  {
    label: "An empty list has no cycle",
    source: `assertEqual(hasCycle(null), false);`,
  },
];

const INVERT_BINARY_TREE_TESTS: SandboxTest[] = [
  {
    label: "Swaps children at the top level",
    source: `
      assert(typeof invertBinaryTree === "function", "invertBinaryTree is not defined");
      const tree = { value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } };
      const inverted = invertBinaryTree(tree);
      assertEqual(inverted.left.value, 3);
      assertEqual(inverted.right.value, 2);
    `,
  },
  {
    label: "Recursively swaps children at every depth",
    source: `
      const tree2 = {
        value: 1,
        left: { value: 2, left: { value: 4, left: null, right: null }, right: null },
        right: { value: 3, left: null, right: null },
      };
      const inverted2 = invertBinaryTree(tree2);
      assertEqual(inverted2.left.value, 3);
      assertEqual(inverted2.right.value, 2);
      assertEqual(inverted2.right.right.value, 4);
    `,
  },
  {
    label: "An empty tree stays empty",
    source: `assertEqual(invertBinaryTree(null), null);`,
  },
];

const QUEUE_USING_TWO_STACKS_TESTS: SandboxTest[] = [
  {
    label: "FIFO order is preserved",
    source: `
      assert(typeof QueueViaStacks === "function", "QueueViaStacks is not defined");
      const q = new QueueViaStacks();
      q.enqueue(1); q.enqueue(2); q.enqueue(3);
      assertEqual(q.dequeue(), 1);
      assertEqual(q.dequeue(), 2);
      assertEqual(q.dequeue(), 3);
    `,
  },
  {
    label: "Dequeuing an empty queue doesn't throw",
    source: `
      const q2 = new QueueViaStacks();
      assertEqual(q2.dequeue(), undefined);
    `,
  },
  {
    label: "Interleaved operations stay correct",
    source: `
      const q3 = new QueueViaStacks();
      q3.enqueue(1);
      assertEqual(q3.dequeue(), 1);
      q3.enqueue(2);
      q3.enqueue(3);
      assertEqual(q3.dequeue(), 2);
      q3.enqueue(4);
      assertEqual(q3.dequeue(), 3);
      assertEqual(q3.dequeue(), 4);
    `,
  },
];

const STACK_USING_TWO_QUEUES_TESTS: SandboxTest[] = [
  {
    label: "LIFO order is preserved",
    source: `
      assert(typeof StackViaQueues === "function", "StackViaQueues is not defined");
      const s = new StackViaQueues();
      s.push(1); s.push(2); s.push(3);
      assertEqual(s.pop(), 3);
      assertEqual(s.pop(), 2);
      assertEqual(s.pop(), 1);
    `,
  },
  {
    label: "Popping an empty stack doesn't throw",
    source: `
      const s2 = new StackViaQueues();
      assertEqual(s2.pop(), undefined);
    `,
  },
  {
    label: "Interleaved operations stay correct",
    source: `
      const s3 = new StackViaQueues();
      s3.push(1);
      assertEqual(s3.pop(), 1);
      s3.push(2);
      s3.push(3);
      assertEqual(s3.pop(), 3);
      s3.push(4);
      assertEqual(s3.pop(), 4);
      assertEqual(s3.pop(), 2);
    `,
  },
];

const BUILD_PRIORITY_QUEUE_TESTS: SandboxTest[] = [
  {
    label: "Dequeues in ascending priority order",
    source: `
      assert(typeof PriorityQueue === "function", "PriorityQueue is not defined");
      const pq = new PriorityQueue();
      pq.enqueue("low", 5);
      pq.enqueue("high", 1);
      pq.enqueue("mid", 3);
      assertEqual(pq.dequeue(), "high");
      assertEqual(pq.dequeue(), "mid");
      assertEqual(pq.dequeue(), "low");
    `,
  },
  {
    label: "Equal priorities break ties by insertion order",
    source: `
      const pq2 = new PriorityQueue();
      pq2.enqueue("first", 1);
      pq2.enqueue("second", 1);
      assertEqual(pq2.dequeue(), "first");
      assertEqual(pq2.dequeue(), "second");
    `,
  },
  {
    label: "Dequeuing an empty queue doesn't throw",
    source: `
      const pq3 = new PriorityQueue();
      assertEqual(pq3.dequeue(), undefined);
    `,
  },
];

const FIND_TOP_K_ELEMENTS_TESTS: SandboxTest[] = [
  {
    label: "Returns the k largest values, descending",
    source: `
      assert(typeof findTopK === "function", "findTopK is not defined");
      assertEqual(findTopK([3, 1, 4, 1, 5, 9, 2, 6], 3), [9, 6, 5]);
    `,
  },
  {
    label: "k larger than the array just returns everything, sorted",
    source: `assertEqual(findTopK([1, 2], 5), [2, 1]);`,
  },
  {
    label: "k = 0 returns an empty array",
    source: `assertEqual(findTopK([1, 2, 3], 0), []);`,
  },
];

const BUILD_TRIE_PREFIX_TREE_TESTS: SandboxTest[] = [
  {
    label: "search() finds an exact inserted word",
    source: `
      assert(typeof Trie === "function", "Trie is not defined");
      const trie = new Trie();
      trie.insert("cat");
      assertEqual(trie.search("cat"), true);
    `,
  },
  {
    label: "startsWith() matches a prefix even if it wasn't inserted as its own word",
    source: `
      const trie2 = new Trie();
      trie2.insert("cat");
      assertEqual(trie2.startsWith("ca"), true);
    `,
  },
  {
    label: "search() rejects a prefix that isn't itself a complete inserted word",
    source: `
      const trie3 = new Trie();
      trie3.insert("cat");
      assertEqual(trie3.search("ca"), false);
    `,
  },
];

const SERIALIZE_DESERIALIZE_BINARY_TREE_TESTS: SandboxTest[] = [
  {
    label: "Round-trips a small tree correctly",
    source: `
      assert(typeof serialize === "function", "serialize is not defined");
      assert(typeof deserialize === "function", "deserialize is not defined");
      const tree = { value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } };
      const rebuilt = deserialize(serialize(tree));
      assertEqual(rebuilt, tree);
    `,
  },
  {
    label: "Round-trips a single node",
    source: `
      const single = { value: 42, left: null, right: null };
      assertEqual(deserialize(serialize(single)), single);
    `,
  },
  {
    label: "Round-trips an empty tree",
    source: `assertEqual(deserialize(serialize(null)), null);`,
  },
];

const BINARY_TREE_VERTICAL_TRAVERSAL_TESTS: SandboxTest[] = [
  {
    label: "Groups nodes into columns by horizontal distance from the root",
    source: `
      assert(typeof verticalTraversal === "function", "verticalTraversal is not defined");
      const tree = { value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } };
      assertEqual(verticalTraversal(tree), [[2], [1], [3]]);
    `,
  },
  {
    label: "Correctly orders same-column entries and breaks position ties",
    source: `
      const tree2 = {
        value: 1,
        left: { value: 2, left: null, right: { value: 4, left: null, right: null } },
        right: { value: 3, left: { value: 5, left: null, right: null }, right: null },
      };
      assertEqual(verticalTraversal(tree2), [[2], [1, 4, 5], [3]]);
    `,
  },
  {
    label: "An empty tree produces an empty result",
    source: `assertEqual(verticalTraversal(null), []);`,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 8

const SORT_BUBBLE_TESTS: SandboxTest[] = [
  {
    label: "Sorts an unordered array",
    source: `
      assert(typeof bubbleSort === "function", "bubbleSort is not defined");
      assertEqual(bubbleSort([5, 3, 8, 1, 2]), [1, 2, 3, 5, 8]);
    `,
  },
  { label: "An empty array stays empty", source: `assertEqual(bubbleSort([]), []);` },
  { label: "Handles duplicates correctly", source: `assertEqual(bubbleSort([1, 1, 2, 2]), [1, 1, 2, 2]);` },
];

const SORT_INSERTION_TESTS: SandboxTest[] = [
  {
    label: "Sorts an unordered array",
    source: `
      assert(typeof insertionSort === "function", "insertionSort is not defined");
      assertEqual(insertionSort([5, 3, 8, 1, 2]), [1, 2, 3, 5, 8]);
    `,
  },
  { label: "An empty array stays empty", source: `assertEqual(insertionSort([]), []);` },
  { label: "Sorts a small array correctly", source: `assertEqual(insertionSort([3, 1, 2]), [1, 2, 3]);` },
];

const SORT_SELECTION_TESTS: SandboxTest[] = [
  {
    label: "Sorts an unordered array",
    source: `
      assert(typeof selectionSort === "function", "selectionSort is not defined");
      assertEqual(selectionSort([5, 3, 8, 1, 2]), [1, 2, 3, 5, 8]);
    `,
  },
  { label: "An empty array stays empty", source: `assertEqual(selectionSort([]), []);` },
  { label: "Handles duplicates correctly", source: `assertEqual(selectionSort([2, 2, 1]), [1, 2, 2]);` },
];

const SORT_MERGE_TESTS: SandboxTest[] = [
  {
    label: "Sorts an unordered array",
    source: `
      assert(typeof mergeSort === "function", "mergeSort is not defined");
      assertEqual(mergeSort([5, 3, 8, 1, 2]), [1, 2, 3, 5, 8]);
    `,
  },
  { label: "An empty array stays empty", source: `assertEqual(mergeSort([]), []);` },
  {
    label: "Handles a bigger input correctly",
    source: `assertEqual(mergeSort([9, 4, 7, 1, 3, 8, 2, 6, 5]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);`,
  },
];

const SORT_QUICK_TESTS: SandboxTest[] = [
  {
    label: "Sorts an unordered array",
    source: `
      assert(typeof quickSort === "function", "quickSort is not defined");
      assertEqual(quickSort([5, 3, 8, 1, 2]), [1, 2, 3, 5, 8]);
    `,
  },
  { label: "An empty array stays empty", source: `assertEqual(quickSort([]), []);` },
  { label: "Handles an array of identical values", source: `assertEqual(quickSort([1, 1, 1]), [1, 1, 1]);` },
];

const BINARY_SEARCH_BASIC_TESTS: SandboxTest[] = [
  {
    label: "Finds a present value",
    source: `
      assert(typeof binarySearch === "function", "binarySearch is not defined");
      assertEqual(binarySearch([1, 3, 5, 7, 9], 7), 3);
    `,
  },
  { label: "Returns -1 for a missing value", source: `assertEqual(binarySearch([1, 3, 5, 7, 9], 4), -1);` },
  { label: "An empty array has nothing to find", source: `assertEqual(binarySearch([], 1), -1);` },
];

const BINARY_SEARCH_FIRST_INDEX_TESTS: SandboxTest[] = [
  {
    label: "Finds the leftmost occurrence among duplicates",
    source: `
      assert(typeof searchFirstIndex === "function", "searchFirstIndex is not defined");
      assertEqual(searchFirstIndex([1, 2, 2, 2, 3], 2), 1);
    `,
  },
  { label: "Returns -1 for a missing value", source: `assertEqual(searchFirstIndex([1, 2, 3], 5), -1);` },
  { label: "An array of all duplicates finds index 0", source: `assertEqual(searchFirstIndex([2, 2, 2], 2), 0);` },
];

const BINARY_SEARCH_LAST_INDEX_TESTS: SandboxTest[] = [
  {
    label: "Finds the rightmost occurrence among duplicates",
    source: `
      assert(typeof searchLastIndex === "function", "searchLastIndex is not defined");
      assertEqual(searchLastIndex([1, 2, 2, 2, 3], 2), 3);
    `,
  },
  { label: "Returns -1 for a missing value", source: `assertEqual(searchLastIndex([1, 2, 3], 5), -1);` },
  { label: "An array of all duplicates finds the last index", source: `assertEqual(searchLastIndex([2, 2, 2], 2), 2);` },
];

const BINARY_SEARCH_ELEMENT_BEFORE_TESTS: SandboxTest[] = [
  {
    label: "Finds the predecessor of a missing target",
    source: `
      assert(typeof findElementBefore === "function", "findElementBefore is not defined");
      assertEqual(findElementBefore([1, 3, 5, 7, 9], 6), 5);
    `,
  },
  {
    label: "No predecessor exists for the smallest value",
    source: `assertEqual(findElementBefore([1, 3, 5, 7, 9], 1), undefined);`,
  },
  {
    label: "Works correctly even when the target itself is present",
    source: `assertEqual(findElementBefore([1, 3, 5, 7, 9], 5), 3);`,
  },
];

const BINARY_SEARCH_ELEMENT_AFTER_TESTS: SandboxTest[] = [
  {
    label: "Finds the successor of a missing target",
    source: `
      assert(typeof findElementAfter === "function", "findElementAfter is not defined");
      assertEqual(findElementAfter([1, 3, 5, 7, 9], 6), 7);
    `,
  },
  {
    label: "No successor exists for the largest value",
    source: `assertEqual(findElementAfter([1, 3, 5, 7, 9], 9), undefined);`,
  },
  {
    label: "Works correctly even when the target itself is present",
    source: `assertEqual(findElementAfter([1, 3, 5, 7, 9], 5), 7);`,
  },
];

const FIRST_BAD_VERSION_TESTS: SandboxTest[] = [
  {
    label: "Finds the first bad version among many good ones",
    source: `
      assert(typeof firstBadVersion === "function", "firstBadVersion is not defined");
      assertEqual(firstBadVersion(10, (v) => v >= 5), 5);
    `,
  },
  {
    label: "Works when the only version is bad",
    source: `assertEqual(firstBadVersion(1, (v) => v >= 1), 1);`,
  },
  {
    label: "Finds it even when it's the very last version",
    source: `assertEqual(firstBadVersion(5, (v) => v >= 5), 5);`,
  },
];

const MEDIAN_OF_TWO_SORTED_ARRAYS_TESTS: SandboxTest[] = [
  {
    label: "An odd total length has a single middle value",
    source: `
      assert(typeof findMedianSortedArrays === "function", "findMedianSortedArrays is not defined");
      assertEqual(findMedianSortedArrays([1, 3], [2]), 2);
    `,
  },
  {
    label: "An even total length averages the two middle values",
    source: `assertEqual(findMedianSortedArrays([1, 2], [3, 4]), 2.5);`,
  },
  { label: "One empty array is handled correctly", source: `assertEqual(findMedianSortedArrays([], [1]), 1);` },
];

const IS_PRIME_NUMBER_TESTS: SandboxTest[] = [
  {
    label: "A prime number",
    source: `
      assert(typeof isPrime === "function", "isPrime is not defined");
      assertEqual(isPrime(7), true);
    `,
  },
  { label: "A non-prime, even number", source: `assertEqual(isPrime(8), false);` },
  { label: "1 is not prime, by definition", source: `assertEqual(isPrime(1), false);` },
  { label: "2 is the smallest prime", source: `assertEqual(isPrime(2), true);` },
];

const LOOK_AND_SAY_SEQUENCE_TESTS: SandboxTest[] = [
  {
    label: "The first term is just \"1\"",
    source: `
      assert(typeof lookAndSay === "function", "lookAndSay is not defined");
      assertEqual(lookAndSay(1), "1");
    `,
  },
  { label: "\"one 1\" describes the first term", source: `assertEqual(lookAndSay(2), "11");` },
  { label: "The fourth term in the sequence", source: `assertEqual(lookAndSay(4), "1211");` },
  { label: "The fifth term in the sequence", source: `assertEqual(lookAndSay(5), "111221");` },
];

const FIBONACCI_RECURSIVE_TESTS: SandboxTest[] = [
  {
    label: "The base case for n = 0",
    source: `
      assert(typeof fibRecursive === "function", "fibRecursive is not defined");
      assertEqual(fibRecursive(0), 0);
    `,
  },
  { label: "The base case for n = 1", source: `assertEqual(fibRecursive(1), 1);` },
  { label: "The 10th Fibonacci number", source: `assertEqual(fibRecursive(10), 55);` },
];

const GENERATE_FIBONACCI_SEQUENCE_TESTS: SandboxTest[] = [
  {
    label: "The first five Fibonacci numbers",
    source: `
      assert(typeof generateFibonacci === "function", "generateFibonacci is not defined");
      assertEqual(generateFibonacci(5), [0, 1, 1, 2, 3]);
    `,
  },
  { label: "count = 0 returns an empty array", source: `assertEqual(generateFibonacci(0), []);` },
  { label: "count = 1 returns just the first term", source: `assertEqual(generateFibonacci(1), [0]);` },
];

const TWO_NUMBERS_SUM_TO_ZERO_TESTS: SandboxTest[] = [
  {
    label: "Finds an opposite pair",
    source: `
      assert(typeof findZeroSumPair === "function", "findZeroSumPair is not defined");
      assertEqual(findZeroSumPair([4, -4, 2]), [4, -4]);
    `,
  },
  { label: "No pair sums to zero", source: `assertEqual(findZeroSumPair([1, 2, 3]), null);` },
  {
    label: "The earlier-seen value comes first in the result",
    source: `assertEqual(findZeroSumPair([-5, 5, 10]), [-5, 5]);`,
  },
];

const LARGEST_DIFFERENCE_TESTS: SandboxTest[] = [
  {
    label: "The best 'buy low, sell high' difference",
    source: `
      assert(typeof largestDifference === "function", "largestDifference is not defined");
      assertEqual(largestDifference([7, 1, 5, 3, 6, 4]), 5);
    `,
  },
  {
    label: "A strictly decreasing array still has a best (least negative) answer",
    source: `assertEqual(largestDifference([7, 6, 4, 3, 1]), -1);`,
  },
  { label: "A single-element array has no valid pair", source: `assertEqual(largestDifference([1]), undefined);` },
];

const MERGE_SORTED_ARRAYS_TESTS: SandboxTest[] = [
  {
    label: "Interleaves two sorted arrays",
    source: `
      assert(typeof mergeSortedArrays === "function", "mergeSortedArrays is not defined");
      assertEqual(mergeSortedArrays([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
    `,
  },
  { label: "One empty array just returns the other", source: `assertEqual(mergeSortedArrays([], [1, 2]), [1, 2]);` },
  {
    label: "Handles duplicate values across both arrays",
    source: `assertEqual(mergeSortedArrays([1, 2], [1, 2]), [1, 1, 2, 2]);`,
  },
];

const INTERSECTION_SORTED_ARRAYS_TESTS: SandboxTest[] = [
  {
    label: "Common values are deduplicated",
    source: `
      assert(typeof intersectSorted === "function", "intersectSorted is not defined");
      assertEqual(intersectSorted([1, 2, 2, 3], [2, 2, 4]), [2]);
    `,
  },
  { label: "No overlap returns an empty array", source: `assertEqual(intersectSorted([1, 2, 3], [4, 5, 6]), []);` },
  {
    label: "Identical arrays intersect completely",
    source: `assertEqual(intersectSorted([1, 2, 3], [1, 2, 3]), [1, 2, 3]);`,
  },
];

const INTERSECTION_UNSORTED_ARRAYS_TESTS: SandboxTest[] = [
  {
    label: "Common values are deduplicated",
    source: `
      assert(typeof intersectUnsorted === "function", "intersectUnsorted is not defined");
      assertEqual(intersectUnsorted([3, 1, 2, 1], [2, 2, 4]), [2]);
    `,
  },
  { label: "No overlap returns an empty array", source: `assertEqual(intersectUnsorted([1, 2], [3, 4]), []);` },
  {
    label: "Works regardless of either array's order",
    source: `assertEqual(intersectUnsorted([5, 6], [6, 5]), [5, 6]);`,
  },
];

const FIND_AVAILABLE_MEETING_SLOTS_TESTS: SandboxTest[] = [
  {
    label: "Finds every gap between meetings and around the edges",
    source: `
      assert(typeof findAvailableSlots === "function", "findAvailableSlots is not defined");
      assertEqual(findAvailableSlots([[10, 11], [13, 14]], 9, 17), [[9, 10], [11, 13], [14, 17]]);
    `,
  },
  { label: "No meetings means the whole day is free", source: `assertEqual(findAvailableSlots([], 9, 17), [[9, 17]]);` },
  {
    label: "A fully booked day has no free slots",
    source: `assertEqual(findAvailableSlots([[9, 17]], 9, 17), []);`,
  },
];

const LONGEST_UNIQUE_SUBSTRING_TESTS: SandboxTest[] = [
  {
    label: "The longest run is \"abc\"",
    source: `
      assert(typeof lengthOfLongestUniqueSubstring === "function", "lengthOfLongestUniqueSubstring is not defined");
      assertEqual(lengthOfLongestUniqueSubstring("abcabcbb"), 3);
    `,
  },
  { label: "All-repeated characters cap the answer at 1", source: `assertEqual(lengthOfLongestUniqueSubstring("bbbbb"), 1);` },
  { label: "An empty string has length 0", source: `assertEqual(lengthOfLongestUniqueSubstring(""), 0);` },
];

const VALIDATE_PARENTHESES_STRING_TESTS: SandboxTest[] = [
  {
    label: "Properly nested mixed brackets",
    source: `
      assert(typeof isValidParens === "function", "isValidParens is not defined");
      assertEqual(isValidParens("({[]})"), true);
    `,
  },
  { label: "Mismatched bracket types", source: `assertEqual(isValidParens("(]"), false);` },
  { label: "Unclosed brackets are invalid", source: `assertEqual(isValidParens("((("), false);` },
];

const PICK_UP_STONES_GAME_TESTS: SandboxTest[] = [
  {
    label: "A multiple of 4 is a loss for the first player",
    source: `
      assert(typeof canFirstPlayerWin === "function", "canFirstPlayerWin is not defined");
      assertEqual(canFirstPlayerWin(4), false);
    `,
  },
  { label: "The first player can force a win", source: `assertEqual(canFirstPlayerWin(5), true);` },
  {
    label: "The first player takes the single stone and wins immediately",
    source: `assertEqual(canFirstPlayerWin(1), true);`,
  },
];

const FIND_SINGLE_INTEGER_XOR_TESTS: SandboxTest[] = [
  {
    label: "Finds the one number without a pair",
    source: `
      assert(typeof singleNumber === "function", "singleNumber is not defined");
      assertEqual(singleNumber([4, 1, 2, 1, 2]), 4);
    `,
  },
  { label: "A single-element array is itself the answer", source: `assertEqual(singleNumber([7]), 7);` },
  {
    label: "Works regardless of where the unpaired number sits",
    source: `assertEqual(singleNumber([1, 1, 3, 3, 9]), 9);`,
  },
];

const MOVE_ZEROES_IN_PLACE_TESTS: SandboxTest[] = [
  {
    label: "Non-zero order is preserved, zeros pushed to the end",
    source: `
      assert(typeof moveZeroes === "function", "moveZeroes is not defined");
      assertEqual(moveZeroes([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
    `,
  },
  { label: "An all-zero array is unchanged", source: `assertEqual(moveZeroes([0, 0, 0]), [0, 0, 0]);` },
  { label: "An array with no zeros needs no changes", source: `assertEqual(moveZeroes([1, 2, 3]), [1, 2, 3]);` },
];

const COUNT_PALINDROMIC_SUBSTRINGS_TESTS: SandboxTest[] = [
  {
    label: "Only the single characters are palindromes",
    source: `
      assert(typeof countPalindromicSubstrings === "function", "countPalindromicSubstrings is not defined");
      assertEqual(countPalindromicSubstrings("abc"), 3);
    `,
  },
  {
    label: "Overlapping palindromic substrings all count: a,a,a,aa,aa,aaa",
    source: `assertEqual(countPalindromicSubstrings("aaa"), 6);`,
  },
  { label: "An empty string has none", source: `assertEqual(countPalindromicSubstrings(""), 0);` },
];

const ANGLE_BETWEEN_CLOCK_HANDS_TESTS: SandboxTest[] = [
  {
    label: "Both hands point at 12",
    source: `
      assert(typeof angleBetweenHands === "function", "angleBetweenHands is not defined");
      assertEqual(angleBetweenHands(12, 0), 0);
    `,
  },
  { label: "A quarter past twelve, hour-wise", source: `assertEqual(angleBetweenHands(3, 0), 90);` },
  { label: "Hands pointing in exactly opposite directions", source: `assertEqual(angleBetweenHands(6, 0), 180);` },
];

const KTH_LARGEST_ELEMENT_TESTS: SandboxTest[] = [
  {
    label: "The 2nd largest value",
    source: `
      assert(typeof kthLargest === "function", "kthLargest is not defined");
      assertEqual(kthLargest([3, 2, 1, 5, 6, 4], 2), 5);
    `,
  },
  {
    label: "Duplicates count individually, not just distinct values",
    source: `assertEqual(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4);`,
  },
  { label: "A single-element array's 1st largest is itself", source: `assertEqual(kthLargest([1], 1), 1);` },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 9

const IMPLEMENT_MATH_POW_TESTS: SandboxTest[] = [
  {
    label: "A positive exponent",
    source: `
      assert(typeof myPow === "function", "myPow is not defined");
      assertEqual(myPow(2, 10), 1024);
    `,
  },
  { label: "A negative exponent inverts the result", source: `assertEqual(myPow(2, -2), 0.25);` },
  { label: "Any base to the power of 0 is 1", source: `assertEqual(myPow(5, 0), 1);` },
];

const IMPLEMENT_MATH_SQRT_TESTS: SandboxTest[] = [
  {
    label: "A perfect square",
    source: `
      assert(typeof mySqrt === "function", "mySqrt is not defined");
      assertEqual(Math.round(mySqrt(16)), 4);
    `,
  },
  {
    label: "An irrational result converges closely",
    source: `assert(Math.abs(mySqrt(2) - Math.SQRT2) < 1e-6, "expected mySqrt(2) to closely approximate Math.SQRT2");`,
  },
  { label: "The square root of 0 is 0", source: `assertEqual(mySqrt(0), 0);` },
];

const IMPLEMENT_MATH_CLZ32_TESTS: SandboxTest[] = [
  {
    label: "1 has 31 leading zero bits in 32-bit form",
    source: `
      assert(typeof myClz32 === "function", "myClz32 is not defined");
      assertEqual(myClz32(1), 31);
    `,
  },
  {
    label: "0 has no set bits at all, so all 32 count as leading zeros",
    source: `assertEqual(myClz32(0), 32);`,
  },
  { label: "1000 needs 10 bits, leaving 22 leading zeros", source: `assertEqual(myClz32(1000), 22);` },
];

const BIGINT_STRING_ADDITION_TESTS: SandboxTest[] = [
  {
    label: "Adds two same-length numbers",
    source: `
      assert(typeof bigIntAdd === "function", "bigIntAdd is not defined");
      assertEqual(bigIntAdd("123", "456"), "579");
    `,
  },
  { label: "A carry cascades all the way through", source: `assertEqual(bigIntAdd("999", "1"), "1000");` },
  { label: "Zero plus zero is zero", source: `assertEqual(bigIntAdd("0", "0"), "0");` },
];

const BIGINT_STRING_SUBTRACTION_TESTS: SandboxTest[] = [
  {
    label: "A simple digit-by-digit subtraction",
    source: `
      assert(typeof bigIntSubtract === "function", "bigIntSubtract is not defined");
      assertEqual(bigIntSubtract("456", "123"), "333");
    `,
  },
  { label: "A borrow cascades through multiple digits", source: `assertEqual(bigIntSubtract("1000", "999"), "1");` },
  { label: "Subtracting a number from itself gives 0", source: `assertEqual(bigIntSubtract("100", "100"), "0");` },
];

const BIGINT_SIGNED_ADDITION_TESTS: SandboxTest[] = [
  {
    label: "Two positive numbers add normally",
    source: `
      assert(typeof bigIntAddSigned === "function", "bigIntAddSigned is not defined");
      assertEqual(bigIntAddSigned("5", "3"), "8");
    `,
  },
  { label: "A negative plus a smaller positive stays negative", source: `assertEqual(bigIntAddSigned("-5", "3"), "-2");` },
  {
    label: "A positive plus a larger-magnitude negative goes negative",
    source: `assertEqual(bigIntAddSigned("5", "-8"), "-3");`,
  },
  {
    label: "Two negatives add their magnitudes and stay negative",
    source: `assertEqual(bigIntAddSigned("-5", "-3"), "-8");`,
  },
];

const BIGINT_SIGNED_SUBTRACTION_TESTS: SandboxTest[] = [
  {
    label: "A simple positive subtraction",
    source: `
      assert(typeof bigIntSubtractSigned === "function", "bigIntSubtractSigned is not defined");
      assertEqual(bigIntSubtractSigned("5", "3"), "2");
    `,
  },
  { label: "Subtracting a larger number goes negative", source: `assertEqual(bigIntSubtractSigned("3", "5"), "-2");` },
  {
    label: "Subtracting a positive from a negative makes it more negative",
    source: `assertEqual(bigIntSubtractSigned("-5", "3"), "-8");`,
  },
  {
    label: "Subtracting a negative is the same as adding its magnitude",
    source: `assertEqual(bigIntSubtractSigned("5", "-3"), "8");`,
  },
];

const BIGINT_STRING_MULTIPLICATION_TESTS: SandboxTest[] = [
  {
    label: "A standard multi-digit multiplication",
    source: `
      assert(typeof bigIntMultiply === "function", "bigIntMultiply is not defined");
      assertEqual(bigIntMultiply("123", "456"), "56088");
    `,
  },
  { label: "Anything times zero is zero", source: `assertEqual(bigIntMultiply("0", "999"), "0");` },
  {
    label: "Handles a number far beyond safe integer precision",
    source: `assertEqual(bigIntMultiply("999999999999", "2"), "1999999999998");`,
  },
];

const BIGINT_STRING_DIVISION_TESTS: SandboxTest[] = [
  {
    label: "An evenly divisible case",
    source: `
      assert(typeof bigIntDivide === "function", "bigIntDivide is not defined");
      assertEqual(bigIntDivide("100", "5"), "20");
    `,
  },
  { label: "The result is floored, not fractional", source: `assertEqual(bigIntDivide("7", "2"), "3");` },
  {
    label: "Handles a number far beyond safe integer precision",
    source: `assertEqual(bigIntDivide("999999999999", "3"), "333333333333");`,
  },
];

const BIGDECIMAL_ADDITION_TESTS: SandboxTest[] = [
  {
    label: "Different decimal-place counts align correctly",
    source: `
      assert(typeof bigDecimalAdd === "function", "bigDecimalAdd is not defined");
      assertEqual(bigDecimalAdd("12.34", "5.6"), "17.94");
    `,
  },
  {
    label: "Exact, unlike native floating-point 0.1 + 0.2",
    source: `assertEqual(bigDecimalAdd("0.1", "0.2"), "0.3");`,
  },
  { label: "A whole number plus a decimal", source: `assertEqual(bigDecimalAdd("100", "0.5"), "100.5");` },
];

const BIGDECIMAL_SUBTRACTION_TESTS: SandboxTest[] = [
  {
    label: "A borrow crosses from the fractional part into the integer part",
    source: `
      assert(typeof bigDecimalSubtract === "function", "bigDecimalSubtract is not defined");
      assertEqual(bigDecimalSubtract("5.00", "1.25"), "3.75");
    `,
  },
  { label: "No borrow needed", source: `assertEqual(bigDecimalSubtract("10.5", "3.2"), "7.3");` },
  {
    label: "A whole number minus a decimal, borrowing all the way down to 0",
    source: `assertEqual(bigDecimalSubtract("1", "0.25"), "0.75");`,
  },
];

const BIGDECIMAL_MULTIPLICATION_TESTS: SandboxTest[] = [
  {
    label: "A decimal times a whole number",
    source: `
      assert(typeof bigDecimalMultiply === "function", "bigDecimalMultiply is not defined");
      assertEqual(bigDecimalMultiply("2.5", "4"), "10.0");
    `,
  },
  { label: "Two decimals multiply exactly", source: `assertEqual(bigDecimalMultiply("1.5", "1.5"), "2.25");` },
  {
    label: "Small decimals stay exact, unlike native floating-point",
    source: `assertEqual(bigDecimalMultiply("0.1", "0.2"), "0.02");`,
  },
];

const BIGDECIMAL_DIVISION_TESTS: SandboxTest[] = [
  {
    label: "An exact division formatted to the requested precision",
    source: `
      assert(typeof bigDecimalDivide === "function", "bigDecimalDivide is not defined");
      assertEqual(bigDecimalDivide("10", "4", 2), "2.50");
    `,
  },
  {
    label: "A repeating decimal, truncated at the requested precision",
    source: `assertEqual(bigDecimalDivide("1", "3", 4), "0.3333");`,
  },
  {
    label: "Decimal inputs on both sides of the division",
    source: `assertEqual(bigDecimalDivide("7.5", "2.5", 1), "3.0");`,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 10

const NEXT_RIGHT_SIBLING_TESTS: SandboxTest[] = [
  {
    label: "Finds a sibling under the same parent",
    source: `
      assert(typeof findNextRightSibling === "function", "findNextRightSibling is not defined");
      const tree = { id: "root", children: [{ id: "a", children: [] }, { id: "b", children: [] }] };
      assertEqual(findNextRightSibling(tree, "a"), "b");
    `,
  },
  {
    label: "The rightmost node at a level has no next sibling",
    source: `
      const tree2 = { id: "root", children: [{ id: "a", children: [] }, { id: "b", children: [] }] };
      assertEqual(findNextRightSibling(tree2, "b"), null);
    `,
  },
  {
    label: "Finds a level-neighbor across different parents",
    source: `
      const tree3 = {
        id: "root",
        children: [
          { id: "left", children: [{ id: "a", children: [] }] },
          { id: "right", children: [{ id: "b", children: [] }] },
        ],
      };
      assertEqual(findNextRightSibling(tree3, "a"), "b");
    `,
  },
];

const TRAVERSE_DOM_LEVEL_BY_LEVEL_TESTS: SandboxTest[] = [
  {
    label: "Groups nodes correctly by depth",
    source: `
      assert(typeof levelOrderTraversal === "function", "levelOrderTraversal is not defined");
      const tree = {
        id: "root",
        children: [
          { id: "a", children: [{ id: "c", children: [] }] },
          { id: "b", children: [] },
        ],
      };
      assertEqual(levelOrderTraversal(tree), [["root"], ["a", "b"], ["c"]]);
    `,
  },
  {
    label: "A single-node tree has exactly one level",
    source: `
      const single = { id: "root", children: [] };
      assertEqual(levelOrderTraversal(single), [["root"]]);
    `,
  },
  { label: "An empty tree produces an empty result", source: `assertEqual(levelOrderTraversal(null), []);` },
];

const JQUERY_STYLE_DOM_WRAPPER_TESTS: SandboxTest[] = [
  {
    label: "Wraps every matching element",
    source: `
      assert(typeof $ === "function", "$ is not defined");
      document.body.innerHTML = '<div class="box"></div><div class="box"></div>';
      assertEqual($(".box").length, 2);
    `,
  },
  {
    label: "addClass() applies to all matches and is chainable",
    source: `
      document.body.innerHTML = '<div class="box"></div><div class="box"></div>';
      $(".box").addClass("active");
      document.querySelectorAll(".box").forEach((el) => {
        assert(el.classList.contains("active"), "expected every matched element to have the active class");
      });
    `,
  },
  {
    label: "text() applies to every matched element",
    source: `
      document.body.innerHTML = '<div class="box"></div><div class="box"></div>';
      $(".box").text("hi");
      document.querySelectorAll(".box").forEach((el) => {
        assertEqual(el.textContent, "hi");
      });
    `,
  },
];

const CREATE_DOM_ELEMENT_STORE_TESTS: SandboxTest[] = [
  {
    label: "Stores and retrieves data keyed by element",
    source: `
      assert(typeof createElementStore === "function", "createElementStore is not defined");
      const store = createElementStore();
      const el = document.createElement("div");
      store.set(el, { count: 1 });
      assertEqual(store.get(el), { count: 1 });
    `,
  },
  {
    label: "Different elements never share data",
    source: `
      const store2 = createElementStore();
      const elA = document.createElement("div");
      const elB = document.createElement("div");
      store2.set(elA, "a-data");
      store2.set(elB, "b-data");
      assertEqual(store2.get(elA), "a-data");
      assertEqual(store2.get(elB), "b-data");
    `,
  },
  {
    label: "delete() removes the association",
    source: `
      const store3 = createElementStore();
      const el3 = document.createElement("div");
      store3.set(el3, "data");
      store3.delete(el3);
      assertEqual(store3.has(el3), false);
    `,
  },
];

const FIND_CORRESPONDING_DOM_NODE_TESTS: SandboxTest[] = [
  {
    label: "Finds a deeply nested corresponding node",
    source: `
      assert(typeof findCorrespondingNode === "function", "findCorrespondingNode is not defined");
      const rootA = document.createElement("div");
      rootA.innerHTML = '<section><ul><li id="target">Item</li></ul></section>';
      const rootB = rootA.cloneNode(true);
      const target = rootA.querySelector("#target");
      const found = findCorrespondingNode(rootA, rootB, target);
      assertEqual(found.id, "target");
      assert(found !== target, "the found node should belong to rootB, not be the same reference as target");
    `,
  },
  {
    label: "The root corresponds to the other root",
    source: `
      const rootA2 = document.createElement("div");
      rootA2.innerHTML = "<span>x</span>";
      const rootB2 = rootA2.cloneNode(true);
      assert(findCorrespondingNode(rootA2, rootB2, rootA2) === rootB2, "the root should correspond to the other root");
    `,
  },
  {
    label: "The found node has the same tag as the target",
    source: `
      const rootA3 = document.createElement("div");
      rootA3.innerHTML = "<p><b>bold</b></p>";
      const rootB3 = rootA3.cloneNode(true);
      const target3 = rootA3.querySelector("b");
      const found3 = findCorrespondingNode(rootA3, rootB3, target3);
      assertEqual(found3.tagName, "B");
    `,
  },
];

const TWO_WAY_INPUT_BINDING_TESTS: SandboxTest[] = [
  {
    label: "The initial value is applied to the input",
    source: `
      assert(typeof createTwoWayBinding === "function", "createTwoWayBinding is not defined");
      const input = document.createElement("input");
      createTwoWayBinding(input, "hello");
      assertEqual(input.value, "hello");
    `,
  },
  {
    label: "setValue() updates both directions",
    source: `
      const input2 = document.createElement("input");
      const binding2 = createTwoWayBinding(input2, "start");
      binding2.setValue("new");
      assertEqual(binding2.getValue(), "new");
      assertEqual(input2.value, "new");
    `,
  },
  {
    label: "Typing into the input updates the bound value",
    source: `
      const input3 = document.createElement("input");
      const binding3 = createTwoWayBinding(input3, "start");
      input3.value = "typed";
      input3.dispatchEvent(new Event("input"));
      assertEqual(binding3.getValue(), "typed");
    `,
  },
];

const GET_DOM_TREE_HEIGHT_TESTS: SandboxTest[] = [
  {
    label: "An empty tree has height 0",
    source: `
      assert(typeof treeHeight === "function", "treeHeight is not defined");
      assertEqual(treeHeight(null), 0);
    `,
  },
  { label: "A leaf-only tree has height 1", source: `assertEqual(treeHeight({ id: "root", children: [] }), 1);` },
  {
    label: "Height follows the deepest branch, not the shallowest",
    source: `
      const tree = {
        id: "root",
        children: [
          { id: "a", children: [] },
          { id: "b", children: [{ id: "c", children: [{ id: "d", children: [] }] }] },
        ],
      };
      assertEqual(treeHeight(tree), 4);
    `,
  },
];

const GET_ALL_DOM_TAGS_TESTS: SandboxTest[] = [
  {
    label: "Lists tags in preorder, including duplicates",
    source: `
      assert(typeof getAllTags === "function", "getAllTags is not defined");
      const tree = { tag: "div", children: [{ tag: "span", children: [] }, { tag: "span", children: [] }] };
      assertEqual(getAllTags(tree), ["div", "span", "span"]);
    `,
  },
  {
    label: "A leaf node returns a single-item array",
    source: `assertEqual(getAllTags({ tag: "p", children: [] }), ["p"]);`,
  },
  { label: "An empty tree returns an empty array", source: `assertEqual(getAllTags(null), []);` },
];

const HIGHLIGHT_KEYWORDS_IN_HTML_TESTS: SandboxTest[] = [
  {
    label: "Wraps a single matching keyword",
    source: `
      assert(typeof highlightKeywords === "function", "highlightKeywords is not defined");
      assertEqual(highlightKeywords("Hello world", ["world"]), "Hello <mark>world</mark>");
    `,
  },
  {
    label: "Wraps every distinct keyword given",
    source: `assertEqual(highlightKeywords("The cat sat", ["cat", "sat"]), "The <mark>cat</mark> <mark>sat</mark>");`,
  },
  {
    label: "Matches case-insensitively but preserves the original casing",
    source: `assertEqual(highlightKeywords("Hello WORLD", ["world"]), "Hello <mark>WORLD</mark>");`,
  },
];

const EXTRACT_ANCHOR_ELEMENTS_TESTS: SandboxTest[] = [
  {
    label: "Extracts every anchor's href and text, ignoring other tags",
    source: `
      assert(typeof extractAnchors === "function", "extractAnchors is not defined");
      const result = extractAnchors("<a href=\\"/x\\">X</a><p>text</p><a href=\\"/y\\">Y</a>");
      assertEqual(result, [{ href: "/x", text: "X" }, { href: "/y", text: "Y" }]);
    `,
  },
  { label: "No anchors returns an empty array", source: `assertEqual(extractAnchors("<p>no links here</p>"), []);` },
  {
    label: "Finds anchors nested inside other elements",
    source: `
      const result2 = extractAnchors("<div><a href=\\"/nested\\">Nested</a></div>");
      assertEqual(result2, [{ href: "/nested", text: "Nested" }]);
    `,
  },
];

const IMPLEMENT_EVENT_DELEGATION_TESTS: SandboxTest[] = [
  {
    label: "Works for dynamically-added matching children",
    source: `
      assert(typeof createDelegatedListener === "function", "createDelegatedListener is not defined");
      document.body.innerHTML = '<div id="container"></div>';
      const container = document.getElementById("container");
      let clicked = null;
      createDelegatedListener(container, ".item", "click", function () { clicked = this.textContent; });
      const item = document.createElement("button");
      item.className = "item";
      item.textContent = "added-later";
      container.appendChild(item);
      item.click();
      assertEqual(clicked, "added-later");
    `,
  },
  {
    label: "Non-matching targets are correctly ignored",
    source: `
      document.body.innerHTML = '<div id="container2"><button class="not-item">no</button></div>';
      const container2 = document.getElementById("container2");
      let handlerCalled = false;
      createDelegatedListener(container2, ".item", "click", () => { handlerCalled = true; });
      container2.querySelector(".not-item").click();
      assertEqual(handlerCalled, false);
    `,
  },
  {
    label: "The returned function actually removes the listener",
    source: `
      document.body.innerHTML = '<div id="container3"><button class="item">go</button></div>';
      const container3 = document.getElementById("container3");
      let calls = 0;
      const unsubscribe = createDelegatedListener(container3, ".item", "click", () => { calls++; });
      const btn = container3.querySelector(".item");
      btn.click();
      unsubscribe();
      btn.click();
      assertEqual(calls, 1);
    `,
  },
];

const PREVIOUS_LEFT_SIBLING_TESTS: SandboxTest[] = [
  {
    label: "Finds a left sibling under the same parent",
    source: `
      assert(typeof findPreviousLeftSibling === "function", "findPreviousLeftSibling is not defined");
      const tree = { id: "root", children: [{ id: "a", children: [] }, { id: "b", children: [] }] };
      assertEqual(findPreviousLeftSibling(tree, "b"), "a");
    `,
  },
  {
    label: "The leftmost node at a level has no previous sibling",
    source: `
      const tree2 = { id: "root", children: [{ id: "a", children: [] }, { id: "b", children: [] }] };
      assertEqual(findPreviousLeftSibling(tree2, "a"), null);
    `,
  },
  {
    label: "Finds a level-neighbor across different parents",
    source: `
      const tree3 = {
        id: "root",
        children: [
          { id: "left", children: [{ id: "a", children: [] }] },
          { id: "right", children: [{ id: "b", children: [] }] },
        ],
      };
      assertEqual(findPreviousLeftSibling(tree3, "b"), "a");
    `,
  },
];

const GENERATE_CSS_SELECTOR_TESTS: SandboxTest[] = [
  {
    label: "An id short-circuits straight to an #id selector",
    source: `
      assert(typeof generateSelector === "function", "generateSelector is not defined");
      document.body.innerHTML = '<div id="target"></div>';
      const el = document.getElementById("target");
      assertEqual(generateSelector(el), "#target");
    `,
  },
  {
    label: "Builds a full ancestor path when there's no id to anchor on",
    source: `
      document.body.innerHTML = '<section><ul><li>a</li><li>b</li></ul></section>';
      const secondLi = document.querySelectorAll("li")[1];
      const selector = generateSelector(secondLi);
      assert(selector.includes("li:nth-child(2)"), "expected the selector to reference the second li via nth-child");
    `,
  },
  {
    label: "The generated selector is actually valid and correct",
    source: `
      document.body.innerHTML = '<section><ul><li>a</li><li>b</li></ul></section>';
      const secondLi2 = document.querySelectorAll("li")[1];
      const selector2 = generateSelector(secondLi2);
      assert(document.querySelector(selector2) === secondLi2, "the generated selector should resolve back to the exact original element");
    `,
  },
];

const COOKIE_STRING_HELPER_TESTS: SandboxTest[] = [
  {
    label: "Parses multiple key=value pairs",
    source: `
      assert(typeof parseCookies === "function", "parseCookies is not defined");
      assertEqual(parseCookies("a=1; b=2; c=3"), { a: "1", b: "2", c: "3" });
    `,
  },
  {
    label: "URL-encodes the value",
    source: `
      assert(typeof stringifyCookie === "function", "stringifyCookie is not defined");
      assertEqual(stringifyCookie("name", "a b", {}), "name=a%20b");
    `,
  },
  {
    label: "Includes max-age and path when given",
    source: `assertEqual(stringifyCookie("name", "v", { days: 1, path: "/" }), "name=v; max-age=86400; path=/");`,
  },
];

const EXPIRING_STORAGE_CACHE_TESTS: SandboxTest[] = [
  {
    label: "A freshly set value is immediately retrievable",
    source: `
      assert(typeof createExpiringStorage === "function", "createExpiringStorage is not defined");
      const storage = createExpiringStorage();
      storage.set("key", "value", 1000);
      assertEqual(storage.get("key"), "value");
    `,
  },
  {
    label: "An expired entry returns null",
    source: `
      const storage2 = createExpiringStorage();
      storage2.set("key", "value", 20);
      await delay(50);
      assertEqual(storage2.get("key"), null);
    `,
  },
  {
    label: "An entry with no ttl never expires",
    source: `
      const storage3 = createExpiringStorage();
      storage3.set("key", "value");
      await delay(50);
      assertEqual(storage3.get("key"), "value");
    `,
  },
];

const LRU_CACHE_STORAGE_EVICTION_TESTS: SandboxTest[] = [
  {
    label: "Evicts the least-recently-used entry once full",
    source: `
      assert(typeof createLRUCache === "function", "createLRUCache is not defined");
      const cache = createLRUCache(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      assertEqual(cache.get("a"), undefined);
      assertEqual(cache.get("c"), 3);
    `,
  },
  {
    label: "Reading an entry protects it from eviction",
    source: `
      const cache2 = createLRUCache(2);
      cache2.set("a", 1);
      cache2.set("b", 2);
      cache2.get("a");
      cache2.set("c", 3);
      assertEqual(cache2.get("a"), 1);
      assertEqual(cache2.get("b"), undefined);
    `,
  },
  {
    label: "Overwriting an existing key doesn't count against capacity",
    source: `
      const cache3 = createLRUCache(2);
      cache3.set("a", 1);
      cache3.set("b", 2);
      cache3.set("a", 99);
      assertEqual(cache3.get("a"), 99);
      assertEqual(cache3.get("b"), 2);
    `,
  },
];

const INFINITE_SCROLL_LOADER_TESTS: SandboxTest[] = [
  {
    label: "Accumulates items across multiple pages",
    source: `
      assert(typeof createInfiniteScrollLoader === "function", "createInfiniteScrollLoader is not defined");
      const pages = { null: { items: [1, 2], nextCursor: "p2" }, p2: { items: [3, 4], nextCursor: null } };
      async function fetchPage(cursor) { return pages[cursor === null ? "null" : cursor]; }
      const loader = createInfiniteScrollLoader(fetchPage);
      await loader.loadNext();
      await loader.loadNext();
      assertEqual(loader.getItems(), [1, 2, 3, 4]);
    `,
  },
  {
    label: "Correctly detects the end of the data",
    source: `
      async function singlePage() { return { items: ["only"], nextCursor: null }; }
      const loader2 = createInfiniteScrollLoader(singlePage);
      await loader2.loadNext();
      assertEqual(loader2.hasMore(), false);
    `,
  },
  {
    label: "Guards against a duplicate fetch while one is in flight",
    source: `
      let fetchCount = 0;
      async function slowPage() {
        fetchCount++;
        await delay(30);
        return { items: [1], nextCursor: null };
      }
      const loader3 = createInfiniteScrollLoader(slowPage);
      const p1 = loader3.loadNext();
      const p2 = loader3.loadNext();
      await Promise.all([p1, p2]);
      assertEqual(fetchCount, 1);
    `,
  },
];

const WINDOWED_LIST_VIEWPORT_TESTS: SandboxTest[] = [
  {
    label: "Starts correctly at the top of the list",
    source: `
      assert(typeof createVirtualList === "function", "createVirtualList is not defined");
      const items = Array.from({ length: 100 }, (_, i) => i);
      const list = createVirtualList(items, 40, 400, 3);
      const view = list.getVisibleItems(0);
      assertEqual(view.startIndex, 0);
      assertEqual(view.offsetY, 0);
      assertEqual(view.items[0], 0);
    `,
  },
  {
    label: "Correctly windows a scrolled-down position",
    source: `
      const items2 = Array.from({ length: 100 }, (_, i) => i);
      const list2 = createVirtualList(items2, 40, 400, 3);
      const view2 = list2.getVisibleItems(2000);
      assert(view2.offsetY > 0, "expected a non-zero offsetY once scrolled down");
      assertEqual(view2.startIndex, Math.max(0, Math.floor(2000 / 40) - 3));
    `,
  },
  {
    label: "Never returns anywhere close to the full list, regardless of its size",
    source: `
      const items3 = Array.from({ length: 10000 }, (_, i) => i);
      const list3 = createVirtualList(items3, 40, 400, 3);
      const view3 = list3.getVisibleItems(400000);
      assert(view3.items.length < 30, "expected a small, bounded window even for 10,000 items, got " + view3.items.length);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 11

const BUILD_EVENT_EMITTER_TESTS: SandboxTest[] = [
  {
    label: "Multiple listeners for the same event all fire",
    source: `
      assert(typeof EventEmitter === "function", "EventEmitter is not defined");
      const emitter = new EventEmitter();
      const received1 = [];
      const received2 = [];
      emitter.on("greet", (name) => received1.push(name));
      emitter.on("greet", (name) => received2.push(name));
      emitter.emit("greet", "Ada");
      assertEqual(received1, ["Ada"]);
      assertEqual(received2, ["Ada"]);
    `,
  },
  {
    label: "off() removes exactly the specified handler",
    source: `
      const emitter2 = new EventEmitter();
      const calls = [];
      const handlerA = () => calls.push("a");
      const handlerB = () => calls.push("b");
      emitter2.on("x", handlerA);
      emitter2.on("x", handlerB);
      emitter2.off("x", handlerA);
      emitter2.emit("x");
      assertEqual(calls, ["b"]);
    `,
  },
  {
    label: "once() auto-removes itself after firing",
    source: `
      const emitter3 = new EventEmitter();
      let calls3 = 0;
      emitter3.once("x", () => calls3++);
      emitter3.emit("x");
      emitter3.emit("x");
      assertEqual(calls3, 1);
    `,
  },
];

const BUILD_PUBSUB_MODULE_TESTS: SandboxTest[] = [
  {
    label: "Subscribers receive published data",
    source: `
      assert(typeof createPubSub === "function", "createPubSub is not defined");
      const bus = createPubSub();
      let received;
      bus.subscribe("news", (data) => { received = data; });
      bus.publish("news", "breaking!");
      assertEqual(received, "breaking!");
    `,
  },
  {
    label: "The returned unsubscribe function actually works",
    source: `
      const bus2 = createPubSub();
      let calls = 0;
      const unsubscribe = bus2.subscribe("x", () => calls++);
      bus2.publish("x");
      unsubscribe();
      bus2.publish("x");
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Topics are completely independent",
    source: `
      const bus3 = createPubSub();
      let aCalls = 0;
      let bCalls = 0;
      bus3.subscribe("a", () => aCalls++);
      bus3.subscribe("b", () => bCalls++);
      bus3.publish("a");
      assertEqual(aCalls, 1);
      assertEqual(bCalls, 0);
    `,
  },
];

const TEMPLATE_STRING_INTERPOLATION_TESTS: SandboxTest[] = [
  {
    label: "Replaces a simple placeholder",
    source: `
      assert(typeof interpolate === "function", "interpolate is not defined");
      assertEqual(interpolate("Hi {{name}}", { name: "Ada" }), "Hi Ada");
    `,
  },
  {
    label: "Supports nested dotted paths",
    source: `assertEqual(interpolate("{{user.name}}", { user: { name: "Grace" } }), "Grace");`,
  },
  { label: "An unresolvable path becomes an empty string", source: `assertEqual(interpolate("{{missing}}", {}), "");` },
];

const EXTRACT_TWITTER_MENTIONS_TESTS: SandboxTest[] = [
  {
    label: "Extracts a single mention",
    source: `
      assert(typeof extractMentions === "function", "extractMentions is not defined");
      assertEqual(extractMentions("Hello @alice!"), ["alice"]);
    `,
  },
  {
    label: "Extracts multiple mentions in order",
    source: `assertEqual(extractMentions("cc @bob and @carol"), ["bob", "carol"]);`,
  },
  {
    label: "An email address's @ is not treated as a mention",
    source: `assertEqual(extractMentions("email me at user@example.com"), []);`,
  },
];

const BUILD_MIDDLEWARE_PIPELINE_TESTS: SandboxTest[] = [
  {
    label: "Middlewares run in the order they were registered",
    source: `
      assert(typeof createMiddlewarePipeline === "function", "createMiddlewarePipeline is not defined");
      const pipeline = createMiddlewarePipeline();
      const order = [];
      pipeline.use((ctx, next) => { order.push(1); next(); });
      pipeline.use((ctx, next) => { order.push(2); next(); });
      pipeline.use((ctx, next) => { order.push(3); next(); });
      pipeline.run({});
      assertEqual(order, [1, 2, 3]);
    `,
  },
  {
    label: "The chain stops if next() isn't called",
    source: `
      const pipeline2 = createMiddlewarePipeline();
      const order2 = [];
      pipeline2.use((ctx, next) => { order2.push(1); });
      pipeline2.use((ctx, next) => { order2.push(2); next(); });
      pipeline2.run({});
      assertEqual(order2, [1]);
    `,
  },
  {
    label: "Context is shared and mutable across the whole chain",
    source: `
      const pipeline3 = createMiddlewarePipeline();
      pipeline3.use((ctx, next) => { ctx.value = 1; next(); });
      pipeline3.use((ctx, next) => { ctx.value += 1; next(); });
      const context = {};
      pipeline3.run(context);
      assertEqual(context.value, 2);
    `,
  },
];

const IMPLEMENT_LAZY_MAN_TESTS: SandboxTest[] = [
  {
    label: "Greets immediately, then eats",
    source: `
      assert(typeof LazyMan === "function", "LazyMan is not defined");
      const originalLog = console.log;
      const logs = [];
      console.log = (msg) => logs.push(msg);
      LazyMan("Hank").eat("dinner");
      await delay(20);
      console.log = originalLog;
      assertEqual(logs, ["Hi I am Hank", "Eat dinner"]);
    `,
  },
  {
    label: "sleep() delays everything chained after it",
    source: `
      const originalLog2 = console.log;
      const logs2 = [];
      console.log = (msg) => logs2.push(msg);
      LazyMan("Hank").eat("dinner").sleep(0.05).eat("supper");
      await delay(10);
      const beforeSleep = logs2.slice();
      await delay(100);
      console.log = originalLog2;
      assertEqual(beforeSleep, ["Hi I am Hank", "Eat dinner"]);
      assertEqual(logs2, ["Hi I am Hank", "Eat dinner", "Eat supper"]);
    `,
  },
  {
    label: "Multiple chained calls run in FIFO order",
    source: `
      const originalLog3 = console.log;
      const logs3 = [];
      console.log = (msg) => logs3.push(msg);
      LazyMan("A").eat("x").eat("y");
      await delay(20);
      console.log = originalLog3;
      assertEqual(logs3, ["Hi I am A", "Eat x", "Eat y"]);
    `,
  },
];

const BROWSER_HISTORY_UNDO_REDO_TESTS: SandboxTest[] = [
  {
    label: "undo() returns to the previous state",
    source: `
      assert(typeof createHistory === "function", "createHistory is not defined");
      const history = createHistory("a");
      history.push("b");
      assertEqual(history.undo(), "a");
    `,
  },
  {
    label: "redo() restores an undone state",
    source: `
      const history2 = createHistory("a");
      history2.push("b");
      history2.undo();
      assertEqual(history2.redo(), "b");
    `,
  },
  {
    label: "Pushing after an undo discards the abandoned future",
    source: `
      const history3 = createHistory("a");
      history3.push("b");
      history3.undo();
      history3.push("c");
      assertEqual(history3.redo(), "c");
    `,
  },
];

const SIMPLE_CLIENT_SIDE_ROUTER_TESTS: SandboxTest[] = [
  {
    label: "Matches a static route",
    source: `
      assert(typeof createRouter === "function", "createRouter is not defined");
      let matched = false;
      const router = createRouter({ "/about": () => { matched = true; } });
      router.navigate("/about");
      assertEqual(matched, true);
    `,
  },
  {
    label: "Matches a dynamic route and extracts the param",
    source: `
      let receivedParams = null;
      const router2 = createRouter({ "/user/:id": (params) => { receivedParams = params; } });
      router2.navigate("/user/42");
      assertEqual(receivedParams, { id: "42" });
    `,
  },
  {
    label: "Falls back to the wildcard handler when nothing matches",
    source: `
      let fellBack = false;
      const router3 = createRouter({ "/about": () => {}, "*": () => { fellBack = true; } });
      router3.navigate("/nowhere");
      assertEqual(fellBack, true);
    `,
  },
];

const BUILD_OBSERVABLE_CLASS_TESTS: SandboxTest[] = [
  {
    label: "Emitted values reach the subscribing observer",
    source: `
      assert(typeof Observable === "function", "Observable is not defined");
      const obs = new Observable((observer) => { observer.next(1); });
      let received;
      obs.subscribe({ next: (v) => { received = v; } });
      assertEqual(received, 1);
    `,
  },
  {
    label: "unsubscribe() runs the producer's cleanup",
    source: `
      let cleaned = false;
      const obs2 = new Observable(() => () => { cleaned = true; });
      const sub = obs2.subscribe({ next: () => {} });
      sub.unsubscribe();
      assertEqual(cleaned, true);
    `,
  },
  {
    label: "Each subscription re-runs the producer (cold behavior)",
    source: `
      let producerCalls = 0;
      const obs3 = new Observable((observer) => { producerCalls++; observer.next(producerCalls); });
      obs3.subscribe({ next: () => {} });
      obs3.subscribe({ next: () => {} });
      assertEqual(producerCalls, 2);
    `,
  },
];

const OBSERVABLE_INTERVAL_TESTS: SandboxTest[] = [
  {
    label: "Emits increasing values over time",
    source: `
      assert(typeof interval === "function", "interval is not defined");
      const received = [];
      const sub = interval(20).subscribe({ next: (v) => received.push(v) });
      await delay(70);
      sub.unsubscribe();
      assert(received.length >= 2, "expected at least 2 emissions within 70ms at a 20ms interval");
      assertEqual(received.slice(0, 2), [0, 1]);
    `,
  },
  {
    label: "unsubscribe() stops future emissions",
    source: `
      const received2 = [];
      const sub2 = interval(15).subscribe({ next: (v) => received2.push(v) });
      await delay(40);
      sub2.unsubscribe();
      const countAtUnsub = received2.length;
      await delay(60);
      assertEqual(received2.length, countAtUnsub);
    `,
  },
];

const OBSERVABLE_FROM_EVENT_TESTS: SandboxTest[] = [
  {
    label: "Delivers real DOM events to the observer",
    source: `
      assert(typeof fromEvent === "function", "fromEvent is not defined");
      const button = document.createElement("button");
      let received = null;
      fromEvent(button, "click").subscribe({ next: (e) => { received = e; } });
      button.click();
      assert(received !== null, "expected the click event to be delivered");
      assertEqual(received.type, "click");
    `,
  },
  {
    label: "unsubscribe() removes the underlying event listener",
    source: `
      const button2 = document.createElement("button");
      let calls = 0;
      const sub = fromEvent(button2, "click").subscribe({ next: () => calls++ });
      button2.click();
      sub.unsubscribe();
      button2.click();
      assertEqual(calls, 1);
    `,
  },
];

const OBSERVABLE_TRANSFORM_OPERATORS_TESTS: SandboxTest[] = [
  {
    label: "map transforms every emitted value",
    source: `
      assert(typeof mapOperator === "function", "mapOperator is not defined");
      const source = new Observable((observer) => { observer.next(1); observer.next(2); });
      const received = [];
      mapOperator(source, (x) => x * 2).subscribe({ next: (v) => received.push(v) });
      assertEqual(received, [2, 4]);
    `,
  },
  {
    label: "filter only forwards values matching the predicate",
    source: `
      assert(typeof filterOperator === "function", "filterOperator is not defined");
      const source2 = new Observable((observer) => { observer.next(1); observer.next(2); observer.next(3); observer.next(4); });
      const received2 = [];
      filterOperator(source2, (x) => x % 2 === 0).subscribe({ next: (v) => received2.push(v) });
      assertEqual(received2, [2, 4]);
    `,
  },
  {
    label: "Chaining map and filter together works",
    source: `
      const source3 = new Observable((observer) => { observer.next(1); observer.next(2); observer.next(3); });
      const received3 = [];
      filterOperator(mapOperator(source3, (x) => x + 1), (x) => x > 2).subscribe({ next: (v) => received3.push(v) });
      assertEqual(received3, [3, 4]);
    `,
  },
];

const OBSERVABLE_FROM_ITERABLE_TESTS: SandboxTest[] = [
  {
    label: "Emits every value from the iterable, in order",
    source: `
      assert(typeof from === "function", "from is not defined");
      const received = [];
      from([1, 2, 3]).subscribe({ next: (v) => received.push(v) });
      assertEqual(received, [1, 2, 3]);
    `,
  },
  {
    label: "Calls complete() after all values are emitted",
    source: `
      let completed = false;
      const receivedBeforeComplete = [];
      from([1, 2]).subscribe({
        next: (v) => receivedBeforeComplete.push(v),
        complete: () => { completed = true; },
      });
      assertEqual(completed, true);
      assertEqual(receivedBeforeComplete, [1, 2]);
    `,
  },
  {
    label: "An empty iterable still completes cleanly",
    source: `
      let completed2 = false;
      let nextCalls = 0;
      from([]).subscribe({ next: () => nextCalls++, complete: () => { completed2 = true; } });
      assertEqual(nextCalls, 0);
      assertEqual(completed2, true);
    `,
  },
];

const OBSERVABLE_SUBJECT_TESTS: SandboxTest[] = [
  {
    label: "Multicasts a value to every current subscriber",
    source: `
      assert(typeof Subject === "function", "Subject is not defined");
      const subject = new Subject();
      let a, b;
      subject.subscribe({ next: (v) => { a = v; } });
      subject.subscribe({ next: (v) => { b = v; } });
      subject.next(42);
      assertEqual(a, 42);
      assertEqual(b, 42);
    `,
  },
  {
    label: "No replay of values emitted before subscribing",
    source: `
      const subject2 = new Subject();
      subject2.next("early");
      let received = "unset";
      subject2.subscribe({ next: (v) => { received = v; } });
      assertEqual(received, "unset");
    `,
  },
  {
    label: "unsubscribe() only affects that specific subscriber",
    source: `
      const subject3 = new Subject();
      let aCalls = 0;
      let bCalls = 0;
      const subA = subject3.subscribe({ next: () => aCalls++ });
      subject3.subscribe({ next: () => bCalls++ });
      subA.unsubscribe();
      subject3.next("x");
      assertEqual(aCalls, 0);
      assertEqual(bCalls, 1);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 12

const IMPLEMENT_BTOA_TESTS: SandboxTest[] = [
  {
    label: "Encodes a 5-character string",
    source: `
      assert(typeof myBtoa === "function", "myBtoa is not defined");
      assertEqual(myBtoa("hello"), btoa("hello"));
    `,
  },
  { label: "An empty string encodes to an empty string", source: `assertEqual(myBtoa(""), btoa(""));` },
  { label: "A single character needs two = padding characters", source: `assertEqual(myBtoa("a"), btoa("a"));` },
];

const IMPLEMENT_ATOB_TESTS: SandboxTest[] = [
  {
    label: "Round-trips through the real btoa correctly",
    source: `
      assert(typeof myAtob === "function", "myAtob is not defined");
      assertEqual(myAtob(btoa("hello")), "hello");
    `,
  },
  { label: "An empty encoded string decodes to empty", source: `assertEqual(myAtob(btoa("")), "");` },
  {
    label: "Round-trips a longer alphanumeric string",
    source: `assertEqual(myAtob(btoa("test123")), "test123");`,
  },
];

const IMPLEMENT_JSON_PARSE_TESTS: SandboxTest[] = [
  {
    label: "Parses a nested object with an array value",
    source: `
      assert(typeof myJSONParse === "function", "myJSONParse is not defined");
      assertEqual(myJSONParse('{"a":1,"b":[1,2,3]}'), { a: 1, b: [1, 2, 3] });
    `,
  },
  { label: "Parses a bare boolean", source: `assertEqual(myJSONParse("true"), true);` },
  { label: "Parses a bare null", source: `assertEqual(myJSONParse("null"), null);` },
  {
    label: "Handles surrounding and internal whitespace",
    source: `assertEqual(myJSONParse('  { "x" : 42 }  '), { x: 42 });`,
  },
];

const SERIALIZE_NON_JSON_TYPES_TESTS: SandboxTest[] = [
  {
    label: "Round-trips a Date instance",
    source: `
      assert(typeof encode === "function", "encode is not defined");
      assert(typeof decode === "function", "decode is not defined");
      const original = new Date(2023, 5, 15);
      const restored = decode(encode(original));
      assert(restored instanceof Date, "expected the restored value to be a Date instance");
      assertEqual(restored.getTime(), original.getTime());
    `,
  },
  {
    label: "Round-trips a Map instance",
    source: `
      const originalMap = new Map([["a", 1], ["b", 2]]);
      const restoredMap = decode(encode(originalMap));
      assert(restoredMap instanceof Map, "expected the restored value to be a Map instance");
      assertEqual(Array.from(restoredMap.entries()), [["a", 1], ["b", 2]]);
    `,
  },
  {
    label: "Works for types nested inside a larger structure",
    source: `
      const nested = { createdAt: new Date(2020, 0, 1), name: "test" };
      const restoredNested = decode(encode(nested));
      assert(restoredNested.createdAt instanceof Date, "expected the nested Date to round-trip as a real Date");
      assertEqual(restoredNested.createdAt.getTime(), nested.createdAt.getTime());
      assertEqual(restoredNested.name, "test");
    `,
  },
];

const IMPLEMENT_JSON_STRINGIFY_TESTS: SandboxTest[] = [
  {
    label: "Stringifies a simple object",
    source: `
      assert(typeof myJSONStringify === "function", "myJSONStringify is not defined");
      assertEqual(myJSONStringify({ a: 1, b: "hi" }), '{"a":1,"b":"hi"}');
    `,
  },
  { label: "Stringifies an array", source: `assertEqual(myJSONStringify([1, 2, 3]), "[1,2,3]");` },
  {
    label: "Omits undefined object properties entirely, rather than writing null",
    source: `assertEqual(myJSONStringify({ a: undefined, b: 1 }), '{"b":1}');`,
  },
  {
    label: "Top-level undefined returns actual undefined, matching the real JSON.stringify",
    source: `assertEqual(myJSONStringify(undefined), undefined);`,
  },
];

const IMPLEMENT_URL_SEARCH_PARAMS_TESTS: SandboxTest[] = [
  {
    label: "Parses an initial query string",
    source: `
      assert(typeof MyURLSearchParams === "function", "MyURLSearchParams is not defined");
      const params = new MyURLSearchParams("a=1&b=2");
      assertEqual(params.get("a"), "1");
    `,
  },
  {
    label: "append() supports multiple values for the same key",
    source: `
      const params2 = new MyURLSearchParams("");
      params2.append("tag", "a");
      params2.append("tag", "b");
      assertEqual(params2.getAll("tag"), ["a", "b"]);
    `,
  },
  {
    label: "set() replaces rather than adds",
    source: `
      const params3 = new MyURLSearchParams("a=1");
      params3.append("a", "2");
      params3.set("a", "new");
      assertEqual(params3.getAll("a"), ["new"]);
    `,
  },
  {
    label: "toString() correctly URL-encodes the output",
    source: `
      const params4 = new MyURLSearchParams("");
      params4.append("q", "hello world");
      assertEqual(params4.toString(), "q=hello%20world");
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 13

const VDOM_CREATE_ELEMENT_BASICS_TESTS: SandboxTest[] = [
  {
    label: "No children folds to an empty array",
    source: `
      assert(typeof createElement === "function", "createElement is not defined");
      assertEqual(createElement("div", null), { type: "div", props: { children: [] } });
    `,
  },
  {
    label: "A single child is stored directly",
    source: `
      assertEqual(
        createElement("button", { className: "a" }, "Save"),
        { type: "button", props: { className: "a", children: "Save" } },
      );
    `,
  },
  {
    label: "Multiple children are stored as an array",
    source: `assertEqual(createElement("ul", null, "a", "b"), { type: "ul", props: { children: ["a", "b"] } });`,
  },
];

const LIT_HTML_TAGGED_TEMPLATE_TESTS: SandboxTest[] = [
  {
    label: "Interpolates a plain value correctly",
    source: `
      assert(typeof html === "function", "html is not defined");
      assert(typeof render === "function", "render is not defined");
      assertEqual(render(html\`<p>\${"Ada"}</p>\`), "<p>Ada</p>");
    `,
  },
  {
    label: "Interpolated values are escaped for safety",
    source: `
      var CLOSE_SCRIPT = "</scr" + "ipt>";
      var dangerous = "<" + "script>bad" + CLOSE_SCRIPT;
      var result = render(html\`<p>\${dangerous}</p>\`);
      assert(!result.includes("<script>"), "the interpolated value must not appear as raw markup");
      assert(result.includes("&lt;"), "expected the angle brackets to be escaped");
    `,
  },
  {
    label: "Multiple interpolations all get inserted",
    source: `assertEqual(render(html\`\${"a"}-\${"b"}\`), "a-b");`,
  },
];

const VDOM_FUNCTIONAL_COMPONENT_TESTS: SandboxTest[] = [
  {
    label: "Resolves a single functional component",
    source: `
      assert(typeof renderComponent === "function", "renderComponent is not defined");
      function Greeting(props) {
        return { type: "h1", props: { children: "Hi " + props.name } };
      }
      const result = renderComponent({ type: Greeting, props: { name: "Ada" } });
      assertEqual(result, { type: "h1", props: { children: "Hi Ada" } });
    `,
  },
  {
    label: "Recursively resolves nested functional components",
    source: `
      function Inner() {
        return { type: "span", props: { children: "leaf" } };
      }
      function Outer() {
        return { type: Inner, props: {} };
      }
      const result2 = renderComponent({ type: Outer, props: {} });
      assertEqual(result2, { type: "span", props: { children: "leaf" } });
    `,
  },
  {
    label: "Plain elements are left as elements, children processed too",
    source: `
      function Leaf() {
        return { type: "b", props: { children: "bold" } };
      }
      const result3 = renderComponent({ type: "div", props: { children: [{ type: Leaf, props: {} }] } });
      assertEqual(result3, { type: "div", props: { children: [{ type: "b", props: { children: "bold" } }] } });
    `,
  },
];

const IMPLEMENT_CLASSNAMES_UTIL_TESTS: SandboxTest[] = [
  {
    label: "Joins plain string arguments",
    source: `
      assert(typeof classNames === "function", "classNames is not defined");
      assertEqual(classNames("a", "b"), "a b");
    `,
  },
  {
    label: "Only truthy keys from an object argument are included",
    source: `assertEqual(classNames("a", { b: true, c: false }), "a b");`,
  },
  {
    label: "Falsy arguments of any type are skipped",
    source: `assertEqual(classNames("a", null, undefined, false, "b"), "a b");`,
  },
];

const UGLIFY_CSS_CLASS_NAMES_TESTS: SandboxTest[] = [
  {
    label: "Assigns short names in first-seen order, starting from 'a'",
    source: `
      assert(typeof createClassNameUglifier === "function", "createClassNameUglifier is not defined");
      const uglify = createClassNameUglifier();
      assertEqual(uglify("header"), "a");
      assertEqual(uglify("footer"), "b");
    `,
  },
  {
    label: "Repeated calls with the same name are consistent",
    source: `
      const uglify2 = createClassNameUglifier();
      const first = uglify2("card");
      const second = uglify2("card");
      assertEqual(first, second);
    `,
  },
  {
    label: "Rolls over to two letters after exhausting a-z",
    source: `
      const uglify3 = createClassNameUglifier();
      for (let i = 0; i < 26; i++) uglify3("class-" + i);
      assertEqual(uglify3("class-26"), "aa");
    `,
  },
];

const VDOM_DIFF_PATCH_BASICS_TESTS: SandboxTest[] = [
  {
    label: "Identical text nodes produce no patch",
    source: `
      assert(typeof diff === "function", "diff is not defined");
      assertEqual(diff("hello", "hello"), { type: "NONE" });
    `,
  },
  {
    label: "A changed prop produces a targeted UPDATE patch",
    source: `
      const oldVNode = { type: "div", props: { className: "old" } };
      const newVNode = { type: "div", props: { className: "new" } };
      assertEqual(diff(oldVNode, newVNode), { type: "UPDATE", props: { className: "new" } });
    `,
  },
  {
    label: "A different element type forces a full REPLACE",
    source: `
      const oldVNode2 = { type: "div", props: {} };
      const newVNode2 = { type: "span", props: {} };
      assertEqual(diff(oldVNode2, newVNode2), { type: "REPLACE", vnode: newVNode2 });
    `,
  },
];

const JSX_CREATE_ELEMENT_PRAGMA_TESTS: SandboxTest[] = [
  {
    label: "key is pulled out of props onto the vnode itself",
    source: `
      assert(typeof jsxCreateElement === "function", "jsxCreateElement is not defined");
      const result = jsxCreateElement("li", { key: "a", className: "x" });
      assertEqual(result.key, "a");
      assertEqual(result.props, { className: "x", children: [] });
    `,
  },
  {
    label: "ref is dropped entirely, not even stored",
    source: `
      const someRef = {};
      const result2 = jsxCreateElement("input", { ref: someRef, value: "x" });
      assertEqual(result2.props, { value: "x", children: [] });
      assertEqual(result2.key, null);
    `,
  },
  {
    label: "Regular props pass through unaffected",
    source: `
      const result3 = jsxCreateElement("p", { id: "x" });
      assertEqual(result3.props.id, "x");
    `,
  },
];

const JSX_FRAGMENT_AND_FLATTEN_TESTS: SandboxTest[] = [
  {
    label: "The Fragment marker is preserved on the vnode",
    source: `
      assert(typeof Fragment !== "undefined", "Fragment is not defined");
      assert(typeof jsxCreateElementV2 === "function", "jsxCreateElementV2 is not defined");
      const result = jsxCreateElementV2(Fragment, null, "a", "b");
      assertEqual(result.type, Fragment);
    `,
  },
  {
    label: "Nested children arrays are flattened into one",
    source: `
      const listA = ["a1", "a2"];
      const listB = ["b1", "b2"];
      const result2 = jsxCreateElementV2("ul", null, listA, listB);
      assertEqual(result2.props.children, ["a1", "a2", "b1", "b2"]);
    `,
  },
  {
    label: "Children always end up in a consistent flat array shape",
    source: `
      const result3 = jsxCreateElementV2("span", null, "only");
      assertEqual(result3.props.children, ["only"]);
    `,
  },
];

const MINI_REACT_HOOKS_RUNTIME_TESTS: SandboxTest[] = [
  {
    label: "State persists across re-renders",
    source: `
      assert(typeof createHooksRuntime === "function", "createHooksRuntime is not defined");
      const runtime = createHooksRuntime();
      function Counter() {
        const [count] = runtime.useState(5);
        return count;
      }
      const first = runtime.render(Counter);
      const second = runtime.render(Counter);
      assertEqual(first, 5);
      assertEqual(second, 5);
    `,
  },
  {
    label: "setState triggers a re-render with updated state",
    source: `
      const runtime2 = createHooksRuntime();
      let lastRendered;
      function Counter2() {
        const [count, setCount] = runtime2.useState(0);
        lastRendered = count;
        if (count === 0) setCount(1);
        return count;
      }
      runtime2.render(Counter2);
      assertEqual(lastRendered, 1);
    `,
  },
  {
    label: "useEffect only re-runs when its dependencies actually change",
    source: `
      const runtime3 = createHooksRuntime();
      let effectRuns = 0;
      function WithEffect(dep) {
        return function () {
          runtime3.useEffect(() => { effectRuns++; }, [dep]);
        };
      }
      runtime3.render(WithEffect(1));
      runtime3.render(WithEffect(1));
      assertEqual(effectRuns, 1);
      runtime3.render(WithEffect(2));
      assertEqual(effectRuns, 2);
    `,
  },
];

const PROXY_REACTIVE_STORE_TESTS: SandboxTest[] = [
  {
    label: "Mutating a tracked property re-runs the effect that read it",
    source: `
      assert(typeof createReactiveSystem === "function", "createReactiveSystem is not defined");
      const { reactive, effect } = createReactiveSystem();
      const state = reactive({ count: 0 });
      let seen = [];
      effect(() => { seen.push(state.count); });
      state.count = 1;
      assertEqual(seen, [0, 1]);
    `,
  },
  {
    label: "Mutating an untracked property doesn't trigger unrelated effects",
    source: `
      const { reactive: reactive2, effect: effect2 } = createReactiveSystem();
      const state2 = reactive2({ count: 0, other: 0 });
      let runs = 0;
      effect2(() => { state2.count; runs++; });
      state2.other = 99;
      assertEqual(runs, 1);
    `,
  },
  {
    label: "Multiple effects can depend on and react to the same property",
    source: `
      const { reactive: reactive3, effect: effect3 } = createReactiveSystem();
      const state3 = reactive3({ count: 0 });
      let aRuns = 0;
      let bRuns = 0;
      effect3(() => { state3.count; aRuns++; });
      effect3(() => { state3.count; bRuns++; });
      state3.count = 5;
      assertEqual(aRuns, 2);
      assertEqual(bRuns, 2);
    `,
  },
];

// Practice — standalone JavaScript Interview Roadmap, Stage 14

const DECODE_MESSAGE_WAYS_TESTS: SandboxTest[] = [
  {
    label: "'AB' (1,2) or 'L' (12) — two valid decodings",
    source: `
      assert(typeof countDecodeWays === "function", "countDecodeWays is not defined");
      assertEqual(countDecodeWays("12"), 2);
    `,
  },
  { label: "'BZ', 'VF', or 'BBF' — three valid decodings", source: `assertEqual(countDecodeWays("226"), 3);` },
  { label: "A leading zero can never start a valid letter code", source: `assertEqual(countDecodeWays("06"), 0);` },
];

const BUILD_EXPRESSION_TOKENIZER_TESTS: SandboxTest[] = [
  {
    label: "Splits numbers and an operator",
    source: `
      assert(typeof tokenize === "function", "tokenize is not defined");
      assertEqual(tokenize("12+3"), ["12", "+", "3"]);
    `,
  },
  {
    label: "Handles parentheses and ignores whitespace",
    source: `assertEqual(tokenize("(1 + 2) * 3"), ["(", "1", "+", "2", ")", "*", "3"]);`,
  },
  { label: "Keeps a decimal number as a single token", source: `assertEqual(tokenize("3.5-1"), ["3.5", "-", "1"]);` },
];

const EVALUATE_ARITHMETIC_EXPRESSION_TESTS: SandboxTest[] = [
  {
    label: "Multiplication happens before addition",
    source: `
      assert(typeof evaluateExpression === "function", "evaluateExpression is not defined");
      assertEqual(evaluateExpression("2+3*4"), 14);
    `,
  },
  { label: "Parentheses override normal precedence", source: `assertEqual(evaluateExpression("(2+3)*4"), 20);` },
  {
    label: "Left-to-right evaluation within the same precedence level",
    source: `assertEqual(evaluateExpression("10/2-1"), 4);`,
  },
];

const CSS_GRID_AUTOPLACE_DENSE_TESTS: SandboxTest[] = [
  {
    label: "Wraps to a new row once the current one is full",
    source: `
      assert(typeof placeItemsDense === "function", "placeItemsDense is not defined");
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const result = placeItemsDense(items, 3);
      const fourth = result.find((p) => p.id === 4);
      assertEqual(fourth.row, 2);
      assertEqual(fourth.col, 1);
    `,
  },
  {
    label: "Dense packing fills an earlier gap instead of only placing forward",
    source: `
      const items2 = [{ id: 1, span: 3 }, { id: 2, span: 2 }, { id: 3, span: 1 }];
      const result2 = placeItemsDense(items2, 4);
      const third = result2.find((p) => p.id === 3);
      assertEqual(third.row, 1);
      assertEqual(third.col, 4);
    `,
  },
  {
    label: "A spanning item that doesn't fit the remaining row wraps",
    source: `
      const items3 = [{ id: 1, span: 3 }, { id: 2, span: 2 }];
      const result3 = placeItemsDense(items3, 4);
      const second = result3.find((p) => p.id === 2);
      assertEqual(second.row, 2);
    `,
  },
];

const CSS_GRID_AUTOPLACE_SPARSE_TESTS: SandboxTest[] = [
  {
    label: "Behaves the same as dense packing for the simple wrapping case",
    source: `
      assert(typeof placeItemsSparse === "function", "placeItemsSparse is not defined");
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const result = placeItemsSparse(items, 3);
      const fourth = result.find((p) => p.id === 4);
      assertEqual(fourth.row, 2);
      assertEqual(fourth.col, 1);
    `,
  },
  {
    label: "Never backtracks to fill an earlier row's gap, unlike dense packing",
    source: `
      const items2 = [{ id: 1, span: 3 }, { id: 2, span: 2 }, { id: 3, span: 1 }];
      const result2 = placeItemsSparse(items2, 4);
      const third = result2.find((p) => p.id === 3);
      assertEqual(third.row, 2);
      assertEqual(third.col, 3);
    `,
  },
  {
    label: "A spanning item that doesn't fit the remaining row still wraps",
    source: `
      const items3 = [{ id: 1, span: 3 }, { id: 2, span: 2 }];
      const result3 = placeItemsSparse(items3, 4);
      const second = result3.find((p) => p.id === 2);
      assertEqual(second.row, 2);
    `,
  },
];

const TOKEN_BUCKET_RATE_LIMITER_TESTS: SandboxTest[] = [
  {
    label: "Rejects once the bucket is empty",
    source: `
      assert(typeof createRateLimiter === "function", "createRateLimiter is not defined");
      const limiter = createRateLimiter(2, 1);
      assertEqual(limiter.tryConsume(), true);
      assertEqual(limiter.tryConsume(), true);
      assertEqual(limiter.tryConsume(), false);
    `,
  },
  {
    label: "Tokens refill continuously over real time",
    source: `
      const limiter2 = createRateLimiter(1, 20);
      limiter2.tryConsume();
      assertEqual(limiter2.tryConsume(), false);
      await delay(60);
      assertEqual(limiter2.tryConsume(), true);
    `,
  },
  {
    label: "A rejected request never consumes (or otherwise disturbs) the token count",
    source: `
      const limiter3 = createRateLimiter(1, 0);
      limiter3.tryConsume();
      assertEqual(limiter3.tryConsume(), false);
      assertEqual(limiter3.tryConsume(), false);
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R1
const REACT_COUNTER_APP_TESTS: SandboxTest[] = [
  {
    label: "Increment increases the value by 1 each call",
    source: `
      assert(typeof createCounterStore === "function", "createCounterStore is not defined");
      const counter = createCounterStore(0);
      counter.increment();
      counter.increment();
      assertEqual(counter.getValue(), 2);
    `,
  },
  {
    label: "Decrement decreases the value by 1",
    source: `
      const counter2 = createCounterStore(5);
      counter2.decrement();
      assertEqual(counter2.getValue(), 4);
    `,
  },
  {
    label: "Reset returns to the constructor's initial value, not zero",
    source: `
      const counter3 = createCounterStore(10);
      counter3.increment();
      counter3.increment();
      counter3.reset();
      assertEqual(counter3.getValue(), 10);
    `,
  },
];

const CONTROLLED_VS_UNCONTROLLED_INPUT_TESTS: SandboxTest[] = [
  {
    label: "Controlled value only changes through setValue — nothing else can move it",
    source: `
      assert(typeof createControlledInput === "function", "createControlledInput is not defined");
      const controlled = createControlledInput("a");
      assertEqual(controlled.getValue(), "a");
    `,
  },
  {
    label: "setValue is the only way to update a controlled value",
    source: `
      const controlled2 = createControlledInput("a");
      controlled2.setValue("b");
      assertEqual(controlled2.getValue(), "b");
    `,
  },
  {
    label: "Uncontrolled reads live from the DOM — there's no state to keep in sync",
    source: `
      assert(typeof readUncontrolledValue === "function", "readUncontrolledValue is not defined");
      const inputEl = document.createElement("input");
      inputEl.value = "typed value";
      assertEqual(readUncontrolledValue(inputEl), "typed value");
      inputEl.value = "changed again";
      assertEqual(readUncontrolledValue(inputEl), "changed again");
    `,
  },
];

const TODO_LIST_REDUCER_BASICS_TESTS: SandboxTest[] = [
  {
    label: "add appends a new todo with done: false",
    source: `
      assert(typeof todoReducer === "function", "todoReducer is not defined");
      const state1 = todoReducer([], { type: "add", text: "Buy milk" });
      assertEqual(state1, [{ id: 1, text: "Buy milk", done: false }]);
    `,
  },
  {
    label: "toggle flips a single todo's done flag by id",
    source: `
      const seeded = [
        { id: 1, text: "Buy milk", done: false },
        { id: 2, text: "Walk dog", done: false },
      ];
      const toggled = todoReducer(seeded, { type: "toggle", id: 1 });
      assertEqual(toggled.find((t) => t.id === 1).done, true);
      assertEqual(toggled.find((t) => t.id === 2).done, false);
    `,
  },
  {
    label: "delete removes exactly the matching todo",
    source: `
      const seeded2 = [
        { id: 1, text: "Buy milk", done: false },
        { id: 2, text: "Walk dog", done: false },
      ];
      const deleted = todoReducer(seeded2, { type: "delete", id: 1 });
      assertEqual(deleted, [{ id: 2, text: "Walk dog", done: false }]);
    `,
  },
  {
    label: "Never mutates the input state — always returns a new array",
    source: `
      const original = [{ id: 1, text: "Buy milk", done: false }];
      const frozen = original.map((t) => ({ ...t }));
      todoReducer(original, { type: "toggle", id: 1 });
      assertEqual(original, frozen);
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R2
const USE_TOGGLE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "toggle() flips the current value",
    source: `
      assert(typeof createToggle === "function", "createToggle is not defined");
      const t = createToggle(false);
      t.toggle();
      assertEqual(t.getValue(), true);
    `,
  },
  {
    label: "toggle() flips back on a second call",
    source: `
      const t2 = createToggle(false);
      t2.toggle();
      t2.toggle();
      assertEqual(t2.getValue(), false);
    `,
  },
  {
    label: "setOn/setOff force a specific value regardless of the current one",
    source: `
      const t3 = createToggle(false);
      t3.setOn();
      t3.setOff();
      assertEqual(t3.getValue(), false);
    `,
  },
];

const USE_IS_FIRST_RENDER_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Returns true on the first call",
    source: `
      assert(typeof createIsFirstRenderTracker === "function", "createIsFirstRenderTracker is not defined");
      const tracker = createIsFirstRenderTracker();
      assertEqual(tracker.checkAndAdvance(), true);
    `,
  },
  {
    label: "Returns false on every call after the first",
    source: `
      const tracker2 = createIsFirstRenderTracker();
      tracker2.checkAndAdvance();
      assertEqual(tracker2.checkAndAdvance(), false);
      assertEqual(tracker2.checkAndAdvance(), false);
    `,
  },
];

const USE_PREVIOUS_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The first call has no previous value yet",
    source: `
      assert(typeof createPreviousTracker === "function", "createPreviousTracker is not defined");
      const prevTracker = createPreviousTracker();
      assertEqual(prevTracker.track(1), undefined);
    `,
  },
  {
    label: "Each call returns what was passed in the call before it",
    source: `
      const prevTracker2 = createPreviousTracker();
      prevTracker2.track(1);
      assertEqual(prevTracker2.track(2), 1);
    `,
  },
  {
    label: "Tracks the immediately-prior value across a whole sequence of renders",
    source: `
      const prevTracker3 = createPreviousTracker();
      assertEqual(prevTracker3.track(1), undefined);
      assertEqual(prevTracker3.track(2), 1);
      assertEqual(prevTracker3.track(3), 2);
    `,
  },
];

const USE_EFFECT_ONCE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The wrapped effect only ever runs on the first call",
    source: `
      assert(typeof createEffectOnce === "function", "createEffectOnce is not defined");
      let calls = 0;
      const run = createEffectOnce(() => { calls++; });
      run();
      run();
      run();
      assertEqual(calls, 1);
    `,
  },
  {
    label: "The effect does run — just only once",
    source: `
      let ran = false;
      const run2 = createEffectOnce(() => { ran = true; });
      run2();
      assertEqual(ran, true);
    `,
  },
];

const USE_IS_MOUNTED_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Starts mounted",
    source: `
      assert(typeof createIsMountedRef === "function", "createIsMountedRef is not defined");
      const mountedRef = createIsMountedRef();
      assertEqual(mountedRef.isMounted(), true);
    `,
  },
  {
    label: "isMounted() flips to false after unmount()",
    source: `
      const mountedRef2 = createIsMountedRef();
      mountedRef2.unmount();
      assertEqual(mountedRef2.isMounted(), false);
    `,
  },
  {
    label: "Stays unmounted permanently — there's no way back to true",
    source: `
      const mountedRef3 = createIsMountedRef();
      mountedRef3.unmount();
      mountedRef3.unmount();
      assertEqual(mountedRef3.isMounted(), false);
    `,
  },
];

const USE_COUNTER_HOOK_TESTS: SandboxTest[] = [
  {
    label: "increment() never goes above max",
    source: `
      assert(typeof createCounter === "function", "createCounter is not defined");
      const bounded = createCounter({ initial: 4, max: 5 });
      bounded.increment();
      bounded.increment();
      assertEqual(bounded.getValue(), 5);
    `,
  },
  {
    label: "decrement() never goes below min",
    source: `
      const bounded2 = createCounter({ initial: 0, min: 0 });
      bounded2.decrement();
      bounded2.decrement();
      assertEqual(bounded2.getValue(), 0);
    `,
  },
  {
    label: "The initial value itself is clamped into range",
    source: `
      const bounded3 = createCounter({ initial: 10, max: 5 });
      assertEqual(bounded3.getValue(), 5);
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R3
const USE_CLICK_OUTSIDE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Fires when the click lands outside the target element",
    source: `
      assert(typeof createClickOutsideWatcher === "function", "createClickOutsideWatcher is not defined");
      const targetEl = document.createElement("div");
      const outsideEl = document.createElement("div");
      document.body.appendChild(targetEl);
      document.body.appendChild(outsideEl);
      let fired = 0;
      createClickOutsideWatcher(targetEl, () => { fired++; });
      outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      assertEqual(fired, 1);
      document.body.removeChild(targetEl);
      document.body.removeChild(outsideEl);
    `,
  },
  {
    label: "Does not fire when the click lands inside the target element",
    source: `
      const targetEl2 = document.createElement("div");
      const childEl = document.createElement("span");
      targetEl2.appendChild(childEl);
      document.body.appendChild(targetEl2);
      let fired2 = 0;
      createClickOutsideWatcher(targetEl2, () => { fired2++; });
      childEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      assertEqual(fired2, 0);
      document.body.removeChild(targetEl2);
    `,
  },
  {
    label: "destroy() removes the listener for good",
    source: `
      const targetEl3 = document.createElement("div");
      const outsideEl3 = document.createElement("div");
      document.body.appendChild(targetEl3);
      document.body.appendChild(outsideEl3);
      let fired3 = 0;
      const watcher = createClickOutsideWatcher(targetEl3, () => { fired3++; });
      watcher.destroy();
      outsideEl3.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      assertEqual(fired3, 0);
      document.body.removeChild(targetEl3);
      document.body.removeChild(outsideEl3);
    `,
  },
];

const USE_EVENT_LISTENER_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The original handler runs on the event",
    source: `
      assert(typeof createEventListenerHook === "function", "createEventListenerHook is not defined");
      const el = document.createElement("button");
      let calledA = 0;
      createEventListenerHook(el, "click", () => { calledA++; });
      el.dispatchEvent(new MouseEvent("click"));
      assertEqual(calledA, 1);
    `,
  },
  {
    label: "Always calls the most recently registered handler, not a stale closure over the first one",
    source: `
      const el2 = document.createElement("button");
      let calledA2 = 0;
      let calledB2 = 0;
      const hook = createEventListenerHook(el2, "click", () => { calledA2++; });
      hook.updateHandler(() => { calledB2++; });
      el2.dispatchEvent(new MouseEvent("click"));
      assertEqual(calledA2, 0);
      assertEqual(calledB2, 1);
    `,
  },
  {
    label: "destroy() actually removes the underlying DOM listener",
    source: `
      const el3 = document.createElement("button");
      let calledA3 = 0;
      const hook2 = createEventListenerHook(el3, "click", () => { calledA3++; });
      hook2.destroy();
      el3.dispatchEvent(new MouseEvent("click"));
      assertEqual(calledA3, 0);
    `,
  },
];

const USE_HOVER_HOOK_TESTS: SandboxTest[] = [
  {
    label: "mouseenter sets hovered to true",
    source: `
      assert(typeof createHoverWatcher === "function", "createHoverWatcher is not defined");
      const el = document.createElement("div");
      const hover = createHoverWatcher(el);
      el.dispatchEvent(new MouseEvent("mouseenter"));
      assertEqual(hover.isHovered(), true);
    `,
  },
  {
    label: "mouseleave sets hovered back to false",
    source: `
      const el2 = document.createElement("div");
      const hover2 = createHoverWatcher(el2);
      el2.dispatchEvent(new MouseEvent("mouseenter"));
      el2.dispatchEvent(new MouseEvent("mouseleave"));
      assertEqual(hover2.isHovered(), false);
    `,
  },
  {
    label: "destroy() removes both listeners",
    source: `
      const el3 = document.createElement("div");
      const hover3 = createHoverWatcher(el3);
      hover3.destroy();
      el3.dispatchEvent(new MouseEvent("mouseenter"));
      assertEqual(hover3.isHovered(), false);
    `,
  },
];

const USE_FOCUS_HOOK_TESTS: SandboxTest[] = [
  {
    label: "focus sets focused to true",
    source: `
      assert(typeof createFocusWatcher === "function", "createFocusWatcher is not defined");
      const el = document.createElement("input");
      const focusWatcher = createFocusWatcher(el);
      el.dispatchEvent(new FocusEvent("focus"));
      assertEqual(focusWatcher.isFocused(), true);
    `,
  },
  {
    label: "blur sets focused back to false",
    source: `
      const el2 = document.createElement("input");
      const focusWatcher2 = createFocusWatcher(el2);
      el2.dispatchEvent(new FocusEvent("focus"));
      el2.dispatchEvent(new FocusEvent("blur"));
      assertEqual(focusWatcher2.isFocused(), false);
    `,
  },
  {
    label: "destroy() removes both listeners",
    source: `
      const el3 = document.createElement("input");
      const focusWatcher3 = createFocusWatcher(el3);
      focusWatcher3.destroy();
      el3.dispatchEvent(new FocusEvent("focus"));
      assertEqual(focusWatcher3.isFocused(), false);
    `,
  },
];

const USE_ON_SCREEN_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Starts off-screen by default",
    source: `
      assert(typeof createOnScreenWatcher === "function", "createOnScreenWatcher is not defined");
      const el = document.createElement("div");
      function fakeObserver() {
        return { disconnect() {} };
      }
      const watcher = createOnScreenWatcher(el, fakeObserver);
      assertEqual(watcher.isOnScreen(), false);
    `,
  },
  {
    label: "Reflects the observer's reported intersection state",
    source: `
      const el2 = document.createElement("div");
      let trigger;
      function fakeObserver2(target, onChange) {
        trigger = (isIntersecting) => onChange({ isIntersecting });
        return { disconnect() {} };
      }
      const watcher2 = createOnScreenWatcher(el2, fakeObserver2);
      trigger(true);
      assertEqual(watcher2.isOnScreen(), true);
    `,
  },
  {
    label: "destroy() disconnects the underlying observer",
    source: `
      const el3 = document.createElement("div");
      let disconnected = false;
      function fakeObserver3() {
        return { disconnect() { disconnected = true; } };
      }
      const watcher3 = createOnScreenWatcher(el3, fakeObserver3);
      watcher3.destroy();
      assertEqual(disconnected, true);
    `,
  },
];

const USE_WINDOW_SIZE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Reads the initial size immediately",
    source: `
      assert(typeof createWindowSizeWatcher === "function", "createWindowSizeWatcher is not defined");
      function createFakeWindow(width, height) {
        const listeners = [];
        return {
          innerWidth: width,
          innerHeight: height,
          addEventListener(event, fn) { listeners.push(fn); },
          removeEventListener(event, fn) {
            const i = listeners.indexOf(fn);
            if (i !== -1) listeners.splice(i, 1);
          },
          resize(w, h) {
            this.innerWidth = w;
            this.innerHeight = h;
            listeners.forEach((fn) => fn());
          },
        };
      }
      const win = createFakeWindow(1024, 768);
      const sizeWatcher = createWindowSizeWatcher(win);
      assertEqual(sizeWatcher.getSize(), { width: 1024, height: 768 });
    `,
  },
  {
    label: "Updates on a resize event",
    source: `
      function createFakeWindow2(width, height) {
        const listeners = [];
        return {
          innerWidth: width,
          innerHeight: height,
          addEventListener(event, fn) { listeners.push(fn); },
          removeEventListener(event, fn) {
            const i = listeners.indexOf(fn);
            if (i !== -1) listeners.splice(i, 1);
          },
          resize(w, h) {
            this.innerWidth = w;
            this.innerHeight = h;
            listeners.forEach((fn) => fn());
          },
        };
      }
      const win2 = createFakeWindow2(1024, 768);
      const sizeWatcher2 = createWindowSizeWatcher(win2);
      win2.resize(500, 400);
      assertEqual(sizeWatcher2.getSize(), { width: 500, height: 400 });
    `,
  },
  {
    label: "destroy() stops tracking further resizes",
    source: `
      function createFakeWindow3(width, height) {
        const listeners = [];
        return {
          innerWidth: width,
          innerHeight: height,
          addEventListener(event, fn) { listeners.push(fn); },
          removeEventListener(event, fn) {
            const i = listeners.indexOf(fn);
            if (i !== -1) listeners.splice(i, 1);
          },
          resize(w, h) {
            this.innerWidth = w;
            this.innerHeight = h;
            listeners.forEach((fn) => fn());
          },
        };
      }
      const win3 = createFakeWindow3(1024, 768);
      const sizeWatcher3 = createWindowSizeWatcher(win3);
      sizeWatcher3.destroy();
      win3.resize(500, 400);
      assertEqual(sizeWatcher3.getSize(), { width: 1024, height: 768 });
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R4
const USE_DEBOUNCED_VALUE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Coalesces rapid updates into the final one",
    source: `
      assert(typeof createDebouncedValue === "function", "createDebouncedValue is not defined");
      const debounced = createDebouncedValue("a", 30);
      debounced.setValue("b");
      debounced.setValue("c");
      debounced.setValue("d");
      await delay(60);
      assertEqual(debounced.getValue(), "d");
    `,
  },
  {
    label: "Doesn't update until the full delay has passed",
    source: `
      const debounced2 = createDebouncedValue("a", 40);
      debounced2.setValue("b");
      await delay(10);
      assertEqual(debounced2.getValue(), "a");
    `,
  },
  {
    label: "Updates once the delay elapses undisturbed",
    source: `
      const debounced3 = createDebouncedValue("a", 30);
      debounced3.setValue("b");
      await delay(60);
      assertEqual(debounced3.getValue(), "b");
    `,
  },
];

const USE_THROTTLED_VALUE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The leading update always goes through",
    source: `
      assert(typeof createThrottledValue === "function", "createThrottledValue is not defined");
      const throttled = createThrottledValue("a", 50);
      throttled.setValue("b");
      assertEqual(throttled.getValue(), "b");
    `,
  },
  {
    label: "Updates within the same window are dropped",
    source: `
      const throttled2 = createThrottledValue("a", 100);
      throttled2.setValue("b");
      throttled2.setValue("c");
      assertEqual(throttled2.getValue(), "b");
    `,
  },
  {
    label: "A new window allows the next update through",
    source: `
      const throttled3 = createThrottledValue("a", 30);
      throttled3.setValue("b");
      await delay(50);
      throttled3.setValue("c");
      assertEqual(throttled3.getValue(), "c");
    `,
  },
];

const USE_TIMEOUT_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The callback fires on its own if left alone",
    source: `
      assert(typeof createTimeoutRunner === "function", "createTimeoutRunner is not defined");
      let fired = false;
      createTimeoutRunner(() => { fired = true; }, 30);
      await delay(60);
      assertEqual(fired, true);
    `,
  },
  {
    label: "clear() cancels the pending callback",
    source: `
      let fired2 = false;
      const runner = createTimeoutRunner(() => { fired2 = true; }, 30);
      runner.clear();
      await delay(60);
      assertEqual(fired2, false);
    `,
  },
  {
    label: "reset() restarts the full delay from that point",
    source: `
      let fired3 = false;
      const runner2 = createTimeoutRunner(() => { fired3 = true; }, 40);
      await delay(20);
      runner2.reset();
      await delay(30);
      assertEqual(fired3, false);
      await delay(30);
      assertEqual(fired3, true);
    `,
  },
];

const USE_INTERVAL_HOOK_TESTS: SandboxTest[] = [
  {
    label: "The original callback fires on each tick",
    source: `
      assert(typeof createInterval === "function", "createInterval is not defined");
      let calls = 0;
      const interval = createInterval(() => { calls++; }, 20);
      await delay(65);
      interval.stop();
      assert(calls >= 2, "expected at least two ticks to have fired");
    `,
  },
  {
    label: "Ticks always call the most recently registered callback",
    source: `
      let calledOld = 0;
      let calledNew = 0;
      const interval2 = createInterval(() => { calledOld++; }, 20);
      await delay(25);
      interval2.updateCallback(() => { calledNew++; });
      await delay(45);
      interval2.stop();
      assertEqual(calledOld, 1);
      assert(calledNew >= 1, "expected the updated callback to fire on later ticks");
    `,
  },
  {
    label: "stop() actually clears the underlying interval",
    source: `
      let calls2 = 0;
      const interval3 = createInterval(() => { calls2++; }, 15);
      interval3.stop();
      const countAfterStop = calls2;
      await delay(60);
      assertEqual(calls2, countAfterStop);
    `,
  },
];

const USE_UPDATE_EFFECT_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Skips the effect on the very first call",
    source: `
      assert(typeof createUpdateEffectRunner === "function", "createUpdateEffectRunner is not defined");
      let calls = 0;
      const run = createUpdateEffectRunner(() => { calls++; });
      run();
      assertEqual(calls, 0);
    `,
  },
  {
    label: "Runs on every call after the first",
    source: `
      let calls2 = 0;
      const run2 = createUpdateEffectRunner(() => { calls2++; });
      run2();
      run2();
      run2();
      assertEqual(calls2, 2);
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R5
const USE_LOCAL_STORAGE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Falls back to initialValue when storage has nothing for that key",
    source: `
      assert(typeof createLocalStorageState === "function", "createLocalStorageState is not defined");
      function createFakeStorage() {
        const map = new Map();
        return { get: (k) => map.get(k), set: (k, v) => map.set(k, v) };
      }
      const storage = createFakeStorage();
      const themeState = createLocalStorageState("theme", "light", storage);
      assertEqual(themeState.getValue(), "light");
    `,
  },
  {
    label: "setValue writes through to storage",
    source: `
      function createFakeStorage2() {
        const map = new Map();
        return { get: (k) => map.get(k), set: (k, v) => map.set(k, v) };
      }
      const storage2 = createFakeStorage2();
      const themeState2 = createLocalStorageState("theme", "light", storage2);
      themeState2.setValue("dark");
      assertEqual(storage2.get("theme"), JSON.stringify("dark"));
    `,
  },
  {
    label: "A new instance picks up whatever was already persisted, ignoring initialValue",
    source: `
      function createFakeStorage3() {
        const map = new Map();
        return { get: (k) => map.get(k), set: (k, v) => map.set(k, v) };
      }
      const storage3 = createFakeStorage3();
      const first = createLocalStorageState("theme", "light", storage3);
      first.setValue("dark");
      const second = createLocalStorageState("theme", "light", storage3);
      assertEqual(second.getValue(), "dark");
    `,
  },
];

const USE_ARRAY_HOOK_TESTS: SandboxTest[] = [
  {
    label: "push appends to the end",
    source: `
      assert(typeof createArrayState === "function", "createArrayState is not defined");
      const arr = createArrayState([1, 2]);
      arr.push(3);
      assertEqual(arr.getValue(), [1, 2, 3]);
    `,
  },
  {
    label: "removeAt drops exactly the item at that index",
    source: `
      const arr2 = createArrayState([1, 2, 3]);
      arr2.removeAt(1);
      assertEqual(arr2.getValue(), [1, 3]);
    `,
  },
  {
    label: "updateAt replaces exactly the item at that index",
    source: `
      const arr3 = createArrayState([1, 2, 3]);
      arr3.updateAt(1, 99);
      assertEqual(arr3.getValue(), [1, 99, 3]);
    `,
  },
  {
    label: "clear empties the array",
    source: `
      const arr4 = createArrayState([1, 2]);
      arr4.clear();
      assertEqual(arr4.getValue(), []);
    `,
  },
];

const PHONE_NUMBER_INPUT_FORMATTER_TESTS: SandboxTest[] = [
  {
    label: "A single digit starts the area code group",
    source: `
      assert(typeof formatPhoneNumberInput === "function", "formatPhoneNumberInput is not defined");
      assertEqual(formatPhoneNumberInput("5"), "(5");
    `,
  },
  {
    label: "Three digits still show only the open area-code group",
    source: `assertEqual(formatPhoneNumberInput("555"), "(555");`,
  },
  {
    label: "Past three digits, the prefix group and separator appear",
    source: `assertEqual(formatPhoneNumberInput("5551234"), "(555) 123-4");`,
  },
  {
    label: "Ignores non-digit characters already present in pasted input",
    source: `assertEqual(formatPhoneNumberInput("(555) 123-4567"), "(555) 123-4567");`,
  },
  {
    label: "Extra digits past 10 are ignored",
    source: `assertEqual(formatPhoneNumberInput("55512345678"), "(555) 123-4567");`,
  },
];

const USE_FORM_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Validates every field up front, on creation",
    source: `
      assert(typeof createFormState === "function", "createFormState is not defined");
      const form = createFormState({ email: "" }, { email: (v) => (v ? null : "Required") });
      assertEqual(form.getErrors().email, "Required");
    `,
  },
  {
    label: "setField re-validates just the field that changed",
    source: `
      const form2 = createFormState({ email: "" }, { email: (v) => (v ? null : "Required") });
      form2.setField("email", "a@b.com");
      assertEqual(form2.getErrors().email, null);
      assertEqual(form2.getValues().email, "a@b.com");
    `,
  },
  {
    label: "validateAll re-checks every field and reports overall validity",
    source: `
      const form3 = createFormState({ email: "a@b.com" }, { email: (v) => (v ? null : "Required") });
      form3.setField("email", "");
      const isValid = form3.validateAll();
      assertEqual(isValid, false);
      assertEqual(form3.getErrors().email, "Required");
    `,
  },
  {
    label: "setField only re-validates the field that actually changed, not the whole form",
    source: `
      const form4 = createFormState(
        { email: "a@b.com", name: "" },
        { email: (v) => (v ? null : "Required"), name: (v) => (v ? null : "Required") },
      );
      form4.setField("email", "c@d.com");
      assertEqual(form4.getErrors().name, "Required");
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R6
const USE_ASYNC_RESOURCE_HOOK_TESTS: SandboxTest[] = [
  {
    label: "Starts idle",
    source: `
      assert(typeof createAsyncResource === "function", "createAsyncResource is not defined");
      const resource = createAsyncResource(() => Promise.resolve(42));
      assertEqual(resource.getState(), { status: "idle", data: null, error: null });
    `,
  },
  {
    label: "Resolves into a success state carrying the data",
    source: `
      const resource2 = createAsyncResource(() => Promise.resolve(42));
      await resource2.run();
      assertEqual(resource2.getState(), { status: "success", data: 42, error: null });
    `,
  },
  {
    label: "A rejection lands in the error state, not an unhandled rejection",
    source: `
      const boom = new Error("boom");
      const resource3 = createAsyncResource(() => Promise.reject(boom));
      await resource3.run();
      assertEqual(resource3.getState().status, "error");
      assertEqual(resource3.getState().error, boom);
    `,
  },
  {
    label: "Status flips to loading immediately, before the async work resolves",
    source: `
      const resource4 = createAsyncResource(() => Promise.resolve(1));
      const pending = resource4.run();
      assertEqual(resource4.getState().status, "loading");
      await pending;
    `,
  },
];

const USE_SWR_STALE_WHILE_REVALIDATE_TESTS: SandboxTest[] = [
  {
    label: "Serves the cached value immediately, without waiting on the fetch",
    source: `
      assert(typeof createSWRResource === "function", "createSWRResource is not defined");
      const cache = new Map([["user", "stale-user"]]);
      const resource = createSWRResource("user", () => delay(20).then(() => "fresh-user"), cache);
      const pending = resource.load();
      assertEqual(resource.getData(), "stale-user");
      await pending;
    `,
  },
  {
    label: "The cache updates once the background fetch resolves",
    source: `
      const cache2 = new Map([["user", "stale-user"]]);
      const resource2 = createSWRResource("user", () => Promise.resolve("fresh-user"), cache2);
      await resource2.load();
      assertEqual(resource2.getData(), "fresh-user");
    `,
  },
  {
    label: "Subscribers are notified when revalidation completes",
    source: `
      const cache3 = new Map([["user", "stale-user"]]);
      const resource3 = createSWRResource("user", () => Promise.resolve("fresh-user"), cache3);
      let notifiedWith = null;
      resource3.subscribe((data) => { notifiedWith = data; });
      await resource3.load();
      assertEqual(notifiedWith, "fresh-user");
    `,
  },
  {
    label: "The unsubscribe function returned by subscribe() actually detaches the listener",
    source: `
      const cache4 = new Map([["user", "stale-user"]]);
      const resource4 = createSWRResource("user", () => Promise.resolve("fresh-user"), cache4);
      let calls = 0;
      const unsubscribe = resource4.subscribe(() => { calls++; });
      unsubscribe();
      await resource4.load();
      assertEqual(calls, 0);
    `,
  },
];

const FETCH_REQUEST_DEDUPER_TESTS: SandboxTest[] = [
  {
    label: "Concurrent calls with the same key share one underlying request",
    source: `
      assert(typeof createDedupedFetcher === "function", "createDedupedFetcher is not defined");
      let calls = 0;
      const fetchDeduped = createDedupedFetcher((key) => {
        calls++;
        return delay(10).then(() => key + "-data");
      });
      const p1 = fetchDeduped("user");
      const p2 = fetchDeduped("user");
      await Promise.all([p1, p2]);
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Different keys are never deduped against each other",
    source: `
      let calls2 = 0;
      const fetchDeduped2 = createDedupedFetcher((key) => {
        calls2++;
        return delay(10).then(() => key + "-data");
      });
      const pA = fetchDeduped2("user");
      const pB = fetchDeduped2("post");
      await Promise.all([pA, pB]);
      assertEqual(calls2, 2);
    `,
  },
  {
    label: "Once a request settles, the next call starts over rather than reusing a stale result forever",
    source: `
      let calls3 = 0;
      const fetchDeduped3 = createDedupedFetcher((key) => {
        calls3++;
        return Promise.resolve(key + "-data-" + calls3);
      });
      await fetchDeduped3("user");
      await fetchDeduped3("user");
      assertEqual(calls3, 2);
    `,
  },
];

const GLOBAL_STORE_PUBSUB_TESTS: SandboxTest[] = [
  {
    label: "Starts at the given initial value",
    source: `
      assert(typeof createGlobalStore === "function", "createGlobalStore is not defined");
      const store = createGlobalStore({ theme: "light" });
      assertEqual(store.getValue(), { theme: "light" });
    `,
  },
  {
    label: "Every subscriber is notified on a change, not just the first one",
    source: `
      const store2 = createGlobalStore(0);
      let seenByA = null;
      let seenByB = null;
      store2.subscribe((v) => { seenByA = v; });
      store2.subscribe((v) => { seenByB = v; });
      store2.setValue(5);
      assertEqual(seenByA, 5);
      assertEqual(seenByB, 5);
    `,
  },
  {
    label: "unsubscribe actually detaches the listener",
    source: `
      const store3 = createGlobalStore(0);
      let calls = 0;
      const unsubscribe = store3.subscribe(() => { calls++; });
      unsubscribe();
      store3.setValue(1);
      assertEqual(calls, 0);
    `,
  },
];

const VALTIO_STYLE_PROXY_STORE_TESTS: SandboxTest[] = [
  {
    label: "The store object is directly mutable, not read-only",
    source: `
      assert(typeof createValtioStore === "function", "createValtioStore is not defined");
      const { store } = createValtioStore({ count: 0 });
      store.count = 5;
      assertEqual(store.count, 5);
    `,
  },
  {
    label: "Directly mutating a property triggers subscribers",
    source: `
      const store2Wrapper = createValtioStore({ count: 0 });
      let calls = 0;
      store2Wrapper.subscribe(() => { calls++; });
      store2Wrapper.store.count = 1;
      assertEqual(calls, 1);
    `,
  },
  {
    label: "Every mutation notifies subscribers — there's no batching in this minimal version",
    source: `
      const store3Wrapper = createValtioStore({ count: 0 });
      let calls2 = 0;
      store3Wrapper.subscribe(() => { calls2++; });
      store3Wrapper.store.count = 1;
      store3Wrapper.store.count = 2;
      assertEqual(calls2, 2);
    `,
  },
];

const MINI_REDUX_STORE_TESTS: SandboxTest[] = [
  {
    label: "dispatch runs the reducer and stores the resulting state",
    source: `
      assert(typeof createReduxStore === "function", "createReduxStore is not defined");
      function counterReducer(state, action) {
        if (action.type === "increment") return state + 1;
        return state;
      }
      const store = createReduxStore(counterReducer, 0);
      store.dispatch({ type: "increment" });
      store.dispatch({ type: "increment" });
      assertEqual(store.getState(), 2);
    `,
  },
  {
    label: "Subscribers are notified after every dispatch",
    source: `
      function counterReducer2(state, action) {
        if (action.type === "increment") return state + 1;
        return state;
      }
      const store2 = createReduxStore(counterReducer2, 0);
      let seen = null;
      store2.subscribe((s) => { seen = s; });
      store2.dispatch({ type: "increment" });
      assertEqual(seen, 1);
    `,
  },
  {
    label: "dispatch returns the action, matching real Redux's dispatch signature",
    source: `
      function identityReducer(state) { return state; }
      const store3 = createReduxStore(identityReducer, 0);
      const action = { type: "increment" };
      const returned = store3.dispatch(action);
      assertEqual(returned, action);
    `,
  },
  {
    label: "subscribe's returned function actually detaches the listener",
    source: `
      function identityReducer2(state) { return state; }
      const store4 = createReduxStore(identityReducer2, 0);
      let calls = 0;
      const unsubscribe = store4.subscribe(() => { calls++; });
      unsubscribe();
      store4.dispatch({ type: "noop" });
      assertEqual(calls, 0);
    `,
  },
];

// Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R7
const USESTATE_FROM_SCRATCH_TESTS: SandboxTest[] = [
  {
    label: "setState updates the value and triggers a fresh render",
    source: `
      assert(typeof createStateRuntime === "function", "createStateRuntime is not defined");
      const runtime = createStateRuntime();
      let seen;
      let setCount;
      runtime.render(() => {
        const [count, setCount_] = runtime.useState(0);
        seen = count;
        setCount = setCount_;
      });
      assertEqual(seen, 0);
      setCount(5);
      assertEqual(seen, 5);
    `,
  },
  {
    label: "Supports the functional-updater form of setState",
    source: `
      const runtime2 = createStateRuntime();
      let seen2;
      let setCount2;
      runtime2.render(() => {
        const [count, setCount_] = runtime2.useState(10);
        seen2 = count;
        setCount2 = setCount_;
      });
      setCount2((prev) => prev + 1);
      assertEqual(seen2, 11);
      setCount2((prev) => prev + 1);
      assertEqual(seen2, 12);
    `,
  },
  {
    label: "Multiple useState calls in one render map to distinct, stable slots by call order",
    source: `
      const runtime3 = createStateRuntime();
      let name, age, setName, setAge;
      runtime3.render(() => {
        const [n, setN] = runtime3.useState("Ada");
        const [a, setA] = runtime3.useState(30);
        name = n; age = a; setName = setN; setAge = setA;
      });
      setName("Grace");
      assertEqual(name, "Grace");
      assertEqual(age, 30);
      setAge(31);
      assertEqual(name, "Grace");
      assertEqual(age, 31);
    `,
  },
];

const USEREDUCER_FROM_SCRATCH_TESTS: SandboxTest[] = [
  {
    label: "dispatch runs the reducer against the current slot value and stores the result",
    source: `
      assert(typeof createReducerRuntime === "function", "createReducerRuntime is not defined");
      function counterReducer(state, action) {
        if (action.type === "increment") return state + 1;
        return state;
      }
      const runtime = createReducerRuntime();
      let seen, dispatch;
      runtime.render(() => {
        const [state, d] = runtime.useReducer(counterReducer, 0);
        seen = state; dispatch = d;
      });
      dispatch({ type: "increment" });
      dispatch({ type: "increment" });
      assertEqual(seen, 2);
    `,
  },
  {
    label: "The runtime never second-guesses the reducer — it always stores exactly what reducer(state, action) returns",
    source: `
      function passthroughReducer(state, action) {
        if (action.type === "unknown") return state;
        return state + 100;
      }
      const runtime2 = createReducerRuntime();
      let seen2, dispatch2;
      runtime2.render(() => {
        const [state, d] = runtime2.useReducer(passthroughReducer, 0);
        seen2 = state; dispatch2 = d;
      });
      dispatch2({ type: "unknown" });
      assertEqual(seen2, 0);
    `,
  },
  {
    label: "Dispatch re-renders automatically, the same way setState does",
    source: `
      function identityReducer(state) { return state + 1; }
      const runtime3 = createReducerRuntime();
      let renderCount = 0;
      let dispatch3;
      runtime3.render(() => {
        renderCount++;
        const [, d] = runtime3.useReducer(identityReducer, 0);
        dispatch3 = d;
      });
      dispatch3({ type: "tick" });
      assertEqual(renderCount, 2);
    `,
  },
];

const USEMEMO_USECALLBACK_FROM_SCRATCH_TESTS: SandboxTest[] = [
  {
    label: "Doesn't recompute when deps are unchanged",
    source: `
      assert(typeof createMemoRuntime === "function", "createMemoRuntime is not defined");
      const runtime = createMemoRuntime();
      let factoryCalls = 0;
      function renderOnce(a, b) {
        return runtime.render(() => runtime.useMemo(() => { factoryCalls++; return a + b; }, [a, b]));
      }
      renderOnce(1, 2);
      renderOnce(1, 2);
      assertEqual(factoryCalls, 1);
    `,
  },
  {
    label: "Recomputes when any dependency actually changes",
    source: `
      const runtime2 = createMemoRuntime();
      let factoryCalls2 = 0;
      function renderOnce2(a, b) {
        return runtime2.render(() => runtime2.useMemo(() => { factoryCalls2++; return a + b; }, [a, b]));
      }
      renderOnce2(1, 2);
      renderOnce2(1, 3);
      assertEqual(factoryCalls2, 2);
    `,
  },
  {
    label: "useCallback returns a stable reference when its deps haven't changed",
    source: `
      const runtime3 = createMemoRuntime();
      function renderOnce3(dep) {
        return runtime3.render(() => runtime3.useCallback(() => dep, [dep]));
      }
      const fn1 = renderOnce3(1);
      const fn2 = renderOnce3(1);
      assert(fn1 === fn2, "expected the same function reference across renders with unchanged deps");
    `,
  },
];

const HIGHER_ORDER_COMPONENT_LOGGER_TESTS: SandboxTest[] = [
  {
    label: "The wrapped component's output is passed through unchanged",
    source: `
      assert(typeof withLogger === "function", "withLogger is not defined");
      function Greeting(props) { return "Hello, " + props.name; }
      const Logged = withLogger(Greeting, () => {});
      assertEqual(Logged({ name: "Ada" }), "Hello, Ada");
    `,
  },
  {
    label: "Every call logs the props it was invoked with",
    source: `
      function Greeting2(props) { return "Hello, " + props.name; }
      const logs = [];
      const Logged2 = withLogger(Greeting2, (props) => logs.push(props));
      Logged2({ name: "Ada" });
      assertEqual(logs, [{ name: "Ada" }]);
    `,
  },
  {
    label: "Logging happens on every invocation, not just the first",
    source: `
      function Greeting3(props) { return "Hello, " + props.name; }
      const logs2 = [];
      const Logged3 = withLogger(Greeting3, (props) => logs2.push(props));
      Logged3({ name: "Ada" });
      Logged3({ name: "Grace" });
      Logged3({ name: "Linus" });
      assertEqual(logs2.length, 3);
      assertEqual(logs2[2], { name: "Linus" });
    `,
  },
];

const COMPOUND_COMPONENT_TABS_TESTS: SandboxTest[] = [
  {
    label: "Each registered tab gets its own sequential id",
    source: `
      assert(typeof createTabsController === "function", "createTabsController is not defined");
      const tabs = createTabsController();
      assertEqual(tabs.registerTab(), 0);
      assertEqual(tabs.registerTab(), 1);
      assertEqual(tabs.registerTab(), 2);
    `,
  },
  {
    label: "The first tab (index 0) is active by default",
    source: `
      const tabs2 = createTabsController();
      assertEqual(tabs2.getActiveIndex(), 0);
    `,
  },
  {
    label: "isActive correctly reflects the currently selected tab, and only that one",
    source: `
      const tabs3 = createTabsController();
      tabs3.registerTab();
      tabs3.registerTab();
      tabs3.registerTab();
      tabs3.selectTab(2);
      assertEqual(tabs3.isActive(2), true);
      assertEqual(tabs3.isActive(0), false);
    `,
  },
];

const ERROR_BOUNDARY_WRAPPER_TESTS: SandboxTest[] = [
  {
    label: "Catches a thrown error and returns the fallback output",
    source: `
      assert(typeof createErrorBoundary === "function", "createErrorBoundary is not defined");
      function BrokenComponent() { throw new Error("boom"); }
      const boundary = createErrorBoundary(BrokenComponent, (error) => "Fallback: " + error.message);
      assertEqual(boundary.run({}), "Fallback: boom");
    `,
  },
  {
    label: "Stays in the errored state on later calls, without retrying renderFn",
    source: `
      let renderAttempts = 0;
      function BrokenComponent2() { renderAttempts++; throw new Error("boom"); }
      const boundary2 = createErrorBoundary(BrokenComponent2, () => "Fallback");
      boundary2.run({});
      boundary2.run({});
      boundary2.run({});
      assertEqual(renderAttempts, 1);
    `,
  },
  {
    label: "reset() clears the errored state, allowing renderFn to run again",
    source: `
      let shouldThrow = true;
      function FlakyComponent() {
        if (shouldThrow) throw new Error("boom");
        return "OK";
      }
      const boundary3 = createErrorBoundary(FlakyComponent, () => "Fallback");
      boundary3.run({});
      shouldThrow = false;
      boundary3.reset();
      assertEqual(boundary3.run({}), "OK");
    `,
  },
];

const IMPERATIVE_HANDLE_EXAMPLE_TESTS: SandboxTest[] = [
  {
    label: "ref.current is set to exactly the object createHandle() returned",
    source: `
      assert(typeof attachImperativeHandle === "function", "attachImperativeHandle is not defined");
      const ref = { current: null };
      function focus() {}
      attachImperativeHandle(ref, () => ({ focus }));
      assertEqual(ref.current.focus, focus);
    `,
  },
  {
    label: "The exposed handle is exactly what createHandle() curated, not some larger internal object",
    source: `
      const ref2 = { current: null };
      attachImperativeHandle(ref2, () => ({ focus() {}, scrollIntoView() {} }));
      assertEqual(Object.keys(ref2.current).sort(), ["focus", "scrollIntoView"]);
    `,
  },
  {
    label: "Returns the ref itself, so it can be used inline",
    source: `
      const ref3 = { current: null };
      const returned = attachImperativeHandle(ref3, () => ({}));
      assert(returned === ref3, "expected attachImperativeHandle to return the same ref object");
    `,
  },
];

const LIST_VIRTUALIZATION_WINDOW_CALC_TESTS: SandboxTest[] = [
  {
    label: "At the top, the visible range starts at index 0",
    source: `
      assert(typeof getVisibleRange === "function", "getVisibleRange is not defined");
      const range = getVisibleRange({ scrollTop: 0, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 0 });
      assertEqual(range.startIndex, 0);
      assertEqual(range.endIndex, 6);
    `,
  },
  {
    label: "offsetY matches startIndex * itemHeight, positioning the rendered slice correctly",
    source: `
      const range2 = getVisibleRange({ scrollTop: 500, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 0 });
      assertEqual(range2.startIndex, 10);
      assertEqual(range2.offsetY, 500);
    `,
  },
  {
    label: "overscan pads the range by the given number of items on each side",
    source: `
      const range3 = getVisibleRange({ scrollTop: 500, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 2 });
      assertEqual(range3.startIndex, 8);
      assertEqual(range3.endIndex, 18);
    `,
  },
  {
    label: "endIndex is clamped to the last valid item index, even with a large overscan",
    source: `
      const range4 = getVisibleRange({ scrollTop: 4800, containerHeight: 300, itemHeight: 50, totalItems: 100, overscan: 5 });
      assertEqual(range4.endIndex, 99);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 1
const BOX_SIZING_CONTENT_VS_BORDER_TESTS: SandboxTest[] = [
  {
    label: "content-box adds padding and border on top of width",
    source: `
      assert(typeof applyBoxSizing === "function", "applyBoxSizing is not defined");
      const el = document.createElement("div");
      el.style.width = "200px";
      el.style.padding = "20px";
      el.style.border = "5px solid black";
      document.body.appendChild(el);
      applyBoxSizing(el, "content-box");
      assertEqual(el.getBoundingClientRect().width, 250);
      document.body.removeChild(el);
    `,
  },
  {
    label: "border-box makes width include padding and border",
    source: `
      const el2 = document.createElement("div");
      el2.style.width = "200px";
      el2.style.padding = "20px";
      el2.style.border = "5px solid black";
      document.body.appendChild(el2);
      applyBoxSizing(el2, "border-box");
      assertEqual(el2.getBoundingClientRect().width, 200);
      document.body.removeChild(el2);
    `,
  },
];

const CENTER_ELEMENT_VERTICALLY_TESTS: SandboxTest[] = [
  {
    label: "Centers a child vertically regardless of its height",
    source: `
      assert(typeof centerVertically === "function", "centerVertically is not defined");
      const container = document.createElement("div");
      container.style.height = "300px";
      container.style.width = "100px";
      const child = document.createElement("div");
      child.style.height = "50px";
      container.appendChild(child);
      document.body.appendChild(container);
      centerVertically(container);
      const offset = child.getBoundingClientRect().top - container.getBoundingClientRect().top;
      assertEqual(offset, 125);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Recomputes correctly for a different child height, not a fixed offset",
    source: `
      const container2 = document.createElement("div");
      container2.style.height = "300px";
      container2.style.width = "100px";
      const child2 = document.createElement("div");
      child2.style.height = "80px";
      container2.appendChild(child2);
      document.body.appendChild(container2);
      centerVertically(container2);
      const offset2 = child2.getBoundingClientRect().top - container2.getBoundingClientRect().top;
      assertEqual(offset2, 110);
      document.body.removeChild(container2);
    `,
  },
];

const CENTER_ELEMENT_BOTH_AXES_TESTS: SandboxTest[] = [
  {
    label: "Centers on both axes simultaneously",
    source: `
      assert(typeof centerBoth === "function", "centerBoth is not defined");
      const container = document.createElement("div");
      container.style.width = "300px";
      container.style.height = "300px";
      const child = document.createElement("div");
      child.style.width = "50px";
      child.style.height = "80px";
      container.appendChild(child);
      document.body.appendChild(container);
      centerBoth(container);
      const containerRect = container.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      assertEqual(childRect.left - containerRect.left, 125);
      assertEqual(childRect.top - containerRect.top, 110);
      document.body.removeChild(container);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 2
const TRUNCATE_SINGLE_LINE_ELLIPSIS_TESTS: SandboxTest[] = [
  {
    label: "Prevents the text from wrapping onto a second line",
    source: `
      assert(typeof truncateSingleLine === "function", "truncateSingleLine is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      truncateSingleLine(el);
      assertEqual(getComputedStyle(el).whiteSpace, "nowrap");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Clips content that overflows the element's box",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      truncateSingleLine(el2);
      assertEqual(getComputedStyle(el2).overflow, "hidden");
      document.body.removeChild(el2);
    `,
  },
  {
    label: "Shows an ellipsis at the clipped edge",
    source: `
      const el3 = document.createElement("div");
      document.body.appendChild(el3);
      truncateSingleLine(el3);
      assertEqual(getComputedStyle(el3).textOverflow, "ellipsis");
      document.body.removeChild(el3);
    `,
  },
];

const TRUNCATE_MULTILINE_ELLIPSIS_TESTS: SandboxTest[] = [
  {
    label: "Requires the -webkit-box display mode for line-clamp to apply",
    source: `
      assert(typeof truncateMultiLine === "function", "truncateMultiLine is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      truncateMultiLine(el, 3);
      assertEqual(getComputedStyle(el).display, "-webkit-box");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Sets the box orientation the line-clamp mechanism depends on",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      truncateMultiLine(el2, 3);
      assertEqual(getComputedStyle(el2).webkitBoxOrient, "vertical");
      document.body.removeChild(el2);
    `,
  },
  {
    label: "Clamps to exactly the requested number of lines",
    source: `
      const el3 = document.createElement("div");
      document.body.appendChild(el3);
      truncateMultiLine(el3, 3);
      assertEqual(getComputedStyle(el3).webkitLineClamp, "3");
      document.body.removeChild(el3);
    `,
  },
  {
    label: "Works correctly for a different line count, not hardcoded to one value",
    source: `
      const el4 = document.createElement("div");
      document.body.appendChild(el4);
      truncateMultiLine(el4, 5);
      assertEqual(getComputedStyle(el4).webkitLineClamp, "5");
      document.body.removeChild(el4);
    `,
  },
];

const FLUID_TYPOGRAPHY_CLAMP_TESTS: SandboxTest[] = [
  {
    label: "Never grows past the max, however large the preferred value resolves to",
    source: `
      assert(typeof setFluidFontSize === "function", "setFluidFontSize is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      setFluidFontSize(el, 16, 1000, 64);
      assertEqual(parseFloat(getComputedStyle(el).fontSize), 64);
      document.body.removeChild(el);
    `,
  },
  {
    label: "Never shrinks below the min",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      setFluidFontSize(el2, 16, 0, 64);
      assertEqual(parseFloat(getComputedStyle(el2).fontSize), 16);
      document.body.removeChild(el2);
    `,
  },
  {
    label: "Scales with the real viewport width when the preferred value lands between min and max",
    source: `
      const el3 = document.createElement("div");
      document.body.appendChild(el3);
      setFluidFontSize(el3, 10, 4, 40);
      const expected = (4 / 100) * window.innerWidth;
      const actual = parseFloat(getComputedStyle(el3).fontSize);
      assert(Math.abs(actual - expected) < 1, "expected ~" + expected + "px but got " + actual + "px");
      document.body.removeChild(el3);
    `,
  },
];

const FLUID_FONT_SIZE_VW_TESTS: SandboxTest[] = [
  {
    label: "Scales linearly and unboundedly with viewport width",
    source: `
      assert(typeof setFluidFontSizeLegacy === "function", "setFluidFontSizeLegacy is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      setFluidFontSizeLegacy(el, 5);
      const expected = (5 / 100) * window.innerWidth;
      const actual = parseFloat(getComputedStyle(el).fontSize);
      assert(Math.abs(actual - expected) < 1, "expected ~" + expected + "px but got " + actual + "px");
      document.body.removeChild(el);
    `,
  },
];

const GRADIENT_TEXT_BACKGROUND_CLIP_TESTS: SandboxTest[] = [
  {
    label: "Clips the background to the text glyphs' shape",
    source: `
      assert(typeof applyGradientText === "function", "applyGradientText is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyGradientText(el, "linear-gradient(90deg, red, blue)");
      const cs = getComputedStyle(el);
      assert(cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text", "expected background-clip: text");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Makes the text itself transparent so the clipped gradient shows through",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyGradientText(el2, "linear-gradient(90deg, red, blue)");
      assertEqual(getComputedStyle(el2).color, "rgba(0, 0, 0, 0)");
      document.body.removeChild(el2);
    `,
  },
  {
    label: "Applies the given gradient as the background",
    source: `
      const el3 = document.createElement("div");
      document.body.appendChild(el3);
      applyGradientText(el3, "linear-gradient(90deg, red, blue)");
      assert(getComputedStyle(el3).backgroundImage.indexOf("gradient") !== -1, "expected a gradient background-image");
      document.body.removeChild(el3);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 3
const FLEX_LAYOUT_FIXED_FLEXIBLE_FIXED_TESTS: SandboxTest[] = [
  {
    label: "The middle child absorbs exactly the remaining space",
    source: `
      assert(typeof applyFlexLayoutOne === "function", "applyFlexLayoutOne is not defined");
      const container = document.createElement("div");
      container.style.width = "500px";
      for (let i = 0; i < 3; i++) container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyFlexLayoutOne(container);
      const widths = Array.from(container.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths, [100, 300, 100]);
      document.body.removeChild(container);
    `,
  },
  {
    label: "The two fixed columns stay 100px regardless of container width",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "700px";
      for (let i = 0; i < 3; i++) container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyFlexLayoutOne(container2);
      const widths2 = Array.from(container2.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths2, [100, 500, 100]);
      document.body.removeChild(container2);
    `,
  },
];

const FLEX_EQUAL_HEIGHT_CARDS_TESTS: SandboxTest[] = [
  {
    label: "Cards stretch to match the tallest card in their row",
    source: `
      assert(typeof applyEqualHeightCards === "function", "applyEqualHeightCards is not defined");
      const container = document.createElement("div");
      const card1 = document.createElement("div");
      const inner1 = document.createElement("div");
      inner1.style.height = "50px";
      card1.appendChild(inner1);
      const card2 = document.createElement("div");
      const inner2 = document.createElement("div");
      inner2.style.height = "150px";
      card2.appendChild(inner2);
      container.appendChild(card1);
      container.appendChild(card2);
      document.body.appendChild(container);
      applyEqualHeightCards(container);
      assertEqual(card1.getBoundingClientRect().height, 150);
      assertEqual(card2.getBoundingClientRect().height, 150);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Cards wrap onto a new row instead of overflowing or shrinking to fit one row",
    source: `
      const container2 = document.createElement("div");
      container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyEqualHeightCards(container2);
      assertEqual(getComputedStyle(container2).flexWrap, "wrap");
      document.body.removeChild(container2);
    `,
  },
];

const FLEX_TWO_COLUMN_LAYOUT_TESTS: SandboxTest[] = [
  {
    label: "The sidebar takes exactly the given width, main takes the rest",
    source: `
      assert(typeof applyTwoColumnLayout === "function", "applyTwoColumnLayout is not defined");
      const container = document.createElement("div");
      container.style.width = "500px";
      container.appendChild(document.createElement("div"));
      container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyTwoColumnLayout(container, 150);
      const widths = Array.from(container.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths, [150, 350]);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Works correctly for a different sidebarWidth, not hardcoded",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "500px";
      container2.appendChild(document.createElement("div"));
      container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyTwoColumnLayout(container2, 250);
      const widths2 = Array.from(container2.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths2, [250, 250]);
      document.body.removeChild(container2);
    `,
  },
];

const FLEX_STICKY_FOOTER_TESTS: SandboxTest[] = [
  {
    label: "Pins the footer to the bottom even when content doesn't fill the wrapper",
    source: `
      assert(typeof applyStickyFooterLayout === "function", "applyStickyFooterLayout is not defined");
      const wrapper = document.createElement("div");
      wrapper.style.height = "400px";
      const header = document.createElement("div");
      const main = document.createElement("div");
      const footer = document.createElement("div");
      footer.style.height = "30px";
      wrapper.appendChild(header);
      wrapper.appendChild(main);
      wrapper.appendChild(footer);
      document.body.appendChild(wrapper);
      applyStickyFooterLayout(wrapper);
      const wrapperRect = wrapper.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      assertEqual(Math.round(footerRect.bottom), Math.round(wrapperRect.bottom));
      document.body.removeChild(wrapper);
    `,
  },
  {
    label: "Only the main area absorbs the leftover space; header and footer keep their natural size",
    source: `
      const wrapper2 = document.createElement("div");
      wrapper2.style.height = "400px";
      const header2 = document.createElement("div");
      const main2 = document.createElement("div");
      const footer2 = document.createElement("div");
      wrapper2.appendChild(header2);
      wrapper2.appendChild(main2);
      wrapper2.appendChild(footer2);
      document.body.appendChild(wrapper2);
      applyStickyFooterLayout(wrapper2);
      assertEqual(getComputedStyle(main2).flexGrow, "1");
      document.body.removeChild(wrapper2);
    `,
  },
];

const FLEX_CHILD_MIN_WIDTH_ZERO_TRUNCATION_TESTS: SandboxTest[] = [
  {
    label: "Demonstrates the bug: ellipsis alone doesn't truncate a flex child that refuses to shrink",
    source: `
      assert(typeof fixFlexChildTruncation === "function", "fixFlexChildTruncation is not defined");
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.width = "100px";
      const flexChild = document.createElement("div");
      flexChild.style.whiteSpace = "nowrap";
      flexChild.style.overflow = "hidden";
      flexChild.style.textOverflow = "ellipsis";
      flexChild.textContent = "This is a very long piece of text that will not fit";
      container.appendChild(flexChild);
      document.body.appendChild(container);
      assert(flexChild.getBoundingClientRect().width > 100, "expected the unfixed flex child to overflow the 100px container");
      document.body.removeChild(container);
    `,
  },
  {
    label: "min-width: 0 lets the flex child actually shrink, letting the existing ellipsis styles finally take effect",
    source: `
      const container2 = document.createElement("div");
      container2.style.display = "flex";
      container2.style.width = "100px";
      const flexChild2 = document.createElement("div");
      flexChild2.style.whiteSpace = "nowrap";
      flexChild2.style.overflow = "hidden";
      flexChild2.style.textOverflow = "ellipsis";
      flexChild2.textContent = "This is a very long piece of text that will not fit";
      container2.appendChild(flexChild2);
      document.body.appendChild(container2);
      fixFlexChildTruncation(flexChild2);
      assert(flexChild2.getBoundingClientRect().width <= 100, "expected the fixed flex child to fit within the 100px container");
      document.body.removeChild(container2);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 4
const GRID_LAYOUT_BASIC_COLUMNS_TESTS: SandboxTest[] = [
  {
    label: "Splits the container into 3 exactly equal columns",
    source: `
      assert(typeof applyGridLayoutOne === "function", "applyGridLayoutOne is not defined");
      const container = document.createElement("div");
      container.style.width = "300px";
      for (let i = 0; i < 3; i++) container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyGridLayoutOne(container);
      const widths = Array.from(container.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths, [100, 100, 100]);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Recomputes correctly for a different container width",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "600px";
      for (let i = 0; i < 3; i++) container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyGridLayoutOne(container2);
      const widths2 = Array.from(container2.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths2, [200, 200, 200]);
      document.body.removeChild(container2);
    `,
  },
];

const GRID_LAYOUT_SIDEBAR_MAIN_TESTS: SandboxTest[] = [
  {
    label: "The sidebar column takes exactly the given width, the main column takes the rest",
    source: `
      assert(typeof applyGridLayoutTwo === "function", "applyGridLayoutTwo is not defined");
      const container = document.createElement("div");
      container.style.width = "500px";
      container.appendChild(document.createElement("div"));
      container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyGridLayoutTwo(container, 150);
      const widths = Array.from(container.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths, [150, 350]);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Works correctly for a different sidebarWidth",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "500px";
      container2.appendChild(document.createElement("div"));
      container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyGridLayoutTwo(container2, 250);
      const widths2 = Array.from(container2.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths2, [250, 250]);
      document.body.removeChild(container2);
    `,
  },
];

const GRID_RESPONSIVE_AUTO_FIT_MINMAX_TESTS: SandboxTest[] = [
  {
    label: "Fits as many columns as the container allows, wrapping the rest",
    source: `
      assert(typeof applyResponsiveGrid === "function", "applyResponsiveGrid is not defined");
      const container = document.createElement("div");
      container.style.width = "650px";
      const items = [];
      for (let i = 0; i < 5; i++) {
        const item = document.createElement("div");
        item.style.height = "40px";
        container.appendChild(item);
        items.push(item);
      }
      document.body.appendChild(container);
      applyResponsiveGrid(container, 200);
      const tops = items.map((el) => el.getBoundingClientRect().top);
      const row1Count = tops.filter((t) => t === tops[0]).length;
      assertEqual(row1Count, 3);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Recomputes the column count for a narrower container, with no media query involved",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "450px";
      const items2 = [];
      for (let i = 0; i < 5; i++) {
        const item = document.createElement("div");
        item.style.height = "40px";
        container2.appendChild(item);
        items2.push(item);
      }
      document.body.appendChild(container2);
      applyResponsiveGrid(container2, 200);
      const tops2 = items2.map((el) => el.getBoundingClientRect().top);
      const row1Count2 = tops2.filter((t) => t === tops2[0]).length;
      assertEqual(row1Count2, 2);
      document.body.removeChild(container2);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 5
const CSS_MULTI_COLUMN_TEXT_TESTS: SandboxTest[] = [
  {
    label: "Sets the element to flow its content across 3 columns",
    source: `
      assert(typeof applyMultiColumnText === "function", "applyMultiColumnText is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyMultiColumnText(el, 3);
      assertEqual(getComputedStyle(el).columnCount, "3");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Works correctly for a different column count",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyMultiColumnText(el2, 2);
      assertEqual(getComputedStyle(el2).columnCount, "2");
      document.body.removeChild(el2);
    `,
  },
];

const THREE_COLUMN_FEED_LAYOUT_TESTS: SandboxTest[] = [
  {
    label: "Nav and sidebar stay fixed; the feed caps at its max width instead of stretching to fill the extra space",
    source: `
      assert(typeof applyThreeColumnFeedLayout === "function", "applyThreeColumnFeedLayout is not defined");
      const container = document.createElement("div");
      container.style.width = "1200px";
      container.appendChild(document.createElement("div"));
      container.appendChild(document.createElement("div"));
      container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyThreeColumnFeedLayout(container, 250, 300, 600);
      const widths = Array.from(container.children).map((c) => c.getBoundingClientRect().width);
      assertEqual(widths, [250, 600, 300]);
      document.body.removeChild(container);
    `,
  },
];

const HOLY_GRAIL_LAYOUT_TESTS: SandboxTest[] = [
  {
    label: "Nav and aside stay fixed width; main fills exactly what's left",
    source: `
      assert(typeof applyHolyGrailLayout === "function", "applyHolyGrailLayout is not defined");
      function buildWrapper() {
        const wrapper = document.createElement("div");
        wrapper.style.width = "800px";
        wrapper.style.height = "500px";
        const header = document.createElement("div");
        header.style.height = "40px";
        const middle = document.createElement("div");
        const nav = document.createElement("div");
        const main = document.createElement("div");
        const aside = document.createElement("div");
        middle.appendChild(nav);
        middle.appendChild(main);
        middle.appendChild(aside);
        const footer = document.createElement("div");
        footer.style.height = "40px";
        wrapper.appendChild(header);
        wrapper.appendChild(middle);
        wrapper.appendChild(footer);
        document.body.appendChild(wrapper);
        return { wrapper, header, middle, nav, main, aside, footer };
      }
      const parts = buildWrapper();
      applyHolyGrailLayout(parts.wrapper, 150, 200);
      assertEqual(Math.round(parts.nav.getBoundingClientRect().width), 150);
      assertEqual(Math.round(parts.aside.getBoundingClientRect().width), 200);
      assertEqual(Math.round(parts.main.getBoundingClientRect().width), 450);
      document.body.removeChild(parts.wrapper);
    `,
  },
  {
    label: "The middle row absorbs all vertical space left over between header and footer",
    source: `
      function buildWrapper2() {
        const wrapper = document.createElement("div");
        wrapper.style.width = "800px";
        wrapper.style.height = "500px";
        const header = document.createElement("div");
        header.style.height = "40px";
        const middle = document.createElement("div");
        const nav = document.createElement("div");
        const main = document.createElement("div");
        const aside = document.createElement("div");
        middle.appendChild(nav);
        middle.appendChild(main);
        middle.appendChild(aside);
        const footer = document.createElement("div");
        footer.style.height = "40px";
        wrapper.appendChild(header);
        wrapper.appendChild(middle);
        wrapper.appendChild(footer);
        document.body.appendChild(wrapper);
        return { wrapper, middle };
      }
      const parts2 = buildWrapper2();
      applyHolyGrailLayout(parts2.wrapper, 150, 200);
      assertEqual(Math.round(parts2.middle.getBoundingClientRect().height), 420);
      document.body.removeChild(parts2.wrapper);
    `,
  },
  {
    label: "Main renders visually between nav and aside",
    source: `
      function buildWrapper3() {
        const wrapper = document.createElement("div");
        wrapper.style.width = "800px";
        wrapper.style.height = "500px";
        const header = document.createElement("div");
        const middle = document.createElement("div");
        const nav = document.createElement("div");
        const main = document.createElement("div");
        const aside = document.createElement("div");
        middle.appendChild(nav);
        middle.appendChild(main);
        middle.appendChild(aside);
        const footer = document.createElement("div");
        wrapper.appendChild(header);
        wrapper.appendChild(middle);
        wrapper.appendChild(footer);
        document.body.appendChild(wrapper);
        return { wrapper, nav, main, aside };
      }
      const parts3 = buildWrapper3();
      applyHolyGrailLayout(parts3.wrapper, 150, 200);
      const navLeft = parts3.nav.getBoundingClientRect().left;
      const mainLeft = parts3.main.getBoundingClientRect().left;
      const asideLeft = parts3.aside.getBoundingClientRect().left;
      assert(navLeft < mainLeft && mainLeft < asideLeft, "expected left-to-right order nav, main, aside");
      document.body.removeChild(parts3.wrapper);
    `,
  },
];

const RESPONSIVE_PRODUCT_CARD_GRID_TESTS: SandboxTest[] = [
  {
    label: "Column width correctly accounts for the gaps eaten out of the container's total width",
    source: `
      assert(typeof applyProductGrid === "function", "applyProductGrid is not defined");
      const container = document.createElement("div");
      container.style.width = "630px";
      for (let i = 0; i < 3; i++) container.appendChild(document.createElement("div"));
      document.body.appendChild(container);
      applyProductGrid(container, 3, 15);
      const widths = Array.from(container.children).map((c) => Math.round(c.getBoundingClientRect().width));
      assertEqual(widths, [200, 200, 200]);
      document.body.removeChild(container);
    `,
  },
  {
    label: "Applies real gutter spacing between cards, not just between the columns' content",
    source: `
      const container2 = document.createElement("div");
      container2.style.width = "630px";
      for (let i = 0; i < 3; i++) container2.appendChild(document.createElement("div"));
      document.body.appendChild(container2);
      applyProductGrid(container2, 3, 15);
      const lefts = Array.from(container2.children).map((c) => c.getBoundingClientRect().left);
      assertEqual(Math.round(lefts[1] - lefts[0]), 215);
      document.body.removeChild(container2);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 6
const GOLDEN_RATIO_RECTANGLE_TESTS: SandboxTest[] = [
  {
    label: "Height is derived from width divided by the golden ratio",
    source: `
      assert(typeof applyGoldenRatioRectangle === "function", "applyGoldenRatioRectangle is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyGoldenRatioRectangle(el, 300);
      const rect = el.getBoundingClientRect();
      assertEqual(rect.width, 300);
      assert(Math.abs(rect.height - 300 / 1.618) < 1, "expected height ~" + (300 / 1.618) + " but got " + rect.height);
      document.body.removeChild(el);
    `,
  },
  {
    label: "Recomputes correctly for a different width, not a fixed height",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyGoldenRatioRectangle(el2, 500);
      const rect2 = el2.getBoundingClientRect();
      assertEqual(rect2.width, 500);
      assert(Math.abs(rect2.height - 500 / 1.618) < 1, "expected height ~" + (500 / 1.618) + " but got " + rect2.height);
      document.body.removeChild(el2);
    `,
  },
];

const CSS_TRIANGLE_BORDER_TRICK_TESTS: SandboxTest[] = [
  {
    label: "The element itself has zero content size — the shape comes entirely from its borders",
    source: `
      assert(typeof applyCssTriangle === "function", "applyCssTriangle is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyCssTriangle(el, 20, "red");
      assertEqual(getComputedStyle(el).width, "0px");
      assertEqual(getComputedStyle(el).height, "0px");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Only the bottom border is colored — the other two are transparent, which is what forms the visible point",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyCssTriangle(el2, 20, "red");
      const cs = getComputedStyle(el2);
      assertEqual(cs.borderBottomColor, "rgb(255, 0, 0)");
      assertEqual(cs.borderLeftColor, "rgba(0, 0, 0, 0)");
      assertEqual(cs.borderRightColor, "rgba(0, 0, 0, 0)");
      document.body.removeChild(el2);
    `,
  },
];

const CUSTOM_CHECKBOX_STYLE_TESTS: SandboxTest[] = [
  {
    label: "Renders with a white background before it's checked",
    source: `
      assert(typeof applyCustomCheckbox === "function", "applyCustomCheckbox is not defined");
      const checkboxEl = document.createElement("input");
      checkboxEl.type = "checkbox";
      document.body.appendChild(checkboxEl);
      applyCustomCheckbox(checkboxEl);
      assertEqual(getComputedStyle(checkboxEl).backgroundColor, "rgb(255, 255, 255)");
      document.body.removeChild(checkboxEl);
    `,
  },
  {
    label: "The real :checked pseudo-class reacts to the checkbox's actual checked state, no JS style-swapping needed",
    source: `
      const checkboxEl2 = document.createElement("input");
      checkboxEl2.type = "checkbox";
      document.body.appendChild(checkboxEl2);
      applyCustomCheckbox(checkboxEl2);
      checkboxEl2.checked = true;
      checkboxEl2.dispatchEvent(new Event("change", { bubbles: true }));
      assertEqual(getComputedStyle(checkboxEl2).backgroundColor, "rgb(51, 51, 51)");
      document.body.removeChild(checkboxEl2);
    `,
  },
];

const CSS_TOGGLE_SWITCH_TESTS: SandboxTest[] = [
  {
    label: "The slider sits in its resting position while unchecked",
    source: `
      assert(typeof applyToggleSwitch === "function", "applyToggleSwitch is not defined");
      const rootEl = document.createElement("div");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "toggle-input";
      const slider = document.createElement("span");
      slider.className = "toggle-slider";
      rootEl.appendChild(input);
      rootEl.appendChild(slider);
      document.body.appendChild(rootEl);
      applyToggleSwitch(rootEl);
      assertEqual(getComputedStyle(slider).transform, "none");
      document.body.removeChild(rootEl);
    `,
  },
  {
    label: "The adjacent-sibling :checked selector moves the slider automatically — no JS needed to touch the slider directly",
    source: `
      const rootEl2 = document.createElement("div");
      const input2 = document.createElement("input");
      input2.type = "checkbox";
      input2.className = "toggle-input";
      const slider2 = document.createElement("span");
      slider2.className = "toggle-slider";
      rootEl2.appendChild(input2);
      rootEl2.appendChild(slider2);
      document.body.appendChild(rootEl2);
      applyToggleSwitch(rootEl2);
      input2.checked = true;
      input2.dispatchEvent(new Event("change", { bubbles: true }));
      await delay(300);
      const transform = getComputedStyle(slider2).transform;
      const inner = transform.slice(transform.indexOf("(") + 1, transform.indexOf(")"));
      const parts = inner.split(",").map((s) => parseFloat(s.trim()));
      assertEqual(parts[4], 20);
      document.body.removeChild(rootEl2);
    `,
  },
];

const CSS_CLOSE_BUTTON_X_TESTS: SandboxTest[] = [
  {
    label: "Both bars are generated content, not extra real elements",
    source: `
      assert(typeof applyCloseButtonX === "function", "applyCloseButtonX is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyCloseButtonX(el);
      assertEqual(getComputedStyle(el, "::before").content, '""');
      assertEqual(getComputedStyle(el, "::after").content, '""');
      document.body.removeChild(el);
    `,
  },
  {
    label: "The two bars rotate oppositely, which is what makes them cross into an X",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyCloseButtonX(el2);
      const before = getComputedStyle(el2, "::before").transform;
      const after = getComputedStyle(el2, "::after").transform;
      assert(before !== "none" && after !== "none", "expected both pseudo-elements to have a transform");
      assert(before !== after, "expected the two bars to rotate in different directions");
      document.body.removeChild(el2);
    `,
  },
];

const CSS_DOUGHNUT_CHART_TESTS: SandboxTest[] = [
  {
    label: "Paints a conic-gradient with stops derived from the segments' cumulative percentages",
    source: `
      assert(typeof applyDoughnutChart === "function", "applyDoughnutChart is not defined");
      const el = document.createElement("div");
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      applyDoughnutChart(el, [{ color: "red", percent: 40 }, { color: "blue", percent: 60 }]);
      const bg = getComputedStyle(el).backgroundImage;
      assert(bg.indexOf("conic-gradient") !== -1, "expected a conic-gradient background, got: " + bg);
      document.body.removeChild(el);
    `,
  },
  {
    label: "The outer shape is a full circle",
    source: `
      const el2 = document.createElement("div");
      el2.style.width = "100px";
      el2.style.height = "100px";
      document.body.appendChild(el2);
      applyDoughnutChart(el2, [{ color: "red", percent: 100 }]);
      assertEqual(getComputedStyle(el2).borderRadius, "50%");
      document.body.removeChild(el2);
    `,
  },
  {
    label: "Punches a hole through the middle to give the doughnut shape, not a solid pie",
    source: `
      const el3 = document.createElement("div");
      el3.style.width = "100px";
      el3.style.height = "100px";
      document.body.appendChild(el3);
      applyDoughnutChart(el3, [{ color: "red", percent: 100 }]);
      assertEqual(el3.children.length, 1);
      const holeRect = el3.children[0].getBoundingClientRect();
      const outerRect = el3.getBoundingClientRect();
      assert(holeRect.width < outerRect.width, "expected the hole to be smaller than the outer circle");
      document.body.removeChild(el3);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 7
const OBJECT_FIT_IMAGE_FITTING_TESTS: SandboxTest[] = [
  {
    label: "Sizes the box to the given dimensions and applies the requested fit mode",
    source: `
      assert(typeof applyObjectFit === "function", "applyObjectFit is not defined");
      const imgEl = document.createElement("img");
      document.body.appendChild(imgEl);
      applyObjectFit(imgEl, 300, 200, "cover");
      const rect = imgEl.getBoundingClientRect();
      assertEqual(rect.width, 300);
      assertEqual(rect.height, 200);
      assertEqual(getComputedStyle(imgEl).objectFit, "cover");
      document.body.removeChild(imgEl);
    `,
  },
  {
    label: "Works correctly for a different fit mode, not hardcoded to one",
    source: `
      const imgEl2 = document.createElement("img");
      document.body.appendChild(imgEl2);
      applyObjectFit(imgEl2, 300, 200, "contain");
      assertEqual(getComputedStyle(imgEl2).objectFit, "contain");
      document.body.removeChild(imgEl2);
    `,
  },
];

const RESPONSIVE_IMAGE_ASPECT_RATIO_TESTS: SandboxTest[] = [
  {
    label: "Height is derived from the container's real width and the given ratio",
    source: `
      assert(typeof applyAspectRatio === "function", "applyAspectRatio is not defined");
      const wrapper = document.createElement("div");
      wrapper.style.width = "400px";
      const el = document.createElement("div");
      wrapper.appendChild(el);
      document.body.appendChild(wrapper);
      applyAspectRatio(el, 16, 9);
      const rect = el.getBoundingClientRect();
      assertEqual(rect.width, 400);
      assert(Math.abs(rect.height - 225) < 1, "expected height ~225 but got " + rect.height);
      document.body.removeChild(wrapper);
    `,
  },
  {
    label: "Works correctly for a square ratio, not hardcoded to 16:9",
    source: `
      const wrapper2 = document.createElement("div");
      wrapper2.style.width = "400px";
      const el2 = document.createElement("div");
      wrapper2.appendChild(el2);
      document.body.appendChild(wrapper2);
      applyAspectRatio(el2, 1, 1);
      const rect2 = el2.getBoundingClientRect();
      assertEqual(rect2.width, 400);
      assertEqual(rect2.height, 400);
      document.body.removeChild(wrapper2);
    `,
  },
];

const BACKGROUND_SIZE_COVER_VS_CONTAIN_TESTS: SandboxTest[] = [
  {
    label: "Applies cover, which crops to fill the box",
    source: `
      assert(typeof applyBackgroundSize === "function", "applyBackgroundSize is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyBackgroundSize(el, "cover");
      assertEqual(getComputedStyle(el).backgroundSize, "cover");
      document.body.removeChild(el);
    `,
  },
  {
    label: "Applies contain, which fits entirely inside the box instead",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyBackgroundSize(el2, "contain");
      assertEqual(getComputedStyle(el2).backgroundSize, "contain");
      document.body.removeChild(el2);
    `,
  },
];

// Practice — standalone CSS Interview Question Roadmap, Stage 8
const NATIVE_INPUT_ACCENT_COLOR_TESTS: SandboxTest[] = [
  {
    label: "Sets the native control's accent color directly",
    source: `
      assert(typeof applyAccentColor === "function", "applyAccentColor is not defined");
      const inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      document.body.appendChild(inputEl);
      applyAccentColor(inputEl, "red");
      assertEqual(getComputedStyle(inputEl).accentColor, "rgb(255, 0, 0)");
      document.body.removeChild(inputEl);
    `,
  },
];

const CSS_COUNTER_LIST_NUMBERING_TESTS: SandboxTest[] = [
  {
    label: "Initializes the named counter on the list container",
    source: `
      assert(typeof applyCustomCounter === "function", "applyCustomCounter is not defined");
      const listEl = document.createElement("div");
      listEl.appendChild(document.createElement("div"));
      listEl.appendChild(document.createElement("div"));
      document.body.appendChild(listEl);
      applyCustomCounter(listEl, "item");
      assert(getComputedStyle(listEl).counterReset.indexOf("item") !== -1, "expected counter-reset to mention 'item'");
      document.body.removeChild(listEl);
    `,
  },
  {
    label: "Each child increments the counter by one",
    source: `
      const listEl2 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      listEl2.appendChild(child1);
      listEl2.appendChild(child2);
      document.body.appendChild(listEl2);
      applyCustomCounter(listEl2, "item");
      assertEqual(getComputedStyle(child1).counterIncrement, "item");
      assertEqual(getComputedStyle(child2).counterIncrement, "item");
      document.body.removeChild(listEl2);
    `,
  },
  {
    label: "Each child's generated content actually reads from the counter",
    source: `
      const listEl3 = document.createElement("div");
      const child = document.createElement("div");
      listEl3.appendChild(child);
      document.body.appendChild(listEl3);
      applyCustomCounter(listEl3, "item");
      const content = getComputedStyle(child, "::before").content;
      assert(content.indexOf("counter(") !== -1, "expected ::before content to reference counter(), got: " + content);
      document.body.removeChild(listEl3);
    `,
  },
];

const NTH_CHILD_ROW_STRIPING_TESTS: SandboxTest[] = [
  {
    label: "Only even-positioned children receive the stripe color",
    source: `
      assert(typeof applyRowStriping === "function", "applyRowStriping is not defined");
      const listEl = document.createElement("div");
      const children = [];
      for (let i = 0; i < 4; i++) {
        const child = document.createElement("div");
        listEl.appendChild(child);
        children.push(child);
      }
      document.body.appendChild(listEl);
      applyRowStriping(listEl, "rgb(240, 240, 240)");
      assertEqual(getComputedStyle(children[0]).backgroundColor, "rgba(0, 0, 0, 0)");
      assertEqual(getComputedStyle(children[1]).backgroundColor, "rgb(240, 240, 240)");
      assertEqual(getComputedStyle(children[2]).backgroundColor, "rgba(0, 0, 0, 0)");
      assertEqual(getComputedStyle(children[3]).backgroundColor, "rgb(240, 240, 240)");
      document.body.removeChild(listEl);
    `,
  },
];

const SELECTION_PSEUDO_ELEMENT_STYLE_TESTS: SandboxTest[] = [
  {
    label: "Restyles the text-selection highlight, not the element's own background",
    source: `
      assert(typeof applySelectionStyle === "function", "applySelectionStyle is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applySelectionStyle(el, "rgb(255, 200, 0)");
      const selectionStyle = getComputedStyle(el, "::selection");
      assertEqual(selectionStyle.backgroundColor, "rgb(255, 200, 0)");
      document.body.removeChild(el);
    `,
  },
];

const CUSTOM_SCROLLBAR_STYLING_TESTS: SandboxTest[] = [
  {
    label: "Covers the WebKit/Blink scrollbar track",
    source: `
      assert(typeof getCustomScrollbarCss === "function", "getCustomScrollbarCss is not defined");
      const css = getCustomScrollbarCss();
      assert(css.indexOf("::-webkit-scrollbar") !== -1, "expected ::-webkit-scrollbar in the returned CSS");
      assert(css.indexOf("width") !== -1, "expected a width declaration");
    `,
  },
  {
    label: "Covers the WebKit/Blink scrollbar thumb specifically, not just the track",
    source: `
      const css2 = getCustomScrollbarCss();
      assert(css2.indexOf("::-webkit-scrollbar-thumb") !== -1, "expected ::-webkit-scrollbar-thumb in the returned CSS");
    `,
  },
  {
    label: "Also covers Firefox's standardized scrollbar properties, not just the WebKit-only ones",
    source: `
      const css3 = getCustomScrollbarCss();
      assert(css3.indexOf("scrollbar-color") !== -1, "expected scrollbar-color in the returned CSS");
      assert(css3.indexOf("scrollbar-width") !== -1, "expected scrollbar-width in the returned CSS");
    `,
  },
];

const CSS_SPECIFICITY_CASCADE_ORDER_TESTS: SandboxTest[] = [
  {
    label: "Orders strictly by the specificity tuple when there are no ties",
    source: `
      assert(typeof sortBySpecificity === "function", "sortBySpecificity is not defined");
      const result = sortBySpecificity([[0, 1, 0], [1, 0, 0], [0, 0, 1]]);
      assertEqual(result, [2, 0, 1]);
    `,
  },
  {
    label: "Ties are broken by keeping source order — the later rule wins",
    source: `
      const result2 = sortBySpecificity([[0, 1, 0], [0, 1, 0]]);
      assertEqual(result2, [0, 1]);
    `,
  },
  {
    label: "The last entry in the returned order is always the winning rule",
    source: `
      const result3 = sortBySpecificity([[1, 0, 0], [0, 5, 0], [0, 0, 10]]);
      assertEqual(result3[result3.length - 1], 0);
    `,
  },
];

const SUB_PIXEL_HALF_BORDER_TRICK_TESTS: SandboxTest[] = [
  {
    label: "The border itself is drawn at a full, reliably-rendered 1px width",
    source: `
      assert(typeof applyHalfPixelBorder === "function", "applyHalfPixelBorder is not defined");
      const el = document.createElement("div");
      document.body.appendChild(el);
      applyHalfPixelBorder(el, "red");
      assertEqual(getComputedStyle(el, "::after").borderTopWidth, "1px");
      document.body.removeChild(el);
    `,
  },
  {
    label: "The visual half-width effect comes from scaling the whole pseudo-element down, not from the border-width value itself",
    source: `
      const el2 = document.createElement("div");
      document.body.appendChild(el2);
      applyHalfPixelBorder(el2, "red");
      const transform = getComputedStyle(el2, "::after").transform;
      assert(transform !== "none", "expected a transform on the ::after pseudo-element");
      const inner = transform.slice(transform.indexOf("(") + 1, transform.indexOf(")"));
      const parts = inner.split(",").map((s) => parseFloat(s.trim()));
      assertEqual(parts[0], 0.5);
      assertEqual(parts[3], 0.5);
      document.body.removeChild(el2);
    `,
  },
];

const SCROLLABLE_CENTERED_MODAL_TESTS: SandboxTest[] = [
  {
    label: "Clips the modal to a maximum of 80vh regardless of how tall its content is",
    source: `
      assert(typeof applyScrollableModal === "function", "applyScrollableModal is not defined");
      const overlay = document.createElement("div");
      const modal = document.createElement("div");
      const tallContent = document.createElement("div");
      tallContent.style.height = "3000px";
      modal.appendChild(tallContent);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      applyScrollableModal(overlay, modal);
      const modalHeight = modal.getBoundingClientRect().height;
      assert(modalHeight <= window.innerHeight * 0.8 + 1, "expected modal height <= 80vh, got " + modalHeight);
      document.body.removeChild(overlay);
    `,
  },
  {
    label: "Stays centered on screen even though its content overflows internally",
    source: `
      const overlay2 = document.createElement("div");
      const modal2 = document.createElement("div");
      modal2.style.width = "300px";
      modal2.style.height = "200px";
      overlay2.appendChild(modal2);
      document.body.appendChild(overlay2);
      applyScrollableModal(overlay2, modal2);
      const modalRect = modal2.getBoundingClientRect();
      const modalCenterX = modalRect.left + modalRect.width / 2;
      const modalCenterY = modalRect.top + modalRect.height / 2;
      assert(Math.abs(modalCenterX - window.innerWidth / 2) < 2, "expected modal horizontally centered");
      assert(Math.abs(modalCenterY - window.innerHeight / 2) < 2, "expected modal vertically centered");
      document.body.removeChild(overlay2);
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 1
const NESTED_CHECKBOXES_TREE_STATE_TESTS: SandboxTest[] = [
  {
    label: "A partially-checked set of children makes the parent indeterminate",
    source: `
      assert(typeof toggleNode === "function", "toggleNode is not defined");
      const tree = {
        id: "parent", checked: false, indeterminate: false,
        children: [
          { id: "childA", checked: false, indeterminate: false, children: [] },
          { id: "childB", checked: false, indeterminate: false, children: [] },
        ],
      };
      const result = toggleNode(tree, "childA");
      const parent = result;
      const childA = parent.children.find((c) => c.id === "childA");
      assertEqual(childA.checked, true);
      assertEqual(parent.checked, false);
      assertEqual(parent.indeterminate, true);
    `,
  },
  {
    label: "Checking every child makes the parent fully checked",
    source: `
      let tree = {
        id: "parent", checked: false, indeterminate: false,
        children: [
          { id: "childA", checked: false, indeterminate: false, children: [] },
          { id: "childB", checked: false, indeterminate: false, children: [] },
        ],
      };
      tree = toggleNode(tree, "childA");
      tree = toggleNode(tree, "childB");
      assertEqual(tree.checked, true);
      assertEqual(tree.indeterminate, false);
    `,
  },
  {
    label: "Toggling a parent propagates the new state to every descendant",
    source: `
      const tree3 = {
        id: "parent", checked: false, indeterminate: false,
        children: [
          { id: "childA", checked: false, indeterminate: false, children: [] },
          { id: "childB", checked: false, indeterminate: false, children: [] },
        ],
      };
      const result3 = toggleNode(tree3, "parent");
      assertEqual(result3.checked, true);
      assertEqual(result3.children.every((c) => c.checked), true);
    `,
  },
];

const STAR_RATING_WIDGET_TESTS: SandboxTest[] = [
  {
    label: "Hovering previews without committing the real value",
    source: `
      assert(typeof createStarRating === "function", "createStarRating is not defined");
      const widget = createStarRating(5, 2);
      widget.hover(4);
      assertEqual(widget.getDisplayValue(), 4);
      assertEqual(widget.getValue(), 2);
    `,
  },
  {
    label: "Clearing the hover falls back to the committed value",
    source: `
      const widget2 = createStarRating(5, 2);
      widget2.hover(4);
      widget2.clearHover();
      assertEqual(widget2.getDisplayValue(), 2);
    `,
  },
  {
    label: "select() clamps to the valid [0, max] range",
    source: `
      const widget3 = createStarRating(5, 2);
      widget3.select(7);
      assertEqual(widget3.getValue(), 5);
    `,
  },
];

const TIC_TAC_TOE_GAME_LOGIC_TESTS: SandboxTest[] = [
  {
    label: "A legal move updates the board and switches turns",
    source: `
      assert(typeof createTicTacToe === "function", "createTicTacToe is not defined");
      const game = createTicTacToe();
      game.play(0);
      assertEqual(game.getBoard()[0], "X");
      assertEqual(game.getTurn(), "O");
    `,
  },
  {
    label: "Rejects a move on an already-occupied cell",
    source: `
      const game2 = createTicTacToe();
      game2.play(0);
      const secondMoveResult = game2.play(0);
      assertEqual(secondMoveResult, false);
      assertEqual(game2.getBoard()[0], "X");
    `,
  },
  {
    label: "Detects a winning line across the board",
    source: `
      const game3 = createTicTacToe();
      game3.play(0); // X
      game3.play(3); // O
      game3.play(1); // X
      game3.play(4); // O
      game3.play(2); // X completes top row
      assertEqual(game3.getWinner(), "X");
    `,
  },
];

const TOAST_NOTIFICATION_QUEUE_TESTS: SandboxTest[] = [
  {
    label: "Caps visible toasts at maxVisible, queueing the rest",
    source: `
      assert(typeof createToastQueue === "function", "createToastQueue is not defined");
      const queue = createToastQueue(2);
      queue.show("first", 10000);
      queue.show("second", 10000);
      queue.show("third", 10000);
      assertEqual(queue.getVisible().length, 2);
    `,
  },
  {
    label: "Dismissing promotes the next queued toast into view",
    source: `
      const queue2 = createToastQueue(2);
      const id1 = queue2.show("first", 10000);
      queue2.show("second", 10000);
      queue2.show("third", 10000);
      queue2.dismiss(id1);
      const messages = queue2.getVisible().map((t) => t.message);
      assert(messages.includes("third"), "expected the queued third toast to be promoted");
      assertEqual(queue2.getVisible().length, 2);
    `,
  },
  {
    label: "Auto-dismisses after the given duration without manual dismiss()",
    source: `
      const queue3 = createToastQueue(2);
      queue3.show("short-lived", 30);
      assertEqual(queue3.getVisible().length, 1);
      await delay(60);
      assertEqual(queue3.getVisible().length, 0);
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 2
const POLL_WIDGET_VOTE_TALLY_TESTS: SandboxTest[] = [
  {
    label: "A single vote is reflected correctly in the percentages",
    source: `
      assert(typeof createPoll === "function", "createPoll is not defined");
      const poll = createPoll(["a", "b"]);
      poll.vote("user1", "a");
      assertEqual(poll.getResults(), { a: 100, b: 0 });
    `,
  },
  {
    label: "Rejects a duplicate vote from the same user",
    source: `
      const poll2 = createPoll(["a", "b"]);
      poll2.vote("user1", "a");
      const secondVote = poll2.vote("user1", "b");
      assertEqual(secondVote, false);
      assertEqual(poll2.getResults(), { a: 100, b: 0 });
    `,
  },
  {
    label: "Computes percentages correctly across multiple voters",
    source: `
      const poll3 = createPoll(["a", "b"]);
      poll3.vote("user1", "a");
      poll3.vote("user2", "a");
      poll3.vote("user3", "a");
      poll3.vote("user4", "b");
      assertEqual(poll3.getResults(), { a: 75, b: 25 });
    `,
  },
];

const SLIDER_VALUE_FROM_POSITION_TESTS: SandboxTest[] = [
  {
    label: "A pointer at the track's start resolves to the minimum value",
    source: `
      assert(typeof getSliderValueFromPosition === "function", "getSliderValueFromPosition is not defined");
      const value = getSliderValueFromPosition({ pointerX: 0, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 1 });
      assertEqual(value, 0);
    `,
  },
  {
    label: "A pointer at the track's end resolves to the maximum value",
    source: `
      const value2 = getSliderValueFromPosition({ pointerX: 200, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 1 });
      assertEqual(value2, 100);
    `,
  },
  {
    label: "Clamps pointer positions outside the track's bounds",
    source: `
      const value3 = getSliderValueFromPosition({ pointerX: 500, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 1 });
      assertEqual(value3, 100);
    `,
  },
  {
    label: "Snaps the raw value to the nearest step, not a raw fractional value",
    source: `
      const value4 = getSliderValueFromPosition({ pointerX: 51, trackLeft: 0, trackWidth: 200, min: 0, max: 100, step: 10 });
      assertEqual(value4, 30);
    `,
  },
];

const CAROUSEL_AUTOPLAY_INDEX_TESTS: SandboxTest[] = [
  {
    label: "advance() wraps around at the end",
    source: `
      assert(typeof createCarousel === "function", "createCarousel is not defined");
      const carousel = createCarousel(3, 10000);
      carousel.advance();
      carousel.advance();
      assertEqual(carousel.getIndex(), 2);
      carousel.advance();
      assertEqual(carousel.getIndex(), 0);
      carousel.stop();
    `,
  },
  {
    label: "prev() wraps around at the start",
    source: `
      const carousel2 = createCarousel(3, 10000);
      assertEqual(carousel2.getIndex(), 0);
      carousel2.prev();
      assertEqual(carousel2.getIndex(), 2);
      carousel2.stop();
    `,
  },
  {
    label: "pause() actually stops autoplay from advancing",
    source: `
      const carousel3 = createCarousel(3, 20);
      carousel3.pause();
      await delay(80);
      assertEqual(carousel3.getIndex(), 0);
      carousel3.stop();
    `,
  },
];

const COMMAND_PALETTE_FUZZY_MATCH_TESTS: SandboxTest[] = [
  {
    label: "Matches a subsequence in order, even non-consecutively",
    source: `
      assert(typeof fuzzySearch === "function", "fuzzySearch is not defined");
      const results = fuzzySearch("gp", ["Go to Profile", "Settings"]);
      assertEqual(results, ["Go to Profile"]);
    `,
  },
  {
    label: "Excludes items where the query's characters don't all appear in order",
    source: `
      const results2 = fuzzySearch("xyz", ["Go to Profile"]);
      assertEqual(results2, []);
    `,
  },
  {
    label: "Ranks a consecutive-character match higher than a scattered one",
    source: `
      const results3 = fuzzySearch("set", ["Reset Everything", "Settings"]);
      assertEqual(results3, ["Settings", "Reset Everything"]);
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 3
const TYPEAHEAD_DEBOUNCED_SEARCH_TESTS: SandboxTest[] = [
  {
    label: "Coalesces rapid calls into a single debounced fetch",
    source: `
      assert(typeof createTypeahead === "function", "createTypeahead is not defined");
      let callCount = 0;
      let lastQuery = null;
      const fetcher = async (q) => { callCount++; lastQuery = q; return [q]; };
      const typeahead = createTypeahead(fetcher, 30);
      typeahead.search("a", () => {});
      typeahead.search("ab", () => {});
      typeahead.search("abc", () => {});
      await delay(70);
      assertEqual(callCount, 1);
      assertEqual(lastQuery, "abc");
    `,
  },
  {
    label: "Discards a stale response that resolves out of order",
    source: `
      const fetcher2 = async (q) => {
        if (q === "ab") { await delay(60); return ["ab-result"]; }
        await delay(10);
        return ["abc-result"];
      };
      const typeahead2 = createTypeahead(fetcher2, 5);
      let delivered = [];
      typeahead2.search("ab", (r) => delivered.push(r));
      await delay(20);
      typeahead2.search("abc", (r) => delivered.push(r));
      await delay(100);
      assertEqual(delivered, [["abc-result"]]);
    `,
  },
];

const INFINITE_SCROLL_PAGINATION_TRIGGER_TESTS: SandboxTest[] = [
  {
    label: "Triggers a page load when the sentinel becomes visible",
    source: `
      assert(typeof createInfiniteScroll === "function", "createInfiniteScroll is not defined");
      let loadedPages = [];
      const loadPage = async (page) => { loadedPages.push(page); return true; };
      let trigger;
      const createObserver = (onIntersect) => { trigger = onIntersect; };
      createInfiniteScroll(loadPage, createObserver);
      trigger(true);
      await delay(10);
      assertEqual(loadedPages, [0]);
    `,
  },
  {
    label: "Never triggers a second fetch while one is already in flight",
    source: `
      let loadCallCount = 0;
      const slowLoadPage = async () => { loadCallCount++; await delay(50); return true; };
      let trigger2;
      const createObserver2 = (onIntersect) => { trigger2 = onIntersect; };
      const scroller = createInfiniteScroll(slowLoadPage, createObserver2);
      trigger2(true);
      trigger2(true);
      trigger2(true);
      await delay(10);
      assertEqual(loadCallCount, 1);
      assertEqual(scroller.isLoading(), true);
    `,
  },
  {
    label: "Stops trying once the server reports no more pages",
    source: `
      let loadCallCount3 = 0;
      const finiteLoadPage = async () => { loadCallCount3++; return false; };
      let trigger3;
      const createObserver3 = (onIntersect) => { trigger3 = onIntersect; };
      const scroller3 = createInfiniteScroll(finiteLoadPage, createObserver3);
      trigger3(true);
      await delay(10);
      assertEqual(scroller3.isDone(), true);
      trigger3(true);
      await delay(10);
      assertEqual(loadCallCount3, 1);
    `,
  },
];

const API_PROGRESS_BAR_AGGREGATION_TESTS: SandboxTest[] = [
  {
    label: "Computes the correct percentage for a single request",
    source: `
      assert(typeof createProgressTracker === "function", "createProgressTracker is not defined");
      const tracker = createProgressTracker();
      tracker.start("req1", 100);
      tracker.update("req1", 50);
      assertEqual(tracker.getOverallPercent(), 50);
    `,
  },
  {
    label: "Aggregates by total bytes across requests, not a naive per-request average",
    source: `
      const tracker2 = createProgressTracker();
      tracker2.start("req1", 100);
      tracker2.update("req1", 100);
      tracker2.start("req2", 100);
      tracker2.update("req2", 0);
      assertEqual(tracker2.getOverallPercent(), 50);
    `,
  },
  {
    label: "An empty tracker (nothing in flight) reports 100%, not 0% or NaN",
    source: `
      const tracker3 = createProgressTracker();
      tracker3.start("req1", 100);
      tracker3.update("req1", 100);
      tracker3.finish("req1");
      assertEqual(tracker3.getOverallPercent(), 100);
    `,
  },
];

const CHUNKED_FILE_UPLOAD_RETRY_TESTS: SandboxTest[] = [
  {
    label: "Recovers from transient failures within the retry budget",
    source: `
      assert(typeof createChunkedUploader === "function", "createChunkedUploader is not defined");
      let attempts = 0;
      const flakyUpload = async () => {
        attempts++;
        if (attempts < 3) throw new Error("network blip");
      };
      const uploader = createChunkedUploader(flakyUpload, 3);
      const result = await uploader.uploadFile(["chunk1"]);
      assertEqual(result, true);
      assertEqual(attempts, 3);
    `,
  },
  {
    label: "Gives up after exceeding the retry limit, rather than retrying forever",
    source: `
      const alwaysFails = async () => { throw new Error("permanent failure"); };
      const uploader2 = createChunkedUploader(alwaysFails, 2);
      let threw = false;
      try {
        await uploader2.uploadFile(["chunk1"]);
      } catch (e) {
        threw = true;
      }
      assertEqual(threw, true);
    `,
  },
  {
    label: "Uploads chunks sequentially in the correct order",
    source: `
      const uploadedOrder = [];
      const trackOrder = async (chunk, index) => { uploadedOrder.push(index); };
      const uploader3 = createChunkedUploader(trackOrder, 3);
      await uploader3.uploadFile(["a", "b", "c"]);
      assertEqual(uploadedOrder, [0, 1, 2]);
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 4
const ANALYTICS_EVENT_BATCHER_TESTS: SandboxTest[] = [
  {
    label: "Flushes automatically once the batch reaches maxBatchSize",
    source: `
      assert(typeof createEventBatcher === "function", "createEventBatcher is not defined");
      let flushCalls = [];
      const batcher = createEventBatcher((batch) => flushCalls.push(batch), { maxBatchSize: 3, flushIntervalMs: 10000 });
      batcher.track("a");
      batcher.track("b");
      batcher.track("c");
      assertEqual(flushCalls.length, 1);
      assertEqual(flushCalls[0], ["a", "b", "c"]);
      batcher.stop();
    `,
  },
  {
    label: "Flushes on the interval even when the batch isn't full",
    source: `
      let flushCalls2 = [];
      const batcher2 = createEventBatcher((batch) => flushCalls2.push(batch), { maxBatchSize: 10, flushIntervalMs: 30 });
      batcher2.track("a");
      batcher2.track("b");
      await delay(60);
      assertEqual(flushCalls2.length, 1);
      assertEqual(flushCalls2[0], ["a", "b"]);
      batcher2.stop();
    `,
  },
  {
    label: "stop() flushes whatever's left instead of dropping it",
    source: `
      let flushCalls3 = [];
      const batcher3 = createEventBatcher((batch) => flushCalls3.push(batch), { maxBatchSize: 10, flushIntervalMs: 10000 });
      batcher3.track("a");
      batcher3.stop();
      assertEqual(flushCalls3, [["a"]]);
    `,
  },
];

const QRCODE_LOGIN_POLLING_TESTS: SandboxTest[] = [
  {
    label: "Transitions to approved as soon as the status check confirms it",
    source: `
      assert(typeof createQrLoginPoller === "function", "createQrLoginPoller is not defined");
      const checkStatus = async () => "approved";
      const poller = createQrLoginPoller(checkStatus, { intervalMs: 20, timeoutMs: 1000 });
      await delay(40);
      assertEqual(poller.getStatus(), "approved");
    `,
  },
  {
    label: "Expires after the timeout without ever being approved",
    source: `
      const neverApproves = async () => "pending";
      const poller2 = createQrLoginPoller(neverApproves, { intervalMs: 20, timeoutMs: 50 });
      await delay(90);
      assertEqual(poller2.getStatus(), "expired");
    `,
  },
  {
    label: "Actually stops polling once resolved, not just changing the reported status",
    source: `
      let checkCount = 0;
      const countingCheck = async () => { checkCount++; return "approved"; };
      createQrLoginPoller(countingCheck, { intervalMs: 15, timeoutMs: 1000 });
      await delay(30);
      const countAfterApproval = checkCount;
      await delay(60);
      assertEqual(checkCount, countAfterApproval);
    `,
  },
];

const REALTIME_NOTIFICATION_TRANSPORT_TESTS: SandboxTest[] = [
  {
    label: "Stays on the primary transport when nothing goes wrong",
    source: `
      assert(typeof createResilientNotifier === "function", "createResilientNotifier is not defined");
      const cleanConnect = ({ onMessage, onError }) => {};
      const notifier = createResilientNotifier(cleanConnect, async () => [], () => {});
      assertEqual(notifier.isUsingFallback(), false);
      notifier.stop();
    `,
  },
  {
    label: "Switches to the polling fallback on a transport error",
    source: `
      let capturedOnError;
      const failingConnect = ({ onMessage, onError }) => { capturedOnError = onError; };
      const notifier2 = createResilientNotifier(failingConnect, async () => [], () => {});
      capturedOnError();
      assertEqual(notifier2.isUsingFallback(), true);
      notifier2.stop();
    `,
  },
  {
    label: "The fallback path actually delivers messages, not just flags that it's active",
    source: `
      let capturedOnError2;
      const failingConnect2 = ({ onMessage, onError }) => { capturedOnError2 = onError; };
      const delivered = [];
      const pollFallback = async () => ["hello"];
      const notifier3 = createResilientNotifier(failingConnect2, pollFallback, (msg) => delivered.push(msg));
      capturedOnError2();
      await delay(40);
      assert(delivered.includes("hello"), "expected the fallback poll to deliver a message");
      notifier3.stop();
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 5
const UNDO_REDO_COMMAND_STACK_TESTS: SandboxTest[] = [
  {
    label: "undo() reverts to the previous committed state",
    source: `
      assert(typeof createUndoRedoStack === "function", "createUndoRedoStack is not defined");
      const stack = createUndoRedoStack("initial");
      stack.commit("a");
      stack.commit("b");
      const reverted = stack.undo();
      assertEqual(reverted, "a");
    `,
  },
  {
    label: "redo() re-applies the state that was just undone",
    source: `
      const stack2 = createUndoRedoStack("initial");
      stack2.commit("a");
      stack2.commit("b");
      stack2.undo();
      const redone = stack2.redo();
      assertEqual(redone, "b");
    `,
  },
  {
    label: "A new commit after undoing discards the redo branch entirely",
    source: `
      const stack3 = createUndoRedoStack("initial");
      stack3.commit("a");
      stack3.commit("b");
      stack3.undo();
      stack3.commit("c");
      const afterRedo = stack3.redo();
      assertEqual(afterRedo, "c");
    `,
  },
];

const KANBAN_BOARD_REORDER_TESTS: SandboxTest[] = [
  {
    label: "Reorders correctly within a single column",
    source: `
      assert(typeof moveCard === "function", "moveCard is not defined");
      const board = { todo: ["a", "b", "c"] };
      const result = moveCard(board, { fromColumn: "todo", fromIndex: 0, toColumn: "todo", toIndex: 2 });
      assertEqual(result.todo, ["b", "c", "a"]);
    `,
  },
  {
    label: "Moves a card across two different columns",
    source: `
      const board2 = { todo: ["a", "b"], done: [] };
      const result2 = moveCard(board2, { fromColumn: "todo", fromIndex: 0, toColumn: "done", toIndex: 0 });
      assertEqual(result2.todo, ["b"]);
      assertEqual(result2.done, ["a"]);
    `,
  },
  {
    label: "Preserves the card's full content through the move, not just its position",
    source: `
      const board3 = { todo: [{ id: 5, text: "Fix bug" }], done: [] };
      const result3 = moveCard(board3, { fromColumn: "todo", fromIndex: 0, toColumn: "done", toIndex: 0 });
      assertEqual(result3.done[0], { id: 5, text: "Fix bug" });
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 6
const TODO_APP_FILTER_VISIBILITY_TESTS: SandboxTest[] = [
  {
    label: "The 'all' filter shows everything",
    source: `
      assert(typeof getVisibleTodos === "function", "getVisibleTodos is not defined");
      const state = { todos: [{ id: 1, text: "a", done: true }, { id: 2, text: "b", done: false }], filter: "all" };
      assertEqual(getVisibleTodos(state).length, 2);
    `,
  },
  {
    label: "The 'active' filter shows only incomplete todos",
    source: `
      const state2 = { todos: [{ id: 1, text: "a", done: true }, { id: 2, text: "b", done: false }], filter: "active" };
      const visible2 = getVisibleTodos(state2);
      assertEqual(visible2.length, 1);
      assertEqual(visible2[0].id, 2);
    `,
  },
  {
    label: "The 'completed' filter shows only finished todos",
    source: `
      const state3 = { todos: [{ id: 1, text: "a", done: true }, { id: 2, text: "b", done: false }], filter: "completed" };
      const visible3 = getVisibleTodos(state3);
      assertEqual(visible3.length, 1);
      assertEqual(visible3[0].id, 1);
    `,
  },
];

const COURSE_PLATFORM_PROGRESS_TRACKING_TESTS: SandboxTest[] = [
  {
    label: "Computes the correct percentage for a single concept",
    source: `
      assert(typeof calculateCourseProgress === "function", "calculateCourseProgress is not defined");
      const concepts = [{ id: "c1", tabs: { understand: true, challenge: true, interview: false, build: false } }];
      assertEqual(calculateCourseProgress(concepts), 50);
    `,
  },
  {
    label: "Returns 0 (not NaN) when there's nothing to track",
    source: `
      assertEqual(calculateCourseProgress([]), 0);
    `,
  },
  {
    label: "Reaches exactly 100 once every tab across every concept is done",
    source: `
      const concepts2 = [
        { id: "c1", tabs: { understand: true, challenge: true } },
        { id: "c2", tabs: { understand: true, challenge: true } },
      ];
      assertEqual(calculateCourseProgress(concepts2), 100);
    `,
  },
];

const MULTISTEP_FORM_WIZARD_NAVIGATION_TESTS: SandboxTest[] = [
  {
    label: "Advances to the next step when validation passes",
    source: `
      assert(typeof createWizard === "function", "createWizard is not defined");
      const steps = [
        { id: "email", validate: (d) => !!d.email, next: null },
        { id: "password", validate: () => true, next: null },
      ];
      const wizard = createWizard(steps);
      const advanced = wizard.goNext({ email: "a@b.com" });
      assertEqual(advanced, true);
      assertEqual(wizard.getCurrentStep().id, "password");
    `,
  },
  {
    label: "Blocks advancement when validation fails",
    source: `
      const steps2 = [
        { id: "email", validate: (d) => !!d.email, next: null },
        { id: "password", validate: () => true, next: null },
      ];
      const wizard2 = createWizard(steps2);
      const advanced2 = wizard2.goNext({});
      assertEqual(advanced2, false);
      assertEqual(wizard2.getCurrentStep().id, "email");
    `,
  },
  {
    label: "Supports branching to a specific step, not just linear progression",
    source: `
      const steps3 = [
        { id: "accountType", validate: () => true, next: (d) => (d.type === "business" ? "companyInfo" : "personalInfo") },
        { id: "personalInfo", validate: () => true, next: null },
        { id: "companyInfo", validate: () => true, next: null },
      ];
      const wizard3 = createWizard(steps3);
      wizard3.goNext({ type: "business" });
      assertEqual(wizard3.getCurrentStep().id, "companyInfo");
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 7
const MESSENGER_OPTIMISTIC_SEND_TESTS: SandboxTest[] = [
  {
    label: "Shows the message immediately, before the server confirms it",
    source: `
      assert(typeof createMessageSender === "function", "createMessageSender is not defined");
      const slowServer = (text) => new Promise((resolve) => setTimeout(() => resolve({ id: "real-1" }), 50));
      const sender = createMessageSender(slowServer);
      const sendPromise = sender.sendMessage("hi");
      assertEqual(sender.getMessages()[0].status, "sending");
      await sendPromise;
    `,
  },
  {
    label: "Reconciles the temp id with the server's real id on success",
    source: `
      const successServer = async (text) => ({ id: "real-42" });
      const sender2 = createMessageSender(successServer);
      await sender2.sendMessage("hi");
      assertEqual(sender2.getMessages()[0].id, "real-42");
      assertEqual(sender2.getMessages()[0].status, "sent");
    `,
  },
  {
    label: "A failed send stays visible for retry, instead of disappearing",
    source: `
      const failingServer = async () => { throw new Error("network error"); };
      const sender3 = createMessageSender(failingServer);
      await sender3.sendMessage("hi");
      assertEqual(sender3.getMessages().length, 1);
      assertEqual(sender3.getMessages()[0].status, "failed");
    `,
  },
];

const VIDEO_CONFERENCE_GRID_LAYOUT_TESTS: SandboxTest[] = [
  {
    label: "A single participant gets a 1x1 grid",
    source: `
      assert(typeof getGridLayout === "function", "getGridLayout is not defined");
      assertEqual(getGridLayout(1), { rows: 1, cols: 1 });
    `,
  },
  {
    label: "A perfect square count gets an exactly-square grid",
    source: `
      assertEqual(getGridLayout(4), { rows: 2, cols: 2 });
    `,
  },
  {
    label: "A non-square count still fits everyone, favoring extra columns over extra rows",
    source: `
      assertEqual(getGridLayout(5), { rows: 2, cols: 3 });
    `,
  },
];

const COLLAB_EDITOR_OT_TRANSFORM_TESTS: SandboxTest[] = [
  {
    label: "An insert before the position shifts it forward",
    source: `
      assert(typeof transformPosition === "function", "transformPosition is not defined");
      const result = transformPosition(10, { type: "insert", position: 3, text: "hello" });
      assertEqual(result, 15);
    `,
  },
  {
    label: "A delete before the position shifts it backward",
    source: `
      const result2 = transformPosition(10, { type: "delete", position: 2, length: 3 });
      assertEqual(result2, 7);
    `,
  },
  {
    label: "An edit that happens after the position doesn't affect it at all",
    source: `
      const result3 = transformPosition(5, { type: "insert", position: 8, text: "xyz" });
      assertEqual(result3, 5);
    `,
  },
];

// Practice — standalone Frontend System Design Roadmap, Stage 8
const TWITTER_OPTIMISTIC_LIKE_TOGGLE_TESTS: SandboxTest[] = [
  {
    label: "Updates the UI optimistically, before the server confirms",
    source: `
      assert(typeof createLikeToggler === "function", "createLikeToggler is not defined");
      const slowServer = () => new Promise((resolve) => setTimeout(resolve, 50));
      const toggler = createLikeToggler(slowServer);
      const togglePromise = toggler.toggleLike();
      assertEqual(toggler.getLiked(), true);
      assertEqual(toggler.getCount(), 1);
      await togglePromise;
    `,
  },
  {
    label: "Rolls back cleanly to the exact prior state on failure",
    source: `
      const failingServer = async () => { throw new Error("failed"); };
      const toggler2 = createLikeToggler(failingServer);
      await toggler2.toggleLike();
      assertEqual(toggler2.getLiked(), false);
      assertEqual(toggler2.getCount(), 0);
    `,
  },
  {
    label: "Leaves the optimistic update in place once the server confirms it",
    source: `
      const successServer = async () => {};
      const toggler3 = createLikeToggler(successServer);
      await toggler3.toggleLike();
      assertEqual(toggler3.getLiked(), true);
      assertEqual(toggler3.getCount(), 1);
    `,
  },
];

const FACEBOOK_NOTIFICATION_GROUPING_TESTS: SandboxTest[] = [
  {
    label: "Groups notifications sharing the same type and target",
    source: `
      assert(typeof groupNotifications === "function", "groupNotifications is not defined");
      const notifications = [
        { type: "like", targetId: "post1", actor: "Alice" },
        { type: "like", targetId: "post1", actor: "Bob" },
        { type: "like", targetId: "post1", actor: "Carol" },
      ];
      const groups = groupNotifications(notifications);
      assertEqual(groups.length, 1);
      assertEqual(groups[0].actors, ["Alice", "Bob", "Carol"]);
    `,
  },
  {
    label: "Keeps different notification types on the same target separate",
    source: `
      const notifications2 = [
        { type: "like", targetId: "post1", actor: "Alice" },
        { type: "comment", targetId: "post1", actor: "Bob" },
      ];
      const groups2 = groupNotifications(notifications2);
      assertEqual(groups2.length, 2);
    `,
  },
  {
    label: "Keeps notifications on different targets separate, even with the same type",
    source: `
      const notifications3 = [
        { type: "like", targetId: "post1", actor: "Alice" },
        { type: "like", targetId: "post2", actor: "Bob" },
      ];
      const groups3 = groupNotifications(notifications3);
      assertEqual(groups3.length, 2);
    `,
  },
];

const INSTAGRAM_STORIES_SEEN_TRACKER_TESTS: SandboxTest[] = [
  {
    label: "Detects unseen stories for a viewer with no view history",
    source: `
      assert(typeof createStoriesTracker === "function", "createStoriesTracker is not defined");
      const tracker = createStoriesTracker();
      assertEqual(tracker.hasUnseenStories("user1", ["s1", "s2", "s3"]), true);
    `,
  },
  {
    label: "Flips to false once every story has been marked seen",
    source: `
      const tracker2 = createStoriesTracker();
      tracker2.markSeen("user1", "s1");
      tracker2.markSeen("user1", "s2");
      assertEqual(tracker2.hasUnseenStories("user1", ["s1", "s2"]), false);
    `,
  },
  {
    label: "Tracks seen-state independently per user",
    source: `
      const tracker3 = createStoriesTracker();
      tracker3.markSeen("user1", "s1");
      assertEqual(tracker3.hasUnseenStories("user1", ["s1"]), false);
      assertEqual(tracker3.hasUnseenStories("user2", ["s1"]), true);
    `,
  },
];

const YOUTUBE_ADAPTIVE_BITRATE_SELECTION_TESTS: SandboxTest[] = [
  {
    label: "Picks the highest quality that fits within the bandwidth safety margin",
    source: `
      assert(typeof selectBitrate === "function", "selectBitrate is not defined");
      const levels = [
        { label: "240p", requiredKbps: 400 },
        { label: "480p", requiredKbps: 1000 },
        { label: "720p", requiredKbps: 2500 },
        { label: "1080p", requiredKbps: 4000 },
      ];
      assertEqual(selectBitrate(5000, levels), "1080p");
    `,
  },
  {
    label: "Falls back to the lowest quality level when bandwidth is very constrained",
    source: `
      const levels2 = [
        { label: "240p", requiredKbps: 400 },
        { label: "480p", requiredKbps: 1000 },
      ];
      assertEqual(selectBitrate(500, levels2), "240p");
    `,
  },
];

const CODESANDBOX_FILE_TREE_CRUD_TESTS: SandboxTest[] = [
  {
    label: "Creates a top-level file",
    source: `
      assert(typeof createFileTree === "function", "createFileTree is not defined");
      const fs = createFileTree();
      fs.createFile("index.js");
      assert(fs.getTree().children.some((c) => c.name === "index.js"), "expected index.js at the root");
    `,
  },
  {
    label: "Creates a file nested inside an existing folder",
    source: `
      const fs2 = createFileTree();
      fs2.createFile("src", "folder");
      fs2.createFile("src/app.js");
      const srcFolder = fs2.getTree().children.find((c) => c.name === "src");
      assert(srcFolder.children.some((c) => c.name === "app.js"), "expected app.js inside src");
    `,
  },
  {
    label: "Deletes exactly the targeted file, leaving its siblings alone",
    source: `
      const fs3 = createFileTree();
      fs3.createFile("a.js");
      fs3.createFile("b.js");
      fs3.deleteFile("a.js");
      const names = fs3.getTree().children.map((c) => c.name);
      assert(!names.includes("a.js"), "expected a.js to be deleted");
      assert(names.includes("b.js"), "expected b.js to remain");
    `,
  },
];

const SPREADSHEET_FORMULA_DEPENDENCY_ORDER_TESTS: SandboxTest[] = [
  {
    label: "Orders a chain of dependencies correctly",
    source: `
      assert(typeof getRecalculationOrder === "function", "getRecalculationOrder is not defined");
      const order = getRecalculationOrder({ A: [], B: ["A"], C: ["B"] });
      assert(order.indexOf("A") < order.indexOf("B"), "expected A before B");
      assert(order.indexOf("B") < order.indexOf("C"), "expected B before C");
    `,
  },
  {
    label: "Handles independent cells that don't depend on each other",
    source: `
      const order2 = getRecalculationOrder({ A: [], B: [] });
      assertEqual(order2.length, 2);
      assert(order2.includes("A") && order2.includes("B"), "expected both cells present");
    `,
  },
  {
    label: "A shared dependency is only recalculated once, before all of its dependents",
    source: `
      const order3 = getRecalculationOrder({ A: [], B: ["A"], C: ["A"] });
      assertEqual(order3.filter((id) => id === "A").length, 1);
      assert(order3.indexOf("A") < order3.indexOf("B"), "expected A before B");
      assert(order3.indexOf("A") < order3.indexOf("C"), "expected A before C");
    `,
  },
];

const ANALYTICS_DASHBOARD_TIME_BUCKETING_TESTS: SandboxTest[] = [
  {
    label: "Averages points that fall within the same time window",
    source: `
      assert(typeof bucketDataPoints === "function", "bucketDataPoints is not defined");
      const points = [
        { timestamp: 100, value: 10 },
        { timestamp: 200, value: 20 },
        { timestamp: 300, value: 30 },
      ];
      const buckets = bucketDataPoints(points, 1000);
      assertEqual(buckets.length, 1);
      assertEqual(buckets[0].average, 20);
    `,
  },
  {
    label: "Keeps points in different time windows in separate buckets",
    source: `
      const points2 = [
        { timestamp: 100, value: 10 },
        { timestamp: 1500, value: 50 },
      ];
      const buckets2 = bucketDataPoints(points2, 1000);
      assertEqual(buckets2.length, 2);
    `,
  },
  {
    label: "Returns buckets in chronological order regardless of input order",
    source: `
      const points3 = [
        { timestamp: 2500, value: 5 },
        { timestamp: 100, value: 10 },
      ];
      const buckets3 = bucketDataPoints(points3, 1000);
      assert(buckets3[0].timestamp < buckets3[1].timestamp, "expected chronological order");
    `,
  },
];

const TEST_SPECS: Record<string, SandboxTest[]> = {
  "implement-debounce": DEBOUNCE_TESTS,
  "specificity-calculator": SPECIFICITY_TESTS,
  "virtual-list": VIRTUAL_LIST_TESTS,
  "classify-hoisting-access": CLASSIFY_HOISTING_ACCESS_TESTS,
  "implement-loose-equals": IMPLEMENT_LOOSE_EQUALS_TESTS,
  "implement-once": IMPLEMENT_ONCE_TESTS,
  "implement-my-map": IMPLEMENT_MY_MAP_TESTS,
  "implement-update-item": IMPLEMENT_UPDATE_ITEM_TESTS,
  "implement-my-bind": IMPLEMENT_MY_BIND_TESTS,
  "implement-inherit": IMPLEMENT_INHERIT_TESTS,
  "predict-execution-order": PREDICT_EXECUTION_ORDER_TESTS,
  "implement-promise-all": IMPLEMENT_PROMISE_ALL_TESTS,
  "implement-curry": IMPLEMENT_CURRY_TESTS,
  "implement-take": IMPLEMENT_TAKE_TESTS,
  "find-leaked-listeners": FIND_LEAKED_LISTENERS_TESTS,
  "classify-dom-vs-bom": CLASSIFY_DOM_VS_BOM_TESTS,
  "event-propagation-order": EVENT_PROPAGATION_ORDER_TESTS,
  "pick-storage-mechanism": PICK_STORAGE_MECHANISM_TESTS,
  "classify-style-change": CLASSIFY_STYLE_CHANGE_TESTS,
  "evaluate-cors-request": EVALUATE_CORS_REQUEST_TESTS,
  "sanitize-html-input": SANITIZE_HTML_INPUT_TESTS,
  "trace-connection-steps": TRACE_CONNECTION_STEPS_TESTS,
  "stale-while-revalidate": STALE_WHILE_REVALIDATE_TESTS,
  "clone-worker-message": CLONE_WORKER_MESSAGE_TESTS,
  "build-create-element": CREATE_ELEMENT_TESTS,
  "should-run-effect": SHOULD_RUN_EFFECT_TESTS,
  "detect-controlled-switch": DETECT_CONTROLLED_SWITCH_TESTS,
  "implement-merge-refs": MERGE_REFS_TESTS,
  "implement-context-store": CONTEXT_STORE_TESTS,
  "implement-map-children": MAP_CHILDREN_TESTS,
  "detect-conditional-hook-call": CONDITIONAL_HOOK_CALL_TESTS,
  "find-error-boundary": FIND_ERROR_BOUNDARY_TESTS,
  "implement-shallow-equal": SHALLOW_EQUAL_TESTS,
  "schedule-updates-by-priority": SCHEDULE_UPDATES_TESTS,
  "find-shared-state-ancestor": FIND_SHARED_STATE_ANCESTOR_TESTS,
  "rendered-box-width": RENDERED_BOX_WIDTH_TESTS,
  "resolve-css-length": RESOLVE_CSS_LENGTH_TESTS,
  "resolve-cascade-winner": RESOLVE_CASCADE_WINNER_TESTS,
  "distribute-flex-space": DISTRIBUTE_FLEX_SPACE_TESTS,
  "resolve-stacking-order": RESOLVE_STACKING_ORDER_TESTS,
  "resolve-container-query": RESOLVE_CONTAINER_QUERY_TESTS,
  "resolve-custom-property": RESOLVE_CUSTOM_PROPERTY_TESTS,
  "implement-has-matcher": IMPLEMENT_HAS_MATCHER_TESTS,
  "classify-animation-cost": CLASSIFY_ANIMATION_COST_TESTS,
  "narrow-unknown-to-number": SAFE_PARSE_NUMBER_TESTS,
  "merge-declarations": MERGE_DECLARATIONS_TESTS,
  "create-typed-stack": CREATE_TYPED_STACK_TESTS,
  "pick-keys": PICK_KEYS_TESTS,
  "narrow-value-length": NARROW_VALUE_LENGTH_TESTS,
  "discriminated-union-reducer": DISCRIMINATED_UNION_REDUCER_TESTS,
  "map-values": MAP_VALUES_TESTS,
  "match-event-name-pattern": MATCH_EVENT_NAME_PATTERN_TESTS,
  "choose-semantic-tag": CHOOSE_SEMANTIC_TAG_TESTS,
  "decide-alt-text": DECIDE_ALT_TEXT_TESTS,
  "contrast-ratio-checker": CONTRAST_RATIO_CHECKER_TESTS,
  "compute-tab-order": COMPUTE_TAB_ORDER_TESTS,
  "link-field-error": LINK_FIELD_ERROR_TESTS,
  "live-region-announcer-queue": LIVE_REGION_ANNOUNCER_QUEUE_TESTS,
  "combobox-keyboard-handler": COMBOBOX_KEYBOARD_HANDLER_TESTS,
  "mini-a11y-linter": MINI_A11Y_LINTER_TESTS,
  "pick-image-format-and-size": PICK_IMAGE_FORMAT_AND_SIZE_TESTS,
  "split-shared-chunks": SPLIT_SHARED_CHUNKS_TESTS,
  "classify-resource-loading-strategy": CLASSIFY_RESOURCE_LOADING_STRATEGY_TESTS,
  "rate-core-web-vitals": RATE_CORE_WEB_VITALS_TESTS,
  "find-flame-chart-bottleneck": FIND_FLAME_CHART_BOTTLENECK_TESTS,
  "render-streamed-content-order": RENDER_STREAMED_CONTENT_ORDER_TESTS,
  "check-performance-budget": CHECK_PERFORMANCE_BUDGET_TESTS,
  "find-circular-component-imports": FIND_CIRCULAR_COMPONENT_IMPORTS_TESTS,
  "plan-fetch-waterfall": PLAN_FETCH_WATERFALL_TESTS,
  "pick-realtime-transport": PICK_REALTIME_TRANSPORT_TESTS,
  "merge-feed-page": MERGE_FEED_PAGE_TESTS,
  "transform-insert-operations": TRANSFORM_INSERT_OPERATIONS_TESTS,
  "classify-architecture-fit": CLASSIFY_ARCHITECTURE_FIT_TESTS,
  "classify-state-layer": CLASSIFY_STATE_LAYER_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 1
  "improve-full-name-formatter": IMPROVE_FULL_NAME_FORMATTER_TESTS,
  "classify-nullish-value": CLASSIFY_NULLISH_VALUE_TESTS,
  "custom-object-is": CUSTOM_OBJECT_IS_TESTS,
  "custom-object-create": CUSTOM_OBJECT_CREATE_TESTS,
  "custom-new-operator": CUSTOM_NEW_OPERATOR_TESTS,
  "custom-spy-on": CUSTOM_SPY_ON_TESTS,
  "detect-data-type": DETECT_DATA_TYPE_TESTS,
  "custom-function-call": CUSTOM_FUNCTION_CALL_TESTS,
  "custom-function-apply": CUSTOM_FUNCTION_APPLY_TESTS,
  "custom-function-bind": CUSTOM_FUNCTION_BIND_TESTS,
  "custom-instanceof": CUSTOM_INSTANCEOF_TESTS,
  "es5-class-extends": ES5_CLASS_EXTENDS_TESTS,
  "mini-expect-matcher": MINI_EXPECT_MATCHER_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 2
  "build-counter-object": BUILD_COUNTER_OBJECT_TESTS,
  "build-count-function": BUILD_COUNT_FUNCTION_TESTS,
  "implement-pipe-composition": IMPLEMENT_PIPE_COMPOSITION_TESTS,
  "lodash-once-polyfill": LODASH_ONCE_POLYFILL_TESTS,
  "curry-classic": CURRY_CLASSIC_TESTS,
  "curry-with-placeholder": CURRY_WITH_PLACEHOLDER_TESTS,
  "chainable-curried-sum": CHAINABLE_CURRIED_SUM_TESTS,
  "general-memoization": GENERAL_MEMOIZATION_TESTS,
  "memoize-one": MEMOIZE_ONE_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 3
  "shuffle-array-fisher-yates": SHUFFLE_ARRAY_FISHER_YATES_TESTS,
  "array-prototype-filter-polyfill": ARRAY_PROTOTYPE_FILTER_POLYFILL_TESTS,
  "array-prototype-map-polyfill": ARRAY_PROTOTYPE_MAP_POLYFILL_TESTS,
  "array-prototype-reduce-polyfill": ARRAY_PROTOTYPE_REDUCE_POLYFILL_TESTS,
  "array-prototype-flat-polyfill": ARRAY_PROTOTYPE_FLAT_POLYFILL_TESTS,
  "array-prototype-flatmap-polyfill": ARRAY_PROTOTYPE_FLATMAP_POLYFILL_TESTS,
  "object-assign-polyfill": OBJECT_ASSIGN_POLYFILL_TESTS,
  "complete-assign-descriptors": COMPLETE_ASSIGN_DESCRIPTORS_TESTS,
  "object-group-by-polyfill": OBJECT_GROUP_BY_POLYFILL_TESTS,
  "lodash-get-polyfill": LODASH_GET_POLYFILL_TESTS,
  "lodash-set-polyfill": LODASH_SET_POLYFILL_TESTS,
  "lodash-partial-polyfill": LODASH_PARTIAL_POLYFILL_TESTS,
  "lodash-chunk-polyfill": LODASH_CHUNK_POLYFILL_TESTS,
  "lodash-is-equal-polyfill": LODASH_IS_EQUAL_POLYFILL_TESTS,
  "lodash-clone-deep-polyfill": LODASH_CLONE_DEEP_POLYFILL_TESTS,
  "immutability-update-helper": IMMUTABILITY_UPDATE_HELPER_TESTS,
  "mini-immer-produce": MINI_IMMER_PRODUCE_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 4
  "count-binary-ones": COUNT_BINARY_ONES_TESTS,
  "compress-string-rle": COMPRESS_STRING_RLE_TESTS,
  "first-duplicate-character": FIRST_DUPLICATE_CHARACTER_TESTS,
  "roman-to-integer": ROMAN_TO_INTEGER_TESTS,
  "integer-to-roman": INTEGER_TO_ROMAN_TESTS,
  "semver-compare": SEMVER_COMPARE_TESTS,
  "reorder-array-with-indexes": REORDER_ARRAY_WITH_INDEXES_TESTS,
  "most-frequent-character": MOST_FREQUENT_CHARACTER_TESTS,
  "add-commas-to-number": ADD_COMMAS_TO_NUMBER_TESTS,
  "hex-to-rgba": HEX_TO_RGBA_TESTS,
  "snake-to-camel-case": SNAKE_TO_CAMEL_CASE_TESTS,
  "negative-array-index-get": NEGATIVE_ARRAY_INDEX_GET_TESTS,
  "string-trim-polyfill": STRING_TRIM_POLYFILL_TESTS,
  "validate-ip-address": VALIDATE_IP_ADDRESS_TESTS,
  "remove-duplicate-characters": REMOVE_DUPLICATE_CHARACTERS_TESTS,
  "validate-number-string": VALIDATE_NUMBER_STRING_TESTS,
  "remove-characters": REMOVE_CHARACTERS_TESTS,
  "uncompress-string-rle": UNCOMPRESS_STRING_RLE_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 5
  "clear-all-timeout-registry": CLEAR_ALL_TIMEOUT_REGISTRY_TESTS,
  "basic-debounce-warmup": BASIC_DEBOUNCE_WARMUP_TESTS,
  "basic-throttle-warmup": BASIC_THROTTLE_WARMUP_TESTS,
  "debounce-leading-trailing": DEBOUNCE_LEADING_TRAILING_TESTS,
  "throttle-leading-trailing": THROTTLE_LEADING_TRAILING_TESTS,
  "fake-settimeout-clock": FAKE_SETTIMEOUT_CLOCK_TESTS,
  "build-set-interval-polyfill": BUILD_SET_INTERVAL_POLYFILL_TESTS,
  "fake-setinterval-clock": FAKE_SETINTERVAL_CLOCK_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 6
  "async-task-queue": ASYNC_TASK_QUEUE_TESTS,
  "node-style-promisify": NODE_STYLE_PROMISIFY_TESTS,
  "promise-race-polyfill": PROMISE_RACE_POLYFILL_TESTS,
  "race-with-timeout": RACE_WITH_TIMEOUT_TESTS,
  "build-custom-promise": BUILD_CUSTOM_PROMISE_TESTS,
  "promise-all-polyfill": PROMISE_ALL_POLYFILL_TESTS,
  "promise-all-settled-polyfill": PROMISE_ALL_SETTLED_POLYFILL_TESTS,
  "promise-any-polyfill": PROMISE_ANY_POLYFILL_TESTS,
  "promise-finally-polyfill": PROMISE_FINALLY_POLYFILL_TESTS,
  "async-sequence-helper": ASYNC_SEQUENCE_HELPER_TESTS,
  "async-parallel-helper": ASYNC_PARALLEL_HELPER_TESTS,
  "flatten-thunk": FLATTEN_THUNK_TESTS,
  "retry-promise-on-rejection": RETRY_PROMISE_ON_REJECTION_TESTS,
  "concurrency-limited-promises": CONCURRENCY_LIMITED_PROMISES_TESTS,
  "dedupe-concurrent-api-calls": DEDUPE_CONCURRENT_API_CALLS_TESTS,
  "fetch-all-paginated-pages": FETCH_ALL_PAGINATED_PAGES_TESTS,
  "message-channel-task-scheduler": MESSAGE_CHANNEL_TASK_SCHEDULER_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 7
  "reverse-linked-list": REVERSE_LINKED_LIST_TESTS,
  "detect-linked-list-cycle": DETECT_LINKED_LIST_CYCLE_TESTS,
  "invert-binary-tree": INVERT_BINARY_TREE_TESTS,
  "queue-using-two-stacks": QUEUE_USING_TWO_STACKS_TESTS,
  "stack-using-two-queues": STACK_USING_TWO_QUEUES_TESTS,
  "build-priority-queue": BUILD_PRIORITY_QUEUE_TESTS,
  "find-top-k-elements": FIND_TOP_K_ELEMENTS_TESTS,
  "build-trie-prefix-tree": BUILD_TRIE_PREFIX_TREE_TESTS,
  "serialize-deserialize-binary-tree": SERIALIZE_DESERIALIZE_BINARY_TREE_TESTS,
  "binary-tree-vertical-traversal": BINARY_TREE_VERTICAL_TRAVERSAL_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 8
  "sort-bubble": SORT_BUBBLE_TESTS,
  "sort-insertion": SORT_INSERTION_TESTS,
  "sort-selection": SORT_SELECTION_TESTS,
  "sort-merge": SORT_MERGE_TESTS,
  "sort-quick": SORT_QUICK_TESTS,
  "binary-search-basic": BINARY_SEARCH_BASIC_TESTS,
  "binary-search-first-index": BINARY_SEARCH_FIRST_INDEX_TESTS,
  "binary-search-last-index": BINARY_SEARCH_LAST_INDEX_TESTS,
  "binary-search-element-before": BINARY_SEARCH_ELEMENT_BEFORE_TESTS,
  "binary-search-element-after": BINARY_SEARCH_ELEMENT_AFTER_TESTS,
  "first-bad-version": FIRST_BAD_VERSION_TESTS,
  "median-of-two-sorted-arrays": MEDIAN_OF_TWO_SORTED_ARRAYS_TESTS,
  "is-prime-number": IS_PRIME_NUMBER_TESTS,
  "look-and-say-sequence": LOOK_AND_SAY_SEQUENCE_TESTS,
  "fibonacci-recursive": FIBONACCI_RECURSIVE_TESTS,
  "generate-fibonacci-sequence": GENERATE_FIBONACCI_SEQUENCE_TESTS,
  "two-numbers-sum-to-zero": TWO_NUMBERS_SUM_TO_ZERO_TESTS,
  "largest-difference": LARGEST_DIFFERENCE_TESTS,
  "merge-sorted-arrays": MERGE_SORTED_ARRAYS_TESTS,
  "intersection-sorted-arrays": INTERSECTION_SORTED_ARRAYS_TESTS,
  "intersection-unsorted-arrays": INTERSECTION_UNSORTED_ARRAYS_TESTS,
  "find-available-meeting-slots": FIND_AVAILABLE_MEETING_SLOTS_TESTS,
  "longest-unique-substring": LONGEST_UNIQUE_SUBSTRING_TESTS,
  "validate-parentheses-string": VALIDATE_PARENTHESES_STRING_TESTS,
  "pick-up-stones-game": PICK_UP_STONES_GAME_TESTS,
  "find-single-integer-xor": FIND_SINGLE_INTEGER_XOR_TESTS,
  "move-zeroes-in-place": MOVE_ZEROES_IN_PLACE_TESTS,
  "count-palindromic-substrings": COUNT_PALINDROMIC_SUBSTRINGS_TESTS,
  "angle-between-clock-hands": ANGLE_BETWEEN_CLOCK_HANDS_TESTS,
  "kth-largest-element": KTH_LARGEST_ELEMENT_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 9
  "implement-math-pow": IMPLEMENT_MATH_POW_TESTS,
  "implement-math-sqrt": IMPLEMENT_MATH_SQRT_TESTS,
  "implement-math-clz32": IMPLEMENT_MATH_CLZ32_TESTS,
  "bigint-string-addition": BIGINT_STRING_ADDITION_TESTS,
  "bigint-string-subtraction": BIGINT_STRING_SUBTRACTION_TESTS,
  "bigint-signed-addition": BIGINT_SIGNED_ADDITION_TESTS,
  "bigint-signed-subtraction": BIGINT_SIGNED_SUBTRACTION_TESTS,
  "bigint-string-multiplication": BIGINT_STRING_MULTIPLICATION_TESTS,
  "bigint-string-division": BIGINT_STRING_DIVISION_TESTS,
  "bigdecimal-addition": BIGDECIMAL_ADDITION_TESTS,
  "bigdecimal-subtraction": BIGDECIMAL_SUBTRACTION_TESTS,
  "bigdecimal-multiplication": BIGDECIMAL_MULTIPLICATION_TESTS,
  "bigdecimal-division": BIGDECIMAL_DIVISION_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 10
  "next-right-sibling": NEXT_RIGHT_SIBLING_TESTS,
  "traverse-dom-level-by-level": TRAVERSE_DOM_LEVEL_BY_LEVEL_TESTS,
  "jquery-style-dom-wrapper": JQUERY_STYLE_DOM_WRAPPER_TESTS,
  "create-dom-element-store": CREATE_DOM_ELEMENT_STORE_TESTS,
  "find-corresponding-dom-node": FIND_CORRESPONDING_DOM_NODE_TESTS,
  "two-way-input-binding": TWO_WAY_INPUT_BINDING_TESTS,
  "get-dom-tree-height": GET_DOM_TREE_HEIGHT_TESTS,
  "get-all-dom-tags": GET_ALL_DOM_TAGS_TESTS,
  "highlight-keywords-in-html": HIGHLIGHT_KEYWORDS_IN_HTML_TESTS,
  "extract-anchor-elements": EXTRACT_ANCHOR_ELEMENTS_TESTS,
  "implement-event-delegation": IMPLEMENT_EVENT_DELEGATION_TESTS,
  "previous-left-sibling": PREVIOUS_LEFT_SIBLING_TESTS,
  "generate-css-selector": GENERATE_CSS_SELECTOR_TESTS,
  "cookie-string-helper": COOKIE_STRING_HELPER_TESTS,
  "expiring-storage-cache": EXPIRING_STORAGE_CACHE_TESTS,
  "lru-cache-storage-eviction": LRU_CACHE_STORAGE_EVICTION_TESTS,
  "infinite-scroll-loader": INFINITE_SCROLL_LOADER_TESTS,
  "windowed-list-viewport": WINDOWED_LIST_VIEWPORT_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 11
  "build-event-emitter": BUILD_EVENT_EMITTER_TESTS,
  "build-pubsub-module": BUILD_PUBSUB_MODULE_TESTS,
  "template-string-interpolation": TEMPLATE_STRING_INTERPOLATION_TESTS,
  "extract-twitter-mentions": EXTRACT_TWITTER_MENTIONS_TESTS,
  "build-middleware-pipeline": BUILD_MIDDLEWARE_PIPELINE_TESTS,
  "implement-lazy-man": IMPLEMENT_LAZY_MAN_TESTS,
  "browser-history-undo-redo": BROWSER_HISTORY_UNDO_REDO_TESTS,
  "simple-client-side-router": SIMPLE_CLIENT_SIDE_ROUTER_TESTS,
  "build-observable-class": BUILD_OBSERVABLE_CLASS_TESTS,
  "observable-interval": OBSERVABLE_INTERVAL_TESTS,
  "observable-from-event": OBSERVABLE_FROM_EVENT_TESTS,
  "observable-transform-operators": OBSERVABLE_TRANSFORM_OPERATORS_TESTS,
  "observable-from-iterable": OBSERVABLE_FROM_ITERABLE_TESTS,
  "observable-subject": OBSERVABLE_SUBJECT_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 12
  "implement-btoa": IMPLEMENT_BTOA_TESTS,
  "implement-atob": IMPLEMENT_ATOB_TESTS,
  "implement-json-parse": IMPLEMENT_JSON_PARSE_TESTS,
  "serialize-non-json-types": SERIALIZE_NON_JSON_TYPES_TESTS,
  "implement-json-stringify": IMPLEMENT_JSON_STRINGIFY_TESTS,
  "implement-url-search-params": IMPLEMENT_URL_SEARCH_PARAMS_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 13
  "vdom-create-element-basics": VDOM_CREATE_ELEMENT_BASICS_TESTS,
  "lit-html-tagged-template": LIT_HTML_TAGGED_TEMPLATE_TESTS,
  "vdom-functional-component": VDOM_FUNCTIONAL_COMPONENT_TESTS,
  "implement-classnames-util": IMPLEMENT_CLASSNAMES_UTIL_TESTS,
  "uglify-css-class-names": UGLIFY_CSS_CLASS_NAMES_TESTS,
  "vdom-diff-patch-basics": VDOM_DIFF_PATCH_BASICS_TESTS,
  "jsx-create-element-pragma": JSX_CREATE_ELEMENT_PRAGMA_TESTS,
  "jsx-fragment-and-flatten": JSX_FRAGMENT_AND_FLATTEN_TESTS,
  "mini-react-hooks-runtime": MINI_REACT_HOOKS_RUNTIME_TESTS,
  "proxy-reactive-store": PROXY_REACTIVE_STORE_TESTS,

  // Practice — standalone JavaScript Interview Roadmap, Stage 14
  "decode-message-ways": DECODE_MESSAGE_WAYS_TESTS,
  "build-expression-tokenizer": BUILD_EXPRESSION_TOKENIZER_TESTS,
  "evaluate-arithmetic-expression": EVALUATE_ARITHMETIC_EXPRESSION_TESTS,
  "css-grid-autoplace-dense": CSS_GRID_AUTOPLACE_DENSE_TESTS,
  "css-grid-autoplace-sparse": CSS_GRID_AUTOPLACE_SPARSE_TESTS,
  "token-bucket-rate-limiter": TOKEN_BUCKET_RATE_LIMITER_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R1
  "react-counter-app": REACT_COUNTER_APP_TESTS,
  "controlled-vs-uncontrolled-input": CONTROLLED_VS_UNCONTROLLED_INPUT_TESTS,
  "todo-list-reducer-basics": TODO_LIST_REDUCER_BASICS_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R2
  "use-toggle-hook": USE_TOGGLE_HOOK_TESTS,
  "use-is-first-render-hook": USE_IS_FIRST_RENDER_HOOK_TESTS,
  "use-previous-hook": USE_PREVIOUS_HOOK_TESTS,
  "use-effect-once-hook": USE_EFFECT_ONCE_HOOK_TESTS,
  "use-is-mounted-hook": USE_IS_MOUNTED_HOOK_TESTS,
  "use-counter-hook": USE_COUNTER_HOOK_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R3
  "use-click-outside-hook": USE_CLICK_OUTSIDE_HOOK_TESTS,
  "use-event-listener-hook": USE_EVENT_LISTENER_HOOK_TESTS,
  "use-hover-hook": USE_HOVER_HOOK_TESTS,
  "use-focus-hook": USE_FOCUS_HOOK_TESTS,
  "use-on-screen-hook": USE_ON_SCREEN_HOOK_TESTS,
  "use-window-size-hook": USE_WINDOW_SIZE_HOOK_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R4
  "use-debounced-value-hook": USE_DEBOUNCED_VALUE_HOOK_TESTS,
  "use-throttled-value-hook": USE_THROTTLED_VALUE_HOOK_TESTS,
  "use-timeout-hook": USE_TIMEOUT_HOOK_TESTS,
  "use-interval-hook": USE_INTERVAL_HOOK_TESTS,
  "use-update-effect-hook": USE_UPDATE_EFFECT_HOOK_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R5
  "use-local-storage-hook": USE_LOCAL_STORAGE_HOOK_TESTS,
  "use-array-hook": USE_ARRAY_HOOK_TESTS,
  "phone-number-input-formatter": PHONE_NUMBER_INPUT_FORMATTER_TESTS,
  "use-form-hook": USE_FORM_HOOK_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R6
  "use-async-resource-hook": USE_ASYNC_RESOURCE_HOOK_TESTS,
  "use-swr-stale-while-revalidate": USE_SWR_STALE_WHILE_REVALIDATE_TESTS,
  "fetch-request-deduper": FETCH_REQUEST_DEDUPER_TESTS,
  "global-store-pubsub": GLOBAL_STORE_PUBSUB_TESTS,
  "valtio-style-proxy-store": VALTIO_STYLE_PROXY_STORE_TESTS,
  "create-redux-store": MINI_REDUX_STORE_TESTS,

  // Practice — standalone React Custom Hooks & Patterns Roadmap, Stage R7
  "usestate-from-scratch": USESTATE_FROM_SCRATCH_TESTS,
  "usereducer-from-scratch": USEREDUCER_FROM_SCRATCH_TESTS,
  "usememo-usecallback-from-scratch": USEMEMO_USECALLBACK_FROM_SCRATCH_TESTS,
  "higher-order-component-logger": HIGHER_ORDER_COMPONENT_LOGGER_TESTS,
  "compound-component-tabs": COMPOUND_COMPONENT_TABS_TESTS,
  "error-boundary-wrapper": ERROR_BOUNDARY_WRAPPER_TESTS,
  "imperative-handle-example": IMPERATIVE_HANDLE_EXAMPLE_TESTS,
  "list-virtualization-window-calc": LIST_VIRTUALIZATION_WINDOW_CALC_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 1
  "nested-checkboxes-tree-state": NESTED_CHECKBOXES_TREE_STATE_TESTS,
  "star-rating-widget": STAR_RATING_WIDGET_TESTS,
  "tic-tac-toe-game-logic": TIC_TAC_TOE_GAME_LOGIC_TESTS,
  "toast-notification-queue": TOAST_NOTIFICATION_QUEUE_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 2
  "poll-widget-vote-tally": POLL_WIDGET_VOTE_TALLY_TESTS,
  "slider-value-from-position": SLIDER_VALUE_FROM_POSITION_TESTS,
  "carousel-autoplay-index": CAROUSEL_AUTOPLAY_INDEX_TESTS,
  "command-palette-fuzzy-match": COMMAND_PALETTE_FUZZY_MATCH_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 3
  "typeahead-debounced-search": TYPEAHEAD_DEBOUNCED_SEARCH_TESTS,
  "infinite-scroll-pagination-trigger": INFINITE_SCROLL_PAGINATION_TRIGGER_TESTS,
  "api-progress-bar-aggregation": API_PROGRESS_BAR_AGGREGATION_TESTS,
  "chunked-file-upload-retry": CHUNKED_FILE_UPLOAD_RETRY_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 4
  "analytics-event-batcher": ANALYTICS_EVENT_BATCHER_TESTS,
  "qrcode-login-polling": QRCODE_LOGIN_POLLING_TESTS,
  "realtime-notification-transport": REALTIME_NOTIFICATION_TRANSPORT_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 5
  "undo-redo-command-stack": UNDO_REDO_COMMAND_STACK_TESTS,
  "kanban-board-reorder": KANBAN_BOARD_REORDER_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 6
  "todo-app-filter-visibility": TODO_APP_FILTER_VISIBILITY_TESTS,
  "course-platform-progress-tracking": COURSE_PLATFORM_PROGRESS_TRACKING_TESTS,
  "multistep-form-wizard-navigation": MULTISTEP_FORM_WIZARD_NAVIGATION_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 7
  "messenger-optimistic-send": MESSENGER_OPTIMISTIC_SEND_TESTS,
  "video-conference-grid-layout": VIDEO_CONFERENCE_GRID_LAYOUT_TESTS,
  "collab-editor-ot-transform": COLLAB_EDITOR_OT_TRANSFORM_TESTS,

  // Practice — standalone Frontend System Design Roadmap, Stage 8
  "twitter-optimistic-like-toggle": TWITTER_OPTIMISTIC_LIKE_TOGGLE_TESTS,
  "facebook-notification-grouping": FACEBOOK_NOTIFICATION_GROUPING_TESTS,
  "instagram-stories-seen-tracker": INSTAGRAM_STORIES_SEEN_TRACKER_TESTS,
  "youtube-adaptive-bitrate-selection": YOUTUBE_ADAPTIVE_BITRATE_SELECTION_TESTS,
  "codesandbox-file-tree-crud": CODESANDBOX_FILE_TREE_CRUD_TESTS,
  "spreadsheet-formula-dependency-order": SPREADSHEET_FORMULA_DEPENDENCY_ORDER_TESTS,
  "analytics-dashboard-time-bucketing": ANALYTICS_DASHBOARD_TIME_BUCKETING_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 1
  "box-sizing-content-vs-border": BOX_SIZING_CONTENT_VS_BORDER_TESTS,
  "center-element-vertically": CENTER_ELEMENT_VERTICALLY_TESTS,
  "center-element-both-axes": CENTER_ELEMENT_BOTH_AXES_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 2
  "truncate-single-line-ellipsis": TRUNCATE_SINGLE_LINE_ELLIPSIS_TESTS,
  "truncate-multiline-ellipsis": TRUNCATE_MULTILINE_ELLIPSIS_TESTS,
  "fluid-typography-clamp": FLUID_TYPOGRAPHY_CLAMP_TESTS,
  "fluid-font-size-vw": FLUID_FONT_SIZE_VW_TESTS,
  "gradient-text-background-clip": GRADIENT_TEXT_BACKGROUND_CLIP_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 3
  "flex-layout-fixed-flexible-fixed": FLEX_LAYOUT_FIXED_FLEXIBLE_FIXED_TESTS,
  "flex-equal-height-cards": FLEX_EQUAL_HEIGHT_CARDS_TESTS,
  "flex-two-column-layout": FLEX_TWO_COLUMN_LAYOUT_TESTS,
  "flex-sticky-footer": FLEX_STICKY_FOOTER_TESTS,
  "flex-child-min-width-zero-truncation": FLEX_CHILD_MIN_WIDTH_ZERO_TRUNCATION_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 4
  "grid-layout-basic-columns": GRID_LAYOUT_BASIC_COLUMNS_TESTS,
  "grid-layout-sidebar-main": GRID_LAYOUT_SIDEBAR_MAIN_TESTS,
  "grid-responsive-auto-fit-minmax": GRID_RESPONSIVE_AUTO_FIT_MINMAX_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 5
  "css-multi-column-text": CSS_MULTI_COLUMN_TEXT_TESTS,
  "three-column-feed-layout": THREE_COLUMN_FEED_LAYOUT_TESTS,
  "holy-grail-layout": HOLY_GRAIL_LAYOUT_TESTS,
  "responsive-product-card-grid": RESPONSIVE_PRODUCT_CARD_GRID_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 6
  "golden-ratio-rectangle": GOLDEN_RATIO_RECTANGLE_TESTS,
  "css-triangle-border-trick": CSS_TRIANGLE_BORDER_TRICK_TESTS,
  "custom-checkbox-style": CUSTOM_CHECKBOX_STYLE_TESTS,
  "css-toggle-switch": CSS_TOGGLE_SWITCH_TESTS,
  "css-close-button-x": CSS_CLOSE_BUTTON_X_TESTS,
  "css-doughnut-chart": CSS_DOUGHNUT_CHART_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 7
  "object-fit-image-fitting": OBJECT_FIT_IMAGE_FITTING_TESTS,
  "responsive-image-aspect-ratio": RESPONSIVE_IMAGE_ASPECT_RATIO_TESTS,
  "background-size-cover-vs-contain": BACKGROUND_SIZE_COVER_VS_CONTAIN_TESTS,

  // Practice — standalone CSS Interview Question Roadmap, Stage 8
  "native-input-accent-color": NATIVE_INPUT_ACCENT_COLOR_TESTS,
  "css-counter-list-numbering": CSS_COUNTER_LIST_NUMBERING_TESTS,
  "nth-child-row-striping": NTH_CHILD_ROW_STRIPING_TESTS,
  "selection-pseudo-element-style": SELECTION_PSEUDO_ELEMENT_STYLE_TESTS,
  "custom-scrollbar-styling": CUSTOM_SCROLLBAR_STYLING_TESTS,
  "css-specificity-cascade-order": CSS_SPECIFICITY_CASCADE_ORDER_TESTS,
  "sub-pixel-half-border-trick": SUB_PIXEL_HALF_BORDER_TRICK_TESTS,
  "scrollable-centered-modal": SCROLLABLE_CENTERED_MODAL_TESTS,
};

export function getTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

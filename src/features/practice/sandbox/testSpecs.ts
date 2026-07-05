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
};

export function getTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

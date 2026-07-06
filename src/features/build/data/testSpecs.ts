import type { SandboxTest } from "@/lib/sandbox";

// Executable assertions per project brief slug — the *real* tests Run Tests
// checks against (the DB `test_cases` are display labels only, same contract
// as Practice's testSpecs.ts). Informational only here: Mark Build Complete
// never gates on these passing (see architect notes, Feature 26) — a real
// project's UI can't be exhaustively unit-tested, so each brief is designed
// around one exported pure function that *is* testable.

const KANBAN_BOARD_TESTS: SandboxTest[] = [
  {
    label: "Moves a card to a different column",
    source: `
      assert(typeof moveCard === "function", "moveCard is not defined");
      assertEqual(
        moveCard({ todo: ["a", "b"], doing: [] }, "todo", "doing", "a", 0),
        { todo: ["b"], doing: ["a"] },
      );
    `,
  },
  {
    label: "Reorders within the same column",
    source: `
      assertEqual(
        moveCard({ todo: ["a", "b", "c"] }, "todo", "todo", "c", 0),
        { todo: ["c", "a", "b"] },
      );
    `,
  },
  {
    label: "Does not mutate the input",
    source: `
      const columns = { todo: ["a", "b"], doing: [] };
      moveCard(columns, "todo", "doing", "a", 0);
      assertEqual(columns, { todo: ["a", "b"], doing: [] }, "the original columns object must stay untouched");
    `,
  },
  {
    label: "Clamps an out-of-range index to the end",
    source: `
      assertEqual(
        moveCard({ todo: ["a"], doing: ["x", "y"] }, "todo", "doing", "a", 99),
        { todo: [], doing: ["x", "y", "a"] },
      );
    `,
  },
];

const ASYNC_TASK_RUNNER_TESTS: SandboxTest[] = [
  {
    label: "Returns results in original order",
    source: `
      assert(typeof runWithConcurrency === "function", "runWithConcurrency is not defined");
      const tasks = [
        () => delay(30).then(() => "a"),
        () => delay(10).then(() => "b"),
        () => delay(20).then(() => "c"),
      ];
      assertEqual(await runWithConcurrency(tasks, 3), ["a", "b", "c"]);
    `,
  },
  {
    label: "Never runs more than `limit` tasks concurrently",
    source: `
      let active = 0;
      let maxActive = 0;
      const tasks = Array.from({ length: 6 }, () => async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await delay(20);
        active--;
        return true;
      });
      await runWithConcurrency(tasks, 2);
      assert(maxActive <= 2, "no more than 2 tasks should run concurrently, but saw " + maxActive);
    `,
  },
  {
    label: "Runs all tasks, not just the first `limit`",
    source: `
      let calls = 0;
      const tasks = Array.from({ length: 5 }, () => async () => { calls++; await delay(5); return calls; });
      await runWithConcurrency(tasks, 2);
      assertEqual(calls, 5, "all 5 tasks should run, not just the first \`limit\`");
    `,
  },
  {
    label: "Resolves once every task settles",
    source: `
      let settled = false;
      const tasks = [
        async () => { await delay(5); return 1; },
        async () => { await delay(50); settled = true; return 2; },
      ];
      const results = await runWithConcurrency(tasks, 2);
      assert(settled, "runWithConcurrency must not resolve before every task settles");
      assertEqual(results[1], 2);
    `,
  },
];

const RENDER_BLOCKING_ANALYZER_TESTS: SandboxTest[] = [
  {
    label: "A plain stylesheet blocks rendering",
    source: `
      assert(typeof getRenderBlockingResources === "function", "getRenderBlockingResources is not defined");
      const resources = [{ type: "style", src: "a.css" }];
      assertEqual(getRenderBlockingResources(resources), resources);
    `,
  },
  {
    label: "A print-only stylesheet does not block rendering",
    source: `
      assertEqual(getRenderBlockingResources([{ type: "style", src: "print.css", media: "print" }]), []);
    `,
  },
  {
    label: "A synchronous script blocks rendering",
    source: `
      const resources = [{ type: "script", src: "a.js" }];
      assertEqual(getRenderBlockingResources(resources), resources);
    `,
  },
  {
    label: "async/defer scripts do not block rendering",
    source: `
      assertEqual(
        getRenderBlockingResources([
          { type: "script", src: "a.js", async: true },
          { type: "script", src: "b.js", defer: true },
        ]),
        [],
      );
    `,
  },
];

const SPECIFICITY_CONFLICT_FINDER_TESTS: SandboxTest[] = [
  {
    label: "A later rule with higher specificity overrides an earlier one",
    source: `
      assert(typeof findOverriddenRules === "function", "findOverriddenRules is not defined");
      assertEqual(
        findOverriddenRules([
          { selector: ".btn", property: "color" },
          { selector: "#cta", property: "color" },
        ]),
        [0],
      );
    `,
  },
  {
    label: "An earlier rule with higher specificity is not overridden by a later weaker one",
    source: `
      assertEqual(
        findOverriddenRules([
          { selector: "#cta", property: "color" },
          { selector: ".btn", property: "color" },
        ]),
        [1],
      );
    `,
  },
  {
    label: "Equal specificity — the later rule wins (source order tiebreak)",
    source: `
      assertEqual(
        findOverriddenRules([
          { selector: ".btn", property: "color" },
          { selector: ".primary", property: "color" },
        ]),
        [0],
      );
    `,
  },
  {
    label: "Different properties never conflict",
    source: `
      assertEqual(
        findOverriddenRules([
          { selector: ".btn", property: "color" },
          { selector: ".btn", property: "background" },
        ]),
        [],
      );
    `,
  },
];

const LAZY_CONFIG_LOADER_TESTS: SandboxTest[] = [
  {
    label: "Reading an unset key throws",
    source: `
      assert(typeof createLazyConfig === "function", "createLazyConfig is not defined");
      const config = createLazyConfig();
      let threw = false;
      try { config.get("apiUrl"); } catch (e) { threw = true; }
      assert(threw, "get() on a key that was never set() must throw");
    `,
  },
  {
    label: "Reading a set key returns its value",
    source: `
      const config = createLazyConfig();
      config.set("apiUrl", "https://api.example.com");
      assertEqual(config.get("apiUrl"), "https://api.example.com");
    `,
  },
  {
    label: "Keys are tracked independently",
    source: `
      const config = createLazyConfig();
      config.set("a", 1);
      let threw = false;
      try { config.get("b"); } catch (e) { threw = true; }
      assert(threw, "an unset key must still throw even though a different key was set");
    `,
  },
];

const STRICT_QUERY_PARAM_PARSER_TESTS: SandboxTest[] = [
  {
    label: "Numeric strings convert to numbers",
    source: `
      assert(typeof parseParams === "function", "parseParams is not defined");
      assertEqual(parseParams({ page: "2" }), { page: 2 });
    `,
  },
  {
    label: "'false' converts to the real boolean false, not a truthy string",
    source: `assertEqual(parseParams({ active: "false" }), { active: false });`,
  },
  {
    label: "Non-numeric, non-boolean strings stay strings",
    source: `assertEqual(parseParams({ name: "Ada" }), { name: "Ada" });`,
  },
];

const UNDO_REDO_HISTORY_TESTS: SandboxTest[] = [
  {
    label: "Undo walks back through history in order",
    source: `
      assert(typeof createHistory === "function", "createHistory is not defined");
      const h = createHistory(0);
      h.set(1); h.set(2);
      h.undo(); h.undo();
      assertEqual(h.current(), 0);
    `,
  },
  {
    label: "Redo restores what undo just removed",
    source: `
      const h = createHistory(0);
      h.set(1);
      h.undo();
      h.redo();
      assertEqual(h.current(), 1);
    `,
  },
  {
    label: "A new set() after undo clears the redo stack",
    source: `
      const h = createHistory(0);
      h.set(1); h.set(2);
      h.undo();
      h.set(5);
      h.redo();
      assertEqual(h.current(), 5, "redo should be a no-op after a new set() following undo");
    `,
  },
];

const MIDDLEWARE_PIPELINE_TESTS: SandboxTest[] = [
  {
    label: "Runs every middleware in order when each calls next",
    source: `
      assert(typeof createPipeline === "function", "createPipeline is not defined");
      const order = [];
      const pipeline = createPipeline();
      pipeline.use(function (input, next) { order.push(1); next(); });
      pipeline.use(function (input, next) { order.push(2); next(); });
      pipeline.use(function (input, next) { order.push(3); });
      pipeline.run({});
      assertEqual(order, [1, 2, 3]);
    `,
  },
  {
    label: "Not calling next() stops the chain",
    source: `
      const order = [];
      const pipeline = createPipeline();
      pipeline.use(function (input, next) { order.push("a"); });
      pipeline.use(function (input, next) { order.push("b"); next(); });
      pipeline.run({});
      assertEqual(order, ["a"], "middleware after a non-calling next() must never run");
    `,
  },
  {
    label: "Each run() call is independent",
    source: `
      const order = [];
      const pipeline = createPipeline();
      pipeline.use(function (input, next) { order.push(input.id); next(); });
      pipeline.run({ id: 1 });
      pipeline.run({ id: 2 });
      assertEqual(order, [1, 2]);
    `,
  },
];

const SHOPPING_CART_REDUCER_TESTS: SandboxTest[] = [
  {
    label: "Adding a new item",
    source: `
      assert(typeof cartReducer === "function", "cartReducer is not defined");
      assertEqual(
        cartReducer({ items: [] }, { type: "ADD_ITEM", id: "sku-1" }),
        { items: [{ id: "sku-1", qty: 1 }] },
      );
    `,
  },
  {
    label: "Adding an existing item increments quantity",
    source: `
      assertEqual(
        cartReducer({ items: [{ id: "sku-1", qty: 1 }] }, { type: "ADD_ITEM", id: "sku-1" }),
        { items: [{ id: "sku-1", qty: 2 }] },
      );
    `,
  },
  {
    label: "Removing an item",
    source: `
      assertEqual(
        cartReducer(
          { items: [{ id: "sku-1", qty: 1 }, { id: "sku-2", qty: 1 }] },
          { type: "REMOVE_ITEM", id: "sku-1" },
        ),
        { items: [{ id: "sku-2", qty: 1 }] },
      );
    `,
  },
  {
    label: "Never mutates the input state",
    source: `
      const state = { items: [{ id: "sku-1", qty: 1 }] };
      const snapshot = JSON.parse(JSON.stringify(state));
      cartReducer(state, { type: "ADD_ITEM", id: "sku-1" });
      assertEqual(state, snapshot, "the original state must be unchanged");
    `,
  },
];

const AUTO_BOUND_EVENT_EMITTER_TESTS: SandboxTest[] = [
  {
    label: "A bare method reference still gets the right this, with no manual .bind() by the caller",
    source: `
      assert(typeof createEmitter === "function", "createEmitter is not defined");
      function Widget(name) { this.name = name; this.seen = null; }
      Widget.prototype.handleLogin = function (user) { this.seen = this.name + ":" + user; };
      const w = new Widget("dash");
      const emitter = createEmitter();
      emitter.on("login", w.handleLogin, w);
      emitter.emit("login", "ada");
      assertEqual(w.seen, "dash:ada");
    `,
  },
  {
    label: "Independent context per handler, even for the same event",
    source: `
      function Widget(name) { this.name = name; this.seen = null; }
      Widget.prototype.handleLogin = function (user) { this.seen = this.name + ":" + user; };
      const w1 = new Widget("one");
      const w2 = new Widget("two");
      const emitter = createEmitter();
      emitter.on("login", w1.handleLogin, w1);
      emitter.on("login", w2.handleLogin, w2);
      emitter.emit("login", "x");
      assertEqual(w1.seen, "one:x");
      assertEqual(w2.seen, "two:x");
    `,
  },
  {
    label: "context is optional — omitting it behaves like a plain function call",
    source: `
      let called = false;
      const emitter = createEmitter();
      emitter.on("go", function () { called = true; });
      emitter.emit("go");
      assert(called, "the handler should still run when no context is passed");
    `,
  },
  {
    label: "Emitting an unregistered event is a safe no-op",
    source: `
      const emitter = createEmitter();
      let threw = false;
      try { emitter.emit("nothing-registered"); } catch (e) { threw = true; }
      assert(!threw, "emitting an event with no handlers should not throw");
    `,
  },
];

const SHAPE_HIERARCHY_WITHOUT_CLASS_TESTS: SandboxTest[] = [
  {
    label: "Circle computes its own area formula",
    source: `
      assert(typeof Circle === "function", "Circle is not defined");
      const c = new Circle(2);
      assertEqual(c.describe(), "circle has area 12.57");
    `,
  },
  {
    label: "Rectangle computes its own area formula",
    source: `
      const r = new Rectangle(2, 3);
      assertEqual(r.describe(), "rectangle has area 6.00");
    `,
  },
  {
    label: "Both subclasses are recognized as Shape instances",
    source: `
      assert(new Circle(2) instanceof Shape, "Circle instances must be recognized as Shape instances");
      assert(new Rectangle(2, 3) instanceof Shape, "Rectangle instances must be recognized as Shape instances");
    `,
  },
];

const MINIMAL_MODULE_RESOLVER_TESTS: SandboxTest[] = [
  {
    label: "A defined module's exports are usable",
    source: `
      assert(typeof createModuleSystem === "function", "createModuleSystem is not defined");
      const mod = createModuleSystem();
      mod.define("math", function (require, module) {
        module.exports = { double: function (n) { return n * 2; } };
      });
      assertEqual(mod.require("math").double(5), 10);
    `,
  },
  {
    label: "A module's factory runs only once, ever",
    source: `
      let runs = 0;
      const mod = createModuleSystem();
      mod.define("counter", function (require, module) {
        runs++;
        module.exports = { runs: runs };
      });
      const first = mod.require("counter");
      const second = mod.require("counter");
      assertEqual(runs, 1, "the factory must run only once");
      assert(first === second, "require() must return the exact same cached exports object");
    `,
  },
  {
    label: "Modules can require each other",
    source: `
      const mod = createModuleSystem();
      mod.define("b", function (require, module) { module.exports = { value: 42 }; });
      mod.define("a", function (require, module) { module.exports = { fromB: require("b").value }; });
      assertEqual(mod.require("a").fromB, 42);
    `,
  },
];

const RETRY_WITH_BACKOFF_TESTS: SandboxTest[] = [
  {
    label: "Succeeds immediately when fn doesn't fail",
    source: `
      assert(typeof retryWithBackoff === "function", "retryWithBackoff is not defined");
      let calls = 0;
      const result = await retryWithBackoff(
        async function () { calls++; return "ok"; },
        { maxAttempts: 3, baseDelay: 5 },
      );
      assertEqual(result, "ok");
      assertEqual(calls, 1, "should not retry when the first call succeeds");
    `,
  },
  {
    label: "Retries through failures up to the attempt limit",
    source: `
      let calls = 0;
      const result = await retryWithBackoff(
        async function () {
          calls++;
          if (calls < 3) throw new Error("fail");
          return "recovered";
        },
        { maxAttempts: 3, baseDelay: 5 },
      );
      assertEqual(result, "recovered");
      assertEqual(calls, 3);
    `,
  },
  {
    label: "Rejects with the final error once every attempt fails",
    source: `
      let calls = 0;
      let rejected = false;
      let message = "";
      try {
        await retryWithBackoff(
          async function () { calls++; throw new Error("always fails"); },
          { maxAttempts: 3, baseDelay: 5 },
        );
      } catch (err) {
        rejected = true;
        message = err.message;
      }
      assert(rejected, "should reject when every attempt fails");
      assertEqual(calls, 3);
      assertEqual(message, "always fails");
    `,
  },
];

const LIVE_SEARCH_AUTOCOMPLETE_TESTS: SandboxTest[] = [
  {
    label: "Debounces rapid search() calls",
    source: `
      assert(typeof createSearchController === "function", "createSearchController is not defined");
      let fetchCalls = 0;
      let lastResults = null;
      const controller = createSearchController(async function (q) { fetchCalls++; return [q]; });
      controller.onResults(function (r) { lastResults = r; });
      controller.search("i");
      controller.search("in");
      controller.search("ind");
      await delay(350);
      assertEqual(fetchCalls, 1, "only one fetch should fire for a rapid burst of search() calls");
      assertEqual(lastResults, ["ind"]);
    `,
  },
  {
    label: "Out-of-order responses don't overwrite newer results",
    source: `
      let capturedResults = null;
      const controller = createSearchController(async function (q) {
        if (q === "ind") { await delay(500); return ["ind-result"]; }
        await delay(10);
        return ["india-result"];
      });
      controller.onResults(function (r) { capturedResults = r; });
      controller.search("ind");
      await delay(350);
      controller.search("india");
      await delay(700);
      assertEqual(
        capturedResults,
        ["india-result"],
        "the stale, slower 'ind' response must never overwrite the newer 'india' result",
      );
    `,
  },
  {
    label: "A single, non-stale search still resolves normally",
    source: `
      let capturedResults = null;
      const controller = createSearchController(async function (q) { return ["only-" + q]; });
      controller.onResults(function (r) { capturedResults = r; });
      controller.search("solo");
      await delay(350);
      assertEqual(capturedResults, ["only-solo"]);
    `,
  },
];

const DATA_TRANSFORMATION_PIPELINE_TESTS: SandboxTest[] = [
  {
    label: "Parses date strings into Date objects",
    source: `
      assert(typeof cleanRecords === "function", "cleanRecords is not defined");
      const result = cleanRecords([{ id: "1", status: "ACTIVE", createdAt: "2024-01-01" }]);
      assert(result[0].createdAt instanceof Date, "createdAt should be converted to a real Date object");
    `,
  },
  {
    label: "Normalizes status casing",
    source: `
      const result = cleanRecords([{ id: "1", status: "ACTIVE", createdAt: "2024-01-01" }]);
      assertEqual(result[0].status, "active");
    `,
  },
  {
    label: "Filters out records missing an id",
    source: `
      const result = cleanRecords([
        { id: "1", status: "active", createdAt: "2024-01-01" },
        { status: "done", createdAt: "2024-01-02" },
      ]);
      assertEqual(result.length, 1, "the record with no id must be filtered out");
      assertEqual(result[0].id, "1");
    `,
  },
];

const LEAK_SAFE_SUBSCRIPTION_MANAGER_TESTS: SandboxTest[] = [
  {
    label: "Runs every registered cleanup",
    source: `
      assert(typeof createSubscriptionManager === "function", "createSubscriptionManager is not defined");
      const calls = [];
      const manager = createSubscriptionManager();
      manager.add(function () { calls.push(1); });
      manager.add(function () { calls.push(2); });
      manager.add(function () { calls.push(3); });
      manager.cleanupAll();
      assertEqual(calls, [1, 2, 3]);
    `,
  },
  {
    label: "cleanupAll() clears the registry so it can't double-run",
    source: `
      const calls = [];
      const manager = createSubscriptionManager();
      manager.add(function () { calls.push("x"); });
      manager.cleanupAll();
      manager.cleanupAll();
      assertEqual(calls, ["x"], "a second cleanupAll() call must not re-run anything");
    `,
  },
  {
    label: "The manager is reusable after clearing",
    source: `
      const calls = [];
      const manager = createSubscriptionManager();
      manager.add(function () { calls.push("first"); });
      manager.cleanupAll();
      manager.add(function () { calls.push("second"); });
      manager.cleanupAll();
      assertEqual(calls, ["first", "second"]);
    `,
  },
];

const PAGINATED_DATA_LOADER_TESTS: SandboxTest[] = [
  {
    label: "Lazily yields items across multiple pages",
    source: `
      assert(typeof paginate === "function", "paginate is not defined");
      const pages = { 1: ["a", "b"], 2: ["c"], 3: [] };
      async function fetchPage(p) { return pages[p] || []; }
      const collected = [];
      for await (const item of paginate(fetchPage)) { collected.push(item); }
      assertEqual(collected, ["a", "b", "c"]);
    `,
  },
  {
    label: "Stops fetching further pages once the consumer stops iterating",
    source: `
      const fetchedPages = [];
      async function fetchPage(p) {
        fetchedPages.push(p);
        if (p === 1) return ["x", "y", "z"];
        return ["never"];
      }
      const collected = [];
      for await (const item of paginate(fetchPage)) {
        collected.push(item);
        if (collected.length >= 2) break;
      }
      assertEqual(collected, ["x", "y"]);
      assertEqual(fetchedPages, [1], "no page beyond the first should be fetched once the consumer stops early");
    `,
  },
  {
    label: "Handles a fully empty result set",
    source: `
      async function fetchPage() { return []; }
      const collected = [];
      for await (const item of paginate(fetchPage)) { collected.push(item); }
      assertEqual(collected, []);
    `,
  },
];

// Phase 10 (Feature 42) — Browser Internals

const ENVIRONMENT_REPORT_GENERATOR_TESTS: SandboxTest[] = [
  {
    label: "Groups a DOM and a BOM entry correctly",
    source: `
      assert(typeof buildEnvironmentReport === "function", "buildEnvironmentReport is not defined");
      assertEqual(
        buildEnvironmentReport([
          { name: "document.title", value: "Home" },
          { name: "navigator.userAgent", value: "Mozilla" },
        ]),
        { dom: { "document.title": "Home" }, bom: { "navigator.userAgent": "Mozilla" } },
      );
    `,
  },
  {
    label: "Handles an empty entry list",
    source: `assertEqual(buildEnvironmentReport([]), { dom: {}, bom: {} });`,
  },
  {
    label: "A window.document reference is still DOM",
    source: `
      assertEqual(
        buildEnvironmentReport([{ name: "window.document.body", value: "BODY" }]),
        { dom: { "window.document.body": "BODY" }, bom: {} },
      );
    `,
  },
  {
    label: "Multiple BOM entries are grouped together",
    source: `
      assertEqual(
        buildEnvironmentReport([
          { name: "window.location.href", value: "https://x.com" },
          { name: "history.length", value: 3 },
        ]),
        { dom: {}, bom: { "window.location.href": "https://x.com", "history.length": 3 } },
      );
    `,
  },
];

const DELEGATED_CLICK_ROUTER_TESTS: SandboxTest[] = [
  {
    label: "A direct target match invokes its own handler",
    source: `
      assert(typeof createDelegatedClickHandler === "function", "createDelegatedClickHandler is not defined");
      const calls = [];
      const dispatch = createDelegatedClickHandler({
        item: function () { calls.push("item"); },
        list: function () { calls.push("list"); },
      });
      const result = dispatch([["item", "selected"], ["list"], ["app"]]);
      assertEqual(result, "item");
      assertEqual(calls, ["item"]);
    `,
  },
  {
    label: "Falls back to a matching ancestor",
    source: `
      const calls = [];
      const dispatch = createDelegatedClickHandler({
        item: function () { calls.push("item"); },
        list: function () { calls.push("list"); },
      });
      const result = dispatch([["row"], ["list"], ["app"]]);
      assertEqual(result, "list");
      assertEqual(calls, ["list"]);
    `,
  },
  {
    label: "Returns null when nothing matches",
    source: `
      const calls = [];
      const dispatch = createDelegatedClickHandler({
        item: function () { calls.push("item"); },
      });
      const result = dispatch([["row"], ["container"], ["app"]]);
      assertEqual(result, null);
      assertEqual(calls, []);
    `,
  },
  {
    label: "The nearest match wins over a farther one",
    source: `
      const calls = [];
      const dispatch = createDelegatedClickHandler({
        item: function () { calls.push("item"); },
        list: function () { calls.push("list"); },
      });
      const result = dispatch([["item"], ["list"], ["app"]]);
      assertEqual(result, "item");
      assertEqual(calls, ["item"]);
    `,
  },
];

const TTL_AWARE_STORAGE_WRAPPER_TESTS: SandboxTest[] = [
  {
    label: "Returns a value before it expires",
    source: `
      assert(typeof createTTLStore === "function", "createTTLStore is not defined");
      let now = 0;
      const store = createTTLStore(function () { return now; });
      store.set("a", "hello", 100);
      assertEqual(store.get("a"), "hello");
    `,
  },
  {
    label: "Returns undefined once the value has expired",
    source: `
      let now = 0;
      const store = createTTLStore(function () { return now; });
      store.set("a", "hello", 100);
      now = 150;
      assertEqual(store.get("a"), undefined);
    `,
  },
  {
    label: "Keys expire independently of one another",
    source: `
      let now = 0;
      const store = createTTLStore(function () { return now; });
      store.set("short", "x", 10);
      store.set("long", "y", 1000);
      now = 50;
      assertEqual(store.get("short"), undefined);
      assertEqual(store.get("long"), "y");
    `,
  },
  {
    label: "Re-setting a key refreshes its expiration",
    source: `
      let now = 0;
      const store = createTTLStore(function () { return now; });
      store.set("a", "first", 10);
      now = 5;
      store.set("a", "second", 10);
      now = 12;
      assertEqual(store.get("a"), "second");
    `,
  },
];

const SAME_ORIGIN_REQUEST_GUARD_TESTS: SandboxTest[] = [
  {
    label: "isAllowed is true for a listed origin",
    source: `
      assert(typeof createOriginGuard === "function", "createOriginGuard is not defined");
      const guard = createOriginGuard(["https://app.com"]);
      assertEqual(guard.isAllowed("https://app.com"), true);
    `,
  },
  {
    label: "isAllowed is false for an unlisted origin",
    source: `
      const guard = createOriginGuard(["https://app.com"]);
      assertEqual(guard.isAllowed("https://evil.com"), false);
    `,
  },
  {
    label: "guardedFetch runs requestFn when the origin is allowed",
    source: `
      const guard = createOriginGuard(["https://app.com"]);
      const result = await guard.guardedFetch("https://app.com", async function () { return "data"; });
      assertEqual(result, "data");
    `,
  },
  {
    label: "guardedFetch never calls requestFn for a disallowed origin",
    source: `
      const guard = createOriginGuard(["https://app.com"]);
      let called = false;
      let threw = false;
      try {
        await guard.guardedFetch("https://evil.com", async function () { called = true; return "data"; });
      } catch (e) {
        threw = true;
      }
      assert(threw, "guardedFetch should throw for a disallowed origin");
      assert(!called, "requestFn must never run for a disallowed origin");
    `,
  },
];

const CSP_HEADER_BUILDER_TESTS: SandboxTest[] = [
  {
    label: "Formats a single directive with multiple values",
    source: `
      assert(typeof buildCspHeader === "function", "buildCspHeader is not defined");
      assertEqual(
        buildCspHeader({ "script-src": ["'self'", "https://cdn.com"] }),
        "script-src 'self' https://cdn.com",
      );
    `,
  },
  {
    label: "Joins multiple directives with '; ', preserving order",
    source: `
      assertEqual(
        buildCspHeader({ "script-src": ["'self'"], "object-src": ["'none'"] }),
        "script-src 'self'; object-src 'none'",
      );
    `,
  },
  {
    label: "An empty directives object produces an empty string",
    source: `assertEqual(buildCspHeader({}), "");`,
  },
  {
    label: "Formats a single-value directive",
    source: `assertEqual(buildCspHeader({ "frame-ancestors": ["'none'"] }), "frame-ancestors 'none'");`,
  },
];

const CONNECTION_COST_ESTIMATOR_TESTS: SandboxTest[] = [
  {
    label: "A full fresh HTTPS connection costs 5 round trips total",
    source: `
      assert(typeof estimateLatency === "function", "estimateLatency is not defined");
      assertEqual(
        estimateLatency(["dns-lookup", "tcp-handshake", "tls-handshake", "http-request"], 50),
        250,
      );
    `,
  },
  {
    label: "A single reused connection costs one round trip",
    source: `assertEqual(estimateLatency(["http-request"], 50), 50);`,
  },
  {
    label: "A plain HTTP fresh connection costs 2 round trips",
    source: `assertEqual(estimateLatency(["tcp-handshake", "http-request"], 100), 200);`,
  },
  {
    label: "No steps means zero estimated latency",
    source: `assertEqual(estimateLatency([], 50), 0);`,
  },
];

const CACHING_STRATEGY_PICKER_TESTS: SandboxTest[] = [
  {
    label: "A static JS asset uses cache-first",
    source: `
      assert(typeof pickCachingStrategy === "function", "pickCachingStrategy is not defined");
      assertEqual(pickCachingStrategy({ url: "/assets/app.js" }), "cache-first");
    `,
  },
  {
    label: "An API route uses network-first",
    source: `assertEqual(pickCachingStrategy({ url: "/api/users" }), "network-first");`,
  },
  {
    label: "A regular page navigation uses stale-while-revalidate",
    source: `assertEqual(pickCachingStrategy({ url: "/dashboard" }), "stale-while-revalidate");`,
  },
  {
    label: "A static image asset uses cache-first",
    source: `assertEqual(pickCachingStrategy({ url: "/images/logo.svg" }), "cache-first");`,
  },
];

const WORKER_TASK_DISPATCHER_TESTS: SandboxTest[] = [
  {
    label: "Assigns workers round-robin",
    source: `
      assert(typeof createWorkerPool === "function", "createWorkerPool is not defined");
      const pool = createWorkerPool(3);
      const assignments = [pool.dispatch(), pool.dispatch(), pool.dispatch(), pool.dispatch(), pool.dispatch()];
      assertEqual(assignments, [0, 1, 2, 0, 1]);
    `,
  },
  {
    label: "Tracks each worker's task count correctly",
    source: `
      const pool = createWorkerPool(3);
      for (let i = 0; i < 5; i++) pool.dispatch();
      assertEqual(pool.getLoads(), [2, 2, 1]);
    `,
  },
  {
    label: "A single-worker pool always assigns index 0",
    source: `
      const pool = createWorkerPool(1);
      assertEqual([pool.dispatch(), pool.dispatch(), pool.dispatch()], [0, 0, 0]);
    `,
  },
  {
    label: "Splits evenly across an even number of dispatches",
    source: `
      const pool = createWorkerPool(2);
      for (let i = 0; i < 4; i++) pool.dispatch();
      assertEqual(pool.getLoads(), [2, 2]);
    `,
  },
];

const MINI_JSX_RENDERER_TESTS: SandboxTest[] = [
  {
    label: "An empty children array renders as an empty tag",
    source: `
      assert(typeof render === "function", "render is not defined");
      assertEqual(render({ type: "div", props: { children: [] } }), "<div></div>");
    `,
  },
  {
    label: "Attributes and a single text child both render correctly",
    source: `
      assertEqual(
        render({ type: "button", props: { className: "primary", children: "Save" } }),
        '<button className="primary">Save</button>',
      );
    `,
  },
  {
    label: "false/null children from conditional rendering are skipped entirely",
    source: `assertEqual(render({ type: "div", props: { children: [false, "a", null] } }), "<div>a</div>");`,
  },
  {
    label: "Nested vnodes render recursively",
    source: `
      assertEqual(
        render({ type: "div", props: { children: { type: "span", props: { children: "hi" } } } }),
        "<div><span>hi</span></div>",
      );
    `,
  },
];

const AUTOSAVE_DIRTY_FIELDS_TESTS: SandboxTest[] = [
  {
    label: "Only the field that actually changed is flagged dirty",
    source: `
      assert(typeof getDirtyFields === "function", "getDirtyFields is not defined");
      assertEqual(
        getDirtyFields({ name: "Ana", email: "a@x.com" }, { name: "Ana", email: "b@x.com" }),
        ["email"],
      );
    `,
  },
  {
    label: "Identical values produce no dirty fields",
    source: `assertEqual(getDirtyFields({ name: "Ana" }, { name: "Ana" }), []);`,
  },
  {
    label: "A brand-new field not present in the initial snapshot counts as dirty",
    source: `assertEqual(getDirtyFields({ name: "Ana" }, { name: "Ana", phone: "555" }), ["phone"]);`,
  },
  {
    label: "Object.is treats NaN as equal to itself, so it is not flagged dirty",
    source: `assertEqual(getDirtyFields({ age: NaN }, { age: NaN }), []);`,
  },
];

const MULTI_STEP_FORM_VALIDATOR_TESTS: SandboxTest[] = [
  {
    label: "A missing required field fails validation",
    source: `
      assert(typeof validateStep === "function", "validateStep is not defined");
      assertEqual(validateStep({ email: { required: true } }, { email: "" }), ["email"]);
    `,
  },
  {
    label: "A missing optional field never fails validation",
    source: `assertEqual(validateStep({ nickname: { required: false } }, {}), []);`,
  },
  {
    label: "A present value that fails its pattern is flagged",
    source: `assertEqual(validateStep({ zip: { required: true, pattern: /^\\d{5}$/ } }, { zip: "abc" }), ["zip"]);`,
  },
  {
    label: "A fully valid step returns no errors",
    source: `
      assertEqual(
        validateStep(
          { email: { required: true }, zip: { required: true, pattern: /^\\d{5}$/ } },
          { email: "a@x.com", zip: "94107" },
        ),
        [],
      );
    `,
  },
];

const FOCUS_TRAP_ELEMENTS_TESTS: SandboxTest[] = [
  {
    label: "A disabled element is excluded even though its tag is naturally focusable",
    source: `
      assert(typeof getFocusableElements === "function", "getFocusableElements is not defined");
      assertEqual(
        getFocusableElements([{ id: "btn", tag: "button", disabled: false }, { id: "input", tag: "input", disabled: true }]),
        ["btn"],
      );
    `,
  },
  {
    label: "A div with an explicit non-negative tabIndex is focusable",
    source: `assertEqual(getFocusableElements([{ id: "custom", tag: "div", tabIndex: 0 }]), ["custom"]);`,
  },
  {
    label: "tabIndex -1 removes an otherwise-focusable element from the tab order",
    source: `assertEqual(getFocusableElements([{ id: "removed", tag: "button", tabIndex: -1 }]), []);`,
  },
  {
    label: "Order is preserved, and non-focusable plain tags are dropped",
    source: `
      assertEqual(
        getFocusableElements([{ id: "a", tag: "input" }, { id: "b", tag: "div" }, { id: "c", tag: "a" }]),
        ["a", "c"],
      );
    `,
  },
];

const RESOLVE_THEME_VALUE_TESTS: SandboxTest[] = [
  {
    label: "The nearest provider's value wins when both define the key",
    source: `
      assert(typeof resolveThemeValue === "function", "resolveThemeValue is not defined");
      assertEqual(resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "accent"), "blue");
    `,
  },
  {
    label: "Falls through to a farther provider for a key the nearer one never set",
    source: `assertEqual(resolveThemeValue([{ accent: "blue" }, { accent: "red", bg: "white" }], "bg"), "white");`,
  },
  {
    label: "Returns undefined when no provider in the stack defines the key",
    source: `assertEqual(resolveThemeValue([{ accent: "blue" }], "font"), undefined);`,
  },
  {
    label: "Skips a nearer provider that doesn't define the key at all",
    source: `assertEqual(resolveThemeValue([{}, { accent: "red" }], "accent"), "red");`,
  },
];

const ACCORDION_TOGGLE_STATE_TESTS: SandboxTest[] = [
  {
    label: "Multiple-open mode adds a newly clicked section",
    source: `
      assert(typeof toggleAccordionItem === "function", "toggleAccordionItem is not defined");
      assertEqual(toggleAccordionItem(["a"], "b", true), ["a", "b"]);
    `,
  },
  {
    label: "Multiple-open mode removes an already-open section when clicked again",
    source: `assertEqual(toggleAccordionItem(["a", "b"], "a", true), ["b"]);`,
  },
  {
    label: "Single-open mode replaces the open section with the newly clicked one",
    source: `assertEqual(toggleAccordionItem(["a"], "b", false), ["b"]);`,
  },
  {
    label: "Single-open mode closes everything when the already-open section is clicked again",
    source: `assertEqual(toggleAccordionItem(["a"], "a", false), []);`,
  },
];

const USE_UNDO_REDUCER_TESTS: SandboxTest[] = [
  {
    label: "SET pushes the current present into past and clears future",
    source: `
      assert(typeof undoReducer === "function", "undoReducer is not defined");
      assertEqual(
        undoReducer({ past: [], present: "a", future: [] }, { type: "SET", payload: "b" }),
        { past: ["a"], present: "b", future: [] },
      );
    `,
  },
  {
    label: "UNDO restores the previous value and moves the current one into future",
    source: `
      assertEqual(
        undoReducer({ past: ["a"], present: "b", future: [] }, { type: "UNDO" }),
        { past: [], present: "a", future: ["b"] },
      );
    `,
  },
  {
    label: "REDO restores the next future value and pushes the current one back into past",
    source: `
      assertEqual(
        undoReducer({ past: [], present: "a", future: ["b"] }, { type: "REDO" }),
        { past: ["a"], present: "b", future: [] },
      );
    `,
  },
  {
    label: "UNDO with no history is a no-op",
    source: `
      assertEqual(
        undoReducer({ past: [], present: "a", future: [] }, { type: "UNDO" }),
        { past: [], present: "a", future: [] },
      );
    `,
  },
];

const RESOLVE_ERROR_FALLBACK_TESTS: SandboxTest[] = [
  {
    label: "A mapped error name resolves to its specific fallback",
    source: `
      assert(typeof getFallbackForError === "function", "getFallbackForError is not defined");
      assertEqual(
        getFallbackForError({ name: "NetworkError" }, { NetworkError: "retry-banner", default: "generic-error" }),
        "retry-banner",
      );
    `,
  },
  {
    label: "An unmapped error name falls back to the default entry",
    source: `
      assertEqual(
        getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner", default: "generic-error" }),
        "generic-error",
      );
    `,
  },
  {
    label: "With no default entry, an unmapped error resolves to undefined",
    source: `assertEqual(getFallbackForError({ name: "TypeError" }, { NetworkError: "retry-banner" }), undefined);`,
  },
  {
    label: "Different widgets' maps can route the same kind of error to different fallbacks",
    source: `
      assertEqual(
        getFallbackForError(
          { name: "AuthError" },
          { NetworkError: "retry-banner", AuthError: "login-prompt", default: "generic-error" },
        ),
        "login-prompt",
      );
    `,
  },
];

const DIFF_CHANGED_ROWS_TESTS: SandboxTest[] = [
  {
    label: "An unchanged row is not reported as changed",
    source: `
      assert(typeof getChangedRows === "function", "getChangedRows is not defined");
      assertEqual(getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }]), []);
    `,
  },
  {
    label: "A row with a changed field is reported",
    source: `assertEqual(getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 12 }]), ["1"]);`,
  },
  {
    label: "A brand-new row (no match in prevRows) is always reported",
    source: `
      assertEqual(
        getChangedRows([{ id: "1", price: 10 }], [{ id: "1", price: 10 }, { id: "2", price: 5 }]),
        ["2"],
      );
    `,
  },
  {
    label: "Only the actually-changed row is reported, not every row",
    source: `
      assertEqual(
        getChangedRows(
          [{ id: "1", price: 10 }, { id: "2", price: 5 }],
          [{ id: "1", price: 11 }, { id: "2", price: 5 }],
        ),
        ["1"],
      );
    `,
  },
];

const MERGE_TRANSITION_RESULTS_TESTS: SandboxTest[] = [
  {
    label: "While pending, the previous results are kept and marked stale",
    source: `
      assert(typeof mergeTransitionResults === "function", "mergeTransitionResults is not defined");
      assertEqual(mergeTransitionResults(["a", "b"], ["c"], true), { results: ["a", "b"], stale: true });
    `,
  },
  {
    label: "Once resolved, the incoming results replace the previous ones",
    source: `assertEqual(mergeTransitionResults(["a", "b"], ["c"], false), { results: ["c"], stale: false });`,
  },
  {
    label: "An empty previous result set stays empty while pending, rather than showing incoming results early",
    source: `assertEqual(mergeTransitionResults([], ["c"], true), { results: [], stale: true });`,
  },
  {
    label: "Resolving to identical results still clears the stale flag",
    source: `assertEqual(mergeTransitionResults(["a"], ["a"], false), { results: ["a"], stale: false });`,
  },
];

const MEMOIZED_SELECTOR_TESTS: SandboxTest[] = [
  {
    label: "Calling with the same arguments returns the cached result without recomputing",
    source: `
      assert(typeof createSelector === "function", "createSelector is not defined");
      let calls = 0;
      const selector = createSelector((items) => { calls++; return items.length; });
      const sameArray = [1, 2, 3];
      selector(sameArray);
      selector(sameArray);
      assertEqual(calls, 1, "the underlying selector should only run once for repeated identical arguments");
    `,
  },
  {
    label: "Calling with different arguments recomputes and returns the new result",
    source: `
      let calls = 0;
      const selector = createSelector((items) => { calls++; return items.length; });
      selector([1, 2]);
      selector([1, 2, 3]);
      assertEqual(calls, 2, "different argument references should recompute");
    `,
  },
  {
    label: "The memoized selector still returns the selector function's real result",
    source: `
      const selectCartTotal = createSelector((items) => items.reduce((sum, i) => sum + i.price, 0));
      assertEqual(selectCartTotal([{ price: 10 }, { price: 5 }]), 15);
    `,
  },
  {
    label: "A different argument order counts as different arguments",
    source: `
      let calls = 0;
      const selector = createSelector((a, b) => { calls++; return a + b; });
      selector(1, 2);
      selector(2, 1);
      assertEqual(calls, 2, "swapping argument order should be treated as a different call");
    `,
  },
];

const TEST_SPECS: Record<string, SandboxTest[]> = {
  "kanban-board": KANBAN_BOARD_TESTS,
  "async-task-runner": ASYNC_TASK_RUNNER_TESTS,
  "render-blocking-analyzer": RENDER_BLOCKING_ANALYZER_TESTS,
  "specificity-conflict-finder": SPECIFICITY_CONFLICT_FINDER_TESTS,
  "lazy-config-loader": LAZY_CONFIG_LOADER_TESTS,
  "strict-query-param-parser": STRICT_QUERY_PARAM_PARSER_TESTS,
  "undo-redo-history": UNDO_REDO_HISTORY_TESTS,
  "middleware-pipeline": MIDDLEWARE_PIPELINE_TESTS,
  "shopping-cart-reducer": SHOPPING_CART_REDUCER_TESTS,
  "auto-bound-event-emitter": AUTO_BOUND_EVENT_EMITTER_TESTS,
  "shape-hierarchy-without-class": SHAPE_HIERARCHY_WITHOUT_CLASS_TESTS,
  "minimal-module-resolver": MINIMAL_MODULE_RESOLVER_TESTS,
  "retry-with-backoff": RETRY_WITH_BACKOFF_TESTS,
  "live-search-autocomplete": LIVE_SEARCH_AUTOCOMPLETE_TESTS,
  "data-transformation-pipeline": DATA_TRANSFORMATION_PIPELINE_TESTS,
  "leak-safe-subscription-manager": LEAK_SAFE_SUBSCRIPTION_MANAGER_TESTS,
  "paginated-data-loader": PAGINATED_DATA_LOADER_TESTS,
  "environment-report-generator": ENVIRONMENT_REPORT_GENERATOR_TESTS,
  "delegated-click-router": DELEGATED_CLICK_ROUTER_TESTS,
  "ttl-aware-storage-wrapper": TTL_AWARE_STORAGE_WRAPPER_TESTS,
  "same-origin-request-guard": SAME_ORIGIN_REQUEST_GUARD_TESTS,
  "csp-header-builder": CSP_HEADER_BUILDER_TESTS,
  "connection-cost-estimator": CONNECTION_COST_ESTIMATOR_TESTS,
  "caching-strategy-picker": CACHING_STRATEGY_PICKER_TESTS,
  "worker-task-dispatcher": WORKER_TASK_DISPATCHER_TESTS,
  "mini-jsx-renderer": MINI_JSX_RENDERER_TESTS,
  "autosave-dirty-fields": AUTOSAVE_DIRTY_FIELDS_TESTS,
  "multi-step-form-validator": MULTI_STEP_FORM_VALIDATOR_TESTS,
  "focus-trap-elements": FOCUS_TRAP_ELEMENTS_TESTS,
  "resolve-theme-value": RESOLVE_THEME_VALUE_TESTS,
  "accordion-toggle-state": ACCORDION_TOGGLE_STATE_TESTS,
  "use-undo-reducer": USE_UNDO_REDUCER_TESTS,
  "resolve-error-fallback": RESOLVE_ERROR_FALLBACK_TESTS,
  "diff-changed-rows": DIFF_CHANGED_ROWS_TESTS,
  "merge-transition-results": MERGE_TRANSITION_RESULTS_TESTS,
  "memoized-selector": MEMOIZED_SELECTOR_TESTS,
};

export function getBuildTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

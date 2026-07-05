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
};

export function getBuildTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

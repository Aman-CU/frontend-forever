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

const TEST_SPECS: Record<string, SandboxTest[]> = {
  "kanban-board": KANBAN_BOARD_TESTS,
  "async-task-runner": ASYNC_TASK_RUNNER_TESTS,
  "render-blocking-analyzer": RENDER_BLOCKING_ANALYZER_TESTS,
  "specificity-conflict-finder": SPECIFICITY_CONFLICT_FINDER_TESTS,
};

export function getBuildTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

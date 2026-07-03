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

const TEST_SPECS: Record<string, SandboxTest[]> = {
  "implement-debounce": DEBOUNCE_TESTS,
  "specificity-calculator": SPECIFICITY_TESTS,
  "virtual-list": VIRTUAL_LIST_TESTS,
};

export function getTestSpec(slug: string): SandboxTest[] | null {
  return TEST_SPECS[slug] ?? null;
}

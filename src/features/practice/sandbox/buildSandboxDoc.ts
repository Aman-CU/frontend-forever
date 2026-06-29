import type { SandboxTest } from "./types";

// Assertion helpers injected into the sandbox, in scope for every test source.
const HELPERS = `
  function eq(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      return ka.every(function (k) { return eq(a[k], b[k]); });
    }
    return false;
  }
  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "Assertion failed");
  }
  function assertEqual(actual, expected, msg) {
    if (!eq(actual, expected)) {
      throw new Error(
        (msg ? msg + " — " : "") +
        "expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual)
      );
    }
  }
  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }
`;

// A literal </script> inside user code would otherwise close the harness <script>.
function escapeForScript(code: string): string {
  return code.replace(/<\/script>/gi, "<\\/script>");
}

// Indent a test source block so the generated document stays readable when
// inspected; purely cosmetic.
function indent(source: string): string {
  return source
    .split("\n")
    .map((line) => "        " + line.trim())
    .join("\n");
}

/**
 * Build the full `srcdoc` HTML for one sandbox run. The document:
 *  1. installs a self-clearing timeout guard + an `error` listener,
 *  2. runs the user's code in its own <script> (so a syntax error there can't
 *     stop the harness — the user's declarations become globals),
 *  3. runs each authored test in sequence and posts a single RESULT message.
 *
 * Every message carries `nonce` so the parent can ignore stray messages.
 */
export function buildSandboxDoc(
  userCode: string,
  tests: SandboxTest[],
  nonce: string,
  timeoutMs = 5000,
): string {
  const testEntries = tests
    .map(
      (t) =>
        `    { label: ${JSON.stringify(t.label)}, run: async function () {\n${indent(
          t.source,
        )}\n    } }`,
    )
    .join(",\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script>
  window.__ff = { done: false, nonce: ${JSON.stringify(nonce)} };
  window.__ff.post = function (msg) {
    msg.__nonce = window.__ff.nonce;
    parent.postMessage(msg, "*");
  };
  window.__ff.finish = function (msg) {
    if (window.__ff.done) return;
    window.__ff.done = true;
    clearTimeout(window.__ff.guard);
    window.__ff.post(msg);
  };
  window.__ff.guard = setTimeout(function () {
    window.__ff.finish({
      type: "ERROR",
      error: "Execution timed out (${timeoutMs / 1000}s limit). Check for an infinite loop or a promise that never resolves.",
    });
  }, ${timeoutMs});
  window.addEventListener("error", function (e) {
    window.__ff.finish({ type: "ERROR", error: String((e && e.message) || "Script error") });
  });
</script>
<script>
// === user code — top-level declarations become globals the tests can call ===
${escapeForScript(userCode)}
</script>
<script>
(function () {
  ${HELPERS}
  var TESTS = [
${testEntries}
  ];
  (async function () {
    var results = [];
    for (var i = 0; i < TESTS.length; i++) {
      try {
        await TESTS[i].run();
        results.push({ label: TESTS[i].label, passed: true });
      } catch (err) {
        results.push({
          label: TESTS[i].label,
          passed: false,
          error: String(err && err.message ? err.message : err),
        });
      }
    }
    window.__ff.finish({ type: "RESULT", results: results });
  })();
})();
</script>
</body>
</html>`;
}

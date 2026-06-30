// Builds a *persistent, interactive* sandbox document — unlike buildSandboxDoc
// (one-shot test runner), this session stays mounted and exchanges messages with
// the parent in both directions: the parent posts events in, the challenge-
// specific driver runs the user's code and posts events back. Used by the live
// playground demos (Feature 24).
//
// Security model matches the test sandbox: allow-scripts only, opaque origin,
// the nonce + post helper stay private to the harness closure so user code can't
// forge messages. (The playground grants no progress/XP, so this is about
// correct message routing more than cheat-prevention.)

function escapeForScript(code: string): string {
  return code.replace(/<\/script>/gi, "<\\/script>");
}

/**
 * @param userCode    the submission (defines globals like `debounce`)
 * @param driverSource challenge-specific glue. Runs inside the harness closure
 *   with `post(msg)` in scope and the user's globals available. It must define a
 *   function `handle(type, payload)` to react to inbound parent events.
 * @param nonce        per-session id; outbound carries `__nonce`, inbound must
 *   carry `__to` equal to it.
 */
export function buildLiveDoc(userCode: string, driverSource: string, nonce: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script>
// === user code — top-level declarations become globals the driver can call ===
${escapeForScript(userCode)}
</script>
<script>
(function () {
  var NONCE = ${JSON.stringify(nonce)};
  function post(msg) { msg.__nonce = NONCE; parent.postMessage(msg, "*"); }

  // The driver (trusted, authored by us) runs in its own scope with post() and
  // the user's globals available, and defines a handle(type, payload) function.
  // Wrapping it in a returning IIFE isolates that declaration and hands the real
  // handler back here.
  var handle = function () {};
  try {
    handle = (function () {
      ${driverSource}
      return typeof handle === "function" ? handle : function () {};
    })();
  } catch (err) {
    post({ type: "ERROR", error: String((err && err.message) || err) });
  }

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.__to !== NONCE) return;
    try {
      handle(d.type, d.payload);
    } catch (err) {
      post({ type: "ERROR", error: String((err && err.message) || err) });
    }
  });

  post({ type: "READY" });
})();
</script>
</body>
</html>`;
}

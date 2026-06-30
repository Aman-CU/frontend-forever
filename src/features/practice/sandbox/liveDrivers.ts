// Challenge-specific "driver" source for the live playground (Feature 24). Each
// driver runs inside the live sandbox harness (see buildLiveDoc.ts) with the
// user's globals and a private `post(msg)` in scope, and must define
// `handle(type, payload)` to react to events the parent sends in.
//
// Authored by us, never user input — these strings are trusted glue, not
// submissions.

// Debounce playground: the parent sends a KEY event per keystroke; the driver
// feeds it through the user's debounce wrapping a "fire request" reporter, so a
// correct debounce collapses a burst of KEYs into a single CALL. A broken or
// missing debounce falls back to firing on every key (the naive behaviour),
// which is exactly what the demo is contrasting against.
const DEBOUNCE_DRIVER = `
  var report = function () { post({ type: "CALL" }); };
  var debounced = null;
  var delay = 500;
  function rebuild() {
    debounced = (typeof debounce === "function") ? debounce(report, delay) : null;
  }
  rebuild();
  function handle(type, payload) {
    if (type === "KEY") {
      if (debounced) { debounced(); }
      else { report(); } // no working debounce yet -> behaves like the naive lane
    } else if (type === "CONFIG") {
      if (payload && typeof payload.delay === "number") { delay = payload.delay; }
      rebuild();
    } else if (type === "CANCEL") {
      if (debounced && typeof debounced.cancel === "function") { debounced.cancel(); }
    }
  }
`;

const LIVE_DRIVERS: Record<string, string> = {
  "implement-debounce": DEBOUNCE_DRIVER,
};

export function getLiveDriver(slug: string): string | null {
  return LIVE_DRIVERS[slug] ?? null;
}

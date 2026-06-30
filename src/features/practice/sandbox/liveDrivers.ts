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

// Virtual-list playground: the parent sends a SCROLL event (scrollTop + the list
// params) on every scroll; the driver runs the user's visibleRange() and returns
// the window of row indices to mount. A missing/broken function — or one that
// returns a wildly oversized window — reports ok:false so the demo can show the
// naive "all 10,000 nodes" state instead of trying to mount thousands of rows.
const VIRTUAL_LIST_DRIVER = `
  function handle(type, payload) {
    if (type !== "SCROLL" || !payload) return;
    var p = payload;
    if (typeof visibleRange !== "function") { post({ type: "WINDOW", payload: { ok: false } }); return; }
    var r;
    try {
      r = visibleRange(p.scrollTop, p.rowHeight, p.containerHeight, p.totalRows, p.overscan);
    } catch (e) {
      post({ type: "WINDOW", payload: { ok: false } });
      return;
    }
    if (r && typeof r.start === "number" && typeof r.end === "number" &&
        r.end >= r.start && (r.end - r.start) < 500) {
      post({ type: "WINDOW", payload: { ok: true, start: r.start, end: r.end } });
    } else {
      post({ type: "WINDOW", payload: { ok: false } });
    }
  }
`;

// Specificity playground: the parent sends a SCORE event per competing selector;
// the driver runs the user's specificity() and returns the [id, class, element]
// tuple. A missing/broken function reports ok:false for that selector.
const SPECIFICITY_DRIVER = `
  function handle(type, payload) {
    if (type !== "SCORE" || !payload) return;
    if (typeof specificity !== "function") { post({ type: "SCORE", payload: { id: payload.id, ok: false } }); return; }
    var s;
    try {
      s = specificity(payload.selector);
    } catch (e) {
      post({ type: "SCORE", payload: { id: payload.id, ok: false } });
      return;
    }
    if (Array.isArray(s) && s.length === 3 && s.every(function (n) { return typeof n === "number"; })) {
      post({ type: "SCORE", payload: { id: payload.id, ok: true, score: s } });
    } else {
      post({ type: "SCORE", payload: { id: payload.id, ok: false } });
    }
  }
`;

const LIVE_DRIVERS: Record<string, string> = {
  "implement-debounce": DEBOUNCE_DRIVER,
  "virtual-list": VIRTUAL_LIST_DRIVER,
  "specificity-calculator": SPECIFICITY_DRIVER,
};

export function getLiveDriver(slug: string): string | null {
  return LIVE_DRIVERS[slug] ?? null;
}

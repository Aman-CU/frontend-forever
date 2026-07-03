import { buildSandboxDoc } from "./buildSandboxDoc";
import type { SandboxRunResult, SandboxTest, TestResult } from "./types";

// Last-resort parent-side cap, slightly longer than the inner 5s guard so the
// iframe's own timeout reports first when it can.
const PARENT_TIMEOUT_MS = 6000;

/**
 * Run user code against the given tests inside a fresh hidden sandbox iframe.
 * Resolves once (never rejects) with either the test results or a run-level
 * error. The iframe and listener are always torn down before resolving.
 */
export function runInSandbox(
  userCode: string,
  tests: SandboxTest[],
): Promise<SandboxRunResult> {
  return new Promise((resolve) => {
    const nonce =
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts"); // never allow-same-origin
    iframe.setAttribute("title", "Code execution sandbox");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.display = "none";

    let settled = false;
    let timer = 0;

    function cleanup() {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      iframe.remove();
    }

    function finish(result: SandboxRunResult) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    }

    function onMessage(event: MessageEvent) {
      const data = event.data as
        | { __nonce?: string; type?: string; results?: TestResult[]; error?: string }
        | null;
      if (!data || data.__nonce !== nonce) return;

      if (data.type === "RESULT") {
        finish({
          results: Array.isArray(data.results) ? data.results : [],
          error: null,
        });
      } else if (data.type === "ERROR") {
        finish({ results: [], error: String(data.error ?? "Unknown error") });
      }
    }

    window.addEventListener("message", onMessage);
    timer = window.setTimeout(() => {
      finish({ results: [], error: "The sandbox did not respond in time." });
    }, PARENT_TIMEOUT_MS);

    iframe.srcdoc = buildSandboxDoc(userCode, tests, nonce);
    document.body.appendChild(iframe);
  });
}

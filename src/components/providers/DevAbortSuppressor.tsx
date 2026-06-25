"use client";

import { useEffect } from "react";

// Suppresses unhandled AbortErrors in development only.
//
// Better-Auth's focus-manager aborts in-flight get-session fetches when the
// tab regains focus while Turbopack is still compiling the auth route on a
// cold start. The abort itself is harmless — the session loads correctly once
// compilation finishes and the cookie cache kicks in — but the unhandled
// rejection spams the console. In production the auth route is pre-compiled
// and the cookie cache makes get-session respond in <5ms, so this never fires.
export function DevAbortSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    function handler(event: PromiseRejectionEvent) {
      // Only suppress AbortErrors that carry no explicit reason — the signature
      // of Better-Auth's focus-manager abort. App code that calls
      // signal.abort("reason") produces a different message and is not caught.
      if (
        event.reason?.name === "AbortError" &&
        event.reason?.message === "signal is aborted without reason"
      ) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return null;
}

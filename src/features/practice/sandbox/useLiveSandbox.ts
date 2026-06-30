"use client";

import { useCallback, useEffect, useRef } from "react";

import { buildLiveDoc } from "./buildLiveDoc";

type LiveEvent = { type: string; payload?: unknown };

// Manages one persistent, bidirectional sandbox session for a live playground.
// Rebuilds the session whenever `code` or `driver` changes (the caller should
// debounce `code` so editing doesn't thrash the iframe). `onEvent` receives
// every message the driver posts back (e.g. a debounce "CALL"); the internal
// READY handshake is swallowed.
export function useLiveSandbox(
  code: string | null,
  driver: string | null,
  onEvent: (event: LiveEvent) => void,
) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const nonceRef = useRef("");
  const readyRef = useRef(false);
  const queueRef = useRef<LiveEvent[]>([]);
  const onEventRef = useRef(onEvent);

  // Keep the latest callback without re-running the session effect.
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (code == null || driver == null) return;

    const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    nonceRef.current = nonce;
    readyRef.current = false;
    queueRef.current = [];

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("title", "Live code playground sandbox");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.display = "none";

    const postIn = (event: LiveEvent) =>
      iframe.contentWindow?.postMessage(
        { __to: nonce, type: event.type, payload: event.payload },
        "*",
      );

    function onMessage(event: MessageEvent) {
      const data = event.data as LiveEvent & { __nonce?: string };
      if (!data || data.__nonce !== nonce) return;
      if (data.type === "READY") {
        // Flush anything the user typed before the iframe finished loading, so
        // the demo works from the very first keystroke (no dropped events).
        readyRef.current = true;
        const queued = queueRef.current;
        queueRef.current = [];
        queued.forEach(postIn);
        return;
      }
      onEventRef.current({ type: data.type, payload: data.payload });
    }

    window.addEventListener("message", onMessage);
    iframe.srcdoc = buildLiveDoc(code, driver, nonce);
    document.body.appendChild(iframe);
    frameRef.current = iframe;

    return () => {
      window.removeEventListener("message", onMessage);
      iframe.remove();
      frameRef.current = null;
      nonceRef.current = "";
      readyRef.current = false;
      queueRef.current = [];
    };
  }, [code, driver]);

  const send = useCallback((type: string, payload?: unknown) => {
    const event = { type, payload };
    if (readyRef.current && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        { __to: nonceRef.current, type, payload },
        "*",
      );
    } else {
      queueRef.current.push(event);
    }
  }, []);

  return { send };
}

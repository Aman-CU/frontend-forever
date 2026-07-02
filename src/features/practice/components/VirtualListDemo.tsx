"use client";

import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";

import { cn } from "@/lib/utils";
import { getLiveDriver, useLiveSandbox } from "@/features/practice/sandbox";
import { CountUp } from "./playground/CountUp";

// List params — the demo owns them and passes them to the user's visibleRange.
const ROW_H = 32;
const VIEW_H = 256;
const TOTAL = 10000;
const OVERSCAN = 4;

type Win = { ok: boolean; start: number; end: number };

// "10,000 divs": scroll the list and watch how many <div>s your browser is
// actually holding. Naive mounts all 10,000 (jank); the user's visibleRange()
// windows it down to ~14 — computed live in the sandbox as you scroll.
export function VirtualListDemo({ code }: { code: string }) {
  const driver = getLiveDriver("virtual-list");

  const [liveCode, setLiveCode] = useState(code);
  useEffect(() => {
    const timer = setTimeout(() => setLiveCode(code), 600);
    return () => clearTimeout(timer);
  }, [code]);

  const [win, setWin] = useState<Win>({ ok: false, start: 0, end: 0 });
  const scrollTopRef = useRef(0);
  const rafRef = useRef(0);

  const { send } = useLiveSandbox(liveCode, driver, (event) => {
    if (event.type === "WINDOW") {
      const p = event.payload as Partial<Win>;
      setWin(p.ok ? { ok: true, start: p.start ?? 0, end: p.end ?? 0 } : { ok: false, start: 0, end: 0 });
    }
  });

  // Re-evaluate the window whenever the session (re)builds — covers initial load
  // and every code edit. `send` queues until the iframe is READY.
  useEffect(() => {
    send("SCROLL", {
      scrollTop: scrollTopRef.current,
      rowHeight: ROW_H,
      containerHeight: VIEW_H,
      totalRows: TOTAL,
      overscan: OVERSCAN,
    });
  }, [liveCode, send]);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    scrollTopRef.current = event.currentTarget.scrollTop;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() =>
      send("SCROLL", {
        scrollTop: scrollTopRef.current,
        rowHeight: ROW_H,
        containerHeight: VIEW_H,
        totalRows: TOTAL,
        overscan: OVERSCAN,
      }),
    );
  }

  const nodes = win.ok ? win.end - win.start + 1 : TOTAL;
  const rows = win.ok
    ? Array.from({ length: win.end - win.start + 1 }, (_, i) => win.start + i)
    : Array.from({ length: 14 }, (_, i) => i); // static preview when not windowing yet

  return (
    <section
      aria-label="Virtual list playground"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-bold text-text-primary">🗂️ 10,000 Products</h3>
        <span className="text-xs text-text-muted">scroll the list — how many divs is your browser holding?</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        {/* Live DOM-node count */}
        <div className="flex flex-col justify-center rounded-lg border border-border bg-surface px-5 py-4 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">DOM nodes</span>
          <span className="flex items-center justify-center gap-2">
            <CountUp
              value={nodes}
              className={cn(
                "text-3xl font-bold tabular-nums",
                win.ok ? "text-success" : "text-error",
              )}
            />
            <span className="text-xl" aria-hidden>{win.ok ? "😎" : "😱"}</span>
          </span>
          <span className="mt-0.5 text-xs text-text-muted">
            {win.ok ? `of ${TOTAL.toLocaleString()}` : "rendering everything"}
          </span>
        </div>

        {/* The scrollable list — only the windowed rows are actually mounted */}
        <div
          onScroll={onScroll}
          style={{ height: VIEW_H }}
          className="relative overflow-auto rounded-lg border border-border bg-surface"
        >
          <div style={{ height: TOTAL * ROW_H, position: "relative" }}>
            {rows.map((index) => (
              <div
                key={index}
                style={{ position: "absolute", top: index * ROW_H, height: ROW_H }}
                className="flex w-full items-center gap-3 border-b border-border/60 px-3 text-sm text-text-secondary"
              >
                <span className="font-mono text-xs text-text-muted">#{index}</span>
                Product {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-text-secondary">
        {win.ok ? (
          <span className="font-medium text-success">
            😎 Only {nodes} rows mounted instead of {TOTAL.toLocaleString()} — your browser says thanks.
          </span>
        ) : (
          <span>
            🐌 A naive list mounts all {TOTAL.toLocaleString()} rows and chokes. Implement{" "}
            <code className="rounded bg-surface-secondary px-1 font-mono text-[0.8125rem]">visibleRange</code>{" "}
            to render only what&apos;s on screen.
          </span>
        )}
      </p>
    </section>
  );
}

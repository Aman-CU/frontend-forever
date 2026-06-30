"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { RotateCcw, Search, Sparkles } from "lucide-react";

import { getLiveDriver, useLiveSandbox } from "@/features/practice/sandbox";
import { RequestLane, type Packet } from "./RequestLane";

const COST_PER_CALL = 0.002;
const DEMO_DELAY_MS = 500;

// neal.fun-style playground for the debounce challenge: type in the search box
// and watch two lanes race. The "naive" lane fires a request on every keystroke;
// the "your debounce" lane runs the user's actual code in a live sandbox, so a
// correct debounce visibly collapses the burst into a single call.
export function DebounceDemo({ code }: { code: string }) {
  const driver = getLiveDriver("implement-debounce");

  // Feed the session a debounced copy of the editor code so typing in the editor
  // doesn't rebuild the iframe on every keystroke.
  const [liveCode, setLiveCode] = useState(code);
  useEffect(() => {
    const timer = setTimeout(() => setLiveCode(code), 600);
    return () => clearTimeout(timer);
  }, [code]);

  const [query, setQuery] = useState("");
  const [naiveCalls, setNaiveCalls] = useState(0);
  const [debouncedCalls, setDebouncedCalls] = useState(0);
  const [naivePackets, setNaivePackets] = useState<Packet[]>([]);
  const [goodPackets, setGoodPackets] = useState<Packet[]>([]);
  const seq = useRef(0);

  const { send } = useLiveSandbox(liveCode, driver, (event) => {
    if (event.type === "CALL") {
      setDebouncedCalls((count) => count + 1);
      setGoodPackets((packets) => [...packets.slice(-24), { id: seq.current++ }]);
    }
  });

  function handleType(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setNaiveCalls((count) => count + 1);
    setNaivePackets((packets) => [...packets.slice(-24), { id: seq.current++ }]);
    send("KEY");
  }

  function reset() {
    setQuery("");
    setNaiveCalls(0);
    setDebouncedCalls(0);
    setNaivePackets([]);
    setGoodPackets([]);
  }

  const saved = Math.max(0, naiveCalls - debouncedCalls);
  const working = naiveCalls >= 4 && debouncedCalls > 0 && debouncedCalls < naiveCalls;

  return (
    <section
      aria-label="Debounce playground"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">Live playground</h3>
        <span className="text-xs text-text-muted">
          fires a request every keystroke ({DEMO_DELAY_MS}ms debounce)
        </span>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={handleType}
          placeholder="Search countries… type fast!"
          aria-label="Demo search box"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RequestLane
          label="Without debounce"
          tone="naive"
          calls={naiveCalls}
          packets={naivePackets}
          onPacketDone={(id) => setNaivePackets((p) => p.filter((x) => x.id !== id))}
        />
        <RequestLane
          label="With your debounce"
          tone="good"
          calls={debouncedCalls}
          packets={goodPackets}
          onPacketDone={(id) => setGoodPackets((p) => p.filter((x) => x.id !== id))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {working ? (
            <span className="font-medium text-success">
              Nice — {saved} wasted {saved === 1 ? "call" : "calls"} avoided, $
              {(saved * COST_PER_CALL).toFixed(3)} saved.
            </span>
          ) : naiveCalls >= 4 ? (
            <span className="text-text-muted">
              Your debounce isn&apos;t cutting calls yet — implement it and the right lane will drop.
            </span>
          ) : (
            <span className="text-text-muted">Type in the box above to fire some requests.</span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>
    </section>
  );
}

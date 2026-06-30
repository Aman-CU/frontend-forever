"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { RotateCcw, Search } from "lucide-react";

import { getLiveDriver, useLiveSandbox } from "@/features/practice/sandbox";
import { Celebration } from "./playground/Celebration";
import { ServerPanel, type Coin } from "./playground/ServerPanel";

const COST = 0.002; // $ per request
const SCALE_USERS = 1_000_000;
const bigUsd = (n: number) => `$${Math.round(n).toLocaleString()}`;

// Recent-request count → 0–100 load, decaying over ~1.2s.
function loadFrom(times: number[]) {
  const recent = times.filter((t) => Date.now() - t < 1200);
  return { recent, load: Math.min(100, recent.length * 16) };
}

// "The Server Bill": two servers race. The left fires a request on every
// keystroke (naive); the right is driven by the user's actual debounce in a live
// sandbox. A correct debounce keeps the right server cool and the bill low.
export function DebounceDemo({ code }: { code: string }) {
  const driver = getLiveDriver("implement-debounce");

  const [liveCode, setLiveCode] = useState(code);
  useEffect(() => {
    const timer = setTimeout(() => setLiveCode(code), 600);
    return () => clearTimeout(timer);
  }, [code]);

  const [query, setQuery] = useState("");
  const [naive, setNaive] = useState(0);
  const [yours, setYours] = useState(0);
  const [naiveCoins, setNaiveCoins] = useState<Coin[]>([]);
  const [yourCoins, setYourCoins] = useState<Coin[]>([]);
  const [naiveLoad, setNaiveLoad] = useState(0);
  const [yourLoad, setYourLoad] = useState(0);
  const [celebrate, setCelebrate] = useState(0);

  const seq = useRef(0);
  const naiveTimes = useRef<number[]>([]);
  const yourTimes = useRef<number[]>([]);
  const celebrated = useRef(false);

  const { send } = useLiveSandbox(liveCode, driver, (event) => {
    if (event.type === "CALL") {
      setYours((c) => c + 1);
      yourTimes.current.push(Date.now());
      setYourCoins((c) => [...c.slice(-10), { id: seq.current++ }]);
    }
  });

  // Decay both server loads from their recent request rate.
  useEffect(() => {
    const interval = setInterval(() => {
      const n = loadFrom(naiveTimes.current);
      const y = loadFrom(yourTimes.current);
      naiveTimes.current = n.recent;
      yourTimes.current = y.recent;
      setNaiveLoad(n.load);
      setYourLoad(y.load);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Only claim savings once the user's code has fired at least one request — a
  // real debounce always fires ≥1, so yours === 0 means "no calls yet", not 100%.
  const savedPct = yours > 0 && naive > 0 ? Math.round((1 - yours / naive) * 100) : 0;
  const dailyNaive = naive * COST * SCALE_USERS;
  const dailySaved = (naive - yours) * COST * SCALE_USERS;

  useEffect(() => {
    if (!celebrated.current && naive >= 6 && yours > 0 && savedPct >= 40) {
      celebrated.current = true;
      setCelebrate((c) => c + 1);
    }
  }, [naive, yours, savedPct]);

  function handleType(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setNaive((c) => c + 1);
    naiveTimes.current.push(Date.now());
    setNaiveCoins((c) => [...c.slice(-10), { id: seq.current++ }]);
    send("KEY");
  }

  function reset() {
    setQuery("");
    setNaive(0);
    setYours(0);
    setNaiveCoins([]);
    setYourCoins([]);
    setNaiveLoad(0);
    setYourLoad(0);
    naiveTimes.current = [];
    yourTimes.current = [];
    celebrated.current = false;
  }

  return (
    <section
      aria-label="Debounce playground"
      className="relative flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 sm:p-5"
    >
      <Celebration trigger={celebrate} />

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-bold text-text-primary">💸 The Server Bill</h3>
        <span className="text-xs text-text-muted">every keystroke pings the server — watch both bills add up</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={handleType}
          placeholder="Search 100M products… type fast!"
          aria-label="Demo search box"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ServerPanel
          title="Without debounce"
          calls={naive}
          load={naiveLoad}
          coins={naiveCoins}
          onCoinDone={(id) => setNaiveCoins((c) => c.filter((x) => x.id !== id))}
        />
        <ServerPanel
          title="With your debounce"
          calls={yours}
          load={yourLoad}
          coins={yourCoins}
          onCoinDone={(id) => setYourCoins((c) => c.filter((x) => x.id !== id))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {savedPct >= 40 ? (
            <span className="font-medium text-success">
              😌 Your debounce is earning its keep — {bigUsd(dailySaved)}/day saved at {SCALE_USERS.toLocaleString()} users.
            </span>
          ) : naive >= 4 ? (
            <span>
              🥵 Both servers are on fire — at {SCALE_USERS.toLocaleString()} users that&apos;s{" "}
              <span className="font-semibold text-error">{bigUsd(dailyNaive)}/day</span>. Implement{" "}
              <code className="rounded bg-surface-secondary px-1 font-mono text-[0.8125rem]">debounce</code> to cool the right one down.
            </span>
          ) : (
            <span className="text-text-muted">Type in the search box to start sending requests.</span>
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

"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search, Server } from "lucide-react";

import { cn } from "@/lib/utils";
import { getLiveDriver, useLiveSandbox } from "@/features/practice/sandbox";
import { CountUp } from "./playground/CountUp";
import { Celebration } from "./playground/Celebration";

const COST = 0.002; // $ per request
const SCALE_USERS = 1_000_000;
const usd = (n: number) => `$${n.toFixed(3)}`;
const bigUsd = (n: number) => `$${Math.round(n).toLocaleString()}`;

// "The Server Bill": every keystroke pings a server and racks up a bill, live —
// the right panel is driven by the user's actual debounce. A correct debounce
// collapses the burst, the server cools off, and the savings celebrate.
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
  const [coins, setCoins] = useState<{ id: number }[]>([]);
  const [load, setLoad] = useState(0);
  const [celebrate, setCelebrate] = useState(0);
  const seq = useRef(0);
  const callTimes = useRef<number[]>([]);
  const celebrated = useRef(false);

  const { send } = useLiveSandbox(liveCode, driver, (event) => {
    if (event.type === "CALL") {
      setYours((c) => c + 1);
      callTimes.current.push(Date.now());
      setCoins((c) => [...c.slice(-12), { id: seq.current++ }]);
    }
  });

  // Decay the server load from the rate of *your* requests in the last ~1.2s.
  useEffect(() => {
    const interval = setInterval(() => {
      const recent = callTimes.current.filter((t) => Date.now() - t < 1200);
      callTimes.current = recent;
      setLoad(Math.min(100, recent.length * 16));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Only claim savings once the user's code has actually fired at least one
  // request — a real debounce always fires ≥1, so yours === 0 means "no calls
  // yet" (warming up / mid-burst), not "perfect", and must never read as 100%.
  const savedPct = yours > 0 && naive > 0 ? Math.round((1 - yours / naive) * 100) : 0;
  const dailyNaive = naive * COST * SCALE_USERS;
  const dailySaved = (naive - yours) * COST * SCALE_USERS;

  // Fire the payoff once, when a working debounce first cuts calls meaningfully.
  useEffect(() => {
    if (!celebrated.current && naive >= 6 && yours > 0 && savedPct >= 40) {
      celebrated.current = true;
      setCelebrate((c) => c + 1);
    }
  }, [naive, yours, savedPct]);

  function handleType(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setNaive((c) => c + 1);
    send("KEY");
  }

  function reset() {
    setQuery("");
    setNaive(0);
    setYours(0);
    setCoins([]);
    setLoad(0);
    callTimes.current = [];
    celebrated.current = false;
  }

  const mood = load > 70 ? "🥵" : load > 25 ? "😅" : "😌";

  return (
    <section
      aria-label="Debounce playground"
      className="relative flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 sm:p-5"
    >
      <Celebration trigger={celebrate} />

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-bold text-text-primary">💸 The Server Bill</h3>
        <span className="text-xs text-text-muted">every keystroke pings the server — watch it add up</span>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        {/* Server + load meter; coins fly in from the left on each real request */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Server className="h-4 w-4 text-text-muted" aria-hidden /> API server
            </span>
            <span className="text-lg" aria-hidden>{mood}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-secondary">
            <motion.div
              className={cn("h-full rounded-full", load > 70 ? "bg-error" : load > 25 ? "bg-xp" : "bg-success")}
              animate={{ width: `${load}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {load > 70 ? "Overheating — too many requests" : load > 25 ? "Getting busy" : "Resting easy"}
          </p>
          <AnimatePresence>
            {coins.map((coin) => (
              <motion.span
                key={coin.id}
                className="pointer-events-none absolute bottom-3 left-3 text-sm"
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: 220, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeIn" }}
                onAnimationComplete={() => setCoins((c) => c.filter((x) => x.id !== coin.id))}
              >
                🪙
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* The bill */}
        <div className="flex flex-col justify-center rounded-lg border border-border bg-surface px-5 py-4 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Your bill</span>
          <CountUp value={yours * COST} format={usd} className="text-3xl font-bold tabular-nums text-text-primary" />
          <span className="mt-0.5 text-xs text-text-muted">
            <CountUp value={yours} /> requests
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="text-text-muted">
          Naive (1/keystroke): <span className="font-semibold text-error">{usd(naive * COST)}</span> · {naive}
        </span>
        <span className="text-text-muted">
          You: <span className="font-semibold text-success">{usd(yours * COST)}</span> · {yours}
        </span>
        {savedPct > 0 && (
          <span className="font-semibold text-success">saving {savedPct}%</span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {savedPct >= 40 ? (
            <span className="font-medium text-success">
              😌 Your debounce is earning its keep — <CountUp value={dailySaved} format={bigUsd} />/day saved at {SCALE_USERS.toLocaleString()} users.
            </span>
          ) : naive >= 4 ? (
            <span>
              🥵 The server&apos;s on fire — at {SCALE_USERS.toLocaleString()} users that&apos;s{" "}
              <span className="font-semibold text-error">{bigUsd(dailyNaive)}/day</span>. Implement{" "}
              <code className="rounded bg-surface-secondary px-1 font-mono text-[0.8125rem]">debounce</code> to calm it down.
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

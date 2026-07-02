"use client";

import { useEffect, useState } from "react";

import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { getLiveDriver, useLiveSandbox } from "@/features/practice/sandbox";

type Score = [number, number, number];

// The competing selectors targeting <button id="cta" class="primary btn">. Each
// owns the button colour it would apply if it wins. Scored live by the user's
// specificity().
const SELECTORS = [
  { id: "el", selector: "button", color: "bg-text-muted" },
  { id: "cls", selector: ".btn", color: "bg-info" },
  { id: "cls2", selector: ".primary.btn", color: "bg-xp" },
  { id: "idsel", selector: "#cta", color: "bg-premium" },
] as const;

// Compare [id, class, element] tuples the way the cascade does.
function beats(a: Score, b: Score) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}

type Entry = { ok: boolean; score?: Score };

// "Selector Showdown": four selectors fight to style one button. The user's
// specificity() scores each [id, class, element]; the highest score wins and its
// colour snaps onto the live button in real time.
export function SpecificityDemo({ code }: { code: string }) {
  const driver = getLiveDriver("specificity-calculator");

  const [liveCode, setLiveCode] = useState(code);
  useEffect(() => {
    const timer = setTimeout(() => setLiveCode(code), 600);
    return () => clearTimeout(timer);
  }, [code]);

  const [scores, setScores] = useState<Record<string, Entry>>({});

  const { send } = useLiveSandbox(liveCode, driver, (event) => {
    if (event.type === "SCORE") {
      const p = event.payload as { id: string; ok: boolean; score?: Score };
      setScores((prev) => ({ ...prev, [p.id]: { ok: p.ok, score: p.score } }));
    }
  });

  // (Re)score every selector whenever the session rebuilds (initial + each edit).
  // Responses overwrite each selector's entry, so no manual reset is needed.
  useEffect(() => {
    for (const s of SELECTORS) send("SCORE", { id: s.id, selector: s.selector });
  }, [liveCode, send]);

  // Winner = highest valid specificity; iterating in source order and taking any
  // entry the current winner doesn't strictly beat means ties go to the later
  // selector, exactly like the cascade.
  let winner: (typeof SELECTORS)[number] | null = null;
  let winnerScore: Score | null = null;
  for (const s of SELECTORS) {
    const entry = scores[s.id];
    if (!entry?.ok || !entry.score) continue;
    if (winnerScore === null || !beats(winnerScore, entry.score)) {
      winner = s;
      winnerScore = entry.score;
    }
  }

  return (
    <section
      aria-label="Specificity playground"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-bold text-text-primary">🥊 Selector Showdown</h3>
        <span className="text-xs text-text-muted">four selectors, one button — who wins?</span>
      </div>

      {/* The live target button — wears the winner's colour */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface py-6">
        <button
          type="button"
          className={cn(
            "rounded-lg px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors",
            winner ? winner.color : "bg-border",
          )}
        >
          Buy now
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {SELECTORS.map((s) => {
          const entry = scores[s.id];
          const isWinner = winner?.id === s.id;
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                isWinner ? "border-accent bg-accent-muted/40" : "border-border bg-surface",
              )}
            >
              <span className={cn("h-3 w-3 shrink-0 rounded-full", s.color)} aria-hidden />
              <code className="font-mono text-sm text-text-primary">{s.selector}</code>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-xs">
                {entry?.ok && entry.score ? (
                  entry.score.map((n, i) => (
                    <span
                      key={i}
                      className={cn(
                        "rounded px-1.5 py-0.5 tabular-nums",
                        n > 0 ? "bg-text-primary text-text-inverse" : "bg-surface-secondary text-text-muted",
                      )}
                    >
                      {n}
                    </span>
                  ))
                ) : (
                  <span className="text-text-muted">— — —</span>
                )}
              </span>
              {isWinner && <Trophy className="h-4 w-4 shrink-0 text-xp" aria-hidden />}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-text-secondary">
        {winner && winnerScore ? (
          <span className="font-medium text-success">
            🏆 <code className="font-mono">{winner.selector}</code> wins with [{winnerScore.join(", ")}] — specificity is{" "}
            <span className="font-semibold">id &gt; class &gt; element</span>, not source order.
          </span>
        ) : (
          <span>
            Implement{" "}
            <code className="rounded bg-surface-secondary px-1 font-mono text-[0.8125rem]">specificity</code>{" "}
            to score each selector [id, class, element] and crown a winner.
          </span>
        )}
      </p>
    </section>
  );
}

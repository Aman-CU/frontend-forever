"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, RotateCcw, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import { Markdown } from "@/components/shared/Markdown";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

export type ReviewSessionQuestionView = {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  companies: string[];
  isLocked: boolean;
};

// Easy/Okay/Hard/Forgot -> SM-2 quality 5/4/3/1 (build-plan.md's Feature 32
// spec). Distinct from Learn's Interview tab binary "knew"/"review" scale.
const RATINGS = [
  { label: "Forgot", quality: 1, className: "bg-error-muted text-error" },
  { label: "Hard", quality: 3, className: "bg-warning-muted text-warning" },
  { label: "Okay", quality: 4, className: "bg-accent-muted text-accent-dark" },
  { label: "Easy", quality: 5, className: "bg-success-muted text-success" },
] as const;

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type RatingLabel = (typeof RATINGS)[number]["label"];

export function ReviewSession({ questions }: { questions: ReviewSessionQuestionView[] }) {
  const router = useRouter();
  const reduceMotion = useSafeReducedMotion();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [tally, setTally] = useState<Record<RatingLabel, number>>({
    Forgot: 0,
    Hard: 0,
    Okay: 0,
    Easy: 0,
  });
  const [saveFailed, setSaveFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const finished = index >= total;

  async function rate(label: RatingLabel, quality: number) {
    if (isSubmitting) return;
    setSaveFailed(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/interview-review-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: current.id, quality }),
      });
      if (!res.ok) {
        setSaveFailed(true);
        return;
      }
      const data = (await res.json()) as { xpAwarded?: number };
      setXpEarned((prev) => prev + (data.xpAwarded ?? 0));
    } catch {
      setSaveFailed(true);
      return;
    } finally {
      setIsSubmitting(false);
    }

    setTally((prev) => ({ ...prev, [label]: prev[label] + 1 }));
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  if (finished) {
    // Sum of tally, not `total` — total counts every question in the queue,
    // including any locked ones the user hit "Skip" on rather than rated
    // (skip advances the index but never increments tally), so "reviewed"
    // would otherwise overcount.
    const reviewed = Object.values(tally).reduce((sum, count) => sum + count, 0);
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-muted text-accent">
          <Sparkles className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-text-primary">Session complete</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You reviewed {reviewed} question{reviewed === 1 ? "" : "s"} and earned{" "}
          <span className="font-semibold text-text-primary">{xpEarned} XP</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {RATINGS.map((r) => (
            <span
              key={r.label}
              className={cn("rounded-full px-3 py-1 text-xs font-semibold", r.className)}
            >
              {r.label}: {tally[r.label]}
            </span>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            href="/interview-prep"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Back to Interview Prep
          </Link>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-secondary"
          >
            Check for more
          </button>
        </div>
      </div>
    );
  }

  const badgeStyle =
    DIFFICULTY_STYLES[current.difficulty as ChallengeDifficulty] ??
    "bg-surface-secondary text-text-secondary";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
          aria-label="Review progress"
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-text-secondary tabular-nums">
          {total - index} remaining
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", badgeStyle)}>
            {current.difficulty}
          </span>
          {current.companies.map((company) => (
            <span
              key={company}
              className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted"
            >
              {company}
            </span>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-text-primary">{current.question}</h2>

        <AnimatePresence initial={false}>
          {revealed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-t border-border pt-4">
                {current.isLocked ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-premium/70 bg-premium-light/30 px-4 py-3">
                    <Lock className="h-5 w-5 shrink-0 text-premium" aria-hidden />
                    <p className="text-sm text-text-secondary">
                      Upgrade to Premium to unlock this answer.
                    </p>
                  </div>
                ) : (
                  <Markdown markdown={current.answer} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark"
            >
              Show Answer
            </button>
          ) : current.isLocked ? (
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                setIndex((prev) => prev + 1);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Skip
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-text-muted">How well did you know this?</span>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void rate(r.label, r.quality)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      r.className,
                    )}
                  >
                    {r.label === "Easy" && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                    {r.label}
                  </button>
                ))}
              </div>
              {saveFailed && (
                <p className="text-xs text-error">Couldn&apos;t save that rating — pick a rating again to retry.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

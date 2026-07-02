"use client";

import { useId, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Markdown } from "@/components/shared/Markdown";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import type { ChallengeDifficulty } from "@/lib/constants";

export type QuestionRating = "knew" | "review";

// The card's own view of a question — just the fields it renders. Kept local so
// this feature never imports the DB row type from features/learn (the host in
// components/ owns that bridge). InterviewQuestionData is a structural superset,
// so the host can pass its rows straight through.
export type InterviewQuestionView = {
  question: string;
  answer: string;
  difficulty: string;
  companies: string[];
};

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  index: number;
  question: InterviewQuestionView;
  rating: QuestionRating | undefined;
  onRate: (rating: QuestionRating) => void;
};

// A single expandable interview question: click the header to reveal the answer,
// then self-assess with "I knew this" / "Need to review". The rating is local
// state (Feature 25) — the SM-2 spaced-repetition persistence is Feature 32.
export function QuestionCard({ index, question, rating, onRate }: Props) {
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = useSafeReducedMotion();
  const answerId = useId();

  const badgeStyle =
    DIFFICULTY_STYLES[question.difficulty as ChallengeDifficulty] ??
    "bg-surface-secondary text-text-secondary";

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setRevealed((open) => !open)}
        aria-expanded={revealed}
        aria-controls={answerId}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="flex-1 text-sm font-medium text-text-primary">
              {question.question}
            </span>
            {rating && (
              <CheckCircle2
                className={cn(
                  "h-4 w-4 shrink-0",
                  rating === "knew" ? "text-success" : "text-warning",
                )}
                aria-hidden
              />
            )}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold capitalize",
                badgeStyle,
              )}
            >
              {question.difficulty}
            </span>
            {question.companies.map((company) => (
              <span
                key={company}
                className="rounded-full bg-surface-secondary px-2 py-0.5 text-[0.6875rem] font-medium text-text-muted"
              >
                {company}
              </span>
            ))}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-text-muted transition-transform",
            revealed && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            id={answerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-4">
              <Markdown markdown={question.answer} />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-text-muted">
                  How did you do?
                </span>
                <RatingButton
                  active={rating === "knew"}
                  activeClass="bg-success-muted text-success"
                  onClick={() => onRate("knew")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  I knew this
                </RatingButton>
                <RatingButton
                  active={rating === "review"}
                  activeClass="bg-warning-muted text-warning"
                  onClick={() => onRate("review")}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Need to review
                </RatingButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RatingButton({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? activeClass
          : "border border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

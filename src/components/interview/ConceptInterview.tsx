"use client";

import { useRef, useState } from "react";

import { CheckCircle2, Users } from "lucide-react";

import { MoreInterviewPrepCta } from "@/features/interview-prep/components/MoreInterviewPrepCta";
import {
  QuestionCard,
  type QuestionRating,
} from "@/features/interview-prep/components/QuestionCard";
import type { InterviewQuestionData } from "@/features/learn/lib/queries";

// isLocked is computed server-side (page.tsx) from isPremium + the viewer's
// premium status — see security.md, premium gating is never client-side only.
type ClientInterviewQuestion = InterviewQuestionData & { isLocked: boolean };

type Props = {
  questions: ClientInterviewQuestion[];
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
  initialRatings: Record<string, QuestionRating>;
};

// components/-layer host for a concept's Interview tab — lives here (not
// features/interview-prep) so it can bridge the features/learn query type to the
// interview-prep presentational components, the same components/ → features/
// crossing ConceptChallenge and ConceptSimulator use (a feature importing another
// feature is forbidden). Owns the local self-assessment ratings, the "X of Y
// answered" progress, and the fire-once completion POST (silent for logged-out
// users — same contract as the Simulate and Challenge tabs).
export function ConceptInterview({
  questions,
  conceptId,
  isLoggedIn,
  initialCompleted,
  initialRatings,
}: Props) {
  const [ratings, setRatings] = useState<Record<string, QuestionRating>>(initialRatings);
  const [completed, setCompleted] = useState(initialCompleted);
  // Questions whose rating failed to persist server-side (surfaced inline on
  // the card so the user knows to retry — see handleRate/postRating below).
  const [failedRatingIds, setFailedRatingIds] = useState<Set<string>>(new Set());
  // Fire-once guard for the completion POST, mirroring ConceptChallenge.
  const hasPostedRef = useRef(initialCompleted);

  const hasQuestions = questions.length > 0;
  // Premium-locked questions can't be rated (no visible answer to assess), so
  // they're excluded from the denominator — completion means "answered every
  // question you can actually see." Currently always equal to questions.length
  // (no concept-linked question is premium yet), but this keeps the count
  // correct the moment one is.
  const total = questions.filter((q) => !q.isLocked).length;
  const answeredCount = Object.keys(ratings).length;
  // A returning user normally has ratings restored via initialRatings, so this
  // is rare — but a legacy completion from before ratings were persisted (or a
  // save that failed every time) can still leave completed=true with nothing
  // rated this session. Showing the green "Completed" pill next to "0 of N
  // answered" would read as contradictory, so the pill only appears once this
  // session's own progress actually reflects completion.
  const showCompletedPill = completed && total > 0 && answeredCount === total;
  const showPreviouslyCompletedNote =
    completed && total > 0 && !showCompletedPill && answeredCount === 0;

  async function postCompletion() {
    // Logged-out users see their local progress but nothing is written (and
    // they aren't bounced to login mid-tab — same contract as Simulate/Challenge).
    if (!isLoggedIn || hasPostedRef.current) return;
    hasPostedRef.current = true;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, tab: "interview" }),
      });
      if (!res.ok) {
        hasPostedRef.current = false; // allow a retry once every question is rated again
        return;
      }
      setCompleted(true);
    } catch {
      hasPostedRef.current = false;
    }
  }

  // Best-effort persistence so the rating survives a tab switch or reload —
  // logged-out users still get the local-only experience (silent no-op, same
  // contract as postCompletion). Not fire-once: re-rating an already-rated
  // question is a deliberate action and the route upserts. A failure here is
  // never silently swallowed — it's logged and surfaced inline on the card
  // (via failedRatingIds) so the user knows to retry, rather than the local
  // "saved" checkmark quietly lying about what's actually in the database.
  async function postRating(questionId: string, rating: QuestionRating) {
    try {
      const res = await fetch("/api/interview-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, rating }),
      });
      if (!res.ok) {
        console.error("[interview-rating] Save failed:", res.status);
        setFailedRatingIds((prev) => new Set(prev).add(questionId));
        return;
      }
      setFailedRatingIds((prev) => {
        if (!prev.has(questionId)) return prev;
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    } catch (error) {
      console.error("[interview-rating] Network error:", error);
      setFailedRatingIds((prev) => new Set(prev).add(questionId));
    }
  }

  function handleRate(questionId: string, rating: QuestionRating) {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
    if (isLoggedIn) void postRating(questionId, rating);
    // Fire the completion POST the moment the last unrated question is rated.
    // Computed from the pre-update snapshot + this id so we never depend on an
    // effect (the fire-once ref keeps re-rates from double-posting).
    const answeredIds = new Set(Object.keys(ratings));
    answeredIds.add(questionId);
    if (total > 0 && answeredIds.size === total) void postCompletion();
  }

  if (!hasQuestions) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
          <Users className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-text-primary">
          Interview questions coming soon
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
          We&apos;re still writing the interview questions for this concept. Check back
          soon.
        </p>
        <div className="mt-6 w-full max-w-md">
          <MoreInterviewPrepCta />
        </div>
      </div>
    );
  }

  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Interview Questions</h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              {total > 0
                ? `Reveal each answer, then mark how you did. Answer all ${total} to complete this tab.`
                : "These questions are part of Premium. Upgrade to unlock them."}
            </p>
          </div>
          {showCompletedPill && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-success-muted px-3 py-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Completed
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-surface-secondary"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={answeredCount}
              aria-label="Questions answered"
            >
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium text-text-secondary tabular-nums">
              {answeredCount} of {total} answered
            </span>
          </div>
        )}
        {showPreviouslyCompletedNote && (
          <p className="text-xs text-text-muted">
            You&apos;ve completed this tab before — rate the questions again to refresh
            your memory.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((question, i) => (
          <QuestionCard
            key={question.id}
            index={i + 1}
            question={question}
            rating={ratings[question.id]}
            onRate={(rating) => handleRate(question.id, rating)}
            saveFailed={failedRatingIds.has(question.id)}
          />
        ))}
      </div>

      <MoreInterviewPrepCta />
    </div>
  );
}

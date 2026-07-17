import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getCachedSession } from "@/lib/auth/server";
import { getDueReviewSession, getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import { ReviewSession } from "@/features/interview-prep/components/ReviewSession";

export const metadata: Metadata = {
  title: "Review Session | Frontend Forever",
  description: "Work through your due spaced-repetition interview questions, one at a time.",
};

// Personalization, not premium — gated by login only (Feature 30's Review
// Queue precedent). Not in proxy.ts's matcher (that list is deliberately
// short — leaderboard/settings/profile), so the gate lives here instead.
export default async function ReviewSessionPage() {
  const session = await getCachedSession();
  if (!session?.user) {
    redirect("/login?callbackURL=/interview-prep/review");
  }

  const userId = session.user.id;
  const [questions, isPremiumUser] = await Promise.all([
    getDueReviewSession(userId),
    getIsPremiumUser(userId),
  ]);

  // Server-side premium gate (security.md — never client-side only): strip
  // the answer and flag isLocked, same pattern as ConceptInterview/QuestionCard.
  const clientQuestions = questions.map((q) => {
    const isLocked = q.isPremium && !isPremiumUser;
    return { ...q, answer: isLocked ? "" : q.answer, isLocked };
  });

  if (clientQuestions.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-muted text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-text-primary">You&apos;re all caught up</h1>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          No questions are due for review right now. Rate a few questions on any concept&apos;s
          Interview tab and they&apos;ll show up here when they&apos;re due again.
        </p>
        <Link
          href="/interview-prep"
          className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Back to Interview Prep
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-8">
      <ReviewSession questions={clientQuestions} />
    </div>
  );
}

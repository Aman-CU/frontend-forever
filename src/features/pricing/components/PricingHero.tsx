"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { CATALOG } from "@/features/pricing/lib/catalog";
import type { PricingViewerState } from "@/features/pricing/lib/viewer";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// Three concrete numbers beat one vague superlative. Each is a real count —
// see catalog.ts for where every figure comes from.
const PROOF_POINTS = [
  `${CATALOG.interviewQuestions} interview questions`,
  `${CATALOG.codingChallenges} coding challenges`,
  `${CATALOG.systemDesignGuides} system design guides`,
];

type Props = {
  viewerState: PricingViewerState;
};

export function PricingHero({ viewerState }: Props) {
  const isPremium = viewerState === "premium";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-4 pt-14 text-center md:px-8 md:pt-20">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={
          isPremium
            ? "inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-1.5 text-xs font-semibold text-success md:text-sm"
            : "inline-flex items-center gap-2 rounded-full bg-premium-light px-4 py-1.5 text-xs font-semibold text-premium md:text-sm"
        }
      >
        {isPremium ? (
          <>
            <Check className="size-3.5" aria-hidden />
            You&apos;re on Premium — everything below is already unlocked
          </>
        ) : (
          <>
            <Sparkles className="size-3.5" aria-hidden />
            One plan. Every premium feature on the platform.
          </>
        )}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl"
      >
        <span className="block">Stop guessing what</span>
        <span className="block text-text-secondary">interviewers will ask.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
        className="mt-5 max-w-xl text-base text-text-secondary md:text-lg"
      >
        Premium opens every locked concept, challenge, guide and study plan on Frontend
        Forever — the questions real companies ask, with solutions written out in full.
      </motion.p>

      <motion.ul
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
        className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        {PROOF_POINTS.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm text-text-secondary">
            <Check className="size-4 shrink-0 text-accent" aria-hidden />
            {point}
          </li>
        ))}
      </motion.ul>
    </section>
  );
}

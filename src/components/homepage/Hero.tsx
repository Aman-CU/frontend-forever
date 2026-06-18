"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ConceptSwitcherTabs } from "@/components/homepage/ConceptSwitcherTabs";
import { HeroSimulatorPreview } from "@/components/homepage/HeroSimulatorPreview";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-16 pb-12 text-center md:px-8 md:pt-24">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="inline-flex items-center gap-2 rounded-full bg-accent-muted px-4 py-1.5 text-xs font-medium text-accent md:text-sm"
      >
        <span>Interactive Learning</span>
        <span aria-hidden="true">•</span>
        <span>Real Challenges</span>
        <span aria-hidden="true">•</span>
        <span>Interview Ready</span>
      </motion.span>

      <h1 className="mt-6 max-w-6xl text-4xl leading-[1.1] font-bold sm:text-5xl lg:text-5xl">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="block text-text-primary"
        >
          Frontend Interview-Ready Concepts
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
          className="block text-accent"
        >
          You Can Play With.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
        className="mt-6 max-w-2xl text-base text-text-secondary md:text-lg"
      >
        Visualize how frontend concepts work under the hood, solve real
        engineering challenges, and prepare for interviews at top technology
        companies.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Link
          href="/learn"
          className={cn(buttonVariants(), "h-auto px-6 py-3 text-base font-semibold")}
        >
          Start Learning →
        </Link>
        <Link
          href="/roadmaps"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto px-6 py-3 text-base font-semibold",
          )}
        >
          Explore Roadmaps
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
        className="mt-12"
      >
        <ConceptSwitcherTabs />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
        className="mt-6 w-full"
      >
        <HeroSimulatorPreview />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1 },
          y: { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="mt-12 flex flex-col items-center gap-1 text-xs text-text-muted"
      >
        <span>Scroll to explore</span>
        <ChevronDown className="size-4" />
      </motion.div>
    </section>
  );
}

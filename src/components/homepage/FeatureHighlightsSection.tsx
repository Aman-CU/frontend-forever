"use client";

import { motion } from "framer-motion";
import { Code2, Eye, Hammer, MessageCircleQuestion } from "lucide-react";

import { ChallengeEditorMiniVisual } from "@/components/homepage/feature-highlights/ChallengeEditorMiniVisual";
import { FeatureCard, type FeatureHighlight } from "@/components/homepage/feature-highlights/FeatureCard";
import { InterviewPrepMiniVisual } from "@/components/homepage/feature-highlights/InterviewPrepMiniVisual";
import { PlatformGraph } from "@/components/homepage/feature-highlights/PlatformGraph";
import { ProjectEditorMiniVisual } from "@/components/homepage/feature-highlights/ProjectEditorMiniVisual";
import { SpecificityMiniVisual } from "@/components/homepage/feature-highlights/SpecificityMiniVisual";

const FEATURES: FeatureHighlight[] = [
  {
    id: "see",
    title: "Concepts You Can See",
    shortLabel: "Simulators",
    description:
      "Four interactive simulators — Event Loop, React Rendering, Browser Pipeline, CSS Specificity — turn abstract rules into something you can watch run, step by step.",
    icon: Eye,
    color: "accent",
    Visual: SpecificityMiniVisual,
  },
  {
    id: "challenges",
    title: "Real Engineering Challenges",
    shortLabel: "Challenges",
    description:
      "Solve the problems real frontend system design interviews ask — virtualized lists, rate-limited search, infinite scroll — in a real code editor with instant feedback.",
    icon: Code2,
    color: "info",
    Visual: ChallengeEditorMiniVisual,
  },
  {
    id: "interview",
    title: "Interview-Ready Questions",
    shortLabel: "Interview Prep",
    description:
      "Practice from FF 75, FF JavaScript, FF React, and FF Frontend System Design — premium questions documented from real interviews at top companies, not generic multiple choice.",
    icon: MessageCircleQuestion,
    color: "premium",
    Visual: InterviewPrepMiniVisual,
  },
  {
    id: "build",
    title: "Build Real Things",
    shortLabel: "Projects",
    description:
      "Ship a finished project — a Kanban board, a component library, a mini dashboard — not just a function that happens to pass a unit test.",
    icon: Hammer,
    color: "success",
    Visual: ProjectEditorMiniVisual,
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function FeatureHighlightsSection() {
  const [hero, ...rest] = FEATURES;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16 text-center md:px-8 md:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-2xl font-bold text-text-primary md:text-3xl"
      >
        What Makes Frontend Forever Different
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="mt-3 max-w-xl text-base text-text-secondary"
      >
        Simulators you can run, challenges you can solve, premium interview questions from real
        companies, and projects you can ship — all in one platform.
      </motion.p>

      <PlatformGraph />

      <div className="mt-16 flex w-full flex-col gap-6 md:mt-20">
        <FeatureCard feature={hero} hero />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {rest.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delay={0.1 * (index + 1)} />
          ))}
        </div>
      </div>
    </section>
  );
}

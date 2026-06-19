"use client";

import { motion } from "framer-motion";
import { Code2, Eye, Hammer, MessageCircleQuestion } from "lucide-react";

import { CodeSnippetMiniVisual } from "@/components/homepage/feature-highlights/CodeSnippetMiniVisual";
import { EditorMiniVisual } from "@/components/homepage/feature-highlights/EditorMiniVisual";
import { FeatureCard, type FeatureHighlight } from "@/components/homepage/feature-highlights/FeatureCard";
import { QAMiniVisual } from "@/components/homepage/feature-highlights/QAMiniVisual";
import { SimulatorMiniVisual } from "@/components/homepage/feature-highlights/SimulatorMiniVisual";

const FEATURES: FeatureHighlight[] = [
  {
    id: "see",
    title: "Concepts You Can See",
    description:
      "Every concept runs in a live simulator you can watch and control — not a static diagram you have to imagine.",
    icon: Eye,
    color: "accent",
    Visual: SimulatorMiniVisual,
  },
  {
    id: "challenges",
    title: "Real Engineering Challenges",
    description:
      "Code, test, and ship inside the browser. Get instant feedback the moment your tests pass or fail.",
    icon: Code2,
    color: "info",
    Visual: CodeSnippetMiniVisual,
  },
  {
    id: "interview",
    title: "Interview-Ready Questions",
    description:
      "Practice the exact questions companies ask, with spaced repetition that keeps the answers fresh.",
    icon: MessageCircleQuestion,
    color: "premium",
    Visual: QAMiniVisual,
  },
  {
    id: "build",
    title: "Build Real Things",
    description:
      "Turn what you learned into a finished project you can point to — not just a checkbox you ticked.",
    icon: Hammer,
    color: "success",
    Visual: EditorMiniVisual,
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
        Live simulators, real engineering challenges, and interview-ready practice — built to
        stick, not just to read.
      </motion.p>

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

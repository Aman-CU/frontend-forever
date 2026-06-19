"use client";

import { motion } from "framer-motion";

import { StepSection, type LearningStep } from "@/components/homepage/how-it-works/StepSection";
import { BuildPreview } from "@/components/homepage/how-it-works/BuildPreview";
import { ChallengePreview } from "@/components/homepage/how-it-works/ChallengePreview";
import { InterviewPreview } from "@/components/homepage/how-it-works/InterviewPreview";
import { SimulatePreview } from "@/components/homepage/how-it-works/SimulatePreview";
import { UnderstandPreview } from "@/components/homepage/how-it-works/UnderstandPreview";

const STEPS: LearningStep[] = [
  {
    id: "understand",
    title: "Understand",
    description: "Learn the concept through clear explanations and key insights.",
    iconSrc: "/icons/how-it-works/bulb-icon.svg",
    iconWidth: 1040,
    iconHeight: 1512,
    color: "accent",
    Preview: UnderstandPreview,
  },
  {
    id: "simulate",
    title: "Simulate",
    description: "Watch the concept run step by step in an interactive simulator.",
    iconSrc: "/icons/how-it-works/sync-arrow-icon.svg",
    iconWidth: 1024,
    iconHeight: 1536,
    color: "info",
    Preview: SimulatePreview,
  },
  {
    id: "challenge",
    title: "Challenge",
    description: "Apply what you learned by solving real engineering challenges.",
    iconSrc: "/icons/how-it-works/trophy-icon.svg",
    iconWidth: 1024,
    iconHeight: 1536,
    color: "premium",
    Preview: ChallengePreview,
  },
  {
    id: "interview",
    title: "Interview",
    description: "Practice the interview questions companies actually ask.",
    iconSrc: "/icons/how-it-works/chat-bubble-icon.svg",
    iconWidth: 1024,
    iconHeight: 1536,
    color: "success",
    Preview: InterviewPreview,
  },
  {
    id: "build",
    title: "Build",
    description: "Ship a real project that proves you understand the concept.",
    iconSrc: "/icons/how-it-works/wrench-icon.svg",
    iconWidth: 1024,
    iconHeight: 1536,
    color: "streak",
    Preview: BuildPreview,
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16 text-center md:px-8 md:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-2xl font-bold text-text-primary md:text-3xl"
      >
        The Learning Model
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="mt-3 max-w-xl text-base text-text-secondary"
      >
        Five steps that turn abstract frontend concepts into skills you can use in an
        interview.
      </motion.p>

      <div className="mt-20 flex w-full flex-col gap-24 md:mt-24 md:gap-32">
        {STEPS.map((step, index) => (
          <StepSection key={step.id} step={step} reversed={index % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

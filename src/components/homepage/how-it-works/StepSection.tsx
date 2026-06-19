"use client";

import { type ComponentType } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedHeading } from "@/components/homepage/how-it-works/AnimatedHeading";

export type ThemeColor = "accent" | "info" | "premium" | "success" | "streak";

export type LearningStep = {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
  color: ThemeColor;
  Preview: ComponentType;
};

const THEME_CLASSES: Record<ThemeColor, { badge: string; text: string; blob: string }> = {
  accent: { badge: "bg-accent-light text-accent-dark", text: "text-accent", blob: "bg-accent" },
  info: { badge: "bg-info-light text-info", text: "text-info", blob: "bg-info" },
  premium: { badge: "bg-premium-light text-premium", text: "text-premium", blob: "bg-premium" },
  success: {
    badge: "bg-success-light text-success-dark",
    text: "text-success",
    blob: "bg-success",
  },
  streak: { badge: "bg-streak-light text-streak", text: "text-streak", blob: "bg-streak" },
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type StepSectionProps = {
  step: LearningStep;
  reversed: boolean;
};

export function StepSection({ step, reversed }: StepSectionProps) {
  const Preview = step.Preview;
  const theme = THEME_CLASSES[step.color];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-20",
        reversed && "lg:flex-row-reverse",
      )}
    >
      <div className="flex w-full flex-col items-start gap-5 text-left lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative flex items-center justify-center"
        >
          <div
            aria-hidden="true"
            className={cn("absolute size-28 rounded-full opacity-40 blur-2xl", theme.blob)}
          />
          <motion.span
            animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Image
              src={step.iconSrc}
              width={step.iconWidth}
              height={step.iconHeight}
              alt=""
              unoptimized
              className="h-20 w-auto md:h-24"
            />
          </motion.span>
        </motion.div>
        <h3 className="text-4xl font-bold text-text-primary md:text-5xl">
          <AnimatedHeading text={step.title} swapColorClassName={theme.text} />
        </h3>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          className="max-w-md text-base text-text-secondary md:text-lg"
        >
          {step.description}
        </motion.p>
      </div>
      <div className="relative flex w-full justify-center pt-4 lg:w-1/2">
        <div
          aria-hidden="true"
          className={cn("absolute size-64 rounded-full opacity-20 blur-3xl", theme.blob)}
        />
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute -top-3 -right-2 flex size-9 items-center justify-center rounded-full",
            theme.badge,
          )}
        >
          <Sparkles className="size-4" aria-hidden="true" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className={cn(
            "absolute bottom-2 -left-3 flex size-7 items-center justify-center rounded-full",
            theme.badge,
          )}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </motion.span>
        <div className="relative">
          <Preview />
        </div>
      </div>
    </div>
  );
}

"use client";

import { type ComponentType } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type FeatureThemeColor = "accent" | "info" | "premium" | "success";

export type FeatureHighlight = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: FeatureThemeColor;
  Visual: ComponentType;
};

const THEME_CLASSES: Record<FeatureThemeColor, { card: string; glow: string; icon: string }> = {
  accent: { card: "bg-accent-light", glow: "bg-accent", icon: "text-accent" },
  info: { card: "bg-info-light", glow: "bg-info", icon: "text-info" },
  premium: { card: "bg-premium-light", glow: "bg-premium", icon: "text-premium" },
  success: { card: "bg-success-light", glow: "bg-success", icon: "text-success" },
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type FeatureCardProps = {
  feature: FeatureHighlight;
  hero?: boolean;
  delay?: number;
};

export function FeatureCard({ feature, hero, delay = 0 }: FeatureCardProps) {
  const Icon = feature.icon;
  const Visual = feature.Visual;
  const theme = THEME_CLASSES[feature.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={cn(
        "flex w-full flex-col gap-6 rounded-3xl p-8 shadow-sm",
        theme.card,
        hero ? "lg:flex-row lg:items-center lg:gap-12" : "items-start text-left",
      )}
    >
      <div className={cn("flex flex-col gap-3", hero ? "lg:w-2/5" : "w-full")}>
        <div className="relative flex size-14 items-center justify-center">
          <div
            aria-hidden="true"
            className={cn("absolute size-20 rounded-full opacity-30 blur-xl", theme.glow)}
          />
          <Icon
            className={cn("relative", hero ? "size-10" : "size-7", theme.icon)}
            aria-hidden="true"
          />
        </div>
        <h3
          className={cn(
            "font-semibold text-text-primary",
            hero ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          {feature.title}
        </h3>
        <p className={cn("text-text-secondary", hero ? "text-base md:text-lg" : "text-sm")}>
          {feature.description}
        </p>
      </div>
      <div className={cn("flex justify-center", hero ? "lg:w-3/5" : "w-full")}>
        <Visual />
      </div>
    </motion.div>
  );
}

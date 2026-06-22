"use client";

import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import type { StageStatus } from "../types";

export type SpecificityColor = "accent" | "info" | "premium" | "streak" | "success";

export const SPECIFICITY_THEME: Record<
  SpecificityColor,
  { text: string; bg: string; ring: string; dot: string }
> = {
  accent: { text: "text-accent", bg: "bg-accent-light", ring: "border-accent", dot: "bg-accent" },
  info: { text: "text-info", bg: "bg-info-light", ring: "border-info", dot: "bg-info" },
  premium: { text: "text-premium", bg: "bg-premium-light", ring: "border-premium", dot: "bg-premium" },
  streak: { text: "text-streak", bg: "bg-streak-light", ring: "border-streak", dot: "bg-streak" },
  success: { text: "text-success", bg: "bg-success-light", ring: "border-success", dot: "bg-success" },
};

type SpecificityCardProps = {
  icon: LucideIcon;
  title: string;
  color: SpecificityColor;
  status: StageStatus;
  captionNumber: number;
  captionTitle: string;
  captionSubtext: string;
  children: ReactNode;
};

// Mirrors react-rendering's StageCard / browser-pipeline's PipelineCard
// (ping-dot for "active", dashed/faded for "pending") deliberately
// re-implemented here rather than imported — each simulator owns its own
// components per the project's self-containment invariant.
export function SpecificityCard({
  icon: Icon,
  title,
  color,
  status,
  captionNumber,
  captionTitle,
  captionSubtext,
  children,
}: SpecificityCardProps) {
  const theme = SPECIFICITY_THEME[color];
  const prefersReducedMotion = useSafeReducedMotion();
  const isPending = status === "pending";

  return (
    <div className="flex h-full flex-col gap-1.5">
      <div
        className={cn(
          "flex h-full min-h-[260px] flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition-colors duration-300",
          status === "active" && theme.ring,
          isPending && "border-dashed border-border-light opacity-60",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold",
            isPending ? "text-text-muted" : theme.text,
          )}
        >
          <Icon className="size-3.5" />
          {title}
          {status === "active" && (
            <span className="relative ml-auto flex size-1.5" aria-hidden="true">
              {!prefersReducedMotion && (
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                    theme.dot,
                  )}
                />
              )}
              <span className={cn("relative inline-flex size-1.5 rounded-full", theme.dot)} />
            </span>
          )}
          {status === "done" && (
            <span className={cn("ml-auto size-1.5 rounded-full", theme.dot)} aria-hidden="true" />
          )}
        </div>

        {children}
      </div>

      <div className="px-1 text-center">
        <p className="text-[11px] font-semibold text-text-primary">
          {captionNumber}. {captionTitle}
        </p>
        <p className="text-[10px] text-text-muted">{captionSubtext}</p>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import type { CardStatus } from "../types";

export type StageColor = "premium" | "info" | "success" | "streak" | "accent";

export const STAGE_THEME: Record<
  StageColor,
  { text: string; bg: string; ring: string; dot: string }
> = {
  premium: { text: "text-premium", bg: "bg-premium-light", ring: "border-premium", dot: "bg-premium" },
  info: { text: "text-info", bg: "bg-info-light", ring: "border-info", dot: "bg-info" },
  success: { text: "text-success", bg: "bg-success-light", ring: "border-success", dot: "bg-success" },
  streak: { text: "text-streak", bg: "bg-streak-light", ring: "border-streak", dot: "bg-streak" },
  accent: { text: "text-accent", bg: "bg-accent-light", ring: "border-accent", dot: "bg-accent" },
};

type CardZonesProps = {
  topLabel: ReactNode;
  bottomNote?: ReactNode;
  children: ReactNode;
};

// Shared 3-row internal layout (label / visual / note), each a fixed-height
// row regardless of content — this is what keeps every card's label and
// note aligned to the same y-position even though the visuals in between
// vary wildly in size (a single count box vs. two side-by-side trees).
export function CardZones({ topLabel, bottomNote, children }: CardZonesProps) {
  return (
    <>
      <div className="flex h-5 items-center justify-center text-center text-xs text-text-muted">
        {topLabel}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">{children}</div>
      <div className="flex h-5 items-center justify-center text-center text-xs font-medium text-text-muted">
        {bottomNote}
      </div>
    </>
  );
}

type StageCardProps = {
  icon: LucideIcon;
  title: string;
  color: StageColor;
  status: CardStatus;
  captionNumber: number;
  captionTitle: string;
  captionSubtext: string;
  children: ReactNode;
};

export function StageCard({
  icon: Icon,
  title,
  color,
  status,
  captionNumber,
  captionTitle,
  captionSubtext,
  children,
}: StageCardProps) {
  const theme = STAGE_THEME[color];
  const prefersReducedMotion = useSafeReducedMotion();
  const isPending = status === "pending";

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        className={cn(
          "flex h-full min-h-[340px] flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors duration-300",
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
        <p className="text-xs font-semibold text-text-primary">
          {captionNumber}. {captionTitle}
        </p>
        <p className="text-[11px] text-text-muted">{captionSubtext}</p>
      </div>
    </div>
  );
}

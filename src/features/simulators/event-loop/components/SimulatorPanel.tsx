"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useSafeReducedMotion } from "../hooks/useSafeReducedMotion";
import type { PanelItem, PanelTheme } from "../types";

type SimulatorPanelProps = {
  title: string;
  icon: LucideIcon;
  theme: PanelTheme;
  items: PanelItem[];
  emptyLabel: string;
  /** Build-plan calls for a pulse highlight on the active Call Stack item specifically. */
  pulse?: boolean;
};

const THEME_CLASSES: Record<PanelTheme, { text: string; bg: string; dot: string }> = {
  premium: { text: "text-premium", bg: "bg-premium-light", dot: "bg-premium" },
  success: { text: "text-success", bg: "bg-success-light", dot: "bg-success" },
  info: { text: "text-info", bg: "bg-info-light", dot: "bg-info" },
  streak: { text: "text-streak", bg: "bg-streak-light", dot: "bg-streak" },
};

export function SimulatorPanel({
  title,
  icon: Icon,
  theme,
  items,
  emptyLabel,
  pulse = false,
}: SimulatorPanelProps) {
  const themeClasses = THEME_CLASSES[theme];
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <div className="flex min-h-[130px] flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
          themeClasses.text,
        )}
      >
        <Icon className="size-3.5" />
        {title}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-xs text-text-muted">{emptyLabel}</p>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.code}
                layout
                layoutId={`event-loop-item-${item.code}`}
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn("rounded-md px-3 py-2", themeClasses.bg)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate font-mono text-xs", themeClasses.text)}>
                    {item.code}
                  </p>
                  {pulse && !prefersReducedMotion ? (
                    <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
                      <span
                        className={cn(
                          "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                          themeClasses.dot,
                        )}
                      />
                      <span className={cn("relative inline-flex size-1.5 rounded-full", themeClasses.dot)} />
                    </span>
                  ) : (
                    <span
                      className={cn("size-1.5 shrink-0 rounded-full", themeClasses.dot)}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-text-muted">{item.status}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

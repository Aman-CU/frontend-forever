"use client";

import { useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Lock, LockOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryMeta, ColorKey } from "@/features/learn/lib/categoryMeta";
import type { CategorySummary } from "@/features/learn/lib/queries";

type Props = {
  category: CategorySummary;
  meta: CategoryMeta;
  pathname: string;
  isPremiumUser: boolean;
};

const ICON_BG: Record<ColorKey, string> = {
  accent: "bg-accent-muted",
  info: "bg-info-muted",
  premium: "bg-premium-light",
  success: "bg-success-muted",
  streak: "bg-streak-light",
  xp: "bg-xp-light",
};

const ICON_TEXT: Record<ColorKey, string> = {
  accent: "text-accent",
  info: "text-info",
  premium: "text-premium",
  success: "text-success",
  streak: "text-streak",
  xp: "text-xp",
};

export function CategoryAccordionItem({ category, meta, pathname, isPremiumUser }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { icon: Icon, label, colorKey, badge, badgeStyle } = meta;

  return (
    <div className="px-2 py-0.5">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-secondary"
      >
        {/* Category icon / text badge */}
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            badgeStyle ? badgeStyle.bg : ICON_BG[colorKey],
          )}
        >
          {badge ? (
            <span
              className={cn(
                "text-[10px] font-bold leading-none",
                badgeStyle ? badgeStyle.text : ICON_TEXT[colorKey],
              )}
            >
              {badge}
            </span>
          ) : (
            <Icon className={cn("h-3.5 w-3.5", ICON_TEXT[colorKey])} aria-hidden />
          )}
        </div>

        <span className="flex-1 truncate text-sm font-medium text-text-primary">{label}</span>

        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200",
            isOpen && "rotate-90",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pb-1 pt-0.5 pl-1">
              {category.concepts.length === 0 ? (
                <p className="px-3 py-2 text-xs text-text-muted">No concepts yet.</p>
              ) : (
                category.concepts.map((concept) => {
                  const href = `/learn/${category.category}/${concept.slug}`;
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={concept.id}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "rounded-l-none border-l-2 border-accent bg-accent-muted font-medium text-accent"
                          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                      )}
                    >
                      {/* Status circle */}
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                          isActive
                            ? "bg-text-primary"
                            : concept.isCompleted
                              ? "bg-success"
                              : "border border-border bg-transparent",
                        )}
                        aria-hidden
                      >
                        {(isActive || concept.isCompleted) && (
                          <Check className="h-2 w-2 text-accent-foreground" />
                        )}
                      </span>

                      <span className="flex-1 truncate">{concept.title}</span>

                      {concept.isPremium &&
                        (isPremiumUser ? (
                          <LockOpen className="h-3 w-3 shrink-0 text-premium" aria-label="Premium (unlocked)" />
                        ) : (
                          <Lock className="h-3 w-3 shrink-0 text-text-muted" aria-label="Premium" />
                        ))}
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

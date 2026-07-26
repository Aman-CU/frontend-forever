"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code2, Compass, HelpCircle, Newspaper, Video, X, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeLinkView, RoadmapNodeView } from "@/features/roadmaps/lib/queries";

type Props = {
  node: RoadmapNodeView | null;
  onClose: () => void;
  onToggleComplete: (node: RoadmapNodeView, completed: boolean) => void;
  isLoggedIn: boolean;
  isSaving: boolean;
};

const LINK_ICON: Record<RoadmapNodeLinkView["linkType"], LucideIcon> = {
  "learn-concept": BookOpen,
  "practice-challenge": Code2,
  "interview-question": HelpCircle,
  "external-video": Video,
  "external-article": Newspaper,
  "internal-page": Compass,
};

const LINK_GROUP_LABEL: Record<RoadmapNodeLinkView["linkType"], string> = {
  "learn-concept": "Learn",
  "practice-challenge": "Practice",
  "interview-question": "Interview questions",
  "external-video": "Watch",
  "external-article": "Read",
  "internal-page": "On Frontend Forever",
};

export function RoadmapNodePanel({ node, onClose, onToggleComplete, isLoggedIn, isSaving }: Props) {
  const hasConceptLink = node?.links.some((l) => l.linkType === "learn-concept") ?? false;
  const linksByType = new Map<RoadmapNodeLinkView["linkType"], RoadmapNodeLinkView[]>();
  for (const link of node?.links ?? []) {
    const list = linksByType.get(link.linkType) ?? [];
    list.push(link);
    linksByType.set(link.linkType, list);
  }

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto border-l border-border bg-surface p-6 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-text-primary">{node.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-surface-secondary hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {node.isOptional && (
              <span className="mt-2 inline-block rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-muted">
                Optional
              </span>
            )}

            {node.description && (
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{node.description}</p>
            )}

            <div className="mt-6 space-y-5">
              {[...linksByType.entries()].map(([linkType, links]) => {
                const Icon = LINK_ICON[linkType];
                return (
                  <div key={linkType}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      {LINK_GROUP_LABEL[linkType]}
                    </h3>
                    <ul className="space-y-1.5">
                      {links.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.href}
                            target={linkType.startsWith("external") ? "_blank" : undefined}
                            rel={linkType.startsWith("external") ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                            <span className="line-clamp-2">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              {hasConceptLink ? (
                node.isCompleted && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Completed via Learn
                  </span>
                )
              ) : (
                <button
                  type="button"
                  disabled={!isLoggedIn || isSaving}
                  onClick={() => onToggleComplete(node, !node.isCompleted)}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                    node.isCompleted
                      ? "border-success/50 bg-success-muted/40 text-success"
                      : "border-border text-text-secondary hover:border-accent hover:text-accent",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {node.isCompleted ? "Marked as done" : isLoggedIn ? "Mark as done" : "Log in to track progress"}
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

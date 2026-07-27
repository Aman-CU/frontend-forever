"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code2, Compass, HelpCircle, Newspaper, Video, X, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoadmapNodeLinkView, RoadmapNodeView } from "@/features/roadmaps/lib/queries";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

  const panelRef = useRef<HTMLElement>(null);
  // Read through a ref, not a direct effect dependency — RoadmapDetailView
  // passes a fresh onClose closure every render (it's an inline arrow
  // function), so depending on it directly would re-run this effect (and
  // re-steal focus into the panel) on every unrelated parent re-render,
  // including the optimistic re-render a "Mark as done" click itself causes.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Dialog semantics for a hand-rolled drawer — no side-drawer primitive
  // exists in this codebase's Dialog/base-ui setup yet (see the comment on
  // the aside below), so this doesn't get Base UI's built-in focus-trap/
  // Escape/aria wiring for free. Moves focus into the panel on open, traps
  // Tab/Shift+Tab inside it, closes on Escape, and restores focus to
  // whatever triggered the panel on close.
  useEffect(() => {
    if (!node) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
    // Keyed on node.id (a stable primitive), not the node object itself —
    // the currently-open node's own fields (e.g. isCompleted) can mutate in
    // place from the toggle above without this re-running and stealing
    // focus back to the panel mid-interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-node-panel-title"
            tabIndex={-1}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto border-l border-border bg-surface p-6 shadow-xl outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="roadmap-node-panel-title" className="text-lg font-semibold text-text-primary">
                {node.title}
              </h2>
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

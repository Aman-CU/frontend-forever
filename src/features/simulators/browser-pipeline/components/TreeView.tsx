"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { TreeNode } from "../types";

const DEPTH_DELAY = 0.3;
const SIBLING_STAGGER = 0.12;

type TreeViewProps = {
  node: TreeNode;
  depth?: number;
  /** Sibling index within this node's own parent — drives the build stagger. */
  index?: number;
  /** How many levels deep to reveal. Infinity = full tree. */
  revealDepth: number;
  prefersReducedMotion: boolean;
};

// Recursive tree renderer reused for the DOM/CSSOM partial reveals (via
// ParseTrack) and the merged Render Tree. Self-contained to this simulator —
// react-rendering has its own, simpler MiniTree for a fixed 2-node shape,
// this one needs arbitrary depth/branching.
//
// Two things this renders deliberately, per user feedback that the first
// version "wasn't a properly built tree": (1) a real org-chart connector —
// a horizontal bar spanning siblings with a vertical drop to each one, not
// just one shared tick under the whole row; (2) each node mounts with a
// staggered entrance (delay = depth * DEPTH_DELAY + index * SIBLING_STAGGER)
// so the tree visibly builds level by level, left to right, instead of an
// entire revealed level appearing as one instant block of text.
export function TreeView({
  node,
  depth = 0,
  index = 0,
  revealDepth,
  prefersReducedMotion,
}: TreeViewProps) {
  if (depth > revealDepth) return null;

  const children = node.children ?? [];
  const showChildren = children.length > 0 && depth < revealDepth;
  const delay = depth * DEPTH_DELAY + index * SIBLING_STAGGER;

  return (
    <div className="flex flex-col items-center">
      <motion.span
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, delay }}
        className={cn(
          "rounded-md border px-1.5 py-1 font-mono text-[10px] whitespace-nowrap",
          node.excluded && "border-dashed border-border-light text-text-muted line-through opacity-60",
          node.hidden && "border-dashed border-streak/50 bg-streak-light text-streak",
          !node.excluded &&
            !node.hidden &&
            "border-border-light bg-surface-secondary text-text-secondary",
        )}
      >
        {node.label}
      </motion.span>
      {node.excluded && <span className="text-[9px] text-text-muted">excluded</span>}
      {node.hidden && <span className="text-[9px] text-streak">hidden</span>}

      {showChildren && (
        <>
          <div className="h-3 w-px bg-border" aria-hidden="true" />
          <div className="flex items-start">
            {children.map((child, childIndex) => (
              <div key={child.id} className="relative flex flex-col items-center px-1.5">
                {children.length > 1 && (
                  <div className="absolute top-0 right-0 left-0 flex h-px" aria-hidden="true">
                    <span
                      className={cn("h-px flex-1", childIndex === 0 ? "bg-transparent" : "bg-border")}
                    />
                    <span
                      className={cn(
                        "h-px flex-1",
                        childIndex === children.length - 1 ? "bg-transparent" : "bg-border",
                      )}
                    />
                  </div>
                )}
                <div className="h-3 w-px bg-border" aria-hidden="true" />
                <TreeView
                  node={child}
                  depth={depth + 1}
                  index={childIndex}
                  revealDepth={revealDepth}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

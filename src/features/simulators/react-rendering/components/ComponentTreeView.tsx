"use client";

import { ArrowRight, Box, Check, Equal, GitCompare, Heart, Monitor, User, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import { CardZones } from "./StageCard";
import { PendingPlaceholder } from "./PendingPlaceholder";
import type { CardStatus } from "../types";

export type TreeMode = "rerender" | "vdom" | "diff" | "commit";

type ComponentTreeViewProps = {
  status: CardStatus;
  mode: TreeMode;
  /** The likes value the Post shows now (the re-render output, or the live DOM value). */
  parentValue: number;
  /** The previously-committed likes value — the "before" side of the diff. */
  parentBefore: number;
  childLabel: string;
};

const MODE_ICON: Record<TreeMode, LucideIcon> = {
  rerender: Zap,
  vdom: Box,
  diff: GitCompare,
  commit: Monitor,
};

type Tone = "neutral" | "ran" | "new" | "changed" | "patched";
const TONE: Record<Tone, { ring: string; text: string }> = {
  neutral: { ring: "border-border-light", text: "text-text-secondary" },
  ran: { ring: "border-info", text: "text-info" },
  new: { ring: "border-success", text: "text-success" },
  changed: { ring: "border-streak", text: "text-streak" },
  patched: { ring: "border-accent", text: "text-accent" },
};

// The "Post" component — a real little UI card with a likes count. The count is
// the one thing that ever changes on screen.
function PostNode({
  value,
  tone,
  pop,
  reducedMotion,
}: {
  value: number;
  tone: Tone;
  pop?: boolean;
  reducedMotion?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "flex w-[112px] flex-col gap-1 rounded-lg border-2 bg-surface px-2.5 py-1.5 shadow-sm",
        t.ring,
        tone === "ran" && !reducedMotion && "animate-pulse",
      )}
    >
      <span className="text-[9px] font-semibold text-text-muted">Post</span>
      <div className="flex items-center gap-1">
        <Heart className={cn("size-3.5 fill-current", t.text)} />
        <motion.span
          key={pop ? value : undefined}
          initial={pop ? { scale: 1.5, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn("text-sm font-bold", t.text)}
        >
          {value}
        </motion.span>
        <span className="text-[9px] text-text-muted">likes</span>
      </div>
    </div>
  );
}

// The "Avatar" component — deliberately pixel-identical in every card (same
// circle, same initials). Only its emphasis (ring while running, dimmed while
// skipped) changes; its actual output never does. That sameness is the lesson.
function AvatarNode({
  tone,
  label,
  dim,
  reducedMotion,
}: {
  tone: Tone;
  label: string;
  dim?: boolean;
  reducedMotion?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div className={cn("flex items-center gap-1.5", dim && "opacity-45")}>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 bg-premium-light",
          t.ring,
          tone === "ran" && !reducedMotion && "animate-pulse",
        )}
      >
        <User className="size-4 text-premium" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold text-text-primary">{label}</span>
        <span className="text-[8px] text-text-muted">unchanged UI</span>
      </div>
    </div>
  );
}

function Connector() {
  return <div className="h-2.5 w-px bg-border" aria-hidden="true" />;
}

// A small "render() ran" tag, shown under each node during the render phase.
function RanTag() {
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-medium text-info">
      <Zap className="size-2.5 fill-current" />
      render() ran
    </span>
  );
}

export function ComponentTreeView({
  status,
  mode,
  parentValue,
  parentBefore,
  childLabel,
}: ComponentTreeViewProps) {
  const reducedMotion = useSafeReducedMotion();

  // Real DOM (commit) always shows the live page — never a placeholder ghost.
  if (status === "pending" && mode !== "commit") {
    return (
      <CardZones topLabel="Not started" bottomNote="Waiting…">
        <PendingPlaceholder icon={MODE_ICON[mode]} />
      </CardZones>
    );
  }

  if (mode === "rerender") {
    return (
      <CardZones topLabel="Both functions run" bottomNote="Child re-ran for nothing">
        <div className="flex flex-col items-center gap-1">
          <PostNode value={parentValue} tone="ran" reducedMotion={reducedMotion} />
          <RanTag />
          <Connector />
          <AvatarNode tone="ran" label={childLabel} reducedMotion={reducedMotion} />
          <RanTag />
        </div>
      </CardZones>
    );
  }

  if (mode === "vdom") {
    return (
      <CardZones topLabel="New Virtual DOM" bottomNote="A fresh UI snapshot">
        <div className="flex flex-col items-center gap-1">
          <PostNode value={parentValue} tone="new" />
          <Connector />
          <AvatarNode tone="new" label={childLabel} />
        </div>
      </CardZones>
    );
  }

  if (mode === "diff") {
    return (
      <CardZones topLabel="Old vs new" bottomNote="Only Post differs">
        <div className="flex w-full flex-col gap-2">
          {/* Post row — values differ → changed */}
          <div className="flex items-center justify-center gap-1.5 rounded-md border border-streak/40 bg-streak-light px-2 py-1.5">
            <LikeChip value={parentBefore} />
            <ArrowRight className="size-3 text-streak" />
            <LikeChip value={parentValue} highlight />
            <span className="ml-0.5 text-[9px] font-semibold text-streak">changed</span>
          </div>
          {/* Avatar row — identical → skipped */}
          <div className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border-light px-2 py-1.5 opacity-70">
            <AvatarChip />
            <Equal className="size-3 text-text-muted" />
            <AvatarChip />
            <span className="ml-0.5 flex items-center gap-0.5 text-[9px] font-medium text-text-muted">
              <Check className="size-2.5" />
              same
            </span>
          </div>
        </div>
      </CardZones>
    );
  }

  // commit — the real on-screen UI. Post's number pops; the Avatar is untouched.
  return (
    <CardZones
      topLabel="Real DOM — on screen"
      bottomNote={status === "active" ? "Only the count changed" : undefined}
    >
      <div className="flex flex-col items-center gap-1">
        <PostNode
          value={parentValue}
          tone={status === "active" ? "patched" : "neutral"}
          pop
          reducedMotion={reducedMotion}
        />
        <span className="text-[9px] font-medium text-accent">
          {status === "active" ? "DOM patched" : "stale"}
        </span>
        <Connector />
        <AvatarNode tone="neutral" label={childLabel} dim />
        <span className="text-[9px] text-text-muted">DOM untouched</span>
      </div>
    </CardZones>
  );
}

function LikeChip({ value, highlight }: { value: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 rounded bg-surface px-1.5 py-0.5 text-xs font-bold shadow-sm",
        highlight ? "text-streak" : "text-text-secondary",
      )}
    >
      <Heart className="size-2.5 fill-current" />
      {value}
    </span>
  );
}

function AvatarChip() {
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-premium-light">
      <User className="size-3 text-premium" />
    </span>
  );
}

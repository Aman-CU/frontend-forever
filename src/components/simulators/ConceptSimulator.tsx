"use client";

import { useRef, useState } from "react";
import type { ComponentType } from "react";

import { useRouter } from "next/navigation";
import { CheckCircle2, Code2 } from "lucide-react";

import type { SimulatorRootProps } from "@/components/shared/simulator-chrome/types";
import { BrowserPipelineSimulator } from "@/features/simulators/browser-pipeline/components/BrowserPipelineSimulator";
import { CssSpecificitySimulator } from "@/features/simulators/css-specificity/components/CssSpecificitySimulator";
import { EventLoopSimulator } from "@/features/simulators/event-loop/components/EventLoopSimulator";
import { ReactRenderingSimulator } from "@/features/simulators/react-rendering/components/ReactRenderingSimulator";

// Concept slug → its full simulator. Only these four concepts have one; every
// other concept's Simulate tab shows the "coming soon" empty state below. Keyed
// by the seed slug (note browser-rendering-pipeline, not browser-pipeline).
// This wrapper lives in components/ (not features/learn) so it can import the
// simulator features directly — the same components/ → features/ boundary the
// homepage Hero already uses; a feature importing another feature is forbidden.
const SIMULATOR_BY_SLUG: Record<string, ComponentType<SimulatorRootProps>> = {
  "event-loop": EventLoopSimulator,
  "react-rendering": ReactRenderingSimulator,
  "browser-rendering-pipeline": BrowserPipelineSimulator,
  "css-specificity": CssSpecificitySimulator,
};

type Props = {
  conceptSlug: string;
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
};

export function ConceptSimulator({
  conceptSlug,
  conceptId,
  isLoggedIn,
  initialCompleted,
}: Props) {
  const router = useRouter();
  const Simulator = SIMULATOR_BY_SLUG[conceptSlug];
  const [completed, setCompleted] = useState(initialCompleted);
  // Guards the POST so a single play-through (and every replay after) only writes
  // once. Starts true when already complete, so a returning user never re-posts.
  const hasPostedRef = useRef(initialCompleted);

  if (!Simulator) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
          <Code2 className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-text-primary">
          Interactive simulator coming soon
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
          This concept doesn&apos;t have a simulator yet. Explore the Understand tab to learn the
          fundamentals in the meantime.
        </p>
      </div>
    );
  }

  // Fires when the user reaches the simulator's final frame. Logged-out users are
  // silent (no POST, no redirect — a mid-animation bounce would be jarring); the
  // simulator itself stays network-free, all the I/O is here in the host.
  async function handleReachedEnd() {
    if (!isLoggedIn || hasPostedRef.current) return;
    hasPostedRef.current = true;

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, tab: "simulate" }),
      });
      if (!res.ok) {
        // Allow another attempt on the next play-through (e.g. a 429 or a blip).
        hasPostedRef.current = false;
        return;
      }
      setCompleted(true);
      // Refreshes server-rendered data on this route (in particular AppNavbar's
      // XP/streak) so it doesn't stay stale until the next full navigation.
      router.refresh();
    } catch {
      hasPostedRef.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {completed && (
        <div className="inline-flex w-fit items-center gap-2 self-start rounded-lg bg-success-muted px-3 py-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Simulator completed
        </div>
      )}
      <Simulator showScenarioSwitcher onReachedEnd={handleReachedEnd} />
    </div>
  );
}

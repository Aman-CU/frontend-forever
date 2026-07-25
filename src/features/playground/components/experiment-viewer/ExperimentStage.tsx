"use client";

import { EXPERIMENT_COMPONENTS } from "@/features/playground/experiments/clientRegistry";

type Props = {
  slug: string;
};

// Just the live demo surface — renders the real first-party experiment
// component (dynamic, client-only; see clientRegistry.tsx) filling its parent.
// All chrome (toolbar, watermark, fullscreen) lives in ExperimentWorkspace so
// the canvas itself can be a clean full-bleed surface.
export function ExperimentStage({ slug }: Props) {
  const Demo = EXPERIMENT_COMPONENTS[slug];

  if (!Demo) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-text-muted">This experiment isn&apos;t available.</p>
      </div>
    );
  }

  return <Demo />;
}

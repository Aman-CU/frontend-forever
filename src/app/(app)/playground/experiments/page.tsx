import type { Metadata } from "next";

import { ExperimentListCard } from "@/features/playground/components/ExperimentListCard";
import { EXPERIMENTS } from "@/features/playground/experiments/registry";

export const metadata: Metadata = {
  title: "Experiments | Frontend Forever",
  description:
    "A gallery of small, interactive experiments built by the Frontend Forever team — run them live and read the real source.",
};

export default function ExperimentsListPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Experiments</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Small, interactive things built by the FF team. Open one to run it live and read the real
          source behind it.
        </p>
      </div>

      {EXPERIMENTS.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 text-center">
          <p className="text-sm font-medium text-text-secondary">Experiments are coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIMENTS.map((experiment) => (
            <ExperimentListCard
              key={experiment.slug}
              slug={experiment.slug}
              title={experiment.title}
              description={experiment.description}
              tags={experiment.tags}
              thumbnail={experiment.thumbnail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

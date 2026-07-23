import type { Metadata } from "next";
import Link from "next/link";

import { BattleCard } from "@/features/playground/components/BattleCard";
import { ExperimentCard } from "@/features/playground/components/ExperimentCard";
import { BATTLE_PREVIEW_ITEMS, EXPERIMENT_PREVIEW_ITEMS } from "@/features/playground/lib/previewData";

export const metadata: Metadata = {
  title: "Playground | Frontend Forever",
  description:
    "Recreate target UIs in live coding battles, and play with pre-built interactive experiments.",
};

// py-2 (not just pb-2): overflow-x-auto forces the container's overflow-y to
// a non-"visible" computed value too (per the CSS overflow spec, whichever
// axis isn't "visible" pulls the other one out of "visible" as well), so this
// row clips vertically at its own edges. With no top padding, hover's
// -translate-y-0.5 pushed each card's top edge straight into that clip.
const SCROLL_ROW_CLASS =
  "flex gap-4 overflow-x-auto py-2 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]";

export default function PlaygroundPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Playground</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Recreate real UIs in live coding battles, and play with interactive experiments built by
          the FF team.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            UI Battles
          </h2>
          <Link
            href="/playground/battles"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className={SCROLL_ROW_CLASS} style={{ scrollbarWidth: "none" }}>
          {BATTLE_PREVIEW_ITEMS.map((item) => (
            <BattleCard key={item.slug} {...item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Experiments
          </h2>
          <Link
            href="/playground/experiments"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className={SCROLL_ROW_CLASS} style={{ scrollbarWidth: "none" }}>
          {EXPERIMENT_PREVIEW_ITEMS.map((item) => (
            <ExperimentCard key={item.slug} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}

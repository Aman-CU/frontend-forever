import type { Metadata } from "next";

import { BattleListCard } from "@/features/playground/components/BattleListCard";
import { getUiBattleCatalog } from "@/features/playground/lib/queries";

export const metadata: Metadata = {
  title: "UI Battles | Frontend Forever",
  description: "Recreate real UIs from a target screenshot using vanilla HTML, CSS, and JavaScript.",
};

export default async function UiBattlesListPage() {
  const battles = await getUiBattleCatalog();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">UI Battles</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Recreate the target UI pixel-for-pixel using vanilla HTML, CSS, and JavaScript. No
          scoring yet — compare visually with the Slide &amp; Diff toggle in the editor.
        </p>
      </div>

      {battles.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 text-center">
          <p className="text-sm font-medium text-text-secondary">
            Challenges are coming soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {battles.map((battle) => (
            <BattleListCard
              key={battle.slug}
              slug={battle.slug}
              title={battle.title}
              description={battle.description}
              difficulty={battle.difficulty}
              targetImageUrl={battle.targetImageUrl}
              isPremium={battle.isPremium}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { COLLECTIONS } from "@/components/homepage/feature-highlights/graphData";

export function CollectionsCard() {
  return (
    <div className="flex w-full flex-col gap-1.5 rounded-2xl border border-border bg-surface p-3 shadow-xl">
      {COLLECTIONS.map((collection, index) => (
        <div key={collection} className="flex items-center gap-3 px-2 py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-text-primary">{collection}</span>
        </div>
      ))}
    </div>
  );
}

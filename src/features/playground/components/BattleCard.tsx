import Link from "next/link";
import Image from "next/image";
import { Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import type { ChallengeDifficulty } from "@/lib/constants";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  // Real challenges always have a target screenshot (NOT NULL column) — this
  // stays optional only so a future static teaser (no real row yet) can fall
  // back to the generic icon, same as before this feature's real data existed.
  targetImageUrl?: string;
  isPremium?: boolean;
  // Drives PremiumBadge's icon only — the real gate lives on the detail page.
  isPremiumUser: boolean;
  // Set on the first card in a row/grid — that image is reliably the page's
  // Largest Contentful Paint element (above the fold, sizable), and next/image
  // lazy-loads by default. priority disables that and preloads it instead.
  priority?: boolean;
};

export function BattleCard({
  slug,
  title,
  difficulty,
  targetImageUrl,
  isPremium,
  isPremiumUser,
  priority,
}: Props) {
  return (
    <Link
      href={`/playground/battles/${slug}`}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
      )}
    >
      {/* Same gradient-cover + object-contain "floating card" treatment as
          BattleListCard (the list page's card) — aspect-[4/3] rather than a
          fixed height so a portrait target gets real room instead of
          shrinking to a sliver, and object-contain rather than object-cover
          so the card isn't cropped, just shown smaller. */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-surface-secondary to-accent-muted/40 p-3">
        {targetImageUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
            <Image
              src={targetImageUrl}
              alt={`Target UI preview for the ${title} battle`}
              fill
              sizes="224px"
              className="object-contain"
              preload={priority}
            />
          </div>
        ) : (
          <Target className="size-8 text-text-muted" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              DIFFICULTY_STYLES[difficulty],
            )}
          >
            {difficulty}
          </span>
          {isPremium && <PremiumBadge isPremiumUser={isPremiumUser} />}
        </div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
    </Link>
  );
}

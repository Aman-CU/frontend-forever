import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  targetImageUrl: string;
  isPremium?: boolean;
  // Set on the first card in the grid — that image is reliably the page's
  // Largest Contentful Paint element (above the fold, sizable), and next/image
  // lazy-loads by default. priority disables that and preloads it instead.
  priority?: boolean;
};

// The richer grid-listing card for /playground/battles — a deliberate
// sibling of BattleCard (the hub's compact w-56 scroll-row card), not a
// shared/generalized version of it: different shape (cover art + badge +
// description + CTA vs. thumbnail + title + pill), same "deliberate sibling"
// precedent as BattleCard/ExperimentCard. No rep/XP badge — Playground has
// no scoring or progress system in v1 (build-plan.md), and this codebase
// never shows fabricated numbers.
export function BattleListCard({
  slug,
  title,
  description,
  difficulty,
  targetImageUrl,
  isPremium,
  priority,
}: Props) {
  return (
    <Link
      href={`/playground/battles/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
      )}
    >
      {/* aspect-[4/3], not a fixed height — a fixed h-44 (short and wide)
          against a portrait target left object-contain height-bound to a
          tiny fraction of the box (mostly empty gradient around it, exactly
          what looked "tiny" here). 4:3 gives portrait content real vertical
          room to scale up into while still being reasonable for a future
          landscape-shaped challenge (a page section, a grid) — a middle
          ground, not tuned to this one pilot's proportions. */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-surface-secondary to-accent-muted/40 p-4">
        {targetImageUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
            <Image
              src={targetImageUrl}
              alt={`Target UI preview for the ${title} battle`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
              priority={priority}
            />
          </div>
        ) : (
          <Target className="size-8 text-text-muted" aria-hidden />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              DIFFICULTY_STYLES[difficulty],
            )}
          >
            {difficulty}
          </span>
          {isPremium && (
            <span className="flex items-center gap-1 rounded-full bg-premium-light px-2 py-0.5 text-xs font-semibold text-premium">
              <Lock className="size-3" aria-hidden />
              Premium
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-text-secondary">{description}</p>

        <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors group-hover:bg-accent-dark">
          Start Battle
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { Target } from "lucide-react";

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
  difficulty: ChallengeDifficulty;
};

export function BattleCard({ slug, title, difficulty }: Props) {
  return (
    <Link
      href={`/playground/battles/${slug}`}
      className={cn(
        "group flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
      )}
    >
      <div className="flex h-32 items-center justify-center bg-surface-secondary">
        <Target className="size-8 text-text-muted" aria-hidden />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span
          className={cn(
            "w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
            DIFFICULTY_STYLES[difficulty],
          )}
        >
          {difficulty}
        </span>
      </div>
    </Link>
  );
}

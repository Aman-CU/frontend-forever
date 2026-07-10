import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty, ConceptCategory } from "@/lib/constants";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: ConceptCategory;
  conceptTitle: string;
  completed: boolean;
};

export function ChallengeCard({ slug, title, difficulty, category, conceptTitle, completed }: Props) {
  return (
    <Link
      href={`/practice/${category}/${slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
      )}
    >
      {completed && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}

      <h3 className="pr-6 text-sm font-semibold leading-snug text-text-primary">{title}</h3>
      <p className="mt-1.5 text-xs text-text-muted">{conceptTitle}</p>

      <div className="mt-4">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
            DIFFICULTY_STYLES[difficulty],
          )}
        >
          {difficulty}
        </span>
      </div>
    </Link>
  );
}

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";

type Props = {
  title: string;
  difficulty: string;
};

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

export function ChallengePrompt({ title, difficulty }: Props) {
  const badgeStyle =
    DIFFICULTY_STYLES[difficulty as ChallengeDifficulty] ?? "bg-surface-secondary text-text-secondary";

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          badgeStyle,
        )}
      >
        {difficulty}
      </span>
    </div>
  );
}

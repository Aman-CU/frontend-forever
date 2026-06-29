import { Fragment } from "react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";

type Props = {
  title: string;
  difficulty: string;
  description: string;
};

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

export function ChallengePrompt({ title, difficulty, description }: Props) {
  const badgeStyle =
    DIFFICULTY_STYLES[difficulty as ChallengeDifficulty] ?? "bg-surface-secondary text-text-secondary";

  return (
    <div className="flex flex-col gap-3">
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
      <p className="text-sm leading-relaxed text-text-secondary">
        {renderInlineCode(description)}
      </p>
    </div>
  );
}

// Authored markdown descriptions only use `inline code` spans — render those as
// <code> and leave the rest as plain text (no HTML injection from the string).
function renderInlineCode(text: string) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code
        key={index}
        className="rounded bg-surface-secondary px-1 py-0.5 font-mono text-[0.8125rem] text-text-primary"
      >
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

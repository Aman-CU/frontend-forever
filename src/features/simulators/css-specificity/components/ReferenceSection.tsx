import { Lightbulb } from "lucide-react";

// Static reference material, always visible regardless of step — these are
// the design's "Specificity Rules" / "Score Format" cards and insight
// callout, not part of the stepped walkthrough.
const SPECIFICITY_RULES = [
  { rule: "ID selectors", score: "1-0-0" },
  { rule: "Class selectors", score: "0-1-0" },
  { rule: "Type selectors", score: "0-0-1" },
];

const SCORE_FORMAT = [
  { letter: "a", meaning: "ID selectors" },
  { letter: "b", meaning: "Class selectors" },
  { letter: "c", meaning: "Type selectors" },
];

export function ReferenceSection() {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row">
      <div className="flex flex-1 items-start gap-2.5 rounded-lg border border-border-light bg-accent-light p-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">CSS does not choose styles randomly.</span>{" "}
          The browser compares specificity scores. The most specific selector wins.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-border-light bg-surface-secondary p-3">
        <p className="text-xs font-semibold text-text-primary">Specificity Rules</p>
        <ol className="flex flex-col gap-0.5">
          {SPECIFICITY_RULES.map((item, index) => (
            <li key={item.rule} className="flex items-center justify-between text-xs text-text-secondary">
              <span>
                {index + 1}. {item.rule}
              </span>
              <span className="font-mono text-text-muted">{item.score}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-border-light bg-surface-secondary p-3">
        <p className="text-xs font-semibold text-text-primary">Score Format (a-b-c)</p>
        <ul className="flex flex-col gap-0.5">
          {SCORE_FORMAT.map((item) => (
            <li key={item.letter} className="text-xs text-text-secondary">
              <span className="font-mono font-semibold text-accent">{item.letter}</span> = {item.meaning}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

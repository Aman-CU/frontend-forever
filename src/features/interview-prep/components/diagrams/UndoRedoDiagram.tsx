// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the classic three-stack undo/redo
// model: a "past" stack of prior states, the single "present" state
// actually rendered, and a "future" stack of states that were undone.
// Undo pops present onto future and pops the top of past into present;
// redo does the mirror image; any new edit clears the future stack.
export function UndoRedoDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const pastColor = "var(--color-text-muted)";
  const presentColor = "var(--color-accent)";
  const futureColor = "var(--color-border-muted)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 620 220"
        className="h-auto w-full min-w-[500px]"
        role="img"
        aria-label="Diagram of the undo/redo history model: a past stack of prior states, a single present state that is currently rendered, and a future stack of states that were undone. Undo moves the present state onto the front of the future stack and moves the most recent past state into present. Redo does the reverse. Making a new edit clears the entire future stack."
      >
        <text x={100} y="22" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>Past</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={40} y={34 + i * 30} width={120} height={24} rx={4} fill="none" stroke={pastColor} strokeWidth={1.2} />
        ))}
        <text x={100} y="140" fontSize={9} textAnchor="middle" fill={textColor}>older ← → newer</text>

        <rect x={250} y={80} width={120} height={40} rx={6} fill={presentColor} opacity={0.15} stroke={presentColor} strokeWidth={2} />
        <text x={310} y="105" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>Present</text>
        <text x={310} y="65" fontSize={11} fontWeight={700} textAnchor="middle" fill={presentColor}>Currently rendered</text>

        <text x={520} y="22" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>Future</text>
        {[0, 1].map((i) => (
          <rect key={i} x={460} y={34 + i * 30} width={120} height={24} rx={4} fill="none" stroke={futureColor} strokeWidth={1.2} strokeDasharray="3 3" />
        ))}

        <line x1={185} y1={95} x2={245} y2={95} stroke={pastColor} strokeWidth={1.5} markerEnd="url(#arrow-undo)" />
        <text x={215} y="88" fontSize={9} fontWeight={600} textAnchor="middle" fill={pastColor}>Undo</text>

        <line x1={375} y1={110} x2={455} y2={110} stroke={futureColor} strokeWidth={1.5} markerEnd="url(#arrow-redo)" />
        <text x={415} y="125" fontSize={9} fontWeight={600} textAnchor="middle" fill={textColor}>Redo</text>

        <foreignObject x={20} y={170} width={580} height={40}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Undo pops the most recent past state into present and pushes the old present onto future. A brand-new edit clears the future stack entirely — you can&apos;t redo into a branch that no longer exists.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-undo" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={pastColor} />
          </marker>
          <marker id="arrow-redo" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={futureColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

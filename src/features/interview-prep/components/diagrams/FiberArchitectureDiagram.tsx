// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows Fiber's two-phase split: the render
// phase walks the tree unit-of-work by unit-of-work, can pause/yield to the
// browser and resume later (or get abandoned), and produces a list of
// pending changes; the commit phase then applies all of it to the real DOM
// synchronously, in one uninterruptible pass.
export function FiberArchitectureDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const renderColor = "var(--color-accent)";
  const commitColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 220"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Diagram of React Fiber's two phases. Render phase: interruptible units of work processed one fiber at a time, able to pause and yield to the browser then resume, or restart if a higher-priority update arrives. Commit phase: a single synchronous, uninterruptible pass that applies the computed changes to the real DOM."
      >
        <text x={20} y="22" fontSize={12} fontWeight={700} fill={renderColor}>
          Render phase — interruptible
        </text>
        {[90, 190, 290, 390].map((x, i) => (
          <g key={x}>
            <rect x={x} y={34} width={70} height={34} rx={6} fill="none" stroke={renderColor} strokeWidth={1.5} strokeDasharray={i === 2 ? "3 3" : undefined} />
            <text x={x + 35} y="55" fontSize={9} textAnchor="middle" fill={labelColor}>
              unit {i + 1}
            </text>
            {i < 3 && (
              <line x1={x + 70} y1={51} x2={x + 88} y2={51} stroke={renderColor} strokeWidth={1.5} markerEnd="url(#arrow-fiber)" />
            )}
          </g>
        ))}
        <text x={290} y="16" fontSize={9} fontWeight={600} textAnchor="middle" fill={renderColor}>
          can yield to the browser here, then resume
        </text>

        <line x1={20} y1={90} x2={680} y2={90} stroke="var(--color-border-muted)" strokeWidth={1} strokeDasharray="2 4" />

        <text x={20} y="112" fontSize={12} fontWeight={700} fill={commitColor}>
          Commit phase — synchronous, uninterruptible
        </text>
        <rect x={90} y={124} width={370} height={40} rx={6} fill={commitColor} opacity={0.12} stroke={commitColor} strokeWidth={1.5} />
        <text x={275} y="149" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>
          Apply every computed change to the real DOM — all at once
        </text>

        <line x1={425} y1={68} x2={275} y2={124} stroke={textColor} strokeWidth={1} strokeDasharray="3 3" markerEnd="url(#arrow-fiber-dim)" />

        <foreignObject x={20} y={182} width={660} height={34}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            The render phase can be paused, resumed, or thrown away entirely (e.g. a higher-priority update interrupts it) — the commit phase never can, since a half-applied DOM update would leave the page visibly broken.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-fiber" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={renderColor} />
          </marker>
          <marker id="arrow-fiber-dim" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={textColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

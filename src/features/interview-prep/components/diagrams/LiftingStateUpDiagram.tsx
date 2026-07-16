// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows why two sibling components can't
// talk to each other directly: state has to move up to their nearest
// common parent, which then passes the value down to both — one as a
// direct prop, the other via a callback prop it calls to trigger updates.
export function LiftingStateUpDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const parentColor = "var(--color-accent)";
  const siblingColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 600 220"
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Diagram of lifting state up: two sibling components, SearchBox and ResultsList, cannot pass data to each other directly. Instead, the shared state moves up to their common parent. The parent passes the current value down to ResultsList as a prop, and passes an update-triggering callback down to SearchBox, which calls it whenever the user types."
      >
        <rect x={220} y={20} width={160} height={44} rx={8} fill={parentColor} opacity={0.15} stroke={parentColor} strokeWidth={1.5} />
        <text x={300} y="47" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>Parent (owns state)</text>

        <line x1={260} y1={64} x2={120} y2={110} stroke={parentColor} strokeWidth={1.5} markerEnd="url(#arrow-lift1)" />
        <line x1={340} y1={64} x2={480} y2={110} stroke={parentColor} strokeWidth={1.5} markerEnd="url(#arrow-lift2)" />

        <rect x={40} y={110} width={160} height={44} rx={8} fill="none" stroke={siblingColor} strokeWidth={1.5} />
        <text x={120} y="132" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>SearchBox</text>
        <text x={120} y="147" fontSize={9} textAnchor="middle" fill={textColor}>receives onQueryChange prop</text>

        <rect x={400} y={110} width={160} height={44} rx={8} fill="none" stroke={siblingColor} strokeWidth={1.5} />
        <text x={480} y="132" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>ResultsList</text>
        <text x={480} y="147" fontSize={9} textAnchor="middle" fill={textColor}>receives query prop</text>

        <line x1={120} y1={110} x2={260} y2={64} stroke={siblingColor} strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrow-lift3)" />
        <text x={140} y="90" fontSize={9} fontWeight={600} fill={siblingColor}>calls onQueryChange(text)</text>

        <foreignObject x={20} y={180} width={560} height={30}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            SearchBox and ResultsList never reference each other directly — every value flows through the shared parent that owns the state.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-lift1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={parentColor} />
          </marker>
          <marker id="arrow-lift2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={parentColor} />
          </marker>
          <marker id="arrow-lift3" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={siblingColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

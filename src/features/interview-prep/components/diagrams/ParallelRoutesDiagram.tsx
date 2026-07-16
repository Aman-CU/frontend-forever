// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows parallel routes' @folder ("slot")
// convention: a layout receives multiple independent page trees as named
// props (@team, @analytics) and renders them simultaneously in the same
// layout, each with its own independent loading/error state.
export function ParallelRoutesDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const layoutColor = "var(--color-accent)";
  const slotColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 210"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram of parallel routes: a dashboard layout.tsx receives two named slots as props, @team and @analytics, each defined by its own folder using the @folder convention. Both slots render simultaneously inside the same layout, and each has its own independent loading and error state, since they are separate subtrees."
      >
        <rect x={220} y={16} width={200} height={34} rx={6} fill={layoutColor} opacity={0.15} stroke={layoutColor} strokeWidth={2} />
        <text x={320} y="38" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>app/dashboard/layout.tsx</text>

        <line x1={280} y1={50} x2={140} y2={90} stroke={layoutColor} strokeWidth={1.3} markerEnd="url(#arrow-pr1)" />
        <line x1={360} y1={50} x2={500} y2={90} stroke={layoutColor} strokeWidth={1.3} markerEnd="url(#arrow-pr1)" />

        <rect x={40} y={90} width={200} height={70} rx={8} fill={slotColor} opacity={0.12} stroke={slotColor} strokeWidth={1.5} />
        <text x={140} y="110" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>@team slot</text>
        <text x={140} y="126" fontSize={8.5} textAnchor="middle" fill={textColor}>{"app/dashboard/@team/page.tsx"}</text>
        <text x={140} y="142" fontSize={8.5} textAnchor="middle" fill={textColor}>own loading.js / error.js</text>

        <rect x={400} y={90} width={200} height={70} rx={8} fill={slotColor} opacity={0.12} stroke={slotColor} strokeWidth={1.5} />
        <text x={500} y="110" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>@analytics slot</text>
        <text x={500} y="126" fontSize={8.5} textAnchor="middle" fill={textColor}>{"app/dashboard/@analytics/page.tsx"}</text>
        <text x={500} y="142" fontSize={8.5} textAnchor="middle" fill={textColor}>own loading.js / error.js</text>

        <foreignObject x={20} y={175} width={600} height={30}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            {"{ children, team, analytics }"} — both slots render at once inside the same layout, each streaming independently.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-pr1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={layoutColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

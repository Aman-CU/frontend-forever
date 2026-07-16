// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows why loading.js enables streaming:
// the fast parts of a page (shell, nav, fast segments) are sent to the
// browser immediately, a slow segment shows its loading.js fallback in the
// meantime, and only that slow piece streams in and swaps once its data
// is actually ready — instead of the whole page waiting on its single
// slowest data source before anything is sent at all.
export function StreamingDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const fastColor = "var(--color-success)";
  const slowColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 210"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram of streaming with loading.js: at t=0 the browser receives the fast shell and navigation immediately, along with the loading.js fallback for a slow segment. At a later time, once the slow segment's data is ready, it streams in and swaps out the fallback in place, without the fast parts of the page having waited for it."
      >
        <text x={20} y="22" fontSize={11} fontWeight={700} fill={fastColor}>t = 0ms — initial response</text>
        <rect x={20} y={32} width={140} height={36} rx={6} fill={fastColor} opacity={0.15} stroke={fastColor} strokeWidth={1.5} />
        <text x={90} y="55" fontSize={9} fontWeight={700} textAnchor="middle" fill={labelColor}>Shell + nav (fast)</text>
        <rect x={170} y={32} width={140} height={36} rx={6} fill={fastColor} opacity={0.15} stroke={fastColor} strokeWidth={1.5} />
        <text x={240} y="55" fontSize={9} fontWeight={700} textAnchor="middle" fill={labelColor}>Fast segment</text>
        <rect x={320} y={32} width={160} height={36} rx={6} fill="none" stroke={slowColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={400} y="55" fontSize={9} textAnchor="middle" fill={labelColor}>loading.js fallback</text>

        <line x1={400} y1={68} x2={400} y2={95} stroke={slowColor} strokeWidth={1.3} markerEnd="url(#arrow-stream)" />

        <text x={20} y="120" fontSize={11} fontWeight={700} fill={slowColor}>t = later — slow segment ready</text>
        <rect x={20} y={130} width={140} height={36} rx={6} fill={fastColor} opacity={0.08} stroke={fastColor} strokeWidth={1} />
        <text x={90} y="153" fontSize={9} textAnchor="middle" fill={textColor}>already visible, unchanged</text>
        <rect x={170} y={130} width={140} height={36} rx={6} fill={fastColor} opacity={0.08} stroke={fastColor} strokeWidth={1} />
        <text x={240} y="153" fontSize={9} textAnchor="middle" fill={textColor}>already visible, unchanged</text>
        <rect x={320} y={130} width={160} height={36} rx={6} fill={slowColor} opacity={0.15} stroke={slowColor} strokeWidth={2} />
        <text x={400} y="153" fontSize={9} fontWeight={700} textAnchor="middle" fill={labelColor}>Real content streamed in</text>

        <foreignObject x={20} y={180} width={600} height={24}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            The fast parts never waited on the slow one — only the loading.js fallback is swapped once its data resolves.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-stream" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={slowColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Contrasts pre-React-18 batching (only
// batched inside React's own event handlers — a setTimeout callback or a
// Promise .then produced one render per setState) against React 18's
// automatic batching (every setState in the same tick is batched into one
// render, regardless of where it was called from).
export function AutomaticBatchingDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const beforeColor = "var(--color-warning)";
  const afterColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 240"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Diagram contrasting pre-React-18 and React-18 batching inside a setTimeout callback that calls two state setters. Before React 18: each setState triggers its own render, two renders total. React 18 automatic batching: both state updates are collected and applied in a single render."
      >
        <text x={20} y="24" fontSize={12} fontWeight={700} fill={labelColor}>
          Inside a setTimeout callback: setCount(c) and setFlag(f) called back-to-back
        </text>

        <text x={20} y="58" fontSize={11} fontWeight={700} fill={beforeColor}>
          Before React 18
        </text>
        <rect x={20} y={68} width={110} height={36} rx={6} fill="none" stroke={beforeColor} strokeWidth={1.5} />
        <text x={75} y={90} fontSize={10} textAnchor="middle" fill={labelColor}>setCount(c)</text>
        <line x1={130} y1={86} x2={180} y2={86} stroke={beforeColor} strokeWidth={1.5} markerEnd="url(#arrow-batch-before)" />
        <rect x={180} y={68} width={90} height={36} rx={6} fill={beforeColor} opacity={0.15} stroke={beforeColor} strokeWidth={1.5} />
        <text x={225} y="90" fontSize={10} textAnchor="middle" fill={labelColor}>Render #1</text>

        <rect x={300} y={68} width={110} height={36} rx={6} fill="none" stroke={beforeColor} strokeWidth={1.5} />
        <text x={355} y="90" fontSize={10} textAnchor="middle" fill={labelColor}>setFlag(f)</text>
        <line x1={410} y1={86} x2={460} y2={86} stroke={beforeColor} strokeWidth={1.5} markerEnd="url(#arrow-batch-before)" />
        <rect x={460} y={68} width={90} height={36} rx={6} fill={beforeColor} opacity={0.15} stroke={beforeColor} strokeWidth={1.5} />
        <text x={505} y="90" fontSize={10} textAnchor="middle" fill={labelColor}>Render #2</text>

        <text x={20} y="150" fontSize={11} fontWeight={700} fill={afterColor}>
          React 18 — automatic batching
        </text>
        <rect x={20} y={160} width={110} height={36} rx={6} fill="none" stroke={afterColor} strokeWidth={1.5} />
        <text x={75} y="182" fontSize={10} textAnchor="middle" fill={labelColor}>setCount(c)</text>

        <rect x={150} y={160} width={110} height={36} rx={6} fill="none" stroke={afterColor} strokeWidth={1.5} />
        <text x={205} y="182" fontSize={10} textAnchor="middle" fill={labelColor}>setFlag(f)</text>

        <line x1={260} y1={178} x2={340} y2={178} stroke={afterColor} strokeWidth={1.5} markerEnd="url(#arrow-batch-after)" />
        <rect x={340} y={160} width={130} height={36} rx={6} fill={afterColor} opacity={0.15} stroke={afterColor} strokeWidth={1.5} />
        <text x={405} y="182" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Single render</text>

        <text x={20} y="225" fontSize={10} fill={textColor}>
          Both updates are collected first — React only re-renders once, with both changes already applied.
        </text>

        <defs>
          <marker id="arrow-batch-before" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={beforeColor} />
          </marker>
          <marker id="arrow-batch-after" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={afterColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

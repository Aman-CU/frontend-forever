// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Two parallel timelines for the same
// "like a post" action: pessimistic waits for the server response before
// updating the UI at all; optimistic updates the UI immediately and only
// rolls back in the rare case the server request actually fails.
export function OptimisticVsPessimisticDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const pessimisticColor = "var(--color-warning)";
  const optimisticColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 220"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Diagram comparing optimistic and pessimistic UI updates for the same user action. Pessimistic: the user clicks, the UI waits, a request is sent to the server, and only once the response arrives does the UI update. Optimistic: the user clicks and the UI updates immediately, while the request happens in the background; the UI only rolls back in the rare case the request fails."
      >
        <text x={20} y="24" fontSize={12} fontWeight={700} fill={pessimisticColor}>
          Pessimistic — wait for the server first
        </text>
        <rect x={20} y={34} width={100} height={32} rx={6} fill="none" stroke={pessimisticColor} strokeWidth={1.5} />
        <text x={70} y="54" fontSize={10} textAnchor="middle" fill={labelColor}>User clicks</text>
        <line x1={120} y1={50} x2={200} y2={50} stroke={pessimisticColor} strokeWidth={1.5} markerEnd="url(#arrow-optpess)" />
        <rect x={200} y={34} width={140} height={32} rx={6} fill="none" stroke={pessimisticColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={270} y="54" fontSize={10} textAnchor="middle" fill={labelColor}>Waiting for server...</text>
        <line x1={340} y1={50} x2={420} y2={50} stroke={pessimisticColor} strokeWidth={1.5} markerEnd="url(#arrow-optpess)" />
        <rect x={420} y={34} width={140} height={32} rx={6} fill={pessimisticColor} opacity={0.15} stroke={pessimisticColor} strokeWidth={1.5} />
        <text x={490} y="54" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>UI updates now</text>

        <text x={20} y="110" fontSize={12} fontWeight={700} fill={optimisticColor}>
          Optimistic — update the UI immediately
        </text>
        <rect x={20} y={120} width={100} height={32} rx={6} fill="none" stroke={optimisticColor} strokeWidth={1.5} />
        <text x={70} y="140" fontSize={10} textAnchor="middle" fill={labelColor}>User clicks</text>
        <line x1={120} y1={136} x2={200} y2={136} stroke={optimisticColor} strokeWidth={1.5} markerEnd="url(#arrow-optpess2)" />
        <rect x={200} y={120} width={140} height={32} rx={6} fill={optimisticColor} opacity={0.15} stroke={optimisticColor} strokeWidth={1.5} />
        <text x={270} y="140" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>UI updates now</text>
        <rect x={200} y={160} width={140} height={26} rx={6} fill="none" stroke={optimisticColor} strokeWidth={1} strokeDasharray="2 3" />
        <text x={270} y="177" fontSize={9} textAnchor="middle" fill={textColor}>request runs in background</text>
        <line x1={340} y1={136} x2={420} y2={136} stroke={optimisticColor} strokeWidth={1.5} markerEnd="url(#arrow-optpess2)" />
        <rect x={420} y={120} width={140} height={32} rx={6} fill="none" stroke={optimisticColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={490} y="140" fontSize={10} textAnchor="middle" fill={labelColor}>Confirmed (or rolled back)</text>

        <foreignObject x={20} y={195} width={660} height={22}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Optimistic UI feels instant but must handle the rollback case explicitly if the request fails.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-optpess" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={pessimisticColor} />
          </marker>
          <marker id="arrow-optpess2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={optimisticColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

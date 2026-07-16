// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows a Server Action's actual path: a
// form submission in the browser calls a function marked "use server"
// directly, with no hand-written API route or client-side fetch in
// between, and the action itself must explicitly revalidate before any
// cached UI reflects the change.
export function ServerActionsFlowDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const clientColor = "var(--color-warning)";
  const serverColor = "var(--color-accent)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 200"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of a Server Action's flow: a form submission in the browser calls a use-server function directly, with no hand-written API route or client-side fetch in between. The action runs on the server, mutates data, and must explicitly call revalidatePath or revalidateTag before the page's cached UI reflects the change."
      >
        <rect x={20} y={30} width={160} height={50} rx={8} fill="none" stroke={clientColor} strokeWidth={1.5} />
        <text x={100} y="50" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>Browser</text>
        <text x={100} y="66" fontSize={9} textAnchor="middle" fill={textColor}>{"<form action={fn}>"}</text>

        <line x1={180} y1={55} x2={230} y2={55} stroke={clientColor} strokeWidth={1.5} markerEnd="url(#arrow-sa1)" />
        <text x={205} y="45" fontSize={8} textAnchor="middle" fill={textColor}>submit</text>

        <rect x={230} y={30} width={200} height={50} rx={8} fill={serverColor} opacity={0.15} stroke={serverColor} strokeWidth={2} />
        <text x={330} y="50" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>Server Action</text>
        <text x={330} y="66" fontSize={9} textAnchor="middle" fill={textColor}>&quot;use server&quot; — mutates data</text>

        <line x1={430} y1={55} x2={480} y2={55} stroke={serverColor} strokeWidth={1.5} markerEnd="url(#arrow-sa2)" />

        <rect x={480} y={30} width={160} height={50} rx={8} fill="none" stroke={serverColor} strokeWidth={1.5} />
        <text x={560} y="50" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>revalidatePath</text>
        <text x={560} y="66" fontSize={9} textAnchor="middle" fill={textColor}>invalidates the cache</text>

        <path d="M 560 80 C 560 130, 330 130, 330 80" fill="none" stroke={serverColor} strokeWidth={1.3} strokeDasharray="3 3" markerEnd="url(#arrow-sa3)" />
        <text x={440} y="118" fontSize={9} fontWeight={600} textAnchor="middle" fill={serverColor}>without this call, the page keeps showing stale cached data</text>

        <foreignObject x={20} y={155} width={620} height={30}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            No hand-written API route and no client-side fetch — the form calls the server function directly.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-sa1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={clientColor} />
          </marker>
          <marker id="arrow-sa2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={serverColor} />
          </marker>
          <marker id="arrow-sa3" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={serverColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

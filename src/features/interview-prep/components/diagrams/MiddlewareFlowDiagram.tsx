// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the request-interception flow and,
// critically, the Next.js 16 rename: middleware.ts (Edge Runtime, deprecated)
// becomes proxy.ts (Node.js runtime, the current default) — every request
// passes through it before Next.js decides whether to rewrite, redirect, or
// continue to the matched route.
export function MiddlewareFlowDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const requestColor = "var(--color-accent)";
  const decisionColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 210"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of the middleware and proxy request flow: an incoming request first passes through proxy.ts, the Next.js 16 rename of middleware.ts, which now runs on the Node.js runtime by default instead of the Edge Runtime. From there it branches into three outcomes: rewrite to a different path while keeping the URL the same, redirect to a new URL, or continue to the originally matched route."
      >
        <rect x={20} y={70} width={140} height={50} rx={8} fill="none" stroke={requestColor} strokeWidth={1.5} />
        <text x={90} y="90" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>Incoming request</text>
        <text x={90} y="106" fontSize={9} textAnchor="middle" fill={textColor}>every matched path</text>

        <line x1={160} y1={95} x2={210} y2={95} stroke={requestColor} strokeWidth={1.5} markerEnd="url(#arrow-mw1)" />

        <rect x={210} y={60} width={180} height={70} rx={8} fill={decisionColor} opacity={0.15} stroke={decisionColor} strokeWidth={2} />
        <text x={300} y="80" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>proxy.ts</text>
        <text x={300} y="96" fontSize={8.5} textAnchor="middle" fill={textColor}>Next.js 16+ (Node.js runtime)</text>
        <text x={300} y="110" fontSize={8.5} textAnchor="middle" fill={textColor}>was middleware.ts (Edge, deprecated)</text>
        <text x={300} y="122" fontSize={8.5} textAnchor="middle" fill={textColor}>routing only — not auth logic</text>

        <line x1={390} y1={75} x2={460} y2={30} stroke={decisionColor} strokeWidth={1.3} markerEnd="url(#arrow-mw2)" />
        <line x1={390} y1={95} x2={460} y2={95} stroke={decisionColor} strokeWidth={1.3} markerEnd="url(#arrow-mw2)" />
        <line x1={390} y1={115} x2={460} y2={160} stroke={decisionColor} strokeWidth={1.3} markerEnd="url(#arrow-mw2)" />

        <rect x={460} y={12} width={180} height={36} rx={6} fill="none" stroke={requestColor} strokeWidth={1.3} />
        <text x={550} y="34" fontSize={9} fontWeight={600} textAnchor="middle" fill={labelColor}>Rewrite (URL stays same)</text>

        <rect x={460} y={77} width={180} height={36} rx={6} fill="none" stroke={requestColor} strokeWidth={1.3} />
        <text x={550} y="99" fontSize={9} fontWeight={600} textAnchor="middle" fill={labelColor}>Redirect (new URL)</text>

        <rect x={460} y={142} width={180} height={36} rx={6} fill="none" stroke={requestColor} strokeWidth={1.3} />
        <text x={550} y="164" fontSize={9} fontWeight={600} textAnchor="middle" fill={labelColor}>Continue to matched route</text>

        <foreignObject x={20} y={180} width={620} height={26}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Same routing decisions as before — the rename to proxy.ts changes the runtime and the name, not what it can do.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-mw1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={requestColor} />
          </marker>
          <marker id="arrow-mw2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={decisionColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

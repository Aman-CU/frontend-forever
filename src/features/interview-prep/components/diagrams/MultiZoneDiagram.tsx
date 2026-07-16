// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows Multi-Zones: one visible domain is
// actually served by several independently built and deployed Next.js
// applications, each owning a set of path prefixes, stitched together via
// rewrites — a hard navigation crosses a zone boundary, a soft (client-side)
// navigation only works within the same zone.
export function MultiZoneDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const domainColor = "var(--color-accent)";
  const zoneColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 220"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of Multi-Zone architecture: one visible domain, example.com, is actually served by three independently built and deployed Next.js applications stitched together with rewrites in the marketing zone's next.config.js — one zone owns the marketing pages at the root path, another owns /dashboard, and another owns /docs. Navigating between zones is a hard, full-page navigation, while navigating within a single zone stays a fast client-side transition."
      >
        <rect x={230} y={16} width={200} height={34} rx={6} fill={domainColor} opacity={0.15} stroke={domainColor} strokeWidth={2} />
        <text x={330} y="38" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>example.com (one visible domain)</text>

        <line x1={290} y1={50} x2={140} y2={85} stroke={domainColor} strokeWidth={1.3} markerEnd="url(#arrow-mz1)" />
        <line x1={330} y1={50} x2={330} y2={85} stroke={domainColor} strokeWidth={1.3} markerEnd="url(#arrow-mz1)" />
        <line x1={370} y1={50} x2={520} y2={85} stroke={domainColor} strokeWidth={1.3} markerEnd="url(#arrow-mz1)" />

        <rect x={40} y={85} width={200} height={60} rx={8} fill={zoneColor} opacity={0.12} stroke={zoneColor} strokeWidth={1.5} />
        <text x={140} y="105" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Marketing zone</text>
        <text x={140} y="121" fontSize={8.5} textAnchor="middle" fill={textColor}>owns / (root)</text>
        <text x={140} y="135" fontSize={8.5} textAnchor="middle" fill={textColor}>its own deploy, its own build</text>

        <rect x={230} y={85} width={200} height={60} rx={8} fill={zoneColor} opacity={0.12} stroke={zoneColor} strokeWidth={1.5} />
        <text x={330} y="105" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Dashboard zone</text>
        <text x={330} y="121" fontSize={8.5} textAnchor="middle" fill={textColor}>owns /dashboard/*</text>
        <text x={330} y="135" fontSize={8.5} textAnchor="middle" fill={textColor}>deployed independently</text>

        <rect x={420} y={85} width={200} height={60} rx={8} fill={zoneColor} opacity={0.12} stroke={zoneColor} strokeWidth={1.5} />
        <text x={520} y="105" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Docs zone</text>
        <text x={520} y="121" fontSize={8.5} textAnchor="middle" fill={textColor}>owns /docs/*</text>
        <text x={520} y="135" fontSize={8.5} textAnchor="middle" fill={textColor}>deployed independently</text>

        <foreignObject x={20} y={165} width={620} height={45}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Stitched together via <code>rewrites</code> in the marketing zone&apos;s <code>next.config.js</code>. Navigating
            between zones (e.g. / to /dashboard) is a full, hard page navigation — only navigation within a single
            zone stays a fast client-side transition.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-mz1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={domainColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

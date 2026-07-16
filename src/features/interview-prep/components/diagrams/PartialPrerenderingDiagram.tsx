// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows Partial Prerendering's core idea:
// a single route's static shell (with a postponed-state "hole" for the
// dynamic part) is generated once at build time; at request time the shell
// is served instantly and only the dynamic hole is rendered and streamed in
// — one route, two rendering strategies, not a whole-page either/or choice.
export function PartialPrerenderingDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const staticColor = "var(--color-success)";
  const dynamicColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 220"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of Partial Prerendering: at build time, Next.js generates one static shell for the route with a hole left for the dynamic part. At request time, the static shell is served instantly from cache, and only the dynamic hole — for example a per-user cart total — is rendered on the server and streamed into the hole, arriving slightly later than the shell."
      >
        <text x={20} y="22" fontSize={11} fontWeight={700} fill={staticColor}>Build time — one prerender</text>
        <rect x={20} y={32} width={280} height={70} rx={8} fill={staticColor} opacity={0.12} stroke={staticColor} strokeWidth={1.5} />
        <text x={160} y="52" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Static shell (nav, layout, product info)</text>
        <rect x={40} y={64} width={240} height={28} rx={6} fill="none" stroke={dynamicColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={160} y="82" fontSize={9} textAnchor="middle" fill={labelColor}>hole left for dynamic part</text>

        <line x1={310} y1={67} x2={370} y2={67} stroke={textColor} strokeWidth={1.3} markerEnd="url(#arrow-ppr1)" />
        <text x={340} y="58" fontSize={8} textAnchor="middle" fill={textColor}>request</text>

        <text x={380} y="22" fontSize={11} fontWeight={700} fill={dynamicColor}>Request time — served + filled</text>
        <rect x={380} y={32} width={260} height={70} rx={8} fill={staticColor} opacity={0.08} stroke={staticColor} strokeWidth={1} />
        <text x={510} y="52" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Shell served instantly (cached)</text>
        <rect x={400} y={64} width={220} height={28} rx={6} fill={dynamicColor} opacity={0.18} stroke={dynamicColor} strokeWidth={2} />
        <text x={510} y="82" fontSize={9} fontWeight={600} textAnchor="middle" fill={labelColor}>Cart total streamed in per-request</text>

        <line x1={510} y1={102} x2={510} y2={130} stroke={dynamicColor} strokeWidth={1.3} markerEnd="url(#arrow-ppr2)" />
        <text x={510} y="145" fontSize={9} textAnchor="middle" fill={textColor}>rendered fresh for each visitor, in the same response</text>

        <foreignObject x={20} y={165} width={620} height={45}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            One route, two strategies at once: the static part never re-renders per request; the dynamic part
            always does — no separate static vs. dynamic route decision needed.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-ppr1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={textColor} />
          </marker>
          <marker id="arrow-ppr2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={dynamicColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

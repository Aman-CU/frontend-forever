// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows why intercepting routes plus
// parallel routes together build shareable modals: clicking a photo from a
// feed intercepts the navigation and shows it as a modal over the feed, but
// a direct visit or a refresh on that same URL renders the full, standalone
// page instead — same URL, two different render paths depending on how it
// was reached.
export function InterceptingRoutesDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const feedColor = "var(--color-accent)";
  const modalColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 220"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of intercepting routes: clicking a photo link while already on the feed page intercepts the navigation to /photo/1, rendering it as a modal layered over the still-visible feed, using the (.) intercepting convention. Directly visiting /photo/1 or refreshing the page, by contrast, skips the interception entirely and renders the full standalone photo page, since there is no prior route to intercept from."
      >
        <text x={20} y="22" fontSize={11} fontWeight={700} fill={feedColor}>Client-side navigation (from within the feed)</text>
        <rect x={20} y={32} width={180} height={44} rx={8} fill={feedColor} opacity={0.12} stroke={feedColor} strokeWidth={1.5} />
        <text x={110} y="50" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Feed page</text>
        <text x={110} y="66" fontSize={8.5} textAnchor="middle" fill={textColor}>{"app/feed/page.tsx"}</text>

        <line x1={200} y1={54} x2={250} y2={54} stroke={feedColor} strokeWidth={1.5} markerEnd="url(#arrow-ir1)" />
        <text x={225} y="45" fontSize={8} textAnchor="middle" fill={textColor}>click photo</text>

        <rect x={250} y={32} width={220} height={44} rx={8} fill={modalColor} opacity={0.15} stroke={modalColor} strokeWidth={2} />
        <text x={360} y="50" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Modal over the feed</text>
        <text x={360} y="66" fontSize={8.5} textAnchor="middle" fill={textColor}>{"app/feed/@modal/(.)photo/[id]/page.tsx"}</text>

        <line x1={330} y1={90} x2={330} y2={115} stroke={textColor} strokeWidth={1} strokeDasharray="3 3" />
        <text x={20} y="130" fontSize={11} fontWeight={700} fill={modalColor}>Direct visit or refresh (no prior route to intercept)</text>

        <rect x={20} y={140} width={180} height={44} rx={8} fill="none" stroke={feedColor} strokeWidth={1.3} />
        <text x={110} y="158" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>URL bar: /photo/1</text>
        <text x={110} y="174" fontSize={8.5} textAnchor="middle" fill={textColor}>typed or refreshed</text>

        <line x1={200} y1={162} x2={250} y2={162} stroke={feedColor} strokeWidth={1.5} markerEnd="url(#arrow-ir2)" />

        <rect x={250} y={140} width={220} height={44} rx={8} fill="none" stroke={feedColor} strokeWidth={1.3} />
        <text x={360} y="158" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Full standalone page</text>
        <text x={360} y="174" fontSize={8.5} textAnchor="middle" fill={textColor}>{"app/photo/[id]/page.tsx"}</text>

        <foreignObject x={20} y={195} width={620} height={22}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Same URL, two outcomes — which one renders depends entirely on how the route was reached.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-ir1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={feedColor} />
          </marker>
          <marker id="arrow-ir2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={feedColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

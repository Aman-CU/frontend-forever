// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the browser history stack under
// each navigation mode: push adds a brand-new entry (back returns to the
// previous page), replace overwrites the current entry in place (back
// skips straight past it, as if it never existed).
export function PushVsReplaceDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const pushColor = "var(--color-accent)";
  const replaceColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 620 220"
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label="Diagram contrasting push and replace navigation. Push: navigating from /cart to /checkout adds a new history entry, so pressing back returns to /cart. Replace: navigating the same way with replace overwrites the /cart entry with /checkout, so pressing back skips /cart entirely and goes to whatever came before it."
      >
        <text x={20} y="22" fontSize={12} fontWeight={700} fill={pushColor}>push — adds a new history entry</text>
        <rect x={20} y={34} width={90} height={30} rx={5} fill="none" stroke={pushColor} strokeWidth={1.3} />
        <text x={65} y="53" fontSize={9} textAnchor="middle" fill={labelColor}>/home</text>
        <rect x={120} y={34} width={90} height={30} rx={5} fill="none" stroke={pushColor} strokeWidth={1.3} />
        <text x={165} y="53" fontSize={9} textAnchor="middle" fill={labelColor}>/cart</text>
        <line x1={210} y1={49} x2={235} y2={49} stroke={pushColor} strokeWidth={1.3} markerEnd="url(#arrow-pr1)" />
        <rect x={235} y={34} width={110} height={30} rx={5} fill={pushColor} opacity={0.15} stroke={pushColor} strokeWidth={1.5} />
        <text x={290} y="53" fontSize={9} fontWeight={700} textAnchor="middle" fill={labelColor}>/checkout (new)</text>
        <text x={165} y="80" fontSize={9} fontWeight={600} textAnchor="middle" fill={pushColor}>back → returns here</text>
        <line x1={165} y1={64} x2={165} y2={75} stroke={pushColor} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#arrow-pr2)" />

        <text x={20} y="120" fontSize={12} fontWeight={700} fill={replaceColor}>replace — overwrites the current entry</text>
        <rect x={20} y={132} width={90} height={30} rx={5} fill="none" stroke={replaceColor} strokeWidth={1.3} />
        <text x={65} y="151" fontSize={9} textAnchor="middle" fill={labelColor}>/home</text>
        <rect x={120} y={132} width={90} height={30} rx={5} fill="none" stroke={replaceColor} strokeWidth={1.3} strokeDasharray="3 3" opacity={0.5} />
        <text x={165} y="151" fontSize={9} textAnchor="middle" fill={textColor}>/cart (gone)</text>
        <rect x={120} y={132} width={90} height={30} rx={5} fill={replaceColor} opacity={0.15} stroke={replaceColor} strokeWidth={1.5} />
        <text x={165} y="151" fontSize={9} fontWeight={700} textAnchor="middle" fill={labelColor}>/checkout</text>
        <text x={65} y="178" fontSize={9} fontWeight={600} textAnchor="middle" fill={replaceColor}>back → skips /cart, returns here</text>
        <line x1={65} y1={162} x2={65} y2={173} stroke={replaceColor} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#arrow-pr3)" />

        <foreignObject x={20} y={198} width={580} height={20}>
          <div className="text-[10px] leading-snug" style={{ color: textColor }}>
            replace is for steps the user shouldn&apos;t navigate back into — a completed redirect, not a page worth revisiting.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-pr1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={pushColor} />
          </marker>
          <marker id="arrow-pr2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={pushColor} />
          </marker>
          <marker id="arrow-pr3" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={replaceColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

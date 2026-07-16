// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows list virtualization's core idea: a
// list of thousands of items, but only the handful currently inside (or
// just outside, as overscan buffer) the visible viewport actually get
// mounted as real DOM nodes — everything else is empty space, sized to
// match, with no corresponding DOM node at all.
export function VirtualizedListDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const renderedColor = "var(--color-success)";
  const unrenderedColor = "var(--color-border-muted)";

  const rows = Array.from({ length: 12 }, (_, i) => i);
  const viewportStart = 4;
  const viewportEnd = 8;

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 500 260"
        className="h-auto w-full min-w-[380px]"
        role="img"
        aria-label="Diagram of list virtualization: of a list with thousands of items, only the rows inside the visible viewport (plus a small overscan buffer) are actually rendered as real DOM nodes. Rows above and below the viewport occupy empty, correctly-sized space in the scroll container but have no corresponding DOM node."
      >
        <rect x={40} y={20} width={200} height={220} rx={4} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
        {rows.map((i) => {
          const y = 20 + i * (220 / rows.length);
          const inViewport = i >= viewportStart && i <= viewportEnd;
          return (
            <g key={i}>
              <rect
                x={44}
                y={y + 2}
                width={192}
                height={220 / rows.length - 4}
                rx={3}
                fill={inViewport ? renderedColor : "none"}
                fillOpacity={inViewport ? 0.15 : 1}
                stroke={inViewport ? renderedColor : unrenderedColor}
                strokeWidth={1.2}
                strokeDasharray={inViewport ? undefined : "2 2"}
              />
            </g>
          );
        })}
        <rect x={40} y={20 + viewportStart * (220 / rows.length)} width={200} height={(viewportEnd - viewportStart + 1) * (220 / rows.length)} rx={4} fill="none" stroke={renderedColor} strokeWidth={2} />

        <text x={140} y="12" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>
          Scroll container (thousands of rows)
        </text>

        <line x1={260} y1={20 + viewportStart * (220 / rows.length)} x2={310} y2={110} stroke={renderedColor} strokeWidth={1} strokeDasharray="2 3" />
        <foreignObject x={260} y={95} width={220} height={60}>
          <div className="text-xs leading-snug" style={{ color: renderedColor }}>
            <strong>Rendered:</strong> real DOM nodes exist only for rows in (or near) the visible viewport.
          </div>
        </foreignObject>

        <line x1={260} y1={60} x2={310} y2={60} stroke={textColor} strokeWidth={1} strokeDasharray="2 3" />
        <foreignObject x={260} y={165} width={220} height={70}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            <strong>Not rendered:</strong> off-screen rows are empty, correctly-sized space — no DOM node at all until scrolled into view.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

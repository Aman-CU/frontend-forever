// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Walks hydration end to end: the server
// sends static HTML the browser paints immediately, then React downloads
// and runs, walking that existing HTML to attach event listeners and build
// its internal tree — reusing the DOM nodes rather than re-creating them —
// after which the page is interactive.
export function HydrationFlowDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const serverColor = "var(--color-accent)";
  const clientColor = "var(--color-success)";

  const steps = [
    { x: 70, label: "Server renders HTML", detail: "static markup sent to the browser", color: serverColor },
    { x: 250, label: "Browser paints it", detail: "visible immediately, not yet interactive", color: serverColor },
    { x: 430, label: "React attaches", detail: "walks existing DOM, reuses nodes, adds listeners", color: clientColor },
    { x: 620, label: "Interactive", detail: "clicks, typing now work", color: clientColor },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 200"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Diagram of hydration: the server renders static HTML, the browser paints it immediately though it is not yet interactive, React downloads and walks the existing DOM to attach event listeners and reuse the nodes rather than re-creating them, and the page becomes interactive."
      >
        <line x1={40} y1={90} x2={660} y2={90} stroke="var(--color-border)" strokeWidth={1.5} />
        {steps.map((step) => (
          <g key={step.label}>
            <circle cx={step.x} cy={90} r={7} fill={step.color} />
            <text x={step.x} y="60" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>
              {step.label}
            </text>
            <foreignObject x={step.x - 75} y={102} width={150} height={44}>
              <div className="text-center text-[10px] leading-snug" style={{ color: textColor }}>
                {step.detail}
              </div>
            </foreignObject>
          </g>
        ))}

        <foreignObject x={20} y={160} width={660} height={36}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            React never re-creates the DOM nodes the server produced — it attaches to them. A mismatch between server and client output (e.g. from <code>Date.now()</code>) breaks this assumption and throws a hydration error.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

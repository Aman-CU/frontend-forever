// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG (not a rough.js sketch — that's Feature 49-only). Walks the
// exact "3 visitors" scenario already described in this question's answer:
// Visitor A (page still fresh) gets the cached HTML; Visitor B (page just
// went stale) still gets that same cached HTML instantly while a
// regeneration kicks off silently in the background; Visitor C (arrives
// after regeneration finished) gets the newly regenerated HTML — nobody
// ever blocks on a rebuild.
export function IsrTimelineDiagram() {
  const axisColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const cachedColor = "var(--color-accent)";
  const staleColor = "var(--color-warning)";
  const freshColor = "var(--color-success)";

  const visitors = [
    {
      x: 100,
      label: "Visitor A",
      time: "before revalidate window",
      color: cachedColor,
      result: "Gets the cached HTML (fresh)",
    },
    {
      x: 340,
      label: "Visitor B",
      time: "just past revalidate window",
      color: staleColor,
      result: "Still gets the same cached HTML — instantly — while a regeneration starts in the background",
    },
    {
      x: 560,
      label: "Visitor C",
      time: "after regeneration finished",
      color: freshColor,
      result: "Gets the newly regenerated HTML",
    },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 260"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Timeline diagram: Visitor A arrives while the page is fresh and gets the cached HTML. Visitor B arrives just after the page goes stale and still gets the same cached HTML instantly, while Next.js regenerates a fresh copy in the background. Visitor C arrives after that regeneration finished and gets the new HTML. Nobody ever waits on a rebuild."
      >
        {/* Timeline axis */}
        <line x1={40} y1={60} x2={600} y2={60} stroke={axisColor} strokeWidth={1.5} />
        {/* Stale marker */}
        <line x1={280} y1={40} x2={280} y2={80} stroke={staleColor} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={280} y={30} fontSize={11} fontWeight={600} textAnchor="middle" fill={staleColor}>
          revalidate window passes
        </text>
        {/* Background regeneration span, triggered by Visitor B */}
        <rect x={340} y={52} width={140} height={16} rx={8} fill={staleColor} opacity={0.18} />
        <text x={410} y={100} fontSize={11} textAnchor="middle" fill={textColor}>
          regeneration runs in the background
        </text>

        {visitors.map((v) => (
          <g key={v.label}>
            <circle cx={v.x} cy={60} r={7} fill={v.color} />
            <line x1={v.x} y1={67} x2={v.x} y2={130} stroke={v.color} strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={v.x} y={150} fontSize={13} fontWeight={700} textAnchor="middle" fill={labelColor}>
              {v.label}
            </text>
            <text x={v.x} y={168} fontSize={10} textAnchor="middle" fill={textColor}>
              {v.time}
            </text>
            <foreignObject x={v.x - 90} y={180} width={180} height={70}>
              <div
                className="text-center text-xs leading-snug"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {v.result}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </figure>
  );
}

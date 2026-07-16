// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact ordering this
// question's answer describes: React commits DOM mutations, then runs every
// useLayoutEffect synchronously — blocking the browser from painting until
// they finish — and only after that does the browser paint, with
// useEffect's callbacks firing asynchronously afterward, off the critical
// path to the user actually seeing pixels.
export function LayoutEffectVsEffectTimingDiagram() {
  const axisColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const commitColor = "var(--color-accent)";
  const layoutColor = "var(--color-warning)";
  const paintColor = "var(--color-success)";
  const effectColor = "var(--color-text-secondary)";

  const steps = [
    { x: 60, label: "Render", detail: "component function runs", color: commitColor },
    { x: 200, label: "Commit", detail: "DOM mutations applied", color: commitColor },
    { x: 340, label: "useLayoutEffect", detail: "runs synchronously — blocks paint", color: layoutColor },
    { x: 500, label: "Browser paints", detail: "user sees the update", color: paintColor },
    { x: 620, label: "useEffect", detail: "runs asynchronously, after paint", color: effectColor },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 220"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Timeline diagram: after render, React commits DOM mutations, then runs every useLayoutEffect synchronously, blocking the browser from painting until they finish. Only after that does the browser paint the update on screen. useEffect callbacks run afterward, asynchronously, off the critical path to the user seeing pixels."
      >
        <line x1={40} y1={100} x2={660} y2={100} stroke={axisColor} strokeWidth={1.5} />

        {steps.map((step) => (
          <g key={step.label}>
            <circle cx={step.x} cy={100} r={7} fill={step.color} />
            <line
              x1={step.x}
              y1={107}
              x2={step.x}
              y2={130}
              stroke={step.color}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text x={step.x} y={150} fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>
              {step.label}
            </text>
            <foreignObject x={step.x - 65} y={158} width={130} height={50}>
              <div className="text-center text-xs leading-snug" style={{ color: "var(--color-text-secondary)" }}>
                {step.detail}
              </div>
            </foreignObject>
          </g>
        ))}

        <path
          d="M 340 80 C 340 55, 500 55, 500 80"
          fill="none"
          stroke={layoutColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-layout-blocks)"
        />
        <text x={420} y={45} fontSize={10} fontWeight={600} textAnchor="middle" fill={layoutColor}>
          blocks the browser from painting until it finishes
        </text>

        <defs>
          <marker id="arrow-layout-blocks" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={layoutColor} />
          </marker>
        </defs>

        <text x={40} y={20} fontSize={11} fill={textColor}>
          <tspan fontWeight={700} fill={layoutColor}>
            useLayoutEffect
          </tspan>{" "}
          runs before the paint the user sees;{" "}
          <tspan fontWeight={700} fill={effectColor}>
            useEffect
          </tspan>{" "}
          runs after it.
        </text>
      </svg>
    </figure>
  );
}

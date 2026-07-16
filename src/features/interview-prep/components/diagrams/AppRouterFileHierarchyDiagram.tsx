// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the precise nesting order of App
// Router special files within one route segment, per Next.js's own file
// conventions docs: layout.js (outermost, persists across navigation)
// wraps template.js (remounts on every navigation), which wraps error.js's
// Error Boundary, which wraps loading.js's Suspense boundary, which wraps
// not-found.js and page.js at the center.
export function AppRouterFileHierarchyDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";

  const layers = [
    { label: "layout.js", detail: "persists across navigation", color: "var(--color-accent)", size: 260 },
    { label: "template.js", detail: "remounts on every navigation", color: "var(--color-warning)", size: 215 },
    { label: "error.js", detail: "Error Boundary", color: "var(--color-error)", size: 170 },
    { label: "loading.js", detail: "Suspense boundary", color: "var(--color-success)", size: 125 },
    { label: "page.js / not-found.js", detail: "", color: "var(--color-text-muted)", size: 70 },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 520 300"
        className="h-auto w-full min-w-[420px]"
        role="img"
        aria-label="Diagram of App Router file convention nesting order within one route segment: layout.js is outermost and persists across navigation, wrapping template.js, which remounts on every navigation and wraps error.js's Error Boundary, which wraps loading.js's Suspense boundary, which wraps page.js and not-found.js at the center."
      >
        {layers.map((layer) => (
          <g key={layer.label}>
            <rect
              x={260 - layer.size / 2}
              y={150 - layer.size / 2}
              width={layer.size}
              height={layer.size}
              rx={10}
              fill="none"
              stroke={layer.color}
              strokeWidth={1.5}
            />
            <text x={260} y={150 - layer.size / 2 + 16} fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>
              {layer.label}
            </text>
            {layer.detail && (
              <text x={260} y={150 - layer.size / 2 + 29} fontSize={8} textAnchor="middle" fill={textColor}>
                {layer.detail}
              </text>
            )}
          </g>
        ))}

        <foreignObject x={10} y={270} width={500} height={28}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Each layer wraps everything inside it, but never the layer(s) outside itself in the same segment.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

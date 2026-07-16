// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows that React's core reconciliation
// algorithm is shared and renderer-agnostic — react-dom, react-native, and
// a custom renderer built on react-reconciler (react-three-fiber, Ink) each
// plug their own small "host config" (createInstance, appendChild,
// commitUpdate) into the same shared diffing engine.
export function CustomRendererArchitectureDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const coreColor = "var(--color-accent)";
  const targetColor = "var(--color-warning)";

  const targets = [
    { x: 90, label: "react-dom", detail: "targets the browser DOM" },
    { x: 260, label: "react-native", detail: "targets native mobile views" },
    { x: 430, label: "react-three-fiber", detail: "targets WebGL / Three.js" },
    { x: 570, label: "Ink", detail: "targets the terminal" },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 220"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of React's renderer-agnostic architecture: a shared core reconciler performs the same diffing algorithm regardless of target, with react-dom, react-native, react-three-fiber, and Ink each implementing a small host config that plugs into that shared core to target the browser DOM, native mobile views, WebGL/Three.js scenes, or a terminal, respectively."
      >
        <rect x={140} y={20} width={380} height={50} rx={8} fill={coreColor} opacity={0.15} stroke={coreColor} strokeWidth={2} />
        <text x={330} y="42" fontSize={12} fontWeight={700} textAnchor="middle" fill={labelColor}>Shared core reconciler</text>
        <text x={330} y="60" fontSize={9} textAnchor="middle" fill={textColor}>(react-reconciler) — same diffing algorithm for every target</text>

        {targets.map((t) => (
          <g key={t.label}>
            <line x1={330} y1={70} x2={t.x} y2={110} stroke={coreColor} strokeWidth={1.3} strokeDasharray="3 3" />
            <rect x={t.x - 65} y={110} width={130} height={44} rx={6} fill="none" stroke={targetColor} strokeWidth={1.3} />
            <text x={t.x} y="130" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>{t.label}</text>
            <foreignObject x={t.x - 62} y={135} width={124} height={20}>
              <div className="text-center text-[8px] leading-snug" style={{ color: textColor }}>{t.detail}</div>
            </foreignObject>
          </g>
        ))}

        <foreignObject x={20} y={175} width={620} height={40}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Each renderer implements only a small &quot;host config&quot; — createInstance, appendChild, commitUpdate — the shared reconciler calls into; none of them re-implement the diffing algorithm itself.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

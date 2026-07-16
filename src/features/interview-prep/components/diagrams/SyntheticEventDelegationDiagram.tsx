// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the path a click actually takes:
// the native DOM event bubbles up to the root container (React 17+ — not
// document, where earlier versions listened), React wraps it in a
// normalized SyntheticEvent, then dispatches it to the correct handler by
// walking the React component tree rather than the DOM tree.
export function SyntheticEventDelegationDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const nativeColor = "var(--color-text-muted)";
  const reactColor = "var(--color-accent)";

  const steps = [
    { x: 70, label: "Native click", detail: "fires on the actual DOM node", color: nativeColor },
    { x: 250, label: "Bubbles to #root", detail: "React 17+ listens here, not document", color: nativeColor },
    { x: 430, label: "Wrapped as SyntheticEvent", detail: "cross-browser normalized", color: reactColor },
    { x: 600, label: "Dispatched via component tree", detail: "not the DOM tree", color: reactColor },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 680 200"
        className="h-auto w-full min-w-[600px]"
        role="img"
        aria-label="Diagram of React's synthetic event system: a native click fires on the DOM node, bubbles up to the root container (React 17 and later listen here instead of document), gets wrapped as a cross-browser normalized SyntheticEvent, and is dispatched to the correct handler by walking the React component tree rather than the DOM tree."
      >
        <line x1={40} y1={90} x2={660} y2={90} stroke="var(--color-border)" strokeWidth={1.5} />
        {steps.map((step) => (
          <g key={step.label}>
            <circle cx={step.x} cy={90} r={6} fill={step.color} />
            <foreignObject x={step.x - 75} y={40} width={150} height={44}>
              <div className="text-center text-[10px] font-semibold leading-snug" style={{ color: labelColor }}>
                {step.label}
              </div>
            </foreignObject>
            <foreignObject x={step.x - 75} y={102} width={150} height={40}>
              <div className="text-center text-[9px] leading-snug" style={{ color: textColor }}>
                {step.detail}
              </div>
            </foreignObject>
          </g>
        ))}

        <foreignObject x={20} y={160} width={640} height={30}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            Because dispatch follows the component tree, a Portal-rendered element&apos;s events still reach a real ancestor&apos;s handler, even though its DOM node isn&apos;t nested inside that ancestor at all.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

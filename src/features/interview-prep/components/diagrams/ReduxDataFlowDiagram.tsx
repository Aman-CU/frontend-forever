// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Walks Redux's unidirectional data flow:
// a UI event dispatches an action, the reducer computes the next state from
// the current state and that action, the store holds the new state, and
// subscribed components re-render from it — the loop that makes "one-way
// data flow" concrete instead of abstract.
export function ReduxDataFlowDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const nodeColor = "var(--color-accent)";
  const arrowColor = "var(--color-border-muted)";

  const nodes = [
    { x: 90, label: "View", detail: "user clicks a button" },
    { x: 270, label: "Action", detail: "dispatch({ type: \"...\" })" },
    { x: 450, label: "Reducer", detail: "(state, action) => newState" },
    { x: 630, label: "Store", detail: "holds the new state" },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 720 200"
        className="h-auto w-full min-w-[640px]"
        role="img"
        aria-label="Diagram of Redux's unidirectional data flow: the View dispatches an Action, the Reducer computes new state from the current state and that action, the Store holds the new state, and the Store notifies the View to re-render, which loops back to the View at the start."
      >
        {nodes.map((node, i) => (
          <g key={node.label}>
            <rect
              x={node.x - 70}
              y={70}
              width={140}
              height={60}
              rx={8}
              fill="none"
              stroke={nodeColor}
              strokeWidth={1.5}
            />
            <text x={node.x} y={95} fontSize={13} fontWeight={700} textAnchor="middle" fill={labelColor}>
              {node.label}
            </text>
            <foreignObject x={node.x - 68} y={100} width={136} height={28}>
              <div className="text-center text-[10px] leading-snug" style={{ color: textColor }}>
                {node.detail}
              </div>
            </foreignObject>
            {i < nodes.length - 1 && (
              <line
                x1={node.x + 70}
                y1={100}
                x2={node.x + 130}
                y2={100}
                stroke={arrowColor}
                strokeWidth={1.5}
                markerEnd="url(#arrow-redux-flow)"
              />
            )}
          </g>
        ))}

        <path
          d="M 630 130 C 630 175, 90 175, 90 130"
          fill="none"
          stroke={arrowColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-redux-flow)"
        />
        <text x={360} y="192" fontSize={10} fontWeight={600} textAnchor="middle" fill={textColor}>
          Store notifies subscribed components — the View re-renders from the new state
        </text>

        <defs>
          <marker id="arrow-redux-flow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={arrowColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

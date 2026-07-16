// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact example already
// in this question's answer: a click on .inner fires "outer capture" (capture
// phase, listener registered with { capture: true }), then "inner target"
// (the target itself), then "outer bubble" (default bubble-phase listener on
// the same ancestor) — in that exact order.
export function EventBubblingCapturingDiagram() {
  const borderColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const captureColor = "var(--color-accent)";
  const targetColor = "var(--color-success)";
  const bubbleColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 560 360"
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Diagram: clicking .inner first triggers the capture phase, running the outer capture listener on an ancestor as the event travels down from the document root. It then reaches .inner, the target, running the target listener. Finally it bubbles back up, running the outer bubble listener on the same ancestor. The order is outer capture, then inner target, then outer bubble."
      >
        {/* document (outermost context, for orientation only) */}
        <rect x={30} y={20} width={500} height={280} rx={10} fill="none" stroke={borderColor} strokeWidth={1.5} />
        <text x={46} y={44} fontSize={12} fontWeight={600} fill={textColor}>
          document
        </text>

        {/* .outer — has both a capture-phase and a bubble-phase listener */}
        <rect x={90} y={60} width={380} height={200} rx={10} fill="none" stroke={captureColor} strokeWidth={1.5} />
        <text x={106} y={84} fontSize={13} fontWeight={700} fill={labelColor}>
          .outer
        </text>
        <text x={106} y={100} fontSize={10} fill={textColor}>
          listeners: capture-phase + bubble-phase
        </text>

        {/* .inner — the actual click target */}
        <rect
          x={170}
          y={140}
          width={220}
          height={80}
          rx={10}
          fill="none"
          stroke={targetColor}
          strokeWidth={2}
        />
        <text x={186} y={166} fontSize={13} fontWeight={700} fill={labelColor}>
          .inner — target
        </text>
        <text x={186} y={184} fontSize={10} fill={textColor}>
          the element actually clicked
        </text>

        {/* Capture phase: travels down the left side into the target */}
        <path
          d="M 60 40 L 60 178 L 168 178"
          fill="none"
          stroke={captureColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-capture)"
        />
        <StepChip x={60} y={60} number={1} code="outer capture" color={captureColor} />

        <StepChip x={280} y={200} number={2} code="inner target" color={targetColor} />

        {/* Bubble phase: travels back up the right side */}
        <path
          d="M 392 178 L 460 178 L 460 40"
          fill="none"
          stroke={bubbleColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-bubble)"
        />
        <StepChip x={460} y={60} number={3} code="outer bubble" color={bubbleColor} />

        <defs>
          <marker id="arrow-capture" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={captureColor} />
          </marker>
          <marker id="arrow-bubble" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={bubbleColor} />
          </marker>
        </defs>

        <text x={30} y={330} fontSize={12} fill={textColor}>
          Order: <tspan fontWeight={700} fill={captureColor}>outer capture</tspan> →{" "}
          <tspan fontWeight={700} fill={targetColor}>inner target</tspan> →{" "}
          <tspan fontWeight={700} fill={bubbleColor}>outer bubble</tspan>
        </text>
      </svg>
    </figure>
  );
}

function StepChip({
  x,
  y,
  number,
  code,
  color,
}: {
  x: number;
  y: number;
  number: number;
  code: string;
  color: string;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={0} r={9} fill={color} />
      <text x={0} y={4} fontSize={10} fontWeight={700} textAnchor="middle" fill="var(--color-surface)">
        {number}
      </text>
      <text x={16} y={4} fontSize={12} fontFamily="monospace" fill="var(--color-text-primary)">
        {code}
      </text>
    </g>
  );
}

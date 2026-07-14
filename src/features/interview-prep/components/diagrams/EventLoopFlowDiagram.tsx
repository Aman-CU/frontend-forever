// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, and deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact 4-line example
// already in this question's answer:
//
//   console.log('1');
//   setTimeout(() => console.log('2'), 0);
//   Promise.resolve().then(() => console.log('3'));
//   console.log('4');
//   // Output: 1, 4, 3, 2
//
// Same 4-lane visual grammar as the Event Loop simulator (Feature 09), just
// static instead of interactive, so a reader who's played with that simulator
// gets an instantly familiar diagram here.
export function EventLoopFlowDiagram() {
  const laneColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const stackColor = "var(--color-accent)";
  const microtaskColor = "var(--color-success)";
  const macrotaskColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 300"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram: console.log('1') and console.log('4') run on the call stack; setTimeout queues in the macrotask queue via Web APIs; Promise.then queues directly in the microtask queue. The microtask queue drains completely into the call stack before the macrotask queue gets a turn, producing the output order 1, 4, 3, 2."
      >
        {/* 4 lanes */}
        {[
          { y: 20, label: "Call Stack", color: stackColor },
          { y: 90, label: "Web APIs", color: textColor },
          { y: 160, label: "Microtask Queue", color: microtaskColor },
          { y: 230, label: "Macrotask Queue", color: macrotaskColor },
        ].map((lane) => (
          <g key={lane.label}>
            <rect
              x={130}
              y={lane.y}
              width={480}
              height={50}
              rx={8}
              fill="none"
              stroke={laneColor}
              strokeWidth={1.5}
            />
            <text x={0} y={lane.y + 30} fontSize={13} fontWeight={600} fill={labelColor}>
              {lane.label}
            </text>
          </g>
        ))}

        {/* Step 1 & 4: synchronous logs, directly on the call stack */}
        <StepChip x={150} y={35} color={stackColor} number={1} code="log('1')" />
        <StepChip x={150} y={35 + 0} number={4} code="log('4')" color={stackColor} dx={110} />

        {/* Step 2: setTimeout hands off to Web APIs, then queues a macrotask */}
        <StepChip x={370} y={105} color={textColor} number={2} code="setTimeout" />
        <path
          d="M 460 130 C 520 130, 560 160, 590 245"
          fill="none"
          stroke={macrotaskColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-macrotask)"
        />

        {/* Step 3: Promise.then queues directly into the microtask lane */}
        <StepChip x={150} y={175} color={microtaskColor} number={3} code="Promise.then" />

        {/* Microtask queue drains completely into the stack first */}
        <path
          d="M 250 175 C 200 145, 200 75, 220 55"
          fill="none"
          stroke={microtaskColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-microtask)"
        />

        {/* Macrotask queue only gets a turn after microtasks are empty */}
        <path
          d="M 610 245 C 480 280, 260 280, 230 60"
          fill="none"
          stroke={macrotaskColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-macrotask2)"
        />

        <defs>
          <marker id="arrow-microtask" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={microtaskColor} />
          </marker>
          <marker id="arrow-macrotask" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={macrotaskColor} />
          </marker>
          <marker id="arrow-macrotask2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={macrotaskColor} />
          </marker>
        </defs>

        <text x={130} y={290} fontSize={12} fill={textColor}>
          Output order: <tspan fontWeight={700} fill={labelColor}>1, 4, 3, 2</tspan> — microtasks (3)
          always run before the queued macrotask (2), no matter the call order.
        </text>
      </svg>
    </figure>
  );
}

function StepChip({
  x,
  y,
  dx = 0,
  number,
  code,
  color,
}: {
  x: number;
  y: number;
  dx?: number;
  number: number;
  code: string;
  color: string;
}) {
  return (
    <g transform={`translate(${x + dx}, ${y})`}>
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

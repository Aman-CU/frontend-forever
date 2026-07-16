// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Same 4-lane visual grammar as
// EventLoopFlowDiagram (event-loop question, Feature 09's simulator), but
// walks this question's own, trickier example:
//
//   console.log("1: sync");
//   setTimeout(() => console.log("2: macrotask"), 0);
//   Promise.resolve().then(() => {
//     console.log("3: microtask");
//     Promise.resolve().then(() => console.log("4: nested microtask"));
//   });
//   queueMicrotask(() => console.log("5: microtask"));
//   console.log("6: sync");
//   // Output: 1, 6, 3, 5, 4, 2
//
// The point this diagram exists to make: step 4 is queued *by* step 3, while
// the microtask queue is already draining — it still runs before step 2 (the
// macrotask) ever gets a turn, because the queue keeps draining until it's
// genuinely empty, no matter how many new microtasks get added along the way.
export function MicrotaskMacrotaskDiagram() {
  const laneColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const stackColor = "var(--color-accent)";
  const microtaskColor = "var(--color-success)";
  const macrotaskColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 320"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram: console.log 1 and console.log 6 run synchronously on the call stack. setTimeout queues a macrotask via Web APIs. Promise.then queues step 3 directly as a microtask; step 3's own callback then queues step 4 as a further microtask, and queueMicrotask queues step 5. All three microtasks, 3, 5, and 4, drain completely into the call stack before the macrotask, step 2, ever gets a turn, producing the output order 1, 6, 3, 5, 4, 2."
      >
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

        {/* Steps 1 & 6: synchronous logs, run directly on the call stack */}
        <StepChip x={150} y={35} number={1} code="log('1')" color={stackColor} />
        <StepChip x={260} y={35} number={6} code="log('6')" color={stackColor} />

        {/* Step 2: setTimeout hands off to Web APIs, then queues a macrotask */}
        <StepChip x={370} y={105} number={2} code="setTimeout" color={textColor} />
        <path
          d="M 460 130 C 520 130, 560 160, 590 245"
          fill="none"
          stroke={macrotaskColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-mm-macrotask)"
        />

        {/* Step 3: Promise.then queues directly into the microtask lane */}
        <StepChip x={150} y={175} number={3} code="Promise.then" color={microtaskColor} />

        {/* Step 4: queued by step 3's own callback — still lands in the microtask lane */}
        <path
          d="M 210 175 C 240 155, 260 155, 285 172"
          fill="none"
          stroke={microtaskColor}
          strokeWidth={1.5}
          strokeDasharray="3 3"
          markerEnd="url(#arrow-mm-nested)"
        />
        <StepChip x={310} y={175} number={4} code="nested .then" color={microtaskColor} />
        <text x={300} y={150} fontSize={10} fill={microtaskColor}>
          queued by step 3 itself
        </text>

        {/* Step 5: queueMicrotask, also in the microtask lane */}
        <StepChip x={460} y={175} number={5} code="queueMicrotask" color={microtaskColor} />

        {/* Microtask queue drains completely into the stack before the macrotask gets a turn */}
        <path
          d="M 250 175 C 200 145, 200 75, 220 55"
          fill="none"
          stroke={microtaskColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-mm-drain)"
        />

        {/* Macrotask only gets a turn once the microtask queue above is empty */}
        <path
          d="M 610 245 C 480 280, 260 280, 230 60"
          fill="none"
          stroke={macrotaskColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrow-mm-macrotask2)"
        />

        <defs>
          <marker id="arrow-mm-macrotask" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={macrotaskColor} />
          </marker>
          <marker id="arrow-mm-macrotask2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={macrotaskColor} />
          </marker>
          <marker id="arrow-mm-nested" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={microtaskColor} />
          </marker>
          <marker id="arrow-mm-drain" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={microtaskColor} />
          </marker>
        </defs>

        <text x={130} y={290} fontSize={12} fill={textColor}>
          Output: <tspan fontWeight={700} fill={labelColor}>1, 6, 3, 5, 4, 2</tspan> — steps 3, 5, and 4 (even
        </text>
        <text x={130} y={306} fontSize={12} fill={textColor}>
          though 4 is queued by 3 itself) all drain before step 2, the macrotask, gets a turn.
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

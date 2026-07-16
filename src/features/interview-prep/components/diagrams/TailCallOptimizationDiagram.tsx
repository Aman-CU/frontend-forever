// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact two functions
// already in this question's answer: plain recursive factorial(n), where
// each call adds a new stack frame because the multiplication is still
// pending after the recursive call returns, versus factorialTCO(n, acc),
// where the recursive call is the literal last operation — in an engine that
// actually implements TCO, that call can reuse the current frame instead of
// growing the stack.
export function TailCallOptimizationDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const growColor = "var(--color-warning)";
  const reuseColor = "var(--color-success)";

  const frames = [
    { y: 250, label: "factorial(4)" },
    { y: 200, label: "factorial(3)" },
    { y: 150, label: "factorial(2)" },
    { y: 100, label: "factorial(1)" },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 560 320"
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Diagram: without tail call optimization, each recursive call to factorial adds a new stack frame on top of the last, because the multiplication is still pending after the call returns — four calls means four frames. With tail call optimization, factorialTCO's recursive call is in tail position, so the engine reuses the same single frame for every call instead of growing the stack, updating the accumulator in place."
      >
        {/* ── Left: without TCO, stack grows ──────────────────────────── */}
        <text x={20} y={28} fontSize={12} fontWeight={700} fill={labelColor}>
          Without TCO — stack grows
        </text>

        {frames.map((frame, i) => (
          <g key={frame.label}>
            <rect
              x={30}
              y={frame.y}
              width={200}
              height={40}
              rx={6}
              fill="none"
              stroke={growColor}
              strokeWidth={1.5}
              opacity={0.4 + i * 0.2}
            />
            <text x={44} y={frame.y + 25} fontSize={12} fontFamily="monospace" fill={labelColor}>
              {frame.label}
            </text>
          </g>
        ))}
        <text x={30} y={278} fontSize={10} fill={textColor}>
          each call waits to multiply — 4 calls, 4 live frames
        </text>

        {/* ── Right: with TCO, one frame reused ───────────────────────── */}
        <text x={310} y={28} fontSize={12} fontWeight={700} fill={labelColor}>
          With TCO — same frame reused
        </text>

        <rect x={330} y={160} width={200} height={50} rx={6} fill="none" stroke={reuseColor} strokeWidth={2} />
        <text x={344} y={190} fontSize={12} fontFamily="monospace" fill={labelColor}>
          factorialTCO(n, acc)
        </text>

        <path
          d="M 530 165 C 560 140, 560 220, 530 205"
          fill="none"
          stroke={reuseColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-tco-loop)"
        />
        <text x={330} y={240} fontSize={10} fill={textColor}>
          acc updated in place — the stack never grows
        </text>

        <defs>
          <marker id="arrow-tco-loop" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={reuseColor} />
          </marker>
        </defs>

        <text x={20} y={300} fontSize={10} fill={textColor}>
          Real-world catch: only Safari (JavaScriptCore) implements this — V8 and SpiderMonkey never shipped it.
        </text>
      </svg>
    </figure>
  );
}

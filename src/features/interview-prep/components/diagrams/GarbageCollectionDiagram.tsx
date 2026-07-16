// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact example already
// in this question's answer:
//
//   let user = { name: "Rex" }; // reachable — "user" points to it
//   user = null;                 // the object is now unreachable — eligible for GC
//
// Left panel: "user" still points to the object — reachable from a root,
// kept alive. Right panel: "user" was reassigned to null — nothing points to
// the original object anymore, so it's unreachable and eligible for the
// mark-and-sweep collector to reclaim.
export function GarbageCollectionDiagram() {
  const borderColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const reachableColor = "var(--color-success)";
  const unreachableColor = "var(--color-error)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 560 300"
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Diagram: before user is reassigned, the roots (global scope) reach the user variable, which points to the object — the object is reachable and kept alive. After user = null runs, the roots still reach the user variable, but user no longer points to the object — nothing reaches it anymore, so it's unreachable and eligible for garbage collection."
      >
        {/* Divider between the two states */}
        <line x1={280} y1={10} x2={280} y2={280} stroke={borderColor} strokeWidth={1.5} strokeDasharray="4 3" />

        {/* ── Left: reachable ───────────────────────────────────────── */}
        <text x={40} y={28} fontSize={12} fontWeight={700} fill={labelColor}>
          Before: user = {"{ name: \"Rex\" }"}
        </text>

        <rect x={40} y={40} width={160} height={36} rx={8} fill="none" stroke={borderColor} strokeWidth={1.5} />
        <text x={56} y={63} fontSize={12} fill={textColor}>
          Roots (global scope)
        </text>

        <line
          x1={120}
          y1={76}
          x2={120}
          y2={108}
          stroke={reachableColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-gc-1)"
        />

        <rect x={70} y={110} width={100} height={36} rx={8} fill="none" stroke={reachableColor} strokeWidth={1.5} />
        <text x={92} y={133} fontSize={12} fontWeight={600} fill={labelColor}>
          user
        </text>

        <line
          x1={120}
          y1={146}
          x2={120}
          y2={178}
          stroke={reachableColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-gc-2)"
        />

        <rect x={40} y={180} width={160} height={50} rx={8} fill="none" stroke={reachableColor} strokeWidth={2} />
        <text x={56} y={202} fontSize={12} fontWeight={700} fill={labelColor}>
          {"{ name: \"Rex\" }"}
        </text>
        <text x={56} y={220} fontSize={10} fill={reachableColor}>
          reachable — kept alive
        </text>

        {/* ── Right: unreachable ────────────────────────────────────── */}
        <text x={320} y={28} fontSize={12} fontWeight={700} fill={labelColor}>
          After: user = null
        </text>

        <rect x={320} y={40} width={160} height={36} rx={8} fill="none" stroke={borderColor} strokeWidth={1.5} />
        <text x={336} y={63} fontSize={12} fill={textColor}>
          Roots (global scope)
        </text>

        <line
          x1={400}
          y1={76}
          x2={400}
          y2={108}
          stroke={borderColor}
          strokeWidth={1.5}
          markerEnd="url(#arrow-gc-3)"
        />

        <rect x={350} y={110} width={100} height={36} rx={8} fill="none" stroke={borderColor} strokeWidth={1.5} />
        <text x={364} y={133} fontSize={11} fontWeight={600} fill={labelColor}>
          user = null
        </text>

        {/* No arrow from user to the old object — nothing reaches it anymore */}
        <rect
          x={320}
          y={180}
          width={160}
          height={50}
          rx={8}
          fill="none"
          stroke={unreachableColor}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={0.7}
        />
        <text x={336} y={202} fontSize={12} fontWeight={700} fill={unreachableColor} opacity={0.85}>
          {"{ name: \"Rex\" }"}
        </text>
        <text x={336} y={220} fontSize={10} fill={unreachableColor}>
          unreachable — GC sweeps this
        </text>

        <defs>
          <marker id="arrow-gc-1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={reachableColor} />
          </marker>
          <marker id="arrow-gc-2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={reachableColor} />
          </marker>
          <marker id="arrow-gc-3" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={borderColor} />
          </marker>
        </defs>

        <text x={40} y={264} fontSize={11} fill={textColor}>
          The mark-and-sweep collector marks everything reachable from a root; anything left unmarked is swept.
        </text>
      </svg>
    </figure>
  );
}

// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks a minimal, concrete example:
// a counter component re-rendering after a click — only the <p> text
// actually changed between renders, so the diff produces a single small
// patch instead of rebuilding the whole tree, which is the entire point of
// diffing against a Virtual DOM before touching the real one.
export function VirtualDomDiffDiagram() {
  const labelColor = "var(--color-text-primary)";
  const unchangedColor = "var(--color-border)";
  const changedColor = "var(--color-warning)";
  const patchColor = "var(--color-success)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 300"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram: the previous Virtual DOM tree and the new Virtual DOM tree are compared node by node. The div and h1 nodes are identical between renders and are left untouched. Only the p node's text changed, from Count: 0 to Count: 1. The diff produces a single small patch — update this one text node — which is the only change applied to the real DOM, instead of rebuilding the whole tree."
      >
        <text x={20} y={24} fontSize={12} fontWeight={700} fill={labelColor}>
          Previous render
        </text>
        <text x={340} y={24} fontSize={12} fontWeight={700} fill={labelColor}>
          New render
        </text>

        {/* Previous tree */}
        <rect x={20} y={40} width={140} height={36} rx={6} fill="none" stroke={unchangedColor} strokeWidth={1.5} />
        <text x={34} y={63} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;div&gt;
        </text>
        <rect x={20} y={100} width={140} height={36} rx={6} fill="none" stroke={unchangedColor} strokeWidth={1.5} />
        <text x={34} y={123} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;h1&gt;Hello&lt;/h1&gt;
        </text>
        <rect x={20} y={160} width={140} height={36} rx={6} fill="none" stroke={changedColor} strokeWidth={2} />
        <text x={34} y={183} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;p&gt;Count: 0&lt;/p&gt;
        </text>

        {/* New tree */}
        <rect x={340} y={40} width={140} height={36} rx={6} fill="none" stroke={unchangedColor} strokeWidth={1.5} />
        <text x={354} y={63} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;div&gt;
        </text>
        <rect x={340} y={100} width={140} height={36} rx={6} fill="none" stroke={unchangedColor} strokeWidth={1.5} />
        <text x={354} y={123} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;h1&gt;Hello&lt;/h1&gt;
        </text>
        <rect x={340} y={160} width={140} height={36} rx={6} fill="none" stroke={changedColor} strokeWidth={2} />
        <text x={354} y={183} fontSize={12} fontFamily="monospace" fill={labelColor}>
          &lt;p&gt;Count: 1&lt;/p&gt;
        </text>

        {/* Diff arrows: unchanged nodes pass through untouched */}
        <line x1={160} y1={58} x2={338} y2={58} stroke={unchangedColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={160} y1={118} x2={338} y2={118} stroke={unchangedColor} strokeWidth={1.5} strokeDasharray="3 3" />
        <line
          x1={160}
          y1={178}
          x2={338}
          y2={178}
          stroke={changedColor}
          strokeWidth={2}
          markerEnd="url(#arrow-vdom-diff)"
        />
        <text x={195} y={172} fontSize={10} fontWeight={600} fill={changedColor}>
          changed
        </text>

        {/* Resulting patch, applied to the real DOM */}
        <text x={20} y={240} fontSize={12} fontWeight={700} fill={labelColor}>
          Patch applied to the real DOM
        </text>
        <rect x={20} y={252} width={280} height={36} rx={6} fill="none" stroke={patchColor} strokeWidth={2} />
        <text x={34} y={275} fontSize={12} fontFamily="monospace" fill={patchColor}>
          update text: &quot;Count: 0&quot; → &quot;Count: 1&quot;
        </text>

        <defs>
          <marker id="arrow-vdom-diff" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={changedColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

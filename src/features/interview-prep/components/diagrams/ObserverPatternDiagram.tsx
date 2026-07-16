// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact Subject class
// already in this question's answer: observers subscribe once, then a single
// notify(data) call fans out to every subscribed observer in order — the
// Subject never needs to know anything about what each observer actually
// does with the notification.
export function ObserverPatternDiagram() {
  const borderColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const subjectColor = "var(--color-accent)";
  const notifyColor = "var(--color-success)";

  const observers = [
    { y: 30, label: "Observer A" },
    { y: 110, label: "Observer B" },
    { y: 190, label: "Observer C" },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 560 260"
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Diagram: a Subject holds a list of subscribed observers, A, B, and C. A single notify call fans out to all three observers in subscription order — the Subject has no knowledge of what each observer does with the notification."
      >
        {/* Subject */}
        <rect x={30} y={90} width={160} height={80} rx={10} fill="none" stroke={subjectColor} strokeWidth={2} />
        <text x={46} y={118} fontSize={13} fontWeight={700} fill={labelColor}>
          Subject
        </text>
        <text x={46} y={136} fontSize={10} fill={textColor}>
          observers: [A, B, C]
        </text>
        <text x={46} y={152} fontSize={10} fontFamily="monospace" fill={subjectColor}>
          notify(data)
        </text>

        {observers.map((o) => (
          <g key={o.label}>
            <rect
              x={370}
              y={o.y}
              width={160}
              height={50}
              rx={8}
              fill="none"
              stroke={borderColor}
              strokeWidth={1.5}
            />
            <text x={386} y={o.y + 30} fontSize={12} fontWeight={600} fill={labelColor}>
              {o.label}
            </text>
            <path
              d={`M 190 130 C 280 130, 300 ${o.y + 25}, 368 ${o.y + 25}`}
              fill="none"
              stroke={notifyColor}
              strokeWidth={1.5}
              markerEnd="url(#arrow-observer)"
            />
          </g>
        ))}

        <defs>
          <marker id="arrow-observer" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={notifyColor} />
          </marker>
        </defs>

        <text x={30} y={240} fontSize={11} fill={textColor}>
          One <tspan fontFamily="monospace" fill={notifyColor}>notify()</tspan> call reaches every subscribed
          observer — the Subject never knows what any of them do with it.
        </text>
      </svg>
    </figure>
  );
}

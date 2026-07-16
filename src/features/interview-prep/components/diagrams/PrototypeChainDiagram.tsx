// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — real markup, not a raster image, deliberately plain
// static SVG rather than a rough.js sketch (that treatment is reserved for
// Feature 49's System Design guides only). Walks the exact example already
// in this question's answer: `dog = Object.create(animal)`, then
// `dog.speak()` — not found on dog itself, found by walking [[Prototype]]
// up to animal — and the chain continues to Object.prototype and null.
export function PrototypeChainDiagram() {
  const linkColor = "var(--color-border)";
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const lookupColor = "var(--color-accent)";
  const foundColor = "var(--color-success)";

  const nodes = [
    { y: 20, title: "dog", detail: "own property: name", note: "lookup starts here" },
    { y: 110, title: "animal", detail: "speak() lives here", note: "found — lookup stops" },
    { y: 200, title: "Object.prototype", detail: "toString(), hasOwnProperty(), …", note: null },
    { y: 280, title: "null", detail: "end of the chain", note: null },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 560 320"
        className="h-auto w-full min-w-[420px]"
        role="img"
        aria-label="Diagram: dog.speak() is not an own property of dog, so the engine walks dog's [[Prototype]] link to animal, where speak() is found and the lookup stops. animal's own [[Prototype]] continues up to Object.prototype, and finally to null, the end of every prototype chain."
      >
        {nodes.map((node, i) => (
          <g key={node.title}>
            <rect
              x={40}
              y={node.y}
              width={280}
              height={64}
              rx={8}
              fill="none"
              stroke={i === 1 ? foundColor : linkColor}
              strokeWidth={i === 1 ? 2 : 1.5}
            />
            <text x={56} y={node.y + 26} fontSize={14} fontWeight={700} fill={labelColor}>
              {node.title}
            </text>
            <text x={56} y={node.y + 46} fontSize={11} fill={textColor}>
              {node.detail}
            </text>
            {node.note && (
              <text
                x={335}
                y={node.y + 38}
                fontSize={11}
                fontWeight={600}
                fill={i === 1 ? foundColor : lookupColor}
              >
                ← {node.note}
              </text>
            )}
            {i < nodes.length - 1 && (
              <>
                <line
                  x1={180}
                  y1={node.y + 64}
                  x2={180}
                  y2={node.y + 110 - 4}
                  stroke={linkColor}
                  strokeWidth={1.5}
                  markerEnd="url(#arrow-proto)"
                />
                <text x={190} y={node.y + 90} fontSize={10} fill={textColor}>
                  [[Prototype]]
                </text>
              </>
            )}
          </g>
        ))}

        <defs>
          <marker id="arrow-proto" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={linkColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

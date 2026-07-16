// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows a component tree split between
// Server Components (rendered on the server, zero JS shipped to the
// client for them) and Client Components (marked "use client", hydrated
// and interactive in the browser) — the server sends a special RSC
// payload describing the server-rendered parts, with "holes" for where
// client components need to mount and become interactive.
//
// This file is intentionally duplicated identically on both
// content/ff-react-questions (where it was originally authored, for the
// React collection's react-server-components-explained question) and this
// content/ff-nextjs-questions branch (reused as-is for
// server-components-in-nextjs-app-router, since it's the same underlying
// mechanism just in the Next.js App Router context) — keeps each branch
// independently buildable without one depending on the other's commits.
// The two copies are identical and will trivially reconcile on merge.
export function ReactServerComponentsDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const serverColor = "var(--color-accent)";
  const clientColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 240"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram of a React Server Components tree: Page and ProductList are Server Components, rendered entirely on the server with zero JavaScript shipped to the client for them. AddToCartButton is a Client Component, marked use client, and is the only part of the tree that hydrates and ships JavaScript to become interactive in the browser."
      >
        <rect x={40} y={20} width={560} height={190} rx={8} fill="none" stroke={serverColor} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={60} y="40" fontSize={11} fontWeight={700} fill={serverColor}>Server Components — rendered on the server, zero JS shipped</text>

        <rect x={80} y={55} width={120} height={36} rx={6} fill={serverColor} opacity={0.12} stroke={serverColor} strokeWidth={1.5} />
        <text x={140} y="77" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>Page</text>

        <line x1={140} y1={91} x2={140} y2={111} stroke={serverColor} strokeWidth={1.5} />
        <rect x={80} y={111} width={140} height={36} rx={6} fill={serverColor} opacity={0.12} stroke={serverColor} strokeWidth={1.5} />
        <text x={150} y="133" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>ProductList</text>

        <line x1={220} y1={129} x2={340} y2={129} stroke={clientColor} strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrow-rsc)" />

        <rect x={340} y={100} width={200} height={70} rx={8} fill={clientColor} opacity={0.12} stroke={clientColor} strokeWidth={2} />
        <text x={440} y="122" fontSize={10} fontWeight={700} textAnchor="middle" fill={clientColor}>&quot;use client&quot;</text>
        <text x={440} y="145" fontSize={11} fontWeight={700} textAnchor="middle" fill={labelColor}>AddToCartButton</text>
        <text x={440} y="160" fontSize={9} textAnchor="middle" fill={textColor}>hydrates, interactive</text>

        <foreignObject x={60} y={185} width={520} height={20}>
          <div className="text-[10px] leading-snug" style={{ color: textColor }}>
            Only AddToCartButton&apos;s code ships to and hydrates in the browser — Page and ProductList never do.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-rsc" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={clientColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

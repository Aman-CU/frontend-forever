// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the divergence a Portal creates:
// in the React component tree, the Modal is still a child of App (for
// context, event bubbling, and reconciliation purposes) — but the actual
// DOM node it renders into lives outside that structure entirely, as a
// sibling of the app's root div, typically appended directly to <body>.
export function PortalDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const treeColor = "var(--color-accent)";
  const domColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 700 240"
        className="h-auto w-full min-w-[620px]"
        role="img"
        aria-label="Diagram contrasting the React component tree with the actual DOM tree when a Modal is rendered via a Portal. In the React tree, Modal remains a child of App, Header, and Page. In the real DOM, the Modal's node is appended directly to the body element, outside the #root div entirely, even though it is still part of the React tree for context and event bubbling."
      >
        <text x={20} y="22" fontSize={12} fontWeight={700} fill={treeColor}>
          React component tree
        </text>
        <rect x={20} y={34} width={110} height={30} rx={6} fill="none" stroke={treeColor} strokeWidth={1.5} />
        <text x={75} y="53" fontSize={10} textAnchor="middle" fill={labelColor}>App</text>
        <line x1={75} y1={64} x2={75} y2={84} stroke={treeColor} strokeWidth={1.5} />
        <rect x={20} y={84} width={110} height={30} rx={6} fill="none" stroke={treeColor} strokeWidth={1.5} />
        <text x={75} y="103" fontSize={10} textAnchor="middle" fill={labelColor}>Page</text>
        <line x1={75} y1={114} x2={75} y2={134} stroke={treeColor} strokeWidth={1.5} />
        <rect x={20} y={134} width={110} height={30} rx={6} fill={treeColor} opacity={0.15} stroke={treeColor} strokeWidth={1.5} />
        <text x={75} y="153" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Modal</text>
        <text x={75} y="185" fontSize={9} textAnchor="middle" fill={textColor}>still receives context,</text>
        <text x={75} y="197" fontSize={9} textAnchor="middle" fill={textColor}>events bubble to App</text>

        <line x1={160} y1={100} x2={230} y2={100} stroke={textColor} strokeWidth={1} strokeDasharray="2 4" />
        <text x={195} y="90" fontSize={9} textAnchor="middle" fill={textColor}>createPortal</text>

        <text x={420} y="22" fontSize={12} fontWeight={700} fill={domColor}>
          Actual DOM tree
        </text>
        <rect x={340} y={34} width={110} height={30} rx={6} fill="none" stroke={domColor} strokeWidth={1.5} />
        <text x={395} y="53" fontSize={10} textAnchor="middle" fill={labelColor}>&lt;body&gt;</text>
        <line x1={395} y1={64} x2={395} y2={84} stroke={domColor} strokeWidth={1.5} />
        <rect x={340} y={84} width={110} height={30} rx={6} fill="none" stroke={domColor} strokeWidth={1.5} />
        <text x={395} y="103" fontSize={10} textAnchor="middle" fill={labelColor}>#root (App, Page)</text>

        <rect x={500} y={84} width={130} height={30} rx={6} fill={domColor} opacity={0.15} stroke={domColor} strokeWidth={1.5} />
        <text x={565} y="103" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Modal&apos;s DOM node</text>
        <line x1={395} y1={64} x2={565} y2={84} stroke={domColor} strokeWidth={1} strokeDasharray="2 3" />
        <text x={565} y="70" fontSize={9} textAnchor="middle" fill={textColor}>sibling of #root, not nested inside it</text>

        <foreignObject x={20} y={215} width={660} height={22}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            The Modal is a child of Page in the React tree, but its rendered DOM node lives directly under &lt;body&gt; — outside #root entirely.
          </div>
        </foreignObject>
      </svg>
    </figure>
  );
}

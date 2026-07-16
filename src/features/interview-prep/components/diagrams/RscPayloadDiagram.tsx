// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Shows the RSC payload as a distinct
// artifact from HTML: the server renders the Server Component tree into a
// compact, streamable serialized format (not JSON, not HTML) containing the
// rendered result plus placeholders and props for Client Components, which
// the browser then uses both to paint the initial HTML and to hydrate only
// the Client Component "islands" — without ever sending Server Component
// code itself to the browser.
export function RscPayloadDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const serverColor = "var(--color-accent)";
  const clientColor = "var(--color-warning)";

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 660 220"
        className="h-auto w-full min-w-[580px]"
        role="img"
        aria-label="Diagram of the React Server Component payload: the server renders its component tree into a serialized RSC payload, a compact streamable format that is not JSON and not HTML. It contains the rendered result of Server Components plus placeholders and serialized props for each Client Component. The browser streams this payload in chunks, using it to paint the page and to hydrate only the Client Component placeholders, without ever downloading or running the Server Components' own code."
      >
        <rect x={20} y={30} width={190} height={70} rx={8} fill={serverColor} opacity={0.12} stroke={serverColor} strokeWidth={1.5} />
        <text x={115} y="50" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Server Component tree</text>
        <text x={115} y="66" fontSize={8.5} textAnchor="middle" fill={textColor}>rendered on the server</text>
        <text x={115} y="82" fontSize={8.5} textAnchor="middle" fill={textColor}>never sent to the browser</text>

        <line x1={210} y1={65} x2={260} y2={65} stroke={serverColor} strokeWidth={1.5} markerEnd="url(#arrow-rsc1)" />
        <text x={235} y="55" fontSize={8} textAnchor="middle" fill={textColor}>serialize</text>

        <rect x={260} y={20} width={200} height={90} rx={8} fill={serverColor} opacity={0.18} stroke={serverColor} strokeWidth={2} />
        <text x={360} y="40" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>RSC payload</text>
        <text x={360} y="56" fontSize={8} textAnchor="middle" fill={textColor}>not JSON, not HTML</text>
        <text x={360} y="70" fontSize={8} textAnchor="middle" fill={textColor}>rendered Server Component output</text>
        <text x={360} y="83" fontSize={8} textAnchor="middle" fill={textColor}>+ placeholder & props per Client Component</text>
        <text x={360} y="96" fontSize={8} textAnchor="middle" fill={textColor}>streamed as it becomes ready</text>

        <line x1={460} y1={65} x2={510} y2={65} stroke={serverColor} strokeWidth={1.5} markerEnd="url(#arrow-rsc2)" />
        <text x={485} y="55" fontSize={8} textAnchor="middle" fill={textColor}>stream</text>

        <rect x={510} y={20} width={130} height={90} rx={8} fill="none" stroke={clientColor} strokeWidth={1.5} />
        <text x={575} y="40" fontSize={10} fontWeight={700} textAnchor="middle" fill={labelColor}>Browser</text>
        <text x={575} y="56" fontSize={8} textAnchor="middle" fill={textColor}>paints static output</text>
        <text x={575} y="70" fontSize={8} textAnchor="middle" fill={textColor}>hydrates only the</text>
        <text x={575} y="83" fontSize={8} textAnchor="middle" fill={textColor}>Client Component</text>
        <text x={575} y="96" fontSize={8} textAnchor="middle" fill={textColor}>placeholders</text>

        <foreignObject x={20} y={130} width={620} height={70}>
          <div className="text-xs leading-snug" style={{ color: textColor }}>
            The payload is what a `fetch` to an RSC-enabled route actually returns, and what React DevTools&apos; network
            panel shows for a Server Component navigation — distinct from the fully-formed HTML document, and distinct
            from a REST API&apos;s JSON, since it can represent references, promises, and streamed chunks a plain JSON
            response can&apos;t.
          </div>
        </foreignObject>

        <defs>
          <marker id="arrow-rsc1" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={serverColor} />
          </marker>
          <marker id="arrow-rsc2" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={serverColor} />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}

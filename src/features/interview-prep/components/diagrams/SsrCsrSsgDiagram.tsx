// Hand-authored SVG, theme-aware via CSS variables (no hardcoded colors,
// AGENTS.md rule 2) — static, not a rough.js sketch (reserved for Feature
// 49's System Design guides only). Contrasts when the HTML for a page gets
// built for each rendering strategy: CSR builds it in the browser after a
// near-empty shell loads; SSR builds it on the server, per request, right
// before responding; SSG builds it once, ahead of time, at build time, and
// serves the same static file to every visitor.
export function SsrCsrSsgDiagram() {
  const textColor = "var(--color-text-secondary)";
  const labelColor = "var(--color-text-primary)";
  const csrColor = "var(--color-warning)";
  const ssrColor = "var(--color-accent)";
  const ssgColor = "var(--color-success)";

  const rows = [
    { label: "CSR", color: csrColor, steps: ["Browser requests page", "Empty HTML + JS downloads", "JS builds the page in-browser"] },
    { label: "SSR", color: ssrColor, steps: ["Browser requests page", "Server renders HTML now", "Full HTML sent, then hydrates"] },
    { label: "SSG", color: ssgColor, steps: ["Built once, at build time", "Server just serves the file", "Same static HTML, every visitor"] },
  ];

  return (
    <figure className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 640 220"
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="Diagram comparing CSR, SSR, and SSG. CSR: the browser requests the page, an empty HTML shell plus JavaScript downloads, and JavaScript builds the page in the browser. SSR: the browser requests the page, the server renders HTML for that specific request, and full HTML is sent before hydrating. SSG: the page is built once ahead of time at build time, the server just serves the pre-built static file, and every visitor gets the same HTML."
      >
        {rows.map((row, i) => {
          const y = 20 + i * 62;
          return (
            <g key={row.label}>
              <text x={20} y={y + 18} fontSize={12} fontWeight={700} fill={row.color}>{row.label}</text>
              {row.steps.map((step, j) => {
                const x = 90 + j * 180;
                return (
                  <g key={step}>
                    <rect x={x} y={y} width={165} height={38} rx={6} fill="none" stroke={row.color} strokeWidth={1.3} />
                    <foreignObject x={x + 4} y={y + 4} width={157} height={30}>
                      <div className="text-center text-[9px] leading-snug" style={{ color: labelColor }}>
                        {step}
                      </div>
                    </foreignObject>
                    {j < row.steps.length - 1 && (
                      <line x1={x + 165} y1={y + 19} x2={x + 178} y2={y + 19} stroke={row.color} strokeWidth={1.3} markerEnd={`url(#arrow-render-${i})`} />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        <foreignObject x={20} y={205} width={600} height={15}>
          <div className="text-[10px] leading-snug" style={{ color: textColor }}>
            The difference is entirely about *when* the HTML gets built — in the browser, per-request on the server, or once ahead of time.
          </div>
        </foreignObject>

        <defs>
          {rows.map((row, i) => (
            <marker key={row.label} id={`arrow-render-${i}`} markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={row.color} />
            </marker>
          ))}
        </defs>
      </svg>
    </figure>
  );
}

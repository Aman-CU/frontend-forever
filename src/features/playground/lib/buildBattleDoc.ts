// A literal </script> inside user JS would otherwise close the doc's own
// <script> tag early — same escape buildSandboxDoc.ts uses for the same reason.
function escapeForScript(code: string): string {
  return code.replace(/<\/script>/gi, "<\\/script>");
}

/**
 * Bundles a UI Battle's three files into one static HTML document for a
 * plain `sandbox="allow-scripts"` iframe's `srcDoc`. Unlike buildSandboxDoc,
 * there is no nonce/postMessage contract — nothing here is graded, so the
 * document is just rendered and left alone.
 */
export function buildBattleDoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${css}
</style>
</head>
<body>
${html}
<script>
// A srcDoc document's relative-URL base resolves against the *embedding
// page's* real URL, not this document itself — so a plain in-page anchor
// like href="#" resolves to the real app's own same-origin URL. The
// sandboxed iframe (no allow-same-origin) then genuinely navigates to it,
// stripping the SameSite=Lax session cookie as a cross-site request and
// rendering the app's real /login redirect *inside* this iframe (confirmed
// via a real Profile Card repro: clicking a placeholder social icon left
// the real /login page rendered ghosted under the target overlay). A
// <base> pinned to about:blank would stop that, but it also breaks every
// *legitimate* relative reference in challenge content (e.g. an <img
// src="/playground/battles/...jpg"> pointing at a real asset) — so the
// fix is scoped to navigation specifically: capture every click, and if
// it targets an anchor, prevent the default navigation. Anchors stay
// real elements (keyboard-focusable, real cursor, real href for hover
// preview) — they just never actually navigate anywhere, since nothing
// in a UI Battle should ever link off the card itself.
document.addEventListener("click", function (event) {
  if (event.target instanceof Element && event.target.closest("a")) {
    event.preventDefault();
  }
}, true);
</script>
<script>
${escapeForScript(js)}
</script>
</body>
</html>`;
}

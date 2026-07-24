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
<!-- A srcDoc document's relative-URL base otherwise resolves against the
     *embedding page's* real URL, not this document itself. Without this,
     a plain in-page anchor like href="#" resolves to the real app's own
     same-origin URL — which the sandboxed iframe (no allow-same-origin)
     then genuinely navigates to, stripping the SameSite=Lax session
     cookie as a cross-site request and rendering the app's real /login
     redirect *inside* the challenge's own output iframe (confirmed via a
     real Profile Card repro: clicking a placeholder social icon left the
     real /login page rendered ghosted under the target overlay). Pinning
     the base to about:blank means any relative href in challenge content
     resolves somewhere inert instead of back into the real app. -->
<base href="about:blank" />
<style>
${css}
</style>
</head>
<body>
${html}
<script>
${escapeForScript(js)}
</script>
</body>
</html>`;
}

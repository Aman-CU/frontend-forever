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
${escapeForScript(js)}
</script>
</body>
</html>`;
}

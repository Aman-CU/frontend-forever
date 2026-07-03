// `path` comes from an untrusted URL query param (?callbackURL=...) — only
// accept a same-origin relative path, never an absolute URL or a
// protocol-relative "//host" (the classic open-redirect trick, including the
// "/\host" backslash variant some browsers normalize the same way), which
// would silently send a signed-in user to an attacker-controlled site.
export function getSafeRedirectPath(
  path: string | undefined | null,
  fallback: string,
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  return path;
}

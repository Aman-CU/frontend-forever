// Small local regex parse for a device label (e.g. "Windows · Chrome") — no
// ua-parser-js dependency, per the Pre-Feature-56 decision entry in
// progress-tracker.md. OS + browser name only, not versions/engines. Order
// matters: Edge/Opera UAs also match "Chrome", and Chrome UAs also match
// "Safari", so the more specific pattern has to be checked first.
const OS_PATTERNS: [RegExp, string][] = [
  [/windows/i, "Windows"],
  [/mac os x|macintosh/i, "macOS"],
  [/android/i, "Android"],
  [/iphone|ipad|ipod/i, "iOS"],
  [/linux/i, "Linux"],
];

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/edg\//i, "Edge"],
  [/opr\/|opera/i, "Opera"],
  [/chrome\//i, "Chrome"],
  [/firefox\//i, "Firefox"],
  [/safari\//i, "Safari"],
];

export function parseUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const os = OS_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Unknown OS";
  const browser = BROWSER_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Unknown browser";
  return `${os} · ${browser}`;
}

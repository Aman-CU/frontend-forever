import { headers } from "next/headers";

// Derives the current request's origin from its own headers — there's no
// NEXT_PUBLIC_SITE_URL in this project's env (AGENTS.md's env list), so
// canonical/OG URLs are built from whatever host/proto served the request.
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Strips markdown syntax for a clean plain-text summary — shared by
// <meta name="description">, Open Graph/Twitter descriptions, and JSON-LD
// structured data, none of which should render raw markdown syntax (#,
// **bold**, backticks, fenced code blocks).
export function toPlainTextSummary(markdown: string, maxLength = 155): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

// JSON-LD is embedded as a <script> element's text content (never
// dangerouslySetInnerHTML — see security.md → XSS Prevention), but a
// stringified value could still legally contain a literal "</script>"
// substring, which would truncate the script tag early in the parsed HTML.
// Escaping "<" neutralizes that without affecting the JSON's meaning.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

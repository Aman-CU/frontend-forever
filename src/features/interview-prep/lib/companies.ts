// The 32-company list (build-plan.md, Feature 51 — supersedes the 5-company
// scope in project-overview.md's original Monetization section). Slug is a
// plain lowercase of the name — every name here is a single word, so no
// separate slugify helper is needed. Real per-company question/challenge
// counts are computed live (features/interview-prep/lib/queries.ts) from
// collection_questions + challenges, not stored here — this is identity
// only (name + slug), matching COLLECTION_META/PLAYBOOK_META's "meta is
// static, data is live" split.

export type Company = { name: string; slug: string };

export const COMPANIES: Company[] = [
  { name: "OpenAI", slug: "openai" },
  { name: "Anthropic", slug: "anthropic" },
  { name: "Google", slug: "google" },
  { name: "Meta", slug: "meta" },
  { name: "Amazon", slug: "amazon" },
  { name: "TikTok", slug: "tiktok" },
  { name: "ByteDance", slug: "bytedance" },
  { name: "Netflix", slug: "netflix" },
  { name: "Apple", slug: "apple" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Adobe", slug: "adobe" },
  { name: "Atlassian", slug: "atlassian" },
  { name: "PayPal", slug: "paypal" },
  { name: "Canva", slug: "canva" },
  { name: "Pinterest", slug: "pinterest" },
  { name: "Shopify", slug: "shopify" },
  { name: "Stripe", slug: "stripe" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "Discord", slug: "discord" },
  { name: "Coinbase", slug: "coinbase" },
  { name: "Figma", slug: "figma" },
  { name: "Uber", slug: "uber" },
  { name: "Lyft", slug: "lyft" },
  { name: "Snap", slug: "snap" },
  { name: "LinkedIn", slug: "linkedin" },
  { name: "Snowflake", slug: "snowflake" },
  { name: "Databricks", slug: "databricks" },
  { name: "Robinhood", slug: "robinhood" },
  { name: "Dropbox", slug: "dropbox" },
  { name: "Roblox", slug: "roblox" },
  { name: "Palantir", slug: "palantir" },
  { name: "Rippling", slug: "rippling" },
];

const COMPANY_BY_SLUG = new Map(COMPANIES.map((c) => [c.slug, c]));

export function getCompanyBySlug(slug: string): Company | null {
  return COMPANY_BY_SLUG.get(slug) ?? null;
}

export function isCompanySlug(value: string): boolean {
  return COMPANY_BY_SLUG.has(value);
}

// Badge initials — first letter of up to 2 words. Every name here is one
// word, so this is always a single capital letter, but written generically
// rather than hardcoding that assumption.
export function getCompanyInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

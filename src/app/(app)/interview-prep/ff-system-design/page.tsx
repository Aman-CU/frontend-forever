import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { COLLECTION_META } from "@/features/interview-prep/lib/collectionMeta";
import { getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import { getAllSystemDesignGuides } from "@/lib/systemDesignGuides";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";

// Not the real summary — a fixed placeholder blurred on the list row, same
// "fake sentence, not CSS-blurred real text" rule as FF Collections'
// BLURRED_QUESTION_PLACEHOLDER (security.md: a blurred real string is still
// real text in the DOM, trivially recoverable via view-source or disabling
// the blur class). The guide title stays real and unblurred — unlike a FF
// Collections question, a system design prompt like "Design a Chat App" is
// a generic, evergreen interview topic name on its own (same reasoning that
// already keeps Practice's challenge titles visible); the frontmatter
// `summary` field is the actual value-bearing "answer-first" sentence, so
// that's the part that gets redacted.
const BLURRED_SUMMARY_PLACEHOLDER =
  "This premium guide covers an advanced frontend system design topic in depth.";

const META = COLLECTION_META["ff-system-design"];

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/ff-system-design`;
  const title = `${META.label} Interview Questions | Frontend Forever`;

  return {
    title,
    description: META.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description: META.description, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description: META.description },
  };
}

export default async function FfSystemDesignListPage() {
  const guides = getAllSystemDesignGuides();
  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/ff-system-design`;

  // Grouped dynamically by whatever `section` each authored guide declares —
  // build-plan.md's 5-section grouping is a draft, to finalize against the
  // real topic list, so this doesn't hardcode empty placeholder sections.
  const sections = new Map<string, typeof guides>();
  for (const guide of guides) {
    const key = guide.frontmatter.section;
    sections.set(key, [...(sections.get(key) ?? []), guide]);
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.frontmatter.title,
      url: `${baseUrl}/interview-prep/ff-system-design/${guide.frontmatter.slug}`,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      { "@type": "ListItem", position: 2, name: META.label, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep"
        crumbs={[{ label: "Interview Prep", href: "/interview-prep" }, { label: META.label }]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{META.label}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{META.description}</p>
      </div>

      {guides.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-text-primary">Guides coming soon</h2>
          <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
            Long-form system design practice guides are on the way. Check back soon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {[...sections.entries()].map(([section, sectionGuides]) => (
            <section key={section}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {section}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-surface-secondary text-text-primary">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Problem</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Difficulty</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionGuides.map((guide) => {
                      const isLocked = Boolean(guide.frontmatter.isPremium) && !isPremiumUser;
                      return (
                      <tr key={guide.frontmatter.slug} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary">{guide.frontmatter.title}</span>
                            {guide.frontmatter.isPremium && (
                              <PremiumBadge isPremiumUser={isPremiumUser} size="xs" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 line-clamp-1 text-xs text-text-muted",
                              isLocked && "select-none blur-[3px]",
                            )}
                          >
                            {isLocked ? BLURRED_SUMMARY_PLACEHOLDER : guide.frontmatter.summary}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                              DIFFICULTY_STYLES[guide.frontmatter.difficulty],
                            )}
                          >
                            {guide.frontmatter.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/interview-prep/ff-system-design/${guide.frontmatter.slug}`}
                            aria-label={`Start: ${guide.frontmatter.title}`}
                            className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
                          >
                            Start
                          </Link>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

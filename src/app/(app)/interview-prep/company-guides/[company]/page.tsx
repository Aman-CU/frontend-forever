import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBaseUrl, safeJsonLd } from "@/lib/seo";
import { COMPANIES, getCompanyBySlug, isCompanySlug } from "@/features/interview-prep/lib/companies";
import { getCompanyGuideDetail } from "@/features/interview-prep/lib/queries";
import { COLLECTION_META } from "@/features/interview-prep/lib/collectionMeta";
import { getPracticeCategoryDisplayLabel } from "@/features/interview-prep/lib/practiceCategoryLabels";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { CompanyBadge } from "@/features/interview-prep/components/CompanyBadge";
import { CompanyGuideContentRow } from "@/features/interview-prep/components/CompanyGuideContentRow";

type Params = { company: string };

export function generateStaticParams(): Params[] {
  return COMPANIES.map((c) => ({ company: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { company: companySlug } = await params;
  if (!isCompanySlug(companySlug)) return {};

  const company = getCompanyBySlug(companySlug);
  if (!company) return {};

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/company-guides/${companySlug}`;
  const title = `${company.name} Frontend Interview Questions | Frontend Forever`;
  const description = `Real ${company.name} frontend interview questions and coding challenges — curated from FF Collections and Practice.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CompanyGuideDetailPage({ params }: { params: Promise<Params> }) {
  const { company: companySlug } = await params;
  if (!isCompanySlug(companySlug)) {
    notFound();
  }

  const company = getCompanyBySlug(companySlug);
  if (!company) {
    notFound();
  }

  const detail = await getCompanyGuideDetail(company.name);
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/company-guides/${companySlug}`;
  const hasContent = detail.questions.length > 0 || detail.challenges.length > 0;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${company.name} Frontend Interview Questions`,
    itemListElement: [
      ...detail.questions.map((q, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: q.question,
        url: `${baseUrl}/interview-prep/${q.collection}/${q.slug}`,
      })),
      ...detail.challenges.map((c, index) => ({
        "@type": "ListItem",
        position: detail.questions.length + index + 1,
        name: c.title,
        url: `${baseUrl}/practice/${c.category}/${c.slug}`,
      })),
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Company Guides",
        item: `${baseUrl}/interview-prep/company-guides`,
      },
      { "@type": "ListItem", position: 3, name: company.name, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep/company-guides"
        crumbs={[
          { label: "Interview Prep", href: "/interview-prep" },
          { label: "Company Guides", href: "/interview-prep/company-guides" },
          { label: company.name },
        ]}
      />

      <div className="mb-8 flex items-center gap-4">
        <CompanyBadge name={company.name} size="md" className="h-14 w-14 text-lg" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{company.name} Interview Guide</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {hasContent
              ? `${detail.questions.length + detail.challenges.length} real questions and challenges attributed to ${company.name}.`
              : `No questions tagged to ${company.name} yet.`}
          </p>
        </div>
      </div>

      {!hasContent && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-text-primary">Coming soon</h2>
          <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
            We&apos;re still tagging real interview reports for {company.name}. Check FF Collections
            and Practice in the meantime.
          </p>
        </div>
      )}

      {detail.questions.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Interview Questions ({detail.questions.length})
          </h2>
          <div className="flex flex-col gap-2">
            {detail.questions.map((q) => (
              <CompanyGuideContentRow
                key={q.slug}
                href={`/interview-prep/${q.collection}/${q.slug}`}
                badgeLabel={COLLECTION_META[q.collection].label}
                title={q.question}
                difficulty={q.difficulty}
              />
            ))}
          </div>
        </section>
      )}

      {detail.challenges.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Practice Challenges ({detail.challenges.length})
          </h2>
          <div className="flex flex-col gap-2">
            {detail.challenges.map((c) => (
              <CompanyGuideContentRow
                key={c.slug}
                href={`/practice/${c.category}/${c.slug}`}
                badgeLabel={getPracticeCategoryDisplayLabel(c.category)}
                title={c.title}
                difficulty={c.difficulty}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

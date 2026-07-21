import type { Metadata } from "next";

import { getBaseUrl, safeJsonLd } from "@/lib/seo";
import { getCompanyGuideSummaries } from "@/features/interview-prep/lib/queries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { CompanyGuideCard } from "@/features/interview-prep/components/CompanyGuideCard";

const TITLE = "Company Interview Guides | Frontend Forever";
const DESCRIPTION =
  "Frontend interview questions and coding challenges by company — Google, Meta, Amazon, Stripe, and 28 more, sourced from real interview reports.";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/company-guides`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title: TITLE, description: DESCRIPTION, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

export default async function CompanyGuidesIndexPage() {
  const companies = await getCompanyGuideSummaries();
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/company-guides`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: companies.map((company, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: company.name,
      url: `${baseUrl}/interview-prep/company-guides/${company.slug}`,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      { "@type": "ListItem", position: 2, name: "Company Guides", item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep"
        crumbs={[{ label: "Interview Prep", href: "/interview-prep" }, { label: "Company Guides" }]}
      />

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Company Interview Guides</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Real frontend interview questions and challenges, filtered by the company that asked
            them.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-premium-light px-2.5 py-1 text-xs font-semibold text-premium">
          Premium
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {companies.map((company) => (
          <CompanyGuideCard key={company.slug} company={company} />
        ))}
      </div>
    </div>
  );
}

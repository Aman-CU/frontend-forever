import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Clock, ListChecks } from "lucide-react";

import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { STUDY_PLAN_SLUGS } from "@/lib/constants";
import { getStudyPlanBySlug, isStudyPlanSlug } from "@/features/interview-prep/lib/studyPlanQueries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { StudyPlanItemRow } from "@/features/interview-prep/components/StudyPlanItemRow";

type Params = { slug: string };

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function generateStaticParams(): Params[] {
  return STUDY_PLAN_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isStudyPlanSlug(slug)) return {};

  const plan = await getStudyPlanBySlug(slug, null);
  if (!plan) return {};

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/study-plans/${slug}`;
  const title = `${plan.title} Frontend Interview Study Plan | Frontend Forever`;

  return {
    title,
    description: plan.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description: plan.description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description: plan.description },
  };
}

// Groups items by groupLabel ("Day 1", "Week 3", ...) while preserving the
// items' own orderIndex-derived order — Map insertion order matches first
// appearance, and Object.groupBy-style behavior isn't relied on here.
function groupItems<T extends { groupLabel: string }>(items: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.groupLabel) ?? [];
    group.push(item);
    groups.set(item.groupLabel, group);
  }
  return Array.from(groups.entries());
}

export default async function StudyPlanDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isStudyPlanSlug(slug)) {
    notFound();
  }

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;
  const plan = await getStudyPlanBySlug(slug, userId);
  if (!plan) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/study-plans/${slug}`;
  const groupedItems = groupItems(plan.items);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${plan.title} Frontend Interview Study Plan`,
    itemListElement: plan.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${baseUrl}${item.href}`,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      { "@type": "ListItem", position: 2, name: "Study Plans", item: `${baseUrl}/interview-prep/study-plans` },
      { "@type": "ListItem", position: 3, name: plan.title, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep/study-plans"
        crumbs={[
          { label: "Interview Prep", href: "/interview-prep" },
          { label: "Study Plans", href: "/interview-prep/study-plans" },
          { label: plan.title },
        ]}
      />

      <div className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{plan.title} Study Plan</h1>
          {plan.isPremium && (
            <span className="shrink-0 rounded-full bg-premium-light px-2.5 py-1 text-xs font-semibold text-premium">
              Premium
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-text-secondary">{plan.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {plan.hoursCommitment}
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" aria-hidden />
            {plan.items.length} steps
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {groupedItems.map(([groupLabel, items]) => (
          <section key={groupLabel}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
              {groupLabel}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <StudyPlanItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

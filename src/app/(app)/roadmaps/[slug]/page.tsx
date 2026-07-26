import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getBaseUrl, safeJsonLd, toPlainTextSummary } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { getRoadmapDetail, getRoadmapSummaries } from "@/features/roadmaps/lib/queries";
import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import { ROADMAP_SEO_CONTENT } from "@/features/roadmaps/lib/roadmapSeoContent";
import { RoadmapDetailView } from "@/features/roadmaps/components/RoadmapDetailView";
import { RoadmapFaq } from "@/features/roadmaps/components/RoadmapFaq";
import { RoadmapSidebar } from "@/features/roadmaps/components/RoadmapSidebar";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmapDetail(slug, null);
  if (!roadmap) return {};

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/roadmaps/${slug}`;
  const title = `${roadmap.title} | Frontend Forever`;
  const description = toPlainTextSummary(roadmap.description, 160);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoadmapDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const [roadmap, allRoadmaps] = await Promise.all([
    getRoadmapDetail(slug, userId),
    getRoadmapSummaries(userId),
  ]);
  if (!roadmap) notFound();
  const relatedRoadmaps = allRoadmaps.filter((r) => r.slug !== roadmap.slug);

  const { icon: Icon } = getRoadmapMeta(roadmap.slug);
  const seoContent = ROADMAP_SEO_CONTENT[roadmap.slug];
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/roadmaps/${roadmap.slug}`;

  const topicCount = roadmap.nodes.filter((n) => n.nodeType === "topic").length;

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: roadmap.title,
    description: toPlainTextSummary(roadmap.description, 300),
    url: pageUrl,
    provider: { "@type": "Organization", name: "Frontend Forever", url: baseUrl },
    isAccessibleForFree: !roadmap.isPremium,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${topicCount}H`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Roadmaps", item: `${baseUrl}/roadmaps` },
      { "@type": "ListItem", position: 2, name: roadmap.title, item: pageUrl },
    ],
  };
  const faqJsonLd = seoContent
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seoContent.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <div className="pb-16">
      <script type="application/ld+json">{safeJsonLd(courseJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>
      {faqJsonLd && <script type="application/ld+json">{safeJsonLd(faqJsonLd)}</script>}

      <div className="mx-auto w-full max-w-6xl px-6 pt-8 lg:px-8">
        <Link
          href="/roadmaps"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Roadmaps
        </Link>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-muted">
            <Icon className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-text-primary">{roadmap.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">{roadmap.description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            <RoadmapDetailView initialNodes={roadmap.nodes} isLoggedIn={userId !== null} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <RoadmapSidebar relatedRoadmaps={relatedRoadmaps} />
            </div>
          </aside>
        </div>
      </div>

      {seoContent && <RoadmapFaq content={seoContent} />}
    </div>
  );
}

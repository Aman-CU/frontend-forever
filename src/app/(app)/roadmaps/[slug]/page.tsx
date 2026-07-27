import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBaseUrl, safeJsonLd, toPlainTextSummary } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { getRoadmapDetail, getRoadmapSummaries } from "@/features/roadmaps/lib/queries";
import { getRoadmapMeta } from "@/features/roadmaps/lib/roadmapMeta";
import { isRoadmapComingSoon } from "@/features/roadmaps/lib/comingSoonRoadmaps";
import { ROADMAP_SEO_CONTENT } from "@/features/roadmaps/lib/roadmapSeoContent";
import { RoadmapDetailView } from "@/features/roadmaps/components/RoadmapDetailView";
import { RoadmapFaq } from "@/features/roadmaps/components/RoadmapFaq";
import { RoadmapSidebar } from "@/features/roadmaps/components/RoadmapSidebar";
import { RoadmapComingSoonState } from "@/features/roadmaps/components/RoadmapComingSoonState";
import { RoadmapPageHeader } from "@/features/roadmaps/components/RoadmapPageHeader";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  // The cached summaries catalog has everything metadata needs (title,
  // description) — no reason to pay for getRoadmapDetail's full node/link
  // join here just to read 2 fields off the parent roadmap row.
  const roadmap = (await getRoadmapSummaries(null)).find((r) => r.slug === slug);
  if (!roadmap) return {};

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/roadmaps/${slug}`;
  const comingSoon = isRoadmapComingSoon(slug);
  const title = comingSoon
    ? `${roadmap.title} (Coming Soon) | Frontend Forever`
    : `${roadmap.title} | Frontend Forever`;
  const description = toPlainTextSummary(roadmap.description, 160);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: !comingSoon, follow: true },
    openGraph: { title, description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoadmapDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;
  const comingSoon = isRoadmapComingSoon(slug);

  // A "coming soon" roadmap's detail page renders nothing from the real
  // node graph (see below) — skip the heavy getRoadmapDetail join entirely
  // for those slugs and use the summaries catalog's already-cached row
  // instead. Real roadmaps still fetch the full graph as before.
  const allRoadmaps = await getRoadmapSummaries(userId);
  const roadmapSummary = allRoadmaps.find((r) => r.slug === slug);
  if (!roadmapSummary) notFound();
  const relatedRoadmaps = allRoadmaps.filter((r) => r.slug !== slug);

  const { icon: Icon, iconClassName } = getRoadmapMeta(slug);
  const seoContent = ROADMAP_SEO_CONTENT[slug];
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/roadmaps/${slug}`;

  if (comingSoon) {
    return (
      <div className="pb-16">
        <RoadmapPageHeader
          icon={Icon}
          iconClassName={iconClassName}
          title={roadmapSummary.title}
          description={roadmapSummary.description}
        />

        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <RoadmapComingSoonState />
        </div>
      </div>
    );
  }

  const roadmap = await getRoadmapDetail(slug, userId);
  if (!roadmap) notFound();

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

      <RoadmapPageHeader
        icon={Icon}
        iconClassName={iconClassName}
        title={roadmap.title}
        description={roadmap.description}
      />

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

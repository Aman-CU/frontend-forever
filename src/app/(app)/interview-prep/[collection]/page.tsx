import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { isInterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";
import { COLLECTION_META } from "@/features/interview-prep/lib/collectionMeta";
import { getCollectionQuestionList, getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import { safeJsonLd } from "@/lib/seo";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { CollectionQuestionListClient } from "@/features/interview-prep/components/CollectionQuestionListClient";

type Params = { collection: string };

// Not the real question — a fixed-length placeholder that gets a CSS blur
// applied to it, so the list row looks like a real blurred question without
// ever putting real question text in the payload (security.md — a blurred
// <span> is still real text in the DOM, trivially recoverable via view-
// source or disabling the blur class; only a fake placeholder is actually
// safe to send to a non-premium client). Applied uniformly to every premium
// question — FF75 included, per user request (2026-08-05: "I liked the blur
// one for all premium question" — dropping the earlier FF75-only plain-label
// treatment in favor of one consistent blur teaser for the whole 40%).
const BLURRED_QUESTION_PLACEHOLDER =
  "This is a premium interview question covering an advanced topic in depth.";

// Same "derive from the incoming request" pattern as Practice's Editor page —
// no NEXT_PUBLIC_SITE_URL exists in this project (AGENTS.md's env list).
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { collection } = await params;
  if (!isInterviewPrepRouteCollection(collection)) return {};

  const meta = COLLECTION_META[collection];
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/${collection}`;
  const title = `${meta.label} Interview Questions | Frontend Forever`;
  const description = meta.description;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionQuestionListPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { collection } = await params;

  if (!isInterviewPrepRouteCollection(collection)) {
    notFound();
  }

  const meta = COLLECTION_META[collection];
  const session = await getCachedSession();
  const isLoggedIn = Boolean(session?.user);
  const [questions, isPremiumUser] = await Promise.all([
    getCollectionQuestionList(collection, session?.user?.id ?? null),
    session?.user ? getIsPremiumUser(session.user.id) : Promise.resolve(false),
  ]);
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/${collection}`;

  // Never send the real question text for a locked item — the blur the list
  // row shows is styling on a fake placeholder, not a CSS effect on the real
  // text (see the constant above).
  const clientQuestions = questions.map((q) =>
    isPremiumUser || !q.isPremium
      ? { ...q, isBlurred: false }
      : { ...q, question: BLURRED_QUESTION_PLACEHOLDER, isBlurred: true },
  );

  // FAQPage JSON-LD (Feature 31's GEO/SEO spec) — every free question on this
  // list becomes a citable Q&A entry for AI answer engines and rich search
  // results, not just a link. Answers are truncated to a clean plain-text
  // summary; the full answer lives on each question's own page. Premium
  // questions are excluded (Feature 38) — their own pages are robots:
  // noindex, so listing them here as a citable "accepted answer" would point
  // crawlers at a URL that says not to index it.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: clientQuestions
      .filter((q) => !q.isPremium)
      .map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${baseUrl}/interview-prep/${collection}/${q.slug}`,
        },
      })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      { "@type": "ListItem", position: 2, name: meta.label, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(faqJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep"
        crumbs={[{ label: "Interview Prep", href: "/interview-prep" }, { label: meta.label }]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{meta.label}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{meta.description}</p>
      </div>

      <CollectionQuestionListClient
        routeCollection={collection}
        questions={clientQuestions}
        isLoggedIn={isLoggedIn}
        isPremiumUser={isPremiumUser}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { isPracticeCategory, PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import { getAdjacentChallenges, getChallengeBySlug, hasPassedChallenge } from "@/features/practice/lib/queries";
import { getDiscussionPosts } from "@/features/practice/lib/discussionQueries";
import { toPlainTextSummary, safeJsonLd } from "@/lib/seo";
import { ChallengeEditorHeader } from "@/features/practice/components/editor/ChallengeEditorHeader";
import { ChallengeEditorWorkspace } from "@/features/practice/components/editor/ChallengeEditorWorkspace";

type Params = { category: string; slug: string };

// No NEXT_PUBLIC_SITE_URL exists in this project (AGENTS.md's env list has
// no such var) — derived from the incoming request instead, correct in both
// dev and prod without adding a new environment variable.
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
  const { category, slug } = await params;
  if (!isPracticeCategory(category)) return {};

  const challenge = await getChallengeBySlug(category, slug);
  if (!challenge) return {};

  const label = PRACTICE_CATEGORY_LABELS[category];
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/practice/${category}/${slug}`;
  const title = `${label} #${challenge.questionNumber}: ${challenge.title} | Frontend Forever`;
  const description = toPlainTextSummary(challenge.description) || `${label} · ${challenge.difficulty} — solve it live in the Frontend Forever editor.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      siteName: "Frontend Forever",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChallengeEditorPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;

  if (!isPracticeCategory(category)) {
    notFound();
  }

  const challenge = await getChallengeBySlug(category, slug);
  if (!challenge) {
    notFound();
  }

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const [initialHasPassed, discussionPosts, { prev, next }, baseUrl] = await Promise.all([
    hasPassedChallenge(userId, challenge.id),
    getDiscussionPosts(challenge.id),
    getAdjacentChallenges(category, slug),
    getBaseUrl(),
  ]);

  const label = PRACTICE_CATEGORY_LABELS[category];
  const pageUrl = `${baseUrl}/practice/${category}/${slug}`;

  // Structured data for both classic search rich results and AI answer
  // engines (GEO) — a LearningResource for the challenge itself, plus a
  // BreadcrumbList mirroring the visible breadcrumb so crawlers see the same
  // site hierarchy a human does.
  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: challenge.title,
    description: toPlainTextSummary(challenge.description, 300),
    educationalLevel: challenge.difficulty,
    learningResourceType: "Coding Challenge",
    about: label,
    inLanguage: "en",
    isAccessibleForFree: true,
    url: pageUrl,
    provider: { "@type": "Organization", name: "Frontend Forever", url: baseUrl },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Practice", item: `${baseUrl}/practice` },
      { "@type": "ListItem", position: 2, name: label, item: `${baseUrl}/practice/${category}` },
      { "@type": "ListItem", position: 3, name: challenge.title, item: pageUrl },
    ],
  };

  return (
    // Matches AppNavbar's own container exactly (max-w-screen-2xl, px-6/md:px-8)
    // so the content column's edges line up with the logo/avatar above it —
    // the Category List page's narrower max-w-6xl is a deliberate, unrelated
    // choice for a scannable row-list; this page is a two-pane workspace that
    // needs the room, per direct user request against the running page.
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 md:px-8">
      <script type="application/ld+json">{safeJsonLd(learningResourceJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <ChallengeEditorHeader
        category={category}
        slug={challenge.slug}
        title={challenge.title}
        difficulty={challenge.difficulty}
        questionNumber={challenge.questionNumber}
        prev={prev}
        next={next}
      />

      <ChallengeEditorWorkspace
        challenge={challenge}
        isLoggedIn={!!userId}
        initialHasPassed={initialHasPassed}
        discussionPosts={discussionPosts}
      />
    </div>
  );
}

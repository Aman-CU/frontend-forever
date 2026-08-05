import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { PLAYBOOK_SLUGS, type PlaybookSlug } from "@/lib/constants";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { mdxComponents } from "@/components/shared/mdxComponents";
import {
  getAdjacentPlaybookChapters,
  getAllChaptersForPlaybook,
  getPlaybookChapter,
} from "@/lib/playbookGuides";
import { PLAYBOOK_META } from "@/features/interview-prep/lib/playbookMeta";
import { PLAYBOOK_DIAGRAMS } from "@/features/interview-prep/lib/playbookDiagramData";
import { getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import { getReadChapterSlugs } from "@/features/interview-prep/lib/playbookQueries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { PlaybookChapterPrevNextNav } from "@/features/interview-prep/components/PlaybookChapterPrevNextNav";
import { MarkAsReadButton } from "@/features/interview-prep/components/MarkAsReadButton";
import { FlowDiagram } from "@/features/interview-prep/components/diagrams/rough/FlowDiagram";

type Params = { playbookSlug: string; chapterSlug: string };

// Same fully-premium playbook as the index page's override — a real chapter
// reached via this route is locked regardless of anything the MDX itself
// says, exactly like FF 75's per-question override on its detail route.
const PREMIUM_PLAYBOOK_SLUG: PlaybookSlug = "build-in-public-playbook";

function isPlaybookSlug(value: string): value is PlaybookSlug {
  return (PLAYBOOK_SLUGS as readonly string[]).includes(value);
}

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function generateStaticParams(): Params[] {
  return PLAYBOOK_SLUGS.flatMap((playbookSlug) =>
    getAllChaptersForPlaybook(playbookSlug).map((chapter) => ({
      playbookSlug,
      chapterSlug: chapter.frontmatter.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { playbookSlug, chapterSlug } = await params;
  if (!isPlaybookSlug(playbookSlug)) return {};

  const chapter = getPlaybookChapter(playbookSlug, chapterSlug);
  if (!chapter) return {};

  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const isLocked = playbookSlug === PREMIUM_PLAYBOOK_SLUG && !isPremiumUser;

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/playbook/${playbookSlug}/${chapterSlug}`;

  // A locked chapter's real title never goes in metadata either (same
  // reasoning as FF 75's per-question generateMetadata) — the chapter title
  // here is bespoke authored content, not a generic evergreen prompt name
  // like FF System Design's guide titles, so it stays hidden along with the
  // summary. robots: noindex too, since the body renders a generic wall.
  if (isLocked) {
    const title = "Premium Chapter | Frontend Forever";
    const description = "Upgrade to Premium to unlock this playbook.";
    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      robots: { index: false, follow: false },
      openGraph: { title, description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const title = `${chapter.frontmatter.title} | Frontend Forever`;

  return {
    title,
    description: chapter.frontmatter.summary,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: chapter.frontmatter.summary,
      url: pageUrl,
      type: "article",
      siteName: "Frontend Forever",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: chapter.frontmatter.summary,
    },
  };
}

export default async function PlaybookChapterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { playbookSlug, chapterSlug } = await params;
  if (!isPlaybookSlug(playbookSlug)) {
    notFound();
  }

  const chapter = getPlaybookChapter(playbookSlug, chapterSlug);
  if (!chapter) {
    notFound();
  }

  const meta = PLAYBOOK_META[playbookSlug];
  const { prev, next } = getAdjacentPlaybookChapters(playbookSlug, chapterSlug);
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;
  const isPremiumUser = userId ? await getIsPremiumUser(userId) : false;
  const isChapterLocked = playbookSlug === PREMIUM_PLAYBOOK_SLUG && !isPremiumUser;

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/playbook/${playbookSlug}/${chapterSlug}`;

  // Full wall, not a "summary visible, body locked" teaser — same reasoning
  // as generateMetadata above and every other Feature 38 detail page. No
  // JSON-LD, no MDX body, no read-tracking button (there's nothing here to
  // mark as read).
  if (isChapterLocked) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <InterviewPrepBreadcrumb
              backHref={`/interview-prep/playbook/${playbookSlug}`}
              crumbs={[
                { label: "Interview Prep", href: "/interview-prep" },
                { label: meta.label, href: `/interview-prep/playbook/${playbookSlug}` },
                { label: "Premium Chapter" },
              ]}
            />
          </div>
          <PlaybookChapterPrevNextNav playbookSlug={playbookSlug} prev={prev} next={next} />
        </div>

        <div className="mt-6">
          <PremiumLocked
            title="Premium chapter"
            description="Upgrade to Premium to unlock this playbook."
            isLoggedIn={!!userId}
          />
        </div>
      </div>
    );
  }

  const readSlugs = await getReadChapterSlugs(userId, playbookSlug);
  const isRead = readSlugs.has(chapterSlug);
  const { frontmatter } = chapter;

  const diagramSpec = PLAYBOOK_DIAGRAMS[`${playbookSlug}/${chapterSlug}`];

  // Article + Q&A-style mainEntity JSON-LD — same GEO/SEO treatment as
  // Features 31/49 (answer-first summary as the citable entity).
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: frontmatter.title,
    description: frontmatter.summary,
    inLanguage: "en",
    isAccessibleForFree: true,
    url: pageUrl,
    about: meta.label,
    datePublished: frontmatter.datePublished,
    dateModified: frontmatter.dateModified,
    mainEntity: {
      "@type": "Question",
      name: frontmatter.title,
      acceptedAnswer: { "@type": "Answer", text: frontmatter.summary },
    },
    author: { "@type": "Organization", name: "Frontend Forever", url: baseUrl },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Interview Prep",
        item: `${baseUrl}/interview-prep`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.label,
        item: `${baseUrl}/interview-prep/playbook/${playbookSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: frontmatter.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(articleJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <InterviewPrepBreadcrumb
            backHref={`/interview-prep/playbook/${playbookSlug}`}
            crumbs={[
              { label: "Interview Prep", href: "/interview-prep" },
              {
                label: meta.label,
                href: `/interview-prep/playbook/${playbookSlug}`,
              },
              { label: frontmatter.title },
            ]}
          />
        </div>
        <PlaybookChapterPrevNextNav
          playbookSlug={playbookSlug}
          prev={prev}
          next={next}
        />
      </div>

      <h1 className="mb-4 text-2xl font-bold text-text-primary">
        {frontmatter.title}
      </h1>

      <p className="mb-6 text-base font-medium leading-7 text-text-primary">
        {frontmatter.summary}
      </p>

      <article>
        <MDXRemote
          source={chapter.content}
          components={{
            ...mdxComponents,
            ...(diagramSpec
              ? { FlowDiagram: () => <FlowDiagram {...diagramSpec} /> }
              : {}),
          }}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      <MarkAsReadButton
        playbookSlug={playbookSlug}
        chapterSlug={chapterSlug}
        isLoggedIn={Boolean(userId)}
        initialRead={isRead}
      />
    </div>
  );
}

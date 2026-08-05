import type { ComponentType } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { mdxComponents } from "@/components/shared/mdxComponents";
import { COLLECTION_META } from "@/features/interview-prep/lib/collectionMeta";
import { getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import {
  getAdjacentSystemDesignGuides,
  getAllSystemDesignGuides,
  getSystemDesignGuide,
} from "@/lib/systemDesignGuides";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { SystemDesignGuidePrevNextNav } from "@/features/interview-prep/components/SystemDesignGuidePrevNextNav";
import { InfiniteScrollArchitectureDiagram } from "@/features/interview-prep/components/diagrams/rough/InfiniteScrollArchitectureDiagram";
import { FlowDiagram } from "@/features/interview-prep/components/diagrams/rough/FlowDiagram";
import { SequenceDiagram } from "@/features/interview-prep/components/diagrams/rough/SequenceDiagram";
import { SYSTEM_DESIGN_DIAGRAMS } from "@/features/interview-prep/lib/systemDesignDiagramData";
import { SYSTEM_DESIGN_SEQUENCES } from "@/features/interview-prep/lib/systemDesignSequenceData";

type Params = { slug: string };

const META = COLLECTION_META["ff-system-design"];

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

// Per-guide diagram components, embedded directly in each guide's MDX source
// (e.g. `<ArchitectureDiagram />` inside the "High-Level Component
// Architecture" section) — same slug-keyed registry precedent as Feature 31's
// DIAGRAM_BY_SLUG, just merged into MDXRemote's `components` prop instead of
// appended after the content, since these guides are long-form and the
// diagram belongs inside one specific section, not at the very end.
// The pilot guide gets a hand-tuned bespoke diagram; every other guide's
// diagram is generated from SYSTEM_DESIGN_DIAGRAMS' data via the generic
// FlowDiagram primitive (see that file's own comment for why).
const BESPOKE_DIAGRAMS: Partial<Record<string, ComponentType>> = {
  "infinite-scroll-feed": InfiniteScrollArchitectureDiagram,
};

function getArchitectureDiagramComponent(slug: string): ComponentType | undefined {
  const bespoke = BESPOKE_DIAGRAMS[slug];
  if (bespoke) return bespoke;

  const spec = SYSTEM_DESIGN_DIAGRAMS[slug];
  if (!spec) return undefined;

  return function GeneratedArchitectureDiagram() {
    return <FlowDiagram {...spec} />;
  };
}

// Per-guide `<SequenceDiagram />`, embedded in the MDX source (typically
// inside the Deep Dives section, next to the protocol/merge flow it
// illustrates) — same generic "data in, component out" pattern as
// getArchitectureDiagramComponent, just for guides with a genuine
// time-ordered flow worth showing rather than a static component graph.
function getSequenceDiagramComponent(slug: string): ComponentType | undefined {
  const spec = SYSTEM_DESIGN_SEQUENCES[slug];
  if (!spec) return undefined;

  return function GeneratedSequenceDiagram() {
    return <SequenceDiagram {...spec} />;
  };
}

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function generateStaticParams(): Params[] {
  return getAllSystemDesignGuides().map((guide) => ({ slug: guide.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSystemDesignGuide(slug);
  if (!guide) return {};

  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const isLocked = Boolean(guide.frontmatter.isPremium) && !isPremiumUser;

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/ff-system-design/${slug}`;

  // A locked guide's real summary never goes in metadata either — meta
  // description/OG/Twitter tags are just as recoverable via view-source or a
  // social-share preview as the rendered page (same rule as Practice's and
  // FF Collections' generateMetadata). robots: noindex too — the body
  // renders a generic wall with nothing real for a crawler to index. The
  // title stays real (see the list page's BLURRED_SUMMARY_PLACEHOLDER
  // comment — a system design prompt name is a generic, evergreen topic on
  // its own, same reasoning as Practice's always-visible challenge titles).
  if (isLocked) {
    const title = `${guide.frontmatter.title} | Frontend Forever`;
    const description = "Upgrade to Premium to unlock this system design guide.";
    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      robots: { index: false, follow: false },
      openGraph: { title, description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const title = `${guide.frontmatter.title} | Frontend Forever`;

  return {
    title,
    description: guide.frontmatter.summary,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: guide.frontmatter.summary,
      url: pageUrl,
      type: "article",
      siteName: "Frontend Forever",
    },
    twitter: { card: "summary_large_image", title, description: guide.frontmatter.summary },
  };
}

export default async function SystemDesignGuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const guide = getSystemDesignGuide(slug);
  if (!guide) {
    notFound();
  }

  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const isGuideLocked = Boolean(guide.frontmatter.isPremium) && !isPremiumUser;

  const { prev, next } = getAdjacentSystemDesignGuides(slug);
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/ff-system-design/${slug}`;
  const { frontmatter } = guide;

  // Full wall, not a "summary visible, body locked" teaser — same reasoning
  // as every other Feature 38 detail page (Learn's Interview tab, Practice,
  // FF Collections): render nothing from the real MDX body, no diagrams, no
  // JSON-LD (matches generateMetadata's robots: noindex above — there's
  // nothing real here for a crawler to cite). The guide's own `content`
  // string is simply never passed to MDXRemote in this branch, so it never
  // crosses the server->client boundary either.
  if (isGuideLocked) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <InterviewPrepBreadcrumb
              backHref="/interview-prep/ff-system-design"
              crumbs={[
                { label: "Interview Prep", href: "/interview-prep" },
                { label: META.label, href: "/interview-prep/ff-system-design" },
                { label: "Premium Guide" },
              ]}
            />
          </div>
          <SystemDesignGuidePrevNextNav prev={prev} next={next} />
        </div>

        <div className="mt-6">
          <PremiumLocked
            title="Premium system design guide"
            description="Upgrade to Premium to unlock this guide."
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    );
  }

  const ArchitectureDiagram = getArchitectureDiagramComponent(slug);
  const SequenceDiagramForGuide = getSequenceDiagramComponent(slug);

  // TechArticle + mainEntity Q&A JSON-LD — same GEO/SEO treatment as
  // Feature 31's question pages (build-plan.md, Feature 49 spec).
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: frontmatter.title,
    description: frontmatter.summary,
    inLanguage: "en",
    isAccessibleForFree: true,
    url: pageUrl,
    about: META.label,
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
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      {
        "@type": "ListItem",
        position: 2,
        name: META.label,
        item: `${baseUrl}/interview-prep/ff-system-design`,
      },
      { "@type": "ListItem", position: 3, name: frontmatter.title, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(articleJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <InterviewPrepBreadcrumb
            backHref="/interview-prep/ff-system-design"
            crumbs={[
              { label: "Interview Prep", href: "/interview-prep" },
              { label: META.label, href: "/interview-prep/ff-system-design" },
              { label: frontmatter.title },
            ]}
          />
        </div>
        <SystemDesignGuidePrevNextNav prev={prev} next={next} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
            DIFFICULTY_STYLES[frontmatter.difficulty],
          )}
        >
          {frontmatter.difficulty}
        </span>
        {frontmatter.companies?.map((company) => (
          <span
            key={company}
            className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted"
          >
            {company}
          </span>
        ))}
      </div>

      <h1 className="mb-4 text-2xl font-bold text-text-primary">{frontmatter.title}</h1>

      <p className="mb-6 text-base font-medium leading-7 text-text-primary">{frontmatter.summary}</p>

      <article>
        <MDXRemote
          source={guide.content}
          components={{
            ...mdxComponents,
            ...(ArchitectureDiagram ? { ArchitectureDiagram } : {}),
            ...(SequenceDiagramForGuide ? { SequenceDiagram: SequenceDiagramForGuide } : {}),
          }}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>
    </div>
  );
}

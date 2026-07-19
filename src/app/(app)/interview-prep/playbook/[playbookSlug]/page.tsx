import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { PLAYBOOK_SLUGS, type PlaybookSlug } from "@/lib/constants";
import { getAllChaptersForPlaybook } from "@/lib/playbookGuides";
import { PLAYBOOK_META } from "@/features/interview-prep/lib/playbookMeta";
import { getReadChapterSlugs } from "@/features/interview-prep/lib/playbookQueries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";

type Params = { playbookSlug: string };

function isPlaybookSlug(value: string): value is PlaybookSlug {
  return (PLAYBOOK_SLUGS as readonly string[]).includes(value);
}

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function generateStaticParams(): Params[] {
  return PLAYBOOK_SLUGS.map((playbookSlug) => ({ playbookSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { playbookSlug } = await params;
  if (!isPlaybookSlug(playbookSlug)) return {};

  const meta = PLAYBOOK_META[playbookSlug];
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/playbook/${playbookSlug}`;
  const title = `${meta.label} | Frontend Forever`;

  return {
    title,
    description: meta.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description: meta.description, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description: meta.description },
  };
}

export default async function PlaybookIndexPage({ params }: { params: Promise<Params> }) {
  const { playbookSlug } = await params;
  if (!isPlaybookSlug(playbookSlug)) {
    notFound();
  }

  const meta = PLAYBOOK_META[playbookSlug];
  const chapters = getAllChaptersForPlaybook(playbookSlug);
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;
  const readSlugs = await getReadChapterSlugs(userId, playbookSlug);
  const readCount = chapters.filter((c) => readSlugs.has(c.frontmatter.slug)).length;
  const progressPercent = chapters.length > 0 ? (readCount / chapters.length) * 100 : 0;

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/playbook/${playbookSlug}`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: chapters.map((chapter, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: chapter.frontmatter.title,
      url: `${baseUrl}/interview-prep/playbook/${playbookSlug}/${chapter.frontmatter.slug}`,
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
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep"
        crumbs={[{ label: "Interview Prep", href: "/interview-prep" }, { label: meta.label }]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{meta.label}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{meta.description}</p>

        {chapters.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={readCount}
                aria-valuemin={0}
                aria-valuemax={chapters.length}
                aria-label={`${readCount} of ${chapters.length} articles read`}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-text-muted">
              {readCount}/{chapters.length} articles read
            </span>
          </div>
        )}
      </div>

      {chapters.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-text-primary">Chapters coming soon</h2>
          <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
            This playbook is being written. Check back soon.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {chapters.map((chapter, index) => {
            const isRead = readSlugs.has(chapter.frontmatter.slug);
            return (
              <li key={chapter.frontmatter.slug}>
                <Link
                  href={`/interview-prep/playbook/${playbookSlug}/${chapter.frontmatter.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isRead ? "bg-success-muted text-success" : "bg-surface-secondary text-text-secondary",
                    )}
                  >
                    {isRead ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {chapter.frontmatter.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                      {chapter.frontmatter.summary}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

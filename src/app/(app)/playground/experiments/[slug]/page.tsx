import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  EXPERIMENTS,
  getExperiment,
} from "@/features/playground/experiments/registry";
import { readExperimentSources } from "@/lib/experimentSource";
import { ExperimentWorkspace } from "@/features/playground/components/experiment-viewer/ExperimentWorkspace";

type Props = {
  params: Promise<{ slug: string }>;
};

// No NEXT_PUBLIC_SITE_URL in this project — derive from the request, same
// pattern as the Battles editor page and Practice's Editor page.
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function generateStaticParams() {
  return EXPERIMENTS.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) return { title: "Experiments | Frontend Forever" };

  const title = `${experiment.title} | Experiments | Frontend Forever`;
  const baseUrl = await getBaseUrl();
  // The experiment's own thumbnail screenshot doubles as the share image, so a
  // shared link unfurls with a real preview (same one-asset-two-jobs move as
  // UI Battles' targetImageUrl).
  const imageUrl = `${baseUrl}${experiment.thumbnail}`;

  return {
    title,
    description: experiment.description,
    alternates: { canonical: `${baseUrl}/playground/experiments/${slug}` },
    openGraph: {
      title,
      description: experiment.description,
      url: `${baseUrl}/playground/experiments/${slug}`,
      type: "article",
      siteName: "Frontend Forever",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: experiment.description,
      images: [imageUrl],
    },
  };
}

// No login gate — experiments are first-party, publicly viewable, with no
// personalization or grading (build-plan.md, Feature 54), unlike the Battles
// editor which gates on login.
export default async function ExperimentDetailPage({ params }: Props) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }

  // Real source, read off disk server-side — single source of truth for the
  // View Code panel, never a hand-maintained copy.
  const sources = readExperimentSources(experiment.sourceFiles);

  return (
    <ExperimentWorkspace
      slug={experiment.slug}
      title={experiment.title}
      description={experiment.description}
      tags={experiment.tags}
      sources={sources}
    />
  );
}

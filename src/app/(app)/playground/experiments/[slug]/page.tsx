import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  EXPERIMENTS,
  getExperiment,
} from "@/features/playground/experiments/registry";
import { readExperimentSources } from "@/lib/experimentSource";
import { getCachedSession } from "@/lib/auth/server";
import { getBaseUrl } from "@/lib/seo";
import { getIsPremiumUser } from "@/features/playground/lib/queries";
import { ExperimentWorkspace } from "@/features/playground/components/experiment-viewer/ExperimentWorkspace";

type Props = {
  params: Promise<{ slug: string }>;
};

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

// No login gate — the experiment itself is publicly viewable (build-plan.md,
// Feature 54), unlike the Battles editor which redirects to login. Only the
// "View Code" source is premium-gated, enforced server-side below.
export default async function ExperimentDetailPage({ params }: Props) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    notFound();
  }

  // View Code is a premium feature. Gate it server-side — never read/serialize
  // the real source for a non-premium (or logged-out) viewer, same "never
  // client-side only" pattern as the Battles solution (BattleSolutionPanel).
  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const sources = isPremiumUser ? readExperimentSources(experiment.sourceFiles) : [];

  return (
    <ExperimentWorkspace
      slug={experiment.slug}
      title={experiment.title}
      sources={sources}
      isCodeLocked={!isPremiumUser}
    />
  );
}

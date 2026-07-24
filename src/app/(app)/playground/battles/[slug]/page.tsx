import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { getUiBattleBySlug, getIsPremiumUser } from "@/features/playground/lib/queries";
import { BattleEditorWorkspace } from "@/features/playground/components/battle-editor/BattleEditorWorkspace";

type Props = {
  params: Promise<{ slug: string }>;
};

// No NEXT_PUBLIC_SITE_URL exists in this project — derived from the incoming
// request instead, same pattern as Practice's Editor page.
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getUiBattleBySlug(slug);
  if (!challenge) return { title: "UI Battles | Frontend Forever" };

  const title = `${challenge.title} | UI Battles | Frontend Forever`;
  const baseUrl = await getBaseUrl();
  // The real, already-existing target screenshot (built for the list-page
  // thumbnail) doubles as the share image here — no separate opengraph-
  // image.tsx generation route needed, this is a real static asset already.
  const imageUrl = `${baseUrl}${challenge.targetImageUrl}`;

  return {
    title,
    description: challenge.description,
    openGraph: {
      title,
      description: challenge.description,
      url: `${baseUrl}/playground/battles/${slug}`,
      type: "article",
      siteName: "Frontend Forever",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: challenge.description,
      images: [imageUrl],
    },
  };
}

// No grading exists in v1, so there's nothing to gate server-side beyond
// login itself — personalization-style gate, same precedent as
// /interview-prep/review (Feature 32): not in proxy.ts's matcher, redirect
// lives here instead.
export default async function UiBattleEditorPage({ params }: Props) {
  const { slug } = await params;

  const session = await getCachedSession();
  if (!session?.user) {
    redirect(`/login?callbackURL=/playground/battles/${slug}`);
  }

  const [challenge, isPremiumUser] = await Promise.all([
    getUiBattleBySlug(slug),
    getIsPremiumUser(session.user.id),
  ]);
  if (!challenge) {
    notFound();
  }

  // Server-side premium gate — never client-side only (security.md). Strip
  // the real solution source before it's ever serialized into the client
  // component's props, same "answer: isLocked ? '' : answer" pattern as
  // ConceptInterview/QuestionCard. This is a real gate, unlike the cosmetic
  // isPremium pill elsewhere in Playground — see schema/playground.ts.
  const clientChallenge = {
    ...challenge,
    solutionHtml: isPremiumUser ? challenge.solutionHtml : "",
    solutionCss: isPremiumUser ? challenge.solutionCss : "",
    solutionJs: isPremiumUser ? challenge.solutionJs : "",
    isSolutionLocked: !isPremiumUser,
  };

  return <BattleEditorWorkspace challenge={clientChallenge} />;
}

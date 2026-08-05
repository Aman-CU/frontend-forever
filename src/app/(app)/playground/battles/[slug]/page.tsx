import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
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

// No grading exists in v1, so login is the only gate that predates Feature
// 38 — personalization-style, same precedent as /interview-prep/review
// (Feature 32): not in proxy.ts's matcher, redirect lives here instead.
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

  // Feature 38: challenge.isPremium is now a real gate, not just a cosmetic
  // pill — Intermediate/Hard battles are premium (see schema/playground.ts).
  const isChallengeLocked = challenge.isPremium && !isPremiumUser;
  if (isChallengeLocked) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 md:px-8">
        <PremiumLocked
          title="Premium battle"
          description="Upgrade to Premium to unlock this UI Battle."
          isLoggedIn
        />
      </div>
    );
  }

  // Solution visibility: the viewer's own premium status, OR a free challenge
  // whose solution was specifically hand-picked to stay free too. Never
  // reaches the isSolutionFree branch for a locked challenge — that whole
  // case already returned above. Server-side gate, never client-side only
  // (security.md) — strip the real solution source before it's ever
  // serialized into the client component's props, same "answer: isLocked ?
  // '' : answer" pattern as ConceptInterview/QuestionCard.
  const isSolutionUnlocked = isPremiumUser || challenge.isSolutionFree;
  const clientChallenge = {
    ...challenge,
    solutionHtml: isSolutionUnlocked ? challenge.solutionHtml : "",
    solutionCss: isSolutionUnlocked ? challenge.solutionCss : "",
    solutionJs: isSolutionUnlocked ? challenge.solutionJs : "",
    isSolutionLocked: !isSolutionUnlocked,
  };

  return <BattleEditorWorkspace challenge={clientChallenge} />;
}

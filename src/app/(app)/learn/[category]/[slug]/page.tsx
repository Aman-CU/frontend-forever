import { notFound } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { getConceptContent } from "@/lib/mdx";
import {
  getChallengeByConceptId,
  getChallengeState,
  getConceptBySlug,
  getIsPremiumUser,
  getSimulateState,
  getUnderstoodState,
} from "@/features/learn/lib/queries";
import { ConceptPageShell } from "@/features/learn/components/concept/ConceptPageShell";
import { ConceptChallenge } from "@/components/challenge/ConceptChallenge";
import { ConceptSimulator } from "@/components/simulators/ConceptSimulator";
import { UnderstandTab } from "@/features/learn/components/concept/UnderstandTab";

type Params = { category: string; slug: string };

export default async function ConceptPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;

  const concept = await getConceptBySlug(slug);

  // 404 on an unknown slug, or when the URL category doesn't match the concept's
  // real category (keeps the breadcrumb honest and prevents duplicate URLs).
  if (!concept || concept.category !== category) {
    notFound();
  }

  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const mdx = getConceptContent(category, slug);
  const challenge = await getChallengeByConceptId(concept.id);
  const [initialUnderstood, initialSimulated, initialChallenged, isPremiumUser] = userId
    ? await Promise.all([
        getUnderstoodState(userId, concept.id),
        getSimulateState(userId, concept.id),
        getChallengeState(userId, concept.id),
        getIsPremiumUser(userId),
      ])
    : [false, false, false, false];

  // Server-side premium gate seam (Feature 38 fleshes this out). Always false
  // today — no challenge is premium yet.
  const isPremiumLocked = (challenge?.isPremium ?? false) && !isPremiumUser;

  // Built on the server (MDX needs the server) and passed into the client tab
  // switcher as a prop — keeps the guide off the client bundle.
  const understandContent = (
    <UnderstandTab
      content={mdx}
      conceptId={concept.id}
      isLoggedIn={userId !== null}
      initialUnderstood={initialUnderstood}
    />
  );

  const simulateContent = (
    <ConceptSimulator
      conceptSlug={concept.slug}
      conceptId={concept.id}
      isLoggedIn={userId !== null}
      initialCompleted={initialSimulated}
    />
  );

  const challengeContent = (
    <ConceptChallenge
      challenge={challenge}
      conceptId={concept.id}
      isLoggedIn={userId !== null}
      initialCompleted={initialChallenged}
      isPremiumLocked={isPremiumLocked}
    />
  );

  return (
    <ConceptPageShell
      concept={concept}
      understandContent={understandContent}
      simulateContent={simulateContent}
      challengeContent={challengeContent}
    />
  );
}

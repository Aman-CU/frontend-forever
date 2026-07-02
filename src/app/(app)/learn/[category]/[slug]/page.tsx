import { notFound } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { getConceptContent } from "@/lib/mdx";
import {
  getChallengeByConceptId,
  getChallengeState,
  getConceptBySlug,
  getInterviewQuestionsByConceptId,
  getInterviewState,
  getIsPremiumUser,
  getSimulateState,
  getUnderstoodState,
} from "@/features/learn/lib/queries";
import { ConceptPageShell } from "@/features/learn/components/concept/ConceptPageShell";
import { ConceptChallenge } from "@/components/challenge/ConceptChallenge";
import { ConceptInterview } from "@/components/interview/ConceptInterview";
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
  const [
    challenge,
    interviewQuestions,
    initialUnderstood,
    initialSimulated,
    initialChallenged,
    initialInterviewed,
    isPremiumUser,
  ] = await Promise.all([
    getChallengeByConceptId(concept.id),
    getInterviewQuestionsByConceptId(concept.id),
    userId ? getUnderstoodState(userId, concept.id) : Promise.resolve(false),
    userId ? getSimulateState(userId, concept.id) : Promise.resolve(false),
    userId ? getChallengeState(userId, concept.id) : Promise.resolve(false),
    userId ? getInterviewState(userId, concept.id) : Promise.resolve(false),
    userId ? getIsPremiumUser(userId) : Promise.resolve(false),
  ]);

  // Server-side premium gate seam (Feature 38 fleshes this out). Always false
  // today — no challenge is premium yet.
  const isPremiumLocked = (challenge?.isPremium ?? false) && !isPremiumUser;

  // Never serialize the reference solution into the client payload for a locked
  // challenge — premium content is gated server-side (security.md), the client
  // UI is cosmetic only.
  const clientChallenge =
    challenge && isPremiumLocked ? { ...challenge, solutionCode: "" } : challenge;

  // Same server-side gate, per question: strip the answer (never send it to a
  // non-premium client) and flag isLocked so the tab can render a teaser instead
  // of silently omitting the question. Currently unreachable — no concept-linked
  // question is premium yet — but every future one is gated the moment it's added.
  const clientInterviewQuestions = interviewQuestions.map((q) => {
    const isLocked = q.isPremium && !isPremiumUser;
    return isLocked ? { ...q, answer: "", isLocked } : { ...q, isLocked };
  });

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
      challenge={clientChallenge}
      conceptId={concept.id}
      isLoggedIn={userId !== null}
      initialCompleted={initialChallenged}
      isPremiumLocked={isPremiumLocked}
    />
  );

  const interviewContent = (
    <ConceptInterview
      questions={clientInterviewQuestions}
      conceptId={concept.id}
      isLoggedIn={userId !== null}
      initialCompleted={initialInterviewed}
    />
  );

  return (
    <ConceptPageShell
      concept={concept}
      understandContent={understandContent}
      simulateContent={simulateContent}
      challengeContent={challengeContent}
      interviewContent={interviewContent}
    />
  );
}

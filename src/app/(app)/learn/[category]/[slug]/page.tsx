import { notFound } from "next/navigation";

import { getConceptBySlug } from "@/features/learn/lib/queries";
import { ConceptPageShell } from "@/features/learn/components/concept/ConceptPageShell";

type Params = { category: string; slug: string };

export default async function ConceptPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;

  const concept = await getConceptBySlug(slug);

  // 404 on an unknown slug, or when the URL category doesn't match the concept's
  // real category (keeps the breadcrumb honest and prevents duplicate URLs).
  if (!concept || concept.category !== category) {
    notFound();
  }

  return <ConceptPageShell concept={concept} />;
}

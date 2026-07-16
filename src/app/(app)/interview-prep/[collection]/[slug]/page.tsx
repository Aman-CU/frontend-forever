import type { ComponentType } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import { toPlainTextSummary, safeJsonLd } from "@/lib/seo";
import { Markdown } from "@/components/shared/Markdown";
import { isInterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";
import { COLLECTION_META } from "@/features/interview-prep/lib/collectionMeta";
import {
  getAdjacentCollectionQuestions,
  getCollectionQuestionBySlug,
} from "@/features/interview-prep/lib/queries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { CollectionQuestionPrevNextNav } from "@/features/interview-prep/components/CollectionQuestionPrevNextNav";
import { EventLoopFlowDiagram } from "@/features/interview-prep/components/diagrams/EventLoopFlowDiagram";
import { IsrTimelineDiagram } from "@/features/interview-prep/components/diagrams/IsrTimelineDiagram";
import { VirtualDomDiffDiagram } from "@/features/interview-prep/components/diagrams/VirtualDomDiffDiagram";
import { LayoutEffectVsEffectTimingDiagram } from "@/features/interview-prep/components/diagrams/LayoutEffectVsEffectTimingDiagram";
import { ReduxDataFlowDiagram } from "@/features/interview-prep/components/diagrams/ReduxDataFlowDiagram";
import { AutomaticBatchingDiagram } from "@/features/interview-prep/components/diagrams/AutomaticBatchingDiagram";
import { FiberArchitectureDiagram } from "@/features/interview-prep/components/diagrams/FiberArchitectureDiagram";
import { HydrationFlowDiagram } from "@/features/interview-prep/components/diagrams/HydrationFlowDiagram";
import { OptimisticVsPessimisticDiagram } from "@/features/interview-prep/components/diagrams/OptimisticVsPessimisticDiagram";
import { PortalDiagram } from "@/features/interview-prep/components/diagrams/PortalDiagram";
import { VirtualizedListDiagram } from "@/features/interview-prep/components/diagrams/VirtualizedListDiagram";
import { LiftingStateUpDiagram } from "@/features/interview-prep/components/diagrams/LiftingStateUpDiagram";
import { UndoRedoDiagram } from "@/features/interview-prep/components/diagrams/UndoRedoDiagram";
import { SsrCsrSsgDiagram } from "@/features/interview-prep/components/diagrams/SsrCsrSsgDiagram";
import { ReactServerComponentsDiagram } from "@/features/interview-prep/components/diagrams/ReactServerComponentsDiagram";
import { PushVsReplaceDiagram } from "@/features/interview-prep/components/diagrams/PushVsReplaceDiagram";
import { SyntheticEventDelegationDiagram } from "@/features/interview-prep/components/diagrams/SyntheticEventDelegationDiagram";
import { CustomRendererArchitectureDiagram } from "@/features/interview-prep/components/diagrams/CustomRendererArchitectureDiagram";
import { PrototypeChainDiagram } from "@/features/interview-prep/components/diagrams/PrototypeChainDiagram";
import { EventBubblingCapturingDiagram } from "@/features/interview-prep/components/diagrams/EventBubblingCapturingDiagram";
import { GarbageCollectionDiagram } from "@/features/interview-prep/components/diagrams/GarbageCollectionDiagram";
import { MicrotaskMacrotaskDiagram } from "@/features/interview-prep/components/diagrams/MicrotaskMacrotaskDiagram";
import { TailCallOptimizationDiagram } from "@/features/interview-prep/components/diagrams/TailCallOptimizationDiagram";
import { ObserverPatternDiagram } from "@/features/interview-prep/components/diagrams/ObserverPatternDiagram";

type Params = { collection: string; slug: string };

// Hand-authored SVG diagrams exist only for the subset of questions that are
// genuinely a flow/process concept (build-plan.md, Feature 31 spec) — an
// estimated 40-50 of the eventual ~299 questions. Keyed by slug, added one at
// a time as each question's diagram is authored (not deferred to a single
// pass after all 299 questions are written); a slug with no entry here simply
// renders no diagram, same as every other un-diagrammed question today.
const DIAGRAM_BY_SLUG: Partial<Record<string, ComponentType>> = {
  "what-is-the-event-loop": EventLoopFlowDiagram,
  "incremental-static-regeneration": IsrTimelineDiagram,
  "what-is-react-and-virtual-dom": VirtualDomDiffDiagram,
  // Same node-by-node diffing mechanism as what-is-react-and-virtual-dom
  // above — reconciliation is the general name for that same algorithm.
  "what-is-reconciliation-in-react": VirtualDomDiffDiagram,
  "uselayouteffect-vs-useeffect": LayoutEffectVsEffectTimingDiagram,
  "redux-explained-when-to-use": ReduxDataFlowDiagram,
  "batching-in-react-18": AutomaticBatchingDiagram,
  "react-fiber-architecture-explained": FiberArchitectureDiagram,
  "hydration-in-react-explained": HydrationFlowDiagram,
  "optimistic-vs-pessimistic-ui-updates": OptimisticVsPessimisticDiagram,
  "react-portal-explained": PortalDiagram,
  "virtualized-list-in-react": VirtualizedListDiagram,
  "sharing-state-between-siblings": LiftingStateUpDiagram,
  // Same shared-ancestor mechanism as sharing-state-between-siblings above —
  // lifting state up is the general name for that same pattern.
  "lifting-state-up-in-react": LiftingStateUpDiagram,
  "undo-redo-in-react": UndoRedoDiagram,
  "ssr-vs-csr-vs-ssg": SsrCsrSsgDiagram,
  "react-server-components-explained": ReactServerComponentsDiagram,
  "push-vs-replace-in-routing": PushVsReplaceDiagram,
  "synthetic-events-in-react": SyntheticEventDelegationDiagram,
  "writing-a-custom-renderer-in-react": CustomRendererArchitectureDiagram,
  "prototypal-inheritance-explained": PrototypeChainDiagram,
  // Same prototype-chain-walk concept as prototypal-inheritance-explained
  // above — this question walks the identical mechanism (own property miss,
  // walk [[Prototype]] up to Object.prototype, then null), just via a plain
  // array instead of Object.create(), so the existing diagram applies as-is.
  "how-the-prototype-chain-works": PrototypeChainDiagram,
  "event-bubbling-and-capturing": EventBubblingCapturingDiagram,
  "how-garbage-collection-works": GarbageCollectionDiagram,
  "microtask-vs-macrotask-queue": MicrotaskMacrotaskDiagram,
  "tail-call-optimization": TailCallOptimizationDiagram,
  "observer-pattern-explained": ObserverPatternDiagram,
};

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

// Same "derive from the incoming request" pattern as Practice's Editor page —
// no NEXT_PUBLIC_SITE_URL exists in this project (AGENTS.md's env list).
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { collection, slug } = await params;
  if (!isInterviewPrepRouteCollection(collection)) return {};

  const detail = await getCollectionQuestionBySlug(collection, slug);
  if (!detail) return {};

  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/${collection}/${slug}`;
  const title = `${detail.question} | Frontend Forever`;
  const description = toPlainTextSummary(detail.answer);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: pageUrl, type: "article", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionQuestionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { collection, slug } = await params;

  if (!isInterviewPrepRouteCollection(collection)) {
    notFound();
  }

  const detail = await getCollectionQuestionBySlug(collection, slug);
  if (!detail) {
    notFound();
  }

  const [{ prev, next }, baseUrl] = await Promise.all([
    getAdjacentCollectionQuestions(collection, slug),
    getBaseUrl(),
  ]);

  const DiagramComponent = DIAGRAM_BY_SLUG[slug];

  const meta = COLLECTION_META[collection];
  const pageUrl = `${baseUrl}/interview-prep/${collection}/${slug}`;

  // Article + mainEntity Q&A JSON-LD (Feature 31's GEO/SEO spec) — a deeper
  // structured-data shape than Feature 29's LearningResource, since this page
  // is a standalone, individually-citable Q&A answer, not a coding challenge.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: detail.question,
    description: toPlainTextSummary(detail.answer, 300),
    inLanguage: "en",
    isAccessibleForFree: true,
    url: pageUrl,
    about: meta.label,
    mainEntity: {
      "@type": "Question",
      name: detail.question,
      acceptedAnswer: { "@type": "Answer", text: toPlainTextSummary(detail.answer, 500) },
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
        name: meta.label,
        item: `${baseUrl}/interview-prep/${collection}`,
      },
      { "@type": "ListItem", position: 3, name: detail.question, item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(articleJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <InterviewPrepBreadcrumb
            backHref={`/interview-prep/${collection}`}
            crumbs={[
              { label: "Interview Prep", href: "/interview-prep" },
              { label: meta.label, href: `/interview-prep/${collection}` },
              { label: detail.question },
            ]}
          />
        </div>
        <CollectionQuestionPrevNextNav routeCollection={collection} prev={prev} next={next} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium tabular-nums text-text-muted">
          Question #{detail.questionNumber}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
            DIFFICULTY_STYLES[detail.difficulty],
          )}
        >
          {detail.difficulty}
        </span>
        {detail.companies.map((company) => (
          <span
            key={company}
            className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted"
          >
            {company}
          </span>
        ))}
      </div>

      <h1 className="mb-4 text-2xl font-bold text-text-primary">{detail.question}</h1>

      <Markdown markdown={detail.answer} />

      {DiagramComponent && <DiagramComponent />}
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";

import { safeJsonLd } from "@/lib/seo";
import { getCachedSession } from "@/lib/auth/server";
import { getIsPremiumUser } from "@/features/interview-prep/lib/queries";
import { getStudyPlans } from "@/features/interview-prep/lib/studyPlanQueries";
import { InterviewPrepBreadcrumb } from "@/features/interview-prep/components/InterviewPrepBreadcrumb";
import { StudyPlanCard } from "@/features/interview-prep/components/StudyPlanCard";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const TITLE = "Frontend Interview Study Plans | Frontend Forever";
const DESCRIPTION =
  "1 Week, 1 Month, and 3 Month frontend interview study plans — day-by-day and week-by-week itineraries across Learn, Practice, FF Collections, and the Playbook.";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/study-plans`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: { title: TITLE, description: DESCRIPTION, url: pageUrl, type: "website", siteName: "Frontend Forever" },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

export default async function StudyPlansIndexPage() {
  const session = await getCachedSession();
  const isPremiumUser = session?.user ? await getIsPremiumUser(session.user.id) : false;
  const plans = await getStudyPlans();
  const baseUrl = await getBaseUrl();
  const pageUrl = `${baseUrl}/interview-prep/study-plans`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: plans.map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: plan.title,
      url: `${baseUrl}/interview-prep/study-plans/${plan.slug}`,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Interview Prep", item: `${baseUrl}/interview-prep` },
      { "@type": "ListItem", position: 2, name: "Study Plans", item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <script type="application/ld+json">{safeJsonLd(itemListJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>

      <InterviewPrepBreadcrumb
        backHref="/interview-prep"
        crumbs={[{ label: "Interview Prep", href: "/interview-prep" }, { label: "Study Plans" }]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Frontend Interview Study Plans</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Pick a timeline. Each plan is a real itinerary across Learn, Practice, FF Collections, and
          the Playbook — not a question list alone.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <StudyPlanCard key={plan.slug} plan={plan} isPremiumUser={isPremiumUser} />
        ))}
      </div>
    </div>
  );
}

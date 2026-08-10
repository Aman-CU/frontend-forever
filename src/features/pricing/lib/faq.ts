import { CATALOG } from "@/features/pricing/lib/catalog";
import {
  LIFETIME_BREAK_EVEN_MONTHS,
  LIFETIME_PLAN,
  MONTHLY_LIST_PRICE_USD,
  formatUsd,
} from "@/features/pricing/lib/plans";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Every answer here is derivable from how the product actually behaves — the
// gating rules in Feature 38, the plan numbers in plans.ts, or the catalogue
// counts in catalog.ts. Deliberately absent: a refund window and a
// money-back guarantee. Both are commercial commitments nobody has decided
// yet, and inventing one on a page customers will hold us to is not a
// cosmetic mistake. Add them here once there's a real policy to state.
export const PRICING_FAQ: FaqItem[] = [
  {
    id: "whats-included",
    question: "What do I actually get with Premium?",
    answer: `Every gated surface on the platform opens up: the complete FF ${CATALOG.ff75Questions}, all ${CATALOG.interviewQuestions} interview questions, all ${CATALOG.codingChallenges} coding challenges with their official solutions, the Simulate/Challenge/Interview/Build tabs on every locked concept, all ${CATALOG.systemDesignGuides} frontend system design guides, the ${CATALOG.studyPlans} guided study plans, company-tagged questions and filtering across ${CATALOG.companies} companies, and the Build in Public & Open Source playbook. There is one Premium tier — every plan below unlocks exactly the same content.`,
  },
  {
    id: "free-tier",
    question: "Is there anything I can use for free?",
    answer:
      "Yes, and it isn't a token amount. The Understand tab of every concept is free forever, roughly 60% of the coding challenges and interview questions are free, and roadmaps, the playground, the leaderboard, XP and streaks are all free. Premium unlocks the rest — it doesn't turn the lights on.",
  },
  {
    id: "which-plan",
    question: "Which plan should I pick?",
    answer: `If you're interviewing in the next few weeks, Monthly at ${formatUsd(MONTHLY_LIST_PRICE_USD)} is the least commitment. If you're preparing over a season, Quarterly or Annual cost meaningfully less per month for the same access. Lifetime makes sense if you expect to come back for future interviews — it costs less than ${LIFETIME_BREAK_EVEN_MONTHS} months of the monthly plan and then never charges you again.`,
  },
  {
    id: "lifetime-meaning",
    question: 'What does "lifetime" actually mean?',
    answer: `One payment of ${formatUsd(LIFETIME_PLAN.price)}, no renewal, no expiry date. Your access covers everything premium on the platform today plus everything premium we ship later — new questions, new challenges, new guides — with nothing further to pay.`,
  },
  {
    id: "renewal",
    question: "Do the subscription plans renew automatically?",
    answer:
      "That's how Monthly, Quarterly and Annual are designed to work: renew automatically at the end of each cycle, with cancellation available any time from your account, keeping Premium until the cycle you've already paid for runs out. Checkout and billing aren't live yet, so nothing renews or charges today — this is the behavior once that ships. Lifetime never renews either way — there's nothing to cancel.",
  },
  {
    id: "after-expiry",
    question: "What happens when my subscription ends?",
    answer:
      "Premium content locks again, but nothing you've done is lost. Your progress, completed challenges, XP, streaks, bookmarks and spaced-repetition schedule all stay exactly where they were, and resubscribing later picks up from there rather than starting you over.",
  },
  {
    id: "new-content",
    question: "Do I get content added after I subscribe?",
    answer:
      "Yes. Anything we add while your access is active is included at no extra cost — there's no separate charge for new collections, guides or challenge packs. Lifetime holders keep getting new premium content indefinitely.",
  },
  {
    id: "sharing",
    question: "Can I share my account with a friend?",
    answer:
      "Premium is for one person. Sessions are tracked per device, so a shared login shows up as concurrent sessions from different places — and you can see and revoke every active session yourself under Settings → Security.",
  },
  {
    id: "expensing",
    question: "Can I expense this through my employer?",
    answer:
      "Many companies cover interview preparation and upskilling under a learning and development budget. Premium is a standard software purchase, and once checkout is live you'll get a receipt for it, which is usually all an expense claim needs.",
  },
];

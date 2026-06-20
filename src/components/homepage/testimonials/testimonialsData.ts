import type { ComponentType } from "react";

import { AmazonLogo } from "@/components/shared/logos/AmazonLogo";
import { AnthropicLogo } from "@/components/shared/logos/AnthropicLogo";
import { CursorLogo } from "@/components/shared/logos/CursorLogo";
import { GoogleLogo } from "@/components/shared/logos/GoogleLogo";
import { MetaLogo } from "@/components/shared/logos/MetaLogo";
import { MicrosoftLogo } from "@/components/shared/logos/MicrosoftLogo";
import { StripeLogo } from "@/components/shared/logos/StripeLogo";

export type AvatarColor = "accent" | "info" | "premium" | "success" | "streak";

export type Testimonial = {
  id: string;
  Logo: ComponentType<{ className?: string }>;
  company: string;
  date: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatarColor: AvatarColor;
  otherOffer?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "sarah-chen",
    Logo: GoogleLogo,
    company: "Google",
    date: "Mar 2026",
    quote:
      "I'd read about the event loop a dozen times and never really got it until I watched the simulator step through microtasks vs. the task queue. That same mental model is what got me through the system design round — FF System Design covers almost exactly what they asked.",
    name: "Sarah Chen",
    role: "Software Engineer",
    location: "Toronto, Canada",
    avatarColor: "accent",
    otherOffer: "Shopify",
  },
  {
    id: "david-okafor",
    Logo: MetaLogo,
    company: "Meta",
    date: "Nov 2025",
    quote:
      "The Build tab is what set my portfolio apart. I shipped a working Kanban board instead of another to-do list, and it became the centerpiece of every interview conversation.",
    name: "David Okafor",
    role: "Frontend Engineer",
    location: "Lagos, Nigeria",
    avatarColor: "info",
  },
  {
    id: "priya-patel",
    Logo: AmazonLogo,
    company: "Amazon",
    date: "Jan 2026",
    quote:
      "What got me hired wasn't memorizing answers — it was the spaced repetition review queue. By the time my interview loop came around, the FF System Design questions I'd struggled with weeks earlier were second nature.",
    name: "Priya Patel",
    role: "Senior Frontend Engineer",
    location: "Bangalore, India",
    avatarColor: "premium",
    otherOffer: "Atlassian",
  },
  {
    id: "jordan-lee",
    Logo: MicrosoftLogo,
    company: "Microsoft",
    date: "Aug 2025",
    quote:
      "The React Rendering simulator finally made reconciliation click for me — watching exactly which nodes re-render and why was worth more than any blog post I'd read on the virtual DOM.",
    name: "Jordan Lee",
    role: "Software Engineer II",
    location: "Seattle, USA",
    avatarColor: "success",
  },
  {
    id: "mateus-silva",
    Logo: StripeLogo,
    company: "Stripe",
    date: "Feb 2026",
    quote:
      "The exact virtualized-list challenge from the Challenge tab came up almost word-for-word in my onsite. I'd already solved it twice before walking in.",
    name: "Mateus Silva",
    role: "Frontend Engineer",
    location: "São Paulo, Brazil",
    avatarColor: "streak",
  },
  {
    id: "emily-park",
    Logo: AnthropicLogo,
    company: "Anthropic",
    date: "Jun 2025",
    quote:
      "I went through all of FF 75 and the Browser Pipeline simulator twice before my interviews. Being able to actually explain the rendering pipeline stage by stage, instead of just naming the steps, is what made my answers stand out.",
    name: "Emily Park",
    role: "Frontend Engineer",
    location: "San Francisco, USA",
    avatarColor: "accent",
  },
  {
    id: "aisha-mohammed",
    Logo: CursorLogo,
    company: "Cursor",
    date: "Oct 2025",
    quote:
      "FF JavaScript is what closed the gaps in my fundamentals. Closures and hoisting had always felt like syntax I'd memorized rather than understood — the question explanations finally gave me the 'why' I could actually defend live.",
    name: "Aisha Mohammed",
    role: "Frontend Engineer",
    location: "Cairo, Egypt",
    avatarColor: "info",
  },
  {
    id: "tom-becker",
    Logo: GoogleLogo,
    company: "Google",
    date: "Dec 2025",
    quote:
      "The CSS Specificity simulator made selector weight calculation click in a way years of trial-and-error in DevTools never did. It came up almost immediately in my live coding round.",
    name: "Tom Becker",
    role: "Frontend Engineer",
    location: "Berlin, Germany",
    avatarColor: "premium",
  },
  {
    id: "hana-kim",
    Logo: StripeLogo,
    company: "Stripe",
    date: "May 2025",
    quote:
      "I solved the debounce and throttle challenges in Practice weeks before my take-home — when the assignment turned out to be nearly the same problem, I already had the edge cases memorized.",
    name: "Hana Kim",
    role: "Software Engineer",
    location: "Seoul, South Korea",
    avatarColor: "success",
    otherOffer: "Coupang",
  },
  {
    id: "lucas-rocha",
    Logo: AmazonLogo,
    company: "Amazon",
    date: "Apr 2026",
    quote:
      "FF React's deep dive into reconciliation is what carried my system design round. They asked how I'd minimize re-renders in a large component tree, and I'd already simulated exactly that scenario.",
    name: "Lucas Rocha",
    role: "Senior Frontend Engineer",
    location: "Lisbon, Portugal",
    avatarColor: "streak",
  },
  {
    id: "grace-adeyemi",
    Logo: MetaLogo,
    company: "Meta",
    date: "Sep 2025",
    quote:
      "Building a component library in the Build tab gave me something real to walk through in interviews, instead of describing a project from memory. It was the single most-discussed thing in every onsite.",
    name: "Grace Adeyemi",
    role: "Frontend Engineer",
    location: "Accra, Ghana",
    avatarColor: "accent",
  },
  {
    id: "noah-fischer",
    Logo: MicrosoftLogo,
    company: "Microsoft",
    date: "Jul 2025",
    quote:
      "The streak system is the only reason I stuck with prep for four straight months instead of burning out after two weeks. By the time interviews actually started, I'd been through every FF 75 question more than once.",
    name: "Noah Fischer",
    role: "Software Engineer II",
    location: "Austin, USA",
    avatarColor: "info",
  },
];

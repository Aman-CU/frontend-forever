import type { ComponentType } from "react";

import { AmazonLogo } from "@/components/shared/logos/AmazonLogo";
import { AnthropicLogo } from "@/components/shared/logos/AnthropicLogo";
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
];

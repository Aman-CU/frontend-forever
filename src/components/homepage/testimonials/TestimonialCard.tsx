"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AvatarColor, Testimonial } from "@/components/homepage/testimonials/testimonialsData";

const AVATAR_CLASSES: Record<AvatarColor, string> = {
  accent: "bg-accent-light text-accent",
  info: "bg-info-light text-info",
  premium: "bg-premium-light text-premium",
  success: "bg-success-light text-success",
  streak: "bg-streak-light text-streak",
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

type TestimonialCardProps = {
  testimonial: Testimonial;
  delay?: number;
};

export function TestimonialCard({ testimonial, delay = 0 }: TestimonialCardProps) {
  const { id, Logo, company, date, quote, name, role, location, avatarColor, otherOffer } =
    testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className="flex w-full flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo className="h-4 w-auto text-text-primary" />
          <span className="text-sm font-medium text-text-secondary">Offer from {company}</span>
        </div>
        <span className="text-xs text-text-muted">{date}</span>
      </div>

      <p className="text-sm leading-relaxed text-text-primary">{quote}</p>

      <div className="flex items-center gap-3 border-t border-border-light pt-4">
        <Avatar size="lg">
          <AvatarImage src={`/avatars/testimonials/${id}.jpg`} alt={name} />
          <AvatarFallback className={cn("font-semibold", AVATAR_CLASSES[avatarColor])}>
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-primary">{name}</span>
          <span className="text-xs text-text-secondary">
            {role}, {location}
          </span>
          {otherOffer && (
            <span className="text-xs text-text-muted">Other offers: {otherOffer}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

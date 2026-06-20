"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative isolate w-full overflow-hidden bg-accent-darker"
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-16 size-72 rounded-full bg-accent opacity-20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -right-16 size-80 rounded-full bg-accent-light opacity-10 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center md:px-8 md:py-28">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full bg-accent-foreground/10 px-4 py-1.5 text-xs font-medium text-accent-foreground md:text-sm"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Free to start, no credit card required</span>
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mt-6 text-3xl font-bold leading-tight text-accent-foreground sm:text-4xl md:text-5xl"
        >
          Start learning for free
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-4 max-w-xl text-base text-accent-foreground/80 md:text-lg"
        >
          Join thousands of developers learning frontend concepts the way they
          actually show up in interviews — by simulating, building, and
          practicing them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          className="mt-8"
        >
          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "h-auto gap-2 bg-accent-foreground px-6 py-3 text-base font-semibold text-accent-darker hover:bg-accent-foreground/90",
            )}
          >
            Get Started
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

"use client";

import { motion } from "framer-motion";

import { PLATFORM_FEATURES } from "@/features/pricing/lib/catalog";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function PricingFeaturesSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-6 py-16 md:px-8 md:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl"
      >
        What your access actually covers
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        className="mt-4 max-w-2xl text-base text-text-secondary"
      >
        Not a bundle of things we plan to build — every item below is on the platform right
        now, and Premium is what opens the locked half of it.
      </motion.p>

      <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: 0.05 * (index % 3), ease: EASE }}
              className="flex flex-col"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-border text-text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

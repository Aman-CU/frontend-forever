"use client";

import { motion } from "framer-motion";

import { TestimonialCard } from "@/components/homepage/testimonials/TestimonialCard";
import { TESTIMONIALS, type Testimonial } from "@/components/homepage/testimonials/testimonialsData";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const COLUMN_COUNT = 3;

function splitIntoColumns(items: Testimonial[], columnCount: number): Testimonial[][] {
  const columns: Testimonial[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export function TestimonialsSection() {
  const columns = splitIntoColumns(TESTIMONIALS, COLUMN_COUNT);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 md:px-8 md:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-3xl font-bold leading-tight text-text-primary sm:text-4xl md:text-5xl"
      >
        <span className="block">1M+ developers trust us</span>
        <span className="block text-text-secondary">with their job interviews.</span>
      </motion.h2>

      <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {column.map((testimonial, itemIndex) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                delay={0.08 * (itemIndex * COLUMN_COUNT + columnIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

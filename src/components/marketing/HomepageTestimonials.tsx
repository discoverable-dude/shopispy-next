"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeInView } from "@/components/motion";

const testimonials = [
  {
    quote:
      "ShopiSpy helped us stay competitive with real-time price tracking. We adjusted our strategy and saw a 47% increase in sales.",
    name: "Sarah Johnson",
    role: "eCommerce Manager",
    company: "Fashion Forward",
    rating: 5,
  },
  {
    quote:
      "Getting instant alerts when competitors change prices has been invaluable. We react quickly and maintain our market position.",
    name: "Mike Chen",
    role: "Founder",
    company: "TechGadgets",
    rating: 5,
  },
  {
    quote:
      "The ability to track multiple competitor stores and export product data has transformed how we approach pricing.",
    name: "Emma Rodriguez",
    role: "Marketing Director",
    company: "HomeDecor Plus",
    rating: 5,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function HomepageTestimonials() {
  const [[current, direction], setCurrent] = useState([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setCurrent(([prev]) => {
        const next =
          (prev + dir + testimonials.length) % testimonials.length;
        return [next, dir];
      });
    },
    []
  );

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const t = testimonials[current];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by ecommerce teams
          </h2>
        </FadeInView>

        <div className="relative mt-14">
          {/* Card */}
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background p-8 sm:p-10">
            {/* Quote icon */}
            <Quote className="absolute top-5 left-5 h-8 w-8 text-primary/15" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {/* Stars */}
                <div className="flex justify-center gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="mt-6 text-center text-lg leading-relaxed text-foreground sm:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Avatar + info */}
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => paginate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setCurrent(([prev]) => [i, i > prev ? 1 : -1])
                  }
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

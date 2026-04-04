"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { FadeInView } from "@/components/motion";

const testimonials = [
  {
    quote:
      "ShopiSpy helped us stay competitive with real-time price tracking. We adjusted our strategy and saw a 47% increase in sales.",
    name: "Sarah Johnson",
    role: "eCommerce Manager",
    company: "Fashion Forward",
  },
  {
    quote:
      "Getting instant alerts when competitors change prices has been invaluable. We react quickly and maintain our market position.",
    name: "Mike Chen",
    role: "Founder",
    company: "TechGadgets",
  },
  {
    quote:
      "The ability to track multiple competitor stores and export product data has transformed how we approach pricing.",
    name: "Emma Rodriguez",
    role: "Marketing Director",
    company: "HomeDecor Plus",
  },
];

export function HomepageTestimonials() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by ecommerce teams
          </h2>
        </FadeInView>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="rounded-xl border border-border/60 bg-background p-6"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

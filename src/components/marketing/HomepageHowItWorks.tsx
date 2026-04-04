"use client";

import { motion } from "framer-motion";
import { FadeInView } from "@/components/motion";

const steps = [
  {
    number: "01",
    title: "Enter a store URL",
    description: "Paste any Shopify store URL. We detect the store automatically — no setup needed.",
  },
  {
    number: "02",
    title: "We scan every product",
    description: "ShopiSpy pulls the full catalog — titles, prices, variants, images, vendors — in seconds.",
  },
  {
    number: "03",
    title: "Track & get alerted",
    description: "Save stores to your dashboard. Get email or Slack alerts when prices change or new products launch.",
  },
];

export function HomepageHowItWorks() {
  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to competitive intelligence
          </h2>
        </FadeInView>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          className="mt-16 grid gap-12 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="relative"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-6 hidden h-px w-12 translate-x-full bg-border md:block" />
              )}

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold text-primary shadow-sm">
                {step.number}
              </div>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

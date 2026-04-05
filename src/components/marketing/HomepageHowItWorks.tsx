"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, Bell, ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/motion";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Enter any store URL",
    description: "Paste a Shopify store URL. We auto-detect the platform and start scanning — no API keys, no setup.",
    detail: (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">gymshark.com</span>
        </div>
        <div className="mt-3 flex gap-2">
          {["gymshark.com", "allbirds.com", "fashionnova.com"].map((d) => (
            <span key={d} className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">{d}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Database,
    title: "We scan every product",
    description: "Full catalog extraction — titles, prices, variants, images, vendors, inventory status. All in under 10 seconds.",
    detail: (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Scanning gymshark.com...</span>
          <span className="text-primary font-mono">2,847 found</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Products, prices, variants</span>
          <span>Complete</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Bell,
    title: "Track & get alerted",
    description: "Save stores to your dashboard. Set up price alerts, new product notifications — via email, Slack, or webhook.",
    detail: (
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
        {[
          { text: "Price drop: Vital Seamless Crop Top -12%", type: "alert" },
          { text: "3 new products added to Allbirds", type: "new" },
          { text: "Weekly competitor report ready", type: "report" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <span className={`h-1.5 w-1.5 rounded-full ${
              item.type === "alert" ? "bg-amber-500" : item.type === "new" ? "bg-primary" : "bg-blue-500"
            }`} />
            <span className="text-[11px]">{item.text}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HomepageHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 px-6 bg-muted/20 bg-grid-subtle">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to competitive intelligence
          </h2>
        </FadeInView>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr,1fr] lg:gap-12 items-start">
          {/* Left: Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`w-full rounded-xl border p-5 text-left transition-all ${
                  activeStep === index
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-transparent hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    activeStep === index
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border bg-muted/50 text-muted-foreground"
                  }`}>
                    <step.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{step.number}</span>
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Interactive visual */}
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {steps[activeStep].detail}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

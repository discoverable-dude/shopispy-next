"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Search, Database, Bell } from "lucide-react";
import { FadeInView } from "@/components/motion";
import { ALL_BRANDS, TOTAL_PRODUCTS, VERTICALS } from "@/lib/brands";
import { Card, CardContent } from "@/components/ui/card";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / 120;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const steps = [
  {
    icon: Search, number: "01", title: "Paste a store URL",
    description: "Enter any Shopify store. We auto-detect and start scanning instantly.",
    visual: (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">gymshark.com</span>
      </div>
    ),
  },
  {
    icon: Database, number: "02", title: "We scan everything",
    description: "Full catalog — products, prices, variants, images — in under 10 seconds.",
    visual: (
      <div className="space-y-2">
        <div className="flex justify-between text-[10px]">
          <span>Scanning...</span>
          <span className="text-primary font-mono">2,847 found</span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>
    ),
  },
  {
    icon: Bell, number: "03", title: "Track & get alerted",
    description: "Save stores. Get price drop and new product alerts via email, Slack, or webhook.",
    visual: (
      <div className="space-y-1.5">
        {[
          { text: "Price drop: Crop Top -12%", color: "bg-amber-500" },
          { text: "3 new products added", color: "bg-primary" },
        ].map((a) => (
          <div key={a.text} className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${a.color}`} />
            <span className="text-[10px]">{a.text}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HomepageStatsAndProcess() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance steps
  useEffect(() => {
    const timer = setInterval(() => setActiveStep((s) => (s + 1) % steps.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left: Stats + social proof */}
          <FadeInView>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">Trusted by 10,000+ brands</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                The numbers speak for themselves
              </h2>
              <p className="mt-4 text-muted-foreground">
                From solo merchants to enterprise teams — ShopiSpy powers competitive intelligence
                for Shopify brands worldwide.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { value: ALL_BRANDS.length, suffix: " stores", label: "Brands tracked" },
                  { value: TOTAL_PRODUCTS, suffix: "+", label: "Products scanned" },
                  { value: VERTICALS.length, suffix: " verticals", label: "Industries covered" },
                  { value: 99, suffix: ".9%", label: "Uptime SLA" },
                ].map((stat) => (
                  <Card key={stat.label} className="rounded-xl border-border/60 bg-muted/20">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold tracking-tight">
                        <Counter end={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Right: How it works */}
          <FadeInView delay={0.1}>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">How it works</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Intelligence in three steps
              </h2>

              <div className="mt-8 space-y-1">
                {steps.map((step, index) => (
                  <button
                    key={step.number}
                    onClick={() => setActiveStep(index)}
                    className={`w-full rounded-xl px-4 py-3.5 text-left transition-all ${
                      activeStep === index
                        ? "border border-primary/20 bg-primary/5"
                        : "border border-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs transition-colors ${
                        activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <step.icon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{step.number}</span>
                          <h3 className="text-sm font-semibold">{step.title}</h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>

                        {/* Inline visual for active step */}
                        <AnimatePresence>
                          {activeStep === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3"
                            >
                              {step.visual}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Progress bar for active step */}
                    {activeStep === index && (
                      <motion.div
                        className="mt-2 ml-11 h-0.5 rounded-full bg-primary/20 overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4, ease: "linear" }}
                          key={`progress-${index}-${activeStep}`}
                        />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

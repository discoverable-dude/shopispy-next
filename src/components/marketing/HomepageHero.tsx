"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Database, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const liveFeedItems = [
  { text: "Gymshark dropped prices on 12 items", time: "2m ago" },
  { text: "Allbirds added 3 new products", time: "5m ago" },
  { text: "SKIMS price alert triggered", time: "8m ago" },
  { text: "Fashion Nova clearance detected", time: "12m ago" },
  { text: "Glossier launched new collection", time: "15m ago" },
];

const steps = [
  {
    icon: Search, number: "01", title: "Paste a store URL",
    description: "Enter any Shopify store. We detect it instantly — no setup needed.",
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
    description: "Save stores. Get price alerts via email, Slack, or webhook.",
    visual: (
      <div className="space-y-1.5">
        {[
          { text: "Price drop: Crop Top -12%", color: "bg-amber-500" },
          { text: "3 new products added", color: "bg-primary" },
        ].map((a) => (
          <div key={a.text} className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Badge variant="secondary" className="h-1.5 w-1.5 rounded-full p-0 border-0" style={{ backgroundColor: a.color === "bg-amber-500" ? "rgb(245 158 11)" : "hsl(var(--primary))" }} />
            <span className="text-[10px]">{a.text}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HomepageHero() {
  const [feedIndex, setFeedIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const feedTimer = setInterval(() => setFeedIndex((i) => (i + 1) % liveFeedItems.length), 3000);
    const stepTimer = setInterval(() => setActiveStep((s) => (s + 1) % steps.length), 4000);
    return () => { clearInterval(feedTimer); clearInterval(stepTimer); };
  }, []);

  return (
    <section className="relative overflow-hidden pb-12 pt-20 sm:pt-28">
      <div className="absolute inset-0 bg-dot-pattern mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ─── Left: Copy ─── */}
          <div>
            {/* Live ticker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex"
            >
              <Badge variant="secondary" className="inline-flex items-center gap-3 rounded-full border border-border bg-background/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm font-normal">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <motion.span
                  key={feedIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  {liveFeedItems[feedIndex].text}
                  <span className="ml-1.5 text-muted-foreground/40">{liveFeedItems[feedIndex].time}</span>
                </motion.span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Know what your competitors do{" "}
              <span className="text-gradient">before they do it</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Track prices, monitor new products, and get instant alerts across
              every Shopify store in your market.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild className="h-11 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                <Link href="/scraper" className="group">
                  Try it free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl">
                <Link href="/pricing">
                  View pricing
                </Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3.5 text-xs text-muted-foreground"
            >
              No credit card &middot; Free plan forever &middot; Setup in 30s
            </motion.p>
          </div>

          {/* ─── Right: How It Works stepper ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mt-12 rounded-2xl bg-background/80 shadow-lg shadow-black/[0.03] backdrop-blur-sm lg:mt-12">
              <CardContent className="p-6">
                <p className="text-[10px] font-medium uppercase tracking-widest text-primary mb-4">How it works</p>

                <div className="space-y-1">
                  {steps.map((step, index) => (
                    <button
                      key={step.number}
                      onClick={() => setActiveStep(index)}
                      className={`w-full rounded-xl px-3.5 py-3 text-left transition-all ${
                        activeStep === index
                          ? "border border-primary/20 bg-primary/5"
                          : "border border-transparent hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs transition-colors ${
                          activeStep === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <step.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-muted-foreground">{step.number}</span>
                            <h3 className="text-xs font-semibold">{step.title}</h3>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{step.description}</p>

                          <AnimatePresence>
                            {activeStep === index && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2.5"
                              >
                                {step.visual}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {activeStep === index && (
                        <div className="mt-2 ml-10 h-0.5 rounded-full bg-primary/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4, ease: "linear" }}
                            key={`prog-${index}-${activeStep}`}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

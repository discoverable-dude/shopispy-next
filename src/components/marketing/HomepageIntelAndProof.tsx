"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Shirt, Sparkles, Coffee, Home, Cpu, Dumbbell, Gem, Bike, Dog, Baby } from "lucide-react";
import { VERTICALS } from "@/lib/brands";
import { FadeInView } from "@/components/motion";
import { BrandIcon } from "@/components/marketing/BrandIcon";

const VERTICAL_ICONS: Record<string, React.ReactNode> = {
  fashion: <Shirt className="h-3 w-3" />,
  beauty: <Sparkles className="h-3 w-3" />,
  home: <Home className="h-3 w-3" />,
  food: <Coffee className="h-3 w-3" />,
  electronics: <Cpu className="h-3 w-3" />,
  sports: <Dumbbell className="h-3 w-3" />,
  kids: <Baby className="h-3 w-3" />,
  pets: <Dog className="h-3 w-3" />,
  fitness: <Dumbbell className="h-3 w-3" />,
  jewellery: <Gem className="h-3 w-3" />,
  mobility: <Bike className="h-3 w-3" />,
};

const testimonials = [
  {
    quote: "ShopiSpy helped us stay competitive with real-time price tracking. We adjusted our strategy and saw a 47% increase in sales.",
    name: "Sarah J.", role: "eCommerce Manager", company: "Fashion Forward",
  },
  {
    quote: "Instant alerts when competitors change prices has been invaluable. We react quickly and maintain our market position.",
    name: "Mike C.", role: "Founder", company: "TechGadgets",
  },
  {
    quote: "Tracking multiple stores and exporting product data has transformed how we approach pricing. Game changer.",
    name: "Emma R.", role: "Marketing Director", company: "HomeDecor Plus",
  },
];

export function HomepageIntelAndProof() {
  const [activeVertical, setActiveVertical] = useState(VERTICALS[0].id);
  const active = VERTICALS.find((v) => v.id === activeVertical)!;
  // Show top 4 brands per vertical
  const displayBrands = active.brands.slice(0, 4);

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        <FadeInView className="text-center mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Intelligence &amp; proof</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See the data. Hear from the brands.
          </h2>
        </FadeInView>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:gap-12">
          {/* Left: Live intelligence */}
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">Live brand tracking</h3>
              <div className="flex flex-wrap gap-1">
                {VERTICALS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVertical(v.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                      activeVertical === v.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {VERTICAL_ICONS[v.id]}
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeVertical}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-2"
              >
                {displayBrands.map((brand) => (
                  <div
                    key={brand.name}
                    className="group flex items-center justify-between rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <BrandIcon name={brand.name} domain={brand.domain} size="md" />
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.products} products</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{brand.latestChange}</p>
                      <p className="text-[10px] text-muted-foreground">{brand.lastUpdate} ago</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              Tracking {active.brands.length} brands in {active.label} &mdash; updated continuously
            </p>
          </div>

          {/* Right: Testimonials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">What teams say</h3>
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border/60 bg-background p-5 transition-colors hover:border-primary/10"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

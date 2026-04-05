"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Shirt, Sparkles, Coffee, Dumbbell, Home, Smartphone } from "lucide-react";
import { FadeInView } from "@/components/motion";

// ── Testimonials data ──
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

// ── Brand intel data (compact) ──
const verticals = [
  { id: "fashion", label: "Fashion", icon: <Shirt className="h-3 w-3" />,
    brands: [
      { name: "Gymshark", products: "2,847", lastUpdate: "2h", change: "-12% on 4 items" },
      { name: "SKIMS", products: "1,923", lastUpdate: "4h", change: "3 new products" },
      { name: "Allbirds", products: "412", lastUpdate: "6h", change: "Price increase +5%" },
    ],
  },
  { id: "beauty", label: "Beauty", icon: <Sparkles className="h-3 w-3" />,
    brands: [
      { name: "Fenty Beauty", products: "1,241", lastUpdate: "1h", change: "New collection" },
      { name: "Glossier", products: "312", lastUpdate: "8h", change: "-8% on skincare" },
      { name: "ColourPop", products: "3,891", lastUpdate: "2h", change: "Disney collab" },
    ],
  },
  { id: "food", label: "Food", icon: <Coffee className="h-3 w-3" />,
    brands: [
      { name: "Liquid Death", products: "156", lastUpdate: "5h", change: "New flavour" },
      { name: "Huel", products: "178", lastUpdate: "4h", change: "Price drop -10%" },
      { name: "AG1", products: "34", lastUpdate: "2d", change: "Bundle update" },
    ],
  },
  { id: "fitness", label: "Fitness", icon: <Dumbbell className="h-3 w-3" />,
    brands: [
      { name: "Alo Yoga", products: "2,156", lastUpdate: "2h", change: "14 new items" },
      { name: "Bombas", products: "1,234", lastUpdate: "4h", change: "-6% on socks" },
      { name: "MVMT", products: "456", lastUpdate: "6h", change: "New launch" },
    ],
  },
];

export function HomepageIntelAndProof() {
  const [activeVertical, setActiveVertical] = useState("fashion");
  const active = verticals.find((v) => v.id === activeVertical)!;

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        <FadeInView className="text-center mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Intelligence & proof</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See the data. Hear from the brands.
          </h2>
        </FadeInView>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:gap-12">
          {/* Left: Live intelligence */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Live brand tracking</h3>
              <div className="flex gap-1">
                {verticals.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVertical(v.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                      activeVertical === v.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {v.icon}
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
                {active.brands.map((brand) => (
                  <div
                    key={brand.name}
                    className="group flex items-center justify-between rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-xs font-bold text-primary">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.products} products</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{brand.change}</p>
                      <p className="text-[10px] text-muted-foreground">{brand.lastUpdate} ago</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              Tracking 36+ brands across 6 verticals &mdash; updated continuously
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

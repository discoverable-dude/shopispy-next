"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, TrendingUp, Download, BarChart3, Zap, ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Search, title: "Price tracking", span: "md:col-span-2 md:row-span-2",
    description: "Monitor competitor prices across every product in real-time. See price history, identify trends, and know exactly when to adjust your own pricing.",
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { product: "Running Shorts", price: "\u00a328", change: -12, bar: 65 },
          { product: "Training Tee", price: "\u00a322", change: -8, bar: 45 },
          { product: "Sports Bra", price: "\u00a332", change: +5, bar: 78 },
        ].map((item) => (
          <div key={item.product} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{item.product}</span>
                <span className="text-xs font-bold">{item.price}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-border">
                  <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${item.bar}%` }} />
                </div>
                <span className={`text-[10px] font-medium ${item.change < 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {item.change > 0 ? "+" : ""}{item.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Bell, title: "Instant alerts", span: "md:col-span-1",
    description: "Email, Slack, or webhook — get notified the moment something changes.",
    visual: (
      <div className="mt-3 space-y-2">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-[10px] font-medium text-amber-800 dark:text-amber-400">Price dropped 15%</p>
          <p className="text-[9px] text-amber-600 dark:text-amber-500">Gymshark &middot; 2m ago</p>
        </div>
        <div className="rounded-md border border-primary/20 bg-primary/5 p-2">
          <p className="text-[10px] font-medium text-primary">3 new products</p>
          <p className="text-[9px] text-muted-foreground">Allbirds &middot; 1h ago</p>
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp, title: "New product discovery", span: "md:col-span-1",
    description: "Know instantly when competitors launch new products or update their catalog.",
    visual: (
      <div className="mt-3 flex items-center gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-12 rounded-lg bg-muted animate-float" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-primary/30 text-primary">
          <span className="text-lg font-light">+</span>
        </div>
      </div>
    ),
  },
  {
    icon: Download, title: "Export anything", span: "md:col-span-1",
    description: "CSV, Excel, or JSON. Download full competitor catalogs for offline analysis.",
    visual: null,
  },
  {
    icon: BarChart3, title: "Analytics dashboard", span: "md:col-span-1",
    description: "Pricing trends, inventory levels, and competitive positioning in one view.",
    visual: null,
  },
  {
    icon: Zap, title: "Works in seconds", span: "md:col-span-2",
    description: "Paste any Shopify URL. Get every product, variant, and price — no signup, no setup, no waiting.",
    visual: (
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">gymshark.com</span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">2,847 products found</span>
      </div>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HomepageFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Capabilities</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to win on pricing
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            From real-time monitoring to automated alerts — all the competitive intelligence tools your team needs.
          </p>
        </FadeInView>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-4 md:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={feature.span}
            >
              <Card className="group relative h-full overflow-hidden rounded-2xl border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                {/* Hover glow */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.02]"
                    />
                  )}
                </AnimatePresence>

                <CardHeader className="relative pb-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                    <feature.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  {feature.visual}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

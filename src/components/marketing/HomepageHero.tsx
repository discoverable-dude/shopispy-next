"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Search, Bell, TrendingDown, Package } from "lucide-react";

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

const liveFeedItems = [
  { text: "Gymshark dropped prices on 12 items", time: "2m ago" },
  { text: "Allbirds added 3 new products", time: "5m ago" },
  { text: "SKIMS price alert triggered", time: "8m ago" },
  { text: "Fashion Nova clearance detected", time: "12m ago" },
  { text: "Glossier launched new collection", time: "15m ago" },
];

export function HomepageHero() {
  const [feedIndex, setFeedIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFeedIndex((i) => (i + 1) % liveFeedItems.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [3, -3]);
  const rotateY = useTransform(springX, [-300, 300], [-3, 3]);

  return (
    <section
      className="relative overflow-hidden pb-8 pt-20 sm:pt-28"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
    >
      <div className="absolute inset-0 bg-dot-pattern mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr,1fr] lg:gap-16">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-background/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
            >
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
              <Link
                href="/scraper"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
              >
                Try it free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View pricing
              </Link>
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

          {/* Right: Interactive mini-dashboard card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ rotateX, rotateY, perspective: 1200 }}
          >
            <div className="relative rounded-2xl border border-border bg-background p-5 shadow-xl shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl animate-shimmer" />

              <div className="relative space-y-3">
                {/* Search mock */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">gymshark.com</span>
                  <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Live</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Products", value: 2847 },
                    { label: "Avg Price", value: 42, prefix: "\u00a3" },
                    { label: "New Today", value: 7 },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-2.5 text-center">
                      <p className="text-base font-bold">{s.prefix}<AnimatedNumber value={s.value} /></p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Product rows */}
                {[
                  { name: "Vital Seamless Crop Top", price: "\u00a328", tag: "-12%", tagColor: "text-red-600 bg-red-500/10" },
                  { name: "Apex Joggers", price: "\u00a345", tag: "New", tagColor: "text-primary bg-primary/10" },
                  { name: "Training T-Shirt", price: "\u00a322", tag: "-8%", tagColor: "text-red-600 bg-red-500/10" },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-muted animate-float" style={{ animationDelay: `${i * 0.4}s` }} />
                      <div>
                        <p className="text-[11px] font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.price}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${item.tagColor}`}>{item.tag}</span>
                  </motion.div>
                ))}

                {/* Alert */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-600" />
                  <div>
                    <p className="text-[10px] font-medium text-amber-900 dark:text-amber-400">Price Drop Alert</p>
                    <p className="text-[9px] text-amber-700 dark:text-amber-500">3 items reduced in the last hour</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

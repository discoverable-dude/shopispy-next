"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Search, Bell, TrendingDown, Package } from "lucide-react";

// Animated counter
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

// Simulated live feed items
const liveFeedItems = [
  { icon: TrendingDown, text: "Gymshark dropped prices on 12 items", time: "2m ago", color: "text-red-500" },
  { icon: Package, text: "Allbirds added 3 new products", time: "5m ago", color: "text-primary" },
  { icon: Bell, text: "SKIMS price alert triggered", time: "8m ago", color: "text-amber-500" },
  { icon: TrendingDown, text: "Fashion Nova clearance detected", time: "12m ago", color: "text-red-500" },
  { icon: Package, text: "Glossier launched new collection", time: "15m ago", color: "text-primary" },
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
  const rotateX = useTransform(springY, [-300, 300], [2, -2]);
  const rotateY = useTransform(springX, [-300, 300], [-2, 2]);

  return (
    <section
      className="relative overflow-hidden pb-20 pt-24 sm:pt-32"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-dot-pattern mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/[0.03] blur-[80px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr,420px] lg:items-center">
          {/* Left: Copy */}
          <div>
            {/* Live feed ticker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <motion.span
                key={feedIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-muted-foreground"
              >
                {liveFeedItems[feedIndex].text}
                <span className="ml-2 text-muted-foreground/50">{liveFeedItems[feedIndex].time}</span>
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
            >
              Know what your{" "}
              <br className="hidden sm:block" />
              competitors do{" "}
              <span className="text-gradient">before they do it</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
            >
              Track prices, monitor new products, and get instant alerts across
              every Shopify store in your market. The competitive edge 10,000+
              brands trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/scraper"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
              >
                Try it free — no signup
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                View pricing
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-xs text-muted-foreground"
            >
              No credit card &middot; Free plan forever &middot; Setup in 30 seconds
            </motion.p>
          </div>

          {/* Right: Interactive card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ rotateX, rotateY, perspective: 1000 }}
            className="hidden lg:block"
          >
            <div className="relative rounded-2xl border border-border bg-background p-5 shadow-2xl shadow-black/5">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl animate-shimmer" />

              {/* Mini dashboard */}
              <div className="relative space-y-4">
                {/* Search bar mock */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">gymshark.com</span>
                  <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Live
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Products", value: 2847 },
                    { label: "Avg. Price", value: 42, prefix: "\u00a3" },
                    { label: "New Today", value: 7 },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <p className="text-lg font-bold">
                        {stat.prefix}<AnimatedNumber value={stat.value} />
                      </p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mock product rows */}
                <div className="space-y-2">
                  {[
                    { name: "Vital Seamless Crop Top", price: "\u00a328", change: "-12%" },
                    { name: "Apex Joggers", price: "\u00a345", change: "New" },
                    { name: "Training T-Shirt", price: "\u00a322", change: "-8%" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-muted animate-float" style={{ animationDelay: `${i * 0.5}s` }} />
                        <div>
                          <p className="text-xs font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.price}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.change === "New"
                          ? "bg-primary/10 text-primary"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {item.change}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Alert notification */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
                >
                  <Bell className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-400">Price Drop Alert</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-500">3 items reduced in the last hour</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard image (mobile + desktop below) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl shadow-black/5">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <Image
              src="/images/hero-dashboard.png"
              alt="ShopiSpy dashboard — competitor price tracking and product monitoring"
              width={1200}
              height={675}
              className="relative w-full"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

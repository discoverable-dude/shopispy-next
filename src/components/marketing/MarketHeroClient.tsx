"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ end, label, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration * 60)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center"
    >
      <span className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </span>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

interface MarketHeroClientProps {
  brandCount: number;
  industryCount: number;
  productCount: number;
}

export function MarketHeroClient({
  brandCount,
  industryCount,
  productCount,
}: MarketHeroClientProps) {
  return (
    <div className="mt-10 grid grid-cols-3 gap-8">
      <AnimatedCounter end={brandCount} label="Brands tracked" suffix="+" />
      <AnimatedCounter end={industryCount} label="Industries" />
      <AnimatedCounter end={productCount} label="Products monitored" />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ALL_BRANDS, TOTAL_PRODUCTS, VERTICALS } from "@/lib/brands";

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export function HomepageStats() {
  const stats = [
    { value: ALL_BRANDS.length, suffix: " stores", label: "Brands tracked" },
    { value: TOTAL_PRODUCTS, suffix: "+", label: "Products monitored" },
    { value: VERTICALS.length, suffix: " verticals", label: "Industries covered" },
    { value: 99, suffix: ".9%", label: "Uptime SLA" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="text-center"
            >
              <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

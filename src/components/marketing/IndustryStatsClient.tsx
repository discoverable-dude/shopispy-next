"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: number;
  formatted: string;
  gradient: string;
}

export function IndustryStatsClient({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <AnimatedStatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}

function AnimatedStatCard({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const target = stat.value;
    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
        setDisplayValue(stat.formatted);
        return;
      }
      setDisplayValue(Math.round(current).toLocaleString());
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, stat.value, stat.formatted]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Card className={`border bg-gradient-to-br ${stat.gradient} to-transparent`}>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
            {displayValue}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

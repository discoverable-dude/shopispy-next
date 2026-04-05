"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface ActivitySegment {
  type: string;
  label: string;
  count: number;
  colorClass: string;
  barColor: string;
}

interface MarketActivityBarProps {
  segments: ActivitySegment[];
  total: number;
}

export function MarketActivityBar({ segments, total }: MarketActivityBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref}>
      {/* Stacked bar */}
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-muted">
        {segments
          .filter((s) => s.count > 0)
          .map((segment, i) => (
            <motion.div
              key={segment.type}
              className={`h-full ${segment.barColor}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(segment.count / total) * 100}%` } : { width: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              title={`${segment.label}: ${segment.count}`}
            />
          ))}
      </div>

      {/* Badge pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {segments
          .filter((s) => s.count > 0)
          .sort((a, b) => b.count - a.count)
          .map((segment) => (
            <Badge
              key={segment.type}
              variant="secondary"
              className={`${segment.colorClass} text-xs`}
            >
              {segment.label}: {segment.count}
            </Badge>
          ))}
      </div>
    </div>
  );
}

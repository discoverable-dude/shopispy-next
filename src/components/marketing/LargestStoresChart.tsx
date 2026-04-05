"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import Link from "next/link";

export interface StoreBar {
  name: string;
  domain: string;
  slug: string;
  products: string;
  count: number;
}

interface LargestStoresChartProps {
  stores: StoreBar[];
  maxCount: number;
}

export function LargestStoresChart({ stores, maxCount }: LargestStoresChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="space-y-2">
      {stores.map((store, i) => (
        <Link
          key={store.name}
          href={`/brands/${store.slug}`}
          className="group flex items-center gap-3"
        >
          <span className="w-5 shrink-0 text-right text-[10px] font-mono text-muted-foreground">
            {i + 1}
          </span>
          <BrandIcon name={store.name} domain={store.domain} size="sm" />
          <span className="w-32 shrink-0 truncate text-sm font-medium group-hover:text-primary transition-colors">
            {store.name}
          </span>
          <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary/70 group-hover:bg-primary transition-colors"
              initial={{ width: 0 }}
              animate={
                inView
                  ? { width: `${(store.count / maxCount) * 100}%` }
                  : { width: 0 }
              }
              transition={{
                duration: 0.7,
                delay: i * 0.06,
                ease: "easeOut",
              }}
            />
          </div>
          <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
            {store.products}
          </span>
        </Link>
      ))}
    </div>
  );
}

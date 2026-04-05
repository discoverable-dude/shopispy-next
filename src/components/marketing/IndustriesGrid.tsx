"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandIcon } from "@/components/marketing/BrandIcon";

interface VerticalData {
  id: string;
  label: string;
  slug: string;
  brandCount: number;
  totalProducts: number;
  recentlyUpdated: number;
  topBrands: { name: string; domain: string }[];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function IndustriesGrid({ verticals }: { verticals: VerticalData[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {verticals.map((v) => (
        <motion.div key={v.id} variants={itemVariants}>
          <Link href={`/industries/${v.slug}`}>
            <Card className="group h-full cursor-pointer rounded-2xl border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {v.label}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{v.brandCount} brands</span>
                  <span className="text-border">&middot;</span>
                  <span>{v.totalProducts.toLocaleString()} products</span>
                </div>

                {/* Active indicator */}
                <div className="mt-3">
                  <Badge variant="secondary" className="gap-1.5 text-[10px]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    {v.recentlyUpdated} active now
                  </Badge>
                </div>

                {/* Brand favicon row */}
                <div className="mt-4 flex items-center gap-1.5">
                  {v.topBrands.map((brand) => (
                    <BrandIcon key={brand.name} name={brand.name} domain={brand.domain} size="sm" />
                  ))}
                  {v.brandCount > 5 && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40 text-[9px] text-muted-foreground">
                      +{v.brandCount - 5}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

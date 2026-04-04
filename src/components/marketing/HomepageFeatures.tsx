"use client";

import { motion } from "framer-motion";
import { Search, BarChart3, Bell, Download, TrendingUp, Zap } from "lucide-react";
import { FadeInView } from "@/components/motion";

const features = [
  {
    icon: Search,
    title: "Track competitor pricing",
    description: "Monitor live prices across competitor stores. See exactly what they charge, updated daily.",
  },
  {
    icon: Bell,
    title: "Instant price alerts",
    description: "Get notified the moment a competitor changes prices — via email, Slack, or webhook.",
  },
  {
    icon: TrendingUp,
    title: "Spot new products",
    description: "Know immediately when competitors launch new products or update their catalog.",
  },
  {
    icon: Download,
    title: "Export full catalogs",
    description: "Download complete product data as CSV, Excel, or JSON for offline analysis.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    description: "Pricing trends, inventory changes, and competitive positioning — all in one view.",
  },
  {
    icon: Zap,
    title: "Works in seconds",
    description: "Enter any Shopify URL. See every product, variant, and price in under 10 seconds.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function HomepageFeatures() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for competitive pricing
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Stop guessing. Start using competitor data to make smarter decisions.
          </p>
        </FadeInView>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-primary/20 hover:bg-muted/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

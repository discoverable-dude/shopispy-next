"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowPulse } from "@/components/motion";

export function HomepageHero() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <motion.div
        className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl space-y-12">
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm"
            >
              Real-Time Competitor Intelligence for Shopify Stores
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          >
            Track Your Competitors&apos;
            <motion.span
              className="mt-2 block bg-gradient-to-r from-primary to-accent bg-clip-text pb-2 text-transparent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Pricing &amp; Products
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Monitor competitor prices in real-time, get instant alerts on changes, and make
            data-driven pricing decisions for your Shopify store.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row"
          >
            <Link href="/scraper">
              <GlowPulse>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl sm:w-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Try It Now - Free
                </Button>
              </GlowPulse>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary/20 px-8 py-6 text-lg hover:border-primary/40 hover:bg-primary/5 sm:w-auto"
              >
                View Pricing
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-4 text-sm text-muted-foreground"
          >
            Try it free &middot; No credit card required &middot; Then start with our free plan
          </motion.p>
        </div>

        {/* Hero Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-16 max-w-6xl"
        >
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-accent opacity-30 blur-lg transition duration-500 group-hover:opacity-50" />
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30 shadow-2xl">
              <Image
                src="/images/hero-dashboard.png"
                alt="ShopiSpy Dashboard - Track competitor prices in real-time"
                width={1200}
                height={675}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-2 pt-8 text-center"
          >
            <h3 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-semibold text-transparent">
              Your Competitor Intelligence Dashboard
            </h3>
            <p className="text-lg text-muted-foreground">
              Monitor competitor stores and track price changes in real-time
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

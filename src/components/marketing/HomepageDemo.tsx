"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/motion";

export function HomepageDemo() {
  return (
    <section className="py-16 px-6">
      <FadeInView className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/30 p-8 text-center sm:p-12">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Try it now
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          See it in action — no signup needed
        </h2>
        <p className="mt-3 text-muted-foreground">
          Enter any Shopify store URL and see their full product catalog, pricing, and
          inventory in seconds.
        </p>
        <Link
          href="/scraper"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Start scraping now
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          Instant results &middot; No credit card &middot; Real competitor data
        </p>
      </FadeInView>
    </section>
  );
}

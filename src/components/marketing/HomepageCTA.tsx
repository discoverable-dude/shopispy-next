"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/motion";

export function HomepageCTA() {
  return (
    <section className="py-24 px-6">
      <FadeInView className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to outsmart your competition?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join thousands of Shopify brands using ShopiSpy to track competitors and
          optimize pricing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/scraper"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Try it free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required &middot; Free plan available &middot; Cancel anytime
        </p>
      </FadeInView>
    </section>
  );
}

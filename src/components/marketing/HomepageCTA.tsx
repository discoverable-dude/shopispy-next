"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/motion";

export function HomepageCTA() {
  return (
    <section className="py-24 px-6">
      <FadeInView>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
          {/* Grid background */}
          <div className="absolute inset-0 bg-grid-subtle opacity-50" />

          <div className="relative px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to outsmart your competition?
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-lg text-muted-foreground">
              Join 10,000+ Shopify brands using ShopiSpy to track competitors, monitor
              pricing, and stay ahead of market changes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/scraper"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
              >
                Start tracking for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                View pricing
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>No credit card required</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Free plan forever</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}

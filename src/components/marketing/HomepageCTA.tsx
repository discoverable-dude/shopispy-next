"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { FadeInView } from "@/components/motion";
import { Button } from "@/components/ui/button";

function PlusIcon({ className }: { className?: string }) {
  return (
    <Plus
      className={`absolute h-6 w-6 text-muted-foreground/40 ${className}`}
      strokeWidth={1}
    />
  );
}

export function HomepageCTA() {
  return (
    <section className="py-24 px-6">
      <FadeInView>
        <div className="mx-auto max-w-4xl">
          {/* Outer wrapper with plus-icon corners and border-y */}
          <div className="relative border-y border-border">
            {/* Plus icons at corners */}
            <PlusIcon className="-top-3 -left-3" />
            <PlusIcon className="-top-3 -right-3" />
            <PlusIcon className="-bottom-3 -left-3" />
            <PlusIcon className="-bottom-3 -right-3" />

            {/* Dashed center vertical line */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-px border-l border-dashed border-border" />

            {/* Radial gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 80% at 25% 0%, hsl(var(--foreground) / .06), transparent)",
              }}
            />

            {/* Content */}
            <div className="relative px-8 py-16 text-center sm:px-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to outsmart your competition?
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-lg text-muted-foreground">
                Track your competitors on Shopify with ShopiSpy — monitor
                pricing, catch new launches, and stay ahead of market changes.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                  <Link href="/scraper" className="group">
                    Start tracking for free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                  <Link href="/pricing">
                    View pricing
                  </Link>
                </Button>
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
        </div>
      </FadeInView>
    </section>
  );
}

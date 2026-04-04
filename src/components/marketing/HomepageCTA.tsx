"use client";

import Link from "next/link";
import { Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeInView } from "@/components/motion";

export function HomepageCTA() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-20 sm:px-6 lg:px-8">
      <FadeInView className="mx-auto max-w-4xl space-y-8 text-center">
        <Badge
          variant="secondary"
          className="border border-primary/30 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 text-sm"
        >
          Start Tracking Competitors Today
        </Badge>
        <h2 className="text-3xl font-bold sm:text-4xl">Stay Ahead of Your Competition</h2>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Monitor competitor pricing in real-time and adjust your strategy instantly with automated
          alerts and insights.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link href="/scraper">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg sm:w-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Try It Now - Free
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary/30 px-8 py-6 text-lg sm:w-auto"
            >
              View Pricing
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-6 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          {["Try before signing up", "Free plan available", "Upgrade anytime"].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {text}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-primary/10 pt-8">
          <p className="text-sm font-medium text-muted-foreground">
            Join 10,000+ Shopify stores already using ShopiSpy for competitor intelligence
          </p>
        </div>
      </FadeInView>
    </section>
  );
}

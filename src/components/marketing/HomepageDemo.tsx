"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeInView } from "@/components/motion";

export function HomepageDemo() {
  return (
    <section className="border-y border-primary/10 bg-gradient-to-r from-primary/5 to-primary/3 px-4 py-16 sm:px-6 lg:px-8">
      <FadeInView className="mx-auto max-w-4xl space-y-8 text-center">
        <Badge
          variant="secondary"
          className="border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium"
        >
          Try It Now - No Signup Required
        </Badge>
        <h2 className="text-3xl font-bold sm:text-4xl">See It In Action</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Enter any competitor&apos;s Shopify store URL and see their product catalog, pricing, and
          inventory in seconds.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/scraper">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-lg text-primary-foreground shadow-lg sm:w-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Scraping Now
            </Button>
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          &#10003; Instant results &middot; &#10003; No credit card needed &middot; &#10003; See
          real competitor data
        </div>
      </FadeInView>
    </section>
  );
}

"use client";

import { BRAND_WORDMARKS } from "@/lib/brands";
import { FadeInView } from "@/components/motion";

export function HomepageLogos() {
  return (
    <section className="overflow-hidden border-y border-border/60 py-6">
      <FadeInView>
        <p className="mb-5 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Tracking intelligence from brands you know
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-marquee whitespace-nowrap">
            {[...BRAND_WORDMARKS, ...BRAND_WORDMARKS].map((brand, i) => (
              <span
                key={`${brand.name}-${i}`}
                className={`mx-5 shrink-0 text-sm text-muted-foreground/30 transition-colors hover:text-foreground sm:mx-7 ${brand.style}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </FadeInView>
    </section>
  );
}

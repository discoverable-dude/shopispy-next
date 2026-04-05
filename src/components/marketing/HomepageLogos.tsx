"use client";

import { FadeInView } from "@/components/motion";

const brands = [
  "Gymshark", "SKIMS", "Allbirds", "Fenty Beauty", "Glossier",
  "Liquid Death", "Alo Yoga", "Brooklinen", "Our Place", "Peak Design",
  "Bombas", "MVMT", "ColourPop", "Ruggable", "Kylie Cosmetics",
  "Steve Madden", "Huel", "Therabody", "Outdoor Voices", "Hydro Flask",
];

export function HomepageLogos() {
  return (
    <section className="overflow-hidden border-y border-border/60 py-8">
      <FadeInView>
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Intelligence from brands you know
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="mx-6 text-sm font-medium text-muted-foreground/40 sm:mx-8 sm:text-base"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </FadeInView>
    </section>
  );
}

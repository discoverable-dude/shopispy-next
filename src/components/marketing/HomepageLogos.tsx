"use client";

import { FadeInView } from "@/components/motion";

const brands = [
  "Gymshark", "SKIMS", "Allbirds", "Fenty Beauty", "Glossier",
  "Liquid Death", "Alo Yoga", "Brooklinen", "Our Place", "Peak Design",
  "Bombas", "MVMT", "ColourPop", "Ruggable",
];

export function HomepageLogos() {
  return (
    <section className="py-12 px-6">
      <FadeInView className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Tracking intelligence from brands like
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-sm font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </FadeInView>
    </section>
  );
}

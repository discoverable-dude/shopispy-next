"use client";

import Image from "next/image";
import { FadeInView } from "@/components/motion";

// Brand logos using clearbit logo API (free, high-quality company logos)
const brands = [
  { name: "Gymshark", domain: "gymshark.com" },
  { name: "SKIMS", domain: "skims.com" },
  { name: "Allbirds", domain: "allbirds.com" },
  { name: "Fenty Beauty", domain: "fentybeauty.com" },
  { name: "Glossier", domain: "glossier.com" },
  { name: "Liquid Death", domain: "liquiddeath.com" },
  { name: "Alo Yoga", domain: "aloyoga.com" },
  { name: "Brooklinen", domain: "brooklinen.com" },
  { name: "Our Place", domain: "fromourplace.com" },
  { name: "Peak Design", domain: "peakdesign.com" },
  { name: "Bombas", domain: "bombas.com" },
  { name: "MVMT", domain: "mvmtwatches.com" },
  { name: "ColourPop", domain: "colourpop.com" },
  { name: "Ruggable", domain: "ruggable.com" },
  { name: "Steve Madden", domain: "stevemadden.com" },
  { name: "Hydro Flask", domain: "hydroflask.com" },
  { name: "Kylie Cosmetics", domain: "kyliecosmetics.com" },
  { name: "Huel", domain: "huel.com" },
  { name: "Therabody", domain: "therabody.com" },
  { name: "Outdoor Voices", domain: "outdoorvoices.com" },
];

function BrandLogo({ name, domain }: { name: string; domain: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-4">
      <Image
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        width={24}
        height={24}
        className="h-6 w-6 rounded-sm object-contain grayscale opacity-40 transition-all hover:grayscale-0 hover:opacity-100"
        unoptimized
      />
      <span className="whitespace-nowrap text-sm font-medium text-muted-foreground/40 transition-colors hover:text-foreground">
        {name}
      </span>
    </div>
  );
}

export function HomepageLogos() {
  return (
    <section className="overflow-hidden border-y border-border/60 py-6">
      <FadeInView>
        <p className="mb-5 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Tracking intelligence from brands you know
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent" />

          {/* Row 1 */}
          <div className="flex animate-marquee">
            {[...brands, ...brands].map((brand, i) => (
              <BrandLogo key={`${brand.domain}-${i}`} name={brand.name} domain={brand.domain} />
            ))}
          </div>
        </div>
      </FadeInView>
    </section>
  );
}

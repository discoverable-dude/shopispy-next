"use client";

import { FadeInView } from "@/components/motion";

const brands = [
  { name: "GYMSHARK", style: "font-bold tracking-wider" },
  { name: "SKIMS", style: "font-bold tracking-[0.3em]" },
  { name: "allbirds", style: "font-medium lowercase" },
  { name: "FENTY BEAUTY", style: "font-bold tracking-widest text-[11px]" },
  { name: "Glossier", style: "font-medium italic" },
  { name: "LIQUID DEATH", style: "font-black tracking-wider text-[11px]" },
  { name: "alo", style: "font-light tracking-[0.4em] uppercase" },
  { name: "Brooklinen", style: "font-medium" },
  { name: "OUR PLACE", style: "font-bold tracking-[0.25em] text-[11px]" },
  { name: "Peak Design", style: "font-semibold" },
  { name: "Bombas", style: "font-bold" },
  { name: "MVMT", style: "font-bold tracking-[0.3em]" },
  { name: "ColourPop", style: "font-bold" },
  { name: "RUGGABLE", style: "font-medium tracking-[0.2em]" },
  { name: "Steve Madden", style: "font-medium tracking-wide" },
  { name: "HYDRO FLASK", style: "font-black tracking-wider text-[11px]" },
  { name: "KYLIE", style: "font-bold tracking-[0.35em]" },
  { name: "huel", style: "font-bold lowercase" },
  { name: "THERABODY", style: "font-medium tracking-[0.2em] text-[11px]" },
  { name: "Outdoor Voices", style: "font-medium italic" },
];

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
            {[...brands, ...brands].map((brand, i) => (
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

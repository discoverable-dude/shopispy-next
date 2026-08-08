"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, Sparkles, Coffee, Dumbbell, Home, Smartphone } from "lucide-react";
import { FadeInView } from "@/components/motion";
import { BrandIcon } from "@/components/marketing/BrandIcon";

interface BrandData {
  name: string;
  domain: string;
  products: string;
  lastUpdate: string;
  newestProduct: string;
  priceRange: string;
}

interface Vertical {
  id: string;
  label: string;
  icon: React.ReactNode;
  brands: BrandData[];
}

const verticals: Vertical[] = [
  {
    id: "fashion", label: "Fashion", icon: <Shirt className="h-3.5 w-3.5" />,
    brands: [
      { name: "Gymshark", domain: "gymshark.com", products: "2,847", lastUpdate: "2 hrs ago", newestProduct: "Vital Seamless 2.0 Crop Top", priceRange: "\u00a318\u2013\u00a365" },
      { name: "SKIMS", domain: "skims.com", products: "1,923", lastUpdate: "4 hrs ago", newestProduct: "Soft Lounge Long Sleeve Dress", priceRange: "$28\u2013$128" },
      { name: "Fashion Nova", domain: "fashionnova.com", products: "14,502", lastUpdate: "1 hr ago", newestProduct: "Date Night Satin Midi Dress", priceRange: "$12\u2013$89" },
      { name: "Allbirds", domain: "allbirds.com", products: "412", lastUpdate: "6 hrs ago", newestProduct: "Tree Flyer 3", priceRange: "$98\u2013$160" },
      { name: "Steve Madden", domain: "stevemadden.com", products: "3,671", lastUpdate: "3 hrs ago", newestProduct: "Maxima Platform Sandal", priceRange: "$49\u2013$299" },
      { name: "Chubbies", domain: "chubbies.com", products: "834", lastUpdate: "5 hrs ago", newestProduct: "Neon Glows 5.5\" Swim Trunk", priceRange: "$49\u2013$99" },
    ],
  },
  {
    id: "beauty", label: "Beauty", icon: <Sparkles className="h-3.5 w-3.5" />,
    brands: [
      { name: "Kylie Cosmetics", domain: "kyliecosmetics.com", products: "687", lastUpdate: "3 hrs ago", newestProduct: "Lip Shine Lacquer", priceRange: "$15\u2013$42" },
      { name: "Fenty Beauty", domain: "fentybeauty.com", products: "1,241", lastUpdate: "1 hr ago", newestProduct: "Gloss Bomb Stix", priceRange: "$22\u2013$52" },
      { name: "ColourPop", domain: "colourpop.com", products: "3,891", lastUpdate: "2 hrs ago", newestProduct: "Disney Villains Palette", priceRange: "$8\u2013$24" },
      { name: "Glossier", domain: "glossier.com", products: "312", lastUpdate: "8 hrs ago", newestProduct: "Stretch Fluid Foundation", priceRange: "$14\u2013$36" },
      { name: "Morphe", domain: "morphe.com", products: "1,567", lastUpdate: "4 hrs ago", newestProduct: "Artistry Palette Vol. 2", priceRange: "$6\u2013$48" },
      { name: "The Ordinary", domain: "theordinary.com", products: "198", lastUpdate: "12 hrs ago", newestProduct: "Saccharomyces Ferment 30%", priceRange: "$6\u2013$29" },
    ],
  },
  {
    id: "food", label: "Food & Drink", icon: <Coffee className="h-3.5 w-3.5" />,
    brands: [
      { name: "Liquid Death", domain: "liquiddeath.com", products: "156", lastUpdate: "5 hrs ago", newestProduct: "Armless Palmer Iced Tea", priceRange: "$1.89\u2013$19.99" },
      { name: "Death Wish Coffee", domain: "deathwishcoffee.com", products: "89", lastUpdate: "8 hrs ago", newestProduct: "Cold Brew Reserve Blend", priceRange: "$14\u2013$39" },
      { name: "Magic Spoon", domain: "magicspoon.com", products: "42", lastUpdate: "1 day ago", newestProduct: "Birthday Cake Cereal Bars", priceRange: "$9\u2013$49" },
      { name: "Huel", domain: "huel.com", products: "178", lastUpdate: "4 hrs ago", newestProduct: "Daily Greens Tropical Mix", priceRange: "\u00a325\u2013\u00a365" },
      { name: "Athletic Greens", domain: "drinkag1.com", products: "34", lastUpdate: "2 days ago", newestProduct: "AG1 Travel Packs 30ct", priceRange: "$79\u2013$99" },
      { name: "Bulletproof", domain: "bulletproof.com", products: "234", lastUpdate: "6 hrs ago", newestProduct: "Brain Octane C8 MCT Oil", priceRange: "$14\u2013$48" },
    ],
  },
  {
    id: "fitness", label: "Health & Fitness", icon: <Dumbbell className="h-3.5 w-3.5" />,
    brands: [
      { name: "Alo Yoga", domain: "aloyoga.com", products: "2,156", lastUpdate: "2 hrs ago", newestProduct: "Airlift High-Waist Legging", priceRange: "$48\u2013$198" },
      { name: "Therabody", domain: "therabody.com", products: "67", lastUpdate: "1 day ago", newestProduct: "Theragun PRO Plus", priceRange: "$199\u2013$599" },
      { name: "Bloom Nutrition", domain: "bloomnu.com", products: "89", lastUpdate: "3 hrs ago", newestProduct: "Greens & Superfoods Mango", priceRange: "$29\u2013$49" },
      { name: "Bombas", domain: "bombas.com", products: "1,234", lastUpdate: "4 hrs ago", newestProduct: "Performance Running Ankle Sock", priceRange: "$12\u2013$34" },
      { name: "MVMT", domain: "mvmtwatches.com", products: "456", lastUpdate: "6 hrs ago", newestProduct: "Arc Automatic 42mm", priceRange: "$128\u2013$298" },
      { name: "Outdoor Voices", domain: "outdoorvoices.com", products: "678", lastUpdate: "5 hrs ago", newestProduct: "RecTrek 7\" Short", priceRange: "$48\u2013$118" },
    ],
  },
  {
    id: "home", label: "Home", icon: <Home className="h-3.5 w-3.5" />,
    brands: [
      { name: "Brooklinen", domain: "brooklinen.com", products: "567", lastUpdate: "3 hrs ago", newestProduct: "Luxe Hardcore Sheet Bundle", priceRange: "$49\u2013$399" },
      { name: "Ruggable", domain: "ruggable.com", products: "4,123", lastUpdate: "1 hr ago", newestProduct: "Kamran Coral 8x10", priceRange: "$99\u2013$749" },
      { name: "Our Place", domain: "fromourplace.com", products: "89", lastUpdate: "8 hrs ago", newestProduct: "Always Pan 2.0 in Sage", priceRange: "$95\u2013$195" },
      { name: "Caraway", domain: "carawayhome.com", products: "134", lastUpdate: "6 hrs ago", newestProduct: "Bakeware Set in Navy", priceRange: "$95\u2013$545" },
      { name: "Nugget", domain: "nuggetcomfort.com", products: "23", lastUpdate: "2 days ago", newestProduct: "The Nugget in Atlantis", priceRange: "$229\u2013$259" },
      { name: "Hydro Flask", domain: "hydroflask.com", products: "312", lastUpdate: "4 hrs ago", newestProduct: "Wide Mouth 32oz Trail", priceRange: "$29\u2013$65" },
    ],
  },
  {
    id: "tech", label: "Tech", icon: <Smartphone className="h-3.5 w-3.5" />,
    brands: [
      { name: "Peak Design", domain: "peakdesign.com", products: "234", lastUpdate: "5 hrs ago", newestProduct: "Travel Backpack 30L V2", priceRange: "$29\u2013$299" },
      { name: "Nomad", domain: "nomadgoods.com", products: "189", lastUpdate: "3 hrs ago", newestProduct: "iPhone 16 Rugged Case", priceRange: "$19\u2013$129" },
      { name: "Raycon", domain: "rayconglobal.com", products: "45", lastUpdate: "1 day ago", newestProduct: "Everyday Earbuds Pro", priceRange: "$49\u2013$129" },
      { name: "Moment", domain: "shopmoment.com", products: "678", lastUpdate: "4 hrs ago", newestProduct: "CineBloom Diffusion Filter", priceRange: "$19\u2013$399" },
      { name: "Quad Lock", domain: "quadlockcase.com", products: "345", lastUpdate: "6 hrs ago", newestProduct: "Wireless Charging Head", priceRange: "$19\u2013$89" },
      { name: "Nothing", domain: "nothing.tech", products: "34", lastUpdate: "2 days ago", newestProduct: "Phone (3a) Clear Case", priceRange: "$29\u2013$499" },
    ],
  },
];

export function LiveIntelligence() {
  const [activeVertical, setActiveVertical] = useState("fashion");
  const active = verticals.find((v) => v.id === activeVertical)!;

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeInView className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Live intelligence
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See what the biggest brands are doing
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            ShopiSpy tracks 700+ top Shopify brands. Here&apos;s a live snapshot across
            the market.
          </p>
        </FadeInView>

        {/* Tabs */}
        <FadeInView delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-1.5">
            {verticals.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVertical(v.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeVertical === v.id
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVertical}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {active.brands.map((brand) => (
              <div
                key={brand.domain}
                className="group rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-primary/20"
              >
                {/* Brand header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BrandIcon name={brand.name} domain={brand.domain} size="sm" />
                    <div>
                      <p className="text-sm font-medium leading-tight">{brand.name}</p>
                      <p className="text-[11px] text-muted-foreground">{brand.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Live</span>
                  </div>
                </div>

                {/* Data grid */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] text-muted-foreground">Products</p>
                    <p className="text-xs font-semibold">{brand.products}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] text-muted-foreground">Updated</p>
                    <p className="text-xs font-semibold">{brand.lastUpdate}</p>
                  </div>
                </div>
                <div className="mt-2 rounded-md bg-muted/40 px-2.5 py-2">
                  <p className="text-[10px] text-muted-foreground">Newest product</p>
                  <p className="truncate text-xs font-medium">{brand.newestProduct}</p>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Price range</p>
                    <p className="text-xs font-semibold">{brand.priceRange}</p>
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Tracked
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Tracking <span className="font-medium text-foreground">36+ major brands</span> across{" "}
          <span className="font-medium text-foreground">6 verticals</span>
        </div>
      </div>
    </section>
  );
}

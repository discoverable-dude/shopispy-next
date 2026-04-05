// ── Single source of truth for all tracked brands ──

export interface Brand {
  name: string;
  domain: string;
  products: string;
  lastUpdate: string;
  latestChange: string;
}

export interface Vertical {
  id: string;
  label: string;
  brands: Brand[];
}

export const VERTICALS: Vertical[] = [
  {
    id: "fashion",
    label: "Fashion",
    brands: [
      { name: "Gymshark", domain: "gymshark.com", products: "2,847", lastUpdate: "2h", latestChange: "-12% on 4 items" },
      { name: "Fashion Nova", domain: "fashionnova.com", products: "14,502", lastUpdate: "1h", latestChange: "38 new arrivals" },
      { name: "SKIMS", domain: "skims.com", products: "1,923", lastUpdate: "4h", latestChange: "3 new products" },
      { name: "Alo Yoga", domain: "aloyoga.com", products: "2,156", lastUpdate: "2h", latestChange: "14 new items" },
      { name: "Kith", domain: "kith.com", products: "3,412", lastUpdate: "3h", latestChange: "New drop launched" },
      { name: "Steve Madden", domain: "stevemadden.com", products: "3,671", lastUpdate: "5h", latestChange: "Seasonal sale -20%" },
      { name: "FIGS", domain: "wearfigs.com", products: "867", lastUpdate: "6h", latestChange: "New colourway added" },
      { name: "Allbirds", domain: "allbirds.com", products: "412", lastUpdate: "8h", latestChange: "Price increase +5%" },
      { name: "Bombas", domain: "bombas.com", products: "1,234", lastUpdate: "4h", latestChange: "-6% on socks" },
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    brands: [
      { name: "Fenty Beauty", domain: "fentybeauty.com", products: "1,241", lastUpdate: "1h", latestChange: "New collection launched" },
      { name: "Rare Beauty", domain: "rarebeauty.com", products: "534", lastUpdate: "3h", latestChange: "5 new shades" },
      { name: "Kylie Cosmetics", domain: "kyliecosmetics.com", products: "687", lastUpdate: "4h", latestChange: "Lip kit restocked" },
      { name: "Glossier", domain: "glossier.com", products: "312", lastUpdate: "8h", latestChange: "-8% on skincare" },
      { name: "ColourPop", domain: "colourpop.com", products: "3,891", lastUpdate: "2h", latestChange: "Disney collab drop" },
      { name: "Hismile", domain: "hismile.com", products: "156", lastUpdate: "6h", latestChange: "New flavour added" },
      { name: "Olaplex", domain: "olaplex.com", products: "89", lastUpdate: "1d", latestChange: "Bundle pricing updated" },
      { name: "Tropic Skincare", domain: "tropicskincare.com", products: "234", lastUpdate: "5h", latestChange: "3 products restocked" },
      { name: "The Beauty Chef", domain: "thebeautychef.com", products: "67", lastUpdate: "12h", latestChange: "New supplement line" },
      { name: "Summer Fridays", domain: "summerfridays.com", products: "98", lastUpdate: "7h", latestChange: "Limited edition SPF" },
    ],
  },
  {
    id: "home",
    label: "Home & Garden",
    brands: [
      { name: "Ruggable", domain: "ruggable.com", products: "4,123", lastUpdate: "1h", latestChange: "48 new designs" },
      { name: "Casper", domain: "casper.com", products: "234", lastUpdate: "3h", latestChange: "Mattress sale -15%" },
      { name: "Arhaus", domain: "arhaus.com", products: "5,671", lastUpdate: "2h", latestChange: "New outdoor collection" },
      { name: "Stanley 1913", domain: "stanley1913.com", products: "567", lastUpdate: "4h", latestChange: "New tumbler colour" },
      { name: "Brooklinen", domain: "brooklinen.com", products: "456", lastUpdate: "6h", latestChange: "Seasonal bundle update" },
      { name: "Parachute Home", domain: "parachutehome.com", products: "389", lastUpdate: "5h", latestChange: "Price drop on linens" },
      { name: "Boll & Branch", domain: "bollandbranch.com", products: "312", lastUpdate: "8h", latestChange: "New thread count line" },
      { name: "Fast Growing Trees", domain: "fastgrowingtrees.com", products: "1,456", lastUpdate: "3h", latestChange: "Spring stock update" },
    ],
  },
  {
    id: "food",
    label: "Food & Beverage",
    brands: [
      { name: "Liquid Death", domain: "liquiddeath.com", products: "156", lastUpdate: "5h", latestChange: "New flavour launched" },
      { name: "Huel", domain: "huel.com", products: "178", lastUpdate: "4h", latestChange: "Price drop -10%" },
      { name: "Magic Spoon", domain: "magicspoon.com", products: "42", lastUpdate: "1d", latestChange: "New cereal bars" },
      { name: "Death Wish Coffee", domain: "deathwishcoffee.com", products: "89", lastUpdate: "8h", latestChange: "Reserve blend added" },
      { name: "Red Bull Shop", domain: "redbullshopus.com", products: "312", lastUpdate: "6h", latestChange: "New merch collection" },
      { name: "Fly by Jing", domain: "flybyjing.com", products: "67", lastUpdate: "3h", latestChange: "Gift set updated" },
      { name: "Owala", domain: "owala.com", products: "145", lastUpdate: "2h", latestChange: "FreeSip new colours" },
      { name: "Stumptown Coffee", domain: "stumptowncoffee.com", products: "78", lastUpdate: "7h", latestChange: "Subscription pricing change" },
      { name: "Partake Foods", domain: "partakefoods.com", products: "34", lastUpdate: "1d", latestChange: "New cookie flavour" },
      { name: "Heatonist", domain: "heatonist.com", products: "256", lastUpdate: "4h", latestChange: "Hot Ones bundle" },
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    brands: [
      { name: "Nomad Goods", domain: "nomadgoods.com", products: "189", lastUpdate: "3h", latestChange: "iPhone 16 cases" },
      { name: "Ridge Wallet", domain: "ridgewallet.com", products: "234", lastUpdate: "4h", latestChange: "New titanium finish" },
      { name: "Cowboy", domain: "cowboy.com", products: "23", lastUpdate: "1d", latestChange: "E-bike price update" },
      { name: "Secretlab", domain: "secretlab.co", products: "156", lastUpdate: "6h", latestChange: "New TITAN Evo" },
      { name: "Pela Case", domain: "pelacase.com", products: "312", lastUpdate: "5h", latestChange: "Compostable range expanded" },
      { name: "Master & Dynamic", domain: "masterdynamic.com", products: "89", lastUpdate: "8h", latestChange: "New wireless model" },
      { name: "Jackery", domain: "jackery.com", products: "78", lastUpdate: "3h", latestChange: "Solar panel bundle" },
      { name: "Moment", domain: "shopmoment.com", products: "678", lastUpdate: "4h", latestChange: "CineBloom restock" },
      { name: "Nanoleaf", domain: "nanoleaf.me", products: "45", lastUpdate: "7h", latestChange: "Skylight panel launch" },
    ],
  },
];

// All brands flat
export const ALL_BRANDS = VERTICALS.flatMap((v) => v.brands);

// Total product count across all tracked stores
export const TOTAL_PRODUCTS = ALL_BRANDS.reduce((sum, b) => {
  const num = parseInt(b.products.replace(/,/g, ""), 10);
  return sum + (isNaN(num) ? 0 : num);
}, 0);

// Brand names for marquee
export const BRAND_NAMES = ALL_BRANDS.map((b) => b.name);

// Logo-style brand wordmarks with unique typography
export const BRAND_WORDMARKS: { name: string; style: string }[] = [
  { name: "GYMSHARK", style: "font-bold tracking-wider" },
  { name: "FASHION NOVA", style: "font-black tracking-wide text-[11px]" },
  { name: "SKIMS", style: "font-bold tracking-[0.3em]" },
  { name: "alo", style: "font-light tracking-[0.4em] uppercase" },
  { name: "KITH", style: "font-black tracking-[0.2em]" },
  { name: "FENTY BEAUTY", style: "font-bold tracking-widest text-[11px]" },
  { name: "rare beauty", style: "font-medium lowercase italic" },
  { name: "KYLIE", style: "font-bold tracking-[0.35em]" },
  { name: "Glossier", style: "font-medium italic" },
  { name: "ColourPop", style: "font-bold" },
  { name: "HISMILE", style: "font-black tracking-wider text-[11px]" },
  { name: "RUGGABLE", style: "font-medium tracking-[0.2em]" },
  { name: "casper", style: "font-bold lowercase" },
  { name: "Stanley 1913", style: "font-semibold" },
  { name: "BROOKLINEN", style: "font-medium tracking-wide" },
  { name: "LIQUID DEATH", style: "font-black tracking-wider text-[11px]" },
  { name: "huel", style: "font-bold lowercase" },
  { name: "Magic Spoon", style: "font-bold" },
  { name: "NOMAD", style: "font-bold tracking-[0.3em]" },
  { name: "RIDGE", style: "font-black tracking-[0.25em]" },
  { name: "secretlab", style: "font-bold lowercase" },
  { name: "Jackery", style: "font-semibold" },
  { name: "NANOLEAF", style: "font-medium tracking-[0.15em]" },
  { name: "Bombas", style: "font-bold" },
  { name: "FIGS", style: "font-black tracking-[0.3em]" },
  { name: "allbirds", style: "font-medium lowercase" },
  { name: "Steve Madden", style: "font-medium tracking-wide" },
  { name: "OLAPLEX", style: "font-bold tracking-[0.2em]" },
  { name: "Owala", style: "font-bold" },
  { name: "MOMENT", style: "font-medium tracking-[0.2em]" },
];

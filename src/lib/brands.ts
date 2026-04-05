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

// Helper to generate realistic-looking product counts and update times
function b(name: string, domain: string, products: string, lastUpdate: string, latestChange: string): Brand {
  return { name, domain, products, lastUpdate, latestChange };
}

export const VERTICALS: Vertical[] = [
  {
    id: "fashion",
    label: "Fashion",
    brands: [
      b("Gymshark", "gymshark.com", "2,847", "2h", "-12% on 4 items"),
      b("Fashion Nova", "fashionnova.com", "14,502", "1h", "38 new arrivals"),
      b("SKIMS", "skims.com", "1,923", "4h", "3 new products"),
      b("Alo Yoga", "aloyoga.com", "2,156", "2h", "14 new items"),
      b("Kith", "kith.com", "3,412", "3h", "New drop launched"),
      b("Steve Madden", "stevemadden.com", "3,671", "5h", "Seasonal sale -20%"),
      b("FIGS", "wearfigs.com", "867", "6h", "New colourway added"),
      b("Allbirds", "allbirds.com", "412", "8h", "Price increase +5%"),
      b("Bombas", "bombas.com", "1,234", "4h", "-6% on socks"),
      b("Taylor Stitch", "taylorstitch.com", "523", "6h", "Workshop sale"),
      b("OddBalls", "myoddballs.com", "345", "3h", "New prints added"),
      b("Tentree", "tentree.com", "678", "5h", "Earth collection drop"),
      b("Chubbies", "chubbies.com", "834", "7h", "Swim trunk restock"),
      b("Represent Clothing", "representclo.com", "1,123", "2h", "New season launch"),
      b("Outdoor Voices", "outdoorvoices.com", "456", "4h", "Colour refresh"),
      b("True Classic", "trueclassictees.com", "312", "3h", "Bundle pricing update"),
      b("Buck Mason", "buckmason.com", "267", "8h", "New denim line"),
      b("Vuori", "vuori.com", "1,567", "2h", "12 new styles"),
      b("Rhone", "rhone.com", "834", "5h", "Commuter collection"),
      b("Cuts Clothing", "cutsclothing.com", "189", "6h", "New crew neck"),
      b("MeUndies", "meundies.com", "567", "4h", "Print collaboration"),
      b("Stance", "stance.com", "2,345", "3h", "NBA collection update"),
      b("Happy Socks", "happysocks.com", "1,890", "5h", "Summer range"),
      b("Knix", "knix.com", "445", "7h", "Swim launch"),
      b("ThirdLove", "thirdlove.com", "312", "6h", "New fit finder"),
      b("Savage X Fenty", "savagex.com", "2,678", "1h", "Monthly drop"),
      b("Lunya", "lunya.co", "234", "8h", "Washable silk restock"),
      b("Rothy's", "rothys.com", "378", "4h", "New point colour"),
      b("Thursday Boots", "thursdayboots.com", "156", "1d", "Captain restock"),
      b("Greats", "greats.com", "89", "12h", "Royale new colour"),
      b("Vessi", "vessi.com", "123", "6h", "Waterproof Weekend"),
      b("MVMT", "mvmtwatches.com", "456", "5h", "New chronograph"),
      b("Daniel Wellington", "danielwellington.com", "678", "4h", "Icon collection"),
      b("Away", "awaytravel.com", "234", "8h", "Aluminium restock"),
      b("Monos", "monos.com", "167", "7h", "New Metro colour"),
      b("Bellroy", "bellroy.com", "312", "5h", "Transit collection"),
      b("Ridge Wallet", "ridgewallet.com", "234", "4h", "New titanium finish"),
      b("Ekster", "ekster.com", "145", "6h", "Parliament wallet update"),
    ],
  },
  {
    id: "beauty",
    label: "Beauty & Wellness",
    brands: [
      b("Fenty Beauty", "fentybeauty.com", "1,241", "1h", "New collection launched"),
      b("Rare Beauty", "rarebeauty.com", "534", "3h", "5 new shades"),
      b("Kylie Cosmetics", "kyliecosmetics.com", "687", "4h", "Lip kit restocked"),
      b("Glossier", "glossier.com", "312", "8h", "-8% on skincare"),
      b("ColourPop", "colourpop.com", "3,891", "2h", "Disney collab drop"),
      b("Hismile", "hismile.com", "156", "6h", "New flavour added"),
      b("Olaplex", "olaplex.com", "89", "1d", "Bundle pricing updated"),
      b("Tropic Skincare", "tropicskincare.com", "234", "5h", "3 products restocked"),
      b("The Beauty Chef", "thebeautychef.com", "67", "12h", "New supplement line"),
      b("Summer Fridays", "summerfridays.com", "98", "7h", "Limited edition SPF"),
      b("Jeffree Star Cosmetics", "jeffreestarcosmetics.com", "567", "3h", "Mystery box sale"),
      b("Iconic London", "iconiclondoninc.com", "234", "5h", "Illuminator restock"),
      b("Kosas Cosmetics", "kfrancis.kosas.com", "145", "6h", "Tinted oil update"),
      b("Glow Recipe", "glowrecipe.com", "178", "4h", "Watermelon set"),
      b("Dr. Squatch", "drsquatch.com", "312", "2h", "New bar scents"),
      b("Harry's", "harrys.com", "189", "5h", "Shave set refresh"),
      b("Ouai", "theouai.com", "156", "7h", "New treatment mask"),
      b("Function of Beauty", "functionofbeauty.com", "78", "8h", "Body line expansion"),
      b("Ritual", "ritual.com", "45", "6h", "Protein powder launch"),
      b("Athletic Greens", "drinkag1.com", "34", "1d", "Travel pack update"),
      b("Mud/Wtr", "mudwtr.com", "56", "8h", ":rest blend restock"),
      b("Vital Proteins", "vitalproteins.com", "234", "4h", "Collagen bars"),
      b("Quip", "getquip.com", "89", "1d", "Smart brush update"),
      b("Snow Teeth Whitening", "trysnow.com", "67", "6h", "LED kit refresh"),
      b("Blueland", "blueland.com", "78", "5h", "Laundry tablets"),
    ],
  },
  {
    id: "home",
    label: "Home & Garden",
    brands: [
      b("Ruggable", "ruggable.com", "4,123", "1h", "48 new designs"),
      b("Casper", "casper.com", "234", "3h", "Mattress sale -15%"),
      b("Arhaus", "arhaus.com", "5,671", "2h", "New outdoor collection"),
      b("Stanley 1913", "stanley1913.com", "567", "4h", "New tumbler colour"),
      b("Brooklinen", "brooklinen.com", "456", "6h", "Seasonal bundle update"),
      b("Parachute Home", "parachutehome.com", "389", "5h", "Price drop on linens"),
      b("Boll & Branch", "bollandbranch.com", "312", "8h", "New thread count line"),
      b("Fast Growing Trees", "fastgrowingtrees.com", "1,456", "3h", "Spring stock update"),
      b("Leesa", "leesa.com", "123", "1d", "Hybrid mattress refresh"),
      b("Burrow", "burrow.com", "345", "4h", "Nomad sofa new colour"),
      b("Article", "article.com", "2,345", "2h", "Mid-century restock"),
      b("Outer", "liveouter.com", "89", "8h", "Outdoor sofa update"),
      b("Yeti", "yeti.com", "678", "3h", "New Rambler colour"),
      b("Hydro Flask", "hydroflask.com", "456", "5h", "Wide Mouth restock"),
      b("Solo Stove", "solostove.com", "123", "6h", "Mesa tabletop fire pit"),
      b("Ooni", "ooni.com", "89", "7h", "Koda 2 Max launch"),
      b("Rumpl", "rumpl.com", "234", "4h", "National Parks series"),
      b("Peak Design", "peakdesign.com", "312", "5h", "Travel Backpack V2"),
      b("Nomatic", "nomatic.com", "178", "6h", "Navigator expansion"),
      b("Elgato", "elgato.com", "145", "4h", "Stream Deck Neo"),
      b("Keychron", "keychron.com", "234", "3h", "Q series restock"),
      b("Secretlab", "secretlab.co", "156", "6h", "TITAN Evo new fabric"),
    ],
  },
  {
    id: "food",
    label: "Food & Beverage",
    brands: [
      b("Liquid Death", "liquiddeath.com", "156", "5h", "New flavour launched"),
      b("Huel", "huel.com", "178", "4h", "Price drop -10%"),
      b("Magic Spoon", "magicspoon.com", "42", "1d", "New cereal bars"),
      b("Death Wish Coffee", "deathwishcoffee.com", "89", "8h", "Reserve blend added"),
      b("Red Bull Shop", "redbullshopus.com", "312", "6h", "New merch collection"),
      b("Fly by Jing", "flybyjing.com", "67", "3h", "Gift set updated"),
      b("Owala", "owala.com", "145", "2h", "FreeSip new colours"),
      b("Stumptown Coffee", "stumptowncoffee.com", "78", "7h", "Subscription pricing change"),
      b("Partake Foods", "partakefoods.com", "34", "1d", "New cookie flavour"),
      b("Heatonist", "heatonist.com", "256", "4h", "Hot Ones bundle"),
      b("Milk Bar", "milkbarstore.com", "123", "3h", "Birthday cake restock"),
      b("Chomps", "chomps.com", "67", "6h", "New original flavour"),
      b("Soylent", "soylent.com", "45", "8h", "Complete Protein update"),
      b("Daily Harvest", "daily-harvest.com", "312", "2h", "Summer smoothies"),
      b("Our Place", "fromourplace.com", "89", "5h", "Always Pan 2.0 Sage"),
      b("Caraway", "carawayhome.com", "134", "6h", "Bakeware Set Navy"),
      b("Made In Cookware", "madeincookware.com", "234", "4h", "Carbon steel restock"),
      b("HexClad", "hexclad.com", "89", "7h", "Gordon Ramsay set"),
      b("Fellow", "fellowproducts.com", "156", "3h", "Stagg EKG update"),
      b("Aeropress", "aeropress.com", "34", "1d", "Clear model launch"),
      b("Chemex", "chemexcoffeemaker.com", "23", "2d", "Glass handle restock"),
    ],
  },
  {
    id: "electronics",
    label: "Electronics & Tech",
    brands: [
      b("Nomad Goods", "nomadgoods.com", "189", "3h", "iPhone 16 cases"),
      b("Ridge Wallet", "ridgewallet.com", "234", "4h", "New titanium finish"),
      b("Cowboy", "cowboy.com", "23", "1d", "E-bike price update"),
      b("Secretlab", "secretlab.co", "156", "6h", "New TITAN Evo"),
      b("Pela Case", "pelacase.com", "312", "5h", "Compostable range expanded"),
      b("Master & Dynamic", "masterdynamic.com", "89", "8h", "New wireless model"),
      b("Jackery", "jackery.com", "78", "3h", "Solar panel bundle"),
      b("Moment", "shopmoment.com", "678", "4h", "CineBloom restock"),
      b("Nanoleaf", "nanoleaf.me", "45", "7h", "Skylight panel launch"),
      b("Elgato", "elgato.com", "145", "4h", "Stream Deck update"),
      b("Loop Earplugs", "loopearplugs.com", "67", "6h", "Switch new colour"),
      b("MVMT Watches", "mvmtwatches.com", "456", "5h", "Arc Automatic"),
      b("Keychron", "keychron.com", "234", "3h", "Q1 Max restock"),
      b("Shokz", "shokz.com", "78", "8h", "OpenRun Pro 2"),
      b("RhinoShield", "rhinoshield.io", "567", "2h", "SolidSuit new designs"),
      b("Framework Laptop", "frame.work", "23", "1d", "16\" expansion cards"),
      b("Razer", "razer.com", "1,234", "1h", "Viper V3 launch"),
      b("Logitech G", "logitechg.com", "567", "3h", "Pro X Superlight 2"),
      b("Raspberry Pi", "raspberrypi.com", "89", "6h", "Pi 5 restock"),
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
  // Fashion
  { name: "GYMSHARK", style: "font-bold tracking-wider" },
  { name: "FASHION NOVA", style: "font-black tracking-wide text-[11px]" },
  { name: "SKIMS", style: "font-bold tracking-[0.3em]" },
  { name: "alo", style: "font-light tracking-[0.4em] uppercase" },
  { name: "KITH", style: "font-black tracking-[0.2em]" },
  { name: "FIGS", style: "font-black tracking-[0.3em]" },
  { name: "allbirds", style: "font-medium lowercase" },
  { name: "Vuori", style: "font-medium" },
  { name: "Rhone", style: "font-semibold tracking-wide" },
  { name: "TRUE CLASSIC", style: "font-bold tracking-wider text-[11px]" },
  { name: "REPRESENT", style: "font-black tracking-[0.15em]" },
  { name: "MVMT", style: "font-bold tracking-[0.3em]" },
  { name: "AWAY", style: "font-bold tracking-[0.25em]" },
  { name: "Chubbies", style: "font-bold" },
  { name: "SAVAGE X", style: "font-black tracking-wider text-[11px]" },
  // Beauty
  { name: "FENTY BEAUTY", style: "font-bold tracking-widest text-[11px]" },
  { name: "rare beauty", style: "font-medium lowercase italic" },
  { name: "KYLIE", style: "font-bold tracking-[0.35em]" },
  { name: "Glossier", style: "font-medium italic" },
  { name: "ColourPop", style: "font-bold" },
  { name: "HISMILE", style: "font-black tracking-wider text-[11px]" },
  { name: "OLAPLEX", style: "font-bold tracking-[0.2em]" },
  { name: "Dr. Squatch", style: "font-bold" },
  { name: "ritual", style: "font-medium lowercase" },
  { name: "AG1", style: "font-black tracking-[0.2em]" },
  // Home
  { name: "RUGGABLE", style: "font-medium tracking-[0.2em]" },
  { name: "casper", style: "font-bold lowercase" },
  { name: "Stanley 1913", style: "font-semibold" },
  { name: "BROOKLINEN", style: "font-medium tracking-wide" },
  { name: "YETI", style: "font-black tracking-[0.25em]" },
  { name: "Ooni", style: "font-bold" },
  { name: "Peak Design", style: "font-semibold" },
  { name: "Keychron", style: "font-medium" },
  // Food
  { name: "LIQUID DEATH", style: "font-black tracking-wider text-[11px]" },
  { name: "huel", style: "font-bold lowercase" },
  { name: "Magic Spoon", style: "font-bold" },
  { name: "Owala", style: "font-bold" },
  { name: "Fellow", style: "font-medium" },
  { name: "HexClad", style: "font-semibold" },
  // Electronics
  { name: "NOMAD", style: "font-bold tracking-[0.3em]" },
  { name: "RIDGE", style: "font-black tracking-[0.25em]" },
  { name: "secretlab", style: "font-bold lowercase" },
  { name: "Jackery", style: "font-semibold" },
  { name: "NANOLEAF", style: "font-medium tracking-[0.15em]" },
  { name: "RAZER", style: "font-black tracking-[0.2em]" },
  { name: "Raspberry Pi", style: "font-medium" },
  { name: "Bombas", style: "font-bold" },
  { name: "Rothy's", style: "font-medium italic" },
  { name: "MOMENT", style: "font-medium tracking-[0.2em]" },
];

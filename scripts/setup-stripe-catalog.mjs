// Idempotent Stripe catalogue setup for ShopiSpy.
//
// Creates named Products + Prices for the one-off reports and the subscription
// tiers, each Price tagged with a stable `lookup_key` the app references. Safe to
// re-run: existing prices (matched by lookup_key) are reused, never duplicated.
//
// Run with the live secret key in the environment:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe-catalog.mjs
//
// Prints a summary of lookup_key -> price id -> product id at the end.

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}
const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

// One-off report products (GBP only — that's how the reports are priced).
const REPORTS = [
  { lookup: "shopispy_report_company_v2",  name: "ShopiSpy Company Snapshot",     desc: "Full product-level catalogue export for one brand.", gbp: 900 },
  { lookup: "shopispy_report_industry_v2", name: "ShopiSpy Industry Benchmark",   desc: "Every brand in a vertical, benchmarked side by side.", gbp: 2900 },
  { lookup: "shopispy_report_market_v2",   name: "ShopiSpy Complete Market Report", desc: "Every tracked brand across all industries in one file.", gbp: 9900 },
];

// Recurring subscription tiers. Multi-currency via currency_options so one Price
// per tier covers GBP/USD/EUR (amounts mirror the current create-checkout logic).
const TIERS = [
  { lookup: "shopispy_sub_lite",    name: "ShopiSpy Lite",    desc: "Low-barrier upgrade — 1 store, daily scraping.", gbp: 900,  usd: 900,  eur: 900 },
  { lookup: "shopispy_sub_starter", name: "ShopiSpy Starter", desc: "For small brands — 2 stores.",                 gbp: 1900, usd: 2400, eur: 2200 },
  { lookup: "shopispy_sub_pro",     name: "ShopiSpy Pro",     desc: "Growth-stage — 10 stores, analytics, API.",     gbp: 4900, usd: 6200, eur: 5700 },
];

// Return an existing active price for this lookup_key, or null.
async function findPrice(lookup) {
  const res = await stripe.prices.list({ lookup_keys: [lookup], active: true, expand: ["data.product"], limit: 1 });
  return res.data[0] || null;
}

async function ensureProduct(name, description, metadataKey) {
  // Reuse a product we previously tagged, else create it.
  const search = await stripe.products.search({ query: `metadata['shopispy_key']:'${metadataKey}'`, limit: 1 });
  if (search.data[0]) return search.data[0];
  return stripe.products.create({ name, description, metadata: { shopispy_key: metadataKey } });
}

async function ensurePrice({ lookup, name, desc, gbp, usd, eur, recurring }) {
  const existing = await findPrice(lookup);
  if (existing) return { lookup, priceId: existing.id, productId: typeof existing.product === "string" ? existing.product : existing.product.id, reused: true };

  const product = await ensureProduct(name, desc, lookup);
  const params = {
    product: product.id,
    currency: "gbp",
    unit_amount: gbp,
    lookup_key: lookup,
    ...(recurring ? { recurring: { interval: "month" } } : {}),
  };
  if (usd || eur) {
    params.currency_options = {};
    if (usd) params.currency_options.usd = { unit_amount: usd };
    if (eur) params.currency_options.eur = { unit_amount: eur };
  }
  const price = await stripe.prices.create(params);
  return { lookup, priceId: price.id, productId: product.id, reused: false };
}

const results = [];
for (const r of REPORTS) results.push(await ensurePrice({ ...r, recurring: false }));
for (const t of TIERS)   results.push(await ensurePrice({ ...t, recurring: true }));

console.log("\n=== ShopiSpy Stripe catalogue ===");
for (const r of results) {
  console.log(`${r.reused ? "reused " : "created"}  ${r.lookup.padEnd(26)}  ${r.priceId}  (${r.productId})`);
}
console.log("\nDone.");

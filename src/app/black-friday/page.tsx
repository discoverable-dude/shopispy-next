import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, Database, Download, Lock, TrendingDown, Zap, Clock, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BuyReportButton } from "@/components/reports/BuyReportButton";
import { Countdown } from "@/components/bf/Countdown";
import { SnapshotPicker } from "@/components/bf/SnapshotPicker";
import { RequestForm } from "@/components/bf/RequestForm";
import { StickyCta } from "@/components/bf/StickyCta";
import { REPORTS } from "@/lib/reports";
import { fetchBlackFridayData, PICKER_BRANDS, type BfData } from "@/lib/bfData";

// Live numbers, rebuilt at most once an hour. The first build after a deploy
// does the heavy sampling, so give it room.
export const revalidate = 3600;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Black Friday 2026 Shopify Price Snapshots",
  description:
    "See how deep Shopify brands are discounting before Black Friday. Live discount tracker plus downloadable competitor price snapshots from £9.",
  alternates: { canonical: "/black-friday" },
  openGraph: {
    title: "Your competitors are already discounting. How deep?",
    description: "Live Black Friday discount tracker and competitor price snapshots for Shopify brands. From £9, instant CSV.",
    type: "website",
  },
};

const nf = (n: number) => n.toLocaleString("en-GB");
const compact = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M` : n >= 1e3 ? `${Math.round(n / 1e3).toLocaleString("en-GB")}k` : String(n);
const money = (n: number | null) => (n == null ? "" : n % 1 === 0 ? String(n) : n.toFixed(2));

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

const ctaPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110";
const ctaGhost =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted";

export default async function BlackFridayPage() {
  let d: BfData | null = null;
  try {
    d = await fetchBlackFridayData();
  } catch (err) {
    console.error("[black-friday] data load failed", err);
  }

  const updated = d
    ? new Date(d.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;
  const maxDepth = d ? Math.max(1, ...d.byIndustry.map((i) => i.avgDepth)) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Urgency strip */}
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2.5 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">Black Friday is Friday 27 November.</span>
          <span className="text-muted-foreground">Starts in <Countdown compact /></span>
        </div>
      </div>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-14 sm:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <TrendingDown className="h-3.5 w-3.5" /> Black Friday 2026 intelligence
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Your competitors are already discounting. <span className="text-primary">Do you know how deep?</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
                Price snapshots of {d ? nf(d.totals.brands) : "700+"} Shopify brands, rebuilt from live data. See every product, price,
                sale and stock status, then set your Black Friday offers with your eyes open.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#pick" className={ctaPrimary}>
                  Get a snapshot from {REPORTS.company.display} <ArrowDown className="h-4 w-4" />
                </a>
                <a href="#discounts" className={ctaGhost}>See live discounts</a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Instant CSV download. Opens in Excel and Google Sheets. Secure checkout by Stripe.</p>

              <div className="mt-8 flex justify-center">
                <Countdown />
              </div>
            </div>

            {d && d.discount.sample > 0 && (
              <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold tracking-tight text-primary">{d.discount.onSalePct}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">of products are on sale right now</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold tracking-tight text-primary">{d.discount.avgDepth}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">average discount on those items</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold tracking-tight text-primary">{nf(d.week.priceChanges)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">price changes tracked in the last 7 days</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Live discount tracker ── */}
        {d && d.discount.sample > 0 && (
          <section id="discounts" className="border-t border-border/60 bg-muted/20">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <SectionHead
                eyebrow="Live discount tracker"
                title="Who is cutting prices, and by how much"
                sub={`Updated ${updated}. Built from a sample of ${nf(d.discount.sample)} products across ${nf(d.discount.sampleStores)} stores, plus every price change we logged this week.`}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                {/* By industry */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-semibold">Average discount by industry</h3>
                  <p className="mb-4 text-xs text-muted-foreground">How far below the original price, on items that are on sale</p>
                  <ul className="space-y-3">
                    {d.byIndustry.filter((i) => i.sample >= 30).slice(0, 9).map((i) => (
                      <li key={i.slug} className="grid grid-cols-[8.5rem_1fr_3rem] items-center gap-3 text-sm">
                        <span className="truncate font-medium">{i.label}</span>
                        <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(6, (i.avgDepth / maxDepth) * 100)}%` }} />
                        </span>
                        <span className="text-right font-mono text-xs font-semibold tabular-nums">{i.avgDepth}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Brands cutting */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-semibold">Brands cutting prices hardest this week</h3>
                  <p className="mb-4 text-xs text-muted-foreground">Most products reduced, with the average cut</p>
                  {d.week.cutting.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not enough price cuts logged yet this week.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {d.week.cutting.map((c) => (
                        <li key={c.domain} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            {c.slug ? (
                              <Link href={`/brands/${c.slug}`} className="font-semibold hover:text-primary">{c.brand}</Link>
                            ) : (
                              <span className="font-semibold">{c.brand}</span>
                            )}
                            <p className="text-xs text-muted-foreground">{c.drops} products cut, average {c.avgCutPct}% off</p>
                          </div>
                          <BuyReportButton
                            report="company"
                            target={c.domain}
                            label={c.brand}
                            price={REPORTS.company.display}
                            className="inline-flex h-8 shrink-0 items-center rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                          >
                            Snapshot {REPORTS.company.display}
                          </BuyReportButton>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Biggest drops */}
              {d.week.topDrops.length > 0 && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">Biggest single price drops this week</h3>
                    <p className="text-xs text-muted-foreground">
                      {nf(d.week.drops)} drops and {nf(d.week.rises)} rises tracked{d.week.newProducts != null ? `, plus ${nf(d.week.newProducts)} new product launches` : ""}
                    </p>
                  </div>
                  <ul className="grid gap-x-8 sm:grid-cols-2">
                    {d.week.topDrops.map((m, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{m.brand}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.product}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-xs text-muted-foreground">{money(m.from)} to {money(m.to)}</p>
                          <p className="font-mono text-sm font-bold text-primary">{Math.round(m.pct)}%</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">Prices are shown in each store&apos;s own currency.</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <a href="#pick" className={ctaPrimary}>Get the full picture for your market</a>
              </div>
            </div>
          </section>
        )}

        {/* ── Offers ── */}
        <section id="pick" className="scroll-mt-16 border-t border-border/60">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <SectionHead
              eyebrow="Choose your snapshot"
              title="Pick the view that fits your Black Friday plan"
              sub="One-off price, instant download. Your link stays live, and every time you open it you get the latest data, so it keeps working through Cyber Monday."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Brand */}
              <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Brand snapshot</h3>
                    <p className="mt-1 text-sm text-muted-foreground">One competitor, every product. The catalogue they are working from today.</p>
                  </div>
                  <p className="shrink-0 text-3xl font-extrabold tracking-tight">{REPORTS.company.display}</p>
                </div>
                <div className="mt-5">
                  <SnapshotPicker brands={PICKER_BRANDS} price={REPORTS.company.display} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Their store is not listed? <a href="#request" className="font-medium text-primary underline underline-offset-4">We will add it for you</a>, usually in under a minute.
                </p>
              </div>

              {/* Market */}
              <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-primary/5 p-6 shadow-md">
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">Best value</span>
                <h3 className="text-lg font-bold">Full market report</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  All {d ? nf(d.totals.brands) : ""} brands across all {d ? d.totals.industries : 16} industries in one file. Built for agencies and anyone pricing a whole category.
                </p>
                <p className="mt-4 text-3xl font-extrabold tracking-tight">{REPORTS.market.display}</p>
                <div className="mt-auto pt-5">
                  <BuyReportButton
                    report="market"
                    target="all"
                    label="All industries"
                    price={REPORTS.market.display}
                    className={`${ctaPrimary} w-full disabled:opacity-60`}
                  >
                    Get the full market, {REPORTS.market.display}
                  </BuyReportButton>
                </div>
              </div>
            </div>

            {/* Industry */}
            <div className="mt-10">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold">Industry benchmark, {REPORTS.industry.display} each</h3>
                <p className="text-sm text-muted-foreground">Every brand in an industry side by side: prices, sale share, top category.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(d ? d.byIndustry : []).map((i) => (
                  <div key={i.slug} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{i.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.brands} brands{i.sample >= 30 && i.avgDepth > 0 ? `, avg ${i.avgDepth}% off` : ""}
                      </p>
                    </div>
                    <BuyReportButton
                      report="industry"
                      target={i.slug}
                      label={i.label}
                      price={REPORTS.industry.display}
                      className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-60"
                    >
                      Buy {REPORTS.industry.display}
                    </BuyReportButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── What data we have ── */}
        <section className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <SectionHead
              eyebrow="What we track"
              title="A daily record of the whole Shopify market"
              sub="Every morning we read the public product feed of every store we track and log what changed. Nothing is estimated and nobody's private sales are involved."
            />
            {d && (
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { n: nf(d.totals.brands), l: "brands listed" },
                  { n: d.totals.industries, l: "industries" },
                  { n: compact(d.totals.products), l: "products tracked" },
                  ...(d.totals.variants ? [{ n: compact(d.totals.variants), l: "variants and SKUs" }] : []),
                  ...(d.totals.priceChanges ? [{ n: compact(d.totals.priceChanges), l: "changes logged" }] : []),
                  ...(d.totals.images ? [{ n: compact(d.totals.images), l: "product images" }] : []),
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-2xl font-extrabold tracking-tight text-primary">{s.n}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><h3 className="font-semibold">In a brand snapshot</h3></div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  {["Product name", "Category", "Vendor", "Tags", "From price", "Compare-at price", "On sale or not", "In stock or not", "Product link", "Image link", "First seen", "Last updated"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />{f}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><h3 className="font-semibold">In an industry benchmark</h3></div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  {["Brand and domain", "Products live", "Lowest price", "Average price", "Highest price", "Share on sale", "Top category", "Last updated", "Latest change"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Real sample snapshots ── */}
        {(d?.brandPreview || d?.industryPreview) && (
          <section className="border-t border-border/60">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <SectionHead
                eyebrow="See it before you buy"
                title="This is a real snapshot, not a mock-up"
                sub="The first rows of two live snapshots, straight from our data. You get every row."
              />
              <div className="space-y-8">
                {d.brandPreview && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Brand snapshot: {d.brandPreview.brand}</p>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Product</th>
                              <th className="px-4 py-3 font-medium">Category</th>
                              <th className="px-4 py-3 text-right font-medium">From</th>
                              <th className="px-4 py-3 text-right font-medium">Was</th>
                              <th className="px-4 py-3 font-medium">Sale</th>
                              <th className="px-4 py-3 font-medium">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.brandPreview.rows.map((r, i) => (
                              <tr key={i} className="border-t border-border">
                                <td className="max-w-[16rem] truncate px-4 py-2.5 font-medium">{r.product}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{r.category || "-"}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{money(r.price)}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{r.compareAt && r.onSale ? money(r.compareAt) : "-"}</td>
                                <td className="px-4 py-2.5">{r.onSale ? <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">On sale</span> : <span className="text-muted-foreground">No</span>}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{r.inStock ? "In stock" : "Sold out"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5" />and {nf(Math.max(0, d.brandPreview.totalRows - d.brandPreview.rows.length))} more rows in the full snapshot</span>
                        <a href="#pick" className="font-semibold text-primary hover:underline">Get it</a>
                      </div>
                    </div>
                  </div>
                )}

                {d.industryPreview && d.industryPreview.rows.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Industry benchmark: {d.industryPreview.label}</p>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Brand</th>
                              <th className="px-4 py-3 text-right font-medium">Products</th>
                              <th className="px-4 py-3 text-right font-medium">From</th>
                              <th className="px-4 py-3 text-right font-medium">Average</th>
                              <th className="px-4 py-3 text-right font-medium">On sale</th>
                              <th className="px-4 py-3 font-medium">Top category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.industryPreview.rows.map((r, i) => (
                              <tr key={i} className="border-t border-border">
                                <td className="px-4 py-2.5 font-medium">{r.brand}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{nf(r.products)}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{money(r.minPrice)}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{money(r.avgPrice)}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{r.onSalePct}%</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{r.topCategory || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5" />and {Math.max(0, d.industryPreview.brands - d.industryPreview.rows.length)} more {d.industryPreview.label} brands in the full benchmark</span>
                        <a href="#pick" className="font-semibold text-primary hover:underline">Get it</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Why now ── */}
        <section className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Zap, t: "Decide before the rush", b: "Offers get locked in over the next fortnight. Knowing where rivals sit now means you price against facts, not guesses." },
                { icon: Download, t: "Instant and yours to keep", b: "A CSV the moment you pay. Sort it, filter it, drop it into your own pricing sheet. No logins, no subscription." },
                { icon: ShieldCheck, t: "Straight from public data", b: "We read the same public product feeds any shopper's browser can. No scraping behind logins, no private sales numbers." },
              ].map(({ icon: Icon, t, b }) => (
                <div key={t} className="rounded-2xl border border-border bg-card p-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Request ── */}
        <section id="request" className="scroll-mt-16 border-t border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Not on our list?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Request a snapshot of any Shopify store</h2>
              <p className="mb-6 mt-3 text-muted-foreground">
                Type the address of a competitor we do not track yet. We check it is a Shopify store, pull its whole catalogue, and offer you the snapshot for {REPORTS.company.display}. It usually takes under a minute.
              </p>
              <RequestForm price={REPORTS.company.display} />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <SectionHead eyebrow="Questions" title="Before you buy" />
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {[
                { q: "What exactly do I get?", a: "A CSV file you can open in Excel or Google Sheets. A brand snapshot lists every product the store sells with its price, original price, sale status and stock status. An industry benchmark compares every brand in a category side by side." },
                { q: "How fresh is the data?", a: "We read every store daily. Your file is built from the latest data at the moment you download it. Save your download link and open it again any time up to and beyond Cyber Monday to get a fresh copy." },
                { q: "How far back does the data go?", a: "We have tracked daily since July 2026. That makes this a live view of this year's run-up to Black Friday. We do not have last year's sale data, so we do not claim year-on-year comparisons." },
                { q: "Where does it come from?", a: "The public product feed every Shopify store exposes. We never log in to anyone's store, and we cannot see anyone's sales, traffic or orders. We show prices, products and stock, not revenue." },
                { q: "Can I get a store you do not list?", a: "Yes. Use the request form above. We check it is a Shopify store, pull the catalogue, and you can buy the snapshot straight away." },
                { q: "Is payment safe?", a: "Yes. Payments are handled by Stripe. We never see your card details." },
                { q: "Something wrong with my file?", a: <>Tell us on the <Link href="/contact" className="text-primary underline underline-offset-4">contact page</Link> and we will sort it out.</> },
              ].map(({ q, a }) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                    {q}
                    <span className="text-lg text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Walk into Black Friday knowing what they know.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Snapshots from {REPORTS.company.display}. Instant download. Live through Cyber Monday.</p>
            <div className="mt-6 flex justify-center"><Countdown /></div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#pick" className={ctaPrimary}>Choose my snapshot</a>
              <a href="#request" className={ctaGhost}>Request a brand</a>
            </div>
          </div>
        </section>
      </main>

      <StickyCta price={REPORTS.company.display} />
      <div className="h-16 sm:hidden" aria-hidden="true" />
      <Footer />
    </div>
  );
}

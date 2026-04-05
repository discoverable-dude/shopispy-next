"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Package, Clock, Tag, BarChart3 } from "lucide-react";
import { ALL_BRANDS, VERTICALS, type Brand } from "@/lib/brands";
import { slugify, getProductCount, categoriseChange, getChangeTypeColor, getChangeTypeLabel } from "@/lib/brandUtils";
import { BrandIcon } from "@/components/marketing/BrandIcon";

export function ComparisonTool() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Brand[]>([]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_BRANDS.filter(
      (b) => b.name.toLowerCase().includes(q) || b.domain.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const addBrand = (brand: Brand) => {
    if (selected.length >= 4) return;
    if (selected.find((b) => b.name === brand.name)) return;
    setSelected([...selected, brand]);
    setQuery("");
  };

  const removeBrand = (name: string) => {
    setSelected(selected.filter((b) => b.name !== name));
  };

  const getVerticalForBrand = (brand: Brand) => {
    return VERTICALS.find((v) => v.brands.some((b) => b.name === brand.name));
  };

  const maxProducts = selected.length > 0
    ? Math.max(...selected.map(getProductCount))
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Free tool</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Compare Shopify stores
        </h1>
        <p className="mt-3 text-muted-foreground">
          Select up to 4 brands to compare side by side.
        </p>
      </div>

      {/* Search + selection */}
      <div className="mx-auto mt-10 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands... (e.g. Gymshark, Fenty)"
            className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            disabled={selected.length >= 4}
          />

          {/* Dropdown */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-border bg-background shadow-lg"
              >
                {results.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => addBrand(brand)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <BrandIcon name={brand.name} domain={brand.domain} size="sm" />
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.domain}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{brand.products} products</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((brand) => (
              <span
                key={brand.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                {brand.name}
                <button onClick={() => removeBrand(brand.name)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selected.length < 4 && (
              <span className="text-[10px] text-muted-foreground self-center">
                {4 - selected.length} more available
              </span>
            )}
          </div>
        )}

        {/* Quick picks */}
        {selected.length === 0 && (
          <div className="mt-4">
            <p className="text-[10px] text-muted-foreground mb-2">Popular comparisons:</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["Gymshark", "Alo Yoga", "Vuori"],
                ["Fenty Beauty", "Glossier", "Rare Beauty"],
                ["Liquid Death", "Huel", "Magic Spoon"],
              ].map((group) => (
                <button
                  key={group.join("-")}
                  onClick={() => {
                    const brands = group.map((name) => ALL_BRANDS.find((b) => b.name === name)).filter(Boolean) as Brand[];
                    setSelected(brands);
                  }}
                  className="rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {group.join(" vs ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison table */}
      <AnimatePresence>
        {selected.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-12"
          >
            {/* Cards row */}
            <div className={`grid gap-4 ${
              selected.length === 2 ? "grid-cols-2" : selected.length === 3 ? "grid-cols-3" : "grid-cols-4"
            }`}>
              {selected.map((brand) => {
                const vertical = getVerticalForBrand(brand);
                const changeType = categoriseChange(brand.latestChange);
                const productCount = getProductCount(brand);
                const barWidth = maxProducts > 0 ? (productCount / maxProducts) * 100 : 0;

                return (
                  <div key={brand.name} className="rounded-2xl border border-border p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/brands/${slugify(brand.name)}`}
                          className="text-base font-semibold hover:text-primary transition-colors"
                        >
                          {brand.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">{brand.domain}</p>
                      </div>
                      <button
                        onClick={() => removeBrand(brand.name)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {vertical && (
                      <Link
                        href={`/industries/${slugify(vertical.label)}`}
                        className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground hover:text-foreground"
                      >
                        {vertical.label}
                      </Link>
                    )}

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Package className="h-3 w-3" /> Products
                          </span>
                          <span className="font-bold">{brand.products}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" /> Last update
                        </span>
                        <span className="font-medium">{brand.lastUpdate} ago</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Tag className="h-3 w-3" /> Latest change
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${getChangeTypeColor(changeType)}`}>
                            {getChangeTypeLabel(changeType)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{brand.latestChange}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary insights */}
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Quick insights
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="text-xs">
                  <p className="text-muted-foreground">Largest catalog</p>
                  <p className="font-semibold">
                    {[...selected].sort((a, b) => getProductCount(b) - getProductCount(a))[0]?.name} ({[...selected].sort((a, b) => getProductCount(b) - getProductCount(a))[0]?.products})
                  </p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground">Most recently updated</p>
                  <p className="font-semibold">
                    {[...selected].sort((a, b) => {
                      const parseTime = (t: string) => {
                        if (t.includes("1h")) return 1;
                        if (t.includes("2h")) return 2;
                        if (t.includes("3h")) return 3;
                        if (t.includes("4h")) return 4;
                        if (t.includes("5h")) return 5;
                        return 100;
                      };
                      return parseTime(a.lastUpdate) - parseTime(b.lastUpdate);
                    })[0]?.name} ({[...selected].sort((a, b) => {
                      const parseTime = (t: string) => {
                        if (t.includes("1h")) return 1; if (t.includes("2h")) return 2;
                        return 100;
                      };
                      return parseTime(a.lastUpdate) - parseTime(b.lastUpdate);
                    })[0]?.lastUpdate} ago)
                  </p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground">Industries represented</p>
                  <p className="font-semibold">
                    {new Set(selected.map((b) => getVerticalForBrand(b)?.label).filter(Boolean)).size} verticals
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <Link
                href="/scraper"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
              >
                Track these stores live
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {selected.length < 2 && (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Select at least 2 brands to compare.</p>
          <p className="mt-1 text-xs">Search from our database of {ALL_BRANDS.length} tracked Shopify stores.</p>
        </div>
      )}
    </div>
  );
}

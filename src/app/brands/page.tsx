import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VERTICALS, ALL_BRANDS } from "@/lib/brands";
import { slugify } from "@/lib/brandUtils";

export const metadata: Metadata = {
  title: "All Tracked Brands | ShopiSpy",
  description: `ShopiSpy tracks ${ALL_BRANDS.length} Shopify stores across ${VERTICALS.length} industries. Browse the full list of brands we monitor.`,
  alternates: { canonical: "/brands" },
};

export default function BrandsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All Tracked Brands
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {ALL_BRANDS.length} Shopify stores tracked across {VERTICALS.length} industries
          </p>
        </div>

        <div className="space-y-12">
          {VERTICALS.map((vertical) => (
            <section key={vertical.id}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                  {vertical.label}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({vertical.brands.length})
                  </span>
                </h2>
                <Link
                  href={`/industries/${slugify(vertical.label)}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  View all &rarr;
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {vertical.brands.map((brand) => (
                  <Link
                    key={brand.name}
                    href={`/brands/${slugify(brand.name)}`}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40 text-[10px] font-bold text-primary">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.domain}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {brand.products} products
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

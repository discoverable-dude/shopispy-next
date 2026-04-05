import { VERTICALS, ALL_BRANDS, type Brand, type Vertical } from "./brands";

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getVerticalBySlug(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => slugify(v.label) === slug || v.id === slug);
}

export function getBrandBySlug(slug: string): (Brand & { vertical: Vertical }) | undefined {
  for (const v of VERTICALS) {
    const brand = v.brands.find((b) => slugify(b.name) === slug);
    if (brand) return { ...brand, vertical: v };
  }
  return undefined;
}

export function getTopBrands(vertical: Vertical, count = 10): Brand[] {
  return [...vertical.brands]
    .sort((a, b) => {
      const aNum = parseInt(a.products.replace(/,/g, ""), 10) || 0;
      const bNum = parseInt(b.products.replace(/,/g, ""), 10) || 0;
      return bNum - aNum;
    })
    .slice(0, count);
}

export function getProductCount(brand: Brand): number {
  return parseInt(brand.products.replace(/,/g, ""), 10) || 0;
}

export function getVerticalStats(vertical: Vertical) {
  const counts = vertical.brands.map(getProductCount);
  const total = counts.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / counts.length);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const recentlyUpdated = vertical.brands.filter(
    (b) => b.lastUpdate.includes("1h") || b.lastUpdate.includes("2h") || b.lastUpdate.includes("3h")
  ).length;

  return { total, avg, max, min, brandCount: vertical.brands.length, recentlyUpdated };
}

export function getAllBrandSlugs(): string[] {
  return ALL_BRANDS.map((b) => slugify(b.name));
}

export function getAllVerticalSlugs(): string[] {
  return VERTICALS.map((v) => slugify(v.label));
}

export function getRelatedBrands(brand: Brand, vertical: Vertical, count = 6): Brand[] {
  return vertical.brands.filter((b) => b.name !== brand.name).slice(0, count);
}

// Categorise changes
export type ChangeType = "price_drop" | "price_increase" | "new_products" | "restock" | "sale" | "other";

export function categoriseChange(change: string): ChangeType {
  const lower = change.toLowerCase();
  if (lower.includes("-%") || lower.includes("price drop") || lower.includes("reduced") || lower.includes("clearance")) return "price_drop";
  if (lower.includes("+%") || lower.includes("price increase") || lower.includes("increase")) return "price_increase";
  if (lower.includes("new") || lower.includes("launch") || lower.includes("drop") || lower.includes("added") || lower.includes("collection")) return "new_products";
  if (lower.includes("restock") || lower.includes("restocked")) return "restock";
  if (lower.includes("sale") || lower.includes("discount")) return "sale";
  return "other";
}

export function getChangeTypeLabel(type: ChangeType): string {
  const labels: Record<ChangeType, string> = {
    price_drop: "Price Drop",
    price_increase: "Price Increase",
    new_products: "New Products",
    restock: "Restock",
    sale: "Sale",
    other: "Update",
  };
  return labels[type];
}

export function getChangeTypeColor(type: ChangeType): string {
  const colors: Record<ChangeType, string> = {
    price_drop: "text-red-600 bg-red-500/10",
    price_increase: "text-amber-600 bg-amber-500/10",
    new_products: "text-primary bg-primary/10",
    restock: "text-blue-600 bg-blue-500/10",
    sale: "text-orange-600 bg-orange-500/10",
    other: "text-muted-foreground bg-muted",
  };
  return colors[type];
}

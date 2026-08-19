// Single source of truth for the paid downloadable reports.
// Used by the checkout route, the download gate, and the buy buttons in the UI.

export type ReportId = "company" | "industry" | "market";

export interface ReportSpec {
  id: ReportId;
  label: string;
  // Price in the smallest currency unit (pence) — what Stripe charges.
  amount: number;
  currency: "gbp";
  // Human-readable price for the UI.
  display: string;
  blurb: string;
  // Stripe Price lookup_key for the catalogue product (see
  // scripts/setup-stripe-catalog.mjs). Checkout prefers this; if the price
  // isn't found it falls back to inline pricing from `amount`.
  lookup: string;
}

export const REPORTS: Record<ReportId, ReportSpec> = {
  company: {
    id: "company",
    label: "Company Snapshot",
    amount: 1900,
    currency: "gbp",
    display: "£19",
    blurb: "Full product-level catalogue export for one brand — every product, price, sale flag, stock status and image URL.",
    lookup: "shopispy_report_company",
  },
  industry: {
    id: "industry",
    label: "Industry Benchmark",
    amount: 9900,
    currency: "gbp",
    display: "£99",
    blurb: "Every brand in the vertical benchmarked side by side — product counts, price bands, sale intensity, top category and latest activity.",
    lookup: "shopispy_report_industry",
  },
  market: {
    id: "market",
    label: "Complete Market Report",
    amount: 49900,
    currency: "gbp",
    display: "£499",
    blurb: "Every tracked brand across all 16 industries in one file — the full competitive picture, benchmarked and ranked.",
    lookup: "shopispy_report_market",
  },
};

export function isReportId(v: unknown): v is ReportId {
  return v === "company" || v === "industry" || v === "market";
}

// Single source of truth for the paid downloadable reports.
// Used by the checkout route, the download gate, and the buy buttons in the UI.

export type ReportId = "company" | "industry";

export interface ReportSpec {
  id: ReportId;
  label: string;
  // Price in the smallest currency unit (pence) — what Stripe charges.
  amount: number;
  currency: "gbp";
  // Human-readable price for the UI.
  display: string;
  blurb: string;
}

export const REPORTS: Record<ReportId, ReportSpec> = {
  company: {
    id: "company",
    label: "Company Snapshot",
    amount: 1900,
    currency: "gbp",
    display: "£19",
    blurb: "Full product-level catalogue export for one brand — every product, price, sale flag, stock status and image URL.",
  },
  industry: {
    id: "industry",
    label: "Industry Benchmark",
    amount: 9900,
    currency: "gbp",
    display: "£99",
    blurb: "Every brand in the vertical benchmarked side by side — product counts, price bands, sale intensity, top category and latest activity.",
  },
};

export function isReportId(v: unknown): v is ReportId {
  return v === "company" || v === "industry";
}

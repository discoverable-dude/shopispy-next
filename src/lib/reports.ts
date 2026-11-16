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
    amount: 900,
    currency: "gbp",
    display: "£9",
    blurb: "Full product-level catalogue export for one brand — every product, price, sale flag, stock status and image URL.",
    lookup: "shopispy_report_company_v2",
  },
  industry: {
    id: "industry",
    label: "Industry Benchmark",
    amount: 2900,
    currency: "gbp",
    display: "£29",
    blurb: "Every brand in the vertical benchmarked side by side — product counts, price bands, sale intensity, top category and latest activity.",
    lookup: "shopispy_report_industry_v2",
  },
  market: {
    id: "market",
    label: "Complete Market Report",
    amount: 9900,
    currency: "gbp",
    display: "£99",
    blurb: "Every tracked brand across all 16 industries in one file — the full competitive picture, benchmarked and ranked.",
    lookup: "shopispy_report_market_v2",
  },
};

export function isReportId(v: unknown): v is ReportId {
  return v === "company" || v === "industry" || v === "market";
}

// The exact set of download paths our own checkout flow ever generates (see
// createReportCheckout in src/lib/stripe.ts). /reports/success reflects a
// `next` query param back into a redirect + link target, so it must be
// checked against this allowlist before use — never trust it as-is, or an
// attacker-crafted `next` (an absolute URL, a `javascript:` URI, `//host/...`)
// becomes an open redirect / DOM-XSS on our own domain.
const ALLOWED_DOWNLOAD_PREFIXES = ["/api/reports/company", "/api/reports/industry", "/api/reports/market"];

export function isSafeDownloadPath(path: string): boolean {
  if (typeof path !== "string" || path.length === 0) return false;
  // Reject protocol-relative ("//evil.com") and anything not a plain
  // same-origin path — a leading single "/" followed by our known prefix is
  // the only shape we accept.
  if (path.startsWith("//")) return false;
  return ALLOWED_DOWNLOAD_PREFIXES.some((p) => path === p || path.startsWith(`${p}?`));
}

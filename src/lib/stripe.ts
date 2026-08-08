import Stripe from "stripe";
import { REPORTS, type ReportId } from "./reports";

// Lazy singleton — instantiating at module load would crash any route that
// merely imports this file when STRIPE_SECRET_KEY is absent.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any });
  }
  return _stripe;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function siteOrigin(request: Request): string {
  // Prefer the configured public URL; fall back to the request origin so the
  // flow still works on preview deploys / localhost.
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

// Create a one-off Checkout Session for a single report. `target` is the
// domain (company report) or vertical slug (industry report).
export async function createReportCheckout(
  request: Request,
  report: ReportId,
  target: string,
  label: string,
): Promise<Stripe.Checkout.Session> {
  const spec = REPORTS[report];
  const origin = siteOrigin(request);
  const stripe = getStripe();

  // The download route reads `report`, `target` and `session_id` back out of
  // the success URL + session metadata to decide whether to serve the file.
  const downloadPath =
    report === "company"
      ? `/api/reports/company?domain=${encodeURIComponent(target)}`
      : `/api/reports/industry?slug=${encodeURIComponent(target)}`;

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: spec.currency,
          unit_amount: spec.amount,
          product_data: {
            name: `ShopiSpy ${spec.label} — ${label}`,
            description: spec.blurb,
          },
        },
      },
    ],
    metadata: { report, target },
    success_url: `${origin}/reports/success?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(downloadPath)}`,
    cancel_url: `${origin}${report === "company" ? `/brands` : `/industries`}`,
  });
}

// Server-side gate: is there a paid Checkout Session that matches exactly this
// report + target? Returns false for anything unpaid, mismatched, or invalid.
export async function hasPaidForReport(
  sessionId: string | null,
  report: ReportId,
  target: string,
): Promise<boolean> {
  if (!sessionId) return false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return (
      session.payment_status === "paid" &&
      session.metadata?.report === report &&
      session.metadata?.target === target
    );
  } catch {
    return false;
  }
}

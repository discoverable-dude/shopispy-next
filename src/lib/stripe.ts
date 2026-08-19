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

// Embedded Checkout needs a client-side publishable key; without it we serve the
// hosted redirect flow instead (secret key only).
export function embeddedCheckoutEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

// Resolve a catalogue Price by its stable lookup_key. Returns null if the
// catalogue isn't set up yet (caller falls back to inline pricing). Found ids
// are cached; misses are not, so a newly-created price is picked up promptly.
const _priceIdCache = new Map<string, string>();
async function resolvePriceId(lookupKey: string): Promise<string | null> {
  const cached = _priceIdCache.get(lookupKey);
  if (cached) return cached;
  try {
    const res = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    const id = res.data[0]?.id;
    if (id) _priceIdCache.set(lookupKey, id);
    return id ?? null;
  } catch {
    return null;
  }
}

function siteOrigin(request: Request): string {
  // Derive the origin from the request so the post-payment redirect always
  // returns the buyer to the exact domain they checked out from — the vercel.app
  // alias today, shopi-spy.com automatically after cutover. We deliberately do
  // NOT use NEXT_PUBLIC_SITE_URL here: it points at the old Vite site (which has
  // no /reports/success page) and can carry stray whitespace.
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || new URL(request.url).host;
  return `${proto}://${host}`.replace(/\/$/, "");
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
      : report === "industry"
        ? `/api/reports/industry?slug=${encodeURIComponent(target)}`
        : `/api/reports/market`;

  const successPath = `${origin}/reports/success?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(downloadPath)}`;

  // Prefer the catalogue Price (named product, clean Stripe reporting). If it
  // isn't set up yet, fall back to inline pricing so checkout still works.
  const catalogPriceId = await resolvePriceId(spec.lookup);
  const lineItems = catalogPriceId
    ? [{ quantity: 1, price: catalogPriceId }]
    : [
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
      ];

  // Use the inline embedded form when a publishable key is configured; otherwise
  // fall back to the hosted (redirect) Checkout, which needs no client key.
  if (embeddedCheckoutEnabled()) {
    return stripe.checkout.sessions.create({
      // "embedded" is correct for the pinned apiVersion 2023-10-16; the SDK's
      // types target a newer version that renamed it, hence the cast.
      ui_mode: "embedded" as any,
      mode: "payment",
      line_items: lineItems,
      metadata: { report, target },
      // Embedded Checkout redirects the host page here once payment completes.
      return_url: successPath,
    });
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata: { report, target },
    success_url: successPath,
    cancel_url: `${origin}${report === "company" ? `/brands` : `/reports`}`,
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

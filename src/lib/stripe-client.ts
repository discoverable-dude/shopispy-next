import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Load Stripe.js once for the whole app. The publishable key is safe to expose
// client-side (that's what NEXT_PUBLIC_ keys are for).
let _promise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk) return Promise.resolve(null);
  if (!_promise) _promise = loadStripe(pk);
  return _promise;
}

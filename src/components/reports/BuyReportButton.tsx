"use client";

import { useState, useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import type { ReportId } from "@/lib/reports";

interface Props {
  report: ReportId;
  target: string;
  label: string;
  price: string;
  className?: string;
  children?: React.ReactNode;
}

// Opens Stripe Embedded Checkout in an on-site modal. On successful payment,
// Stripe redirects the page to the session's return_url (/reports/success),
// which serves the download.
export function BuyReportButton({ report, target, label, price, className, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, target, label }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        setError(data.error || "Could not start checkout.");
        return;
      }
      setClientSecret(data.clientSecret);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const close = useCallback(() => setClientSecret(null), []);

  return (
    <div>
      <button type="button" onClick={open} disabled={loading} className={className}>
        {loading ? "Loading…" : children || `Buy report — ${price}`}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {clientSecret && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div
            className="relative my-8 w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900">
                {label} &middot; {price}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>
            <EmbeddedCheckoutProvider stripe={getStripeClient()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}
    </div>
  );
}

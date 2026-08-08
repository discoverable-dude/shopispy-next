"use client";

import { useState } from "react";
import type { ReportId } from "@/lib/reports";

interface Props {
  report: ReportId;
  target: string;
  label: string;
  price: string;
  className?: string;
  children?: React.ReactNode;
}

// Kicks off Stripe Checkout for a single report, then redirects the browser to
// the hosted payment page. On return, /reports/success serves the download.
export function BuyReportButton({ report, target, label, price, className, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, target, label }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={buy} disabled={loading} className={className}>
        {loading ? "Redirecting…" : children || `Buy report — ${price}`}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

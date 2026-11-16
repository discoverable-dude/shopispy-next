"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BuyReportButton } from "@/components/reports/BuyReportButton";

interface PickerBrand {
  name: string;
  domain: string;
  industry: string;
}

export function SnapshotPicker({ brands, price }: { brands: PickerBrand[]; price: string }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<PickerBrand | null>(null);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return brands.filter((b) => b.name.toLowerCase().includes(s) || b.domain.includes(s)).slice(0, 6);
  }, [q, brands]);

  return (
    <div>
      <label htmlFor="bf-brand-search" className="sr-only">Search brands</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="bf-brand-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPicked(null); }}
          placeholder={`Search ${brands.length} brands, e.g. Gymshark`}
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {!picked && matches.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
          {matches.map((b) => (
            <li key={b.domain}>
              <button
                type="button"
                onClick={() => { setPicked(b); setQ(b.name); }}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.industry}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!picked && q.trim().length >= 2 && matches.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Not one of ours yet. <a href="#request" className="font-medium text-primary underline underline-offset-4">Request it here</a> and we will add it.
        </p>
      )}

      {picked && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{picked.name}</p>
            <p className="text-xs text-muted-foreground">Every product, price, sale flag and stock status as a CSV</p>
          </div>
          <BuyReportButton
            report="company"
            target={picked.domain}
            label={picked.name}
            price={price}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
          >
            Get {picked.name} snapshot, {price}
          </BuyReportButton>
        </div>
      )}
    </div>
  );
}

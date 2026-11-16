"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { BuyReportButton } from "@/components/reports/BuyReportButton";

type Phase =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "working"; domain: string; tries: number }
  | { kind: "ready"; domain: string; products: number }
  | { kind: "slow"; domain: string }
  | { kind: "queued"; domain: string }
  | { kind: "not_shopify" }
  | { kind: "error"; message: string };

const POLL_MS = 4000;
const MAX_TRIES = 30; // about two minutes

export function RequestForm({ price }: { price: string }) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function poll(d: string, tries: number) {
    try {
      const res = await fetch(`/api/snapshot-request?domain=${encodeURIComponent(d)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.ready) {
        setPhase({ kind: "ready", domain: data.domain || d, products: data.products });
        return;
      }
    } catch {
      /* keep polling */
    }
    if (tries >= MAX_TRIES) {
      setPhase({ kind: "slow", domain: d });
      return;
    }
    setPhase({ kind: "working", domain: d, tries });
    timer.current = setTimeout(() => poll(d, tries + 1), POLL_MS);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhase({ kind: "sending" });
    try {
      const res = await fetch("/api/snapshot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase({ kind: "error", message: data.error || "Something went wrong. Please try again." });
        return;
      }
      if (data.status === "not_shopify") {
        setPhase({ kind: "not_shopify" });
        return;
      }
      if (data.status === "queued") {
        setPhase({ kind: "queued", domain: data.domain || domain });
        return;
      }
      if (data.status === "tracked") {
        const products = 0;
        setPhase({ kind: "ready", domain: data.domain, products });
        return;
      }
      poll(data.domain || domain, 0);
    } catch {
      setPhase({ kind: "error", message: "Could not reach us. Check your connection and try again." });
    }
  }

  const busy = phase.kind === "sending" || phase.kind === "working";

  if (phase.kind === "queued") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 text-lg font-bold">Request received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {phase.domain} looks like a Shopify store. We will add it and email you at {email} as soon as its snapshot is ready to download.
        </p>
      </div>
    );
  }

  if (phase.kind === "ready") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 text-lg font-bold">{phase.domain} is ready</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {phase.products > 0 ? `${phase.products.toLocaleString("en-GB")} products tracked. ` : ""}
          Get the full snapshot as a CSV, instantly.
        </p>
        <div className="mt-5 flex justify-center">
          <BuyReportButton
            report="company"
            target={phase.domain}
            label={phase.domain}
            price={price}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            Get {phase.domain} snapshot, {price}
          </BuyReportButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="req-domain" className="mb-1 block text-xs font-medium text-muted-foreground">Store website</label>
          <input
            id="req-domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="brand.com"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            required
            disabled={busy}
            className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="req-email" className="mb-1 block text-xs font-medium text-muted-foreground">Your email</label>
          <input
            id="req-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourstore.com"
            autoComplete="email"
            required
            disabled={busy}
            className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="req-company">Company</label>
        <input id="req-company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={busy || domain.trim() === "" || email.trim() === ""}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {phase.kind === "sending" ? "Checking the store..." : phase.kind === "working" ? "Pulling their catalogue..." : "Add this brand"}
      </button>

      {phase.kind === "working" && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          We are reading every product from {phase.domain} now. This can take a minute or two, keep this page open.
        </p>
      )}
      {phase.kind === "slow" && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          {phase.domain} is a big catalogue and is still loading. We have your request and email. Try again in a few minutes by entering the same address above.
        </p>
      )}
      {phase.kind === "not_shopify" && (
        <p className="text-center text-sm text-red-600" role="alert">
          That site does not look like a Shopify store, or its product feed is switched off, so we cannot snapshot it. Check the address and try again.
        </p>
      )}
      {phase.kind === "error" && (
        <p className="text-center text-sm text-red-600" role="alert">{phase.message}</p>
      )}
    </form>
  );
}

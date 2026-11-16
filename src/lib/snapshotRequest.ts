// Server-only helpers for "request a snapshot of a brand we don't list".
// A visitor types a domain and our server fetches it, so everything here is
// written to stop that being used to reach internal addresses (SSRF).

import dns from "node:dns/promises";
import net from "node:net";

const BAD_SUFFIX = /\.(local|localhost|internal|lan|home|corp|test|example|invalid|onion)$/;

// "https://www.Brand.com/products/x?y" -> "brand.com". null if not a plain public hostname.
export function normalizeDomainInput(raw: string): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim().toLowerCase();
  if (s.length === 0 || s.length > 253) return null;
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.split(/[/?#]/)[0];
  if (s.includes("@") || s.includes(":")) return null; // no userinfo, ports or IPv6 literals
  if (net.isIP(s)) return null;
  const labels = s.split(".");
  if (labels.length < 2) return null;
  if (!labels.every((l) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(l))) return null;
  if (!/^[a-z]{2,24}$/.test(labels[labels.length - 1])) return null;
  if (BAD_SUFFIX.test(s)) return null;
  return s;
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb");
}

async function assertPublicHost(host: string): Promise<void> {
  const addrs = await dns.lookup(host, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new Error("non-public host");
}

// Is this a Shopify storefront? Shopify exposes /products.json publicly.
// Follows at most 3 redirects, re-validating every hop host.
export async function probeShopify(domain: string): Promise<boolean> {
  let host = domain;
  for (let hop = 0; hop < 4; hop++) {
    const clean = normalizeDomainInput(host);
    if (!clean) return false;
    try {
      await assertPublicHost(clean);
    } catch {
      return false;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`https://${clean}/products.json?limit=1`, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": "ShopiSpy/1.0 (+https://www.shopi-spy.com)", Accept: "application/json" },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) return false;
        const next = new URL(loc, `https://${clean}/`);
        if (next.protocol !== "https:") return false;
        host = next.hostname;
        continue;
      }
      if (!res.ok) return false;
      if (!(res.headers.get("content-type") || "").includes("json")) return false;
      const body = await res.json();
      return Array.isArray(body?.products);
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
  return false;
}

export function isValidEmail(e: unknown): e is string {
  return typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

// Every way the same store may already be written in the stores table.
export function storeUrlVariants(domain: string): string[] {
  return [domain, `www.${domain}`, `https://${domain}`, `https://www.${domain}`, `http://${domain}`, `http://www.${domain}`];
}

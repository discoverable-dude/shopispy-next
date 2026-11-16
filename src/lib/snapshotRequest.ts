// Server-only helpers for "request a snapshot of a brand we don't list".
// A visitor types a domain and our server fetches it, so everything here is
// written to stop that being used to reach internal addresses (SSRF).

import dns from "node:dns";
import https from "node:https";
import net from "node:net";

const BAD_SUFFIX = /\.(local|localhost|internal|lan|home|corp|test|example|invalid|onion)$/;

function cleanHostname(raw: string, stripWww: boolean): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim().toLowerCase();
  if (s.length === 0 || s.length > 253) return null;
  s = s.replace(/^https?:\/\//, "");
  if (stripWww) s = s.replace(/^www\./, "");
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

// "https://www.Brand.com/products/x?y" -> "brand.com". null if not a plain public hostname.
export function normalizeDomainInput(raw: string): string | null {
  return cleanHostname(raw, true);
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

// Connect-time guard. Checking DNS first and then letting fetch() resolve the
// name again leaves a window (DNS rebinding): the first answer is public, the
// second points at an internal address. Instead the check runs inside the
// socket's own lookup, so the address we validate is the address we connect to.
const publicOnlyLookup = ((hostname: string, options: any, callback: any) => {
  dns.lookup(hostname, options, (err: any, address: any, family: any) => {
    if (err) return callback(err, address, family);
    const list: string[] = Array.isArray(address) ? address.map((a: any) => a.address) : [address];
    if (list.length === 0 || list.some((ip) => isPrivateIp(ip))) {
      return callback(new Error("non-public address"), address, family);
    }
    callback(null, address, family);
  });
}) as any;

const MAX_BODY_BYTES = 512 * 1024;

interface ProbeResponse {
  status: number;
  location?: string;
  contentType: string;
  body: string;
}

// One HTTPS GET with: connect-time public-IP enforcement, no redirect
// following, a hard timeout, and a response size cap.
function httpsGet(host: string, path: string): Promise<ProbeResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        port: 443,
        path,
        method: "GET",
        lookup: publicOnlyLookup,
        timeout: 6000,
        headers: { "User-Agent": "ShopiSpy/1.0 (+https://www.shopi-spy.com)", Accept: "application/json" },
      },
      (res) => {
        const status = res.statusCode || 0;
        const contentType = String(res.headers["content-type"] || "");
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, location: res.headers.location, contentType, body: "" });
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size > MAX_BODY_BYTES) {
            req.destroy(new Error("response too large"));
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ status, contentType, body: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", reject);
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

// Is this a Shopify storefront? Shopify exposes /products.json publicly.
// Follows at most 3 redirects, re-validating every hop's hostname.
export async function probeShopify(domain: string): Promise<boolean> {
  let host = domain;
  for (let hop = 0; hop < 4; hop++) {
    const clean = cleanHostname(host, hop === 0); // first hop is the visitor's input; later hops keep "www."
    if (!clean) return false;
    try {
      const res = await httpsGet(clean, "/products.json?limit=1");
      if (res.status >= 300 && res.status < 400) {
        if (!res.location) return false;
        const next = new URL(res.location, `https://${clean}/`);
        if (next.protocol !== "https:") return false;
        host = next.hostname;
        continue;
      }
      if (res.status < 200 || res.status >= 300) return false;
      if (!res.contentType.includes("json")) return false;
      const body = JSON.parse(res.body);
      return Array.isArray(body?.products);
    } catch {
      return false;
    }
  }
  return false;
}

export function isValidEmail(e: unknown): e is string {
  // Conservative character set: no angle brackets, quotes, backticks or other
  // markup characters, so the address is safe to echo into logs and chat messages.
  return typeof e === "string" && e.length <= 254 && /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/.test(e);
}

// Every way the same store may already be written in the stores table.
export function storeUrlVariants(domain: string): string[] {
  return [domain, `www.${domain}`, `https://${domain}`, `https://www.${domain}`, `http://${domain}`, `http://www.${domain}`];
}

import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// Pages that are safe to refresh on demand. Allow-listed so the endpoint cannot
// be used to invalidate arbitrary paths.
const ALLOWED = new Set(["/black-friday", "/reports", "/market", "/industries", "/"]);

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed: no secret configured, no access
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// POST /api/revalidate?path=/black-friday   Authorization: Bearer <CRON_SECRET>
// Call it after a deploy or a data refresh so cached pages rebuild on their next visit.
export async function POST(request: Request) {
  if (!authorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!ALLOWED.has(path)) return Response.json({ error: "Path not allowed" }, { status: 400 });
  revalidatePath(path);
  return Response.json({ revalidated: true, path });
}

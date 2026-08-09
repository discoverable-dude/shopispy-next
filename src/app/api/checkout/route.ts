import { createReportCheckout, stripeConfigured } from "@/lib/stripe";
import { isReportId } from "@/lib/reports";

// Creates a Stripe Checkout Session for a single report and returns its URL.
// Body: { report: "company" | "industry", target: string, label?: string }
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return Response.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { report, target, label } = body || {};
  if (!isReportId(report) || typeof target !== "string" || !target) {
    return Response.json({ error: "report and target are required" }, { status: 400 });
  }

  try {
    const session = await createReportCheckout(request, report, target, label || target);
    return Response.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.error("[checkout] failed:", err?.message);
    return Response.json({ error: "Could not start checkout" }, { status: 500 });
  }
}

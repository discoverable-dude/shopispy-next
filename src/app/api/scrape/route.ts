import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const endpoint = searchParams.get("endpoint") || "products.json";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "250";

  if (!domain) {
    return NextResponse.json({ error: "domain parameter required" }, { status: 400 });
  }

  // Sanitize domain to prevent SSRF
  const cleanDomain = domain.replace(/[^a-zA-Z0-9.-]/g, "");
  if (!cleanDomain.includes(".")) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  try {
    let url: string;
    if (endpoint === "products.json") {
      url = `https://${cleanDomain}/products.json?limit=${limit}&page=${page}`;
    } else if (endpoint === "shop.json") {
      url = `https://${cleanDomain}/shop.json`;
    } else if (endpoint === "cart.json") {
      url = `https://${cleanDomain}/cart.json`;
    } else if (endpoint.startsWith("products/") && endpoint.endsWith(".json")) {
      url = `https://${cleanDomain}/${endpoint}`;
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ShopiSpy/1.0 (https://www.shopi-spy.com)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from store" },
      { status: 502 }
    );
  }
}

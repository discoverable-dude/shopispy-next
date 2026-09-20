import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// `next` is attacker-controllable query input, so it must be validated before
// ever being concatenated into a redirect. String-concatenating a trusted
// origin with an untrusted path is NOT safe by construction: a value like
// "@evil.com" turns `${origin}${next}` into "https://<our-domain>@evil.com",
// which browsers parse as host "evil.com" (the URL userinfo/"@" trick) —
// an open redirect fired right after a real login succeeds, which makes it a
// highly convincing phishing vector. Only a plain same-origin path is safe.
function isSafeRedirectPath(path: string): boolean {
  if (typeof path !== "string" || path.length === 0) return false;
  if (!path.startsWith("/") || path.startsWith("//")) return false; // no protocol-relative
  if (/[\\@]/.test(path)) return false; // no backslash-normalization or userinfo tricks
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false; // no embedded scheme (javascript:, etc.)
  return true;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=Could+not+authenticate`);
}

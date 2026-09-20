"use client";

import { useEffect } from "react";

// Navigating to a Content-Disposition: attachment URL triggers the browser's
// download without leaving the confirmation page.
//
// Defense in depth: `url` ultimately traces back to a query string (see
// /reports/success), so even though the caller is expected to validate it
// first, we refuse to navigate anywhere that isn't a plain same-origin path.
// This is the only thing standing between a caller bug and an automatic
// (no-click) open redirect or `javascript:` URI execution.
function isSafeSameOriginPath(url: string): boolean {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//");
}

export function AutoDownload({ url }: { url: string }) {
  useEffect(() => {
    if (!isSafeSameOriginPath(url)) return;
    const t = setTimeout(() => {
      window.location.href = url;
    }, 800);
    return () => clearTimeout(t);
  }, [url]);
  return null;
}

"use client";

import { useEffect } from "react";

// Navigating to a Content-Disposition: attachment URL triggers the browser's
// download without leaving the confirmation page.
export function AutoDownload({ url }: { url: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = url;
    }, 800);
    return () => clearTimeout(t);
  }, [url]);
  return null;
}

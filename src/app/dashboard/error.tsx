"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("Dashboard error:", error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <h2 className="mt-4 text-sm font-semibold">Dashboard error</h2>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        Something went wrong loading this page. Your data is safe.
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
      >
        <RotateCcw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
}

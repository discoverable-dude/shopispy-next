"use client";

import { useEffect, useState } from "react";

// Black Friday 2026: Friday 27 November, midnight UK time (GMT in November).
const TARGET = Date.UTC(2026, 10, 27, 0, 0, 0);

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(TARGET - Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (left === null) return <span className="font-mono tabular-nums">&nbsp;</span>;
  if (left <= 0) return <span className="font-semibold">Black Friday is here</span>;

  const p = parts(left);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className="font-mono tabular-nums">
        {p.d}d {pad(p.h)}h {pad(p.m)}m {pad(p.s)}s
      </span>
    );
  }

  const cells: [string, number][] = [["days", p.d], ["hrs", p.h], ["min", p.m], ["sec", p.s]];
  return (
    <div className="flex items-center gap-2" role="timer" aria-label="Time until Black Friday">
      {cells.map(([label, n]) => (
        <div key={label} className="flex min-w-[3.5rem] flex-col items-center rounded-xl border border-border bg-card px-2 py-2 shadow-sm">
          <span className="font-mono text-2xl font-bold tabular-nums leading-none">{pad(n)}</span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

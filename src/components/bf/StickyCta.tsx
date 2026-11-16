"use client";

import { useEffect, useState } from "react";
import { Countdown } from "./Countdown";

// Mobile-only bar that appears once the visitor has scrolled past the hero.
export function StickyCta({ price }: { price: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="text-xs leading-tight text-muted-foreground">
          Black Friday in<br />
          <span className="text-sm font-semibold text-foreground"><Countdown compact /></span>
        </div>
        <a href="#pick" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
          Snapshots from {price}
        </a>
      </div>
    </div>
  );
}

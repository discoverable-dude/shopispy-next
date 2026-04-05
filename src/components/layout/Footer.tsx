"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/scraper", label: "Scraper" },
      { href: "/market", label: "Market" },
      { href: "/industries", label: "Industries" },
      { href: "/compare", label: "Compare" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/images/shopispy-logo-dark.png"
      : "/images/shopispy-logo-light.png";

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="ShopiSpy"
                width={110}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Shopify competitor intelligence. Track prices, monitor products,
              and stay ahead.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopiSpy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

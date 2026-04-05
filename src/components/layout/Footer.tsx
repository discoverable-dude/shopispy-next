"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/images/shopispy-logo-dark.png"
    : "/images/shopispy-logo-light.png";

  const links = [
    { href: "/market", label: "Market" },
    { href: "/industries", label: "Industries" },
    { href: "/reports", label: "Reports" },
    { href: "/compare", label: "Compare" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <footer className="border-t border-border/60 py-10 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/">
            <Image src={logoSrc} alt="ShopiSpy" width={100} height={24} className="h-6 w-auto opacity-60 hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopiSpy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

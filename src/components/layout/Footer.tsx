"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const links = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={
                mounted && resolvedTheme === "dark"
                  ? "/images/shopispy-logo-dark.png"
                  : "/images/shopispy-logo-light.png"
              }
              alt="ShopiSpy"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopiSpy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

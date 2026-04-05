"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "next-themes";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/images/shopispy-logo-dark.png"
      : "/images/shopispy-logo-light.png";

  const navLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/scraper", label: "Scraper" },
        { href: "/pricing", label: "Pricing" },
        { href: "/account", label: "Account" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/market", label: "Market" },
        { href: "/industries", label: "Industries" },
        { href: "/compare", label: "Compare" },
        { href: "/pricing", label: "Pricing" },
      ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="flex justify-center py-2 px-4">
        <motion.nav
          initial={false}
          animate={
            scrolled
              ? {
                  maxWidth: 720,
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 18,
                  boxShadow:
                    "0 4px 24px -4px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
                }
              : {
                  maxWidth: 1280,
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 0,
                  boxShadow: "0 0px 0px 0px rgba(0,0,0,0)",
                }
          }
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative flex w-full items-center justify-between border border-transparent backdrop-blur-lg ${
            scrolled
              ? "border-border/60 bg-background/80"
              : "bg-background/60"
          }`}
        >
          {/* Logo — left */}
          <Link href="/" className="relative z-10 flex shrink-0 items-center">
            <Image
              src={logoSrc}
              alt="ShopiSpy"
              width={120}
              height={30}
              className={`w-auto transition-all duration-200 ${
                scrolled ? "h-6" : "h-7"
              }`}
              priority
            />
          </Link>

          {/* Desktop nav — centered (absolute) */}
          <div className="absolute inset-0 hidden items-center justify-center md:flex">
            <div className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isActive(link.href)
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA — right */}
          <div className="relative z-10 hidden items-center md:flex">
            {user ? (
              <button
                onClick={signOut}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/scraper"
                className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="relative z-10 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </motion.nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2 text-sm ${
                  isActive(link.href)
                    ? "font-medium text-foreground bg-muted"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="mt-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/scraper"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

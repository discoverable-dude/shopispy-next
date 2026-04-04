"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "next-themes";

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === "dark"
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
        { href: "/scraper", label: "Try It Free" },
        { href: "/pricing", label: "Pricing" },
        { href: "/faq", label: "FAQ" },
      ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={
              resolvedTheme === "dark"
                ? "/images/shopispy-logo-dark.png"
                : "/images/shopispy-logo-light.png"
            }
            alt="ShopiSpy"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut} className="ml-2">
              Sign Out
            </Button>
          ) : (
            <Link href="/scraper" className="ml-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Try It Free
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-background px-4 pb-4 md:hidden"
        >
          <nav className="flex flex-col gap-2 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href) ? "text-primary bg-primary/5" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Link href="/scraper" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Try It Free
                </Button>
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        className="text-lg px-8"
        onClick={() => router.push("/auth")}
      >
        Start Tracking Free
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="text-lg px-8"
        onClick={() => router.push("/scraper")}
      >
        Try Demo
      </Button>
    </div>
  );
}

export function CtaButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        className="text-lg px-8"
        onClick={() => router.push("/auth")}
      >
        Start Free Trial
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="text-lg px-8"
        onClick={() => router.push("/pricing")}
      >
        View Pricing
      </Button>
    </div>
  );
}

export function LandingHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ShopiSpy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/pricing")}>
              Pricing
            </Button>
            <Button onClick={() => router.push("/auth")}>Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import { AuthContent } from "@/components/marketing/AuthContent";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your ShopiSpy account or create a new one to start tracking competitor prices and products.",
  alternates: { canonical: "/auth" },
  robots: { index: false },
};

export default function AuthPage() {
  return <AuthContent />;
}

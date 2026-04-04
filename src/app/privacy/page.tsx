import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, FadeInView } from "@/components/motion";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ShopiSpy collects, uses, and protects your personal information. We are committed to GDPR compliance and data security.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <FadeIn>
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </FadeIn>

        <FadeInView delay={0.05}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We collect information that you provide directly to us,
                including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Competitor store URLs you choose to monitor</li>
                <li>
                  Payment information (processed securely through Stripe)
                </li>
                <li>Communication preferences and alert settings</li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.1}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>
                  Process your transactions and manage subscriptions
                </li>
                <li>
                  Send you alerts and notifications about competitor activities
                </li>
                <li>Improve and optimize our platform</li>
                <li>
                  Communicate with you about updates and features
                </li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.15}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>3. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect
                your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure authentication through Supabase</li>
                <li>Regular security audits and updates</li>
                <li>
                  Compliance with GDPR and data protection regulations
                </li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.2}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>4. Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We do not sell your personal information. We may share data
                with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Service providers (Stripe for payments, Resend for emails)
                </li>
                <li>Law enforcement when required by law</li>
                <li>
                  Analytics providers to improve our service (anonymized data
                  only)
                </li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.25}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Close your account at any time</li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.3}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We use essential cookies to maintain your session and
                preferences. We do not use tracking cookies without your
                consent.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.35}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>7. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                For privacy-related questions, contact us at:{" "}
                <a
                  href="mailto:privacy@shopispy.com"
                  className="text-primary hover:underline"
                >
                  privacy@shopispy.com
                </a>
              </p>
              <p className="mt-4 text-sm">Last updated: January 2025</p>
            </CardContent>
          </Card>
        </FadeInView>
      </main>

      <Footer />
    </div>
  );
}

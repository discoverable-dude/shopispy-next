import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, FadeInView } from "@/components/motion";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the ShopiSpy Terms of Service. Understand your rights and responsibilities when using our Shopify competitor intelligence platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <FadeIn>
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Terms of Service
          </h1>
        </FadeIn>

        <FadeInView delay={0.05}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using ShopiSpy, you accept and agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use our service.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.1}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                ShopiSpy provides competitive intelligence tools for eCommerce
                businesses, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Competitor store monitoring</li>
                <li>Product tracking and price alerts</li>
                <li>Data export and analytics</li>
                <li>Email and Slack notifications</li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.15}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>3. Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your use complies with all applicable laws</li>
                <li>Not sharing your account with others</li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.2}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal purposes</li>
                <li>
                  Attempt to gain unauthorized access to our systems
                </li>
                <li>Interfere with or disrupt the service</li>
                <li>
                  Scrape or harvest data beyond your subscription limits
                </li>
                <li>
                  Resell or redistribute our data without permission
                </li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.25}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>5. Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Subscriptions renew automatically unless cancelled
                </li>
                <li>
                  Prices are subject to change with 30 days notice
                </li>
                <li>
                  Refunds are provided within 30 days of initial purchase
                </li>
                <li>You can cancel your subscription at any time</li>
                <li>
                  Payment processing is handled securely by Stripe
                </li>
              </ul>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.3}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>6. Data Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                While we strive for accuracy, we cannot guarantee that all
                data is 100% accurate or up-to-date. The service is provided
                &quot;as is&quot; and you use it at your own risk.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.35}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                All content, features, and functionality of ShopiSpy are
                owned by us and protected by international copyright,
                trademark, and other intellectual property laws.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.4}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                ShopiSpy shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from
                your use of the service.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.45}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate your account if
                you violate these terms or engage in fraudulent activity.
              </p>
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.5}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>10. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Questions about these terms? Contact us at:{" "}
                <a
                  href="mailto:legal@shopispy.com"
                  className="text-primary hover:underline"
                >
                  legal@shopispy.com
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

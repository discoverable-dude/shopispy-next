import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn, FadeInView } from "@/components/motion";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { faqJsonLd } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about ShopiSpy, including pricing, features, data accuracy, security, and how to get started.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    question: "How does ShopiSpy work?",
    answer:
      "ShopiSpy monitors competitor Shopify stores by periodically checking their product catalogs. We track pricing changes, new products, inventory levels, and send you instant alerts when important changes occur.",
  },
  {
    question: "Is it legal to monitor competitor stores?",
    answer:
      "Yes, monitoring publicly available information on competitor websites is completely legal. We only access data that's publicly visible to any website visitor.",
  },
  {
    question: "How often is data updated?",
    answer:
      "Free plan gets weekly updates, Lite and Starter plans get daily monitoring, Pro plan gets daily scraping, and Enterprise gets custom frequency (including hourly). You can also trigger manual scans at any time.",
  },
  {
    question: "What stores can I monitor?",
    answer:
      "You can monitor any Shopify store. The number of stores depends on your plan: Free and Lite allow 1 store, Starter allows 2 stores, Pro allows up to 10 stores, and Enterprise offers unlimited stores.",
  },
  {
    question: "Can I export the data?",
    answer:
      "Yes! CSV export is available on Lite, Starter, Pro, and Enterprise plans. Free plan users can view data in the dashboard but cannot export. Pro and Enterprise plans also include scheduled exports.",
  },
  {
    question: "What kind of alerts can I set up?",
    answer:
      "You can set up alerts for price changes, new products, out-of-stock items, and product updates. Alerts are delivered via email and can be integrated with Slack.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! You can try the tool for free before signing up, and then start with our Free plan (no credit card required). Upgrade to paid plans anytime for more features.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee. If you're not satisfied within the first 30 days of your paid subscription, contact us for a full refund.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We use industry-standard encryption, secure authentication, and comply with GDPR. Your payment information is processed securely through Stripe.",
  },
  {
    question: "Can I integrate ShopiSpy with other tools?",
    answer:
      "Yes! We offer Slack integration for alerts and provide data export in multiple formats. API access is available for enterprise plans.",
  },
  {
    question: "What if a store blocks your access?",
    answer:
      "We use advanced techniques to ensure reliable monitoring. If we detect any issues accessing a store, we'll notify you immediately and work to resolve it.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(faqs)),
        }}
      />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about ShopiSpy
            </p>
          </div>
        </FadeIn>

        <FadeInView delay={0.1}>
          <Card className="border-primary/20 shadow-glow">
            <CardContent className="pt-6">
              <FaqAccordion faqs={faqs} />
            </CardContent>
          </Card>
        </FadeInView>

        <FadeInView delay={0.2}>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact our support team &rarr;
            </Link>
          </div>
        </FadeInView>
      </main>

      <Footer />
    </div>
  );
}

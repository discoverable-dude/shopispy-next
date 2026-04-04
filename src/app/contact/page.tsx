import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeIn, FadeInView } from "@/components/motion";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Send, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the ShopiSpy team. We typically respond within 24 hours. Ask about features, pricing, or get help with your account.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We&apos;re here to help!
            </p>
          </div>
        </FadeIn>

        <FadeInView delay={0.1}>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-primary/20 shadow-glow">
              <CardHeader>
                <Send className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Use the form below</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-glow">
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Help Center</CardTitle>
                <CardDescription>Browse FAQs</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/faq" className="text-primary hover:underline">
                  Visit FAQ
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Find instant answers
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeInView>

        <FadeInView delay={0.2}>
          <Card className="border-primary/20 shadow-glow">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </FadeInView>
      </main>

      <Footer />
    </div>
  );
}

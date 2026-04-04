import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FadeIn,
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import {
  LandingHeader,
  HeroButtons,
  CtaButtons,
} from "@/components/marketing/OutOfStockButtons";
import {
  PackageX,
  TrendingUp,
  Bell,
  Target,
  DollarSign,
  Zap,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Out-of-Stock Monitoring - Capture Competitor Lost Sales",
  description:
    "Automatically monitor competitor inventory and get instant alerts when they run out of stock. Capture the sales they're losing while you still have inventory.",
  alternates: { canonical: "/out-of-stock" },
};

const benefits = [
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Capture Lost Sales",
    description:
      "Automatically identify when competitors run out of stock and redirect that demand to your store.",
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Instant Alerts",
    description:
      "Get real-time notifications the moment a competitor's product goes out of stock.",
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Strategic Advantage",
    description:
      "Know your competitor's inventory weaknesses before they do.",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Maximize Revenue",
    description:
      "Turn competitor stockouts into your profit opportunities with targeted campaigns.",
  },
];

const stats = [
  {
    number: "73%",
    label: "of shoppers buy from alternatives when items are out of stock",
  },
  {
    number: "2.5x",
    label: "higher conversion rates during competitor stockouts",
  },
  {
    number: "<5min",
    label: "average time to get notified of stockout events",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Track Competitors",
    description:
      "Add your competitors' Shopify stores to monitor their inventory in real-time.",
  },
  {
    step: "2",
    title: "Set Smart Alerts",
    description:
      "Configure alerts for specific products or categories you want to capitalize on.",
  },
  {
    step: "3",
    title: "Get Notified Instantly",
    description:
      "Receive immediate notifications via email or Slack when items go out of stock.",
  },
  {
    step: "4",
    title: "Capitalize Quickly",
    description:
      "Launch targeted ads, email campaigns, or adjust pricing while competitors are unable to fulfill orders.",
  },
];

export default function OutOfStockPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="mb-4" variant="outline">
                <PackageX className="w-4 h-4 mr-2" />
                Real-Time Stock Monitoring
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Their Stockout Is Your Opportunity
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Automatically monitor competitor inventory and get instant
                alerts when they run out of stock. Capture the sales
                they&apos;re losing while you still have inventory.
              </p>
              <HeroButtons />
            </div>
          </FadeIn>

          {/* Stats */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <Card className="text-center border-2">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Turn Competitor Weaknesses Into Your Wins
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Don&apos;t let potential customers slip away to other
                competitors when your rivals run out of stock.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <StaggerItem key={index}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Set up monitoring in minutes and start capitalizing on
                competitor stockouts today.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <StaggerItem key={index}>
                <div className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-1/2" />
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Real-World Scenarios
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how businesses are using stockout alerts to dominate
                their markets.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggerItem>
              <Card>
                <CardContent className="pt-6">
                  <Zap className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Flash Sales</h3>
                  <p className="text-muted-foreground mb-4">
                    When competitor A runs out of popular sneakers, immediately
                    launch a flash sale on your similar products.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Capture 40% of lost traffic</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card>
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">
                    Targeted Campaigns
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Run Google/Meta ads targeting competitor brand keywords
                    when they&apos;re out of stock.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3x lower CPC during stockouts</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card>
                <CardContent className="pt-6">
                  <Clock className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">
                    Perfect Timing
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Send email campaigns to your list highlighting in-stock
                    alternatives to competitor products.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2.5x higher open rates</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInView>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-12 text-center">
                <PackageX className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Never Miss Another Stockout Opportunity
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join hundreds of e-commerce businesses that are capturing
                  competitor sales with real-time stockout monitoring.
                </p>
                <CtaButtons />
                <p className="text-sm text-muted-foreground mt-6">
                  No credit card required &bull; Cancel anytime &bull; Setup
                  in 5 minutes
                </p>
              </CardContent>
            </Card>
          </FadeInView>
        </div>
      </section>

      <Footer />
    </div>
  );
}

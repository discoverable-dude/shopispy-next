"use client";

import { Search, BarChart3, Bell, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, StaggerItem, HoverScale } from "@/components/motion";
import { FadeInView } from "@/components/motion";

const features = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Track Competitor Pricing",
    description:
      "Monitor live competitor store prices and see exactly what they\u2019re charging right now.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Spot Price Changes Instantly",
    description:
      "Get notified the moment competitors change prices so you can adjust your strategy.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Real-time Product Alerts",
    description:
      "Know immediately when competitors launch new products or update their catalog.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Export Complete Catalogs",
    description:
      "Download full competitor product data to analyze and plan your competitive pricing.",
  },
];

export function HomepageFeatures() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeInView className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything You Need for Competitive Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Stop guessing. Start using competitor data to make smarter pricing decisions.
          </p>
        </FadeInView>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <HoverScale>
                <Card className="border-2 transition-shadow hover:shadow-lg h-full">
                  <CardHeader className="pb-4">
                    <div className="mb-2 text-primary">{feature.icon}</div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </HoverScale>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

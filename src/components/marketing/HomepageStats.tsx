"use client";

import { StaggerContainer, StaggerItem, CountUp } from "@/components/motion";

const stats = [
  { label: "Competitor Stores Tracked", value: "10,000+" },
  { label: "Products Monitored", value: "2.5M+" },
  { label: "Price Alerts Sent", value: "500K+" },
  { label: "Extra Revenue Generated", value: "\u00a350M+" },
];

export function HomepageStats() {
  return (
    <section className="border-y border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <StaggerItem
              key={index}
              className="space-y-2 rounded-lg border border-primary/10 bg-background/50 p-4 text-center backdrop-blur"
            >
              <div className="text-2xl font-bold sm:text-3xl md:text-4xl">
                <CountUp
                  value={stat.value}
                  className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                />
              </div>
              <div className="text-sm font-medium text-muted-foreground sm:text-base">
                {stat.label}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

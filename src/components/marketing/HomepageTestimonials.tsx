"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer, StaggerItem, HoverScale } from "@/components/motion";
import { FadeInView } from "@/components/motion";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "eCommerce Manager",
    company: "Fashion Forward",
    quote:
      "ShopISpy helped us stay competitive with real-time price tracking. We adjusted our pricing strategy and saw a 47% increase in sales.",
  },
  {
    name: "Mike Chen",
    role: "Founder",
    company: "TechGadgets",
    quote:
      "Getting instant alerts when competitors change prices has been invaluable. We can react quickly and maintain our market position.",
  },
  {
    name: "Emma Rodriguez",
    role: "Marketing Director",
    company: "HomeDecor Plus",
    quote:
      "The ability to track multiple competitor stores and export their product data has transformed how we approach pricing. Absolute game changer.",
  },
];

export function HomepageTestimonials() {
  return (
    <section className="bg-muted/50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeInView className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Trusted by eCommerce Stores Worldwide
          </h2>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Real results from stores using competitor intelligence
          </p>
        </FadeInView>

        <StaggerContainer className="grid gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <HoverScale>
                <Card className="h-full bg-background">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-6 flex-grow italic text-muted-foreground">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="mt-auto">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
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

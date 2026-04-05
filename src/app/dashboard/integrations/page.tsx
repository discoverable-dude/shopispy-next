"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Webhook, Plug } from "lucide-react";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const Integrations = () => {
  const { tierConfig, tierName } = useSubscriptionLimits();
  const hasSlack = tierConfig.alerts.channels.includes("slack");
  const hasWebhook = tierConfig.alerts.channels.includes("webhook");

  const integrations = [
    {
      name: "Slack",
      description: "Get price alerts and new product notifications directly in Slack.",
      detail:
        "Receive real-time alerts in your Slack channels when competitors change prices or add new products.",
      icon: MessageSquare,
      available: hasSlack,
      badgeLabel: hasSlack ? "Available" : "Enterprise",
    },
    {
      name: "Email Notifications",
      description: "Configure custom email alerts for price changes.",
      detail:
        "Set up email notifications for specific products, price thresholds, and more. Available on all plans.",
      icon: Mail,
      available: true,
      badgeLabel: "Available",
    },
    {
      name: "Webhooks",
      description: "Connect to your own systems with custom webhooks.",
      detail:
        "Send alert data to any endpoint for custom integrations and workflows.",
      icon: Webhook,
      available: hasWebhook,
      badgeLabel: hasWebhook ? "Available" : "Enterprise",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <Plug className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Integrations
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[44px]">
          Connect your favourite tools and get alerts where you work.
        </p>
      </div>

      {/* Upgrade prompt for non-enterprise users */}
      {!hasSlack && !hasWebhook && (
        <UpgradePrompt
          feature="Custom Integrations"
          requiredTier="enterprise"
          description="Unlock Slack, webhook, and SMS alert channels with an Enterprise plan."
        />
      )}

      {/* Integration cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card
            key={integration.name}
            className={`rounded-2xl border-border/60 transition-colors ${
              !integration.available ? "opacity-60" : "hover:border-primary/30"
            }`}
          >
            <CardContent className="p-6 space-y-4">
              {/* Icon + badge row */}
              <div className="flex items-start justify-between">
                <div
                  className={`rounded-xl p-2.5 ${
                    integration.available
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <integration.icon
                    className={`h-5 w-5 ${
                      integration.available
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <Badge
                  variant={integration.available ? "default" : "secondary"}
                  className="rounded-lg text-[10px] font-semibold px-2 py-0.5"
                >
                  {integration.badgeLabel}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {integration.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {integration.description}
                </p>
              </div>

              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {integration.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Integrations;

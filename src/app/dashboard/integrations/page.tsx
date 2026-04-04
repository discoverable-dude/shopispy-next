"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Webhook } from "lucide-react";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const Integrations = () => {
  const { tierConfig, tierName } = useSubscriptionLimits();
  const hasSlack = tierConfig.alerts.channels.includes("slack");
  const hasWebhook = tierConfig.alerts.channels.includes("webhook");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite tools and get alerts where you work
        </p>
      </div>

      {!hasSlack && !hasWebhook && (
        <UpgradePrompt
          feature="Custom Integrations"
          requiredTier="enterprise"
          description="Unlock Slack, webhook, and SMS alert channels with an Enterprise plan."
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className={`relative ${!hasSlack ? "opacity-60" : ""}`}>
          <Badge
            className="absolute top-4 right-4"
            variant={hasSlack ? "default" : "secondary"}
          >
            {hasSlack
              ? "Available"
              : tierName === "pro"
                ? "Enterprise"
                : "Enterprise"}
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Slack</CardTitle>
            </div>
            <CardDescription>
              Get price alerts and new product notifications directly in Slack
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Receive real-time alerts in your Slack channels when competitors
            change prices or add new products.
          </CardContent>
        </Card>

        <Card className="relative">
          <Badge className="absolute top-4 right-4" variant="default">
            Available
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure custom email alerts for price changes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set up email notifications for specific products, price thresholds,
            and more. Available on all plans.
          </CardContent>
        </Card>

        <Card className={`relative ${!hasWebhook ? "opacity-60" : ""}`}>
          <Badge
            className="absolute top-4 right-4"
            variant={hasWebhook ? "default" : "secondary"}
          >
            {hasWebhook ? "Available" : "Enterprise"}
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Webhooks</CardTitle>
            </div>
            <CardDescription>
              Connect to your own systems with custom webhooks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Send alert data to any endpoint for custom integrations and
            workflows.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;

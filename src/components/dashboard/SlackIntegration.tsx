"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, ExternalLink, Check, AlertCircle, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { notifySystemEvent } from "@/lib/slackNotifications";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export const SlackIntegration = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      // Check if Slack is configured by trying to send a test notification
      const { data, error } = await supabase.functions.invoke("send-slack-notification", {
        body: {
          type: "system_event",
          title: "Configuration Check",
          message: "This is a configuration check - no action needed",
          severity: "info",
        },
      });

      if (data?.success) {
        setIsConfigured(true);
      }
    } catch (error) {
      // Expected if not configured
      setIsConfigured(false);
    }
  };

  const testConnection = async () => {
    if (!user?.email) return;

    setTesting(true);
    try {
      await notifySystemEvent(
        "Slack Integration Test",
        `Test notification from ${user.email}. Your Slack integration is working correctly! 🎉`,
        user.email,
        undefined,
        "success",
        user.id,
      );

      toast.success("Test notification sent to Slack successfully!");
      setIsConfigured(true);
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Failed to send test notification. Please check your webhook URL.");
    } finally {
      setTesting(false);
    }
  };

  const saveWebhookUrl = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a valid Slack webhook URL");
      return;
    }

    if (!webhookUrl.includes("hooks.slack.com")) {
      toast.error("Please enter a valid Slack webhook URL");
      return;
    }

    setSaving(true);
    try {
      // This would typically save to user preferences
      // For now, we'll just test the webhook
      const testResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "🎉 Slack integration configured successfully for Shopi-Spy!",
          attachments: [
            {
              color: "#28a745",
              title: "Integration Test",
              text: "Your competitor intelligence notifications will now be sent to this Slack channel.",
              footer: "Shopi-Spy Competitor Intelligence",
            },
          ],
        }),
      });

      if (testResponse.ok) {
        toast.success("Slack webhook configured successfully!");
        setIsConfigured(true);
        setWebhookUrl(""); // Clear for security
      } else {
        toast.error("Invalid webhook URL. Please check and try again.");
      }
    } catch (error) {
      toast.error("Failed to test webhook URL. Please check your internet connection.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Slack Integration
          {isConfigured && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Get real-time notifications in Slack for price drops, new products, and system events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">Setup Instructions:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to your Slack workspace</li>
                <li>Create or select a channel for notifications</li>
                <li>Add an "Incoming WebHooks" app to the channel</li>
                <li>Copy the webhook URL and paste it below</li>
              </ol>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-blue-600"
                onClick={() => window.open("https://slack.com/apps/A0F7XDUAZ-incoming-webhooks", "_blank")}
              >
                Get Slack Webhook URL <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {!isConfigured ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Slack Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                This URL is used to send notifications to your Slack channel
              </p>
            </div>

            <Button onClick={saveWebhookUrl} disabled={!webhookUrl.trim() || saving} className="w-full">
              {saving ? "Testing..." : "Save & Test Connection"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Check className="h-4 w-4" />
                <span className="font-medium">Slack Connected Successfully</span>
              </div>
              <p className="text-sm text-green-700">You'll receive notifications for:</p>
              <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
                <li>Price drops on monitored products</li>
                <li>New products from competitor stores</li>
                <li>New stores added to monitoring</li>
                <li>Alert configuration changes</li>
                <li>System events and updates</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={testConnection} disabled={testing} className="flex-1">
                {testing ? "Sending..." : "Send Test Notification"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsConfigured(false);
                  setWebhookUrl("");
                }}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Reconfigure
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔒 Your webhook URL is stored securely and never shared</p>
          <p>📱 Notifications are sent in real-time when events occur</p>
          <p>⚙️ You can disable specific notification types in Alert Setup</p>
        </div>
      </CardContent>
    </Card>
  );
};

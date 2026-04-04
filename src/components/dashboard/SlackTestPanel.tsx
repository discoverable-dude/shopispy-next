"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { sendSlackNotification, notifyPriceDrop, notifyNewProduct, notifyStoreAdded, notifyAlertSetup, notifySystemEvent } from "@/lib/slackNotifications";
import { toast } from "sonner";

export const SlackTestPanel = () => {
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState('');

  const testNotifications = [
    {
      name: 'Price Drop Alert',
      description: 'Competitor price decreased',
      action: () => notifyPriceDrop(
        'LA Brewery Co',
        'labrewery.co.uk',
        'Craft IPA 6-Pack',
        '£24.99',
        '£19.99',
        'test-user-id'
      )
    },
    {
      name: 'New Product Alert',
      description: 'New product detected',
      action: () => notifyNewProduct(
        'LA Brewery Co',
        'labrewery.co.uk',
        'Limited Edition Stout',
        'test-user-id'
      )
    },
    {
      name: 'Store Added',
      description: 'New competitor store monitored',
      action: () => notifyStoreAdded(
        'LA Brewery Co',
        'labrewery.co.uk',
        47,
        'test@example.com',
        'test-user-id'
      )
    },
    {
      name: 'Alert Setup',
      description: 'User configured alerts',
      action: () => notifyAlertSetup(
        'LA Brewery Co',
        'labrewery.co.uk',
        'test@example.com',
        'price and new product alerts',
        'test-user-id'
      )
    },
    {
      name: 'System Event - Success',
      description: 'User subscription event',
      action: () => notifySystemEvent(
        'New Subscription',
        'test@example.com has subscribed to the Pro plan',
        'test@example.com',
        'Pro',
        'success',
        'test-user-id'
      )
    },
    {
      name: 'System Event - Warning',
      description: 'System maintenance alert',
      action: () => notifySystemEvent(
        'Scheduled Maintenance',
        'System maintenance scheduled for tonight at 2 AM UTC. Monitoring will be temporarily paused.',
        undefined,
        undefined,
        'warning'
      )
    },
    {
      name: 'Custom Rich Notification',
      description: 'Advanced formatting example',
      action: () => sendSlackNotification({
        type: 'system_event',
        title: 'ShopisPy Test Suite Complete',
        message: 'All Slack notification types have been tested successfully! 🎉\n\nThe integration is working perfectly and ready for production use.',
        data: {
          user_email: 'system@shopispy.com',
          subscription_tier: 'Enterprise'
        },
        severity: 'success'
      })
    }
  ];

  const runTest = async (test: any) => {
    setTesting(true);
    setLastTest(test.name);

    try {
      const result = await test.action();

      if (result.success) {
        toast.success(`${test.name} notification sent successfully!`);
      } else {
        toast.error(`Failed to send ${test.name}: ${result.error}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
      setLastTest('');
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    let successCount = 0;

    for (const test of testNotifications) {
      setLastTest(test.name);
      try {
        const result = await test.action();
        if (result.success) {
          successCount++;
        }
        // Add delay between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Test ${test.name} failed:`, error);
      }
    }

    setTesting(false);
    setLastTest('');

    toast.success(`Test suite complete! ${successCount}/${testNotifications.length} notifications sent successfully.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Slack Notification Test Panel
        </CardTitle>
        <CardDescription>
          Test different types of Slack notifications to see how they appear in your channel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={runAllTests}
            disabled={testing}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {testing && lastTest === '' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Run All Tests
          </Button>

          <Badge variant="outline">
            {testNotifications.length} notification types
          </Badge>
        </div>

        <div className="grid gap-4">
          {testNotifications.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-muted-foreground">{test.description}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => runTest(test)}
                disabled={testing}
              >
                {testing && lastTest === test.name ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground space-y-1 mt-6">
          <p>💡 These are sample notifications with test data</p>
          <p>🔧 Make sure your Slack webhook URL is configured first</p>
          <p>📱 Check your Slack channel after sending notifications</p>
        </div>
      </CardContent>
    </Card>
  );
};

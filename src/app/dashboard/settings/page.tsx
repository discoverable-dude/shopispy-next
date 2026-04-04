"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { User, Crown, CreditCard, Bell, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { user, subscribed } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">
              Email
            </div>
            <div className="text-base">{user?.email}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">
              Account Type
            </div>
            <div className="flex items-center gap-2">
              {subscribed ? (
                <>
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-base font-medium text-primary">
                    Premium
                  </span>
                </>
              ) : (
                <span className="text-base">Free</span>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/account")}>
            Manage Account
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscribed ? (
            <>
              <p className="text-sm text-muted-foreground">
                You&apos;re on the Premium plan with unlimited access to all
                features.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/account")}
              >
                Manage Billing
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Upgrade to Premium for unlimited competitor tracking and advanced
                features.
              </p>
              <Button
                onClick={() => router.push("/pricing")}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your notification preferences in the Integrations section.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/integrations")}
          >
            Configure Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push("/account")}
          >
            View Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

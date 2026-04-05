"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { User, Crown, CreditCard, Bell, Shield, Settings as SettingsIcon, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { user, subscribed } = useAuth();
  const router = useRouter();

  const settingsSections = [
    {
      icon: User,
      title: "Account Information",
      description: "Your account details and status",
      content: (
        <div className="space-y-4">
          <div className="grid gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <span className="text-sm text-foreground">{user?.email}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Account Type
            </span>
            <div className="flex items-center gap-2">
              {subscribed ? (
                <>
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Premium
                  </span>
                </>
              ) : (
                <span className="text-sm">Free</span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs font-semibold"
            onClick={() => router.push("/account")}
          >
            Manage Account
          </Button>
        </div>
      ),
    },
    {
      icon: CreditCard,
      title: "Subscription",
      description: "Manage your subscription and billing",
      content: (
        <div className="space-y-4">
          {subscribed ? (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You&apos;re on the Premium plan with unlimited access to all
                features.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold"
                onClick={() => router.push("/account")}
              >
                Manage Billing
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upgrade to Premium for unlimited competitor tracking and
                advanced features.
              </p>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                onClick={() => router.push("/pricing")}
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Premium
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure how you receive alerts",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage your notification preferences in the Integrations section.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
            onClick={() => router.push("/dashboard/integrations")}
          >
            Configure Notifications
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Security",
      description: "Manage your security settings",
      content: (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
          onClick={() => router.push("/account")}
        >
          View Security Settings
          <ArrowRight className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[44px]">
          Manage your account and preferences.
        </p>
      </div>

      {/* Settings cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card
            key={section.title}
            className="rounded-2xl border-border/60"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                  <section.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60" />

              {/* Content */}
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;

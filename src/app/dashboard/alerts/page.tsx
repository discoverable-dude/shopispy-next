"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAlertsPanel } from "@/components/dashboard/EnhancedAlertsPanel";
import { AlertSetup } from "@/components/dashboard/AlertSetup";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

const Alerts = () => {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Alerts
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[44px]">
          Price changes and new product notifications.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          <TabsTrigger
            value="setup"
            data-tour="alerts-setup"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Alert Setup
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Configure Alerts
                </h2>
                <AlertSetup />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Recent Notifications
                </h2>
                <EnhancedAlertsPanel />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAlertsPanel } from "@/components/dashboard/EnhancedAlertsPanel";
import { AlertSetup } from "@/components/dashboard/AlertSetup";

const Alerts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Price Alerts</h1>
        <p className="text-muted-foreground">
          Get notified when competitors change prices or add products
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup" data-tour="alerts-setup">
            Alert Setup
          </TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <AlertSetup />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <EnhancedAlertsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;

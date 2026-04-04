"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, Download, Settings } from "lucide-react";

interface ScheduleSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'json';
  lastExport?: string;
  nextExport?: string;
}

interface Props {
  storeName: string;
  onExport: (format: 'csv' | 'json') => void;
}

export const ScheduledExportSettings = ({ storeName, onExport }: Props) => {
  const [settings, setSettings] = useState<ScheduleSettings>({
    enabled: false,
    frequency: 'weekly',
    format: 'csv'
  });

  const storageKey = `scheduled-export-${storeName}`;

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load schedule settings:', error);
      }
    }
  }, [storageKey]);

  // Save settings to localStorage
  const saveSettings = (newSettings: ScheduleSettings) => {
    setSettings(newSettings);
    localStorage.setItem(storageKey, JSON.stringify(newSettings));
  };

  // Calculate next export time
  const calculateNextExport = (frequency: string): Date => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  // Set up scheduled export
  useEffect(() => {
    if (!settings.enabled || !storeName) return;

    const checkAndExport = () => {
      const now = new Date();
      const lastExport = settings.lastExport ? new Date(settings.lastExport) : null;

      let shouldExport = false;

      if (!lastExport) {
        shouldExport = true;
      } else {
        const timeDiff = now.getTime() - lastExport.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        switch (settings.frequency) {
          case 'daily':
            shouldExport = daysDiff >= 1;
            break;
          case 'weekly':
            shouldExport = daysDiff >= 7;
            break;
          case 'monthly':
            shouldExport = daysDiff >= 30;
            break;
        }
      }

      if (shouldExport) {
        onExport(settings.format);
        const newSettings = {
          ...settings,
          lastExport: now.toISOString(),
          nextExport: calculateNextExport(settings.frequency).toISOString()
        };
        saveSettings(newSettings);
        toast.success(`Scheduled ${settings.format.toUpperCase()} export completed for ${storeName}`, {
          duration: 5000
        });
      }
    };

    // Check immediately and then every hour
    checkAndExport();
    const interval = setInterval(checkAndExport, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.frequency, settings.format, settings.lastExport, storeName, onExport]);

  const handleEnableToggle = (enabled: boolean) => {
    const newSettings = {
      ...settings,
      enabled,
      nextExport: enabled ? calculateNextExport(settings.frequency).toISOString() : undefined
    };
    saveSettings(newSettings);

    if (enabled) {
      toast.success(`Scheduled exports enabled for ${storeName}`, {
        description: `${settings.frequency} ${settings.format.toUpperCase()} exports will be automatically generated`
      });
    } else {
      toast.info(`Scheduled exports disabled for ${storeName}`);
    }
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    const newSettings = {
      ...settings,
      frequency,
      nextExport: settings.enabled ? calculateNextExport(frequency).toISOString() : undefined
    };
    saveSettings(newSettings);
  };

  const handleFormatChange = (format: 'csv' | 'json') => {
    const newSettings = { ...settings, format };
    saveSettings(newSettings);
  };

  const triggerManualExport = () => {
    onExport(settings.format);
    const now = new Date();
    const newSettings = {
      ...settings,
      lastExport: now.toISOString(),
      nextExport: settings.enabled ? calculateNextExport(settings.frequency).toISOString() : undefined
    };
    saveSettings(newSettings);
    toast.success(`Manual ${settings.format.toUpperCase()} export completed`);
  };

  if (!storeName) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Scheduled Exports for {storeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Scheduled Exports</Label>
            <div className="text-sm text-muted-foreground">
              Automatically export product data at regular intervals
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleEnableToggle}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Export Frequency</Label>
                <Select value={settings.frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={settings.format} onValueChange={handleFormatChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-sm">
              {settings.lastExport && (
                <div>
                  <Label className="text-xs text-muted-foreground">Last Export</Label>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(settings.lastExport).toLocaleString()}
                  </p>
                </div>
              )}

              {settings.nextExport && (
                <div>
                  <Label className="text-xs text-muted-foreground">Next Export</Label>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(settings.nextExport).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <Button onClick={triggerManualExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Now ({settings.format.toUpperCase()})
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Browser-based scheduling requires the tab to remain open. For production use, consider implementing server-side scheduling.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

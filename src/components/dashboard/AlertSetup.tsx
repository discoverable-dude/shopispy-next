"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, Settings, Save, Lock, Store, Info } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { notifyAlertSetup } from "@/lib/slackNotifications";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getTierConfig, FREQUENCY_LABELS } from "@/config/tierConfig";

interface AlertPreference {
  id: string;
  store_url: string;
  store_name: string | null;
  price_alerts_enabled: boolean;
  product_alerts_enabled: boolean;
  notification_frequency: string;
  email_notifications: boolean;
}

interface TrackedStore {
  store_url: string;
  store_name: string;
  product_count: number;
}

const normalizeUrl = (url: string) =>
  url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

export const AlertSetup = () => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier = 'free' } = useAuth();
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([]);
  const [trackedStores, setTrackedStores] = useState<TrackedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const tier = user ? (subscribed ? (subscriptionTier?.toLowerCase() ?? 'free') : 'free') : 'free';
  const fullTierConfig = getTierConfig(subscriptionTier, subscribed);
  const tierConfig = fullTierConfig.alerts;

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const [{ data: preferences }, { data: scrapes }, { data: allStores }] = await Promise.all([
        supabase.from('alert_preferences').select('*').eq('user_id', user.id),
        supabase.from('user_scrapes').select('store_url').eq('user_id', user.id),
        supabase.from('stores').select('*'),
      ]);

      setAlertPreferences(preferences || []);

      // Deduplicate stores by normalized URL
      const seen = new Set<string>();
      const uniqueScrapeUrls: string[] = [];
      for (const s of scrapes || []) {
        const norm = normalizeUrl(s.store_url);
        if (!seen.has(norm)) {
          seen.add(norm);
          uniqueScrapeUrls.push(s.store_url);
        }
      }

      const storesWithInfo = await Promise.all(
        uniqueScrapeUrls.map(async (url) => {
          const normalized = normalizeUrl(url);
          const matchedStore = (allStores || []).find((s) => normalizeUrl(s.store_url) === normalized);
          let productCount = 0;
          if (matchedStore) {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('store_id', matchedStore.id);
            productCount = count || 0;
          }
          return {
            store_url: url,
            store_name: matchedStore?.store_name || normalized,
            product_count: productCount,
          };
        })
      );

      setTrackedStores(storesWithInfo);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (storeUrl: string, preferences: Partial<AlertPreference>) => {
    if (!user) return;
    try {
      setSaving(storeUrl);
      const { id, ...updateFields } = preferences;

      const { error } = await supabase
        .from('alert_preferences')
        .upsert(
          { user_id: user.id, store_url: storeUrl, ...updateFields },
          { onConflict: 'user_id,store_url' }
        );

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save alert preferences');
        return;
      }

      if (user?.email) {
        try {
          const alertTypes = [];
          if (updateFields.price_alerts_enabled) alertTypes.push('price alerts');
          if (updateFields.product_alerts_enabled) alertTypes.push('new product alerts');
          if (alertTypes.length > 0) {
            await notifyAlertSetup(
              updateFields.store_name || storeUrl,
              storeUrl,
              user.email,
              alertTypes.join(' and '),
              user.id
            );
          }
        } catch {}
      }

      setAlertPreferences((prev) => {
        const existing = prev.find((p) => p.store_url === storeUrl);
        if (existing) {
          return prev.map((p) => (p.store_url === storeUrl ? { ...p, ...preferences } : p));
        }
        return [
          ...prev,
          {
            id: '',
            store_url: storeUrl,
            store_name: null,
            price_alerts_enabled: false,
            product_alerts_enabled: false,
            notification_frequency: tierConfig.frequencies[0],
            email_notifications: true,
            ...preferences,
          } as AlertPreference,
        ];
      });

      toast.success('Alert preferences saved');
    } catch {
      toast.error('Failed to save alert preferences');
    } finally {
      setSaving(null);
    }
  };

  const deletePreferences = async (storeUrl: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('alert_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('store_url', storeUrl);

      if (error) {
        toast.error('Failed to delete alert preferences');
        return;
      }
      setAlertPreferences((prev) => prev.filter((p) => p.store_url !== storeUrl));
      toast.success('Alert preferences removed');
    } catch {
      toast.error('Failed to delete alert preferences');
    }
  };

  const getPreferencesForStore = (storeUrl: string): AlertPreference => {
    const existing = alertPreferences.find((p) => p.store_url === storeUrl);
    if (existing) return existing;
    return {
      id: '',
      store_url: storeUrl,
      store_name: null,
      price_alerts_enabled: false,
      product_alerts_enabled: false,
      notification_frequency: tierConfig.frequencies[0],
      email_notifications: true,
    };
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Tier info */}
      <Alert className="border-border bg-muted/40">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {fullTierConfig.displayName} plan — {tierConfig.priceAlerts ? 'Price & new product alerts' : 'New product alerts (weekly digest only)'}
            </p>
          </div>
          {tier === 'free' && (
            <Button size="sm" variant="outline" onClick={() => (window.location.href = '/pricing')}>
              Upgrade for more alerts
            </Button>
          )}
        </AlertDescription>
      </Alert>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading stores...</CardContent>
        </Card>
      ) : trackedStores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-1">No tracked stores yet</p>
            <p className="text-sm text-muted-foreground">Analyze a competitor store first to set up alerts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trackedStores.map((store) => {
            const prefs = getPreferencesForStore(store.store_url);
            const hasAlerts = prefs.price_alerts_enabled || prefs.product_alerts_enabled;

            return (
              <Card key={store.store_url} className={hasAlerts ? 'border-primary/40' : ''}>
                <CardContent className="pt-5 pb-4 space-y-4">
                  {/* Store header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{store.store_name}</h3>
                        <p className="text-xs text-muted-foreground">{store.product_count} products tracked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAlerts && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                      {saving === store.store_url && (
                        <Save className="h-3.5 w-3.5 animate-pulse text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Alert toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price Alerts */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`price-${store.store_url}`} className="text-sm">
                          Price Alerts
                        </Label>
                        {tierConfig.priceAlerts ? (
                          <Switch
                            id={`price-${store.store_url}`}
                            checked={prefs.price_alerts_enabled}
                            onCheckedChange={(checked) =>
                              savePreferences(store.store_url, { ...prefs, price_alerts_enabled: checked })
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => (window.location.href = '/pricing')}
                            >
                              Upgrade to Lite
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tierConfig.priceAlerts
                          ? 'Get notified when prices change'
                          : 'Available on Lite plan and above'}
                      </p>
                    </div>

                    {/* Product Alerts */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`product-${store.store_url}`} className="text-sm">
                          New Product Alerts
                        </Label>
                        <Switch
                          id={`product-${store.store_url}`}
                          checked={prefs.product_alerts_enabled}
                          onCheckedChange={(checked) =>
                            savePreferences(store.store_url, { ...prefs, product_alerts_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Get notified of new products</p>
                    </div>
                  </div>

                  {/* Frequency + email (shown when alerts active) */}
                  {hasAlerts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Frequency</Label>
                        <Select
                          value={prefs.notification_frequency}
                          onValueChange={(value) =>
                            savePreferences(store.store_url, { ...prefs, notification_frequency: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tierConfig.frequencies.map((freq) => (
                              <SelectItem key={freq} value={freq}>
                                {FREQUENCY_LABELS[freq] || freq}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {tierConfig.frequencies.length === 1 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Upgrade for more frequency options
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`email-${store.store_url}`} className="text-sm">
                            Email Notifications
                          </Label>
                          <Switch
                            id={`email-${store.store_url}`}
                            checked={prefs.email_notifications}
                            onCheckedChange={(checked) =>
                              savePreferences(store.store_url, { ...prefs, email_notifications: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remove button */}
                  {hasAlerts && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePreferences(store.store_url)}
                        className="text-destructive hover:text-destructive/80 h-8 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove Alerts
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

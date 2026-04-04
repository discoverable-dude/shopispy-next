"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingDown, TrendingUp, Package, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  store_url: string;
  store_name: string | null;
  product_id: number;
  product_title: string;
  alert_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  read_at: string | null;
}

export const AlertsPanel = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      setAlerts(data || []);
      setUnreadCount(data?.filter(alert => !alert.read_at).length || 0);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('product_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId)
        .eq('user_id', user?.id ?? '');

      if (error) {
        console.error('Error marking alert as read:', error);
        return;
      }

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, read_at: new Date().toISOString() }
            : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('product_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking all alerts as read:', error);
        return;
      }

      setAlerts(prev =>
        prev.map(alert => ({
          ...alert,
          read_at: alert.read_at || new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_increase':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'price_decrease':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'new_product':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'out_of_stock':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'back_in_stock':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'on_sale':
        return <TrendingDown className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertMessage = (alert: Alert) => {
    switch (alert.alert_type) {
      case 'price_increase':
        return `Price increased from ${alert.old_value} to ${alert.new_value}`;
      case 'price_decrease':
        return `Price decreased from ${alert.old_value} to ${alert.new_value}`;
      case 'new_product':
        return 'New product added to store';
      case 'out_of_stock':
        return 'Product went out of stock';
      case 'back_in_stock':
        return 'Product back in stock';
      case 'on_sale':
        return `Product now on sale: ${alert.new_value} (was ${alert.old_value})`;
      default:
        return 'Product update detected';
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'price_increase':
        return 'destructive';
      case 'price_decrease':
      case 'back_in_stock':
      case 'on_sale':
        return 'default';
      case 'new_product':
        return 'secondary';
      case 'out_of_stock':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (!user) {
    return null;
  }

  const unreadAlerts = alerts.filter(alert => !alert.read_at);
  const readAlerts = alerts.filter(alert => alert.read_at);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Product Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading alerts...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts yet</p>
            <p className="text-sm text-muted-foreground">
              Set up price monitoring to get notified of changes
            </p>
          </div>
        ) : (
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({alerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-3 mt-4">
              {unreadAlerts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No unread alerts</p>
                </div>
              ) : (
                unreadAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{alert.product_title}</p>
                        <Badge variant={getAlertColor(alert.alert_type) as any} className="text-xs">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getAlertMessage(alert)}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {alert.store_name || alert.store_url} • {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="h-6 px-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3 mt-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-opacity ${
                    alert.read_at ? 'opacity-60' : 'bg-muted/30'
                  }`}
                >
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{alert.product_title}</p>
                      <Badge variant={getAlertColor(alert.alert_type) as any} className="text-xs">
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                      {alert.read_at && (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {getAlertMessage(alert)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.store_name || alert.store_url} • {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Mail, Clock, TrendingDown, Package, Trash2, MailCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProductAlert {
  id: string;
  product_title: string;
  store_name: string | null;
  store_url: string;
  alert_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  read_at: string | null;
  email_sent: boolean;
  product_id: number;
  user_id: string;
}

export const EnhancedAlertsPanel = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ProductAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadAlerts();
      // Set up real-time alerts
      const channel = supabase
        .channel('alerts-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'product_alerts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New alert received:', payload);
            loadAlerts();
            toast.success('New price alert received!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading alerts:', error);
        toast.error('Failed to load alerts');
        return;
      }

      setAlerts(data || []);
      setUnreadCount(data?.filter(alert => !alert.read_at).length || 0);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
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

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, read_at: new Date().toISOString() }
          : alert
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('product_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id ?? '')
        .is('read_at', null);

      if (error) {
        console.error('Error marking all alerts as read:', error);
        toast.error('Failed to mark alerts as read');
        return;
      }

      // Update local state
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        read_at: alert.read_at || new Date().toISOString()
      })));
      setUnreadCount(0);
      toast.success('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast.error('Failed to mark alerts as read');
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('product_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user?.id ?? '');

      if (error) {
        console.error('Error deleting alert:', error);
        toast.error('Failed to delete alert');
        return;
      }

      // Update local state
      const deletedAlert = alerts.find(a => a.id === alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      if (deletedAlert && !deletedAlert.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Alert deleted');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_drop':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'new_product':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-orange-600" />;
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'price_drop':
        return 'Price Drop';
      case 'new_product':
        return 'New Product';
      default:
        return 'Alert';
    }
  };

  const formatPriceChange = (alert: ProductAlert) => {
    if (alert.alert_type === 'price_drop' && alert.old_value && alert.new_value) {
      const oldPrice = parseFloat(alert.old_value);
      const newPrice = parseFloat(alert.new_value);
      const savings = oldPrice - newPrice;
      const percentOff = Math.round((savings / oldPrice) * 100);

      return (
        <div className="text-sm">
          <p className="font-medium text-green-600">
            £{newPrice.toFixed(2)} (was £{oldPrice.toFixed(2)})
          </p>
          <p className="text-green-600">
            Save £{savings.toFixed(2)} ({percentOff}% off)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Price & Product Alerts</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          Real-time notifications for price changes and new products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="text-center py-8">
                <p className="font-medium mb-2">No alerts yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up price monitoring to get notified when competitor prices drop
                </p>
                <Button size="sm" onClick={() => window.location.href = '#alert-setup'}>
                  Set up alerts
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={!alert.read_at ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.product_title}</p>
                        <p className="text-sm text-muted-foreground">{alert.store_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <Badge variant={alert.alert_type === 'price_drop' ? 'default' : 'secondary'}>
                          {getAlertTypeLabel(alert.alert_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPriceChange(alert) || (
                        <Badge variant="outline">New Product</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.email_sent && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <MailCheck className="h-3 w-3" />
                            Email sent
                          </div>
                        )}
                        {!alert.read_at && (
                          <Badge variant="destructive" className="text-xs">
                            Unread
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!alert.read_at && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(alert.id)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

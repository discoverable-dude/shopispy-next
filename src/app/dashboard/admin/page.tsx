"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Mail,
  BarChart3,
  Shield,
  AlertTriangle,
  Trash2,
  Ban,
  CheckCircle,
  ExternalLink,
  KeyRound,
  Settings,
  RefreshCw,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserWithRole {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  role?: string;
}

interface UserStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalScrapes: number;
  totalAlerts: number;
}

export default function Admin() {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalScrapes: 0,
    totalAlerts: 0,
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const loadAdminData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_data");
      if (error) throw error;
      const d = typeof data === "string" ? JSON.parse(data) : data;
      setStats(d.stats);
      setUsers(d.users);
      setRecentAlerts(d.alerts);
    } catch (e) {
      console.error("Load admin data error:", e);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
  }, [supabase, toast]);

  const checkAdminAccess = useCallback(async () => {
    if (!user) return;
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const hasAdmin = roles?.some((r) => r.role === "admin") || false;
      setIsAdmin(hasAdmin);
      if (hasAdmin) await loadAdminData();
    } catch (e) {
      console.error("Admin check error:", e);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, loadAdminData]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const invokeAdmin = async (
    action: string,
    userId: string,
    email?: string
  ) => {
    setActionLoading(`${action}-${userId}`);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-user-management",
        {
          body: { action, userId, email },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Success",
        description: data.message || "Action completed",
      });

      // Notify Slack about admin actions
      const actionLabels: Record<string, string> = {
        reset_password: "Password Reset Sent",
        delete_user: "User Deleted",
        disable_user: "User Disabled",
        enable_user: "User Enabled",
      };
      supabase.functions
        .invoke("send-slack-notification", {
          body: {
            type: "admin_action",
            title: `Admin: ${actionLabels[action] || action}`,
            message: `Action "${action}" performed on ${email || userId}`,
            data: {
              admin_email: user?.email,
              user_email: email,
              action_detail: actionLabels[action] || action,
            },
            severity: action === "delete_user" ? "warning" : "info",
          },
        })
        .catch((err) =>
          console.error("Slack admin notification failed:", err)
        );

      await loadAdminData();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Send Password Reset",
      description: `Send a password reset email to ${email}?`,
      onConfirm: () => invokeAdmin("reset_password", userId, email),
    });
  };

  const handleDeleteUser = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete User",
      description: `Permanently delete ${email}? This removes all their data and cannot be undone.`,
      onConfirm: () => invokeAdmin("delete_user", userId, email),
    });
  };

  const handleDisableUser = (userId: string, email: string) => {
    setConfirmDialog({
      open: true,
      title: "Disable User",
      description: `Disable ${email}'s account? They will not be able to log in.`,
      onConfirm: () => invokeAdmin("disable_user", userId, email),
    });
  };

  const handleEnableUser = (userId: string, email: string) => {
    invokeAdmin("enable_user", userId, email);
  };

  const handleStripeLink = async (userId: string) => {
    setActionLoading(`stripe-${userId}`);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-user-management",
        {
          body: { action: "get_stripe_portal_url", userId },
        }
      );
      if (error) throw error;
      if (data?.stripe_url) {
        window.open(data.stripe_url, "_blank");
      } else {
        toast({
          title: "No Stripe customer",
          description: data?.message || "No billing info found",
        });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const assignRole = async (
    userId: string,
    role: "admin" | "moderator" | "user"
  ) => {
    setActionLoading(`role-${userId}`);
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      if (role !== "user") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
      toast({ title: "Success", description: `Role updated to ${role}` });
      await loadAdminData();
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const runAlertMonitoring = async () => {
    setActionLoading("monitoring");
    try {
      const { data, error } = await supabase.functions.invoke("monitor-alerts");
      if (error) throw error;
      toast({
        title: "Monitoring Complete",
        description: `Processed ${data.alertsProcessed} alerts, sent ${data.emailsSent} emails`,
      });
      await loadAdminData();
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to run monitoring",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium">Access Denied</p>
          <p className="text-sm">
            You don&apos;t have permission to access the admin panel.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, subscriptions, and system operations
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAdminData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users },
          {
            label: "Active Subscriptions",
            value: stats.activeSubscriptions,
            icon: BarChart3,
          },
          {
            label: "Total Scrapes",
            value: stats.totalScrapes,
            icon: Settings,
          },
          {
            label: "Alert Notifications",
            value: stats.totalAlerts,
            icon: Mail,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="alerts">Alert Monitoring</TabsTrigger>
          <TabsTrigger value="system">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users & Actions</CardTitle>
              <CardDescription>
                Manage users, reset passwords, view billing, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <p className="font-medium">
                          {u.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {u.id.slice(0, 8)}...
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "default"
                              : u.role === "moderator"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {u.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleResetPassword(u.id, u.email)
                            }
                            disabled={
                              actionLoading === `reset_password-${u.id}`
                            }
                            title="Send password reset"
                          >
                            <KeyRound className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStripeLink(u.id)}
                            disabled={actionLoading === `stripe-${u.id}`}
                            title="View in Stripe"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDisableUser(u.id, u.email)
                            }
                            disabled={
                              u.id === user?.id ||
                              actionLoading === `disable_user-${u.id}`
                            }
                            title="Disable user"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEnableUser(u.id, u.email)
                            }
                            disabled={
                              actionLoading === `enable_user-${u.id}`
                            }
                            title="Enable user"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              assignRole(
                                u.id,
                                u.role === "admin" ? "user" : "admin"
                              )
                            }
                            disabled={
                              u.id === user?.id ||
                              actionLoading === `role-${u.id}`
                            }
                            title={
                              u.role === "admin"
                                ? "Remove admin"
                                : "Make admin"
                            }
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteUser(u.id, u.email)
                            }
                            disabled={
                              u.id === user?.id ||
                              actionLoading === `delete_user-${u.id}`
                            }
                            title="Delete user"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest price and product alerts sent to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No alerts found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <p className="font-medium">
                            {alert.profiles?.full_name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.profiles?.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {alert.product_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.store_name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.alert_type === "price_drop"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {alert.alert_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {alert.alert_type === "price_drop" && (
                            <div className="text-sm">
                              <p>
                                £{alert.old_value} → £
                                {alert.new_value}
                              </p>
                              <p className="text-green-600">
                                -
                                {(
                                  ((parseFloat(alert.old_value) -
                                    parseFloat(alert.new_value)) /
                                    parseFloat(alert.old_value)) *
                                  100
                                ).toFixed(0)}
                                %
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(
                            alert.created_at
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
              <CardDescription>Manage system operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Alert Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Run price monitoring to check for changes and send alerts
                  </p>
                </div>
                <Button
                  onClick={runAlertMonitoring}
                  disabled={actionLoading === "monitoring"}
                >
                  {actionLoading === "monitoring"
                    ? "Running..."
                    : "Run Monitoring"}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Security Reminders</p>
                  <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                    <li>Enable leaked password protection in Supabase</li>
                    <li>Reduce OTP expiry time</li>
                    <li>Keep Postgres updated</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({ ...prev, open: false }));
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

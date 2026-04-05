"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Card,
  CardContent,
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
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-6">
          <div className="rounded-lg bg-destructive/10 p-2">
            <Shield className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Access Denied
            </p>
            <p className="text-xs text-muted-foreground">
              You don&apos;t have permission to access the admin panel.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Scrapes",
      value: stats.totalScrapes,
      icon: Settings,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Alert Notifications",
      value: stats.totalAlerts,
      icon: Mail,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin Panel
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[44px]">
            Manage users, subscriptions, and system operations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
          onClick={loadAdminData}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-border/60 bg-card"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          <TabsTrigger
            value="users"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Alert Monitoring
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            System Controls
          </TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Users &amp; Actions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage users, reset passwords, view billing, and more.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Joined
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-border/60">
                        <TableCell>
                          <p className="text-sm font-medium">
                            {u.full_name || "N/A"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {u.id.slice(0, 8)}...
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === "admin"
                                ? "default"
                                : u.role === "moderator"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="rounded-lg text-[10px] font-semibold px-2 py-0.5"
                          >
                            {u.role || "user"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 rounded-lg p-0"
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
                              className="h-7 w-7 rounded-lg p-0"
                              onClick={() => handleStripeLink(u.id)}
                              disabled={actionLoading === `stripe-${u.id}`}
                              title="View in Stripe"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 rounded-lg p-0"
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
                              className="h-7 w-7 rounded-lg p-0"
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
                              className="h-7 w-7 rounded-lg p-0"
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
                              className="h-7 w-7 rounded-lg p-0"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts tab */}
        <TabsContent value="alerts">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Recent Alerts
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest price and product alerts sent to users.
                </p>
              </div>
              {recentAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-xl bg-muted/60 p-3 mb-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No alerts found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60">
                        <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          User
                        </TableHead>
                        <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Product
                        </TableHead>
                        <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Type
                        </TableHead>
                        <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Change
                        </TableHead>
                        <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAlerts.map((alert) => (
                        <TableRow key={alert.id} className="border-border/60">
                          <TableCell>
                            <p className="text-sm font-medium">
                              {alert.profiles?.full_name || "N/A"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {alert.profiles?.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">
                              {alert.product_title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
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
                              className="rounded-lg text-[10px] font-semibold px-2 py-0.5"
                            >
                              {alert.alert_type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.alert_type === "price_drop" && (
                              <div className="text-sm">
                                <p>
                                  {"\u00a3"}{alert.old_value} {"\u2192"} {"\u00a3"}
                                  {alert.new_value}
                                </p>
                                <p className="text-xs text-green-600 font-medium">
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
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(
                              alert.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System tab */}
        <TabsContent value="system">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">
                  System Controls
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage system operations.
                </p>
              </div>

              {/* Alert monitoring action */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Alert Monitoring
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Run price monitoring to check for changes and send alerts.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold"
                  onClick={runAlertMonitoring}
                  disabled={actionLoading === "monitoring"}
                >
                  {actionLoading === "monitoring"
                    ? "Running..."
                    : "Run Monitoring"}
                </Button>
              </div>

              {/* Security reminders */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2 shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      Security Reminders
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        "Enable leaked password protection in Supabase",
                        "Reduce OTP expiry time",
                        "Keep Postgres updated",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className="h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg"
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

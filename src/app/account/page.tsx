"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Loader2,
  CreditCard,
  User,
  Mail,
  Bell,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Account() {
  const supabase = getSupabaseClient();
  const {
    user,
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    checkSubscription,
  } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState({ full_name: "", email: "" });

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    // Load user profile
    setProfile({
      full_name: user.user_metadata?.full_name || "",
      email: user.email || "",
    });
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name },
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "customer-portal"
      );

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await checkSubscription();
    setLoading(false);
    toast({
      title: "Status refreshed",
      description: "Your subscription status has been updated.",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings, subscription, and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            full_name: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={subscribed ? "default" : "secondary"}>
                        {subscriptionTier || "Free"}
                      </Badge>
                      <Badge variant={subscribed ? "default" : "outline"}>
                        {subscribed ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={refreshSubscription}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Refresh Status
                  </Button>
                </div>

                {subscribed && subscriptionEnd && (
                  <div className="space-y-1">
                    <p className="font-medium">Next Billing Date</p>
                    <p className="text-muted-foreground">
                      {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Billing Management</h3>
                  {subscribed ? (
                    <Button onClick={handleManageBilling} disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Manage Billing
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        You&apos;re currently on the free plan. Upgrade to
                        unlock premium features.
                      </p>
                      <Button
                        onClick={() => router.push("/pricing")}
                        variant="default"
                      >
                        View Pricing Plans
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      passwordLoading || !newPassword || !confirmPassword
                    }
                  >
                    {passwordLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive alerts and notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">
                      Email Alert Configuration
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Price drop alerts:</strong> Automatically sent
                        when monitored product prices decrease
                      </p>
                      <p>
                        <strong>New product alerts:</strong> Sent when new
                        products are added to monitored stores
                      </p>
                      <p>
                        <strong>Email templates:</strong> Configured with proper
                        variables for product details
                      </p>
                      <p>
                        <strong>Monitoring frequency:</strong> Alerts are checked
                        based on your alert preferences
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                      Alert Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700 dark:text-blue-300">
                        Email templates are configured and active
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Monitoring system is running
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Alert preferences can be configured per store
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                    <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">
                      Troubleshooting
                    </h4>
                    <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                      <p>If you&apos;re not receiving emails, check:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>
                          Your alert preferences are enabled in the Dashboard
                          &rarr; Alert Setup
                        </li>
                        <li>
                          Email notifications are turned on for specific stores
                        </li>
                        <li>Your spam/junk folder</li>
                        <li>
                          Products have recent price changes to trigger alerts
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                  >
                    Configure Alert Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

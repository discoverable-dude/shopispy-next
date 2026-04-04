"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export function AuthContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        const msg = error.message;
        if (msg.includes("Invalid login credentials")) {
          toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
        } else if (msg.includes("Email not confirmed")) {
          toast({ title: "Email not verified", description: "Please check your email and verify first.", variant: "destructive" });
        } else if (msg.includes("Too many requests")) {
          toast({ title: "Too many attempts", description: "Please wait a few minutes.", variant: "destructive" });
        } else {
          toast({ title: "Login failed", description: msg, variant: "destructive" });
        }
      } else {
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        router.push("/dashboard");
      }
    } catch {
      toast({ title: "Login failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        const msg = error.message;
        if (msg.includes("User already registered")) {
          toast({ title: "Account exists", description: "Please log in instead.", variant: "destructive" });
          setActiveTab("login");
        } else if (msg.includes("Password")) {
          toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
        } else {
          toast({ title: "Sign up failed", description: msg, variant: "destructive" });
        }
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
          duration: 7000,
        });
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch {
      toast({ title: "Sign up failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Google sign-in failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const GoogleButton = ({ disabled }: { disabled: boolean }) => (
    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={disabled}>
      {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </Button>
  );

  const OrDivider = () => (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="space-y-2 text-center">
          <Image
            src="/images/shopispy-logo-dark.png"
            alt="ShopiSpy"
            width={160}
            height={40}
            className="mx-auto h-10 w-auto dark:hidden"
          />
          <Image
            src="/images/shopispy-logo-light.png"
            alt="ShopiSpy"
            width={160}
            height={40}
            className="mx-auto hidden h-10 w-auto dark:block"
          />
          <h1 className="text-3xl font-bold">Welcome to ShopiSpy</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Access your competitive intelligence dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="space-y-4">
                  <GoogleButton disabled={googleLoading || loading} />
                  <OrDivider />
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={loading || googleLoading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Log In
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  <GoogleButton disabled={googleLoading || loading} />
                  <OrDivider />
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-fullName">Full Name</Label>
                      <Input id="signup-fullName" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={loading || googleLoading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

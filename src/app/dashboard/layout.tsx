"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Search, Plus } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/stores": "Tracked Stores",
  "/dashboard/alerts": "Alerts",
  "/dashboard/analytics": "Analytics",
  "/dashboard/integrations": "Integrations",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      path === "/dashboard" ? pathname === path : pathname.startsWith(path)
    )?.[1] ?? "Dashboard";

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar with premium border treatment */}
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-sm px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 h-8 w-8 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div className="h-4 w-px bg-border/60" />
              <h1 className="text-sm font-semibold text-foreground">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard/stores">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Scrape Store
                </Button>
              </Link>

              <div className="h-4 w-px bg-border/60" />

              <Link href="/dashboard/settings">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {displayName}
                  </span>
                </div>
              </Link>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="mx-auto max-w-6xl px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

"use client";

import { Home, Store, Bell, Settings, BarChart3, Plug, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Logo, LogoMark } from "@/components/brand/Logo";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/dashboard", icon: Home },
  { title: "Tracked Stores", url: "/dashboard/stores", icon: Store },
  { title: "Alerts", url: "/dashboard/alerts", icon: Bell },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Integrations", url: "/dashboard/integrations", icon: Plug },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const supabase = getSupabaseClient();
  const { state } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => setIsAdmin((data?.length ?? 0) > 0));
  }, [user]);

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? "justify-center py-3" : "px-2 py-4"}`}>
          {isCollapsed ? (
            <LogoMark size={28} />
          ) : (
            <Logo markSize={26} wordmarkClassName="text-lg" />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/dashboard/admin"
                      className={`flex items-center gap-3 ${
                        isActive("/dashboard/admin")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                      {!isCollapsed && <span>Admin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

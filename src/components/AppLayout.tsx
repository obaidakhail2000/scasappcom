import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";

export function AppLayout() {
  const { user, signOut } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  const { data: negativeCount = 0 } = useQuery({
    queryKey: ["negative-alert-count"],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const { count, error } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .lte("rating", 2)
        .gte("created_at", oneDayAgo.toISOString());
      if (error) return 0;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full flex-col">
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-[56px] flex items-center border-b border-border/60 px-4 md:px-6 bg-card/80 backdrop-blur-md shrink-0 sticky top-0 z-10 gap-3">
              <SidebarTrigger />

              <div className="flex-1 max-w-md hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search anything..." className="h-8 pl-9 text-xs rounded-lg bg-muted/60 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
              </div>
              <div className="flex-1 md:hidden" />

              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 relative rounded-lg">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {negativeCount > 0 ? (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] bg-destructive text-destructive-foreground border-0 rounded-full flex items-center justify-center">
                      {negativeCount}
                    </Badge>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Button>

                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold text-primary-foreground">{initials}</span>
                </div>

                <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground hover:text-destructive h-8 px-2 rounded-lg">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs hidden sm:inline">Logout</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}

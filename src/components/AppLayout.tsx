import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AppLayout() {
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/40 px-4 md:px-6 bg-card/95 backdrop-blur-md shrink-0 sticky top-0 z-10 shadow-sm gap-3">
            <SidebarTrigger />

            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." className="h-8 pl-9 text-xs rounded-lg bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => setSearchOpen(!searchOpen)}>
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </Button>

              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <span className="text-[10px] font-bold text-primary">{initials}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground hover:text-destructive h-8 px-2">
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

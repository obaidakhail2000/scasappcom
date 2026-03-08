import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AppLayout() {
  const { user, signOut } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b border-border/40 px-6 bg-card/95 backdrop-blur-md shrink-0 sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-medium">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-8 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

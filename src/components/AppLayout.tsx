import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b border-border/40 px-6 bg-card/90 backdrop-blur-md shrink-0 sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-xs font-bold text-primary">JD</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

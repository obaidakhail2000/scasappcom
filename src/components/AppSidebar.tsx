import {
  LayoutDashboard,
  Star,
  Megaphone,
  QrCode,
  UtensilsCrossed,
  Users,
  Gift,
  Image,
  CalendarClock,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "Marketing", url: "/marketing", icon: Megaphone },
  { title: "QR Codes", url: "/qr-codes", icon: QrCode },
  { title: "Campaigns", url: "/campaigns", icon: CalendarClock },
];

const manageItems = [
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Posters", url: "/posters", icon: Image },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const renderItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink
            to={item.url}
            end
            className="rounded-lg transition-all duration-150 hover:bg-sidebar-accent/60 hover:translate-x-0.5"
            activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold shadow-sm"
          >
            <item.icon className="mr-2 h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-md">
            <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground font-display tracking-wide">SCAS</h2>
              <p className="text-[10px] text-sidebar-foreground/50">Restaurant Marketing</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(manageItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <NavLink
                to="/settings"
                className="rounded-lg transition-all duration-150 hover:bg-sidebar-accent/60"
                activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold"
              >
                <Settings className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

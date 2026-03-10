import {
  LayoutDashboard,
  Star,
  Users,
  Megaphone,
  BarChart3,
  Table2,
  MessageSquareWarning,
  Settings,
  Image,
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
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const manageItems = [
  { title: "Tables", url: "/tables", icon: Table2 },
  { title: "Private Feedback", url: "/private-feedback", icon: MessageSquareWarning },
  { title: "Print Poster", url: "/posters", icon: Image },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink
            to={item.url}
            end
            className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent/80 group/nav"
            activeClassName="bg-sidebar-primary/20 text-sidebar-primary font-semibold shadow-sm"
          >
            <item.icon className="mr-2.5 h-[18px] w-[18px] shrink-0 transition-colors group-hover/nav:text-sidebar-primary" />
            {!collapsed && <span className="text-[13px]">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shrink-0 shadow-lg shadow-sidebar-primary/20">
            <span className="text-sidebar-primary-foreground font-bold text-base">S</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-primary-foreground tracking-wide">SCAS</h2>
              <p className="text-[10px] text-sidebar-foreground/50">Restaurant Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderItems(manageItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <NavLink
                to="/settings"
                className="rounded-lg transition-all duration-150 hover:bg-sidebar-accent/60"
                activeClassName="bg-sidebar-primary/20 text-sidebar-primary font-semibold"
              >
                <Settings className="mr-2.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                {!collapsed && <span className="text-[13px]">Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

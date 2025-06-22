
import { Calendar, Home, Settings, Package, Download, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Events",
    icon: Calendar,
    url: "/events",
  },
  {
    title: "Umoor Management",
    icon: Package,
    url: "/umoor",
  },
  {
    title: "User Roles",
    icon: Users,
    url: "/users",
  },
  {
    title: "Export Publication",
    icon: Download,
    url: "/export",
  },
  // {
  //   title: "Settings",
  //   icon: Settings,
  //   url: "/settings",
  // },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h1 className="text-2xl font-bold text-primary">Elan</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-3">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
              >
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

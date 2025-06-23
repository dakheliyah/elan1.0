
import { Calendar, Home, Settings, Package, Download, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/useProfiles";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
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
  const { signOut } = useAuth();
  const { data: currentProfile } = useCurrentProfile();

  const userRole = currentProfile?.role;
  const isAdmin = userRole === 'admin';
  const isViewerOrEditor = userRole === 'viewer' || userRole === 'editor';

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // For viewers and editors, only show Events (no Dashboard access)
    if (isViewerOrEditor && !isAdmin) {
      return item.title === 'Events';
    }
    // For admins, show all items
    return true;
  });

  const handleLogout = () => {
    signOut();
  };

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-6 bg-white">
        <div className="flex gap-2 items-center">
          <img src="/ideo.png" alt="" className="w-8" />
          <h1 className="text-2xl font-bold text-primary">Elan</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarMenu className="px-3">
          {filteredMenuItems.map((item) => (
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
      <SidebarFooter className="p-3 bg-white border-t border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


import React from 'react';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import UserMenu from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
          <DashboardContent />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

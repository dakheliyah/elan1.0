
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { WelcomeSection } from "./WelcomeSection";
import { ActiveEventsCard } from "./ActiveEventsCard";
import { RecentPublicationsCard } from "./RecentPublicationsCard";
import { LocationsActivityCard } from "./LocationsActivityCard";
import { TeamActivityCard } from "./TeamActivityCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { PublicationStatusCard } from "./PublicationStatusCard";
import UserMenu from "../UserMenu";
import { useCurrentProfile } from "@/hooks/useProfiles";

export function DashboardContent() {
  const { data: profile } = useCurrentProfile();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SidebarInset>
      {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">Welcome back, {profile?.full_name || 'Chief Editor'} | {currentDate} • {currentTime}</p>
                </div>
                <div className="flex items-center gap-4">
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        {/* <WelcomeSection /> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* <div className="xl:col-span-2">
            <ActiveEventsCard />
          </div> */}
          <div className="space-y-2">
            <PublicationStatusCard />
            <QuickActionsCard />
          </div>
          
          <div className="xl:col-span-2">
            <RecentPublicationsCard />
          </div>
          
          <div className="lg:col-span-2 xl:col-span-2">
            <LocationsActivityCard />
          </div>
          <div>
            <TeamActivityCard />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}

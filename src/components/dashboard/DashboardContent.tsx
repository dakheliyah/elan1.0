
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { WelcomeSection } from "./WelcomeSection";
import { ActiveEventsCard } from "./ActiveEventsCard";
import { RecentPublicationsCard } from "./RecentPublicationsCard";
import { LocationsActivityCard } from "./LocationsActivityCard";
import { TeamActivityCard } from "./TeamActivityCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { PublicationStatusCard } from "./PublicationStatusCard";

export function DashboardContent() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <WelcomeSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ActiveEventsCard />
          </div>
          <div>
            <QuickActionsCard />
          </div>
          
          <div className="xl:col-span-2">
            <RecentPublicationsCard />
          </div>
          <div>
            <PublicationStatusCard />
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

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublication } from '@/hooks/usePublications';
import { convertToPublication } from '@/utils/publicationConverter';
import PublicationPreview from '@/components/PublicationPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

const PublicationView = () => {
  const { eventId, locationId, publicationId } = useParams();
  const navigate = useNavigate();
  const { data: dbPublication, isLoading, error } = usePublication(publicationId!);

  if (isLoading) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !dbPublication) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Publication Not Found</h2>
              <p className="text-gray-600 mb-6">The publication you're looking for doesn't exist.</p>
              <Button onClick={() => navigate(`/events/${eventId}/locations/${locationId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Location
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const publication = convertToPublication(dbPublication);

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
          {/* Header with navigation */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/events/${eventId}/locations/${locationId}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Location
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{publication.title}</h1>
                  <p className="text-sm text-gray-600">{publication.breadcrumb}</p>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/events/${eventId}/locations/${locationId}/publications/${publicationId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Publication
              </Button>
            </div>
          </div>

          {/* Publication Preview */}
          <PublicationPreview publication={publication} mode="preview" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PublicationView;
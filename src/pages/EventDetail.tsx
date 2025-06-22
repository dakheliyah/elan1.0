
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  MapPin,
  Clock,
  Star,
  Loader2,
  Image
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import NewLocationModal, { LocationFormData } from '@/components/NewLocationModal';
import EditLocationModal, { LocationEditData } from '@/components/EditLocationModal';
import ShareModal from '@/components/ShareModal';
import UserMenu from '@/components/UserMenu';
import MediaLibrary from './MediaLibrary';
import {
  useEvent,
  useLocationsWithPublicationCount,
  useDeleteLocation,
  useLocation
} from '@/hooks/useSupabaseQuery';
import { useCreateLocationWithHost, useUpdateLocationWithHost } from '@/hooks/useHostLocation';
import { format } from 'date-fns';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Fetch event and locations data from Supabase
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId || '');
  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = useLocationsWithPublicationCount(eventId || '');
  const { data: editingLocation } = useLocation(editingLocationId || '');
  const createLocationMutation = useCreateLocationWithHost();
  const updateLocationMutation = useUpdateLocationWithHost();
  const deleteLocationMutation = useDeleteLocation();

  const handleBack = () => {
    navigate('/events');
  };

  const handleNewLocation = () => {
    setIsLocationModalOpen(true);
  };

  const handleMediaLibrary = () => {
    setShowMediaLibrary(true);
  };

  const handleCreateLocation = async (locationData: LocationFormData) => {
    if (!eventId) return;

    await createLocationMutation.mutateAsync({
      name: locationData.name,
      timezone: locationData.timezone,
      description: locationData.description,
      event_id: eventId,
      is_host: locationData.is_host || false,
    });

    setIsLocationModalOpen(false);
  };

  const handleEditLocation = (locationId: string) => {
    setEditingLocationId(locationId);
    setIsEditLocationModalOpen(true);
  };

  const handleUpdateLocation = async (locationData: LocationEditData) => {
    if (!editingLocationId) return;

    await updateLocationMutation.mutateAsync({
      id: editingLocationId,
      updates: locationData,
    });

    setIsEditLocationModalOpen(false);
    setEditingLocationId(null);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      try {
        await deleteLocationMutation.mutateAsync(locationId);
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleLocationClick = (locationId: string) => {
    navigate(`/events/${eventId}/locations/${locationId}`);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Error states
  if (eventError || locationsError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Event</h2>
                <p className="text-gray-600 mb-4">There was an error loading the event details. Please try again.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Loading state
  if (eventLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="flex items-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-600">Loading event...</span>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Event not found
  if (!event) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
                <Button onClick={handleBack}>Back to Events</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // If we're showing the media library, render it
  if (showMediaLibrary) {
    return <MediaLibrary onBack={() => setShowMediaLibrary(false)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                  {/* Navigation and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft size={16} />
                      Back to Events
                    </Button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        {event.start_date && event.end_date && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>
                              {format(new Date(event.start_date), 'dd/MM/yyyy')} - {format(new Date(event.end_date), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{locations.length} Locations</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <UserMenu />

                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex items-center gap-2"
                      >
                        <Share2 size={16} />
                        Share
                      </Button>

                      {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicate Event</DropdownMenuItem>
                    <DropdownMenuItem>Export Data</DropdownMenuItem>
                    <DropdownMenuItem>Archive Event</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete Event</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Locations Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Locations</h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleMediaLibrary}
                    className="flex items-center gap-2"
                  >
                    <Image size={16} />
                    Media Library
                  </Button>
                  <Button
                    onClick={handleNewLocation}
                    disabled={createLocationMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    {createLocationMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    New Location
                  </Button>
                  <Button
                    onClick={handleNewLocation}
                    disabled={createLocationMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    {createLocationMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    New Publication
                  </Button>
                </div>
              </div>

              {/* Loading State for Locations */}
              {locationsLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading locations...</span>
                </div>
              )}

              {/* Locations Grid */}
              {!locationsLoading && locations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.map((location) => (
                    <Card
                      key={location.id}
                      className="hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
                      onClick={() => handleLocationClick(location.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {location.name}
                            </h3>
                            {location.is_host && (
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLocation(location.id);
                              }}
                              className="hover:bg-gray-50"
                            >
                              <Edit size={14} />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLocation(location.id);
                              }}
                              disabled={deleteLocationMutation.isPending}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              {deleteLocationMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              <span className="font-medium">{location.publication_count || 0}</span> publications
                            </span>
                            {location.is_host && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Host
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={14} className="mr-2" />
                            <span>{location.timezone}</span>
                          </div>

                          {location.description && (
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {location.description}
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                              Click to view publications
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State for when no locations */}
              {!locationsLoading && locations.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
                  <p className="text-gray-500 mb-6">Get started by adding your first location.</p>
                  <Button
                    onClick={handleNewLocation}
                    disabled={createLocationMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Location
                  </Button>
                </div>
              )}
            </div>

            {/* Modals */}
            <NewLocationModal
              isOpen={isLocationModalOpen}
              onClose={() => setIsLocationModalOpen(false)}
              onSubmit={handleCreateLocation}
            />

            <EditLocationModal
              isOpen={isEditLocationModalOpen}
              onClose={() => {
                setIsEditLocationModalOpen(false);
                setEditingLocationId(null);
              }}
              onSubmit={handleUpdateLocation}
              location={editingLocation ? {
                id: editingLocation.id,
                name: editingLocation.name,
                timezone: editingLocation.timezone,
                description: editingLocation.description,
                is_host: editingLocation.is_host,
              } : null}
            />

            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              locations={locations.map(loc => ({
                id: loc.id,
                name: loc.name,
                articlesCount: loc.publication_count || 0,
                timezone: loc.timezone,
                isFeatured: loc.is_host || false
              }))}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EventDetail;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';
import NewEventModal, { EventFormData } from '@/components/NewEventModal';
import { useToast } from '@/hooks/use-toast';
import UserMenu from '@/components/UserMenu';
import { useEventsWithLocationCount, useCreateEvent, useDeleteEvent } from '@/hooks/useSupabaseQuery';
import { format } from 'date-fns';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const EventManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use Supabase hooks for data fetching and mutations
  const { data: events = [], isLoading, error } = useEventsWithLocationCount();
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();

  const handleNewEvent = () => {
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    try {
      await createEventMutation.mutateAsync({
        name: eventData.name,
        description: eventData.description,
        start_date: eventData.startDate.toISOString().split('T')[0],
        end_date: eventData.endDate.toISOString().split('T')[0],
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleViewEvent = (eventId: string) => {
    console.log('View event:', eventId);
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    console.log('Edit event:', eventId);
    // TODO: Implement edit functionality
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Events</h2>
                <p className="text-gray-600 mb-4">There was an error loading your events. Please try again.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
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
                <div className="flex justify-between items-center py-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and organize your events</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleNewEvent}
                      disabled={createEventMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 flex items-center gap-2"
                    >
                      {createEventMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                      New Event
                    </Button>
                    <UserMenu />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading events...</span>
                </div>
              )}

              {/* Event Grid */}
              {!isLoading && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card 
                      key={event.id} 
                      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-slate-700">
                              {event.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">#{event.id.slice(0, 8)}</p>
                          </div>
                          <Badge 
                            variant="default"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Event Details */}
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={14} className="mr-2" />
                            <span>{event.location_count || 0} Locations</span>
                          </div>
                          
                          {event.start_date && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              <span>Begins {format(new Date(event.start_date), 'dd/MM/yyyy')}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewEvent(event.id);
                              }}
                              className="flex-1 hover:bg-gray-50"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event.id);
                              }}
                              className="flex-1 hover:bg-gray-50"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              disabled={deleteEventMutation.isPending}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                              {deleteEventMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && events.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first event.</p>
                  <Button 
                    onClick={handleNewEvent} 
                    disabled={createEventMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Event
                  </Button>
                </div>
              )}
            </div>

            {/* New Event Modal */}
            <NewEventModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleCreateEvent}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EventManagement;

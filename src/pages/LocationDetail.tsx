import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useLocation,
  useEvent,
  usePublicationsByLocation,
  useDeletePublication,
  useUpdatePublication,
  useCurrentProfile
} from '@/hooks/useSupabaseQuery';
import { publicationsService } from '@/services/publicationsService';
import DebugPublications from '@/components/DebugPublications';
import TestCreatePublication from '@/components/TestCreatePublication';

import { format } from 'date-fns';
import UserMenu from '@/components/UserMenu';

const LocationDetail = () => {
  const { eventId, locationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch data from Supabase
  const { data: event, isLoading: eventLoading } = useEvent(eventId || '');
  const { data: location, isLoading: locationLoading } = useLocation(locationId || '');
  // Get publications for this location using the updated method
  const { data: publications = [], isLoading: publicationsLoading, refetch } = usePublicationsByLocation(locationId || '');
  const { data: currentProfile } = useCurrentProfile();
  
  // Check if user is admin
  const isAdmin = currentProfile?.role === 'admin';
  

  const deletePublicationMutation = useDeletePublication();
  const updatePublicationMutation = useUpdatePublication();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<any>(null);

  const handleBack = () => {
    navigate(`/events/${eventId}`);
  };

  // Removed handleNewEntry - publications are now created globally at event level

  const handleEdit = (publicationId: string) => {
    navigate(`/events/${eventId}/locations/${locationId}/publications/${publicationId}/edit`);
  };

  const handleDeleteClick = (publication: any) => {
    setPublicationToDelete(publication);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!publicationToDelete) return;

    try {
      await deletePublicationMutation.mutateAsync(publicationToDelete.id);

      toast({
        title: "Publication Deleted",
        description: `"${publicationToDelete.title}" has been permanently deleted.`,
      });

      setDeleteDialogOpen(false);
      setPublicationToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete publication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPublicationToDelete(null);
  };



  // Filter and sort publications by publication date in ascending order
  const filteredPublications = publications
    .filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || pub.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by publication date (earliest first)
      const dateA = new Date(a.publication_date || a.created_at || '').getTime();
      const dateB = new Date(b.publication_date || b.created_at || '').getTime();
      return dateA - dateB;
    });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'archived':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  // Loading state
  if (eventLoading || locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!event || !location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h2>
          <p className="text-gray-600 mb-4">The location you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>Back to Event</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
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
                      Back to Event
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          {event.name} • {location.name}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Publications</h1>
                      </div>

                      <div className='flex gap-2 items-center'>
                         <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                           📝 Publications are now managed at the event level.
                           <Button 
                             variant="link" 
                             size="sm" 
                             onClick={() => navigate(`/events/${eventId}`)}
                             className="p-0 h-auto ml-2 text-blue-600"
                           >
                             Manage Publications →
                           </Button>
                         </div>
                         <div className="flex items-center gap-4">
                           <UserMenu />
                         </div>
                       </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Search and Filter Bar */}
              {publications.length > 0 && (
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search publications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Loading State for Publications - Shows publications created at event level that are assigned to this location */}
              {publicationsLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading publications...</p>
                </div>
              )}

              {!publicationsLoading && publications.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No publications for this location yet</h3>
                  <p className="text-gray-500 mb-6">
                    Publications are now created at the event level and distributed to locations.
                    <br />
                    Create a publication from the event page to see it here.
                  </p>
                  <Button
                    onClick={() => navigate(`/events/${eventId}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Go to Event Publications
                  </Button>
                </div>
              ) : !publicationsLoading && filteredPublications.length === 0 ? (
                /* No Results State */
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : !publicationsLoading && (
                /* Publications Table */
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Name</TableHead>
                        <TableHead className="font-semibold text-gray-900">Publication Date</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPublications.map((publication, index) => (
                        <TableRow
                          key={publication.id}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 1 ? 'bg-gray-25' : 'bg-white'}`}
                          onClick={() => navigate(`/events/${eventId}/locations/${locationId}/publications/${publication.id}/view`)}
                        >
                          <TableCell className="font-medium text-gray-900">
                            {publication.title}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {publication.publication_date
                              ? format(new Date(publication.publication_date), 'dd/MM/yyyy')
                              : format(new Date(publication.created_at || ''), 'dd/MM/yyyy')
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={getStatusBadgeClass(publication.status || 'draft')}
                              >
                                {formatStatus(publication.status || 'draft')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(publication.id);
                                }}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit size={14} />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(publication);
                                  }}
                                  className="hover:bg-red-50 hover:text-red-600"
                                  disabled={deletePublicationMutation.isPending}
                                >
                                  {deletePublicationMutation.isPending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Publication</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{publicationToDelete?.title}"? This action cannot be undone and will permanently remove the publication.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleDeleteCancel}
                    disabled={deletePublicationMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                    disabled={deletePublicationMutation.isPending}
                  >
                    {deletePublicationMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LocationDetail;

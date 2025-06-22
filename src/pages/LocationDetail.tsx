import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Loader2,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useLocation, 
  useEvent,
  usePublicationsByLocation,
  useCreatePublication,
  useDeletePublication,
  useUpdatePublication
} from '@/hooks/useSupabaseQuery';
import { PublicationInsert } from '@/services/supabase';
import { format } from 'date-fns';

const LocationDetail = () => {
  const { eventId, locationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch data from Supabase
  const { data: event, isLoading: eventLoading } = useEvent(eventId || '');
  const { data: location, isLoading: locationLoading } = useLocation(locationId || '');
  const { data: publications = [], isLoading: publicationsLoading, refetch } = usePublicationsByLocation(locationId || '');
  const createPublicationMutation = useCreatePublication();
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

  const handleNewEntry = async () => {
    if (!locationId || !event?.name || !location?.name) return;
    
    try {
      // Create a new draft publication
      const newPublication: PublicationInsert = {
        title: `New Publication ${new Date().toLocaleDateString()}`,
        location_id: locationId,
        status: 'draft',
        content: []
      };

      const createdPublication = await createPublicationMutation.mutateAsync(newPublication);
      
      // Navigate to the editor with the new publication
      navigate(`/events/${eventId}/locations/${locationId}/publications/${createdPublication.id}/edit`);
    } catch (error) {
      toast({
        title: "Failed to create publication",
        description: "There was an error creating the new publication. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  const handleToggleFeatured = async (publication: any) => {
    try {
      const newFeaturedStatus = !publication.is_featured;
      
      await updatePublicationMutation.mutateAsync({
        id: publication.id,
        updates: {
          is_featured: newFeaturedStatus,
          location_id: locationId || ''
        }
      });

      toast({
        title: newFeaturedStatus ? "Marked as Featured" : "Removed Featured Status",
        description: newFeaturedStatus 
          ? `"${publication.title}" has been marked as featured. Any previously featured publication has been unmarked.`
          : `"${publication.title}" has been unmarked as featured.`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter and sort publications - remove featured sorting
  const filteredPublications = publications
    .filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || pub.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by date modified (newest first) only
      return new Date(b.updated_at || b.created_at || '').getTime() - 
             new Date(a.updated_at || a.created_at || '').getTime();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* New Entry Button */}
              <Button 
                onClick={handleNewEntry}
                className="bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2"
                disabled={createPublicationMutation.isPending}
              >
                {createPublicationMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                New Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Loading State for Publications */}
        {publicationsLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading publications...</p>
          </div>
        )}

        {!publicationsLoading && publications.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No publications yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first publication.</p>
            <Button 
              onClick={handleNewEntry} 
              className="bg-slate-800 hover:bg-slate-700"
              disabled={createPublicationMutation.isPending}
            >
              {createPublicationMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              New Entry
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
                  <TableHead className="font-semibold text-gray-900">Date Modified</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPublications.map((publication, index) => (
                  <TableRow 
                    key={publication.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 1 ? 'bg-gray-25' : 'bg-white'
                    } ${publication.is_featured ? 'border-l-4 border-l-yellow-400' : ''}`}
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {publication.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        {publication.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {publication.updated_at 
                        ? format(new Date(publication.updated_at), 'dd/MM/yyyy')
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
                          onClick={() => handleToggleFeatured(publication)}
                          className={`hover:bg-yellow-50 ${
                            publication.is_featured 
                              ? 'text-yellow-600 hover:text-yellow-700' 
                              : 'text-gray-400 hover:text-yellow-600'
                          }`}
                          disabled={updatePublicationMutation.isPending}
                          title={publication.is_featured ? 'Remove featured status' : 'Mark as featured'}
                        >
                          {updatePublicationMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Star 
                              size={14} 
                              className={publication.is_featured ? 'fill-current' : ''} 
                            />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(publication.id)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(publication)}
                          className="hover:bg-red-50 hover:text-red-600"
                          disabled={deletePublicationMutation.isPending}
                        >
                          {deletePublicationMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
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
  );
};

export default LocationDetail;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PublicationLocationManager } from './PublicationLocationManager';
import type { PublicationWithLocations } from '@/services/publicationsService';
import type { Publication } from '@/pages/PublicationEditor';

interface EventPublicationsTableProps {
  publications: PublicationWithLocations[];
  onEdit: (eventId: string, date: string) => void;
  onDelete: (id: string) => void;
  onPreview: (publication: Publication) => void;
  onCreatePublication: (date: string) => void;
}

export const EventPublicationsTable: React.FC<EventPublicationsTableProps> = ({
  publications,
  onEdit,
  onDelete,
  onPreview,
  onCreatePublication
}) => {
  const { toast } = useToast();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<PublicationWithLocations | null>(null);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<PublicationWithLocations | null>(null);

  // Group publications by date
  const publicationsByDate = publications.reduce((acc, publication) => {
    const date = publication.publication_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(publication);
    return acc;
  }, {} as Record<string, PublicationWithLocations[]>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(publicationsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePreview = (publication: PublicationWithLocations) => {
    // Convert database publication to Publication type for preview
    const previewPublication: Publication = {
      title: publication.title || 'Untitled Publication',
      breadcrumb: `${publication.event_id} • ${publication.publication_date}`,
      parentBlocks: (publication.content as any)?.parentBlocks || []
    };
    
    onPreview(previewPublication);
  };

  const handleDeleteClick = (publication: PublicationWithLocations) => {
    setPublicationToDelete(publication);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (publicationToDelete) {
      onDelete(publicationToDelete.id);
      setShowDeleteDialog(false);
      setPublicationToDelete(null);
    }
  };

  const handleManageLocations = (publication: PublicationWithLocations) => {
    setSelectedPublication(publication);
    setShowLocationManager(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLocationCount = (publication: PublicationWithLocations) => {
    return publication.publication_locations?.length || 0;
  };

  const getPublishedLocationCount = (publication: PublicationWithLocations) => {
    return publication.publication_locations?.filter(loc => loc.status === 'published').length || 0;
  };

  if (publications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-gray-500 mb-4">No publications found for this event</p>
        <Button onClick={() => onCreatePublication(new Date().toISOString().split('T')[0])}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Publication
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const datePublications = publicationsByDate[date];
        const isExpanded = expandedDates.has(date);
        
        return (
          <Card key={date}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleDateExpansion(date)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <Calendar className="h-5 w-5" />
                      {formatDate(date)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {datePublications.length} publication{datePublications.length !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePublication(date);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Publication
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-4">
                    {datePublications.map((publication) => {
                      const locationCount = getLocationCount(publication);
                      const publishedCount = getPublishedLocationCount(publication);
                      
                      return (
                        <div
                          key={publication.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-lg">
                                  {publication.title || 'Untitled Publication'}
                                </h4>
                                <Badge variant="outline" className={getStatusColor(publication.status)}>
                                  {publication.status}
                                </Badge>
                                {publication.is_featured && (
                                  <Badge variant="secondary">Featured</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {locationCount} location{locationCount !== 1 ? 's' : ''}
                                  {locationCount > 0 && (
                                    <span className="ml-1">({publishedCount} published)</span>
                                  )}
                                </div>
                                <span>Updated: {new Date(publication.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(publication)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(publication.event_id, publication.publication_date)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {locationCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleManageLocations(publication)}
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(publication)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Publication</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{publicationToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Manager Dialog */}
      <Dialog open={showLocationManager} onOpenChange={setShowLocationManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Publication Locations</DialogTitle>
            <DialogDescription>
              Manage content and status for each location
            </DialogDescription>
          </DialogHeader>
          {selectedPublication && (
            <PublicationLocationManager
              publicationId={selectedPublication.id}
              publicationTitle={selectedPublication.title || 'Untitled Publication'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
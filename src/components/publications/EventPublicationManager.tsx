import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  MapPin,
  Loader2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { convertToPublication } from '@/utils/publicationConverter';
import {
  usePublicationsByEvent,
  usePublicationByEventAndDate,
  useCreateEventPublication,
  useDeletePublication
} from '@/hooks/usePublications';
import { useEvent } from '@/hooks/useSupabaseQuery';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useLocations } from '@/hooks/useLocations';
import type { CreateEventPublicationData } from '@/services/publicationsService';

interface EventPublicationManagerProps {
  eventId: string;
}

export const EventPublicationManager: React.FC<EventPublicationManagerProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPublicationTitle, setNewPublicationTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<any>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'pdf'>('html');
  const [isExporting, setIsExporting] = useState(false);

  // Data fetching
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: publications = [], isLoading: publicationsLoading } = usePublicationsByEvent(eventId);
  const { data: locations = [] } = useLocations(eventId);
  const { data: currentProfile } = useCurrentProfile();
  
  // Find host location for the event
  const hostLocation = locations.find(loc => loc.is_host);
  
  // Role checking
  const isAdmin = currentProfile?.role === 'admin';
  
  // Mutations
  const createPublicationMutation = useCreateEventPublication();
  const deletePublicationMutation = useDeletePublication();

  // Get publications for selected date (now returns array of location-specific publications)
  const { data: publicationsForDate = [] } = usePublicationByEventAndDate(eventId, selectedDate);
  
  // Group publications by title for display
  const groupedPublications = publicationsForDate.reduce((acc, pub) => {
    const key = pub.title;
    if (!acc[key]) {
      acc[key] = {
        title: pub.title,
        publications: [],
        created_at: pub.created_at
      };
    }
    acc[key].publications.push(pub);
    return acc;
  }, {} as Record<string, { title: string; publications: any[]; created_at: string }>);

  const handleCreatePublication = async () => {
    if (!newPublicationTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title.",
        variant: "destructive"
      });
      return;
    }

    try {
      const publicationData: CreateEventPublicationData = {
        title: newPublicationTitle.trim(),
        content: '',
        publication_date: selectedDate,
        event_id: eventId,
        location_ids: [] // Will be ignored by the new service implementation
      };

      const createdPublications = await createPublicationMutation.mutateAsync(publicationData);
      
      setShowCreateDialog(false);
      setNewPublicationTitle('');

      // Navigate to the first publication's editor (host location if available)
      const hostPublication = createdPublications.find(pub => pub.location?.is_host);
      const targetPublication = hostPublication || createdPublications[0];
      if (targetPublication) {
        navigate(`/events/${eventId}/locations/${targetPublication.location_id}/publications/${targetPublication.id}/edit`);
      }
      
      toast({
         title: "Publications Created",
         description: `Publication "${newPublicationTitle.trim()}" has been created for all locations on ${format(new Date(selectedDate), 'MMM dd, yyyy')}.`
       });
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create publications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePublication = async () => {
    if (!publicationToDelete) return;

    try {
      await deletePublicationMutation.mutateAsync(publicationToDelete.id);
      toast({
        title: "Publication Deleted",
        description: "The publication has been successfully deleted."
      });
      setDeleteDialogOpen(false);
      setPublicationToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete publication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleIndividualExport = async (publication: any) => {
    setIsExporting(true);
    try {
      // Import the export service
      const { publicationExportService } = await import('@/services/publicationExport');

      const exportOptions = {
        locationId: publication.location_id,
        hostLocationId: hostLocation?.id,
        template: 'professional' as const,
        includeMetadata: true,
        includeGlobalContent: hostLocation && publication.location_id !== hostLocation.id
      };

      // Convert the database publication to the proper format
      const convertedPublication = convertToPublication(publication);

      console.log('📄 [Individual Export Debug] Exporting publication:', {
        id: publication.id,
        title: publication.title,
        locationName: publication.location?.name,
        convertedParentBlocks: convertedPublication.parentBlocks?.length || 0,
        exportOptions
      });

      let content: string | Blob;
      let filename: string;
      
      if (exportFormat === 'html') {
        content = await publicationExportService.exportAsHTML(convertedPublication, null, exportOptions);
        filename = `${publication.location?.name || 'Unknown'}-${publication.title}.html`;
      } else {
        content = await publicationExportService.exportAsPDF(convertedPublication, null, exportOptions);
        filename = `${publication.location?.name || 'Unknown'}-${publication.title}.pdf`;
      }

      // Create download link
      const blob = content instanceof Blob ? content : new Blob([content], { 
        type: exportFormat === 'html' ? 'text/html' : 'application/pdf' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `${publication.location?.name} publication exported successfully.`
      });
    } catch (error) {
      console.error('Individual export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export publication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkExport = async () => {
    if (publicationsForDate.length === 0) {
      toast({
        title: "No Publications",
        description: "No publications found for the selected date.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Import the export service
      const { publicationExportService } = await import('@/services/publicationExport');

      // Group publications by location to create one export per location
      const locationGroups = new Map<string, { locationId: string; locationName: string; publications: any[] }>();
      
      publicationsForDate.forEach(publication => {
        const locationKey = publication.location_id;
        if (!locationGroups.has(locationKey)) {
          locationGroups.set(locationKey, {
            locationId: publication.location_id,
            locationName: publication.location?.name || 'Unknown',
            publications: []
          });
        }
        locationGroups.get(locationKey)!.publications.push(publication);
      });

      console.log('🏢 [Bulk Export Debug] Location groups:', Array.from(locationGroups.entries()).map(([key, group]) => ({
        locationId: key,
        locationName: group.locationName,
        publicationCount: group.publications.length
      })));

      // Create one comprehensive export per location
      for (const [locationId, locationGroup] of locationGroups) {
        try {
          // Use the first publication as the base, but set export options to include all content for this location
          const basePublication = locationGroup.publications[0];
          
          let content: string | Blob;
          let filename: string;
          
          if (exportFormat === 'html') {
            // Export with location-specific filtering that includes global blocks
            const exportOptions = {
              locationId: locationGroup.locationId,
              hostLocationId: hostLocation?.id,
              template: 'professional' as const,
              includeMetadata: true,
              includeGlobalContent: hostLocation && locationGroup.locationId !== hostLocation.id
            };
            
            console.log('🔧 [Bulk Export Debug] Creating comprehensive export for location:', {
              locationId: locationGroup.locationId,
              locationName: locationGroup.locationName,
              basePublicationId: basePublication.id,
              exportOptions
            });
            
            const convertedPublication = convertToPublication(basePublication);
            content = await publicationExportService.exportAsHTML(convertedPublication, null, exportOptions);
            filename = `${locationGroup.locationName}-${basePublication.title}.html`;
          } else {
            const exportOptions = {
              locationId: locationGroup.locationId,
              hostLocationId: hostLocation?.id,
              template: 'professional' as const,
              includeMetadata: true,
              includeGlobalContent: hostLocation && locationGroup.locationId !== hostLocation.id
            };
            const convertedPublication = convertToPublication(basePublication);
            content = await publicationExportService.exportAsPDF(convertedPublication, null, exportOptions);
            filename = `${locationGroup.locationName}-${basePublication.title}.pdf`;
          }
          
          // Add to zip with location-specific folder structure
          zip.file(`${locationGroup.locationName}/${filename}`, content);
          
          console.log('✅ [Bulk Export Debug] Successfully created export for location:', locationGroup.locationName);
        } catch (error) {
          console.error(`Failed to export for location ${locationGroup.locationName}:`, error);
          // Continue with other locations
        }
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `publications-${format(new Date(selectedDate), 'yyyy-MM-dd')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Successfully exported ${publicationsForDate.length} publications as ${exportFormat.toUpperCase()}.`
      });
      setShowExportDialog(false);
    } catch (error) {
      console.error('Bulk export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export publications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
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

  if (eventLoading || publicationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Publication Management</h2>
          <p className="text-muted-foreground">
            Manage publications for {event?.name}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Publication
          </Button>
        )}
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Publication Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="publication-date">Date:</Label>
            <Input
              id="publication-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Badge variant="outline">
              {format(new Date(selectedDate), 'EEEE, MMM dd, yyyy')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Publications for Selected Date */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Publications for {format(new Date(selectedDate), 'MMM dd, yyyy')}
            </CardTitle>
            {publicationsForDate.length > 0 && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {publicationsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : Object.keys(groupedPublications).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No publications found for this date</p>
              <p className="text-sm">Create a new publication to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(groupedPublications).map((group) => (
                <div key={group.title} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(group.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>

                      </div>
                    </div>
                  </div>
                  
                  {/* Location-specific publications */}
                  <div className="space-y-3">
                    {group.publications.map((publication) => (
                      <div key={publication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium">{publication.location?.name}</span>
                            {publication.location?.is_host && (
                              <Badge variant="outline" className="ml-2 text-xs">Host</Badge>
                            )}
                            <div className="text-sm text-gray-600">
                               <Badge className={getStatusColor(publication.status)}>
                                 {publication.status}
                               </Badge>
                             </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/events/${eventId}/locations/${publication.location?.id}/publications/${publication.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/events/${eventId}/locations/${publication.location?.id}/publications/${publication.id}/view`)}
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIndividualExport(publication)}
                              disabled={isExporting}
                            >
                              {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Export
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPublicationToDelete(publication);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Publication Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Publication</DialogTitle>
            <DialogDescription>
              Create a publication for {format(new Date(selectedDate), 'EEEE, MMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Publication Title</Label>
              <Input
                id="title"
                value={newPublicationTitle}
                onChange={(e) => setNewPublicationTitle(e.target.value)}
                placeholder="Enter publication title"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Publications will be created for all event locations automatically.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePublication}>
              Create Publication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Publication</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{publicationToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePublication}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Publications</DialogTitle>
            <DialogDescription>
              Export all publications for {format(new Date(selectedDate), 'EEEE, MMM dd, yyyy')} ({publicationsForDate.length} publications)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'html' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML (Email-ready)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              <p>Publications will be organized by location in a ZIP file.</p>
              <p>Format: [Location Name]/[Publication Title].{exportFormat}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleBulkExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {publicationsForDate.length} Publications
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
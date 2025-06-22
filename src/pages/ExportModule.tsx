
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  MapPin,
  Calendar,
  FileText,
  Globe,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Mail,
  File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useEvents } from '@/hooks/useEvents';
import { useLocations } from '@/hooks/useLocations';
import { usePublicationsByLocation, usePublication } from '@/hooks/usePublications';
import { useToast } from '@/hooks/use-toast';
import { ExportLocationSelector } from '@/components/export/ExportLocationSelector';
import { useExportHTML, useExportPDF } from '@/hooks/usePublicationExport';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ExportModule = () => {
  const { toast } = useToast();
  const { data: events, isLoading: eventsLoading } = useEvents();
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [featuredPublicationId, setFeaturedPublicationId] = useState<string | null>(null);
  const [showFormatSelection, setShowFormatSelection] = useState(false);

  const { data: locations } = useLocations(selectedEventId || '');
  const { data: publications } = usePublicationsByLocation(selectedLocationId || '');
  const { data: featuredPublication } = usePublication(featuredPublicationId || '');

  // Export hooks
  const exportHTMLMutation = useExportHTML();
  const exportPDFMutation = useExportPDF();

  // Find host location for the selected event
  const hostLocation = locations?.find(loc => loc.is_host);

  // Auto-select featured publication when location changes
  useEffect(() => {
    if (publications && publications.length > 0) {
      const featured = publications.find(pub => pub.is_featured);
      setFeaturedPublicationId(featured?.id || null);
    } else {
      setFeaturedPublicationId(null);
    }
  }, [publications]);

  const handleExport = () => {
    if (!featuredPublicationId) {
      toast({
        title: "No Featured Publication",
        description: "This location doesn't have a featured publication to export.",
        variant: "destructive"
      });
      return;
    }
    setShowFormatSelection(true);
  };

  const handleFormatSelect = async (format: 'html' | 'pdf') => {
    setShowFormatSelection(false);
    
    if (!featuredPublicationId) {
      toast({
        title: "Export Error",
        description: "No publication selected for export.",
        variant: "destructive"
      });
      return;
    }

    // Set appropriate template based on format with proper literal typing
    const template = 'professional' as const;
    
    const exportOptions = {
      template,
      imageQuality: 'high' as const,
      includeMetadata: true,
      includeGlobalContent: hostLocation && selectedLocationId !== hostLocation.id,
      hostLocationId: hostLocation?.id,
      ...(format === 'pdf' && { pageSize: 'A4' as const })
    };

    try {
      if (format === 'html') {
        await exportHTMLMutation.mutateAsync({ 
          publicationId: featuredPublicationId,
          options: exportOptions
        });
      } else {
        await exportPDFMutation.mutateAsync({ 
          publicationId: featuredPublicationId,
          options: exportOptions
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export publication as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const selectedEvent = events?.find(e => e.id === selectedEventId);
  const selectedLocation = locations?.find(l => l.id === selectedLocationId);
  const isExporting = exportHTMLMutation.isPending || exportPDFMutation.isPending;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with Navigation */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link to="/dashboard" className="flex items-center gap-1 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Export Module</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Module</h1>
              <p className="text-gray-600">
                Export featured publications with global content blocks from host locations.
              </p>
            </div>

            {/* Selection Process */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Step 1: Select Event */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Step 1: Select Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events?.map((event) => (
                        <Button
                          key={event.id}
                          variant={selectedEventId === event.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedEventId(event.id);
                            setSelectedLocationId(null);
                            setFeaturedPublicationId(null);
                          }}
                        >
                          {event.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Select Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Step 2: Select Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEventId ? (
                    <ExportLocationSelector
                      eventId={selectedEventId}
                      selectedLocationId={selectedLocationId}
                      onLocationSelect={setSelectedLocationId}
                      hostLocation={hostLocation}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">Select an event first</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Featured Publication Info */}
            {selectedLocationId && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Featured Publication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {featuredPublication ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {featuredPublication.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(featuredPublication.created_at || '').toLocaleDateString()}</span>
                          <Badge variant="secondary" className="ml-2">Featured</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={handleExport} 
                        className="ml-4"
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Publication'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">No featured publication found</p>
                      <p className="text-sm text-gray-500">
                        This location doesn't have a featured publication to export.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Global Content Info */}
            {hostLocation && selectedLocationId && selectedLocationId !== hostLocation.id && featuredPublication && (
              <Card className="mb-8 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Globe className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Global Content Integration
                      </h3>
                      <p className="text-blue-800 text-sm mb-3">
                        Global content blocks from <strong>{hostLocation.name}</strong> (host location) 
                        will be automatically included at the top of the exported publication.
                      </p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Globe className="w-3 h-3 mr-1" />
                        Host: {hostLocation.name}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Selection Summary */}
            {(selectedEvent || selectedLocation) && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedEvent && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Event: <strong>{selectedEvent.name}</strong></span>
                      </div>
                    )}
                    {selectedLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Location: <strong>{selectedLocation.name}</strong>
                          {selectedLocation.is_host && (
                            <Badge variant="secondary" className="ml-2">Host</Badge>
                          )}
                        </span>
                      </div>
                    )}
                    {featuredPublication && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Publication: <strong>{featuredPublication.title}</strong>
                          <Badge variant="secondary" className="ml-2">Featured</Badge>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* Export Format Selection Modal */}
      <Dialog open={showFormatSelection} onOpenChange={setShowFormatSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Choose Export Format
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-gray-600 text-sm mb-6">
              Select the format you'd like to export your publication in:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleFormatSelect('html')}
                disabled={isExporting}
              >
                <div className="flex items-center gap-3">
                  {isExporting && exportHTMLMutation.isPending ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <Mail className="w-6 h-6 text-blue-600" />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">Email HTML</div>
                    <div className="text-sm text-gray-500">Export as email-ready HTML format</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleFormatSelect('pdf')}
                disabled={isExporting}
              >
                <div className="flex items-center gap-3">
                  {isExporting && exportPDFMutation.isPending ? (
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  ) : (
                    <File className="w-6 h-6 text-red-600" />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">PDF Document</div>
                    <div className="text-sm text-gray-500">Export as printable PDF file</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ExportModule;

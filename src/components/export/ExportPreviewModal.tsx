
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download,
  Globe,
  FileText,
  Loader2,
  MapPin,
  Calendar
} from 'lucide-react';
import { usePublication, usePublicationByEventAndDate } from '@/hooks/usePublications';
import { useEvent, useLocation } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { ParentBlockData } from '@/pages/PublicationEditor';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicationId: string;
  eventId: string;
  locationId: string;
  hostLocationId?: string;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  publicationId,
  eventId,
  locationId,
  hostLocationId
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [mergedContent, setMergedContent] = useState<ParentBlockData[]>([]);

  const { data: publication } = usePublication(publicationId);
  const { data: event } = useEvent(eventId);
  const { data: location } = useLocation(locationId);
  
  // Get host publications for the same date as the current publication
  const { data: hostPublications } = usePublicationByEventAndDate(
    eventId, 
    publication?.publication_date || ''
  );

  useEffect(() => {
    if (publication && hostLocationId && locationId !== hostLocationId) {
      // Get global content blocks from host location
      const globalBlocks: ParentBlockData[] = [];
      
      if (hostPublications) {
        // Filter to only get publications from the host location
        const hostLocationPublications = hostPublications.filter(
          pub => pub.location_id === hostLocationId
        );
        
        hostLocationPublications.forEach(hostPub => {
          if (hostPub.content) {
            const content = Array.isArray(hostPub.content) 
              ? hostPub.content 
              : JSON.parse(String(hostPub.content));
            content.forEach((block: ParentBlockData) => {
              if (block.isGlobal) {
                globalBlocks.push({
                  ...block,
                  id: `global-${block.id}`, // Ensure unique IDs
                });
              }
            });
          }
        });
      }

      // Get current publication content
      const publicationContent = Array.isArray(publication.content) 
        ? publication.content 
        : JSON.parse(String(publication.content) || '[]');

      // Merge: global blocks first, then publication blocks
      setMergedContent([...globalBlocks, ...publicationContent]);
    } else {
      // No host location or same location - just use publication content
      const publicationContent = publication 
        ? (Array.isArray(publication.content) 
           ? publication.content 
           : JSON.parse(String(publication.content) || '[]'))
        : [];
      setMergedContent(publicationContent);
    }
  }, [publication, hostPublications, hostLocationId, locationId]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create export data
      const exportData = {
        publication: {
          ...publication,
          content: mergedContent
        },
        event,
        location,
        exportedAt: new Date().toISOString(),
        includesGlobalContent: hostLocationId && locationId !== hostLocationId
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${String(publication?.title || 'publication').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Publication "${String(publication?.title)}" has been exported successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export publication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const globalBlocks = mergedContent.filter(block => block.id?.startsWith('global-'));
  const regularBlocks = mergedContent.filter(block => !block.id?.startsWith('global-'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Preview: {String(publication?.title)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Export Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Event: {String(event?.name)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Location: {String(location?.name)}</span>
            </div>
            
            {hostLocationId && locationId !== hostLocationId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Global Content Included</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {globalBlocks.length} global content block(s) from the host location will be added to the top of this export.
                </p>
              </div>
            )}
          </div>

          {/* Content Preview */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4">
            {globalBlocks.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Global Content Blocks</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {globalBlocks.length} block{globalBlocks.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {globalBlocks.map((block, index) => (
                  <div key={block.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-900">
                        {block.title || block.umoorName}
                      </span>
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                        Global
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700">
                      {block.umoorName} • {block.children?.length || 0} content item(s)
                    </p>
                  </div>
                ))}
                
                <Separator className="my-4" />
              </>
            )}

            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Publication Content Blocks</h3>
              <Badge variant="secondary">
                {regularBlocks.length} block{regularBlocks.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {regularBlocks.map((block, index) => (
              <div key={block.id} className="border-l-4 border-gray-300 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {block.title || block.umoorName}
                  </span>
                  {block.isGlobal && (
                    <Badge variant="outline" className="text-xs">
                      Global
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {block.umoorName} • {block.children?.length || 0} content item(s)
                </p>
              </div>
            ))}

            {mergedContent.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No content blocks found</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Total: {mergedContent.length} content block{mergedContent.length !== 1 ? 's' : ''}
            {globalBlocks.length > 0 && (
              <span className="text-blue-600 ml-2">
                (includes {globalBlocks.length} global)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || mergedContent.length === 0}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export Publication'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

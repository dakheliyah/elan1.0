
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportFormatSelector } from './ExportFormatSelector';
import { ExportPreview } from './ExportPreview';
import { ExportActions } from './ExportActions';
import { Publication } from '@/pages/PublicationEditor';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication;
  publicationId: string;
  hostPublication?: Publication | null;
  locationLogo?: string;
  locationName?: string;
}

export interface ExportFormat {
  type: 'html' | 'pdf';
  template: string;
  options: Record<string, any>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  publication,
  publicationId,
  hostPublication,
  locationLogo,
  locationName
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'pdf'>('html');
  const [exportOptions, setExportOptions] = useState<ExportFormat>({
    type: 'html',
    template: 'professional',
    options: {}
  });

  const handleFormatChange = (format: 'html' | 'pdf') => {
    setSelectedFormat(format);
    setExportOptions(prev => ({
      ...prev,
      type: format,
      template: format === 'html' ? 'professional' : 'a4-portrait'
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Publication</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel - Format Selection & Options */}
          <div className="w-1/3 flex flex-col gap-4">
            <Tabs value={selectedFormat} onValueChange={handleFormatChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML Email</TabsTrigger>
                <TabsTrigger value="pdf">PDF Document</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="space-y-4">
                <ExportFormatSelector
                  format="html"
                  selectedTemplate={exportOptions.template}
                  options={exportOptions.options}
                  onTemplateChange={(template) => 
                    setExportOptions(prev => ({ ...prev, template }))
                  }
                  onOptionsChange={(options) => 
                    setExportOptions(prev => ({ ...prev, options }))
                  }
                />
              </TabsContent>
              
              <TabsContent value="pdf" className="space-y-4">
                <ExportFormatSelector
                  format="pdf"
                  selectedTemplate={exportOptions.template}
                  options={exportOptions.options}
                  onTemplateChange={(template) => 
                    setExportOptions(prev => ({ ...prev, template }))
                  }
                  onOptionsChange={(options) => 
                    setExportOptions(prev => ({ ...prev, options }))
                  }
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <ExportPreview
              publication={publication}
              exportFormat={exportOptions}
              locationLogo={locationLogo}
              locationName={locationName}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t pt-4">
          <ExportActions
            publication={publication}
            publicationId={publicationId}
            hostPublication={hostPublication}
            exportFormat={exportOptions}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

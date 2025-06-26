
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Mail, 
  Settings, 
  Palette,
  Loader2
} from 'lucide-react';
import { ExportOptions, EmailTemplateOptions } from '@/services/publicationExport';
import type { Database } from '@/integrations/supabase/types';

type Publication = Database['public']['Tables']['publications']['Row'];
import { 
  useExportHTML, 
  useExportPDF, 
  useGenerateEmailTemplate 
} from '@/hooks/usePublicationExport';
import { useHostPublication } from '@/hooks/useHostPublication';
import { useLocation } from '@/hooks/useLocations';
import { convertToPublication } from '@/utils/publicationConverter';

interface ExportOptionsPanelProps {
  publication: Publication;
  publicationId: string;
}

const ExportOptionsPanel: React.FC<ExportOptionsPanelProps> = ({ 
  publication, 
  publicationId 
}) => {
  // Fetch location data to get host location ID
  const { data: location } = useLocation(publication.location_id || '');
  const hostLocationId = location?.host_location_id || null;
  const { data: hostPublication, isLoading: isLoadingHostPublication } = useHostPublication(
    publication.event_id || '',
    hostLocationId
  );
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    template: 'professional',
    pageSize: 'A4',
    imageQuality: 'high',
    includeMetadata: true,
    customBranding: {
      primaryColor: '#4E6F1F',
        secondaryColor: '#ADBF97',
      fontFamily: 'Arial, sans-serif'
    }
  });

  const [emailOptions, setEmailOptions] = useState<EmailTemplateOptions>({
    style: 'professional',
    includeImages: true,
    useBase64Images: false,
    darkModeCompatible: true
  });

  const exportHTMLMutation = useExportHTML();
  const exportPDFMutation = useExportPDF();
  const generateEmailMutation = useGenerateEmailTemplate();

  const handleExportHTML = () => {
    console.log('🚀 Starting HTML export with host publication:', {
      publicationId: publication.id,
      publicationTitle: publication.title,
      hostPublicationId: hostPublication?.dbPublication?.id,
      hostPublicationTitle: hostPublication?.publication?.title,
      includeGlobalContent: exportOptions.includeGlobalContent
    });
    
    const convertedPublication = convertToPublication(publication);
    const convertedHostPublication = hostPublication?.publication;
    
    exportHTMLMutation.mutate({
      publication: convertedPublication,
      hostPublication: convertedHostPublication,
      options: exportOptions
    });
  };

  const handleExportPDF = () => {
    console.log('🚀 Starting PDF export with host publication:', {
      publicationId: publication.id,
      publicationTitle: publication.title,
      hostPublicationId: hostPublication?.dbPublication?.id,
      hostPublicationTitle: hostPublication?.publication?.title,
      includeGlobalContent: exportOptions.includeGlobalContent
    });
    
    const convertedPublication = convertToPublication(publication);
    const convertedHostPublication = hostPublication?.publication;
    
    exportPDFMutation.mutate({
      publication: convertedPublication,
      hostPublication: convertedHostPublication,
      options: exportOptions
    });
  };

  const handleGenerateEmail = () => {
    const convertedPublication = convertToPublication(publication);
    generateEmailMutation.mutate({ publication: convertedPublication, templateOptions: emailOptions });
  };

  const updateExportOption = <K extends keyof ExportOptions>(
    key: K, 
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateEmailOption = <K extends keyof EmailTemplateOptions>(
    key: K, 
    value: EmailTemplateOptions[K]
  ) => {
    setEmailOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateCustomBranding = (key: string, value: string) => {
    setExportOptions(prev => ({
      ...prev,
      customBranding: {
        ...prev.customBranding,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Template Style</Label>
              <Select 
                value={exportOptions.template} 
                onValueChange={(value: any) => updateExportOption('template', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="branded">Branded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pageSize">Page Size</Label>
              <Select 
                value={exportOptions.pageSize} 
                onValueChange={(value: any) => updateExportOption('pageSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imageQuality">Image Quality</Label>
              <Select 
                value={exportOptions.imageQuality} 
                onValueChange={(value: any) => updateExportOption('imageQuality', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Quality</SelectItem>
                  <SelectItem value="medium">Medium Quality</SelectItem>
                  <SelectItem value="web-optimized">Web Optimized</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="includeMetadata"
                checked={exportOptions.includeMetadata}
                onCheckedChange={(checked) => updateExportOption('includeMetadata', checked)}
              />
              <Label htmlFor="includeMetadata">Include Metadata</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Branding */}
      {exportOptions.template === 'branded' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              Custom Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={exportOptions.customBranding?.primaryColor || '#4E6F1F'}
                  onChange={(e) => updateCustomBranding('primaryColor', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={exportOptions.customBranding?.secondaryColor || '#ADBF97'}
                  onChange={(e) => updateCustomBranding('secondaryColor', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                placeholder="Arial, sans-serif"
                value={exportOptions.customBranding?.fontFamily || ''}
                onChange={(e) => updateCustomBranding('fontFamily', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleExportHTML}
              disabled={exportHTMLMutation.isPending}
              className="flex items-center gap-2"
            >
              {exportHTMLMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              Export HTML
            </Button>

            <Button
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending}
              className="flex items-center gap-2"
            >
              {exportPDFMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Email Template Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Email Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailStyle">Email Style</Label>
              <Select 
                value={emailOptions.style} 
                onValueChange={(value: any) => updateEmailOption('style', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="branded">Branded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="includeImages"
                checked={emailOptions.includeImages}
                onCheckedChange={(checked) => updateEmailOption('includeImages', checked)}
              />
              <Label htmlFor="includeImages">Include Images</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useBase64Images"
                checked={emailOptions.useBase64Images}
                onCheckedChange={(checked) => updateEmailOption('useBase64Images', checked)}
              />
              <Label htmlFor="useBase64Images">Use Base64 Images</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="darkModeCompatible"
                checked={emailOptions.darkModeCompatible}
                onCheckedChange={(checked) => updateEmailOption('darkModeCompatible', checked)}
              />
              <Label htmlFor="darkModeCompatible">Dark Mode Compatible</Label>
            </div>
          </div>

          <Button
            onClick={handleGenerateEmail}
            disabled={generateEmailMutation.isPending}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            {generateEmailMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Mail size={16} />
            )}
            Generate Email Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportOptionsPanel;

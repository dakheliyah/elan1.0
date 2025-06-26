
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share2, 
  Mail, 
  Eye, 
  Copy,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Publication } from '@/pages/PublicationEditor';
import { ExportFormat } from './ExportModal';
import { 
  useExportHTML, 
  useExportPDF, 
  useGenerateEmailTemplate 
} from '@/hooks/usePublicationExport';

interface ExportActionsProps {
  publication: Publication;
  publicationId: string;
  hostPublication?: Publication | null;
  exportFormat: ExportFormat;
  onClose: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  publication,
  publicationId,
  hostPublication,
  exportFormat,
  onClose
}) => {
  const { toast } = useToast();
  const [copiedHtml, setCopiedHtml] = useState(false);
  
  const exportHTMLMutation = useExportHTML();
  const exportPDFMutation = useExportPDF();
  const generateEmailMutation = useGenerateEmailTemplate();

  const handleDownload = async () => {
    if (exportFormat.type === 'html') {
      exportHTMLMutation.mutate({ 
        publication,
        hostPublication,
        options: {
          template: exportFormat.template as any,
          imageQuality: 'high',
          includeMetadata: true,
          customBranding: exportFormat.template === 'branded' ? {
            primaryColor: '#4E6F1F',
      secondaryColor: '#ADBF97'
          } : undefined
        }
      });
    } else {
      exportPDFMutation.mutate({ 
        publication,
        hostPublication,
        options: {
          template: 'professional',
          pageSize: exportFormat.options.pageSize || 'A4',
          imageQuality: exportFormat.options.quality || 'high',
          includeMetadata: exportFormat.options.includeMetadata !== false
        }
      });
    }
  };

  const handleCopyHTML = async () => {
    if (exportFormat.type !== 'html') return;
    
    generateEmailMutation.mutate({
      publication,
      templateOptions: {
        style: exportFormat.template as any,
        includeImages: true,
        useBase64Images: exportFormat.options.imageHandling === 'base64',
        darkModeCompatible: exportFormat.options.darkModeSupport || false
      }
    });
  };

  const handleShare = () => {
    // Placeholder for share functionality
    toast({
      title: "Share Feature",
      description: "Share functionality will be implemented based on your platform's sharing requirements.",
    });
  };

  const handleEmail = () => {
    // Placeholder for email functionality
    toast({
      title: "Email Integration",
      description: "Email integration will be implemented based on your email service provider.",
    });
  };

  const isLoading = exportHTMLMutation.isPending || exportPDFMutation.isPending || generateEmailMutation.isPending;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {(exportHTMLMutation.isPending || exportPDFMutation.isPending) ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download {exportFormat.type.toUpperCase()}
        </Button>

        {exportFormat.type === 'html' && (
          <Button
            variant="outline"
            onClick={handleCopyHTML}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {generateEmailMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : copiedHtml ? (
              <CheckCircle size={16} />
            ) : (
              <Copy size={16} />
            )}
            {generateEmailMutation.isPending ? 'Copying...' : copiedHtml ? 'Copied!' : 'Copy HTML'}
          </Button>
        )}
      </div>

      <div className="h-6 w-px bg-gray-300" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleShare}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Share2 size={16} />
          Share
        </Button>

        <Button
          variant="outline"
          onClick={handleEmail}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Mail size={16} />
          Email
        </Button>
      </div>

      <div className="flex-1" />

      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
};


import { useMutation } from '@tanstack/react-query';
import { 
  ExportOptions, 
  EmailTemplateOptions,
  publicationExportService 
} from '@/services/publicationExport';
import { Publication } from '@/pages/PublicationEditor';
import { useToast } from '@/hooks/use-toast';

interface ExtendedExportOptions extends ExportOptions {
  includeGlobalContent?: boolean;
  hostLocationId?: string;
}

export const useExportHTML = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ publicationId, options }: { publicationId: string; options?: ExtendedExportOptions }) => {
      return await publicationExportService.exportAsHTML(publicationId, options);
    },
    onSuccess: (htmlContent, { publicationId }) => {
      // Create downloadable file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `publication-${publicationId}-email.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "HTML Export Complete",
        description: "Email-ready HTML has been downloaded successfully.",
      });
    },
    onError: (error) => {
      console.error('HTML export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export publication as HTML. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useExportPDF = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ publicationId, options }: { publicationId: string; options?: ExtendedExportOptions }) => {
      return await publicationExportService.exportAsPDF(publicationId, options);
    },
    onSuccess: (pdfBlob, { publicationId }) => {
      // Create downloadable file
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `publication-${publicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Export Complete",
        description: "PDF has been downloaded successfully.",
      });
    },
    onError: (error) => {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export publication as PDF. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useGenerateEmailTemplate = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      publication, 
      templateOptions 
    }: { 
      publication: Publication; 
      templateOptions: EmailTemplateOptions; 
    }) => {
      return publicationExportService.generateEmailTemplate(publication, templateOptions);
    },
    onSuccess: (emailHtml, { publication }) => {
      // Copy to clipboard
      navigator.clipboard.writeText(emailHtml).then(() => {
        toast({
          title: "Email Template Generated",
          description: "Email template has been copied to clipboard.",
        });
      }).catch(() => {
        // Fallback: download as file
        const blob = new Blob([emailHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email-template-${publication.title.replace(/\s+/g, '-').toLowerCase()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Email Template Generated",
          description: "Email template has been downloaded as HTML file.",
        });
      });
    },
    onError: (error) => {
      console.error('Email template generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate email template. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useOptimizeImages = () => {
  return useMutation({
    mutationFn: async (publication: Publication) => {
      return await publicationExportService.optimizeImagesForExport(publication);
    },
  });
};

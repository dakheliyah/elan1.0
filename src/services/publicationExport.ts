import { ParentBlockData, Publication as BasePublication } from '@/pages/PublicationEditor';

// Extended Publication interface for export functionality
export interface Publication extends BasePublication {
  locationName?: string;
  locationLogo?: string;
}

export interface ExportOptions {
  template?: 'professional' | 'minimal' | 'branded';
  pageSize?: 'A4' | 'Letter' | 'Custom';
  imageQuality?: 'high' | 'medium' | 'web-optimized';
  includeMetadata?: boolean;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  customPageSize?: {
    width: number;
    height: number;
    unit: 'mm' | 'in' | 'px';
  };
  locationId?: string;  
  includeGlobalContent?: boolean;
  hostLocationId?: string;
}

export interface OptimizedImage {
  originalUrl: string;
  optimizedUrl: string;
  base64?: string;
  width: number;
  height: number;
  alt: string;
}

export interface EmailTemplateOptions {
  style: 'professional' | 'minimal' | 'branded';
  includeImages: boolean;
  useBase64Images: boolean;
  darkModeCompatible: boolean;
}

export class PublicationExportService {
  private static instance: PublicationExportService;

  static getInstance(): PublicationExportService {
    if (!PublicationExportService.instance) {
      PublicationExportService.instance = new PublicationExportService();
    }
    return PublicationExportService.instance;
  }

  async exportAsHTML(publication: Publication, hostPublication?: Publication | null, options: ExportOptions = {}): Promise<string> {
    try {
      console.log('🚀 [Export Debug] Starting HTML export for publication:', publication.title);
      console.log('⚙️ [Export Debug] Export options:', options);
      
      // Debug: Log headers from DB (original publication)
      console.log('📊 [DB Headers Debug] Original publication headers from DB:');
      console.log('  📋 Publication parentBlocks:', publication.parentBlocks?.map(block => ({
        id: block.id,
        umoorId: block.umoorId,
        umoorName: block.umoorName,
        isGlobal: block.isGlobal || false,
        source: 'local publication'
      })) || []);
      
      if (hostPublication) {
        console.log('  🌐 Host publication parentBlocks:', hostPublication.parentBlocks?.map(block => ({
          id: block.id,
          umoorId: block.umoorId,
          umoorName: block.umoorName,
          isGlobal: block.isGlobal || false,
          source: 'host publication (global)'
        })) || []);
      } else {
        console.log('  🌐 No host publication provided');
      }
      
      // Combine publication and host publication data using LivePreview logic
      const combinedPublication = this.combinePublicationData(publication, hostPublication);
      console.log('📖 [Export Debug] Combined publication:', {
        title: combinedPublication.title,
        breadcrumb: combinedPublication.breadcrumb,
        parentBlocksCount: combinedPublication.parentBlocks.length
      });
      
      // Debug: Log umoor list after combination
      console.log('🏷️ [Umoor List Debug] Final umoor list after combination:');
      combinedPublication.parentBlocks.forEach((block, index) => {
        console.log(`  Umoor ${index + 1}:`, {
          umoorId: block.umoorId,
          umoorName: block.umoorName,
          isGlobal: block.isGlobal,
          priority: block.isGlobal ? 'GLOBAL (prioritized)' : 'LOCAL',
          childrenCount: block.children?.length || 0
        });
      });
      
      // Debug: Log detailed parentBlocks structure
      console.log('🔍 [Export Debug] ParentBlocks detailed structure:');
      combinedPublication.parentBlocks.forEach((block, index) => {
        console.log(`  Block ${index}:`, {
          id: block.id,
          umoorId: block.umoorId,
          isGlobal: block.isGlobal,
          childrenCount: block.children?.length || 0,
          children: block.children?.map(child => ({
            id: child.id,
            type: child.type,
            content: child.data ? 'has content' : 'no content'
          })) || []
        });
      });

      const optimizedImages = await this.optimizeImagesForExport(combinedPublication);
      console.log('🖼️ [Export Debug] Optimized images count:', optimizedImages.length);
      
      // Debug: Log headers being entered into HTML generation
      console.log('🎨 [HTML Headers Debug] Headers being passed to HTML renderer:');
      combinedPublication.parentBlocks.forEach((block, index) => {
        console.log(`  HTML Header ${index + 1}:`, {
          umoorId: block.umoorId,
          umoorName: block.umoorName,
          title: block.title,
          isGlobal: block.isGlobal,
          willBeRendered: true,
          childrenToRender: block.children?.length || 0
        });
      });
      
      const htmlContent = this.generateHTMLContent(combinedPublication, optimizedImages, options);
      console.log('📄 [Export Debug] Generated HTML content length:', htmlContent.length);
      console.log('🎯 [Export Debug] HTML content preview (first 500 chars):', htmlContent.substring(0, 500));
      
      return htmlContent;
    } catch (error) {
      console.error('HTML export failed:', error);
      throw new Error('Failed to export publication as HTML');
    }
  }

  async exportAsPDF(publication: Publication, hostPublication?: Publication | null, options: ExportOptions = {}): Promise<Blob> {
    try {
      const htmlContent = await this.exportAsHTML(publication, hostPublication, options);
      const pdfBlob = await this.generatePDFFromHTML(htmlContent, options);
      return pdfBlob;
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export publication as PDF');
    }
  }

  generateEmailTemplate(publicationData: Publication, templateOptions: EmailTemplateOptions): string {
    const { style, includeImages, useBase64Images, darkModeCompatible } = templateOptions;
    
    const baseStyles = this.getEmailBaseStyles(style, darkModeCompatible);
    const contentHtml = this.generateEmailContent(publicationData, includeImages, useBase64Images);
    
    return `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${publicationData.title}</title>
        <style>
          ${baseStyles}
        </style>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body>
        <div class="email-container">
          ${contentHtml}
        </div>
      </body>
      </html>
    `;
  }

  async optimizeImagesForExport(publication: Publication): Promise<OptimizedImage[]> {
    const images: OptimizedImage[] = [];
    
    for (const parentBlock of publication.parentBlocks) {
      for (const child of parentBlock.children) {
        if (child.type === 'image' && child.data.imageUrl) {
          try {
            const optimized = await this.optimizeImage(child.data.imageUrl, child.data.alt || '');
            images.push(optimized);
          } catch (error) {
            console.warn(`Failed to optimize image: ${child.data.imageUrl}`, error);
          }
        }
      }
    }
    
    return images;
  }

  // Combine publication and host publication data using the same logic as LivePreview
  private combinePublicationData(publication: Publication, hostPublication?: Publication | null): Publication {
    if (!hostPublication) {
      return {
        ...publication,
        parentBlocks: publication.parentBlocks || []
      };
    }

    // Use the same combinedParentBlocks logic as LivePreview
    const hostBlocks = hostPublication.parentBlocks || [];
    const pubBlocks = publication.parentBlocks || [];
    const allBlocks = hostBlocks.length > 0
      ? [...hostBlocks.filter(block => block.isGlobal), ...pubBlocks]
      : pubBlocks;

    // Group blocks by umoorId and prioritize global blocks over local ones
    const umoorMap = new Map<string, any>();
    const processedUmoors = new Set<string>();
    const finalBlocks: any[] = [];

    // First pass: collect all blocks by umoorId, prioritizing global blocks
    (allBlocks || []).forEach(block => {
      const umoorId = block.umoorId;
      if (!umoorMap.has(umoorId)) {
        umoorMap.set(umoorId, { global: null, local: null });
      }
      
      const umoorData = umoorMap.get(umoorId);
      if (block.isGlobal) {
        umoorData.global = block;
      } else {
        umoorData.local = block;
      }
    });

    // Second pass: select blocks with global priority
    umoorMap.forEach((umoorData, umoorId) => {
      // If both global and local exist for same umoor, prioritize global
      const selectedBlock = umoorData.global || umoorData.local;
      if (selectedBlock) {
        finalBlocks.push(selectedBlock);
        console.log(`🎯 [Export Debug] Selected block for umoor ${umoorId}:`, {
          umoorName: selectedBlock.umoorName,
          isGlobal: selectedBlock.isGlobal,
          priority: umoorData.global ? 'global (prioritized)' : 'local (only option)'
        });
      }
    });

    // Sort final blocks: global umoors first, then local umoors
    const combinedBlocks = finalBlocks.sort((a, b) => {
      if (a.isGlobal && !b.isGlobal) return -1;
      if (!a.isGlobal && b.isGlobal) return 1;
      return 0;
    });

    return {
      ...publication,
      parentBlocks: combinedBlocks
    };
  }

  private generateHTMLContent(publication: Publication, optimizedImages: OptimizedImage[], options: ExportOptions): string {
    const htmlRenderer = new HTMLPublicationRenderer();
    return htmlRenderer.render(publication, options);
  }











  private formatTextForEmail(content: string): string {
    if (!content) return '';
    
    // Basic HTML formatting for email compatibility
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .trim();
  }

  private getEmailBaseStyles(style: string, darkModeCompatible: boolean): string {
    const baseStyles = `
      /* Reset styles for email compatibility */
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      
      /* Email container with table-based layout */
      .email-container {
        width: 100% !important;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
      }
      
      .email-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .email-decorative {
        font-size: 18px;
        color: #666;
        letter-spacing: 4px;
        margin-bottom: 20px;
      }
      
      .email-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #1f2937;
      }
      
      .email-breadcrumb {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 5px;
      }
      
      .email-date {
        font-size: 12px;
        color: #9ca3af;
      }
      
      /* Umoor section with table layout for email compatibility */
      .email-umoor-section {
        margin-bottom: 30px;
        padding: 15px;
        border-left: 4px solid #4E6F1F;
        background: #f8fafc;
      }
      
      .email-umoor-header {
        margin-bottom: 15px;
      }
      
      .email-umoor-header table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .email-umoor-logo {
        width: 60px;
        height: 60px;
        text-align: center;
        vertical-align: top;
      }
      
      .email-umoor-logo img {
        width: 50px;
        height: 50px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      
      .email-umoor-logo-emoji {
        font-size: 30px;
        line-height: 50px;
      }
      
      .email-umoor-info {
        padding-left: 15px;
        vertical-align: top;
      }
      
      .email-umoor-name {
        display: inline-block;
        background: #BAD9A2;
        color: #4E6F1F;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .email-umoor-title {
        font-size: 18px;
        font-weight: bold;
        color: #1f2937;
        margin: 0 0 5px 0;
      }
      
      .email-umoor-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
      
      .email-content-block {
        margin-bottom: 20px;
      }
      
      .email-language-badge {
        display: inline-block;
        background: #f3f4f6;
        color: #374151;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .email-language-badge.eng {
        background: #dbeafe;
        color: #1e40af;
      }
      
      .email-language-badge.lud {
        background: #fef3c7;
        color: #92400e;
      }
      
      .email-text-content {
        font-size: 14px;
        line-height: 1.7;
        color: #374151;
        margin-bottom: 15px;
      }
      
      .email-text-content.rtl {
        direction: rtl;
        text-align: right;
        font-family: Arial, sans-serif;
      }
      
      .email-text-content p {
        margin: 0 0 10px 0;
      }
      
      .email-text-content ul, .email-text-content ol {
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .email-text-content li {
        margin-bottom: 5px;
      }
      
      .email-image {
        width: 100%;
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        margin-bottom: 10px;
      }
      
      .email-image-caption {
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        font-style: italic;
        margin-top: 5px;
      }
      
      .email-menu-block {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 24px;
        font-family: Arial, sans-serif;
        overflow: hidden;
      }
      
      .email-menu-title {
        background: #eff6ff;
        font-size: 20px;
        font-weight: bold;
        color: #1f2937;
        padding: 16px 24px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
        margin: 0;
      }
      
      .email-menu-item {
        padding: 20px 24px;
        border-bottom: 1px dotted #d1d5db;
      }
      
      .email-menu-item:last-child {
        border-bottom: none;
      }
      
      .email-menu-item table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .email-menu-item-info {
        vertical-align: top;
        padding-right: 10px;
      }
      
      .email-menu-item-name {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 12px;
        line-height: 1.4;
      }
      
      .email-menu-item-description {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 6px;
        line-height: 1.3;
      }
      
      .email-menu-item-nutrition {
        margin-bottom: 12px;
      }
      
      .email-menu-item-nutrition span {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background-color: #dcfce7;
        color: #166534;
      }
      
      .email-menu-item-allergens {
        font-size: 14px;
        color: #dc2626;
      }
      
      .email-menu-item-allergens-label {
        font-weight: 500;
      }
      
      .email-menu-item-price {
        font-size: 14px;
        font-weight: bold;
        color: #059669;
        text-align: right;
        vertical-align: top;
        white-space: nowrap;
      }
      
      .email-menu-empty {
        text-align: center;
        color: #6b7280;
        font-style: italic;
        padding: 24px;
        background: #f9fafb;
      }
      
      .email-footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
      }
      
      /* Mobile responsive for email */
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          padding: 10px !important;
        }
        
        .email-title {
          font-size: 20px !important;
        }
        
        .email-umoor-section {
          padding: 10px !important;
        }
        
        .email-umoor-header table {
          display: block !important;
        }
        
        .email-umoor-logo,
        .email-umoor-info {
          display: block !important;
          width: 100% !important;
          padding: 0 !important;
          text-align: center !important;
        }
        
        .email-umoor-logo {
          margin-bottom: 10px !important;
        }
      }
    `;

    if (darkModeCompatible) {
      return baseStyles + `
        /* Dark mode support for email clients that support it */
        @media (prefers-color-scheme: dark) {
          .email-container {
            background: #1f2937 !important;
            color: #f9fafb !important;
          }
          
          .email-title {
            color: #f9fafb !important;
          }
          
          .email-umoor-section {
            background: #374151 !important;
            border-left-color: #60a5fa !important;
          }
          
          .email-text-content {
            color: #e5e7eb !important;
          }
          
          .email-umoor-title {
            color: #f9fafb !important;
          }
        }
      `;
    }

    return baseStyles;
  }

  private generateEmailContent(publication: Publication, includeImages: boolean, useBase64Images: boolean): string {
    const header = `
      <div class="email-header">
        <div class="email-decorative">* * *</div>
        <h1 class="email-title">${publication.title}</h1>
        <p class="email-breadcrumb">${publication.breadcrumb}</p>
        <p class="email-date">${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>
    `;

    const content = publication.parentBlocks.map(parentBlock => {
      const logoHtml = this.generateEmailLogoHTML(parentBlock);
      const childrenHTML = parentBlock.children.map(child => {
        if (child.type === 'text') {
          const isRTL = child.language === 'lud';
          return `
            <div class="email-content-block">
              <div class="email-text-content ${isRTL ? 'rtl' : ''}">
                ${this.formatTextForEmail(child.data.content || 'No content added yet...')}
              </div>
            </div>
          `;
        }
        
        if (child.type === 'image' && includeImages && child.data.imageUrl) {
          return `
            <div class="email-content-block">
              <img src="${child.data.imageUrl}" alt="${child.data.alt || ''}" class="email-image">
              ${child.data.alt ? `<div class="email-image-caption">${child.data.alt}</div>` : ''}
            </div>
          `;
        }
        
        if (child.type === 'menu') {
          const menuData = child.data;
          
          if (!menuData?.items || menuData.items.length === 0) {
            return `
              <div class="email-content-block">
                <div class="email-menu-empty">No menu items added yet</div>
              </div>
            `;
          }

          const emailMenuItemsHtml = menuData.items.map(item => `
            <div class="email-menu-item">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-menu-item-info">
                    <div class="email-menu-item-name">${item.name}</div>
                    ${item.calories ? `<div class="email-menu-item-nutrition"><span>Calories: ${item.calories}</span></div>` : ''}
                    ${item.allergens ? `<div class="email-menu-item-allergens"><span class="email-menu-item-allergens-label">Allergens:</span> ${item.allergens}</div>` : ''}
                  </td>
                </tr>
              </table>
            </div>
          `).join('');

          return `
            <div class="email-content-block">
              <div class="email-menu-block">
                ${emailMenuItemsHtml}
              </div>
            </div>
          `;
        }
        
        return '';
      }).join('');

      return `
        <div class="email-umoor-section">
          <div class="email-umoor-header">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="email-umoor-logo">
                  ${logoHtml}
                </td>
                <td class="email-umoor-info">
                  <div class="email-umoor-name">${parentBlock.umoorName}</div>
                  ${parentBlock.title ? `<h2 class="email-umoor-title">${parentBlock.title}</h2>` : ''}
                  ${parentBlock.title && parentBlock.title !== parentBlock.umoorName && parentBlock.umoorName ? 
                    `<p class="email-umoor-subtitle">(${parentBlock.umoorName})</p>` : ''}
                </td>
              </tr>
            </table>
          </div>
          ${childrenHTML}
        </div>
      `;
    }).join('');

    const footer = `
      <div class="email-footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    `;

    return `${header}${content}${footer}`;
  }

  private generateEmailLogoHTML(parentBlock: any): string {
    if (parentBlock.umoorLogo && (parentBlock.umoorLogo.startsWith('http') || parentBlock.umoorLogo.startsWith('data:'))) {
      return `<img src="${parentBlock.umoorLogo}" alt="${parentBlock.umoorName}" width="50" height="50">`;
    }
    return `${parentBlock.id && parentBlock.umoorLogo && '<div class="email-umoor-logo-emoji"></div>'}`;
  }

  private async optimizeImage(imageUrl: string, alt: string): Promise<OptimizedImage> {
    // For now, return the original image
    // In a production environment, you would implement actual image optimization
    return {
      originalUrl: imageUrl,
      optimizedUrl: imageUrl,
      width: 800,
      height: 600,
      alt
    };
  }

  private async generatePDFFromHTML(htmlContent: string, options: ExportOptions): Promise<Blob> {
    // Import libraries dynamically
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    return this.createPDFFromHTML(htmlContent, jsPDF, html2canvas);
  }

  private createPDFFromHTML(htmlContent: string, jsPDF: any, html2canvas: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary iframe to render the HTML properly
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        
        document.body.appendChild(iframe);
        
        // Wait for iframe to load
        iframe.onload = () => {
          this.processPDFGeneration(iframe, htmlContent, jsPDF, html2canvas, resolve, reject);
        };
        
        // Set src to trigger onload
        iframe.src = 'about:blank';
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private async processPDFGeneration(
    iframe: HTMLIFrameElement,
    htmlContent: string,
    jsPDF: any,
    html2canvas: any,
    resolve: (value: Blob) => void,
    reject: (reason?: any) => void
  ): Promise<void> {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }
      
      // Set the HTML content
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Wait a bit for content to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the body element
      const body = iframeDoc.body;
      if (!body) {
        throw new Error('Could not find body element');
      }
      
      // Convert to canvas
      const canvas = await html2canvas.default(body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: body.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: body.scrollHeight
      });
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Clean up
      document.body.removeChild(iframe);
      
      // Return PDF blob
      resolve(pdf.output('blob'));
      
    } catch (error) {
      // Clean up on error
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      reject(error);
    }
  }
}

// HTML Renderer Classes
class HTMLPublicationRenderer {
  render(publication: Publication, options: ExportOptions): string {
    const template = options.template || 'professional';
    const includeMetadata = options.includeMetadata !== false;
    
    console.log('🎨 [HTML Renderer] Starting render with:', {
      title: publication.title,
      parentBlocksCount: publication.parentBlocks?.length || 0,
      template,
      includeMetadata
    });
    
    const styles = this.getTemplateStyles(template, options);
    const headerRenderer = new HTMLHeaderRenderer();
    const sectionRenderer = new HTMLSectionRenderer();
    
    const headerHTML = headerRenderer.render(publication);
    console.log('📋 [HTML Renderer] Header HTML length:', headerHTML.length);
    
    const sectionsHTML = publication.parentBlocks
      ?.map((block, index) => {
        console.log(`🔧 [HTML Renderer] Rendering block ${index}:`, {
          id: block.id,
          umoorId: block.umoorId,
          childrenCount: block.children?.length || 0
        });
        const blockHTML = sectionRenderer.render(block);
        console.log(`✅ [HTML Renderer] Block ${index} HTML length:`, blockHTML.length);
        return blockHTML;
      })
      .join('') || '';
    
    console.log('📄 [HTML Renderer] Total sections HTML length:', sectionsHTML.length);
    
    const metadata = includeMetadata ? this.generateMetadataHTML(publication) : '';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${publication.title}</title>
        <style>
          ${styles}
        </style>
      </head>
      <body>
        <div class="publication-container">
          ${headerHTML}
          <main class="publication-content">
            ${sectionsHTML}
          </main>
          ${metadata}
        </div>
      </body>
      </html>
    `;
  }

  private getTemplateStyles(template: string, options: ExportOptions): string {
    // Basic styles - can be expanded based on template
    return `
      body {
        font-family: 'Georgia', serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
      }
      .publication-container {
        background: white;
        padding: 40px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      .publication-header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 2px solid #4E6F1F;
        padding-bottom: 20px;
      }
      .publication-title {
        font-size: 2.5em;
        color: #4E6F1F;
        margin-bottom: 10px;
        font-weight: bold;
      }
      .publication-subtitle {
        font-size: 1.2em;
        color: #666;
        margin-bottom: 5px;
      }
      .publication-info {
        font-size: 0.9em;
        color: #888;
      }
      .location-logo {
        max-height: 80px;
        margin-bottom: 20px;
      }
      .decorative-separator {
        font-size: 1.5em;
        color: #4E6F1F;
        margin: 20px 0;
      }
      .umoor-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      .umoor-title {
        font-size: 1.8em;
        color: #4E6F1F;
        margin-bottom: 15px;
        border-bottom: 1px solid #ADBF97;
        padding-bottom: 5px;
      }
      .content-block {
        margin-bottom: 20px;
      }
      .text-block {
        font-size: 1em;
        line-height: 1.7;
      }
      .image-block {
        text-align: center;
        margin: 20px 0;
      }
      .image-block img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      .menu-block {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #4E6F1F;
      }
      .menu-title {
        font-size: 1.3em;
        color: #4E6F1F;
        margin-bottom: 15px;
        font-weight: bold;
      }
      .menu-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dotted #ccc;
      }
      .menu-item:last-child {
        border-bottom: none;
      }
      .menu-item-name {
        font-weight: 500;
      }
      .menu-item-price {
        color: #4E6F1F;
        font-weight: bold;
      }
      .menu-item-allergens {
        display: block;
        font-size: 0.8em;
        color: #666;
        font-style: italic;
        margin-top: 2px;
      }
      .menu-item-price {
        color: #4E6F1F;
        font-weight: bold;
      }
      @media print {
        body { margin: 0; }
        .publication-container { box-shadow: none; }
      }
    `;
  }

  private generateMetadataHTML(publication: Publication): string {
    return `
      <footer class="publication-metadata" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8em; color: #666;">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Publication: ${publication.title}</p>
      </footer>
    `;
  }
}

class HTMLHeaderRenderer {
  render(publication: Publication): string {
    return `
      <header class="publication-header">
        <div class="decorative-header">
          ${publication.locationLogo ? `
            <div class="logo-container">
              <img
                src="${publication.locationLogo}"
                alt="${publication.locationName || 'Location logo'}"
                class="location-logo"
                onerror="this.style.display='none'"
              />
            </div>
          ` : ''}
          <div class="decorative-separator">* * *</div>
        </div>

        <div class="publication-title-container">
          <h1 class="publication-title">تمارو دن</h1>
          <div class="publication-subtitle">
            Ashara Mubaraka 1447H
          </div>
          <div class="publication-info">
            ${publication.title} • ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </header>
    `;
  }
}

class HTMLSectionRenderer {
  render(block: ParentBlockData): string {
    console.log('🏗️ [Section Renderer] Rendering section:', {
      id: block.id,
      umoorName: block.umoorName,
      umoorId: block.umoorId,
      childrenCount: block.children?.length || 0,
      children: block.children?.map(child => ({
        id: child.id,
        type: child.type,
        hasContent: !!child.data
      })) || []
    });
    
    const contentRenderer = new HTMLContentRenderer();
    const childrenHTML = block.children
      ?.map((child, index) => {
        console.log(`  🧩 [Section Renderer] Rendering child ${index}:`, {
          id: child.id,
          type: child.type,
          content: child.data ? 'present' : 'missing'
        });
        const childHTML = contentRenderer.render(child);
        console.log(`  ✅ [Section Renderer] Child ${index} HTML length:`, childHTML.length);
        return childHTML;
      })
      .join('') || '';

    console.log('📦 [Section Renderer] Section HTML length:', childrenHTML.length);

    return `
      <section class="umoor-section">
        <h2 class="umoor-title">${block.umoorName || 'Section'}</h2>
        <div class="section-content">
          ${childrenHTML}
        </div>
      </section>
    `;
  }
}

class HTMLContentRenderer {
  render(block: any): string {
    switch (block.type) {
      case 'text':
        return this.renderTextBlock(block);
      case 'image':
        return this.renderImageBlock(block);
      case 'menu':
        return this.renderMenuBlock(block);
      default:
        return `<div class="content-block">Unsupported block type: ${block.type}</div>`;
    }
  }

  private renderTextBlock(block: any): string {
    const content = block.data?.content || block.content || block.text || '';
    return `<div class="content-block text-block">${content}</div>`;
  }

  private renderImageBlock(block: any): string {
    const src = block.data?.imageUrl || block.url || block.src || '';
    const alt = block.data?.alt || block.alt || block.caption || 'Image';
    const caption = block.data?.caption || block.caption || '';
    
    return `
      <div class="content-block image-block">
        <img src="${src}" alt="${alt}" />
        ${caption ? `<p class="image-caption">${caption}</p>` : ''}
      </div>
    `;
  }

  private renderMenuBlock(block: any): string {
    const title = block.data?.title || block.title || 'Menu';
    const items = block.data?.items || block.items || [];
    
    const itemsHTML = items.map((item: any) => `
      <div class="menu-item">
        <span class="menu-item-name">${item.name || ''}</span>
        <span class="menu-item-price">${item.price || item.calories || ''}</span>
        ${item.allergens ? `<span class="menu-item-allergens">${item.allergens}</span>` : ''}
      </div>
    `).join('');
    
    return `
      <div class="content-block menu-block">
        <h3 class="menu-title">${title}</h3>
        <div class="menu-items">
          ${itemsHTML}
        </div>
      </div>
    `;
  }
}

// Export singleton instance
export const publicationExportService = PublicationExportService.getInstance();

// Export utility functions - Updated to use new signature
export const exportAsHTML = (publication: Publication, hostPublication?: Publication | null, options?: ExportOptions) => 
  publicationExportService.exportAsHTML(publication, hostPublication, options);

export const exportAsPDF = (publication: Publication, hostPublication?: Publication | null, options?: ExportOptions) => 
  publicationExportService.exportAsPDF(publication, hostPublication, options);

export const generateEmailTemplate = (publicationData: Publication, templateStyle: EmailTemplateOptions) => 
  publicationExportService.generateEmailTemplate(publicationData, templateStyle);

export const optimizeImagesForExport = (publication: Publication) => 
  publicationExportService.optimizeImagesForExport(publication);


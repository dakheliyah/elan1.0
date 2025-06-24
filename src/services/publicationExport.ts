import { ParentBlockData, Publication } from '@/pages/PublicationEditor';
import { supabase } from '@/integrations/supabase/client';

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

  async exportAsHTML(publicationId: string, options: ExportOptions = {}): Promise<string> {
    try {
      console.log('🚀 [Export Debug] Starting HTML export for publication:', publicationId);
      console.log('⚙️ [Export Debug] Export options:', options);
      
      const publication = await this.getPublicationData(publicationId);
      console.log('📖 [Export Debug] Retrieved publication:', {
        title: publication.title,
        breadcrumb: publication.breadcrumb,
        parentBlocksCount: publication.parentBlocks.length
      });

      const optimizedImages = await this.optimizeImagesForExport(publication);
      console.log('🖼️ [Export Debug] Optimized images count:', optimizedImages.length);
      
      const htmlContent = this.generateHTMLContent(publication, optimizedImages, options);
      console.log('📄 [Export Debug] Generated HTML content length:', htmlContent.length);
      console.log('🎯 [Export Debug] HTML content preview (first 500 chars):', htmlContent.substring(0, 500));
      
      return htmlContent;
    } catch (error) {
      console.error('HTML export failed:', error);
      throw new Error('Failed to export publication as HTML');
    }
  }

  async exportAsPDF(publicationId: string, options: ExportOptions = {}): Promise<Blob> {
    try {
      const htmlContent = await this.exportAsHTML(publicationId, options);
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

  private async getPublicationData(publicationId: string): Promise<Publication> {
    console.log('🔍 [Export Debug] Fetching publication data for ID:', publicationId);
    
    const { data, error } = await supabase
      .from('publications')
      .select(`
        *,
        locations!inner(
          id,
          name,
          timezone,
          events!inner(
            id,
            name
          )
        )
      `)
      .eq('id', publicationId)
      .single();

    console.log('📊 [Export Debug] Raw publication data:', data);
    console.log('❌ [Export Debug] Query error:', error);

    if (error || !data) {
      console.error('💥 [Export Debug] Publication not found or error occurred');
      throw new Error('Publication not found');
    }

    console.log('📝 [Export Debug] Raw content field:', data.content);
    console.log('🔢 [Export Debug] Content type:', typeof data.content);
    console.log('📏 [Export Debug] Content length/size:', Array.isArray(data.content) ? data.content.length : (typeof data.content === 'string' ? data.content.length : 'N/A'));

    // Safely parse the content with proper type casting
    const parseContent = (content: any): any[] => {
      console.log('🔄 [Export Debug] Parsing content:', content);
      
      if (!content) {
        console.log('⚠️ [Export Debug] Content is null/undefined/empty');
        return [];
      }
      
      try {
        // If it's already an array, return it
        if (Array.isArray(content)) {
          console.log('✅ [Export Debug] Content is already an array with', content.length, 'items');
          console.log('📋 [Export Debug] Array content preview:', JSON.stringify(content, null, 2));
          return content;
        }
        
        // If it's a string, try to parse it
        if (typeof content === 'string') {
          console.log('🔤 [Export Debug] Content is string, attempting to parse JSON');
          const parsed = JSON.parse(content);
          console.log('✅ [Export Debug] Successfully parsed JSON:', parsed);
          return parsed;
        }
        
        console.log('⚠️ [Export Debug] Content is neither array nor string, returning empty array');
        return [];
      } catch (error) {
        console.error('💥 [Export Debug] Error parsing publication content:', error);
        console.error('🔍 [Export Debug] Failed content value:', content);
        return [];
      }
    };

    const parsedContent = parseContent(data.content);
    console.log('🎯 [Export Debug] Final parsed content:', parsedContent);
    console.log('📊 [Export Debug] Final content length:', parsedContent.length);

    const result = {
      title: data.title,
      breadcrumb: `${data.locations?.events?.name || 'Event'} • ${data.locations?.name || 'Location'}`,
      parentBlocks: parsedContent
    };

    console.log('🏁 [Export Debug] Final publication object:', result);
    return result;
  }

  private generateHTMLContent(publication: Publication, optimizedImages: OptimizedImage[], options: ExportOptions): string {
    const template = options.template || 'professional';
    const includeMetadata = options.includeMetadata !== false;
    
    const styles = this.getTemplateStyles(template, options);
    const content = this.generateContentHTML(publication, optimizedImages, options);
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
          ${this.generateHeaderHTML(publication)}
          <main class="publication-content">
            ${content}
          </main>
          ${metadata}
        </div>
      </body>
      </html>
    `;
  }

  private generateHeaderHTML(publication: Publication): string {
    return `
      <header class="publication-header">
        <div class="decorative-separator">* * *</div>
        <h1 class="publication-title">${publication.title}</h1>
        <p class="publication-breadcrumb">${publication.breadcrumb}</p>
        <p class="publication-date">${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </header>
    `;
  }

  private generateContentHTML(publication: Publication, optimizedImages: OptimizedImage[], options: ExportOptions): string {
    console.log('🎨 [Export Debug] Generating content HTML');
    console.log('📚 [Export Debug] Publication parent blocks:', publication.parentBlocks);
    console.log('📊 [Export Debug] Parent blocks count:', publication.parentBlocks.length);
    console.log('⚙️ [Export Debug] Export options:', options);
    
    if (publication.parentBlocks.length === 0) {
      console.log('⚠️ [Export Debug] No parent blocks found, returning empty message');
      return '<div class="empty-publication">No content blocks added yet</div>';
    }

    const umoorMap = new Map<string, number>();

    console.log('🔍 [Export Debug] Filtering parent blocks by location...');
    const finalParentBlocks = publication.parentBlocks.filter((parentBlock) => {
      console.log('🔎 [Export Debug] Processing parent block:', {
        umoorId: parentBlock.umoorId,
        locationId: parentBlock.locationId,
        isGlobal: parentBlock.isGlobal,
        title: parentBlock.title || parentBlock.umoorName
      });
      
      if (!umoorMap.has(parentBlock.umoorId)) {
        umoorMap.set(parentBlock.umoorId, 1);
      } else {
        // if we have seen it before, set the umoor name and logo to null
        parentBlock.umoorName = '';
        parentBlock.umoorLogo = '';
      }

      const shouldInclude = parentBlock.locationId === options.locationId || parentBlock.isGlobal === true;
      console.log('✅ [Export Debug] Block included:', shouldInclude, '(locationId match:', parentBlock.locationId === options.locationId, ', isGlobal:', parentBlock.isGlobal, ')');
      return shouldInclude;
    });
    
    console.log('📋 [Export Debug] Final parent blocks after filtering:', finalParentBlocks.length);
    console.log('🎯 [Export Debug] Final parent blocks details:', finalParentBlocks.map(block => ({
      umoorId: block.umoorId,
      locationId: block.locationId,
      isGlobal: block.isGlobal,
      childrenCount: block.children?.length || 0
    })));

    if (options.hostLocationId !== options.locationId) {
      // Group blocks by umoorId, with global blocks first within each group
      const groupedBlocks = new Map<string, ParentBlockData[]>();
      
      // First, group all blocks by umoorId
      finalParentBlocks.forEach(block => {
        if (!groupedBlocks.has(block.umoorId)) {
          groupedBlocks.set(block.umoorId, []);
        }
        groupedBlocks.get(block.umoorId)!.push(block);
      });
      
      // Sort each group: global blocks first, then non-global
      groupedBlocks.forEach(blocks => {
        blocks.sort((a, b) => {
          if (a.isGlobal && !b.isGlobal) return -1;
          if (!a.isGlobal && b.isGlobal) return 1;
          return 0;
        });
      });
      
      // Flatten back to array, maintaining group order
      finalParentBlocks.length = 0;
      groupedBlocks.forEach(blocks => {
        finalParentBlocks.push(...blocks);
      });
    }

    return finalParentBlocks.map((parentBlock, index) => {
      console.log(`🏗️ [Export Debug] Processing parent block ${index + 1}/${finalParentBlocks.length}:`, {
        umoorId: parentBlock.umoorId,
        title: parentBlock.title || parentBlock.umoorName,
        childrenCount: parentBlock.children?.length || 0
      });
      
      const umoorHeader = this.generateUmoorHeaderHTML(parentBlock);
      
      console.log('👶 [Export Debug] Processing children blocks:', parentBlock.children);
      const childrenHTML = parentBlock.children.map((child, childIndex) => {
        console.log(`🧩 [Export Debug] Processing child block ${childIndex + 1}:`, {
          type: child.type,
          hasData: !!child.data,
          dataKeys: child.data ? Object.keys(child.data) : []
        });
        return this.generateChildBlockHTML(child, optimizedImages);
      }).join('');
      
      console.log('📝 [Export Debug] Generated children HTML length:', childrenHTML.length);
      console.log('🎨 [Export Debug] Children HTML preview:', childrenHTML.substring(0, 200) + (childrenHTML.length > 200 ? '...' : ''));
      
      const isLast = index === finalParentBlocks.length - 1;
      const nextBlock = finalParentBlocks[index + 1];
      const hasSameUmoorId = nextBlock && nextBlock.umoorId === parentBlock.umoorId;
      
      const sectionHTML = `
        <section class="umoor-section${isLast ? ' last-section' : ''}${hasSameUmoorId ? ' no-divider' : ''}">
          ${umoorHeader}
          <div class="umoor-content">
            ${childrenHTML || '<div class="no-content">No content blocks added yet</div>'}
          </div>
        </section>
      `;
      
      console.log('🏁 [Export Debug] Generated section HTML length:', sectionHTML.length);
      return sectionHTML;
    }).join('');
  }

  private generateUmoorHeaderHTML(parentBlock: any): string {
    const logoHtml = this.getUmoorLogoHTML(parentBlock);
    
    return `
      <div class="umoor-header">
        <div class="umoor-logo">
          ${logoHtml}
        </div>
        <div class="umoor-title-area">
          <h2 class="umoor-title">${parentBlock.title || parentBlock.umoorName}</h2>
          ${parentBlock.title && parentBlock.title !== parentBlock.umoorName ? 
            (parentBlock.umoorName && `<p class="umoor-subtitle">(${parentBlock.umoorName})</p>`) : ''}
        </div>
      </div>
    `;
  }

  private generateChildBlockHTML(block: any, optimizedImages: OptimizedImage[]): string {
    if (block.type === 'text') {
      const isRTL = block.language === 'lud';
      
      return `
        <div class="content-block text-block ${isRTL ? 'rtl' : 'ltr'}">
          <div class="text-content ${isRTL ? 'lud-text' : ''}" ${isRTL ? 'dir="rtl"' : ''}>
            ${this.formatTextContent(block.data.content || 'No content added yet...')}
          </div>
        </div>
      `;
    }

    if (block.type === 'image') {
      const optimizedImage = optimizedImages.find(img => img.originalUrl === block.data.imageUrl);
      const imageUrl = optimizedImage?.optimizedUrl || block.data.imageUrl;
      
      if (!imageUrl) {
        return `
          <div class="content-block image-block">
            <div class="image-placeholder">No image selected</div>
          </div>
        `;
      }

      return `
        <div class="content-block image-block">
          <figure>
            <img src="${imageUrl}" alt="${block.data.alt || 'Publication image'}" class="publication-image">
          </figure>
        </div>
      `;
    }

    return '';
  }

  private formatTextContent(content: string): string {
    if (!content) return 'No content added yet...';
    
    const lines = content.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Handle bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const bulletContent = trimmedLine.substring(1).trim();
        return `<li>${bulletContent}</li>`;
      }
      
      // Handle numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        return `<li data-type="numbered">${numberedMatch[2]}</li>`;
      }
      
      // Regular paragraph
      if (trimmedLine) {
        return `<p>${trimmedLine}</p>`;
      }
      
      return '<br>';
    });
    
    // Group consecutive list items
    let result = '';
    let currentList: string[] = [];
    let listType: 'bullet' | 'numbered' | null = null;
    
    formattedLines.forEach(line => {
      if (line.includes('<li')) {
        const isNumbered = line.includes('data-type="numbered"');
        const currentListType = isNumbered ? 'numbered' : 'bullet';
        
        if (listType !== currentListType && currentList.length > 0) {
          const listTag = listType === 'numbered' ? 'ol' : 'ul';
          result += `<${listTag}>${currentList.join('')}</${listTag}>`;
          currentList = [];
        }
        
        listType = currentListType;
        currentList.push(line.replace(' data-type="numbered"', ''));
      } else {
        if (currentList.length > 0) {
          const listTag = listType === 'numbered' ? 'ol' : 'ul';
          result += `<${listTag}>${currentList.join('')}</${listTag}>`;
          currentList = [];
          listType = null;
        }
        result += line;
      }
    });
    
    // Finish any remaining list
    if (currentList.length > 0) {
      const listTag = listType === 'numbered' ? 'ol' : 'ul';
      result += `<${listTag}>${currentList.join('')}</${listTag}>`;
    }
    
    return result;
  }

  private getUmoorLogoHTML(parentBlock: any): string {
    if (parentBlock.umoorLogo && (parentBlock.umoorLogo.startsWith('http') || parentBlock.umoorLogo.startsWith('data:'))) {
      return `<img src="${parentBlock.umoorLogo}" alt="${parentBlock.umoorName}" class="umoor-logo-image">`;
    }
    return `${parentBlock.id && parentBlock.umoorLogo && '<div class="email-umoor-logo-emoji"></div>'}`;
  }

  private generateMetadataHTML(publication: Publication): string {
    return `
      <div class="publication-metadata">
        <div class="metadata-item">
          <span class="metadata-label">Event:</span>
          <span class="metadata-value">${publication.breadcrumb}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Generated:</span>
          <span class="metadata-value">${new Date().toISOString()}</span>
        </div>
      </div>
    `;
  }

  private getTemplateStyles(template: string, options: ExportOptions): string {
    const baseStyles = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }
      
      .publication-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      
      .publication-header {
        margin-bottom: 60px;
        text-align: center;
      }
      
      .decorative-separator {
        font-size: 24px;
        font-weight: 300;
        color: #666;
        letter-spacing: 8px;
        margin-bottom: 40px;
      }
      
      .publication-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 20px;
        color: #1f2937;
        line-height: 1.2;
      }
      
      .publication-breadcrumb {
        font-size: 1.125rem;
        color: #6b7280;
        margin-bottom: 10px;
      }
      
      .publication-date {
        font-size: 0.875rem;
        color: #9ca3af;
      }
      
      .umoor-section {
        position: relative;
        margin-bottom: 60px;
        padding-bottom: 40px;
      }
      
      .umoor-section:not(.last-section) {
        border-bottom: 1px solid #d1d5db;
      }
      
      .umoor-section.no-divider {
        border-bottom: none;
        background-image: linear-gradient(to right, #d1d5db 50%, transparent 50%);
        background-size: 20px 1px;
        background-repeat: repeat-x;
        background-position: bottom;
        margin-bottom: 20px;
        padding-bottom: 10px;
      }
      
      .umoor-header {
        position: relative;
        margin-bottom: 40px;
      }
      
      .umoor-logo {
        position: absolute;
        top: 0;
        right: 0;
        width: 80px;
        height: 80px;
        z-index: 10;
      }
      
      .umoor-logo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .umoor-logo-emoji {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 40px;
        background: #f9fafb;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
      }
      
      .umoor-title-area {
        padding-right: 100px;
      }
      
      .umoor-title {
        font-size: 1.75rem;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
        line-height: 1.3;
      }
      
      .umoor-subtitle {
        font-size: 1rem;
        color: #6b7280;
        font-weight: 500;
      }
      
      .umoor-content {
        margin-top: 30px;
      }
      
      .content-block {
        margin-bottom: 24px;
      }
      
      .language-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      
      .language-badge.eng {
        background: #BAD9A2;
        color: #4E6F1F;
      }
      
      .language-badge.lud {
        background: #fef3c7;
        color: #92400e;
      }
      
      .text-content {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: #374151;
      }
      
      .text-content.lud-text {
        font-family: "Kanz Al-Marjaan", "Noto Sans Arabic", "Amiri", "Traditional Arabic", Arial, sans-serif;
        line-height: 1.8;
        text-align: right;
        font-size: 24px;
      }
      
      .text-content p {
        margin-bottom: 12px;
      }
      
      .text-content ul, .text-content ol {
        margin: 12px 0;
        padding-left: 20px;
      }
      
      .text-content li {
        margin-bottom: 4px;
        line-height: 1.6;
      }
      
      .publication-image {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin-bottom: 12px;
      }
      
      .image-caption {
        text-align: center;
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
      }
      
      .image-placeholder {
        width: 100%;
        height: 200px;
        background: #f3f4f6;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        font-size: 0.875rem;
      }
      
      .empty-publication, .no-content {
        text-align: center;
        color: #9ca3af;
        font-style: italic;
        padding: 40px 0;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .publication-metadata {
        margin-top: 40px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
        font-size: 0.875rem;
        border-top: 2px solid #e5e7eb;
      }
      
      .metadata-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .metadata-label {
        font-weight: 500;
        color: #6b7280;
      }
      
      .metadata-value {
        color: #374151;
      }
      
      @media print {
        .publication-container {
          max-width: none;
          margin: 0;
          padding: 20px;
        }
        
        .umoor-section {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .publication-image {
          max-height: 500px;
          object-fit: contain;
        }
        
        .umoor-logo {
          width: 60px;
          height: 60px;
        }
        
        .umoor-title-area {
          padding-right: 80px;
        }
      }
      
      @media screen and (max-width: 600px) {
        .umoor-logo {
          position: static;
          width: 60px;
          height: 60px;
          margin-bottom: 15px;
          float: right;
        }
        
        .umoor-title-area {
          padding-right: 0;
        }
        
        .umoor-header {
          overflow: hidden;
        }
      }
    `;

    if (template === 'minimal') {
      return baseStyles + `
        .umoor-section {
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .umoor-header {
          padding: 15px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .decorative-separator {
          display: none;
        }
      `;
    }

    if (template === 'branded' && options.customBranding) {
      const branding = options.customBranding;
      return baseStyles + `
        .publication-header {
          border-bottom: 3px solid ${branding.primaryColor || '#4E6F1F'};
          padding-bottom: 30px;
        }
        
        .publication-title {
          color: ${branding.primaryColor || '#4E6F1F'};
        }
        
        .umoor-title {
          color: ${branding.secondaryColor || '#ADBF97'};
        }
        
        .language-badge.eng {
          background: ${branding.primaryColor || '#4E6F1F'}20;
        color: ${branding.primaryColor || '#4E6F1F'};
        }
        
        .umoor-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin: 40px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: none;
        }
        
        .publication-container {
          background: #f8f9fa;
          padding: 40px;
        }
        
        ${branding.fontFamily ? `body { font-family: ${branding.fontFamily}, sans-serif; }` : ''}
      `;
    }

    return baseStyles;
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
                ${this.formatTextContent(child.data.content || 'No content added yet...')}
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
    
    return new Promise(async (resolve, reject) => {
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
        iframe.onload = async () => {
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
        };
        
        // Set src to trigger onload
        iframe.src = 'about:blank';
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const publicationExportService = PublicationExportService.getInstance();

// Export utility functions
export const exportAsHTML = (publicationId: string, options?: ExportOptions) => 
  publicationExportService.exportAsHTML(publicationId, options);

export const exportAsPDF = (publicationId: string, options?: ExportOptions) => 
  publicationExportService.exportAsPDF(publicationId, options);

export const generateEmailTemplate = (publicationData: Publication, templateStyle: EmailTemplateOptions) => 
  publicationExportService.generateEmailTemplate(publicationData, templateStyle);

export const optimizeImagesForExport = (publication: Publication) => 
  publicationExportService.optimizeImagesForExport(publication);


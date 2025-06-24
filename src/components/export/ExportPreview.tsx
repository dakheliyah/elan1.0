
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Loader2
} from 'lucide-react';
import { Publication } from '@/pages/PublicationEditor';
import { ExportFormat } from './ExportModal';
import { PublicationHeaderRenderer } from '@/components/publication/PublicationHeaderRenderer';
import { PublicationSectionRenderer } from '@/components/publication/renderers/PublicationSectionRenderer';

interface ExportPreviewProps {
  publication: Publication;
  exportFormat: ExportFormat;
  locationLogo?: string;
  locationName?: string;
}

// Enhanced template generator with new layout structure using renderers
const generatePreviewHTML = (publication: Publication, format: ExportFormat, locationLogo?: string, locationName?: string): string => {
  const isHTML = format.type === 'html';
  const templateStyle = format.template;

  // Enhanced styling based on template with new layout structure
  const getTemplateStyles = () => {
    const baseStyles = `
      body { 
        font-family: 'Helvetica Neue', Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        max-width: 800px; 
        margin: 0 auto; 
        padding: 40px 20px; 
        background: #fff;
      }
      .location-logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .location-logo img {
        max-width: 80px;
        max-height: 80px;
        object-fit: contain;
      }
      .decorative-separator { 
        text-align: center; 
        font-size: 24px; 
        font-weight: 300; 
        color: #666; 
        letter-spacing: 8px; 
        margin: 40px 0; 
      }
      h1 { 
        text-align: center; 
        font-size: 36px; 
        font-weight: bold; 
        color: #1f2937; 
        margin: 40px 0 20px; 
        line-height: 1.2; 
      }
      .publication-breadcrumb { 
        text-align: center; 
        font-size: 18px; 
        color: #6b7280; 
        margin-bottom: 10px; 
      }
      .publication-date { 
        text-align: center; 
        font-size: 14px; 
        color: #9ca3af; 
        margin-bottom: 60px; 
      }
      .umoor-section { 
        position: relative; 
        margin: 60px 0; 
        padding-bottom: 40px; 
        border-bottom: 1px solid #e5e7eb; 
      }
      .umoor-section:last-child { 
        border-bottom: none; 
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
      .umoor-logo-img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        border-radius: 12px; 
        border: 2px solid #e5e7eb; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
      }
      .umoor-logo-emoji { 
        width: 100%; 
        height: 100%; 
        font-size: 40px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: #f9fafb; 
        border-radius: 12px; 
        border: 2px solid #e5e7eb; 
      }
      .umoor-title-area { 
        padding-right: 100px; 
      }
      .umoor-title { 
        font-size: 28px; 
        font-weight: bold; 
        color: #1f2937; 
        margin-bottom: 8px; 
        line-height: 1.3; 
      }
      .umoor-subtitle { 
        font-size: 16px; 
        color: #6b7280; 
        font-weight: 500; 
      }
      .content-block { 
        margin: 24px 0; 
      }
      .text-content { 
        font-size: 15px; 
        line-height: 1.6; 
        color: #374151; 
        margin: 16px 0; 
      }
      .lud-text { 
        direction: rtl; 
        text-align: right; 
        font-family: "Kanz Al-Marjaan", "Noto Sans Arabic", "Amiri", "Traditional Arabic", Arial, sans-serif; 
        line-height: 1.8; 
        font-size: 24px; 
      }
      .language-badge { 
        display: inline-block; 
        background: #f3f4f6; 
        color: #374151; 
        padding: 4px 8px; 
        border-radius: 4px; 
        font-size: 11px; 
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
      img.content-image { 
        max-width: 100%; 
        height: auto; 
        border-radius: 8px; 
        margin: 16px 0; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
      }
      .image-caption { 
        text-align: center; 
        font-size: 14px; 
        color: #6b7280; 
        font-style: italic; 
        margin-top: 8px; 
      }
      ul, ol {
        margin: 12px 0;
        padding-left: 20px;
      }
      li {
        margin-bottom: 4px;
        line-height: 1.6;
      }
      
      /* Email-specific styles */
      @media screen and (max-width: 600px) {
        .umoor-logo { 
          position: static; 
          width: 60px; 
          height: 60px; 
          margin-bottom: 15px; 
        }
        .umoor-title-area { 
          padding-right: 0; 
        }
        .umoor-header {
          text-align: center;
        }
      }
    `;

    switch (templateStyle) {
      case 'minimal':
        return baseStyles + `
          body { font-family: 'Helvetica', sans-serif; }
          .umoor-section { border-bottom: 1px solid #f0f0f0; }
          .umoor-title { color: #2c3e50; }
        `;
      case 'branded':
        return baseStyles + `
          body { 
            font-family: 'Georgia', serif; 
            background: #f8f9fa; 
            padding: 40px; 
          }
          .umoor-section { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            margin: 40px 0; 
            box-shadow: 0 2px 12px rgba(0,0,0,0.08); 
            border-bottom: none; 
          }
          h1 { color: ${format.options?.primaryColor || '#4E6F1F'}; }
        .umoor-title { color: ${format.options?.secondaryColor || '#ADBF97'}; }
        `;
      default: // professional
        return baseStyles;
    }
  };

  const renderUmoorLogo = (block: any) => {
    if (block.umoorLogo && (block.umoorLogo.startsWith('http') || block.umoorLogo.startsWith('data:') || block.umoorLogo.startsWith('/'))) {
      return `<img src="${block.umoorLogo}" alt="${block.umoorName}" class="umoor-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="umoor-logo-emoji" style="display:none;">📋</div>`;
    }
    
    return `<div class="umoor-logo-emoji">${block.umoorLogo || '📋'}</div>`;
  };

  const formatTextContent = (content: string) => {
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
    let currentList = [];
    let listType = null;
    
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
  };

  const renderContent = () => {
    return publication.parentBlocks.map((block, index) => `
      <div class="umoor-section">
        <div class="umoor-header">
          <div class="umoor-logo">
            ${renderUmoorLogo(block)}
          </div>
          <div class="umoor-title-area">
            <h2 class="umoor-title">${block.title || block.umoorName}</h2>
            ${block.title && block.title !== block.umoorName ? `<p class="umoor-subtitle">(${block.umoorName})</p>` : ''}
          </div>
        </div>
        <div class="umoor-content">
          ${block.children.map(child => {
            if (child.type === 'text') {
              const className = `text-content ${child.language === 'lud' ? 'lud-text' : ''}`;
              return `
                <div class="content-block">
                  <div class="language-badge ${child.language || 'eng'}">${(child.language || 'eng').toUpperCase()}</div>
                  <div class="${className}">${formatTextContent(child.data.content || 'Sample text content...')}</div>
                </div>
              `;
            } else if (child.type === 'image') {
              return `
                <div class="content-block">
                  <img src="${child.data.imageUrl || '/placeholder.svg'}" alt="${child.data.alt || 'Image'}" class="content-image" />
                  ${child.data.alt ? `<div class="image-caption">${child.data.alt}</div>` : ''}
                </div>
              `;
            }
            return '';
          }).join('')}
        </div>
      </div>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${publication.title}</title>
      <style>${getTemplateStyles()}</style>
    </head>
    <body>
      ${locationLogo ? `<div class="location-logo"><img src="${locationLogo}" alt="${locationName || 'Location'} Logo" /></div>` : ''}
      <div class="decorative-separator">* * *</div>
      
      <h1>${publication.title}</h1>
      <div class="publication-breadcrumb">${publication.breadcrumb}</div>
      <div class="publication-date">${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
      
      ${publication.parentBlocks.length > 0 ? renderContent() : '<div style="text-align: center; color: #9ca3af; padding: 60px 0;">No content blocks added yet</div>'}
    </body>
    </html>
  `;
};

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  publication,
  exportFormat,
  locationLogo,
  locationName
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [zoomLevel, setZoomLevel] = useState(125);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [exportFormat, publication]);

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const htmlContent = generatePreviewHTML(publication, exportFormat, locationLogo, locationName);
      setPreviewContent(htmlContent);
    } catch (error) {
      console.error('Preview generation failed:', error);
      setPreviewContent('<div style="padding: 20px; color: #ef4444;">Preview generation failed. Please check your publication content.</div>');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoomLevel(125);
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye size={16} />
            Export Preview
            <Badge variant="outline">
              {exportFormat.type.toUpperCase()}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {exportFormat.type === 'html' && (
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                  className="h-7 w-7 p-0"
                >
                  <Monitor size={14} />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                  className="h-7 w-7 p-0"
                >
                  <Smartphone size={14} />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="h-7 w-7 p-0"
              >
                <ZoomOut size={14} />
              </Button>
              <span className="text-xs px-2 min-w-[3rem] text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="h-7 w-7 p-0"
              >
                <ZoomIn size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="h-7 w-7 p-0"
              >
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="h-full bg-gray-50 rounded-b-lg overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Generating preview...</p>
              </div>
            </div>
          ) : (
            <div 
              className="h-full flex justify-center p-4"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              <div 
                className={`bg-white shadow-lg ${
                  exportFormat.type === 'html' && previewMode === 'mobile' 
                    ? 'w-[375px]' 
                    : 'w-full max-w-4xl'
                } min-h-full`}
              >
                {previewContent && (
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-full min-h-[600px] border-0"
                    title="Export Preview"
                    sandbox="allow-same-origin"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

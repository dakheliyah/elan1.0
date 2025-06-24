
import React from 'react';
import { ContentBlock } from '@/pages/PublicationEditor';

interface TextBlockRendererProps {
  block: ContentBlock;
  mode?: 'preview' | 'export';
  isLast?: boolean;
}

export const TextBlockRenderer: React.FC<TextBlockRendererProps> = ({ 
  block, 
  mode = 'preview',
  isLast = false
}) => {
  const isRTL = block.language === 'lud';
  
  const renderContent = (content: string) => {
    if (!content) return <div className="text-gray-500 italic">No content added yet...</div>;
    
    // Check if content is HTML (from rich text editor) or plain text
    const isHtmlContent = content.includes('<') && content.includes('>');
    
    if (isHtmlContent) {
      // Render HTML content safely
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          className="rich-text-content"
        />
      );
    } else {
      // Fallback for plain text content (backward compatibility)
      return (
        <div className="whitespace-pre-wrap">
          {content}
        </div>
      );
    }
  };

  return (
    <div className={isLast ? "" : "mb-0"}>      
      <div 
        className={`prose prose-sm max-w-none ${
          isRTL ? 'text-right [direction:rtl]' : 'text-left [direction:ltr]'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          fontFamily: isRTL 
            ? '"Noto Sans Arabic", "Amiri", "Traditional Arabic", Arial, sans-serif' 
            : 'inherit',
          lineHeight: isRTL ? '1.8' : '1.6',
          unicodeBidi: 'plaintext',
          fontSize: '15px'
        }}
      >
        <div className="leading-relaxed text-gray-800">
          {renderContent(block.data.content)}
        </div>
      </div>
    </div>
  );
};

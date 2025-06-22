
import React from 'react';
import { ContentBlock } from '@/pages/PublicationEditor';

interface TextBlockRendererProps {
  block: ContentBlock;
  mode?: 'preview' | 'export';
}

export const TextBlockRenderer: React.FC<TextBlockRendererProps> = ({ 
  block, 
  mode = 'preview' 
}) => {
  const isRTL = block.language === 'lud';
  
  const formatContent = (content: string) => {
    if (!content) return 'No content added yet...';
    
    // Split by lines and process each line
    const lines = content.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const bulletContent = trimmedLine.substring(1).trim();
        return (
          <li key={index} className="ml-4 mb-1">
            {bulletContent}
          </li>
        );
      }
      
      // Handle numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        return (
          <li key={index} className="ml-4 mb-1" style={{ listStyleType: 'decimal' }}>
            {numberedMatch[2]}
          </li>
        );
      }
      
      // Regular paragraph
      if (trimmedLine) {
        return (
          <p key={index} className="mb-2">
            {trimmedLine}
          </p>
        );
      }
      
      // Empty line
      return <br key={index} />;
    });
    
    // Group consecutive list items
    const groupedContent: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let listType: 'bullet' | 'numbered' | null = null;
    
    formattedLines.forEach((line, index) => {
      if (React.isValidElement(line) && line.type === 'li') {
        // Type guard to ensure we can safely access props
        const lineElement = line as React.ReactElement<{ style?: { listStyleType?: string } }>;
        const isBullet = !lineElement.props.style?.listStyleType;
        const currentListType = isBullet ? 'bullet' : 'numbered';
        
        if (listType !== currentListType && currentList.length > 0) {
          // Finish previous list
          const ListComponent = listType === 'numbered' ? 'ol' : 'ul';
          groupedContent.push(
            <ListComponent key={`list-${groupedContent.length}`} className="mb-3">
              {currentList}
            </ListComponent>
          );
          currentList = [];
        }
        
        listType = currentListType;
        currentList.push(line);
      } else {
        // Finish any current list
        if (currentList.length > 0) {
          const ListComponent = listType === 'numbered' ? 'ol' : 'ul';
          groupedContent.push(
            <ListComponent key={`list-${groupedContent.length}`} className="mb-3">
              {currentList}
            </ListComponent>
          );
          currentList = [];
          listType = null;
        }
        
        groupedContent.push(line);
      }
    });
    
    // Finish any remaining list
    if (currentList.length > 0) {
      const ListComponent = listType === 'numbered' ? 'ol' : 'ul';
      groupedContent.push(
        <ListComponent key={`list-${groupedContent.length}`} className="mb-3">
          {currentList}
        </ListComponent>
      );
    }
    
    return groupedContent;
  };

  return (
    <div className="mb-6">      
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
          {formatContent(block.data.content)}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { ParentBlockData } from '@/pages/PublicationEditor';
import { UmoorBlockRenderer } from './UmoorBlockRenderer';
import { ContentBlockRenderer } from './ContentBlockRenderer';

interface PublicationSectionRendererProps {
  parentBlock: ParentBlockData;
  mode?: 'preview' | 'export';
  isLast?: boolean;
  showUmoorLogo?: boolean;
}

export const PublicationSectionRenderer: React.FC<PublicationSectionRendererProps> = ({ 
  parentBlock, 
  mode = 'preview',
  isLast = false,
  showUmoorLogo = true
}) => {
  return (
    <div className="publication-section">
      {/* Umoor Section Header */}
      <UmoorBlockRenderer umoorBlock={parentBlock} mode={mode} showLogo={showUmoorLogo} />

      {/* Content Blocks */}
      <div className="space-y-6 pl-0">
        {parentBlock.children.length > 0 ? (
          parentBlock.children.map((child, index) => (
            <ContentBlockRenderer
              key={child.id}
              block={child}
              mode={mode}
              isLast={index === parentBlock.children.length - 1}
            />
          ))
        ) : (
          <div className="text-gray-500 italic py-6 text-center bg-gray-50 rounded-lg">
            No content blocks added yet
          </div>
        )}
      </div>
      
      {/* Section separator - only if not the last section */}
      {!isLast && (
        <div className="mt-8 pt-6 border-b border-gray-200"></div>
      )}
    </div>
  );
};

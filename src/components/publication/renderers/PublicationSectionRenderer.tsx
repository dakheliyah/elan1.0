
import React from 'react';
import { ParentBlockData } from '@/pages/PublicationEditor';
import { UmoorBlockRenderer } from './UmoorBlockRenderer';
import { ContentBlockRenderer } from './ContentBlockRenderer';

interface PublicationSectionRendererProps {
  parentBlock: ParentBlockData;
  mode?: 'preview' | 'export';
  isLast?: boolean;
}

export const PublicationSectionRenderer: React.FC<PublicationSectionRendererProps> = ({ 
  parentBlock, 
  mode = 'preview',
  isLast = false
}) => {
  return (
    <div className="mb-12">
      {/* Umoor Section Header */}
      <UmoorBlockRenderer umoorBlock={parentBlock} mode={mode} />

      {/* Content Blocks */}
      <div className="space-y-4 pl-0">
        {parentBlock.children.length > 0 ? (
          parentBlock.children.map((child) => (
            <ContentBlockRenderer
              key={child.id}
              block={child}
              mode={mode}
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
        <div className="mt-12 pt-8 border-b border-gray-200"></div>
      )}
    </div>
  );
};

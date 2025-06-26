
import React from 'react';
import { ContentBlock } from '@/pages/PublicationEditor';

interface ImageBlockRendererProps {
  block: ContentBlock;
  mode?: 'preview' | 'export';
  isLast?: boolean;
}

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({ 
  block, 
  mode = 'preview',
  isLast = false
}) => {
  const imageClasses = mode === 'export' 
    ? 'w-full rounded-lg shadow-sm border border-gray-200 max-h-auto object-cover'
    : 'w-full rounded-lg shadow-sm border border-gray-200 max-h-auto object-cover';

  return (
    <div className={isLast ? "" : "mb-0"}>
      {block.data.imageUrl ? (
        <figure className="mx-0">
          <img
            src={block.data.imageUrl}
            alt={block.data.alt || 'Publication image'}
            className={imageClasses}
            loading="lazy"
          />
          {block.data.alt && (
            <figcaption className="text-sm text-gray-600 mt-3 text-center italic font-medium">
              {block.data.alt}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="w-full h-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image selected</span>
        </div>
      )}
    </div>
  );
};

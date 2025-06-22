
import React from 'react';
import { ContentBlock } from '@/pages/PublicationEditor';
import { TextBlockRenderer } from './TextBlockRenderer';
import { ImageBlockRenderer } from './ImageBlockRenderer';

interface ContentBlockRendererProps {
  block: ContentBlock;
  mode?: 'preview' | 'export';
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ 
  block, 
  mode = 'preview' 
}) => {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer block={block} mode={mode} />;
    case 'image':
      return <ImageBlockRenderer block={block} mode={mode} />;
    default:
      return null;
  }
};

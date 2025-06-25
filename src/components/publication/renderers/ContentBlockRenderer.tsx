
import React from 'react';
import { ContentBlock } from '../../../pages/PublicationEditor';
import { TextBlockRenderer } from './TextBlockRenderer';
import { ImageBlockRenderer } from './ImageBlockRenderer';
import MenuBlockRenderer from './MenuBlockRenderer';

interface ContentBlockRendererProps {
  block: ContentBlock;
  mode?: 'preview' | 'export';
  isLast?: boolean;
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ 
  block, 
  mode = 'preview',
  isLast = false
}) => {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer block={block} mode={mode} isLast={isLast} />;
    case 'image':
      return <ImageBlockRenderer block={block} mode={mode} isLast={isLast} />;
    case 'menu':
      return <MenuBlockRenderer data={block.data} isPreview={mode === 'preview'} />;
    default:
      return null;
  }
};

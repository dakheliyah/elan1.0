
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import RichTextBlock from './RichTextBlock';
import ImageBlock from './ImageBlock';
import MenuBlock from './MenuBlock';
import { ContentBlock } from '../../pages/PublicationEditor';

interface ChildContentBlockProps {
  block: ContentBlock;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  eventId?: string; // Add eventId prop
}

const ChildContentBlock: React.FC<ChildContentBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  eventId,
}) => {
  return (
    <div className="relative group border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Block Type Badge and Remove Button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {block.type === 'text' ? `Text (${block.language === 'lud' ? 'Lisan ud-Dawat' : 'English'})` : 
             block.type === 'image' ? 'Image' : 'Menu'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Content */}
      {block.type === 'text' ? (
        <RichTextBlock
          data={block.data}
          onChange={onUpdate}
          language={block.language}
        />
      ) : block.type === 'image' ? (
        <ImageBlock
          data={block.data}
          onChange={onUpdate}
          eventId={eventId} // Pass eventId to ImageBlock
        />
      ) : (
        <MenuBlock
          data={block.data}
          onChange={onUpdate}
        />
      )}
    </div>
  );
};

export default ChildContentBlock;

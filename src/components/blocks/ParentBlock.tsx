
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Type, 
  Image as ImageIcon,
  Globe,
  Languages
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChildContentBlock from './ChildContentBlock';
import { ParentBlockData, ContentBlock } from '../../pages/PublicationEditor';

interface ParentBlockProps {
  parentBlock: ParentBlockData;
  dragHandleProps?: any;
  onUpdateParent: (updates: Partial<ParentBlockData>) => void;
  onRemoveParent: () => void;
  onAddChild: (type: 'text' | 'image', language?: 'eng' | 'lud') => void;
  onUpdateChild: (childId: string, data: any) => void;
  onRemoveChild: (childId: string) => void;
  eventId?: string;
}

const ParentBlock: React.FC<ParentBlockProps> = ({
  parentBlock,
  dragHandleProps,
  onUpdateParent,
  onRemoveParent,
  onAddChild,
  onUpdateChild,
  onRemoveChild,
  eventId,
}) => {
  // Debug logging
  console.log('ParentBlock rendering with data:', {
    title: parentBlock.title,
    subheading: parentBlock.subheading,
    description: parentBlock.description,
    umoorName: parentBlock.umoorName,
    umoorLogo: parentBlock.umoorLogo
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mt-2">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="text-lg">{parentBlock.umoorLogo}</div>
          </div>
          
          <div className="flex-1 space-y-3">
            {/* Main Heading */}
            <Input
              value={parentBlock.title || ''}
              onChange={(e) => {
                console.log('Title changed to:', e.target.value);
                onUpdateParent({ title: e.target.value });
              }}
              placeholder="Enter section heading..."
              className="border-none shadow-none p-0 text-2xl font-bold focus-visible:ring-0 placeholder-gray-400"
            />
            
            {/* Subheading */}
            <Input
              value={parentBlock.subheading || ''}
              onChange={(e) => {
                console.log('Subheading changed to:', e.target.value);
                onUpdateParent({ subheading: e.target.value });
              }}
              placeholder="Enter subheading (optional)..."
              className="border-none shadow-none p-0 text-lg font-semibold text-gray-700 focus-visible:ring-0 placeholder-gray-400"
            />
            
            {/* Description */}
            <Textarea
              value={parentBlock.description || ''}
              onChange={(e) => {
                console.log('Description changed to:', e.target.value);
                onUpdateParent({ description: e.target.value });
              }}
              placeholder="Enter description (optional)..."
              className="border-none shadow-none p-0 text-base text-gray-600 focus-visible:ring-0 placeholder-gray-400 resize-none min-h-[60px]"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveParent}
            className="text-red-500 hover:text-red-700 mt-2"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Child Blocks */}
        {parentBlock.children.map((child) => (
          <ChildContentBlock
            key={child.id}
            block={child}
            onUpdate={(data) => onUpdateChild(child.id, data)}
            onRemove={() => onRemoveChild(child.id)}
            eventId={eventId}
          />
        ))}
        
        {/* Add Content Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Type size={14} />
                Add Text
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAddChild('text', 'eng')}>
                <Globe size={14} className="mr-2" />
                English Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild('text', 'lud')}>
                <Languages size={14} className="mr-2" />
                Lisan ud-Dawat Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddChild('image')}
            className="flex items-center gap-2"
          >
            <ImageIcon size={14} />
            Add Image
          </Button>
        </div>

        {/* Global Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Mark as Global</span>
            <span className="text-xs text-gray-500">
              (Available across all publications)
            </span>
          </div>
          <Switch
            checked={parentBlock.isGlobal || false}
            onCheckedChange={(checked) => {
              console.log('Global toggle changed to:', checked);
              onUpdateParent({ isGlobal: checked });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentBlock;

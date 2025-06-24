
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ContentBlockProps {
  data: {
    content: string;
    language: 'eng' | 'lud';
  };
  onChange: (data: Partial<ContentBlockProps['data']>) => void;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="content" className="text-sm font-medium text-gray-700">
          Content
        </Label>
        <Badge 
          variant={data.language === 'eng' ? 'default' : 'secondary'}
          className="uppercase"
        >
          {data.language} Block
        </Badge>
      </div>
      
      <Textarea
        id="content"
        value={data.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder={`Enter ${data.language.toUpperCase()} content...`}
        className={`min-h-[120px] resize-none ${data.language === 'lud' ? 'font-kanz' : ''}`}
        rows={6}
        dir={data.language === 'lud' ? 'rtl' : 'ltr'}
      />
      
      <div className="text-sm text-gray-500">
        {data.content.length} characters
      </div>
    </div>
  );
};

export default ContentBlock;

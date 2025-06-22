
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TextBlockProps {
  data: {
    content: string;
    language: 'eng' | 'lud';
  };
  onChange: (data: Partial<TextBlockProps['data']>) => void;
  language?: 'eng' | 'lud';
}

const TextBlock: React.FC<TextBlockProps> = ({ data, onChange, language }) => {
  const displayLanguage = language || data.language || 'eng';
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {displayLanguage === 'lud' ? 'Lisan ud-Dawat Text' : 'English Text'}
      </Label>
      <Textarea
        value={data.content || ''}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder={`Enter your ${displayLanguage === 'lud' ? 'Lisan ud-Dawat' : 'English'} text here...`}
        className="min-h-[100px] resize-vertical"
        dir={displayLanguage === 'lud' ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default TextBlock;

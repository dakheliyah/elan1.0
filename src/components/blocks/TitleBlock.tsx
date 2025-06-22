
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TitleBlockProps {
  data: {
    title: string;
    umoor: string;
  };
  onChange: (data: Partial<TitleBlockProps['data']>) => void;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  const umoorOptions = [
    'Religious Affairs',
    'Community Services',
    'Education',
    'Youth Activities',
    'Cultural Programs',
    'Administrative'
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Title
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Enter block title..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="umoor" className="text-sm font-medium text-gray-700">
          Select Umoor
        </Label>
        <Select value={data.umoor} onValueChange={(value) => onChange({ umoor: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select umoor..." />
          </SelectTrigger>
          <SelectContent>
            {umoorOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TitleBlock;


import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  Send, 
  FileText, 
  Download, 
  SendHorizontal,
  Loader2
} from 'lucide-react';

interface PublishDropdownProps {
  onPublish: () => void;
  onExportHTML: () => void;
  onExportPDF: () => void;
  onPublishAndExport: () => void;
  isPublishing: boolean;
  disabled?: boolean;
}

export const PublishDropdown: React.FC<PublishDropdownProps> = ({
  onPublish,
  onExportHTML,
  onExportPDF,
  onPublishAndExport,
  isPublishing,
  disabled = false
}) => {
  return (
    <div className="flex">
      {/* Main Publish Button */}
      <Button
        onClick={onPublish}
        className="bg-slate-800 hover:bg-slate-700 text-white rounded-r-none border-r-0"
        disabled={disabled || isPublishing}
      >
        {isPublishing ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <Send size={16} className="mr-2" />
        )}
        {isPublishing ? 'Publishing...' : 'Publish'}
      </Button>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-l-none px-2 border-l border-slate-600"
            disabled={disabled || isPublishing}
          >
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border">
          <DropdownMenuItem 
            onClick={onPublish}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <Send size={16} />
            Publish to Platform
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={onExportHTML}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <FileText size={16} />
            Export as HTML
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onExportPDF}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <Download size={16} />
            Export as PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={onPublishAndExport}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <SendHorizontal size={16} />
            Publish & Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

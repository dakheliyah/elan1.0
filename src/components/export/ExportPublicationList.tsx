
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Globe } from 'lucide-react';

interface Publication {
  id: string;
  title: string;
  status: string;
  is_featured: boolean;
  created_at: string;
}

interface ExportPublicationListProps {
  publications: Publication[];
  onPublicationSelect: (publicationId: string) => void;
}

export const ExportPublicationList: React.FC<ExportPublicationListProps> = ({
  publications,
  onPublicationSelect
}) => {
  if (!publications || publications.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No publications found for this location</p>
    );
  }

  return (
    <div className="space-y-2">
      {publications.map((publication) => (
        <div key={publication.id} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{publication.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={publication.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {publication.status}
                </Badge>
                {publication.is_featured && (
                  <Badge variant="outline" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            size="sm"
            className="w-full"
            onClick={() => onPublicationSelect(publication.id)}
            disabled={publication.status !== 'published'}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Publication
          </Button>
        </div>
      ))}
    </div>
  );
};

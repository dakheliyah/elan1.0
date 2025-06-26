
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import type { PublicationWithLocations } from '@/services/publicationsService';
import type { Publication } from '@/pages/PublicationEditor';
import { convertToPublication } from '@/utils/publicationConverter';

interface PublicationRowProps {
  publication: any; // Database publication object
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (publication: Publication) => void;
}

export const PublicationRow: React.FC<PublicationRowProps> = ({
  publication,
  onEdit,
  onDelete,
  onPreview
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mark_as_ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePreview = () => {
    // Use the converter to properly handle the database format
    const previewPublication = convertToPublication({
      ...publication,
      locations: {
        name: 'Event Location',
        events: {
          name: publication.event_id
        }
      }
    });
    
    onPreview(previewPublication);
  };

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handlePreview}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {publication.title}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {new Date(publication.updated_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="outline" className={getStatusColor(publication.status)}>
          {publication.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(publication.id)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(publication.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

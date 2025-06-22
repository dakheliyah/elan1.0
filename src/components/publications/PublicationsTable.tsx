
import React from 'react';
import { Publication } from '@/pages/PublicationEditor';
import { PublicationRow } from './PublicationRow';

interface PublicationsTableProps {
  publications: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (publication: Publication) => void;
}

export const PublicationsTable: React.FC<PublicationsTableProps> = ({
  publications,
  onEdit,
  onDelete,
  onPreview
}) => {
  if (publications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No publications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {publications.map((publication) => (
            <PublicationRow
              key={publication.id}
              publication={publication}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

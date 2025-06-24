
import React, { useEffect, useState } from 'react';
import { Publication } from '@/pages/PublicationEditor';
import PublicationPreview from './PublicationPreview';

interface PublicationPreviewWindowProps {
  publication: Publication;
  onClose: () => void;
  locationLogo?: string;
  locationName?: string;
}

export const PublicationPreviewWindow: React.FC<PublicationPreviewWindowProps> = ({
  publication,
  onClose,
  locationLogo,
  locationName
}) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] max-w-6xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Publication Preview</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <PublicationPreview 
            publication={publication} 
            locationLogo={locationLogo}
            locationName={locationName}
          />
        </div>
      </div>
    </div>
  );
};

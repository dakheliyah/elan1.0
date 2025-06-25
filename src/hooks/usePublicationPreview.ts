
import { useState } from 'react';
import { Publication } from '@/pages/PublicationEditor';

export const usePublicationPreview = () => {
  const [previewPublication, setPreviewPublication] = useState<Publication | null>(null);
  const [hostPublication, setHostPublication] = useState<Publication | null>(null);

  const openPreview = (publication: Publication, hostPublication?: Publication | null) => {
    setPreviewPublication(publication);
    setHostPublication(hostPublication || null);
  };

  const closePreview = () => {
    setPreviewPublication(null);
    setHostPublication(null);
  };

  return {
    previewPublication,
    hostPublication,
    openPreview,
    closePreview,
    isPreviewOpen: !!previewPublication
  };
};

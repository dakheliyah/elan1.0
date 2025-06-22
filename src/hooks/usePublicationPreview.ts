
import { useState } from 'react';
import { Publication } from '@/pages/PublicationEditor';

export const usePublicationPreview = () => {
  const [previewPublication, setPreviewPublication] = useState<Publication | null>(null);

  const openPreview = (publication: Publication) => {
    setPreviewPublication(publication);
  };

  const closePreview = () => {
    setPreviewPublication(null);
  };

  return {
    previewPublication,
    openPreview,
    closePreview,
    isPreviewOpen: !!previewPublication
  };
};

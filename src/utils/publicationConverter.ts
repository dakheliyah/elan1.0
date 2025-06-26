
import { Publication } from '@/pages/PublicationEditor';

export const convertToPublication = (dbPublication: any): Publication => {
  // Convert database publication to Publication type
  const publication: Publication = {
    title: dbPublication.title || 'Untitled Publication',
    breadcrumb: `${dbPublication.locations?.events?.name || 'Event'} • ${dbPublication.locations?.name || 'Location'}`,
    parentBlocks: []
  };

  // If the publication has content data, parse it
  if (dbPublication.content) {
    // Handle both array format (direct parentBlocks) and object format (with parentBlocks property)
    if (Array.isArray(dbPublication.content)) {
      publication.parentBlocks = dbPublication.content;
    } else if (typeof dbPublication.content === 'object' && dbPublication.content.parentBlocks) {
      publication.parentBlocks = dbPublication.content.parentBlocks;
    } else if (typeof dbPublication.content === 'object') {
      // Fallback: treat the object as parentBlocks array
      publication.parentBlocks = dbPublication.content || [];
    }
  }

  return publication;
};

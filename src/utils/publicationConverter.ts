
import { Publication } from '@/pages/PublicationEditor';

export const convertToPublication = (dbPublication: any): Publication => {
  // Convert database publication to Publication type
  const publication: Publication = {
    title: dbPublication.title || 'Untitled Publication',
    breadcrumb: `${dbPublication.locations?.events?.name || 'Event'} • ${dbPublication.locations?.name || 'Location'}`,
    parentBlocks: []
  };

  // If the publication has content data, parse it
  if (dbPublication.content && typeof dbPublication.content === 'object') {
    publication.parentBlocks = dbPublication.content || [];
  }

  return publication;
};

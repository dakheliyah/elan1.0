import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Publication } from '@/pages/PublicationEditor';
import { convertToPublication } from '@/utils/publicationConverter';

const fetchHostPublication = async (eventId: string, hostLocationId: string): Promise<Publication | null> => {
  if (!eventId || !hostLocationId) {
    return null;
  }

  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('event_id', eventId)
    .eq('location_id', hostLocationId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching host publication:', error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return null;
  }

  return convertToPublication(data[0]);
};

export const useHostPublication = (eventId: string, hostLocationId: string | null) => {
  return useQuery<Publication | null, Error>({
    queryKey: ['hostPublication', eventId, hostLocationId],
    queryFn: () => fetchHostPublication(eventId, hostLocationId!),
    enabled: !!eventId && !!hostLocationId,
  });
};

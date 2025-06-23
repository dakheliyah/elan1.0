import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from './serviceUtils';

type Publication = Database['public']['Tables']['publications']['Row'];
type PublicationInsert = Database['public']['Tables']['publications']['Insert'];
type PublicationUpdate = Database['public']['Tables']['publications']['Update'];
type PublicationLocation = Database['public']['Tables']['publication_locations']['Row'];
type PublicationLocationInsert = Database['public']['Tables']['publication_locations']['Insert'];
type PublicationLocationUpdate = Database['public']['Tables']['publication_locations']['Update'];

// Type for publication locations with nested location data (from queries)
interface PublicationLocationWithLocation {
  id: string;
  location_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  locations: {
    id: string;
    name: string;
    is_host: boolean;
  };
}

// Extended types for the new system
interface PublicationWithLocations extends Publication {
  publication_locations?: PublicationLocationWithLocation[];
}

interface CreateEventPublicationData {
  title: string;
  content?: any;
  event_id: string;
  publication_date: string;
  location_ids: string[];
  status?: 'draft' | 'published' | 'archived';
}

interface PublicationWithLocation extends Publication {
  location?: {
    id: string;
    name: string;
    is_host: boolean;
  };
}

export const publicationsService = {
  async getAll(): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch publications');
    }
  },

  // New method: Get publications by event ID
  async getByEventId(eventId: string): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('event_id', eventId)
        .order('publication_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch publications by event');
    }
  },

  // New method: Get publications by event ID and date (returns array of location-specific publications)
  async getByEventAndDate(eventId: string, date: string): Promise<PublicationWithLocation[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          *,
          locations (
            id,
            name,
            is_host
          )
        `)
        .eq('event_id', eventId)
        .eq('publication_date', date)
        .order('locations(name)');

      if (error) throw error;
      
      // Transform the data to match expected structure
      // Supabase returns 'locations' but our interface expects 'location'
      const transformedData = data?.map(item => ({
        ...item,
        location: item.locations
      })) || [];
      
      return transformedData;
    } catch (error) {
      handleSupabaseError(error, 'fetch publications by event and date');
    }
  },

  // New method: Create separate publications for each location
  async createForEvent(publicationData: CreateEventPublicationData): Promise<PublicationWithLocation[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Use the database function to create publications for all locations
      const { data: createdPublications, error: funcError } = await supabase
        .rpc('create_publications_for_all_locations', {
          p_title: publicationData.title,
          p_event_id: publicationData.event_id,
          p_publication_date: publicationData.publication_date,
          p_status: publicationData.status || 'draft',
          p_created_by: user.user?.id,
        });

      if (funcError) throw funcError;

      // Fetch the created publications with location details
      const publicationIds = createdPublications?.map((p: any) => p.publication_id) || [];
      
      const { data: publications, error: fetchError } = await supabase
        .from('publications')
        .select(`
          *,
          locations (
            id,
            name,
            is_host
          )
        `)
        .in('id', publicationIds)
        .order('locations(name)');

      if (fetchError) throw fetchError;

      return publications || [];
    } catch (error) {
      handleSupabaseError(error, 'create event publications');
    }
  },

  // New method: Get publication locations
  async getPublicationLocations(publicationId: string): Promise<PublicationLocationWithLocation[]> {
    try {
      const { data, error } = await supabase
        .from('publication_locations')
        .select(`
          *,
          locations (
            id,
            name,
            is_host,
            timezone
          )
        `)
        .eq('publication_id', publicationId)
        .order('locations(name)');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch publication locations');
    }
  },

  // New method: Update location-specific content
  async updateLocationContent(
    publicationId: string, 
    locationId: string, 
    content: string, 
    status?: 'draft' | 'published' | 'archived'
  ): Promise<PublicationLocation> {
    try {
      const updateData: PublicationLocationUpdate = {
        content,
        updated_at: new Date().toISOString(),
      };
      
      if (status) {
        updateData.status = status;
      }

      const { data, error } = await supabase
        .from('publication_locations')
        .update(updateData)
        .eq('publication_id', publicationId)
        .eq('location_id', locationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update location content');
    }
  },

  // New method: Update location status
  async updateLocationStatus(
    publicationId: string, 
    locationId: string, 
    status: 'draft' | 'published' | 'archived'
  ): Promise<PublicationLocation> {
    try {
      const { data, error } = await supabase
        .from('publication_locations')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('publication_id', publicationId)
        .eq('location_id', locationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update location status');
    }
  },

  // Get publications by location ID (updated for new schema)
  async getByLocationId(locationId: string): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          *,
          locations(*),
          events(*)
        `)
        .eq('location_id', locationId)
        .order('publication_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch publications by location');
    }
  },

  async getById(id: string): Promise<Publication | null> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          *,
          locations (
            id,
            name,
            events (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch publication');
    }
  },

  // Legacy method: Create publication (for backward compatibility)
  async create(publication: PublicationInsert): Promise<Publication> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const publicationData = {
        ...publication,
        created_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('publications')
        .insert(publicationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create publication');
    }
  },

  async update(id: string, updates: PublicationUpdate): Promise<Publication> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update publication');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete publication');
    }
  },

  async updateStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<Publication> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update publication status');
    }
  },





  // New method: Get published locations for a publication
  async getPublishedLocations(publicationId: string): Promise<PublicationLocation[]> {
    try {
      const { data, error } = await supabase
        .from('publication_locations')
        .select(`
          *,
          locations (
            id,
            name,
            is_host,
            timezone
          )
        `)
        .eq('publication_id', publicationId)
        .eq('status', 'published')
        .order('locations(name)');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch published locations');
    }
  },

  // New method: Publish all locations for a publication
  async publishAllLocations(publicationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('publication_locations')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('publication_id', publicationId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'publish all locations');
    }
  },

  // New method: Archive all locations for a publication
  async archiveAllLocations(publicationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('publication_locations')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('publication_id', publicationId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'archive all locations');
    }
  },
};

export type { 
  Publication, 
  PublicationInsert, 
  PublicationUpdate,
  PublicationLocation,
  PublicationLocationInsert,
  PublicationLocationUpdate,
  PublicationLocationWithLocation,
  PublicationWithLocations,
  CreateEventPublicationData
};

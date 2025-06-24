
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';
import { handleSupabaseError } from './serviceUtils';

type Location = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type LocationUpdate = Database['public']['Tables']['locations']['Update'];

export const locationsService = {
  async getAll(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Location[];
    } catch (error) {
      handleSupabaseError(error, 'fetch locations');
    }
  },

  async getByEventId(eventId: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Location[];
    } catch (error) {
      handleSupabaseError(error, 'fetch locations by event');
    }
  },

  async getById(id: string): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Location | null;
    } catch (error) {
      handleSupabaseError(error, 'fetch location');
    }
  },

  async create(location: LocationInsert): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();

      if (error) throw error;
      return data as Location;
    } catch (error) {
      handleSupabaseError(error, 'create location');
    }
  },

  async update(id: string, updates: LocationUpdate): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Location;
    } catch (error) {
      handleSupabaseError(error, 'update location');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete location');
    }
  },

  async getWithPublicationCount(eventId: string): Promise<(Location & { publication_count: number })[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          description,
          timezone,
          is_host,
          event_id,
          created_at,
          updated_at,
          publications(count)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(location => ({
        ...location,
        logo_url: '', // Default empty string since column doesn't exist yet
        publication_count: location.publications?.[0]?.count || 0,
        publications: undefined,
      })) as (Location & { publication_count: number })[];
    } catch (error) {
      handleSupabaseError(error, 'fetch locations with publication count');
    }
  },
  // Upload logo
  async uploadLogo(file: File, locationId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${locationId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('location-logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('location-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      handleSupabaseError(error, 'upload location logo');
    }
  },

  // Delete logo
  async deleteLogo(logoUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const fileName = logoUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('location-logos')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete location logo');
    }
  },
};

export type { Location, LocationInsert, LocationUpdate };

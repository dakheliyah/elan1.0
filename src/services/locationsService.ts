
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';
import { handleSupabaseError } from './serviceUtils';
import { userLocationAccessService } from './userLocationAccessService';

type Location = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type LocationUpdate = Database['public']['Tables']['locations']['Update'];
type LocationAccessLevel = Database['public']['Enums']['location_access_level'];

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
          *,
          publications(count)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type the result to include publications array from the count query
      type LocationWithPublications = Location & {
        publications: { count: number }[];
      };
      
      return (data as LocationWithPublications[] || []).map(location => ({
        ...location,
        publication_count: location.publications?.[0]?.count || 0,
        publications: undefined,
      })) as (Location & { publication_count: number })[];
    } catch (error) {
      handleSupabaseError(error, 'fetch locations with publication count');
    }
  },

  // Get locations with publication count filtered by user access
  async getWithPublicationCountByAccess(
    eventId: string, 
    userId: string, 
    minAccessLevel: LocationAccessLevel = 'read'
  ): Promise<(Location & { publication_count: number; access_level: LocationAccessLevel })[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          publications(count),
          user_location_access!inner(access_level)
        `)
        .eq('event_id', eventId)
        .eq('user_location_access.user_id', userId)
        .or('user_location_access.expires_at.is.null,user_location_access.expires_at.gte.now()')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Define access level hierarchy
      const accessLevels = {
        read: 1,
        write: 2,
        admin: 3
      };
      
      const minLevel = accessLevels[minAccessLevel];
      
      // Type the result to include publications and user_location_access arrays from the query
      type LocationWithAccessAndPublications = Location & {
        publications: { count: number }[];
        user_location_access: { access_level: LocationAccessLevel }[];
      };
      
      return (data as LocationWithAccessAndPublications[] || [])
        .filter(location => {
          const userAccess = location.user_location_access?.[0];
          return userAccess && accessLevels[userAccess.access_level] >= minLevel;
        })
        .map(location => ({
          ...location,
          publication_count: location.publications?.[0]?.count || 0,
          access_level: location.user_location_access?.[0]?.access_level || 'read',
          publications: undefined,
          user_location_access: undefined,
        })) as (Location & { publication_count: number; access_level: LocationAccessLevel })[];
    } catch (error) {
      handleSupabaseError(error, 'fetch accessible locations with publication count');
    }
  },

  // Check if user can access a specific location
  async canUserAccessLocation(
    locationId: string, 
    userId: string, 
    requiredLevel: LocationAccessLevel = 'read'
  ): Promise<boolean> {
    try {
      return await userLocationAccessService.hasAccess(userId, locationId, requiredLevel);
    } catch (error) {
      console.error('Error checking location access:', error);
      return false;
    }
  },

  // Get location by ID with access check
  async getByIdWithAccess(
    id: string, 
    userId: string, 
    requiredLevel: LocationAccessLevel = 'read'
  ): Promise<Location | null> {
    try {
      // First check if user has access
      const hasAccess = await this.canUserAccessLocation(id, userId, requiredLevel);
      if (!hasAccess) {
        return null;
      }

      // If user has access, fetch the location
      return await this.getById(id);
    } catch (error) {
      handleSupabaseError(error, 'fetch location with access check');
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

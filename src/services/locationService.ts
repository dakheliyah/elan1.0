import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';
import { locationsService } from './locationsService';

type LocationInsert = Database['public']['Tables']['locations']['Insert'];

// Enhanced location service with host location management
export const locationServiceEnhanced = {

  // Helper function to unset existing host locations
  async unsetExistingHost(eventId: string, excludeLocationId?: string): Promise<void> {
    try {
      const query = supabase
        .from('locations')
        .update({ is_host: false })
        .eq('event_id', eventId)
        .eq('is_host', true);

      // Only exclude a specific location if a valid ID is provided
      if (excludeLocationId) {
        query.neq('id', excludeLocationId);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (error) {
      console.error('Error unsetting existing host:', error);
      throw error;
    }
  },

  // Create location with host validation
  async createWithHostValidation(locationData: LocationInsert): Promise<any> {
    try {
      // If this location should be host, first unset any existing host in the same event
      if (locationData.is_host && locationData.event_id) {
        await locationServiceEnhanced.unsetExistingHost(locationData.event_id);
      }

      // Create the new location
      return await locationsService.create(locationData);
    } catch (error) {
      console.error('Error creating location with host validation:', error);
      throw error;
    }
  },

  // Update location with host validation
  async updateWithHostValidation(locationId: string, updates: any): Promise<any> {
    try {
      // If updating to be host, first get the location to know its event_id
      if (updates.is_host) {
        const location = await locationsService.getById(locationId);
        if (location?.event_id) {
          // Unset any existing host in the same event (except this location)
          await this.unsetExistingHost(location.event_id, locationId);
        }
      }

      // Update the location
      return await locationsService.update(locationId, updates);
    } catch (error) {
      console.error('Error updating location with host validation:', error);
      throw error;
    }
  },

  // Get host location for an event
  async getHostLocation(eventId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_host', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting host location:', error);
      throw error;
    }
  },
};

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserLocationAccess = Database['public']['Tables']['user_location_access']['Row'];
type UserLocationAccessInsert = Database['public']['Tables']['user_location_access']['Insert'];
type UserLocationAccessUpdate = Database['public']['Tables']['user_location_access']['Update'];
type LocationAccessLevel = Database['public']['Enums']['location_access_level'];

export const userLocationAccessService = {
  // Get all access records for a user
  async getUserAccess(userId: string): Promise<UserLocationAccess[]> {
    const { data, error } = await supabase
      .from('user_location_access')
      .select(`
        *,
        location:locations(
          id,
          name,
          description,
          event_id,
          is_host
        ),
        granted_by_profile:profiles!granted_by(
          id,
          full_name,
          email
        )
      `)
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('Error fetching user access:', error);
      throw error;
    }

    return data || [];
  },

  // Get all users with access to a specific location
  async getLocationAccess(locationId: string): Promise<UserLocationAccess[]> {
    const { data, error } = await supabase
      .from('user_location_access')
      .select(`
        *,
        user:profiles!user_id(
          id,
          full_name,
          email,
          role
        ),
        granted_by_profile:profiles!granted_by(
          id,
          full_name,
          email
        )
      `)
      .eq('location_id', locationId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('access_level', { ascending: false })
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('Error fetching location access:', error);
      throw error;
    }

    return data || [];
  },

  // Check if user has specific access level to a location
  async hasAccess(
    userId: string,
    locationId: string,
    requiredLevel: LocationAccessLevel = 'read'
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_location_access')
      .select('access_level')
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .single();

    if (error || !data) {
      return false;
    }

    // Define access level hierarchy
    const accessLevels = {
      read: 1,
      write: 2,
      admin: 3
    };

    return accessLevels[data.access_level] >= accessLevels[requiredLevel];
  },

  // Get user's access level for a location
  async getUserAccessLevel(
    userId: string,
    locationId: string
  ): Promise<LocationAccessLevel | null> {
    const { data, error } = await supabase
      .from('user_location_access')
      .select('access_level')
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .single();

    if (error || !data) {
      return null;
    }

    return data.access_level;
  },

  // Grant access to a user for a location
  async grantAccess(
    userId: string,
    locationId: string,
    accessLevel: LocationAccessLevel,
    grantedBy: string,
    expiresAt?: string
  ): Promise<UserLocationAccess> {
    const accessData: UserLocationAccessInsert = {
      user_id: userId,
      location_id: locationId,
      access_level: accessLevel,
      granted_by: grantedBy,
      expires_at: expiresAt || null
    };

    const { data, error } = await supabase
      .from('user_location_access')
      .upsert(accessData, {
        onConflict: 'user_id,location_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error granting access:', error);
      throw error;
    }

    return data;
  },

  // Update access level for a user
  async updateAccess(
    userId: string,
    locationId: string,
    accessLevel: LocationAccessLevel,
    updatedBy: string,
    expiresAt?: string
  ): Promise<UserLocationAccess> {
    const updateData: UserLocationAccessUpdate = {
      access_level: accessLevel,
      granted_by: updatedBy,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt || null
    };

    const { data, error } = await supabase
      .from('user_location_access')
      .update(updateData)
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating access:', error);
      throw error;
    }

    return data;
  },

  // Revoke access for a user
  async revokeAccess(userId: string, locationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_location_access')
      .delete()
      .eq('user_id', userId)
      .eq('location_id', locationId);

    if (error) {
      console.error('Error revoking access:', error);
      throw error;
    }
  },

  // Get locations accessible by a user with specific access level
  async getAccessibleLocations(
    userId: string,
    minAccessLevel: LocationAccessLevel = 'read'
  ): Promise<any[]> {
    const accessLevels = {
      read: 1,
      write: 2,
      admin: 3
    };

    const { data, error } = await supabase
      .from('user_location_access')
      .select(`
        access_level,
        location:locations(
          id,
          name,
          description,
          event_id,
          is_host,
          timezone,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('access_level', { ascending: false });

    if (error) {
      console.error('Error fetching accessible locations:', error);
      throw error;
    }

    // Filter by minimum access level
    const minLevel = accessLevels[minAccessLevel];
    return (data || []).filter(item => 
      accessLevels[item.access_level] >= minLevel
    ).map(item => ({
      ...item.location,
      access_level: item.access_level
    }));
  },

  // Bulk grant access to multiple users for a location
  async bulkGrantAccess(
    userIds: string[],
    locationId: string,
    accessLevel: LocationAccessLevel,
    grantedBy: string,
    expiresAt?: string
  ): Promise<UserLocationAccess[]> {
    const accessData: UserLocationAccessInsert[] = userIds.map(userId => ({
      user_id: userId,
      location_id: locationId,
      access_level: accessLevel,
      granted_by: grantedBy,
      expires_at: expiresAt || null
    }));

    const { data, error } = await supabase
      .from('user_location_access')
      .upsert(accessData, {
        onConflict: 'user_id,location_id'
      })
      .select();

    if (error) {
      console.error('Error bulk granting access:', error);
      throw error;
    }

    return data || [];
  },

  // Get access statistics for a location
  async getLocationAccessStats(locationId: string): Promise<{
    total: number;
    byLevel: Record<LocationAccessLevel, number>;
    expired: number;
  }> {
    const { data, error } = await supabase
      .from('user_location_access')
      .select('access_level, expires_at')
      .eq('location_id', locationId);

    if (error) {
      console.error('Error fetching access stats:', error);
      throw error;
    }

    const now = new Date();
    const stats = {
      total: 0,
      byLevel: { read: 0, write: 0, admin: 0 } as Record<LocationAccessLevel, number>,
      expired: 0
    };

    (data || []).forEach(access => {
      const isExpired = access.expires_at && new Date(access.expires_at) < now;
      
      if (isExpired) {
        stats.expired++;
      } else {
        stats.total++;
        stats.byLevel[access.access_level]++;
      }
    });

    return stats;
  }
};

export default userLocationAccessService;
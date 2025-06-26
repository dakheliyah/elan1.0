
import { supabase } from '@/integrations/supabase/client';
import { profilesService } from './profilesService';
import { userLocationAccessService } from './userLocationAccessService';
import type { Database } from '../types/database.types';

type LocationAccessLevel = Database['public']['Enums']['location_access_level'];

export const authService = {
  async getCurrentUser() {
    try {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  async hasRole(requiredRole: 'admin' | 'editor' | 'viewer'): Promise<boolean> {
    try {
      const profile = await profilesService.getCurrentProfile();
      if (!profile) return false;

      const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
      const userRoleLevel = roleHierarchy[profile.role || 'viewer'];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  },

  async canEdit(): Promise<boolean> {
    return this.hasRole('editor');
  },

  // Location-based permission methods
  async canAccessLocation(
    locationId: string, 
    requiredLevel: LocationAccessLevel = 'read'
  ): Promise<boolean> {
    try {
      const profile = await profilesService.getCurrentProfile();
      if (!profile) return false;

      // Admins have access to all locations
      if (profile.role === 'admin') return true;

      // Check specific location access
      return await userLocationAccessService.hasAccess(
        profile.id, 
        locationId, 
        requiredLevel
      );
    } catch (error) {
      console.error('Error checking location access:', error);
      return false;
    }
  },

  async canReadLocation(locationId: string): Promise<boolean> {
    return this.canAccessLocation(locationId, 'read');
  },

  async canWriteLocation(locationId: string): Promise<boolean> {
    return this.canAccessLocation(locationId, 'write');
  },

  async canAdminLocation(locationId: string): Promise<boolean> {
    return this.canAccessLocation(locationId, 'admin');
  },

  async getLocationAccessLevel(locationId: string): Promise<LocationAccessLevel | null> {
    try {
      const profile = await profilesService.getCurrentProfile();
      if (!profile) return null;

      // Admins have admin access to all locations
      if (profile.role === 'admin') return 'admin';

      // Get specific location access level
      return await userLocationAccessService.getUserAccessLevel(
        profile.id, 
        locationId
      );
    } catch (error) {
      console.error('Error getting location access level:', error);
      return null;
    }
  },

  async canManageLocationAccess(locationId: string): Promise<boolean> {
    try {
      const profile = await profilesService.getCurrentProfile();
      if (!profile) return false;

      // Only admins and location admins can manage access
      if (profile.role === 'admin') return true;
      
      return await this.canAdminLocation(locationId);
    } catch (error) {
      console.error('Error checking location access management permission:', error);
      return false;
    }
  },

  async getAccessibleLocationIds(
    minAccessLevel: LocationAccessLevel = 'read'
  ): Promise<string[]> {
    try {
      const profile = await profilesService.getCurrentProfile();
      if (!profile) return [];

      // Admins have access to all locations - we'd need to fetch all location IDs
      if (profile.role === 'admin') {
        // For now, return empty array and let the calling code handle admin access
        // In a real implementation, you might want to fetch all location IDs
        return [];
      }

      const accessibleLocations = await userLocationAccessService.getAccessibleLocations(
        profile.id, 
        minAccessLevel
      );
      
      return accessibleLocations.map(location => location.id);
    } catch (error) {
      console.error('Error getting accessible location IDs:', error);
      return [];
    }
  },
};

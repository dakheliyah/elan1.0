
import { supabase } from '@/integrations/supabase/client';
import { profilesService } from './profilesService';

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
};

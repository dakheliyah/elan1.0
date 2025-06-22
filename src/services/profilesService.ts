
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from './serviceUtils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profilesService = {
  async getAll(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch profiles');
    }
  },

  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch current profile');
    }
  },

  async getById(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch profile');
    }
  },

  async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update profile');
    }
  },

  async updateRole(userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update user role');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete profile');
    }
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete multiple profiles');
    }
  },
};

export type { Profile, ProfileInsert, ProfileUpdate };

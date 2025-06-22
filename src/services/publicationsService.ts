import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from './serviceUtils';

type Publication = Database['public']['Tables']['publications']['Row'];
type PublicationInsert = Database['public']['Tables']['publications']['Insert'];
type PublicationUpdate = Database['public']['Tables']['publications']['Update'];

export const publicationsService = {
  async getAll(): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch publications');
    }
  },

  async getByLocationId(locationId: string): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('location_id', locationId)
        .order('is_featured', { ascending: false })
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
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch publication');
    }
  },

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

  async toggleFeatured(id: string, is_featured: boolean, location_id: string): Promise<Publication> {
    try {
      // If marking as featured, first unmark any currently featured publication in this location
      if (is_featured) {
        const { error: unfeaturedError } = await supabase
          .from('publications')
          .update({ 
            is_featured: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('location_id', location_id)
          .eq('is_featured', true)
          .neq('id', id);

        if (unfeaturedError) throw unfeaturedError;
      }

      // Now update the target publication
      const { data, error } = await supabase
        .from('publications')
        .update({ 
          is_featured, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'toggle featured status');
    }
  },
};

export type { Publication, PublicationInsert, PublicationUpdate };

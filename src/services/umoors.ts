
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

// Type definitions
type Umoor = Database['public']['Tables']['umoors']['Row'];
type UmoorInsert = Database['public']['Tables']['umoors']['Insert'];
type UmoorUpdate = Database['public']['Tables']['umoors']['Update'];

// Custom error class for service layer
export class UmoorServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UmoorServiceError';
  }
}

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  throw new UmoorServiceError(
    error.message || `Failed to ${operation}`,
    error.code,
    error.details
  );
};

// Generate URL-friendly slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Umoors Service
export const umoorsService = {
  // Get all umoors
  async getAll(): Promise<Umoor[]> {
    try {
      const { data, error } = await supabase
        .from('umoors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch umoors');
    }
  },

  // Get umoor by ID
  async getById(id: string): Promise<Umoor | null> {
    try {
      const { data, error } = await supabase
        .from('umoors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch umoor');
    }
  },

  // Create new umoor
  async create(umoor: Omit<UmoorInsert, 'slug' | 'created_by'>): Promise<Umoor> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const umoorData = {
        ...umoor,
        slug: generateSlug(umoor.name || ''),
        created_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('umoors')
        .insert(umoorData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create umoor');
    }
  },

  // Update umoor
  async update(id: string, updates: UmoorUpdate): Promise<Umoor> {
    try {
      // If name is being updated, regenerate slug
      const updateData = { ...updates };
      if (updates.name) {
        updateData.slug = generateSlug(updates.name);
      }

      const { data, error } = await supabase
        .from('umoors')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update umoor');
    }
  },

  // Delete umoor
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('umoors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete umoor');
    }
  },

  // Delete multiple umoors
  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('umoors')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete multiple umoors');
    }
  },

  // Upload logo
  async uploadLogo(file: File, umoorId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${umoorId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('umoor-logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('umoor-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      handleSupabaseError(error, 'upload logo');
    }
  },

  // Delete logo
  async deleteLogo(logoUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const fileName = logoUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('umoor-logos')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete logo');
    }
  },
};

// Export types
export type { Umoor, UmoorInsert, UmoorUpdate };

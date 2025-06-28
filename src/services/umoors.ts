
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

// Service for managing Umoors with order preference support

// Type definitions with order_preference support
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
  // Get all umoors with proper ordering
  // Priority: order_preference > 0 first (ascending), then order_preference = 0 by created_at (desc)
  async getAll(): Promise<Umoor[]> {
    try {
      const { data, error } = await supabase
        .from('umoors')
        .select('id, name, description, slug, logo_url, order_preference, created_at, updated_at, created_by')
        .order('order_preference', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sort to ensure proper priority: order_preference > 0 first, then 0
      const sorted = (data || []).sort((a, b) => {
        // If both have order_preference > 0, sort by order_preference ascending
        if (a.order_preference > 0 && b.order_preference > 0) {
          return a.order_preference - b.order_preference;
        }
        // If one has order_preference > 0 and other is 0, prioritize the one > 0
        if (a.order_preference > 0 && b.order_preference === 0) return -1;
        if (a.order_preference === 0 && b.order_preference > 0) return 1;
        // If both are 0, maintain created_at desc order
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return sorted;
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

  // Update umoor order preference
  async updateOrder(id: string, orderPreference: number): Promise<Umoor> {
    try {
      const { data, error } = await supabase
        .from('umoors')
        .update({ 
          order_preference: orderPreference,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update umoor order');
    }
  },

  // Bulk update umoor orders
  async updateBulkOrders(orders: { id: string; orderPreference: number }[]): Promise<void> {
    try {
      const updates = orders.map(({ id, orderPreference }) => 
        supabase
          .from('umoors')
          .update({ 
            order_preference: orderPreference,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} umoor orders`);
      }
    } catch (error) {
      handleSupabaseError(error, 'bulk update umoor orders');
    }
  },
};

// Export types
export type { Umoor, UmoorInsert, UmoorUpdate };

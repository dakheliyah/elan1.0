
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

// Type definitions
type MediaFile = Database['public']['Tables']['media_files']['Row'];
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];
type MediaFileUpdate = Database['public']['Tables']['media_files']['Update'];

type MediaUsage = Database['public']['Tables']['media_usage']['Row'];
type MediaUsageInsert = Database['public']['Tables']['media_usage']['Insert'];

type MediaOptimizationJob = Database['public']['Tables']['media_optimization_jobs']['Row'];
type MediaOptimizationJobInsert = Database['public']['Tables']['media_optimization_jobs']['Insert'];
type MediaOptimizationJobUpdate = Database['public']['Tables']['media_optimization_jobs']['Update'];

// Custom error class for service layer
export class MediaServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MediaServiceError';
  }
}

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase media ${operation} error:`, error);
  throw new MediaServiceError(
    error.message || `Failed to ${operation}`,
    error.code,
    error.details
  );
};

// Media Files Service
export const mediaFilesService = {
  // Get all media files for an event
  async getByEventId(eventId: string): Promise<MediaFile[]> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch media files');
    }
  },

  // Get media file by ID
  async getById(id: string): Promise<MediaFile | null> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch media file');
    }
  },

  // Create new media file record
  async create(mediaFile: MediaFileInsert): Promise<MediaFile> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const mediaFileData = {
        ...mediaFile,
        uploaded_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('media_files')
        .insert(mediaFileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create media file');
    }
  },

  // Update media file
  async update(id: string, updates: MediaFileUpdate): Promise<MediaFile> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update media file');
    }
  },

  // Delete media file
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete media file');
    }
  },

  // Upload file to storage
  async uploadFile(file: File, eventId: string, fileName: string): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const filePath = `${user.user.id}/${eventId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      handleSupabaseError(error, 'upload file');
    }
  },

  // Delete file from storage
  async deleteFile(storagePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('media-files')
        .remove([storagePath]);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete file from storage');
    }
  },

  // Get media files with usage count
  async getWithUsageCount(eventId: string): Promise<(MediaFile & { usage_count: number })[]> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select(`
          *,
          media_usage(count)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(file => ({
        ...file,
        usage_count: file.media_usage?.[0]?.count || 0,
        media_usage: undefined, // Remove the nested array
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch media files with usage count');
    }
  },
};

// Media Usage Service
export const mediaUsageService = {
  // Get usage records for a media file
  async getByMediaFileId(mediaFileId: string): Promise<MediaUsage[]> {
    try {
      const { data, error } = await supabase
        .from('media_usage')
        .select('*')
        .eq('media_file_id', mediaFileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch media usage');
    }
  },

  // Create usage record
  async create(usage: MediaUsageInsert): Promise<MediaUsage> {
    try {
      const { data, error } = await supabase
        .from('media_usage')
        .insert(usage)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create media usage');
    }
  },

  // Delete usage record
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_usage')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete media usage');
    }
  },
};

// Media Optimization Jobs Service
export const mediaOptimizationService = {
  // Get optimization jobs for an event
  async getByEventId(eventId: string): Promise<MediaOptimizationJob[]> {
    try {
      const { data, error } = await supabase
        .from('media_optimization_jobs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch optimization jobs');
    }
  },

  // Create optimization job
  async create(job: MediaOptimizationJobInsert): Promise<MediaOptimizationJob> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const jobData = {
        ...job,
        created_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('media_optimization_jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create optimization job');
    }
  },

  // Update optimization job
  async update(id: string, updates: MediaOptimizationJobUpdate): Promise<MediaOptimizationJob> {
    try {
      const { data, error } = await supabase
        .from('media_optimization_jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update optimization job');
    }
  },
};

// Helper functions
export const mediaHelpers = {
  // Get file type from MIME type
  getFileType(mimeType: string): 'image' | 'document' | 'video' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  },

  // Get file format from name or MIME type
  getFileFormat(fileName: string, mimeType?: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || mimeType?.split('/')[1] || 'unknown';
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate thumbnail for image files
  async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  },
};

// Export all services and types
export {
  type MediaFile,
  type MediaFileInsert,
  type MediaFileUpdate,
  type MediaUsage,
  type MediaUsageInsert,
  type MediaOptimizationJob,
  type MediaOptimizationJobInsert,
  type MediaOptimizationJobUpdate,
};

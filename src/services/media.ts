
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

  // Upload file to storage with optional compression
  async uploadFile(
    file: File, 
    eventId: string, 
    fileName: string,
    options: {
      compress?: boolean;
      maxWidth?: number;
      quality?: number;
    } = {}
  ): Promise<{
    url: string;
    compressionData?: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    };
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      let fileToUpload = file;
      let compressionData: {
        originalSize: number;
        compressedSize: number;
        compressionRatio: number;
      } | undefined;

      // Compress image if requested and applicable
      if (options.compress && imageCompressionService.shouldCompress(file, true)) {
        try {
          const compressionResult = await imageCompressionService.compressImage(file, {
            maxWidth: options.maxWidth,
            quality: options.quality
          });
          
          fileToUpload = compressionResult.compressedFile;
          compressionData = {
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio
          };
          
          // Update fileName to reflect WebP format
          fileName = fileName.replace(/\.[^/.]+$/, '.webp');
        } catch (compressionError) {
          console.warn('Compression failed, uploading original file:', compressionError);
          // Continue with original file if compression fails
        }
      }

      const filePath = `${user.user.id}/${eventId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('media-files')
        .upload(filePath, fileToUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        compressionData
      };
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

// Image Compression Service
export const imageCompressionService = {
  // Compress image using Supabase Edge Function
  async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      quality?: number;
    } = {}
  ): Promise<{
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  }> {
    try {
      const { maxWidth = 1920, quality = 80 } = options;
      
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('compress-image', {
        body: {
          imageData: base64Data,
          maxWidth,
          quality,
          filename: file.name
        }
      });
      
      if (error || !data.success) {
        throw new Error(data?.error || 'Compression failed');
      }
      
      // Convert compressed data back to File
      const compressedFile = await this.base64ToFile(
        data.compressedData,
        file.name.replace(/\.[^/.]+$/, '.webp'), // Change extension to .webp
        'image/webp'
      );
      
      return {
        compressedFile,
        originalSize: data.originalSize,
        compressedSize: data.compressedSize,
        compressionRatio: data.compressionRatio
      };
    } catch (error) {
      console.error('Image compression error:', error);
      throw new MediaServiceError(
        error.message || 'Failed to compress image',
        'COMPRESSION_ERROR'
      );
    }
  },

  // Convert File to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Convert base64 to File
  async base64ToFile(base64Data: string, filename: string, mimeType: string): Promise<File> {
    const response = await fetch(base64Data);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  },

  // Check if file should be compressed
  shouldCompress(file: File, autoCompress: boolean = false): boolean {
    // Only compress images
    if (!file.type.startsWith('image/')) return false;
    
    // Skip if already WebP
    if (file.type === 'image/webp') return false;
    
    // Skip very small files (less than 100KB)
    if (file.size < 100 * 1024) return false;
    
    return autoCompress;
  },

  // Client-side fallback compression using Canvas
  async compressImageFallback(
    file: File,
    options: {
      maxWidth?: number;
      quality?: number;
    } = {}
  ): Promise<File> {
    const { maxWidth = 1920, quality = 0.8 } = options;
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp' }
              );
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas compression failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
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


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorageQuota {
  id: string;
  event_id: string;
  quota_bytes: number;
  used_bytes: number;
  warning_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CompressionSettings {
  id: string;
  event_id: string;
  auto_compress: boolean;
  quality_images: number;
  quality_thumbnails: number;
  enable_webp: boolean;
  enable_progressive: boolean;
  max_width: number;
  max_height: number;
  updated_at: string;
}

export interface MediaVersion {
  id: string;
  media_file_id: string;
  version_type: string;
  url: string;
  storage_path: string;
  size_bytes: number;
  width?: number;
  height?: number;
  quality?: number;
  format: string;
  is_optimized: boolean;
  created_at: string;
}

export interface BackupJob {
  id: string;
  event_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  backup_type: 'full' | 'incremental';
  backup_location?: string;
  file_count: number;
  total_size_bytes: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by?: string;
  created_at: string;
}

// Storage Quota Hooks
export const useStorageQuota = (eventId: string) => {
  return useQuery({
    queryKey: ['storageQuota', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_quotas')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      return data as StorageQuota | null;
    },
    enabled: !!eventId,
  });
};

export const useStorageUsageHistory = (eventId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['storageUsageHistory', eventId, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_usage_history')
        .select('*')
        .eq('event_id', eventId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

export const useUpdateStorageQuota = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.rpc('update_storage_quota_usage', {
        p_event_id: eventId
      });

      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['storageQuota', eventId] });
      queryClient.invalidateQueries({ queryKey: ['storageUsageHistory', eventId] });
    },
    onError: (error) => {
      console.error('Failed to update storage quota:', error);
      toast({
        title: "Storage Update Failed",
        description: "Failed to update storage quota information",
        variant: "destructive"
      });
    },
  });
};

// Compression Settings Hooks
export const useCompressionSettings = (eventId: string) => {
  return useQuery({
    queryKey: ['compressionSettings', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compression_settings')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      return data as CompressionSettings | null;
    },
    enabled: !!eventId,
  });
};

export const useUpdateCompressionSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, settings }: { eventId: string; settings: Partial<CompressionSettings> }) => {
      const { data, error } = await supabase
        .from('compression_settings')
        .upsert({
          event_id: eventId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['compressionSettings', eventId] });
      toast({
        title: "Settings Updated",
        description: "Compression settings have been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to update compression settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update compression settings",
        variant: "destructive"
      });
    },
  });
};

// Media Versions Hooks
export const useMediaVersions = (mediaFileId: string) => {
  return useQuery({
    queryKey: ['mediaVersions', mediaFileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_versions')
        .select('*')
        .eq('media_file_id', mediaFileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaVersion[];
    },
    enabled: !!mediaFileId,
  });
};

// Backup Jobs Hooks
export const useBackupJobs = (eventId: string) => {
  return useQuery({
    queryKey: ['backupJobs', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_backup_jobs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BackupJob[];
    },
    enabled: !!eventId,
  });
};

export const useCreateBackupJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, backupType }: { eventId: string; backupType: 'full' | 'incremental' }) => {
      const { data, error } = await supabase
        .from('media_backup_jobs')
        .insert({
          event_id: eventId,
          backup_type: backupType,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['backupJobs', eventId] });
      toast({
        title: "Backup Scheduled",
        description: "Media backup job has been scheduled successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to create backup job:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to schedule backup job",
        variant: "destructive"
      });
    },
  });
};

// Orphaned Files Detection
export const useDetectOrphanedFiles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('detect_orphaned_files');
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Scan Complete",
        description: "Orphaned files detection completed successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to detect orphaned files:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to detect orphaned files",
        variant: "destructive"
      });
    },
  });
};

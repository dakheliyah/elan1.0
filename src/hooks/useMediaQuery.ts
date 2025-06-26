
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaFilesService, mediaUsageService, mediaOptimizationService } from '@/services/media';
import type { MediaFileInsert, MediaFileUpdate, MediaUsageInsert, MediaOptimizationJobInsert } from '@/services/media';
import { supabase } from '@/integrations/supabase/client';

// Media Files hooks
export const useMediaFiles = (eventId: string) => {
  return useQuery({
    queryKey: ['mediaFiles', eventId],
    queryFn: () => mediaFilesService.getWithUsageCount(eventId),
    enabled: !!eventId,
  });
};

// Alias for backwards compatibility
export const useMediaFilesWithUsageCount = useMediaFiles;

export const useMediaFile = (mediaFileId: string) => {
  return useQuery({
    queryKey: ['mediaFile', mediaFileId],
    queryFn: () => mediaFilesService.getById(mediaFileId),
    enabled: !!mediaFileId,
  });
};

export const useCreateMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaFilesService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', data.event_id] });
    },
  });
};

export const useUpdateMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: MediaFileUpdate }) =>
      mediaFilesService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['mediaFile', data.id] });
    },
  });
};

export const useDeleteMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaFilesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
  });
};

export const useUploadMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, eventId, mediaData }: { 
      file: File; 
      eventId: string; 
      mediaData: Omit<MediaFileInsert, 'url' | 'storage_path' | 'event_id'> 
    }) => {
      const fileName = `${Date.now()}-${file.name}`;
      const url = await mediaFilesService.uploadFile(file, eventId, fileName);
      
      const { data: user } = await supabase.auth.getUser();
      const storagePath = `${user.user?.id}/${eventId}/${fileName}`;
      
      return mediaFilesService.create({
        ...mediaData,
        event_id: eventId,
        url,
        storage_path: storagePath,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', data.event_id] });
    },
  });
};

// Media Usage hooks
export const useMediaUsage = (mediaFileId: string) => {
  return useQuery({
    queryKey: ['mediaUsage', mediaFileId],
    queryFn: () => mediaUsageService.getByMediaFileId(mediaFileId),
    enabled: !!mediaFileId,
  });
};

export const useCreateMediaUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaUsageService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mediaUsage', data.media_file_id] });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
  });
};

export const useDeleteMediaUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaUsageService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaUsage'] });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
  });
};

// Media Optimization hooks
export const useOptimizationJobs = (eventId: string) => {
  return useQuery({
    queryKey: ['optimizationJobs', eventId],
    queryFn: () => mediaOptimizationService.getByEventId(eventId),
    enabled: !!eventId,
  });
};

export const useCreateOptimizationJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaOptimizationService.create,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['optimizationJobs', data.event_id] });
    },
  });
};

export const useUpdateOptimizationJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      mediaOptimizationService.update(id, updates),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['optimizationJobs', data.event_id] });
    },
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaUsageService } from '@/services/media';
import { useToast } from '@/hooks/use-toast';

export const useTrackMediaUsage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ mediaFileId, publicationId, usageType = 'publication' }: {
      mediaFileId: string;
      publicationId?: string;
      usageType?: string;
    }) => {
      return await mediaUsageService.create({
        media_file_id: mediaFileId,
        publication_id: publicationId,
        usage_type: usageType,
      });
    },
    onSuccess: () => {
      // Invalidate media files queries to update usage counts
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
      queryClient.invalidateQueries({ queryKey: ['mediaUsage'] });
    },
    onError: (error) => {
      console.error('Failed to track media usage:', error);
      toast({
        title: "Usage Tracking Failed",
        description: "Failed to track media usage. The image was still added successfully.",
        variant: "destructive"
      });
    },
  });
};

export const useRemoveMediaUsage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (usageId: string) => {
      return await mediaUsageService.delete(usageId);
    },
    onSuccess: () => {
      // Invalidate media files queries to update usage counts
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
      queryClient.invalidateQueries({ queryKey: ['mediaUsage'] });
    },
    onError: (error) => {
      console.error('Failed to remove media usage:', error);
      toast({
        title: "Usage Removal Failed",
        description: "Failed to remove media usage tracking.",
        variant: "destructive"
      });
    },
  });
};

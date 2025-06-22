
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { umoorsService } from '@/services/umoors';
import { useToast } from '@/hooks/use-toast';

// Umoor hooks
export const useUmoors = () => {
  return useQuery({
    queryKey: ['umoors'],
    queryFn: umoorsService.getAll,
  });
};

export const useUmoor = (umoorId: string) => {
  return useQuery({
    queryKey: ['umoor', umoorId],
    queryFn: () => umoorsService.getById(umoorId),
    enabled: !!umoorId,
  });
};

export const useCreateUmoor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: umoorsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umoors'] });
      toast({
        title: "Success",
        description: "Umoor created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create umoor",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUmoor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      umoorsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umoors'] });
      toast({
        title: "Success",
        description: "Umoor updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update umoor",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUmoor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: umoorsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umoors'] });
      toast({
        title: "Success",
        description: "Umoor deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete umoor",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMultipleUmoors = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: umoorsService.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umoors'] });
      toast({
        title: "Success",
        description: "Selected umoors deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete selected umoors",
        variant: "destructive",
      });
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, umoorId }: { file: File; umoorId: string }) =>
      umoorsService.uploadLogo(file, umoorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umoors'] });
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    },
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationServiceEnhanced } from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';

export const useCreateLocationWithHost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: locationServiceEnhanced.createWithHostValidation,
    onSuccess: (data) => {
      // Invalidate all location-related queries for this event
      queryClient.invalidateQueries({ queryKey: ['locations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'publicationCount', data.event_id] });
      
      if (data.is_host) {
        toast({
          title: "Host Location Set",
          description: `${data.name} has been designated as the host location.`,
        });
      } else {
        toast({
          title: "Location Created",
          description: `${data.name} has been created successfully.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLocationWithHost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      locationServiceEnhanced.updateWithHostValidation(id, updates),
    onSuccess: (data) => {
      // Invalidate all location-related queries for this event
      queryClient.invalidateQueries({ queryKey: ['locations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'publicationCount', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['location', data.id] });
      
      if (data.is_host) {
        toast({
          title: "Host Location Updated",
          description: `${data.name} is now the host location.`,
        });
      } else {
        toast({
          title: "Location Updated",
          description: `${data.name} has been updated successfully.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location. Please try again.",
        variant: "destructive",
      });
    },
  });
};

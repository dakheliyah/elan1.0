import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { locationsService } from '@/services/locationsService';

export const useAllLocations = () => {
  return useQuery({
    queryKey: ['locations', 'all'],
    queryFn: () => locationsService.getAll(),
  });
};

export const useLocation = (locationId: string) => {
  return useQuery({
    queryKey: ['location', locationId],
    queryFn: () => locationsService.getById(locationId),
    enabled: !!locationId,
  });
};

export const useLocations = (eventId: string) => {
  return useQuery({
    queryKey: ['locations', eventId],
    queryFn: () => locationsService.getByEventId(eventId),
    enabled: !!eventId,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'publicationCount', data.event_id] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      locationsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'publicationCount', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['location', data.id] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationsService.delete,
    onSuccess: (_, locationId) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', locationId] });
    },
  });
};

export const useLocationsWithPublicationCount = (eventId: string) => {
  return useQuery({
    queryKey: ['locations', 'publicationCount', eventId],
    queryFn: () => locationsService.getWithPublicationCount(eventId),
    enabled: !!eventId,
  });
};

export const useUploadLocationLogo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, locationId }: { file: File; locationId: string }) =>
      locationsService.uploadLogo(file, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location logo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload location logo",
        variant: "destructive",
      });
    },
  });
};

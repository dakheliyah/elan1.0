
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsService, type PublicationUpdate } from '@/services/publicationsService';

export const usePublication = (publicationId: string) => {
  return useQuery({
    queryKey: ['publication', publicationId],
    queryFn: () => publicationsService.getById(publicationId),
    enabled: !!publicationId,
  });
};

export const usePublicationsByLocation = (locationId: string) => {
  return useQuery({
    queryKey: ['publications', 'location', locationId],
    queryFn: () => publicationsService.getByLocationId(locationId),
    enabled: !!locationId,
  });
};

export const useCreatePublication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: publicationsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['publications', 'location', data.location_id] });
    },
  });
};

export const useUpdatePublication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PublicationUpdate & { location_id?: string } }) => {
      if (updates.is_featured !== undefined && updates.location_id) {
        return publicationsService.toggleFeatured(id, updates.is_featured, updates.location_id);
      }
      return publicationsService.update(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['publication', data.id] });
      queryClient.invalidateQueries({ queryKey: ['publications', 'location', data.location_id] });
    },
  });
};

export const useDeletePublication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: publicationsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  publicationsService, 
  type PublicationUpdate,
  type CreateEventPublicationData,
  type PublicationLocation,
  type PublicationLocationWithLocation
} from '@/services/publicationsService';

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

// New hooks for event-date based publications

export const usePublicationsByEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['publications', 'event', eventId],
    queryFn: () => publicationsService.getByEventId(eventId),
    enabled: !!eventId,
  });
};

export const usePublicationByEventAndDate = (eventId: string, date: string) => {
  return useQuery({
    queryKey: ['publication', 'event', eventId, 'date', date],
    queryFn: () => publicationsService.getByEventAndDate(eventId, date),
    enabled: !!eventId && !!date,
  });
};

export const useCreateEventPublication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEventPublicationData) => publicationsService.createForEvent(data),
    onSuccess: (publications) => {
      if (publications && publications.length > 0) {
        const eventId = publications[0].event_id;
        const publicationDate = publications[0].publication_date;
        queryClient.invalidateQueries({ queryKey: ['publications', 'event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['publication', 'event', eventId, 'date', publicationDate] });
        
        // Invalidate individual publication queries
        publications.forEach(pub => {
          queryClient.invalidateQueries({ queryKey: ['publication', pub.id] });
        });
      }
    },
  });
};

export const usePublicationLocations = (publicationId: string) => {
  return useQuery({
    queryKey: ['publication', publicationId, 'locations'],
    queryFn: () => publicationsService.getPublicationLocations(publicationId),
    enabled: !!publicationId,
  });
};

export const useUpdateLocationContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ publicationId, locationId, content, status }: {
      publicationId: string;
      locationId: string;
      content: string;
      status?: 'draft' | 'mark_as_ready' | 'archived';
    }) => publicationsService.updateLocationContent(publicationId, locationId, content, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['publication', data.publication_id, 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['publication', data.publication_id] });
    },
  });
};

export const useUpdateLocationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ publicationId, locationId, status }: {
      publicationId: string;
      locationId: string;
      status: 'draft' | 'mark_as_ready' | 'archived';
    }) => publicationsService.updateLocationStatus(publicationId, locationId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['publication', data.publication_id, 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['publication', data.publication_id] });
    },
  });
};



export const useMarkAsReadyLocations = (publicationId: string) => {
  return useQuery({
    queryKey: ['publication', publicationId, 'mark-as-ready-locations'],
    queryFn: () => publicationsService.getMarkAsReadyLocations(publicationId),
    enabled: !!publicationId,
  });
};

export const usePublishAllLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (publicationId: string) => publicationsService.publishAllLocations(publicationId),
    onSuccess: (_, publicationId) => {
      queryClient.invalidateQueries({ queryKey: ['publication', publicationId, 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['publication', publicationId, 'mark-as-ready-locations'] });
    },
  });
};

export const useArchiveAllLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (publicationId: string) => publicationsService.archiveAllLocations(publicationId),
    onSuccess: (_, publicationId) => {
      queryClient.invalidateQueries({ queryKey: ['publication', publicationId, 'locations'] });
      queryClient.invalidateQueries({ queryKey: ['publication', publicationId, 'mark-as-ready-locations'] });
    },
  });
};

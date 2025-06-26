import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userLocationAccessService } from '../services/userLocationAccessService';
import { locationsService } from '../services/locationsService';
import { useCurrentProfile } from './useSupabaseQuery';
import type { Database } from '../types/database.types';

type LocationAccessLevel = Database['public']['Enums']['location_access_level'];
type UserLocationAccess = Database['public']['Tables']['user_location_access']['Row'];

// Hook to get user's access to all locations
export const useUserLocationAccess = (userId?: string) => {
  return useQuery({
    queryKey: ['user-location-access', userId],
    queryFn: () => userLocationAccessService.getUserAccess(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get all users with access to a specific location
export const useLocationAccess = (locationId?: string) => {
  return useQuery({
    queryKey: ['location-access', locationId],
    queryFn: () => userLocationAccessService.getLocationAccess(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to check if current user has access to a location
export const useCanAccessLocation = (
  locationId?: string,
  requiredLevel: LocationAccessLevel = 'read'
) => {
  const { data: profile } = useCurrentProfile();
  
  return useQuery({
    queryKey: ['can-access-location', locationId, profile?.id, requiredLevel],
    queryFn: () => 
      userLocationAccessService.hasAccess(profile!.id, locationId!, requiredLevel),
    enabled: !!locationId && !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get user's access level for a specific location
export const useLocationAccessLevel = (locationId?: string) => {
  const { data: profile } = useCurrentProfile();
  
  return useQuery({
    queryKey: ['location-access-level', locationId, profile?.id],
    queryFn: () => 
      userLocationAccessService.getUserAccessLevel(profile!.id, locationId!),
    enabled: !!locationId && !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get locations accessible by current user
export const useAccessibleLocations = (
  minAccessLevel: LocationAccessLevel = 'read'
) => {
  const { data: profile } = useCurrentProfile();
  
  return useQuery({
    queryKey: ['accessible-locations', profile?.id, minAccessLevel],
    queryFn: () => 
      userLocationAccessService.getAccessibleLocations(profile!.id, minAccessLevel),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get locations with publication count filtered by user access
export const useLocationsWithPublicationCountByAccess = (
  eventId?: string,
  minAccessLevel: LocationAccessLevel = 'read'
) => {
  const { data: profile } = useCurrentProfile();
  
  return useQuery({
    queryKey: ['locations-with-publication-count-by-access', eventId, profile?.id, minAccessLevel],
    queryFn: () => 
      locationsService.getWithPublicationCountByAccess(eventId!, profile!.id, minAccessLevel),
    enabled: !!eventId && !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to grant access to a user
export const useGrantLocationAccess = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  
  return useMutation({
    mutationFn: async ({
      userId,
      locationId,
      accessLevel,
      expiresAt
    }: {
      userId: string;
      locationId: string;
      accessLevel: LocationAccessLevel;
      expiresAt?: string;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');
      
      return userLocationAccessService.grantAccess(
        userId,
        locationId,
        accessLevel,
        profile.id,
        expiresAt
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['location-access', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-location-access', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['can-access-location', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['location-access-level', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['accessible-locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['locations-with-publication-count-by-access'] 
      });
    },
  });
};

// Hook to update access level
export const useUpdateLocationAccess = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  
  return useMutation({
    mutationFn: async ({
      userId,
      locationId,
      accessLevel,
      expiresAt
    }: {
      userId: string;
      locationId: string;
      accessLevel: LocationAccessLevel;
      expiresAt?: string;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');
      
      return userLocationAccessService.updateAccess(
        userId,
        locationId,
        accessLevel,
        profile.id,
        expiresAt
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['location-access', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-location-access', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['can-access-location', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['location-access-level', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['accessible-locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['locations-with-publication-count-by-access'] 
      });
    },
  });
};

// Hook to revoke access
export const useRevokeLocationAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      locationId
    }: {
      userId: string;
      locationId: string;
    }) => {
      return userLocationAccessService.revokeAccess(userId, locationId);
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['location-access', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-location-access', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['can-access-location', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['location-access-level', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['accessible-locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['locations-with-publication-count-by-access'] 
      });
    },
  });
};

// Hook to bulk grant access
export const useBulkGrantLocationAccess = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  
  return useMutation({
    mutationFn: async ({
      userIds,
      locationId,
      accessLevel,
      expiresAt
    }: {
      userIds: string[];
      locationId: string;
      accessLevel: LocationAccessLevel;
      expiresAt?: string;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');
      
      return userLocationAccessService.bulkGrantAccess(
        userIds,
        locationId,
        accessLevel,
        profile.id,
        expiresAt
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['location-access', variables.locationId] 
      });
      variables.userIds.forEach(userId => {
        queryClient.invalidateQueries({ 
          queryKey: ['user-location-access', userId] 
        });
      });
      queryClient.invalidateQueries({ 
        queryKey: ['can-access-location', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['location-access-level', variables.locationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['accessible-locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['locations-with-publication-count-by-access'] 
      });
    },
  });
};

// Hook to get location access statistics
export const useLocationAccessStats = (locationId?: string) => {
  return useQuery({
    queryKey: ['location-access-stats', locationId],
    queryFn: () => userLocationAccessService.getLocationAccessStats(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
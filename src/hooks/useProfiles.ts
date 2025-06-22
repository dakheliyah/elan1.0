import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesService } from '@/services/profilesService';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: profilesService.getAll,
  });
};

export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ['profile', 'current'],
    queryFn: profilesService.getCurrentProfile,
  });
};

export const useProfile = (profileId: string) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profilesService.getById(profileId),
    enabled: !!profileId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      profilesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'editor' | 'viewer' }) =>
      profilesService.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profilesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profilesService.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

// Alias for useProfiles to match the import in UserManagement
export const useUserProfiles = useProfiles;

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
  });
};

export const useUserRole = (requiredRole: 'admin' | 'editor' | 'viewer') => {
  return useQuery({
    queryKey: ['auth', 'role', requiredRole],
    queryFn: () => authService.hasRole(requiredRole),
  });
};

export const useIsAdmin = () => {
  return useQuery({
    queryKey: ['auth', 'isAdmin'],
    queryFn: authService.isAdmin,
  });
};

export const useCanEdit = () => {
  return useQuery({
    queryKey: ['auth', 'canEdit'],
    queryFn: authService.canEdit,
  });
};

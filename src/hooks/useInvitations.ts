
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsService } from '@/services/supabase';

export const useInvitations = (eventId: string) => {
  return useQuery({
    queryKey: ['invitations', eventId],
    queryFn: () => invitationsService.getByEventId(eventId),
    enabled: !!eventId,
  });
};

export const useInvitation = (invitationId: string) => {
  return useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: () => invitationsService.getById(invitationId),
    enabled: !!invitationId,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', data.event_id] });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationsService.accept,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['invitation', data.id] });
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationsService.resend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};

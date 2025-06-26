
// Centralized export of all Supabase-related hooks for backward compatibility
export { 
  useEvents, 
  useEvent, 
  useCreateEvent, 
  useUpdateEvent, 
  useDeleteEvent, 
  useEventsWithLocationCount 
} from './useEvents';

export { 
  useLocation, 
  useLocations, 
  useCreateLocation, 
  useUpdateLocation, 
  useDeleteLocation, 
  useLocationsWithPublicationCount 
} from './useLocations';

export { 
  usePublication, 
  usePublicationsByLocation, 
  useCreatePublication, 
  useUpdatePublication, 
  useDeletePublication,
  usePublicationsByEvent,
  usePublicationByEventAndDate,
  useCreateEventPublication,
  usePublicationLocations,
  useUpdateLocationContent,
  useUpdateLocationStatus,
  useMarkAsReadyLocations,
  usePublishAllLocations,
  useArchiveAllLocations
} from './usePublications';

export { 
  useProfiles, 
  useCurrentProfile, 
  useProfile, 
  useUpdateProfile, 
  useUpdateUserRole 
} from './useProfiles';

export { 
  useCurrentUser, 
  useUserRole, 
  useIsAdmin, 
  useCanEdit 
} from './useAuth';

export { 
  useInvitations, 
  useInvitation, 
  useCreateInvitation, 
  useAcceptInvitation, 
  useDeleteInvitation, 
  useResendInvitation 
} from './useInvitations';

export { useHostPublication } from './useHostPublication';

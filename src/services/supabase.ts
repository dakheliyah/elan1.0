import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

// Type definitions
type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

type Location = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type LocationUpdate = Database['public']['Tables']['locations']['Update'];

type Publication = Database['public']['Tables']['publications']['Row'];
type PublicationInsert = Database['public']['Tables']['publications']['Insert'];
type PublicationUpdate = Database['public']['Tables']['publications']['Update'];

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Re-export all services from their dedicated modules
export { eventsService } from './eventsService';
export { locationsService } from './locationsService';
export { publicationsService } from './publicationsService';
export { profilesService } from './profilesService';
export { authService } from './authService';
export { SupabaseServiceError } from './serviceUtils';

// Re-export types
export type { Event, EventInsert, EventUpdate } from './eventsService';
export type { Location, LocationInsert, LocationUpdate } from './locationsService';
export type { Publication, PublicationInsert, PublicationUpdate } from './publicationsService';
export type { Profile, ProfileInsert, ProfileUpdate } from './profilesService';

// Export invitations service and types (keeping existing implementation)
export { invitationsService } from './invitations';
export type { Invitation, InvitationInsert, InvitationUpdate } from './invitations';

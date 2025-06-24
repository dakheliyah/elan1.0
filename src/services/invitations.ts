import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

// Type definitions
type Invitation = Database['public']['Tables']['invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];
type InvitationUpdate = Database['public']['Tables']['invitations']['Update'];

export class InvitationServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'InvitationServiceError';
  }
}

const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Invitation ${operation} error:`, error);
  throw new InvitationServiceError(
    error.message || `Failed to ${operation}`,
    error.code,
    error.details
  );
};

export const invitationsService = {
  // Get all invitations
  async getAll(): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch all invitations');
    }
  },

  // Get all invitations for an event
  async getByEventId(eventId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch invitations');
    }
  },

  // Create invitation and send email using Edge Function
  async create(invitation: InvitationInsert): Promise<Invitation> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const invitationData = {
        ...invitation,
        invited_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via Edge Function
      await invitationsService.sendInvitationEmail(data.email, data.id);

      return data;
    } catch (error) {
      handleSupabaseError(error, 'create invitation');
    }
  },

  // Send invitation email using Edge Function
  async sendInvitationEmail(email: string, invitationId: string): Promise<void> {
    try {
      console.log(`Sending invitation email to ${email} via Edge Function`);
      
      // Get current user info for personalization
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user?.id)
        .single();

      // Call the Edge Function to send the invitation
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          invitationId,
          inviterName: profile?.full_name || 'Team Member'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invitation');
      }
      
      console.log(`Invitation email sent successfully to ${email}`);
      
    } catch (error) {
      console.error('Error sending invitation email:', error);
      handleSupabaseError(error, 'send invitation email');
    }
  },

  // Get invitation by ID
  async getById(id: string): Promise<Invitation | null> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch invitation');
    }
  },

  // Accept invitation
  async accept(invitationId: string): Promise<Invitation> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'accept invitation');
    }
  },

  // Delete invitation
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete invitation');
    }
  },

  // Resend invitation
  async resend(id: string): Promise<void> {
    try {
      const invitation = await this.getById(id);
      if (!invitation) throw new Error('Invitation not found');

      await this.sendInvitationEmail(invitation.email, invitation.id);
    } catch (error) {
      handleSupabaseError(error, 'resend invitation');
    }
  },

  // Mark expired invitations
  async markExpired(): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'mark expired invitations');
    }
  }
};

export type { Invitation, InvitationInsert, InvitationUpdate };

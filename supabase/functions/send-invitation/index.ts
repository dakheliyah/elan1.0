
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  invitationId: string;
  eventName?: string;
  inviterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, invitationId, eventName, inviterName }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} for invitation ${invitationId}`);

    // Generate the invitation acceptance URL
    const inviteUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/invite/${invitationId}`;

    // Use Supabase Admin to invite user by email
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteUrl,
      data: {
        invitation_id: invitationId,
        event_name: eventName || 'Event',
        inviter_name: inviterName || 'Team',
        type: 'event_invitation'
      }
    });

    if (error) {
      console.error('Error inviting user:', error);
      throw error;
    }

    console.log(`Successfully sent invitation to ${email}:`, data);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
        data
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send invitation'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);

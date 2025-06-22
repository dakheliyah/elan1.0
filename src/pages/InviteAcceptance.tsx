
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInvitation, useAcceptInvitation } from '@/hooks/useSupabaseQuery';
import { Crown, Shield, User, CheckCircle, AlertCircle } from 'lucide-react';

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800', icon: Crown },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-800', icon: Shield },
  viewer: { label: 'Viewer', color: 'bg-green-100 text-green-800', icon: User },
} as const;

const InviteAcceptance: React.FC = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  
  const { data: invitation, isLoading } = useInvitation(invitationId || '');
  const acceptInvitationMutation = useAcceptInvitation();

  // Handle auth state changes for invited users
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user && !authComplete) {
          setAuthComplete(true);
          
          // Check if this sign-in is from an invitation
          const invitationType = session.user.user_metadata?.type;
          if (invitationType === 'event_invitation' && invitationId) {
            await handleAcceptInvitation();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [invitationId, authComplete]);

  const handleAcceptInvitation = async () => {
    if (!invitationId || !invitation) return;

    setIsProcessing(true);
    try {
      await acceptInvitationMutation.mutateAsync(invitationId);
      
      toast({
        title: "Invitation Accepted!",
        description: `Welcome to the event! You now have ${roleConfig[invitation.role].label} access.`,
      });

      // Redirect to the event
      navigate(`/events/${invitation.event_id}`);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAccept = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to accept this invitation.",
        variant: "destructive"
      });
      return;
    }

    await handleAcceptInvitation();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Not Found</h2>
            <p className="text-gray-600 mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const RoleIcon = roleConfig[invitation.role].icon;
  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.status === 'accepted';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Event Invitation</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">You've been invited to join with</p>
            <Badge className={`${roleConfig[invitation.role].color} text-lg px-4 py-2`}>
              <RoleIcon size={16} className="mr-2" />
              {roleConfig[invitation.role].label} Access
            </Badge>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invited to:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isAccepted ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                This invitation has already been accepted!
              </p>
              <Button onClick={() => navigate(`/events/${invitation.event_id}`)}>
                Go to Event
              </Button>
            </div>
          ) : isExpired ? (
            <div className="text-center">
              <p className="text-red-600 font-medium mb-4">
                This invitation has expired.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handleManualAccept}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By accepting, you agree to join this event with the specified role and permissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptance;

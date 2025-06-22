
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  MoreVertical, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Crown, 
  Shield, 
  User,
  Send,
  Trash2
} from 'lucide-react';
import { useDeleteInvitation, useResendInvitation } from '@/hooks/useSupabaseQuery';
import type { Invitation } from '@/services/invitations';

interface PendingInvitationsProps {
  invitations: Invitation[];
  eventId?: string;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800',
    icon: Crown,
  },
  editor: {
    label: 'Editor',
    color: 'bg-blue-100 text-blue-800',
    icon: Shield,
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-green-100 text-green-800',
    icon: User,
  }
} as const;

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ 
  invitations, 
  eventId 
}) => {
  const { toast } = useToast();
  const deleteInvitationMutation = useDeleteInvitation();
  const resendInvitationMutation = useResendInvitation();

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      await resendInvitationMutation.mutateAsync(invitationId);
      toast({
        title: "Invitation Resent",
        description: `Invitation has been resent to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInvitation = async (invitationId: string, email: string) => {
    try {
      await deleteInvitationMutation.mutateAsync(invitationId);
      toast({
        title: "Invitation Cancelled",
        description: `Invitation to ${email} has been cancelled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    const isExpired = new Date(invitation.expires_at) < new Date();
    
    if (invitation.status === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Accepted
        </Badge>
      );
    }
    
    if (invitation.status === 'expired' || isExpired) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle size={12} className="mr-1" />
          Expired
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock size={12} className="mr-1" />
        Pending
      </Badge>
    );
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail size={18} />
          Pending Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => {
            const RoleIcon = roleConfig[invitation.role].icon;
            const isExpired = new Date(invitation.expires_at) < new Date();
            
            return (
              <div 
                key={invitation.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Mail size={14} className="text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {invitation.email}
                      </p>
                      <Badge className={roleConfig[invitation.role].color}>
                        <RoleIcon size={12} className="mr-1" />
                        {roleConfig[invitation.role].label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(invitation)}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                        disabled={invitation.status === 'accepted' || resendInvitationMutation.isPending}
                      >
                        <Send size={14} className="mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                        disabled={deleteInvitationMutation.isPending}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitations;

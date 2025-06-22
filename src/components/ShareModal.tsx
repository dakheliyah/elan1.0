
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, Plus } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Array<{ id: string; name: string }>;
}

interface InvitationData {
  email: string;
  role: string;
  locationIds: string[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, locations }) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<InvitationData[]>([
    { email: '', role: '', locationIds: [] }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
    { value: 'chief_editor', label: 'Chief Editor', color: 'bg-blue-100 text-blue-800' },
    { value: 'editor', label: 'Editor', color: 'bg-green-100 text-green-800' }
  ];

  const addInvitation = () => {
    setInvitations([...invitations, { email: '', role: '', locationIds: [] }]);
  };

  const updateInvitation = (index: number, field: keyof InvitationData, value: any) => {
    const updated = [...invitations];
    updated[index] = { ...updated[index], [field]: value };
    setInvitations(updated);
  };

  const removeInvitation = (index: number) => {
    if (invitations.length > 1) {
      setInvitations(invitations.filter((_, i) => i !== index));
    }
  };

  const toggleLocation = (invitationIndex: number, locationId: string) => {
    const invitation = invitations[invitationIndex];
    const locationIds = invitation.locationIds.includes(locationId)
      ? invitation.locationIds.filter(id => id !== locationId)
      : [...invitation.locationIds, locationId];
    
    updateInvitation(invitationIndex, 'locationIds', locationIds);
  };

  const handleSendInvitations = async () => {
    const validInvitations = invitations.filter(inv => inv.email && inv.role);
    
    if (validInvitations.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide at least one valid email and role.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${validInvitations.length} invitation(s).`,
      });
      
      onClose();
      setInvitations([{ email: '', role: '', locationIds: [] }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={20} />
            Invite Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {invitations.map((invitation, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">
                  Invitation {index + 1}
                </h4>
                {invitations.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvitation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`email-${index}`}>Email Address</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="user@example.com"
                    value={invitation.email}
                    onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`role-${index}`}>Role</Label>
                  <Select
                    value={invitation.role}
                    onValueChange={(value) => updateInvitation(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs ${role.color}`}>
                              {role.label}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Location Access</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${index}-${location.id}`}
                        checked={invitation.locationIds.includes(location.id)}
                        onCheckedChange={() => toggleLocation(index, location.id)}
                      />
                      <Label
                        htmlFor={`location-${index}-${location.id}`}
                        className="text-sm font-normal"
                      >
                        {location.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select locations this user can access
                </p>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addInvitation}
            className="w-full flex items-center gap-2"
          >
            <Plus size={16} />
            Add Another Invitation
          </Button>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitations} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

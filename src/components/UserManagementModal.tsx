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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, Plus, Search, Filter, Download, Crown, Shield, User } from 'lucide-react';
import MembersList from '@/components/user-management/MembersList';
import BulkActionsBar from '@/components/user-management/BulkActionsBar';
import { useProfiles, useCurrentProfile, useUpdateUserRole } from '@/hooks/useSupabaseQuery';
import PendingInvitations from '@/components/user-management/PendingInvitations';
import { useInvitations, useCreateInvitation } from '@/hooks/useSupabaseQuery';
import { useParams } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  locations: string[];
  avatar?: string;
  joinedDate: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Array<{ id: string; name: string }>;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  locations 
}) => {
  const { toast } = useToast();
  const { eventId } = useParams<{ eventId: string }>();
  
  // Fetch real user data from Supabase
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { data: currentProfile } = useCurrentProfile();
  const { data: invitations = [], isLoading: invitationsLoading } = useInvitations(eventId || '');
  const updateUserRoleMutation = useUpdateUserRole();
  const createInvitationMutation = useCreateInvitation();
  
  // Transform profiles to match User interface
  const users: User[] = profiles.map(profile => ({
    id: profile.id,
    name: profile.full_name || 'Unknown',
    email: profile.email,
    role: profile.role || 'viewer',
    locations: [], // TODO: Implement location access if needed
    joinedDate: profile.created_at || new Date().toISOString()
  }));

  const currentUser = currentProfile ? {
    id: currentProfile.id,
    role: currentProfile.role || 'viewer'
  } : null;
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New invitation state
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteLocations, setInviteLocations] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);

  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filters and search state
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    sortBy: 'name'
  });

  const roleConfig = {
    admin: {
      label: 'Admin',
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      icon: Crown,
      description: 'Full access to all features and settings'
    },
    editor: {
      label: 'Editor',
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      icon: Shield,
      description: 'Can manage content and locations'
    },
    viewer: {
      label: 'Viewer',
      color: 'bg-green-100 text-green-800 hover:bg-green-100',
      icon: User,
      description: 'Can view content only'
    }
  } as const;

  const validateEmails = (emailString: string): { valid: string[], invalid: string[] } => {
    const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const valid = emails.filter(email => emailRegex.test(email));
    const invalid = emails.filter(email => !emailRegex.test(email));
    
    return { valid, invalid };
  };

  const handleEmailChange = (value: string) => {
    setInviteEmails(value);
    
    if (value.trim()) {
      const { invalid } = validateEmails(value);
      setEmailErrors(invalid);
    } else {
      setEmailErrors([]);
    }
  };

  const toggleInviteLocation = (locationId: string) => {
    setInviteLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSendInvites = async () => {
    if (!eventId) return;
    
    const { valid, invalid } = validateEmails(inviteEmails);
    
    if (valid.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide at least one valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (invalid.length > 0) {
      toast({
        title: "Invalid Emails",
        description: `Please fix these invalid emails: ${invalid.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    if (!inviteRole) {
      toast({
        title: "Validation Error",
        description: "Please select a role for the invitation.",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    
    try {
      const results = await Promise.allSettled(
        valid.map(email =>
          createInvitationMutation.mutateAsync({
            email,
            role: inviteRole as 'admin' | 'editor' | 'viewer',
            event_id: eventId,
          })
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected');
      
      if (successful > 0) {
        toast({
          title: "Invitations Sent",
          description: `Successfully sent ${successful} invitation(s).`,
        });
      }
      
      if (failed.length > 0) {
        const duplicateErrors = failed.filter(result => 
          result.status === 'rejected' && 
          result.reason?.code === '23505'
        );
        
        if (duplicateErrors.length > 0) {
          toast({
            title: "Some Invitations Already Exist",
            description: `${duplicateErrors.length} email(s) already have pending invitations for this event.`,
            variant: "destructive"
          });
        }
        
        const otherErrors = failed.length - duplicateErrors.length;
        if (otherErrors > 0) {
          toast({
            title: "Some Invitations Failed",
            description: `${otherErrors} invitation(s) failed to send. Please try again.`,
            variant: "destructive"
          });
        }
      }
      
      // Reset form only if at least one invitation was successful
      if (successful > 0) {
        setInviteEmails('');
        setInviteRole('');
        setInviteLocations([]);
        setEmailErrors([]);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getLocationNames = (locationIds: string[]) => {
    return locationIds
      .map(id => locations.find(loc => loc.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      if (updates.role) {
        await updateUserRoleMutation.mutateAsync({
          userId,
          role: updates.role
        });
        
        toast({
          title: "Role Updated",
          description: `User role has been updated to ${roleConfig[updates.role].label}.`,
        });
      } else {
        // TODO: Implement other user updates if needed
        toast({
          title: "Update Not Implemented",
          description: "Non-role updates are not yet implemented.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    // TODO: Implement user deletion (careful with this!)
    toast({
      title: "Feature Not Available",
      description: "User deletion is not implemented for safety reasons.",
    });
    setUserToDelete(null);
  };

  const handleSelectAll = () => {
    if (!currentUser) return;
    
    const selectableUsers = users.filter(user => user.id !== currentUser.id);
    if (selectedUsers.length === selectableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers.map(user => user.id));
    }
  };

  const handleBulkRoleChange = async (newRole: string) => {
    try {
      // Update roles for all selected users
      await Promise.all(
        selectedUsers.map(userId =>
          updateUserRoleMutation.mutateAsync({
            userId,
            role: newRole as 'admin' | 'editor' | 'viewer'
          })
        )
      );
      
      toast({
        title: "Roles Updated",
        description: `Updated role for ${selectedUsers.length} user(s) to ${roleConfig[newRole as keyof typeof roleConfig].label}.`,
      });
      
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update roles. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkLocationUpdate = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Bulk location update will be implemented soon.",
    });
  };

  const handleBulkRemove = async () => {
    toast({
      title: "Feature Not Available",
      description: "Bulk user removal is not implemented for safety reasons.",
    });
  };

  const handleExportMembers = () => {
    const csvContent = users.map(user => 
      `${user.name},${user.email},${roleConfig[user.role].label},${getLocationNames(user.locations)},${user.joinedDate}`
    ).join('\n');
    
    const blob = new Blob([`Name,Email,Role,Locations,Joined Date\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Member list has been exported to CSV.",
    });
  };

  const handleClearFilters = () => {
    setFilters({ role: 'all', search: '', sortBy: 'name' });
  };

  if (profilesLoading || invitationsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Team Management...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="text-center p-8">
            <p className="text-gray-600">You need to be logged in to access user management.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} />
                Team Management ({users.length} members)
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMembers}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Invite New Members Section */}
            <div className="border rounded-lg p-6 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={18} />
                <h3 className="text-lg font-semibold">Invite New Members</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-emails">Email Addresses</Label>
                  <Input
                    id="invite-emails"
                    placeholder="Enter email addresses, separated by commas"
                    value={inviteEmails}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={emailErrors.length > 0 ? "border-red-300" : ""}
                  />
                  {emailErrors.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Invalid emails: {emailErrors.join(', ')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([roleKey, role]) => {
                          const RoleIcon = role.icon;
                          return (
                            <SelectItem key={roleKey} value={roleKey}>
                              <div className="flex items-center gap-2">
                                <Badge className={role.color}>
                                  <RoleIcon size={12} className="mr-1" />
                                  {role.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location Access</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-white">
                      {locations.map((location) => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`invite-location-${location.id}`}
                            checked={inviteLocations.includes(location.id)}
                            onCheckedChange={() => toggleInviteLocation(location.id)}
                          />
                          <Label
                            htmlFor={`invite-location-${location.id}`}
                            className="text-sm font-normal"
                          >
                            {location.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSendInvites}
                    disabled={isInviting}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {isInviting ? 'Sending...' : 'Send Invitations'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <PendingInvitations 
                invitations={invitations} 
                eventId={eventId || ''} 
              />
            )}

            {/* Filters and Search Section */}
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Members</Label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Name or email..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role-filter">Filter by Role</Label>
                  <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {Object.entries(roleConfig).map(([roleKey, role]) => (
                        <SelectItem key={roleKey} value={roleKey}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort-by">Sort by</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="joinedDate">Join Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Members Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Members</h3>
              <MembersList
                users={users}
                locations={locations}
                currentUser={currentUser}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
                onSelectAll={handleSelectAll}
                onUserUpdate={handleUserUpdate}
                onUserDelete={setUserToDelete}
                filters={filters}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedUsers.length}
        onClearSelection={() => setSelectedUsers([])}
        onBulkRoleChange={handleBulkRoleChange}
        onBulkLocationUpdate={handleBulkLocationUpdate}
        onBulkRemove={handleBulkRemove}
      />

      {/* Enhanced Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Are you sure you want to remove <strong>{userToDelete?.name}</strong> from this event?
                </p>
                
                {userToDelete && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={roleConfig[userToDelete.role].color}>
                        {React.createElement(roleConfig[userToDelete.role].icon, { size: 12, className: "mr-1" })}
                        {roleConfig[userToDelete.role].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{userToDelete.email}</p>
                    <p className="text-sm text-gray-600">
                      Current access: {getLocationNames(userToDelete.locations) || 'No locations'}
                    </p>
                  </div>
                )}
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">This action will:</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    <li>• Remove their access to all locations and content</li>
                    <li>• Revoke their permission to edit or create content</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserManagementModal;

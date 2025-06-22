import React, { useState } from 'react';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useUserProfiles, useDeleteUser, useBulkDeleteUsers } from '@/hooks/useProfiles';
import { useAllInvitations, useCreateInvitation } from '@/hooks/useInvitations';
import { useAllLocations } from '@/hooks/useLocations';
import MembersList from '@/components/user-management/MembersList';
import PendingInvitations from '@/components/user-management/PendingInvitations';
import { Users, Plus, Trash2, Mail } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  locations: string[];
  avatar?: string;
  joinedDate: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userProfiles = [], isLoading: isLoadingUsers } = useUserProfiles();
  const { data: invitations = [], isLoading: isLoadingInvitations } = useAllInvitations();
  const { data: locations = [] } = useAllLocations();
  const deleteUserMutation = useDeleteUser();
  const createInvitationMutation = useCreateInvitation();
  const bulkDeleteMutation = useBulkDeleteUsers();

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvitation = async () => {
    if (!newInviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await createInvitationMutation.mutateAsync({
        email: newInviteEmail,
        role: newInviteRole,
      });
      setNewInviteEmail('');
      setNewInviteRole('viewer');
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync(selectedUsers);
      setSelectedUsers([]);
      toast({
        title: "Success",
        description: `${selectedUsers.length} users deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users",
        variant: "destructive",
      });
    }
  };

  // Transform profiles to User format
  const transformedUsers: User[] = userProfiles.map(profile => ({
    id: profile.id,
    name: profile.full_name || profile.email,
    email: profile.email,
    role: profile.role as 'admin' | 'editor' | 'viewer',
    locations: [], // TODO: Add location mapping if needed
    joinedDate: profile.created_at
  }));

  const filteredUsers = transformedUsers.filter((user: User) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    // TODO: Implement user update logic
    console.log('Update user:', userId, updates);
  };

  const handleUserDelete = async (user: User) => {
    await handleDeleteUser(user.id);
  };

  

  if (isLoadingUsers || isLoadingInvitations) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>

            {/* Invite New User Section */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite New User
              </h2>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newInviteRole} onValueChange={(value) => setNewInviteRole(value as 'admin' | 'editor' | 'viewer')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateInvitation}
                  disabled={createInvitationMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Send Invite
                </Button>
              </div>
            </div>

            {/* Pending Invitations */}
            <div className="mb-6">
              <PendingInvitations 
                invitations={invitations}
              />
            </div>

            {/* User Management Section */}
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Current Users</h2>
                  {selectedUsers.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedUsers.length})
                    </Button>
                  )}
                </div>
                
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <MembersList 
                users={filteredUsers}
                locations={locations.map(loc => ({ id: loc.id, name: loc.name }))}
                currentUser={{ id: 'current-user', role: 'admin' }} // TODO: Get from auth context
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
                onSelectAll={handleSelectAll}
                onUserUpdate={handleUserUpdate}
                onUserDelete={handleUserDelete}
                filters={{
                  role: roleFilter,
                  search: searchTerm,
                  sortBy: 'name'
                }}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UserManagement;
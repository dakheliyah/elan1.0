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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserPlus,
  Trash2,
  Edit,
  Search,
  Users,
  BarChart3,
  Calendar,
  Loader2,
  Shield,
  Eye,
  Pencil,
  Crown
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useLocationAccess,
  useGrantLocationAccess,
  useUpdateLocationAccess,
  useRevokeLocationAccess,
  useLocationAccessStats,
  useProfiles
} from '@/hooks/useSupabaseQuery';
import type { Database } from '../types/database.types';

type LocationAccessLevel = Database['public']['Enums']['location_access_level'];
type UserLocationAccess = Database['public']['Tables']['user_location_access']['Row'];

interface LocationAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
}

const LocationAccessModal: React.FC<LocationAccessModalProps> = ({
  isOpen,
  onClose,
  locationId,
  locationName,
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<LocationAccessLevel>('read');
  const [expiresAt, setExpiresAt] = useState('');
  const [editingAccess, setEditingAccess] = useState<UserLocationAccess | null>(null);
  const [userToRevoke, setUserToRevoke] = useState<UserLocationAccess | null>(null);
  const [isGranting, setIsGranting] = useState(false);

  // Hooks
  const { data: locationAccess = [], isLoading: accessLoading, refetch: refetchAccess } = useLocationAccess(locationId);
  const { data: accessStats, isLoading: statsLoading } = useLocationAccessStats(locationId);
  const { data: allProfiles = [] } = useProfiles();
  const grantAccessMutation = useGrantLocationAccess();
  const updateAccessMutation = useUpdateLocationAccess();
  const revokeAccessMutation = useRevokeLocationAccess();

  const getAccessLevelIcon = (level: LocationAccessLevel) => {
    switch (level) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'write':
        return <Pencil className="h-4 w-4" />;
      case 'admin':
        return <Crown className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getAccessLevelColor = (level: LocationAccessLevel) => {
    switch (level) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'write':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGrantAccess = async () => {
    if (!searchEmail.trim()) return;

    setIsGranting(true);
    try {
      // Find user by email
      const user = allProfiles.find(p => p.email?.toLowerCase() === searchEmail.toLowerCase());
      if (!user) {
        alert('User not found with that email address.');
        return;
      }

      await grantAccessMutation.mutateAsync({
        userId: user.id,
        locationId,
        accessLevel: selectedAccessLevel,
        expiresAt: expiresAt || undefined,
      });

      // Reset form
      setSearchEmail('');
      setSelectedAccessLevel('read');
      setExpiresAt('');
      refetchAccess();
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access. Please try again.');
    } finally {
      setIsGranting(false);
    }
  };

  const handleUpdateAccess = async () => {
    if (!editingAccess) return;

    try {
      await updateAccessMutation.mutateAsync({
        userId: editingAccess.user_id,
        locationId,
        accessLevel: selectedAccessLevel,
        expiresAt: expiresAt || undefined,
      });

      setEditingAccess(null);
      setSelectedAccessLevel('read');
      setExpiresAt('');
      refetchAccess();
    } catch (error) {
      console.error('Error updating access:', error);
      alert('Failed to update access. Please try again.');
    }
  };

  const handleRevokeAccess = async () => {
    if (!userToRevoke) return;

    try {
      await revokeAccessMutation.mutateAsync({
        userId: userToRevoke.user_id,
        locationId,
      });

      setUserToRevoke(null);
      refetchAccess();
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    }
  };

  const startEditAccess = (access: UserLocationAccess) => {
    setEditingAccess(access);
    setSelectedAccessLevel(access.access_level);
    setExpiresAt(access.expires_at || '');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Access - {locationName}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="grant">Grant Access</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Access</h3>
                  <Badge variant="outline">
                    {locationAccess.length} user{locationAccess.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {accessLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Granted By</TableHead>
                        <TableHead>Granted At</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationAccess.map((access: any) => (
                        <TableRow key={access.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={access.user?.avatar_url} />
                                <AvatarFallback>
                                  {access.user?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{access.user?.full_name}</div>
                                <div className="text-sm text-gray-500">{access.user?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAccessLevelColor(access.access_level)}>
                              <div className="flex items-center gap-1">
                                {getAccessLevelIcon(access.access_level)}
                                {access.access_level}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {access.granted_by_profile?.full_name || 'System'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(access.granted_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {access.expires_at 
                                ? format(new Date(access.expires_at), 'MMM d, yyyy')
                                : 'Never'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditAccess(access)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUserToRevoke(access)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="grant" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Grant New Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">User Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access-level">Access Level</Label>
                      <Select value={selectedAccessLevel} onValueChange={(value: LocationAccessLevel) => setSelectedAccessLevel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Read - View only
                            </div>
                          </SelectItem>
                          <SelectItem value="write">
                            <div className="flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Write - Edit content
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Admin - Full control
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Expires At (Optional)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleGrantAccess} 
                    disabled={!searchEmail.trim() || isGranting}
                    className="w-full"
                  >
                    {isGranting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Granting Access...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Grant Access
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accessStats?.total || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Read Access</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accessStats?.byLevel.read || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Write Access</CardTitle>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accessStats?.byLevel.write || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Admin Access</CardTitle>
                      <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accessStats?.byLevel.admin || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Access Dialog */}
      <Dialog open={!!editingAccess} onOpenChange={() => setEditingAccess(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Access Level</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-access-level">Access Level</Label>
              <Select value={selectedAccessLevel} onValueChange={(value: LocationAccessLevel) => setSelectedAccessLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read - View only</SelectItem>
                  <SelectItem value="write">Write - Edit content</SelectItem>
                  <SelectItem value="admin">Admin - Full control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expires">Expires At (Optional)</Label>
              <Input
                id="edit-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingAccess(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccess}>
                Update Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Access Confirmation */}
      <AlertDialog open={!!userToRevoke} onOpenChange={() => setUserToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access for {(userToRevoke as any)?.user?.full_name}? 
              They will no longer be able to access this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAccess}>
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LocationAccessModal;
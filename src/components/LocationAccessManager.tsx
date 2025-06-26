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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Loader2,
  Eye,
  Pencil,
  Crown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useUserLocationAccess,
  useAccessibleLocations,
  useBulkGrantLocationAccess,
  useProfiles,
} from '@/hooks/useSupabaseQuery';
import { useAllLocations } from '@/hooks/useLocations';
import { useCurrentProfile } from '@/hooks/useProfiles';
import type { Database } from '../types/database.types';

type LocationAccessLevel = Database['public']['Enums']['location_access_level'];

interface LocationAccessManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkAccessGrant {
  userId: string;
  locationId: string;
  accessLevel: LocationAccessLevel;
  expiresAt?: string;
}

const LocationAccessManager: React.FC<LocationAccessManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: currentProfile } = useCurrentProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [bulkAccessLevel, setBulkAccessLevel] = useState<LocationAccessLevel>('read');
  const [bulkExpiresAt, setBulkExpiresAt] = useState('');
  const [isProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ success: number; failed: number } | null>(null);

  // Hooks
  const { data: userAccess = [], isLoading: userAccessLoading } = useUserLocationAccess(currentProfile?.id || '');
  const { data: accessibleLocations = [], isLoading: locationsLoading } = useAccessibleLocations('admin');
  const { data: allLocations = [] } = useAllLocations();
  const { data: allProfiles = [] } = useProfiles();
  const bulkGrantMutation = useBulkGrantLocationAccess();

  const getAccessLevelIcon = (level: LocationAccessLevel) => {
    switch (level) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'write':
        return <Pencil className="h-4 w-4" />;
      case 'admin':
        return <Crown className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
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

  const filteredProfiles = allProfiles.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = allLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleLocationSelection = (locationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations(prev => [...prev, locationId]);
    } else {
      setSelectedLocations(prev => prev.filter(id => id !== locationId));
    }
  };

  const handleBulkGrant = async () => {
    if (selectedUsers.length === 0 || selectedLocations.length === 0) {
      return;
    }

    setBulkProcessing(true);
    setBulkResults(null);

    try {
      let successCount = 0;
      let failedCount = 0;
      
      // Process each location separately since the hook expects userIds array for a single locationId
      for (const locationId of selectedLocations) {
        try {
          await bulkGrantMutation.mutateAsync({
            userIds: selectedUsers,
            locationId,
            accessLevel: bulkAccessLevel,
            expiresAt: bulkExpiresAt || undefined,
          });
          successCount += selectedUsers.length;
        } catch (error) {
          console.error(`Error granting access for location ${locationId}:`, error);
          failedCount += selectedUsers.length;
        }
      }
      
      setBulkResults({
        success: successCount,
        failed: failedCount,
      });

      // Reset selections
      setSelectedUsers([]);
      setSelectedLocations([]);
      setBulkAccessLevel('read');
      setBulkExpiresAt('');
    } catch (error) {
      console.error('Error in bulk grant:', error);
      setBulkResults({
        success: 0,
        failed: selectedUsers.length * selectedLocations.length,
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const exportUserAccess = () => {
    const csvContent = [
      ['User Name', 'User Email', 'Location', 'Access Level', 'Granted At', 'Expires At'].join(','),
      ...userAccess.map((access: any) => [
        access.location?.name || '',
        access.user?.email || '',
        access.location?.name || '',
        access.access_level,
        format(new Date(access.granted_at), 'yyyy-MM-dd'),
        access.expires_at ? format(new Date(access.expires_at), 'yyyy-MM-dd') : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-access-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Location Access Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bulk-grant">Bulk Grant</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Access Records</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userAccess.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accessible Locations</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accessibleLocations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allProfiles.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Access Records</h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search access records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {userAccessLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Granted At</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAccess
                      .filter((access: any) => 
                        access.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((access: any) => {
                        const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
                        return (
                          <TableRow key={`${access.user_id}-${access.location_id}`}>
                            <TableCell>
                              <div className="font-medium">{access.location?.name}</div>
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
                              <Badge variant={isExpired ? 'destructive' : 'default'}>
                                {isExpired ? (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Expired
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bulk-grant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Bulk Grant Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bulkResults && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-2">Bulk Grant Results</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {bulkResults.success} successful
                      </div>
                      {bulkResults.failed > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {bulkResults.failed} failed
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Select Users</h4>
                      <Badge variant="outline">
                        {selectedUsers.length} selected
                      </Badge>
                    </div>
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {filteredProfiles.map((profile) => (
                        <div key={profile.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                          <Checkbox
                            checked={selectedUsers.includes(profile.id)}
                            onCheckedChange={(checked) => handleUserSelection(profile.id, checked as boolean)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {profile.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{profile.full_name}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Select Locations</h4>
                      <Badge variant="outline">
                        {selectedLocations.length} selected
                      </Badge>
                    </div>
                    <Input
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {filteredLocations.map((location) => (
                        <div key={location.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                          <Checkbox
                            checked={selectedLocations.includes(location.id)}
                            onCheckedChange={(checked) => handleLocationSelection(location.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-500">
                              {(location as any).publication_count || 0} publications
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-access-level">Access Level</Label>
                    <Select value={bulkAccessLevel} onValueChange={(value: LocationAccessLevel) => setBulkAccessLevel(value)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="bulk-expires">Expires At (Optional)</Label>
                    <Input
                      id="bulk-expires"
                      type="datetime-local"
                      value={bulkExpiresAt}
                      onChange={(e) => setBulkExpiresAt(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBulkGrant}
                  disabled={selectedUsers.length === 0 || selectedLocations.length === 0 || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing {selectedUsers.length * selectedLocations.length} grants...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Grant Access to {selectedUsers.length} users × {selectedLocations.length} locations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Access Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export location access data for reporting and analysis.
                </p>
                <Button onClick={exportUserAccess} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LocationAccessManager;
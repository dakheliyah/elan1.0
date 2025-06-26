import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  Archive,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  usePublicationLocations,
  useUpdateLocationContent,
  useUpdateLocationStatus
} from '@/hooks/usePublications';
import type { PublicationLocationWithLocation } from '@/services/publicationsService';

interface PublicationLocationManagerProps {
  publicationId: string;
  publicationTitle: string;
}

export const PublicationLocationManager: React.FC<PublicationLocationManagerProps> = ({
  publicationId,
  publicationTitle
}) => {
  const { toast } = useToast();
  
  // State management
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PublicationLocationWithLocation | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // Data fetching
  const { data: publicationLocations = [], isLoading } = usePublicationLocations(publicationId);
  
  // Mutations
  const updateContentMutation = useUpdateLocationContent();
  const updateStatusMutation = useUpdateLocationStatus();

  const handleEditContent = (location: PublicationLocationWithLocation) => {
    setEditingLocationId(location.id);
    setEditContent(location.content || '');
  };

  const handleSaveContent = async (locationId: string) => {
    try {
      await updateContentMutation.mutateAsync({
        publicationId,
        locationId,
        content: editContent
      });
      
      toast({
        title: "Content Updated",
        description: "Location-specific content has been saved."
      });
      
      setEditingLocationId(null);
      setEditContent('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLocationId(null);
    setEditContent('');
  };

  const handleStatusChange = (location: PublicationLocationWithLocation) => {
    setSelectedLocation(location);
    setNewStatus(location.status);
    setShowStatusDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLocation) return;

    try {
      await updateStatusMutation.mutateAsync({
        publicationId,
        locationId: selectedLocation.id,
        status: newStatus as 'draft' | 'mark_as_ready' | 'archived'
      });
      
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus} for ${selectedLocation.locations.name}.`
      });
      
      setShowStatusDialog(false);
      setSelectedLocation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mark_as_ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mark_as_ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Location Management</h3>
        <p className="text-muted-foreground">
          Manage content and status for each location in "{publicationTitle}"
        </p>
      </div>

      {/* Location Cards */}
      <div className="grid gap-4">
        {publicationLocations.map((pubLocation) => (
          <Card key={pubLocation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {pubLocation.locations?.name || 'Unknown Location'}
                    {pubLocation.locations?.is_host && (
                    <Badge variant="secondary">Host</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(pubLocation.status)}>
                    {getStatusIcon(pubLocation.status)}
                    {pubLocation.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(pubLocation)}
                  >
                    Change Status
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Location-Specific Content</Label>
                  {editingLocationId === pubLocation.id ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Enter location-specific content or notes..."
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveContent(pubLocation.id)}
                          disabled={updateContentMutation.isPending}
                        >
                          {updateContentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="min-h-[100px] p-3 border rounded-md bg-gray-50">
                        {pubLocation.content ? (
                          <p className="whitespace-pre-wrap">{pubLocation.content}</p>
                        ) : (
                          <p className="text-gray-500 italic">No location-specific content</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleEditContent(pubLocation)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Last updated: {new Date(pubLocation.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {publicationLocations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No locations found for this publication</p>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update the publication status for {selectedLocation?.locations.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="mark_as_ready">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Ready
                    </div>
                  </SelectItem>
                  <SelectItem value="archived">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archived
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
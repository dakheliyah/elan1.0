
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoUpload } from "./LogoUpload";
import { Umoor } from "@/services/umoors";
import { useUpdateUmoor } from "@/hooks/useUmoors";
import { Loader2 } from "lucide-react";

interface UmoorEditDialogProps {
  umoor: Umoor;
  isOpen: boolean;
  onClose: () => void;
}

export const UmoorEditDialog: React.FC<UmoorEditDialogProps> = ({
  umoor,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: umoor.name,
    description: umoor.description || '',
    logo_url: umoor.logo_url || '',
  });

  const updateUmoor = useUpdateUmoor();

  useEffect(() => {
    setFormData({
      name: umoor.name,
      description: umoor.description || '',
      logo_url: umoor.logo_url || '',
    });
  }, [umoor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (logoUrl: string) => {
    setFormData(prev => ({ ...prev, logo_url: logoUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await updateUmoor.mutateAsync({
        id: umoor.id,
        updates: {
          name: formData.name,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
        }
      });
      onClose();
    } catch (error) {
      console.error('Error updating umoor:', error);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Umoor</DialogTitle>
          <DialogDescription>
            Update the details of your umoor department.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter umoor name"
              required
            />
            <p className="text-sm text-muted-foreground">
              The name is how it appears in publications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slug">Slug</Label>
            <Input
              id="edit-slug"
              value={generateSlug(formData.name)}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-muted-foreground">
              Auto-generated URL-friendly version
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the department"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <LogoUpload
              currentLogo={formData.logo_url}
              onLogoUpload={handleLogoUpload}
              umoorId={umoor.id}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateUmoor.isPending}
            >
              {updateUmoor.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Umoor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

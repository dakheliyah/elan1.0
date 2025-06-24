
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Star } from 'lucide-react';
import { LocationLogoUpload } from '@/components/location/LocationLogoUpload';

export interface LocationFormData {
  name: string;
  timezone: string;
  description?: string;
  is_host?: boolean;
  logo_url?: string;
}

interface NewLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (locationData: LocationFormData) => Promise<void>;
}

const COMMON_TIMEZONES = [
  { value: 'GMT+0', label: 'GMT+0 (London)' },
  { value: 'GMT+1', label: 'GMT+1 (Paris, Berlin)' },
  { value: 'GMT+2', label: 'GMT+2 (Cairo, Athens)' },
  { value: 'GMT+3', label: 'GMT+3 (Moscow, Istanbul)' },
  { value: 'GMT+4', label: 'GMT+4 (Dubai)' },
  { value: 'GMT+5', label: 'GMT+5 (Karachi)' },
  { value: 'GMT+5:30', label: 'GMT+5:30 (India, Sri Lanka)' },
  { value: 'GMT+6', label: 'GMT+6 (Dhaka)' },
  { value: 'GMT+7', label: 'GMT+7 (Bangkok, Jakarta)' },
  { value: 'GMT+8', label: 'GMT+8 (Singapore, Beijing)' },
  { value: 'GMT+9', label: 'GMT+9 (Tokyo, Seoul)' },
  { value: 'GMT+10', label: 'GMT+10 (Sydney)' },
  { value: 'GMT+12', label: 'GMT+12 (Auckland)' },
  { value: 'GMT-5', label: 'GMT-5 (New York)' },
  { value: 'GMT-6', label: 'GMT-6 (Chicago)' },
  { value: 'GMT-7', label: 'GMT-7 (Denver)' },
  { value: 'GMT-8', label: 'GMT-8 (Los Angeles)' },
];

const NewLocationModal: React.FC<NewLocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    timezone: '',
    description: '',
    is_host: false,
    logo_url: '',
  });

  const handleLogoUpload = (logoUrl: string) => {
    setFormData(prev => ({ ...prev, logo_url: logoUrl }));
  };
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', timezone: '', description: '', is_host: false });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof LocationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter location name"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone *</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-sm text-red-500">{errors.timezone}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Location Logo (Optional)</Label>
            <LocationLogoUpload
              currentLogo={formData.logo_url}
              onLogoUpload={handleLogoUpload}
              locationId="temp"
            />
          </div>

          {/* Host Location Toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_host"
                checked={formData.is_host}
                onCheckedChange={(checked) => handleInputChange('is_host', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="is_host" className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500" />
                Make this the host location
              </Label>
            </div>
            <p className="text-xs text-gray-500">
              Only one location can be designated as the host location per event. 
              Setting this as host will remove the host status from any other location.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter location description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0}/200 characters
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Location'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLocationModal;

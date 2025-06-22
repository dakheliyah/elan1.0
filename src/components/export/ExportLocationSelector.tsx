
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2 } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';

interface Location {
  id: string;
  name: string;
  is_host: boolean;
}

interface ExportLocationSelectorProps {
  eventId: string;
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
  hostLocation?: Location;
}

export const ExportLocationSelector: React.FC<ExportLocationSelectorProps> = ({
  eventId,
  selectedLocationId,
  onLocationSelect,
}) => {
  const { data: locations, isLoading } = useLocations(eventId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No locations found for this event</p>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <Button
          key={location.id}
          variant={selectedLocationId === location.id ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onLocationSelect(location.id)}
        >
          <div className="flex items-center justify-between w-full">
            <span>{location.name}</span>
            <div className="flex items-center gap-1">
              {location.is_host && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Host
                </Badge>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};

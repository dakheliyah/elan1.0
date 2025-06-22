
import React from 'react';
import { MapPin, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function LocationsActivityCard() {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          events (name),
          publications (id, status, updated_at)
        `);

      if (error) throw error;
      
      return (data || []).map(location => ({
        ...location,
        publicationCount: location.publications?.length || 0,
        lastActivity: location.publications?.length > 0 
          ? Math.max(...location.publications.map(p => new Date(p.updated_at).getTime()))
          : 0
      }));
    },
  });

  const maxPublications = Math.max(...locations.map(l => l.publicationCount), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Locations Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locations.slice(0, 6).map((location) => (
            <div key={location.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{location.name}</h4>
                  <p className="text-xs text-gray-600">
                    {location.events?.name} • {location.publicationCount} publications
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 ${
                    location.publicationCount > maxPublications * 0.7 ? 'text-green-500' :
                    location.publicationCount > maxPublications * 0.3 ? 'text-yellow-500' :
                    'text-gray-400'
                  }`} />
                </div>
              </div>
              <Progress 
                value={(location.publicationCount / maxPublications) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

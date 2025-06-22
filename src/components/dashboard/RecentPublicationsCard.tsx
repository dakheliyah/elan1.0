
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function RecentPublicationsCard() {
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ['recent-publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          id,
          title,
          status,
          updated_at,
          locations (
            name,
            events (name)
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Publications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
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
          <FileText className="h-5 w-5" />
          Recent Publications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {publications.map((publication) => (
            <div key={publication.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{publication.title}</h4>
                  <p className="text-xs text-gray-600">
                    {publication.locations?.events?.name} • {publication.locations?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(publication.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusColor(publication.status)}>
                  {publication.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4">
          <ExternalLink className="h-4 w-4 mr-2" />
          View All Publications
        </Button>
      </CardContent>
    </Card>
  );
}

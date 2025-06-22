
import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function TeamActivityCard() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['team-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          id,
          title,
          status,
          updated_at,
          profiles!created_by (full_name),
          locations (
            name,
            events (name)
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
  });

  const getActivityText = (publication: any) => {
    const memberName = publication.profiles?.full_name || 'Team Member';
    const action = publication.status === 'published' ? 'published' : 'updated';
    const location = publication.locations?.name || 'Unknown Location';
    return `${memberName} ${action} "${publication.title}" in ${location}`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
          <Users className="h-5 w-5" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {getActivityText(activity)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(activity.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

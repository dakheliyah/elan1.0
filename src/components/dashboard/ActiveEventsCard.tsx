
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventsWithLocationCount } from '@/hooks/useSupabaseQuery';

export function ActiveEventsCard() {
  const { data: events = [], isLoading } = useEventsWithLocationCount();
  
  const activeEvents = events.filter(event => {
    const today = new Date();
    const endDate = event.end_date ? new Date(event.end_date) : null;
    return !endDate || endDate >= today;
  });

  const completedEvents = events.length - activeEvents.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Active Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Active Events Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeEvents.length}</div>
            <div className="text-sm text-gray-600">Active Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{completedEvents}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        <div className="space-y-3">
          {activeEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{event.name}</h4>
                <p className="text-sm text-gray-600">
                  {event.location_count || 0} locations
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
          ))}
        </div>

        <Button asChild className="w-full mt-4" variant="outline">
          <Link to="/events" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View All Events
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

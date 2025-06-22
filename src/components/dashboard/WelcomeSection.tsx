
import React from 'react';
import { useCurrentProfile } from '@/hooks/useSupabaseQuery';
import { Card, CardContent } from '@/components/ui/card';

export function WelcomeSection() {
  const { data: profile } = useCurrentProfile();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || 'Chief Editor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentDate} • {currentTime}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-gray-500">
            Ready to manage your publications today
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

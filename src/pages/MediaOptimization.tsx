
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StorageAnalyticsDashboard from '@/components/media/StorageAnalyticsDashboard';
import CompressionSettingsPanel from '@/components/media/CompressionSettingsPanel';
import BulkOperationsPanel from '@/components/media/BulkOperationsPanel';
import BackupManagementPanel from '@/components/media/BackupManagementPanel';
import { useEvent } from '@/hooks/useSupabaseQuery';
import { BarChart3, Settings, Layers, Archive, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MediaOptimization: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: eventLoading } = useEvent(eventId!);
  const [activeTab, setActiveTab] = useState('analytics');

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/events/${eventId}`} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Event
                </Link>
              </Button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Optimization</h1>
              <p className="text-gray-600 mt-2">
                Manage storage, performance, and delivery optimization for {event.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Bulk Operations
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <StorageAnalyticsDashboard eventId={eventId!} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CompressionSettingsPanel eventId={eventId!} />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkOperationsPanel eventId={eventId!} />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <BackupManagementPanel eventId={eventId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MediaOptimization;

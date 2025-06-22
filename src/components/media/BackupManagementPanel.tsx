
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBackupJobs, useCreateBackupJob } from '@/hooks/useMediaOptimization';
import { mediaHelpers } from '@/services/media';
import { Archive, Download, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BackupManagementPanelProps {
  eventId: string;
}

const BackupManagementPanel: React.FC<BackupManagementPanelProps> = ({ eventId }) => {
  const { data: backupJobs, isLoading } = useBackupJobs(eventId);
  const createBackup = useCreateBackupJob();

  const handleCreateBackup = (type: 'full' | 'incremental') => {
    createBackup.mutate({ eventId, backupType: type });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const runningJobs = backupJobs?.filter(job => job.status === 'running') || [];
  const recentBackups = backupJobs?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backup Management
          </CardTitle>
          <CardDescription>
            Create and manage backups of your media files for data protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleCreateBackup('full')}
              disabled={createBackup.isPending || runningJobs.length > 0}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Create Full Backup
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreateBackup('incremental')}
              disabled={createBackup.isPending || runningJobs.length > 0}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Create Incremental Backup
            </Button>
          </div>
          
          {runningJobs.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Backup in Progress
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {runningJobs.length} backup job(s) currently running
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backups</CardTitle>
          <CardDescription>
            History of backup operations for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBackups.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {job.backup_type === 'full' ? 'Full Backup' : 'Incremental Backup'}
                      </h4>
                      <Badge variant={getStatusColor(job.status) as any}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                      
                      {job.file_count > 0 && (
                        <span>{job.file_count} files</span>
                      )}
                      
                      {job.total_size_bytes > 0 && (
                        <span>{mediaHelpers.formatFileSize(job.total_size_bytes)}</span>
                      )}
                    </div>
                    
                    {job.status === 'running' && job.started_at && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span>Started {formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}</span>
                        </div>
                        <Progress value={30} className="w-48 h-2" />
                      </div>
                    )}
                    
                    {job.error_message && (
                      <p className="text-sm text-red-600 mt-1">
                        Error: {job.error_message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'completed' && job.backup_location && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  )}
                  
                  {job.completed_at && (
                    <div className="text-xs text-gray-500 text-right">
                      Completed<br />
                      {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {recentBackups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No backups created yet</p>
                <p className="text-sm">Create your first backup to protect your media files</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 text-sm">Backup Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm">
          <ul className="space-y-1">
            <li>• Create regular full backups to ensure complete data protection</li>
            <li>• Use incremental backups for daily changes to save time and storage</li>
            <li>• Store backups in multiple locations for redundancy</li>
            <li>• Test backup restoration periodically to ensure data integrity</li>
            <li>• Keep backup schedules aligned with your content update frequency</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagementPanel;

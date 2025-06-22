import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMediaFilesWithUsageCount, useDeleteMediaFile } from '@/hooks/useMediaQuery';
import { useCreateBackupJob } from '@/hooks/useMediaOptimization';
import { mediaHelpers } from '@/services/media';
import { Trash2, Download, Zap, Archive, FolderOpen, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkOperationsPanelProps {
  eventId: string;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({ eventId }) => {
  const { data: mediaFiles, isLoading } = useMediaFilesWithUsageCount(eventId);
  const deleteMediaFile = useDeleteMediaFile();
  const createBackup = useCreateBackupJob();
  const { toast } = useToast();
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (isSelectingAll) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(mediaFiles?.map(file => file.id) || []));
    }
    setIsSelectingAll(!isSelectingAll);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    const filesToDelete = Array.from(selectedFiles);
    const filesWithUsage = mediaFiles?.filter(file => 
      filesToDelete.includes(file.id) && (file.usage_count || 0) > 0
    ) || [];

    if (filesWithUsage.length > 0) {
      toast({
        title: "Cannot Delete Files",
        description: `${filesWithUsage.length} files are currently in use and cannot be deleted.`,
        variant: "destructive"
      });
      return;
    }

    try {
      for (const fileId of filesToDelete) {
        await deleteMediaFile.mutateAsync(fileId);
      }
      setSelectedFiles(new Set());
      toast({
        title: "Files Deleted",
        description: `Successfully deleted ${filesToDelete.length} files.`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Some files could not be deleted.",
        variant: "destructive"
      });
    }
  };

  const handleBulkBackup = () => {
    createBackup.mutate({ eventId, backupType: 'full' });
  };

  const handleBulkExport = () => {
    if (selectedFiles.size === 0) return;
    
    toast({
      title: "Export Started",
      description: "Preparing files for download...",
    });
    
    // TODO: Implement actual export functionality
    // This would typically create a ZIP file or initiate a download
  };

  const selectedTotalSize = mediaFiles
    ?.filter(file => selectedFiles.has(file.id))
    .reduce((total, file) => total + file.size_bytes, 0) || 0;

  const filesWithUsage = mediaFiles
    ?.filter(file => selectedFiles.has(file.id) && (file.usage_count || 0) > 0)
    .length || 0;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Bulk Operations
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {isSelectingAll ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
              {isSelectingAll ? 'Deselect All' : 'Select All'}
            </Button>
          </CardTitle>
          <CardDescription>
            Select files to perform bulk operations like delete, export, or backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFiles.size > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{selectedFiles.size} files selected</Badge>
                  <span className="text-muted-foreground">
                    Total: {mediaHelpers.formatFileSize(selectedTotalSize)}
                  </span>
                  {filesWithUsage > 0 && (
                    <Badge variant="destructive">{filesWithUsage} in use</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkBackup}
                  disabled={createBackup.isPending}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Backup
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={filesWithUsage > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Files</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedFiles.size} selected files? 
                        This action cannot be undone.
                        {filesWithUsage > 0 && (
                          <span className="block mt-2 text-destructive font-medium">
                            Note: {filesWithUsage} files are currently in use and cannot be deleted.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Files
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>
            Select files for bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mediaFiles?.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedFiles.has(file.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                />
                
                <div className="flex-shrink-0">
                  <img 
                    src={file.thumbnail_url || file.url} 
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{mediaHelpers.formatFileSize(file.size_bytes)}</span>
                    <span>•</span>
                    <span>{file.format.toUpperCase()}</span>
                    {(file.usage_count || 0) > 0 && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {file.usage_count} uses
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {file.file_type === 'image' && <Badge variant="outline">Image</Badge>}
                  {file.file_type === 'video' && <Badge variant="outline">Video</Badge>}
                  {file.file_type === 'document' && <Badge variant="outline">Document</Badge>}
                </div>
              </div>
            )) || []}
            
            {mediaFiles?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No media files found</p>
                <p className="text-sm">Upload some files to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperationsPanel;

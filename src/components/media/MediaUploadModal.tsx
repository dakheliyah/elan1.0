
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadMediaFile } from '@/hooks/useMediaQuery';
import { useCompressionSettings } from '@/hooks/useMediaOptimization';
import { mediaHelpers, imageCompressionService } from '@/services/media';
import { Upload, X, File, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  compressionData?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  eventId
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [customQuality, setCustomQuality] = useState(80);
  const [customMaxWidth, setCustomMaxWidth] = useState(800);
  
  const uploadMediaFile = useUploadMediaFile();
  const { data: compressionSettings } = useCompressionSettings(eventId);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newUploads: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads
    newUploads.forEach(upload => {
      startUpload(upload);
    });
  };

  const startUpload = async (upload: UploadFile) => {
    if (!user) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { 
          ...u, 
          status: 'error' as const, 
          error: 'User not authenticated'
        } : u
      ));
      return;
    }

    setUploads(prev => prev.map(u => 
      u.id === upload.id ? { ...u, status: 'uploading' as const } : u
    ));

    try {
      // Simulate progress updates
      for (let progress = 0; progress <= 30; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ));
      }

      let fileToUpload = upload.file;
      let compressionData: UploadFile['compressionData'] | undefined;
      
      // Check if compression should be applied
      const shouldCompress = compressionEnabled && 
        imageCompressionService.shouldCompress(
          upload.file, 
          compressionSettings?.auto_compress ?? true
        );

      if (shouldCompress) {
        try {
          // Update progress for compression
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress: 40 } : u
          ));

          const quality = compressionSettings?.quality_images ?? customQuality;
          const maxWidth = compressionSettings?.max_width ?? customMaxWidth;
          
          const result = await imageCompressionService.compressImage(upload.file, {
            quality,
            maxWidth
          });
          
          if (result.compressedFile) {
            fileToUpload = result.compressedFile;
            compressionData = {
              originalSize: result.originalSize,
              compressedSize: result.compressedSize,
              compressionRatio: result.compressionRatio || 0
            };
            
            // Update upload with compression data
            setUploads(prev => prev.map(u => 
              u.id === upload.id ? { ...u, compressionData } : u
            ));
          }
        } catch (compressionError) {
          console.warn('Compression failed, uploading original file:', compressionError);
          // Continue with original file if compression fails
        }
      }

      // Continue progress updates
      for (let progress = 50; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ));
      }

      // Generate thumbnail for images
      let thumbnailUrl: string | null = null;
      if (upload.file.type.startsWith('image/')) {
        thumbnailUrl = await mediaHelpers.generateThumbnail(upload.file);
      }

      // Prepare media data
      const mediaData = {
        name: upload.file.name,
        original_name: upload.file.name,
        file_type: mediaHelpers.getFileType(upload.file.type),
        format: mediaHelpers.getFileFormat(upload.file.name, upload.file.type),
        size_bytes: fileToUpload.size,
        mime_type: fileToUpload.type,
        thumbnail_url: thumbnailUrl,
        width: null,
        height: null,
        duration_seconds: null,
        is_optimized: !!compressionData,
        compression_ratio: compressionData?.compressionRatio || null,
      };

      // Upload file (compressed or original)
      await uploadMediaFile.mutateAsync({
        file: fileToUpload,
        eventId,
        mediaData
      });

      // Complete upload
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'completed' as const, progress: 100 } : u
      ));

      const compressionMessage = compressionData 
        ? ` (compressed from ${mediaHelpers.formatFileSize(compressionData.originalSize)} to ${mediaHelpers.formatFileSize(compressionData.compressedSize)})`
        : '';

      toast({
        title: "Upload completed",
        description: `${upload.file.name} has been uploaded successfully${compressionMessage}`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { 
          ...u, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : u
      ));

      toast({
        title: "Upload failed",
        description: `Failed to upload ${upload.file.name}`,
        variant: "destructive",
      });
    }
  };

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleClose = () => {
    setUploads([]);
    onClose();
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Media Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Support for images, documents, and videos up to 10MB each
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {/* Compression Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Image Compression</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompressionSettings(!showCompressionSettings)}
              >
                {showCompressionSettings ? 'Hide' : 'Show'} Settings
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="compression-enabled"
                checked={compressionEnabled}
                onCheckedChange={(checked) => setCompressionEnabled(!!checked)}
              />
              <Label htmlFor="compression-enabled" className="text-sm">
                Automatically compress images to WebP format
              </Label>
            </div>
            
            {showCompressionSettings && compressionEnabled && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality" className="text-sm font-medium">
                      Quality ({customQuality}%)
                    </Label>
                    <Input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      value={customQuality}
                      onChange={(e) => setCustomQuality(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-width" className="text-sm font-medium">
                      Max Width (px)
                    </Label>
                    <Input
                      id="max-width"
                      type="number"
                      min="100"
                      max="4000"
                      value={customMaxWidth}
                      onChange={(e) => setCustomMaxWidth(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Images will be converted to WebP format and resized if wider than the max width.
                  {compressionSettings && (
                    <span className="block mt-1">
                      Event default: Quality {compressionSettings.quality_images}%, Max Width {compressionSettings.max_width}px
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Upload List */}
          {uploads.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploads</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {getStatusIcon(upload.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.file.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {mediaHelpers.formatFileSize(upload.file.size)}
                        </span>
                      </div>
                      
                      {upload.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={upload.progress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {upload.progress}% uploaded
                          </p>
                        </div>
                      )}
                      
                      {upload.status === 'completed' && (
                        <div className="space-y-1">
                          <p className="text-xs text-green-600">Upload completed</p>
                          {upload.compressionData && (
                            <p className="text-xs text-blue-600">
                              Compressed: {mediaHelpers.formatFileSize(upload.compressionData.originalSize)} → {mediaHelpers.formatFileSize(upload.compressionData.compressedSize)} 
                              ({Math.round(upload.compressionData.compressionRatio * 100)}% reduction)
                            </p>
                          )}
                        </div>
                      )}
                      
                      {upload.status === 'error' && (
                        <p className="text-xs text-red-600">
                          {upload.error || 'Upload failed'}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUpload(upload.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {uploads.some(u => u.status === 'completed') ? 'Done' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadModal;

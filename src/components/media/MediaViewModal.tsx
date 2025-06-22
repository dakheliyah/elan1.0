
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  format: string;
  size: number;
  uploadedBy: string;
  uploadDate: string;
  usageCount: number;
  thumbnailUrl?: string;
  url: string;
}

interface MediaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
}

const MediaViewModal: React.FC<MediaViewModalProps> = ({
  isOpen,
  onClose,
  media
}) => {
  const { toast } = useToast();

  if (!media) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    toast({
      title: "URL Copied",
      description: "Media URL has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{media.name}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy size={16} className="mr-2" />
                Copy URL
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              {media.type === 'image' && media.thumbnailUrl ? (
                <img
                  src={media.thumbnailUrl}
                  alt={media.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : media.type === 'video' && media.thumbnailUrl ? (
                <video
                  src={media.url}
                  poster={media.thumbnailUrl}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center">
                  <div className="text-6xl text-gray-400 mb-4">📄</div>
                  <p className="text-gray-600">Preview not available</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(media.url, '_blank')}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open in new tab
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">File Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{media.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{media.format}</Badge>
                    <span className="text-sm text-gray-600 capitalize">{media.type}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Size</label>
                  <p className="text-sm text-gray-900">{formatFileSize(media.size)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Uploaded by</label>
                  <p className="text-sm text-gray-900">{media.uploadedBy}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Upload date</label>
                  <p className="text-sm text-gray-900">{media.uploadDate}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Usage count</label>
                  <p className="text-sm text-gray-900">{media.usageCount} publications</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">File URL</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={media.url}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
                <Button size="sm" onClick={handleCopyUrl}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            {media.usageCount > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Used in Publications</h3>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium">Sample Publication 1</p>
                    <p className="text-xs text-gray-500">Last updated 2 days ago</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium">Sample Publication 2</p>
                    <p className="text-xs text-gray-500">Last updated 1 week ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewModal;

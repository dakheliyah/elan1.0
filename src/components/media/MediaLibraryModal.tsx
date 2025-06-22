
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMediaFiles } from '@/hooks/useMediaQuery';
import { mediaHelpers } from '@/services/media';
import MediaUploadModal from './MediaUploadModal';
import {
  Search,
  Upload,
  Eye,
  Clock,
  User,
  MapPin,
  Image as ImageIcon,
  FileText,
  Video,
  Grid3X3,
  List,
} from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaFile: any) => void;
  eventId: string;
  selectionMode?: boolean;
  fileType?: 'all' | 'image' | 'document' | 'video';
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  eventId,
  selectionMode = false,
  fileType = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document' | 'video'>(fileType);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'recent'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: mediaFiles, isLoading } = useMediaFiles(eventId);

  // Transform and filter media files
  const filteredMedia = (mediaFiles || [])
    .filter(file => {
      // Type filter
      if (filterType !== 'all' && file.file_type !== filterType) return false;
      
      // Search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Date filter
      if (dateFilter !== 'all') {
        const uploadDate = new Date(file.created_at || '');
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'week' && daysDiff > 7) return false;
        if (dateFilter === 'month' && daysDiff > 30) return false;
        if (dateFilter === 'recent' && daysDiff > 3) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by created_at descending (most recent first)
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={20} className="text-blue-500" />;
      case 'video': return <Video size={20} className="text-red-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const handleSelect = (mediaFile: any) => {
    if (selectionMode) {
      onSelect(mediaFile);
    } else {
      setSelectedMedia(mediaFile);
      setShowPreview(true);
    }
  };

  const handlePreview = (mediaFile: any) => {
    setSelectedMedia(mediaFile);
    setShowPreview(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon size={20} />
              {selectionMode ? 'Choose Media File' : 'Media Library'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Controls */}
            <div className="flex flex-col gap-4 p-4 border-b">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-1 gap-4">
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All files</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                    <SelectTrigger className="w-40">
                      <Clock size={16} className="mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-80">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search media"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {filteredMedia.length} file{filteredMedia.length !== 1 ? 's' : ''} found
                </div>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Upload size={16} className="mr-2" />
                  Upload New
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-600">Loading media files...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">No media files found</p>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload First File
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((file) => (
                    <div
                      key={file.id}
                      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelect(file)}
                    >
                      <div className="aspect-square bg-gray-100">
                        {file.thumbnail_url || file.file_type === 'image' ? (
                          <img
                            src={file.thumbnail_url || file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(file.file_type)}
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(file);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 uppercase">{file.format}</span>
                          <span className="text-xs text-gray-500">
                            {mediaHelpers.formatFileSize(Number(file.size_bytes))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {file.usage_count || 0} uses
                          </Badge>
                          {file.is_optimized && (
                            <Badge variant="outline" className="text-xs">
                              Optimized
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelect(file)}
                    >
                      <div className="flex-shrink-0 h-12 w-12">
                        {file.thumbnail_url || file.file_type === 'image' ? (
                          <img
                            className="h-12 w-12 rounded object-cover"
                            src={file.thumbnail_url || file.url}
                            alt={file.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                            {getFileIcon(file.file_type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="uppercase">{file.format}</span>
                          <span>{mediaHelpers.formatFileSize(Number(file.size_bytes))}</span>
                          <span>{file.usage_count || 0} uses</span>
                          {file.is_optimized && (
                            <Badge variant="outline" className="text-xs">
                              Optimized
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(file);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        eventId={eventId}
      />

      {/* Preview Modal */}
      {showPreview && selectedMedia && (
        <Dialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedMedia.file_type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  {getFileIcon(selectedMedia.file_type)}
                  <span className="ml-2 text-gray-600">Preview not available</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedMedia.file_type}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedMedia.format}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {mediaHelpers.formatFileSize(Number(selectedMedia.size_bytes))}
                </div>
                <div>
                  <span className="font-medium">Usage:</span> {selectedMedia.usage_count || 0} times
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <span className="font-medium">Dimensions:</span> {selectedMedia.width} × {selectedMedia.height}px
                  </div>
                )}
              </div>

              {selectionMode && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    onSelect(selectedMedia);
                    setShowPreview(false);
                  }}>
                    Select This File
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MediaLibraryModal;

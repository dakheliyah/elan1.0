import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMediaFiles } from '@/hooks/useMediaQuery';
import { useEvents } from '@/hooks/useEvents';
import { mediaHelpers } from '@/services/media';
import MediaUploadModal from '@/components/media/MediaUploadModal';
import MediaViewModal from '@/components/media/MediaViewModal';
import BulkOptimizationModal from '@/components/media/BulkOptimizationModal';
import UserMenu from '@/components/UserMenu';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Filter,
  Calendar,
  Zap,
  Eye,
  Download,
  Trash2,
  Copy,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowLeft,
} from 'lucide-react';

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

const MediaLibrary: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document' | 'video'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkOptimizationModal, setShowBulkOptimizationModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Fetch media files and event data
  const { data: mediaFiles, isLoading, error } = useMediaFiles(eventId!);
  const { data: events } = useEvents();
  const currentEvent = events?.find(event => event.id === eventId);

  if (!eventId) {
    navigate('/events');
    return null;
  }

  // Transform database records to UI format
  const transformedMediaItems: MediaItem[] = (mediaFiles || []).map(file => ({
    id: file.id,
    name: file.name,
    type: file.file_type as 'image' | 'document' | 'video',
    format: file.format,
    size: Number(file.size_bytes),
    uploadedBy: file.uploaded_by || 'Unknown',
    uploadDate: new Date(file.created_at || '').toLocaleDateString(),
    usageCount: file.usage_count || 0,
    thumbnailUrl: file.thumbnail_url || undefined,
    url: file.url,
  }));

  // Filter media items
  const filteredItems = transformedMediaItems.filter(item => {
    // Type filter
    if (filterType !== 'all' && item.type !== filterType) return false;
    
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Date filter
    if (dateFilter !== 'all') {
      const uploadDate = new Date(item.uploadDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'week' && daysDiff > 7) return false;
      if (dateFilter === 'month' && daysDiff > 30) return false;
    }
    
    return true;
  });

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleViewMedia = (media: MediaItem) => {
    setSelectedMedia(media);
    setShowViewModal(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Media URL has been copied to clipboard",
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={20} className="text-blue-500" />;
      case 'video': return <Video size={20} className="text-red-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const handleBackToEvent = () => {
    console.log(eventId)
    navigate(`/events/${eventId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToEvent}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/events">Events</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/events/${eventId}`}>
                        {currentEvent?.name || 'Event'}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Media Library</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading media files. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToEvent}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/events">Events</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/events/${eventId}`}>
                      {currentEvent?.name || 'Event'}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Media Library</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Action Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Media Files</h2>
            <p className="text-gray-600 mt-1">Upload and manage your event media</p>
          </div>
          <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Upload size={20} className="mr-2" />
            Add Media File
          </Button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
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
                  <Filter size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All media items</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger className="w-40">
                  <Calendar size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
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

          {/* Bulk Actions */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.length === filteredItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    {selectedItems.length > 0 
                      ? `${selectedItems.length} selected` 
                      : 'Select all'
                    }
                  </label>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkOptimizationModal(true)}
                  >
                    <Zap size={16} className="mr-2" />
                    Bulk Optimization
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading media files...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
            <p className="text-gray-600 mb-4">Get started by uploading your first media file.</p>
            <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload size={20} className="mr-2" />
              Upload Media
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                </div>

                <div 
                  className="aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => handleViewMedia(item)}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item.type)}
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleViewMedia(item)}>
                      <Eye size={16} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleCopyUrl(item.url)}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 uppercase">{item.format}</span>
                    <span className="text-xs text-gray-500">{mediaHelpers.formatFileSize(item.size)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{item.uploadDate}</span>
                    <span className="text-xs text-gray-500">{item.usageCount} uses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Checkbox
                        checked={selectedItems.length === filteredItems.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.thumbnailUrl ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={item.thumbnailUrl}
                                alt={item.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                {getFileIcon(item.type)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.format.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mediaHelpers.formatFileSize(item.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.usageCount} uses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMedia(item)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyUrl(item.url)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <MediaUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          eventId={eventId}
        />

        <MediaViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          media={selectedMedia}
        />

        <BulkOptimizationModal
          isOpen={showBulkOptimizationModal}
          onClose={() => setShowBulkOptimizationModal(false)}
          selectedItems={selectedItems}
          onComplete={() => {
            setSelectedItems([]);
            setShowBulkOptimizationModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default MediaLibrary;

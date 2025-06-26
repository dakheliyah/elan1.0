
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Library, Link } from 'lucide-react';
import MediaLibraryModal from '@/components/media/MediaLibraryModal';

interface ImageBlockProps {
  data: {
    imageUrl: string;
    alt: string;
    mediaFileId?: string; // Track which media file is being used
  };
  onChange: (data: Partial<ImageBlockProps['data']>) => void;
  eventId?: string; // Pass event ID for media library access
}

const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange, eventId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server/cloud storage
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      onChange({ imageUrl, mediaFileId: undefined }); // Clear media file ID for local uploads
    }
  };

  const handleMediaSelect = (mediaFile: any) => {
    onChange({ 
      imageUrl: mediaFile.url, 
      alt: mediaFile.name,
      mediaFileId: mediaFile.id 
    });
    setShowMediaLibrary(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange({ 
        imageUrl: urlInput.trim(), 
        alt: data.alt || '',
        mediaFileId: undefined 
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleUrlCancel = () => {
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeImage = () => {
    onChange({ imageUrl: '', alt: '', mediaFileId: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!data.imageUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          
          {!showUrlInput ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload New
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowUrlInput(true)}
                  className="flex items-center gap-2"
                >
                  <Link size={16} />
                  Add URL
                </Button>
                
                {eventId && (
                  <Button
                    variant="outline"
                    onClick={() => setShowMediaLibrary(true)}
                    className="flex items-center gap-2"
                  >
                    <Library size={16} />
                    Choose from Library
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-gray-500">
                Upload an image file (JPG, PNG, GIF), add an external URL, or choose from your media library
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="flex items-center gap-2"
                >
                  <Link size={16} />
                  Add Image
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUrlCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={data.imageUrl}
              alt={data.alt || 'Uploaded image'}
              className="w-full h-auto object-cover rounded-lg border border-gray-200"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2"
            >
              <X size={14} />
            </Button>
          </div>

          <div>
            <Label htmlFor="alt" className="text-sm font-medium text-gray-700">
              Alt Text (Optional)
            </Label>
            <Input
              id="alt"
              value={data.alt}
              onChange={(e) => onChange({ alt: e.target.value })}
              placeholder="Describe the image..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload size={14} />
              Replace Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-2"
            >
              <Link size={14} />
              Replace with URL
            </Button>
            
            {eventId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaLibrary(true)}
                className="flex items-center gap-2"
              >
                <Library size={14} />
                Choose from Library
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && eventId && (
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleMediaSelect}
          eventId={eventId}
          selectionMode={true}
          fileType="image"
        />
      )}
    </div>
  );
};

export default ImageBlock;

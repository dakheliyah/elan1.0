import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, MapPin } from "lucide-react";
import { useUploadLocationLogo } from "@/hooks/useLocations";
import { locationsService } from "@/services/locationsService";

interface LocationLogoUploadProps {
  currentLogo?: string;
  onLogoUpload: (logoUrl: string) => void;
  locationId: string;
}

export const LocationLogoUpload: React.FC<LocationLogoUploadProps> = ({
  currentLogo,
  onLogoUpload,
  locationId
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadLogo = useUploadLocationLogo();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type. Please upload PNG, JPG, or SVG files.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.error('File too large. Please upload files smaller than 2MB.');
      return;
    }

    try {
      // For new locations, upload to storage with a temporary ID
      if (locationId === 'temp') {
        // Generate a temporary unique ID for the upload
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const logoUrl = await uploadLogo.mutateAsync({ file, locationId: tempId });
        onLogoUpload(logoUrl);
        return;
      }

      const logoUrl = await uploadLogo.mutateAsync({ file, locationId });
      onLogoUpload(logoUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveLogo = async () => {
    if (currentLogo && locationId !== 'temp') {
      try {
        await locationsService.deleteLogo(currentLogo);
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }
    onLogoUpload('');
  };

  return (
    <div className="space-y-4">
      {/* Logo Preview */}
      {currentLogo && (
        <div className="flex items-center space-x-3">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={currentLogo} alt="Location logo preview" />
            <AvatarFallback className="rounded-lg bg-gray-100">
              <MapPin className="h-8 w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Upload or drag location logo here</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, SVG up to 2MB
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={uploadLogo.isPending}
          >
            {uploadLogo.isPending ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useCompressionSettings, useUpdateCompressionSettings } from '@/hooks/useMediaOptimization';
import { useForm, Controller } from 'react-hook-form';
import { Settings, Zap, Image, Maximize2 } from 'lucide-react';

interface CompressionSettingsPanelProps {
  eventId: string;
}

interface CompressionFormData {
  auto_compress: boolean;
  quality_images: number;
  quality_thumbnails: number;
  enable_webp: boolean;
  enable_progressive: boolean;
  max_width: number;
  max_height: number;
}

const CompressionSettingsPanel: React.FC<CompressionSettingsPanelProps> = ({ eventId }) => {
  const { data: settings, isLoading } = useCompressionSettings(eventId);
  const updateSettings = useUpdateCompressionSettings();

  const { control, handleSubmit, reset, watch } = useForm<CompressionFormData>({
    defaultValues: {
      auto_compress: true,
      quality_images: 85,
      quality_thumbnails: 75,
      enable_webp: true,
      enable_progressive: true,
      max_width: 1920,
      max_height: 1080,
    }
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        auto_compress: settings.auto_compress,
        quality_images: settings.quality_images,
        quality_thumbnails: settings.quality_thumbnails,
        enable_webp: settings.enable_webp,
        enable_progressive: settings.enable_progressive,
        max_width: settings.max_width,
        max_height: settings.max_height,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: CompressionFormData) => {
    updateSettings.mutate({
      eventId,
      settings: data
    });
  };

  const watchedQualityImages = watch('quality_images');
  const watchedQualityThumbnails = watch('quality_thumbnails');

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Compression Settings
        </CardTitle>
        <CardDescription>
          Configure automatic compression and optimization settings for uploaded media
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Auto Compression Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Automatic Compression</Label>
              <p className="text-sm text-muted-foreground">
                Automatically compress uploaded images to save storage space
              </p>
            </div>
            <Controller
              name="auto_compress"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Image Quality Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <Label className="text-base font-medium">Image Quality</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quality_images">
                  Regular Images: {watchedQualityImages}%
                </Label>
                <Controller
                  name="quality_images"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      id="quality_images"
                      min={1}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values = better quality, larger file size
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality_thumbnails">
                  Thumbnails: {watchedQualityThumbnails}%
                </Label>
                <Controller
                  name="quality_thumbnails"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      id="quality_thumbnails"
                      min={1}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Quality for thumbnail generation
                </p>
              </div>
            </div>
          </div>

          {/* Format Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Format Options</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable WebP Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Use modern WebP format for better compression (when supported)
                  </p>
                </div>
                <Controller
                  name="enable_webp"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Progressive Loading</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable progressive JPEG for faster perceived loading
                  </p>
                </div>
                <Controller
                  name="enable_progressive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Size Limits */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              <Label className="text-base font-medium">Maximum Dimensions</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_width">Maximum Width (px)</Label>
                <Controller
                  name="max_width"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="max_width"
                      type="number"
                      min={100}
                      max={4096}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1920)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_height">Maximum Height (px)</Label>
                <Controller
                  name="max_height"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="max_height"
                      type="number"
                      min={100}
                      max={4096}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1080)}
                    />
                  )}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Images larger than these dimensions will be automatically resized
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={updateSettings.isPending}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompressionSettingsPanel;

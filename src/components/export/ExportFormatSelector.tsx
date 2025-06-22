
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Mail, FileText, Layout, Palette } from 'lucide-react';

interface ExportFormatSelectorProps {
  format: 'html' | 'pdf';
  selectedTemplate: string;
  options: Record<string, any>;
  onTemplateChange: (template: string) => void;
  onOptionsChange: (options: Record<string, any>) => void;
}

export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  format,
  selectedTemplate,
  options,
  onTemplateChange,
  onOptionsChange
}) => {
  const updateOption = (key: string, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  if (format === 'html') {
    return (
      <div className="space-y-4">
        {/* Email Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail size={16} />
              Email Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="emailTemplate">Template Style</Label>
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional Newsletter</SelectItem>
                  <SelectItem value="minimal">Minimal Clean</SelectItem>
                  <SelectItem value="branded">Branded Event Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email Client Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layout size={16} />
              Client Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="gmailOptimized">Gmail/Outlook Compatible</Label>
              <Switch
                id="gmailOptimized"
                checked={options.gmailOptimized || true}
                onCheckedChange={(checked) => updateOption('gmailOptimized', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mobileResponsive">Mobile Responsive</Label>
              <Switch
                id="mobileResponsive"
                checked={options.mobileResponsive || true}
                onCheckedChange={(checked) => updateOption('mobileResponsive', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkModeSupport">Dark Mode Support</Label>
              <Switch
                id="darkModeSupport"
                checked={options.darkModeSupport || false}
                onCheckedChange={(checked) => updateOption('darkModeSupport', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Handling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Image Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="imageHandling">Image Handling</Label>
              <Select 
                value={options.imageHandling || 'hosted'} 
                onValueChange={(value) => updateOption('imageHandling', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hosted">Hosted URLs</SelectItem>
                  <SelectItem value="base64">Embedded Base64</SelectItem>
                  <SelectItem value="optimized">Optimized & Hosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PDF Format Options
  return (
    <div className="space-y-4">
      {/* Page Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText size={16} />
            Page Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="pageSize">Page Size</Label>
            <Select 
              value={options.pageSize || 'A4'} 
              onValueChange={(value) => updateOption('pageSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                <SelectItem value="Custom">Custom Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="orientation">Orientation</Label>
            <Select 
              value={options.orientation || 'portrait'} 
              onValueChange={(value) => updateOption('orientation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {options.pageSize === 'Custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customWidth">Width (mm)</Label>
                <Input
                  id="customWidth"
                  type="number"
                  value={options.customWidth || 210}
                  onChange={(e) => updateOption('customWidth', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="customHeight">Height (mm)</Label>
                <Input
                  id="customHeight"
                  type="number"
                  value={options.customHeight || 297}
                  onChange={(e) => updateOption('customHeight', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quality & Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="quality">Export Quality</Label>
            <Select 
              value={options.quality || 'high'} 
              onValueChange={(value) => updateOption('quality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Quality (Print)</SelectItem>
                <SelectItem value="medium">Medium Quality (Digital)</SelectItem>
                <SelectItem value="web">Web Optimized (Small File)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="includeCover">Include Cover Page</Label>
              <Switch
                id="includeCover"
                checked={options.includeCover || false}
                onCheckedChange={(checked) => updateOption('includeCover', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeTableOfContents">Table of Contents</Label>
              <Switch
                id="includeTableOfContents"
                checked={options.includeTableOfContents || false}
                onCheckedChange={(checked) => updateOption('includeTableOfContents', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeMetadata">Metadata Footer</Label>
              <Switch
                id="includeMetadata"
                checked={options.includeMetadata !== false}
                onCheckedChange={(checked) => updateOption('includeMetadata', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

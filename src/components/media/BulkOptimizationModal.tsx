
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Zap, CheckCircle, Loader2 } from 'lucide-react';

interface BulkOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: string[];
  onComplete: () => void;
}

const BulkOptimizationModal: React.FC<BulkOptimizationModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onComplete
}) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationOptions, setOptimizationOptions] = useState({
    compressImages: true,
    generateThumbnails: true,
    optimizeFormats: true,
    removeMetadata: false,
  });

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setProgress(0);

    // Simulate optimization progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(i);
    }

    setIsOptimizing(false);
    
    toast({
      title: "Optimization Complete",
      description: `${selectedItems.length} files have been optimized successfully`,
    });

    onComplete();
    onClose();
  };

  const estimatedSavings = selectedItems.length * 0.3; // 30% average savings

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Bulk Optimization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Optimize {selectedItems.length} selected files to reduce file sizes and improve loading performance.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Estimated savings:</strong> {Math.round(estimatedSavings)}% file size reduction
              </p>
            </div>
          </div>

          {!isOptimizing && (
            <div className="space-y-3">
              <h4 className="font-medium">Optimization Options</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compress"
                    checked={optimizationOptions.compressImages}
                    onCheckedChange={(checked) =>
                      setOptimizationOptions(prev => ({ ...prev, compressImages: checked as boolean }))
                    }
                  />
                  <label htmlFor="compress" className="text-sm">
                    Compress images (recommended)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="thumbnails"
                    checked={optimizationOptions.generateThumbnails}
                    onCheckedChange={(checked) =>
                      setOptimizationOptions(prev => ({ ...prev, generateThumbnails: checked as boolean }))
                    }
                  />
                  <label htmlFor="thumbnails" className="text-sm">
                    Generate optimized thumbnails
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="formats"
                    checked={optimizationOptions.optimizeFormats}
                    onCheckedChange={(checked) =>
                      setOptimizationOptions(prev => ({ ...prev, optimizeFormats: checked as boolean }))
                    }
                  />
                  <label htmlFor="formats" className="text-sm">
                    Convert to modern formats (WebP, AVIF)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={optimizationOptions.removeMetadata}
                    onCheckedChange={(checked) =>
                      setOptimizationOptions(prev => ({ ...prev, removeMetadata: checked as boolean }))
                    }
                  />
                  <label htmlFor="metadata" className="text-sm">
                    Remove EXIF metadata
                  </label>
                </div>
              </div>
            </div>
          )}

          {isOptimizing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm">Optimizing files...</span>
              </div>
              
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {progress}% complete
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isOptimizing}>
              Cancel
            </Button>
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !Object.values(optimizationOptions).some(Boolean)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start Optimization
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOptimizationModal;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStorageQuota, useStorageUsageHistory, useUpdateStorageQuota } from '@/hooks/useMediaOptimization';
import { useMediaFilesWithUsageCount } from '@/hooks/useMediaQuery';
import { mediaHelpers } from '@/services/media';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HardDrive, TrendingUp, Image, FileText, Video, RefreshCw } from 'lucide-react';

interface StorageAnalyticsDashboardProps {
  eventId: string;
}

interface FileTypeStats {
  count: number;
  size: number;
}

const COLORS = ['#4E6F1F', '#ADBF97', '#BAD9A2', '#9DC4B5'];

const StorageAnalyticsDashboard: React.FC<StorageAnalyticsDashboardProps> = ({ eventId }) => {
  const { data: quota, isLoading: quotaLoading } = useStorageQuota(eventId);
  const { data: usageHistory, isLoading: historyLoading } = useStorageUsageHistory(eventId);
  const { data: mediaFiles, isLoading: filesLoading } = useMediaFilesWithUsageCount(eventId);
  const updateQuota = useUpdateStorageQuota();

  const handleRefreshQuota = () => {
    updateQuota.mutate(eventId);
  };

  if (quotaLoading || historyLoading || filesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-100 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const usagePercentage = quota ? (quota.used_bytes / quota.quota_bytes) * 100 : 0;
  const isNearLimit = quota && usagePercentage >= quota.warning_threshold * 100;

  // File type distribution with proper typing
  const fileTypeStats = mediaFiles?.reduce((acc: Record<string, FileTypeStats>, file) => {
    const type = file.file_type;
    if (!acc[type]) {
      acc[type] = { count: 0, size: 0 };
    }
    acc[type].count += 1;
    acc[type].size += file.size_bytes;
    return acc;
  }, {}) || {};

  const fileTypeChartData = Object.entries(fileTypeStats).map(([type, stats]) => ({
    name: type,
    value: stats.count,
    size: stats.size
  }));

  // Most used images
  const mostUsedImages = mediaFiles
    ?.filter(file => file.file_type === 'image')
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5) || [];

  // Usage trend data
  const usageTrendData = usageHistory?.map(history => ({
    date: new Date(history.date).toLocaleDateString(),
    used_gb: history.used_bytes / (1024 * 1024 * 1024),
    file_count: history.file_count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {quota ? mediaHelpers.formatFileSize(quota.used_bytes) : '0 Bytes'}
                </span>
                <Badge variant={isNearLimit ? "destructive" : "secondary"}>
                  {usagePercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={usagePercentage} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 Bytes</span>
                <span>{quota ? mediaHelpers.formatFileSize(quota.quota_bytes) : '5 GB'}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshQuota}
                disabled={updateQuota.isPending}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${updateQuota.isPending ? 'animate-spin' : ''}`} />
                Refresh Usage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaFiles?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all media types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">
              Storage growth this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>File Type Distribution</CardTitle>
            <CardDescription>Breakdown by file types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fileTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#4E6F1F"
                  dataKey="value"
                >
                  {fileTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Storage Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage Trend</CardTitle>
            <CardDescription>Storage usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)} GB`, 'Storage Used']} />
                <Line type="monotone" dataKey="used_gb" stroke="#4E6F1F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Used Images */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Images</CardTitle>
          <CardDescription>Images with highest usage across publications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mostUsedImages.map((image, index) => (
              <div key={image.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={image.thumbnail_url || image.url} 
                    alt={image.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {mediaHelpers.formatFileSize(image.size_bytes)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {image.usage_count || 0} uses
                </Badge>
              </div>
            ))}
            {mostUsedImages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No image usage data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage Recommendations */}
      {isNearLimit && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Storage Optimization Recommendations</CardTitle>
            <CardDescription className="text-orange-600">
              You're approaching your storage limit. Consider these optimizations:
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-700">
            <ul className="space-y-2 text-sm">
              <li>• Enable automatic compression to reduce file sizes</li>
              <li>• Archive old or unused media files</li>
              <li>• Delete duplicate or similar images</li>
              <li>• Convert images to more efficient formats (WebP)</li>
              <li>• Consider upgrading your storage quota</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StorageAnalyticsDashboard;

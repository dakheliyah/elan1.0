
-- Add storage optimization and monitoring tables
CREATE TABLE public.storage_quotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  quota_bytes BIGINT NOT NULL DEFAULT 5368709120, -- 5GB default
  used_bytes BIGINT NOT NULL DEFAULT 0,
  warning_threshold NUMERIC NOT NULL DEFAULT 0.8, -- 80%
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

CREATE TABLE public.storage_usage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  used_bytes BIGINT NOT NULL,
  file_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, date)
);

CREATE TABLE public.media_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_file_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
  version_type TEXT NOT NULL, -- 'thumbnail', 'compressed', 'webp', 'original'
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  quality INTEGER, -- compression quality 1-100
  format TEXT NOT NULL, -- 'jpeg', 'webp', 'png'
  is_optimized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.media_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_file_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  access_type TEXT NOT NULL, -- 'view', 'download', 'thumbnail'
  user_agent TEXT,
  ip_address INET,
  response_time_ms INTEGER,
  bytes_transferred BIGINT,
  cache_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.media_backup_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  backup_type TEXT NOT NULL, -- 'full', 'incremental'
  backup_location TEXT,
  file_count INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.orphaned_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cleanup_scheduled TIMESTAMP WITH TIME ZONE,
  is_cleaned BOOLEAN DEFAULT false
);

CREATE TABLE public.compression_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  auto_compress BOOLEAN DEFAULT true,
  quality_images INTEGER DEFAULT 85 CHECK (quality_images BETWEEN 1 AND 100),
  quality_thumbnails INTEGER DEFAULT 75 CHECK (quality_thumbnails BETWEEN 1 AND 100),
  enable_webp BOOLEAN DEFAULT true,
  enable_progressive BOOLEAN DEFAULT true,
  max_width INTEGER DEFAULT 1920,
  max_height INTEGER DEFAULT 1080,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

-- Add new columns to media_files for optimization tracking
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS cdn_url TEXT;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orphaned_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compression_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for storage_quotas
CREATE POLICY "Users can view quotas for their events" 
  ON public.storage_quotas FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = storage_quotas.event_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage quotas for their events" 
  ON public.storage_quotas FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = storage_quotas.event_id 
      AND e.created_by = auth.uid()
    )
  );

-- RLS policies for storage_usage_history
CREATE POLICY "Users can view usage history for their events" 
  ON public.storage_usage_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = storage_usage_history.event_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert usage history" 
  ON public.storage_usage_history FOR INSERT 
  WITH CHECK (true);

-- RLS policies for media_versions
CREATE POLICY "Users can view versions for their media" 
  ON public.media_versions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_versions.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "System can manage media versions" 
  ON public.media_versions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_versions.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

-- RLS policies for media_access_log
CREATE POLICY "Users can view access logs for their media" 
  ON public.media_access_log FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_access_log.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "System can log media access" 
  ON public.media_access_log FOR INSERT 
  WITH CHECK (true);

-- RLS policies for media_backup_jobs
CREATE POLICY "Users can view backup jobs for their events" 
  ON public.media_backup_jobs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_backup_jobs.event_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage backup jobs for their events" 
  ON public.media_backup_jobs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_backup_jobs.event_id 
      AND e.created_by = auth.uid()
    )
  );

-- RLS policies for orphaned_files (admin only, simplified for now)
CREATE POLICY "System can manage orphaned files" 
  ON public.orphaned_files FOR ALL 
  USING (true);

-- RLS policies for compression_settings
CREATE POLICY "Users can view compression settings for their events" 
  ON public.compression_settings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = compression_settings.event_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage compression settings for their events" 
  ON public.compression_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = compression_settings.event_id 
      AND e.created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_storage_quotas_event_id ON public.storage_quotas(event_id);
CREATE INDEX idx_storage_usage_history_event_date ON public.storage_usage_history(event_id, date DESC);
CREATE INDEX idx_media_versions_media_file_id ON public.media_versions(media_file_id);
CREATE INDEX idx_media_versions_type ON public.media_versions(version_type);
CREATE INDEX idx_media_access_log_media_file_id ON public.media_access_log(media_file_id);
CREATE INDEX idx_media_access_log_created_at ON public.media_access_log(created_at DESC);
CREATE INDEX idx_media_backup_jobs_event_id ON public.media_backup_jobs(event_id);
CREATE INDEX idx_media_backup_jobs_status ON public.media_backup_jobs(status);
CREATE INDEX idx_orphaned_files_cleanup ON public.orphaned_files(cleanup_scheduled) WHERE is_cleaned = false;
CREATE INDEX idx_compression_settings_event_id ON public.compression_settings(event_id);
CREATE INDEX idx_media_files_last_accessed ON public.media_files(last_accessed DESC);
CREATE INDEX idx_media_files_access_count ON public.media_files(access_count DESC);
CREATE INDEX idx_media_files_archived ON public.media_files(is_archived, archived_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_storage_quotas_updated_at
  BEFORE UPDATE ON public.storage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_compression_settings_updated_at
  BEFORE UPDATE ON public.compression_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update storage quota usage
CREATE OR REPLACE FUNCTION public.update_storage_quota_usage(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bytes BIGINT;
BEGIN
  -- Calculate total storage used for the event
  SELECT COALESCE(SUM(size_bytes), 0)
  INTO total_bytes
  FROM public.media_files
  WHERE event_id = p_event_id AND is_archived = false;
  
  -- Update or insert quota record
  INSERT INTO public.storage_quotas (event_id, used_bytes)
  VALUES (p_event_id, total_bytes)
  ON CONFLICT (event_id) 
  DO UPDATE SET 
    used_bytes = total_bytes,
    updated_at = now();
    
  -- Record daily usage history
  INSERT INTO public.storage_usage_history (event_id, used_bytes, file_count)
  SELECT 
    p_event_id,
    total_bytes,
    COUNT(*)
  FROM public.media_files
  WHERE event_id = p_event_id AND is_archived = false
  ON CONFLICT (event_id, date) 
  DO UPDATE SET 
    used_bytes = EXCLUDED.used_bytes,
    file_count = EXCLUDED.file_count;
END;
$$;

-- Function to detect orphaned files
CREATE OR REPLACE FUNCTION public.detect_orphaned_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This would need to be implemented with actual storage scanning
  -- For now, we'll create a placeholder that can be called by a cron job
  
  -- Insert detected orphaned files (example logic)
  INSERT INTO public.orphaned_files (storage_path, size_bytes, last_accessed)
  SELECT 
    storage_path,
    size_bytes,
    last_accessed
  FROM public.media_files
  WHERE updated_at < (now() - interval '30 days')
    AND access_count = 0
    AND NOT EXISTS (
      SELECT 1 FROM public.media_usage mu 
      WHERE mu.media_file_id = media_files.id
    )
  ON CONFLICT (storage_path) DO NOTHING;
END;
$$;

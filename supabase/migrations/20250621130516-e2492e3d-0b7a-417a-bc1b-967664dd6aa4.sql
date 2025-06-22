
-- Create media_files table for storing file metadata
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'video')),
  format TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- for videos
  is_optimized BOOLEAN DEFAULT false,
  compression_ratio DECIMAL(5,2), -- percentage of size reduction
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_usage table to track where media files are used
CREATE TABLE public.media_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_file_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
  publication_id UUID REFERENCES public.publications(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL DEFAULT 'publication', -- publication, banner, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_optimization_jobs table to track bulk optimization tasks
CREATE TABLE public.media_optimization_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  media_file_ids UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  options JSONB DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_optimization_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for media_files
CREATE POLICY "Users can view media files from their events" 
  ON public.media_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_files.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create media files for their events" 
  ON public.media_files 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_files.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update media files from their events" 
  ON public.media_files 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_files.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete media files from their events" 
  ON public.media_files 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_files.event_id 
      AND events.created_by = auth.uid()
    )
  );

-- Create RLS policies for media_usage
CREATE POLICY "Users can view media usage from their events" 
  ON public.media_usage 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_usage.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create media usage records" 
  ON public.media_usage 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_usage.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete media usage records" 
  ON public.media_usage 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files mf
      JOIN public.events e ON e.id = mf.event_id
      WHERE mf.id = media_usage.media_file_id 
      AND e.created_by = auth.uid()
    )
  );

-- Create RLS policies for media_optimization_jobs
CREATE POLICY "Users can view their optimization jobs" 
  ON public.media_optimization_jobs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_optimization_jobs.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create optimization jobs for their events" 
  ON public.media_optimization_jobs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_optimization_jobs.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their optimization jobs" 
  ON public.media_optimization_jobs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = media_optimization_jobs.event_id 
      AND events.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_media_files_event_id ON public.media_files(event_id);
CREATE INDEX idx_media_files_type ON public.media_files(file_type);
CREATE INDEX idx_media_files_created_at ON public.media_files(created_at);
CREATE INDEX idx_media_usage_media_file_id ON public.media_usage(media_file_id);
CREATE INDEX idx_media_usage_publication_id ON public.media_usage(publication_id);
CREATE INDEX idx_media_optimization_jobs_event_id ON public.media_optimization_jobs(event_id);
CREATE INDEX idx_media_optimization_jobs_status ON public.media_optimization_jobs(status);

-- Create trigger to update updated_at timestamps
CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_media_optimization_jobs_updated_at
  BEFORE UPDATE ON public.media_optimization_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-files', 'media-files', true);

-- Create storage policies for media files bucket
CREATE POLICY "Users can view media files" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'media-files');

CREATE POLICY "Authenticated users can upload media files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their media files" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their media files" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

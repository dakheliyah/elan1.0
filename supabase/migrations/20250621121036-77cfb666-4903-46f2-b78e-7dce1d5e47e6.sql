
-- Create storage bucket for umoor logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('umoor-logos', 'umoor-logos', true);

-- Create storage policies for umoor logos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'umoor-logos');
CREATE POLICY "Authenticated users can upload umoor logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'umoor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update umoor logos" ON storage.objects FOR UPDATE USING (bucket_id = 'umoor-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete umoor logos" ON storage.objects FOR DELETE USING (bucket_id = 'umoor-logos' AND auth.role() = 'authenticated');

-- Create umoors table
CREATE TABLE public.umoors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for umoors
ALTER TABLE public.umoors ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read umoors (they're global)
CREATE POLICY "Anyone can view umoors" ON public.umoors FOR SELECT USING (true);

-- Only authenticated users can create umoors
CREATE POLICY "Authenticated users can create umoors" ON public.umoors FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update umoors
CREATE POLICY "Authenticated users can update umoors" ON public.umoors FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete umoors
CREATE POLICY "Authenticated users can delete umoors" ON public.umoors FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.umoors
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert some default umoor departments
INSERT INTO public.umoors (name, slug, description) VALUES
('Waaz Timings', 'waaz-timings', 'Prayer and sermon schedules'),
('Raat Majlis Schedule', 'raat-majlis-schedule', 'Evening gathering schedules'),
('Food Services', 'food-services', 'Meal and catering information'),
('Accommodation', 'accommodation', 'Housing and lodging details'),
('Transportation', 'transportation', 'Travel and transport services'),
('Health Services', 'health-services', 'Medical and health facilities'),
('Registration', 'registration', 'Event registration and enrollment'),
('General Information', 'general-information', 'General announcements and info');

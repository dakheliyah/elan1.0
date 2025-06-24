-- Add storage policies for location-logos bucket
-- This migration adds the missing storage policies that allow authenticated users to upload, update, and delete location logos

-- Create storage policies for location logos
CREATE POLICY "Location logos public access" ON storage.objects FOR SELECT USING (bucket_id = 'location-logos');
CREATE POLICY "Authenticated users can upload location logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'location-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update location logos" ON storage.objects FOR UPDATE USING (bucket_id = 'location-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete location logos" ON storage.objects FOR DELETE USING (bucket_id = 'location-logos' AND auth.role() = 'authenticated');
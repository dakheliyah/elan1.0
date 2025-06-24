-- Add logo support for locations
-- This migration adds logo_url field to locations table

-- Add logo_url column to locations table
ALTER TABLE public.locations 
ADD COLUMN logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.locations.logo_url IS 'URL to the location logo stored in Supabase storage';

-- Create storage bucket for location logos (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('location-logos', 'location-logos', true)
ON CONFLICT (id) DO NOTHING;
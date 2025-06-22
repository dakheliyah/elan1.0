-- Migration: Transform publications to event-date based system
-- This migration transforms the publication system from location-based to event-date-based
-- where publications are created for specific dates within events and apply to all locations

-- Step 1: Clean existing publication data (as requested by user)
DELETE FROM public.publications;

-- Step 2: Add new columns to publications table
ALTER TABLE public.publications 
ADD COLUMN publication_date DATE,
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- Step 3: Make publication_date required after adding it
ALTER TABLE public.publications 
ALTER COLUMN publication_date SET NOT NULL;

-- Step 4: Make location_id nullable (it will be used differently now)
ALTER TABLE public.publications 
ALTER COLUMN location_id DROP NOT NULL;

-- Step 5: Create publication_locations table for location-specific content
CREATE TABLE public.publication_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID REFERENCES public.publications(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  content TEXT, -- Location-specific content
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(publication_id, location_id)
);

-- Step 6: Enable RLS on publication_locations table
ALTER TABLE public.publication_locations ENABLE ROW LEVEL SECURITY;

-- Step 7: Create indexes for performance
CREATE INDEX idx_publications_event_date ON public.publications(event_id, publication_date);
CREATE INDEX idx_publications_date ON public.publications(publication_date);
CREATE INDEX idx_publication_locations_publication ON public.publication_locations(publication_id);
CREATE INDEX idx_publication_locations_location ON public.publication_locations(location_id);
CREATE INDEX idx_publication_locations_status ON public.publication_locations(status);

-- Step 8: Create unique constraint for one publication per event per date
CREATE UNIQUE INDEX idx_unique_event_publication_date 
ON public.publications(event_id, publication_date);

-- Step 9: Update RLS policies for publications table
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view publications" ON public.publications;
DROP POLICY IF EXISTS "Users can create publications" ON public.publications;
DROP POLICY IF EXISTS "Users can update publications" ON public.publications;
DROP POLICY IF EXISTS "Users can delete publications" ON public.publications;

-- Create new RLS policies for event-based publications
CREATE POLICY "Users can view event publications" 
  ON public.publications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = publications.event_id
    )
  );

CREATE POLICY "Users can create event publications" 
  ON public.publications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = publications.event_id
    ) AND
    auth.uid() = created_by
  );

CREATE POLICY "Users can update event publications" 
  ON public.publications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = publications.event_id
    )
  );

CREATE POLICY "Users can delete event publications" 
  ON public.publications 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = publications.event_id
    )
  );

-- Step 10: Create RLS policies for publication_locations table
CREATE POLICY "Users can view publication locations" 
  ON public.publication_locations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.publications p
      JOIN public.events e ON e.id = p.event_id
      WHERE p.id = publication_locations.publication_id
    )
  );

CREATE POLICY "Users can create publication locations" 
  ON public.publication_locations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.publications p
      JOIN public.events e ON e.id = p.event_id
      WHERE p.id = publication_locations.publication_id
    )
  );

CREATE POLICY "Users can update publication locations" 
  ON public.publication_locations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.publications p
      JOIN public.events e ON e.id = p.event_id
      WHERE p.id = publication_locations.publication_id
    )
  );

CREATE POLICY "Users can delete publication locations" 
  ON public.publication_locations 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.publications p
      JOIN public.events e ON e.id = p.event_id
      WHERE p.id = publication_locations.publication_id
    )
  );

-- Step 11: Add trigger for updated_at on publication_locations
CREATE TRIGGER handle_updated_at_publication_locations 
  BEFORE UPDATE ON public.publication_locations
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 12: Update the publications table to remove the old featured logic per location
-- Since we now have event-date based publications, featured status is per publication, not per location
-- The is_featured column can remain as-is for the main publication

-- Step 13: Add helpful functions for querying
CREATE OR REPLACE FUNCTION get_publication_by_event_and_date(event_uuid UUID, pub_date DATE)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  status TEXT,
  is_featured BOOLEAN,
  publication_date DATE,
  event_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.content, p.status, p.is_featured, p.publication_date, p.event_id, p.created_at, p.updated_at, p.created_by
  FROM public.publications p
  WHERE p.event_id = event_uuid AND p.publication_date = pub_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_publication_locations_with_status(pub_id UUID)
RETURNS TABLE (
  location_id UUID,
  location_name TEXT,
  content TEXT,
  status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT pl.location_id, l.name, pl.content, pl.status, pl.updated_at
  FROM public.publication_locations pl
  JOIN public.locations l ON l.id = pl.location_id
  WHERE pl.publication_id = pub_id
  ORDER BY l.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
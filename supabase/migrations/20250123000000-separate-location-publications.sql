-- Migration: Modify publications to support separate publications per location
-- This migration changes the approach from shared publications with location-specific content
-- to individual publications for each location that can be edited independently

-- Step 1: Remove the unique constraint that enforces one publication per event per date
DROP INDEX IF EXISTS idx_unique_event_publication_date;

-- Step 2: Create a new unique constraint for one publication per event per date per location
CREATE UNIQUE INDEX idx_unique_event_publication_date_location 
ON public.publications(event_id, publication_date, location_id) 
WHERE location_id IS NOT NULL;

-- Step 3: Make location_id required for new publications
-- (We'll handle this in the application logic to maintain backward compatibility)

-- Step 4: Add index for better performance when querying by location
CREATE INDEX idx_publications_location_date ON public.publications(location_id, publication_date) 
WHERE location_id IS NOT NULL;

-- Step 5: Update RLS policies to handle location-specific publications
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view publications" ON public.publications;
DROP POLICY IF EXISTS "Users can create publications" ON public.publications;
DROP POLICY IF EXISTS "Users can update publications" ON public.publications;
DROP POLICY IF EXISTS "Users can delete publications" ON public.publications;

-- Create new policies for location-specific publications
CREATE POLICY "Users can view publications" 
  ON public.publications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = publications.event_id
    )
  );

CREATE POLICY "Users can create publications" 
  ON public.publications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = publications.event_id
    )
  );

CREATE POLICY "Users can update publications" 
  ON public.publications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = publications.event_id
    )
  );

CREATE POLICY "Users can delete publications" 
  ON public.publications 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = publications.event_id
    )
  );

-- Step 6: Add a function to create publications for all locations of an event
CREATE OR REPLACE FUNCTION create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status TEXT DEFAULT 'draft',
  p_is_featured BOOLEAN DEFAULT false,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (publication_id UUID, location_id UUID, location_name TEXT)
AS $$
DECLARE
  location_record RECORD;
  new_publication_id UUID;
BEGIN
  -- Loop through all locations for the event
  FOR location_record IN 
    SELECT id, name FROM public.locations WHERE event_id = p_event_id
  LOOP
    -- Create a publication for each location
    INSERT INTO public.publications (
      title,
      event_id,
      location_id,
      publication_date,
      status,
      is_featured,
      created_by
    ) VALUES (
      p_title,
      p_event_id,
      location_record.id,
      p_publication_date,
      p_status::publication_status,
      p_is_featured,
      p_created_by
    ) RETURNING id INTO new_publication_id;
    
    -- Return the created publication info
    publication_id := new_publication_id;
    location_id := location_record.id;
    location_name := location_record.name;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add a function to get publications by event and date with location info
CREATE OR REPLACE FUNCTION get_publications_by_event_and_date(
  p_event_id UUID,
  p_publication_date DATE
)
RETURNS TABLE (
  publication_id UUID,
  title TEXT,
  content JSON,
  status TEXT,
  is_featured BOOLEAN,
  location_id UUID,
  location_name TEXT,
  location_is_host BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as publication_id,
    p.title,
    p.content,
    p.status::TEXT,
    p.is_featured,
    l.id as location_id,
    l.name as location_name,
    l.is_host as location_is_host,
    p.created_at,
    p.updated_at
  FROM public.publications p
  JOIN public.locations l ON l.id = p.location_id
  WHERE p.event_id = p_event_id 
    AND p.publication_date = p_publication_date
  ORDER BY l.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
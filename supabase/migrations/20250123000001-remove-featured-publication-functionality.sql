-- Remove the index on is_featured column
DROP INDEX IF EXISTS idx_publications_is_featured;

-- Remove the is_featured column from publications table
ALTER TABLE publications DROP COLUMN IF EXISTS is_featured;

-- Update the create_publications_for_all_locations function to remove p_is_featured parameter
CREATE OR REPLACE FUNCTION create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status TEXT DEFAULT 'draft',
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(
  publication_id UUID,
  location_id UUID,
  location_name TEXT
) AS $$
DECLARE
  location_record RECORD;
  new_publication_id UUID;
BEGIN
  -- Loop through all locations for the event
  FOR location_record IN 
    SELECT l.id, l.name 
    FROM locations l
    INNER JOIN event_locations el ON l.id = el.location_id
    WHERE el.event_id = p_event_id
  LOOP
    -- Create a new publication for this location
    INSERT INTO publications (
      title,
      event_id,
      location_id,
      publication_date,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      p_title,
      p_event_id,
      location_record.id,
      p_publication_date,
      p_status,
      p_created_by,
      NOW(),
      NOW()
    ) RETURNING id INTO new_publication_id;
    
    -- Return the publication and location info
    publication_id := new_publication_id;
    location_id := location_record.id;
    location_name := location_record.name;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_publications_by_event_and_date(uuid,date);

-- Update the get_publications_by_event_and_date function to remove is_featured from return type
CREATE OR REPLACE FUNCTION get_publications_by_event_and_date(
  p_event_id UUID,
  p_publication_date DATE
)
RETURNS TABLE(
  publication_id UUID,
  title TEXT,
  content JSONB,
  status TEXT,
  location_id UUID,
  location_name TEXT,
  location_is_host BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as publication_id,
    p.title,
    p.content,
    p.status::TEXT,
    l.id as location_id,
    l.name as location_name,
    l.is_host as location_is_host,
    p.created_at,
    p.updated_at
  FROM publications p
  INNER JOIN locations l ON p.location_id = l.id
  WHERE p.event_id = p_event_id 
    AND p.publication_date = p_publication_date
  ORDER BY l.is_host DESC, l.name ASC;
END;
$$ LANGUAGE plpgsql;
-- Remove the index on is_featured column
DROP INDEX IF EXISTS idx_publications_is_featured;

-- Remove the is_featured column from publications table
ALTER TABLE publications DROP COLUMN IF EXISTS is_featured;

-- Note: create_publications_for_all_locations function definition moved to 20250127000000-resolve-function-overloading-final.sql
-- to resolve function overloading conflicts

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
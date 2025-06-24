-- Final resolution of create_publications_for_all_locations function overloading
-- This migration ensures only one version of the function exists

-- Drop ALL possible variations of the function to eliminate overloading conflicts

-- Drop the original version from 20250123000000 (with TEXT status and p_is_featured)
DROP FUNCTION IF EXISTS create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status TEXT,
  p_is_featured BOOLEAN,
  p_created_by UUID
);

-- Drop version without defaults
DROP FUNCTION IF EXISTS create_publications_for_all_locations(
  TEXT,
  UUID,
  DATE,
  TEXT,
  BOOLEAN,
  UUID
);

-- Drop the version from 20250123000001 (with publication_status, no p_is_featured)
DROP FUNCTION IF EXISTS create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status publication_status,
  p_created_by UUID
);

-- Drop version without defaults
DROP FUNCTION IF EXISTS create_publications_for_all_locations(
  TEXT,
  UUID,
  DATE,
  publication_status,
  UUID
);

-- Drop any other potential variations
DROP FUNCTION IF EXISTS public.create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status TEXT,
  p_created_by UUID
);

-- Create the single, definitive version of the function
CREATE FUNCTION create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status publication_status DEFAULT 'draft',
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
    WHERE l.event_id = p_event_id
  LOOP
    -- Create a new publication for this location
    INSERT INTO publications (
      title,
      event_id,
      location_id,
      publication_date,
      status,
      created_by
    ) VALUES (
      p_title,
      p_event_id,
      location_record.id,
      p_publication_date,
      p_status,
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status publication_status,
  p_created_by UUID
) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION create_publications_for_all_locations IS 
'Creates publications for all locations associated with an event. This is the definitive version that resolves function overloading conflicts.';
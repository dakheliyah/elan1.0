
-- Add is_host column to locations table and create unique constraint
ALTER TABLE public.locations 
ADD COLUMN is_host boolean DEFAULT false;

-- Create partial unique index to ensure only one host location per event
CREATE UNIQUE INDEX idx_locations_one_host_per_event 
ON public.locations (event_id) 
WHERE is_host = true;

-- Add comment for documentation
COMMENT ON COLUMN public.locations.is_host IS 'Indicates if this location is the host location for the event. Only one host location allowed per event.';

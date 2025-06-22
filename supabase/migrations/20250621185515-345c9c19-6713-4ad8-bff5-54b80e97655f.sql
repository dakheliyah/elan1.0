
-- Add is_featured column to publications table
ALTER TABLE public.publications 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- Create an index for better performance when querying featured publications
CREATE INDEX idx_publications_is_featured ON public.publications(is_featured) WHERE is_featured = true;

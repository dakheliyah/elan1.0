ALTER TABLE public.locations
ADD COLUMN host_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;

ALTER TABLE public.locations
ADD CONSTRAINT chk_host_location_id CHECK (id <> host_location_id);

ALTER TABLE public.locations
ADD CONSTRAINT chk_is_host_and_host_location_id CHECK (is_host = false OR host_location_id IS NULL);
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS publication_branding jsonb;

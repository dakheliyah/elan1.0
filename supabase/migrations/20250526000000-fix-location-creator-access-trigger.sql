-- Fix grant_location_creator_access when created_by is not set on insert
CREATE OR REPLACE FUNCTION public.grant_location_creator_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  creator_id UUID;
BEGIN
  creator_id := COALESCE(NEW.created_by, auth.uid());

  IF creator_id IS NOT NULL THEN
    INSERT INTO user_location_access (user_id, location_id, access_level, granted_by)
    VALUES (creator_id, NEW.id, 'admin', creator_id)
    ON CONFLICT (user_id, location_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

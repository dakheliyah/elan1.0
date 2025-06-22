
-- Create invitation status enum
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, event_id)
);

-- Enable RLS on invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for events they have access to
CREATE POLICY "Users can view event invitations" 
  ON public.invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = invitations.event_id
    )
  );

-- Policy: Users can create invitations for events they have access to
CREATE POLICY "Users can create event invitations" 
  ON public.invitations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = invitations.event_id
    ) AND
    auth.uid() = invited_by
  );

-- Policy: Users can update invitations they created
CREATE POLICY "Users can update their invitations" 
  ON public.invitations 
  FOR UPDATE 
  USING (auth.uid() = invited_by);

-- Policy: Users can delete invitations they created
CREATE POLICY "Users can delete their invitations" 
  ON public.invitations 
  FOR DELETE 
  USING (auth.uid() = invited_by);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on invitations
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

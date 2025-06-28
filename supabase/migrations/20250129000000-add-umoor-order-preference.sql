-- Add order preference to umoors table
-- Default value of 0 maintains current behavior
-- Positive values (1, 2, 3...) take priority over 0
ALTER TABLE public.umoors ADD COLUMN order_preference INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_umoors_order_preference ON public.umoors(order_preference, created_at);

-- Add comment to explain the ordering logic
COMMENT ON COLUMN public.umoors.order_preference IS 'Order preference for umoors. 0 = default order (by creation), positive values take priority';
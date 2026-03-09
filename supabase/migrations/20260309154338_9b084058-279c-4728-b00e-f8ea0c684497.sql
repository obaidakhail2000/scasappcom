
-- Add table_number column to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS table_number text NULL;

-- Allow anonymous users to insert reviews (customer-facing)
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read all reviews (for dashboard)
-- Already covered by existing policy for owner's reviews

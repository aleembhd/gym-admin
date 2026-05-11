-- Enable Row Level Security for registrations table
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert access" ON public.registrations;
DROP POLICY IF EXISTS "Allow public update access" ON public.registrations;
DROP POLICY IF EXISTS "Allow public delete access" ON public.registrations;
DROP POLICY IF EXISTS "Allow all access" ON public.registrations;

-- Create a single policy to allow all operations for anonymous and authenticated users
CREATE POLICY "Allow all access"
ON public.registrations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'registrations';

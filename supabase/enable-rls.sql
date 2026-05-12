-- Enable Row Level Security for the registrations table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access"   ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert access" ON public.registrations;
DROP POLICY IF EXISTS "Allow public update access" ON public.registrations;
DROP POLICY IF EXISTS "Allow public delete access" ON public.registrations;
DROP POLICY IF EXISTS "Allow all access"           ON public.registrations;

CREATE POLICY "Allow all access"
ON public.registrations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

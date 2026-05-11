-- Create the members table in Supabase
-- Run this in Supabase SQL Editor

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    joined TEXT,
    amount NUMERIC,
    plan_months INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.members;
DROP POLICY IF EXISTS "Allow public insert access" ON public.members;
DROP POLICY IF EXISTS "Allow public update access" ON public.members;
DROP POLICY IF EXISTS "Allow public delete access" ON public.members;

-- Create policies to allow anonymous access
CREATE POLICY "Allow public read access"
ON public.members
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert access"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON public.members
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access"
ON public.members
FOR DELETE
TO anon, authenticated
USING (true);

-- Insert sample data (optional - remove if you already have data)
INSERT INTO public.members (name, phone, email, created_at)
VALUES 
    ('Croxton Technologies', '7878888888', 'croxtontechnologies@gmail.com', NOW()),
    ('Abdul Aleem', '7672029401', 'croxtontologies@gmail.com', NOW())
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT * FROM public.members;

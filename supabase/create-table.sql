-- Create the registrations table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.registrations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    joined TEXT,
    amount NUMERIC,
    plan_months INTEGER,
    receipt_status BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

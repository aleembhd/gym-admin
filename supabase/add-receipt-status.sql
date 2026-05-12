-- Add receipt_status column to track cross-device receipt sync
-- Run this in the Supabase SQL Editor if the column doesn't exist yet

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS receipt_status BOOLEAN DEFAULT FALSE;

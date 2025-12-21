-- =====================================================
-- ADD MISSING COLUMNS TO JOB_CAMPAIGNS TABLE
-- =====================================================
-- This migration adds the missing columns to the job_campaigns table
-- for document tracking and search parameters

-- Add the missing columns
ALTER TABLE public.job_campaigns 
ADD COLUMN IF NOT EXISTS cv_id TEXT,
ADD COLUMN IF NOT EXISTS cover_letter_id TEXT,
ADD COLUMN IF NOT EXISTS remote TEXT,
ADD COLUMN IF NOT EXISTS sort TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS freshness TEXT,
ADD COLUMN IF NOT EXISTS cities JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.job_campaigns.cv_id IS 'Reference to the CV/resume file selected for this campaign';
COMMENT ON COLUMN public.job_campaigns.cover_letter_id IS 'Reference to the cover letter file selected for this campaign';
COMMENT ON COLUMN public.job_campaigns.remote IS 'Work type: remote, onsite, or hybrid';
COMMENT ON COLUMN public.job_campaigns.sort IS 'Sort order: relevant, recent, or popular';
COMMENT ON COLUMN public.job_campaigns.experience IS 'Experience level filter (Naukri specific)';
COMMENT ON COLUMN public.job_campaigns.freshness IS 'Job posting freshness filter (Naukri specific)';
COMMENT ON COLUMN public.job_campaigns.cities IS 'Array of city codes for location search (Naukri specific)';

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to fix the errors:
-- "Could not find the 'cv_id' column of 'job_campaigns' in the schema cache"
-- "Could not find the 'cover_letter_id' column of 'job_campaigns' in the schema cache"
-- "Could not find the 'remote' column of 'job_campaigns' in the schema cache"
-- "Could not find the 'sort' column of 'job_campaigns' in the schema cache"
-- =====================================================

-- Migration: Make user_id nullable in job_campaigns table
-- This allows API scraper endpoints to work without user authentication
-- Date: 2025-12-21

ALTER TABLE job_campaigns 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN job_campaigns.user_id IS 'User ID - nullable for API scraper endpoints';

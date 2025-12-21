-- =====================================================
-- JOB CAMPAIGNS TABLE
-- =====================================================
-- This table stores all job scraping campaign requests
-- from users for tracking and history purposes

CREATE TABLE IF NOT EXISTS public.job_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- User identification
  user_email TEXT NOT NULL,

  -- Campaign details
  platform TEXT NOT NULL CHECK (platform IN ('indeed', 'linkedin', 'naukri', 'glassdoor', 'bayt')),
  title TEXT NOT NULL, -- Auto-generated from keywords and platform
  keywords TEXT NOT NULL,

  -- Common search parameters
  location TEXT, -- For Indeed and Bayt
  job_limit INTEGER DEFAULT 10,

  -- Document references
  cv_id TEXT, -- Reference to selected CV file
  cover_letter_id TEXT, -- Reference to selected cover letter file

  -- Search filter parameters
  remote TEXT, -- Work type: remote, onsite, hybrid
  sort TEXT, -- Sort order: relevant, recent, popular
  experience TEXT, -- Experience level for Naukri
  freshness TEXT, -- Job freshness for Naukri
  cities JSONB, -- Array of city codes for Naukri

  -- Platform-specific parameters stored as JSONB
  platform_params JSONB DEFAULT '{}'::jsonb,
  -- Examples:
  -- For Indeed/Bayt: { "remote": "remote", "sort": "relevant" }
  -- For Naukri: { "cities": ["116"], "experience": "all", "freshness": "all" }
  -- For Glassdoor: { "baseUrl": "https://www.glassdoor.com", "includeNoSalaryJob": false }

  -- Campaign status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Results tracking
  jobs_found INTEGER DEFAULT 0,
  jobs_processed INTEGER DEFAULT 0,

  -- Error tracking
  error_message TEXT,

  -- Webhook tracking
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_response JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS job_campaigns_user_id_idx ON public.job_campaigns(user_id);
CREATE INDEX IF NOT EXISTS job_campaigns_user_email_idx ON public.job_campaigns(user_email);
CREATE INDEX IF NOT EXISTS job_campaigns_platform_idx ON public.job_campaigns(platform);
CREATE INDEX IF NOT EXISTS job_campaigns_status_idx ON public.job_campaigns(status);
CREATE INDEX IF NOT EXISTS job_campaigns_created_at_idx ON public.job_campaigns(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.job_campaigns ENABLE ROW LEVEL SECURITY;

-- Job Campaigns RLS Policies
-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.job_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns"
  ON public.job_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.job_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.job_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all campaigns (for status updates from webhooks)
CREATE POLICY "Admins can update all campaigns"
  ON public.job_campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_job_campaigns_updated_at
  BEFORE UPDATE ON public.job_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CAMPAIGN HISTORY VIEW (Optional but useful)
-- =====================================================
-- Creates a view that joins campaigns with user profiles
-- for easier querying

CREATE OR REPLACE VIEW public.job_campaigns_with_user AS
SELECT
  jc.*,
  p.full_name as user_name,
  p.phone as user_phone,
  p.country as user_country
FROM public.job_campaigns jc
LEFT JOIN public.profiles p ON jc.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.job_campaigns_with_user TO authenticated;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will create the job_campaigns table with RLS
-- 3. Users can only see/edit their own campaigns
-- 4. Admins can see/edit all campaigns
-- =====================================================

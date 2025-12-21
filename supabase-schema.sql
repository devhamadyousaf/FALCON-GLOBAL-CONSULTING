-- =====================================================
-- FALCON GLOBAL CONSULTING - Database Schema
-- =====================================================
-- This file contains the complete database schema for the
-- Job Application Automation Platform
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
-- This table stores additional user profile information
-- It's automatically linked to Supabase Auth users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. ONBOARDING DATA TABLE
-- =====================================================
-- Stores user onboarding progress and data

CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  relocation_type TEXT CHECK (relocation_type IN ('europe', 'gcc')),

  -- Personal Details (Step 1)
  personal_details JSONB DEFAULT '{}'::jsonb,

  -- Visa Check (Step 2) - Europe only
  visa_check JSONB DEFAULT '{}'::jsonb,
  visa_eligibility_result TEXT,

  -- Payment (Step 3)
  payment_completed BOOLEAN DEFAULT FALSE,
  payment_details JSONB DEFAULT '{}'::jsonb,

  -- Onboarding Call (Step 4)
  call_scheduled BOOLEAN DEFAULT FALSE,
  call_details JSONB DEFAULT '{}'::jsonb,

  -- Documents (Step 5)
  documents_uploaded BOOLEAN DEFAULT FALSE,
  documents JSONB DEFAULT '{}'::jsonb,
  temp_document_metadata JSONB DEFAULT '{}'::jsonb,

  -- Progress Tracking
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one onboarding record per user
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS onboarding_user_id_idx ON public.onboarding_data(user_id);

-- Enable Row Level Security
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- Onboarding RLS Policies
-- Users can view their own onboarding data
CREATE POLICY "Users can view own onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own onboarding data
CREATE POLICY "Users can insert own onboarding data"
  ON public.onboarding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding data
CREATE POLICY "Users can update own onboarding data"
  ON public.onboarding_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all onboarding data
CREATE POLICY "Admins can view all onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 3. JOB LEADS TABLE (from n8n scraper)
-- =====================================================
-- This is your existing table structure

CREATE TABLE IF NOT EXISTS public."Job-Leads" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  companyLinkedinURL TEXT,
  companyWebsite TEXT,
  specialities TEXT,
  employeeCount INTEGER,
  "links.website" TEXT,
  companyURN TEXT,
  followerCount INTEGER,
  companyInformation TEXT,
  companyName TEXT,
  Status TEXT,
  jobTitle TEXT,
  jobURL TEXT,
  location TEXT,
  postedAt TIMESTAMPTZ,
  applicationCount INTEGER,
  description TEXT,
  externalEmails TEXT,
  emailDataRaw JSONB,
  phoneNumbersRaw JSONB,
  externalEmailDataRaw JSONB,
  emailEnrichment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS job_leads_company_name_idx ON public."Job-Leads"(companyName);
CREATE INDEX IF NOT EXISTS job_leads_job_title_idx ON public."Job-Leads"(jobTitle);
CREATE INDEX IF NOT EXISTS job_leads_location_idx ON public."Job-Leads"(location);
CREATE INDEX IF NOT EXISTS job_leads_posted_at_idx ON public."Job-Leads"(postedAt DESC);
CREATE INDEX IF NOT EXISTS job_leads_status_idx ON public."Job-Leads"(Status);

-- Enable Row Level Security
ALTER TABLE public."Job-Leads" ENABLE ROW LEVEL SECURITY;

-- Job Leads RLS Policies
-- All authenticated users can view job leads
CREATE POLICY "Authenticated users can view job leads"
  ON public."Job-Leads" FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert (from n8n)
-- This will be handled via service role key

-- =====================================================
-- 4. JOB APPLICATIONS TABLE
-- =====================================================
-- Links users to jobs they've applied to

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public."Job-Leads"(id) ON DELETE CASCADE NOT NULL,

  -- Application details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'response', 'rejected', 'accepted')),
  cv_url TEXT,
  cover_letter_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),

  -- Email tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  email_response_received BOOLEAN DEFAULT FALSE,
  email_response_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate applications
  UNIQUE(user_id, job_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON public.job_applications(status);

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Job Applications RLS Policies
-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 5. DOCUMENTS TABLE
-- =====================================================
-- Stores metadata for uploaded documents

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Document details
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'cv', 'certificate', 'experience', 'job_offer', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON public.documents(document_type);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents RLS Policies
-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update document verification
CREATE POLICY "Admins can verify documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 6. PAYMENTS TABLE
-- =====================================================
-- Stores payment records

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'other')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- External references
  transaction_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments(transaction_id);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments RLS Policies
-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================
-- In-app notifications for users

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Link
  link TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 9. STORAGE BUCKETS (Run these in Supabase Dashboard)
-- =====================================================
-- These need to be created in the Supabase Dashboard -> Storage

-- Create storage buckets:
-- 1. 'documents' - Private bucket for user documents
-- 2. 'avatars' - Public bucket for profile pictures
-- 3. 'cvs' - Private bucket for CV files
-- 4. 'cover-letters' - Private bucket for cover letters

-- Storage policies will be created in the dashboard

-- =====================================================
-- 10. INITIAL ADMIN USER (Optional)
-- =====================================================
-- After creating your admin account via Supabase Auth,
-- run this to set them as admin:

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@falconglobalconsulting.com';

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Configure Google OAuth in Supabase Dashboard
-- 3. Create storage buckets in Supabase Dashboard
-- 4. Update your application code to use Supabase
-- =====================================================

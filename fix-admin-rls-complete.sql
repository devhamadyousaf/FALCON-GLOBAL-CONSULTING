-- =====================================================
-- COMPLETE FIX FOR ADMIN RLS ACCESS
-- =====================================================
-- This script fixes the circular reference issue in RLS policies
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- STEP 2: Create a helper function to check admin status
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role directly, bypassing RLS
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Return true if user is admin
  RETURN (user_role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Recreate the admin policy using the function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Allow if user is admin OR if viewing their own profile
    public.is_admin() = true OR auth.uid() = id
  );

-- =====================================================
-- VERIFY THE FIX
-- =====================================================

-- Test if the function works
SELECT public.is_admin();
-- Should return 'true' when logged in as admin

-- Test if you can see all profiles
SELECT id, email, full_name, role FROM public.profiles;
-- Should return ALL users (both Taha Sheikh and DeVinci Codes)

-- =====================================================
-- APPLY SAME FIX TO OTHER TABLES
-- =====================================================

-- Fix onboarding_data table
DROP POLICY IF EXISTS "Admins can view all onboarding data" ON public.onboarding_data;

CREATE POLICY "Admins can view all onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (
    public.is_admin() = true OR auth.uid() = user_id
  );

-- Fix job_applications table
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;

CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (
    public.is_admin() = true OR auth.uid() = user_id
  );

-- Fix documents table
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;

CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  USING (
    public.is_admin() = true OR auth.uid() = user_id
  );

-- Fix payments table
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    public.is_admin() = true OR auth.uid() = user_id
  );

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================
-- Log in as admin (devincicodes.official@gmail.com)
-- Then run these queries:

-- Should return 2 users
SELECT COUNT(*) as total_users FROM public.profiles;

-- Should show both users
SELECT email, full_name, role FROM public.profiles ORDER BY created_at;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this script:
-- 1. Refresh your admin dashboard
-- 2. You should now see BOTH users:
--    - Taha Sheikh (customer)
--    - DeVinci Codes (admin)
-- =====================================================

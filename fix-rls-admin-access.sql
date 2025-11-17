-- =====================================================
-- FIX RLS POLICIES FOR ADMIN ACCESS
-- =====================================================
-- This script ensures admins can view all users
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop the existing admin policy if it exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate the admin policy with correct logic
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- Also ensure the user can still view their own profile
-- This policy should already exist, but let's verify
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- =====================================================
-- VERIFY THE FIX
-- =====================================================
-- Run this query while logged in as admin to test:
-- SELECT * FROM profiles;
-- You should see ALL users, not just yourself

-- =====================================================
-- ALTERNATIVE APPROACH (if above doesn't work)
-- =====================================================
-- If the subquery approach doesn't work, try this simpler approach:

-- Drop the policy
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a function to check if user is admin
-- CREATE OR REPLACE FUNCTION public.is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM public.profiles
--     WHERE id = auth.uid() AND role = 'admin'
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy using the function
-- CREATE POLICY "Admins can view all profiles"
--   ON public.profiles FOR SELECT
--   USING (public.is_admin());

-- =====================================================
-- IMPORTANT NOTE
-- =====================================================
-- Make sure your admin user actually has role = 'admin'
-- Run this to verify:
SELECT id, email, role FROM public.profiles WHERE email = 'devincicodes.official@gmail.com';

-- If role is not 'admin', update it:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'devincicodes.official@gmail.com';

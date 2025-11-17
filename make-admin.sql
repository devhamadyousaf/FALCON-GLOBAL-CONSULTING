-- =====================================================
-- MAKE USER ADMIN
-- =====================================================
-- This script updates a user's role to 'admin'
-- Run this in Supabase SQL Editor AFTER the user has signed up
-- =====================================================

-- Update the user role to admin
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'devincicodes.official@gmail.com';

-- Verify the update
SELECT id, email, role, onboarding_complete, created_at, updated_at
FROM public.profiles
WHERE email = 'devincicodes.official@gmail.com';

-- =====================================================
-- EXPECTED OUTPUT:
-- Should show the user with role = 'admin'
-- =====================================================

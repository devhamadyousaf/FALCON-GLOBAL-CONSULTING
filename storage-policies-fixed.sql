-- =====================================================
-- FIXED STORAGE POLICIES FOR FALCON GLOBAL CONSULTING
-- =====================================================
-- This version fixes the infinite recursion error
-- Run this SQL in Supabase SQL Editor
-- Go to: https://app.supabase.com/project/kojoegkrhrgvzqztkjwj
-- Click: SQL Editor > New Query > Paste this > Run
-- =====================================================

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own cvs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own cvs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cvs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cvs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all cvs" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all cover letters" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- =====================================================
-- 1. DOCUMENTS BUCKET POLICIES (Private)
-- =====================================================

-- Policy 1: Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Admins can view all documents (FIXED - uses auth metadata instead of profiles table)
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.jwt() ->> 'user_role')::text = 'admin'
);

-- =====================================================
-- 2. CVS BUCKET POLICIES (Private)
-- =====================================================

-- Policy 1: Users can upload their own CVs
CREATE POLICY "Users can upload own cvs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own CVs
CREATE POLICY "Users can view own cvs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own CVs
CREATE POLICY "Users can update own cvs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own CVs
CREATE POLICY "Users can delete own cvs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Admins can view all CVs (FIXED)
CREATE POLICY "Admins can view all cvs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (auth.jwt() ->> 'user_role')::text = 'admin'
);

-- =====================================================
-- 3. COVER LETTERS BUCKET POLICIES (Private)
-- =====================================================

-- Policy 1: Users can upload their own cover letters
CREATE POLICY "Users can upload own cover letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own cover letters
CREATE POLICY "Users can view own cover letters"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own cover letters
CREATE POLICY "Users can update own cover letters"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own cover letters
CREATE POLICY "Users can delete own cover letters"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Admins can view all cover letters (FIXED)
CREATE POLICY "Admins can view all cover letters"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cover-letters' AND
  (auth.jwt() ->> 'user_role')::text = 'admin'
);

-- =====================================================
-- 4. AVATARS BUCKET POLICIES (Public)
-- =====================================================
-- Note: Avatars bucket is PUBLIC, so anyone can view
-- But only owners can upload/update/delete

-- Policy 1: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Anyone can view avatars (bucket is public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 3: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify policies were created:

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- STORAGE POLICIES COMPLETE!
-- =====================================================
-- Changes from original:
-- - Admin policies now use auth.jwt() instead of profiles table
-- - This avoids infinite recursion errors
-- - Admin role must be set in user metadata (see below)
-- =====================================================

-- =====================================================
-- HOW TO SET ADMIN ROLE IN USER METADATA
-- =====================================================
-- To make a user an admin, run this:
/*
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"user_role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';
*/
-- =====================================================

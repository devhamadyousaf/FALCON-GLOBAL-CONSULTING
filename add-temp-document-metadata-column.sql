-- =====================================================
-- ADD TEMP_DOCUMENT_METADATA COLUMN
-- =====================================================
-- This migration adds the missing temp_document_metadata column
-- to the onboarding_data table

-- Add the missing column
ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS temp_document_metadata JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to fix the error:
-- "Could not find the 'temp_document_metadata' column"
-- =====================================================

-- ============================================
-- Gmail Accounts Table Setup
-- ============================================

-- Create gmail_accounts table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.gmail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  gmail_address TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_user_email ON public.gmail_accounts(user_email);

-- Enable RLS
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only see their own Gmail accounts
CREATE POLICY "Users can view own gmail accounts"
  ON public.gmail_accounts
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Create RLS policy - users can insert their own Gmail accounts
CREATE POLICY "Users can insert own gmail accounts"
  ON public.gmail_accounts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Create RLS policy - users can update their own Gmail accounts
CREATE POLICY "Users can update own gmail accounts"
  ON public.gmail_accounts
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_gmail_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS gmail_accounts_updated_at_trigger ON public.gmail_accounts;
CREATE TRIGGER gmail_accounts_updated_at_trigger
  BEFORE UPDATE ON public.gmail_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_gmail_accounts_updated_at();

-- ============================================
-- Verification Queries
-- ============================================

-- Check if gmail_accounts table exists and has correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'gmail_accounts'
ORDER BY ordinal_position;

-- Check RLS policies on gmail_accounts
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'gmail_accounts';

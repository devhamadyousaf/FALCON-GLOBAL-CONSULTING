-- Create simple referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  code TEXT NOT NULL UNIQUE,
  discount_percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes (code);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
CREATE POLICY "Admins can manage referral codes"
  ON referral_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow all users to read codes (for validation during payment)
CREATE POLICY "Anyone can read referral codes"
  ON referral_codes FOR SELECT
  TO public
  USING (true);

-- Add comments
COMMENT ON TABLE public.referral_codes IS 'Simple referral codes with discount percentages';
COMMENT ON COLUMN public.referral_codes.code IS '5-character alphanumeric referral code';
COMMENT ON COLUMN public.referral_codes.discount_percentage IS 'Discount percentage (e.g., 10 for 10% off)';

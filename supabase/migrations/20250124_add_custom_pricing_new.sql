-- Drop old custom_pricing table if exists (with old structure)
DROP TABLE IF EXISTS public.custom_pricing CASCADE;

-- Create custom_pricing table with NEW structure
-- One row per plan per user
CREATE TABLE IF NOT EXISTS public.custom_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  price_per_page NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT custom_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT custom_pricing_user_plan_unique UNIQUE (user_id, plan_name),
  CONSTRAINT custom_pricing_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT custom_pricing_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles (id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_pricing_user_id ON public.custom_pricing (user_id);
CREATE INDEX IF NOT EXISTS idx_custom_pricing_plan_name ON public.custom_pricing (plan_name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_pricing_updated_at
  BEFORE UPDATE ON custom_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_pricing_updated_at();

-- Enable RLS
ALTER TABLE public.custom_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin can view all custom pricing
CREATE POLICY "Admins can view all custom pricing"
  ON custom_pricing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert custom pricing
CREATE POLICY "Admins can insert custom pricing"
  ON custom_pricing FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update custom pricing
CREATE POLICY "Admins can update custom pricing"
  ON custom_pricing FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete custom pricing
CREATE POLICY "Admins can delete custom pricing"
  ON custom_pricing FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own custom pricing
CREATE POLICY "Users can view their own custom pricing"
  ON custom_pricing FOR SELECT
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE public.custom_pricing IS 'Stores custom pricing per user/lead per plan';
COMMENT ON COLUMN public.custom_pricing.user_id IS 'Reference to the user (lead) this pricing applies to';
COMMENT ON COLUMN public.custom_pricing.plan_name IS 'Plan name (silver, gold, diamond, diamond-plus)';
COMMENT ON COLUMN public.custom_pricing.price_per_page IS 'Custom price per page for this plan';
COMMENT ON COLUMN public.custom_pricing.currency IS 'Currency code (USD, EUR, GBP, CRC)';
COMMENT ON COLUMN public.custom_pricing.notes IS 'Optional notes about this custom pricing';
COMMENT ON COLUMN public.custom_pricing.created_by IS 'Admin who created this custom pricing';

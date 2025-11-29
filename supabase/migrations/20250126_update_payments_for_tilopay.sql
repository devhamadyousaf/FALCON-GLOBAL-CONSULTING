-- Update existing payments table to support Tilopay integration
-- This migration adds Tilopay-specific columns to your existing payments table

-- Add Tilopay-specific columns if they don't exist
DO $$
BEGIN
  -- Add tilopay_reference column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'tilopay_reference'
  ) THEN
    ALTER TABLE payments ADD COLUMN tilopay_reference TEXT;
  END IF;

  -- Add plan column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'plan'
  ) THEN
    ALTER TABLE payments ADD COLUMN plan TEXT;
  END IF;

  -- Add order_number column if it doesn't exist (different from order_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE payments ADD COLUMN order_number TEXT UNIQUE;
  END IF;
END $$;

-- Create index for tilopay_reference
CREATE INDEX IF NOT EXISTS idx_payments_tilopay_reference
  ON payments(tilopay_reference);

-- Create index for order_number
CREATE INDEX IF NOT EXISTS idx_payments_order_number
  ON payments(order_number);

-- Add comments to new columns
COMMENT ON COLUMN payments.tilopay_reference IS 'Tilopay-specific reference number from gateway';
COMMENT ON COLUMN payments.plan IS 'Subscription plan name (e.g., silver, gold, diamond)';
COMMENT ON COLUMN payments.order_number IS 'Unique order number generated for tracking (FGC-timestamp-userid)';

-- Ensure RLS is enabled (should already be from your existing setup)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Update the payment_method check constraint to include 'tilopay'
-- This might already be there, but we'll ensure it
DO $$
BEGIN
  -- Drop old constraint if it exists
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

  -- Add updated constraint
  ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check
    CHECK (payment_method = ANY(ARRAY['stripe'::text, 'paypal'::text, 'tilopay'::text, 'other'::text]));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add 'abandoned' status to the status check constraint if not present
DO $$
BEGIN
  -- Drop old constraint if it exists
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

  -- Add updated constraint with 'abandoned' status
  ALTER TABLE payments ADD CONSTRAINT payments_status_check
    CHECK (status = ANY(ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text, 'abandoned'::text]));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Note: Your existing RLS policies and triggers are preserved
-- The update_payments_updated_at trigger already exists and will continue to work

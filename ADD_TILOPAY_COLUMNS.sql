-- ============================================
-- Add Tilopay Columns to Existing Payments Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add order_number column (unique)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add tilopay_reference column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS tilopay_reference TEXT;

-- Add plan column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_number
  ON payments(order_number);

CREATE INDEX IF NOT EXISTS idx_payments_tilopay_reference
  ON payments(tilopay_reference);

CREATE INDEX IF NOT EXISTS idx_payments_plan
  ON payments(plan);

-- Update status constraint to include 'abandoned'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status = ANY(ARRAY[
    'pending'::text,
    'completed'::text,
    'failed'::text,
    'refunded'::text,
    'abandoned'::text
  ]));

-- Add comments
COMMENT ON COLUMN payments.order_number IS 'Unique order number generated for tracking (FGC-timestamp-userid)';
COMMENT ON COLUMN payments.tilopay_reference IS 'Tilopay-specific reference number from gateway';
COMMENT ON COLUMN payments.plan IS 'Subscription plan name (e.g., silver, gold, diamond)';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('order_number', 'tilopay_reference', 'plan')
ORDER BY column_name;

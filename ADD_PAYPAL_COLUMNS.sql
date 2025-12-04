-- Add PayPal-specific columns to payments table
-- Run this migration to support PayPal recurring payments

-- 1. Add PayPal reference column (for payment tokens and subscription IDs)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS paypal_reference TEXT;

-- 2. Add index on paypal_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_paypal_reference
ON public.payments(paypal_reference)
WHERE paypal_reference IS NOT NULL;

-- 3. Update payment_method enum to include PayPal (if using enum type)
-- Note: If payment_method is TEXT type, no change needed
-- If it's an ENUM, you might need to alter the type:
-- ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'paypal';

-- 4. Update existing order_number index to be more generic
-- (Already exists from Tilopay, but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_payments_order_number
ON public.payments(order_number)
WHERE order_number IS NOT NULL;

-- 5. Add comments for documentation
COMMENT ON COLUMN public.payments.paypal_reference IS 'PayPal payment token ID, subscription ID, or order ID';
COMMENT ON COLUMN public.payments.order_number IS 'FGC-generated order number (format: FGC-PP-timestamp-userId for PayPal, FGC-timestamp-userId for Tilopay)';

-- 6. Create a view for active recurring subscriptions
CREATE OR REPLACE VIEW public.active_paypal_subscriptions AS
SELECT
  p.id,
  p.user_id,
  p.amount,
  p.currency,
  p.plan,
  p.paypal_reference AS subscription_token,
  p.order_number,
  p.created_at,
  p.paid_at,
  p.metadata
FROM public.payments p
WHERE
  p.payment_method = 'paypal'
  AND p.status = 'completed'
  AND p.paypal_reference IS NOT NULL
ORDER BY p.created_at DESC;

-- 7. Add function to check if user has active PayPal subscription
CREATE OR REPLACE FUNCTION public.has_active_paypal_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.payments
    WHERE user_id = p_user_id
      AND payment_method = 'paypal'
      AND status = 'completed'
      AND paypal_reference IS NOT NULL
    LIMIT 1
  );
END;
$$;

-- 8. Add function to get user's latest PayPal payment
CREATE OR REPLACE FUNCTION public.get_latest_paypal_payment(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  amount DECIMAL(10,2),
  currency TEXT,
  plan TEXT,
  paypal_reference TEXT,
  order_number TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.amount,
    p.currency,
    p.plan,
    p.paypal_reference,
    p.order_number,
    p.status,
    p.paid_at,
    p.metadata
  FROM public.payments p
  WHERE p.user_id = p_user_id
    AND p.payment_method = 'paypal'
  ORDER BY p.created_at DESC
  LIMIT 1;
END;
$$;

-- 9. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_user_payment_method
ON public.payments(user_id, payment_method, status);

CREATE INDEX IF NOT EXISTS idx_payments_status_created
ON public.payments(status, created_at DESC);

-- 10. Add payment gateway preference to profiles table (optional)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_payment_gateway TEXT DEFAULT 'paypal' CHECK (preferred_payment_gateway IN ('paypal', 'tilopay', 'stripe'));

COMMENT ON COLUMN public.profiles.preferred_payment_gateway IS 'User preferred payment gateway: paypal (primary), tilopay (fallback), or stripe';

-- 11. Grant necessary permissions
GRANT SELECT ON public.active_paypal_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_paypal_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_paypal_payment(UUID) TO authenticated;

-- Verification queries (run these after migration to verify)
-- SELECT * FROM public.active_paypal_subscriptions LIMIT 10;
-- SELECT public.has_active_paypal_subscription('your-user-id-here');
-- SELECT * FROM public.get_latest_paypal_payment('your-user-id-here');

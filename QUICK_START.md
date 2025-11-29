# 🚀 Quick Start - Tilopay Payment Integration

## ⏱️ 5-Minute Setup

### Step 1: Add Database Columns (2 minutes)

**Go to Supabase:**
1. Visit: https://supabase.com/dashboard
2. Select project: **kojoegkrhrgvzqztkjwj**
3. Click: **SQL Editor** → **New Query**
4. Paste this SQL:

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tilopay_reference TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_order_number ON payments(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_tilopay_reference ON payments(tilopay_reference);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON payments(plan);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status = ANY(ARRAY[
    'pending'::text, 'completed'::text, 'failed'::text,
    'refunded'::text, 'abandoned'::text
  ]));
```

5. Click **Run** (or Ctrl+Enter)
6. ✅ You should see "Success. No rows returned"

---

### Step 2: Restart Server (30 seconds)

```bash
# Stop server with Ctrl+C
npm run dev
```

---

### Step 3: Test Payment (2 minutes)

**3.1 Navigate to onboarding:**
```
http://localhost:3000/onboarding-new?step=3
```

**3.2 Click "Select Plan" on any package**
- Choose Silver ($299), Gold ($699), or Diamond ($1,599)

**3.3 You'll be redirected to payment page:**
```
http://localhost:3000/payment?plan=silver
```

**3.4 Wait for form to load** (~1.5 seconds)
- You should see "Order Summary" and "Payment Details"

**3.5 Fill in test card:**
- **Payment Method:** Select "Credit Card" from dropdown
- **Card Number:** 4111 1111 1111 1111
- **Expiration:** 12/25
- **CVV:** 123

**3.6 Click "Pay $299"**

**3.7 Verify success:**
- You should be redirected to: `/onboarding-new?step=4&payment=success`

---

## ✅ That's It!

Your Tilopay integration is now working!

---

## 🔍 Verify in Database

Check your payment was recorded:

```sql
SELECT
  order_number,
  plan,
  amount,
  status,
  paid_at
FROM payments
ORDER BY created_at DESC
LIMIT 1;
```

Expected result:
```
order_number         | plan   | amount | status    | paid_at
---------------------+--------+--------+-----------+------------------
FGC-1706123456-abc   | silver | 299.00 | completed | 2025-01-26T...
```

---

## 🎯 User Flow

```
Onboarding Step 3 (Package Selection)
↓
Click "Select Plan" on Gold
↓
Payment Page Opens: /payment?plan=gold
↓
[Order Summary shows: Gold - $699]
[Payment form loads with Tilopay fields]
↓
Select Payment Method: Credit Card
↓
Enter Card: 4111 1111 1111 1111
Enter Expiry: 12/25
Enter CVV: 123
↓
Click "Pay $699"
↓
Tilopay processes payment (~2 seconds)
↓
Redirect to: /onboarding-new?step=4&payment=success
↓
Continue to Schedule Call step ✅
```

---

## 🆘 Quick Troubleshooting

### "order_number column not found"
→ Run Step 1 (SQL migration)

### Payment form not loading
→ Check browser console for errors
→ Verify `.env.local` has Tilopay credentials

### "Payment form not ready"
→ Wait 2 seconds and refresh page

---

## 📋 Environment Check

Verify `.env.local` contains:

```bash
TILOPAY_API_KEY=8176-1004-6878-8064-5787
TILOPAY_API_USER=zsQhfD
TILOPAY_API_PASSWORD=tTyKbC
```

---

## 📚 Full Documentation

For detailed guides, see:
- [TILOPAY_INTEGRATION_STATUS.md](TILOPAY_INTEGRATION_STATUS.md) - Complete status
- [PAYMENT_FIXES.md](PAYMENT_FIXES.md) - All fixes applied
- [RUN_THIS_FIRST.md](RUN_THIS_FIRST.md) - Detailed migration guide

---

**Time Required:** 5 minutes
**Difficulty:** Easy
**Status:** Ready to test!
